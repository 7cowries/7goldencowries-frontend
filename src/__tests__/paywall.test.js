/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";

const mockUseWallet = jest.fn();

jest.mock("../hooks/useWallet", () => ({
  __esModule: true,
  default: () => mockUseWallet(),
}));

const PaymentGuard = require("../components/PaymentGuard").default;

describe("PaymentGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWallet.mockReturnValue({ isLoading: false });
  });

  test("renders children when wallet is not loading", () => {
    render(
      <PaymentGuard>
        <div data-testid="paid">Premium content</div>
      </PaymentGuard>
    );

    expect(screen.getByTestId("paid")).toBeInTheDocument();
  });

  test("renders loading fallback when wallet state is loading", () => {
    mockUseWallet.mockReturnValue({ isLoading: true });

    render(
      <PaymentGuard loadingFallback={<div data-testid="loading">Loading</div>}>
        <div data-testid="paid">Premium content</div>
      </PaymentGuard>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("paid")).not.toBeInTheDocument();
  });
});
