import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validatePassword } from '@/utils/password';

interface DownloadResponse {
  success: boolean;
  data?: {
    signedUrl: string;
    filename: string;
    size: number;
    type: string | null;
    expiresIn: number;
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DownloadResponse>> {
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
      .select('storage_path, name, size, type')
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
      .createSignedUrl(file.storage_path, expiresIn, {
        download: true
      });

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
        filename: file.name,
        size: file.size,
        type: file.type,
        expiresIn
      }
    });

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}