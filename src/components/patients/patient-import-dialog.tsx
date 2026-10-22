"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface PatientImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

interface ParsedRow {
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: "male" | "female";
  admin_notes?: string;
  isValid: boolean;
  validationError?: string;
}

export function PatientImportDialog({ isOpen, onClose, onImportSuccess }: PatientImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    skippedCount: number;
    errors: Array<{ row: number; name: string; phone: string; reason: string }>;
  } | null>(null);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      processSelectedFile(selected);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  }

  async function processSelectedFile(selectedFile: File) {
    setFile(selectedFile);
    setErrorMsg("");
    setImportResult(null);
    setIsProcessingFile(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (rawData.length === 0) {
        setErrorMsg("الملف فارغ ولا يحتوي على أي صفوف بيانات.");
        setIsProcessingFile(false);
        return;
      }

      // Map dynamic header names (supports Arabic & English synonyms)
      const mapped: ParsedRow[] = rawData.map((row) => {
        const findField = (synonyms: string[]) => {
          for (const key of Object.keys(row)) {
            const cleanKey = key.trim().toLowerCase();
            if (synonyms.some((s) => cleanKey.includes(s.toLowerCase()))) {
              return String(row[key]).trim();
            }
          }
          return "";
        };

        const name = findField(["اسم", "الاسم", "name", "full_name", "patient"]);
        const phone = findField(["هاتف", "الهاتف", "موبايل", "جوال", "phone", "mobile", "tel"]);
        const email = findField(["بريد", "ايميل", "email", "mail"]);
        const dob = findField(["ميلاد", "تاريخ الميلاد", "dob", "birth", "date_of_birth"]);
        const genderRaw = findField(["جنس", "الجنس", "gender", "sex"]).toLowerCase();
        const notes = findField(["ملاحظات", "ملاحظة", "notes", "note", "history", "admin_notes"]);

        let gender: "male" | "female" = "male";
        if (genderRaw.includes("أنثى") || genderRaw.includes("انثى") || genderRaw === "female" || genderRaw === "f") {
          gender = "female";
        }

        const isValid = Boolean(name && phone);
        let validationError = "";
        if (!name) validationError = "اسم المريض مفقود";
        else if (!phone) validationError = "رقم الهاتف مفقود";

        return {
          full_name: name,
          phone,
          email,
          date_of_birth: dob,
          gender,
          admin_notes: notes || "مستورد من ملف",
          isValid,
          validationError,
        };
      });

      setParsedRows(mapped);
    } catch (err: any) {
      setErrorMsg("تعذر قراءة الملف. تأكد من أن الملف بصيغة Excel أو CSV صحيحة: " + err?.message);
    } finally {
      setIsProcessingFile(false);
    }
  }

  async function handleConfirmImport() {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg("لا توجد سجلات صالحة للاستيراد في الملف.");
      return;
    }

    setIsImporting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/patients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patients: validRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "فشل تنفيذ الاستيراد");
        setIsImporting(false);
        return;
      }

      setImportResult({
        importedCount: data.importedCount,
        skippedCount: data.skippedCount,
        errors: data.errors || [],
      });
      onImportSuccess();
    } catch {
      setErrorMsg("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsImporting(false);
    }
  }

  function downloadTemplate() {
    const templateData = [
      {
        "الاسم الكامل (مطلوب)": "علي حسن الكرخي",
        "رقم الهاتف (مطلوب)": "07701234567",
        "تاريخ الميلاد": "1990-05-14",
        "الجنس (ذكر/أنثى)": "ذكر",
        "البريد الإلكتروني": "ali@example.com",
        "ملاحظات طبية أو إدارية": "مريض سكري ومتابع منتظم",
      },
      {
        "الاسم الكامل (مطلوب)": "سارة كريم العبيدي",
        "رقم الهاتف (مطلوب)": "07719876543",
        "تاريخ الميلاد": "1994-11-20",
        "الجنس (ذكر/أنثى)": "أنثى",
        "البريد الإلكتروني": "sara@example.com",
        "ملاحظات طبية أو إدارية": "حساسية من الأسبرين",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المرضى");
    XLSX.writeFile(wb, "نموذج_استيراد_المرضى_MediFlow.xlsx");
  }

  function resetState() {
    setFile(null);
    setParsedRows([]);
    setImportResult(null);
    setErrorMsg("");
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-2xl border shadow-2xl p-6 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 text-muted-foreground hover:text-foreground p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">استيراد سجلات المرضى السابقين</h2>
            <p className="text-xs text-muted-foreground">
              رفع ملف Excel أو CSV لتحديث قاعدة بيانات العيادة ومزامنة المرضى
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {importResult && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>اكتملت عملية الاستيراد بنجاح!</span>
            </div>
            <p className="text-xs">
              تمت إضافة <strong>{importResult.importedCount}</strong> مريض جديد إلى العيادة.
              {importResult.skippedCount > 0 && (
                <span> تم تخطي <strong>{importResult.skippedCount}</strong> سجل (أرقام هواتف مسجلة مسبقاً أو بيانات ناقصة).</span>
              )}
            </p>
            {importResult.errors.length > 0 && (
              <details className="text-[11px] mt-2 cursor-pointer">
                <summary className="font-semibold text-emerald-700 underline">عرض تفاصيل السجلات التي تم تخطيها ({importResult.errors.length})</summary>
                <ul className="mt-1.5 list-disc list-inside space-y-1 text-muted-foreground bg-card/60 p-2.5 rounded-lg border">
                  {importResult.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>
                      صف {err.row}: <strong>{err.name}</strong> ({err.phone}) — {err.reason}
                    </li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>... والمزيد ({importResult.errors.length - 5} سجلات أخرى)</li>
                  )}
                </ul>
              </details>
            )}
            <div className="pt-2 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={resetState}>
                استيراد ملف آخر
              </Button>
              <Button size="sm" onClick={onClose}>
                إغلاق والعودة للسجل
              </Button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!importResult && (
          <>
            {/* Step 1: Upload Dropzone & Template Download */}
            {!file && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-8 text-center bg-secondary/20 transition-all flex flex-col items-center justify-center cursor-pointer relative"
                >
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">اسحب ملف Excel أو CSV وأفلته هنا</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    يدعم ملفات (.xlsx, .xls, .csv) مع التعرف التلقائي على الأعمدة العربية والإنجليزية
                  </p>
                  <Button size="sm" variant="outline" className="pointer-events-none">
                    اختر ملف من جهازك
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Download className="w-4 h-4 text-primary" />
                    <span>للحصول على أفضل نتيجة، يمكنك تحميل نموذج Excel الجاهز وتعبئته:</span>
                  </div>
                  <Button size="sm" variant="secondary" onClick={downloadTemplate} className="gap-1.5 h-8">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تحميل نموذج Excel</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Preview & Validation Table */}
            {file && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-xs text-foreground">{file.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetState} className="text-xs h-7 gap-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>تغيير الملف</span>
                  </Button>
                </div>

                {isProcessingFile ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    جاري قراءة وتحليل بيانات الملف...
                  </div>
                ) : (
                  <>
                    {/* Summary badges */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-medium text-muted-foreground">إجمالي السجلات: {parsedRows.length}</span>
                      <Badge variant="success">صالحة للاستيراد: {validCount}</Badge>
                      {invalidCount > 0 && (
                        <Badge variant="destructive">غير صالحة: {invalidCount}</Badge>
                      )}
                    </div>

                    {/* Preview Table */}
                    <div className="max-h-64 overflow-y-auto rounded-xl border">
                      <table className="w-full text-xs text-start">
                        <thead className="bg-secondary/60 text-muted-foreground sticky top-0 border-b">
                          <tr>
                            <th className="py-2 px-3 text-start">الحالة</th>
                            <th className="py-2 px-3 text-start">اسم المريض</th>
                            <th className="py-2 px-3 text-start">رقم الهاتف</th>
                            <th className="py-2 px-3 text-start">الميلاد</th>
                            <th className="py-2 px-3 text-start">الجنس</th>
                            <th className="py-2 px-3 text-start">ملاحظات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {parsedRows.slice(0, 15).map((row, idx) => (
                            <tr key={idx} className={row.isValid ? "hover:bg-muted/40" : "bg-destructive/5"}>
                              <td className="py-2 px-3">
                                {row.isValid ? (
                                  <Badge variant="success" className="text-[10px] py-0">صالح</Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-[10px] py-0" title={row.validationError}>
                                    خطأ: {row.validationError}
                                  </Badge>
                                )}
                              </td>
                              <td className="py-2 px-3 font-semibold text-foreground">
                                {row.full_name || <span className="text-destructive">مفقود</span>}
                              </td>
                              <td className="py-2 px-3 font-mono" dir="ltr">
                                {row.phone || <span className="text-destructive">مفقود</span>}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground">{row.date_of_birth || "—"}</td>
                              <td className="py-2 px-3 text-muted-foreground">
                                {row.gender === "female" ? "أنثى" : "ذكر"}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground truncate max-w-[150px]">
                                {row.admin_notes || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedRows.length > 15 && (
                      <p className="text-[11px] text-muted-foreground text-center">
                        يتم عرض أول 15 صفاً من أصل {parsedRows.length} صفاً موجوداً في الملف.
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <Button variant="outline" onClick={onClose} disabled={isImporting}>
                        إلغاء
                      </Button>
                      <Button
                        onClick={handleConfirmImport}
                        disabled={isImporting || validCount === 0}
                        className="gap-2 bg-primary hover:bg-primary/90"
                      >
                        {isImporting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري الاستيراد...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>تأكيد استيراد ({validCount}) مريض</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
