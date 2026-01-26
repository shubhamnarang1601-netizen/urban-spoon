# 🔥 Complete Firebase Setup Guide - Step by Step

This guide will walk you through **connecting your Ranisa Boutique website to Firebase** from scratch.

---

## 📋 Prerequisites

- Gmail/Google account
- Your Ranisa Boutique website running locally
- 15 minutes of time

---

## Part 1: Firebase Console Setup (5 minutes)

### Step 1: Create Firebase Project

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com
   - Click **"Add project"** or **"Create a project"**

2. **Enter Project Details**
   - Project name: `ranisa-boutique` (or any name you prefer)
   - Click **Continue**

3. **Google Analytics** (Optional)
   - You can enable or disable Google Analytics
   - Click **Continue** or **Create project**

4. **Wait for Project Creation**
   - Firebase will create your project (takes 30 seconds)
   - Click **Continue** when done

---

### Step 2: Register Your Web App

1. **Add Web App**
   - In your Firebase project, click the **`</>`** (web) icon
   - Or go to Project Settings → General → Your apps

2. **Register App**
   - App nickname: `Ranisa Boutique Web`
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click **Register app**

3. **📋 IMPORTANT: Copy Your Config**
   
   You'll see code like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC1234567890abcdefg",
     authDomain: "ranisa-boutique.firebaseapp.com",
     projectId: "ranisa-boutique",
     storageBucket: "ranisa-boutique.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

   **⚠️ COPY THIS NOW!** You'll need it in Step 3.

4. Click **Continue to console**

---

### Step 3: Configure Your Website with Firebase Credentials

1. **Open Your Project Folder**
   - Navigate to: `d:\Rani Sa Boutique\ranisa-boutique`

2. **Open `.env.local` File**
   - Use any text editor (Notepad, VS Code, etc.)
   - Find the file: `d:\Rani Sa Boutique\ranisa-boutique\.env.local`

3. **Replace Placeholder Values**
   
   Replace the dummy values with your real Firebase config:

   ```env
   # Replace these with YOUR actual Firebase credentials
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1234567890abcdefg
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ranisa-boutique.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=ranisa-boutique
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ranisa-boutique.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

   # Admin email (change if you want)
   NEXT_PUBLIC_ADMIN_EMAIL=admin@ranisaboutique.com
   ```

4. **Save the file** (Ctrl+S)

5. **Restart your development server**
   - Stop the server: Press `Ctrl+C` in terminal
   - Start again: Run `npm run dev`

---

## Part 2: Enable Firebase Authentication (3 minutes)

### Step 4: Enable Email/Password Authentication

1. **Go to Authentication**
   - In Firebase Console, click **Build** → **Authentication**
   - Click **Get started**

2. **Enable Email/Password**
   - Go to **Sign-in method** tab
   - Click on **Email/Password**
   - Toggle **Enable** to ON
   - Click **Save**

3. **✅ That's it!** Email/Password authentication is now enabled.

---

### Step 5: Create Your First Admin User

1. **Go to Users Tab**
   - In Authentication, click the **Users** tab
   - Click **Add user**

2. **Create Admin Account**
   - Email: `admin@ranisaboutique.com`
   - Password: `admin123` (or choose your own strong password)
   - Click **Add user**

3. **📝 Save These Credentials**
   - You'll use these to login to the admin panel
   - Email: admin@ranisaboutique.com
   - Password: (whatever you set)

---

## Part 3: Setup Firestore Database (4 minutes)

### Step 6: Create Firestore Database

1. **Go to Firestore**
   - Click **Build** → **Firestore Database**
   - Click **Create database**

2. **Choose Location**
   - Select a location closest to your users
   - For India: Choose `asia-south1 (Mumbai)`
   - Click **Next**

