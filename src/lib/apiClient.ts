import axios from 'axios';
import { API_BASE } from '@/config';

const client = axios.create({
  baseURL: API_BASE || '',
});

export const fetchMe = () => client.get('/api/me');
export const fetchQuests = () => client.get('/api/quests');
export const claimQuest = (id: string) => client.post(`/api/quests/claim`, { id });
export const fetchLeaderboard = () => client.get('/api/leaderboard');
export const fetchReferrals = () => client.get('/api/referrals');
export const claimReferral = (id: string) => client.post('/api/referrals/claim', { id });
export const fetchSubscriptionStatus = () => client.get('/subscriptions/status');
export const subscribe = (tier: string) => client.post('/subscriptions/subscribe', { tier });
export const startTokenSale = (amount: number) => client.post('/token-sale/start', { amount });
export const fetchTokenSaleStats = () => client.get('/token-sale/stats');

export default client;
