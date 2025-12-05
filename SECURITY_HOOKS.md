# Security Hooks - GeoCities AI

## Overview

This project includes Git hooks to prevent accidental commits of secrets and sensitive data.

## Installation

The security hooks are automatically installed when you run:

```bash
./scripts/install-git-hooks.sh
```

This creates a pre-commit hook that scans staged files for:
- API keys (Google, AWS, Stripe, etc.)
- Private keys
- Service account credentials
- Hardcoded passwords and tokens

## What Gets Blocked

### 1. Environment Files
- `.env` files (should use `.env.example` instead)
- Service account JSON files
- Any file with credentials

### 2. API Keys
- Google API keys (`AIza...`)
- AWS access keys (`AKIA...`)
- Stripe keys (`sk_live_...`)
- Other API key patterns

### 3. Private Keys
- RSA private keys
- SSH keys
- TLS/SSL certificates
- Service account private keys

### 4. Hardcoded Secrets
- Passwords in code
- Authentication tokens
- OAuth secrets
- Database credentials

## Example: Blocked Commit

```bash
$ git add test-secret.js
$ git commit -m "add feature"

🔍 Scanning for secrets in staged files...

❌ SECRETS DETECTED IN STAGED FILES!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 File: test-secret.js
🔑 Detected: Google API Key (AIza...)
   Lines:
   7:+const apiKey = 'AIzaSyDemoKey1234567890123456789012345';

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️  COMMIT BLOCKED FOR SECURITY
```

## Best Practices

### ✅ DO:
- Use environment variables for secrets
- Store secrets in `.env` files (gitignored)
- Use `.env.example` for documentation
- Use Firebase Functions config for API keys
- Use secret management services (AWS Secrets Manager, etc.)

### ❌ DON'T:
- Commit `.env` files
- Hardcode API keys in code
- Commit service account JSON files
- Store passwords in plain text
- Bypass the security hook (unless absolutely necessary)

## Environment Variable Management

### Development
```bash
# backend/.env (gitignored)
GEMINI_API_KEY=your_actual_key_here
FIREBASE_PROJECT_ID=gen-cities
```

### Production (Firebase Functions)
```bash
# Set via Firebase CLI
firebase functions:config:set gemini.api_key="your_key"
```

### Documentation
```bash
# backend/.env.example (committed)
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
```

## Bypassing the Hook (Emergency Only)

If you absolutely must bypass the hook (NOT RECOMMENDED):

```bash
git commit --no-verify -m "your message"
```

**Warning:** Only use this if you're certain no secrets are being committed!

## Kiro Hook Integration

The project also includes a Kiro AI hook for manual security scans:

**Location:** `.kiro/hooks/prevent-secrets-commit.json`

**Usage:** Run manually through Kiro IDE to scan staged files

## Troubleshooting

### Hook Not Running

If the hook isn't running:

```bash
# Reinstall the hook
./scripts/install-git-hooks.sh

# Check if hook exists
ls -la .git/hooks/pre-commit

# Make sure it's executable
chmod +x .git/hooks/pre-commit
```

### False Positives

If the hook blocks legitimate code:

1. Review the detected pattern
2. If it's not actually a secret, you can:
   - Refactor the code to avoid the pattern
   - Use `--no-verify` (carefully!)
   - Update the hook patterns in `scripts/install-git-hooks.sh`

### Adding New Patterns

To detect additional secret patterns:

1. Edit `scripts/install-git-hooks.sh`
2. Add new detection logic in the scanning section
3. Reinstall: `./scripts/install-git-hooks.sh`
4. Test with a sample file

## Files Protected

The following files are automatically protected by `.gitignore`:

```
.env
.env.local
.env.*.local
serviceAccountKey.json
firebase-debug.log
node_modules/
```

## Security Checklist

Before committing:
- [ ] No `.env` files staged
- [ ] No API keys in code
- [ ] No private keys or certificates
- [ ] No service account files
- [ ] Environment variables used for secrets
- [ ] `.env.example` updated if needed

## Additional Resources

- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/best-practices)

## Support

If you encounter issues with the security hooks:

1. Check this documentation
2. Review the hook script: `.git/hooks/pre-commit`
3. Test manually: `bash .git/hooks/pre-commit`
4. Reinstall: `./scripts/install-git-hooks.sh`
