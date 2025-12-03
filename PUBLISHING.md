# Automated Publishing Workflow

This repository is set up to automatically publish to npm when you update the version number.

## How It Works

1. **Update version** in `package.json`
2. **Commit and push** to the `main` branch
3. **GitHub Actions automatically**:
   - Detects the version change
   - Runs tests
   - Builds the package
   - Publishes to npm
   - Creates a git tag

## Setup Required

### 1. Create NPM Access Token

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token" → "Classic Token"
3. Select "Automation" type
4. Copy the token (starts with `npm_...`)

### 2. Add NPM Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **Add secret**

## Publishing a New Version

### Option 1: Using npm version command (Recommended)

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major

# Push the changes
git push origin main
```

### Option 2: Manual version update

1. Edit `package.json` and change the `version` field
2. Update `CHANGELOG.md` with changes
3. Commit and push:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 1.0.1"
   git push origin main
   ```

### Option 3: Using the helper script

```bash
# Run the version bump script
npm run release:patch   # 1.0.0 → 1.0.1
npm run release:minor   # 1.0.0 → 1.1.0
npm run release:major   # 1.0.0 → 2.0.0
```

## What Happens

1. ✅ Version change detected
2. ✅ Tests run automatically
3. ✅ Package builds
4. ✅ Published to npm
5. ✅ Git tag created (e.g., `v1.0.1`)

## Workflow Files

- `.github/workflows/publish.yml` - Publishes to npm on version change
- `.github/workflows/version-tag.yml` - Creates git tags for releases
- `.github/workflows/ci.yml` - Runs tests on all pushes

## Monitoring

- Check **Actions** tab in GitHub to see publish status
- Check https://www.npmjs.com/package/stack-replayer for published versions

## Troubleshooting

### Publish failed with authentication error
- Verify `NPM_TOKEN` secret is set correctly in GitHub
- Make sure the token hasn't expired
- Ensure the token has "Automation" permissions

### Version didn't change
- The workflow only runs when `version` in `package.json` changes
- Make sure you bumped the version number before pushing

### Tests failed
- The publish will be cancelled if tests fail
- Fix the failing tests and push again
