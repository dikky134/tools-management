import { supabase } from '../lib/supabase';

export type MechanicSummary = {
  id: string;
  full_name: string;
  employee_id: string;
  department: string | null;
  mechanic_status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
};

export async function updateMyMechanicStatus(
  status: 'AVAILABLE' | 'OFF_DUTY',
) {
  const { error } = await supabase.rpc(
    'update_mechanic_status',
    {
      p_status: status,
    },
  );

  if (error) {
    throw error;
  }
}

export async function getActiveMechanics(): Promise<MechanicSummary[]> {
  const { data, error } = await supabase
    .from('mechanic_statuses')
    .select(`
      mechanic_id,
      full_name,
      employee_id,
      department,
      mechanic_status
    `)
    .order('full_name');

  if (error) {
    throw error;
  }

  return (data ?? []).map(row => ({
    id: row.mechanic_id,
    full_name: row.full_name,
    employee_id: row.employee_id,
    department: row.department,
    mechanic_status: row.mechanic_status,
  }));
}