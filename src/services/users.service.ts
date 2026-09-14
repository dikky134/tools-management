import { supabase } from '../lib/supabase';
import { mapUser } from '../mappers';
import type { User } from '../types';
import type { DatabaseUserRow } from '../types/database';

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');

  if (error) {
    throw error;
  }

  return (data as DatabaseUserRow[]).map(
    mapUser,
  );
}

export async function createUser(
  user: Omit<
    User,
    'id' | 'createdAt'
  >,
): Promise<string> {
  const { data, error } =
    await supabase.functions.invoke(
      'admin-users',
      {
        body: {
          action: 'create',

          fullName: user.name,
          employeeId: user.employeeId,
          email: user.email,
          phone: user.phone,
          department:
            user.department,
          role: user.role,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.userId;
}

export async function updateMyProfile(
  fullName: string,
  phone: string,
): Promise<void> {
  const { error } = await supabase.rpc(
    'update_my_profile',
    {
      p_full_name: fullName,
      p_phone: phone,
    },
  );

  if (error) {
    throw error;
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<User>,
): Promise<void> {
  const { data, error } =
    await supabase.functions.invoke(
      'admin-users',
      {
        body: {
          action: 'update',

          userId,

          fullName: updates.name,
          employeeId:
            updates.employeeId,
          email: updates.email,
          phone: updates.phone,
          department:
            updates.department,
          role: updates.role,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }
}

export async function updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'INACTIVE',
): Promise<void> {
  const { data, error } =
    await supabase.functions.invoke(
      'admin-users',
      {
        body: {
          action: 'status',
          userId,
          status,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }
}