#!/bin/bash

# Script to convert ES6 modules to CommonJS for Cloud Functions

echo "Converting functions/ directory to CommonJS..."

# Convert all .js files in functions directory
find functions -name "*.js" -type f | while read file; do
  echo "Processing: $file"
  
  # Skip index.js (already converted)
  if [[ "$file" == "functions/index.js" ]]; then
    continue
  fi
  
  # Convert import statements to require
  sed -i '' "s/import \(.*\) from '\(.*\)\.js'/const \1 = require('\2')/g" "$file"
  sed -i '' "s/import \(.*\) from \"\(.*\)\.js\"/const \1 = require('\2')/g" "$file"
  sed -i '' "s/import \(.*\) from '\(.*\)'/const \1 = require('\2')/g" "$file"
  sed -i '' "s/import \(.*\) from \"\(.*\)\"/const \1 = require('\2')/g" "$file"
  
  # Convert export const to const
  sed -i '' "s/export const /const /g" "$file"
  sed -i '' "s/export async function /async function /g" "$file"
  sed -i '' "s/export function /function /g" "$file"
  
done

echo "Conversion complete!"
echo "Note: You may need to manually add module.exports at the end of each file"
