"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, CreditCard, Download, Receipt, X } from "lucide-react";

export default function PaymentsPage() {
  const { t } = useI18n();
  const [payments, setPayments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    amount: 25000,
    payment_method: "cash",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [payRes, patRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/patients"),
      ]);
      const payJson = await payRes.json();
      const patJson = await patRes.json();

      setPayments(payJson.data || []);
      setTotalCollected(payJson.totalCollected || 0);
      setPatients(patJson.data || []);

      if (patJson.data?.length > 0) {
        setFormData((prev) => ({ ...prev, patient_id: patJson.data[0].id }));
      }
    } catch {
      // Fallback
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      await loadData();
      setIsModalOpen(false);
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  }

  function handleExportCSV() {
    const headers = ["رقم الإيصال", "اسم المريض", "المبلغ", "العملة", "طريقة الدفع", "التاريخ"];
    const rows = payments.map((p) => [
      p.reference_number,
      p.patient_name,
      p.amount,
      p.currency,
      p.payment_method,
      new Date(p.payment_date).toLocaleDateString("ar-IQ"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mediflow-payments-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navPayments")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              سجل المتحصلات والمدفوعات، وإصدار الإيصالات والتقارير المالية
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              <span>تصدير CSV</span>
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>{t("recordPayment")}</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("totalRevenue")}
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCollected)}</div>
              <p className="text-xs text-muted-foreground mt-1">مجموع المقبوضات النقدية والمصرفية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                عدد الإيصالات الصادرة
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">إيصالات دفع مؤكدة</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">سجل الإيصالات المالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground border-b">
                  <tr>
                    <th className="py-3 px-4 text-start font-medium">{t("receiptNumber")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("patientName")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("amount")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("paymentMethod")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("paymentDate")}</th>
                    <th className="py-3 px-4 text-start font-medium">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-primary">
                        {p.reference_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {p.patient_name}
                      </td>
                      <td className="py-3 px-4 font-bold text-teal-600">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {p.payment_method === "cash"
                            ? t("cash")
                            : p.payment_method === "card"
                            ? t("card")
                            : t("bankTransfer")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(p.payment_date).toLocaleDateString("ar-IQ", { dateStyle: "medium" })}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {p.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Record Payment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-2xl border shadow-xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 end-5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4">{t("recordPayment")}</h2>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">{t("patientName")} *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">{t("amount")} (IQD) *</label>
                  <Input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">{t("paymentMethod")} *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                  >
                    <option value="cash">{t("cash")}</option>
                    <option value="card">{t("card")}</option>
                    <option value="bank_transfer">{t("bankTransfer")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">ملاحظات الإيصال</label>
                  <Input
                    placeholder="دفعة كشف أو أشعة..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t("loading") : t("confirm")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
