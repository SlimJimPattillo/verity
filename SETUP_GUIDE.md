# Verity Setup Guide

## 🚀 Implementation Complete!

All core features have been implemented with Supabase persistence and Claude AI integration.

---

## ✅ What's Been Built

### 1. Authentication System
- Email/password authentication via Supabase
- User signup with organization creation
- Protected routes for authenticated users
- User profile management
- Sign out functionality

### 2. Asset Vault - Full CRUD
- **Metrics**: Create, Read, Update, Delete metrics with Supabase
- **Narratives**: Create, Read, Update, Delete narratives with Supabase
- **CSV Import**: Robust CSV parsing with field mapping using PapaParse
- **Edit Functionality**: Modal-based editing for both metrics and narratives
- Real-time data persistence

### 3. Report Builder with Persistence
- Save/load reports to/from Supabase
- Multi-step report creation process
- Associate metrics with reports
- Customize colors, title, date range, narrative
- Reports include template selection and financials

### 4. Grant Copilot - AI-Powered
- Claude API integration (Sonnet 4 model)
- Generates grant answers based on your actual metrics
- Three tone options: Professional, Emotional, Urgent
- Saves generated answers to database
- Can save answers as reusable narratives

### 5. PDF Export
- Professional PDF generation using @react-pdf/renderer
- Includes all report sections (narrative, metrics, financials)
- Downloadable with one click
- PNG export support
- Shareable report links

### 6. Settings Persistence
- Organization settings (name, EIN, website, colors)
- User profile settings (name, role)
- All saved to Supabase with real-time updates

---

## 🔧 Environment Setup

### Step 1: Create `.env.local` file

In the `verity/` directory, create a file named `.env.local`:

```bash
# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic Claude API (Server-side only - for Vercel deployment)
# Get your API key from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Step 2: Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in and select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → paste as `VITE_SUPABASE_URL`
   - **anon public** key → paste as `VITE_SUPABASE_ANON_KEY`

### Step 3: Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:
(The complete SQL schema is in the conversation history above)

Key tables created:
- `organizations` - Organization data and branding
- `user_profiles` - User account details
- `metrics` - Impact metrics and data points
- `narratives` - Reusable narrative snippets
- `reports` - Saved reports
- `report_metrics` - Report-to-metrics associations
- `grant_answers` - AI-generated grant responses

All tables have Row Level Security (RLS) enabled.

### Step 4: Get Your Anthropic API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **Settings** → **API Keys**
4. Create a new API key
5. Copy the key → paste as `ANTHROPIC_API_KEY` in `.env.local`

**Note**: The Anthropic API key should NOT have the `VITE_` prefix since it's used server-side only.

### Step 5: Install Dependencies (if not already done)

```bash
cd verity
npm install
```

Dependencies installed:
- `@supabase/supabase-js` - Supabase client
- `@anthropic-ai/sdk` - Claude AI SDK
- `@react-pdf/renderer` - PDF generation
- `papaparse` - CSV parsing

---

## 🧪 Testing the Application

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Authentication Flow

1. Navigate to `/signup`
2. Create a new account with:
   - Email
   - Password
   - Organization name
   - Sector selection
3. You should be automatically logged in and redirected to dashboard
4. Try signing out and signing back in at `/login`

### 3. Test Asset Vault

#### Metrics
1. Go to **Asset Vault** → **Metrics** tab
2. Click **Add Metric** or use the quick add bar
3. Create a few metrics with different units ($ , %, People, #)
4. Try editing a metric (click the three dots → Edit)
5. Delete a metric to test deletion

#### CSV Import
1. Click **Import CSV**
2. Use the sample CSV format or create your own
3. Verify metrics are imported correctly

#### Narratives
1. Switch to **Narratives** tab
2. Click **Add Narrative**
3. Create a narrative with title, content, and tags
4. Edit and delete narratives to test CRUD operations

### 4. Test Report Builder

1. Go to **Report Builder**
2. Step through the wizard:
   - Select a template
   - Metrics should load from your vault
   - Customize colors, title, date range
   - Add narrative
3. Click **Save** to persist the report
4. Go to **Export** step
5. Try downloading as PDF

### 5. Test Grant Copilot

1. Go to **Grant Copilot**
2. Enter a grant question (e.g., "How has your organization demonstrated measurable impact?")
3. Select a tone (Professional/Emotional/Urgent)
4. Click **Generate Answer**
5. Wait for Claude AI to generate a response
6. Try "Save to Vault" to save as a narrative

### 6. Test Settings

1. Go to **Settings**
2. Update organization details (name, website, EIN)
3. Change brand colors
4. Update your user profile
5. Verify changes are saved (refresh the page)

---

## 🎨 Features to Test

### Real-time Persistence
- Create data in one tab, refresh another → data persists
- Sign out and sign back in → data is still there

### Data Associations
- Reports should remember which metrics you selected
- Metrics used in Grant Copilot should be tracked

### Error Handling
- Try submitting forms with missing fields
- Check for proper error messages
- Test with invalid data

### UI/UX
- Responsive design on different screen sizes
- Loading states during async operations
- Toast notifications for success/error
- Modal forms for CRUD operations

---

## 🚀 Deployment

The app is ready for deployment to Vercel:

1. **Push to GitHub** (if not already)
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables in Vercel dashboard:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `ANTHROPIC_API_KEY`
3. **Deploy**

The `vercel.json` and API routes are already configured.

---

## 📊 Data Model Summary

```
organizations (1) ──→ (many) user_profiles
     │
     ├──→ (many) metrics
     ├──→ (many) narratives
     ├──→ (many) reports
     └──→ (many) grant_answers

reports (1) ──→ (many) report_metrics ──→ (many) metrics
```

---

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access data from their own organization
- API keys kept secure (server-side only)
- Auth tokens managed by Supabase

---

## 📝 Next Steps

1. ✅ Create `.env.local` with your credentials
2. ✅ Run SQL schema in Supabase
3. ✅ Test authentication flow
4. ✅ Create some test data
5. ✅ Test all features end-to-end
6. Deploy to Vercel (optional)
7. Add additional features as needed:
   - Email verification
   - Password reset
   - Team member invitations
   - Media uploads to Asset Vault
   - More report templates
   - Export analytics

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` exists in the `verity/` directory
- Ensure variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating `.env.local`

### Authentication Issues
- Verify Supabase project is active
- Check RLS policies are enabled
- Ensure email confirmation is disabled in Supabase Auth settings (for testing)

### Claude API Errors
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has sufficient quota
- Model name is `claude-sonnet-4-20250514`

### PDF Export Not Working
- Check browser console for errors
- Ensure all required fields are filled
- Try with a smaller report first

---

## 📚 Documentation

- Supabase Docs: https://supabase.com/docs
- Anthropic API Docs: https://docs.anthropic.com
- React PDF Docs: https://react-pdf.org/
- PapaParse Docs: https://www.papaparse.com/docs

---

**You're all set! Start by creating your `.env.local` file and running the app.** 🎉
