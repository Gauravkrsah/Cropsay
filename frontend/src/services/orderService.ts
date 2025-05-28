import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type OrderInsert = Database['public']['Tables']['orders']['Insert'];

function toJson(val: any) {
  // Helper to ensure value is JSON serializable
  return typeof val === 'string' ? val : JSON.parse(JSON.stringify(val));
}

export async function saveOrder(order: Omit<OrderInsert, 'items' | 'payment_payload'> & { items: any[]; payment_payload?: any }) {
  const insertOrder: OrderInsert = {
    ...order,
    items: toJson(order.items),
    payment_payload: order.payment_payload ? toJson(order.payment_payload) : undefined,
  };
  const { data, error } = await supabase.from('orders').insert([insertOrder]);
  if (error) throw error;
  return data;
}

export async function getOrdersByUser(user_id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function cancelOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'Cancelled' })
    .eq('id', orderId);
  if (error) throw error;
  return data;
}

export async function deleteOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
  if (error) throw error;
  return data;
}
