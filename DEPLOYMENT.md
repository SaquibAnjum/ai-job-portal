# Production Deployment Guide - AI Job Portal

This guide provides step-by-step instructions to deploy the AI Job Portal platform to production services: **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database).

---

## 1. Database Setup: MongoDB Atlas
1. Sign up/log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free Tier or M10+ for Production).
3. Create a Database User under **Database Access**.
4. In **Network Access**, whitelist `0.0.0.0/0` (or Render's outbound IPs).
5. Copy your connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_job_portal?retryWrites=true&w=majority`

---

## 2. Backend Deployment: Render.com
1. Create a Web Service on [Render](https://render.com).
2. Connect your GitHub repository and select the root directory or `server/`.
3. Set Build & Start Commands:
   - **Build Command**: `npm install` (inside `server/`)
   - **Start Command**: `node server.js`
4. Add the following **Environment Variables** in Render Dashboard:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Secure Random Secret Key>`
   - `JWT_EXPIRE`: `1d`
   - `CLIENT_URL`: `https://your-app.vercel.app`
   - `GEMINI_API_KEY`: `<Your Google Gemini API Key>`
5. Deploy Web Service and note your backend URL (e.g. `https://ai-job-portal-api.onrender.com`).

---

## 3. Frontend Deployment: Vercel
1. Sign in to [Vercel](https://vercel.com) and import the repository.
2. Select `client` as the Root Directory.
3. Select **Vite** as Framework Preset.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://ai-job-portal-api.onrender.com`
5. Click **Deploy**.

---

## 4. Post-Deployment Verification
- Run the seeding script remotely or populate initial jobs.
- Verify authentication, resume uploading, and Gemini AI match score generation.
