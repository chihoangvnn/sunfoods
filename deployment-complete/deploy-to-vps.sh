#!/bin/bash

# Deployment Script for Sunfoods Admin (Layout Fixed)
# This script deploys the new admin build with SidebarInset layout fix

set -e  # Exit on any error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}   Sunfoods Admin Deployment (Layout Fixed)     ${NC}"
echo -e "${GREEN}=================================================${NC}"

# Configuration
DEPLOY_DIR="/var/www/sunfoods"
ADMIN_DIR="$DEPLOY_DIR/admin"
BACKEND_DIR="$DEPLOY_DIR/backend"
BACKUP_DIR="$DEPLOY_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Step 1: Backup current admin build
echo -e "\n${YELLOW}[1/7] Backing up current admin build...${NC}"
if [ -d "$ADMIN_DIR" ]; then
    tar -czf "$BACKUP_DIR/admin-backup-$TIMESTAMP.tar.gz" -C "$DEPLOY_DIR" admin
    echo -e "${GREEN}✓ Backup created: admin-backup-$TIMESTAMP.tar.gz${NC}"
else
    echo -e "${YELLOW}⚠ No existing admin directory found, skipping backup${NC}"
fi

# Step 2: Extract and deploy new admin build
echo -e "\n${YELLOW}[2/7] Deploying new admin build...${NC}"
rm -rf $ADMIN_DIR
mkdir -p $ADMIN_DIR
cp -r ./admin/* $ADMIN_DIR/
echo -e "${GREEN}✓ Admin build deployed${NC}"

# Step 3: Set correct permissions
echo -e "\n${YELLOW}[3/7] Setting permissions...${NC}"
chown -R www-data:www-data $ADMIN_DIR
chmod -R 755 $ADMIN_DIR
echo -e "${GREEN}✓ Permissions set${NC}"

# Step 4: Update Nginx configuration
echo -e "\n${YELLOW}[4/7] Updating Nginx configuration...${NC}"
if [ -f "./nginx-production.conf" ]; then
    cp ./nginx-production.conf /etc/nginx/sites-available/sunfoods
    ln -sf /etc/nginx/sites-available/sunfoods /etc/nginx/sites-enabled/sunfoods
    nginx -t && echo -e "${GREEN}✓ Nginx config validated${NC}"
else
    echo -e "${YELLOW}⚠ nginx-production.conf not found, skipping${NC}"
fi

# Step 5: Clear browser cache headers
echo -e "\n${YELLOW}[5/7] Clearing cache...${NC}"
# Touch all files to update modification time
find $ADMIN_DIR -type f -exec touch {} +
echo -e "${GREEN}✓ Cache headers updated${NC}"

# Step 6: Reload Nginx
echo -e "\n${YELLOW}[6/7] Reloading Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}"

# Step 7: Restart PM2 (optional - only if backend changes)
echo -e "\n${YELLOW}[7/7] PM2 status check...${NC}"
if [ -f "./ecosystem.production.js" ]; then
    cd $BACKEND_DIR
    pm2 restart ecosystem.production.js --update-env
    pm2 save
    echo -e "${GREEN}✓ PM2 restarted${NC}"
else
    echo -e "${YELLOW}⚠ No backend changes, PM2 restart skipped${NC}"
fi

# Deployment summary
echo -e "\n${GREEN}=================================================${NC}"
echo -e "${GREEN}           Deployment Successful! ✓              ${NC}"
echo -e "${GREEN}=================================================${NC}"
echo -e "\n${GREEN}Summary:${NC}"
echo -e "  • Admin build: ${GREEN}deployed${NC}"
echo -e "  • Backup: ${GREEN}$BACKUP_DIR/admin-backup-$TIMESTAMP.tar.gz${NC}"
echo -e "  • Admin URL: ${GREEN}https://sunfoods.vn/adminhoang${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)"
echo -e "  2. Test admin dashboard functionality"
echo -e "  3. Verify SidebarInset layout is fixed"
echo -e "\n${GREEN}Deployment completed at: $(date)${NC}\n"
