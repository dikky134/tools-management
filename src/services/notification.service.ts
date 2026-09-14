import { supabase } from '../lib/supabase';
import { mapNotification } from '../mappers';
import type { DatabaseNotificationRow } from '../types/database';

export async function getMyNotifications() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data as DatabaseNotificationRow[]).map(mapNotification);
}

export async function markNotificationAsRead(
  notificationId: string,
) {
  const { error } =
    await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('id', notificationId)
      .eq(
        'user_id',
        (
          await supabase.auth.getUser()
        ).data.user?.id ?? '',
      );

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsAsRead() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } =
    await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('user_id', user.id)
      .eq('is_read', false);

  if (error) {
    throw error;
  }
}