const { loadEnv } = require('./lib/load-env.cjs');
loadEnv();

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = parseBody(req);

  if (!password || password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid password' });
  }

  return res.status(200).json({ success: true, token: process.env.APP_TOKEN });
};
