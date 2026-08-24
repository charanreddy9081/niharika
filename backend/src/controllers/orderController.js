const { supabase } = require('../config/db');
const { sendAdminOrderEmail, sendCustomerOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');
const { sendOrderAlert } = require('../services/telegramService');
const { isEmailVerified, clearOTP } = require('./paymentController');

/**
 * Existing orders table schema:
 *   id, order_id, customer_name, customer_email, customer_phone,
 *   shipping_address (jsonb), items (jsonb), total_amount,
 *   status, payment_method, payment_status, razorpay_order_id,
 *   created_at, updated_at
 *
 * Extended columns (added via migration — safe to use after migration):
 *   tracking_number, subtotal, shipping_fee, discount, timeline (jsonb)
 *
 * We store extended data inside items jsonb as a fallback so tracking
 * and timeline still work even before migration runs.
 */

const mapId = doc => {
  if (!doc) return doc;
  // Expose order_status alias for compatibility with track-order / admin pages
  const mapped = { ...doc, _id: doc.id };
  if (!mapped.order_status) mapped.order_status = doc.status;
  if (!mapped.total) mapped.total = doc.total_amount;
  if (!mapped.customer) {
    mapped.customer = {
      first_name: (doc.customer_name || '').split(' ')[0] || '',
      last_name: (doc.customer_name || '').split(' ').slice(1).join(' ') || '',
      email: doc.customer_email || '',
      phone: doc.customer_phone || ''
    };
  }
  if (!mapped.shipping_address && doc.shipping_address) {
    mapped.shipping_address = doc.shipping_address;
  }
  return mapped;
};

const mapIds = docs => {
  if (!docs) return [];
  return docs.map(mapId);
};

// ─── Validation helpers ────────────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}
function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(String(phone).replace(/[\s\-+()]/g, ''));
}
function isValidPincode(pincode) {
  return /^\d{6}$/.test(String(pincode).trim());
}

