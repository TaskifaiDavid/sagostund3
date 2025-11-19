<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1gEXpgKMQlApMBHG2iVo9AoqSW_98Es1R

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. **Set up environment variables (IMPORTANT):**
   ```bash
   # Copy the example env file
   cp .env.example .env.local

   # Edit .env.local and add your actual Gemini API key
   # Get your key from: https://aistudio.google.com/app/apikey
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Security Best Practices

### API Key Security

**CRITICAL: Never commit your API keys to git!**

- Your `.env.local` file is protected by `.gitignore`
- Never hardcode API keys in your source code
- Use environment variables for all sensitive data
- If you accidentally commit an API key:
  1. **Immediately revoke** the exposed key in Google Cloud Console
  2. Generate a new API key
  3. Update your `.env.local` with the new key
  4. Contact support if the repository was public

### Client-Side API Key Warning

This is a client-side Vite application, which means:
- The API key is bundled into the browser JavaScript
- Anyone can extract the key using browser DevTools
- **Always use API key restrictions** in Google Cloud Console:
  - Set HTTP referrer restrictions (your domain only)
  - Monitor API usage for abuse
  - Set usage quotas to prevent unexpected charges

For production deployments, consider:
- Implementing a backend proxy to hide the API key
- Using server-side API calls instead of client-side
- Setting up proper authentication and rate limiting
