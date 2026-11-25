# Account profile and portal access update

Before deploying the matching app update, run `supabase/migrations/202611250001_profile_and_portal_access.sql` in the Supabase SQL Editor. It adds profile phone and portal fields and restricts profile and asset access to each account's assigned portal. Existing accounts are assigned to Organisation by default; an administrator can move eligible Staff Member accounts to Household in **Officials & Team**.

Administrators choose Organisation or Household when inviting a person. Household accounts use the Staff Member role. Each account can edit its display name, phone number, responsibility/title, and profile picture link from the account menu's **Edit profile** page. Email, role, and portal assignment are controlled separately.

The audit trail is browser-local in the current app. The updated app clears previously stored system audit entries the first time it is opened in each browser, then records new audit activity. Physical movement history is preserved.
