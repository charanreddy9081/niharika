const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || '';

/**
 * Send a Telegram message to the admin chat.
 * Uses the plain HTTPS module — no extra dependencies.
 * Never throws — failure is logged but never breaks order flow.
 */
function sendTelegramMessage(text) {
  return new Promise((resolve) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping Telegram alert');
      return resolve();
    }

    const body = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Telegram admin alert sent');
        } else {
          console.error('❌ Telegram alert failed:', res.statusCode, data);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Telegram request error:', err.message);
      resolve(); // never block order flow
    });

    req.write(body);
    req.end();
  });
}

/**
 * Send new order alert to admin Telegram chat.
 */
async function sendOrderAlert(order) {
  const { order_id, customer, shipping_address, items, total, payment_method } = order;

  const itemLines = (items || []).map(item =>
    `  • ${item.name} × ${item.quantity} — ₹${Number(item.price * item.quantity).toLocaleString('en-IN')}`
  ).join('\n');

  const message = [
    `🛍️ <b>New Order Received</b>`,
    ``,
    `<b>Order ID:</b> <code>${order_id}</code>`,
    `<b>Payment:</b> ${payment_method || 'Cash on Delivery'}`,
    ``,
    `<b>Customer:</b>`,
    `  👤 ${customer.first_name} ${customer.last_name}`,
    `  📧 ${customer.email}`,
    `  📞 ${customer.phone}`,
    ``,
    `<b>Deliver to:</b>`,
    `  📍 ${shipping_address.street}, ${shipping_address.city}`,
    `  ${shipping_address.state} — ${shipping_address.pincode}`,
    ``,
    `<b>Items:</b>`,
    itemLines,
    ``,
    `<b>💰 Total: ₹${Number(total).toLocaleString('en-IN')}</b>`,
    ``,
    `<a href="https://niharikartist.netlify.app/admin">→ Open Admin Panel</a>`,
  ].join('\n');

  await sendTelegramMessage(message);
}

module.exports = { sendTelegramMessage, sendOrderAlert };
