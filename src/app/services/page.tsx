"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Clock, Stethoscope, X, Edit3, Trash2, CheckCircle2 } from "lucide-react";

export default function ServicesPage() {
  const { t } = useI18n();
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    duration_minutes: 30,
    price: 25000,
  });

  const [editFormData, setEditFormData] = useState({
    name_ar: "",
    name_en: "",
    duration_minutes: 30,
    price: 25000,
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await fetch("/api/services");
      const json = await res.json();
      setServices(json.data || []);
    } catch {
      // Fallback
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      await fetchServices();
      setIsModalOpen(false);
      setFormData({ name_ar: "", name_en: "", duration_minutes: 30, price: 25000 });
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenEditService(srv: any) {
    setEditingService(srv);
    setEditFormData({
      name_ar: srv.name_ar,
      name_en: srv.name_en,
      duration_minutes: srv.duration_minutes,
      price: srv.price,
      is_active: srv.is_active,
    });
    setIsEditModalOpen(true);
  }

  async function handleUpdateService(e: React.FormEvent) {
    e.preventDefault();
    if (!editingService) return;
    setIsLoading(true);
    try {
      await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingService.id,
          ...editFormData,
        }),
      });
      await fetchServices();
      setIsEditModalOpen(false);
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة من قائمة الأسعار؟")) return;
    try {
      await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      await fetchServices();
    } catch {
      // Error
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navServices")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              قائمة الخدمات الطبية، أوقات الفحص، والأسعار المعتمدة للحجز التلقائي
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>{t("addService")}</span>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((srv) => (
            <Card key={srv.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <Badge variant={srv.is_active ? "success" : "outline"}>
                  {srv.is_active ? t("active") : t("inactive")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div>
                  <h3 className="font-bold text-base text-foreground">{srv.name_ar}</h3>
                  <p className="text-xs text-muted-foreground font-sans" dir="ltr">
                    {srv.name_en}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{srv.duration_minutes} دقيقة</span>
                  </div>
                  <div className="font-bold text-primary">
                    {formatCurrency(srv.price, srv.currency)}
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-end gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEditService(srv)}
                    className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1 font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteService(srv.id)}
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    title="حذف الخدمة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Service Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-2xl border shadow-xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 end-5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4">{t("addService")}</h2>

              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">{t("serviceNameAr")} *</label>
                  <Input
                    required
                    placeholder="مثال: فحص دوري شامل..."
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">{t("serviceNameEn")}</label>
                  <Input
                    placeholder="e.g. Comprehensive Checkup"
                    dir="ltr"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1">{t("price")} (IQD) *</label>
                    <Input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">{t("durationMinutes")}</label>
                    <Input
                      type="number"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t("loading") : t("save")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit Service Modal */}
        {isEditModalOpen && editingService && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-2xl border shadow-xl p-6 relative">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-5 end-5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4">تعديل الخدمة الطبية</h2>

              <form onSubmit={handleUpdateService} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">{t("serviceNameAr")} *</label>
                  <Input
                    required
                    value={editFormData.name_ar}
                    onChange={(e) => setEditFormData({ ...editFormData, name_ar: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">{t("serviceNameEn")}</label>
                  <Input
                    dir="ltr"
                    value={editFormData.name_en}
                    onChange={(e) => setEditFormData({ ...editFormData, name_en: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1">{t("price")} (IQD) *</label>
                    <Input
                      type="number"
                      required
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">{t("durationMinutes")}</label>
                    <Input
                      type="number"
                      required
                      value={editFormData.duration_minutes}
                      onChange={(e) => setEditFormData({ ...editFormData, duration_minutes: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="srv_active_toggle"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="srv_active_toggle" className="text-xs font-medium cursor-pointer">
                    الخدمة نشطة ومتاحة للحجز التلقائي
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isLoading ? t("loading") : "حفظ التعديلات"}</span>
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
