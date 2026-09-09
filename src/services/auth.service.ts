import { supabase } from '../lib/supabase';
import { mapUser } from '../mappers';
import type { DatabaseUserRow } from '../types/database';
import type { User } from '../types';

export async function getProfile(
  userId: string,
): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return mapUser(
    data as DatabaseUserRow,
  );
}

export async function signIn(
  email: string,
  password: string,
): Promise<User> {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error(
      'Authentication failed',
    );
  }

  return getProfile(data.user.id);
}

export async function getCurrentSessionUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.user) {
    return null;
  }

  return getProfile(session.user.id);
}

export async function signOut() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}