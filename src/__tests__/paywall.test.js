/**
 * @jest-environment jsdom
 */

import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

process.env.REACT_APP_TON_RECEIVE_ADDRESS = "EQTestReceiveAddress999";

const mockSendTransaction = jest.fn();
let mockWalletState = { account: { address: "EQTestWallet0000" } };

jest.mock("@tonconnect/ui-react", () => ({
  TonConnectUIProvider: ({ children }) => <>{children}</>,
  TonConnectButton: (props) => <button {...props}>TonConnect</button>,
  useTonConnectUI: () => [{ sendTransaction: mockSendTransaction }],
  useTonWallet: () => mockWalletState,
  __setMockWallet(next) {
    mockWalletState = next;
  },
}));

jest.mock("../utils/api", () => ({
  getJSON: jest.fn(),
  postJSON: jest.fn(),
}));

const { getJSON, postJSON } = require("../utils/api");
const PaymentGuard = require("../components/PaymentGuard").default;

function advancePromises() {
  return act(async () => {
    await Promise.resolve();
  });
}

describe("Paywall integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const tonUi = require("@tonconnect/ui-react");
    tonUi.__setMockWallet({ account: { address: "EQTestWallet0000" } });
  });

  afterAll(() => {
    delete process.env.REACT_APP_TON_RECEIVE_ADDRESS;
  });

  test("successful TonConnect payment verifies and unlocks content", async () => {
    getJSON.mockResolvedValueOnce({ paid: false }).mockResolvedValueOnce({ paid: true });
    postJSON.mockResolvedValue({ verified: true });
    mockSendTransaction.mockResolvedValue({ transaction: { hash: "hash123" } });

    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    render(
      <PaymentGuard>
        <div data-testid="paid">Premium content</div>
      </PaymentGuard>
    );

    const button = await screen.findByRole("button", { name: /unlock with tonconnect/i });
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => expect(postJSON).toHaveBeenCalledTimes(1));
    const payload = postJSON.mock.calls[0][1];
    expect(payload.to).toBe("EQTestReceiveAddress999");
    expect(payload.txHash).toBe("hash123");
    expect(payload.comment).toMatch(/^7GC-SUB:/);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    await advancePromises();
    expect(await screen.findByTestId("paid")).toBeInTheDocument();
    expect(getJSON).toHaveBeenCalledTimes(2);
    dispatchSpy.mockRestore();
  });

  test("TonConnect cancellation surfaces a single toast", async () => {
    getJSON.mockResolvedValue({ paid: false });
    postJSON.mockResolvedValue({ verified: false });
    mockSendTransaction.mockRejectedValue({ code: "USER_REJECTS_ERROR" });

    render(
      <PaymentGuard>
        <div data-testid="paid">Premium content</div>
      </PaymentGuard>
    );

    const button = await screen.findByRole("button", { name: /unlock with tonconnect/i });
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => expect(screen.getByText(/payment cancelled/i)).toBeInTheDocument());
    expect(postJSON).not.toHaveBeenCalled();
  });
});
