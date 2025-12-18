// In Production (Server), use relative path '/api' to go through Nginx proxy.
// In Development (Local), use direct localhost:3000.
// If VITE_API_BASE_URL is explicitly set in .env, use that.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');
