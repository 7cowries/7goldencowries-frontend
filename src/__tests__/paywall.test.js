/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import PaymentGuard from "../components/PaymentGuard";
import useWallet from "@/hooks/useWallet";

jest.mock("@/hooks/useWallet", () => {
  const mock = jest.fn();
  return { __esModule: true, default: mock, useWallet: mock };
});

describe("PaymentGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading fallback while wallet state is resolving", () => {
    useWallet.mockReturnValue({ isLoading: true });
    render(
      <PaymentGuard loadingFallback={<div data-testid="loading">Loading…</div>}>
        <div data-testid="content">Content</div>
      </PaymentGuard>
    );
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  test("renders children when wallet is ready", () => {
    useWallet.mockReturnValue({ isLoading: false });
    render(
      <PaymentGuard>
        <div data-testid="content">Content</div>
      </PaymentGuard>
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
