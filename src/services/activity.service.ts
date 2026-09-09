import { supabase } from '../lib/supabase';
import { mapActivityLog } from '../mappers';
import type { DatabaseActivityLogRow } from '../types/database';

export async function getActivityLogs() {
  const { data, error } =
    await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (
    data as DatabaseActivityLogRow[]
  ).map(mapActivityLog);
}