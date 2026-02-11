/**
 * YooKassa: создание платежа (Smart Payment, redirect)
 * Документация: https://yookassa.ru/developers/payment-acceptance/integration-scenarios/smart-payment
 *
 * Требуются переменные окружения:
 *   YOOKASSA_SHOP_ID — ID магазина (например 1267189)
 *   YOOKASSA_SECRET_KEY — Секретный ключ из личного кабинета
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    console.error('YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY должны быть заданы в переменных окружения');
    return res.status(500).json({
      error: 'Настройте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в личном кабинете',
    });
  }

  try {
    const { amount = 490, description = 'Трек', return_url } = req.body;

    const returnUrl = return_url || (req.headers.origin || req.headers.referer || '') + '/';

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': `track-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        Authorization: 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: {
          value: String(Number(amount).toFixed(2)),
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: returnUrl || 'https://tracks.emotiq.ru/',
        },
        description: description.slice(0, 128),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('YooKassa API error:', response.status, errText);
      return res.status(502).json({
        error: 'Ошибка при создании платежа',
        details: errText,
      });
    }

    const payment = await response.json();
    const confirmationUrl = payment.confirmation?.confirmation_url;

    if (!confirmationUrl) {
      return res.status(502).json({ error: 'Не получена ссылка на оплату' });
    }

    return res.status(200).json({ confirmation_url: confirmationUrl });
  } catch (err) {
    console.error('create-payment error:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
