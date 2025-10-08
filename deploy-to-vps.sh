#!/bin/bash

###########################################
# DEPLOYMENT SCRIPT FOR SUNFOODS.VN VPS
# Complete deployment with admin + backend + mobile
###########################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/var/www/sun"
BACKEND_DIR="${DEPLOY_DIR}/backend"
ADMIN_DIR="${BACKEND_DIR}/public/admin"
NGINX_CACHE_DIR="/var/lib/nginx/proxy"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SUNFOODS.VN DEPLOYMENT SCRIPT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Verify we're in the right directory
echo -e "${YELLOW}[1/7] Verifying deployment files...${NC}"
if [ ! -d "${SCRIPT_DIR}/admin" ]; then
    echo -e "${RED}Error: admin directory not found in ${SCRIPT_DIR}${NC}"
    echo "Please extract deployment-complete.tar.gz first"
    exit 1
fi
echo -e "${GREEN}✓ Admin files found${NC}"
echo ""

# Step 2: Backup existing admin (if exists)
echo -e "${YELLOW}[2/7] Backing up existing admin...${NC}"
if [ -d "${ADMIN_DIR}" ]; then
    BACKUP_NAME="admin.backup.$(date +%Y%m%d_%H%M%S)"
    mv "${ADMIN_DIR}" "${BACKEND_DIR}/${BACKUP_NAME}"
    echo -e "${GREEN}✓ Backed up to ${BACKUP_NAME}${NC}"
else
    echo -e "${GREEN}✓ No existing admin to backup${NC}"
fi
echo ""

# Step 3: Deploy new admin files
echo -e "${YELLOW}[3/7] Deploying new admin files...${NC}"
mkdir -p "${BACKEND_DIR}/public"
cp -r "${SCRIPT_DIR}/admin" "${ADMIN_DIR}"
echo -e "${GREEN}✓ Admin files deployed to ${ADMIN_DIR}${NC}"

# Verify critical files
if [ ! -f "${ADMIN_DIR}/assets/index-WjAjsFk0.css" ]; then
    echo -e "${RED}Warning: CSS file not found at expected location${NC}"
fi
echo ""

# Step 4: Clear Nginx proxy cache
echo -e "${YELLOW}[4/7] Clearing Nginx proxy cache...${NC}"
if [ -d "${NGINX_CACHE_DIR}" ]; then
    rm -rf ${NGINX_CACHE_DIR}/*
    echo -e "${GREEN}✓ Nginx cache cleared${NC}"
else
    echo -e "${YELLOW}! Nginx cache directory not found (may not exist yet)${NC}"
fi
echo ""

# Step 5: Restart PM2 processes
echo -e "${YELLOW}[5/7] Restarting PM2 processes...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo -e "${GREEN}✓ PM2 processes restarted${NC}"
    sleep 3  # Wait for processes to stabilize
else
    echo -e "${RED}Error: PM2 not installed${NC}"
    exit 1
fi
echo ""

# Step 6: Reload Nginx
echo -e "${YELLOW}[6/7] Reloading Nginx...${NC}"
if command -v nginx &> /dev/null; then
    nginx -t  # Test config first
    if [ $? -eq 0 ]; then
        nginx -s reload
        echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
    else
        echo -e "${RED}Error: Nginx config test failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: Nginx not installed${NC}"
    exit 1
fi
echo ""

# Step 7: Verify deployment
echo -e "${YELLOW}[7/7] Verifying deployment...${NC}"
echo ""

# Test CSS file accessibility
echo -e "  Testing CSS file..."
CSS_RESPONSE=$(curl -s -I https://sunfoods.vn/adminhoang/assets/index-WjAjsFk0.css | head -n 1)
if echo "$CSS_RESPONSE" | grep -q "200"; then
    echo -e "${GREEN}  ✓ CSS file is accessible${NC}"
else
    echo -e "${RED}  ✗ CSS file returned: $CSS_RESPONSE${NC}"
fi

# Test admin page
echo -e "  Testing admin page..."
ADMIN_RESPONSE=$(curl -s -I https://sunfoods.vn/adminhoang/login | head -n 1)
if echo "$ADMIN_RESPONSE" | grep -q "200"; then
    echo -e "${GREEN}  ✓ Admin page is accessible${NC}"
else
    echo -e "${RED}  ✗ Admin page returned: $ADMIN_RESPONSE${NC}"
fi

# Check PM2 status
echo -e "  Checking PM2 processes..."
pm2 status | grep -E "(backend|mobile)" || true
echo ""

# Final success message
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}VERIFICATION CHECKLIST:${NC}"
echo ""
echo -e "1. ${BLUE}Open your browser${NC}"
echo -e "   URL: ${GREEN}https://sunfoods.vn/adminhoang/login${NC}"
echo ""
echo -e "2. ${BLUE}Hard refresh to clear browser cache${NC}"
echo -e "   • Windows/Linux: ${GREEN}Ctrl + Shift + R${NC}"
echo -e "   • macOS: ${GREEN}Cmd + Shift + R${NC}"
echo ""
echo -e "3. ${BLUE}Verify CSS is loaded${NC}"
echo -e "   • Open DevTools (F12)"
echo -e "   • Go to Network tab"
echo -e "   • Look for: ${GREEN}index-WjAjsFk0.css${NC} (should be 200 OK)"
echo ""
echo -e "4. ${BLUE}Login with credentials${NC}"
echo -e "   • Email: ${GREEN}admin@example.com${NC}"
echo -e "   • Password: ${GREEN}admin123${NC}"
echo ""
echo -e "5. ${BLUE}Check mobile frontend${NC}"
echo -e "   URL: ${GREEN}https://sunfoods.vn/${NC}"
echo ""
echo -e "${YELLOW}If you encounter issues:${NC}"
echo -e "• Check logs: ${GREEN}pm2 logs${NC}"
echo -e "• Check Nginx logs: ${GREEN}tail -f /var/log/nginx/sunfoods.vn-error.log${NC}"
echo -e "• Verify processes: ${GREEN}pm2 status${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
