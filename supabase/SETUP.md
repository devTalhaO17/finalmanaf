# Supabase Setup Guide (paste-and-go, ~10 minutes)

This app uses Supabase for **Auth** (login/register/password reset), **Postgres** (books,
events, site content, logs) and **Storage** (book covers / site images). Pages still render
instantly from an on-device cache and sync to Supabase in the background, so the site works
even on a slow connection.

## 1. Create the project (2 min)

1. Go to https://supabase.com and sign up (free).
2. **New project** -> choose an organisation -> pick the nearest region
   (Singapore is closest to Bangladesh).
3. Set a strong database password.
4. Wait ~2 minutes for it to provision.

## 2. Apply the schema (2 min)

1. Left sidebar -> **SQL Editor** -> **New query**.
2. Open [`schema.sql`](./schema.sql) in this repo, copy the whole file, paste it, click **Run**.
   - This creates all tables, enables Row Level Security (read-only public catalog; only
     admins can edit content; users manage their own profile/favorites), plus the `sajks`
     storage bucket.
3. You should see "Success. No rows returned" (the site_info insert returns nothing).

## 3. Configure the client (2 min)

1. In the Supabase dashboard: **Project Settings -> API**.
2. Copy the **Project URL** and the **anon public** key.
3. Create `client/.env` (it is gitignored — never commit it):
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
4. Restart the dev server (`npm run dev` in `client/`).

## 4. Create the first admin & load your data (3 min)

1. Open the site, go to **লগইন / Register** and create an account with an email you control.
2. That account is a normal **member**. To grant it admin rights, open the Supabase
   **Table Editor** -> `users`, find your row, set `role = 'SUPER_ADMIN'`.
   (Alternatively run: `update public.users set role = 'SUPER_ADMIN' where email = 'you@example.com';` in SQL Editor.)
3. Log out and **log back in** (role is read at login). You now see the admin dashboard.
4. Open **ডাটাবেজ ব্যাকআপ ও রিস্টোর** tab -> use the **admin data push** button
   (or the JSON export/restore) to move the demo books, events, donors, site text and
   gallery into Supabase. Now all browsers share the same data.

## 5. Keep the free tier from pausing (optional, 5 min)

Free projects pause after **1 week of inactivity**. Add a free heartbeat:

- GitHub Actions: a scheduled workflow hitting
  `https://YOUR-PROJECT.supabase.co/rest/v1/<noop>` every 2 days, **or**
- Better: ping your site (which hits Supabase) using **UptimeRobot** (free, 60s interval),
  because the client also pulls data on load.

## Things that will slow you down — do these now

- **Emails (password reset / confirmations):** the free built-in sender is capped at
  2 emails/hour and templates aren't customisable on new projects. Connect **Resend**
  (free, 100 emails/day) as custom SMTP under **Authentication -> Providers -> SMTP**.

## When to upgrade to Pro ($25/mo)

Only when: database > 500 MB, or you want automated backups, no pausing, custom domains,
or higher email volume — years away for this library.

## What happens locally if Supabase has no key?

If `VITE_SUPABASE_URL`/`ANON_KEY` are absent, the app runs exactly as before in
localStorage demo mode (no network). Add the keys and it becomes a live shared app.