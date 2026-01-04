# Menu Maker Debugging Guide

## Current Known Issues & Solutions

### 1. Menu Items Not Appearing in Categories
**Symptoms**: Items save but don't show up under their category
**Cause**: Database ID type mismatch (MongoDB uses strings, PostgreSQL uses numbers)
**Status**: ✅ FIXED in latest code changes

### 2. Images Not Uploading
**Symptoms**: Upload fails or spinner keeps spinning
**Cause**: Missing Cloudinary credentials
**Solution**: Check your `.env` file has these values:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. "Cafe Not Found" on Public Menu
**Symptoms**: `/menu/[slug]` shows "Cafe Not Found"
**Cause**: Next.js 15 params async handling
**Status**: ✅ FIXED in latest code

---

## Step-by-Step Debugging

### Check 1: Database Connection
Open your browser console (F12) and check for:
- ❌ **Red errors** about "DATABASE_URL" or "MONGODB_URI"
- ✅ **Success**: No database errors

**Fix**: Make sure your `.env` has either:
```env
# Option 1: PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# OR Option 2: MongoDB
MONGODB_URI=mongodb://localhost:27017/menu-maker
# or your MongoDB Atlas connection string
```

### Check 2: Create a Cafe
1. Login to `/login`
2. Click "Create My First Cafe"
3. **Expected**: Success toast appears
4. **Actual**: ___________________

If it fails, check browser console for error messages.

### Check 3: Create a Category
1. Go to Dashboard → Menu tab
2. Click "Add Category"
3. Enter a name like "Appetizers"
4. **Expected**: Category appears in list
5. **Actual**: ___________________

### Check 4: Create a Menu Item
1. In a category, click "Add Item"
2. Fill in:
   - Name: "Test Item"
   - Price: 100
   - Category: Select from dropdown
3. **Expected**: Item appears under category
4. **Actual**: ___________________

### Check 5: Upload Image
1. In item form, click image upload area
2. Select a small JPG/PNG file (< 5MB)
3. **Expected**: Image appears after 2-3 seconds
4. **Actual**: ___________________

If upload fails, check:
- Browser console (F12 → Console tab)
- Network tab (F12 → Network tab) - look for `/api/upload`
- Terminal where `npm run dev` is running

---

## Environment Variables Checklist

Your `.env` file should have:

```env
# Required for Authentication
NEXTAUTH_SECRET=any-random-string-here
NEXTAUTH_URL=http://localhost:3000

# Database (Pick ONE)
# Option 1: PostgreSQL
DATABASE_URL=postgresql://...

# Option 2: MongoDB
MONGODB_URI=mongodb://...

# Image Upload (Optional but needed for images)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Quick Test Commands

### Test Database Connection
Open browser console and run:
```javascript
fetch('/api/cafes').then(r => r.json()).then(console.log)
```
**Expected**: Array of cafes or empty array `[]`
**Bad**: Error message

### Test Auth
```javascript
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```
**Expected**: User object if logged in, or null
 
---

## Common Browser Console Errors & Fixes

### Error: "NEXTAUTH_SECRET not set"
**Fix**: Add to `.env`: `NEXTAUTH_SECRET=your-secret-key-here`

### Error: "Database connection failed"
**Fix**: Check your `DATABASE_URL` or `MONGODB_URI` is correct

### Error: 404 on `/api/upload`
**Fix**: Image upload requires Cloudinary. Set the 3 CLOUDINARY_* variables

### Error: "Category not found" when creating item
**Fix**: Create a category first before adding items

---

## Reset & Fresh Start (If Everything Broken)

1. **Clear browser data**:
   - Press F12 → Application tab → Clear storage
   - Click "Clear site data"

2. **Restart dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Create test data in order**:
   - Register/Login
   - Create Cafe
   - Create Category
   - Create Item

---

## Report Issues

If still broken, share:
1. Browser console errors (F12 → Console tab)
2. Network errors (F12 → Network tab, filter: "Fetch/XHR")
3. Terminal output where `npm run dev` is running
