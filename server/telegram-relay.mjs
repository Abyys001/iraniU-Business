#!/usr/bin/env node
/**
 * رلهٔ نمونه: POST /relay
 * بدنهٔ JSON همان payload ویجت (text, name, page, ts, …).
 *
 * اجرا:
 *   export TELEGRAM_BOT_TOKEN="123:ABC..."
 *   export TELEGRAM_ADMIN_CHAT_ID="123456789"
 *   node server/telegram-relay.mjs
 *
 * سپس در سایت: window.IRANIU_CHAT = { relayUrl: 'http://localhost:3847/relay' };
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'chat-log.jsonl');
const PORT = Number(process.env.CHAT_RELAY_PORT || 3847);
const BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function escapeTelegramHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegram(text) {
  if (!BOT || !CHAT_ID) return { skipped: true };
  const url = 'https://api.telegram.org/bot' + BOT + '/sendMessage';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) {
    throw new Error(j.description || 'Telegram API error');
  }
  return { skipped: false };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/relay') {
    let body = '';
    req.on('data', (c) => {
      body += c;
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const line = {
          ...data,
          serverReceivedAt: new Date().toISOString(),
        };
        ensureDataFile();
        fs.appendFileSync(DATA_FILE, JSON.stringify(line) + '\n', 'utf8');

        const msg =
          '<b>پیام سایت ایرانیو</b>\n' +
          (data.name ? '<b>نام:</b> ' + escapeTelegramHtml(data.name) + '\n' : '') +
          '<b>متن:</b>\n' +
          escapeTelegramHtml(data.text || '') +
          '\n\n' +
          '<a href="' +
          escapeTelegramHtml(String(data.page || '').replace(/"/g, '')) +
          '">صفحهٔ مبدأ</a>';

        let tg = { skipped: true };
        try {
          tg = await sendTelegram(msg);
        } catch (e) {
          console.error('Telegram:', e.message || e);
        }

        res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
        res.end(JSON.stringify({ ok: true, telegram: tg.skipped ? 'skipped_or_failed' : 'sent' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json', ...cors });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
      }
    });
    return;
  }

  res.writeHead(404, cors);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('Chat relay listening on http://localhost:' + PORT + '/relay');
  if (!BOT || !CHAT_ID) {
    console.log('Tip: set TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID to forward to Telegram.');
  }
  console.log('Logs append to', DATA_FILE);
});
