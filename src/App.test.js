import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders home route", async () => {
  render(<App />);
  const els = await screen.findAllByText(/7 Golden Cowries/i);
  expect(els.length).toBeGreaterThan(0);
});
