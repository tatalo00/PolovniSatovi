# Database Connection Troubleshooting

If you're getting connection errors like:
```
Can't reach database server at `aws-1-eu-west-1.pooler.supabase.com:5432`
```

## Quick Fixes

### 1. Check Your DATABASE_URL

Make sure your `DATABASE_URL` in `.env.local` is correct. You can find it in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **Database**
3. Copy the **Connection string** under **Connection pooling** or **Direct connection**

### 2. Use Direct Connection Instead of Pooler

If the pooler connection is having issues, try using the **direct connection** string:

- **Pooler connection** (default): Uses `pooler.supabase.com:5432`
- **Direct connection**: Uses `db.[project-ref].supabase.co:5432`

**To switch to direct connection:**
1. In Supabase: Project Settings > Database
2. Under "Connection string", select "Direct connection" (not "Session mode" or "Transaction mode")
3. Copy the connection string
4. Update your `.env.local` file with the new `DATABASE_URL`

### 3. Check Connection String Format

Your `DATABASE_URL` should look like:
```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

Make sure:
- The password is correctly URL-encoded
- The hostname is correct
- The port is `5432`
- For pooler: `?pgbouncer=true` is included
- For direct: No `pgbouncer` parameter

### 4. Verify Database is Running

1. Go to Supabase dashboard
2. Check if your project status is **Active**
3. Check the **Database** section to see if there are any issues

### 5. Test Connection Manually

You can test the connection using `psql`:

```bash
# For pooler connection
psql "postgresql://postgres:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# For direct connection
psql "postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres"
```

### 6. Check Network/Firewall

Make sure:
- Your IP is not blocked by Supabase
- Your firewall allows connections to port 5432
- You're not behind a VPN that blocks database connections

### 7. Connection Limits

If using the **free tier**:
- Pooler connection has a limit of concurrent connections
- Direct connection has a limit of 60 connections

If you're hitting limits, try:
- Using connection pooling (already enabled with pooler)
- Reducing the number of concurrent requests
- Using `prisma.$connect()` only when needed

### 8. Environment Variables

Make sure your `.env.local` file has:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

**Important**: 
- Never commit `.env.local` to git
- Restart your dev server after changing `.env.local`
- In production (Vercel), set the environment variable in Vercel dashboard

### 9. Prisma Connection Pooling

The Prisma client handles connection pooling automatically. If you're still having issues, you can configure it in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  directUrl = env("DIRECT_URL") // Optional: direct connection for migrations
}
```

Then use:
- `DATABASE_URL` for application (with pooler)
- `DIRECT_URL` for migrations (direct connection)

## Still Having Issues?

1. Check Supabase status: https://status.supabase.com
2. Check Prisma logs in your terminal for more details
3. Verify your database credentials in Supabase dashboard
4. Try creating a new connection string with a new password

