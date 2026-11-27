// /pridat-aktualitu/: sign in, then write a new post or edit / delete an existing one, and keep the calendar of
// events (api/news.js). Photos are shrunk on this device before upload (1600 px on the long side, WebP or JPEG,
// which also drops location data from the camera) and PDFs over 1 MB are compressed with Ghostscript (WebAssembly);
// every file goes up in its own request. The same file runs on every Order of Malta site.
(function () {
  var root = document.getElementById("news-app");
  if (!root) return;
  var API = "/api/news";
  var $ = function (s) { return root.querySelector(s); };
  // ---- language: cs (default), en, de, fr, it. The choice is kept in localStorage "sprava-lang", the same key as the members admin (/sprava/).
  // Static texts carry data-i18n (text), data-i18n-html, data-i18n-ph / -aria / -alt / -title (attributes); their Czech text in the markup is the default without JS.
  // To add a string: add the key to every language below, then use data-i18n="key" in the markup (build.py) or T("key") here.
  // i18n:begin
  var I18N = {
    cs: {
      "page.title": "Přidat aktualitu",
      "page.lead": "Aktualita se po zveřejnění objeví na webu v sekci <a href=\"/aktuality/\">Aktuality</a> asi za minutu.",
      "login.title": "Přihlášení",
      "login.name": "Jméno",
      "login.email": "E-mail",
      "login.password": "Heslo",
      "login.submit": "Přihlásit se",
      "login.forgot": "Nemám heslo nebo jsem ho zapomněl(a)",
      "code.title": "Kód z e-mailu",
      "code.text": "Přihlašujete se na tomto zařízení nebo v tomto prohlížeči poprvé. Na váš e-mail jsme poslali šestimístný kód (platí 10 minut).",
      "code.label": "Kód",
      "code.verify": "Ověřit",
      "code.again": "Poslat nový kód",
      "forgot.title": "Nastavení hesla",
      "forgot.text": "Zadejte e-mail, který vám správce webu zapsal. Pošleme na něj odkaz, kterým si heslo nastavíte.",
      "forgot.send": "Poslat odkaz",
      "forgot.back": "Zpět na přihlášení",
      "reset.title": "Nové heslo",
      "pw.next": "Nové heslo <small>(nejméně 10 znaků)</small>",
      "reset.save": "Uložit heslo",
      "pw.confirm": "Nové heslo znovu",
      "pw.mismatch": "Hesla se neshodují.",
      "pw.match": "Hesla se shodují.",
      "pw.show": "Zobrazit heslo",
      "pw.hide": "Skrýt heslo",
      "pw.r.len": "Nejméně 10 znaků",
      "pw.r.lower": "Malé písmeno",
      "pw.r.upper": "Velké písmeno",
      "pw.r.digit": "Číslice",
      "pw.r.symbol": "Symbol, např. , . ? !",
      "pw.weak": "Heslo nesplňuje požadavky: nejméně 10 znaků, malé i velké písmeno, číslice a symbol.",
      "set.title": "Nastavení",
      "set.lang": "Jazyk",
      "set.langNote": "Jazyk Správy i e-mailů, které Vám web posílá (pozvánky, kódy, upozornění).",
      "set.alerts": "Upozornit mě e-mailem na přihlášení z nové adresy",
      "set.saved": "Uloženo.",
      "ses.title": "Přihlášená zařízení",
      "ses.text": "Zařízení, na kterých jste právě přihlášen(a). Neznámé zařízení odhlaste a změňte si heslo.",
      "ses.others": "Odhlásit všechna ostatní zařízení",
      "ses.out": "Odhlásit",
      "ses.here": "toto zařízení",
      "ses.since": "přihlášení {d}",
      "ses.seen": "naposledy {d}",
      "ses.none": "Jiná zařízení nejsou přihlášená.",
      "ses.done": "Ostatní zařízení jsou odhlášená.",
      "who.in": "Přihlášen(a):",
      "who.members": "Členská databáze",
      "who.out": "Odhlásit",
      "help.summary": "Jak přidat aktualitu <small>– krátký návod</small>",
      "help.s1.t": "Titulek, datum a kategorie",
      "help.s1.p": "Napište titulek, zkontrolujte datum a zaškrtněte kategorii. S budoucím datem se aktualita zveřejní sama až ten den. <b>Koncept</b> ji uloží, ale nezveřejní.",
      "help.s1.a": "Formulář s titulkem, datem zveřejnění, kategoriemi a volbou Koncept",
      "help.s2.t": "Text a fotografie",
      "help.s2.p": "Text se skládá z oddílů. Tlačítky <b>＋ Text</b> a <b>＋ Fotografie</b> přidáte další oddíl, šipkami změníte pořadí. V liště nad textem je nadpis, tučné písmo, kurzíva, seznamy, citace a odkaz.",
      "help.s2.a": "Editor textu s lištou formátování a tlačítky pro přidání textu a fotografie",
      "help.s3.t": "Hlavní fotografie, přílohy a zveřejnění",
      "help.s3.p": "Můžete přidat hlavní fotografii a přílohy ke stažení (PDF, fotografie); zmenší se samy. Tlačítkem <b>Zveřejnit</b> aktualitu odešlete. Na webu se objeví asi za minutu.",
      "help.s3.a": "Pole Perex, výběr hlavní fotografie, přílohy ke stažení a tlačítko Zveřejnit",
      "help.s4.t": "Úprava a smazání",
      "help.s4.p": "Na kartě <b>Upravit nebo smazat</b> najdete všechny aktuality. Upravit a smazat můžete své vlastní; správce všechny. Změna se na webu projeví asi za minutu.",
      "help.s4.a": "Seznam aktualit s hledáním a tlačítky Upravit a Smazat",
      "help.note": "Rozepsaný text se průběžně ukládá v tomto prohlížeči, takže o něj nepřijdete, ani když stránku zavřete. Na kartě <b>Účet a uživatelé</b> si změníte heslo. Návod zavřete kliknutím na jeho nadpis; kdykoli ho tak znovu otevřete.",
      "tabs.label": "Co chcete udělat",
      "tab.new": "Nová aktualita",
      "tab.list": "Upravit nebo smazat",
      "tab.events": "Události",
      "tab.users": "Účet a uživatelé",
      "list.search": "Hledat aktualitu",
      "list.searchPh": "Část titulku nebo rok…",
      "list.hint": "Nové a upravené aktuality se v seznamu objeví asi za minutu, až se web znovu sestaví. Koncepty a naplánované aktuality jsou označené; smazat lze jen vlastní aktuality (správce všechny).",
      "pwf.title": "Změnit moje heslo",
      "pwf.current": "Současné heslo",
      "pwf.submit": "Změnit heslo",
      "uf.title": "Přidat uživatele",
      "uf.name": "Jméno a příjmení",
      "uf.password": "Heslo <small>(nechte prázdné: uživatel dostane e-mailem odkaz a heslo si nastaví sám)</small>",
      "uf.role": "Role",
      "role.editor": "Redaktor – píše a upravuje své aktuality; bez členské databáze",
      "role.admin": "Správce – všechny aktuality a členská databáze; nepřidává ani neupravuje uživatele",
      "role.owner": "Hlavní správce – smí vše, i přidávat a upravovat uživatele",
      "role.members": "Jen členská databáze – bez aktualit",
      "uf.lang": "Jazyk pozvánky a e-mailů",
      "uf.add": "Přidat",
      "uf.list": "Uživatelé",
      "ev.title": "Událost v kalendáři",
      "ev.editing": "Upravujete:",
      "ev.cancel": "Zrušit úpravy",
      "ev.name": "Název <i aria-hidden=\"true\">*</i>",
      "ev.start": "Začátek <i aria-hidden=\"true\">*</i>",
      "ev.end": "Konec <small>(nepovinné)</small>",
      "ev.allday": "Celý den",
      "ev.place": "Místo <small>(nepovinné)</small>",
      "ev.desc": "Popis <small>(nepovinné; prázdný řádek odděluje odstavce)</small>",
      "ev.add": "Přidat událost",
      "ev.list": "Události",
      "ed.editing": "Upravujete:",
      "ed.readonly": "Tuto aktualitu napsal někdo jiný; upravit nebo smazat ji může jen autor nebo správce webu.",
      "ed.title": "Titulek <i aria-hidden=\"true\">*</i>",
      "ed.date": "Datum a čas zveřejnění",
      "ed.cats": "Kategorie",
      "ed.draft": "Koncept <small>(uložit, ale zatím nezveřejnit)</small>",
      "ed.pin": "Připnout na úvodní stránku <small>(důležité oznámení)</small>",
      "ed.text": "Text <i aria-hidden=\"true\">*</i>",
      "ed.locked": "Text této starší aktuality obsahuje prvky, které editor neumí (například fotografie s popiskem nebo tabulku). Text proto zůstane beze změny; upravit můžete titulek, datum, kategorie, perex, fotografii a přílohy.",
      "ed.hint": "Text skládejte z oddílů (text, fotografie); pořadí měňte šipkami nebo přetažením. V textu nadpis a podnadpis, tučné písmo, kurzíva, seznamy, citace a odkazy. Dvě a více fotografií za sebou tvoří mřížku a aktualita se objeví i ve fotogalerii. Písmo a barvy jsou dané vzhledem webu.",
      "ed.excerpt": "Perex <small>(nepovinné – krátké shrnutí v přehledu aktualit; jinak se vezme začátek textu)</small>",
      "ed.photo": "Hlavní fotografie <small>(nepovinné – zobrazí se nad textem; zmenší se před odesláním)</small>",
      "ed.pickPhoto": "Vybrat fotografii",
      "ed.attach": "Přílohy ke stažení <small>(PDF nebo fotografie, nejvýše 3 MB na soubor; fotografie i větší PDF se před odesláním zmenší přímo v prohlížeči)</small>",
      "ed.drop": "Přetáhněte soubory sem, nebo",
      "ed.pickFiles": "vyberte soubory",
      "ed.gs": "PDF zmenšuje Ghostscript (licence AGPL) spuštěný v tomto prohlížeči; soubor nikam jinam neodchází. <a href=\"/js/vendor/ghostscript-1.1.0/SOURCE.txt\">Zdroj a licence</a>.",
      "done.back": "Zpět na aktuality",
      "lang.label": "Jazyk",
      "err.login": "E-mail (jméno) nebo heslo nesouhlasí.",
      "err.busy": "Příliš mnoho pokusů. Zkuste to prosím za minutu.",
      "err.session": "Přihlášení vypršelo. Přihlaste se prosím znovu.",
      "err.type": "Lze nahrát jen fotografie (JPG, PNG, WebP) a PDF.",
      "err.size": "Soubor je i po zmenšení příliš velký (nejvýše 3 MB). PDF prosím rozdělte nebo zmenšete jeho obrázky.",
      "err.missing": "Vyplňte prosím titulek, datum a text.",
      "err.config": "Formulář ještě není nastavený (chybí přístupové údaje na serveru).",
      "err.gone": "Tato položka už neexistuje (možná ji mezitím někdo smazal).",
      "err.forbidden": "Tuto položku může upravit nebo smazat jen ten, kdo ji napsal, nebo správce webu.",
      "err.server": "Něco se nepovedlo na straně serveru. Zkuste to prosím za chvíli znovu.",
      "err.2fa": "Pro tuto akci je potřeba přihlášení s kódem z e-mailu. Odhlaste se a přihlaste znovu.",
      "users.elsewhere": "Uživatele přidáváte a jejich přístupy měníte ve Správě → Přístupy (stejné účty jako na hlavním webu).",
      "users.elsewhereLink": "Ve Správě → Přístupy",
      "err.net": "Spojení se nezdařilo. Zkontrolujte připojení k internetu.",
      "who.admin": "správce",
      "link.expired": "Odkaz už neplatí. Nechte si prosím poslat nový.",
      "code.sent": "Kód je na cestě do vaší e-mailové schránky.",
      "code.bad": "Kód nesouhlasí nebo už neplatí. Nechte si poslat nový.",
      "forgot.sent": "Pokud je e-mail zapsaný, přijde na něj během chvíle odkaz (platí 3 dny). Zkontrolujte i nevyžádanou poštu.",
      "reset.done": "Heslo je nastavené. Teď se prosím přihlaste e-mailem a novým heslem.",
      "reset.bad": "Odkaz už neplatí nebo je heslo kratší než 10 znaků.",
      "uf.pwNoMail": "Heslo <small>(nejméně 10 znaků; sdělte ho osobně – e-maily z webu zatím nejsou nastavené)</small>",
      "pw.wrong": "Současné heslo nesouhlasí.",
      "pw.short": "Heslo je příliš krátké (nejméně 10 znaků).",
      "user.exists": "Uživatel s tímto e-mailem už existuje.",
      "pw.changed": "Heslo bylo změněno.",
      "user.added": "Přidáno: {email}",
      "user.linkSent": " – odkaz pro nastavení hesla odešel e-mailem.",
      "role.ownerN": "Hlavní správce",
      "role.adminN": "Správce",
      "role.editorN": "Redaktor",
      "role.membersN": "Jen členská databáze",
      "user.you": "(vy)",
      "user.roleOf": "Role: {name}",
      "user.rename": "Přejmenovat",
      "user.renamePrompt": "Jméno a příjmení:",
      "user.newPw": "Nové heslo",
      "user.newPwPrompt": "Nové heslo pro {name} (nejméně 10 znaků):",
      "user.pwDone": "Heslo změněno.",
      "user.remove": "Odebrat",
      "user.removeAsk": "Odebrat uživatele {name}? Jeho aktuality zůstanou.",
      "user.loadFail": "Seznam se nepodařilo načíst.",
      "list.edit": "Upravit",
      "list.del": "Smazat",
      "list.draft": "koncept",
      "list.scheduled": "naplánováno na {d}",
      "list.pinned": "připnuto na úvodní stránce",
      "list.by": "Přidal(a): {a}",
      "list.none": "Nic nenalezeno.",
      "list.more": "… a dalších {n}. Upřesněte hledání.",
      "list.delAsk": "Opravdu smazat aktualitu „{t}“? Zmizí z webu asi za minutu.",
      "list.deleting": "Maže se…",
      "list.deleted": "Smazáno: {t}. Z webu zmizí asi za minutu.",
      "loading": "Načítá se…",
      "pub.save": "Uložit změny",
      "pub.publish": "Zveřejnit",
      "file.shrinkPdf": "Zmenšuje se PDF…",
      "file.preparing": "Připravuje se…",
      "file.shrinkPhoto": "Zmenšuje se fotografie…",
      "file.uploading": "Nahrává se…",
      "file.done": "Nahráno",
      "file.onSite": "Na webu",
      "file.remove": "Odebrat",
      "file.label": "Název odkazu ke stažení",
      "date.future": "Budoucí datum: aktualita se na webu objeví až v tento den.",
      "blk.add": "Přidat oddíl",
      "blk.addText": "Přidat text",
      "blk.text": "＋ Text",
      "blk.addPhoto": "Přidat fotografii",
      "blk.photo": "＋ Fotografie",
      "blk.photoMore": "＋ Přidat fotografii",
      "blk.drag": "Přetáhnout",
      "blk.up": "Posunout nahoru",
      "blk.down": "Posunout dolů",
      "blk.remove": "Smazat oddíl",
      "blk.removeAsk": "Smazat tento oddíl?",
      "blk.label": "Text oddílu",
      "q.bold": "Tučně",
      "q.italic": "Kurzíva",
      "q.underline": "Podtržení",
      "q.strike": "Přeškrtnutí",
      "q.quote": "Citace",
      "q.link": "Odkaz",
      "q.image": "Vložit fotografii",
      "q.clean": "Zrušit formátování",
      "q.ordered": "Číslovaný seznam",
      "q.bullets": "Odrážky",
      "photo.uploading": "Fotografie se nahrává…",
      "photo.uploadingN": "Fotografie se nahrávají… ({n})",
      "draft.restored": "Obnoven rozepsaný koncept z tohoto prohlížeče.",
      "pub.wait": "Počkejte prosím, až se dokončí nahrávání souborů.",
      "pub.saving": "Ukládá se…",
      "pub.publishing": "Zveřejňuje se…",
      "done.draft": "Uloženo jako koncept",
      "done.scheduled": "Naplánováno",
      "done.saved": "Uloženo",
      "done.published": "Zveřejněno",
      "done.draftText": "Koncept není na webu vidět; zveřejníte ho úpravou (zrušte „Koncept“). Adresa bude: ",
      "done.scheduledText": "Aktualita se na webu objeví v uvedený den (po sestavení webu): ",
      "done.text": "Změna bude na webu asi za minutu: ",
      "ev.past": "proběhlo",
      "ev.upcoming": "nadcházející",
      "ev.none": "Zatím žádné události.",
      "ev.delAsk": "Opravdu smazat událost „{t}“?",
      "ev.deleted": "Smazáno: {t}. Z webu zmizí asi za minutu.",
      "ev.needTitle": "Vyplňte prosím název a začátek události.",
      "ev.endBefore": "Konec události nemůže být před začátkem.",
      "ev.saved": "Uloženo: {t}. Na webu asi za minutu.",
      "ev.added": "Přidáno: {t}. Na webu asi za minutu.",
      "ev.addBtn": "Přidat událost",
      "blk.nameText": "Text",
      "blk.namePhoto": "Fotografie",
      "blk.photoX": "Odebrat fotografii",
      "blk.ph": "Text…",
    },
    en: {
      "page.title": "Add news",
      "page.lead": "Once published, the news item appears on the website in the <a href=\"/aktuality/\">News</a> section after about a minute.",
      "login.title": "Sign in",
      "login.name": "Name",
      "login.email": "E-mail",
      "login.password": "Password",
      "login.submit": "Sign in",
      "login.forgot": "I have no password or have forgotten it",
      "code.title": "Code from the e-mail",
      "code.text": "This is your first sign-in on this device or in this browser. We have sent a six-digit code to your e-mail (valid for 10 minutes).",
      "code.label": "Code",
      "code.verify": "Verify",
      "code.again": "Send a new code",
      "forgot.title": "Set a password",
      "forgot.text": "Enter the e-mail address the website administrator registered for you. We will send you a link to set your password.",
      "forgot.send": "Send link",
      "forgot.back": "Back to sign-in",
      "reset.title": "New password",
      "pw.next": "New password <small>(at least 10 characters)</small>",
      "reset.save": "Save password",
      "pw.confirm": "New password again",
      "pw.mismatch": "The passwords do not match.",
      "pw.match": "The passwords match.",
      "pw.show": "Show password",
      "pw.hide": "Hide password",
      "pw.r.len": "At least 10 characters",
      "pw.r.lower": "A lowercase letter",
      "pw.r.upper": "A capital letter",
      "pw.r.digit": "A digit",
      "pw.r.symbol": "A symbol, e.g. , . ? !",
      "pw.weak": "The password does not meet the requirements: at least 10 characters, a lowercase and a capital letter, a digit and a symbol.",
      "set.title": "Settings",
      "set.lang": "Language",
      "set.langNote": "The language of the administration and of the e-mails the website sends you (invitations, codes, alerts).",
      "set.alerts": "E-mail me when someone signs in from a new address",
      "set.saved": "Saved.",
      "ses.title": "Signed-in devices",
      "ses.text": "Devices where you are signed in right now. Sign out any device you don’t recognise and change your password.",
      "ses.others": "Sign out all other devices",
      "ses.out": "Sign out",
      "ses.here": "this device",
      "ses.since": "signed in {d}",
      "ses.seen": "last active {d}",
      "ses.none": "No other devices are signed in.",
      "ses.done": "All other devices have been signed out.",
      "who.in": "Signed in:",
      "who.members": "Member database",
      "who.out": "Sign out",
      "help.summary": "How to add a news item <small>– a short guide</small>",
      "help.s1.t": "Title, date and category",
      "help.s1.p": "Write a title, check the date and tick a category. With a future date the news item is published by itself on that day. <b>Draft</b> saves it without publishing.",
      "help.s1.a": "Form with a title, publication date, categories and the Draft option",
      "help.s2.t": "Text and photos",
      "help.s2.p": "The text is made up of sections. The <b>＋ Text</b> and <b>＋ Photo</b> buttons add another section; the arrows change the order. The toolbar above the text has a heading, bold, italic, lists, quote and link.",
      "help.s2.a": "Text editor with a formatting toolbar and buttons for adding text and a photo",
      "help.s3.t": "Main photo, attachments and publishing",
      "help.s3.p": "You can add a main photo and attachments to download (PDF, photos); they are shrunk automatically. The <b>Publish</b> button sends the news item. It appears on the website after about a minute.",
      "help.s3.a": "The Excerpt field, the choice of main photo, attachments to download and the Publish button",
      "help.s4.t": "Editing and deleting",
      "help.s4.p": "Under <b>Edit or delete</b> you find all the news items. You can edit and delete your own; an administrator can do so for all. A change shows on the website after about a minute.",
      "help.s4.a": "List of news items with search and the Edit and Delete buttons",
      "help.note": "Text you are writing is saved continuously in this browser, so you will not lose it even if you close the page. Under <b>Account and users</b> you change your password. Close the guide by clicking its heading; you can reopen it the same way at any time.",
      "tabs.label": "What would you like to do",
      "tab.new": "New news item",
      "tab.list": "Edit or delete",
      "tab.events": "Events",
      "tab.users": "Account and users",
      "list.search": "Search news",
      "list.searchPh": "Part of a title or a year…",
      "list.hint": "New and edited news items appear in the list after about a minute, once the website has been rebuilt. Drafts and scheduled items are marked; only your own news items can be deleted (an administrator can delete all).",
      "pwf.title": "Change my password",
      "pwf.current": "Current password",
      "pwf.submit": "Change password",
      "uf.title": "Add a user",
      "uf.name": "Full name",
      "uf.password": "Password <small>(leave empty: the user receives a link by e-mail and sets the password themselves)</small>",
      "uf.role": "Role",
      "role.editor": "Editor – writes and edits their own news; no member database",
      "role.admin": "Administrator – all news and the member database; does not add or edit users",
      "role.owner": "Chief administrator – may do everything, including adding and editing users",
      "role.members": "Member database only – no news",
      "uf.lang": "Language of the invitation and e-mails",
      "uf.add": "Add",
      "uf.list": "Users",
      "ev.title": "Calendar event",
      "ev.editing": "You are editing:",
      "ev.cancel": "Cancel editing",
      "ev.name": "Name <i aria-hidden=\"true\">*</i>",
      "ev.start": "Start <i aria-hidden=\"true\">*</i>",
      "ev.end": "End <small>(optional)</small>",
      "ev.allday": "All day",
      "ev.place": "Place <small>(optional)</small>",
      "ev.desc": "Description <small>(optional; an empty line separates paragraphs)</small>",
      "ev.add": "Add event",
      "ev.list": "Events",
      "ed.editing": "You are editing:",
      "ed.readonly": "Someone else wrote this news item; only its author or the website administrator can edit or delete it.",
      "ed.title": "Title <i aria-hidden=\"true\">*</i>",
      "ed.date": "Date and time of publication",
      "ed.cats": "Category",
      "ed.draft": "Draft <small>(save, but do not publish yet)</small>",
      "ed.pin": "Pin to the home page <small>(important announcement)</small>",
      "ed.text": "Text <i aria-hidden=\"true\">*</i>",
      "ed.locked": "The text of this older news item contains elements the editor cannot handle (for example a photo with a caption or a table). The text therefore stays unchanged; you can edit the title, date, categories, excerpt, photo and attachments.",
      "ed.hint": "Build the text from sections (text, photos); change the order with the arrows or by dragging. In the text: heading and subheading, bold, italic, lists, quotes and links. Two or more photos in a row form a grid and the news item also appears in the photo gallery. Fonts and colours are set by the website’s design.",
      "ed.excerpt": "Excerpt <small>(optional – a short summary in the news overview; otherwise the beginning of the text is used)</small>",
      "ed.photo": "Main photo <small>(optional – shown above the text; shrunk before sending)</small>",
      "ed.pickPhoto": "Choose a photo",
      "ed.attach": "Attachments to download <small>(PDF or photos, at most 3 MB per file; photos and larger PDFs are shrunk in the browser before sending)</small>",
      "ed.drop": "Drag files here, or",
      "ed.pickFiles": "choose files",
      "ed.gs": "PDFs are shrunk by Ghostscript (AGPL licence) running in this browser; the file goes nowhere else. <a href=\"/js/vendor/ghostscript-1.1.0/SOURCE.txt\">Source and licence</a>.",
      "done.back": "Back to the news",
      "lang.label": "Language",
      "err.login": "The e-mail (name) or password is incorrect.",
      "err.busy": "Too many attempts. Please try again in a minute.",
      "err.session": "Your session has expired. Please sign in again.",
      "err.type": "Only photos (JPG, PNG, WebP) and PDFs can be uploaded.",
      "err.size": "The file is too large even after shrinking (3 MB at most). Please split the PDF or reduce its images.",
      "err.missing": "Please fill in the title, date and text.",
      "err.config": "The form has not been set up yet (the access credentials are missing on the server).",
      "err.gone": "This item no longer exists (perhaps someone has deleted it in the meantime).",
      "err.forbidden": "Only the person who wrote this item or the website administrator can edit or delete it.",
      "err.server": "Something went wrong on the server. Please try again in a moment.",
      "err.2fa": "This needs a sign-in with a code from your e-mail. Please sign out and sign in again.",
      "users.elsewhere": "Users are added and their access changed in the administration → Access (the same accounts as on the main website).",
      "users.elsewhereLink": "Administration → Access",
      "err.net": "The connection failed. Please check your internet connection.",
      "who.admin": "administrator",
      "link.expired": "The link is no longer valid. Please have a new one sent.",
      "code.sent": "The code is on its way to your mailbox.",
      "code.bad": "The code is incorrect or has expired. Please have a new one sent.",
      "forgot.sent": "If the e-mail address is registered, a link will arrive shortly (valid for 3 days). Also check your spam folder.",
      "reset.done": "The password has been set. Please now sign in with your e-mail and the new password.",
      "reset.bad": "The link is no longer valid or the password is shorter than 10 characters.",
      "uf.pwNoMail": "Password <small>(at least 10 characters; tell it to the person directly – e-mails from the website are not set up yet)</small>",
      "pw.wrong": "The current password is incorrect.",
      "pw.short": "The password is too short (at least 10 characters).",
      "user.exists": "A user with this e-mail address already exists.",
      "pw.changed": "The password has been changed.",
      "user.added": "Added: {email}",
      "user.linkSent": " – the link to set the password was sent by e-mail.",
      "role.ownerN": "Chief administrator",
      "role.adminN": "Administrator",
      "role.editorN": "Editor",
      "role.membersN": "Member database only",
      "user.you": "(you)",
      "user.roleOf": "Role: {name}",
      "user.rename": "Rename",
      "user.renamePrompt": "Full name:",
      "user.newPw": "New password",
      "user.newPwPrompt": "New password for {name} (at least 10 characters):",
      "user.pwDone": "Password changed.",
      "user.remove": "Remove",
      "user.removeAsk": "Remove the user {name}? Their news items will remain.",
      "user.loadFail": "The list could not be loaded.",
      "list.edit": "Edit",
      "list.del": "Delete",
      "list.draft": "draft",
      "list.scheduled": "scheduled for {d}",
      "list.pinned": "pinned to the home page",
      "list.by": "Added by: {a}",
      "list.none": "Nothing found.",
      "list.more": "… and {n} more. Narrow down the search.",
      "list.delAsk": "Really delete the news item “{t}”? It will disappear from the website after about a minute.",
      "list.deleting": "Deleting…",
      "list.deleted": "Deleted: {t}. It will disappear from the website after about a minute.",
      "loading": "Loading…",
      "pub.save": "Save changes",
      "pub.publish": "Publish",
      "file.shrinkPdf": "Shrinking the PDF…",
      "file.preparing": "Preparing…",
      "file.shrinkPhoto": "Shrinking the photo…",
      "file.uploading": "Uploading…",
      "file.done": "Uploaded",
      "file.onSite": "On the website",
      "file.remove": "Remove",
      "file.label": "Name of the download link",
      "date.future": "Future date: the news item will appear on the website only on that day.",
      "blk.add": "Add a section",
      "blk.addText": "Add text",
      "blk.text": "＋ Text",
      "blk.addPhoto": "Add a photo",
      "blk.photo": "＋ Photo",
      "blk.photoMore": "＋ Add a photo",
      "blk.drag": "Drag",
      "blk.up": "Move up",
      "blk.down": "Move down",
      "blk.remove": "Delete the section",
      "blk.removeAsk": "Delete this section?",
      "blk.label": "Text of the section",
      "q.bold": "Bold",
      "q.italic": "Italic",
      "q.underline": "Underline",
      "q.strike": "Strikethrough",
      "q.quote": "Quote",
      "q.link": "Link",
      "q.image": "Insert a photo",
      "q.clean": "Clear formatting",
      "q.ordered": "Numbered list",
      "q.bullets": "Bulleted list",
      "photo.uploading": "Uploading the photo…",
      "photo.uploadingN": "Uploading the photos… ({n})",
      "draft.restored": "A draft in progress has been restored from this browser.",
      "pub.wait": "Please wait until the files have finished uploading.",
      "pub.saving": "Saving…",
      "pub.publishing": "Publishing…",
      "done.draft": "Saved as a draft",
      "done.scheduled": "Scheduled",
      "done.saved": "Saved",
      "done.published": "Published",
      "done.draftText": "The draft is not visible on the website; you publish it by editing it (untick “Draft”). The address will be: ",
      "done.scheduledText": "The news item will appear on the website on the given day (after the site is rebuilt): ",
      "done.text": "The change will be on the website after about a minute: ",
      "ev.past": "past",
      "ev.upcoming": "upcoming",
      "ev.none": "No events yet.",
      "ev.delAsk": "Really delete the event “{t}”?",
      "ev.deleted": "Deleted: {t}. It will disappear from the website after about a minute.",
      "ev.needTitle": "Please fill in the name and the start of the event.",
      "ev.endBefore": "The end of the event cannot be before its start.",
      "ev.saved": "Saved: {t}. On the website after about a minute.",
      "ev.added": "Added: {t}. On the website after about a minute.",
      "ev.addBtn": "Add event",
      "blk.nameText": "Text",
      "blk.namePhoto": "Photo",
      "blk.photoX": "Remove the photo",
      "blk.ph": "Text…",
    },
    de: {
      "page.title": "Meldung hinzufügen",
      "page.lead": "Nach der Veröffentlichung erscheint die Meldung nach etwa einer Minute auf der Website im Bereich <a href=\"/aktuality/\">Aktuelles</a>.",
      "login.title": "Anmeldung",
      "login.name": "Name",
      "login.email": "E-Mail",
      "login.password": "Passwort",
      "login.submit": "Anmelden",
      "login.forgot": "Ich habe kein Passwort oder habe es vergessen",
      "code.title": "Code aus der E-Mail",
      "code.text": "Sie melden sich auf diesem Gerät oder in diesem Browser zum ersten Mal an. Wir haben einen sechsstelligen Code an Ihre E-Mail-Adresse gesendet (10 Minuten gültig).",
      "code.label": "Code",
      "code.verify": "Bestätigen",
      "code.again": "Neuen Code senden",
      "forgot.title": "Passwort festlegen",
      "forgot.text": "Geben Sie die E-Mail-Adresse ein, die der Website-Verwalter für Sie eingetragen hat. Wir senden Ihnen einen Link zum Festlegen des Passworts.",
      "forgot.send": "Link senden",
      "forgot.back": "Zurück zur Anmeldung",
      "reset.title": "Neues Passwort",
      "pw.next": "Neues Passwort <small>(mindestens 10 Zeichen)</small>",
      "reset.save": "Passwort speichern",
      "pw.confirm": "Neues Passwort wiederholen",
      "pw.mismatch": "Die Passwörter stimmen nicht überein.",
      "pw.match": "Die Passwörter stimmen überein.",
      "pw.show": "Passwort anzeigen",
      "pw.hide": "Passwort verbergen",
      "pw.r.len": "Mindestens 10 Zeichen",
      "pw.r.lower": "Ein Kleinbuchstabe",
      "pw.r.upper": "Ein Großbuchstabe",
      "pw.r.digit": "Eine Ziffer",
      "pw.r.symbol": "Ein Sonderzeichen, z. B. , . ? !",
      "pw.weak": "Das Passwort erfüllt die Anforderungen nicht: mindestens 10 Zeichen, Klein- und Großbuchstabe, Ziffer und Sonderzeichen.",
      "set.title": "Einstellungen",
      "set.lang": "Sprache",
      "set.langNote": "Die Sprache der Verwaltung und der E-Mails, die Ihnen die Website sendet (Einladungen, Codes, Warnungen).",
      "set.alerts": "Mich per E-Mail über Anmeldungen von neuen Adressen informieren",
      "set.saved": "Gespeichert.",
      "ses.title": "Angemeldete Geräte",
      "ses.text": "Geräte, auf denen Sie gerade angemeldet sind. Melden Sie unbekannte Geräte ab und ändern Sie Ihr Passwort.",
      "ses.others": "Alle anderen Geräte abmelden",
      "ses.out": "Abmelden",
      "ses.here": "dieses Gerät",
      "ses.since": "angemeldet {d}",
      "ses.seen": "zuletzt aktiv {d}",
      "ses.none": "Keine anderen Geräte sind angemeldet.",
      "ses.done": "Alle anderen Geräte wurden abgemeldet.",
      "who.in": "Angemeldet:",
      "who.members": "Mitgliederdatenbank",
      "who.out": "Abmelden",
      "help.summary": "So fügen Sie eine Meldung hinzu <small>– eine Kurzanleitung</small>",
      "help.s1.t": "Titel, Datum und Kategorie",
      "help.s1.p": "Schreiben Sie einen Titel, prüfen Sie das Datum und haken Sie eine Kategorie an. Bei einem Datum in der Zukunft wird die Meldung erst an diesem Tag von selbst veröffentlicht. <b>Entwurf</b> speichert sie, ohne sie zu veröffentlichen.",
      "help.s1.a": "Formular mit Titel, Veröffentlichungsdatum, Kategorien und der Option Entwurf",
      "help.s2.t": "Text und Fotos",
      "help.s2.p": "Der Text besteht aus Abschnitten. Mit den Schaltflächen <b>＋ Text</b> und <b>＋ Foto</b> fügen Sie einen weiteren Abschnitt hinzu, mit den Pfeilen ändern Sie die Reihenfolge. In der Leiste über dem Text finden Sie Überschrift, Fettdruck, Kursivschrift, Listen, Zitat und Link.",
      "help.s2.a": "Texteditor mit Formatierungsleiste und Schaltflächen zum Hinzufügen von Text und Foto",
      "help.s3.t": "Hauptfoto, Anhänge und Veröffentlichung",
      "help.s3.p": "Sie können ein Hauptfoto und Anhänge zum Herunterladen hinzufügen (PDF, Fotos); sie werden automatisch verkleinert. Mit der Schaltfläche <b>Veröffentlichen</b> senden Sie die Meldung ab. Auf der Website erscheint sie nach etwa einer Minute.",
      "help.s3.a": "Feld Kurztext, Auswahl des Hauptfotos, Anhänge zum Herunterladen und die Schaltfläche Veröffentlichen",
      "help.s4.t": "Bearbeiten und Löschen",
      "help.s4.p": "Auf der Karteikarte <b>Bearbeiten oder löschen</b> finden Sie alle Meldungen. Eigene Meldungen können Sie bearbeiten und löschen, ein Verwalter alle. Eine Änderung erscheint nach etwa einer Minute auf der Website.",
      "help.s4.a": "Liste der Meldungen mit Suche und den Schaltflächen Bearbeiten und Löschen",
      "help.note": "Ein begonnener Text wird laufend in diesem Browser gespeichert, sodass er auch nach dem Schließen der Seite nicht verloren geht. Auf der Karteikarte <b>Konto und Benutzer</b> ändern Sie Ihr Passwort. Die Anleitung schließen Sie mit einem Klick auf ihre Überschrift; auf dieselbe Weise öffnen Sie sie jederzeit wieder.",
      "tabs.label": "Was möchten Sie tun",
      "tab.new": "Neue Meldung",
      "tab.list": "Bearbeiten oder löschen",
      "tab.events": "Termine",
      "tab.users": "Konto und Benutzer",
      "list.search": "Meldung suchen",
      "list.searchPh": "Teil des Titels oder Jahr…",
      "list.hint": "Neue und bearbeitete Meldungen erscheinen nach etwa einer Minute in der Liste, sobald die Website neu erstellt wurde. Entwürfe und geplante Meldungen sind gekennzeichnet; gelöscht werden können nur eigene Meldungen (ein Verwalter kann alle löschen).",
      "pwf.title": "Mein Passwort ändern",
      "pwf.current": "Aktuelles Passwort",
      "pwf.submit": "Passwort ändern",
      "uf.title": "Benutzer hinzufügen",
      "uf.name": "Vor- und Nachname",
      "uf.password": "Passwort <small>(leer lassen: Der Benutzer erhält einen Link per E-Mail und legt das Passwort selbst fest)</small>",
      "uf.role": "Rolle",
      "role.editor": "Redakteur – verfasst und bearbeitet eigene Meldungen; ohne Mitgliederdatenbank",
      "role.admin": "Verwalter – alle Meldungen und die Mitgliederdatenbank; fügt keine Benutzer hinzu und bearbeitet sie nicht",
      "role.owner": "Hauptverwalter – darf alles, auch Benutzer hinzufügen und bearbeiten",
      "role.members": "Nur Mitgliederdatenbank – ohne Meldungen",
      "uf.lang": "Sprache der Einladung und der E-Mails",
      "uf.add": "Hinzufügen",
      "uf.list": "Benutzer",
      "ev.title": "Termin im Kalender",
      "ev.editing": "Sie bearbeiten:",
      "ev.cancel": "Bearbeitung abbrechen",
      "ev.name": "Name <i aria-hidden=\"true\">*</i>",
      "ev.start": "Beginn <i aria-hidden=\"true\">*</i>",
      "ev.end": "Ende <small>(optional)</small>",
      "ev.allday": "Ganztägig",
      "ev.place": "Ort <small>(optional)</small>",
      "ev.desc": "Beschreibung <small>(optional; eine Leerzeile trennt Absätze)</small>",
      "ev.add": "Termin hinzufügen",
      "ev.list": "Termine",
      "ed.editing": "Sie bearbeiten:",
      "ed.readonly": "Diese Meldung hat jemand anderes verfasst; bearbeiten oder löschen kann sie nur der Autor oder der Website-Verwalter.",
      "ed.title": "Titel <i aria-hidden=\"true\">*</i>",
      "ed.date": "Datum und Uhrzeit der Veröffentlichung",
      "ed.cats": "Kategorie",
      "ed.draft": "Entwurf <small>(speichern, aber noch nicht veröffentlichen)</small>",
      "ed.pin": "An die Startseite anheften <small>(wichtige Ankündigung)</small>",
      "ed.text": "Text <i aria-hidden=\"true\">*</i>",
      "ed.locked": "Der Text dieser älteren Meldung enthält Elemente, die der Editor nicht beherrscht (zum Beispiel ein Foto mit Bildunterschrift oder eine Tabelle). Der Text bleibt daher unverändert; bearbeiten können Sie Titel, Datum, Kategorien, Kurztext, Foto und Anhänge.",
      "ed.hint": "Setzen Sie den Text aus Abschnitten zusammen (Text, Fotos); die Reihenfolge ändern Sie mit den Pfeilen oder per Ziehen. Im Text: Überschrift und Zwischenüberschrift, Fettdruck, Kursivschrift, Listen, Zitate und Links. Zwei oder mehr Fotos hintereinander bilden ein Raster, und die Meldung erscheint auch in der Fotogalerie. Schrift und Farben bestimmt das Design der Website.",
      "ed.excerpt": "Kurztext <small>(optional – kurze Zusammenfassung in der Meldungsübersicht; sonst wird der Textanfang verwendet)</small>",
      "ed.photo": "Hauptfoto <small>(optional – wird über dem Text angezeigt; wird vor dem Senden verkleinert)</small>",
      "ed.pickPhoto": "Foto auswählen",
      "ed.attach": "Anhänge zum Herunterladen <small>(PDF oder Fotos, höchstens 3 MB pro Datei; Fotos und größere PDFs werden vor dem Senden direkt im Browser verkleinert)</small>",
      "ed.drop": "Ziehen Sie Dateien hierher oder",
      "ed.pickFiles": "wählen Sie Dateien aus",
      "ed.gs": "PDFs werden von Ghostscript (AGPL-Lizenz) verkleinert, das in diesem Browser läuft; die Datei verlässt Ihr Gerät nicht. <a href=\"/js/vendor/ghostscript-1.1.0/SOURCE.txt\">Quelle und Lizenz</a>.",
      "done.back": "Zurück zu den Meldungen",
      "lang.label": "Sprache",
      "err.login": "E-Mail (Name) oder Passwort stimmen nicht.",
      "err.busy": "Zu viele Versuche. Bitte versuchen Sie es in einer Minute erneut.",
      "err.session": "Die Anmeldung ist abgelaufen. Bitte melden Sie sich erneut an.",
      "err.type": "Es können nur Fotos (JPG, PNG, WebP) und PDFs hochgeladen werden.",
      "err.size": "Die Datei ist auch nach dem Verkleinern zu groß (höchstens 3 MB). Bitte teilen Sie das PDF auf oder verkleinern Sie seine Bilder.",
      "err.missing": "Bitte füllen Sie Titel, Datum und Text aus.",
      "err.config": "Das Formular ist noch nicht eingerichtet (auf dem Server fehlen die Zugangsdaten).",
      "err.gone": "Dieser Eintrag existiert nicht mehr (vielleicht hat ihn inzwischen jemand gelöscht).",
      "err.forbidden": "Diesen Eintrag kann nur bearbeiten oder löschen, wer ihn verfasst hat, oder der Website-Verwalter.",
      "err.server": "Auf dem Server ist etwas schiefgelaufen. Bitte versuchen Sie es gleich noch einmal.",
      "err.2fa": "Dafür ist eine Anmeldung mit einem Code aus der E-Mail nötig. Bitte melden Sie sich ab und erneut an.",
      "users.elsewhere": "Benutzer werden in der Verwaltung → Zugänge hinzugefügt und geändert (dieselben Konten wie auf der Hauptwebsite).",
      "users.elsewhereLink": "Verwaltung → Zugänge",
      "err.net": "Die Verbindung ist fehlgeschlagen. Bitte prüfen Sie Ihre Internetverbindung.",
      "who.admin": "Verwalter",
      "link.expired": "Der Link ist nicht mehr gültig. Bitte lassen Sie sich einen neuen senden.",
      "code.sent": "Der Code ist auf dem Weg in Ihr Postfach.",
      "code.bad": "Der Code stimmt nicht oder ist abgelaufen. Bitte lassen Sie sich einen neuen senden.",
      "forgot.sent": "Ist die E-Mail-Adresse eingetragen, kommt gleich ein Link an (3 Tage gültig). Prüfen Sie auch den Spam-Ordner.",
      "reset.done": "Das Passwort ist festgelegt. Bitte melden Sie sich jetzt mit E-Mail und neuem Passwort an.",
      "reset.bad": "Der Link ist nicht mehr gültig oder das Passwort hat weniger als 10 Zeichen.",
      "uf.pwNoMail": "Passwort <small>(mindestens 10 Zeichen; teilen Sie es persönlich mit – E-Mails der Website sind noch nicht eingerichtet)</small>",
      "pw.wrong": "Das aktuelle Passwort stimmt nicht.",
      "pw.short": "Das Passwort ist zu kurz (mindestens 10 Zeichen).",
      "user.exists": "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.",
      "pw.changed": "Das Passwort wurde geändert.",
      "user.added": "Hinzugefügt: {email}",
      "user.linkSent": " – der Link zum Festlegen des Passworts wurde per E-Mail gesendet.",
      "role.ownerN": "Hauptverwalter",
      "role.adminN": "Verwalter",
      "role.editorN": "Redakteur",
      "role.membersN": "Nur Mitgliederdatenbank",
      "user.you": "(Sie)",
      "user.roleOf": "Rolle: {name}",
      "user.rename": "Umbenennen",
      "user.renamePrompt": "Vor- und Nachname:",
      "user.newPw": "Neues Passwort",
      "user.newPwPrompt": "Neues Passwort für {name} (mindestens 10 Zeichen):",
      "user.pwDone": "Passwort geändert.",
      "user.remove": "Entfernen",
      "user.removeAsk": "Benutzer {name} entfernen? Seine Meldungen bleiben erhalten.",
      "user.loadFail": "Die Liste konnte nicht geladen werden.",
      "list.edit": "Bearbeiten",
      "list.del": "Löschen",
      "list.draft": "Entwurf",
      "list.scheduled": "geplant für {d}",
      "list.pinned": "an die Startseite angeheftet",
      "list.by": "Hinzugefügt von: {a}",
      "list.none": "Nichts gefunden.",
      "list.more": "… und {n} weitere. Grenzen Sie die Suche ein.",
      "list.delAsk": "Meldung „{t}“ wirklich löschen? Sie verschwindet nach etwa einer Minute von der Website.",
      "list.deleting": "Wird gelöscht…",
      "list.deleted": "Gelöscht: {t}. Von der Website verschwindet sie nach etwa einer Minute.",
      "loading": "Wird geladen…",
      "pub.save": "Änderungen speichern",
      "pub.publish": "Veröffentlichen",
      "file.shrinkPdf": "PDF wird verkleinert…",
      "file.preparing": "Wird vorbereitet…",
      "file.shrinkPhoto": "Foto wird verkleinert…",
      "file.uploading": "Wird hochgeladen…",
      "file.done": "Hochgeladen",
      "file.onSite": "Auf der Website",
      "file.remove": "Entfernen",
      "file.label": "Name des Download-Links",
      "date.future": "Datum in der Zukunft: Die Meldung erscheint erst an diesem Tag auf der Website.",
      "blk.add": "Abschnitt hinzufügen",
      "blk.addText": "Text hinzufügen",
      "blk.text": "＋ Text",
      "blk.addPhoto": "Foto hinzufügen",
      "blk.photo": "＋ Foto",
      "blk.photoMore": "＋ Foto hinzufügen",
      "blk.drag": "Ziehen",
      "blk.up": "Nach oben",
      "blk.down": "Nach unten",
      "blk.remove": "Abschnitt löschen",
      "blk.removeAsk": "Diesen Abschnitt löschen?",
      "blk.label": "Text des Abschnitts",
      "q.bold": "Fett",
      "q.italic": "Kursiv",
      "q.underline": "Unterstrichen",
      "q.strike": "Durchgestrichen",
      "q.quote": "Zitat",
      "q.link": "Link",
      "q.image": "Foto einfügen",
      "q.clean": "Formatierung entfernen",
      "q.ordered": "Nummerierte Liste",
      "q.bullets": "Aufzählung",
      "photo.uploading": "Foto wird hochgeladen…",
      "photo.uploadingN": "Fotos werden hochgeladen… ({n})",
      "draft.restored": "Ein begonnener Entwurf wurde aus diesem Browser wiederhergestellt.",
      "pub.wait": "Bitte warten Sie, bis das Hochladen der Dateien abgeschlossen ist.",
      "pub.saving": "Wird gespeichert…",
      "pub.publishing": "Wird veröffentlicht…",
      "done.draft": "Als Entwurf gespeichert",
      "done.scheduled": "Geplant",
      "done.saved": "Gespeichert",
      "done.published": "Veröffentlicht",
      "done.draftText": "Der Entwurf ist auf der Website nicht sichtbar; Sie veröffentlichen ihn durch Bearbeiten (Haken bei „Entwurf“ entfernen). Die Adresse lautet: ",
      "done.scheduledText": "Die Meldung erscheint am angegebenen Tag auf der Website (nach dem Neuaufbau der Website): ",
      "done.text": "Die Änderung ist nach etwa einer Minute auf der Website: ",
      "ev.past": "vergangen",
      "ev.upcoming": "bevorstehend",
      "ev.none": "Noch keine Termine.",
      "ev.delAsk": "Termin „{t}“ wirklich löschen?",
      "ev.deleted": "Gelöscht: {t}. Von der Website verschwindet er nach etwa einer Minute.",
      "ev.needTitle": "Bitte füllen Sie Name und Beginn des Termins aus.",
      "ev.endBefore": "Das Ende des Termins darf nicht vor dem Beginn liegen.",
      "ev.saved": "Gespeichert: {t}. Auf der Website nach etwa einer Minute.",
      "ev.added": "Hinzugefügt: {t}. Auf der Website nach etwa einer Minute.",
      "ev.addBtn": "Termin hinzufügen",
      "blk.nameText": "Text",
      "blk.namePhoto": "Foto",
      "blk.photoX": "Foto entfernen",
      "blk.ph": "Text…",
    },
    fr: {
      "page.title": "Ajouter une actualité",
      "page.lead": "Une fois publiée, l’actualité apparaît sur le site, dans la rubrique <a href=\"/aktuality/\">Actualités</a>, au bout d’une minute environ.",
      "login.title": "Connexion",
      "login.name": "Nom",
      "login.email": "E-mail",
      "login.password": "Mot de passe",
      "login.submit": "Se connecter",
      "login.forgot": "Je n’ai pas de mot de passe ou je l’ai oublié",
      "code.title": "Code reçu par e-mail",
      "code.text": "C’est votre première connexion sur cet appareil ou dans ce navigateur. Nous avons envoyé un code à six chiffres à votre adresse e-mail (valable 10 minutes).",
      "code.label": "Code",
      "code.verify": "Vérifier",
      "code.again": "Envoyer un nouveau code",
      "forgot.title": "Définir un mot de passe",
      "forgot.text": "Saisissez l’adresse e-mail que l’administrateur du site a enregistrée pour vous. Nous vous enverrons un lien pour définir votre mot de passe.",
      "forgot.send": "Envoyer le lien",
      "forgot.back": "Retour à la connexion",
      "reset.title": "Nouveau mot de passe",
      "pw.next": "Nouveau mot de passe <small>(10 caractères au minimum)</small>",
      "reset.save": "Enregistrer le mot de passe",
      "pw.confirm": "Confirmer le nouveau mot de passe",
      "pw.mismatch": "Les mots de passe ne correspondent pas.",
      "pw.match": "Les mots de passe correspondent.",
      "pw.show": "Afficher le mot de passe",
      "pw.hide": "Masquer le mot de passe",
      "pw.r.len": "Au moins 10 caractères",
      "pw.r.lower": "Une minuscule",
      "pw.r.upper": "Une majuscule",
      "pw.r.digit": "Un chiffre",
      "pw.r.symbol": "Un symbole, p. ex. , . ? !",
      "pw.weak": "Le mot de passe ne remplit pas les exigences : au moins 10 caractères, une minuscule, une majuscule, un chiffre et un symbole.",
      "set.title": "Réglages",
      "set.lang": "Langue",
      "set.langNote": "La langue de l’administration et des e-mails que le site vous envoie (invitations, codes, alertes).",
      "set.alerts": "M’avertir par e-mail d’une connexion depuis une nouvelle adresse",
      "set.saved": "Enregistré.",
      "ses.title": "Appareils connectés",
      "ses.text": "Appareils sur lesquels vous êtes actuellement connecté(e). Déconnectez tout appareil inconnu et changez votre mot de passe.",
      "ses.others": "Déconnecter tous les autres appareils",
      "ses.out": "Déconnecter",
      "ses.here": "cet appareil",
      "ses.since": "connecté le {d}",
      "ses.seen": "dernière activité {d}",
      "ses.none": "Aucun autre appareil n’est connecté.",
      "ses.done": "Tous les autres appareils ont été déconnectés.",
      "who.in": "Connecté(e) :",
      "who.members": "Base des membres",
      "who.out": "Se déconnecter",
      "help.summary": "Comment ajouter une actualité <small>– un bref guide</small>",
      "help.s1.t": "Titre, date et catégorie",
      "help.s1.p": "Écrivez un titre, vérifiez la date et cochez une catégorie. Avec une date future, l’actualité est publiée d’elle-même ce jour-là. <b>Brouillon</b> l’enregistre sans la publier.",
      "help.s1.a": "Formulaire avec titre, date de publication, catégories et l’option Brouillon",
      "help.s2.t": "Texte et photos",
      "help.s2.p": "Le texte se compose de sections. Les boutons <b>＋ Texte</b> et <b>＋ Photo</b> ajoutent une section, les flèches changent l’ordre. La barre au-dessus du texte propose titre, gras, italique, listes, citation et lien.",
      "help.s2.a": "Éditeur de texte avec barre de mise en forme et boutons d’ajout de texte et de photo",
      "help.s3.t": "Photo principale, pièces jointes et publication",
      "help.s3.p": "Vous pouvez ajouter une photo principale et des pièces jointes à télécharger (PDF, photos) ; elles sont réduites automatiquement. Le bouton <b>Publier</b> envoie l’actualité. Elle apparaît sur le site au bout d’une minute environ.",
      "help.s3.a": "Champ Résumé, choix de la photo principale, pièces jointes à télécharger et bouton Publier",
      "help.s4.t": "Modification et suppression",
      "help.s4.p": "Dans l’onglet <b>Modifier ou supprimer</b>, vous trouvez toutes les actualités. Vous pouvez modifier et supprimer les vôtres ; un administrateur peut toutes les modifier. Une modification apparaît sur le site au bout d’une minute environ.",
      "help.s4.a": "Liste des actualités avec recherche et boutons Modifier et Supprimer",
      "help.note": "Le texte en cours de rédaction est enregistré en continu dans ce navigateur ; vous ne le perdez donc pas, même si vous fermez la page. Dans l’onglet <b>Compte et utilisateurs</b>, vous changez votre mot de passe. Fermez le guide en cliquant sur son titre ; vous le rouvrez de la même façon à tout moment.",
      "tabs.label": "Que souhaitez-vous faire",
      "tab.new": "Nouvelle actualité",
      "tab.list": "Modifier ou supprimer",
      "tab.events": "Événements",
      "tab.users": "Compte et utilisateurs",
      "list.search": "Rechercher une actualité",
      "list.searchPh": "Partie du titre ou année…",
      "list.hint": "Les actualités nouvelles et modifiées apparaissent dans la liste au bout d’une minute environ, une fois le site reconstruit. Les brouillons et les actualités programmées sont signalés ; seules vos propres actualités peuvent être supprimées (un administrateur peut toutes les supprimer).",
      "pwf.title": "Changer mon mot de passe",
      "pwf.current": "Mot de passe actuel",
      "pwf.submit": "Changer le mot de passe",
      "uf.title": "Ajouter un utilisateur",
      "uf.name": "Prénom et nom",
      "uf.password": "Mot de passe <small>(laissez vide : l’utilisateur reçoit un lien par e-mail et définit lui-même le mot de passe)</small>",
      "uf.role": "Rôle",
      "role.editor": "Rédacteur – rédige et modifie ses propres actualités ; sans base des membres",
      "role.admin": "Administrateur – toutes les actualités et la base des membres ; n’ajoute ni ne modifie d’utilisateurs",
      "role.owner": "Administrateur principal – peut tout faire, y compris ajouter et modifier des utilisateurs",
      "role.members": "Base des membres uniquement – sans actualités",
      "uf.lang": "Langue de l’invitation et des e-mails",
      "uf.add": "Ajouter",
      "uf.list": "Utilisateurs",
      "ev.title": "Événement du calendrier",
      "ev.editing": "Vous modifiez :",
      "ev.cancel": "Annuler la modification",
      "ev.name": "Nom <i aria-hidden=\"true\">*</i>",
      "ev.start": "Début <i aria-hidden=\"true\">*</i>",
      "ev.end": "Fin <small>(facultatif)</small>",
      "ev.allday": "Toute la journée",
      "ev.place": "Lieu <small>(facultatif)</small>",
      "ev.desc": "Description <small>(facultatif ; une ligne vide sépare les paragraphes)</small>",
      "ev.add": "Ajouter l’événement",
      "ev.list": "Événements",
      "ed.editing": "Vous modifiez :",
      "ed.readonly": "Cette actualité a été rédigée par quelqu’un d’autre ; seuls son auteur ou l’administrateur du site peuvent la modifier ou la supprimer.",
      "ed.title": "Titre <i aria-hidden=\"true\">*</i>",
      "ed.date": "Date et heure de publication",
      "ed.cats": "Catégorie",
      "ed.draft": "Brouillon <small>(enregistrer, mais ne pas encore publier)</small>",
      "ed.pin": "Épingler à la page d’accueil <small>(annonce importante)</small>",
      "ed.text": "Texte <i aria-hidden=\"true\">*</i>",
      "ed.locked": "Le texte de cette ancienne actualité contient des éléments que l’éditeur ne gère pas (par exemple une photo avec légende ou un tableau). Le texte reste donc inchangé ; vous pouvez modifier le titre, la date, les catégories, le résumé, la photo et les pièces jointes.",
      "ed.hint": "Composez le texte à partir de sections (texte, photos) ; changez l’ordre avec les flèches ou en glissant. Dans le texte : titre et sous-titre, gras, italique, listes, citations et liens. Deux photos ou plus à la suite forment une grille et l’actualité apparaît aussi dans la galerie photo. La police et les couleurs sont définies par le design du site.",
      "ed.excerpt": "Résumé <small>(facultatif – bref résumé dans l’aperçu des actualités ; sinon le début du texte est utilisé)</small>",
      "ed.photo": "Photo principale <small>(facultatif – affichée au-dessus du texte ; réduite avant l’envoi)</small>",
      "ed.pickPhoto": "Choisir une photo",
      "ed.attach": "Pièces jointes à télécharger <small>(PDF ou photos, 3 Mo au maximum par fichier ; les photos et les PDF volumineux sont réduits dans le navigateur avant l’envoi)</small>",
      "ed.drop": "Glissez des fichiers ici, ou",
      "ed.pickFiles": "choisissez des fichiers",
      "ed.gs": "Les PDF sont réduits par Ghostscript (licence AGPL) exécuté dans ce navigateur ; le fichier ne part nulle part ailleurs. <a href=\"/js/vendor/ghostscript-1.1.0/SOURCE.txt\">Source et licence</a>.",
      "done.back": "Retour aux actualités",
      "lang.label": "Langue",
      "err.login": "L’e-mail (le nom) ou le mot de passe est incorrect.",
      "err.busy": "Trop de tentatives. Veuillez réessayer dans une minute.",
      "err.session": "Votre session a expiré. Veuillez vous reconnecter.",
      "err.type": "Seuls les photos (JPG, PNG, WebP) et les PDF peuvent être téléversés.",
      "err.size": "Le fichier est trop volumineux même après réduction (3 Mo au maximum). Veuillez scinder le PDF ou réduire ses images.",
      "err.missing": "Veuillez renseigner le titre, la date et le texte.",
      "err.config": "Le formulaire n’est pas encore configuré (les identifiants d’accès manquent sur le serveur).",
      "err.gone": "Cet élément n’existe plus (quelqu’un l’a peut-être supprimé entre-temps).",
      "err.forbidden": "Seule la personne qui a rédigé cet élément ou l’administrateur du site peut le modifier ou le supprimer.",
      "err.server": "Un problème est survenu côté serveur. Veuillez réessayer dans un instant.",
      "err.2fa": "Cette action demande une connexion avec un code reçu par e-mail. Déconnectez-vous et reconnectez-vous.",
      "users.elsewhere": "Les utilisateurs s’ajoutent et leurs accès se modifient dans l’administration → Accès (les mêmes comptes que sur le site principal).",
      "users.elsewhereLink": "Administration → Accès",
      "err.net": "La connexion a échoué. Veuillez vérifier votre connexion internet.",
      "who.admin": "administrateur",
      "link.expired": "Le lien n’est plus valable. Veuillez en demander un nouveau.",
      "code.sent": "Le code est en route vers votre boîte e-mail.",
      "code.bad": "Le code est incorrect ou a expiré. Veuillez en demander un nouveau.",
      "forgot.sent": "Si l’adresse e-mail est enregistrée, un lien vous parviendra dans un instant (valable 3 jours). Vérifiez aussi vos courriers indésirables.",
      "reset.done": "Le mot de passe est défini. Veuillez maintenant vous connecter avec votre e-mail et le nouveau mot de passe.",
      "reset.bad": "Le lien n’est plus valable ou le mot de passe compte moins de 10 caractères.",
      "uf.pwNoMail": "Mot de passe <small>(10 caractères au minimum ; communiquez-le en personne – les e-mails du site ne sont pas encore configurés)</small>",
      "pw.wrong": "Le mot de passe actuel est incorrect.",
      "pw.short": "Le mot de passe est trop court (10 caractères au minimum).",
      "user.exists": "Un utilisateur avec cette adresse e-mail existe déjà.",
      "pw.changed": "Le mot de passe a été modifié.",
      "user.added": "Ajouté : {email}",
      "user.linkSent": " – le lien pour définir le mot de passe a été envoyé par e-mail.",
      "role.ownerN": "Administrateur principal",
      "role.adminN": "Administrateur",
      "role.editorN": "Rédacteur",
      "role.membersN": "Base des membres uniquement",
      "user.you": "(vous)",
      "user.roleOf": "Rôle : {name}",
      "user.rename": "Renommer",
      "user.renamePrompt": "Prénom et nom :",
      "user.newPw": "Nouveau mot de passe",
      "user.newPwPrompt": "Nouveau mot de passe pour {name} (10 caractères au minimum) :",
      "user.pwDone": "Mot de passe modifié.",
      "user.remove": "Retirer",
      "user.removeAsk": "Retirer l’utilisateur {name} ? Ses actualités sont conservées.",
      "user.loadFail": "La liste n’a pas pu être chargée.",
      "list.edit": "Modifier",
      "list.del": "Supprimer",
      "list.draft": "brouillon",
      "list.scheduled": "programmée le {d}",
      "list.pinned": "épinglée à la page d’accueil",
      "list.by": "Ajouté par : {a}",
      "list.none": "Aucun résultat.",
      "list.more": "… et {n} autres. Affinez la recherche.",
      "list.delAsk": "Supprimer vraiment l’actualité « {t} » ? Elle disparaîtra du site au bout d’une minute environ.",
      "list.deleting": "Suppression…",
      "list.deleted": "Supprimée : {t}. Elle disparaîtra du site au bout d’une minute environ.",
      "loading": "Chargement…",
      "pub.save": "Enregistrer les modifications",
      "pub.publish": "Publier",
      "file.shrinkPdf": "Réduction du PDF…",
      "file.preparing": "Préparation…",
      "file.shrinkPhoto": "Réduction de la photo…",
      "file.uploading": "Téléversement…",
      "file.done": "Téléversé",
      "file.onSite": "Sur le site",
      "file.remove": "Retirer",
      "file.label": "Nom du lien de téléchargement",
      "date.future": "Date future : l’actualité n’apparaîtra sur le site que ce jour-là.",
      "blk.add": "Ajouter une section",
      "blk.addText": "Ajouter du texte",
      "blk.text": "＋ Texte",
      "blk.addPhoto": "Ajouter une photo",
      "blk.photo": "＋ Photo",
      "blk.photoMore": "＋ Ajouter une photo",
      "blk.drag": "Glisser",
      "blk.up": "Monter",
      "blk.down": "Descendre",
      "blk.remove": "Supprimer la section",
      "blk.removeAsk": "Supprimer cette section ?",
      "blk.label": "Texte de la section",
      "q.bold": "Gras",
      "q.italic": "Italique",
      "q.underline": "Souligné",
      "q.strike": "Barré",
      "q.quote": "Citation",
      "q.link": "Lien",
      "q.image": "Insérer une photo",
      "q.clean": "Effacer la mise en forme",
      "q.ordered": "Liste numérotée",
      "q.bullets": "Liste à puces",
      "photo.uploading": "Téléversement de la photo…",
      "photo.uploadingN": "Téléversement des photos… ({n})",
      "draft.restored": "Un brouillon en cours a été restauré à partir de ce navigateur.",
      "pub.wait": "Veuillez attendre la fin du téléversement des fichiers.",
      "pub.saving": "Enregistrement…",
      "pub.publishing": "Publication…",
      "done.draft": "Enregistrée comme brouillon",
      "done.scheduled": "Programmée",
      "done.saved": "Enregistrée",
      "done.published": "Publiée",
      "done.draftText": "Le brouillon n’est pas visible sur le site ; vous le publiez en le modifiant (décochez « Brouillon »). L’adresse sera : ",
      "done.scheduledText": "L’actualité apparaîtra sur le site le jour indiqué (après la reconstruction du site) : ",
      "done.text": "La modification sera sur le site au bout d’une minute environ : ",
      "ev.past": "passé",
      "ev.upcoming": "à venir",
      "ev.none": "Aucun événement pour le moment.",
      "ev.delAsk": "Supprimer vraiment l’événement « {t} » ?",
      "ev.deleted": "Supprimé : {t}. Il disparaîtra du site au bout d’une minute environ.",
      "ev.needTitle": "Veuillez renseigner le nom et le début de l’événement.",
      "ev.endBefore": "La fin de l’événement ne peut pas précéder son début.",
      "ev.saved": "Enregistré : {t}. Sur le site au bout d’une minute environ.",
      "ev.added": "Ajouté : {t}. Sur le site au bout d’une minute environ.",
      "ev.addBtn": "Ajouter l’événement",
      "blk.nameText": "Texte",
      "blk.namePhoto": "Photo",
      "blk.photoX": "Retirer la photo",
      "blk.ph": "Texte…",
    },
    it: {
      "page.title": "Aggiungi una notizia",
      "page.lead": "Dopo la pubblicazione la notizia compare sul sito, nella sezione <a href=\"/aktuality/\">Notizie</a>, dopo circa un minuto.",
      "login.title": "Accesso",
      "login.name": "Nome",
      "login.email": "E-mail",
      "login.password": "Password",
      "login.submit": "Accedi",
      "login.forgot": "Non ho una password o l’ho dimenticata",
      "code.title": "Codice ricevuto via e-mail",
      "code.text": "È il suo primo accesso da questo dispositivo o browser. Abbiamo inviato un codice di sei cifre al suo indirizzo e-mail (valido per 10 minuti).",
      "code.label": "Codice",
      "code.verify": "Verifica",
      "code.again": "Invia un nuovo codice",
      "forgot.title": "Imposta la password",
      "forgot.text": "Inserisca l’indirizzo e-mail che l’amministratore del sito ha registrato per lei. Le invieremo un link per impostare la password.",
      "forgot.send": "Invia il link",
      "forgot.back": "Torna all’accesso",
      "reset.title": "Nuova password",
      "pw.next": "Nuova password <small>(almeno 10 caratteri)</small>",
      "reset.save": "Salva la password",
      "pw.confirm": "Ripeta la nuova password",
      "pw.mismatch": "Le password non coincidono.",
      "pw.match": "Le password coincidono.",
      "pw.show": "Mostra la password",
      "pw.hide": "Nascondi la password",
      "pw.r.len": "Almeno 10 caratteri",
      "pw.r.lower": "Una lettera minuscola",
      "pw.r.upper": "Una lettera maiuscola",
      "pw.r.digit": "Una cifra",
      "pw.r.symbol": "Un simbolo, ad es. , . ? !",
      "pw.weak": "La password non soddisfa i requisiti: almeno 10 caratteri, una minuscola, una maiuscola, una cifra e un simbolo.",
      "set.title": "Impostazioni",
      "set.lang": "Lingua",
      "set.langNote": "La lingua dell’amministrazione e delle e-mail che il sito Le invia (inviti, codici, avvisi).",
      "set.alerts": "Avvisarmi via e-mail di un accesso da un nuovo indirizzo",
      "set.saved": "Salvato.",
      "ses.title": "Dispositivi connessi",
      "ses.text": "Dispositivi su cui ha effettuato l’accesso in questo momento. Disconnetta i dispositivi che non riconosce e cambi la password.",
      "ses.others": "Disconnetti tutti gli altri dispositivi",
      "ses.out": "Disconnetti",
      "ses.here": "questo dispositivo",
      "ses.since": "accesso {d}",
      "ses.seen": "ultima attività {d}",
      "ses.none": "Nessun altro dispositivo è connesso.",
      "ses.done": "Tutti gli altri dispositivi sono stati disconnessi.",
      "who.in": "Accesso effettuato:",
      "who.members": "Elenco dei membri",
      "who.out": "Esci",
      "help.summary": "Come aggiungere una notizia <small>– una breve guida</small>",
      "help.s1.t": "Titolo, data e categoria",
      "help.s1.p": "Scriva un titolo, controlli la data e selezioni una categoria. Con una data futura la notizia viene pubblicata da sola in quel giorno. <b>Bozza</b> la salva senza pubblicarla.",
      "help.s1.a": "Modulo con titolo, data di pubblicazione, categorie e l’opzione Bozza",
      "help.s2.t": "Testo e fotografie",
      "help.s2.p": "Il testo si compone di sezioni. I pulsanti <b>＋ Testo</b> e <b>＋ Foto</b> aggiungono un’altra sezione, le frecce cambiano l’ordine. La barra sopra il testo offre titolo, grassetto, corsivo, elenchi, citazione e link.",
      "help.s2.a": "Editor di testo con barra di formattazione e pulsanti per aggiungere testo e foto",
      "help.s3.t": "Foto principale, allegati e pubblicazione",
      "help.s3.p": "Può aggiungere una foto principale e allegati da scaricare (PDF, foto); vengono ridotti automaticamente. Il pulsante <b>Pubblica</b> invia la notizia. Compare sul sito dopo circa un minuto.",
      "help.s3.a": "Campo Riassunto, scelta della foto principale, allegati da scaricare e pulsante Pubblica",
      "help.s4.t": "Modifica ed eliminazione",
      "help.s4.p": "Nella scheda <b>Modifica o elimina</b> trova tutte le notizie. Può modificare ed eliminare le proprie; un amministratore tutte. Una modifica compare sul sito dopo circa un minuto.",
      "help.s4.a": "Elenco delle notizie con ricerca e pulsanti Modifica ed Elimina",
      "help.note": "Il testo in corso viene salvato di continuo in questo browser, quindi non lo perde nemmeno se chiude la pagina. Nella scheda <b>Account e utenti</b> cambia la password. Chiuda la guida facendo clic sul suo titolo; allo stesso modo la riapre in qualsiasi momento.",
      "tabs.label": "Che cosa desidera fare",
      "tab.new": "Nuova notizia",
      "tab.list": "Modifica o elimina",
      "tab.events": "Eventi",
      "tab.users": "Account e utenti",
      "list.search": "Cerca una notizia",
      "list.searchPh": "Parte del titolo o anno…",
      "list.hint": "Le notizie nuove e modificate compaiono nell’elenco dopo circa un minuto, quando il sito è stato ricostruito. Bozze e notizie programmate sono contrassegnate; si possono eliminare solo le proprie notizie (un amministratore tutte).",
      "pwf.title": "Cambia la mia password",
      "pwf.current": "Password attuale",
      "pwf.submit": "Cambia la password",
      "uf.title": "Aggiungi un utente",
      "uf.name": "Nome e cognome",
      "uf.password": "Password <small>(lasci vuoto: l’utente riceve un link via e-mail e imposta da sé la password)</small>",
      "uf.role": "Ruolo",
      "role.editor": "Redattore – scrive e modifica le proprie notizie; senza elenco dei membri",
      "role.admin": "Amministratore – tutte le notizie e l’elenco dei membri; non aggiunge né modifica utenti",
      "role.owner": "Amministratore principale – può fare tutto, anche aggiungere e modificare utenti",
      "role.members": "Solo elenco dei membri – senza notizie",
      "uf.lang": "Lingua dell’invito e delle e-mail",
      "uf.add": "Aggiungi",
      "uf.list": "Utenti",
      "ev.title": "Evento del calendario",
      "ev.editing": "Sta modificando:",
      "ev.cancel": "Annulla la modifica",
      "ev.name": "Nome <i aria-hidden=\"true\">*</i>",
      "ev.start": "Inizio <i aria-hidden=\"true\">*</i>",
      "ev.end": "Fine <small>(facoltativo)</small>",
      "ev.allday": "Tutto il giorno",
      "ev.place": "Luogo <small>(facoltativo)</small>",
      "ev.desc": "Descrizione <small>(facoltativa; una riga vuota separa i paragrafi)</small>",
      "ev.add": "Aggiungi evento",
      "ev.list": "Eventi",
      "ed.editing": "Sta modificando:",
      "ed.readonly": "Questa notizia è stata scritta da qualcun altro; solo l’autore o l’amministratore del sito può modificarla o eliminarla.",
      "ed.title": "Titolo <i aria-hidden=\"true\">*</i>",
      "ed.date": "Data e ora di pubblicazione",
      "ed.cats": "Categoria",
      "ed.draft": "Bozza <small>(salva, ma non pubblicare ancora)</small>",
      "ed.pin": "Fissa nella pagina iniziale <small>(annuncio importante)</small>",
      "ed.text": "Testo <i aria-hidden=\"true\">*</i>",
      "ed.locked": "Il testo di questa notizia più vecchia contiene elementi che l’editor non gestisce (ad esempio una foto con didascalia o una tabella). Il testo resta quindi invariato; può modificare titolo, data, categorie, riassunto, foto e allegati.",
      "ed.hint": "Componga il testo con sezioni (testo, foto); cambi l’ordine con le frecce o trascinando. Nel testo: titolo e sottotitolo, grassetto, corsivo, elenchi, citazioni e link. Due o più foto di seguito formano una griglia e la notizia compare anche nella galleria fotografica. Carattere e colori sono definiti dal design del sito.",
      "ed.excerpt": "Riassunto <small>(facoltativo – breve sintesi nell’elenco delle notizie; altrimenti si usa l’inizio del testo)</small>",
      "ed.photo": "Foto principale <small>(facoltativa – mostrata sopra il testo; ridotta prima dell’invio)</small>",
      "ed.pickPhoto": "Scegli una foto",
      "ed.attach": "Allegati da scaricare <small>(PDF o foto, al massimo 3 MB per file; foto e PDF più grandi vengono ridotti nel browser prima dell’invio)</small>",
      "ed.drop": "Trascini qui i file, oppure",
      "ed.pickFiles": "scelga i file",
      "ed.gs": "I PDF vengono ridotti da Ghostscript (licenza AGPL) eseguito in questo browser; il file non va da nessun’altra parte. <a href=\"/js/vendor/ghostscript-1.1.0/SOURCE.txt\">Sorgente e licenza</a>.",
      "done.back": "Torna alle notizie",
      "lang.label": "Lingua",
      "err.login": "L’e-mail (nome) o la password non sono corretti.",
      "err.busy": "Troppi tentativi. La preghiamo di riprovare tra un minuto.",
      "err.session": "La sessione è scaduta. La preghiamo di accedere di nuovo.",
      "err.type": "Si possono caricare solo foto (JPG, PNG, WebP) e PDF.",
      "err.size": "Il file è troppo grande anche dopo la riduzione (al massimo 3 MB). La preghiamo di dividere il PDF o di ridurne le immagini.",
      "err.missing": "La preghiamo di compilare titolo, data e testo.",
      "err.config": "Il modulo non è ancora configurato (sul server mancano le credenziali di accesso).",
      "err.gone": "Questo elemento non esiste più (forse qualcuno nel frattempo lo ha eliminato).",
      "err.forbidden": "Solo chi ha scritto questo elemento o l’amministratore del sito può modificarlo o eliminarlo.",
      "err.server": "Si è verificato un problema sul server. La preghiamo di riprovare tra poco.",
      "err.2fa": "Per questa azione serve l’accesso con un codice ricevuto via e-mail. Si disconnetta e acceda di nuovo.",
      "users.elsewhere": "Gli utenti si aggiungono e i loro accessi si modificano nell’amministrazione → Accessi (gli stessi account del sito principale).",
      "users.elsewhereLink": "Amministrazione → Accessi",
      "err.net": "Connessione non riuscita. Verifichi la connessione a Internet.",
      "who.admin": "amministratore",
      "link.expired": "Il link non è più valido. La preghiamo di farsene inviare uno nuovo.",
      "code.sent": "Il codice sta arrivando nella sua casella e-mail.",
      "code.bad": "Il codice non è corretto o è scaduto. La preghiamo di farsene inviare uno nuovo.",
      "forgot.sent": "Se l’indirizzo e-mail è registrato, tra poco arriverà un link (valido 3 giorni). Controlli anche la posta indesiderata.",
      "reset.done": "La password è impostata. Ora acceda con l’e-mail e la nuova password.",
      "reset.bad": "Il link non è più valido o la password ha meno di 10 caratteri.",
      "uf.pwNoMail": "Password <small>(almeno 10 caratteri; la comunichi di persona – le e-mail del sito non sono ancora configurate)</small>",
      "pw.wrong": "La password attuale non è corretta.",
      "pw.short": "La password è troppo corta (almeno 10 caratteri).",
      "user.exists": "Esiste già un utente con questo indirizzo e-mail.",
      "pw.changed": "La password è stata cambiata.",
      "user.added": "Aggiunto: {email}",
      "user.linkSent": " – il link per impostare la password è stato inviato via e-mail.",
      "role.ownerN": "Amministratore principale",
      "role.adminN": "Amministratore",
      "role.editorN": "Redattore",
      "role.membersN": "Solo elenco dei membri",
      "user.you": "(lei)",
      "user.roleOf": "Ruolo: {name}",
      "user.rename": "Rinomina",
      "user.renamePrompt": "Nome e cognome:",
      "user.newPw": "Nuova password",
      "user.newPwPrompt": "Nuova password per {name} (almeno 10 caratteri):",
      "user.pwDone": "Password cambiata.",
      "user.remove": "Rimuovi",
      "user.removeAsk": "Rimuovere l’utente {name}? Le sue notizie restano.",
      "user.loadFail": "Impossibile caricare l’elenco.",
      "list.edit": "Modifica",
      "list.del": "Elimina",
      "list.draft": "bozza",
      "list.scheduled": "programmata per il {d}",
      "list.pinned": "fissata nella pagina iniziale",
      "list.by": "Aggiunta da: {a}",
      "list.none": "Nessun risultato.",
      "list.more": "… e altre {n}. Restringa la ricerca.",
      "list.delAsk": "Eliminare davvero la notizia «{t}»? Scomparirà dal sito dopo circa un minuto.",
      "list.deleting": "Eliminazione in corso…",
      "list.deleted": "Eliminata: {t}. Scomparirà dal sito dopo circa un minuto.",
      "loading": "Caricamento…",
      "pub.save": "Salva le modifiche",
      "pub.publish": "Pubblica",
      "file.shrinkPdf": "Riduzione del PDF…",
      "file.preparing": "Preparazione…",
      "file.shrinkPhoto": "Riduzione della foto…",
      "file.uploading": "Caricamento in corso…",
      "file.done": "Caricato",
      "file.onSite": "Sul sito",
      "file.remove": "Rimuovi",
      "file.label": "Nome del link di download",
      "date.future": "Data futura: la notizia comparirà sul sito solo in quel giorno.",
      "blk.add": "Aggiungi una sezione",
      "blk.addText": "Aggiungi testo",
      "blk.text": "＋ Testo",
      "blk.addPhoto": "Aggiungi una foto",
      "blk.photo": "＋ Foto",
      "blk.photoMore": "＋ Aggiungi una foto",
      "blk.drag": "Trascina",
      "blk.up": "Sposta su",
      "blk.down": "Sposta giù",
      "blk.remove": "Elimina la sezione",
      "blk.removeAsk": "Eliminare questa sezione?",
      "blk.label": "Testo della sezione",
      "q.bold": "Grassetto",
      "q.italic": "Corsivo",
      "q.underline": "Sottolineato",
      "q.strike": "Barrato",
      "q.quote": "Citazione",
      "q.link": "Link",
      "q.image": "Inserisci una foto",
      "q.clean": "Rimuovi la formattazione",
      "q.ordered": "Elenco numerato",
      "q.bullets": "Elenco puntato",
      "photo.uploading": "Caricamento della foto…",
      "photo.uploadingN": "Caricamento delle foto… ({n})",
      "draft.restored": "È stata ripristinata una bozza in corso da questo browser.",
      "pub.wait": "La preghiamo di attendere il termine del caricamento dei file.",
      "pub.saving": "Salvataggio in corso…",
      "pub.publishing": "Pubblicazione in corso…",
      "done.draft": "Salvata come bozza",
      "done.scheduled": "Programmata",
      "done.saved": "Salvata",
      "done.published": "Pubblicata",
      "done.draftText": "La bozza non è visibile sul sito; la pubblica modificandola (tolga la spunta a «Bozza»). L’indirizzo sarà: ",
      "done.scheduledText": "La notizia comparirà sul sito nel giorno indicato (dopo la ricostruzione del sito): ",
      "done.text": "La modifica sarà sul sito dopo circa un minuto: ",
      "ev.past": "concluso",
      "ev.upcoming": "in arrivo",
      "ev.none": "Ancora nessun evento.",
      "ev.delAsk": "Eliminare davvero l’evento «{t}»?",
      "ev.deleted": "Eliminato: {t}. Scomparirà dal sito dopo circa un minuto.",
      "ev.needTitle": "La preghiamo di compilare nome e inizio dell’evento.",
      "ev.endBefore": "La fine dell’evento non può precedere il suo inizio.",
      "ev.saved": "Salvato: {t}. Sul sito dopo circa un minuto.",
      "ev.added": "Aggiunto: {t}. Sul sito dopo circa un minuto.",
      "ev.addBtn": "Aggiungi evento",
      "blk.nameText": "Testo",
      "blk.namePhoto": "Foto",
      "blk.photoX": "Rimuovi la foto",
      "blk.ph": "Testo…",
    },
  };
  // i18n:end
  var LANGS = ["cs", "en", "de", "fr", "it"], LOC = { cs: "cs-CZ", en: "en-GB", de: "de-DE", fr: "fr-FR", it: "it-IT" }, LKEY = "sprava-lang", lang = "cs", langSaved = false;
  try {
    var sl = localStorage.getItem(LKEY);
    if (LANGS.indexOf(sl) >= 0) { lang = sl; langSaved = true; }
    else (navigator.languages || [navigator.language]).some(function (l) { var c = String(l).slice(0, 2).toLowerCase(); if (LANGS.indexOf(c) >= 0) { lang = c; return true; } });
  } catch (e) {}
  function T(k, v) { var s = (I18N[lang] && I18N[lang][k]) || I18N.cs[k] || k; return v ? s.replace(/\{(\w+)\}/g, function (m, n) { return n in v ? v[n] : m; }) : s; }
  function ldate(iso) { var p = iso.slice(0, 10).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(LOC[lang], { day: "numeric", month: "numeric", year: "numeric" }); }
  var login = $("#ne-login"), app = $("#ne-app"), editor = $("#ne-editor"), manage = $("#ne-manage"), done = $("#ne-done"), events = $("#ne-events");
  // files: {sha, path, url, role, label} for new uploads, {url, role, label, ext} for files already on the site
  var state = { files: [], blobs: {}, editing: null, names: {}, defaultCategory: "", role: null, features: {}, user: null, event: null };
  var MAX = 3 * 1024 * 1024, DRAFT = "news-draft", GONE = "news-deleted";
  var PDF_SHRINK_FROM = 1024 * 1024, V = (document.currentScript && document.currentScript.src.split("?")[1]) || "";

  // the button just pressed shows a spinner while the server works on its request
  var pressed = null;
  root.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button"); if (b) pressed = b; }, true);
  function busy(p) {
    var b = pressed, end = function () { if (b && !--b.busy) { b.classList.remove("is-busy"); b.removeAttribute("aria-busy"); } };
    if (b) { b.busy = (b.busy || 0) + 1; b.classList.add("is-busy"); b.setAttribute("aria-busy", "true"); }
    p.then(end, end); return p;
  }
  // a page-level loader (CSS dot-cube) above a list while its first data is on the way; the returned function removes it
  function waiting(ul) {
    var l = document.createElement("div"); l.className = "ne-load"; l.setAttribute("role", "status"); l.setAttribute("aria-label", T("loading")); l.innerHTML = '<i class="ne-dots"></i>';
    ul.parentNode.insertBefore(l, ul); return function () { l.remove(); };
  }
  function call(data, onProgress) {
    return busy(new Promise(function (ok, fail) {
      var x = new XMLHttpRequest();
      x.open(data ? "POST" : "GET", API);
      x.setRequestHeader("Content-Type", "application/json");
      x.responseType = "json";
      if (onProgress) x.upload.onprogress = function (e) { if (e.lengthComputable) onProgress(e.loaded / e.total); };
      x.onload = function () { var r = x.response || {}; (x.status < 300 ? ok : fail)({ status: x.status, body: r }); };
      x.onerror = function () { fail({ status: 0, body: {} }); };
      x.send(data ? JSON.stringify(data) : null);
    }));
  }
  // Better Auth (/api/auth/*) when the server uses it; otherwise the older name + password sign-in in /api/news
  function authCall(path, data) {
    return busy(fetch("/api/auth/" + path, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data || {}) }))
      .then(function (r) { return r.ok ? r : Promise.reject({ status: r.status === 401 ? 401 : r.status, body: { error: r.status === 401 || r.status === 400 ? "login" : r.status === 429 ? "busy" : "server" } }); },
        function () { return Promise.reject({ status: 0, body: {} }); });
  }
  function msg(el, text, kind) { el.textContent = text || ""; el.hidden = !text; el.className = "ne-msg" + (kind ? " ne-msg--" + kind : ""); }
  // messages are looked up when used, so they follow the chosen language
  var ERR = {};
  ["login", "busy", "session", "type", "size", "missing", "config", "gone", "forbidden", "server", "2fa"].forEach(function (k) { Object.defineProperty(ERR, k, { get: function () { return T("err." + k); } }); });
  Object.defineProperty(ERR, 0, { get: function () { return T("err.net"); } });
  var errorOf = function (r) { return ERR[r.body && r.body.error] || ERR[r.status] || ERR.server; };
  function signedOut(r) { if (r && r.status === 401) show(null); }
  function today() { return now().slice(0, 10); }
  function now() { var n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); return n.toISOString().slice(0, 16); }

  // ---- the short guide: open on the first visit, then as the person left it
  var help = $("#ne-help");
  try { help.open = !localStorage.getItem("news-help-seen"); } catch (e) { help.open = true; }
  help.addEventListener("toggle", function () { try { if (help.open) localStorage.removeItem("news-help-seen"); else localStorage.setItem("news-help-seen", "1"); } catch (e) {} });

  // ---- sign-in
  // one of the signed-out forms: sign-in, code from e-mail (new device), ask for a password link, set the password
  function screen(form) { ["#ne-login", "#ne-code", "#ne-forgot", "#ne-reset"].forEach(function (s) { $(s).hidden = !form || $(s) !== form; }); }
  function show(user, info) {
    screen(user ? null : login); app.hidden = !user; done.hidden = true;
    if (!user) return;
    if (info && info.role === "members") return location.replace("/sprava/");  // member database only
    if (info && info.elsewhere) return location.replace(info.elsewhere);  // publishes only on the other site (api/_sites.js)
    state.user = user;
    if (info) {
      state.names = info.allCategories || {}; state.defaultCategory = info.defaultCategory || ""; state.role = info.role; state.features = info.features || {};
      categories(info.categories || []);
    }
    setWho(user);
    $("#ne-pin-field").hidden = !state.features.pin;
    $("#ne-tab-events").hidden = !state.features.events;
    $("#ne-tab-users").hidden = state.auth !== "better-auth"; state.owner = !!(info && info.owner); state.list = info && info.list;
    // a site that shares the main site's accounts (Česká maltézská mládež): people are added in /sprava/ → Přístupy
    if (info && info.manageUsersAt) { state.owner = false; $("#ne-users-elsewhere").hidden = !info.owner; $("#ne-users-elsewhere a").href = info.manageUsersAt; }
    $("#ne-admin-users").hidden = !state.owner;
    if (info && !info.mail) { var pw = $("#ne-user-form").password; pw.required = true; pw.previousElementSibling.setAttribute("data-i18n-html", "uf.pwNoMail"); applyLang(); }
    fetch("/api/members?action=me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
      $("#ne-sprava").hidden = !(m && m.access);
      if (m && m.user && !langSaved && LANGS.indexOf(m.user.lang) >= 0) setLang(m.user.lang, false);  // the language the person was invited in
    }, function () {});
    setup(); tab("new");
  }
  call().then(function (r) {
    state.auth = r.body.auth;
    if (state.auth === "better-auth") { var f = login.name; f.type = "email"; f.autocomplete = "email"; f.previousElementSibling.setAttribute("data-i18n", "login.email"); applyLang(); $("#ne-forgot-link").hidden = false; }
    show(r.body.user, r.body);
    // the link from the e-mail lands here as ?token=… (or ?error=INVALID_TOKEN when it expired)
    var q = new URLSearchParams(location.search);
    if (state.auth === "better-auth" && !r.body.user && (q.get("token") || q.get("error"))) {
      history.replaceState(null, "", location.pathname);
      if (q.get("token")) { state.resetToken = q.get("token"); screen($("#ne-reset")); }
      else { screen($("#ne-forgot")); msg($("#ne-forgot-msg"), T("link.expired"), "error"); }
    }
  }, function () { show(null); });
  login.addEventListener("submit", function (e) {
    e.preventDefault();
    var b = login.querySelector("button"); b.disabled = true; msg($("#ne-login-msg"));
    (state.auth === "better-auth"
      ? authCall("sign-in/email", { email: login.name.value.trim(), password: login.password.value }).then(function (res) { return res.json(); }).then(function (d) {
          if (!d.twoFactorRedirect) return call();
          login.password.value = ""; screen($("#ne-code")); $("#ne-code").code.focus();
          sendCode(); return Promise.reject({ code: true });  // the code form takes over
        })
      : call({ action: "login", name: login.name.value, password: login.password.value })).then(function (r) {
      login.password.value = ""; show(r.body.user, r.body);
    }, function (r) { if (!r.code) msg($("#ne-login-msg"), errorOf(r), "error"); }).then(function () { b.disabled = false; });
  });
  // a new device or browser: Better Auth's two-factor plugin e-mails a code; the browser is then trusted for 30 days
  function sendCode() {
    return authCall("two-factor/send-otp").then(function () { msg($("#ne-code-msg"), T("code.sent")); },
      function (r) { msg($("#ne-code-msg"), r.status === 401 || r.status === 400 ? ERR.session : errorOf(r), "error"); });
  }
  $("#ne-code-again").addEventListener("click", sendCode);
  $("#ne-code").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target, b = f.querySelector("button"); b.disabled = true;
    authCall("two-factor/verify-otp", { code: f.code.value.trim(), trustDevice: true }).then(function () { return call(); }).then(function (r) {
      f.reset(); msg($("#ne-code-msg")); show(r.body.user, r.body);
    }, function (r) { msg($("#ne-code-msg"), r.status === 400 || r.status === 401 ? T("code.bad") : errorOf(r), "error"); })
      .then(function () { b.disabled = false; });
  });
  // first sign-in or a forgotten password: a link by e-mail, then a new password here
  $("#ne-forgot-open").addEventListener("click", function () { $("#ne-forgot").email.value = login.name.value.trim(); msg($("#ne-forgot-msg")); screen($("#ne-forgot")); });
  $("#ne-forgot-back").addEventListener("click", function () { screen(login); });
  $("#ne-forgot").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target;
    authCall("request-password-reset", { email: f.email.value.trim().toLowerCase(), redirectTo: location.origin + location.pathname }).then(function () {
      msg($("#ne-forgot-msg"), T("forgot.sent"));
    }, function (r) { msg($("#ne-forgot-msg"), errorOf(r), "error"); });
  });
  $("#ne-reset").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target;
    authCall("reset-password", { token: state.resetToken, newPassword: f.next.value }).then(function () {
      f.reset(); screen(login); msg($("#ne-login-msg"), T("reset.done"));
    }, function (r) { msg($("#ne-reset-msg"), r.status === 400 ? T("reset.bad") : errorOf(r), "error"); });
  });
  $("#ne-logout").addEventListener("click", function () { (state.auth === "better-auth" ? authCall("sign-out") : call({ action: "logout" })).then(function () { location.reload(); }); });

  function categories(cats) {
    var box = $("#ne-cats");
    if (box.childElementCount) return;
    cats.forEach(function (c) { addCategory(c[0], c[1]); });
  }
  function addCategory(key, name) {
    if ($('#ne-cats input[value="' + key + '"]')) return;
    var l = document.createElement("label");
    l.innerHTML = '<input type="checkbox" name="cat"> <span></span>';
    l.querySelector("input").value = key; l.querySelector("span").textContent = name || key;
    $("#ne-cats").appendChild(l);
  }
  function setCategories(list) {
    list.forEach(function (c) { addCategory(c, state.names[c]); });
    root.querySelectorAll('#ne-cats input').forEach(function (i) { i.checked = list.indexOf(i.value) >= 0; });
  }

  // ---- tabs: write a new post / pick one to edit or delete / events
  function tab(which) {
    ["new", "list", "events", "users"].forEach(function (t) { $("#ne-tab-" + t).setAttribute("aria-selected", String(t === which)); });
    editor.hidden = which !== "new"; manage.hidden = which !== "list"; events.hidden = which !== "events"; $("#ne-users").hidden = which !== "users";
    if (which === "users" && state.owner) loadUsers();
    if (which === "users") { loadSessions(); loadSettings(); }
    if (which === "list") loadList();
    if (which === "events") loadEvents();
  }
  $("#ne-tab-new").addEventListener("click", function () { if (state.editing) reset(); tab("new"); });
  $("#ne-tab-list").addEventListener("click", function () { tab("list"); });
  $("#ne-tab-events").addEventListener("click", function () { tab("events"); });
  $("#ne-tab-users").addEventListener("click", function () { tab("users"); });

  // ---- own password and (admins) the people who may sign in: Better Auth's /api/auth/* endpoints
  function authJson(path, data) {
    return busy(fetch("/api/auth/" + path, data ? { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) } : { credentials: "same-origin" }))
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return r.ok ? b : Promise.reject(b.code || b.message || r.status); }); });
  }
  // an eye button on every password field, and "new password again" checked against "new password" as you type
  var EYE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="eye-off" d="M4 4l16 16"/></svg>';
  Array.prototype.forEach.call(document.querySelectorAll('#news-app input[type="password"]'), function (inp) {
    var wrap = document.createElement("span"), b = document.createElement("button");
    wrap.className = "pw-wrap"; inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp);
    b.type = "button"; b.className = "pw-eye"; b.innerHTML = EYE; b.setAttribute("aria-pressed", "false");
    var set = function (shown) {
      inp.type = shown ? "text" : "password"; b.setAttribute("aria-pressed", String(shown));
      b.setAttribute("data-i18n-aria", shown ? "pw.hide" : "pw.show"); b.setAttribute("aria-label", T(shown ? "pw.hide" : "pw.show"));
    };
    set(false); wrap.appendChild(b);
    b.addEventListener("click", function () { set(inp.type === "password"); inp.focus(); });
    inp.form.addEventListener("reset", function () { set(false); });
  });
  var PW_RULES = [["len", /^.{10,}$/], ["lower", /[a-z]/], ["upper", /[A-Z]/], ["digit", /[0-9]/], ["symbol", /[^A-Za-z0-9\s]/]];
  ["#ne-reset", "#ne-pw-form"].forEach(function (id) {
    var f = $(id), out = document.createElement("p");
    out.className = "ne-pw-match"; out.setAttribute("aria-live", "polite");
    f.confirm.closest("label").after(out);
    // the same rules as api/_auth.mjs: 10+ characters, lower and upper case, a digit, a symbol
    var rules = document.createElement("ul"); rules.className = "pw-rules"; f.next.closest("label").after(rules);
    var rule = function () {
      var v = f.next.value, all = true;
      rules.textContent = "";
      PW_RULES.forEach(function (r) { var ok = r[1].test(v), li = document.createElement("li"); all = all && ok; li.className = ok ? "ok" : "no"; li.textContent = T("pw.r." + r[0]); rules.appendChild(li); });
      f.next.setCustomValidity(all ? "" : T("pw.weak"));
    };
    rule(); f.next.addEventListener("input", rule); f.addEventListener("reset", function () { setTimeout(rule); });
    var check = function () {
      var ok = f.confirm.value === f.next.value;
      f.confirm.setCustomValidity(ok ? "" : T("pw.mismatch"));
      out.textContent = f.confirm.value ? T(ok ? "pw.match" : "pw.mismatch") : ""; out.classList.toggle("is-bad", !ok);
    };
    f.next.addEventListener("input", check); f.confirm.addEventListener("input", check);
    f.addEventListener("reset", function () { out.textContent = ""; f.confirm.setCustomValidity(""); });
  });
  var AUTH_ERR = {};
  [["INVALID_PASSWORD", "pw.wrong"], ["PASSWORD_TOO_SHORT", "pw.short"], ["PASSWORD_TOO_WEAK", "pw.weak"], ["USER_ALREADY_EXISTS", "user.exists"], ["USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", "user.exists"]].forEach(function (p) { Object.defineProperty(AUTH_ERR, p[0], { get: function () { return T(p[1]); } }); });
  var authErr = function (e) { return AUTH_ERR[e] || (typeof e === "string" && /password/i.test(e) ? AUTH_ERR.INVALID_PASSWORD : ERR.server); };
  $("#ne-pw-form").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target, m = $("#ne-pw-msg");
    authJson("change-password", { currentPassword: f.current.value, newPassword: f.next.value, revokeOtherSessions: true })
      .then(function () { f.reset(); msg(m, T("pw.changed")); }, function (er) { msg(m, authErr(er), "error"); });
  });
  $("#ne-user-form").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target, m = $("#ne-user-msg");
    var email = f.email.value.trim().toLowerCase(), pw = f.password.value, body = { name: f.name.value.trim(), email: email, role: f.role.value, data: { lang: f.lang.value } };
    if (pw) body.password = pw;  // without one, the new person sets it from the link we e-mail
    authJson("admin/create-user", body)
      .then(function () { return pw ? null : authJson("request-password-reset", { email: email, redirectTo: location.origin + location.pathname }); })
      .then(function () { msg(m, T("user.added", { email: email }) + (pw ? "" : T("user.linkSent"))); f.reset(); loadUsers(); }, function (er) { msg(m, authErr(er), "error"); });
  });
  var RANK = ["owner", "admin", "editor", "members"], RANK_NAME = {};
  RANK.forEach(function (k) { Object.defineProperty(RANK_NAME, k, { get: function () { return T("role." + k + "N"); } }); });
  // Nastavení (api/_sessions.mjs /my-settings): own language (also for the e-mails the website sends) and the new-address alert
  function loadSettings() {
    authJson("my-settings").then(function (d) { $("#ne-set-lang").value = d.lang; $("#ne-set-alerts").checked = d.newIpAlerts !== false; }, function () {});
  }
  function saveSetting(patch) {
    authJson("my-settings", patch).then(function () { msg($("#ne-set-msg"), T("set.saved")); }, function (er) { msg($("#ne-set-msg"), authErr(er), "error"); });
  }
  $("#ne-set-lang").addEventListener("change", function (e) { setLang(e.target.value); saveSetting({ lang: e.target.value }); });
  $("#ne-set-alerts").addEventListener("change", function (e) { saveSetting({ newIpAlerts: e.target.checked }); });
  // signed-in devices (api/_sessions.mjs): where the account is signed in, sign out one or all the others
  function loadSessions() {
    var ul = $("#ne-ses-list"), m = $("#ne-ses-msg");
    var when = function (iso) { return new Date(iso).toLocaleString(LOC[lang], { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }); };
    authJson("my-sessions").then(function (list) {
      ul.innerHTML = "";
      list.forEach(function (x) {
        var li = document.createElement("li"), b = document.createElement("b"), sm = document.createElement("small");
        b.textContent = x.device + (x.current ? " · " + T("ses.here") : "");
        sm.textContent = [x.place, x.ip, T("ses.since", { d: when(x.created) }), x.current ? "" : T("ses.seen", { d: when(x.seen) })].filter(Boolean).join(" · ");
        li.append(b, document.createElement("br"), sm);
        if (!x.current) {
          var o = document.createElement("button"); o.type = "button"; o.className = "link-btn"; o.textContent = T("ses.out");
          o.onclick = function () { authJson("revoke-my-session", { id: x.id }).then(loadSessions, function (er) { msg(m, authErr(er), "error"); }); };
          li.appendChild(o);
        }
        ul.appendChild(li);
      });
      $("#ne-ses-others").hidden = list.length < 2;
      msg(m, list.length < 2 ? T("ses.none") : "");
    }, function () { ul.innerHTML = ""; });
  }
  $("#ne-ses-others").addEventListener("click", function () {
    authJson("revoke-other-sessions", {}).then(function () { loadSessions(); msg($("#ne-ses-msg"), T("ses.done")); }, function (er) { msg($("#ne-ses-msg"), authErr(er), "error"); });
  });
  function loadUsers() {
    var ul = $("#ne-user-list"), done = waiting(ul);
    authJson("admin/list-users?limit=200").then(function (r) {
      ul.innerHTML = "";
      var rank = function (u) { var k = RANK.indexOf(u.role); return k < 0 ? RANK.length : k; };
      (r.users || []).sort(function (a, b) { return rank(a) - rank(b) || a.name.localeCompare(b.name, "cs"); }).forEach(function (u) {
        var li = document.createElement("li"), me = u.name === state.user, acts = document.createElement("span");
        li.innerHTML = "<span><b></b> <small></small></span>"; acts.className = "ne-user-acts";
        li.querySelector("b").textContent = u.name; li.querySelector("small").textContent = u.email + (me ? " · " + (RANK_NAME[u.role] || u.role) + " " + T("user.you") : "");
        var link = function (text, fn) { var b = document.createElement("button"); b.type = "button"; b.className = "link-btn"; b.textContent = text; b.onclick = fn; acts.appendChild(b); };
        var fail = function (er) { alert(authErr(er)); loadUsers(); };
        if (!me) {  // nobody changes their own rank or removes themselves, so one main administrator always remains
          var sel = document.createElement("select"); sel.setAttribute("aria-label", T("user.roleOf", { name: u.name }));
          RANK.forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = RANK_NAME[k]; o.selected = k === u.role; sel.appendChild(o); });
          sel.onchange = function () { authJson("admin/set-role", { userId: u.id, role: sel.value }).then(loadUsers, fail); };
          acts.appendChild(sel);
        }
        link(T("user.rename"), function () {
          var name = (prompt(T("user.renamePrompt"), u.name) || "").trim().slice(0, 100);
          if (name && name !== u.name) authJson("admin/update-user", { userId: u.id, data: { name: name } }).then(function () { if (me) location.reload(); else loadUsers(); }, fail);
        });
        if (!me) {
          link(T("user.newPw"), function () { var pw = prompt(T("user.newPwPrompt", { name: u.name })); if (pw) authJson("admin/set-user-password", { userId: u.id, newPassword: pw }).then(function () { alert(T("user.pwDone")); }, function (er) { alert(authErr(er)); }); });
          link(T("user.remove"), function () { if (confirm(T("user.removeAsk", { name: u.name }))) authJson("admin/remove-user", { userId: u.id }).then(loadUsers, fail); });
        }
        li.appendChild(acts); ul.appendChild(li);
      });
    }, function () { ul.innerHTML = "<li>" + T("user.loadFail") + "</li>"; }).then(done);
  }

  // ---- the list of posts (written by the build; a minute behind after changes)
  var posts = null;
  function gone() { try { return JSON.parse(sessionStorage.getItem(GONE) || "[]"); } catch (e) { return []; } }
  function loadList() {
    if (posts) return render();
    var done = waiting($("#ne-list"));
    fetch(state.list || "/pridat-aktualitu/news.json", { cache: "no-store", credentials: "same-origin" }).then(function (r) { return r.json(); })  // Mládež: the list is served behind the session
      .then(function (d) { posts = d.posts || d; render(); }, function () { msg($("#ne-list-msg"), ERR[0], "error"); }).then(done);
  }
  var fmt = ldate;
  function mine(p) { return state.role === "admin" || !p.author || p.author === state.user || p.editedBy === state.user; }
  function render() {
    var q = $("#ne-search").value.trim().toLowerCase(), hidden = gone(), ul = $("#ne-list");
    var items = posts.filter(function (p) { return hidden.indexOf(p.path) < 0 && (!q || (p.title + " " + p.date).toLowerCase().indexOf(q) >= 0); });
    ul.innerHTML = "";
    items.slice(0, 60).forEach(function (p) {
      var li = document.createElement("li");
      li.innerHTML = '<time></time><div><a class="ne-list-title" target="_blank" rel="noopener"></a><span class="ne-list-meta"></span></div>' +
        '<button type="button" class="btn btn--ghost ne-small"></button><button type="button" class="link-btn ne-del"></button>';
      li.querySelector(".btn").textContent = T("list.edit"); li.querySelector(".ne-del").textContent = T("list.del");
      li.querySelector("time").textContent = fmt(p.date);
      var a = li.querySelector("a"); a.href = p.url; a.textContent = p.title;
      var flags = [];
      if (p.draft) flags.push(T("list.draft")); else if (p.date.slice(0, 10) > today()) flags.push(T("list.scheduled", { d: fmt(p.date) }));
      if (p.pinned) flags.push(T("list.pinned"));
      li.querySelector(".ne-list-meta").textContent = (p.author ? T("list.by", { a: p.author }) : "") + (flags.length ? (p.author ? " · " : "") + flags.join(" · ") : "");
      if (p.draft || p.date.slice(0, 10) > today()) li.classList.add("ne-unpublished");
      li.querySelector(".btn").onclick = function () { edit(p); };
      var delBtn = li.querySelector(".ne-del");
      if (mine(p)) delBtn.onclick = function () { del(p, li); }; else delBtn.remove();
      ul.appendChild(li);
    });
    if (!items.length) ul.innerHTML = '<li class="ne-list-empty">' + T("list.none") + "</li>";
    else if (items.length > 60) { var more = document.createElement("li"); more.className = "ne-list-empty"; more.textContent = T("list.more", { n: items.length - 60 }); ul.appendChild(more); }
  }
  $("#ne-search").addEventListener("input", function () { if (posts) render(); });

  function del(p, li) {
    if (!confirm(T("list.delAsk", { t: p.title }))) return;
    var b = li.querySelector(".ne-del"); b.disabled = true; b.textContent = T("list.deleting");
    call({ action: "delete", path: p.path }).then(function () {
      try { sessionStorage.setItem(GONE, JSON.stringify(gone().concat(p.path))); } catch (e) {}
      li.remove(); msg($("#ne-list-msg"), T("list.deleted", { t: p.title }));
    }, function (r) { b.disabled = false; b.textContent = T("list.del"); msg($("#ne-list-msg"), errorOf(r), "error"); signedOut(r); });
  }

  function edit(p) {
    msg($("#ne-list-msg"), T("loading"));
    call({ action: "load", path: p.path }).then(function (r) {
      msg($("#ne-list-msg"));
      var d = r.body; reset(); state.editing = d;
      $("#ne-title").value = d.title; $("#ne-date").value = d.date; $("#ne-excerpt").value = d.excerpt || "";
      $("#ne-draft-flag").checked = !!d.draft; $("#ne-pin").checked = !!d.pinned;
      setCategories(d.categories);
      var locked = !d.editable;
      $("#ne-text").hidden = locked; $("#ne-locked").hidden = !locked;
      $("#ne-text-hint").hidden = locked;
      if (locked) $("#ne-locked-text").innerHTML = d.body; // the site's own published HTML
      else setHTML(d.body);
      if (d.image) existingPhoto(d.image);
      d.attachments.forEach(function (a) { attachmentRow({ name: a.label + "." + a.ext.toLowerCase() }, { url: a.url, role: "attachment", label: a.label, ext: a.ext }); });
      $("#ne-editing").hidden = false; var link = $("#ne-editing-link"); link.href = d.url; link.textContent = d.title;
      $("#ne-readonly").hidden = d.mayChange !== false;
      pubLabel(); $("#ne-publish").disabled = d.mayChange === false;
      tab("new"); window.scrollTo(0, root.offsetTop);
    }, function (r) { msg($("#ne-list-msg"), errorOf(r), "error"); signedOut(r); });
  }
  function reset() {
    state.files = []; state.blobs = {}; state.editing = null;
    editor.reset(); setDate(); setCategories([state.defaultCategory]);
    if (ready) setHTML("");
    $("#ne-photo-box").innerHTML = ""; $("#ne-file-list").innerHTML = "";
    $("#ne-text").hidden = false; $("#ne-locked").hidden = true; $("#ne-text-hint").hidden = false;
    $("#ne-editing").hidden = true; $("#ne-readonly").hidden = true; pubLabel(); $("#ne-publish").disabled = false;
    ["#ne-msg", "#ne-draft", "#ne-inline-msg"].forEach(function (s) { msg($(s)); });
  }
  $("#ne-cancel").addEventListener("click", function () { reset(); restore(); tab("list"); });

  // ---- files: shrink photos and large PDFs, then upload with a progress bar
  // PDFs over 1 MB go through Ghostscript compiled to WebAssembly (/js/pdf-worker.js, as on lurdy.eu), in this browser;
  // one worker per file, dropped afterwards. The smaller file is used only if Ghostscript actually made it smaller.
  function shrinkPdf(file) {
    if (file.size < PDF_SHRINK_FROM || !window.Worker) return Promise.resolve(file);
    return file.arrayBuffer().then(function (buf) {
      return new Promise(function (ok) {
        var w = new Worker("/js/pdf-worker.js?" + V, { type: "module" });
        var done = function (out) { w.terminate(); ok(out && out.length && out.length < file.size ? new File([out], file.name, { type: "application/pdf" }) : file); };
        w.onmessage = function (e) { done(e.data); };
        w.onerror = function () { done(null); };
        w.postMessage(buf, [buf]);
      });
    }).catch(function () { return file; });
  }
  function shrink(file) {
    if (file.type === "application/pdf") return shrinkPdf(file);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file).then(function (bmp) {
      var s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)), c = document.createElement("canvas");  // the pages never show a photo larger
      c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
      var as = function (type, q) { return new Promise(function (ok) { c.toBlob(ok, type, q); }); };
      return as("image/webp", 0.8).then(function (b) { return b && b.type === "image/webp" ? b : as("image/jpeg", 0.82); }) // Safari cannot write WebP
        .then(function (b) { return b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, "") + (b.type === "image/webp" ? ".webp" : ".jpg"), { type: b.type }) : file; });  // keep the original if it was already smaller
    }).catch(function () { return file; });
  }
  function toBase64(blob) {
    return new Promise(function (ok, fail) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(",")[1]); }; r.onerror = fail; r.readAsDataURL(blob); });
  }
  function upload(file, role, row) {
    var bar = row && row.querySelector("progress"), note = row && row.querySelector(".ne-file-state");
    if (note) note.textContent = file.type === "application/pdf" ? (file.size >= PDF_SHRINK_FROM ? T("file.shrinkPdf") : T("file.preparing")) : T("file.shrinkPhoto");
    return shrink(file).then(function (f) {
      if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.type)) throw { status: 400, body: { error: "type" } };
      if (f.size > MAX) throw { status: 413, body: { error: "size" } };
      return toBase64(f).then(function (data) {
        if (note) note.textContent = T("file.uploading");
        return call({ action: "upload", name: f.name, type: f.type, data: data }, function (p) { if (bar) bar.value = p * 100; });
      });
    }).then(function (r) {
      var item = { sha: r.body.sha, path: r.body.path, url: r.body.url, role: role, label: file.name.replace(/\.\w+$/, "") };
      state.files.push(item);
      if (bar) bar.value = 100;
      if (note) note.textContent = T("file.done");
      return item;
    }, function (r) {
      if (note) { note.textContent = errorOf(r); row.classList.add("is-error"); }
      signedOut(r);
      throw r;
    });
  }
  function fileRow(name, list) {
    var li = document.createElement("li");
    li.innerHTML = '<span class="ne-file-name"></span><progress max="100" value="0"></progress><span class="ne-file-state"></span><button type="button" class="link-btn"></button>';
    li.querySelector("button").textContent = T("file.remove");
    li.querySelector(".ne-file-name").textContent = name;
    list.appendChild(li);
    return li;
  }
  function drop(item) { var i = state.files.indexOf(item); if (i >= 0) state.files.splice(i, 1); }

  // main photo (a new one replaces the current one)
  var photoInput = $("#ne-photo"), photoBox = $("#ne-photo-box");
  function clearPhoto() { state.files = state.files.filter(function (x) { return x.role !== "image"; }); photoBox.innerHTML = ""; }
  function photoRow(name, src) {
    clearPhoto();
    var row = fileRow(name, photoBox), img = document.createElement("img"); img.src = src; img.alt = ""; row.prepend(img);
    row.querySelector("button").onclick = clearPhoto;
    return row;
  }
  function existingPhoto(url) {
    var row = photoRow(decodeURIComponent(url.split("/").pop()), url);
    row.querySelector("progress").hidden = true; row.querySelector(".ne-file-state").textContent = T("file.onSite");
    state.files.push({ url: url, role: "image" });
  }
  photoInput.addEventListener("change", function () {
    var f = photoInput.files[0]; photoInput.value = "";
    if (f) upload(f, "image", photoRow(f.name, URL.createObjectURL(f))).catch(function () {});
  });

  // attachments, also by drag and drop
  var attInput = $("#ne-files"), attList = $("#ne-file-list"), dropZone = $("#ne-drop");
  function attachmentRow(f, existing) {
    var row = fileRow(f.name, attList), item = existing || null;
    var label = document.createElement("input"); label.type = "text"; label.value = existing ? existing.label : f.name.replace(/\.\w+$/, "");
    label.setAttribute("aria-label", T("file.label"));
    row.insertBefore(label, row.querySelector("progress"));
    row.querySelector(".ne-file-name").hidden = true;
    label.addEventListener("input", function () { if (item) item.label = label.value; });
    row.querySelector("button").onclick = function () { if (item) drop(item); row.remove(); };
    if (existing) { state.files.push(existing); row.querySelector("progress").hidden = true; row.querySelector(".ne-file-state").textContent = T("file.onSite"); }
    else upload(f, "attachment", row).then(function (it) { item = it; it.label = label.value; }, function () {});
  }
  attInput.addEventListener("change", function () { Array.prototype.forEach.call(attInput.files, function (f) { attachmentRow(f); }); attInput.value = ""; });
  ["dragenter", "dragover"].forEach(function (t) { dropZone.addEventListener(t, function (e) { e.preventDefault(); dropZone.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (t) { dropZone.addEventListener(t, function (e) { e.preventDefault(); dropZone.classList.remove("is-over"); }); });
  dropZone.addEventListener("drop", function (e) { if (e.dataTransfer) Array.prototype.forEach.call(e.dataTransfer.files, function (f) { attachmentRow(f); }); });

  // ---- the text editor (Quill): only formats the site already styles, so every post looks like the rest of the site
  var ready = false, box = $("#ne-text"), saveT;
  function setDate() { $("#ne-date").value = now(); }
  function later() { clearTimeout(saveT); saveT = setTimeout(save, 800); }
  function setup() {
    if (ready || !window.Quill) return;
    // Quill's image format accepts only http(s) and data sources and turns anything else into "//:0"; the preview of a
    // photo being uploaded is a blob: URL, which must survive until it is swapped for the uploaded /media/ address
    var Img = Quill.import("formats/image");
    Quill.register(class extends Img { static sanitize(url) { return /^blob:/.test(url) ? url : Img.sanitize(url); } }, true);
    ready = true; setDate(); setCategories([state.defaultCategory]); setHTML("");
    restore();
    editor.querySelectorAll("#ne-title, #ne-excerpt").forEach(function (el) { el.addEventListener("input", later); });
    $("#ne-date").addEventListener("input", dateHint); dateHint();
    // drag a block by its handle (only the handle makes it draggable, so selecting text inside still works)
    var dragged = null;
    box.addEventListener("dragstart", function (e) { dragged = e.target.closest && e.target.closest(".ne-block"); if (dragged) { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", ""); dragged.classList.add("is-drag"); } });
    box.addEventListener("dragover", function (e) {
      if (!dragged) return; e.preventDefault();
      var t = e.target.closest && e.target.closest(".ne-block"); if (!t || t === dragged) return;
      var r = t.getBoundingClientRect(); box.insertBefore(dragged, e.clientY > r.top + r.height / 2 ? t.nextSibling : t);
    });
    box.addEventListener("dragend", function () { if (dragged) { dragged.classList.remove("is-drag"); dragged.draggable = false; dragged = null; layout(); } });
    box.addEventListener("drop", function (e) { if (dragged) e.preventDefault(); });
  }
  function dateHint() { var d = $("#ne-date").value; $("#ne-date-hint").textContent = d && d.slice(0, 10) > today() ? T("date.future") : ""; }

  // ---- blocks, like WordPress: text (its own Quill) and photos, reordered by arrows or by dragging the handle
  function btn(cls, label, text) { var b = document.createElement("button"); b.type = "button"; b.className = cls; b.setAttribute("aria-label", label); b.title = label; b.textContent = text; return b; }
  // names of the block buttons by class, so relabel() can retranslate blocks that already exist
  var BTN = { "ne-ins-text": ["blk.addText", "blk.text"], "ne-ins-photo": ["blk.addPhoto", "blk.photo"], "ne-up": ["blk.up"], "ne-down": ["blk.down"], "ne-remove": ["blk.remove"], "ne-photo-more": ["blk.addPhoto", "blk.photoMore"], "ne-photo-x": ["blk.photoX"] };
  var QTIP = { "ql-bold": "q.bold", "ql-italic": "q.italic", "ql-underline": "q.underline", "ql-strike": "q.strike", "ql-blockquote": "q.quote", "ql-link": "q.link", "ql-image": "q.image", "ql-clean": "q.clean" };
  function inserter() {
    var d = document.createElement("div"); d.className = "ne-ins"; d.setAttribute("role", "group"); d.setAttribute("aria-label", T("blk.add"));
    var t = btn("ne-ins-text", T("blk.addText"), T("blk.text")), p = btn("ne-ins-photo", T("blk.addPhoto"), T("blk.photo"));
    t.onclick = function () { block("text", "", d).q.focus(); later(); };
    p.onclick = function () { pickPhotos(block("photo", [], d)); };
    d.append(t, p); return d;
  }
  function blocks() { return Array.prototype.slice.call(box.querySelectorAll(":scope > .ne-block")); }
  // one inserter after every block (and one in an empty editor); arrows disabled at the ends
  function layout() {
    box.querySelectorAll(":scope > .ne-ins").forEach(function (i) { i.remove(); });
    var bs = blocks(); box.insertBefore(inserter(), bs[0] || null);
    bs.forEach(function (b, i) { box.insertBefore(inserter(), b.nextSibling); b.querySelector(".ne-up").disabled = i === 0; b.querySelector(".ne-down").disabled = i === bs.length - 1; });
  }
  function block(kind, content, before) {
    var el = document.createElement("div"); el.className = "ne-block ne-block--" + kind; el.kind = kind;
    var bar = document.createElement("div"); bar.className = "ne-block-bar";
    var h = document.createElement("span"); h.className = "ne-handle"; h.textContent = "⠿"; h.title = T("blk.drag"); h.setAttribute("aria-hidden", "true");
    h.onmousedown = function () { el.draggable = true; }; h.onmouseup = function () { el.draggable = false; };
    var name = document.createElement("span"); name.className = "ne-block-name"; name.textContent = kind === "text" ? T("blk.nameText") : T("blk.namePhoto");
    var up = btn("ne-up", T("blk.up"), "↑"), down = btn("ne-down", T("blk.down"), "↓"), del = btn("ne-remove", T("blk.remove"), "✕");
    up.onclick = function () { var p = el.previousElementSibling && el.previousElementSibling.previousElementSibling; if (p) { box.insertBefore(el, p); layout(); up.disabled ? down.focus() : up.focus(); later(); } };
    down.onclick = function () { var n = el.nextElementSibling && el.nextElementSibling.nextElementSibling; if (n) { box.insertBefore(el, n.nextSibling); layout(); down.disabled ? up.focus() : down.focus(); later(); } };
    del.onclick = function () {
      var empty = kind === "text" ? !el.q.getText().trim() && !el.q.root.querySelector("img") : !el.querySelector("img");
      if (!empty && !confirm(T("blk.removeAsk"))) return;
      el.remove(); layout(); (box.querySelector(".ne-ins button") || box).focus(); later();
    };
    bar.append(h, name, up, down, del); el.appendChild(bar);
    var body = document.createElement("div"); body.className = "ne-block-body"; el.appendChild(body);
    box.insertBefore(el, before || null);
    if (kind === "text") textBlock(el, body, content); else photoBlock(el, body, content);
    if (before !== false) layout();
    return el;
  }
  function textBlock(el, body, html) {
    var q = el.q = new Quill(body, {
      theme: "snow", placeholder: T("blk.ph"),
      formats: ["header", "bold", "italic", "underline", "strike", "link", "list", "blockquote", "image"],
      modules: { toolbar: { container: [[{ header: [2, 3, false] }], ["bold", "italic", "underline", "strike"], [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "link", "image"], ["clean"]],
        handlers: { image: function () { insertImage(q); } } } }
    });
    body.querySelector(".ql-editor").setAttribute("aria-label", T("blk.label"));
    relabel(el);
    // pasted pictures would arrive as huge inline data; they are left out, photos go in through the photo button
    q.clipboard.addMatcher("IMG", function (node, delta) { return /^(blob:|\/media\/)/.test(node.getAttribute("src") || "") ? delta : new (Quill.import("delta"))(); });
    if (html) q.clipboard.dangerouslyPasteHTML(html);
    q.on("text-change", later);
  }
  function photoBlock(el, body, srcs) {
    var list = document.createElement("div"); list.className = "ne-photos";
    var more = btn("ne-photo-more", T("blk.addPhoto"), T("blk.photoMore")); more.onclick = function () { pickPhotos(el); };
    body.append(list, more); srcs.forEach(function (s) { photo(el, s); });
  }
  function photo(el, src) {
    var f = document.createElement("figure"), img = document.createElement("img"), x = btn("ne-photo-x", T("blk.photoX"), "✕");
    img.src = src; img.alt = ""; x.onclick = function () { f.remove(); later(); };
    f.append(img, x); el.querySelector(".ne-photos").appendChild(f);
  }
  function pickPhotos(el) {
    chooseImages(function (files) {
      files.forEach(function (f) { var local = URL.createObjectURL(f); photo(el, local); track(f, local); });
      later();
    });
  }
  function chooseImages(then) {
    var i = document.createElement("input"); i.type = "file"; i.accept = "image/jpeg,image/png,image/webp"; i.multiple = true;
    i.onchange = function () { var files = Array.prototype.slice.call(i.files); if (files.length) then(files); };
    i.click();
  }
  var pending = 0;
  function track(f, local) {
    var note = $("#ne-inline-msg"); pending++; msg(note, pending > 1 ? T("photo.uploadingN", { n: pending }) : T("photo.uploading"));
    upload(f, "inline").then(function (it) { state.blobs[local] = it.url; if (--pending === 0) msg(note); }, function (r) { pending--; msg(note, errorOf(r), "error"); });
  }
  // a photo inside a text block, as before; two or more on their own lines become a grid on the site
  function insertImage(q) {
    chooseImages(function (files) {
      var at = q.getSelection(true).index;
      files.forEach(function (f) {
        var local = URL.createObjectURL(f);
        q.insertEmbed(at, "image", local, "user"); at += 1;
        if (files.length > 1) { q.insertText(at, "\n", "user"); at += 1; }
        track(f, local);
      });
      q.setSelection(at);
    });
  }
  // the post body: each block's HTML in order, photos as <p><img></p> (the same HTML the site and the server know)
  function getHTML() {
    return blocks().map(function (b) {
      if (b.kind === "photo") return Array.prototype.map.call(b.querySelectorAll("img"), function (i) { return '<p><img src="' + i.getAttribute("src") + '"></p>'; }).join("");
      return b.q.getText().trim() || b.q.root.querySelector("img") ? b.q.getSemanticHTML() : "";
    }).join("").replace(/&nbsp;/g, " ");
  }
  // split HTML into blocks: a top-level paragraph holding only pictures is a photo block, everything else text
  function setHTML(html) {
    blocks().forEach(function (b) { b.remove(); });
    var t = document.createElement("template"), text = "", last = null; t.innerHTML = html || "";
    function flush() { if (text.trim()) block("text", text, false); text = ""; }
    Array.prototype.forEach.call(t.content.childNodes, function (n) {
      var imgs = n.nodeName === "P" && n.querySelectorAll("img");
      if (imgs && imgs.length && !n.textContent.trim() && n.querySelectorAll("*").length === imgs.length + n.querySelectorAll("br").length) {
        flush(); var srcs = Array.prototype.map.call(imgs, function (i) { return i.getAttribute("src"); });
        if (last && last === box.lastElementChild && last.kind === "photo") srcs.forEach(function (s) { photo(last, s); }); else last = block("photo", srcs, false);
      } else { text += n.nodeType === 1 ? n.outerHTML : n.nodeType === 3 ? n.textContent : ""; }
    });
    flush(); if (!blocks().length) block("text", "", false);
    layout();
  }

  // ---- draft of a new post kept in this browser until published (text only, not files)
  function save() {
    if (state.editing) return;
    try { localStorage.setItem(DRAFT, JSON.stringify({ t: Date.now(), title: $("#ne-title").value, excerpt: $("#ne-excerpt").value, html: getHTML().replace(/<img[^>]+src="blob:[^"]*"[^>]*>/g, "") })); } catch (e) {}
  }
  function restore() {
    try {
      var d = JSON.parse(localStorage.getItem(DRAFT) || "null");
      if (!d || Date.now() - d.t > 14 * 864e5 || !(d.title || d.html.replace(/<[^>]+>/g, "").trim())) return;
      $("#ne-title").value = d.title || ""; $("#ne-excerpt").value = d.excerpt || ""; setHTML(d.html || "");
      msg($("#ne-draft"), T("draft.restored"));
    } catch (e) {}
  }

  // ---- publish a new post or save changes
  editor.addEventListener("submit", function (e) {
    e.preventDefault();
    var out = $("#ne-msg"), b = $("#ne-publish"), ed = state.editing, locked = ed && !ed.editable;
    var uploading = root.querySelectorAll(".ne-files li:not(.is-error) progress:not([hidden])").length >
      state.files.filter(function (f) { return f.sha && f.role !== "inline"; }).length
      || Object.keys(state.blobs).length < box.querySelectorAll('img[src^="blob:"]').length;
    if (uploading) return msg(out, T("pub.wait"), "error");
    var html = locked ? "" : getHTML();
    Object.keys(state.blobs).forEach(function (k) { html = html.split(k).join(state.blobs[k]); });
    var data = { action: "publish", title: $("#ne-title").value, date: $("#ne-date").value, excerpt: $("#ne-excerpt").value, body: html,
      categories: Array.prototype.map.call(editor.querySelectorAll('input[name="cat"]:checked'), function (c) { return c.value; }), files: state.files,
      draft: $("#ne-draft-flag").checked };
    if (state.features.pin) data.pinned = $("#ne-pin").checked;
    if (ed) data.path = ed.path;
    if (!data.title.trim() || (!locked && !html.replace(/<(?!img)[^>]*>/g, "").trim())) return msg(out, ERR.missing, "error");
    b.disabled = true; msg(out, ed ? T("pub.saving") : T("pub.publishing"));
    call(data).then(function (r) {
      if (!ed) try { localStorage.removeItem(DRAFT); } catch (er) {}
      app.hidden = true; done.hidden = false;
      $("#ne-done-title").textContent = r.body.draft ? T("done.draft") : r.body.scheduled ? T("done.scheduled") : ed ? T("done.saved") : T("done.published");
      $("#ne-done-text").firstChild.textContent = r.body.draft ? T("done.draftText")
        : r.body.scheduled ? T("done.scheduledText") : T("done.text");
      var a = $("#ne-done-link"); a.href = r.body.url; a.textContent = location.origin + r.body.url;
    }, function (r) { msg(out, errorOf(r), "error"); signedOut(r); }).then(function () { b.disabled = false; });
  });
  $("#ne-again").addEventListener("click", function () { location.reload(); });

  // ---- events: the calendar kept in content/events.json
  var evForm = $("#ne-event-form"), evList = $("#ne-event-list"), evMsg = $("#ne-event-msg"), eventsCache = null;
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtWhen(e) {
    var s = e.start.slice(0, 10).split("-"), t = e.end.slice(0, 10).split("-"), a = ldate(e.start), b = ldate(e.end);
    return (a === b ? a : a + " – " + b) + (e.allDay ? "" : ", " + e.start.slice(11));
  }
  function loadEvents() {
    var done = waiting(evList);
    call({ action: "events" }).then(function (r) { eventsCache = r.body.events || []; msg(evMsg); renderEvents(); }, function (r) { msg(evMsg, errorOf(r), "error"); signedOut(r); }).then(done);
  }
  function renderEvents() {
    var today = now().slice(0, 10);
    evList.innerHTML = "";
    var items = eventsCache.slice().sort(function (a, b) { return a.start < b.start ? 1 : -1; });
    var upcoming = items.filter(function (e) { return e.end.slice(0, 10) >= today; }).reverse(), past = items.filter(function (e) { return e.end.slice(0, 10) < today; });
    upcoming.concat(past).forEach(function (e) {
      var li = document.createElement("li");
      li.innerHTML = '<time></time><div><span class="ne-list-title"></span><span class="ne-list-meta"></span></div><button type="button" class="btn btn--ghost ne-small"></button><button type="button" class="link-btn ne-del"></button>';
      li.querySelector(".btn").textContent = T("list.edit"); li.querySelector(".ne-del").textContent = T("list.del");
      li.querySelector("time").textContent = fmtWhen(e);
      li.querySelector(".ne-list-title").textContent = e.title;
      li.querySelector(".ne-list-meta").textContent = (e.place ? e.place + " · " : "") + (e.end.slice(0, 10) < today ? T("ev.past") : T("ev.upcoming"));
      li.querySelector(".btn").onclick = function () { editEvent(e); };
      var delBtn = li.querySelector(".ne-del");
      if (mine(e)) delBtn.onclick = function () { delEvent(e, li); }; else delBtn.remove();
      evList.appendChild(li);
    });
    if (!items.length) evList.innerHTML = '<li class="ne-list-empty">' + T("ev.none") + "</li>";
  }
  function editEvent(e) {
    state.event = e;
    $("#ne-ev-title").value = e.title; $("#ne-ev-place").value = e.place || "";
    $("#ne-ev-start").value = e.start.replace(" ", "T"); $("#ne-ev-end").value = e.end.replace(" ", "T");
    $("#ne-ev-allday").checked = !!e.allDay; $("#ne-ev-desc").value = e.description.replace(/<\/p>\s*<p>/g, "\n\n").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
    $("#ne-ev-editing").hidden = false; $("#ne-ev-editing-title").textContent = e.title; $("#ne-ev-save").textContent = T("pub.save");
    window.scrollTo(0, evForm.offsetTop);
  }
  function resetEvent() {
    state.event = null; evForm.reset(); $("#ne-ev-editing").hidden = true; $("#ne-ev-save").textContent = T("ev.addBtn");
    var d = new Date(); $("#ne-ev-start").value = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T08:00"; $("#ne-ev-end").value = "";
  }
  $("#ne-ev-cancel").addEventListener("click", resetEvent);
  function delEvent(e, li) {
    if (!confirm(T("ev.delAsk", { t: e.title }))) return;
    call({ action: "event-delete", url: e.url }).then(function () { eventsCache = eventsCache.filter(function (x) { return x.url !== e.url; }); li.remove(); msg(evMsg, T("ev.deleted", { t: e.title })); },
      function (r) { msg(evMsg, errorOf(r), "error"); signedOut(r); });
  }
  evForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var start = $("#ne-ev-start").value, end = $("#ne-ev-end").value || start, b = $("#ne-ev-save");
    if (!$("#ne-ev-title").value.trim() || !start) return msg(evMsg, T("ev.needTitle"), "error");
    if (end < start) return msg(evMsg, T("ev.endBefore"), "error");
    var desc = $("#ne-ev-desc").value.trim().split(/\n{2,}/).filter(Boolean).map(function (p) {
      return "<p>" + p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") + "</p>"; }).join("");
    var data = { action: "event", title: $("#ne-ev-title").value, start: start.replace("T", " "), end: end.replace("T", " "), allDay: $("#ne-ev-allday").checked, place: $("#ne-ev-place").value, description: desc };
    if (state.event) data.url = state.event.url;
    b.disabled = true; msg(evMsg, T("pub.saving"));
    call(data).then(function (r) {
      eventsCache = eventsCache.filter(function (x) { return x.url !== r.body.url; }).concat([r.body.event]);
      msg(evMsg, T(state.event ? "ev.saved" : "ev.added", { t: r.body.event.title })); resetEvent(); renderEvents();
    }, function (r) { msg(evMsg, errorOf(r), "error"); signedOut(r); }).then(function () { b.disabled = false; });
  });
  $("#ne-ev-allday").addEventListener("change", function () {
    var all = this.checked; ["#ne-ev-start", "#ne-ev-end"].forEach(function (s) { var i = $(s); if (all && i.value) i.value = i.value.slice(0, 10) + (s.indexOf("start") > 0 ? "T00:00" : "T23:59"); });
  });
  resetEvent();
  // ---- language switch and relabelling
  function setWho(u) { if (u != null) state.shown = u; $("#ne-user").textContent = state.shown + (state.role === "admin" ? " (" + T("who.admin") + ")" : ""); }
  function pubLabel() { $("#ne-publish").textContent = state.editing ? T("pub.save") : T("pub.publish"); }
  // block buttons and Quill tooltips of the blocks that already exist (el: one block, or all)
  function relabel(el) {
    (el ? [el] : blocks()).forEach(function (b) {
      Object.keys(QTIP).forEach(function (c) { var x = b.querySelector("." + c); if (x) { x.title = T(QTIP[c]); x.setAttribute("aria-label", T(QTIP[c])); } });
      b.querySelectorAll(".ql-list").forEach(function (x) { var s = T(x.value === "ordered" ? "q.ordered" : "q.bullets"); x.title = s; x.setAttribute("aria-label", s); });
    });
    if (el) return;
    box.querySelectorAll("button").forEach(function (x) {
      var k = BTN[x.className]; if (!k) return;
      x.title = T(k[0]); x.setAttribute("aria-label", T(k[0])); if (k[1]) x.textContent = T(k[1]);
    });
    box.querySelectorAll(".ne-ins").forEach(function (x) { x.setAttribute("aria-label", T("blk.add")); });
    blocks().forEach(function (b) { b.querySelector(".ne-block-name").textContent = T(b.kind === "text" ? "blk.nameText" : "blk.namePhoto"); b.querySelector(".ne-handle").title = T("blk.drag"); var e = b.querySelector(".ql-editor"); if (e) { e.setAttribute("aria-label", T("blk.label")); e.setAttribute("data-placeholder", T("blk.ph")); } });
  }
  function applyLang() {
    document.documentElement.lang = lang;
    root.querySelectorAll("[data-i18n]").forEach(function (e) { e.textContent = T(e.getAttribute("data-i18n")); });
    root.querySelectorAll("[data-i18n-html]").forEach(function (e) { e.innerHTML = T(e.getAttribute("data-i18n-html")); });
    [["ph", "placeholder"], ["aria", "aria-label"], ["alt", "alt"], ["title", "title"]].forEach(function (a) { root.querySelectorAll("[data-i18n-" + a[0] + "]").forEach(function (e) { e.setAttribute(a[1], T(e.getAttribute("data-i18n-" + a[0]))); }); });
    langBox.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x.lang === lang)); });
    if (state.user) setWho();
    pubLabel(); $("#ne-ev-save").textContent = state.event ? T("pub.save") : T("ev.addBtn");
    relabel(); dateHint();
    if (posts && !manage.hidden) render();
    if (eventsCache && !events.hidden) renderEvents();
    if (state.owner && !$("#ne-users").hidden) loadUsers();
    if (!$("#ne-users").hidden) loadSessions();
  }
  function setLang(l, remember) {
    lang = l; if (remember !== false) { langSaved = true; try { localStorage.setItem(LKEY, l); } catch (e) {} }
    applyLang();
  }
  var langBox = $("#ne-lang"), NATIVE = { cs: "Čeština", en: "English", de: "Deutsch", fr: "Français", it: "Italiano" };
  LANGS.forEach(function (l, i) {
    if (i) langBox.appendChild(document.createTextNode(" · "));
    var b = document.createElement("button"); b.type = "button"; b.className = "link-btn"; b.lang = l; b.textContent = l.toUpperCase(); b.title = NATIVE[l]; b.setAttribute("aria-label", NATIVE[l]);
    b.onclick = function () { setLang(l); }; langBox.appendChild(b);
  });
  applyLang();
})();
