import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePassword } from '@/utils/password';
import { isFileAllowed, isFileSizeAllowed, isProjectSizeAllowed, sanitizeFilename, getClientIP } from '@/utils/security';

interface UploadResponse {
  success: boolean;
  data?: {
    projectId: string;
    password: string;
    shareUrl: string;
    expiresAt: string;
    files: {
      name: string;
      size: number;
      url: string;
    }[];
  };
  error?: string;
}

const MAX_FILES_PER_PROJECT = 100;

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
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
    const validatedFiles: { file: File; sanitizedName: string }[] = [];

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

      validatedFiles.push({ file, sanitizedName });
    }

    const password = generatePassword();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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

    const uploadedFiles: { name: string; size: number; url: string }[] = [];
    const dbFiles: { name: string; type: string; size: number; storage_path: string; project_id: string }[] = [];

    for (const { file, sanitizedName } of validatedFiles) {
      const fileBuffer = await file.arrayBuffer();
      const storagePath = `${project.id}/${sanitizedName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('project-files')
        .upload(storagePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        
        await supabaseAdmin
          .from('projects')
          .delete()
          .eq('id', project.id);

        return NextResponse.json({
          success: false,
          error: `ファイル「${file.name}」のアップロードに失敗しました`
        }, { status: 500 });
      }

      dbFiles.push({
        project_id: project.id,
        name: sanitizedName,
        size: file.size,
        type: file.type,
        storage_path: storagePath
      });

      uploadedFiles.push({
        name: sanitizedName,
        size: file.size,
        url: `/api/download/${project.id}/${encodeURIComponent(sanitizedName)}`
      });
    }

    const { error: filesError } = await supabaseAdmin
      .from('files')
      .insert(dbFiles);

    if (filesError) {
      console.error('Files DB error:', filesError);
      
      await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', project.id);

      return NextResponse.json({
        success: false,
        error: 'ファイル情報の保存に失敗しました'
      }, { status: 500 });
    }

    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    await supabaseAdmin
      .from('access_logs')
      .insert({
        project_id: project.id,
        ip_address: clientIP,
        user_agent: userAgent
      });

    const baseUrl = request.nextUrl.origin;
    const shareUrl = `${baseUrl}/share/${project.id}`;

    return NextResponse.json({
      success: true,
      data: {
        projectId: project.id,
        password,
        shareUrl,
        expiresAt: expiresAt.toISOString(),
        files: uploadedFiles
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}