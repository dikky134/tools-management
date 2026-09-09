import { supabase } from '../lib/supabase';
import { mapCategory } from '../mappers';
import type { DatabaseCategoryRow } from '../types/database';
import type { ToolCategory } from '../types';

export async function getCategories() {
  const { data, error } = await supabase
    .from('tool_categories')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  return (data as DatabaseCategoryRow[]).map(
    mapCategory,
  );
}

export async function createCategory(
  category: Omit<ToolCategory, 'id'>,
) {
  const { data, error } = await supabase
    .from('tool_categories')
    .insert({
      name: category.name,
      description: category.description || null,
      color: category.color || null,
    })
    .select('*')
    .single();

  if (error) throw error;

  return mapCategory(data as DatabaseCategoryRow);
}

export async function updateCategory(
  id: string,
  updates: Partial<ToolCategory>,
) {
  const payload: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    payload.name = updates.name;
  }

  if (updates.description !== undefined) {
    payload.description =
      updates.description || null;
  }

  if (updates.color !== undefined) {
    payload.color = updates.color || null;
  }

  const { data, error } = await supabase
    .from('tool_categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return mapCategory(data as DatabaseCategoryRow);
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('tool_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}