# ✅ Next Steps Checklist - Éter Store RLS Fix

## 🎯 What We Just Did

### Files Created:
- ✅ `fix-rls-policies.sql` - SQL script to fix RLS recursion
- ✅ `RLS-FIX-GUIDE.md` - Complete guide for applying the fix
- ✅ `NEXT-STEPS-CHECKLIST.md` - This file

### Code Cleaned:
- ✅ Removed allowlist from `src/app/actions/profiles.ts`
- ✅ Removed allowlist from `src/app/actions/messages.ts` (sendAdminMessage)
- ✅ Removed allowlist from `src/app/actions/messages.ts` (sendAdminMessageToAll)

### Server Status:
- ✅ Development server running on http://localhost:3001

---

## 🚀 YOUR ACTION ITEMS (Complete in Order)

### ⚡ STEP 1: Apply SQL Fix in Supabase (REQUIRED)

**This is the most critical step - nothing will work until you do this!**

1. [ ] Open Supabase Dashboard: https://supabase.com/dashboard
2. [ ] Navigate to your project
3. [ ] Click "SQL Editor" in the left sidebar
4. [ ] Click "New Query"
5. [ ] Open the file: `C:\Users\Tole\Desktop\Pegada Solo\eter-store\fix-rls-policies.sql`
6. [ ] Copy ALL the content (Ctrl+A, Ctrl+C)
7. [ ] Paste into Supabase SQL Editor (Ctrl+V)
8. [ ] Click "RUN" button (or press Ctrl+Enter)
9. [ ] Verify you see "Success. No rows returned" or similar
10. [ ] If you see errors, copy the error message and report it

---

### ✅ STEP 2: Verify the Fix Was Applied

Run these queries in Supabase SQL Editor to confirm:

**Query 1: Check Policies**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Expected Result:** You should see 4 rows:
- `profiles_delete_policy` (DELETE)
- `profiles_insert_policy` (INSERT)
- `profiles_select_policy` (SELECT)
- `profiles_update_policy` (UPDATE)

**Query 2: Check Function**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin_by_email';
```

**Expected Result:** You should see 1 row: `is_admin_by_email`

---

### 🧪 STEP 3: Test in the Application

The dev server is already running at http://localhost:3001

#### Test 3A: Login
1. [ ] Go to http://localhost:3001/login
2. [ ] Login with: `feitopepe510@gmail.com` + your password
3. [ ] Verify you see the dashboard

#### Test 3B: Messages View
1. [ ] Go to http://localhost:3001/dashboard?view=messages
2. [ ] Check the role indicator shows: "Rol: admin"
3. [ ] Verify you see a list of users/conversations (not empty)
4. [ ] Check browser console (F12) - should have NO RLS errors
5. [ ] Verify "Enviar a todos" button is visible

#### Test 3C: Bulk Messaging
1. [ ] Click "Enviar a todos" button
2. [ ] Type test message: "Hola equipo, prueba de mensajería masiva"
3. [ ] Click "Enviar"
4. [ ] Verify success toast appears with count: "Mensaje enviado a X usuarios"
5. [ ] Check console - should have NO errors

#### Test 3D: Users View
1. [ ] Go to http://localhost:3001/dashboard?view=users
2. [ ] Verify page loads without errors
3. [ ] Verify you see a list of user profiles
4. [ ] Check console - should have NO "infinite recursion" errors

---

### 📊 STEP 4: Verify Data in Dashboard

Test all dashboard views:

1. [ ] http://localhost:3001/dashboard - Main dashboard loads
2. [ ] Check stats widgets show real data (or 0 if tables are empty)
3. [ ] http://localhost:3001/dashboard?view=products - Products view
4. [ ] http://localhost:3001/dashboard?view=ranking - Ranking view
5. [ ] http://localhost:3001/dashboard?view=messages - Messages view
6. [ ] http://localhost:3001/dashboard?view=users - Users view

---

### 🗄️ STEP 5: Add Test Data (Optional)

If your tables are empty, run this in Supabase SQL Editor:

```sql
-- Add test products
INSERT INTO productos (name, category, price, stock_by_size, status, images, margin)
VALUES 
  ('Nike Air Max 90', 'running', 45000, '{"38": 5, "40": 3, "42": 2}'::jsonb, 'activo', 
   ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], 30),
  ('Adidas Ultraboost', 'running', 89000, '{"39": 10, "41": 5}'::jsonb, 'activo',
   ARRAY['https://images.unsplash.com/photo-1587563871167-1ee797455c32?w=600'], 30),
  ('Puma Suede Classic', 'casual', 35000, '{"37": 8, "39": 6, "41": 4}'::jsonb, 'activo',
   ARRAY['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600'], 25);

