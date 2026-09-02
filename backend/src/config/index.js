import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  // Le site Client et le site Admin sont déployés séparément (Netlify) : liste blanche CSV.
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,https://ashaw.duckdns.org')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  backblaze: {
    keyId: process.env.BACKBLAZE_KEY_ID,
    applicationKey: process.env.BACKBLAZE_APP_KEY,
    bucketName: process.env.BACKBLAZE_BUCKET_NAME,
    endpoint: process.env.BACKBLAZE_ENDPOINT,
    region: process.env.BACKBLAZE_REGION,
  },
  sessionDurationHours: Number(process.env.SESSION_DURATION_HOURS || 5),
  maxActiveConversations: Number(process.env.MAX_ACTIVE_CONVERSATIONS || 3),
  trashRetentionDays: Number(process.env.TRASH_RETENTION_DAYS || 30),
  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  },
};
