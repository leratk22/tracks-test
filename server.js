/**
 * Локальный сервер для разработки с API YooKassa
 * Запуск: node server.js
 * Требуется: .env с YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PORT = 8000;
const shopId = process.env.YOOKASSA_SHOP_ID;
const secretKey = process.env.YOOKASSA_SECRET_KEY;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/create-payment') {
    return handleCreatePayment(req, res);
  }

  let filePath = req.url === '/' ? '/index.html' : req.url;
  const cleanUrl = filePath.replace(/\?.*$/, '');
  if (cleanUrl.startsWith('/fonts/')) {
    filePath = path.join(__dirname, 'public', cleanUrl);
  } else {
    filePath = path.join(__dirname, cleanUrl);
  }
  if (!path.resolve(filePath).startsWith(path.resolve(__dirname))) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.message);
      return;
    }
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.end(data);
  });
});

async function handleCreatePayment(req, res) {
  if (!shopId || !secretKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Настройте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в .env.local' }));
    return;
  }
  let body = '';
  for await (const chunk of req) body += chunk;
  const { amount = 490, description = 'Трек', return_url } = JSON.parse(body || '{}');
  const returnUrl = return_url || `http://localhost:${PORT}/`;
  console.log('[YooKassa] Создание платежа:', description, amount, '₽');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch('https://api.yookassa.ru/v3/payments', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': `track-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        Authorization: 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: { value: String(Number(amount).toFixed(2)), currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: returnUrl },
        description: String(description).slice(0, 128),
      }),
    });
    clearTimeout(timeout);
    const payment = await resp.json();
    if (!resp.ok) {
      console.error('[YooKassa] Ошибка:', resp.status, payment);
    }
    if (!resp.ok) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: payment.description || payment.message || 'Ошибка YooKassa' }));
      return;
    }
    const url = payment.confirmation?.confirmation_url;
    if (!url) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Нет ссылки на оплату' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ confirmation_url: url }));
  } catch (e) {
    console.error('[YooKassa] Исключение:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: e.name === 'AbortError' ? 'YooKassa не ответил вовремя. Проверьте интернет.' : (e.message || 'Ошибка сервера'),
    }));
  }
}

server.listen(PORT, () => {
  const hasKeys = !!(shopId && secretKey);
  console.log(`\n  http://localhost:${PORT}/\n`);
  if (!hasKeys) {
    console.log('  ⚠ Создайте .env.local с YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY\n');
  } else {
    console.log('  ✓ YooKassa подключён\n');
  }
});
