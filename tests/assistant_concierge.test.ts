import { describe, it, expect } from "vitest";

describe("Academic Concierge Bot Assistant ('Levy')", () => {
  it("handles platform FAQ queries with zero-cost instant answers", async () => {
    const { POST } = await import("../src/app/api/assistant/chat/route");
    const req = new Request("http://localhost:3000/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "How do you verify instructors and tutors?" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("FAQ");
    expect(data.reply).toContain("4-step compliance audit");
    expect(data.chips).toBeDefined();
    expect(data.chips.length).toBeGreaterThan(0);
  });

  it("matches subject inquiries with verified instructors and mini cards", async () => {
    const { POST } = await import("../src/app/api/assistant/chat/route");
    const req = new Request("http://localhost:3000/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "I want physics tutor" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("MATCH");
    expect(data.reply).toContain("verified instructors");
    expect(data.instructors).toBeDefined();
    expect(Array.isArray(data.instructors)).toBe(true);
    expect(data.instructors.length).toBeGreaterThan(0);
    expect(data.instructors[0].name).toBeDefined();
    expect(data.instructors[0].hourlyRate).toBeGreaterThan(0);
  });
});
