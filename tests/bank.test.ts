import { describe, it, expect } from "vitest";
import { mergePayment, whatsappLink, hasBankDetails, DEFAULT_PAYMENT } from "@/lib/bank";

describe("bank / payment", () => {
  it("mergePayment overlays stored values over defaults", () => {
    const p = mergePayment({ bankName: "الراجحي", iban: "SA1234" });
    expect(p.bankName).toBe("الراجحي");
    expect(p.iban).toBe("SA1234");
    expect(p.whatsapp).toBe(DEFAULT_PAYMENT.whatsapp);
  });

  it("mergePayment ignores non-objects", () => {
    expect(mergePayment(null)).toEqual(DEFAULT_PAYMENT);
    expect(mergePayment(42)).toEqual(DEFAULT_PAYMENT);
  });

  it("hasBankDetails is true only when an IBAN or account number exists", () => {
    expect(hasBankDetails({ ...DEFAULT_PAYMENT, iban: "" })).toBe(false);
    expect(hasBankDetails({ ...DEFAULT_PAYMENT, iban: "SA00" })).toBe(true);
    expect(hasBankDetails({ ...DEFAULT_PAYMENT, accountNumber: "123" })).toBe(true);
  });

  it("whatsappLink builds a wa.me link for valid numbers and null otherwise", () => {
    expect(whatsappLink("مرحبا", "966512345678")).toBe("https://wa.me/966512345678?text=" + encodeURIComponent("مرحبا"));
    expect(whatsappLink("hi", "+966 51 234 5678")).toContain("https://wa.me/966512345678");
    expect(whatsappLink("hi", "123")).toBeNull(); // too short
    expect(whatsappLink("hi", "")).toBeNull();
  });
});
