#!/bin/bash
# E2E Setup Helper — Automates Steps 2-3 (Neon setup + migrations + deployment)

set -e

echo "=========================================="
echo "E2E Setup Helper — Steps 2-3"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if DATABASE_URL is set
echo "Step 2a: Checking environment..."
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set${NC}"
    echo "Set it from your Neon connection string:"
    echo ""
    echo "  export DATABASE_URL=\"postgresql://user:pass@ep-xxx.region.neon.cloud/dbname?sslmode=require\""
    echo ""
    read -p "Enter your Neon DATABASE_URL (or press Ctrl+C to abort): " DATABASE_URL
    export DATABASE_URL
fi

echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
echo "  Host: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)"
echo ""

# Step 2: Test database connection
echo "Step 2b: Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Failed to connect to database${NC}"
    echo "Troubleshooting:"
    echo "  1. Check DATABASE_URL is correct"
    echo "  2. Ensure Neon project is running"
    echo "  3. Check your network/firewall settings"
    exit 1
fi
echo ""

# Step 3: Run migrations
echo "Step 2c: Running database migrations..."
cd "$(dirname "$0")/.."
npx drizzle-kit push:pg --cwd apps/web

echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Step 4: Verify tables
echo "Step 2d: Verifying database schema..."
TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
if [ "$TABLES" -ge 2 ]; then
    echo -e "${GREEN}✓ Database schema verified${NC}"
    psql "$DATABASE_URL" -c "\dt"
else
    echo -e "${YELLOW}⚠️  Expected 2+ tables, found $TABLES${NC}"
fi
echo ""

# Step 5: Generate JWT secret if needed
echo "Step 2e: Checking JWT_SECRET..."
if [ -z "$JWT_SECRET" ]; then
    echo "Generating JWT_SECRET..."
    JWT_SECRET=$(openssl rand -hex 32)
    export JWT_SECRET
    echo -e "${GREEN}✓ Generated JWT_SECRET${NC}"
    echo "  Value: $JWT_SECRET"
    echo ""
    echo "  Add this to Vercel Environment Variables!"
else
    echo -e "${GREEN}✓ JWT_SECRET is set${NC}"
fi
echo ""

# Step 6: Summary
echo "=========================================="
echo "Step 2 Complete ✓"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Add to Vercel (https://vercel.com/.../-/settings/environment-variables):"
echo "   - DATABASE_URL: $DATABASE_URL"
echo "   - JWT_SECRET: $JWT_SECRET"
echo "   - NEXT_PUBLIC_WS_URL: https://web-f22sfm8v1-martinzlatanov-8547s-projects.vercel.app"
echo ""
echo "2. Redeploy:"
echo "   vercel --prod"
echo ""
echo "3. Run E2E tests (see E2E-TEST-CHECKLIST.md)"
echo ""
