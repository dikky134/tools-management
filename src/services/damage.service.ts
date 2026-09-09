import { supabase } from '../lib/supabase';
import { mapDamageReport } from '../mappers';
import type { DatabaseDamageReportRow } from '../types/database';

export async function reportDamage(
  toolId: string,
  damageType: string,
  description: string,
  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL',
  photoUrl?: string,
) {
  const { data, error } =
    await supabase.rpc('report_damage', {
      p_tool_id: toolId,
      p_damage_type: damageType,
      p_description: description,
      p_priority: priority,
      p_photo_url: photoUrl ?? null,
    });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function getDamageReports() {
  const { data, error } =
    await supabase
      .from('damage_reports')
      .select('*')
      .order('reported_at', {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (
    data as DatabaseDamageReportRow[]
  ).map(mapDamageReport);
}