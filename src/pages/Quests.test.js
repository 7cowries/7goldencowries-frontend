import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Quests from "./Quests";
import { getQuests, claimQuest, submitProof, getMe } from "../utils/api";
import { MeProvider } from "../state/me";

jest.mock("../utils/api");

describe("Quests page claiming", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    getMe.mockResolvedValue({}); // MeProvider will call this
  });

  test("claiming a quest refreshes data and shows awarded XP", async () => {
    getQuests.mockResolvedValueOnce({ quests: [{ id: 1, xp: 10, active: 1, requirement: "none" }], completed: [], xp: 0 });
    render(<MeProvider><Quests /></MeProvider>);

    claimQuest.mockResolvedValue({ xp: 50 });
    getQuests.mockResolvedValueOnce({ quests: [{ id: 1, xp: 10, active: 1, completed: true }], completed: [1], xp: 50 });

    const claimBtn = await screen.findByText("Claim");
    await userEvent.click(claimBtn);

    expect(claimQuest).toHaveBeenCalledWith(1);
    expect(await screen.findByText("+50 XP")).toBeInTheDocument();
  });

  test("submitting proof enables claim for tweet quest", async () => {
    getQuests.mockResolvedValueOnce({ quests: [{ id: 1, xp: 10, active: 1, requirement: "tweet" }], completed: [], xp: 0 });
    getQuests.mockResolvedValueOnce({ quests: [{ id: 1, xp: 10, active: 1, requirement: "tweet", proofStatus: "approved" }], completed: [], xp: 0 });

    render(<MeProvider><Quests /></MeProvider>);

    const input = await screen.findByPlaceholderText("Paste tweet/retweet/quote link");
    await userEvent.type(input, "https://twitter.com/user/status/1");

    submitProof.mockResolvedValueOnce({ status: "approved" });
    const submitBtn = screen.getByText("Submit");
    await userEvent.click(submitBtn);

    await waitFor(() => expect(submitProof).toHaveBeenCalled());
    const claimBtn = await screen.findByText("Claim");
    expect(claimBtn).not.toBeDisabled();
  });
});
