/* Supabase is introduced in passive mode first: no existing local data flow is
 * changed until the schema, authentication, and import have been verified. */
(function initialiseSupabase(){
  const url = 'https://lkgxmrwebtdsnglumebz.supabase.co';
  const publishableKey = 'sb_publishable_yI6Zp_zBK7KH-9dWRcw_XA_dRs6DZFs';
  const workspaceId = '31f0ed0e-2b60-451d-9be5-c8be22111e87';

  if(!window.supabase || typeof window.supabase.createClient !== 'function'){
    console.warn('Supabase client library did not load; local data mode remains active.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  window.SUPABASE_WORKSPACE_ID = workspaceId;
  window.DATA_MODE = 'local';
})();
