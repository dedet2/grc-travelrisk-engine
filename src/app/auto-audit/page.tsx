import type { Metadata } from "next";
import AutoAuditComponent from "./Component";

export const metadata: Metadata = {
  title: "AI Equity Audit | Incluu AI Risk Platform",
  description: "Run the Enhanced AI Equity Assessment — a 5-module deep audit of your AI systems for bias, compliance, and governance risk.",
};

export default function AutoAuditPage() {
  return <AutoAuditComponent />;
}
