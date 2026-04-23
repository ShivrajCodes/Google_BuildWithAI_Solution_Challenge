#!/usr/bin/env bash
# Render Build Script
# This script runs during Render's build phase

set -o errexit  # Exit on error

echo "=== Installing Python dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Installing Node.js dependencies & building frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Verifying frontend build output ==="
if [ -d "frontend/out" ]; then
    echo "✅ Frontend build successful — frontend/out exists"
    ls -la frontend/out/
else
    echo "❌ Frontend build FAILED — frontend/out not found"
    exit 1
fi

echo "=== Build complete ==="
