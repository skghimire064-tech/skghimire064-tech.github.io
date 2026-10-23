import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const usernamePattern = /^[a-zA-Z0-9._-]{3,32}$/;
const emailForUsername = (username: string) => `${username.toLowerCase()}@accounts.procurement-guide.example`;

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed.' });

  const authorization = request.headers.get('Authorization');
  if (!authorization) return jsonResponse(401, { error: 'Authentication required.' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    console.error('Required Supabase function secrets are not configured.');
    return jsonResponse(500, { error: 'User management service is not configured.' });
  }

  const callerClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !callerData.user) return jsonResponse(401, { error: 'Invalid session.' });

  const { data: callerProfile, error: profileError } = await serviceClient
    .from('user_profiles')
    .select('role')
    .eq('id', callerData.user.id)
    .single();
  if (profileError || callerProfile?.role !== 'admin') {
    return jsonResponse(403, { error: 'Admin access required.' });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid request body.' });
  }

  const action = body.action;

  if (action === 'list') {
    const { data, error } = await serviceClient
      .from('user_profiles')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: true });
    if (error) return jsonResponse(500, { error: 'Could not load users.' });
    return jsonResponse(200, { users: data });
  }

  if (action === 'create') {
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role;
    if (!usernamePattern.test(username)) {
      return jsonResponse(400, { error: 'Username must be 3-32 letters, numbers, dots, dashes or underscores.' });
    }
    if (password.length < 8) return jsonResponse(400, { error: 'Password must be at least 8 characters.' });
    if (role !== 'admin' && role !== 'user') return jsonResponse(400, { error: 'Invalid user role.' });

    const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
      email: emailForUsername(username),
      password,
      email_confirm: true,
      user_metadata: { username: username.toLowerCase() },
    });
    if (createError || !created.user) {
      return jsonResponse(400, { error: createError?.message ?? 'Could not create user.' });
    }

    const { data: profile, error: updateError } = await serviceClient
      .from('user_profiles')
      .update({ username: username.toLowerCase(), role })
      .eq('id', created.user.id)
      .select('id, username, role, created_at')
      .single();
    if (updateError || !profile) {
      await serviceClient.auth.admin.deleteUser(created.user.id);
      return jsonResponse(500, { error: 'Could not create user profile.' });
    }
    return jsonResponse(200, { user: profile });
  }

  if (action === 'update') {
    const id = typeof body.id === 'string' ? body.id : '';
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role;
    if (!id) return jsonResponse(400, { error: 'User id is required.' });
    if (!usernamePattern.test(username)) {
      return jsonResponse(400, { error: 'Username must be 3-32 letters, numbers, dots, dashes or underscores.' });
    }
    if (password && password.length < 8) return jsonResponse(400, { error: 'Password must be at least 8 characters.' });
    if (role !== 'admin' && role !== 'user') return jsonResponse(400, { error: 'Invalid user role.' });

    const { data: target, error: targetError } = await serviceClient
      .from('user_profiles')
      .select('role')
      .eq('id', id)
      .single();
    if (targetError || !target) return jsonResponse(404, { error: 'User not found.' });
    if (target.role === 'admin' && role !== 'admin') {
      const { count, error } = await serviceClient
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
      if (error) return jsonResponse(500, { error: 'Could not verify admin accounts.' });
      if ((count ?? 0) <= 1) return jsonResponse(400, { error: 'The last admin cannot be demoted.' });
    }

    const authUpdate: { email: string; email_confirm: boolean; user_metadata: { username: string }; password?: string } = {
      email: emailForUsername(username),
      email_confirm: true,
      user_metadata: { username: username.toLowerCase() },
    };
    if (password) authUpdate.password = password;
    const { error: authUpdateError } = await serviceClient.auth.admin.updateUserById(id, authUpdate);
    if (authUpdateError) return jsonResponse(400, { error: authUpdateError.message });

    const { data: profile, error: profileUpdateError } = await serviceClient
      .from('user_profiles')
      .update({ username: username.toLowerCase(), role })
      .eq('id', id)
      .select('id, username, role, created_at')
      .single();
    if (profileUpdateError || !profile) {
      return jsonResponse(500, { error: 'Authentication changed, but the user profile could not be updated.' });
    }
    return jsonResponse(200, { user: profile });
  }

  if (action === 'delete') {
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return jsonResponse(400, { error: 'User id is required.' });
    if (id === callerData.user.id) return jsonResponse(400, { error: 'You cannot delete your active account.' });

    const { data: target, error: targetError } = await serviceClient
      .from('user_profiles')
      .select('role')
      .eq('id', id)
      .single();
    if (targetError || !target) return jsonResponse(404, { error: 'User not found.' });
    if (target.role === 'admin') {
      const { count, error } = await serviceClient
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
      if (error) return jsonResponse(500, { error: 'Could not verify admin accounts.' });
      if ((count ?? 0) <= 1) return jsonResponse(400, { error: 'The last admin cannot be deleted.' });
    }

    const { error } = await serviceClient.auth.admin.deleteUser(id);
    if (error) return jsonResponse(400, { error: error.message });
    return jsonResponse(200, { success: true });
  }

  return jsonResponse(400, { error: 'Unknown user-management action.' });
});
