import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quests from './Quests';
import {
  getQuests,
  claimQuest,
  getMe,
  submitProof,
  claimSubscriptionReward,
  claimReferralReward,
} from '../utils/api';
import useWallet from '../hooks/useWallet';
import { detectSpecialClaimType } from '../lib/claimType';

jest.mock('../utils/api');
jest.mock('../hooks/useWallet', () => {
  const mock = jest.fn();
  return { __esModule: true, default: mock, useWallet: mock };
});

const baseProfile = {
  wallet: 'w',
  xp: 0,
  level: '1',
  levelProgress: 0,
  socials: {},
};

describe('detectSpecialClaimType helper', () => {
  test('detects subscription metadata across fields', () => {
    expect(
      detectSpecialClaimType({
        claimType: 'Subscription_bonus',
        tags: ['exclusive'],
      })
    ).toBe('subscription');

    expect(
      detectSpecialClaimType({
        tags: ['Subscribe'],
        requirement: 'join_subscription',
      })
    ).toBe('subscription');
  });

  test('detects referral metadata and ignores other quests', () => {
    expect(
      detectSpecialClaimType({
        action: { type: 'REFERRAL_reward' },
        slug: 'invite-a-friend',
        tags: [{ label: 'friends' }],
      })
    ).toBe('referral');

    expect(detectSpecialClaimType({ claimType: 'standard' })).toBeNull();
  });
});

