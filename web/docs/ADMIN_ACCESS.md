# How to Access Admin Panel

The admin panel is protected and requires a user with the `ADMIN` role. By default, all new users are created with the `BUYER` role.

## Option 1: Using the Script (Recommended)

We've created a script to easily promote a user to admin:

1. **Make sure you have a user account first:**
   - Sign up at `/auth/signup` or use an existing account

2. **Run the admin creation script:**
   ```bash
   cd web
   npx tsx scripts/create-admin.ts
   ```

3. **Enter the email** of the user you want to make admin

4. **Sign out and sign in again** to refresh your session

5. **Access the admin panel** at `/admin`

## Option 2: Using Prisma Studio (Visual)

1. **Open Prisma Studio:**
   ```bash
   cd web
   npx prisma studio
   ```

2. This opens a web interface at `http://localhost:5555`

3. Click on the **User** model

4. Find the user you want to make admin (by email)

5. Click on the user to edit

6. Change the `role` field from `BUYER` to `ADMIN`

7. Click **Save**

8. **Sign out and sign in again** in your application

9. Access the admin panel at `/admin`

## Option 3: Using SQL (Direct Database)

If you have direct database access:

1. **Connect to your Supabase database** (via SQL Editor or psql)

2. **Run this SQL query:**
   ```sql
   UPDATE "User" 
   SET role = 'ADMIN' 
   WHERE email = 'your-email@example.com';
   ```

3. **Sign out and sign in again** in your application

4. Access the admin panel at `/admin`

## Option 4: Create Admin During Seed

You can modify `prisma/seed.ts` to create an admin user automatically:

```typescript
// In prisma/seed.ts
const adminUser = await prisma.user.upsert({
  where: { email: "admin@example.com" },
  update: { role: "ADMIN" },
  create: {
    email: "admin@example.com",
    name: "Admin User",
    password: await bcrypt.hash("YourSecurePassword123!", 10),
    role: "ADMIN",
  },
});
```

Then run:
```bash
npm run prisma:seed
```

## After Making a User Admin

1. **Sign out** of your current session (if you're the user being promoted)

2. **Sign in again** - this refreshes your session with the new role

3. **Access admin panel** - You'll see "Admin Panel" link in the navbar dropdown menu, or go directly to `/admin`

## Admin Panel Features

Once you have admin access, you can:

- **View Admin Dashboard** (`/admin`) - Overview of pending listings and reports
- **Approve/Reject Listings** (`/admin/listings`) - Review and approve user listings
- **Manage Reports** (`/admin/reports`) - Handle user reports about listings

## Security Notes

- ⚠️ Admin users have full control over listings and reports
- ⚠️ Only create admin accounts for trusted users
- ⚠️ Keep admin credentials secure
- ⚠️ Consider implementing 2FA for admin accounts in the future

## Troubleshooting

### "Forbidden" error when accessing `/admin`
- ✅ Make sure you've updated the user role to `ADMIN` in the database
- ✅ Sign out and sign in again to refresh your session
- ✅ Check the browser console for errors

### Can't see "Admin Panel" link in navbar
- ✅ Verify the user role is `ADMIN` in the database
- ✅ Sign out and sign in again
- ✅ Clear browser cache and cookies

### Script doesn't work
- ✅ Make sure you're in the `web` directory
- ✅ Ensure the user exists in the database
- ✅ Check that Prisma client is generated (`npm run prisma:generate`)

