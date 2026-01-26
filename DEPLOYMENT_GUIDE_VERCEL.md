# 🚀 How to Deploy to Vercel (Step-by-Step)

This guide will show you how to deploy your Ranisa Boutique website to Vercel for free. Vercel is the creators of Next.js and provides the best hosting with automatic deployments.

---

## 🔄 How Automatic Deployment Works

Once set up, **deployment is automatic**:
1. You make changes to your code locally.
2. You push your code to GitHub.
3. Vercel detects the push and **automatically builds and deploys** your new version.
4. Your live website updates in minutes!

---

## 🛠️ Step 1: Push Your Code to GitHub

First, your code needs to be on GitHub.

1. **Create a GitHub Account**
   - Go to [github.com](https://github.com) and sign up if you haven't.

2. **Create a New Repository**
   - Click the `+` icon in the top right -> **New repository**.
   - Name it `ranisa-boutique`.
   - Select **Private** (recommended for boutique code).
   - Click **Create repository**.

3. **Push Your Local Code**
   Open your terminal (in VS Code or Command Prompt) and run these commands:

   ```bash
   # Initialize git if not already done
   git init
   
   # Add all files
   git add .
   
   # Commit your changes
   git commit -m "Initial commit - Ranisa Boutique Setup"
   
   # Rename branch to main
   git branch -M main
   
   # Link to your GitHub repo (Replace URL with YOUR repository URL)
   git remote add origin https://github.com/YOUR_USERNAME/ranisa-boutique.git
   
   # Push to GitHub
   git push -u origin main
   ```

---

## ☁️ Step 2: Deploy on Vercel

1. **Create a Vercel Account**
   - Go to [vercel.com/signup](https://vercel.com/signup).
   - Sign up with **GitHub**.

2. **Import Your Project**
   - On your Vercel dashboard, click **"Add New..."** -> **Project**.
   - Review permissions if asked (allow Vercel to access your repositories).
   - You should see `ranisa-boutique` in the list. Click **Import**.

3. **Configure Project**
   - **Framework Preset**: Should auto-detect as `Next.js`.
   - **Root Directory**: `./` (default).

4. **🔑 Environment Variables (IMPORTANT)**
   You MUST add your Firebase credentials here so the live site can connect to the database.
   
   Expand the **"Environment Variables"** section and add these from your `.env.local` file:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | (Your Key) |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (Your Domain) |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (Your Project ID) |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (Your Bucket) |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (Your ID) |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | (Your App ID) |
   | `NEXT_PUBLIC_ADMIN_EMAIL` | `admin@ranisaboutique.com` |

   *Copy the values exactly from your local `.env.local` file.*

5. **Deploy**
   - Click **Deploy**.
   - Wait ~1 minute. Vercel will build your site.
   - You'll see confetti 🎉 when it's done!

---

## 🌐 Your Live Website

Vercel will give you a domain like:
`https://ranisa-boutique.vercel.app`

You can share this link with anyone!

---

## 🔄 How to Update Your Live Site

When you make changes (e.g., adding a new page, fixing a typo):

1. **Save your changes** locally.

2. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Added new shop page feature"
   git push origin main
   ```

3. **That's it!**
   - Go to your Vercel dashboard.
   - You'll see a new "Deployment" starting automatically.
   - In 1-2 minutes, your live URL will show the changes.

---

## 🆘 Troubleshooting

### Build Failed?
- Click "View Build Logs" in Vercel.
- Common issue: TypeScript errors. Run `npm run build` locally to check for errors before pushing.

### Firebase Error on Live Site?
- Check your **Environment Variables** in Vercel (Settings -> Environment Variables).
- Make sure you copied them exactly correctly.
- Be sure not to include quotes `""` around the values in Vercel.

### "404 page not found" on refresh?
- This shouldn't happen with Next.js App Router, but if it does, ensure your `vercel.json` is configured (Next.js handles this automatically usually).
