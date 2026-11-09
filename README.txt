STRAND - AI hairstyle try-on

DEPLOY ON VERCEL (no start.bat needed for visitors)
 1. Deploy this folder (index.html and api/ must be at the project root).
 2. Vercel > Project > Settings > Environment Variables: add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Production).
 3. Redeploy. NEVER upload a .env file (it would be publicly downloadable).

LOCAL: Quick preview checkbox tests styles with no server. For real AI locally: copy .env.example to .env, fill it, run start.bat (Python 3).
