# Trầm Hương Hoàng Ngân - Deployment Guide

## 📋 Pre-deployment Checklist

### Performance Optimization
- [x] Image optimization configured (WebP/AVIF formats)
- [x] Dynamic imports for heavy components (BlogTab, ProfileTab, ChatBot, etc.)
- [x] Bundle splitting configured
- [x] Console.logs removed in production builds
- [x] Compression enabled

### SEO Optimization
- [x] Meta tags updated for "Trầm Hương Hoàng Ngân" branding
- [x] Open Graph tags configured
- [x] Twitter Card tags configured
- [x] Structured data (Schema.org) implemented
- [x] Robots.txt directives configured
- [x] Canonical URLs set

### Code Quality
- [x] TypeScript types validated
- [x] Production build successful
- [x] No build errors
- [x] Dynamic imports working correctly

## 🚀 Deployment Steps

### 1. Build the Application
```bash
cd customer-tramhuong
npm run build
```

### 2. Test Production Build Locally
```bash
npm run start
# Visit http://localhost:3000 to verify
```

### 3. Deploy to VPS
```bash
# From project root
./auto-deploy-vps.sh
```

### 4. Verify Deployment
The application should be running on port 3002:
- Development: `http://localhost:3002`
- Production: `https://tramhuonghoangngan.com`

## 🔍 Post-deployment Verification

### Functional Tests
- [ ] Homepage loads correctly
- [ ] Hero slider displays images
- [ ] Product cards render properly
- [ ] Shopping cart functionality works
- [ ] Mobile navigation functional
- [ ] Search functionality works
- [ ] Profile tab accessible

### Performance Tests
- [ ] Run Lighthouse audit (target: 90+ score)
- [ ] Check Core Web Vitals:
  - LCP < 2.5s ✓
  - FID < 100ms ✓
  - CLS < 0.1 ✓
- [ ] Test on mobile devices
- [ ] Verify image lazy loading

### SEO Verification
- [ ] Meta tags present in page source
- [ ] Open Graph tags visible
- [ ] Structured data validates on Google Rich Results Test
- [ ] Sitemap accessible (if configured)

## 🛠️ Configuration

### Environment Variables
Ensure these are set in production:
```bash
NEXT_PUBLIC_API_URL=https://tramhuonghoangngan.com/api
NEXT_PUBLIC_SITE_URL=https://tramhuonghoangngan.com
BACKEND_URL=http://localhost:5000
```

### PM2 Configuration
The application is configured in `ecosystem.config.js`:
- Name: `tramhuong-storefront`
- Port: `3002`
- Script: `npm start`
- Working Directory: `customer-tramhuong`

## 📊 Build Output Summary

Recent production build results:
- ✅ 20 pages generated successfully
- ✅ Main bundle: 242 kB (First Load JS)
- ✅ Optimized chunks created
- ✅ Static assets optimized

### Route Sizes
| Route | Size | First Load JS |
|-------|------|---------------|
| / (Homepage) | 21.9 kB | 242 kB |
| /products | 2.41 kB | 223 kB |
| /cart | 2.58 kB | 223 kB |
| /checkout | 3.48 kB | 224 kB |
| /vendor/products | 147 kB | 367 kB |

## 🔄 Rollback Plan

If issues occur after deployment:

1. **Quick Rollback via Replit**
   - Use Replit's built-in rollback feature
   - Revert to previous working commit

2. **Manual Rollback**
   ```bash
   git checkout <previous-commit-hash>
   npm run build
   pm2 restart tramhuong-storefront
   ```

3. **Emergency Stop**
   ```bash
   pm2 stop tramhuong-storefront
   ```

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf customer-tramhuong/.next
npm run build
```

### Runtime Errors
```bash
# Check PM2 logs
pm2 logs tramhuong-storefront

# Check application logs
cd customer-tramhuong
npm run dev  # Test locally first
```

### Performance Issues
1. Verify image optimization is enabled
2. Check bundle analyzer (if installed):
   ```bash
   ANALYZE=true npm run build
   ```
3. Review dynamic imports are working

## 📈 Performance Benchmarks

### Target Metrics
- **Lighthouse Performance**: > 90
- **Lighthouse SEO**: > 95
- **Lighthouse Accessibility**: > 95
- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.8s
- **Total Bundle Size**: < 500 kB

### Optimization Features Enabled
- ✅ Image formats: WebP, AVIF
- ✅ Image lazy loading
- ✅ Code splitting
- ✅ Dynamic imports
- ✅ Font optimization (display: swap)
- ✅ Resource hints (preconnect, dns-prefetch)
- ✅ Compression enabled
- ✅ Console removal in production

## 📝 Maintenance

### Regular Tasks
- Monitor PM2 logs for errors
- Check Core Web Vitals monthly
- Update dependencies quarterly
- Review and optimize bundle size
- Test on new browser versions

### Updates
```bash
# Update dependencies
cd customer-tramhuong
npm update

# Rebuild and test
npm run build
npm run start

# Deploy if tests pass
pm2 restart tramhuong-storefront
```

## 📞 Support

For deployment issues:
1. Check PM2 logs: `pm2 logs tramhuong-storefront`
2. Review build output for errors
3. Verify environment variables are set
4. Check disk space and memory usage

---

**Last Updated**: October 12, 2025
**Build Version**: Next.js 15.0.0
**Node Version**: 20.x recommended
