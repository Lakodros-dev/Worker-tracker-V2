#!/usr/bin/env bash
set -e

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Building frontend..."
cd ../frontend
npm install
npm run build

echo "Copying frontend to backend static folder..."
cd ../backend
rm -rf static
cp -r ../frontend/dist static

echo "Build complete!"