-- Add test orders
INSERT INTO pedidos (customer_name, customer_email, total_amount, status)
VALUES 
  ('Juan Pérez', 'juan@test.com', 45000, 'pagado'),
  ('María García', 'maria@test.com', 89000, 'procesando'),
  ('Carlos López', 'carlos@test.com', 35000, 'completado');

-- Add test clients
INSERT INTO clientes (name, email, phone)
VALUES 
  ('Juan Pérez', 'juan@test.com', '+54 9 11 1234-5678'),
  ('María García', 'maria@test.com', '+54 9 11 8765-4321'),
  ('Carlos López', 'carlos@test.com', '+54 9 11 5555-6666');
```

---

## 🎉 Success Criteria

You'll know everything is working when:

- ✅ No "infinite recursion" errors in console
- ✅ `dashboard?view=messages` loads user list
- ✅ `dashboard?view=users` shows all profiles
- ✅ "Enviar a todos" sends messages successfully
- ✅ Role indicator shows "Rol: admin"
- ✅ All dashboard stats load correctly
- ✅ No RLS policy errors in browser console

---

## 🐛 Troubleshooting

### Error: "permission denied for function is_admin_by_email"
**Solution:** Run in Supabase SQL:
```sql
GRANT EXECUTE ON FUNCTION is_admin_by_email() TO authenticated, anon;
```

### Error: "could not open relation with OID"
**Solution:** Enable RLS on profiles table:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Users still not loading
**Solutions:**
1. Clear browser cache and refresh
2. Logout and login again
3. Check browser console for specific error message
4. Verify policies were created (run verification queries)

### Role shows as "desconocido" or "user" instead of "admin"
**Solution:** Check and update your profile in Supabase:
```sql
SELECT id, email, role FROM profiles WHERE email = 'feitopepe510@gmail.com';

-- If role is not 'admin', update it:
UPDATE profiles SET role = 'admin' WHERE email = 'feitopepe510@gmail.com';
```

### "Enviar a todos" returns "No hay usuarios para contactar"
**Cause:** Either:
1. RLS policies not applied yet (go back to Step 1)
2. No non-admin users exist in database

**Solution for #2:** Create a test user:
```sql
-- This would need to be done through Supabase Auth UI or signup flow
-- Or manually insert a test profile (not recommended)
```

---

## 📝 Important Notes

1. **Don't skip Step 1!** Nothing will work until you apply the SQL fix in Supabase
2. The allowlists have been removed from code - we're now relying 100% on RLS policies
3. Admin email is hardcoded in `is_admin_by_email()` function as `feitopepe510@gmail.com`
4. To add more admins in the future, see the "ALTERNATIVE SOLUTION" section in `fix-rls-policies.sql`

---

## 🔄 If You Need to Rollback

If something goes wrong, you can disable RLS temporarily:

```sql
-- WARNING: This makes profiles table public - only for debugging!
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- When fixed, re-enable it:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for specific error messages
2. Check Supabase logs in Dashboard → Logs → PostgREST
3. Verify all queries in Step 2 return expected results
4. Review the detailed guide: `RLS-FIX-GUIDE.md`

---

## ✅ Final Checklist

Before considering this complete:

- [ ] SQL script executed successfully in Supabase
- [ ] 4 policies verified in pg_policies
- [ ] 1 function verified in information_schema
- [ ] Login works at localhost:3001
- [ ] Messages view loads users without errors
- [ ] Users view loads without errors
- [ ] "Enviar a todos" works correctly
- [ ] Role shows as "admin"
- [ ] No RLS errors in console
- [ ] All dashboard views tested

---

**Once all checkboxes are checked, the RLS fix is complete! 🎉**

---

**Last Updated:** {{ date }}  
**Status:** Ready to Execute  
**Next File to Review:** `RLS-FIX-GUIDE.md` for detailed instructions