3. **Start in Test Mode**
   - Select **Start in test mode** (we'll add security rules later)
   - Click **Enable**
   - Wait 30 seconds for database creation

---

### Step 7: Create Database Collections & Add Admin Role

1. **Create `users` Collection**
   - Click **Start collection**
   - Collection ID: `users`
   - Click **Next**

2. **Add Your Admin User Document**
   - Document ID: Copy the UID from Authentication → Users
     - Go to Authentication → Users tab
     - Click on admin@ranisaboutique.com
     - Copy the **User UID** (looks like: `abc123xyz789`)
   
   - Back in Firestore, paste that UID as **Document ID**
   
   - Add these fields:
     ```
     Field: email        | Type: string | Value: admin@ranisaboutique.com
     Field: name         | Type: string | Value: Admin
     Field: role         | Type: string | Value: admin
     Field: createdAt    | Type: string | Value: 2026-01-26
     ```
   
   - Click **Save**

3. **✅ Success!** Your admin user now has the `admin` role.

---

### Step 8: Add Sample Products (Optional)

1. **Create `products` Collection**
   - Click **Start collection**
   - Collection ID: `products`
   - Click **Next**

2. **Add a Sample Product**
   - Auto-ID: Click **Auto-ID**
   - Add fields:
     ```
     Field: name         | Type: string   | Value: Beautiful Silk Saree
     Field: description  | Type: string   | Value: Handwoven silk saree with traditional embroidery
     Field: price        | Type: number   | Value: 2999
     Field: discount     | Type: number   | Value: 10
     Field: category     | Type: string   | Value: sarees
     Field: images       | Type: array    | Value: (leave empty for now)
     Field: stock        | Type: number   | Value: 15
     Field: featured     | Type: boolean  | Value: true
     Field: newArrival   | Type: boolean  | Value: true
     Field: createdAt    | Type: timestamp| Value: (click to set current time)
     Field: updatedAt    | Type: timestamp| Value: (click to set current time)
     ```
   
   - Click **Save**

3. **Add More Products** (Optional)
   - Repeat to add 5-10 more products
   - Change names, prices, categories

---

## Part 4: Enable Firebase Storage (2 minutes)

### Step 9: Enable Cloud Storage

1. **Go to Storage**
   - Click **Build** → **Storage**
   - Click **Get started**

2. **Start in Test Mode**
   - Click **Start in test mode**
   - Click **Next**

3. **Choose Location**
   - Use the same location as Firestore (e.g., `asia-south1`)
   - Click **Done**

4. **✅ Storage is now enabled** for image uploads!

---

## Part 5: Deploy Security Rules (3 minutes)

### Step 10: Add Firestore Security Rules

1. **Go to Firestore Rules**
   - In Firestore Database, click the **Rules** tab

2. **Copy & Paste These Rules**
   
   Replace everything with:
   ```javascript
   rules_version = '2';
   
   service cloud.firestore {
     match /databases/{database}/documents {
       
       // Helper functions
       function isSignedIn() {
         return request.auth != null;
       }
       
       function isAdmin() {
         return isSignedIn() && 
                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
       
       function isOwner(userId) {
         return isSignedIn() && request.auth.uid == userId;
       }
       
       // Users collection
       match /users/{userId} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && request.auth.uid == userId;
         allow update: if isOwner(userId) || isAdmin();
         allow delete: if isAdmin();
       }
       
       // Products collection
       match /products/{productId} {
         allow read: if true; // Public read access
         allow create, update, delete: if isAdmin();
       }
       
       // Orders collection
       match /orders/{orderId} {
         allow read: if isOwner(resource.data.userId) || isAdmin();
         allow create: if isSignedIn();
         allow update: if isAdmin();
         allow delete: if isAdmin();
       }
       
       // Categories collection
       match /categories/{categoryId} {
         allow read: if true; // Public read access
         allow create, update, delete: if isAdmin();
       }
     }
   }
   ```

3. **Click Publish**

---

### Step 11: Add Storage Security Rules

1. **Go to Storage Rules**
   - In Storage, click the **Rules** tab

2. **Copy & Paste These Rules**
   
   Replace everything with:
   ```javascript
   rules_version = '2';
   
   service firebase.storage {
     match /b/{bucket}/o {
       
       // Helper function to check if user is admin
       function isAdmin() {
         return request.auth != null && 
                firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
       
       // Product images
       match /products/{productId}/{fileName} {
         allow read: if true; // Public read access
         allow write: if isAdmin();
         allow delete: if isAdmin();
       }
       
       // Category images
       match /categories/{fileName} {
         allow read: if true; // Public read access
         allow write: if isAdmin();
         allow delete: if isAdmin();
       }
     }
   }
   ```

3. **Click Publish**

---

## 🎉 Part 6: Test Your Setup!

### Step 12: Test Authentication

1. **Open Your Website**
   - Go to: http://localhost:3000

2. **Test Registration**
   - Click **Login** in header → **Create Account**
   - Fill in:
     - Name: Test User
     - Email: test@example.com
     - Password: test123
     - Confirm Password: test123
   - Check "I agree to terms"
   - Click **Create Account**

3. **Verify in Firebase**
   - Go to Firebase Console → Authentication → Users
   - You should see your new user!

4. **Test Login**
   - Click **Login**
   - Email: test@example.com
   - Password: test123
   - Click **Login**

5. **Test Admin Login**
   - Logout and login with:
     - Email: admin@ranisaboutique.com
     - Password: (whatever you set in Step 5)
   - Should redirect to `/admin` (page not created yet)

---

## ✅ Success Checklist

Make sure you've completed:

- ✅ Created Firebase project
- ✅ Copied Firebase config to `.env.local`
- ✅ Enabled Email/Password authentication
- ✅ Created admin user with role='admin'
- ✅ Created Firestore database
- ✅ Added admin user to `users` collection
- ✅ Enabled Storage
- ✅ Published Firestore security rules
- ✅ Published Storage security rules
- ✅ Tested registration and login

---

## 🔍 Troubleshooting

### "Permission Denied" Error
- Check that you published the security rules
- Verify admin user has `role: 'admin'` in Firestore
- Make sure you're logged in

### "Firebase config error"
- Check `.env.local` has correct values
- Restart dev server: `Ctrl+C` then `npm run dev`
- Verify no extra spaces in `.env.local`

### Can't Login
- Check user exists in Authentication → Users
- Verify password is correct
- Clear browser cache and cookies

### "Network error"
- Check internet connection
- Verify Firebase project is active
- Check browser console for error details

---

## 📚 What's Next?

Now that Firebase is connected, you can:

1. **Create More Users** - Register from `/register` page
2. **Add Products** - Add via Firestore or build admin panel
3. **Test Orders** - Create order flow
4. **Build Admin Panel** - Manage products, orders, users
5. **Add Real Images** - Upload to Firebase Storage

---

## 🔐 Security Best Practices

1. **Change Admin Password** - Use a strong password
2. **Don't Share Credentials** - Keep `.env.local` private
3. **Never Commit `.env.local`** - Already in `.gitignore`
4. **Review Security Rules** - Test they work correctly
5. **Monitor Usage** - Check Firebase Console regularly

---

## 📞 Need Help?

- **Firebase Docs**: https://firebase.google.com/docs
- **Firestore**: https://firebase.google.com/docs/firestore
- **Authentication**: https://firebase.google.com/docs/auth

---

## 🎯 Summary

**What you set up:**
- ✅ Firebase project
- ✅ Email/Password authentication
- ✅ Firestore database with users, products collections
- ✅ Cloud Storage for images
- ✅ Security rules for data protection
- ✅ Admin user with special permissions

**Your website now has:**
- ✅ Working registration page
- ✅ Working login page
- ✅ User authentication
- ✅ Database connection
- ✅ Secure data access
- ✅ Image upload capability

**Time spent:** ~15-20 minutes

**You're ready to build!** 🚀

---

**Congratulations! Your Firebase setup is complete!** 🎉

Your Ranisa Boutique website is now connected to a real database with authentication!
