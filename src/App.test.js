import { render, screen } from '@testing-library/react';
import App from './App';
import { getMe } from './utils/api';

jest.mock('./utils/api');
jest.mock('./utils/sounds', () => ({ playClick: jest.fn(), playXP: jest.fn() }));

test('renders home route', async () => {
  getMe.mockResolvedValue({ wallet: null });
  render(<App />);
  const els = await screen.findAllByText(/7 Golden Cowries/i);
  expect(els.length).toBeGreaterThan(0);
});
