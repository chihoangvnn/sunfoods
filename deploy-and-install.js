#!/usr/bin/env node

const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');

// VPS Configuration
const VPS_HOST = 'sunfoods.vn';
const VPS_USER = 'root';
const VPS_PASSWORD = process.env.VPS_PASSWORD;
const VPS_DIR = '/var/www/sun';

const ssh = new NodeSSH();

async function main() {
  console.log('🚀 Starting FULL deployment to VPS...');
  console.log(`📍 Target: ${VPS_USER}@${VPS_HOST}:${VPS_DIR}\n`);

  if (!VPS_PASSWORD) {
    console.error('❌ VPS_PASSWORD not found in environment variables!');
    console.error('   Add it to Replit Secrets: VPS_PASSWORD');
    process.exit(1);
  }

  try {
    // Connect to VPS
    console.log('🔐 Connecting to VPS...');
    await ssh.connect({
      host: VPS_HOST,
      username: VPS_USER,
      password: VPS_PASSWORD,
      tryKeyboard: true
    });
    console.log('   ✅ Connected!\n');

    // Create directories on VPS
    console.log('📁 Creating directories on VPS...');
    await ssh.execCommand(`mkdir -p ${VPS_DIR}/backend/src ${VPS_DIR}/backend/public/admin ${VPS_DIR}/backend/shared ${VPS_DIR}/customer-mobile/.next ${VPS_DIR}/customer-mobile/public`);
    console.log('   ✅ Directories created\n');

    // Upload backend files
    console.log('📤 Uploading backend/src...');
    await ssh.putDirectory('./backend/src', `${VPS_DIR}/backend/src`, {
      recursive: true,
      concurrency: 10
    });
    console.log('   ✅ backend/src uploaded');

    console.log('📤 Uploading backend/public...');
    await ssh.putDirectory('./backend/public', `${VPS_DIR}/backend/public`, {
      recursive: true,
      concurrency: 10
    });
    console.log('   ✅ backend/public uploaded');

    console.log('📤 Uploading backend/shared...');
    await ssh.putDirectory('./backend/shared', `${VPS_DIR}/backend/shared`, {
      recursive: true,
      concurrency: 10
    });
    console.log('   ✅ backend/shared uploaded');

    console.log('📤 Uploading backend/package.json...');
    await ssh.putFile('./backend/package.json', `${VPS_DIR}/backend/package.json`);
    console.log('   ✅ backend/package.json uploaded');

    // Upload admin-web dist to backend/public/admin
    console.log('📤 Uploading admin-web/dist to backend/public/admin...');
    await ssh.putDirectory('./admin-web/dist', `${VPS_DIR}/backend/public/admin`, {
      recursive: true,
      concurrency: 10
    });
    console.log('   ✅ admin-web/dist uploaded to admin\n');

    // Upload customer-mobile files
    console.log('📤 Uploading customer-mobile/.next...');
    await ssh.putDirectory('./customer-mobile/.next', `${VPS_DIR}/customer-mobile/.next`, {
      recursive: true,
      concurrency: 10
    });
    console.log('   ✅ customer-mobile/.next uploaded');

    if (fs.existsSync('./customer-mobile/public')) {
      console.log('📤 Uploading customer-mobile/public...');
      await ssh.putDirectory('./customer-mobile/public', `${VPS_DIR}/customer-mobile/public`, {
        recursive: true,
        concurrency: 10
      });
      console.log('   ✅ customer-mobile/public uploaded');
    }

    console.log('📤 Uploading customer-mobile/package.json...');
    await ssh.putFile('./customer-mobile/package.json', `${VPS_DIR}/customer-mobile/package.json`);
    console.log('   ✅ customer-mobile/package.json uploaded\n');

    // Upload PM2 config and install script
    console.log('📤 Uploading PM2 config and install script...');
    await ssh.putFile('./vps-quick-deploy/ecosystem.config.js', `${VPS_DIR}/ecosystem.config.js`);
    await ssh.putFile('./vps-quick-deploy/install.sh', `${VPS_DIR}/install.sh`);
    console.log('   ✅ Config files uploaded\n');

    // Install dependencies
    // NOTE: Backend is pre-built locally, so we only install production deps
    console.log('📦 Installing dependencies...');
    console.log('⚙️  Installing backend dependencies...');
    const backendInstall = await ssh.execCommand('cd backend && npm ci --production --omit=dev', { cwd: VPS_DIR });
    if (backendInstall.code !== 0) {
      console.log('   ⚠️  Backend install warning:', backendInstall.stderr);
    } else {
      console.log('   ✅ Backend dependencies installed');
    }

    console.log('⚙️  Installing mobile dependencies...');
    const mobileInstall = await ssh.execCommand('cd customer-mobile && npm ci --production --omit=dev', { cwd: VPS_DIR });
    if (mobileInstall.code !== 0) {
      console.log('   ⚠️  Mobile install warning:', mobileInstall.stderr);
    } else {
      console.log('   ✅ Mobile dependencies installed');
    }

    // Restart PM2
    console.log('\n🔄 Restarting PM2 services...');
    
    // Restart backend-api
    console.log('⚙️  Restarting backend-api...');
    const backendRestart = await ssh.execCommand('pm2 restart backend-api || pm2 start ecosystem.config.js --only backend-api', { cwd: VPS_DIR });
    if (backendRestart.code === 0) {
      console.log('   ✅ Backend API restarted');
    } else {
      console.log('   ⚠️  Backend restart warning:', backendRestart.stderr);
    }

    // Restart mobile-app
    console.log('⚙️  Restarting mobile-app...');
    const mobileRestart = await ssh.execCommand(
      'pm2 restart mobile-app || PORT=3001 pm2 start "npm run start" --name mobile-app --cwd /var/www/sun/customer-mobile',
      { cwd: VPS_DIR }
    );
    if (mobileRestart.code === 0) {
      console.log('   ✅ Mobile app restarted');
    } else {
      console.log('   ⚠️  Mobile restart warning:', mobileRestart.stderr);
    }

    const pm2Save = await ssh.execCommand('pm2 save');
    console.log('   ✅ PM2 configuration saved');

    // Show PM2 status
    console.log('\n📊 PM2 Status:');
    const pm2Status = await ssh.execCommand('pm2 status');
    console.log(pm2Status.stdout);

    console.log('\n✅ DEPLOYMENT COMPLETE!\n');
    console.log('📍 Application URLs:');
    console.log(`   Backend API: https://${VPS_HOST}/api`);
    console.log(`   Admin Panel: https://${VPS_HOST}/adminhoang`);
    console.log(`   Mobile Store: https://${VPS_HOST}\n`);

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    ssh.dispose();
  }
}

main();
