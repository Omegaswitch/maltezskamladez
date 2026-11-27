// The one look of every e-mail the site sends (sign-in, invitations, news notices, GDPR forms) — the same design as the
// nomination portal's e-mails (pmmbohemia.eu, src/server/mail.ts): the website's frame — red top bar, the banner with the
// Grand Priory's lockup (static/img/email-header-<lang>.jpg, rendered from the site header in each language), the graphite menu band, then the
// grey footer (full name, legal name, IČO, seat, contact) and the red footer. Table layout and inline styles for Gmail and
// Outlook; Georgia and Arial stand in for EB Garamond and Asap, which e-mail programs do not load.
const { names: ALL_NAMES, contact: C } = require("../content/site.json");
// the letterhead follows the language of the body: banner, names, footer lines and links (cs, en, fr, it, de)
const L = {
  cs: { home: "", privacy: "/ochrana-osobnich-udaju/", auto: "Zprávu odeslal web automaticky.", main: "Hlavní web", priv: "Ochrana osobních údajů", id: "IČO" },
  en: { home: "en/", privacy: "/en/privacy/", auto: "This message was sent automatically by the website.", main: "Main website", priv: "Privacy", id: "Reg. No." },
  fr: { home: "fr/", privacy: "/fr/confidentialite/", auto: "Ce message a été envoyé automatiquement par le site.", main: "Site principal", priv: "Confidentialité", id: "N° d’identification" },
  it: { home: "it/", privacy: "/it/privacy/", auto: "Messaggio inviato automaticamente dal sito.", main: "Sito principale", priv: "Privacy", id: "N. di registrazione" },
  de: { home: "de/", privacy: "/de/datenschutz/", auto: "Diese Nachricht wurde automatisch von der Website versandt.", main: "Hauptwebsite", priv: "Datenschutz", id: "Reg.-Nr." },
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// images need a full address
const ORIGIN = (() => { try { return new URL(process.env.BETTER_AUTH_URL).origin; } catch { return "https://www.maltezskyrad.cz"; } })();
const SANS = "font-family:Arial,'Segoe UI',sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

const frame = (body, lang = "cs") => { const lg = L[lang] ? lang : "cs", t = L[lg], NAMES = ALL_NAMES[lg] || ALL_NAMES.cs; return (
  `<!doctype html><html lang="${lg}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
  `<style>h1,h2,h3{font-family:${SERIF};font-weight:normal;color:#111111}</style></head>` +
  `<body style="margin:0;padding:0;background:#f3f3f3">` +
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f3"><tr><td align="center" style="padding:16px 8px">` +
  `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;${SANS}">` +
  `<tr><td style="background:#e31a18;color:#ffffff;font-size:12px;font-weight:bold;padding:9px 24px">${esc(NAMES.orderActivities)} · ${esc(NAMES.entity)}</td></tr>` +
  `<tr><td style="padding:0;line-height:0"><a href="${ORIGIN}/${t.home}"><img src="${ORIGIN}/img/email-header-${lg}.jpg" width="600" alt="${esc(NAMES.lockup)}" style="display:block;width:100%;max-width:600px;height:auto;border:0"></a></td></tr>` +
  `<tr><td style="background:#454545;height:10px;line-height:10px;font-size:0">&nbsp;</td></tr>` +
  `<tr><td style="padding:28px 32px 18px;color:#333333;font-size:16px;line-height:1.6">${body}</td></tr>` +
  // the website's footer: full name, then the legal name, IČO and seat a legal person states in its letters
  `<tr><td style="border-top:1px solid #c7c7c7;padding:16px 32px;font-size:13px;line-height:1.5;color:#3d3d3d">` +
  `<p style="margin:0 0 6px;font-weight:bold;color:#111111">${esc(NAMES.order)} – ${esc(NAMES.entity)}</p>` +
  `<p style="margin:0 0 6px">${esc(C.legalName)}, ${esc(t.id)} ${esc(C.ico)} · ${esc(lg === "cs" ? C.address : C.addressIntl || C.address)} · <a href="mailto:${esc(C.email)}" style="color:#c80e00">${esc(C.email)}</a> · ${C.phones.map(esc).join(" · ")}</p>` +
  `<p style="margin:0">${esc(t.auto)}</p></td></tr>` +
  `<tr><td style="background:#e31a18;color:#ffffff;padding:16px 32px;font-size:13px">${esc(t.main)}: <a href="${ORIGIN}/${t.home}" style="color:#ffffff">www.maltezskyrad.cz</a> · <a href="${ORIGIN}${t.privacy}" style="color:#ffffff">${esc(t.priv)}</a></td></tr>` +
  `</table></td></tr></table></body></html>`); };

const button = (url, label) =>
  `<p style="margin:24px 0"><a href="${esc(url)}" style="display:inline-block;padding:12px 26px;background:#e31a18;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:2px">${label}</a></p>`;

module.exports = { frame, button, esc, ORIGIN };
