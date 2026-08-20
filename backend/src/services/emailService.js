const nodemailer = require('nodemailer');

const GMAIL_USER     = process.env.GMAIL_USER         || '';
const GMAIL_PASS     = process.env.GMAIL_APP_PASSWORD  || '';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL         || GMAIL_USER;
const FROM_NAME      = 'niharikartist Studio';

// Create reusable Gmail SMTP transporter
// Gmail → Gmail = SPF PASS, DKIM PASS, DMARC PASS → inbox, not spam
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!GMAIL_USER || !GMAIL_PASS) {
    console.warn('⚠️  GMAIL_USER or GMAIL_APP_PASSWORD not set — emails will not be sent.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,   // 16-char App Password (no spaces)
    },
  });
  return transporter;
}

// ─── Shared brand HTML styles ─────────────────────────────────────────────
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
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildItemsTable(items) {
  const rows = items.map(item => {
    const imgSrc = item.image && item.image.startsWith('http')
      ? item.image : 'https://niharikartist.shop/images/placeholder.jpg';
    return `
      <tr>
        <td><img src="${imgSrc}" alt="${escapeHtml(item.name)}" /></td>
        <td style="padding-left:14px;">
          <strong style="color:#fbf5e6;">${escapeHtml(item.name)}</strong>
          ${item.selected_size ? `<br><span style="font-size:11px;color:#a3b8af;">${escapeHtml(item.selected_size)}</span>` : ''}
          ${item.custom_note ? `<br><span style="font-size:11px;color:#e8c872;font-style:italic;">"${escapeHtml(item.custom_note)}"</span>` : ''}
        </td>
        <td style="text-align:center;">${item.quantity}</td>
        <td style="text-align:right;color:#e8c872;font-weight:600;">₹${Number(item.price).toLocaleString('en-IN')}</td>
      </tr>`;
  }).join('');

  return `
    <table class="items">
      <thead><tr><th style="width:64px;"></th><th>Artwork</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ─── Admin order notification ─────────────────────────────────────────────
async function sendAdminOrderEmail(order) {
  const t = getTransporter();
  if (!t) { console.warn('⚠️  Gmail transporter not configured — skipping admin email'); return; }

  const { order_id, customer, shipping_address, items, subtotal, shipping_fee, discount, total, order_status, created_at } = order;
  const placedAt = created_at
    ? new Date(created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${brandStyles}</style></head>
  <body><div class="wrapper">
    <div class="header"><div class="brand">niharikartist</div><div class="tagline">fine art atelier • admin notification</div></div>
    <div class="body">
      <h2 style="font-size:22px;font-weight:400;color:#fbf5e6;margin:0 0 6px;font-family:Georgia,serif;">New Order Received</h2>
      <p style="color:#a3b8af;font-size:13px;margin:0 0 28px;">A new Cash on Delivery order has been placed.</p>

      <div class="section-title">Order Details</div>
      <div class="info-row"><span class="info-label">Order ID</span><span class="info-value gold">${escapeHtml(order_id)}</span></div>
      <div class="info-row"><span class="info-label">Placed At</span><span class="info-value">${placedAt}</span></div>
      <div class="info-row"><span class="info-label">Payment</span><span class="info-value">Cash on Delivery</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="status-pill">${escapeHtml(order_status || 'Ordered')}</span></span></div>

      <div class="section-title" style="margin-top:28px;">Customer Details</div>
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}</span></div>
      <div class="info-row"><span class="info-label">Email</span><span class="info-value">${escapeHtml(customer.email)}</span></div>
      <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${escapeHtml(customer.phone)}</span></div>

      <div class="section-title" style="margin-top:28px;">Shipping Address</div>
      <div class="address-box">
        ${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}<br>
        ${escapeHtml(shipping_address.street)}<br>
        ${escapeHtml(shipping_address.city)}, ${escapeHtml(shipping_address.state)} — ${escapeHtml(shipping_address.pincode)}<br>
        <span style="color:#a3b8af;">Phone: ${escapeHtml(customer.phone)}</span>
      </div>

      <div class="section-title" style="margin-top:28px;">Ordered Items</div>
      ${buildItemsTable(items)}

      <div class="totals">
        <div class="total-row"><span style="color:#a3b8af;">Subtotal</span><span>₹${Number(subtotal).toLocaleString('en-IN')}</span></div>
        ${discount > 0 ? `<div class="total-row"><span style="color:#6ee7b7;">Discount</span><span style="color:#6ee7b7;">−₹${Number(discount).toLocaleString('en-IN')}</span></div>` : ''}
        <div class="total-row"><span style="color:#a3b8af;">Delivery</span><span>${shipping_fee === 0 ? 'FREE' : '₹' + Number(shipping_fee).toLocaleString('en-IN')}</span></div>
        <div class="total-row grand"><span>Order Total</span><span>₹${Number(total).toLocaleString('en-IN')}</span></div>
      </div>
    </div>
    <div class="footer">&copy; 2026 niharikartist fine art atelier • Automated Order Notification</div>
  </div></body></html>`;

  try {
    await t.sendMail({
      from: `"${FROM_NAME}" <${GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New Order Received — ${order_id}`,
      html,
    });
    console.log(`✅ Admin order email sent for ${order_id}`);
  } catch (err) {
    console.error(`❌ Admin email failed for ${order_id}:`, err.message);
    // Never throw — order is already saved
  }
}

