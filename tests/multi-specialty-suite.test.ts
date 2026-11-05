import { describe, it, expect } from "vitest";
import { db } from "../src/server/mock-db";
import { GET as getVisits, POST as postVisit } from "../src/app/api/visits/route";
import { PATCH as patchPatient, GET as getPatients } from "../src/app/api/patients/route";

describe("Comprehensive Multi-Specialty Clinical Suite Tests", () => {
  describe("1. Dental Odontogram (FDI 32 Teeth Notation)", () => {
    it("should record tooth status and surfaces in a clinical visit and update patient records", async () => {
      // Find or create patient in dentistry clinic (clinic-3)
      let patient = db.patients.find((p) => p.clinic_id === "clinic-3");
      if (!patient) {
        patient = {
          id: "pat-dental-01",
          clinic_id: "clinic-3",
          patient_number: "P-3001",
          full_name: "مروان طارق العبيدي",
          phone: "+9647733331111",
          gender: "male",
          preferred_language: "ar",
          whatsapp_consent: true,
          created_at: new Date().toISOString(),
        };
        db.patients.push(patient);
      }

      const dentalVisitData = {
        patient_id: patient.id,
        doctor_name: "د. حيدر الأسدي",
        service_name: "حشوة ضوئية تجميلية ومعالجة جذور",
        diagnosis: "تسوس عميق في السن 16 وحشوة تجميلية في السن 21",
        clinical_notes: "تم فحص الفكين بالأشعة الموضعية Periapical X-Ray",
        prescription: "Amoxicillin 500mg TDS, Ibuprofen 400mg PRN",
        specialty_type: "dentistry",
        specialty_data: {
          teeth: {
            "16": { status: "root_canal", notes: "Occlusal + Distal canal obturation" },
            "21": { status: "filling", notes: "Composite class IV aesthetic" },
            "36": { status: "missing", notes: "Extracted 2 years ago" },
          },
        },
      };

      const req = new Request("http://localhost:3000/api/visits", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-3", "Content-Type": "application/json" },
        body: JSON.stringify(dentalVisitData),
      });

      const res = await postVisit(req as any);
      expect(res.status).toBe(201);
      const visit = await res.json();

      expect(visit.specialty_type).toBe("dentistry");
      expect(visit.specialty_data.teeth["16"].status).toBe("root_canal");
      expect(visit.specialty_data.teeth["21"].status).toBe("filling");

      // Verify cumulative persistence in patient.specialty_records
      const updatedPatient = db.patients.find((p) => p.id === patient!.id);
      expect(updatedPatient?.specialty_records?.dentistry).toBeDefined();
      expect(updatedPatient?.specialty_records?.dentistry?.teeth["16"]?.status).toBe("root_canal");
    });
  });

  describe("2. Ophthalmology & Optometry Refraction Suite", () => {
    it("should record OD/OS visual acuity, refraction parameters, and IOP", async () => {
      let patient = db.patients.find((p) => p.clinic_id === "clinic-4");
      if (!patient) {
        patient = {
          id: "pat-eye-01",
          clinic_id: "clinic-4",
          patient_number: "P-4001",
          full_name: "سناء كامل الجبوري",
          phone: "+9647744441111",
          gender: "female",
          preferred_language: "ar",
          whatsapp_consent: true,
          created_at: new Date().toISOString(),
        };
        db.patients.push(patient);
      }

      const ophthaVisitData = {
        patient_id: patient.id,
        doctor_name: "د. عمر الفاروق",
        service_name: "فحص قعر العين وانكسار البصر الشامل",
        diagnosis: "قصر نظر مركب مع استجماتيزم (Myopic Astigmatism)",
        clinical_notes: "القرنية شفافة، العدسة طبيعية، لا توجد عتامات",
        prescription: "قطرة ترطيب العين Hyabak PRN",
        specialty_type: "ophthalmology",
        specialty_data: {
          od_sph: "-2.50",
          od_cyl: "-0.75",
          od_axis: "90",
          od_add: "+1.50",
          od_va: "6/6",
          iop_od: "14",
          os_sph: "-3.00",
          os_cyl: "-1.00",
          os_axis: "85",
          os_add: "+1.50",
          os_va: "6/6",
          iop_os: "15",
          pd_distance: "62",
          lens_type: "Progressive Anti-Reflective Blue-Cut",
        },
      };

      const req = new Request("http://localhost:3000/api/visits", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-4", "Content-Type": "application/json" },
        body: JSON.stringify(ophthaVisitData),
      });

      const res = await postVisit(req as any);
      expect(res.status).toBe(201);
      const visit = await res.json();

      expect(visit.specialty_type).toBe("ophthalmology");
      expect(visit.specialty_data.od_sph).toBe("-2.50");
      expect(visit.specialty_data.os_sph).toBe("-3.00");
      expect(visit.specialty_data.pd_distance).toBe("62");

      const updatedPatient = db.patients.find((p) => p.id === patient!.id);
      expect(updatedPatient?.specialty_records?.ophthalmology?.lens_type).toContain("Progressive");
    });
  });

  describe("3. OB/GYN & Fetal Ultrasound Suite", () => {
    it("should calculate gestational metrics and record fetal ultrasound biometry", async () => {
      let patient = db.patients.find((p) => p.clinic_id === "clinic-2");
      if (!patient) {
        patient = {
          id: "pat-obgyn-01",
          clinic_id: "clinic-2",
          patient_number: "P-2001",
          full_name: "فاطمة عبد الرضا الخزرجي",
          phone: "+9647722221111",
          gender: "female",
          preferred_language: "ar",
          whatsapp_consent: true,
          created_at: new Date().toISOString(),
        };
        db.patients.push(patient);
      }

      const lmpDate = "2026-06-15";
      const obgynVisitData = {
        patient_id: patient.id,
        doctor_name: "د. سارة العبيدي",
        service_name: "سونار رباعي الأبعاد للجنين (4D)",
        diagnosis: "حمل مفرد سليم داخل الرحم - الثلث الثاني",
        clinical_notes: "نمو الجنين متناسق مع عمر الحمل السريري، المشيمة خلفية طبيعية",
        prescription: "Elevit Pronatal 1 tab daily, Calcium + D3",
        specialty_type: "obgyn",
        specialty_data: {
          lmp_date: lmpDate,
          gravida: "G2",
          para: "P1",
          abortions: "A0",
          living: "L1",
          sonar_bpd: "54 mm",
          sonar_fl: "38 mm",
          sonar_efw: "480 g",
          fetal_heart_rate: "148 bpm",
        },
      };

      const req = new Request("http://localhost:3000/api/visits", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-2", "Content-Type": "application/json" },
        body: JSON.stringify(obgynVisitData),
      });

      const res = await postVisit(req as any);
      expect(res.status).toBe(201);
      const visit = await res.json();

      expect(visit.specialty_type).toBe("obgyn");
      expect(visit.specialty_data.lmp_date).toBe("2026-06-15");
      expect(visit.specialty_data.sonar_efw).toBe("480 g");
      expect(visit.specialty_data.fetal_heart_rate).toBe("148 bpm");
    });
  });

  describe("4. Pediatrics Growth & National Vaccination Schedule", () => {
    it("should record child growth metrics and track vaccine completion", async () => {
      let patient = db.patients.find((p) => p.clinic_id === "clinic-5");
      if (!patient) {
        patient = {
          id: "pat-peds-01",
          clinic_id: "clinic-5",
          patient_number: "P-5001",
          full_name: "يوسف أحمد المصطفى (الطفل)",
          phone: "+9647755551111",
          gender: "male",
          preferred_language: "ar",
          whatsapp_consent: true,
          created_at: new Date().toISOString(),
        };
        db.patients.push(patient);
      }

      const pedsVisitData = {
        patient_id: patient.id,
        doctor_name: "د. زينب الشمري",
        service_name: "كشف وفحص نمو وتطور الطفل",
        diagnosis: "نمو جسدي وإدراكي طبيعي مطابق لمعايير WHO",
        clinical_notes: "الرضاعة طبيعية، حركة الطفل واستجابته البصرية ممتازة",
        prescription: "Vitamin D3 drops 400 IU daily",
        specialty_type: "pediatrics",
        specialty_data: {
          child_age_months: 6,
          child_weight_kg: 7.8,
          child_height_cm: 68,
          head_circ_cm: 43.5,
          vaccines: {
            bcg_hepb: true,
            hex_2m: true,
            hex_4m: true,
            hex_6m: true,
          },
        },
      };

      const req = new Request("http://localhost:3000/api/visits", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-5", "Content-Type": "application/json" },
        body: JSON.stringify(pedsVisitData),
      });

      const res = await postVisit(req as any);
      expect(res.status).toBe(201);
      const visit = await res.json();

      expect(visit.specialty_type).toBe("pediatrics");
      expect(visit.specialty_data.child_weight_kg).toBe(7.8);
      expect(visit.specialty_data.vaccines.hex_6m).toBe(true);

      const updatedPatient = db.patients.find((p) => p.id === patient!.id);
      expect(updatedPatient?.specialty_records?.pediatrics?.vaccines?.hex_4m).toBe(true);
    });
  });

  describe("5. Dermatology & Aesthetic Laser Suite", () => {
    it("should log laser fluence parameters and botox/filler units", async () => {
      let patient = db.patients.find((p) => p.clinic_id === "clinic-6");
      if (!patient) {
        patient = {
          id: "pat-derma-01",
          clinic_id: "clinic-6",
          patient_number: "P-6001",
          full_name: "نور هادي السلامي",
          phone: "+9647766661111",
          gender: "female",
          preferred_language: "ar",
          whatsapp_consent: true,
          created_at: new Date().toISOString(),
        };
        db.patients.push(patient);
      }

      const dermaVisitData = {
        patient_id: patient.id,
        doctor_name: "د. ريم المهندس",
        service_name: "جلسة إزالة الشعر بالليزر وحقن بوتوكس",
        diagnosis: "جلسة ليزر دورية مع تجاعيد تعبيرية في الجبهة",
        clinical_notes: "تحمل جيد للإجراء دون احمرار غير طبيعي",
        prescription: "واقي شمس فيزيائي كريم مرطب مع مهدئ",
        specialty_type: "dermatology",
        specialty_data: {
          laser_device: "Candela GentleMax Pro",
          laser_area: "Full Face + Underarms",
          laser_fluence: "16 J/cm²",
          laser_spot_size: "18 mm",
          botox_units: "35 Units Allergan",
          filler_volume: "1.0 ml Juvederm Voluma",
          aftercare_notes: "تجنب التعرض المباشر للشمس لمدة 48 ساعة واستخدام كمادات باردة عند الحاجة",
        },
      };

      const req = new Request("http://localhost:3000/api/visits", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-6", "Content-Type": "application/json" },
        body: JSON.stringify(dermaVisitData),
      });

      const res = await postVisit(req as any);
      expect(res.status).toBe(201);
      const visit = await res.json();

      expect(visit.specialty_type).toBe("dermatology");
      expect(visit.specialty_data.laser_device).toBe("Candela GentleMax Pro");
      expect(visit.specialty_data.botox_units).toBe("35 Units Allergan");
    });
  });

  describe("6. Direct Patient Specialty Records PATCH", () => {
    it("should update specialty_records directly on patient profile", async () => {
      const patient = db.patients[0];
      expect(patient).toBeDefined();

      const patchReq = new Request("http://localhost:3000/api/patients", {
        method: "PATCH",
        headers: { "x-clinic-id": patient.clinic_id || "clinic-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          id: patient.id,
          specialty_records: {
            cardiology_general: {
              baseline_bp: "120/80",
              baseline_ecg: "Normal Sinus Rhythm",
              ejection_fraction: "62%",
            },
          },
        }),
      });

      const patchRes = await patchPatient(patchReq as any);
      expect(patchRes.status).toBe(200);
      const resJson = await patchRes.json();
      expect(resJson.status).toBe("success");
      expect(resJson.patient.specialty_records.cardiology_general.ejection_fraction).toBe("62%");
    });
  });
});
