#!/bin/bash

###############################################################################
# Multi-Storefront E-commerce Deployment Script
# Supports: SunFoods.vn, TramHuongHoangNgan.com, NhangSach.net
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Config
QUICK_MODE=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.production"
ENV_EXAMPLE="$SCRIPT_DIR/.env.production.example"
NGINX_CONF="$SCRIPT_DIR/nginx.conf"
ECOSYSTEM_CONF="$SCRIPT_DIR/ecosystem.config.js"

REQUIRED_NODE_VERSION=20
DOMAINS=("sunfoods.vn" "tramhuonghoangngan.com" "nhangsach.net")

###############################################################################
# Utility Functions
###############################################################################

print_header() {
    echo -e "\n${CYAN}================================================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}================================================================${NC}\n"
}

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

ask_yes_no() {
    if [ "$QUICK_MODE" = true ]; then
        return 0
    fi
    
    local prompt="$1"
    local default="${2:-n}"
    
    if [ "$default" = "y" ]; then
        prompt="$prompt [Y/n]: "
    else
        prompt="$prompt [y/N]: "
    fi
    
    while true; do
        read -p "$(echo -e ${YELLOW}${prompt}${NC})" yn
        yn=${yn:-$default}
        case $yn in
            [Yy]*) return 0;;
            [Nn]*) return 1;;
            *) echo "Please answer yes or no.";;
        esac
    done
}

check_command() {
    command -v "$1" >/dev/null 2>&1
}

get_node_version() {
    node --version 2>/dev/null | sed 's/v//' | cut -d. -f1
}

###############################################################################
# Step 1: Check Prerequisites
###############################################################################

check_prerequisites() {
    print_header "Step 1/7: Checking Prerequisites"
    
    local errors=0
    
    # Node.js
    print_info "Checking Node.js version..."
    if check_command node; then
        local node_ver=$(get_node_version)
        if [ "$node_ver" -ge "$REQUIRED_NODE_VERSION" ]; then
            print_success "Node.js v$node_ver installed (required v${REQUIRED_NODE_VERSION}+)"
        else
            print_error "Node.js v$node_ver is too old (required v${REQUIRED_NODE_VERSION}+)"
            errors=$((errors + 1))
        fi
    else
        print_error "Node.js is not installed"
        errors=$((errors + 1))
    fi
    
    # npm
    print_info "Checking npm..."
    if check_command npm; then
        print_success "npm $(npm --version) installed"
    else
        print_error "npm is not installed"
        errors=$((errors + 1))
    fi
    
    # PM2
    print_info "Checking PM2..."
    if check_command pm2; then
        print_success "PM2 installed"
    else
        print_error "PM2 is not installed (run: sudo npm install -g pm2)"
        errors=$((errors + 1))
    fi
    
    # Nginx
    print_info "Checking Nginx..."
    if check_command nginx; then
        print_success "Nginx installed"
    else
        print_warning "Nginx not installed (optional for reverse proxy)"
    fi
    
    # PostgreSQL
    print_info "Checking PostgreSQL..."
    if check_command psql; then
        print_success "PostgreSQL installed"
    else
        print_error "PostgreSQL is not installed"
        errors=$((errors + 1))
    fi
    
    if [ $errors -gt 0 ]; then
        print_error "Found $errors errors. Please fix them before continuing."
        return 1
    fi
    
    print_success "All prerequisites met"
    return 0
}

###############################################################################
# Step 2: Build Applications
###############################################################################

build_applications() {
    print_header "Step 2/7: Building Applications"
    
    # Backend
    print_info "Installing backend dependencies..."
    cd "$SCRIPT_DIR/backend"
    npm install || return 1
    print_success "Backend dependencies installed"
    
    print_info "Building backend (compiling TypeScript)..."
    npm run build || return 1
    print_success "Backend built successfully"
    
    print_info "Cleaning up dev dependencies (optional)..."
    if ask_yes_no "Remove dev dependencies after build?" "n"; then
        npm prune --production || print_warning "Could not prune dev dependencies"
        print_success "Dev dependencies removed"
    else
        print_info "Keeping dev dependencies (useful for future updates)"
    fi
    
    # SunFoods
    print_info "Building SunFoods storefront..."
    cd "$SCRIPT_DIR/customer-mobile"
    npm install --production && npm run build || return 1
    print_success "SunFoods built successfully"
    
    # Tramhuong
    print_info "Building Tramhuong storefront..."
    cd "$SCRIPT_DIR/customer-tramhuong"
    npm install --production && npm run build || return 1
    print_success "Tramhuong built successfully"
    
    # Nhangsach
    print_info "Building Nhangsach storefront..."
    cd "$SCRIPT_DIR/customer-nhangsach"
    npm install --production && npm run build || return 1
    print_success "Nhangsach built successfully"
    
    cd "$SCRIPT_DIR"
    print_success "All applications built successfully"
    return 0
}

