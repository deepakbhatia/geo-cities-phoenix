#!/bin/bash

# Install Git hooks for GeoCities AI project
# This script sets up pre-commit hooks to prevent secrets from being committed

echo "🔒 Installing Git security hooks..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook to prevent secrets from being committed
# GeoCities AI Project

echo "🔍 Scanning for secrets in staged files..."

# Patterns to search for
PATTERNS=(
  "AIza[0-9A-Za-z_-]{35}"                    # Google API keys
  "sk_live_[0-9a-zA-Z]{24}"                  # Stripe keys
  "AKIA[0-9A-Z]{16}"                         # AWS access keys
  "BEGIN.*PRIVATE KEY"                       # Private keys
  "private_key.*:"                           # Service account keys
  "password.*=.*['\"]"                       # Hardcoded passwords
  "token.*=.*['\"]"                          # Hardcoded tokens
  "secret.*=.*['\"]"                         # Hardcoded secrets
  "api_key.*=.*['\"]"                        # API keys in code
)

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No files staged for commit"
  exit 0
fi

# Check for .env files (should never be committed)
if echo "$STAGED_FILES" | grep -q "\.env$"; then
  echo "❌ ERROR: .env file detected in staged files!"
  echo "   Files like .env should never be committed."
  echo "   Add them to .gitignore and use .env.example instead."
  echo ""
  echo "   Blocked files:"
  echo "$STAGED_FILES" | grep "\.env$" | sed 's/^/   - /'
  exit 1
fi

# Check for service account JSON files
if echo "$STAGED_FILES" | grep -q "serviceAccountKey\.json"; then
  echo "❌ ERROR: Service account key file detected!"
  echo "   Service account keys should never be committed."
  echo "   Add them to .gitignore."
  exit 1
fi

# Scan staged files for secret patterns
SECRETS_FOUND=0

for file in $STAGED_FILES; do
  # Skip binary files and node_modules
  if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".lock" ]]; then
    continue
  fi
  
  # Get the staged content
  CONTENT=$(git diff --cached "$file")
  
  # Check for Google API keys (AIza...)
  if echo "$CONTENT" | grep -q "AIza"; then
    if [ $SECRETS_FOUND -eq 0 ]; then
      echo ""
      echo "❌ SECRETS DETECTED IN STAGED FILES!"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
    SECRETS_FOUND=1
    echo ""
    echo "📄 File: $file"
    echo "🔑 Detected: Google API Key (AIza...)"
    echo "   Lines:"
    echo "$CONTENT" | grep -n "AIza" | head -3 | sed 's/^/   /'
  fi
  
  # Check for private keys
  if echo "$CONTENT" | grep -q "BEGIN.*PRIVATE KEY"; then
    if [ $SECRETS_FOUND -eq 0 ]; then
      echo ""
      echo "❌ SECRETS DETECTED IN STAGED FILES!"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
    SECRETS_FOUND=1
    echo ""
    echo "📄 File: $file"
    echo "🔑 Detected: Private Key"
  fi
  
  # Check for service account keys
  if echo "$CONTENT" | grep -q "private_key.*:"; then
    if [ $SECRETS_FOUND -eq 0 ]; then
      echo ""
      echo "❌ SECRETS DETECTED IN STAGED FILES!"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
    SECRETS_FOUND=1
    echo ""
    echo "📄 File: $file"
    echo "🔑 Detected: Service Account Key"
  fi
  
  # Check for AWS keys
  if echo "$CONTENT" | grep -q "AKIA"; then
    if [ $SECRETS_FOUND -eq 0 ]; then
      echo ""
      echo "❌ SECRETS DETECTED IN STAGED FILES!"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
    SECRETS_FOUND=1
    echo ""
    echo "📄 File: $file"
    echo "🔑 Detected: AWS Access Key"
  fi
done

if [ $SECRETS_FOUND -eq 1 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🛡️  COMMIT BLOCKED FOR SECURITY"
  echo ""
  echo "Secrets or sensitive data were detected in your staged files."
  echo ""
  echo "What to do:"
  echo "  1. Remove the secrets from the files"
  echo "  2. Use environment variables instead"
  echo "  3. Add sensitive files to .gitignore"
  echo "  4. Use .env.example for documentation"
  echo ""
  echo "To bypass this check (NOT RECOMMENDED):"
  echo "  git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ No secrets detected in staged files"
echo "✅ Security check passed"
exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "The hook will now:"
echo "  • Scan staged files for API keys and secrets"
echo "  • Block commits containing .env files"
echo "  • Block commits containing service account keys"
echo "  • Prevent accidental exposure of sensitive data"
echo ""
echo "To test it, try: git add backend/.env && git commit -m 'test'"
echo "(This should be blocked)"
