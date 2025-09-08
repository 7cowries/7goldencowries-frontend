import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quests from './Quests';
import { getQuests, claimQuest, getMe } from '../utils/api';
import { confettiBurst } from '../utils/confetti';

jest.mock('../utils/api');
jest.mock('../utils/confetti', () => ({ confettiBurst: jest.fn() }));

describe('Quests page', () => {
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
      quests: [{ id: 1, xp: 10, active: 1, completed: true }],
      completed: [1],
      xp: 50,
    });

    await userEvent.click(claimBtn);

    await waitFor(() => expect(getMe).toHaveBeenCalled());
    await waitFor(() => expect(getQuests).toHaveBeenCalled());
    expect(confettiBurst).toHaveBeenCalled();

    expect(await screen.findByText('+50 XP')).toBeInTheDocument();
  });

  test('quest title renders a single link when URL provided', async () => {
    getQuests.mockResolvedValueOnce({
      quests: [{ id: 1, xp: 10, active: 1, url: 'https://example.com' }],
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

    const link = await screen.findByRole('link', { name: '1' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    const card = link.closest('.quest-card');
    expect(within(card).getAllByRole('link')).toHaveLength(1);
  });

  test('proof input is shown on quest card', async () => {
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

    expect(await screen.findByPlaceholderText('Paste proof link (optional)')).toBeInTheDocument();
  });
});
