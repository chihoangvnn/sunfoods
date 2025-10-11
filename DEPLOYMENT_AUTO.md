# 🚀 Automated VPS Deployment with Replit Secrets

## ✅ Prerequisites

**DONE:**
- ✅ VPS_PASSWORD added to Replit Secrets
- ✅ node-ssh installed
- ✅ Deployment scripts ready

---

## 📋 Available Scripts

### **1. `deploy-to-vps.js` - Upload Only**
Uploads files to VPS, **does NOT install** dependencies or restart PM2.

**Use when:** You want to upload files manually and install yourself.

```bash
node deploy-to-vps.js
```

**What it does:**
- ✅ Uploads backend/src, public, shared
- ✅ Uploads customer-mobile/.next, public
- ✅ Uploads PM2 config & install script
- ❌ Does NOT install dependencies
- ❌ Does NOT restart PM2

**After running:** SSH to VPS and run `bash install.sh`

---

### **2. `deploy-and-install.js` - Full Automated Deployment** ⭐

**RECOMMENDED** - Complete one-command deployment!

```bash
node deploy-and-install.js
```

**What it does:**
- ✅ Uploads all files
- ✅ Installs backend dependencies
- ✅ Installs mobile dependencies
- ✅ Restarts PM2 automatically
- ✅ Shows PM2 status
- ✅ Displays app URLs

**Result:** Fully deployed and running! 🎉

---

## 🎯 Quick Start

### **One-Command Full Deployment:**
```bash
node deploy-and-install.js
```

**Output:**
```
🚀 Starting FULL deployment to VPS...
📍 Target: root@sunfoods.vn:/var/www/sun

🔐 Connecting to VPS...
   ✅ Connected!

📤 Uploading backend/src...
   ✅ backend/src uploaded
📤 Uploading backend/public...
   ✅ backend/public uploaded
...

📦 Installing dependencies...
⚙️  Installing backend dependencies...
   ✅ Installing backend dependencies completed
⚙️  Installing mobile dependencies...
   ✅ Installing mobile dependencies completed

🔄 Restarting PM2...
   ✅ Starting new processes completed

✅ DEPLOYMENT COMPLETE!

📍 Application URLs:
   Backend API: https://sunfoods.vn/api
   Admin Panel: https://sunfoods.vn/adminhoang
   Mobile Store: https://sunfoods.vn
```

---

## 🔧 Configuration

### VPS Settings (in scripts):
```javascript
const VPS_HOST = 'sunfoods.vn';
const VPS_USER = 'root';
const VPS_PASSWORD = process.env.VPS_PASSWORD;  // From Secrets
const VPS_DIR = '/var/www/sun';
```

### To Change VPS:
Edit the constants at the top of `deploy-to-vps.js` or `deploy-and-install.js`

---

## 📊 Post-Deployment

### View Logs:
```bash
ssh root@sunfoods.vn "pm2 logs"
```

### Check Status:
```bash
ssh root@sunfoods.vn "pm2 status"
```

### Restart Services:
```bash
ssh root@sunfoods.vn "pm2 restart all"
```

---

## ⚠️ Troubleshooting

### Error: VPS_PASSWORD not found
**Solution:** Add to Replit Secrets:
1. Click 🔒 Secrets
2. Key: `VPS_PASSWORD`
3. Value: Your VPS root password
4. Click Add

### Error: Connection refused
**Check:**
- VPS is running
- Port 22 (SSH) is open
- Firewall allows connections

### Error: Permission denied
**Check:**
- Password is correct in Secrets
- User has access to `/var/www/sun`

---

## 🔄 Update Workflow

1. Make changes to code on Replit
2. Build frontend: `cd customer-mobile && npm run build`
3. Deploy: `node deploy-and-install.js`
4. Done! ✅

---

## 📝 What Gets Uploaded

**Backend:**
- `src/` - TypeScript source (runs with tsx)
- `public/` - Admin panel static files
- `shared/` - Shared schemas
- `package.json` - Dependencies (includes tsx)

**Customer Mobile:**
- `.next/` - Next.js build
- `public/` - Static assets
- `package.json` - Dependencies

**Config:**
- `ecosystem.config.js` - PM2 configuration
- `install.sh` - Installation script
- `.env.example` - Environment template

---

## 🔐 Security

✅ **Password stored in Replit Secrets** - Not in code  
✅ **Environment variables** - Loaded at runtime  
✅ **No password in Git** - Safe to commit scripts  
✅ **SSH connection** - Encrypted transfer  

---

## 🆚 Comparison

| Script | Upload | Install | PM2 | Use Case |
|--------|--------|---------|-----|----------|
| `deploy-to-vps.js` | ✅ | ❌ | ❌ | Manual control |
| `deploy-and-install.js` | ✅ | ✅ | ✅ | **One-click deploy** ⭐ |
| `QUICK_UPLOAD_VPS.sh` | ✅ | ❌ | ❌ | Bash alternative (needs password input) |

---

## 🎉 Success Indicators

After `deploy-and-install.js`:

✅ **Uploaded files** - All files transferred  
✅ **Dependencies installed** - npm packages ready  
✅ **PM2 running** - Shows 2 apps online  
✅ **URLs accessible** - Admin & store load  

**Test:**
- Visit: `https://sunfoods.vn/adminhoang`
- Login: `admin@example.com` / `admin123`
- Check mobile: `https://sunfoods.vn`

---

## 💡 Pro Tips

1. **Always build mobile before deploy:**
   ```bash
   cd customer-mobile && npm run build && cd .. && node deploy-and-install.js
   ```

2. **Quick redeploy (code changes only):**
   ```bash
   node deploy-and-install.js
   ```

3. **Upload only (manual install):**
   ```bash
   node deploy-to-vps.js
   ssh root@sunfoods.vn "cd /var/www/sun && bash install.sh"
   ```

4. **Check PM2 from Replit:**
   ```bash
   ssh root@sunfoods.vn "pm2 status && pm2 logs --lines 20"
   ```

---

**Happy Deploying! 🚀**
