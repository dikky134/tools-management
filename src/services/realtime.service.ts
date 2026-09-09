import { supabase } from '../lib/supabase';

type RealtimeCallback = () => void;

export function subscribeToToolChanges(
  callback: RealtimeCallback,
) {
  const channel = supabase
    .channel('warehouse-tools-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tools',
      },
      () => {
        callback();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToBorrowingChanges(
  callback: RealtimeCallback,
) {
  const channel = supabase
    .channel('warehouse-borrowings-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'borrowings',
      },
      () => {
        callback();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToMaintenanceChanges(
  callback: RealtimeCallback,
) {
  const channel = supabase
    .channel('warehouse-maintenance-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'maintenance_requests',
      },
      () => {
        callback();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToProfileChanges(
  callback: () => void,
) {
  const channel = supabase
    .channel('warehouse-profile-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
      },
      () => {
        callback();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToNotificationChanges(
  userId: string,
  callback: RealtimeCallback,
) {
  const channel = supabase
    .channel(
      `warehouse-notifications-${userId}`,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        callback();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToDamageChanges(
  callback: RealtimeCallback,
) {
  const channel = supabase
    .channel('warehouse-damage-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'damage_reports',
      },
      () => {
        callback();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}