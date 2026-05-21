import { DashboardLayout } from "../../components/Layout/DashboardLayout";

export default function DashboardGroup({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
