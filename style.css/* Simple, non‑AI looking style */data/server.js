import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const PROXY_API_KEY = process.env.PROXY_API_KEY; // you’ll add a free proxy service key

const app = express();

// 1️⃣ Returns a free proxy URL for a given country (example service: https://api.proxy-service.com)
async function getProxyByCountry(country) {
  const res = await fetch(`https://api.proxy-service.com/get?country=\${country}`, {headers: {Authorization: PROXY_API_KEY}});
  if (!res.ok) throw new Error(`No proxy for \${country}`);
  const data = await res.json();
  return data.proxy; // e.g. "https://proxy-eu.example.com"
}

// 2️⃣ The public endpoint that the front‑end calls
app.get('/proxy/:country', async (req, res) => {
  const country = req.params.country;
  try {
    const proxy = await getProxyByCountry(country);
    if (!proxy) return res.status(503).json({error: 'No proxy found'});
    // Forward the request & return the raw response
    const forwardUrl = proxy + req.originalUrl; // e.g. https://proxy-eu.example.com /example.com
    const forwardRes = await fetch(forwardUrl, {method: req.method, headers: req.headers});
    // Return only status, headers and body (sanitized) to the front‑end
    const body = await forwardRes.text();
    res.status(forwardRes.status).json({
      status: forwardRes.status,
      headers: Object.fromEntries(forwardRes.headers.entries()),
      body: body.slice(0, 2000) // limit size for safety
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on :\${PORT}`));