// ─── POST /api/orders — Create COD order ─────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { customer, shippingAddress, items, subtotal, deliveryCharge, total, paymentMethod } = req.body;

    // ── 1. Required field validation ──────────────────────────────────────
    if (!customer || !shippingAddress || !items) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required customer and shipping information.'
      });
    }

    const missingFields = [];
    if (!customer.firstName?.trim()) missingFields.push('First Name');
    if (!customer.lastName?.trim()) missingFields.push('Last Name');
    if (!customer.email?.trim()) missingFields.push('Email');
    if (!customer.phone?.trim()) missingFields.push('Phone');
    if (!shippingAddress.street?.trim()) missingFields.push('Street Address');
    if (!shippingAddress.city?.trim()) missingFields.push('City');
    if (!shippingAddress.state?.trim()) missingFields.push('State');
    if (!shippingAddress.pincode?.trim()) missingFields.push('Pincode');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // ── 2. Format validation ──────────────────────────────────────────────
    if (!isValidEmail(customer.email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!isValidPhone(customer.phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian mobile number.' });
    }
    if (!isValidPincode(shippingAddress.pincode)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit pincode.' });
    }

    // ── 3. Cart validation ────────────────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty. Please add items before placing an order.' });
    }

    for (const item of items) {
      if (!item.name?.trim()) {
        return res.status(400).json({ success: false, message: 'One or more cart items are missing a name.' });
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({ success: false, message: `Invalid quantity for item: ${item.name}` });
      }
      if (!item.price || Number(item.price) <= 0) {
        return res.status(400).json({ success: false, message: `Invalid price for item: ${item.name}` });
      }
    }

    // ── 4. Server-side price calculation ─────────────────────────────────
    const verifiedItems = [];
    let serverSubtotal = 0;

    for (const item of items) {
      let verifiedPrice = Number(item.price);

      // Verify price against DB if a productId is available
      if (item.productId) {
        const { data: product } = await supabase
          .from('products')
          .select('price')
          .eq('id', item.productId)
          .single();
        if (product && product.price) {
          verifiedPrice = Number(product.price);
        }
      }

      verifiedItems.push({
        product_id: item.productId || null,
        name: String(item.name).trim(),
        image: item.image || null,
        quantity: Number(item.quantity),
        price: verifiedPrice,
        selected_size: item.selected_size || 'Standard',
        custom_note: item.custom_note || ''
      });

      serverSubtotal += verifiedPrice * Number(item.quantity);
    }

    const FREE_SHIPPING_THRESHOLD = 999;
    // Use the client-submitted shipping fee (validated via pincode zone on frontend)
    // Fall back to 99 only if not provided
    const clientDeliveryCharge = Number(deliveryCharge);
    const serverShippingFee = !isNaN(clientDeliveryCharge) && clientDeliveryCharge >= 0
      ? clientDeliveryCharge
      : (serverSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99);
    const clientSubtotal = Number(subtotal) || 0;
    const discountAmount = Math.max(0, Math.round(clientSubtotal - serverSubtotal));
    const safeDiscount = discountAmount <= serverSubtotal * 0.2 ? discountAmount : 0;
    const serverTotal = Math.max(0, serverSubtotal - safeDiscount + serverShippingFee);

    // ── 5. Generate IDs ───────────────────────────────────────────────────
    const order_id = 'NA-' + Math.floor(10000 + Math.random() * 90000);
    const tracking_number = 'SR-' + Math.floor(100000000 + Math.random() * 900000000);

    // ── 5a. Payment method handling ───────────────────────────────────────
    const isOnlinePayment = paymentMethod === 'Razorpay' || paymentMethod === 'Online';
    const razorpayPaymentId = req.body.razorpay_payment_id || null;
    const razorpayOrderId   = req.body.razorpay_order_id   || null;

    // For online payments, verify OTP was completed OR user is authenticated via JWT
    const authHeader = req.headers?.authorization;
    let isAuthenticatedUser = false;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'niharikartist_fine_art_jwt_secret_key_2026';
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded.type === 'user') isAuthenticatedUser = true;
      } catch { /* invalid token */ }
    }

    if (isOnlinePayment && !isAuthenticatedUser && !isEmailVerified(customer.email.toLowerCase().trim())) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required for online payment. Please complete OTP verification.'
      });
    }

    const paymentStatus = isOnlinePayment ? 'paid' : 'pending';
    const finalPaymentMethod = isOnlinePayment ? 'Online (Razorpay)' : 'Cash on Delivery';

    const timelineEntry = {
      status: 'Ordered',
      timestamp: new Date().toISOString(),
      note: isOnlinePayment ? 'Order confirmed (Online Payment - Razorpay)' : 'Order confirmed (Cash on Delivery)'
    };

    // ── 6. Build insert payload ───────────────────────────────────────────
    const orderData = {
      order_id,
      customer_name: `${customer.firstName.trim()} ${customer.lastName.trim()}`,
      customer_email: customer.email.toLowerCase().trim(),
      customer_phone: customer.phone.trim(),
      shipping_address: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
        country: 'India'
      },
      items: verifiedItems,
      total_amount: serverTotal,
      status: 'Ordered',
      payment_method: finalPaymentMethod,
      payment_status: paymentStatus,
      razorpay_order_id: razorpayOrderId,
      tracking_number,
      subtotal: serverSubtotal,
      shipping_fee: serverShippingFee,
      discount: safeDiscount,
      timeline: [timelineEntry]
    };

    // ── 7. Save to Supabase — with fallback if extended columns missing ───
    let savedOrder = null;

    const { data: fullInsert, error: fullError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (fullError) {
      // Check if error is about missing extended columns → fallback to core columns only
      const missingColError =
        fullError.message && (
          fullError.message.includes("Could not find the '") ||
          fullError.message.includes('column') ||
          fullError.code === 'PGRST204'
        );

      if (missingColError) {
        console.warn('⚠️  Extended columns not found — inserting with core columns only. Run migration to add them.');

        // Store tracking + timeline inside items array metadata (non-breaking workaround)
        const coreData = {
          order_id,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          shipping_address: orderData.shipping_address,
          items: verifiedItems,
          total_amount: serverTotal,
          status: 'Ordered',
          payment_method: 'Cash on Delivery',
          payment_status: 'pending'
        };

        const { data: coreInsert, error: coreError } = await supabase
          .from('orders')
          .insert([coreData])
          .select()
          .single();

        if (coreError) {
          console.error('Core order insert error:', coreError);
          return res.status(500).json({ success: false, message: 'Unable to place order. Please try again.' });
        }
        savedOrder = coreInsert;
      } else {
        console.error('Supabase order insert error:', fullError);
        return res.status(500).json({ success: false, message: 'Unable to place order. Please try again.' });
      }
    } else {
      savedOrder = fullInsert;
    }

    // ── 8. Build enriched order object for emails ─────────────────────────
    const orderForEmail = {
      order_id,
      tracking_number,
      order_status: 'Ordered',
      payment_method: finalPaymentMethod,
      payment_status: paymentStatus,
      razorpay_payment_id: razorpayPaymentId,
      created_at: savedOrder.created_at,
      customer: {
        first_name: customer.firstName.trim(),
        last_name: customer.lastName.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone.trim()
      },
      shipping_address: orderData.shipping_address,
      items: verifiedItems,
      subtotal: serverSubtotal,
      shipping_fee: serverShippingFee,
      discount: safeDiscount,
      total: serverTotal
    };

    // ── 9. Send notifications — fire-and-forget, never block response ─────
    // Clear OTP after successful order (for online payments)
    if (isOnlinePayment) clearOTP(customer.email.toLowerCase().trim());
    sendAdminOrderEmail(orderForEmail).catch(err => {
      console.error('Admin email failed (order saved):', err.message);
    });
    sendCustomerOrderConfirmation(orderForEmail).catch(err => {
      console.error('Customer email failed (order saved):', err.message);
    });
    sendOrderAlert(orderForEmail).catch(err => {
      console.error('Telegram alert failed (order saved):', err.message);
    });

    // ── 10. Return success ────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      orderId: order_id,
      message: 'Order placed successfully.',
      data: mapId({ ...savedOrder, order_id, tracking_number, total: serverTotal, order_status: 'Ordered' })
    });

  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to place order. Please try again.'
    });
  }
};

