#!/bin/bash

# Vercel Deployment Debug Script

echo "🔍 Checking deployment status..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in the right directory. Please run from /web folder"
    exit 1
fi

echo "✅ In correct directory"

# Check if build works
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check file structure
echo "📁 Checking file structure..."
ls -la app/

# Check if main files exist
if [ -f "app/page.js" ] && [ -f "app/layout.js" ]; then
    echo "✅ Main files exist"
else
    echo "❌ Main files missing"
    exit 1
fi

# Force commit and push
echo "🚀 Force deploying..."
git add .
git commit --allow-empty -m "Debug deployment - $(date)"
git push

echo "✅ Deployment triggered"
echo "🔍 Check Vercel dashboard for build logs"
echo "🌐 Test your site at: https://your-domain.vercel.app"
echo "🧪 Test page at: https://your-domain.vercel.app/test"
