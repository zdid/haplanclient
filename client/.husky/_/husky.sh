#!/bin/sh
# Husky script for pre-commit hooks

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository"
  exit 1
fi

# Get the directory where this script is located
HUSKY_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Add husky directory to PATH
export PATH="$HUSKY_DIR:$PATH"

echo "Husky pre-commit hook initialized 🐶"