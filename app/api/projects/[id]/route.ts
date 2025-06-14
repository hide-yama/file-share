import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validatePassword } from '@/utils/password';
import { getClientIP } from '@/utils/security';

interface ProjectResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    createdAt: string;
    expiresAt: string;
    totalSize: number;
    files: {
      id: string;
      name: string;
      size: number;
      type: string | null;
      createdAt: string;
      downloadUrl: string;
    }[];
  };
  error?: string;
}

interface SignedUrlResponse {
  success: boolean;
  data?: {
    signedUrl: string;
    expiresIn: number;
  };
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ProjectResponse>> {
  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'プロジェクトIDが必要です'
      }, { status: 400 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password || !validatePassword(password)) {
      return NextResponse.json({
        success: false,
        error: 'パスワードが正しくありません'
      }, { status: 401 });
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('is_deleted', false)
      .single();

    if (projectError || !project) {
      return NextResponse.json({
        success: false,
        error: 'プロジェクトが見つかりません'
      }, { status: 404 });
    }

    const now = new Date();
    const expiresAt = new Date(project.expires_at);

    if (now > expiresAt) {
      return NextResponse.json({
        success: false,
        error: 'プロジェクトの有効期限が切れています'
      }, { status: 410 });
    }

    if (project.password !== password) {
      return NextResponse.json({
        success: false,
        error: 'パスワードが正しくありません'
      }, { status: 401 });
    }

    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (filesError) {
      console.error('Files fetch error:', filesError);
      return NextResponse.json({
        success: false,
        error: 'ファイル情報の取得に失敗しました'
      }, { status: 500 });
    }

    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    await supabaseAdmin
      .from('access_logs')
      .insert({
        project_id: projectId,
        ip_address: clientIP,
        user_agent: userAgent
      });

    const baseUrl = request.nextUrl.origin;
    const filesWithUrls = files.map(file => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      createdAt: file.created_at,
      downloadUrl: `${baseUrl}/api/download/${projectId}/${encodeURIComponent(file.name)}`
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        createdAt: project.created_at,
        expiresAt: project.expires_at,
        totalSize: project.total_size,
        files: filesWithUrls
      }
    });

  } catch (error) {
    console.error('Project auth API error:', error);
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SignedUrlResponse>> {
  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    const password = searchParams.get('password');

    if (!projectId || !filename || !password) {
      return NextResponse.json({
        success: false,
        error: '必要なパラメータが不足しています'
      }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({
        success: false,
        error: 'パスワードが正しくありません'
      }, { status: 401 });
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('password, expires_at, is_deleted')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({
        success: false,
        error: 'プロジェクトが見つかりません'
      }, { status: 404 });
    }

    if (project.is_deleted) {
      return NextResponse.json({
        success: false,
        error: 'プロジェクトは削除されています'
      }, { status: 410 });
    }

    const now = new Date();
    const expiresAt = new Date(project.expires_at);

    if (now > expiresAt) {
      return NextResponse.json({
        success: false,
        error: 'プロジェクトの有効期限が切れています'
      }, { status: 410 });
    }

    if (project.password !== password) {
      return NextResponse.json({
        success: false,
        error: 'パスワードが正しくありません'
      }, { status: 401 });
    }

    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('storage_path')
      .eq('project_id', projectId)
      .eq('name', filename)
      .single();

    if (fileError || !file) {
      return NextResponse.json({
        success: false,
        error: 'ファイルが見つかりません'
      }, { status: 404 });
    }

    const expiresIn = 3600; // 1時間
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('project-files')
      .createSignedUrl(file.storage_path, expiresIn);

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL error:', signedUrlError);
      return NextResponse.json({
        success: false,
        error: 'ダウンロードURLの生成に失敗しました'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        signedUrl: signedUrlData.signedUrl,
        expiresIn
      }
    });

  } catch (error) {
    console.error('Signed URL API error:', error);
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}