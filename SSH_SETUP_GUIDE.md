# SSH Key Authentication Setup Guide

## 🔐 Why SSH Keys Instead of Passwords?

**Security Benefits:**
- ✅ No password in code/secrets (zero leak risk)
- ✅ Cannot be brute-forced
- ✅ Easy to revoke access (remove key from server)
- ✅ Industry best practice for server access

**DO NOT** store VPS passwords in:
- ❌ Replit secrets
- ❌ Code/scripts
- ❌ Environment variables
- ❌ Any file in the project

## 📋 One-Time SSH Key Setup (5 minutes)

### Step 1: Generate SSH Key (on your local machine/Replit)

```bash
# Generate new SSH key pair
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter to save to default location: ~/.ssh/id_ed25519
# Enter passphrase (optional, but recommended)
```

**Output:**
- Private key: `~/.ssh/id_ed25519` (KEEP SECRET!)
- Public key: `~/.ssh/id_ed25519.pub` (can share)

### Step 2: Copy Public Key to VPS

**Method A: Automatic (easiest)**
```bash
# This copies your public key to VPS
ssh-copy-id root@your-vps-ip

# Enter VPS password ONE LAST TIME
```

**Method B: Manual**
```bash
# 1. View your public key
cat ~/.ssh/id_ed25519.pub

# 2. Copy the output (starts with "ssh-ed25519...")

# 3. Login to VPS with password
ssh root@your-vps-ip

# 4. Add key to authorized_keys
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
exit
```

### Step 3: Test Passwordless Login

```bash
# This should login WITHOUT asking for password
ssh root@your-vps-ip

# If successful, you're done! 🎉
```

## 🚀 Deploy Your Application

Once SSH keys are setup:

```bash
# Make deploy script executable
chmod +x deploy-vps.sh

# Run deployment
./deploy-vps.sh
```

The script will:
1. ✅ Use SSH keys (no password needed)
2. ✅ Install all requirements
3. ✅ Upload project files
4. ✅ Build all 3 storefronts
5. ✅ Setup Nginx + SSL
6. ✅ Configure firewall securely
7. ✅ Start PM2 services
8. ✅ Verify deployment

## 🔧 Troubleshooting

### Issue: "Permission denied (publickey)"

**Solution 1: Check SSH key exists**
```bash
ls -la ~/.ssh/
# Should see: id_ed25519 and id_ed25519.pub
```

**Solution 2: Re-copy public key**
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@your-vps-ip
```

**Solution 3: Check VPS SSH config**
```bash
# Login with password one more time
ssh root@your-vps-ip

# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Ensure these lines are present:
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# Restart SSH service
sudo systemctl restart sshd
```

### Issue: "Host key verification failed"

**Solution:**
```bash
# Remove old host key
ssh-keygen -R your-vps-ip

# Try connecting again
ssh root@your-vps-ip
# Type "yes" when prompted
```

### Issue: Script fails at specific step

**Debug Mode:**
```bash
# Run with verbose output
bash -x deploy-vps.sh
```

**Manual Step-by-Step:**
See `NGINX_MULTISITE_SETUP.md` for manual commands

## 📊 Replit-Specific Instructions

If deploying from Replit workspace:

### 1. Generate SSH Key in Replit Shell
```bash
ssh-keygen -t ed25519 -C "replit-deploy"
# Press Enter for all prompts (no passphrase in Replit)
```

### 2. Get Public Key
```bash
cat ~/.ssh/id_ed25519.pub
# Copy the entire output
```

### 3. Add to VPS
```bash
# From another terminal/machine, login to VPS
ssh root@your-vps-ip

# Add Replit's public key
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
exit
```

### 4. Test from Replit
```bash
# In Replit shell
ssh root@your-vps-ip
# Should login without password
```

### 5. Run Deploy Script
```bash
chmod +x deploy-vps.sh
./deploy-vps.sh
```

## 🔒 Security Best Practices

### ✅ DO:
- Use SSH keys for all server access
- Keep private key secure (`chmod 600 ~/.ssh/id_ed25519`)
- Use different keys for different purposes
- Revoke keys when access no longer needed

### ❌ DON'T:
- Share private keys
- Store passwords in code/secrets
- Use same key everywhere
- Commit keys to git

### Disable Password Authentication (After SSH keys working)
```bash
# On VPS
sudo nano /etc/ssh/sshd_config

# Change these lines:
PasswordAuthentication no
PermitRootLogin prohibit-password

# Restart SSH
sudo systemctl restart sshd
```

## 📝 Quick Reference

### Generate New Key
```bash
ssh-keygen -t ed25519 -C "description"
```

### Copy Key to Server
```bash
ssh-copy-id user@server-ip
```

### Test Connection
```bash
ssh user@server-ip
```

### Deploy Application
```bash
./deploy-vps.sh
```

### View Logs (After Deployment)
```bash
ssh root@your-vps-ip 'pm2 logs'
```

### Restart Services
```bash
ssh root@your-vps-ip 'pm2 restart all'
```

## 🆘 Need Help?

**Common Commands:**
```bash
# Check SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# List added keys
ssh-add -l

# Remove all keys
ssh-add -D

# SSH with specific key
ssh -i ~/.ssh/id_ed25519 root@your-vps-ip
```

**Deploy Script Help:**
```bash
./deploy-vps.sh --help
```

**Manual Deployment:**
Follow step-by-step guide in `NGINX_MULTISITE_SETUP.md`
