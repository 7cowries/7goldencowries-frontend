import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quests from './Quests';
import { getQuests, getMe } from '../utils/api';

jest.mock('../utils/api');

describe('Quests page claiming', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test('claiming a quest refreshes data and disables button', async () => {
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

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
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

    const input = screen.getByPlaceholderText('https://x.com/… or https://t.me/…');
    await userEvent.type(input, 'https://example.com');

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'approved' }) });
    const submitBtn = screen.getByText('Submit');
    await userEvent.click(submitBtn);

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const claimBtn = await screen.findByText('Claim');
    expect(claimBtn).not.toBeDisabled();
  });
});


