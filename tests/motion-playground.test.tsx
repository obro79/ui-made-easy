import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { MotionPlayground } from "../src/components/MotionPlayground"
import { createThemeFromPreset, type ThemeConfig } from "../src/theme"

function Harness() {
  const [config, setConfig] = useState<ThemeConfig>(() => createThemeFromPreset("minimalism"))
  return <><MotionPlayground config={config} onChange={(patch) => setConfig((current) => ({ ...current, ...patch }))} /><output data-testid="motion-state">{config.motionPreset}|{config.motionSpeed}|{config.loadingStyle}</output></>
}

describe("motion playground", () => {
  it("selects motion, speed, and loading recipes through visible controls", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole("radio", { name: /Spring/ }))
    await user.click(screen.getByRole("button", { name: "Slow" }))
    await user.click(screen.getByRole("radio", { name: /Orbit/ }))
    expect(screen.getByTestId("motion-state")).toHaveTextContent("spring|slow|orbit")
    expect(screen.getByText(/Reduced motion is supported/)).toBeInTheDocument()
  })

  it("replays the live overlay without changing the selected recipe", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const preview = screen.getByRole("button", { name: "Preview" })
    await user.click(preview)
    await user.click(preview)
    expect(screen.getByLabelText("Fade overlay preview")).toBeInTheDocument()
  })
})
