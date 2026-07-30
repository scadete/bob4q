import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";

// Smoke test — verifies the test infra works
describe("test setup", () => {
  it("renders a div", () => {
    render(<div data-testid="hello">hello</div>);
    expect(screen.getByTestId("hello")).toBeTruthy();
  });
});
