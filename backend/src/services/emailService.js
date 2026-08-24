/**
 * Email Service — uses SendGrid HTTPS API (works on Render free tier).
 * Gmail SMTP is blocked by Render's free tier (port 587 timeout).
 * SendGrid uses port 443 HTTPS which is never blocked.
 */

const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.error('❌ SENDGRID_API_KEY not set — emails will not send');
}

const FROM_EMAIL  = process.env.SENDGRID_FROM_EMAIL || 'niharikaananthoja@gmail.com';
const FROM_NAME   = 'niharikartist Studio';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || FROM_EMAIL;

// SendGrid mail options helper — adds headers that reduce spam score
function mailOptions(to, subject, html, replyToEmail) {
  return {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    replyTo: replyToEmail || FROM_EMAIL,
    subject,
    html,
    headers: {
      'X-Entity-Ref-ID': `niharikartist-${Date.now()}`,
    },
    trackingSettings: {
      clickTracking: { enable: false, enableText: false },
      openTracking: { enable: false },
    },
  };
}

const brandStyles = `
  body { margin:0; padding:0; background:#050f0b; font-family:'Segoe UI',Arial,sans-serif; color:#fbf8f1; }
  .wrapper { max-width:620px; margin:0 auto; background:#071610; border:1px solid rgba(232,200,114,0.25); border-radius:16px; overflow:hidden; }
  .header { background:linear-gradient(135deg,#081d14 0%,#0d2b1e 100%); padding:36px 40px; text-align:center; border-bottom:1px solid rgba(232,200,114,0.2); }
  .brand { font-size:32px; font-weight:300; color:#fbf5e6; letter-spacing:2px; font-family:Georgia,serif; }
  .tagline { font-size:10px; letter-spacing:5px; text-transform:uppercase; color:#a3b8af; margin-top:4px; }
  .body { padding:32px 40px; }
  .gold { color:#e8c872; }
  .section-title { font-size:11px; text-transform:uppercase; letter-spacing:3px; color:#a3b8af; border-bottom:1px solid rgba(255,255,255,0.07); padding-bottom:10px; margin-bottom:16px; }
  .info-row { display:flex; justify-content:space-between; font-size:13px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .info-label { color:#a3b8af; }
  .info-value { color:#fbf8f1; font-weight:500; text-align:right; }
  table.items { width:100%; border-collapse:collapse; margin:16px 0; font-size:13px; }
  table.items th { background:#0a2319; color:#a3b8af; text-transform:uppercase; font-size:10px; letter-spacing:2px; padding:10px 12px; text-align:left; }
  table.items td { padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#fbf8f1; vertical-align:middle; }
  table.items td img { width:52px; height:52px; object-fit:cover; border-radius:8px; border:1px solid rgba(232,200,114,0.2); }
  .totals { background:#0a2319; border-radius:10px; padding:18px 20px; margin-top:20px; }
  .total-row { display:flex; justify-content:space-between; font-size:13px; padding:5px 0; }
  .total-row.grand { border-top:1px solid rgba(232,200,114,0.3); margin-top:10px; padding-top:12px; font-size:16px; font-weight:600; color:#e8c872; }
  .status-pill { display:inline-block; padding:4px 14px; border-radius:20px; background:#0d3d25; border:1px solid rgba(52,211,153,0.4); color:#6ee7b7; font-size:11px; letter-spacing:2px; text-transform:uppercase; }
  .address-box { background:#0a2319; border:1px solid rgba(232,200,114,0.15); border-radius:10px; padding:16px 20px; font-size:13px; line-height:1.7; color:#d4d4d8; }
  .cta-btn { display:inline-block; background:linear-gradient(135deg,#fbf5e6,#e8c872); color:#050f0b; font-weight:700; font-size:12px; letter-spacing:2px; text-transform:uppercase; padding:14px 32px; border-radius:40px; text-decoration:none; margin-top:24px; }
  .footer { background:#040e0a; padding:20px 40px; text-align:center; font-size:11px; color:#627a70; letter-spacing:1px; border-top:1px solid rgba(255,255,255,0.05); }
  @media(max-width:600px){ .body,.header,.footer{padding:24px 20px;} .info-row{flex-direction:column;gap:2px;} .info-value{text-align:left;} }
`;

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildItemsTable(items) {
  const rows = items.map(item => {
    const imgSrc = item.image && item.image.startsWith('http') ? item.image : 'https://niharikartist.shop/images/placeholder.jpg';
    return `<tr>
      <td><img src="${imgSrc}" alt="${escapeHtml(item.name)}" /></td>
      <td style="padding-left:14px;">
        <strong style="color:#fbf5e6;">${escapeHtml(item.name)}</strong>
        ${item.selected_size ? `<br><span style="font-size:11px;color:#a3b8af;">${escapeHtml(item.selected_size)}</span>` : ''}
        ${item.custom_note ? `<br><span style="font-size:11px;color:#e8c872;font-style:italic;">"${escapeHtml(item.custom_note)}"</span>` : ''}
      </td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;color:#e8c872;font-weight:600;">&#8377;${Number(item.price).toLocaleString('en-IN')}</td>
    </tr>`;
  }).join('');
  return `<table class="items"><thead><tr><th style="width:64px;"></th><th>Artwork</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// ─── Admin order notification ─────────────────────────────────────────────
async function sendAdminOrderEmail(order) {
  if (!process.env.SENDGRID_API_KEY) { console.warn('⚠️ SENDGRID_API_KEY missing'); return; }
  const { order_id, customer, shipping_address, items, subtotal, shipping_fee, discount, total, order_status, created_at, payment_method, razorpay_payment_id } = order;
  const placedAt = created_at ? new Date(created_at).toLocaleString('en-IN', { dateStyle:'long', timeStyle:'short' }) : new Date().toLocaleString('en-IN', { dateStyle:'long', timeStyle:'short' });
  const isOnline = payment_method && payment_method.toLowerCase().includes('razorpay');
  const paymentDisplay = isOnline
    ? `Paid Online (Razorpay)${razorpay_payment_id ? ` — <span style="font-family:monospace;font-size:11px;color:#a3b8af;">${escapeHtml(razorpay_payment_id)}</span>` : ''}`
    : 'Cash on Delivery';
  const orderSubtitle = isOnline
    ? 'A new <strong style="color:#6ee7b7;">Paid Online (Razorpay)</strong> order has been placed.'
    : 'A new <strong style="color:#e8c872;">Cash on Delivery</strong> order has been placed.';

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${brandStyles}</style></head>
  <body><div class="wrapper">
    <div class="header"><div class="brand">niharikartist</div><div class="tagline">fine art atelier • admin notification</div></div>
    <div class="body">
      <h2 style="font-size:22px;font-weight:400;color:#fbf5e6;margin:0 0 6px;font-family:Georgia,serif;">New Order Received</h2>
      <p style="color:#a3b8af;font-size:13px;margin:0 0 28px;">${orderSubtitle}</p>
      <div class="section-title">Order Details</div>
      <div class="info-row"><span class="info-label">Order ID</span><span class="info-value gold">${escapeHtml(order_id)}</span></div>
      <div class="info-row"><span class="info-label">Placed At</span><span class="info-value">${placedAt}</span></div>
      <div class="info-row"><span class="info-label">Payment</span><span class="info-value">${paymentDisplay}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="status-pill">${escapeHtml(order_status||'Ordered')}</span></span></div>
      <div class="section-title" style="margin-top:28px;">Customer</div>
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}</span></div>
      <div class="info-row"><span class="info-label">Email</span><span class="info-value">${escapeHtml(customer.email)}</span></div>
      <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${escapeHtml(customer.phone)}</span></div>
      <div class="section-title" style="margin-top:28px;">Shipping Address</div>
      <div class="address-box">${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}<br>${escapeHtml(shipping_address.street)}<br>${escapeHtml(shipping_address.city)}, ${escapeHtml(shipping_address.state)} — ${escapeHtml(shipping_address.pincode)}<br><span style="color:#a3b8af;">Phone: ${escapeHtml(customer.phone)}</span></div>
      <div class="section-title" style="margin-top:28px;">Items</div>
      ${buildItemsTable(items)}
      <div class="totals">
        <div class="total-row"><span style="color:#a3b8af;">Subtotal</span><span>&#8377;${Number(subtotal).toLocaleString('en-IN')}</span></div>
        ${discount>0?`<div class="total-row"><span style="color:#6ee7b7;">Discount</span><span style="color:#6ee7b7;">&#8722;&#8377;${Number(discount).toLocaleString('en-IN')}</span></div>`:''}
        <div class="total-row"><span style="color:#a3b8af;">Delivery</span><span>${shipping_fee===0?'FREE':'&#8377;'+Number(shipping_fee).toLocaleString('en-IN')}</span></div>
        <div class="total-row grand"><span>Total</span><span>&#8377;${Number(total).toLocaleString('en-IN')}</span></div>
      </div>
    </div>
    <div class="footer">&copy; 2026 niharikartist fine art atelier</div>
  </div></body></html>`;
  try {
    await sgMail.send(mailOptions(ADMIN_EMAIL, `New Order — ${order_id} | ${isOnline ? '✅ Paid Online' : '🚚 COD'}`, html));
    console.log(`✅ Admin email sent for ${order_id}`);
  } catch (err) {
    console.error(`❌ Admin email failed for ${order_id}:`, err?.response?.body?.errors || err.message);
  }
}

// ─── Customer order confirmation ──────────────────────────────────────────
async function sendCustomerOrderConfirmation(order) {
  if (!process.env.SENDGRID_API_KEY) { console.warn('⚠️ SENDGRID_API_KEY missing'); return; }
  const { order_id, customer, shipping_address, items, subtotal, shipping_fee, discount, total, created_at, payment_method, razorpay_payment_id } = order;
  const placedAt = created_at ? new Date(created_at).toLocaleString('en-IN', { dateStyle:'long', timeStyle:'short' }) : new Date().toLocaleString('en-IN', { dateStyle:'long', timeStyle:'short' });
  const isOnline = payment_method && payment_method.toLowerCase().includes('razorpay');
  const paymentBox = isOnline
    ? `<div style="background:#0a2319;border-radius:10px;padding:16px 20px;font-size:13px;margin-top:20px;">
        <strong style="color:#6ee7b7;">✅ Paid Online via Razorpay</strong>
        ${razorpay_payment_id ? `<p style="margin:6px 0 0;color:#a3b8af;font-size:11px;font-family:monospace;">Payment ID: ${escapeHtml(razorpay_payment_id)}</p>` : ''}
        <p style="margin:8px 0 0;color:#a3b8af;font-size:12px;">Your payment has been received. Thank you!</p>
      </div>`
    : `<div style="background:#0a2319;border-radius:10px;padding:16px 20px;font-size:13px;margin-top:20px;">
        <strong style="color:#fbf8f1;">🚚 Cash on Delivery</strong>
        <p style="margin:8px 0 0;color:#a3b8af;font-size:12px;">Pay when your order arrives. No payment needed right now.</p>
      </div>`;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${brandStyles}</style></head>
  <body><div class="wrapper">
    <div class="header"><div class="brand">niharikartist</div><div class="tagline">fine art atelier • order confirmation</div></div>
    <div class="body">
      <h2 style="font-size:24px;font-weight:400;color:#fbf5e6;margin:0 0 8px;font-family:Georgia,serif;">Thank you for your order, ${escapeHtml(customer.first_name)}!</h2>
      <p style="color:#a3b8af;font-size:13px;margin:0 0 28px;">Your handcrafted artwork will be delivered within <strong style="color:#fbf8f1;">5&#8211;7 business days</strong>.</p>
      <div style="background:#0a2319;border:1px solid rgba(232,200,114,0.3);border-radius:12px;padding:18px 20px;margin-bottom:28px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#a3b8af;margin-bottom:8px;">Order Reference</div>
        <div style="font-size:28px;font-family:Georgia,serif;color:#e8c872;letter-spacing:2px;">${escapeHtml(order_id)}</div>
        <div style="font-size:12px;color:#a3b8af;margin-top:4px;">Placed on ${placedAt}</div>
      </div>
      <div class="section-title">Your Ordered Artworks</div>
      ${buildItemsTable(items)}
      <div class="totals">
        <div class="total-row"><span style="color:#a3b8af;">Subtotal</span><span>&#8377;${Number(subtotal).toLocaleString('en-IN')}</span></div>
        ${discount>0?`<div class="total-row"><span style="color:#6ee7b7;">Discount</span><span style="color:#6ee7b7;">&#8722;&#8377;${Number(discount).toLocaleString('en-IN')}</span></div>`:''}
        <div class="total-row"><span style="color:#a3b8af;">Delivery</span><span>${shipping_fee===0?'FREE':'&#8377;'+Number(shipping_fee).toLocaleString('en-IN')}</span></div>
        <div class="total-row grand"><span>Total</span><span>&#8377;${Number(total).toLocaleString('en-IN')}</span></div>
      </div>
      <div class="section-title" style="margin-top:28px;">Delivering To</div>
      <div class="address-box">${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}<br>${escapeHtml(shipping_address.street)}<br>${escapeHtml(shipping_address.city)}, ${escapeHtml(shipping_address.state)} — ${escapeHtml(shipping_address.pincode)}<br><span style="color:#a3b8af;">Phone: ${escapeHtml(customer.phone)}</span></div>
      ${paymentBox}
      <div style="text-align:center;margin-top:28px;">
        <a href="https://niharikartist.shop/track-order" class="cta-btn">Track Your Order</a>
      </div>
      <p style="margin-top:28px;font-size:12px;color:#627a70;text-align:center;">Questions? Contact us at <a href="mailto:${FROM_EMAIL}" style="color:#e8c872;">${FROM_EMAIL}</a></p>
    </div>
    <div class="footer">&copy; 2026 niharikartist fine art atelier • Handmade in India</div>
  </div></body></html>`;
  try {
    await sgMail.send(mailOptions(customer.email, `Order Confirmed — ${order_id} | niharikartist`, html, FROM_EMAIL));
    console.log(`✅ Customer email sent to ${customer.email} for ${order_id}`);
  } catch (err) {
    console.error(`❌ Customer email failed for ${order_id} (to: ${customer.email}):`, err?.response?.body?.errors || err.message);
  }
}

// ─── Order status update email to customer ────────────────────────────────
async function sendOrderStatusUpdate({ order_id, status, note, customer, total, items }) {
  if (!process.env.SENDGRID_API_KEY) { console.warn('⚠️ SENDGRID_API_KEY missing'); return; }

  const statusConfig = {
    'Ordered':                    { emoji: '✅', title: 'Order Confirmed',        color: '#6ee7b7', msg: 'Your order has been received and added to our studio queue.' },
    'Crafting in Studio':         { emoji: '🎨', title: 'Being Crafted in Studio', color: '#e8c872', msg: 'Our artist has started crafting your artwork with care.' },
    'Dispatched':                 { emoji: '🚚', title: 'Order Dispatched',        color: '#60a5fa', msg: 'Your artwork has been dispatched and is on its way to you.' },
    'Out for Delivery':           { emoji: '📦', title: 'Out for Delivery',        color: '#f97316', msg: 'Your artwork is out for delivery. Please be available to receive it.' },
    'Delivered':                  { emoji: '🎉', title: 'Order Delivered',         color: '#34d399', msg: 'Your artwork has been delivered. We hope you love it!' },
    'Cancelled by niharikartist': { emoji: '❌', title: 'Order Cancelled',         color: '#f87171', msg: 'We regret to inform you that your order has been cancelled by the studio. If you have any questions, please contact us.' },
  };

  const cfg = statusConfig[status] || { emoji: '📋', title: `Update: ${status}`, color: '#e8c872', msg: `Your order status has been updated to: ${status}` };
  const itemLines = (items || []).map(i =>
    `<li style="margin-bottom:6px;color:#d4d4d8;">${escapeHtml(i.name)} × ${i.quantity} — &#8377;${Number(i.price * i.quantity).toLocaleString('en-IN')}</li>`
  ).join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${brandStyles}</style></head>
  <body><div class="wrapper">
    <div class="header"><div class="brand">niharikartist</div><div class="tagline">fine art atelier • order update</div></div>
    <div class="body">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;line-height:1;">${cfg.emoji}</div>
        <h2 style="font-size:24px;font-weight:400;color:${cfg.color};margin:12px 0 4px;font-family:Georgia,serif;">${cfg.title}</h2>
        <p style="color:#a3b8af;font-size:13px;margin:0;">Order <strong style="color:#e8c872;">${escapeHtml(order_id)}</strong></p>
      </div>

      <div style="background:#0a2319;border:1px solid rgba(232,200,114,0.2);border-radius:12px;padding:18px 20px;margin-bottom:24px;">
        <p style="color:#fbf8f1;font-size:13px;margin:0;">Hi <strong>${escapeHtml(customer.first_name)}</strong>, ${cfg.msg}</p>
        ${note ? `<p style="color:#a3b8af;font-size:12px;margin:12px 0 0;font-style:italic;">"${escapeHtml(note)}"</p>` : ''}
      </div>

      ${itemLines ? `
        <div class="section-title">Your Order</div>
        <ul style="margin:0 0 12px;padding-left:20px;font-size:13px;">${itemLines}</ul>
        <div style="text-align:right;font-size:14px;color:#e8c872;font-weight:600;">Total: &#8377;${Number(total).toLocaleString('en-IN')}</div>
      ` : ''}

      <div style="text-align:center;margin-top:28px;">
        <a href="https://niharikartist.netlify.app/track-order?orderId=${encodeURIComponent(order_id)}" class="cta-btn">Track Your Order</a>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#627a70;text-align:center;">Questions? Contact us at <a href="mailto:${FROM_EMAIL}" style="color:#e8c872;">${FROM_EMAIL}</a></p>
    </div>
    <div class="footer">&copy; 2026 niharikartist fine art atelier • Handmade in India</div>
  </div></body></html>`;

  try {
    await sgMail.send(mailOptions(customer.email, `Order Update — ${cfg.title} — ${order_id}`, html, FROM_EMAIL));
    console.log(`✅ Status update email sent to ${customer.email} for ${order_id} [${status}]`);
  } catch (err) {
    console.error(`❌ Status update email failed for ${order_id}:`, err?.response?.body?.errors || err.message);
  }
}

module.exports = { sendAdminOrderEmail, sendCustomerOrderConfirmation, sendOrderStatusUpdate };
