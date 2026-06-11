import { act, renderHook } from "@testing-library/react";

import { useColorScheme } from "metabase/ui";

import {
  DASHBOARD_STYLE_UPDATED_EVENT,
  dispatchDashboardStyleUpdated,
  useDashboardDomReadyStyleRevision,
  useDomReadyColorSchemeRevision,
} from "./use-dashboard-style-revision";

jest.mock("metabase/ui", () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = jest.mocked(useColorScheme);

describe("useDomReadyColorSchemeRevision", () => {
  it("should follow resolved color scheme updates", () => {
    mockUseColorScheme.mockReturnValue({
      colorScheme: "light",
      resolvedColorScheme: "light",
      systemColorScheme: "light",
      setColorScheme: jest.fn(),
      toggleColorScheme: jest.fn(),
    });

    const { result, rerender } = renderHook(() =>
      useDomReadyColorSchemeRevision(),
    );

    expect(result.current).toBe("light");

    mockUseColorScheme.mockReturnValue({
      colorScheme: "dark",
      resolvedColorScheme: "dark",
      systemColorScheme: "light",
      setColorScheme: jest.fn(),
      toggleColorScheme: jest.fn(),
    });

    rerender();

    expect(result.current).toBe("dark");
  });
});

describe("useDashboardDomReadyStyleRevision", () => {
  beforeEach(() => {
    mockUseColorScheme.mockReturnValue({
      colorScheme: "light",
      resolvedColorScheme: "light",
      systemColorScheme: "light",
      setColorScheme: jest.fn(),
      toggleColorScheme: jest.fn(),
    });
  });
  it("should advance revision when dashboard styles update", () => {
    const { result } = renderHook(() => useDashboardDomReadyStyleRevision(12));

    expect(result.current).toBe(0);

    act(() => {
      dispatchDashboardStyleUpdated(12);
    });

    expect(result.current).toBe(1);
  });

  it("should ignore style updates for other dashboards", () => {
    const { result } = renderHook(() => useDashboardDomReadyStyleRevision(12));

    act(() => {
      dispatchDashboardStyleUpdated(99);
    });

    expect(result.current).toBe(0);
  });

  it("should return 0 when dashboard id is missing", () => {
    const { result } = renderHook(() =>
      useDashboardDomReadyStyleRevision(null),
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(DASHBOARD_STYLE_UPDATED_EVENT, {
          detail: { dashboardId: "12" },
        }),
      );
    });

    expect(result.current).toBe(0);
  });
});
