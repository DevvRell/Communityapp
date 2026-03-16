#!/bin/bash

# Render build script
set -e

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build complete!"
