import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quests from './Quests';
import { getQuests, claimQuest, getMe, submitProof } from '../utils/api';
import { MeProvider } from '../state/me';

jest.mock('../utils/api');

describe('Quests page claiming', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    getMe.mockResolvedValue({});
  });

  test('claiming a quest refreshes data and shows awarded XP', async () => {
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, requirement: 'none' }],
      completed: [],
      xp: 0,
    });
    getMe.mockResolvedValueOnce({
      wallet: 'w',
      xp: 0,
      level: '1',
      levelProgress: 0,
      socials: {},
    });

    render(<MeProvider><Quests /></MeProvider>);

    const claimBtn = await screen.findByText('Claim');

    claimQuest.mockResolvedValue({ xp: 50 });
    getMe.mockResolvedValueOnce({
      wallet: 'w',
      xp: 50,
      level: '1',
      levelProgress: 0,
      socials: {},
    });
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, completed: true }],
      completed: [1],
      xp: 50,
    });

    await userEvent.click(claimBtn);

    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getQuests).toHaveBeenCalledTimes(2));

    expect(await screen.findByText('+50 XP')).toBeInTheDocument();
  });

  test('quest title links to URL when provided', async () => {
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, url: 'https://example.com', requirement: 'none' }],
      completed: [],
      xp: 0,
    });
    getMe.mockResolvedValueOnce({
      wallet: 'w',
      xp: 0,
      level: '1',
      levelProgress: 0,
      socials: {},
    });

    render(<MeProvider><Quests /></MeProvider>);

    const link = await screen.findByRole('link', { name: '1' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('submitting proof enables claim for tweet quest', async () => {
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, requirement: 'tweet' }],
      completed: [],
      xp: 0,
    });
    getQuests.mockResolvedValueOnce({
      quests: [
        { id: 1, xp: 10, active: 1, requirement: 'tweet', proofStatus: 'approved' },
      ],
      completed: [],
      xp: 0,
    });
    getMe.mockResolvedValueOnce({
      wallet: 'w',
      xp: 0,
      level: '1',
      levelProgress: 0,
      socials: {},
    });

    render(<MeProvider><Quests /></MeProvider>);

    const input = await screen.findByPlaceholderText('Paste tweet/retweet/quote link');
    await userEvent.type(input, 'https://twitter.com/user/status/1');

    submitProof.mockResolvedValueOnce({ status: 'approved' });
      const submitBtn = screen.getByText('Submit');
    await userEvent.click(submitBtn);

    await waitFor(() => expect(submitProof).toHaveBeenCalled());
    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(2));

    const claimBtn = await screen.findByText('Claim');
    expect(claimBtn).not.toBeDisabled();
  });
});


