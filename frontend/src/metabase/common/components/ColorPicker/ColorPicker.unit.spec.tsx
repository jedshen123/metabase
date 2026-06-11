import userEvent from "@testing-library/user-event";
import Color from "color";
import { useState } from "react";

import { render, screen, within } from "__support__/ui";

import { ColorPicker } from "./ColorPicker";

const TestColorPicker = () => {
  const [value, setValue] = useState("white");
  const handleChange = (value?: string) => setValue(value ?? "white");

  return <ColorPicker value={value} onChange={handleChange} />;
};

describe("ColorPicker", () => {
  it("should input a color inline", async () => {
    render(<TestColorPicker />);

    const color = Color.rgb(0, 0, 0);
    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, color.hex());

    expect(screen.getByLabelText(color.hex())).toBeInTheDocument();
  });

  it("should input a color in a popover", async () => {
    render(<TestColorPicker />);
    await userEvent.click(screen.getByLabelText("white"));

    const color = Color.rgb(0, 0, 0);
    const tooltip = await screen.findByRole("tooltip");
    const input = within(tooltip).getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, color.hex());

    expect(screen.getByLabelText(color.hex())).toBeInTheDocument();
  });

  it("should close the popover when double-clicking the color controls", async () => {
    render(<TestColorPicker />);
    await userEvent.click(screen.getByLabelText("white"));

    const tooltip = await screen.findByRole("tooltip");
    // eslint-disable-next-line testing-library/no-node-access -- react-color saturation surface has no stable role
    const saturation = tooltip.querySelector(".saturation-white");

    expect(saturation).toBeTruthy();

    await userEvent.dblClick(saturation as Element);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
