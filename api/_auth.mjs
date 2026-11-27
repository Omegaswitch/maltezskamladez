// Better Auth for /pridat-aktualitu/: e-mail + password sign-in, sessions and roles (editor/admin) kept in Postgres.
// Files starting with "_" are not routes on Vercel; api/auth/[...all].js serves this at /api/auth/*.
// Env: DATABASE_URL (Postgres, e.g. Neon), BETTER_AUTH_SECRET (long random string), BETTER_AUTH_URL (site origin),
//      RESEND_API_KEY and MAIL_FROM for the e-mails below.
// Nobody can sign themselves up: an admin adds a co-worker's e-mail, the co-worker gets a link and sets a password.
// With RESEND_API_KEY set, signing in on a new device or browser also asks for a code sent by e-mail; that browser
// is then trusted for 30 days. Without it there are no codes (they could not be delivered) and links go to the log.
import { betterAuth } from "better-auth";
import { admin, twoFactor } from "better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import pg from "pg";
import mailLook from "./_mail.js";
import { authHooks } from "./_authlog.mjs";
import { sessionsPlugin } from "./_sessions.mjs";
import SITES from "./_sites.js";
const { frame, button, esc } = mailLook;

// Roles: "owner" may also add, remove and reset people (chosen admins only); "admin" may change any post; "editor" their own.
const ac = createAccessControl(defaultStatements);
// "members" may only use the member database at /sprava/ (no news).
const roles = { owner: ac.newRole(adminAc.statements), admin: ac.newRole({ user: [], session: [] }), editor: ac.newRole({ user: [], session: [] }), members: ac.newRole({ user: [], session: [] }) };

const DAYS = 24 * 3600, MAIL = !!process.env.RESEND_API_KEY;
// the site's address as people see it (BETTER_AUTH_URL), e.g. orderofmalta.cz until maltezskyrad.cz takes over
const SITE = (() => { try { return new URL(process.env.BETTER_AUTH_URL).host.replace(/^www\./, ""); } catch { return "maltezskyrad.cz"; } })();
async function mail(to, subject, body, lang) {
  const html = frame(body, lang);  // the letterhead in the language of the text
  if (!MAIL) return console.log(`auth mail not sent (no RESEND_API_KEY): ${subject} → ${to}`);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM || `Maltézský řád <web@${SITE.split(".").slice(-2).join(".")}>`  /* the verified main domain, also from cmm. */, to, subject, html }),
  });
  if (!r.ok) console.log(`auth mail: resend ${r.status}`);
}

