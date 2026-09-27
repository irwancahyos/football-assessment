/**
 * fdma-api — access-token verification + Telegram admin bot.
 *
 * Routes:
 *   POST /access/verify      { token } -> { valid, status }
 *   POST /telegram/webhook   Telegram webhook (admin-only commands)
 *
 * Secrets (wrangler secret put ...):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_ID
 * Vars (wrangler.toml):
 *   PUBLIC_APP_URL
 * Binding: DB (d1 fdma-access)
 */

// Minimal D1 typings (no @cloudflare/workers-types dep needed).
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(column?: string): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_ADMIN_ID: string;
  PUBLIC_APP_URL: string;
}

type VerifyRow = { status: string } | null;

// ponytail: in-memory pending-name flags per chat. Single instance holds it fine at this scale.
const pendingName = new Map<number | string, boolean>();

// 32-char URL-safe token from a CSPRNG. Uniqueness enforced by UNIQUE column.
function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24)); // 24B -> 32 base64url chars
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const json = (data: unknown, status = 200, cors?: string) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      ...(cors ? { 'access-control-allow-origin': cors } : {}),
    },
  });

function corsOrigin(req: Request, env: Env): string | undefined {
  const origin = req.headers.get('origin');
  if (!origin) return undefined;
  // ponytail: http localhost allowed for local dev testing (`pnpm dev`).
  try {
    const u = new URL(origin);
    if ((u.hostname === 'localhost' || u.hostname === '127.0.0.1') && u.protocol === 'http:') {
      return origin;
    }
  } catch {
    return undefined;
  }
  // Only allow the configured frontend. Missing/foreign origin -> no CORS header.
  return origin === env.PUBLIC_APP_URL ? origin : undefined;
}

