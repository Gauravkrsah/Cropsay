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

// For sellers to get orders for their products - using new order_details table
export async function getSellerOrders() {
  try {
    console.log('Skipping RPC and using direct fallback method to fetch orders');
    // Skip the RPC function and use the fallback directly
    return getSellerOrdersFallback();
    
    /*
    // This RPC function may be causing issues - temporarily skipping it
    const { data: orderDetails, error } = await supabase
      .rpc('get_seller_order_details');
    
    if (error) {
      console.error('Error getting seller order details:', error);
      // Fallback to old method if new table doesn't exist yet
      return getSellerOrdersFallback();
    }
    
    if (!orderDetails || orderDetails.length === 0) {
      return [];
    }
    
    console.log('Raw order details from RPC:', orderDetails);
    
    // Transform the data to match expected format
    const sellerOrders = orderDetails.map(order => {
      console.log('Order status from RPC:', order.order_id, order.order_status);
      
      return {
        id: order.order_id,
        date: order.order_date,
        total: order.order_total,
        status: order.order_status || 'pending', // Ensure we have a valid status
        payment_method: order.payment_method,
        items: order.order_items,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_address: order.customer_address,
        // Make sure phone and address match the expected properties in the frontend
        phone: order.customer_phone || order.order_phone,
        address: order.delivery_address,
        user_id: order.user_id
      };
    });
    
    console.log('Seller orders from order_details table:', sellerOrders);
    
    return sellerOrders;
    */
    
  } catch (error) {
    console.error('RPC function not available, using fallback:', error);
    return getSellerOrdersFallback();
  }
}

// Fallback function using the old method
async function getSellerOrdersFallback() {
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
  
  // Get all orders first
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('date', { ascending: false });
    
  if (ordersError) {
    console.error('Error getting orders:', ordersError);
    return [];
  }

  if (!orders || orders.length === 0) {
    return [];
  }
  
  // Filter orders that contain the seller's products
  const relevantOrders = orders.filter(order => {
    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    return orderItems.some((item: any) => productIds.includes(item.id));
  });

  if (relevantOrders.length === 0) {
    return [];
  }

  // Get profiles for all relevant users
  const userIds = relevantOrders.map(order => order.user_id).filter(Boolean);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, phone, address')
    .in('id', userIds);

  if (profilesError) {
    console.warn('Error getting profiles:', profilesError);
  }

  // Create profiles lookup map
  const profilesMap = new Map();
  if (profiles) {
    profiles.forEach((profile: any) => {
      profilesMap.set(profile.id, profile);
    });
  }

  // Get user emails using RPC function
  let emailMap = new Map();
  
  try {
    const { data: userEmails, error: emailsError } = await supabase
      .rpc('get_user_emails', { user_ids: userIds });

    if (emailsError) {
      console.warn('RPC function error:', emailsError);
    } else if (userEmails) {
      userEmails.forEach((user: any) => {
        emailMap.set(user.id, user.email);
      });
    }
  } catch (error) {
    console.warn('RPC function not available:', error);
  }
  
  // Transform the data with proper customer information
  const sellerOrders = relevantOrders.map(order => {
    const profile = profilesMap.get(order.user_id);
    const customerEmail = emailMap.get(order.user_id) || 'Email not available';
    
    console.log('Processing order (fallback):', {
      orderId: order.id,
      userId: order.user_id,
      orderAddress: order.address,
      orderPhone: order.phone,
      profileData: profile,
      customerEmail: customerEmail,
      status: order.status // Log the status to verify
    });
    
    return {
      ...order,
      customer_name: profile?.full_name || 'Anonymous Customer',
      customer_email: customerEmail,
      customer_address: profile?.address || 'No customer address',
      phone: profile?.phone || order.phone || 'No phone provided',
      address: order.address || 'No delivery address',
      // Ensure we're using the status from the database, not a hardcoded default
      status: order.status || 'pending'
    };
  });
  
  console.log('Final seller orders (fallback):', sellerOrders);
  
  return sellerOrders || [];
}

