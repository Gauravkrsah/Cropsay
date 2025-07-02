# SECURITY ADVISORY: API Key Exposure

## Critical Security Issue

We have detected that **API keys and other sensitive credentials** were previously committed to this repository. While we have now updated the code to use environment variables, the sensitive keys remain in the git history.

## Required Actions

1. **IMMEDIATELY REVOKE AND REPLACE all exposed API keys**:
   - Google Gemini API Key: `AIzaSyAj0IlBxZUnskZLEvmzZUQQLObMRqGiJjE`
   - Google Gemini API Key: `AIzaSyC8_FbrdYoxqAGNJJXdmve09gNHKFRJrO4`
   - Khalti Secret Key: `fb72e11e14004dd4ba652bb211a7d506`
   - Khalti Public Key: `c68726c852d943aab3b886bd381d3af7`

2. **Create new API keys** with appropriate restrictions:
   - For Google API keys: Add restrictions by HTTP referrers, IP addresses, or API scope
   - For payment gateway keys: Set proper usage limits and monitor for unusual activity

3. **Update all environment files** with the new keys

## Recommended: Clean Git History

To completely remove sensitive data from the git history, consider:

1. Using [GitHub's guide on removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

2. Using the BFG Repo-Cleaner tool:
   ```
   # Install Java if needed, then:
   java -jar bfg.jar --replace-text sensitive-data.txt
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   git push --force
   ```

3. Or using git-filter-repo:
   ```
   # Install git-filter-repo if needed, then:
   git filter-repo --replace-text sensitive-data.txt
   git push --force
   ```

## Preventative Measures

1. ✅ We have already updated the `.gitignore` file to exclude `.env` and similar files
2. ✅ We have created `.env.example` files as templates (without real values)
3. ✅ We have updated the code to use environment variables instead of hardcoded values
4. ✅ We have removed the tracked environment files from git

## Additional Security Recommendations

1. Consider implementing a secrets management solution
2. Set up regular API key rotation policies
3. Implement pre-commit hooks to prevent sensitive data from being committed
4. Conduct regular security audits of your codebase
5. Enable 2FA on all development accounts

> **IMPORTANT**: Until the exposed API keys are revoked and replaced, they remain vulnerable to misuse.
