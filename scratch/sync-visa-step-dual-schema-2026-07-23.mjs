import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase environment is not configured.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const auditTimestamp = new Date().toISOString();
const sourceDate = "2026-07-23";
const performedByName = "Codex (authorized by user)";

const cases = [
  {
    caseNumber: "JAZ-26-00002",
    sourceFile: "AL-OBAIDI SHATHA (2).pdf",
    applicationDate: "2026-06-22",
    feeIqdEstimate: 138000,
    insurancePremium: 28.5,
    insuranceSubscriptionDate: "2026-06-12",
    insuranceTransactionId: "Z3JLNXLGCKLC7CZ3",
    insuranceValidityDays: 19,
  },
  {
    caseNumber: "JAZ-26-00003",
    sourceFile: "AL-HAKAM TAWFEEQ (2).pdf",
    applicationDate: "2026-06-18",
    feeIqdEstimate: 138000,
    insurancePremium: 16.5,
    insuranceSubscriptionDate: "2026-07-12",
    insuranceTransactionId: "QSPRJWVHVP4GT2Q9",
    insuranceValidityDays: 11,
  },
  {
    caseNumber: "JAZ-26-00010",
    sourceFile: "BLAND-DAROKA (1).pdf",
    applicationDate: "2026-07-07",
    feeIqdEstimate: 134500,
    insurancePremium: 15,
    insuranceSubscriptionDate: "2026-07-11",
    insuranceTransactionId: "MR6S2VDMGVLS7ZF3",
    insuranceValidityDays: 10,
  },
  {
    caseNumber: "JAZ-26-00012",
    sourceFile: "HADEER ALSALIHI (1).pdf",
    applicationDate: "2026-07-12",
    feeIqdEstimate: 134500,
    insurancePremium: 12,
    insuranceSubscriptionDate: "2026-07-13",
    insuranceTransactionId: "N4FNLGPVGD228GX3",
    insuranceValidityDays: 8,
  },
  {
    caseNumber: "JAZ-26-00016",
    sourceFile: "HUSSEIN ISAWI.pdf",
    applicationDate: "2026-06-18",
    feeIqdEstimate: 138000,
    insurancePremium: 16.5,
    insuranceSubscriptionDate: "2026-07-12",
    insuranceTransactionId: "TT3835GGBRJW44G6",
    insuranceValidityDays: 11,
  },
  {
    caseNumber: "JAZ-26-00011",
    sourceFile: "KAREEM DURAYE (1).pdf",
    applicationDate: "2026-06-20",
    feeIqdEstimate: 138000,
    insurancePremium: 31.5,
    insuranceSubscriptionDate: "2026-07-11",
    insuranceTransactionId: "SXMJKV6TGD228GX3",
    insuranceValidityDays: 21,
  },
  {
    caseNumber: "JAZ-26-00013",
    sourceFile: "LUAY AL-SAJRI (1).pdf",
    applicationDate: "2026-06-22",
    feeIqdEstimate: 138000,
    insurancePremium: 30,
    insuranceSubscriptionDate: "2026-07-11",
    insuranceTransactionId: "HTRM8LDC29NQMHG3",
    insuranceValidityDays: 20,
  },
  {
    caseNumber: "JAZ-2026-00001",
    sourceFile: "MIRAN-AKRAM (2).pdf",
    applicationDate: "2026-06-22",
    feeIqdEstimate: 138000,
    insurancePremium: 30,
    insuranceSubscriptionDate: "2026-07-13",
    insuranceTransactionId: "WXQT3BNH99C499Z3",
    insuranceValidityDays: 20,
  },
  {
    caseNumber: "JAZ-26-00014",
    sourceFile: "MOHAMMEDKHUDHAIRALI-ALSHAMARTI (1).pdf",
    applicationDate: "2026-07-01",
    feeIqdEstimate: 134500,
    insurancePremium: 12,
    insuranceSubscriptionDate: "2026-07-01",
    insuranceTransactionId: "KDJ833HXKM58S2Z3",
    insuranceValidityDays: 8,
  },
  {
    caseNumber: "JAZ-26-00004",
    sourceFile: "MUAYAD JABBOOREE.pdf",
    applicationDate: "2026-06-18",
    feeIqdEstimate: 138000,
    insurancePremium: 16.5,
    insuranceSubscriptionDate: "2026-07-12",
    insuranceTransactionId: "HJK8Q8B8BPP8G4G3",
    insuranceValidityDays: 11,
  },
  {
    caseNumber: "JAZ-26-00015",
    sourceFile: "TAHSEEN ABD ALMUHSEN (1).pdf",
    applicationDate: "2026-06-18",
    feeIqdEstimate: 138000,
    insurancePremium: 16.5,
    insuranceSubscriptionDate: "2026-07-12",
    insuranceTransactionId: "C6XDZTBJ6Z3TB7Z3",
    insuranceValidityDays: 11,
  },
];

