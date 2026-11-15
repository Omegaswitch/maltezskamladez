-- Better Auth tables for the news editor (e-mail + password, roles, two-step sign-in, rate limits, lockout).
-- Run once in the SQL editor of the database (e.g. Neon); running it again changes nothing.
create table if not exists "user" ("id" text primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null default false, "image" text, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(), "role" text, "banned" boolean default false, "banReason" text, "banExpires" timestamptz, "twoFactorEnabled" boolean default false);
create table if not exists "session" ("id" text primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(), "ipAddress" text, "userAgent" text, "userId" text not null references "user"("id") on delete cascade, "impersonatedBy" text);
create table if not exists "account" ("id" text primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user"("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now());
create table if not exists "verification" ("id" text primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now());
create index if not exists "session_userId_idx" on "session"("userId");
create index if not exists "account_userId_idx" on "account"("userId");
create index if not exists "verification_identifier_idx" on "verification"("identifier");
create table if not exists "twoFactor" ("id" text primary key, "secret" text not null, "backupCodes" text not null, "userId" text not null references "user"("id") on delete cascade, "verified" boolean default true, "failedVerificationCount" integer default 0, "lockedUntil" timestamptz);
create index if not exists "twoFactor_secret_idx" on "twoFactor"("secret");
create index if not exists "twoFactor_userId_idx" on "twoFactor"("userId");
create table if not exists "rateLimit" ("id" text primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);
-- failed sign-ins per e-mail address (its SHA-256, not the address), for the lockout in api/_auth.mjs
create table if not exists "loginAttempt" ("key" text primary key, "failures" integer not null default 0, "lockedUntil" timestamptz, "updatedAt" timestamptz not null default now());
