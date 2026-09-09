import { supabase } from '../lib/supabase';
import { mapBorrowing } from '../mappers';
import type { DatabaseBorrowingRow } from '../types/database';

export async function borrowTool(
  toolId: string,
  purpose: string,
  durationMinutes: number,
) {
  const { data, error } =
    await supabase.rpc('borrow_tool', {
      p_tool_id: toolId,
      p_purpose: purpose,
      p_duration_minutes: durationMinutes,
    });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function returnTool(
  borrowingId: string,
  returnCondition:
    | 'GOOD'
    | 'MINOR_DAMAGE'
    | 'DAMAGED',
  returnNotes?: string,
) {
  const { error } = await supabase.rpc(
    'return_tool',
    {
      p_borrowing_id: borrowingId,
      p_return_condition: returnCondition,
      p_return_notes: returnNotes ?? null,
    },
  );

  if (error) {
    throw error;
  }
}

export async function getMyBorrowings() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('borrowings')
    .select('*')
    .eq('borrower_id', user.id)
    .order('borrowed_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data as DatabaseBorrowingRow[]).map(
    mapBorrowing,
  );
}

export async function getAllBorrowings() {
  const { data, error } = await supabase
    .from('borrowings')
    .select('*')
    .order('borrowed_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data as DatabaseBorrowingRow[]).map(
    mapBorrowing,
  );
}