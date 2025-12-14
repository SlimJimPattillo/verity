# Supabase Email Authentication Setup

## Issue
Email confirmation links from Supabase lead nowhere because the redirect URL isn't configured.

## Fix Steps

### 1. Configure Site URL and Redirect URLs in Supabase

Go to your Supabase Dashboard:
1. Navigate to: **Authentication** → **URL Configuration**
2. Set the following URLs:

```
Site URL: https://your-vercel-app-url.vercel.app
(or http://localhost:8080 for local development)

Redirect URLs (add both):
- https://your-vercel-app-url.vercel.app/**
- http://localhost:8080/**
```

### 2. Update Email Templates (Optional but Recommended)

Go to: **Authentication** → **Email Templates**

For each template (Confirm signup, Reset password, etc.):
- Click "Edit"
- Make sure the redirect URL uses: `{{ .ConfirmationURL }}`

Example Confirm Signup template:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

### 3. Disable Email Confirmation (Alternative - Not Recommended for Production)

If you want to skip email confirmation for now (ONLY for development):

Go to: **Authentication** → **Providers** → **Email**
- Uncheck "Enable email confirmations"
- Click "Save"

⚠️ **Warning**: This is less secure and not recommended for production.

## How It Works After Configuration

1. User signs up with email/password
2. Supabase sends confirmation email
3. User clicks link in email
4. Supabase confirms the email and redirects to your Site URL
5. User can now sign in normally (if using the streamlined onboarding)
   OR the WelcomeModal will appear (if email was confirmed but no org exists)

## For Local Development

Add to your redirect URLs:
```
http://localhost:8080/**
http://localhost:5173/**
```

Then when testing locally, make sure to use the same port.
