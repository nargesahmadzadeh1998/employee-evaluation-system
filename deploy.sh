#!/bin/bash
# ============================================
# One-Click Deploy Script
# Employee Evaluation System
# ============================================
# This script deploys the app to Vercel with a Neon PostgreSQL database.
# Prerequisites: Node.js 18+, npm
#
# Usage: ./deploy.sh
# ============================================

set -e

echo "🚀 Employee Evaluation System - Deployment"
echo "============================================"
echo ""

# Step 1: Install Vercel CLI if needed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Step 2: Login to Vercel
echo ""
echo "Step 1: Vercel Login"
echo "--------------------"
vercel login

# Step 3: Create Neon database
echo ""
echo "Step 2: Database Setup"
echo "----------------------"
echo "Go to https://neon.tech and create a free PostgreSQL database."
echo ""
read -p "Paste your Neon DATABASE_URL (pooled connection string): " DB_URL
read -p "Paste your Neon DIRECT_URL (direct connection string, or same URL): " DIRECT_URL_VAL

if [ -z "$DIRECT_URL_VAL" ]; then
    DIRECT_URL_VAL="$DB_URL"
fi

# Generate a random secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Step 4: Deploy to Vercel
echo ""
echo "Step 3: Deploying to Vercel..."
echo "------------------------------"
vercel --yes \
    -e DATABASE_URL="$DB_URL" \
    -e DIRECT_URL="$DIRECT_URL_VAL" \
    -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Get the deployment URL
DEPLOY_URL=$(vercel --yes \
    -e DATABASE_URL="$DB_URL" \
    -e DIRECT_URL="$DIRECT_URL_VAL" \
    -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    --prod 2>&1 | grep "https://")

echo ""
echo "Step 4: Setting up database..."
echo "------------------------------"

# Push schema and seed
export DATABASE_URL="$DB_URL"
export DIRECT_URL="$DIRECT_URL_VAL"
npx prisma db push --accept-data-loss
npm run seed

echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "🌐 Live URL: $DEPLOY_URL"
echo ""
echo "🔑 Admin Login:"
echo "   Email:    admin@example.com"
echo "   Password: admin123"
echo ""
echo "👤 Evaluator Login:"
echo "   Email:    evaluator@example.com"
echo "   Password: eval123"
echo ""
