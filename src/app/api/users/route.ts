import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to initialize Supabase Admin Client
function getSupabaseAdminClient() {
  const projectId = process.env.VITE_SUPABASE_PROJECT_ID || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || 'savzqksbvknxrcxctfto';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${projectId}.supabase.co`;
  
  // Note: Service Role Key is required for admin actions (creating/deleting users in auth.users)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing on the server.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// POST: Create a new user (Auth + Profile)
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const body = await request.json();
    const { name, email, role, username, employeeId, department, password } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required.' }, { status: 400 });
    }

    // 1. Create user in Supabase Auth (auth.users)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'password',
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 500 });
    }

    const authUser = authData.user;
    if (!authUser) {
      return NextResponse.json({ error: 'Failed to create auth user.' }, { status: 500 });
    }

    // 2. Create profile in sheba_users
    const newProfile = {
      id: authUser.id, // Link to Supabase Auth UID
      name,
      email,
      role,
      username: username || email.split('@')[0],
      employeeId: employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      department: department || 'General',
      avatarUrl: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150`,
      isActive: true
    };

    const { error: profileError } = await supabaseAdmin
      .from('sheba_users')
      .insert(newProfile);

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Clean up the created auth user to avoid orphan auth accounts
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      return NextResponse.json({ error: `Database Error: ${profileError.message}` }, { status: 500 });
    }

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error: any) {
    console.error('API Error in POST /api/users:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update an existing user (Auth + Profile)
export async function PUT(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const body = await request.json();
    const { id, name, email, role, username, employeeId, department, password, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // 1. Update Auth record if email or password are changing
    const authUpdates: any = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
      if (authError) {
        console.error('Error updating auth user:', authError);
        return NextResponse.json({ error: `Auth Update Error: ${authError.message}` }, { status: 500 });
      }
    }

    // 2. Update Profile in sheba_users
    const profileUpdates: any = {};
    if (name !== undefined) profileUpdates.name = name;
    if (email !== undefined) profileUpdates.email = email;
    if (role !== undefined) profileUpdates.role = role;
    if (username !== undefined) profileUpdates.username = username;
    if (employeeId !== undefined) profileUpdates.employeeId = employeeId;
    if (department !== undefined) profileUpdates.department = department;
    if (isActive !== undefined) profileUpdates.isActive = isActive;

    const { error: profileError } = await supabaseAdmin
      .from('sheba_users')
      .update(profileUpdates)
      .eq('id', id);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return NextResponse.json({ error: `Database Update Error: ${profileError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error in PUT /api/users:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a user (Auth + Profile)
export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // 1. Delete user from sheba_users (profile) first due to integrity constraints
    const { error: profileError } = await supabaseAdmin
      .from('sheba_users')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      return NextResponse.json({ error: `Database Delete Error: ${profileError.message}` }, { status: 500 });
    }

    // 2. Delete user from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error('Error deleting auth user:', authError);
      return NextResponse.json({ error: `Auth Delete Error: ${authError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error in DELETE /api/users:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
