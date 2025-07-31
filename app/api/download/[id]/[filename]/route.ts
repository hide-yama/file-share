import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validatePassword } from '@/utils/password';
import { getClientIP } from '@/utils/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const resolvedParams = await params;
  try {
    const projectId = resolvedParams.id;
    const filename = decodeURIComponent(resolvedParams.filename);
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    if (!projectId || !filename || !password) {
      return new NextResponse('必要なパラメータが不足しています', { status: 400 });
    }

    if (!validatePassword(password)) {
      return new NextResponse('パスワードが正しくありません', { status: 401 });
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('password, expires_at, is_deleted')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return new NextResponse('プロジェクトが見つかりません', { status: 404 });
    }

    if (project.is_deleted) {
      return new NextResponse('プロジェクトは削除されています', { status: 410 });
    }

    const now = new Date();
    const expiresAt = new Date(project.expires_at);

    if (now > expiresAt) {
      return new NextResponse('プロジェクトの有効期限が切れています', { status: 410 });
    }

    if (project.password !== password) {
      return new NextResponse('パスワードが正しくありません', { status: 401 });
    }

    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('storage_path, size, type')
      .eq('project_id', projectId)
      .eq('name', filename)
      .single();

    if (fileError || !file) {
      return new NextResponse('ファイルが見つかりません', { status: 404 });
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('project-files')
      .download(file.storage_path);

    if (downloadError || !fileData) {
      console.error('File download error:', downloadError);
      return new NextResponse('ファイルのダウンロードに失敗しました', { status: 500 });
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

    const headers = new Headers();
    headers.set('Content-Type', file.type || 'application/octet-stream');
    headers.set('Content-Length', file.size.toString());
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new NextResponse(fileData, {
      headers
    });

  } catch (error) {
    console.error('Download API error:', error);
    return new NextResponse('サーバーエラーが発生しました', { status: 500 });
  }
}