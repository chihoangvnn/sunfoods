#!/bin/bash

###############################################################################
# AUTO DEPLOY TO VPS - Sử dụng Secrets từ Replit
# Script này tự động upload và deploy lên VPS
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}================================================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}================================================================${NC}\n"
}

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }

###############################################################################
# VPS Configuration từ Environment Variables (Replit Secrets)
###############################################################################

# VPS connection details - đọc từ Replit Secrets
VPS_USER="${VPS_USER:-root}"
VPS_IP="${VPS_IP}"
VPS_PASSWORD="${VPS_PASSWORD}"
VPS_DIR="/var/www/sun"

# Domain configurations
DOMAINS=("sunfoods.vn" "tramhuonghoangngan.com" "nhangsach.net")

###############################################################################
# Step 0: Kiểm tra secrets
###############################################################################

check_secrets() {
    print_header "Kiểm tra VPS Secrets"
    
    local missing=0
    
    if [ -z "$VPS_IP" ]; then
        print_error "VPS_IP chưa được set (cần thêm vào Replit Secrets)"
        missing=$((missing + 1))
    else
        print_success "VPS_IP: $VPS_IP"
    fi
    
    if [ -z "$VPS_PASSWORD" ]; then
        print_error "VPS_PASSWORD chưa được set (cần thêm vào Replit Secrets)"
        missing=$((missing + 1))
    else
        print_success "VPS_PASSWORD: ******** (đã set)"
    fi
    
    if [ -z "$VPS_USER" ]; then
        print_warning "VPS_USER chưa set, dùng mặc định: root"
    else
        print_success "VPS_USER: $VPS_USER"
    fi
    
    if [ $missing -gt 0 ]; then
        echo ""
        print_error "Thiếu $missing secrets. Vui lòng thêm vào Replit Secrets:"
        echo "  1. Click 'Tools' > 'Secrets'"
        echo "  2. Thêm:"
        echo "     - VPS_IP: IP address VPS của bạn"
        echo "     - VPS_PASSWORD: Password SSH của VPS"
        echo "     - VPS_USER: Username (mặc định: root)"
        exit 1
    fi
    
    print_success "Tất cả secrets đã sẵn sàng"
}

###############################################################################
# Step 1: Build Applications
###############################################################################

build_all() {
    print_header "Step 1: Build All Applications"
    
    # Backend
    print_info "Building backend..."
    cd backend
    npm install
    npm run build
    cd ..
    print_success "Backend built"
    
    # SunFoods
    print_info "Building SunFoods storefront..."
    cd customer-mobile
    npm install
    npm run build
    cd ..
    print_success "SunFoods built"
    
    # Tramhuong  
    print_info "Building Tramhuong storefront..."
    cd customer-tramhuong
    npm install
    npm run build
    cd ..
    print_success "Tramhuong built"
    
    # Nhangsach
    print_info "Building Nhangsach storefront..."
    cd customer-nhangsach
    npm install
    npm run build
    cd ..
    print_success "Nhangsach built"
    
    print_success "All applications built successfully"
}

###############################################################################
# Step 2: Create deployment package
###############################################################################

create_package() {
    print_header "Step 2: Create Deployment Package"
    
    print_info "Creating deployment folder..."
    rm -rf vps-deploy
    mkdir -p vps-deploy/{backend,customer-mobile,customer-tramhuong,customer-nhangsach}
    
    # Backend
    print_info "Packaging backend..."
    cp -r backend/dist vps-deploy/backend/
    cp -r backend/public vps-deploy/backend/ 2>/dev/null || true
    cp -r backend/shared vps-deploy/backend/
    cp backend/package.json vps-deploy/backend/
    cp backend/package-lock.json vps-deploy/backend/ 2>/dev/null || true
    
    # SunFoods
    print_info "Packaging SunFoods..."
    cp -r customer-mobile/.next vps-deploy/customer-mobile/
    cp -r customer-mobile/public vps-deploy/customer-mobile/ 2>/dev/null || true
    cp customer-mobile/package.json vps-deploy/customer-mobile/
    cp customer-mobile/package-lock.json vps-deploy/customer-mobile/ 2>/dev/null || true
    
    # Tramhuong
    print_info "Packaging Tramhuong..."
    cp -r customer-tramhuong/.next vps-deploy/customer-tramhuong/
    cp -r customer-tramhuong/public vps-deploy/customer-tramhuong/ 2>/dev/null || true
    cp customer-tramhuong/package.json vps-deploy/customer-tramhuong/
    cp customer-tramhuong/package-lock.json vps-deploy/customer-tramhuong/ 2>/dev/null || true
    
    # Nhangsach
    print_info "Packaging Nhangsach..."
    cp -r customer-nhangsach/.next vps-deploy/customer-nhangsach/
    cp -r customer-nhangsach/public vps-deploy/customer-nhangsach/ 2>/dev/null || true
    cp customer-nhangsach/package.json vps-deploy/customer-nhangsach/
    cp customer-nhangsach/package-lock.json vps-deploy/customer-nhangsach/ 2>/dev/null || true
    
    # Config files
    print_info "Packaging config files..."
    cp ecosystem.config.js vps-deploy/
    cp nginx.conf vps-deploy/
    cp .env.production.example vps-deploy/.env.example
    
    print_success "Deployment package created: vps-deploy/"
}

###############################################################################
# Step 3: Upload to VPS
###############################################################################