// e-mail texts in the language chosen when the person was added (user.lang)
const T = {
  cs: { news: "psaní aktualit", newsCmm: "psaní aktualit na webu České maltézské mládeže", newsBoth: "psaní aktualit na webech Českého velkopřevorství a České maltézské mládeže", bothCmm: "psaní aktualit na webech Českého velkopřevorství a České maltézské mládeže, správu členské databáze a rozesílání e-mailů", members: "správu členské databáze a rozesílání e-mailů", both: "psaní aktualit, správu členské databáze a rozesílání e-mailů", all: "psaní aktualit, správu členské databáze a rozesílání e-mailů včetně přidávání uživatelů", hello: (n) => `Dobrý den, ${n},`,
    inviteSubject: () => "Pozvánka: přístup na web Českého velkopřevorství", added: (w, s) => `byl(a) jste přidán(a) mezi ty, kdo mají přístup na web Českého velkopřevorství (${s}): ${w}.`,
    create: (e) => `Vytvořte si heslo; potom se přihlásíte tímto e-mailem (${e}) a svým heslem.`, createBtn: "Vytvořit heslo a přihlásit se",
    valid: "Odkaz platí 3 dny. Nejde-li tlačítko otevřít, zkopírujte do prohlížeče tuto adresu:", resetSubject: (s) => `Nastavení hesla – ${s}`,
    reset: (s) => `nové heslo pro přihlášení na ${s} si nastavíte zde:`, resetBtn: "Nastavit heslo", ignore: "Pokud jste o to nežádali, e-mail prosím ignorujte.",
    codeSubject: "Kód pro přihlášení", code: (s) => `Kód pro přihlášení na ${s}:`, codeNote: "Platí 10 minut. Pokud se právě nepřihlašujete, kód nikomu nesdělujte a dejte vědět správci webu.",
    alertSubject: "Přihlášení z nového místa", alertIntro: (s) => `na váš účet na webu ${s} se právě někdo přihlásil z adresy, ze které jste se dosud nepřihlašoval(a):`, when: "Kdy", where: "Přibližné místo", mapNote: "Místo je určené podle IP adresy, proto jen přibližně (často jen město poskytovatele připojení).", mapLink: "Otevřít mapu", ip: "IP adresa", device: "Zařízení", ifYou: "Pokud jste to byl(a) vy, nemusíte nic dělat.", alertBtn: "Nebyl(a) jsem to – nastavit nové heslo", alertNote: "Po nastavení nového hesla se účet odhlásí na všech zařízeních. Odkaz platí 3 dny." },
  en: { news: "writing news posts", newsCmm: "writing news posts on the website of the Czech Maltese Youth", newsBoth: "writing news posts on the websites of the Grand Priory and of the Czech Maltese Youth", bothCmm: "writing news posts on the websites of the Grand Priory and of the Czech Maltese Youth, managing the member database and sending e-mails", members: "managing the member database and sending e-mails", both: "writing news posts, managing the member database and sending e-mails", all: "writing news posts, managing the member database and sending e-mails, including adding users", hello: (n) => `Dear ${n},`,
    inviteSubject: () => "Invitation: access to the website of the Grand Priory of Bohemia", added: (w, s) => `you have been given access to the website of the Grand Priory of Bohemia (${s}) for ${w}.`,
    create: (e) => `Please create your password; you will then sign in with this e-mail address (${e}) and your password.`, createBtn: "Create password and sign in",
    valid: "The link is valid for 3 days. If the button does not work, copy this address into your browser:", resetSubject: (s) => `Set your password – ${s}`,
    reset: (s) => `you can set a new password for ${s} here:`, resetBtn: "Set password", ignore: "If you did not ask for this, please ignore this e-mail.",
    codeSubject: "Sign-in code", code: (s) => `Your sign-in code for ${s}:`, codeNote: "Valid for 10 minutes. If you are not signing in right now, do not share the code and let the site administrator know.",
    alertSubject: "Sign-in from a new place", alertIntro: (s) => `someone has just signed in to your account on ${s} from an address you have not used before:`, when: "When", where: "Approximate place", mapNote: "The place is worked out from the IP address, so it is only approximate (often just the internet provider’s city).", mapLink: "Open the map", ip: "IP address", device: "Device", ifYou: "If this was you, there is nothing to do.", alertBtn: "This wasn’t me – set a new password", alertNote: "Setting a new password signs your account out on every device. The link is valid for 3 days." },
  de: { news: "das Verfassen von Nachrichten", newsCmm: "das Verfassen von Nachrichten auf der Website der Tschechischen Malteserjugend", newsBoth: "das Verfassen von Nachrichten auf den Websites des Großpriorats und der Tschechischen Malteserjugend", bothCmm: "das Verfassen von Nachrichten auf den Websites des Großpriorats und der Tschechischen Malteserjugend, die Verwaltung der Mitgliederdatenbank und den E-Mail-Versand", members: "die Verwaltung der Mitgliederdatenbank und den E-Mail-Versand", both: "das Verfassen von Nachrichten, die Verwaltung der Mitgliederdatenbank und den E-Mail-Versand", all: "das Verfassen von Nachrichten, die Verwaltung der Mitgliederdatenbank und den E-Mail-Versand einschließlich der Benutzerverwaltung", hello: (n) => `Guten Tag, ${n},`,
    inviteSubject: () => "Einladung: Zugang zur Website des Großpriorats von Böhmen", added: (w, s) => `Sie haben Zugang zur Website des Großpriorats von Böhmen (${s}) erhalten: ${w}.`,
    create: (e) => `Bitte legen Sie Ihr Passwort fest; danach melden Sie sich mit dieser E-Mail-Adresse (${e}) und Ihrem Passwort an.`, createBtn: "Passwort festlegen und anmelden",
    valid: "Der Link ist 3 Tage gültig. Falls die Schaltfläche nicht funktioniert, kopieren Sie diese Adresse in Ihren Browser:", resetSubject: (s) => `Passwort festlegen – ${s}`,
    reset: (s) => `ein neues Passwort für ${s} legen Sie hier fest:`, resetBtn: "Passwort festlegen", ignore: "Falls Sie dies nicht angefordert haben, ignorieren Sie bitte diese E-Mail.",
    codeSubject: "Anmeldecode", code: (s) => `Ihr Anmeldecode für ${s}:`, codeNote: "Gültig 10 Minuten. Wenn Sie sich gerade nicht anmelden, geben Sie den Code nicht weiter und informieren Sie den Administrator.",
    alertSubject: "Anmeldung von einem neuen Ort", alertIntro: (s) => `soeben hat sich jemand von einer bisher nicht verwendeten Adresse bei Ihrem Konto auf ${s} angemeldet:`, when: "Wann", where: "Ungefährer Ort", mapNote: "Der Ort wird aus der IP-Adresse ermittelt und ist daher nur ungefähr (oft nur die Stadt des Internetanbieters).", mapLink: "Karte öffnen", ip: "IP-Adresse", device: "Gerät", ifYou: "Wenn Sie das waren, ist nichts zu tun.", alertBtn: "Das war ich nicht – neues Passwort festlegen", alertNote: "Mit dem neuen Passwort wird Ihr Konto auf allen Geräten abgemeldet. Der Link ist 3 Tage gültig." },
  fr: { news: "la rédaction des actualités", newsCmm: "la rédaction des actualités sur le site de la Jeunesse maltaise tchèque", newsBoth: "la rédaction des actualités sur les sites du Grand Prieuré et de la Jeunesse maltaise tchèque", bothCmm: "la rédaction des actualités sur les sites du Grand Prieuré et de la Jeunesse maltaise tchèque, la gestion de la base des membres et l’envoi d’e-mails", members: "la gestion de la base des membres et l’envoi d’e-mails", both: "la rédaction des actualités, la gestion de la base des membres et l’envoi d’e-mails", all: "la rédaction des actualités, la gestion de la base des membres et l’envoi d’e-mails, y compris la gestion des utilisateurs", hello: (n) => `Bonjour ${n},`,
    inviteSubject: () => "Invitation : accès au site du Grand Prieuré de Bohême", added: (w, s) => `un accès au site du Grand Prieuré de Bohême (${s}) vous a été accordé pour ${w}.`,
    create: (e) => `Veuillez créer votre mot de passe ; vous vous connecterez ensuite avec cette adresse (${e}) et votre mot de passe.`, createBtn: "Créer le mot de passe et se connecter",
    valid: "Le lien est valable 3 jours. Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :", resetSubject: (s) => `Définir le mot de passe – ${s}`,
    reset: (s) => `vous pouvez définir un nouveau mot de passe pour ${s} ici :`, resetBtn: "Définir le mot de passe", ignore: "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.",
    codeSubject: "Code de connexion", code: (s) => `Votre code de connexion pour ${s} :`, codeNote: "Valable 10 minutes. Si vous n’êtes pas en train de vous connecter, ne communiquez ce code à personne et prévenez l’administrateur.",
    alertSubject: "Connexion depuis un nouveau lieu", alertIntro: (s) => `quelqu’un vient de se connecter à votre compte sur ${s} depuis une adresse que vous n’aviez pas encore utilisée :`, when: "Quand", where: "Lieu approximatif", mapNote: "Le lieu est déduit de l’adresse IP, il n’est donc qu’approximatif (souvent la ville du fournisseur d’accès).", mapLink: "Ouvrir la carte", ip: "Adresse IP", device: "Appareil", ifYou: "Si c’était vous, il n’y a rien à faire.", alertBtn: "Ce n’était pas moi – définir un nouveau mot de passe", alertNote: "Le nouveau mot de passe déconnecte votre compte sur tous les appareils. Le lien est valable 3 jours." },
  it: { news: "la redazione delle notizie", newsCmm: "la redazione delle notizie sul sito della Gioventù maltese ceca", newsBoth: "la redazione delle notizie sui siti del Gran Priorato e della Gioventù maltese ceca", bothCmm: "la redazione delle notizie sui siti del Gran Priorato e della Gioventù maltese ceca, la gestione dell’archivio dei membri e l’invio di e-mail", members: "la gestione dell’archivio dei membri e l’invio di e-mail", both: "la redazione delle notizie, la gestione dell’archivio dei membri e l’invio di e-mail", all: "la redazione delle notizie, la gestione dell’archivio dei membri e l’invio di e-mail, inclusa la gestione degli utenti", hello: (n) => `Gentile ${n},`,
    inviteSubject: () => "Invito: accesso al sito del Gran Priorato di Boemia", added: (w, s) => `Le è stato concesso l’accesso al sito del Gran Priorato di Boemia (${s}) per ${w}.`,
    create: (e) => `Crei la Sua password; poi accederà con questo indirizzo e-mail (${e}) e la Sua password.`, createBtn: "Crea la password e accedi",
    valid: "Il link è valido 3 giorni. Se il pulsante non funziona, copi questo indirizzo nel browser:", resetSubject: (s) => `Impostazione della password – ${s}`,
    reset: (s) => `può impostare una nuova password per ${s} qui:`, resetBtn: "Imposta la password", ignore: "Se non ha richiesto questa operazione, ignori questa e-mail.",
    codeSubject: "Codice di accesso", code: (s) => `Il Suo codice di accesso per ${s}:`, codeNote: "Valido 10 minuti. Se non sta accedendo in questo momento, non comunichi il codice a nessuno e avvisi l’amministratore.",
    alertSubject: "Accesso da un nuovo luogo", alertIntro: (s) => `qualcuno ha appena effettuato l’accesso al Suo account su ${s} da un indirizzo che finora non aveva usato:`, when: "Quando", where: "Luogo approssimativo", mapNote: "Il luogo è ricavato dall’indirizzo IP, quindi è solo approssimativo (spesso la città del fornitore di connessione).", mapLink: "Apri la mappa", ip: "Indirizzo IP", device: "Dispositivo", ifYou: "Se è stato Lei, non deve fare nulla.", alertBtn: "Non sono stato io – imposta una nuova password", alertNote: "Con la nuova password l’account viene disconnesso su tutti i dispositivi. Il link è valido 3 giorni." },
};

