module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const symbol = req.query.symbol;
  const interval = req.query.interval || "1d";
  const range = req.query.range || "6mo";
  if (!symbol) {
    res.status(400).json({ error: "Missing symbol" });
    return;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    const text = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json; charset=utf-8").send(text);
  } catch (error) {
    res.status(502).json({ error: "Yahoo chart proxy failed", detail: String(error.message || error) });
  }
}
