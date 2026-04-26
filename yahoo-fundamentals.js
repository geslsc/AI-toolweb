module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const symbol = req.query.symbol;
  if (!symbol) {
    res.status(400).json({ error: "Missing symbol" });
    return;
  }

  const modules = "defaultKeyStatistics,financialData,earnings";
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${encodeURIComponent(modules)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    const text = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json; charset=utf-8").send(text);
  } catch (error) {
    res.status(502).json({ error: "Yahoo fundamentals proxy failed", detail: String(error.message || error) });
  }
}
