# Version Update Notification Feature

This feature automatically detects when users are running an outdated version of the app and shows a refresh notification to prompt them to update.

## How it works

1. **Version Detection**: The app checks the current version against the latest version via an API endpoint
2. **Automatic Checking**: Version checks happen:
   - On app load
   - Every 10 minutes while the app is active
   - When the user returns to the tab (focus event)
3. **Smart Caching**: Version checks are cached for 5 minutes to avoid excessive API calls
4. **User Control**: Users can dismiss the notification or refresh immediately

## Components

### `useVersionCheck` Hook
- Manages version checking logic
- Handles caching and API calls
- Provides refresh functionality

### `VersionRefreshNotification` Component
- Shows a dismissible notification when updates are available
- Displays current and latest version numbers
- Provides refresh and dismiss actions

### `/api/version` Endpoint
- Returns the current app version
- Used by the client to check for updates

## Usage

The feature is automatically integrated into the app via the `Providers` component. No additional setup is required.

## Testing

Use the provided test script to simulate version updates:

```bash
# Simulate a version update to 0.5.0
node scripts/test-version-update.js update 0.5.0

# Start your dev server and test the notification
npm run dev

# Revert changes when done testing
node scripts/test-version-update.js revert
```

## Configuration

### Version Management

#### Automatic Version Sync
The system automatically syncs versions between `package.json` and `src/lib/version.ts`:
- **Before every build** (via `prebuild` script)
- **Manually** using `npm run version:sync`

#### Version Bumping
Use semantic versioning to bump versions:

```bash
# Patch version (0.4.0 → 0.4.1) - bug fixes
npm run version:patch

# Minor version (0.4.0 → 0.5.0) - new features
npm run version:minor

# Major version (0.4.0 → 1.0.0) - breaking changes
npm run version:major
```

#### Manual Version Updates
```bash
# Update to specific version
npm run version:update 0.5.0

# Sync existing versions
npm run version:sync
```

#### Deployment Process
**Fully Automated**: Just push to main branch!

```bash
git add .
git commit -m "Your changes"
git push origin main
```

The GitHub Action will automatically:
1. **Bump version** (minor version: 0.4.0 → 0.5.0)
2. **Commit the version bump**
3. **Build and deploy** the Docker image

**Manual Version Control** (if needed):
```bash
# For patch updates (0.4.0 → 0.4.1)
npm run version:patch

# For major updates (0.4.0 → 1.0.0) 
npm run version:major
```

### Notification Behavior
- Notifications are dismissed per version (won't show again for the same version)
- Caching prevents excessive API calls
- Automatic refresh clears all caches

### Customization
You can customize the notification appearance by modifying `src/components/version-refresh-notification.tsx`:
- Change the styling
- Modify the text content
- Adjust the positioning
- Change the dismiss behavior

## Environment Considerations

The feature works in both development and production environments:
- **Development**: Uses the version from `package.json`
- **Production**: Uses the version from the deployed app

## Browser Compatibility

- Works in all modern browsers
- Gracefully handles cases where localStorage is not available
- Uses standard Web APIs for cache management
