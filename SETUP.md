# Verity Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Anthropic API key (for Claude AI)

## Step 1: Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your credentials in `.env.local`:

### Get Supabase Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Project Settings** → **API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Get Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Create a new API key
3. Copy it to `VITE_ANTHROPIC_API_KEY`

## Step 2: Set Up Database

1. Go to your Supabase project
2. Click on **SQL Editor** in the left sidebar
3. Create a new query
4. Copy the entire SQL schema from the original message (the one I provided earlier)
5. Run the query
6. Verify tables were created in **Table Editor**

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the App

```bash
npm run dev
```

## Step 5: Create Your First Account

1. Navigate to `http://localhost:5173/signup`
2. Fill in:
   - Organization name
   - Sector (Food Security, Education, etc.)
   - Email
   - Password (at least 6 characters)
3. Click "Create account"
4. You'll be auto-logged in and redirected to the dashboard

## What's Working Now

✅ **Authentication**
- Sign up with organization creation
- Sign in
- Sign out
- Protected routes

✅ **Organization Settings**
- Save/load brand colors
- Save/load org details (name, website, EIN)
- Save/load user profile

## What's Next (In Progress)

🔄 **Asset Vault (Metrics)**
- CRUD operations for metrics
- Real CSV import
- Data persistence

🔄 **Grant Copilot**
- Real AI responses using Claude API
- Context from your actual metrics

🔄 **Report Builder**
- Save/load reports
- PDF export

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has all required variables
- Restart the dev server after changing `.env.local`

### Can't sign up / Database errors
- Verify the SQL schema was run successfully
- Check Supabase **Table Editor** to ensure tables exist
- Check **Auth** → **Users** to see if user was created

### RLS (Row Level Security) errors
- The SQL schema includes RLS policies
- Users can only access data from their own organization
- This is a security feature, not a bug!

## Next Steps

I'm continuing to build out:
1. Asset Vault with real database operations
2. CSV import functionality
3. Grant Copilot with Claude API
4. PDF export
5. Reports persistence

Check back for updates!
