#!/bin/bash
# Setup SSH Key for VPS Auto-Login (Replit Compatible)
# Usage: bash setup_ssh_key.sh

VPS_IP="sunfoods.vn"
VPS_USER="root"

echo "🔑 Setting up SSH Key for VPS auto-login..."
echo ""

# Step 1: Check if key already exists
if [ -f ~/.ssh/id_rsa ]; then
    echo "✅ SSH key already exists at ~/.ssh/id_rsa"
else
    echo "📝 Generating new SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo "✅ SSH key generated!"
fi

echo ""
echo "📤 Copying SSH key to VPS..."
echo "⚠️  You will be asked for VPS password ONE LAST TIME"
echo ""

# Step 2: Copy key to VPS
if command -v ssh-copy-id &> /dev/null; then
    ssh-copy-id -i ~/.ssh/id_rsa.pub $VPS_USER@$VPS_IP
else
    # Fallback if ssh-copy-id not available
    cat ~/.ssh/id_rsa.pub | ssh $VPS_USER@$VPS_IP 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'
fi

echo ""
echo "✅ SSH Key setup complete!"
echo ""
echo "🧪 Testing connection (should NOT ask for password)..."
ssh -o BatchMode=yes -o ConnectTimeout=5 $VPS_USER@$VPS_IP 'echo "✅ SSH Key authentication successful!"' 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! You can now run:"
    echo "   bash QUICK_UPLOAD_VPS.sh"
    echo ""
    echo "   No password needed! 🚀"
else
    echo ""
    echo "⚠️  SSH key may not be working yet. Try manually:"
    echo "   ssh $VPS_USER@$VPS_IP"
    echo ""
    echo "   If it asks for password, something went wrong."
fi