###############################################################################
# Step 3: Environment Configuration
###############################################################################

configure_environment() {
    print_header "Step 3/7: Environment Configuration"
    
    if [ -f "$ENV_FILE" ]; then
        print_warning ".env.production already exists"
        
        if ask_yes_no "Create backup of existing .env.production?" "y"; then
            local backup_file="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
            cp "$ENV_FILE" "$backup_file"
            print_success "Backed up to $backup_file"
        fi
        
        if ask_yes_no "Use existing .env.production?" "y"; then
            print_info "Using existing .env.production"
        else
            if [ -f "$ENV_EXAMPLE" ]; then
                cp "$ENV_EXAMPLE" "$ENV_FILE"
                print_success "Copied .env.production.example to .env.production"
                print_warning "Please edit $ENV_FILE with your actual values"
                
                if ! ask_yes_no "Have you configured .env.production?" "n"; then
                    print_error "Please configure .env.production before continuing"
                    return 1
                fi
            fi
        fi
    else
        if [ -f "$ENV_EXAMPLE" ]; then
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            print_success "Created .env.production from example"
            print_warning "Please edit $ENV_FILE with your actual values"
            
            if ! ask_yes_no "Have you configured .env.production?" "n"; then
                print_error "Please configure .env.production before continuing"
                return 1
            fi
        else
            print_error ".env.production.example not found"
            return 1
        fi
    fi
    
    print_success "Environment configuration complete"
    return 0
}

###############################################################################
# Step 4: Database Setup
###############################################################################

setup_database() {
    print_header "Step 4/7: Database Setup"
    
    if [ -f "$ENV_FILE" ]; then
        source "$ENV_FILE"
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL not set in .env.production"
        return 1
    fi
    
    print_success "DATABASE_URL is configured"
    
    print_info "Running database migrations..."
    cd "$SCRIPT_DIR/backend"
    
    if npm run db:push; then
        print_success "Database migrations completed"
    else
        print_warning "Migrations failed or have warnings"
        
        if ask_yes_no "Force push database schema?" "n"; then
            if npm run db:push -- --force; then
                print_success "Force push successful"
            else
                print_error "Force push failed"
                return 1
            fi
        else
            return 1
        fi
    fi
    
    if ask_yes_no "Seed sample data?" "n"; then
        print_info "Seeding data..."
        if npm run seed 2>/dev/null || node scripts/seed.js 2>/dev/null; then
            print_success "Data seeded"
        else
            print_warning "No seed script found or seeding failed"
        fi
    fi
    
    cd "$SCRIPT_DIR"
    print_success "Database setup complete"
    return 0
}

###############################################################################
# Step 5: PM2 Deployment
###############################################################################

deploy_with_pm2() {
    print_header "Step 5/7: PM2 Deployment"
    
    if [ ! -f "$ECOSYSTEM_CONF" ]; then
        print_error "ecosystem.config.js not found"
        return 1
    fi
    
    if pm2 list | grep -q "online\|stopped\|errored"; then
        if ask_yes_no "Stop existing PM2 processes?" "y"; then
            print_info "Stopping PM2 processes..."
            pm2 delete all 2>/dev/null || true
            print_success "Stopped old processes"
        fi
    fi
    
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    
    print_info "Starting applications with PM2..."
    cd "$SCRIPT_DIR"
    
    if pm2 start "$ECOSYSTEM_CONF"; then
        print_success "PM2 processes started"
    else
        print_error "Failed to start PM2 processes"
        return 1
    fi
    
    sleep 3
    pm2 list
    
    print_info "Saving PM2 process list..."
    pm2 save || print_warning "Could not save PM2 process list"
    
    if ask_yes_no "Enable PM2 startup on boot?" "y"; then
        print_info "Configuring PM2 startup..."
        pm2 startup || print_warning "Could not configure PM2 startup"
        pm2 save
    fi
    
    print_success "PM2 deployment complete"
    return 0
}

###############################################################################
# Step 6: Nginx Configuration
###############################################################################