// ─── Customer order confirmation ──────────────────────────────────────────
async function sendCustomerOrderConfirmation(order) {
  const t = getTransporter();
  if (!t) { console.warn('⚠️  Gmail transporter not configured — skipping customer email'); return; }

  const { order_id, customer, shipping_address, items, subtotal, shipping_fee, discount, total, created_at } = order;
  const placedAt = created_at
    ? new Date(created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${brandStyles}</style></head>
  <body><div class="wrapper">
    <div class="header"><div class="brand">niharikartist</div><div class="tagline">fine art atelier • order confirmation</div></div>
    <div class="body">
      <h2 style="font-size:24px;font-weight:400;color:#fbf5e6;margin:0 0 8px;font-family:Georgia,serif;">
        Thank you for your order, ${escapeHtml(customer.first_name)}!
      </h2>
      <p style="color:#a3b8af;font-size:13px;margin:0 0 6px;">We've received your order and it has been added to our studio queue.</p>
      <p style="color:#a3b8af;font-size:13px;margin:0 0 28px;">Your handcrafted artwork will be delivered within <strong style="color:#fbf8f1;">5–7 business days</strong>.</p>

      <div style="background:#0a2319;border:1px solid rgba(232,200,114,0.3);border-radius:12px;padding:18px 20px;margin-bottom:28px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#a3b8af;margin-bottom:8px;">Order Reference</div>
        <div style="font-size:28px;font-family:Georgia,serif;color:#e8c872;letter-spacing:2px;">${escapeHtml(order_id)}</div>
        <div style="font-size:12px;color:#a3b8af;margin-top:4px;">Placed on ${placedAt}</div>
      </div>

      <div class="section-title">Your Ordered Artworks</div>
      ${buildItemsTable(items)}

      <div class="totals">
        <div class="total-row"><span style="color:#a3b8af;">Subtotal</span><span>₹${Number(subtotal).toLocaleString('en-IN')}</span></div>
        ${discount > 0 ? `<div class="total-row"><span style="color:#6ee7b7;">Discount</span><span style="color:#6ee7b7;">−₹${Number(discount).toLocaleString('en-IN')}</span></div>` : ''}
        <div class="total-row"><span style="color:#a3b8af;">Delivery</span><span>${shipping_fee === 0 ? 'FREE' : '₹' + Number(shipping_fee).toLocaleString('en-IN')}</span></div>
        <div class="total-row grand"><span>Total</span><span>₹${Number(total).toLocaleString('en-IN')}</span></div>
      </div>

      <div class="section-title" style="margin-top:28px;">Delivering To</div>
      <div class="address-box">
        ${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}<br>
        ${escapeHtml(shipping_address.street)}<br>
        ${escapeHtml(shipping_address.city)}, ${escapeHtml(shipping_address.state)} — ${escapeHtml(shipping_address.pincode)}<br>
        <span style="color:#a3b8af;">Phone: ${escapeHtml(customer.phone)}</span>
      </div>

      <div class="section-title" style="margin-top:28px;">Payment</div>
      <div style="background:#0a2319;border-radius:10px;padding:16px 20px;font-size:13px;">
        <span style="color:#a3b8af;">Method:</span>
        <strong style="color:#fbf8f1;margin-left:8px;">Cash on Delivery</strong>
        <p style="margin:8px 0 0;color:#a3b8af;font-size:12px;">Pay when your order arrives at your doorstep. No payment needed right now.</p>
      </div>

      <div style="text-align:center;margin-top:28px;">
        <a href="https://niharikartist.netlify.app/track-order?orderId=${encodeURIComponent(order_id)}" class="cta-btn">Track Your Order</a>
      </div>

      <p style="margin-top:28px;font-size:12px;color:#627a70;text-align:center;">
        Questions? Reply to this email or contact us at <a href="mailto:${GMAIL_USER}" style="color:#e8c872;">${GMAIL_USER}</a>
      </p>
    </div>
    <div class="footer">&copy; 2026 niharikartist fine art atelier • Handmade in India • All Rights Reserved</div>
  </div></body></html>`;

  try {
    await t.sendMail({
      from: `"${FROM_NAME}" <${GMAIL_USER}>`,
      to: customer.email,
      subject: `Order Confirmation — ${order_id}`,
      html,
    });
    console.log(`✅ Customer confirmation email sent to ${customer.email} for ${order_id}`);
  } catch (err) {
    console.error(`❌ Customer email failed for ${order_id}:`, err.message);
    // Never throw — order is already saved
  }
}

module.exports = { sendAdminOrderEmail, sendCustomerOrderConfirmation };