// only the origin counts: a path left in BETTER_AUTH_URL (e.g. …/pridat-aktualitu/) would move every endpoint and answer 404
const ORIGIN = (() => { try { return new URL(process.env.BETTER_AUTH_URL).origin; } catch { return undefined; } })();

// a new password needs 10+ characters, lower and upper case, a digit and a symbol (the forms check the same live)
const STRONG = (p) => p.length >= 10 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9\s]/.test(p);
const NEW_PW = { "/reset-password": "newPassword", "/change-password": "newPassword", "/admin/create-user": "password", "/admin/set-user-password": "newPassword" };
const strength = createAuthMiddleware(async (ctx) => {
  const p = ctx.body?.[NEW_PW[ctx.path]];
  if (typeof p === "string" && p && !STRONG(p)) throw new APIError("BAD_REQUEST", { code: "PASSWORD_TOO_WEAK", message: "PASSWORD_TOO_WEAK" });
});

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { plugin, put } = authHooks(pool);  // sign-in events into audit_log

// a sign-in from a new IP address: tell the person, with a "that wasn't me" password link (api/_sessions.mjs)
const LOC = { cs: "cs-CZ", en: "en-GB", de: "de-DE", fr: "fr-FR", it: "it-IT" };
async function alert(user, a) {
  const t = T[user.lang] || T.cs, row = (k, v) => v ? `<tr><td style="padding:2px 16px 2px 0;color:#5f5f5f">${k}</td><td>${esc(v)}</td></tr>` : "";
  const when = a.when.toLocaleString(LOC[user.lang] || "cs-CZ", { timeZone: "Europe/Prague", dateStyle: "long", timeStyle: "short" });
  await put(`${user.name} <${user.email}>`, "new ip alert", `${a.ip} ${a.place}`);
  return mail(user.email, `${t.alertSubject} – ${SITE}`, `<p>${t.hello(esc(user.name))}</p><p>${t.alertIntro(esc(SITE))}</p>
    <table style="border-collapse:collapse;margin:0 0 16px">${row(t.when, when)}${row(t.where, a.place)}${row(t.ip, a.ip)}${row(t.device, a.device)}</table>
    ${a.geo ? `<p style="margin:0 0 4px"><a href="${a.geo.osm}"><img src="${a.geo.img}" width="560" height="260" alt="${esc(a.place || t.where)}" style="display:block;width:100%;max-width:560px;height:auto;border:1px solid #c7c7c7"></a></p>
    <p style="color:#5f5f5f;font-size:13px;margin:0 0 16px">${t.mapNote} <a href="${a.geo.osm}" style="color:#e31818">${t.mapLink}</a> · © OpenStreetMap, © CARTO</p>` : ""}
    <p>${t.ifYou}</p>${button(a.link, t.alertBtn)}<p style="color:#5f5f5f;font-size:14px">${t.alertNote}</p>`, user.lang);
}

