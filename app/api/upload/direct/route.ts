import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePassword } from '@/utils/password';
import { isFileAllowed, isFileSizeAllowed, isProjectSizeAllowed, sanitizeFilename, getClientIP } from '@/utils/security';

interface DirectUploadRequest {
  files: {
    name: string;
    size: number;
    type: string;
  }[];
}

interface DirectUploadResponse {
  success: boolean;
  data?: {
    projectId: string;
    password: string;
    uploadConfigs: {
      fileName: string;
      storagePath: string;
    }[];
  };
  error?: string;
}

const MAX_FILES_PER_PROJECT = 100;

export async function POST(request: NextRequest): Promise<NextResponse<DirectUploadResponse>> {
  try {
    const body: DirectUploadRequest = await request.json();
    const { files } = body;

    // プロジェクト名を自動生成（日付ベース）
    const now = new Date();
    const projectName = `ファイル共有_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'ファイルが選択されていません'
      }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_PROJECT) {
      return NextResponse.json({
        success: false,
        error: `ファイル数は${MAX_FILES_PER_PROJECT}個以下にしてください`
      }, { status: 400 });
    }

    let totalSize = 0;
    const validatedFiles: { name: string; size: number; type: string; sanitizedName: string }[] = [];

    for (const file of files) {
      if (!isFileSizeAllowed(file.size)) {
        return NextResponse.json({
          success: false,
          error: `ファイル「${file.name}」のサイズが1GBを超えています`
        }, { status: 400 });
      }

      if (!isFileAllowed(file.name, file.type)) {
        return NextResponse.json({
          success: false,
          error: `ファイル「${file.name}」は安全上の理由でアップロードできません`
        }, { status: 400 });
      }

      totalSize += file.size;
      
      if (!isProjectSizeAllowed(0, totalSize)) {
        return NextResponse.json({
          success: false,
          error: 'プロジェクトの合計サイズが2GBを超えています'
        }, { status: 400 });
      }

      const sanitizedName = sanitizeFilename(file.name);
      if (sanitizedName.length === 0) {
        return NextResponse.json({
          success: false,
          error: `ファイル「${file.name}」の名前が無効です`
        }, { status: 400 });
      }

      validatedFiles.push({ ...file, sanitizedName });
    }

    const password = generatePassword();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // プロジェクトを作成
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        name: projectName,
        password,
        expires_at: expiresAt.toISOString(),
        total_size: totalSize
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error('Project creation error:', projectError);
      return NextResponse.json({
        success: false,
        error: 'プロジェクトの作成に失敗しました'
      }, { status: 500 });
    }

    // アップロード設定を生成
    const uploadConfigs = validatedFiles.map(file => ({
      fileName: file.sanitizedName,
      storagePath: `${project.id}/${file.sanitizedName}`
    }));

    // ファイル情報をデータベースに事前登録
    const dbFiles = validatedFiles.map(file => ({
      project_id: project.id,
      name: file.sanitizedName,
      size: file.size,
      type: file.type,
      storage_path: `${project.id}/${file.sanitizedName}`
    }));

    const { error: filesError } = await supabaseAdmin
      .from('files')
      .insert(dbFiles);

    if (filesError) {
      console.error('Files DB error:', filesError);
      
      // プロジェクトをロールバック
      await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', project.id);

      return NextResponse.json({
        success: false,
        error: 'ファイル情報の保存に失敗しました'
      }, { status: 500 });
    }

    // アクセスログを記録
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    await supabaseAdmin
      .from('access_logs')
      .insert({
        project_id: project.id,
        ip_address: clientIP,
        user_agent: userAgent
      });

    return NextResponse.json({
      success: true,
      data: {
        projectId: project.id,
        password,
        uploadConfigs
      }
    });

  } catch (error) {
    console.error('Direct upload API error:', error);
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}