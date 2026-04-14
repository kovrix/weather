import { parseLocationInput } from "@/features/weather/model/validation";

describe("locationSchema", () => {
  it("trims whitespace on valid input", () => {
    const result = parseLocationInput("  Lisbon  ");

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toBe("Lisbon");
    }
  });

  it("rejects empty input", () => {
    const result = parseLocationInput("   ");

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Location is required.");
    }
  });

  it("rejects obviously invalid characters", () => {
    const result = parseLocationInput("@@@");

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Enter a valid city or region name.",
      );
    }
  });
});
