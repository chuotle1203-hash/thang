// Netlify Function: nhận đơn đặt xe từ form và gửi vào Telegram.
// Token & chat id lấy từ biến môi trường (cấu hình trong Netlify, KHÔNG để trong code).
//   TELEGRAM_BOT_TOKEN  — token bot do @BotFather cấp
//   TELEGRAM_CHAT_ID    — id Telegram của chủ shop (nhận đơn)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT_ID) {
    return { statusCode: 500, body: 'Chưa cấu hình TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID' };
  }

  let text = '';
  try {
    text = (JSON.parse(event.body || '{}').text || '').toString();
  } catch (e) {
    return { statusCode: 400, body: 'Bad Request' };
  }
  if (!text.trim()) {
    return { statusCode: 400, body: 'Nội dung trống' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: text, disable_web_page_preview: true })
    });
    if (!res.ok) {
      const detail = await res.text();
      return { statusCode: 502, body: 'Telegram lỗi: ' + detail };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 502, body: 'Không gửi được: ' + err.message };
  }
};
