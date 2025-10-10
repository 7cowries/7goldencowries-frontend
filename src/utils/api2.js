/**
 * Compatibility shim:
 * - Re-export all legacy helpers (getLeaderboard, getMe, etc.)
 * - Force API_BASE to '' so calls hit /api/* and get rewritten by vercel.json
 */
export * from './api';
export const API_BASE = '';
