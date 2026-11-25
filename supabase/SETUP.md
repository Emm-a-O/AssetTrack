# AssetTrack shared accounts and data setup

AssetTrack uses Supabase Auth for individual sign-ins and a shared database table for assets. Asset details remain stored in the app's existing shape, preserving the current registration fields and workflows.

## Supabase project setup

1. Create a Supabase project and keep its database password private.
2. In **SQL Editor**, create a query, paste the full contents of `migrations/202611230001_assettrack_auth_and_workspace.sql`, and click **Run**. If you ran an earlier copy of this migration, run this updated version too; it adds the shared asset table and allocator.
3. In **Authentication → Providers**, enable Email and turn off **Allow new users to sign up**. Accounts should be invitation-only.
4. In **Authentication → Users**, invite your administrator email. After accepting the invitation, run this query in **SQL Editor**, replacing the address with your own:

   ```sql
   update public.profiles
   set role = 'Organisation Administrator'
   where lower(email) = lower('your-email@example.com');
   ```

5. In **Authentication → URL Configuration**, set the **Site URL** to `https://asset-track-eight.vercel.app`.
6. In **Project Settings → API Keys**, copy the Project URL and **publishable** key. Create or copy a **secret** key for server-side invitations. In Vercel, open the AssetTrack project → **Settings → Environment Variables** and add these values for **Production**:

   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = your publishable key
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_SECRET_KEY` = your Supabase secret key, for server use only
   - `APP_URL` = `https://asset-track-eight.vercel.app` (used as the invitation link destination)

   Never put the secret key in a `VITE_` variable or source code. Do not send the secret key in chat.
7. Redeploy the Vercel project after saving the environment variables.

The first administrator is promoted once in SQL Editor. Once this version is deployed, administrators can invite officials and household members from the **Officials & Team** screen. The Vercel server endpoint verifies the caller's administrator role before using the server-only secret key to send an invitation.

## Data model

- `profiles` ties each signed-in account to its role and official or household details.
- `asset_records` stores each asset as an individual shared record, retaining its existing fields and the identity of the person who entered it.
- `next_asset_id` allocates unique asset IDs in the database, including when several people add assets at the same time.
- Row Level Security limits asset and profile access to signed-in accounts. A normal browser client cannot change account roles.

The shared asset register starts empty. Do not import sample demo assets or officials as real records. Other existing app features and asset fields are retained.
