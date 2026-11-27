// The news sites that share one set of accounts (the main site's database, Better Auth): who may publish where.
// The same file is in both repositories (maltezskyrad and maltezskamladez); each api/news.js says which site it is (HERE).
// A person's choice is kept in user_sites ("main", "cmm" or "both"; no row = "main"). The Hlavní správce (owner) may publish on both.
// orderofmalta.cz and cmm.orderofmalta.cz redirect to these addresses (since the move to maltezskyrad.cz).
const SITES = {
  main: { editor: "https://www.maltezskyrad.cz/pridat-aktualitu/" },
  cmm: { editor: "https://cmm.maltezskyrad.cz/pridat-aktualitu/",
    // its e-mail letterhead (api/_mail.js frame(…, "cmm")), for invitations the main site sends to people of Mládež;
    // the same data as maltezskamladez content/site.json (names, contact) and its header images /img/email-header-<lang>.jpg
    letterhead: {"origin": "https://cmm.maltezskyrad.cz", "host": "cmm.maltezskyrad.cz", "names": {"cs": {"order": "Suverénní vojenský špitální řád svatého Jana Jeruzalémského, z Rhodu a z Malty", "orderActivities": "Maltézský řád", "entity": "Česká maltézská mládež", "lockup": "Česká maltézská mládež"}, "en": {"order": "Sovereign Military Hospitaller Order of St. John of Jerusalem of Rhodes and of Malta", "orderActivities": "Order of Malta", "entity": "Czech Maltese Youth", "lockup": "Czech Maltese Youth"}, "fr": {"order": "Ordre Souverain Militaire et Hospitalier de Saint-Jean de Jérusalem de Rhodes et de Malte", "orderActivities": "Ordre de Malte", "entity": "Jeunesse maltaise tchèque", "lockup": "Jeunesse maltaise tchèque"}, "it": {"order": "Sovrano Militare Ordine Ospedaliero di San Giovanni di Gerusalemme di Rodi e di Malta", "orderActivities": "Ordine di Malta", "entity": "Gioventù maltese ceca", "lockup": "Gioventù maltese ceca"}, "de": {"order": "Souveräner Ritter- und Hospitalorden vom Heiligen Johannes von Jerusalem von Rhodos und von Malta", "orderActivities": "Malteserorden", "entity": "Tschechische Malteserjugend", "lockup": "Tschechische Malteserjugend"}}, "contact": {"legalName": "Česká maltézská mládež, z.s.", "ico": "06519555", "address": "Velkopřevorské náměstí 485/4, Malá Strana, 118 00 Praha 1", "addressIntl": "Velkopřevorské náměstí 485/4, Malá Strana, 118 00 Prague 1, Czech Republic", "email": "mladez@maltezskamladez.cz", "phones": ["+420 724 047 401", "+420 607 827 014"]}} },
};
const CHOICES = ["main", "cmm", "both"];
const TABLE = "create table if not exists user_sites (user_id text primary key, sites text not null default 'main')";

async function sitesOf(pool, userId) {
  try { return (await pool.query("select sites from user_sites where user_id = $1", [userId])).rows[0]?.sites || "main"; }
  catch { return "main"; }  // the table appears with the first choice made in Přístupy
}
const mayPublish = (sites, here) => sites === "both" || sites === here;
// where to send someone who opened the other site's editor
const editorFor = (sites) => SITES[sites === "cmm" ? "cmm" : "main"].editor;

module.exports = { SITES, CHOICES, TABLE, sitesOf, mayPublish, editorFor };
