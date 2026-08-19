const { supabase } = require('../config/db');

const mapId = doc => {
  if (!doc) return doc;
  return { ...doc, _id: doc.id };
};
const mapIds = docs => {
  if (!docs) return [];
  return docs.map(mapId);
};

// POST create order
exports.createOrder = async (req, res) => {
  try {
    const order_id = 'NA-' + Math.floor(10000 + Math.random() * 90000);
    const tracking_number = 'SR-' + Math.floor(100000000 + Math.random() * 900000000);

    const orderData = {
      ...req.body,
      order_id,
      tracking_number,
      order_status: 'Ordered',
      payment_status: req.body.payment_method === 'cod' ? 'pending' : 'paid',
      timeline: [
        {
          status: 'Ordered',
          timestamp: new Date().toISOString(),
          note: req.body.payment_method === 'cod' ? 'Order confirmed (Cash on Delivery)' : 'Order confirmed & payment verified'
        }
      ]
    };

    const { data: order, error } = await supabase.from('orders').insert([orderData]).select().single();
    if (error) throw error;

    return res.status(201).json({ success: true, data: mapId(order) });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET track order by order_id or email
exports.trackOrder = async (req, res) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId && !email) {
      return res.status(400).json({ success: false, message: 'Please provide Order ID or Email' });
    }

    let query = supabase.from('orders').select('*');
    if (orderId) {
      query = query.ilike('order_id', orderId.trim());
    }
    if (email) {
      query = query.eq('customer->>email', email.toLowerCase().trim());
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false }).limit(1);
    
    if (error || !orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No matching order found. Please check your Order ID or Email.' });
    }

    return res.json({ success: true, data: mapId(orders[0]) });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, count: orders.length, data: mapIds(orders) });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const { data: order, error: fetchError } = await supabase.from('orders').select('*').eq('id', id).single();
    if (fetchError || !order) return res.status(404).json({ success: false, message: 'Order not found' });

    const newTimeline = [...(order.timeline || []), {
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${status}`
    }];

    const { data: updatedOrder, error } = await supabase.from('orders').update({
      order_status: status,
      timeline: newTimeline
    }).eq('id', id).select().single();

    if (error) throw error;
    
    return res.json({ success: true, data: mapId(updatedOrder) });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
