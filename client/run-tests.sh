#!/bin/bash

echo "🧪 Running tests..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "⬇️  Installing dependencies..."
  npm install
fi

# Run tests with coverage
echo "📊 Running tests with coverage..."
npm run test:coverage

echo "✅ Tests completed!"

# Open coverage report in browser
if [ "$1" = "--open" ]; then
  echo "📂 Opening coverage report..."
  open coverage/index.html || xdg-open coverage/index.html
fi