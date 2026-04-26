module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const date = req.query.date;
  const stockNo = req.query.stockNo;
  if (!date || !stockNo) {
    res.status(400).json({ error: "Missing date or stockNo" });
    return;
  }

  const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${encodeURIComponent(date)}&stockNo=${encodeURIComponent(stockNo)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    const text = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json; charset=utf-8").send(text);
  } catch (error) {
    res.status(502).json({ error: "TWSE stock day proxy failed", detail: String(error.message || error) });
  }
}
