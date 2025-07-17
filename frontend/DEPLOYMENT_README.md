# CropsayAI Frontend Deployment Guide

## 🚀 cPanel Deployment Instructions

### Step 1: Build the Frontend
```bash
cd frontend
npm run build
```

### Step 2: Upload to cPanel
1. Open cPanel File Manager
2. Navigate to your domain's public_html folder (or subdomain folder)
3. Upload ALL contents from `frontend/dist/` folder to your public_html
4. Make sure the `.htaccess` file is uploaded (it might be hidden)

### Step 3: Verify .htaccess File
The `.htaccess` file is crucial for React Router to work properly. It should contain:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

### Step 4: Test Routing
After deployment, test these scenarios:
1. ✅ Navigate to your site: `https://yourdomain.com`
2. ✅ Click navigation links (should work)
3. ✅ Direct URL access: `https://yourdomain.com/shop` (should work)
4. ✅ Page refresh on any route (should work)
5. ✅ Browser back/forward buttons (should work)

## 🔧 Troubleshooting

### If you get 404 errors on direct URL access:

1. **Check .htaccess file exists**
   - In cPanel File Manager, enable "Show Hidden Files"
   - Verify `.htaccess` is in the root directory

2. **Check Apache mod_rewrite is enabled**
   - Contact your hosting provider if needed

3. **Check file permissions**
   - `.htaccess` should have 644 permissions

4. **Alternative .htaccess (if above doesn't work)**
   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```

### Common Issues:

- **404 on refresh**: Missing or incorrect `.htaccess`
- **Blank page**: Check browser console for errors
- **Assets not loading**: Check file paths and permissions

## 📁 Required Files for Upload

Make sure these files are uploaded from `frontend/dist/`:
- `index.html` (main app file)
- `.htaccess` (routing configuration)
- `assets/` folder (CSS, JS, fonts)
- All SVG files (logos, icons)
- `robots.txt`
- Any other static assets

## 🌐 Environment Variables

If your app uses environment variables, make sure to:
1. Set them in your hosting environment
2. Or include them in your build process
3. Check that API endpoints are correctly configured

## ✅ Success Indicators

Your deployment is successful when:
- Home page loads correctly
- All navigation works
- Direct URL access works (e.g., `/shop`, `/chat`)
- Page refresh doesn't show 404
- All assets load properly
- Mobile navigation works

## 🆘 Need Help?

If routing still doesn't work:
1. Check browser developer tools for errors
2. Verify `.htaccess` file is uploaded and readable
3. Contact your hosting provider about mod_rewrite support
4. Try the alternative `.htaccess` configuration above
