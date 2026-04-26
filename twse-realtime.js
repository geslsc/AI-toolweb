module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const code = String(req.query.code || "").trim();
  if (!code) {
    res.status(400).json({ error: "Missing code" });
    return;
  }

  const exCh = `tse_${code}.tw|otc_${code}.tw`;
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(exCh)}&json=1&delay=0`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://mis.twse.com.tw/stock/fibest.jsp",
        "Accept": "application/json, text/plain, */*"
      }
    });

    if (!response.ok) {
      res.status(response.status).json({ error: `TWSE realtime HTTP ${response.status}` });
      return;
    }

    const payload = await response.json();
    const list = Array.isArray(payload?.msgArray) ? payload.msgArray : [];
    const item = list.find((x) => x && x.c === code) || list[0];

    if (!item) {
      res.status(404).json({ error: "TWSE realtime no data" });
      return;
    }

    const priceRaw = item.z && item.z !== "-" ? item.z : item.y;
    const volumeRaw = item.v && item.v !== "-" ? item.v : item.tv;
    const timeRaw = item.tlong || item.d ? Number(item.tlong || `${item.d}${item.t || "000000"}000`) : null;

    const price = Number(String(priceRaw || "").replaceAll(",", ""));
    const volume = Number(String(volumeRaw || "").replaceAll(",", ""));
    const marketTime = Number.isFinite(timeRaw) && timeRaw > 0
      ? (String(timeRaw).length >= 13 ? timeRaw : timeRaw * 1000)
      : null;

    if (!Number.isFinite(price) || price <= 0) {
      res.status(404).json({ error: "TWSE realtime invalid price" });
      return;
    }

    res.status(200).json({
      code,
      price,
      volume: Number.isFinite(volume) && volume >= 0 ? volume : null,
      marketTime
    });
  } catch (error) {
    res.status(502).json({ error: "TWSE realtime proxy failed", detail: String(error.message || error) });
  }
};
