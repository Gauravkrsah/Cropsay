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

// This section was removed to eliminate duplicate function declarations
// The updated implementations of getSellerOrders, updateOrderStatus, and getOrderDetails
// are defined below and use the RPC method

// For sellers to get orders for their products
export async function getSellerOrders() {
  // First, get all products sold by the authenticated user
  const { data: sellerProducts, error: productsError } = await supabase
    .rpc('get_seller_products');
    
  if (productsError) {
    console.error('Error getting seller products:', productsError);
    return [];
  }
  
  if (!sellerProducts || sellerProducts.length === 0) {
    return []; // No products, so no orders
  }
  
  const productIds = sellerProducts.map(product => product.id);
  
  // Now find all orders that contain the seller's products
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('date', { ascending: false });
    
  if (ordersError) {
    console.error('Error getting orders:', ordersError);
    return [];
  }
  
  // Filter orders that contain the seller's products
  const sellerOrders = orders?.filter(order => {
    // Parse the items JSON if needed
    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    // Check if any item in the order contains the seller's products
    return orderItems.some((item: any) => productIds.includes(item.id));
  });
  
  return sellerOrders || [];
}

// For sellers to update order status (e.g., to mark as shipped)
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);
    
  if (error) {
    throw error;
  }
  
  return data;
}

// Add getOrderDetails function to get a single order
export async function getOrderDetails(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

// Function to update multiple orders' status at once
export async function batchUpdateOrderStatus(orderIds: string[], newStatus: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .in('id', orderIds);
    
  if (error) {
    throw error;
  }
  
  return data;
}

// Special function to mark COD orders as shipped and paid
export async function markCODOrdersAsShippedAndPaid(orderIds: string[]) {
  if (!orderIds.length) return [];
  
  // Update the orders to Shipped status and mark as Paid
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status: 'Shipped',
      payment_status: 'Paid' // Add payment status update
    })
    .in('id', orderIds)
    .eq('payment_method', 'COD')
    .eq('status', 'Pending');
    
  if (error) {
    throw error;
  }
  
  return data;
}
