# Production Deployment Guide — DocuCanvas

This guide provides step-by-step instructions for deploying DocuCanvas to production using **Vercel**, **MongoDB Atlas**, **Upstash Redis**, and **Google Cloud Console**.

---

## 1. Prerequisites Checklist

Before beginning deployment, ensure you have:
- A [Vercel account](https://vercel.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- An [Upstash Redis](https://upstash.com/) database (optional, in-memory cache active by default)
- A [Google Cloud Console](https://console.cloud.google.com/) project with OAuth 2.0 credentials
- A [Google AI Studio](https://aistudio.google.com/) Gemini API key
- An SMTP or transactional email provider (Resend, SendGrid, Amazon SES, or Gmail App Password)

---

## 2. MongoDB Atlas Configuration

1. Log into MongoDB Atlas and create or select your Cluster.
2. Under **Security > Database Access**:
   - Create a database user (e.g., `docucanvas-app`) with read and write privileges.
   - Note the password.
3. Under **Security > Network Access**:
   - Click **Add IP Address**.
   - Add `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from Vercel's serverless IP pool.
4. Under **Deployment > Database**:
   - Click **Connect > Drivers > Node.js**.
   - Copy the connection URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/docucanvas?retryWrites=true&w=majority
     ```

---

## 3. Google OAuth Production Credentials

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project and navigate to **APIs & Services > Credentials**.
3. Under **OAuth 2.0 Client IDs**, edit your Web Application client:
   - **Authorized JavaScript origins**:
     - `https://your-domain.vercel.app` (replace with your production Vercel domain or custom domain)
   - **Authorized redirect URIs**:
     - `https://your-domain.vercel.app/api/auth/callback/google`
4. Copy `Client ID` and `Client Secret`.

---

## 4. Upstash Redis (Optional for Production Caching)

1. Sign up on [Upstash](https://upstash.com/) and create a serverless Redis database.
2. In the database dashboard, find the **Node.js (ioredis)** connection string:
   ```
   rediss://default:<password>@<endpoint>.upstash.io:6379
   ```
3. Copy this URL into the `REDIS_URL` environment variable.

---

## 5. Vercel Deployment Steps

### Option A: Deploy via GitHub (Recommended)
1. Push your repository to GitHub.
2. In the Vercel Dashboard, click **Add New > Project** and import the repository.
3. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`

4. Add **Environment Variables** in Vercel:

| Variable | Value Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://...` |
| `AUTH_SECRET` | 32-character random string (`openssl rand -base64 32`) | `dGhpc2lzYXNlY3JldGtleTMyeGNsb25l...` |
| `NEXTAUTH_URL` | Production application URL | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Production application URL | `https://your-domain.vercel.app` |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | `*.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | `GOCSPX-...` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `REDIS_URL` | Upstash Redis connection string | `rediss://...` |
| `EMAIL_HOST` | SMTP server host | `smtp.resend.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `resend` |
| `EMAIL_PASSWORD` | SMTP password | `re_123456...` |
| `EMAIL_FROM` | Sender email address | `"DocuCanvas" <team@yourdomain.com>` |

5. Click **Deploy**.

---

## 6. Post-Deployment Database Seeding

After deploying, run the database seed script once to populate default public templates:
```bash
MONGODB_URI="your-production-mongodb-uri" npm run seed
```

---

## 7. Serverless Execution & File Size Considerations

- **DOCX Upload Limit**: The application enforces a 20MB upload ceiling for `.docx` files to conform to serverless payload limits.
- **Vercel Serverless Function Timeout**: By default, Vercel functions timeout after 10–15 seconds on free plans. The Gemini 1.5 Flash model and `mammoth` parser typically execute in <1.5s, remaining well within these limits.
- **CORS & Headers**: DOCX export sets `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document` and `Content-Disposition: attachment; filename="..."` with UTF-8 encoding.