export const auth = betterAuth({
  baseURL: ORIGIN, basePath: "/api/auth",
  database: pool,
  emailAndPassword: {
    enabled: true, disableSignUp: true, minPasswordLength: 10, revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 3 * DAYS,  // the invitation link is also the "forgot password" link
    sendResetPassword: async ({ user, url }) => {
      if (!MAIL) console.log(`password link for ${user.email}: ${url}`);  // only the project's owners can read the log
      // no password yet: the person was just added, so this is the invitation; otherwise a forgotten password
      const invited = !(await pool.query(`select 1 from "account" where "userId" = $1 and "providerId" = 'credential' and "password" is not null`, [user.id])).rowCount;
      const t = T[user.lang] || T.cs, sites = await SITES.sitesOf(pool, user.id);  // which news site(s): api/_sites.js
      const news = { main: t.news, cmm: t.newsCmm, both: t.newsBoth }[sites] || t.news;
      // what the role gives access to: editor news only; Správce news + member database (not when Mládež only); owner everything
      const what = user.role === "members" ? t.members : user.role === "owner" ? t.all : user.role === "admin" ? ({ main: t.both, both: t.bothCmm }[sites] || news) : news;
      const note = `<p style="color:#5f5f5f;font-size:14px">${t.valid}<br>${esc(url)}</p>`;
      if (invited) await mail(user.email, t.inviteSubject(what),
        `<p>${t.hello(esc(user.name))}</p><p>${t.added(what, esc(SITE))}</p><p>${t.create(esc(user.email))}</p>${button(url, t.createBtn)}${note}`, user.lang);
      else await mail(user.email, t.resetSubject(SITE),
        `<p>${t.hello(esc(user.name))}</p><p>${t.reset(esc(SITE))}</p>${button(url, t.resetBtn)}${note}<p style="color:#5f5f5f;font-size:14px">${t.ignore}</p>`, user.lang);
    },
  },
  // language of the invitation and of later e-mails, chosen by whoever adds the person
  user: { additionalFields: { lang: { type: "string", required: false, defaultValue: "cs" } } },
  session: { expiresIn: 30 * DAYS, updateAge: DAYS },  // stays signed in; renewed while used
  // counted in Postgres, not in memory: each Vercel instance has its own memory, so a memory limit hardly slows guessing
  rateLimit: { enabled: true, window: 60, max: 10, storage: "database" },
  // names are set by an admin; letting people rename themselves would let them pose as a co-worker
  disabledPaths: ["/update-user"],
  hooks: { before: strength },
  // the site answers on orderofmalta.cz until maltezskyrad.cz takes over, with and without www: accept all four
  trustedOrigins: ["orderofmalta.cz", "maltezskyrad.cz"].flatMap((d) => [`https://${d}`, `https://www.${d}`, `https://cmm.${d}`]),  // cmm.: Česká maltézská mládež (same accounts, api/_sites.js)
  // everyone added gets e-mail codes on new devices (existing people: see scripts/auth-schema.sql)
  databaseHooks: MAIL ? { user: { create: { before: async (user) => ({ data: { ...user, twoFactorEnabled: true } }) } } } : undefined,
  plugins: [
    admin({ ac, roles, defaultRole: "editor", adminRoles: ["owner"] }),
    ...(MAIL ? [twoFactor({
      trustDeviceMaxAge: 30 * DAYS,
      otpOptions: {
        period: 10,  // minutes
        sendOTP: async ({ user, otp }) => { await put(`${user.name} <${user.email}>`, "2fa sent"); const t = T[user.lang] || T.cs; return mail(user.email, `${t.codeSubject}: ${otp}`,
          `<p>${t.code(esc(SITE))}</p><p style="font-size:30px;font-weight:bold;letter-spacing:.14em;color:#e31a18">${otp}</p><p>${t.codeNote}</p>`, user.lang); },
      },
    })] : []),
    sessionsPlugin({ pool, alert }),
    plugin,  // last: sees the result of the other plugins
  ],
});
