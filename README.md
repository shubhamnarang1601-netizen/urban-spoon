# Ranisa Boutique - E-commerce Website

A modern, professional, and fully responsive eCommerce website for Ranisa Boutique built with Next.js 14, TypeScript, Firebase, and vanilla CSS.

## ✨ Features

### Customer Features
- 🏠 **Beautiful Homepage** with hero section, category cards, and features
- 🛍️ **Product Browsing** with filters, search, and categories
- 🛒 **Shopping Cart** with persistent state (localStorage)
- ❤️ **Wishlist** functionality
- 📦 **Order Tracking** and history
- 🔐 **User Authentication** (Firebase Auth)
- 💳 **Multiple Payment Options** (COD, UPI, Cards, Razorpay)
- 📱 **Fully Responsive** design for all devices

### Admin Features
- 📊 **Dashboard** with analytics and insights
- ➕ **Product Management** (Add, Edit, Delete)
- 🖼️ **Image Upload** to Firebase Storage
- 📋 **Order Management** with status updates
- 👥 **Customer Management**
- 🔒 **Secure Admin Routes** with role-based access

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Vanilla CSS with CSS Modules
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: React Context API
- **Fonts**: Google Fonts (Playfair Display, Inter, Cormorant Garamond)

## 📁 Project Structure

```
ranisa-boutique/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout with Cart Provider
│   ├── globals.css          # Global styles & design system
│   ├── shop/                # Shop pages
│   ├── cart/                # Cart page
│   ├── checkout/            # Checkout page
│   ├── admin/               # Admin panel pages
│   └── ...
├── components/              # Reusable components
│   ├── ui/                  # UI components (Button, Input, Card, etc.)
│   ├── layout/              # Layout components (Header, Footer)
│   ├── cart/                # Cart context and components
│   └── ...
├── lib/                     # Utilities and configurations
│   ├── firebase/            # Firebase config and utilities
│   ├── types.ts             # TypeScript interfaces
│   ├── utils.ts             # Helper functions
│   └── constants.ts         # App constants
├── public/                  # Static assets
├── .env.local.example       # Environment variables template
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
└── package.json             # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (free tier works fine)

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd "d:/Rani Sa Boutique/ranisa-boutique"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase** (see [SETUP.md](./SETUP.md) for detailed instructions):
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Enable Firebase Storage
   - Copy configuration to `.env.local`

4. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup Summary

See [SETUP.md](./SETUP.md) for the complete setup guide. Quick overview:

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Create Firestore database (start in test mode, then apply security rules)
4. Enable Storage
5. Copy config to `.env.local`
6. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

## 🎨 Design System

The project uses a premium boutique design system with:

- **Colors**: Vibrant pink/purple gradients (`--primary`, `--accent`, `--secondary`)
- **Typography**: Playfair Display (headings), Inter (body), Cormorant Garamond (accents)
- **Spacing**: Consistent scale from `--spacing-xs` to `--spacing-3xl`
- **Shadows**: Multiple elevation levels for depth
- **Animations**: Smooth transitions and micro-interactions

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🔐 Admin Access

To access the admin panel:

1. Create a user account with the admin email (set in `.env.local`)
2. Navigate to `/admin/login`
3. Login with admin credentials

Default admin email: `admin@ranisaboutique.com` (configurable in `.env.local`)

## 📦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

### Firebase Hosting

See [SETUP.md](./SETUP.md) for Firebase Hosting deployment steps.

## 🔒 Security

- Firestore security rules enforce role-based access
- Storage rules protect image uploads
- Admin routes check user role
- Environment variables for sensitive data

## 🤝 Contributing

This is a commercial project for Ranisa Boutique. For support or custom features, contact the development team.

## 📄 License

Copyright © 2026 Ranisa Boutique. All rights reserved.

## 📞 Support

For issues or questions:
- Email: info@ranisaboutique.com
- Phone: +91 98765 43210

---

**Built with ❤️ using Next.js and Firebase**