upload_to_vps() {
    print_header "Step 3: Upload to VPS"
    
    # Kiểm tra sshpass (Replit environment)
    if ! command -v sshpass &> /dev/null; then
        print_error "sshpass not found."
        print_info "Installing sshpass via nix..."
        
        # Try nix-env (Replit's package manager)
        if command -v nix-env &> /dev/null; then
            nix-env -iA nixpkgs.sshpass || {
                print_error "Cannot install sshpass via nix"
                print_warning "Alternative: Use SSH key instead of password"
                print_info "Run: ssh-keygen -t rsa -b 4096 -f ~/.ssh/vps_key -N ''"
                print_info "Then: ssh-copy-id -i ~/.ssh/vps_key.pub $VPS_USER@$VPS_IP"
                exit 1
            }
        else
            print_error "Neither sshpass nor nix-env available"
            print_warning "Please use SSH key authentication instead"
            exit 1
        fi
    fi
    
    print_info "Testing VPS connection..."
    if sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "echo 'Connection OK'" &>/dev/null; then
        print_success "VPS connection successful"
    else
        print_error "Cannot connect to VPS. Check VPS_IP, VPS_USER, VPS_PASSWORD"
        exit 1
    fi
    
    print_info "Creating remote directory..."
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "mkdir -p $VPS_DIR"
    
    print_info "Uploading files to VPS (this may take a few minutes)..."
    sshpass -p "$VPS_PASSWORD" rsync -avz --progress \
        -e "ssh -o StrictHostKeyChecking=no" \
        vps-deploy/ "$VPS_USER@$VPS_IP:$VPS_DIR/"
    
    print_success "Files uploaded to $VPS_USER@$VPS_IP:$VPS_DIR/"
}

###############################################################################
# Step 4: Deploy on VPS
###############################################################################

deploy_on_vps() {
    print_header "Step 4: Deploy on VPS"
    
    print_info "Running deployment on VPS..."
    
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" bash << 'ENDSSH'
set -e

VPS_DIR="/var/www/sun"
cd $VPS_DIR

echo "▶ Installing Node.js dependencies..."

# Backend
cd backend
npm install --production
cd ..

# SunFoods
cd customer-mobile
npm install --production
cd ..

# Tramhuong
cd customer-tramhuong
npm install --production
cd ..

# Nhangsach
cd customer-nhangsach
npm install --production
cd ..

echo "✓ Dependencies installed"

# Setup environment
if [ ! -f .env.production ]; then
    if [ -f .env.example ]; then
        echo "⚠ Creating .env.production from example"
        cp .env.example .env.production
        echo "⚠ IMPORTANT: Edit $VPS_DIR/.env.production with your actual values!"
    fi
fi

# Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo "▶ Installing PM2..."
    npm install -g pm2
fi

# Stop existing processes
echo "▶ Stopping old PM2 processes..."
pm2 delete all 2>/dev/null || true

# Start new processes
echo "▶ Starting applications with PM2..."
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup | grep "sudo" | sh 2>/dev/null || true

echo "✓ PM2 deployment complete"

# PM2 status
pm2 list

echo ""
echo "================================================================"
echo "  DEPLOYMENT SUCCESSFUL"
echo "================================================================"
echo ""
echo "Next steps:"
echo "1. Configure .env.production: nano $VPS_DIR/.env.production"
echo "2. Restart PM2: pm2 restart all"
echo "3. Setup Nginx (if not done)"
echo "4. Setup SSL certificates"
echo ""

ENDSSH
    
    print_success "Deployment on VPS complete"
}

###############################################################################
# Step 5: Show deployment info
###############################################################################

show_deployment_info() {
    print_header "Deployment Complete"
    
    echo -e "${GREEN}✓ Applications deployed to VPS${NC}\n"
    
    echo "VPS Information:"
    echo "  IP: $VPS_IP"
    echo "  User: $VPS_USER"
    echo "  Directory: $VPS_DIR"
    echo ""
    
    echo "Access your VPS:"
    echo "  sshpass -p '\$VPS_PASSWORD' ssh $VPS_USER@$VPS_IP"
    echo ""
    
    echo "Check applications:"
    echo "  pm2 list"
    echo "  pm2 logs"
    echo "  pm2 monit"
    echo ""
    
    echo "Configure environment:"
    echo "  nano $VPS_DIR/.env.production"
    echo "  pm2 restart all"
    echo ""
    
    echo "Setup Nginx (if not done):"
    echo "  cd $VPS_DIR"
    echo "  sudo cp nginx.conf /etc/nginx/sites-available/ecommerce"
    echo "  sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/"
    echo "  sudo nginx -t"
    echo "  sudo systemctl reload nginx"
    echo ""
    
    echo "Setup SSL certificates:"
    echo "  sudo certbot --nginx -d sunfoods.vn -d www.sunfoods.vn"
    echo "  sudo certbot --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com"
    echo "  sudo certbot --nginx -d nhangsach.net -d www.nhangsach.net"
    echo ""
    
    print_success "================================================================"
    print_success "           AUTO DEPLOYMENT SUCCESSFUL"
    print_success "================================================================"
}

###############################################################################
# Main
###############################################################################

main() {
    clear
    echo -e "${CYAN}"
    cat << 'EOF'
================================================================
    AUTO DEPLOY TO VPS
    Multi-Store E-commerce Platform
================================================================
EOF
    echo -e "${NC}\n"
    
    check_secrets
    build_all
    create_package
    upload_to_vps
    deploy_on_vps
    show_deployment_info
}

main "$@"
