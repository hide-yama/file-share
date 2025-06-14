import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface CleanupResponse {
  success: boolean;
  data?: {
    deletedProjects: number;
    deletedFiles: number;
    totalSizeDeleted: number;
    projects: {
      id: string;
      name: string;
      expiredAt: string;
      filesCount: number;
    }[];
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CleanupResponse>> {
  try {
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const now = new Date().toISOString();

    const { data: expiredProjects, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        name,
        expires_at,
        total_size,
        files (
          id,
          storage_path
        )
      `)
      .lt('expires_at', now)
      .eq('is_deleted', false);

    if (fetchError) {
      console.error('Error fetching expired projects:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch expired projects'
      }, { status: 500 });
    }

    if (!expiredProjects || expiredProjects.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          deletedProjects: 0,
          deletedFiles: 0,
          totalSizeDeleted: 0,
          projects: []
        }
      });
    }

    const processedProjects = [];
    let totalDeletedFiles = 0;
    let totalSizeDeleted = 0;

    for (const project of expiredProjects) {
      let filesCount = 0;

      if (project.files && project.files.length > 0) {
        for (const file of project.files) {
          try {
            const { error: storageError } = await supabaseAdmin.storage
              .from('project-files')
              .remove([file.storage_path]);

            if (!storageError) {
              filesCount++;
              totalDeletedFiles++;
            }
          } catch (error) {
            console.error(`Error deleting file ${file.storage_path}:`, error);
          }
        }
      }

      const { error: projectUpdateError } = await supabaseAdmin
        .from('projects')
        .update({ is_deleted: true })
        .eq('id', project.id);

      if (!projectUpdateError) {
        processedProjects.push({
          id: project.id,
          name: project.name,
          expiredAt: project.expires_at,
          filesCount
        });

        totalSizeDeleted += project.total_size || 0;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        deletedProjects: processedProjects.length,
        deletedFiles: totalDeletedFiles,
        totalSizeDeleted,
        projects: processedProjects
      }
    });

  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<CleanupResponse>> {
  try {
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const now = new Date().toISOString();

    const { data: expiredProjects, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        name,
        expires_at,
        total_size,
        files (
          id
        )
      `)
      .lt('expires_at', now)
      .eq('is_deleted', false);

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch expired projects'
      }, { status: 500 });
    }

    const projects = (expiredProjects || []).map(project => ({
      id: project.id,
      name: project.name,
      expiredAt: project.expires_at,
      filesCount: project.files?.length || 0
    }));

    const totalSizeToDelete = (expiredProjects || []).reduce(
      (sum, project) => sum + (project.total_size || 0),
      0
    );

    const totalFilesToDelete = (expiredProjects || []).reduce(
      (sum, project) => sum + (project.files?.length || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        deletedProjects: projects.length,
        deletedFiles: totalFilesToDelete,
        totalSizeDeleted: totalSizeToDelete,
        projects
      }
    });

  } catch (error) {
    console.error('Cleanup preview API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}