# Supabase setup

The browser app uses Supabase Auth and the publishable key only. It does not use
or contain a database password or a Supabase secret/service-role key.

## 1. Configure the app

For local development, copy `.env.example` to `.env.local` and set:

- `VITE_SUPABASE_URL` to the project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY` to the project's publishable key.

For GitHub Pages, add those same values as **repository Actions variables**
named `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. They are public
client configuration, not secrets. The Pages workflow injects them at build time.

Never place a Supabase secret key or database connection string in a `VITE_*`
variable, frontend file, or GitHub Pages artifact. Rotate any key that has been
shared or committed.

## 2. Create the schema and access policies

With the Supabase CLI installed and authenticated, link this repository to the
project and apply the migration:

```powershell
supabase login
supabase link --project-ref oofitrcpjsadnxtbsvow
supabase db push
```

The migration creates `user_profiles` and `procurement_projects`, plus
row-level security policies. Each user can read and update only their own
projects; admins can read and manage all projects. Deleted users' project rows
are retained as unassigned records that only admins can access. Existing
browser/localStorage records are intentionally not imported.

## 3. Create the initial admin

In Supabase Dashboard → **Authentication → Users**, create a confirmed user:

- Email: `admin@accounts.procurement-guide.example`
- Password: choose a new strong password

Then run this once in **SQL Editor** to grant the admin role:

```sql
update public.user_profiles
set role = 'admin'
where username = 'admin';
```

The app login maps username `admin` to
`admin@accounts.procurement-guide.example`. Do not reuse
the old demo password.

The app does not provision an `admin` account or the old `admin123` password
automatically. Use the password assigned in Supabase Dashboard. The login form
accepts either the username or the account's exact email address, so an admin
created with a real email in the Dashboard can sign in with that email.

## 4. Deploy admin user management

Deploy the `manage-users` Edge Function. It uses the caller's authenticated
session for authorization and the server-side `SUPABASE_SERVICE_ROLE_KEY`
environment variable for Supabase Auth Admin API operations. Supabase provides
this variable to Edge Functions. If it is not present for the project, set it
as an Edge Function secret from Supabase Dashboard → **Edge Functions → Secrets**.
Never expose this key to the frontend.

```powershell
supabase functions deploy manage-users
```

The function checks the caller's database role for every request. Only admins
can list, create, edit, promote/demote, or delete accounts. New users are
confirmed immediately and can log in using their username and the password
assigned by the admin. Passwords are managed by Supabase Auth, never stored in
the application profile table.

These app-managed accounts use the reserved `.example` email domain and are
auto-confirmed, so this workflow does not send verification emails. To deliver
verification messages, configure Supabase Auth SMTP and implement accounts with
real email addresses; do not use the placeholder `.example` address for email
verification.

## 5. Enable public email verification

The login page also supports public user registration with a username, real
email address, and password. New registrations receive the default `user` role
from the profile trigger. In Supabase Dashboard:

1. Under **Authentication → Providers → Email**, enable email confirmations.
2. Configure a working SMTP provider under **Authentication → SMTP Settings**.
   Supabase's default email service is rate-limited and is not suitable for
   reliable production delivery.
3. Under **Authentication → URL Configuration**, set the deployed app as the
   Site URL and allow its exact callback URL (the app's current path). Add the
   local development URL as well if testing locally.

Publicly registered users must verify their email and then log in with that
email address and password. Admin-created accounts remain auto-confirmed and
can log in using their username. Verification emails are never sent to the
placeholder `.example` addresses.

## Data model

- `user_profiles`: Supabase Auth user ID, unique username, `admin`/`user` role.
- `procurement_projects`: project details, checklist JSON, and owner Auth ID.
- Auth profile trigger: creates a `user` profile for each new Auth account.
- RLS: project visibility is per-user, with admin access across users.
