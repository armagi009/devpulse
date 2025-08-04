# 🔑 Credentials Needed for Production Deployment

## **What You Have ✅**
- ✅ Supabase Project URL: `https://yyxisciydoxchggzgcbu.supabase.co`
- ✅ Supabase Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ GitHub OAuth App ID: `Ov23lipsOJ2q1BRwFDJD`
- ✅ GitHub OAuth Secret: `944daa0bfbc02c7276660265f9a4546eaaf40462`
- ✅ Generated NEXTAUTH_SECRET: `Doi5yJZsxDQOJuWRC+O8kO6kp1fia5HUTfxhoqC8jEc=`
- ✅ Generated ENCRYPTION_KEY: `ae9dce6a416bb669f9cb6ed6cd5513b78ffe6f65704cdb985bca7d2ca3a6d11c`

## **What You Need to Get 🔄**

### **1. From Supabase Dashboard**
**URL:** https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu

**Need to get:**
- [ ] **Database Password** (Settings → Database → Connection string)
- [ ] **Service Role Key** (Settings → API → service_role key)

### **2. From Vercel Dashboard**
**URL:** Your Vercel project dashboard

**Need to get:**
- [ ] **Vercel Token** (Account Settings → Tokens → Create "DevPulse CI/CD")
- [ ] **Project ID** (Project Settings → General)
- [ ] **Org ID** (Project Settings → General)
- [ ] **Your actual Vercel URL** (to replace placeholder URLs)

### **3. From SonarCloud**
**URL:** https://sonarcloud.io

**Need to get:**
- [ ] **SONAR_TOKEN** (My Account → Security → Generate token "DevPulse CI/CD")

### **4. From Snyk (Optional)**
**URL:** https://snyk.io

**Need to get:**
- [ ] **SNYK_TOKEN** (Account Settings → API Token)

---

## **Where to Use These Credentials**

### **Update .env.production file:**
```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.yyxisciydoxchggzgcbu.supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app
NEXTAUTH_URL=https://your-actual-vercel-url.vercel.app
```

### **Add to Vercel Environment Variables:**
- Copy ALL variables from updated `.env.production`

### **Add to GitHub Secrets:**
```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
SONAR_TOKEN=your_sonar_token
SNYK_TOKEN=your_snyk_token (optional)
```

---

## **Quick Links**

- **Supabase Dashboard:** https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu
- **GitHub Secrets:** https://github.com/armagi009/devpulse/settings/secrets/actions
- **SonarCloud:** https://sonarcloud.io
- **Snyk:** https://snyk.io

---

## **Verification**

After getting each credential, run:
```bash
node scripts/verify-external-services.js
```

This will tell you exactly what's still missing and what's properly configured.

---

**🎯 Goal:** Get all the credentials above, and you'll have a fully operational production deployment with CI/CD pipeline!