configure_nginx() {
    print_header "Step 6/7: Nginx Configuration (Optional)"
    
    if ! check_command nginx; then
        print_warning "Nginx not installed, skipping configuration"
        return 0
    fi
    
    if ! ask_yes_no "Configure Nginx reverse proxy?" "y"; then
        print_info "Skipping Nginx configuration"
        return 0
    fi
    
    if [ ! -f "$NGINX_CONF" ]; then
        print_error "nginx.conf not found"
        return 1
    fi
    
    print_info "Copying nginx.conf to /etc/nginx/sites-available..."
    local nginx_site="/etc/nginx/sites-available/ecommerce"
    
    if sudo cp "$NGINX_CONF" "$nginx_site"; then
        print_success "Copied nginx.conf"
    else
        print_error "Failed to copy nginx.conf (need sudo)"
        return 1
    fi
    
    print_info "Creating symlink to sites-enabled..."
    if [ -L "/etc/nginx/sites-enabled/ecommerce" ]; then
        sudo rm "/etc/nginx/sites-enabled/ecommerce"
    fi
    
    sudo ln -s "$nginx_site" "/etc/nginx/sites-enabled/ecommerce" || return 1
    
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        if ask_yes_no "Remove nginx default site?" "y"; then
            sudo rm "/etc/nginx/sites-enabled/default"
        fi
    fi
    
    print_info "Testing nginx configuration..."
    if sudo nginx -t; then
        print_success "Nginx configuration is valid"
        
        if ask_yes_no "Reload nginx?" "y"; then
            sudo systemctl reload nginx || return 1
            print_success "Nginx reloaded"
        fi
    else
        print_error "Nginx configuration is invalid"
        return 1
    fi
    
    echo ""
    print_warning "SSL Certificate Setup:"
    print_info "Install SSL certificates with Let's Encrypt:"
    echo "  sudo apt install -y certbot python3-certbot-nginx"
    echo "  sudo certbot --nginx -d sunfoods.vn -d www.sunfoods.vn"
    echo "  sudo certbot --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com"
    echo "  sudo certbot --nginx -d nhangsach.net -d www.nhangsach.net"
    echo ""
    
    print_success "Nginx configuration complete"
    return 0
}

###############################################################################
# Step 7: Post-Deployment Checks
###############################################################################

post_deployment_checks() {
    print_header "Step 7/7: Post-Deployment Checks"
    
    print_info "Checking PM2 processes..."
    echo ""
    pm2 list
    echo ""
    
    local running_count=0
    if command -v pm2 >/dev/null 2>&1; then
        running_count=$(pm2 jlist 2>/dev/null | grep -o online | wc -l || echo "0")
    fi
    
    print_info "Running processes: $running_count"
    
    print_info "API health check..."
    local url="http://localhost:5000/api/health"
    if check_command curl; then
        if curl -f -s "$url" >/dev/null 2>&1; then
            print_success "API is responding"
        else
            print_warning "API health check failed"
        fi
    fi
    
    echo ""
    print_info "View logs:"
    echo "  pm2 logs"
    echo "  pm2 logs backend-api"
    echo "  pm2 monit"
    echo ""
    
    print_success "Post-deployment checks complete"
}

###############################################################################
# Display Next Steps
###############################################################################

display_next_steps() {
    print_header "Next Steps"
    
    echo -e "${GREEN}Deployment Complete${NC}\n"
    
    echo "1. Check applications:"
    echo "   pm2 list"
    echo "   pm2 logs"
    echo ""
    
    echo "2. Configure SSL (if not done):"
    echo "   sudo certbot --nginx -d sunfoods.vn -d www.sunfoods.vn"
    echo "   sudo certbot --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com"
    echo "   sudo certbot --nginx -d nhangsach.net -d www.nhangsach.net"
    echo ""
    
    echo "3. Access websites:"
    for domain in "${DOMAINS[@]}"; do
        echo "   https://$domain"
    done
    echo ""
    
    echo "4. Management commands:"
    echo "   pm2 restart all"
    echo "   pm2 stop all"
    echo "   pm2 logs --lines 100"
    echo ""
    
    echo "5. Database:"
    echo "   psql \$DATABASE_URL"
    echo "   npm run db:push"
    echo ""
    
    print_success "Deployment successful"
}

###############################################################################
# Main
###############################################################################

main() {
    if [ "$1" = "--quick" ] || [ "$1" = "-q" ]; then
        QUICK_MODE=true
        print_info "Quick mode enabled"
    fi
    
    clear
    echo -e "${CYAN}"
    cat << 'EOF'
================================================================
    Multi-Storefront E-commerce Deployment
    SunFoods | TramHuongHoangNgan | NhangSach
================================================================
EOF
    echo -e "${NC}\n"
    
    check_prerequisites || exit 1
    
    if ask_yes_no "Continue with build?" "y"; then
        build_applications || exit 1
    fi
    
    configure_environment || exit 1
    setup_database || exit 1
    deploy_with_pm2 || exit 1
    configure_nginx || print_warning "Nginx configuration skipped"
    post_deployment_checks
    display_next_steps
    
    echo ""
    print_success "================================================================"
    print_success "           DEPLOYMENT SUCCESSFUL"
    print_success "================================================================"
    echo ""
}

main "$@"