const appointmentCenterAddress =
  "14th Ramadan Street, Alwan Building, 5th Floor, Al Mansoor, Baghdad, Iraq";

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function present(value) {
  return (
    value !== null &&
    value !== undefined &&
    !(typeof value === "string" && value.trim() === "")
  );
}

async function requireData(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

function buildSourceSnapshot(spec, registration) {
  const ad = isObject(registration.additional_data)
    ? registration.additional_data
    : {};
  const fd = isObject(registration.form_data) ? registration.form_data : {};

  return {
    source_file: spec.sourceFile,
    source_review_date: sourceDate,
    application: {
      application_date: spec.applicationDate,
      recorded_by_france_visas: true,
      application_reference: ad.visa_reference,
      destination_country: ad.visa_destination_country,
      visa_type: ad.visa_type,
      purpose: ad.visa_purpose,
      entries_requested: "Multiple",
      lodgement_channel: "Service provider",
      lodgement_provider: "TLScontact Baghdad",
      platform: "France-Visas",
      travel_start_date: ad.travel_start_date,
      travel_end_date: ad.travel_end_date,
      previous_schengen_visa: fd.previous_schengen_visa,
      previous_schengen_visa_number:
        ad.previous_schengen_visa_number ?? null,
      other_residence_permit: fd.other_residence_permit,
      fee: {
        amount: 90,
        currency: "EUR",
        iqd_estimate: spec.feeIqdEstimate,
      },
    },
    appointment: {
      booked: true,
      booking_status: ad.visa_appointment_status,
      group_number: ad.visa_appointment_ref_number,
      date: ad.visa_appointment_date,
      time: ad.visa_appointment_time,
      timezone: "Asia/Baghdad",
      center: ad.visa_appointment_center,
      city: "Baghdad",
      address: appointmentCenterAddress,
      channel: "TLScontact",
    },
    insurance: {
      insurer: "Mutuaide",
      broker: "Insurte",
      product: "Basic Lite",
      policy_number: ad.insurance_policy_number,
      subscription_date: spec.insuranceSubscriptionDate,
      transaction_id: spec.insuranceTransactionId,
      start_date: ad.insurance_start_date,
      end_date: ad.insurance_end_date,
      validity_days: spec.insuranceValidityDays,
      departure_country: "Iraq",
      arrival_country: "France",
      residence_country: "Iraq",
      premium_amount: spec.insurancePremium,
      premium_currency: "EUR",
      medical_coverage_amount: 30000,
      medical_coverage_currency: "EUR",
      deductible_amount: 30,
      deductible_currency: "EUR",
      travel_date_conflict: Boolean(ad.insurance_travel_date_conflict),
    },
    source_pages: {
      visa_application_form: "1-6",
      tls_appointment: "7",
      travel_insurance: "8-10",
    },
  };
}

function buildAdditionalData(spec, registration, sourceSnapshot) {
  const current = isObject(registration.additional_data)
    ? registration.additional_data
    : {};
  const documentsFound = Array.isArray(current.documents_found)
    ? current.documents_found
    : [];
  const documentsUncertain = Array.isArray(current.documents_uncertain)
    ? current.documents_uncertain
    : [];
  const previousSchengenVisa =
    registration.form_data?.previous_schengen_visa ?? null;
  const missingDocuments = [
    "passport_copy",
    "travel_booking",
    "hotel_booking",
    ...(!documentsFound.includes("company_letter")
      ? ["company_letter"]
      : []),
    ...(previousSchengenVisa === true
      ? ["previous_schengen_visa"]
      : []),
  ];
  const notApplicableDocuments = [
    "residence_permit",
    ...(previousSchengenVisa === false
      ? ["previous_schengen_visa"]
      : []),
  ];
  const completionBlockers = [
    ...missingDocuments.map((documentType) => ({
      category: "missing_document",
      document_type: documentType,
      resolution: `Upload a verified ${documentType} source document.`,
    })),
    ...(current.insurance_travel_date_conflict
      ? [
          {
            category: "insurance_travel_date_conflict",
            resolution:
              "Provide corrected insurance or authoritative corrected travel dates.",
          },
        ]
      : []),
    {
      category: "payment_evidence_missing",
      resolution: "Add payment evidence when payment is collected.",
    },
    {
      category: "delivery_evidence_missing",
      resolution: "Add delivery evidence after passport/visa delivery.",
    },
  ];
  const legacyEmbassy = isObject(registration.embassy_application)
    ? registration.embassy_application
    : null;

  const historicalSnapshot = Object.prototype.hasOwnProperty.call(
    current,
    "visa_legacy_embassy_application_before_sync",
  )
    ? current.visa_legacy_embassy_application_before_sync
    : legacyEmbassy && Object.keys(legacyEmbassy).length
      ? legacyEmbassy
      : null;

  return {
    ...current,
    travel_purpose: current.visa_purpose,
    visa_application_date: spec.applicationDate,
    visa_application_recorded_date: spec.applicationDate,
    visa_application_number: current.visa_reference,
    visa_application_status: "reference_obtained",
    visa_application_lodged_at: "Service provider",
    visa_application_lodgement_provider: "TLScontact Baghdad",
    visa_entries_requested: "Multiple",
    visa_embassy: "Embassy of France in Iraq",
    visa_embassy_city: "Baghdad",
    visa_platform: "France-Visas",
    visa_submission_method: "TLScontact",
    visa_portal_status: "Created",
    visa_app_ref_number: current.visa_reference,
    visa_portal_app_status: "Completed",
    visa_portal_email_status: "not_available_in_supplied_source",
    visa_portal_password_status: "not_available_in_supplied_source",
    visa_account_evidence:
      "France-Visas registration receipt and booked TLScontact appointment are present.",
    visa_appointment_channel: "TLScontact",
    visa_appointment_city: "Baghdad",
    visa_appointment_center_address: appointmentCenterAddress,
    visa_appointment_timezone: "Asia/Baghdad",
    tls_group_number: current.visa_appointment_ref_number,
    previous_schengen_visa:
      registration.form_data?.previous_schengen_visa ?? null,
    other_residence_permit:
      registration.form_data?.other_residence_permit ?? null,
    insurance_insurer: "Mutuaide",
    insurance_broker: "Insurte",
    insurance_product: "Basic Lite",
    insurance_subscription_date: spec.insuranceSubscriptionDate,
    insurance_transaction_id: spec.insuranceTransactionId,
    insurance_validity_days: spec.insuranceValidityDays,
    insurance_premium_amount: spec.insurancePremium,
    insurance_premium_currency: "EUR",
    insurance_coverage_amount: 30000,
    insurance_coverage_currency: "EUR",
    insurance_deductible_amount: 30,
    insurance_deductible_currency: "EUR",
    visa_application_fee_amount: 90,
    visa_application_fee_currency: "EUR",
    visa_application_fee_iqd_estimate: spec.feeIqdEstimate,
    documents_found: documentsFound,
    documents_missing: missingDocuments,
    documents_uncertain: documentsUncertain,
    documents_not_applicable: notApplicableDocuments,
    document_stage_readiness: "blocked_missing_source_documents",
    payment_evidence_status: "not_available_in_supplied_source",
    delivery_evidence_status: "not_available_in_supplied_source",
    highest_verified_step: 4,
    workflow_completion_status: "blocked",
    completion_blockers: completionBlockers,
    visa_source_snapshot: sourceSnapshot,
    visa_legacy_embassy_application_before_sync: historicalSnapshot,
    visa_unverified_fields: [
      "visa_portal_email",
      "visa_portal_password",
      "visa_decision",
      "visa_decision_date",
    ],
    visa_data_schema_sync: {
      synced_at: auditTimestamp,
      synced_by: performedByName,
      source_backed: true,
      storage_models: ["additional_data", "embassy_application"],
      legacy_values_preserved: Boolean(historicalSnapshot),
    },
  };
}

function buildEmbassyApplication(spec, registration, sourceSnapshot) {
  const current = isObject(registration.embassy_application)
    ? registration.embassy_application
    : {};
  const ad = registration.additional_data;
  const documentsFound = Array.isArray(ad.documents_found)
    ? ad.documents_found
    : [];
  const requirements = [
    { key: "flight", label: "حجز تذاكر الطيران", done: false },
    { key: "hotel", label: "حجز الفندق", done: false },
    { key: "passport_copy", label: "نسخة الجواز", done: false },
    {
      key: "visa_application_form",
      label: "استمارة طلب الفيزا",
      done: documentsFound.includes("visa_application_form"),
    },
    {
      key: "invitation_letter",
      label: "رسالة الدعوة",
      done: documentsFound.includes("invitation_letter"),
    },
    {
      key: "tls_appointment",
      label: "تأكيد موعد TLS",
      done: documentsFound.includes("tls_appointment"),
    },
    {
      key: "travel_insurance",
      label: "تأمين السفر",
      done: documentsFound.includes("travel_insurance"),
    },
    {
      key: "badge",
      label: "بطاقة المؤتمر",
      done: documentsFound.includes("badge"),
    },
    {
      key: "company_letter",
      label: "كتاب الشركة",
      done: documentsFound.includes("company_letter"),
    },
    ...(registration.form_data?.previous_schengen_visa === true
      ? [
          {
            key: "previous_schengen_visa",
            label: "إثبات تأشيرة شنغن السابقة",
            done: false,
          },
        ]
      : []),
  ];

  return {
    ...current,
    destination_country: "France",
    france_visas_account_status: "activated",
    tls_account_status: "activated",
    account_setup_complete: true,
    france_visas_number: ad.visa_reference,
    application_reference: ad.visa_reference,
    application_start_date: spec.applicationDate,
    application_status: "reference_obtained",
    application_lodgement_channel: "service_provider",
    application_lodgement_provider: "TLScontact Baghdad",
    visa_type: ad.visa_type,
    visa_purpose: ad.visa_purpose,
    entries_requested: "Multiple",
    platform: "TLS",
    france_visas_platform: "France-Visas",
    embassy: "Embassy of France in Iraq",
    embassy_city: "Baghdad",
    submission_method: "TLScontact",
    tls_appointment_date: `${ad.visa_appointment_date}T${ad.visa_appointment_time}:00+03:00`,
    appointment_date: ad.visa_appointment_date,
    appointment_time: ad.visa_appointment_time,
    appointment_timezone: "Asia/Baghdad",
    tls_center: ad.visa_appointment_center,
    appointment_center: ad.visa_appointment_center,
    appointment_city: "Baghdad",
    appointment_center_address: appointmentCenterAddress,
    appointment_reference: ad.visa_appointment_ref_number,
    appointment_status: ad.visa_appointment_status,
    appointment_booked: true,
    reference_number: ad.visa_reference,
    requirements,
    status: "appointment_booked",
    travel_start_date: ad.travel_start_date,
    travel_end_date: ad.travel_end_date,
    previous_schengen_visa:
      registration.form_data?.previous_schengen_visa ?? null,
    previous_schengen_visa_number:
      ad.previous_schengen_visa_number ?? null,
    other_residence_permit:
      registration.form_data?.other_residence_permit ?? null,
    visa_approved: null,
    visa_decision_date: null,
    visa_decision_status: "not_available_in_supplied_source",
    insurance_company: "Mutuaide / Insurte",
    insurance_insurer: "Mutuaide",
    insurance_broker: "Insurte",
    insurance_product: "Basic Lite",
    insurance_policy_number: ad.insurance_policy_number,
    insurance_subscription_date: spec.insuranceSubscriptionDate,
    insurance_transaction_id: spec.insuranceTransactionId,
    insurance_coverage_start: ad.insurance_start_date,
    insurance_coverage_end: ad.insurance_end_date,
    insurance_validity_days: spec.insuranceValidityDays,
    insurance_amount: 30000,
    insurance_amount_currency: "EUR",
    insurance_premium_amount: spec.insurancePremium,
    insurance_premium_currency: "EUR",
    insurance_deductible_amount: 30,
    insurance_deductible_currency: "EUR",
    insurance_travel_date_conflict: Boolean(
      ad.insurance_travel_date_conflict,
    ),
    visa_application_fee_amount: 90,
    visa_application_fee_currency: "EUR",
    visa_application_fee_iqd_estimate: spec.feeIqdEstimate,
    portal_email_status: "not_available_in_supplied_source",
    portal_password_status: "not_available_in_supplied_source",
    source_snapshot: sourceSnapshot,
    notes:
      "Visa data synchronized from the supplied France-Visas form, TLScontact confirmation, and insurance certificate. No visa decision or portal credentials were present in the supplied source.",
    data_sync: {
      synced_at: auditTimestamp,
      synced_by: performedByName,
      source_backed: true,
    },
  };
}

async function synchronizeCase(spec) {
  const registration = await requireData(
    await supabase
      .from("registrations")
      .select(
        "id,case_number,status,case_status,current_step,form_data,additional_data,embassy_application",
      )
      .eq("case_number", spec.caseNumber)
      .single(),
    `load ${spec.caseNumber}`,
  );

  if (
    registration.status === "cancelled" ||
    registration.case_status === "cancelled_duplicate"
  ) {
    throw new Error(`${spec.caseNumber} is not an active primary case.`);
  }

  const requiredExisting = [
    "visa_reference",
    "visa_destination_country",
    "visa_type",
    "visa_purpose",
    "travel_start_date",
    "travel_end_date",
    "visa_appointment_date",
    "visa_appointment_time",
    "visa_appointment_ref_number",
    "visa_appointment_status",
    "visa_appointment_center",
    "insurance_policy_number",
    "insurance_start_date",
    "insurance_end_date",
  ];
  const missingExisting = requiredExisting.filter(
    (key) => !present(registration.additional_data?.[key]),
  );
  if (missingExisting.length) {
    throw new Error(
      `${spec.caseNumber} is missing source-backed prerequisites: ${missingExisting.join(", ")}`,
    );
  }

  const sourceSnapshot = buildSourceSnapshot(spec, registration);
  const additionalData = buildAdditionalData(
    spec,
    registration,
    sourceSnapshot,
  );
  const embassyApplication = buildEmbassyApplication(
    spec,
    registration,
    sourceSnapshot,
  );

  await requireData(
    await supabase
      .from("registrations")
      .update({
        additional_data: additionalData,
        embassy_application: embassyApplication,
        updated_at: auditTimestamp,
      })
      .eq("id", registration.id),
    `sync ${spec.caseNumber}`,
  );

  const priorLog = await requireData(
    await supabase
      .from("registration_events")
      .select("id")
      .eq("registration_id", registration.id)
      .eq("action", "visa_data_dual_schema_sync")
      .limit(1),
    `check audit event ${spec.caseNumber}`,
  );

  if (!priorLog.length) {
    await requireData(
      await supabase.from("registration_events").insert({
        registration_id: registration.id,
        action: "visa_data_dual_schema_sync",
        description:
          "Authorized source-backed Visa-stage synchronization across current and legacy storage models.",
        performed_by: null,
        performed_by_name: performedByName,
        metadata: {
          source_date: sourceDate,
          source_file: spec.sourceFile,
          current_model: "additional_data",
          legacy_model: "embassy_application",
          portal_credentials_in_source: false,
          visa_decision_in_source: false,
          historical_values_preserved: Boolean(
            additionalData.visa_legacy_embassy_application_before_sync,
          ),
        },
      }),
      `log ${spec.caseNumber}`,
    );
  }

  return {
    caseNumber: spec.caseNumber,
    registrationId: registration.id,
    sourceSnapshot,
  };
}

const results = [];
for (const spec of cases) {
  results.push(await synchronizeCase(spec));
}

const currentRequired = [
  "visa_destination_country",
  "visa_embassy",
  "visa_type",
  "visa_platform",
  "visa_submission_method",
  "visa_portal_status",
  "visa_app_ref_number",
  "visa_portal_app_status",
  "visa_appointment_channel",
  "visa_appointment_center",
  "visa_appointment_city",
  "visa_appointment_date",
  "visa_appointment_time",
  "visa_appointment_ref_number",
  "visa_appointment_status",
  "visa_application_date",
  "visa_entries_requested",
  "insurance_policy_number",
  "insurance_start_date",
  "insurance_end_date",
  "insurance_coverage_amount",
  "insurance_premium_amount",
  "insurance_subscription_date",
  "insurance_transaction_id",
  "visa_source_snapshot",
];

const legacyRequired = [
  "platform",
  "reference_number",
  "requirements",
  "status",
  "destination_country",
  "france_visas_account_status",
  "tls_account_status",
  "account_setup_complete",
  "france_visas_number",
  "application_start_date",
  "application_status",
  "tls_appointment_date",
  "tls_center",
  "appointment_reference",
  "appointment_booked",
  "insurance_company",
  "insurance_policy_number",
  "insurance_coverage_start",
  "insurance_coverage_end",
  "insurance_amount",
  "source_snapshot",
];

const verification = [];
for (const result of results) {
  const registration = await requireData(
    await supabase
      .from("registrations")
      .select(
        "id,case_number,current_step,additional_data,embassy_application",
      )
      .eq("id", result.registrationId)
      .single(),
    `verify ${result.caseNumber}`,
  );
  const missingCurrent = currentRequired.filter(
    (key) => !present(registration.additional_data?.[key]),
  );
  const missingLegacy = legacyRequired.filter(
    (key) => !present(registration.embassy_application?.[key]),
  );
  const referenceMatches =
    registration.additional_data?.visa_reference ===
      registration.additional_data?.visa_app_ref_number &&
    registration.additional_data?.visa_reference ===
      registration.embassy_application?.france_visas_number;
  const appointmentMatches =
    registration.additional_data?.visa_appointment_ref_number ===
    registration.embassy_application?.appointment_reference;

  verification.push({
    case_number: registration.case_number,
    current_step: registration.current_step,
    current_schema_missing: missingCurrent,
    legacy_schema_missing: missingLegacy,
    reference_matches: referenceMatches,
    appointment_matches: appointmentMatches,
    historical_values_preserved: Boolean(
      registration.additional_data
        ?.visa_legacy_embassy_application_before_sync,
    ),
  });
}

const allVerified = verification.every(
  (item) =>
    item.current_schema_missing.length === 0 &&
    item.legacy_schema_missing.length === 0 &&
    item.reference_matches &&
    item.appointment_matches,
);

console.log(
  JSON.stringify(
    {
      all_verified: allVerified,
      checked: verification.length,
      verification,
    },
    null,
    2,
  ),
);

if (!allVerified) process.exitCode = 1;
