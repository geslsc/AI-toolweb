module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const symbols = req.query.symbols;
  if (!symbols) {
    res.status(400).json({ error: "Missing symbols" });
    return;
  }

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    const text = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json; charset=utf-8").send(text);
  } catch (error) {
    res.status(502).json({ error: "Yahoo quote proxy failed", detail: String(error.message || error) });
  }
};
