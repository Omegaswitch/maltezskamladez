// /api/map/?lat=…&lon=…&sig=… — a small PNG map (560 × 260) of the approximate place of a sign-in, for the alert e-mail
// (api/_sessions.mjs). E-mail clients show no live maps, so the tiles (CARTO light, © OpenStreetMap) are put together here,
// with a shaded circle for "roughly here" and a red dot. Signed with BETTER_AUTH_SECRET, so it is no open tile proxy.
// Plain Node: a minimal PNG reader (8-bit tiles) and writer, no image library.
const zlib = require("node:zlib");
const crypto = require("node:crypto");

const W = 560, H = 260, Z = 10, R = 60;  // at zoom 10 a pixel is ~100 m in Central Europe: the circle is ~6 km
const sign = (lat, lon) => crypto.createHmac("sha256", process.env.BETTER_AUTH_SECRET || "").update(`map:${lat},${lon}`).digest("base64url").slice(0, 16);

const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

function decode(buf) {  // → { w, h, rgb } for grey/RGB/palette/RGBA tiles, 1–16 bits (CARTO packs sparse tiles into 1–4-bit palettes)
  let p = 8, w, h, depth, type, pal, idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), t = buf.toString("latin1", p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (t === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; type = d[9]; if (d[12]) throw new Error("png interlaced"); }
    else if (t === "PLTE") pal = d;
    else if (t === "IDAT") idat.push(d);
    p += 12 + len;
  }
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type], bpp = Math.max(1, (ch * depth) >> 3), stride = Math.ceil((w * ch * depth) / 8);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, row = y * stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? px[row + i - bpp] : 0, b = y ? px[row - stride + i] : 0, c = y && i >= bpp ? px[row - stride + i - bpp] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      px[row + i] = (raw[src + i] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f]) & 255;
    }
  }
  // sample k of pixel i as 0–255 (a palette index stays an index)
  const at = (i, k) => {
    if (depth === 8) return px[Math.floor(i / w) * stride + (i % w) * ch + k];
    if (depth === 16) return px[Math.floor(i / w) * stride + ((i % w) * ch + k) * 2];
    const y = Math.floor(i / w), bit = ((i % w) * ch + k) * depth, v = (px[y * stride + (bit >> 3)] >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
    return type === 3 ? v : Math.round((v * 255) / ((1 << depth) - 1));
  };
  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const v = at(i, 0);
    const [r, g, b] = type === 3 ? [pal[v * 3], pal[v * 3 + 1], pal[v * 3 + 2]] : type === 0 || type === 4 ? [v, v, v] : [v, at(i, 1), at(i, 2)];
    rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b;
  }
  return { w, h, rgb };
}

function encode(w, h, rgb) {
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const chunk = (t, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(t, 4, "latin1"); d.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length); return b; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

async function render(lat, lon) {
  const n = 256 * 2 ** Z, rad = (lat * Math.PI) / 180;
  const cx = ((lon + 180) / 360) * n, cy = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
  const left = Math.round(cx - W / 2), top = Math.round(cy - H / 2), out = Buffer.alloc(W * H * 3, 0xee);
  const jobs = [];
  for (let ty = Math.floor(top / 256); ty <= Math.floor((top + H - 1) / 256); ty++)
    for (let tx = Math.floor(left / 256); tx <= Math.floor((left + W - 1) / 256); tx++) jobs.push((async () => {
      const r = await fetch(`https://${"abcd"[(tx + ty) & 3]}.basemaps.cartocdn.com/light_all/${Z}/${tx}/${ty}.png`, { headers: { "User-Agent": "maltezskyrad.cz sign-in alert map" } });
      if (!r.ok) return;
      const t = decode(Buffer.from(await r.arrayBuffer()));
      for (let y = 0; y < 256; y++) {
        const oy = ty * 256 + y - top; if (oy < 0 || oy >= H) continue;
        for (let x = 0; x < 256; x++) {
          const ox = tx * 256 + x - left; if (ox < 0 || ox >= W) continue;
          const s = ((y * t.w + x) * 3), d = (oy * W + ox) * 3; out[d] = t.rgb[s]; out[d + 1] = t.rgb[s + 1]; out[d + 2] = t.rgb[s + 2];
        }
      }
    })());
  await Promise.all(jobs);
  // "roughly here": a shaded red circle with a thin ring, and the dot in the middle
  const mx = cx - left, my = cy - top;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - mx, y - my), i = (y * W + x) * 3;
    const mix = (a, c) => { out[i] = out[i] * (1 - a) + c[0] * a; out[i + 1] = out[i + 1] * (1 - a) + c[1] * a; out[i + 2] = out[i + 2] * (1 - a) + c[2] * a; };
    if (d <= 6) mix(1, [227, 24, 24]); else if (d <= 8.5) mix(1, [255, 255, 255]);
    else if (d <= R) mix(Math.abs(d - R) < 1.2 ? 0.55 : 0.12, [227, 24, 24]);
  }
  return encode(W, H, out);
}

module.exports = async (req, res) => {
  const q = new URL(req.url, "http://local").searchParams, lat = +q.get("lat"), lon = +q.get("lon");
  if (!(Math.abs(lat) < 85 && Math.abs(lon) <= 180) || q.get("sig") !== sign(q.get("lat"), q.get("lon"))) { res.statusCode = 404; return res.end(); }
  try {
    const png = await render(lat, lon);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.end(png);
  } catch (e) { console.log("map:", e.message); res.statusCode = 502; res.end(); }
};
module.exports.sign = sign;
module.exports.render = render;
module.exports.decode = decode;
module.exports.encode = encode;
