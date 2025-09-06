import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Quests from './Quests';
import * as api from '../utils/api';

jest.mock('../utils/api');

beforeEach(() => {
  localStorage.setItem('wallet', 'w1');
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

function setupMocks(quests) {
  api.getQuests.mockResolvedValue({ quests, completed: [], xp: 0 });
  api.getProfile.mockResolvedValue({ socials: { twitter: { connected: true } } });
  api.getProofStatus.mockResolvedValue({});
  api.claimQuest.mockResolvedValue({});
}

test('renders proof required badge', async () => {
  setupMocks([{ id: '1', title: 'Q1', xp: 5, type: 'social', requirement: 'x_tweet' }]);
  render(<Quests />);
  await screen.findByText('Q1');
  expect(screen.getByText('Proof required')).toBeInTheDocument();
});

test('happy path submit -> verified enables claim', async () => {
  const quest = { id: '1', title: 'Q1', xp: 5, type: 'social', requirement: 'x_tweet' };
  setupMocks([quest]);
  let status = { status: 'pending' };
  api.submitProof.mockImplementation(() => Promise.resolve(status));
  api.getProofStatus.mockImplementation(() => Promise.resolve(status));
  render(<Quests />);
  await screen.findByText('Q1');
  fireEvent.click(screen.getByText('Submit proof'));
  const input = screen.getByPlaceholderText('https://x.com/username/status/1234567890');
  fireEvent.change(input, { target: { value: 'https://twitter.com/user/status/123' } });
  fireEvent.blur(input);
  fireEvent.click(screen.getByText('Submit'));
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });
  status = { status: 'verified' };
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });
  await waitFor(() => expect(screen.queryByText('Submit Proof')).not.toBeInTheDocument());
  const claimBtn = await screen.findByText('Claim');
  expect(claimBtn).not.toBeDisabled();
});

test('rejected path shows reason and keeps claim disabled', async () => {
  const quest = { id: '1', title: 'Q1', xp: 5, type: 'social', requirement: 'x_tweet' };
  setupMocks([quest]);
  api.submitProof.mockResolvedValue({ status: 'rejected', reason: 'bad' });
  render(<Quests />);
  await screen.findByText('Q1');
  fireEvent.click(screen.getByText('Submit proof'));
  const input = screen.getByPlaceholderText('https://x.com/username/status/1234567890');
  fireEvent.change(input, { target: { value: 'https://x.com/user/status/123' } });
  fireEvent.blur(input);
  fireEvent.click(screen.getByText('Submit'));
  await screen.findByText('bad');
  const claimBtn = screen.getByText('Claim');
  expect(claimBtn).toBeDisabled();
});

test('non-proof quest remains claimable', async () => {
  setupMocks([{ id: '1', title: 'Q1', xp: 5, type: 'social', requirement: 'none' }]);
  render(<Quests />);
  await screen.findByText('Q1');
  const claimBtn = screen.getByText('Claim');
  expect(claimBtn).not.toBeDisabled();
});
