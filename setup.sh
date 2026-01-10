#!/bin/bash
# =============================================================================
# Simon Game - Quick Setup Script
# =============================================================================
# Run this script to set up the project for local development.
# Usage: npm run setup  OR  ./setup.sh
# =============================================================================

set -e

echo ""
echo "🎮 ═══════════════════════════════════════════════"
echo "   SIMON GAME - SETUP"
echo "═══════════════════════════════════════════════════"
echo ""

# Copy env files
echo "📋 Setting up environment files..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "   ✅ Created .env"
else
  echo "   ⏭️  .env already exists, skipping"
fi

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "   ✅ Created frontend/.env"
else
  echo "   ⏭️  frontend/.env already exists, skipping"
fi

echo ""

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install --silent

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend && npm install --silent && cd ..

echo ""
echo "═══════════════════════════════════════════════════"
echo "   ✅ SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "   🚀 Starting servers..."
echo "   📍 Frontend: http://localhost:5173"
echo "   📍 Backend:  http://localhost:3000"
echo ""
echo "   ⏳ Wait for servers to start, then open the browser."
echo "   🛑 Press Ctrl+C to stop the servers."
echo ""
echo "═══════════════════════════════════════════════════"
echo ""
