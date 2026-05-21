import { apiClient } from "./client";
import type { Invoice, Project, ProofRecord, ProofType } from "@/lib/store";

export type DashboardResponse = {
  success: boolean;
  project: Project;
  templateType: ProofType;
  meta: {
    pageTitle: string;
    label: string;
    metricTitles: string[];
    metricValues: string[];
    chartTitle: string;
    chartSubtitle: string;
    chartType: "area" | "bar";
    assetUnit: string;
    protocol: string;
  };
  chartSeries: { t: string; a: number; b: number }[];
  proofs: ProofRecord[];
  accountCredits: number;
};

export async function fetchProjects() {
  const { data } = await apiClient.get<{
    success: boolean;
    projects: Project[];
    accountCredits: number;
  }>("/projects");
  return data;
}

export async function createProject(body: {
  name: string;
  owner: string;
  templateType: ProofType;
  status?: string;
}) {
  const { data } = await apiClient.post<{ success: boolean; project: Project }>("/projects", body);
  return data;
}

export async function fetchDashboard(projectId: string) {
  const { data } = await apiClient.get<DashboardResponse>(`/dashboard/${projectId}`);
  return data;
}

export async function verifyProof(body: {
  projectId: string;
  proofId?: string;
  name?: string;
  ticker?: string;
  amount?: string;
  txHash?: string;
  merkleRoot?: string;
  forceStatus?: string;
}) {
  const { data } = await apiClient.post("/proofs/verify", body);
  return data;
}

export async function fetchInvoices() {
  const { data } = await apiClient.get<{
    success: boolean;
    invoices: Invoice[];
    accountCredits: number;
  }>("/billing/invoices");
  return data;
}

export async function topUpProject(body: { projectId: string; amount: number; txHash: string }) {
  const { data } = await apiClient.post("/billing/topup", body);
  return data;
}

export async function payInvoice(body: { invoiceId: string; txHash: string }) {
  const { data } = await apiClient.post("/billing/pay-invoice", body);
  return data;
}
