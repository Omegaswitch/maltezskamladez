// The news sites that share one set of accounts (the main site's database, Better Auth): who may publish where.
// The same file is in both repositories (maltezskyrad and maltezskamladez); each api/news.js says which site it is (HERE).
// A person's choice is kept in user_sites ("main", "cmm" or "both"; no row = "main"). The Hlavní správce (owner) may publish on both.
// When maltezskyrad.cz is handed over, the editor addresses change to www.maltezskyrad.cz and cmm.maltezskyrad.cz.
const SITES = {
  main: { editor: "https://www.orderofmalta.cz/pridat-aktualitu/" },
  cmm: { editor: "https://cmm.orderofmalta.cz/pridat-aktualitu/" },
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
