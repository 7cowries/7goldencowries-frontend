import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quests from './Quests';
import { getQuests, claimQuest, getMe } from '../utils/api';

jest.mock('../utils/api');

describe('Quests page claiming', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('claiming a quest refreshes data and shows awarded XP', async () => {
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1 }],
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
});

