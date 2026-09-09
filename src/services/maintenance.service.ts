import { supabase } from '../lib/supabase';
import { mapMaintenance } from '../mappers';
import type { DatabaseMaintenanceRow } from '../types/database';

export async function getMaintenanceRequests() {
  const { data, error } =
    await supabase
      .from('maintenance_requests')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (
    data as DatabaseMaintenanceRow[]
  ).map(mapMaintenance);
}

export async function getMyMaintenanceTasks() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } =
    await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('assigned_mechanic', user.id)
      .order('created_at', {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (
    data as DatabaseMaintenanceRow[]
  ).map(mapMaintenance);
}

export async function createMaintenanceRequest(
  toolId: string,
  description: string,
  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL',
) {
  const { data, error } =
    await supabase.rpc(
      'create_maintenance_request',
      {
        p_tool_id: toolId,
        p_description: description,
        p_priority: priority,
      },
    );

  if (error) {
    throw error;
  }

  return data as string;
}

export async function assignMechanic(
  maintenanceId: string,
  mechanicId: string,
) {
  const { error } =
    await supabase.rpc(
      'assign_mechanic',
      {
        p_maintenance_id:
          maintenanceId,
        p_mechanic_id: mechanicId,
      },
    );

  if (error) {
    throw error;
  }
}

export async function startMaintenance(
  maintenanceId: string,
) {
  const { error } =
    await supabase.rpc(
      'start_maintenance',
      {
        p_maintenance_id:
          maintenanceId,
      },
    );

  if (error) {
    throw error;
  }
}

export async function updateMaintenanceStatus(
  maintenanceId: string,
  status:
    | 'PENDING'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'WAITING_FOR_PARTS'
    | 'COMPLETED'
    | 'CANCELLED',
  notes?: string,
) {
  const { error } =
    await supabase.rpc(
      'update_maintenance_status',
      {
        p_maintenance_id:
          maintenanceId,
        p_status: status,
        p_notes: notes ?? null,
      },
    );

  if (error) {
    throw error;
  }
}

export async function completeMaintenance(
  maintenanceId: string,
  repairResult:
    | 'REPAIRED'
    | 'PARTIALLY_REPAIRED'
    | 'UNREPAIRABLE',
  repairNotes: string,
  repairCost = 0,
  partsReplaced?: string,
) {
  const { error } =
    await supabase.rpc(
      'complete_maintenance',
      {
        p_maintenance_id:
          maintenanceId,

        p_repair_result:
          repairResult,

        p_repair_notes:
          repairNotes,

        p_repair_cost:
          repairCost,

        p_parts_replaced:
          partsReplaced ?? null,
      },
    );

  if (error) {
    throw error;
  }
}