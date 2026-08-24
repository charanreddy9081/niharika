const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || '';

// Support multiple chat IDs separated by comma in env var
// e.g. TELEGRAM_CHAT_ID=5530331816,5778791490
function getChatIds() {
  return TELEGRAM_CHAT_ID
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
}

function sendToOne(chatId, text) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      chat_id: chatId,
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
          console.log(`✅ Telegram alert sent to ${chatId}`);
        } else {
          console.error(`❌ Telegram alert failed for ${chatId}:`, res.statusCode, data);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Telegram request error:', err.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

/**
 * Send message to all configured chat IDs.
 * Never throws — failure never breaks order flow.
 */
async function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN not set — skipping Telegram alert');
    return;
  }

  const chatIds = getChatIds();
  if (chatIds.length === 0) {
    console.warn('⚠️  TELEGRAM_CHAT_ID not set — skipping Telegram alert');
    return;
  }

  await Promise.all(chatIds.map(id => sendToOne(id, text)));
}

/**
 * Send new order alert to all admin Telegram chats.
 */
async function sendOrderAlert(order) {
  const { order_id, customer, shipping_address, items, total, payment_method, payment_status, razorpay_payment_id } = order;

  const isOnline = payment_method && payment_method.toLowerCase().includes('razorpay');
  const paymentLine = isOnline
    ? `✅ <b>Paid Online</b> (Razorpay)${razorpay_payment_id ? `\n<b>Payment ID:</b> <code>${razorpay_payment_id}</code>` : ''}`
    : `🚚 <b>Cash on Delivery</b>`;

  const itemLines = (items || []).map(item =>
    `  • ${item.name} × ${item.quantity} — ₹${Number(item.price * item.quantity).toLocaleString('en-IN')}`
  ).join('\n');

  const message = [
    `🛍️ <b>New Order Received</b>`,
    ``,
    `<b>Order ID:</b> <code>${order_id}</code>`,
    `<b>Payment:</b> ${paymentLine}`,
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
    `<a href="https://niharikartist.shop/admin">→ Open Admin Panel</a>`,
  ].join('\n');

  await sendTelegramMessage(message);
}

/**
 * Send cancellation alert to admin Telegram chats.
 */
async function sendCancellationAlert(order) {
  const { order_id, customer, items, total, payment_method, razorpay_payment_id } = order;

  const isOnline = payment_method && payment_method.toLowerCase().includes('razorpay');
  const paymentLine = isOnline
    ? `✅ Paid Online (Razorpay)${razorpay_payment_id ? `\n<b>Payment ID:</b> <code>${razorpay_payment_id}</code>` : ''}\n⚠️ <b>Refund required within 5–7 business days</b>`
    : `🚚 Cash on Delivery`;

  const itemLines = (items || []).map(item =>
    `  • ${item.name} × ${item.quantity} — ₹${Number(item.price * item.quantity).toLocaleString('en-IN')}`
  ).join('\n');

  const message = [
    `❌ <b>Order Cancelled by Customer</b>`,
    ``,
    `<b>Order ID:</b> <code>${order_id}</code>`,
    `<b>Payment:</b> ${paymentLine}`,
    ``,
    `<b>Customer:</b>`,
    `  👤 ${customer.first_name || customer.firstName} ${customer.last_name || customer.lastName}`,
    `  📧 ${customer.email}`,
    `  📞 ${customer.phone}`,
    ``,
    `<b>Cancelled Items:</b>`,
    itemLines,
    ``,
    `<b>💰 Order Total: ₹${Number(total).toLocaleString('en-IN')}</b>`,
    ``,
    isOnline ? `<b>⚠️ Action Required: Process refund to customer</b>\n` : '',
    `<a href="https://niharikartist.shop/admin">→ Open Admin Panel</a>`,
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(message);
}

module.exports = { sendTelegramMessage, sendOrderAlert, sendCancellationAlert };
