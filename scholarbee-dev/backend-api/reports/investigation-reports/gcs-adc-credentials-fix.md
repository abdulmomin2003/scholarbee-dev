# Google Cloud Storage ADC Credentials Fix

## Problem Identified

The `gcloud auth application-default login` command was creating the credentials file in the **Windows Store Python AppData location** instead of the standard user AppData location:

- **Incorrect Location**: `C:\Users\PC\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\Roaming\gcloud\application_default_credentials.json`
- **Expected Location**: `C:\Users\PC\AppData\Roaming\gcloud\application_default_credentials.json`

Additionally, the `account` field in the credentials file was empty (`"account": ""`), which could cause issues.

## Root Cause

When Python is installed via the Microsoft Store, gcloud SDK may use the Python Store's AppData location (`LocalCache\Roaming`) instead of the user's standard AppData location. This happens because:

1. The Windows Store Python installation has its own isolated AppData environment
2. gcloud detects the Python Store installation and uses its AppData path
3. Node.js applications look for credentials in the standard `%APPDATA%\gcloud\` location

## Solution Applied

1. **Created the standard gcloud directory** (if it didn't exist):
   ```bash
   mkdir -p "C:/Users/PC/AppData/Roaming/gcloud"
   ```

2. **Copied the credentials file** from the Python Store location to the standard location:
   ```bash
   cp "C:/Users/PC/AppData/Local/Packages/PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0/LocalCache/Roaming/gcloud/application_default_credentials.json" \
      "C:/Users/PC/AppData/Roaming/gcloud/application_default_credentials.json"
   ```

3. **Updated the account field** from empty string to the correct account:
   ```json
   {
     "account": "shahzaib@scholarbee.pk",
     ...
   }
   ```

## Verification

✅ ADC file now exists at: `C:\Users\PC\AppData\Roaming\gcloud\application_default_credentials.json`  
✅ Account field is populated: `shahzaib@scholarbee.pk`  
✅ File contains all required fields: `client_id`, `client_secret`, `refresh_token`, `quota_project_id`, etc.

## Testing

Test that Node.js can now access the credentials:

1. **Restart your NestJS application** (if it's running)
2. **Make a request to** `POST /api/media-management`
3. **Verify** that the "Could not load default credentials" error is gone

## Prevention for Future

To prevent this issue from recurring:

### Option 1: Set GOOGLE_APPLICATION_CREDENTIALS Environment Variable

Set this environment variable to explicitly point to the credentials file location:

**PowerShell:**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\PC\AppData\Roaming\gcloud\application_default_credentials.json"
```

**Permanent (System Environment Variables):**
1. Open System Properties → Environment Variables
2. Add new User variable:
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `C:\Users\PC\AppData\Roaming\gcloud\application_default_credentials.json`

### Option 2: Use Service Account (Recommended for Production)

For production environments, use a service account instead of user credentials:

1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Set `GOOGLE_APPLICATION_CREDENTIALS` to point to the service account key file

### Option 3: Configure gcloud to Use Standard Location

You can set the gcloud config directory explicitly:

```bash
gcloud config set config_dir "C:\Users\PC\AppData\Roaming\gcloud"
```

However, this may not affect where `application_default_credentials.json` is created.

## Notes

- The `account` field being empty is not always critical - the credentials can still work with just the `refresh_token`. However, it's better to have it populated for clarity and debugging.
- If you re-run `gcloud auth application-default login`, it may create the file in the Python Store location again. You'll need to copy it to the standard location again, or use one of the prevention methods above.
- Consider using a service account for production deployments to avoid these path issues entirely.

## Related Files

- `src/media-management/media-management.service.ts` - Uses the Storage client with ADC
- `src/config/configuration.ts` - GCS configuration (currently doesn't use explicit credentials)