describe('Quests page claiming', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.clearAllMocks();
    localStorage.clear();
    useWallet.mockReturnValue({ wallet: 'w', isConnected: true });
    getMe.mockResolvedValue(baseProfile);
    getQuests.mockResolvedValue({ quests: [], completed: [], xp: 0 });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('claiming a quest refreshes data and shows awarded XP', async () => {
    const quest = { id: 1, xp: 10, active: 1, requirement: 'none' };
    getQuests.mockResolvedValueOnce({ quests: [quest], completed: [], xp: 0 });
    getMe.mockResolvedValueOnce(baseProfile);

    render(<Quests />);
    await waitFor(() => expect(getQuests).toHaveBeenCalled());

    const claimBtn = await screen.findByRole('button', { name: 'Claim' });

    claimQuest.mockResolvedValue({ xp: 50 });
    getMe.mockResolvedValue({ ...baseProfile, xp: 50 });
    getQuests.mockResolvedValue({
      quests: [{ ...quest, completed: true }],
      completed: [1],
      xp: 50,
    });

    await userEvent.click(claimBtn);

    await waitFor(() => expect(claimQuest).toHaveBeenCalledWith(1));
    expect(await screen.findByText('+50 XP')).toBeInTheDocument();
  });

  test('subscription quests use the subscription claim endpoint', async () => {
    const quest = {
      id: 'sub-1',
      xp: 40,
      active: 1,
      requirement: 'none',
      claimType: 'subscription_reward',
    };
    getQuests.mockResolvedValueOnce({ quests: [quest], completed: [], xp: 0 });
    getMe.mockResolvedValueOnce(baseProfile);

    render(<Quests />);
    await waitFor(() => expect(getQuests).toHaveBeenCalled());

    const claimBtn = await screen.findByRole('button', { name: 'Claim' });

    claimSubscriptionReward.mockResolvedValue({ xp: 40 });
    getMe.mockResolvedValue({ ...baseProfile, xp: 40 });
    getQuests.mockResolvedValue({
      quests: [{ ...quest, completed: true }],
      completed: ['sub-1'],
      xp: 40,
    });

    await userEvent.click(claimBtn);

    await waitFor(() =>
      expect(claimSubscriptionReward).toHaveBeenCalledWith({ questId: 'sub-1' })
    );
    expect(claimQuest).not.toHaveBeenCalled();
    expect(await screen.findByText('+40 XP')).toBeInTheDocument();
  });

  test('referral quests use the referral claim endpoint', async () => {
    const quest = {
      id: 'ref-1',
      xp: 15,
      active: 1,
      requirement: 'none',
      tags: ['Referral'],
    };
    getQuests.mockResolvedValueOnce({ quests: [quest], completed: [], xp: 0 });
    getMe.mockResolvedValueOnce(baseProfile);

    render(<Quests />);
    await waitFor(() => expect(getQuests).toHaveBeenCalled());

    const claimBtn = await screen.findByRole('button', { name: 'Claim' });

    claimReferralReward.mockResolvedValue({ xpDelta: 15 });
    getMe.mockResolvedValue({ ...baseProfile, xp: 15 });
    getQuests.mockResolvedValue({
      quests: [{ ...quest, completed: true }],
      completed: ['ref-1'],
      xp: 15,
    });

    await userEvent.click(claimBtn);

    await waitFor(() =>
      expect(claimReferralReward).toHaveBeenCalledWith({ questId: 'ref-1' })
    );
    expect(claimQuest).not.toHaveBeenCalled();
    expect(await screen.findByText('+15 XP')).toBeInTheDocument();
  });

  test('proof-required response blocks claim until proof approved', async () => {
    const quest = {
      id: 'special',
      xp: 25,
      active: 1,
      requirement: 'none',
      claimType: 'subscription_reward',
    };
    getQuests.mockResolvedValueOnce({ quests: [quest], completed: [], xp: 0 });
    getMe.mockResolvedValueOnce(baseProfile);
    getQuests.mockResolvedValue({
      quests: [{ ...quest, proofStatus: 'approved' }],
      completed: [],
      xp: 0,
    });

    render(<Quests />);
    await waitFor(() => expect(getQuests).toHaveBeenCalled());

    const claimBtn = await screen.findByRole('button', { name: 'Claim' });

    claimSubscriptionReward.mockResolvedValueOnce({ error: 'proof_required' });

    await userEvent.click(claimBtn);

    await waitFor(() =>
      expect(claimSubscriptionReward).toHaveBeenCalledWith({ questId: 'special' })
    );

    const blockedBtn = await screen.findByRole('button', { name: 'Claim' });
    expect(blockedBtn).toBeDisabled();
    expect(blockedBtn).toHaveAttribute('title', 'Submit proof before claiming');
    const note = screen.getByText('Proof required — submit your link above.');
    expect(note).toBeInTheDocument();
    const describedBy = blockedBtn.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const describedEl = document.getElementById(describedBy);
      expect(describedEl).toHaveTextContent('Proof required — submit your link above.');
    }

    const input = await screen.findByPlaceholderText('Paste link here');
    await userEvent.type(input, 'https://example.com/proof');
    submitProof.mockResolvedValueOnce({ status: 'approved' });

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitBtn);

    await waitFor(() =>
      expect(submitProof).toHaveBeenCalledWith('special', {
        url: 'https://example.com/proof',
      })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Claim' })).not.toBeDisabled()
    );
    expect(
      screen.queryByText('Proof required — submit your link above.')
    ).not.toBeInTheDocument();
  });

  test('submitting proof enables claim for tweet quest', async () => {
    const quest = { id: 1, xp: 10, active: 1, requirement: 'tweet' };
    getQuests.mockResolvedValueOnce({ quests: [quest], completed: [], xp: 0 });
    getMe.mockResolvedValueOnce(baseProfile);
    getQuests.mockResolvedValue({
      quests: [{ ...quest, proofStatus: 'approved' }],
      completed: [],
      xp: 0,
    });

    render(<Quests />);
    await waitFor(() => expect(getQuests).toHaveBeenCalled());

    const input = await screen.findByPlaceholderText('Paste tweet/retweet/quote link');
    await userEvent.type(input, 'https://twitter.com/user/status/1');

    submitProof.mockResolvedValueOnce({ status: 'approved' });
    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitBtn);

    await waitFor(() =>
      expect(submitProof).toHaveBeenCalledWith(1, {
        url: 'https://twitter.com/user/status/1',
      })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Claim' })).not.toBeDisabled()
    );
  });

  test('quest title links to URL when provided', async () => {
    const quest = {
      id: 1,
      xp: 10,
      active: 1,
      requirement: 'none',
      url: 'https://example.com',
    };
    getQuests.mockResolvedValueOnce({ quests: [quest], completed: [], xp: 0 });
    getMe.mockResolvedValueOnce(baseProfile);

    render(<Quests />);
    await waitFor(() => expect(getQuests).toHaveBeenCalled());

    const link = await screen.findByRole('link', { name: '1' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('claim button disabled when wallet disconnected', async () => {
    useWallet.mockReturnValue({ wallet: null, isConnected: false });
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, requirement: 'none' }],
      completed: [],
      xp: 0,
    });
    getMe.mockResolvedValueOnce(null);

    render(<Quests />);
    await waitFor(() => expect(getQuests).toHaveBeenCalled());

    const claimBtn = await screen.findByRole('button', { name: 'Claim' });
    expect(claimBtn).toBeDisabled();
    expect(claimBtn).toHaveAttribute('title', 'Connect wallet to claim');
  });
});
