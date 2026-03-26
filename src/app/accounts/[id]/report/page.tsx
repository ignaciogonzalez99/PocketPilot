import { AccountReportContent } from "@/components/accounts/account-report-content";

export default async function AccountReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountReportContent accountId={id} />;
}
