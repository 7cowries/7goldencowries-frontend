import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

process.env.REACT_APP_API_URL = "http://localhost";

beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  );
});

import Home from "./Home";
import Quests from "./Quests";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";

test("routes render", () => {
  [Home, Quests, Leaderboard, Profile].forEach((Cmp) => {
    render(
      <MemoryRouter>
        <Cmp />
      </MemoryRouter>
    );
  });
});
