import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':
    'POST, OPTIONS',
};

type CreateUserBody = {
  action: 'create' | 'update' | 'status';

  userId?: string;

  fullName?: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: 'ADMIN' | 'EMPLOYEE' | 'MECHANIC';

  status?: 'ACTIVE' | 'INACTIVE';
};

const supabaseUrl = Deno.env.get(
  'SUPABASE_URL',
);

const supabaseAnonKey = Deno.env.get(
  'SUPABASE_ANON_KEY',
);

const supabaseServiceRoleKey = Deno.env.get(
  'SUPABASE_SERVICE_ROLE_KEY',
);

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  !supabaseServiceRoleKey
) {
  throw new Error(
    'Missing Supabase environment variables.',
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    /*
     * Client menggunakan Authorization
     * dari user yang sedang login.
     */
    const authHeader =
      req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: 'Missing authorization header.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    const supabaseUser = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    );

    /*
     * Client dengan service role.
     * Hanya digunakan di server/Edge Function.
     */
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    /*
     * Ambil user yang sedang login.
     */
    const {
      data: {
        user: currentUser,
      },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (
      userError ||
      !currentUser
    ) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    /*
     * Pastikan user adalah ADMIN aktif.
     */
    const {
      data: adminProfile,
      error: profileError,
    } = await supabaseAdmin
      .from('profiles')
      .select(
        'id, role, status',
      )
      .eq('id', currentUser.id)
      .single();

    if (
      profileError ||
      !adminProfile ||
      adminProfile.role !== 'ADMIN' ||
      adminProfile.status !== 'ACTIVE'
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Only active administrators can manage users.',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    const body =
      (await req.json()) as CreateUserBody;

    /*
     * ========================================
     * CREATE USER
     * ========================================
     */
    if (body.action === 'create') {
      if (
        !body.fullName ||
        !body.employeeId ||
        !body.email ||
        !body.role
      ) {
        return new Response(
          JSON.stringify({
            error:
              'Full name, employee ID, email, and role are required.',
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      /*
       * Undang user melalui Supabase Auth.
       */
      const {
        data,
        error,
      } =
        await supabaseAdmin.auth.admin
          .inviteUserByEmail(
            body.email,
            {
              data: {
                full_name:
                  body.fullName,

                employee_id:
                  body.employeeId,

                role: body.role,
              },
            },
          );

      if (error) {
        return new Response(
          JSON.stringify({
            error: error.message,
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      if (!data.user) {
        throw new Error(
          'User creation failed.',
        );
      }

      /*
       * Trigger auth.users → profiles
       * seharusnya sudah membuat row profile.
       */
      const {
        error: updateError,
      } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name:
            body.fullName,

          employee_id:
            body.employeeId,

          email: body.email,

          phone:
            body.phone || null,

          department:
            body.department || null,

          role: body.role,

          status: 'ACTIVE',

          mechanic_status:
            body.role === 'MECHANIC'
              ? 'AVAILABLE'
              : null,
        })
        .eq('id', data.user.id);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          userId: data.user.id,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    /*
     * ========================================
     * UPDATE USER
     * ========================================
     */
    if (body.action === 'update') {
      if (
        !body.userId ||
        !body.fullName ||
        !body.employeeId ||
        !body.email ||
        !body.role
      ) {
        return new Response(
          JSON.stringify({
            error:
              'User ID, full name, employee ID, email, and role are required.',
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      const {
        data: authUser,
        error: authError,
      } =
        await supabaseAdmin.auth.admin
          .updateUserById(
            body.userId,
            {
              email: body.email,

              user_metadata: {
                full_name:
                  body.fullName,

                employee_id:
                  body.employeeId,

                role: body.role,
              },
            },
          );

      if (authError) {
        return new Response(
          JSON.stringify({
            error: authError.message,
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      if (!authUser.user) {
        throw new Error(
          'Failed to update Auth user.',
        );
      }

      const {
        error: profileUpdateError,
      } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name:
            body.fullName,

          employee_id:
            body.employeeId,

          email: body.email,

          phone:
            body.phone || null,

          department:
            body.department || null,

          role: body.role,

          mechanic_status:
            body.role === 'MECHANIC'
              ? 'AVAILABLE'
              : null,
        })
        .eq('id', body.userId);

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    /*
     * ========================================
     * UPDATE STATUS
     * ========================================
     */
    if (body.action === 'status') {
      if (
        !body.userId ||
        !body.status
      ) {
        return new Response(
          JSON.stringify({
            error:
              'User ID and status are required.',
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      const {
        error,
      } = await supabaseAdmin
        .from('profiles')
        .update({
          status: body.status,
        })
        .eq('id', body.userId);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Invalid action.',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  }
});