// For sellers to update order status (e.g., to mark as shipped)
export async function updateOrderStatus(orderId: string, newStatus: string) {
  console.log(`Updating order ${orderId} status to: ${newStatus}`);
  
  try {
    // First, verify the current status
    const beforeUpdate = await verifyOrderStatus(orderId);
    console.log(`Status before update: ${beforeUpdate.status}`);
    
    // Perform the update
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select();
      
    if (error) {
      console.error('Error updating order status in database:', error);
      throw error;
    }
    
    // Verify the status was updated correctly
    const afterUpdate = await verifyOrderStatus(orderId);
    console.log(`Status after update: ${afterUpdate.status}`);
    
    if (afterUpdate.status !== newStatus) {
      console.error(`Status mismatch! Expected: ${newStatus}, Got: ${afterUpdate.status}`);
    }
    
    console.log('Order status updated in database:', data);
    return data;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw error;
  }
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

// Function to verify the order status directly from the database
export async function verifyOrderStatus(orderId: string) {
  console.log(`Verifying order status for order ${orderId}`);
  const { data, error } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();
    
  if (error) {
    console.error('Error verifying order status:', error);
    throw error;
  }
  
  console.log(`Direct database check for order ${orderId}:`, data);
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

// Create a realtime subscription for orders
export function subscribeToOrders(callback: (payload: any) => void) {
  console.log('Setting up realtime subscription for orders table');
  const subscription = supabase
    .channel('orders_channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, 
      (payload) => {
        console.log('Realtime update received:', payload);
        callback(payload);
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(subscription);
  };
}

// Function to fetch all orders directly from the database
export async function fetchAllOrdersDirectly() {
  console.log('Fetching all orders directly from database');
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders directly:', error);
    throw error;
  }
  
  console.log('All orders directly from database:', data);
  return data;
}

// For sellers to get orders for their products - with pagination support
export async function getSellerOrdersPaginated(page = 1, pageSize = 10) {
  try {
    console.log(`Fetching seller orders with pagination: page ${page}, pageSize ${pageSize}`);
    
    // First, get all products sold by the authenticated user
    const { data: sellerProducts, error: productsError } = await supabase
      .rpc('get_seller_products');
      
    if (productsError) {
      console.error('Error getting seller products:', productsError);
      return { orders: [], total: 0 };
    }
    
    if (!sellerProducts || sellerProducts.length === 0) {
      return { orders: [], total: 0 }; // No products, so no orders
    }
    
    const productIds = sellerProducts.map(product => product.id);
    
    // Get the total count of orders for pagination
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error getting order count:', countError);
      return { orders: [], total: 0 };
    }
    
    // Calculate pagination limits
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Get orders with pagination
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false })
      .range(from, to);
      
    if (ordersError) {
      console.error('Error getting orders:', ordersError);
      return { orders: [], total: count || 0 };
    }

    if (!orders || orders.length === 0) {
      return { orders: [], total: count || 0 };
    }
    
    // Filter orders that contain the seller's products
    const relevantOrders = orders.filter(order => {
      const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      return orderItems.some((item: any) => productIds.includes(item.id));
    });

    // Get profiles for all relevant users
    const userIds = relevantOrders.map(order => order.user_id).filter(Boolean);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, address')
      .in('id', userIds);

    if (profilesError) {
      console.warn('Error getting profiles:', profilesError);
    }

    // Create profiles lookup map
    const profilesMap = new Map();
    if (profiles) {
      profiles.forEach((profile: any) => {
        profilesMap.set(profile.id, profile);
      });
    }

    // Get user emails using RPC function
    let emailMap = new Map();
    
    try {
      const { data: userEmails, error: emailsError } = await supabase
        .rpc('get_user_emails', { user_ids: userIds });

      if (emailsError) {
        console.warn('RPC function error:', emailsError);
      } else if (userEmails) {
        userEmails.forEach((user: any) => {
          emailMap.set(user.id, user.email);
        });
      }
    } catch (error) {
      console.warn('RPC function not available:', error);
    }
    
    // Transform the data with proper customer information
    const sellerOrders = relevantOrders.map(order => {
      const profile = profilesMap.get(order.user_id);
      const customerEmail = emailMap.get(order.user_id) || 'Email not available';
      
      return {
        ...order,
        customer_name: profile?.full_name || 'Anonymous Customer',
        customer_email: customerEmail,
        customer_address: profile?.address || 'No customer address',
        phone: profile?.phone || order.phone || 'No phone provided',
        address: order.address || 'No delivery address',
        status: order.status || 'pending'
      };
    });
    
    // Calculate relevant orders total count for accurate pagination
    const relevantOrdersCount = relevantOrders.length / orders.length * (count || 0);
    
    return {
      orders: sellerOrders,
      total: Math.ceil(relevantOrdersCount)
    };
  } catch (error) {
    console.error('Error in getSellerOrdersPaginated:', error);
    return { orders: [], total: 0 };
  }
}
