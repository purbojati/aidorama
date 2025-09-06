import { isNewerVersion, compareVersions } from "@/lib/version";

describe("Version utilities", () => {
  describe("compareVersions", () => {
    it("should compare versions correctly", () => {
      expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
      expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
      expect(compareVersions("1.0.1", "1.0.0")).toBe(1);
      expect(compareVersions("1.1.0", "1.0.9")).toBe(1);
      expect(compareVersions("2.0.0", "1.9.9")).toBe(1);
    });
  });

  describe("isNewerVersion", () => {
    it("should detect newer versions correctly", () => {
      expect(isNewerVersion("1.0.0", "1.0.1")).toBe(true);
      expect(isNewerVersion("1.0.1", "1.0.0")).toBe(false);
      expect(isNewerVersion("1.0.0", "1.0.0")).toBe(false);
      expect(isNewerVersion("0.4.0", "0.5.0")).toBe(true);
      expect(isNewerVersion("0.5.0", "0.4.0")).toBe(false);
    });
  });
});
