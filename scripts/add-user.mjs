// Adds a co-worker who may publish news:  node scripts/add-user.mjs "Jana Nováková" jana@example.cz 'heslo…' [editor|admin|owner]
// Needs DATABASE_URL, BETTER_AUTH_SECRET and BETTER_AUTH_URL; run scripts/auth-schema.sql in the database once first.
// The password must have at least 12 characters; tell it in person, the co-worker then changes it on the staff page.
// An admin or owner must switch two-step sign-in on at the first sign-in before anything else is allowed.
import { getAuth } from "../api/_auth.mjs";

const [name, email, password, role = "editor"] = process.argv.slice(2);
if (!name || !email || !password || !["editor", "admin", "owner"].includes(role)) {
  console.error('usage: node scripts/add-user.mjs "Name" email password [editor|admin|owner]');
  process.exit(1);
}
const { user } = await (await getAuth()).api.createUser({ body: { name, email, password, role } });
console.log(`added ${user.name} <${user.email}> as ${role}`);
process.exit(0);
