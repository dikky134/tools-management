import { supabase } from '../lib/supabase';
import { mapTool } from '../mappers';
import type { DatabaseToolRow } from '../types/database';
import type { Tool } from '../types';

export async function getTools() {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data as DatabaseToolRow[]).map(mapTool);
}

export async function getToolById(toolId: string) {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', toolId)
    .single();

  if (error) {
    throw error;
  }

  return mapTool(data as DatabaseToolRow);
}

export async function getToolByCode(code: string) {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    throw error;
  }

  return mapTool(data as DatabaseToolRow);
}

export async function createTool(
  tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>,
) {
  const { data, error } = await supabase
    .from('tools')
    .insert({
      code: tool.code,
      name: tool.name,
      category_id: tool.categoryId || null,
      brand: tool.brand || null,
      model: tool.model || null,
      serial_number: tool.serialNumber || null,
      description: tool.description || null,
      purchase_date: tool.purchaseDate || null,
      purchase_price: tool.purchasePrice,
      location: tool.location || null,
      condition: tool.condition,
      status: tool.status,
    })
    .select('*')
    .single();

  if (error) throw error;

  return mapTool(data as DatabaseToolRow);
}

export async function updateTool(
  id: string,
  updates: Partial<Tool>,
) {
  const payload: Record<string, unknown> = {};

  if (updates.code !== undefined) payload.code = updates.code;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.categoryId !== undefined) {
    payload.category_id = updates.categoryId || null;
  }
  if (updates.brand !== undefined) {
    payload.brand = updates.brand || null;
  }
  if (updates.model !== undefined) {
    payload.model = updates.model || null;
  }
  if (updates.serialNumber !== undefined) {
    payload.serial_number = updates.serialNumber || null;
  }
  if (updates.description !== undefined) {
    payload.description = updates.description || null;
  }
  if (updates.purchaseDate !== undefined) {
    payload.purchase_date = updates.purchaseDate || null;
  }
  if (updates.purchasePrice !== undefined) {
    payload.purchase_price = updates.purchasePrice;
  }
  if (updates.location !== undefined) {
    payload.location = updates.location || null;
  }
  if (updates.condition !== undefined) {
    payload.condition = updates.condition;
  }
  if (updates.status !== undefined) {
    payload.status = updates.status;
  }

  const { data, error } = await supabase
    .from('tools')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return mapTool(data as DatabaseToolRow);
}