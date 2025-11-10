'use client';
import {useWallet} from '@/hooks/useWallet';
export {useWallet};
export function useWalletAddress(){ return useWallet() ?? ''; }
