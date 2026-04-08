# Community Feedback Migration — Manual Apply

Because Lovable Cloud blocks Supabase CLI access, this migration must be applied manually.

## Steps

1. Open the Lovable dashboard for accessmi.org
2. Navigate to Cloud → Database → SQL Editor
3. Copy the full contents of `supabase/migrations/20260408000000_community_feedback.sql`
4. Paste into the SQL editor and run
5. Verify the `community_feedback` table exists with proper RLS
6. Verify the insert policy by running: `SELECT * FROM pg_policies WHERE tablename = 'community_feedback';`
7. Expected output: 4 policies (INSERT allowed with checks, SELECT/UPDATE/DELETE denied)

## Rollback

If needed:
```sql
DROP TABLE IF EXISTS public.community_feedback CASCADE;
```

## Verification

After applying, test the form at /feedback. A successful submission should insert a row. A failed submission with too-short description should return a constraint violation.