async function handleVerify(req: Request, env: Env): Promise<Response> {
  if (req.method === 'OPTIONS') {
    const cors = corsOrigin(req, env);
    return new Response(null, {
      status: 204,
      headers: {
        ...(cors ? { 'access-control-allow-origin': cors } : {}),
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let token: unknown;
  try {
    token = (await req.json()).token;
  } catch {
    return json({ valid: false, status: 'invalid' }, 400, corsOrigin(req, env));
  }
  if (typeof token !== 'string' || token.length < 16 || token.length > 128) {
    return json({ valid: false, status: 'invalid' }, 200, corsOrigin(req, env));
  }

  let row: VerifyRow = null;
  try {
    row = await env.DB.prepare('SELECT status FROM access_tokens WHERE token = ?1')
      .bind(token)
      .first<VerifyRow>();
  } catch {
    // DB error -> deny, never allow. No CORS leak detail.
    return json({ valid: false, status: 'error' }, 500);
  }

  if (row?.status === 'active') return json({ valid: true, status: 'active' }, 200, corsOrigin(req, env));
  return json({ valid: false, status: 'inactive' }, 200, corsOrigin(req, env));
}

async function tgApi(env: Env, method: string, payload: unknown): Promise<any> {
  // ponytail: trim guards against whitespace pasted with the secret.
  const token = env.TELEGRAM_BOT_TOKEN.trim();
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function tgSend(env: Env, chatId: number | string, text: string): Promise<void> {
  await tgApi(env, 'sendMessage', { chat_id: chatId, text, disable_web_page_preview: true });
}

// Send a message with inline buttons: [{ text, callback_data }].
async function tgSendButtons(
  env: Env,
  chatId: number | string,
  text: string,
  buttons: { text: string; callback_data: string }[][],
): Promise<void> {
  await tgApi(env, 'sendMessage', {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: buttons.map((row) => row.map((b) => ({ ...b }))) },
  });
}

async function tgAnswerCallback(env: Env, callbackId: string, text: string): Promise<void> {
  await tgApi(env, 'answerCallbackQuery', { callback_query_id: callbackId, text });
}

async function tgEditButtons(
  env: Env,
  chatId: number | string,
  messageId: number,
  text: string,
  buttons?: { text: string; callback_data: string }[][],
): Promise<void> {
  await tgApi(env, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    disable_web_page_preview: true,
    // ponytail: no buttons -> keyboard removed; pass buttons to keep a toggle.
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  });
}

async function generateLink(env: Env, chatId: number | string, name: string): Promise<void> {
  const base = env.PUBLIC_APP_URL.replace(/\/+$/, '');
  const token = newToken();
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      'INSERT INTO access_tokens (token, status, created_at, player_name) VALUES (?1, \'active\', ?2, ?3)',
    )
      .bind(token, now, name)
      .run();
  } catch {
    await tgSend(env, chatId, 'Failed to create token (DB error). Try again.');
    return;
  }
  await tgSendButtons(
    env,
    chatId,
    `Access link dibuat:\n${name}\n${base}/?k=${token}\nStatus: active`,
    [[{ text: '🔴 Matikan link ini', callback_data: `off:${token}` }]],
  );
}

async function handleTelegram(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  let update: any;
  try {
    update = await req.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }
  const base = env.PUBLIC_APP_URL.replace(/\/+$/, '');
  // Show "Name\nlink" when a label exists, otherwise just the link.
  const fmtLink = (token: string, name: string | null) =>
    name ? `${name}\n${base}/?k=${token}` : `${base}/?k=${token}`;
  // Inline button taps arrive as callback_query, not message.
  const cb = update?.callback_query;
  if (cb) {
    const fromId = cb?.from?.id;
    const chatId = cb?.message?.chat?.id;
    const messageId = cb?.message?.message_id;
    if (!fromId || !chatId || !messageId) return new Response('ok');
    if (String(fromId) !== env.TELEGRAM_ADMIN_ID.trim()) {
      await tgAnswerCallback(env, cb.id, 'Not authorized.');
      return new Response('ok');
    }
    const data: string = cb.data ?? '';
    if (data.startsWith('off:')) {
      const token = data.slice(4);
      const res = await env.DB.prepare('UPDATE access_tokens SET status = \'inactive\' WHERE token = ?1 AND status = \'active\'')
        .bind(token)
        .run();
      if (res.meta.changes > 0) {
        const row = await env.DB.prepare('SELECT player_name FROM access_tokens WHERE token = ?1')
          .bind(token)
          .first<{ player_name: string | null }>();
        await tgEditButtons(env, chatId, messageId, `Link dimatikan:\n${fmtLink(token, row?.player_name ?? null)}\nStatus: inactive`, [
          [{ text: '🟢 Aktifkan lagi', callback_data: `on:${token}` }],
        ]);
        await tgAnswerCallback(env, cb.id, 'Link dimatikan.');
      } else {
        await tgAnswerCallback(env, cb.id, 'Sudah mati / tidak ditemukan.');
      }
    } else if (data.startsWith('on:')) {
      const token = data.slice(3);
      const res = await env.DB.prepare('UPDATE access_tokens SET status = \'active\' WHERE token = ?1 AND status = \'inactive\'')
        .bind(token)
        .run();
      if (res.meta.changes > 0) {
        const row = await env.DB.prepare('SELECT player_name FROM access_tokens WHERE token = ?1')
          .bind(token)
          .first<{ player_name: string | null }>();
        await tgEditButtons(env, chatId, messageId, `Access link aktif:\n${fmtLink(token, row?.player_name ?? null)}\nStatus: active`, [
          [{ text: '🔴 Matikan link ini', callback_data: `off:${token}` }],
        ]);
        await tgAnswerCallback(env, cb.id, 'Link diaktifkan lagi.');
      } else {
        await tgAnswerCallback(env, cb.id, 'Sudah aktif / tidak ditemukan.');
      }
    } else {
      await tgAnswerCallback(env, cb.id, 'Unknown action.');
    }
    return new Response('ok');
  }

  const msg = update?.message;
  const chatId = msg?.chat?.id;
  const fromId = msg?.from?.id;
  const text: string = msg?.text ?? '';
  if (!chatId || !fromId) return new Response('ok');

  // Admin-only. Silent-ish reject, no internals leaked.
  // ponytail: trim guards against whitespace pasted with the secret.
  if (String(fromId) !== env.TELEGRAM_ADMIN_ID.trim()) {
    await tgSend(env, chatId, 'Not authorized.');
    return new Response('ok');
  }

  const [cmd, ...rest] = text.trim().split(/\s+/);
  const name = rest.join(' ').slice(0, 60) || null;

  // ponytail: name is required — bare /generate asks, reply (or /generate NAME) creates.
  if (cmd === '/generate' || cmd === '/new') {
    if (!name) {
      await tgSend(env, chatId, 'Mau buat link untuk siapa?\nBalas dengan nama, cth: SSB Gama\n(batal: /cancel)');
      pendingName.set(chatId, true);
      return new Response('ok');
    }
    pendingName.delete(chatId);
    await generateLink(env, chatId, name);
    return new Response('ok');
  }

  if (cmd === '/cancel') {
    if (pendingName.delete(chatId)) {
      await tgSend(env, chatId, 'Dibatalkan.');
    } else {
      await tgSend(env, chatId, 'Tidak ada yang dibatalkan.');
    }
    return new Response('ok');
  }

  // Reply to the "Mau buat link untuk siapa?" prompt -> the reply text is the name.
  if (pendingName.get(chatId) && !text.startsWith('/')) {
    const replyName = text.trim().slice(0, 60);
    if (!replyName) {
      await tgSend(env, chatId, 'Namanya apa? (batal: /cancel)');
      return new Response('ok');
    }
    pendingName.delete(chatId);
    await generateLink(env, chatId, replyName);
    return new Response('ok');
  }

  if (cmd === '/list') {
    const { results } = await env.DB.prepare(
      "SELECT token, created_at, player_name FROM access_tokens WHERE status = 'active' ORDER BY id DESC LIMIT 20",
    ).all<{ token: string; created_at: string; player_name: string | null }>();
    if (!results.length) {
      await tgSend(env, chatId, 'Tidak ada link aktif.');
      return new Response('ok');
    }
    await tgSend(env, chatId, `Link aktif (${results.length}):`);
    for (const row of results) {
      await tgSendButtons(
        env,
        chatId,
        `${fmtLink(row.token, row.player_name)}\nDibuat: ${row.created_at}`,
        [[{ text: '🔴 Matikan', callback_data: `off:${row.token}` }]],
      );
    }
    return new Response('ok');
  }

  if (cmd === '/deactivate' || cmd === '/activate' || cmd === '/status') {
    // ponytail: accept raw token or a pasted full link — extract ?k= when present.
    const raw = rest[0] ?? '';
    const tokenArg = raw.includes('?k=') ? raw.split('?k=')[1].split('&')[0] : raw;
    if (!tokenArg) {
      await tgSend(env, chatId, `Usage: ${cmd} TOKEN`);
      return new Response('ok');
    }
    if (cmd === '/status') {
      const row = await env.DB.prepare(
        'SELECT status, created_at, player_name FROM access_tokens WHERE token = ?1',
      )
        .bind(tokenArg)
        .first<{ status: string; created_at: string; player_name: string | null }>();
      await tgSend(
        env,
        chatId,
        row ? `${fmtLink(tokenArg, row.player_name)}\nStatus: ${row.status}\nCreated: ${row.created_at}` : 'Token tidak ditemukan.',
      );
      return new Response('ok');
    }
    const next = cmd === '/activate' ? 'active' : 'inactive';
    const res = await env.DB.prepare('UPDATE access_tokens SET status = ?1 WHERE token = ?2')
      .bind(next, tokenArg)
      .run();
    await tgSend(
      env,
      chatId,
      res.meta.changes > 0 ? `Token ${next}: ${tokenArg}` : 'Token tidak ditemukan.',
    );
    return new Response('ok');
  }

  if (cmd === '/start' || cmd === '/help') {
    await tgSend(
      env,
      chatId,
      'Commands:\n/generate — buat link baru (ditanya nama dulu)\n/list — lihat link aktif (+ tombol matikan)\n/deactivate TOKEN\n/activate TOKEN\n/status TOKEN',
    );
    return new Response('ok');
  }

  return new Response('ok');
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url);
    if (pathname === '/access/verify') return handleVerify(req, env);
    if (pathname === '/telegram/webhook') return handleTelegram(req, env);
    if (pathname === '/health') return json({ ok: true });
    return json({ error: 'not found' }, 404);
  },
};
