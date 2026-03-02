import type { Metadata } from "next";
import BillingComponent from "./Component";

export const metadata: Metadata = {
  title: "Billing & Plans | Incluu AI Risk Platform",
  description: "Manage your subscription, upgrade your plan, or explore professional advisory add-ons.",
};

export default function BillingPage() {
  return <BillingComponent />;
}
