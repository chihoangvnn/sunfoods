# 🚀 Deploy Now - Quick Start

## ⚡ 3-Step Deployment

### 1️⃣ Setup SSH Keys (One-time, 2 minutes)
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "deploy-key"

# Copy to VPS (enter password ONE LAST TIME)
ssh-copy-id root@YOUR_VPS_IP

# Test (should login WITHOUT password)
ssh root@YOUR_VPS_IP
```

### 2️⃣ Run Deployment Script
```bash
# Execute deployment
./deploy-vps.sh
```

**Script will prompt for:**
- VPS IP address
- VPS username (default: root)
- Project directory (default: /var/www/ecommerce)
- Domain names (for SSL setup)

### 3️⃣ Configure Environment Variables
```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Edit backend .env
nano /var/www/ecommerce/backend/.env
```

**Required Variables:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
ENCRYPTION_KEY=your-32-char-key
SESSION_SECRET=your-session-secret

# Optional (if already in Replit secrets)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

Save and exit (Ctrl+X, Y, Enter)

## ✅ Verify Deployment

```bash
# Check PM2 services
ssh root@YOUR_VPS_IP 'pm2 status'

# View logs
ssh root@YOUR_VPS_IP 'pm2 logs'

# Test endpoints
curl http://YOUR_VPS_IP:5000/api/health
curl http://YOUR_VPS_IP:3001  # Sunfoods
curl http://YOUR_VPS_IP:3002  # Tramhuong
curl http://YOUR_VPS_IP:3003  # Nhangsach
```

## 🌐 DNS Configuration

Point your domains to VPS:

**A Records:**
```
sunfoods.vn           → YOUR_VPS_IP
www.sunfoods.vn       → YOUR_VPS_IP
tramhuonghoangngan.com → YOUR_VPS_IP
www.tramhuonghoangngan.com → YOUR_VPS_IP
nhangsach.net         → YOUR_VPS_IP
www.nhangsach.net     → YOUR_VPS_IP
```

Wait 5-10 minutes for DNS propagation.

## 🔐 SSL Certificates (After DNS)

```bash
ssh root@YOUR_VPS_IP

# Get certificates for all domains
sudo certbot --nginx -d sunfoods.vn -d www.sunfoods.vn
sudo certbot --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com
sudo certbot --nginx -d nhangsach.net -d www.nhangsach.net
```

## 📊 Management Commands

```bash
# Restart all services
ssh root@YOUR_VPS_IP 'pm2 restart all'

# Reload Nginx
ssh root@YOUR_VPS_IP 'sudo systemctl reload nginx'

# View PM2 logs
ssh root@YOUR_VPS_IP 'pm2 logs backend-api'
ssh root@YOUR_VPS_IP 'pm2 logs sunfoods-storefront'

# Update code
ssh root@YOUR_VPS_IP 'cd /var/www/ecommerce && git pull && pm2 restart all'
```

## ⚠️ Troubleshooting

**SSH Key Issues?**
→ See `SSH_SETUP_GUIDE.md`

**Deployment Failed?**
→ Check manual steps in `NGINX_MULTISITE_SETUP.md`

**Service Not Starting?**
```bash
ssh root@YOUR_VPS_IP 'pm2 logs backend-api --lines 50'
```

**Nginx Error?**
```bash
ssh root@YOUR_VPS_IP 'sudo nginx -t'
ssh root@YOUR_VPS_IP 'sudo tail -f /var/log/nginx/error.log'
```

## 🎯 What Gets Deployed

**4 PM2 Services:**
1. ✅ Backend API (port 5000) - Express + Admin Dashboard
2. ✅ Sunfoods Storefront (port 3001) - Next.js SSR
3. ✅ Tramhuong Storefront (port 3002) - Next.js SSR  
4. ✅ Nhangsach Storefront (port 3003) - Next.js SSR

**Nginx Config:**
- ✅ 3 domain server blocks
- ✅ SSL/HTTPS termination
- ✅ Reverse proxy to backend & storefronts
- ✅ Rate limiting & security headers

**Database:**
- ✅ Shared PostgreSQL (multi-tenant via store_id)

## 🔄 Re-deployment (Code Updates)

```bash
# Quick update
./deploy-vps.sh

# Or manual
ssh root@YOUR_VPS_IP << 'EOF'
cd /var/www/ecommerce
git pull
npm install
cd customer-mobile && npm run build && cd ..
cd customer-tramhuong && npm run build && cd ..
cd customer-nhangsach && npm run build && cd ..
pm2 restart all
EOF
```

## 📝 Pre-Deployment Checklist

- [ ] VPS ready (Ubuntu 20.04+ recommended)
- [ ] SSH key setup complete
- [ ] Database credentials ready
- [ ] Domain DNS pointing to VPS IP
- [ ] Firewall allows ports 22, 80, 443
- [ ] .env variables prepared

## 🆘 Need Help?

1. **SSH Issues:** Read `SSH_SETUP_GUIDE.md`
2. **Manual Setup:** Follow `NGINX_MULTISITE_SETUP.md`
3. **Debug Mode:** Run `bash -x deploy-vps.sh`
4. **Check Logs:** `ssh root@VPS 'pm2 logs'`

---

**Ready to deploy?** Run: `./deploy-vps.sh` 🚀