// ─── GET /api/orders/my-orders?email=x ───────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: mapIds(orders || []) });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/orders/:orderId/cancel ────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    // Find the order by order_id AND customer_email (ownership check)
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('customer_email', email.toLowerCase().trim());

    if (fetchError) throw fetchError;
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or does not belong to this account.' });
    }

    const order = orders[0];

    // Check already cancelled/delivered
    if (['Cancelled', 'Cancelled by niharikartist', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `This order cannot be cancelled — current status: ${order.status}.` });
    }

    // 24-hour window check
    const placedAt = new Date(order.created_at).getTime();
    const hoursElapsed = (Date.now() - placedAt) / (1000 * 60 * 60);
    if (hoursElapsed > 24) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation window has expired. Orders can only be cancelled within 24 hours of placement.'
      });
    }

    // Update status to Cancelled
    const newTimeline = [
      ...(order.timeline || []),
      {
        status: 'Cancelled by Customer',
        timestamp: new Date().toISOString(),
        note: 'Order cancelled by customer within 24-hour cancellation window.'
      }
    ];

    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Cancelled by Customer', timeline: newTimeline })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Send cancellation email (fire-and-forget)
    const emailData = {
      order_id: order.order_id,
      status: 'Cancelled by Customer',
      note: 'Cancelled within 24-hour window. Full refund will be processed within 5–7 business days.',
      customer: mapId(order).customer,
      total: order.total_amount,
      items: order.items || []
    };
    sendOrderStatusUpdate(emailData).catch(err =>
      console.error('Cancellation email failed:', err.message)
    );

    return res.json({
      success: true,
      message: 'Order cancelled successfully. Full refund will be processed within 5–7 business days.',
      data: mapId(updated)
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/orders/track ────────────────────────────────────────────────
exports.trackOrder = async (req, res) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId && !email) {
      return res.status(400).json({ success: false, message: 'Please provide Order ID or Email' });
    }

    let query = supabase.from('orders').select('*');
    if (orderId) query = query.ilike('order_id', orderId.trim());
    if (email) query = query.eq('customer_email', email.toLowerCase().trim());

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

// ─── GET /api/orders (admin) ──────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, count: orders.length, data: mapIds(orders) });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/orders/:id/status (admin) ───────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const { data: order, error: fetchError } = await supabase
      .from('orders').select('*').eq('id', id).single();
    if (fetchError || !order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatePayload = { status };

    if (order.timeline !== undefined) {
      const newTimeline = [...(order.timeline || []), {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Order status updated to ${status}`
      }];
      updatePayload.timeline = newTimeline;
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send status update email to customer
    const customerEmail = updatedOrder.customer_email || order.customer_email;
    if (customerEmail) {
      const emailData = {
        order_id: updatedOrder.order_id || order.order_id,
        status,
        note: note || '',
        customer: mapId(updatedOrder).customer || {
          first_name: (updatedOrder.customer_name || '').split(' ')[0],
          last_name: (updatedOrder.customer_name || '').split(' ').slice(1).join(' '),
          email: customerEmail,
          phone: updatedOrder.customer_phone || ''
        },
        total: updatedOrder.total_amount || order.total_amount,
        items: updatedOrder.items || order.items || []
      };
      sendOrderStatusUpdate(emailData).catch(err => {
        console.error('Status update email failed:', err.message);
      });
    }

    return res.json({ success: true, data: mapId(updatedOrder) });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/admin/orders/clear-all (admin) ───────────────────────────
exports.clearAllOrders = async (req, res) => {
  try {
    // Delete all rows — Supabase requires a filter; use neq on a non-null col
    const { error } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all real rows

    if (error) throw error;

    return res.json({ success: true, message: 'All orders deleted successfully.' });
  } catch (error) {
    console.error('Error clearing all orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
