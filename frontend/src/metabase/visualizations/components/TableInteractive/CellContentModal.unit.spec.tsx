import { renderWithProviders, screen } from "__support__/ui";

import { CellContentModal } from "./CellContentModal";

describe("CellContentModal", () => {
  it("renders both copy buttons", () => {
    renderWithProviders(
      <CellContentModal
        parsedValue={{ path: "/api/v1/dashboard" }}
        rawValue='{"path":"/api/v1/dashboard"}'
        opened
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByTestId("cell-content-modal")).toBeInTheDocument();
    expect(screen.getByTestId("copy-original-button")).toHaveTextContent(
      "Copy original",
    );
    expect(screen.getByTestId("copy-formatted-button")).toHaveTextContent(
      "Copy formatted",
    );
  });
});
