import type { Product, ProductType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Fields the user fills in when defining a product (Change 2).
export interface CustomProductInput {
  name: string;
  type: ProductType;
  carbs: number;
  sodium: number;
  fluid: number;
  caffeine: number;
  mixedCarb: boolean;
  servingsPerContainer?: number;
}

function genId(): string {
  return `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Convert user input into a Product the engine treats like any brand product. */
export function inputToProduct(input: CustomProductInput, id = genId()): Product {
  const isDrinkOrChewOrGel = input.type === 'gel' || input.type === 'chew' || input.type === 'drink';
  return {
    id,
    name: input.name.trim() || 'Custom product',
    carbsG: input.carbs,
    sodiumMg: input.sodium,
    fluidMl: input.fluid,
    caffeineMg: input.caffeine,
    mixedCarb: input.mixedCarb,
    type: input.type,
    canUseOnSwim: false,
    canUseOnRun: isDrinkOrChewOrGel ? input.type !== 'drink' : false,
    caffeinated: input.caffeine > 0,
    servingsPerContainer: input.servingsPerContainer,
    isCustom: true,
  };
}

// ─── Supabase row mapping ───────────────────────────────────────────────────
interface CustomProductRow {
  id: string;
  name: string;
  type: ProductType;
  carbs: number;
  sodium: number;
  fluid: number;
  caffeine: number;
  mixed_carb: boolean;
  servings_per_container: number | null;
}

function rowToProduct(row: CustomProductRow): Product {
  return inputToProduct({
    name: row.name,
    type: row.type,
    carbs: Number(row.carbs),
    sodium: Number(row.sodium),
    fluid: Number(row.fluid),
    caffeine: Number(row.caffeine),
    mixedCarb: row.mixed_carb,
    servingsPerContainer: row.servings_per_container ?? undefined,
  }, row.id);
}

/** Load the signed-in user's custom product library. Returns [] if logged out / unconfigured. */
export async function loadCustomProducts(userId: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('custom_products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return (data as CustomProductRow[]).map(rowToProduct);
}

/** Persist a new custom product for the user; returns the stored Product (with server id). */
export async function saveCustomProduct(userId: string, input: CustomProductInput): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('custom_products')
    .insert({
      user_id: userId,
      name: input.name.trim(),
      type: input.type,
      carbs: input.carbs,
      sodium: input.sodium,
      fluid: input.fluid,
      caffeine: input.caffeine,
      mixed_carb: input.mixedCarb,
      servings_per_container: input.servingsPerContainer ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return rowToProduct(data as CustomProductRow);
}

/** Delete a custom product the user owns. */
export async function deleteCustomProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.from('custom_products').delete().eq('id', id);
}
