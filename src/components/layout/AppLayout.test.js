import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { getMe } from '../../utils/api';

jest.mock('../../utils/api');
jest.mock('../../utils/sounds', () => ({ playClick: jest.fn(), playXP: jest.fn() }));

test('mobile drawer opens and closes on navigation', async () => {
  getMe.mockResolvedValue({ wallet: null });
  window.innerWidth = 375;
  render(<App />);
  const menu = await screen.findByLabelText('Open menu');
  await userEvent.click(menu);
  await waitFor(() => document.querySelector('.sidebar.open'));
  const link = document.querySelector('.sidebar.open a[href="/quests"]');
  link && (await userEvent.click(link));
  await waitFor(() => expect(document.querySelector('.sidebar.open')).toBeNull());
});
