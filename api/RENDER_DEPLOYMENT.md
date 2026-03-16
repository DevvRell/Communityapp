# Render Deployment Guide

This guide will help you deploy your CB5 Backend API to Render.

## 🚀 Quick Deploy Options

### Option 1: Deploy with Blueprint (Recommended)

The easiest way to deploy is using Render's Blueprint (Infrastructure as Code):

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Express TypeScript backend with PostgreSQL"
   git push -u origin main
   ```

2. **Create New Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New** → **Blueprint**
   - Connect your GitHub repository: `DevvRell/CB5-api`
   - Render will automatically detect the `render.yaml` file
   - Click **Apply** to deploy

3. **Wait for Deployment**
   - PostgreSQL database will be created first
   - Express app will build and deploy automatically
   - Health checks will verify everything is working

### Option 2: Manual Deployment

#### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name**: `cb5-postgres`
   - **Database**: `cb5_db`
   - **User**: `postgres`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **Create Database**
5. **Save the Internal Database URL** (you'll need this)

#### Step 2: Deploy Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository: `DevvRell/CB5-api`
3. Configure:
   - **Name**: `cb5-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Plan**: Free

4. **Environment Variables** (click Advanced):
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<paste your internal database URL>
   POSTGRES_HOST=<from database internal URL>
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=<from database>
   POSTGRES_DB=cb5_db
   ```

5. **Health Check Path**: `/health`

6. Click **Create Web Service**

## 🔧 Environment Variables

Render will automatically provide these, but here's what each does:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port (auto-set by Render) | `3000` |
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `POSTGRES_HOST` | Database hostname | `dpg-xxx.oregon-postgres.render.com` |
| `POSTGRES_PORT` | Database port | `5432` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | Auto-generated |
| `POSTGRES_DB` | Database name | `cb5_db` |

## ✅ Verify Deployment

Once deployed, Render will provide you with a URL like:
```
https://cb5-backend.onrender.com
```

### Test Your Endpoints

1. **Health Check**
   ```bash
   curl https://cb5-backend.onrender.com/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-01-21T...",
     "services": {
       "api": "up",
       "database": "connected"
     }
   }
   ```

2. **Root Endpoint**
   ```bash
   curl https://cb5-backend.onrender.com/
   ```

3. **Swagger Documentation**
   Open in browser:
   ```
   https://cb5-backend.onrender.com/api-docs
   ```

## 🐛 Troubleshooting

### Database Connection Failed

If health check shows `database: "disconnected"`:

1. **Check Database Status**
   - Go to your database in Render dashboard
   - Ensure status is "Available"
   - Copy the **Internal Database URL**

2. **Verify Environment Variables**
   - In web service, go to **Environment**
   - Ensure `DATABASE_URL` matches internal database URL
   - Ensure `POSTGRES_HOST` is correct

3. **Check Logs**
   ```
   Dashboard → Your Service → Logs
   ```

### Service Won't Start

1. **Check Build Logs**
   - Look for TypeScript compilation errors
   - Ensure all dependencies installed correctly

2. **Verify Node Version**
   - Render should use Node 20 (specified in Dockerfile)
   - Check `package.json` engines field

### Health Check Failing

1. **Check Health Check Path**
   - Should be set to `/health`
   - Case-sensitive!

2. **Review Application Logs**
   - Look for startup errors
   - Check database connection errors

## 📊 Monitoring

### View Logs
```
Dashboard → Your Service → Logs (tab)
```

### Metrics
```
Dashboard → Your Service → Metrics (tab)
```

Monitor:
- CPU usage
- Memory usage
- Request count
- Response time

## 🔄 Updates and Redeployment

### Automatic Deploys

Render automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Deploy

```
Dashboard → Your Service → Manual Deploy → Deploy latest commit
```

## 🌐 Custom Domain (Optional)

1. Go to your web service
2. Click **Settings** → **Custom Domain**
3. Add your domain
4. Update DNS records as instructed

## 💰 Render Free Tier Limits

**PostgreSQL Free**:
- 1 GB storage
- Expires after 90 days
- No backups

**Web Service Free**:
- 512 MB RAM
- Shared CPU
- Spins down after 15 min of inactivity
- 750 hours/month

**Important**: Free tier services spin down when idle. First request after idle may take 30-60 seconds.

## 🚀 Production Checklist

Before going to production:

- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up custom domain
- [ ] Configure CORS if needed
- [ ] Add rate limiting
- [ ] Set up monitoring/alerts
- [ ] Upgrade to paid plan for:
  - Always-on service (no spin-down)
  - More resources
  - Database backups
  - Better support

## 🔐 Security Best Practices

1. **Never commit secrets**
   - `.env` is in `.gitignore`
   - Use Render's environment variables

2. **Use Internal Database URL**
   - Faster and more secure
   - Already configured in `render.yaml`

3. **Review Environment Variables**
   - Remove any unused variables
   - Use Render's secret file for sensitive data

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Render PostgreSQL](https://render.com/docs/databases)
- [Render Web Services](https://render.com/docs/web-services)
- [Render Blueprints](https://render.com/docs/infrastructure-as-code)

## 🆘 Getting Help

If you encounter issues:

1. Check [Render Status](https://status.render.com/)
2. Review [Render Community](https://community.render.com/)
3. Contact [Render Support](https://render.com/support)

---

## Quick Command Reference

```bash
# Deploy to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# Test health check (replace with your Render URL)
curl https://your-app.onrender.com/health

# View Swagger docs
open https://your-app.onrender.com/api-docs
```

Your app is ready for Render! 🎉
