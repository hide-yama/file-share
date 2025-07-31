import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeletedProject {
  id: string;
  name: string;
  total_size: number;
  files_count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const now = new Date().toISOString();
    
    console.log(`Starting cleanup process at ${now}`);

    const { data: expiredProjects, error: fetchError } = await supabaseClient
      .from('projects')
      .select(`
        id,
        name,
        total_size,
        expires_at,
        files (
          id,
          storage_path
        )
      `)
      .lt('expires_at', now)
      .eq('is_deleted', false);

    if (fetchError) {
      console.error('Error fetching expired projects:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch expired projects',
          details: fetchError 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!expiredProjects || expiredProjects.length === 0) {
      console.log('No expired projects found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired projects found',
          deleted_projects: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Found ${expiredProjects.length} expired projects`);

    const deletedProjects: DeletedProject[] = [];
    let totalDeletedSize = 0;
    let totalDeletedFiles = 0;

    for (const project of expiredProjects) {
      try {
        console.log(`Processing project: ${project.name} (${project.id})`);

        let filesDeleted = 0;
        if (project.files && project.files.length > 0) {
          for (const file of project.files) {
            try {
              const { error: storageError } = await supabaseClient.storage
                .from('project-files')
                .remove([file.storage_path]);

              if (storageError) {
                console.error(`Error deleting file ${file.storage_path}:`, storageError);
              } else {
                filesDeleted++;
                console.log(`Deleted file: ${file.storage_path}`);
              }
            } catch (fileError) {
              console.error(`Exception deleting file ${file.storage_path}:`, fileError);
            }
          }
        }

        const { error: projectUpdateError } = await supabaseClient
          .from('projects')
          .update({ is_deleted: true })
          .eq('id', project.id);

        if (projectUpdateError) {
          console.error(`Error marking project as deleted ${project.id}:`, projectUpdateError);
          continue;
        }

        const deletedProject: DeletedProject = {
          id: project.id,
          name: project.name,
          total_size: project.total_size || 0,
          files_count: filesDeleted
        };

        deletedProjects.push(deletedProject);
        totalDeletedSize += project.total_size || 0;
        totalDeletedFiles += filesDeleted;

        console.log(`Successfully processed project: ${project.name}`);

      } catch (projectError) {
        console.error(`Exception processing project ${project.id}:`, projectError);
      }
    }

    const result = {
      success: true,
      message: `Cleanup completed successfully`,
      summary: {
        processed_projects: expiredProjects.length,
        deleted_projects: deletedProjects.length,
        total_deleted_files: totalDeletedFiles,
        total_deleted_size_bytes: totalDeletedSize,
        total_deleted_size_mb: Math.round(totalDeletedSize / (1024 * 1024) * 100) / 100
      },
      deleted_projects: deletedProjects,
      timestamp: now
    };

    console.log('Cleanup summary:', result.summary);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Cleanup function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during cleanup',
        message: error.message || 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});