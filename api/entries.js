const { loadEnv } = require('./lib/load-env.cjs');
loadEnv();

function jsonbinBase() {
  return `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`;
}

function hasJsonbinKey() {
  return process.env.JSONBIN_ACCESS_KEY || process.env.JSONBIN_API_KEY;
}

function jsonbinHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.JSONBIN_ACCESS_KEY) {
    headers['X-Access-Key'] = process.env.JSONBIN_ACCESS_KEY;
  } else if (process.env.JSONBIN_API_KEY) {
    headers['X-Master-Key'] = process.env.JSONBIN_API_KEY;
  }
  return headers;
}

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body || {};
}

function validateAuth(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token || token !== process.env.APP_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

function ensureJsonbinConfig() {
  if (!hasJsonbinKey() || !process.env.JSONBIN_BIN_ID) {
    throw new Error('JSONBIN_ACCESS_KEY (or JSONBIN_API_KEY) and JSONBIN_BIN_ID must be set');
  }
}

async function fetchBin() {
  ensureJsonbinConfig();
  const response = await fetch(jsonbinBase(), {
    headers: jsonbinHeaders(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`JSONBin GET failed: ${response.status}${detail ? ` — ${detail.slice(0, 120)}` : ''}`);
  }

  const data = await response.json();
  return data.record || { entries: [] };
}

async function saveBin(record) {
  ensureJsonbinConfig();
  const response = await fetch(jsonbinBase(), {
    method: 'PUT',
    headers: jsonbinHeaders(),
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`JSONBin PUT failed: ${response.status}${detail ? ` — ${detail.slice(0, 120)}` : ''}`);
  }
}

function sortEntries(entries) {
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

module.exports = async function handler(req, res) {
  if (!validateAuth(req, res)) return;

  try {
    if (req.method === 'GET') {
      const record = await fetchBin();
      return res.status(200).json({ entries: record.entries || [] });
    }

    if (req.method === 'POST') {
      const entry = parseBody(req);

      if (!entry || !entry.date) {
        return res.status(400).json({ error: 'Entry must include a date' });
      }

      const record = await fetchBin();
      const entries = record.entries || [];
      const index = entries.findIndex((e) => e.date === entry.date);

      if (index >= 0) {
        entries[index] = entry;
      } else {
        entries.push(entry);
      }

      record.entries = sortEntries(entries);
      await saveBin(record);

      return res.status(200).json({ success: true, entry });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('entries error:', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
};
