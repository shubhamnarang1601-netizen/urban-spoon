# Firebase Setup Guide for Ranisa Boutique

This guide will walk you through setting up Firebase for your Ranisa Boutique eCommerce website.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `ranisa-boutique` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **web icon** (`</>`) to add a web app
2. Enter app nickname: `Ranisa Boutique Web`
3. Check "Also set up Firebase Hosting" (optional, for deployment)
4. Click "Register app"
5. **Copy the Firebase configuration object** - you'll need this for `.env.local`

## Step 3: Enable Firebase Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Create Admin User

1. Go to **Authentication** → **Users** tab
2. Click "Add user"
3. Enter:
   - Email: `admin@ranisaboutique.com` (or your admin email)
   - Password: Create a strong password
4. Click "Add user"
5. **Important**: Save these credentials! You'll need them to access the admin panel

## Step 4: Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose a location (select closest to your users)
4. Start in **test mode** (we'll add security rules later)
5. Click "Enable"

### Add Initial Collections

Create these collections in Firestore:

#### 1. `users` Collection
- Automatically created when users register
- No manual setup needed

#### 2. `products` Collection
Create a sample product:

```javascript
{
  name: "Silk Saree - Pink",
  description: "Beautiful handwoven silk saree with traditional embroidery",
  price: 2999,
  discount: 10,
  category: "sarees",
  images: ["https://placehold.co/600x800/d946a6/white?text=Silk+Saree"],
  stock: 15,
  sizes: ["Free Size"],
  colors: ["Pink", "Red"],
  featured: true,
  newArrival: true,
  createdAt: (current timestamp),
  updatedAt: (current timestamp)
}
```

#### 3. `categories` Collection
Add categories:

```javascript
[
  { name: "Sarees", slug: "sarees", description: "Traditional and modern sarees" },
  { name: "Salwar Suits", slug: "salwar-suits", description: "Elegant salwar suits" },
  { name: "Lehengas", slug: "lehengas", description: "Designer lehengas" },
  { name: "Kurtis", slug: "kurtis", description: "Stylish kurtis" },
  { name: "Gowns", slug: "gowns", description: "Beautiful gowns" },
  { name: "Accessories", slug: "accessories", description: "Fashion accessories" }
]
```

## Step 5: Enable Firebase Storage

1. Go to **Build** → **Storage**
2. Click "Get started"
3. Start in **test mode**
4. Choose the same location as Firestore
5. Click "Done"

### Create Storage Folders

Storage folders are created automatically when you upload files, but the structure will be:

```
/products/{productId}/{imageFileName}
/categories/{imageFileName}
```

## Step 6: Apply Security Rules

### Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Copy the contents of `firestore.rules` from your project
3. Paste into the rules editor
4. Click "Publish"

### Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Copy the contents of `storage.rules` from your project
3. Paste into the rules editor
4. Click "Publish"

## Step 7: Update Admin User Role

1. Go to **Firestore Database**
2. Find your `users` collection
3. Locate the admin user document (find by email)
4. Edit the document and add/update:
   ```javascript
   {
     role: "admin"
   }
   ```
5. Save

## Step 8: Configure Environment Variables

1. In your project, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_ADMIN_EMAIL=admin@ranisaboutique.com
```

## Step 9: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Test user registration:
   - Go to `/register`
   - Create a test account
   - Check that user appears in Firebase Authentication

4. Test admin login:
   - Go to `/admin/login`
   - Login with admin credentials
   - Verify access to admin dashboard

## Step 10: Deploy Firebase Hosting (Optional)

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase in Your Project

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Storage
- ✅ Hosting

Follow the prompts:
- Use existing project: Select your Firebase project
- Firestore rules: `firestore.rules`
- Storage rules: `storage.rules`
- Public directory: `out` (for Next.js static export) or `.next` for SSR
- Single-page app: No
- Automatic builds: Optional

### Deploy

```bash
npm run build
firebase deploy
```

## Firestore Data Structure Reference

### Products Collection

```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number; // percentage
  category: string;
  images: string[]; // Firebase Storage URLs
  stock: number;
  sizes?: string[];
  colors?: string[];
  featured: boolean;
  newArrival: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Orders Collection

```typescript
{
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Users Collection

```typescript
{
  id: string; // Same as Firebase Auth UID
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses?: Address[];
  createdAt: timestamp;
}
```

## Troubleshooting

### "Permission Denied" Errors

- Check that security rules are deployed
- Verify user role in Firestore
- Make sure you're logged in

### Image Upload Fails

- Check Storage is enabled
- Verify storage.rules are deployed
- Check file size limits (default: 10MB)

### Can't Access Admin Panel

- Verify user role is set to `'admin'` in Firestore
- Check `NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local`
- Clear browser cache and cookies

### Firebase Not Initializing

- Check all environment variables are set correctly
- Make sure `.env.local` exists (not `.env.local.example`)
- Restart development server after changing `.env.local`

## Security Checklist

- ✅ Firestore security rules deployed
- ✅ Storage security rules deployed
- ✅ Admin user role set to `'admin'`
- ✅ Test mode disabled in production
- ✅ Environment variables not committed to Git
- ✅ Strong admin password used

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

For project-specific help:
- Check README.md
- Contact: info@ranisaboutique.com

---

**Your Firebase setup is complete! 🎉**

The website should now be fully functional with:
- User authentication
- Product management
- Order processing
- Image uploads
- Secure data access
