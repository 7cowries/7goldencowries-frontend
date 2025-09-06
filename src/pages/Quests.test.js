import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quests from './Quests';
import { getQuests, claimQuest, getMe, submitQuestProof } from '../utils/api';

jest.mock('../utils/api');

describe('Quests page claiming', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('claiming a quest refreshes data and shows awarded XP', async () => {
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, completed: true }],
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

    render(<Quests />);

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
      quests: [{ id: 1, xp: 10, active: 1, alreadyClaimed: true }],
      completed: [1],
      xp: 50,
    });

    await userEvent.click(claimBtn);

    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getQuests).toHaveBeenCalledTimes(2));

    expect(await screen.findByText('Claimed')).toBeDisabled();
    expect(screen.getByText(/\+50 XP/)).toBeInTheDocument();
  });

  test('shows Go button when quest has a URL', async () => {
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, url: 'https://example.com', requirement: 'link' }],
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

    render(<Quests />);

    const goBtn = await screen.findByText('Go');
    expect(goBtn).toHaveAttribute('href', 'https://example.com');
  });

  test('submitting proof enables claim for link quest', async () => {
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, requirement: 'link' }],
      completed: [],
      xp: 0,
    });
    getQuests.mockResolvedValueOnce({
      quests: [
        { id: 1, xp: 10, active: 1, requirement: 'link', proofStatus: 'approved' },
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

    render(<Quests />);

    const proofBtn = await screen.findByText('Submit proof');
    await userEvent.click(proofBtn);

    const input = screen.getByPlaceholderText('https://x.com/username/status/1234567890');
    await userEvent.type(input, 'https://example.com');

    submitQuestProof.mockResolvedValueOnce({ ok: true });
    const submitBtn = screen.getByText('Submit');
    await userEvent.click(submitBtn);

    await waitFor(() => expect(submitQuestProof).toHaveBeenCalled());

    const claimBtn = await screen.findByText('Claim');
    expect(claimBtn).not.toBeDisabled();
  });
});


