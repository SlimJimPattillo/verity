# Vercel Deployment Guide for Verity

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Prerequisites

1. ✅ Supabase database set up (see `SETUP.md` for SQL schema)
2. ✅ Anthropic API key (get from https://console.anthropic.com/settings/keys)
3. ✅ Vercel account (free at https://vercel.com)
4. ✅ GitHub account (to connect your repo)

---

## Step-by-Step Deployment

### 1. Push to GitHub

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Initial commit - Verity MVP"

# Create a new GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/verity.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your Verity repo
4. Vercel will auto-detect it's a Vite app

### 3. Configure Environment Variables

In Vercel project settings, add these environment variables:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Dashboard → Settings → API (anon/public) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | https://console.anthropic.com/settings/keys |

**Important:**
- The `VITE_` prefix variables are exposed to the client (safe)
- `ANTHROPIC_API_KEY` is server-side only (stays secure)

### 4. Deploy

Click **"Deploy"** and Vercel will:
- ✅ Build your app (`npm run build`)
- ✅ Deploy to a production URL
- ✅ Set up automatic deployments on git push

---

## Vercel Configuration

Your `vercel.json` is already configured with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

This ensures:
- Vite builds correctly
- API routes work (`/api/generate-grant-answer`)
- Serverless functions deployed automatically

---

## Serverless Functions

### Included Function: `/api/generate-grant-answer`

**Location:** `api/generate-grant-answer.ts`

**Purpose:** Securely calls Claude API server-side (keeps API key safe)

**How it works:**
```
Client → /api/generate-grant-answer → Claude API → Response
         (serverless function)
```

**Why this matters:**
- ✅ API key never exposed to browser
- ✅ Can't be extracted by users
- ✅ You control rate limiting
- ✅ Lower risk of abuse

---

## Post-Deployment Checklist

### ✅ Verify Deployment

1. **Check Build Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click latest deployment
   - Verify build succeeded (green checkmark)

2. **Test Live Site**
   - Visit your Vercel URL: `https://your-app.vercel.app`
   - Sign up with a test account
   - Verify authentication works
   - Add a metric
   - Generate a grant answer (tests Claude API)

3. **Check Supabase Connection**
   - Go to Supabase Dashboard → Auth → Users
   - Verify your test user appears
   - Check Tables → organizations, metrics
   - Verify data is saving

### 🔒 Security Verification

- [ ] `ANTHROPIC_API_KEY` is NOT in client-side env vars
- [ ] Supabase RLS policies are enabled
- [ ] HTTPS is forced (Vercel does this automatically)
- [ ] Environment variables are production values

---

## Custom Domain (Optional)

### Add Your Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `verity.yourdomain.com`)
4. Follow DNS configuration instructions
5. Vercel auto-provisions SSL certificate

**Recommended domains:**
- `app.yourdomain.com`
- `verity.yourdomain.com`
- `impact.yourdomain.com`

---

## Automatic Deployments

Vercel automatically deploys when you:
- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview deployments
- ✅ Open PR → Preview URL in PR comments

**Example workflow:**
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to production
# 4. Sends you a Slack/email notification (optional)
```

---

## Environment-Specific Configurations

### Development
```bash
npm run dev
# Uses .env.local
```

### Production (Vercel)
- Uses environment variables from Vercel Dashboard
- No `.env` file needed in deployment
- All secrets managed in Vercel UI

---

## Monitoring & Analytics

### Built-in Vercel Analytics

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics (free)
3. See:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Add Error Tracking (Recommended)

**Option 1: Sentry**
```bash
npm install @sentry/react
```

**Option 2: LogRocket**
```bash
npm install logrocket
```

See `QA_REPORT.md` for integration guides.

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Run locally first
npm install
npm run build

# Fix any errors, then push
```

**Error: "Environment variable not found"**
- Verify all env vars are set in Vercel Dashboard
- Check spelling (case-sensitive)
- Redeploy after adding vars

### API Route Not Working

**Error: "404 on /api/generate-grant-answer"**
- Check `api/` folder exists in root
- Verify `vercel.json` has correct rewrites
- Check function name matches URL

**Error: "Invalid API key"**
- Verify `ANTHROPIC_API_KEY` is set in Vercel
- Check it's the server-side one (not `VITE_` prefixed)
- Test key locally first

### Database Connection Issues

**Error: "Failed to connect to Supabase"**
- Verify `VITE_SUPABASE_URL` is correct
- Check `VITE_SUPABASE_ANON_KEY` matches your project
- Confirm RLS policies are enabled

---

## Performance Optimization

### Vercel Edge Network

Your app is automatically deployed to Vercel's global CDN:
- ✅ 70+ regions worldwide
- ✅ Automatic caching
- ✅ Edge functions run close to users
- ✅ ~50ms response times globally

### Recommended Optimizations

1. **Code Splitting** (Future)
   ```typescript
   // Lazy load heavy pages
   const ReportBuilder = lazy(() => import('./pages/ReportBuilder'));
   ```

2. **Image Optimization**
   - Use Vercel Image Optimization
   - Add `next/image` component (or similar)

3. **Caching Headers**
   - Already configured in `vercel.json`
   - Static assets cached for 1 year

---

## Scaling

### Current Limits (Vercel Free Tier)

- ✅ 100 deployments/month
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions: 100,000/month
- ✅ 1 concurrent build

**This is plenty for:**
- Beta testing (10-50 users)
- MVP validation
- Initial customer acquisition

### When to Upgrade

Upgrade to Pro ($20/month) when you hit:
- 1,000+ active users
- 500GB+ bandwidth/month
- Need team collaboration
- Want custom domains

---

## Support & Resources

**Vercel Documentation:**
- https://vercel.com/docs
- https://vercel.com/docs/serverless-functions

**Community:**
- Vercel Discord: https://vercel.com/discord
- Vercel GitHub: https://github.com/vercel/vercel

**Get Help:**
- Check Vercel's status page: https://vercel-status.com
- Search Vercel docs: https://vercel.com/docs
- Ask in Vercel Discord

---

## Next Steps After Deployment

1. ✅ Test all features on live site
2. ✅ Share preview URL with 3-5 nonprofit testers
3. ✅ Set up error tracking (Sentry recommended)
4. ✅ Enable Vercel Analytics
5. ✅ Configure custom domain (optional)
6. ✅ Set up automated backups (Supabase has this built-in)

---

**You're ready to deploy!** 🚀

Any issues? Check `QA_REPORT.md` or open an issue in your GitHub repo.
