"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import { toast } from "sonner";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { createClient } from "@/lib/supabase/client";
import {
  IRAQI_GOVERNORATES,
  PLACE_OF_BIRTH_CITIES as placeOfBirthCitiesByCountry,
  PLACE_OF_BIRTH_COUNTRIES as placeOfBirthCountries,
  VISA_DOCUMENTS,
  VISA_ROUTES,
} from "./wizard-constants";
import {
  normalizePreviousSchengenVisas,
  normalizeRegistrationDocuments,
  normalizeResidencePermit,
  getEmailValidation,
  getPhoneValidation,
} from "./wizard-helpers";
import type {
  RegistrationEvent,
  VisaAppointmentReminder,
  VisaDocumentDefinition,
} from "./wizard-types";
import type { ClientSearchForm, StepStatus, WizardModel } from "./wizard-model";
import { buildClientResidencyPatch, buildClientSnapshot } from "./wizard-snapshots";
import { buildClientReceiptPdf, buildCompanyReceiptPdf, buildPackageCoverPdf, loadLogoDataUrl, mergeDocumentsIntoPdf } from "./wizard-pdf";
import { REGISTRATION_STEPS } from "./registration-progress";
import { WizardView } from "./wizard-view";
import { sanitizeEnglishText } from "@/lib/english-only";
import { hasExactPermission } from "@/lib/permissions";
import {
  continueWithClientAction,
  createNewClientAndApplication,
  deleteRegistrationDocument,
  recordRegistrationActivity,
  revealVisaPortalPassword,
  saveVisaPortalPassword,
  searchClientsWithMatchingScore,
  updateClientData,
} from "../../actions";
import { uploadRegistrationDocumentDirect } from "../../registration-document-upload";

const normalizeWorkCity = (value: unknown) => {
  const raw = sanitizeEnglishText(String(value || "")).trim();
  const normalized = raw.replace(/\s+governorate$/i, "").trim();
  return IRAQI_GOVERNORATES.find((city) => city.toLowerCase() === normalized.toLowerCase()) || raw;
};

// --- Types ---
// Shape of rows coming from the drift_events table (filtered by the parent
// page to `is_active = true` AND `status = 'active'`). Keep this in sync with
// progress-dashboard-client.tsx and supabase/migrations/015.
interface Event {
  id: string;
  title: string;
  title_ar: string | null;
  date: string | null;
  end_date: string | null;
  country: string | null;
  country_ar: string | null;
  location: string | null;
  location_ar: string | null;
  sector: string | null;
  event_type?: string | null;
  status?: string | null;
  organizer?: string | null;
  registration_config: any;
  conference_config?: any;
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
}

interface WizardClientProps {
  events: Event[];
  employees: Employee[];
  initialRegistrationId?: string;
  initialStep?: number;
  currentUser: any;
  onClose?: () => void;
}

export function WizardClient({ events, employees, initialRegistrationId, initialStep = 1, currentUser, onClose }: WizardClientProps) {
  const supabase = useMemo(() => createClient(), []);
  const canEditFeeBreakdown = hasExactPermission(currentUser?.role, "/dashboard/participation-cases/work/payment", Array.isArray(currentUser?.permissions) ? currentUser.permissions : null);

  // --- State ---
  const [step, setStep] = useState<number>(initialStep);
  const [registrationId, setRegistrationId] = useState<string | undefined>(initialRegistrationId);
  const [caseNumber, setCaseNumber] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Step 1 Search inputs
  const [searchForm, setSearchForm] = useState<ClientSearchForm>({
    fullName: "",
    surname: "",
    salutation: "",
    gender: "",
    maritalStatus: "",
    passportNumber: "",
    nationalId: "",
    phone: "",
    email: "",
    companyName: "",
    companySpecialty: "",
    dateOfBirth: "",
    placeOfBirthCountry: "",
    placeOfBirthCity: "",
    placeOfBirth: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    jobTitle: "",
    department: "",
    workCity: "",
    workPhone: "",
    workEmail: "",
    residenceCountry: "Iraq",
    previousSchengenVisa: false,
    previousSchengenVisas: [],
    hasOtherResidencePermit: false,
    otherResidenceCountry: "",
    otherResidenceNumber: "",
    otherResidenceIssueDate: "",
    otherResidenceExpiryDate: "",
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPotentialMatch, setSelectedPotentialMatch] = useState<any>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("IQ");
  const [workPhoneCountry, setWorkPhoneCountry] = useState<CountryCode>("IQ");
  const [showDocumentImport, setShowDocumentImport] = useState(false);
  const [documentImportType, setDocumentImportType] = useState<"passport" | "national-id">("passport");
  const [documentImportFile, setDocumentImportFile] = useState<File | null>(null);
  const [documentImportText, setDocumentImportText] = useState("");
  const [isImportingDocument, setIsImportingDocument] = useState(false);
  const [ocrHighlightedFields, setOcrHighlightedFields] = useState<string[]>([]);
  const [importedClientDocuments, setImportedClientDocuments] = useState<Partial<Record<"passport" | "national-id", File>>>({});
  const [companySpecialtyOther, setCompanySpecialtyOther] = useState("");
  const [workCityOther, setWorkCityOther] = useState("");
  const [workCityIsOther, setWorkCityIsOther] = useState(false);
  const [jobTitleOther, setJobTitleOther] = useState("");
  const [jobTitleIsOther, setJobTitleIsOther] = useState(false);

  const processImportedDocument = async () => {
    setIsImportingDocument(true);
    try {
      // Keep the original file for the application record even when OCR
      // cannot read it (for example, a PDF that needs manual review).
      if (documentImportFile) {
        setImportedClientDocuments((current) => ({ ...current, [documentImportType]: documentImportFile }));
      }
      if (documentImportType === "national-id") {
        let source = documentImportText || "";
        if (!source && documentImportFile) {
          if (!documentImportFile.type.startsWith("image/")) throw new Error("PDF processing will be enabled with the OCR document adapter.");
          const form = new FormData();
          form.append("image", documentImportFile);
          const response = await fetch("/api/passport-ocr", { method: "POST", body: form });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Could not read National ID.");
          source = result.rawText || "";
        }
        const nationalId = source.match(/\d{12}/)?.[0] || "";
        if (!nationalId) throw new Error("National ID must contain 12 digits.");
        setSearchForm((current) => ({ ...current, nationalId }));
        setOcrHighlightedFields(["nationalId"]);
        toast.success("National ID updated.");
      } else {
        if (documentImportText.trim()) {
          const lines = documentImportText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
          const mrz = lines.find((line) => line.startsWith("P<"));
          const nextLine = mrz ? lines[lines.indexOf(mrz) + 1] : "";
          const passportNumber = nextLine?.slice(0, 9).replace(/</g, "") || "";
          const dateOfBirth = nextLine?.slice(13, 19) || "";
          const dateOfExpiry = nextLine?.slice(21, 27) || "";
          setSearchForm((current) => ({ ...current, passportNumber: passportNumber || current.passportNumber, dateOfBirth: dateOfBirth || current.dateOfBirth, passportExpiryDate: dateOfExpiry || current.passportExpiryDate }));
          setOcrHighlightedFields(["passportNumber", "dateOfBirth", "passportExpiryDate"]);
          toast.success("Passport fields updated from pasted text.");
        } else if (documentImportFile) {
          if (!documentImportFile.type.startsWith("image/")) throw new Error("PDF processing will be enabled with the OCR document adapter.");
          const form = new FormData();
          form.append("image", documentImportFile);
          const response = await fetch("/api/passport-ocr", { method: "POST", body: form });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Could not read passport.");
          const fields = result.fields || {};
          if (!String(fields.surname || "").trim()) {
            toast.warning("The surname could not be extracted completely. Review it and enter it manually.");
          }
          const fullBirthPlace = String(fields.place_of_birth || "").trim();
          const birthPlaceParts = fullBirthPlace
            .split(/\s*(?:,|-|–|—)\s*/)
            .map((part: string) => part.trim())
            .filter(Boolean);
          const rawBirthCity = birthPlaceParts.length > 1
            ? birthPlaceParts[birthPlaceParts.length - 1]
            : birthPlaceParts[0] || "";
          const birthCity = rawBirthCity.toLowerCase().replace(/\b\w/g, (letter: string) => letter.toUpperCase());
          const rawBirthCountry = String(fields.country_of_birth || fields.issuing_country || fields.nationality || "")
            .trim()
            .toUpperCase();
          const countryCodeAliases: Record<string, string> = { IRQ: "IQ", USA: "US", GBR: "GB", ARE: "AE", DEU: "DE", FRA: "FR", ITA: "IT", TUR: "TR" };
          const normalizedBirthCountry = countryCodeAliases[rawBirthCountry] || rawBirthCountry;
          const birthCountry = placeOfBirthCountries.find((country) => country.code === normalizedBirthCountry || country.label.toUpperCase() === rawBirthCountry)?.code || "";
          const birthCountryLabel = placeOfBirthCountries.find((country) => country.code === birthCountry)?.label || birthCountry;
          const availableBirthCities = placeOfBirthCitiesByCountry[birthCountry] || [];
          const normalizedCityText = birthCity.toLowerCase().replace(/\s+governorate$/i, "").trim();
          const matchedBirthCity = availableBirthCities.find((city: string) => {
            const normalizedCity = city.toLowerCase();
            return normalizedCity === normalizedCityText || normalizedCityText.startsWith(`${normalizedCity} `);
          }) || "";
          setSearchForm((current) => ({
            ...current,
            fullName: fields.given_names || current.fullName,
            surname: fields.surname || current.surname,
            passportNumber: fields.passport_number || current.passportNumber,
            gender: fields.sex === "M" || fields.sex === "F" ? (fields.sex === "M" ? "Male" : "Female") : current.gender,
            dateOfBirth: fields.date_of_birth || current.dateOfBirth,
            placeOfBirthCountry: birthCountry || current.placeOfBirthCountry,
            placeOfBirthCity: matchedBirthCity || current.placeOfBirthCity,
            // Keep the complete place exactly as OCR read it. The country and
            // city fields remain normalized for the searchable selectors.
            placeOfBirth: fullBirthPlace || (birthCountryLabel && birthCity ? `${birthCountryLabel}, ${birthCity}` : current.placeOfBirth),
            passportIssueDate: fields.date_of_issue || current.passportIssueDate,
            passportExpiryDate: fields.date_of_expiry || current.passportExpiryDate,
          }));
          setOcrHighlightedFields(["fullName", "surname", "passportNumber", "gender", "dateOfBirth", "placeOfBirthCountry", "placeOfBirthCity", "passportIssueDate", "passportExpiryDate"]);
          toast.success("Passport fields updated from OCR.");
        } else throw new Error("Choose a file or paste document text first.");
      }
      if (documentImportFile) {
        setImportedClientDocuments((current) => ({ ...current, [documentImportType]: documentImportFile }));
      }
      setShowDocumentImport(false);
      setDocumentImportFile(null);
      setDocumentImportText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Document processing failed.");
    } finally {
      setIsImportingDocument(false);
    }
  };

  async function persistImportedClientDocuments(regId: string) {
    const uploads = [
      { file: importedClientDocuments.passport, type: "passport_copy", label: "Passport, Visa & Residence" },
      { file: importedClientDocuments["national-id"], type: "national_id", label: "National ID" },
    ].filter((entry): entry is { file: File; type: string; label: string } => Boolean(entry.file));

    if (uploads.length === 0) return;

    for (const upload of uploads) {
      try {
        const result = await uploadRegistrationDocumentDirect(regId, upload.file, upload.type, upload.label);
        if (result.error) {
          console.error("Document upload failed:", result.error);
          toast.warning(`Client created, but failed to upload ${upload.label}: ${result.error}. You can re-upload it manually.`);
        }
      } catch (err) {
        console.error("Document upload error:", err);
        toast.warning(`Client created, but error uploading ${upload.label}.`);
      }
    }

    setImportedClientDocuments({});
    try {
      await loadRegistration(regId);
    } catch (e) {
      console.error("Failed to load registration details:", e);
    }
  }
  const fullNameIsValid = !searchForm.fullName || /^[A-Za-z\s'.-]+$/.test(searchForm.fullName.trim());
  const surnameIsValid = !searchForm.surname || /^[A-Za-z\s'.-]+$/.test(searchForm.surname.trim());
  const passportNumberIsValid = !searchForm.passportNumber || /^[A-Z][0-9]{7,8}$/.test(searchForm.passportNumber);
  const nationalIdIsValid = !searchForm.nationalId || /^[0-9]{12}$/.test(searchForm.nationalId);

  // Current registration data (loaded as we progress)
  const [registration, setRegistration] = useState<any>(null);
  const [client, setClient] = useState<any>(null);

  // Step 2 Intake fields
  const [assignedTo, setAssignedTo] = useState("");
  const [appNotes, setAppNotes] = useState("");

  // Step 3 Event fields
  const [selectedEventId, setSelectedEventId] = useState("");
  const [participationType, setParticipationType] = useState("Business Visitor");
  const [travelPurpose, setTravelPurpose] = useState("Business / Exhibition Attendance");

  // Step 4 Visa platform & appointment fields
  const [visaDestination, setVisaDestination] = useState("");
  const [visaEmbassy, setVisaEmbassy] = useState("");
  const [visaEmbassyCity, setVisaEmbassyCity] = useState("");
  const [visaType, setVisaType] = useState("");
  const [visaPlatform, setVisaPlatform] = useState("");
  const [visaSubmissionMethod, setVisaSubmissionMethod] = useState("");
  const [visaPortalEmail, setVisaPortalEmail] = useState("");
  // The portal password is stored encrypted server-side. The field holds the
  // cleartext only while the user is typing it or after an explicit reveal;
  // `visaPasswordIsStored` tracks whether a saved value exists behind it.
  const [visaPortalPassword, setVisaPortalPassword] = useState("");
  const [visaPasswordIsStored, setVisaPasswordIsStored] = useState(false);
  const [visaPasswordDirty, setVisaPasswordDirty] = useState(false);
  const [isRevealingPassword, setIsRevealingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visaAccountStatus, setVisaAccountStatus] = useState("");
  const [visaAppRefNumber, setVisaAppRefNumber] = useState("");
  const [visaPortalAppStatus, setVisaPortalAppStatus] = useState("");
  const [visaAppointmentChannel, setVisaAppointmentChannel] = useState("");
  const [visaAppointmentCenter, setVisaAppointmentCenter] = useState("");
  const [visaAppointmentCity, setVisaAppointmentCity] = useState("");
  const [visaAppointmentDate, setVisaAppointmentDate] = useState("");
  // Keep this empty until the appointment confirmation/TLS data provides a value.
  const [visaAppointmentTime, setVisaAppointmentTime] = useState("");
  const [visaAppointmentRefNumber, setVisaAppointmentRefNumber] = useState("");
  const [visaAppointmentStatus, setVisaAppointmentStatus] = useState("");
  const [visaReminders, setVisaReminders] = useState<VisaAppointmentReminder[]>([]);
  const [newReminderAt, setNewReminderAt] = useState("");
  const [newReminderNote, setNewReminderNote] = useState("");
  const [visaSaveState, setVisaSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const visaAutosaveBaseline = useRef<string | null>(null);
  const visaAutosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [clientSaveState, setClientSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const clientAutosaveBaseline = useRef<string | null>(null);
  const clientAutosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 5 Document assembly fields
  const [packageName, setPackageName] = useState("");
  const [includeClientInfoInPackage, setIncludeClientInfoInPackage] = useState(true);
  const [packageDocumentPaths, setPackageDocumentPaths] = useState<string[]>([]);
  const [uploadingDocumentType, setUploadingDocumentType] = useState<string | null>(null);
  const [deletingDocumentPath, setDeletingDocumentPath] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<{ type: string; message: string } | null>(null);
  const [isPackageGenerating, setIsPackageGenerating] = useState(false);

  // Step 6 Payment fields
  const [paymentCategory, setPaymentCategory] = useState("Visa Application & Services");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [currency, setCurrency] = useState("USD");
  // Discount is a finance-only per-case adjustment. The actual service prices
  // come from the event (drift_events.registration_config.pricing_items) and are
  // NOT editable per order — they are unified from the event.
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  const [deliveryDocumentPaths, setDeliveryDocumentPaths] = useState<string[]>([]);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("not_sent");

  // Load active registration if initial ID is provided
  useEffect(() => {
    if (registrationId) {
      loadRegistration(registrationId);
    }
  }, [registrationId]);

  // Auto-generate package name in Step 5
  useEffect(() => {
    if (client) {
      const formattedName = (client.full_name_as_passport || "Client").replace(/\s+/g, "_");
      setPackageName(`${formattedName}_Visa_Package.pdf`);
    }
  }, [client]);

  async function loadRegistration(id: string) {
    try {
      const { data: reg, error } = await supabase
        .from("registrations")
        .select(
          `
                    id, event_id, notes, documents, additional_data, created_at,
                    case_number, assigned_employee_id, updated_at,
                    registration_events (performed_by_name, created_at),
                    clients (
                        id, full_name_as_passport, last_name, title_salutation,
                        sex, marital_status, passport_number, national_id,
                        phone, email, employer_name, date_of_birth,
                        place_of_birth, passport_issue_date, passport_expiry_date,
                        job_title, department, work_city, work_governorate, work_phone, work_email,
                        residence_country, previous_schengen_visa,
                        schengen_visas_last_5y, other_residence_permit,
                        professional_specialty
                    )
                `,
        )
        .eq("id", id)
        .single();

      if (error || !reg) {
        toast.error("Could not load the application data.");
        return;
      }

      setRegistration(reg);
      setCaseNumber(reg.case_number || "");
      setAssignedTo(reg.assigned_employee_id || "");
      setAppNotes(sanitizeEnglishText(String(reg.notes || "")).trim());
      if (reg.clients) {
        setClient(reg.clients);
        const cl = reg.clients as any;
        const parsedPhone = cl.phone ? parsePhoneNumberFromString(cl.phone) : null;
        const residencePermit = normalizeResidencePermit(cl.other_residence_permit);
        const companySpecialties = new Set([
          "Construction & Engineering",
          "Manufacturing & Factory",
          "Technology & IT",
          "Healthcare & Pharmaceutical",
          "Education & Training",
          "Finance & Banking",
          "Energy & Utilities",
          "Government Institution",
          "Retail & Trading",
          "Transport & Logistics",
        ]);
        const storedCompanySpecialty = sanitizeEnglishText(String(cl.professional_specialty || "")).trim();
        const storedWorkCity = normalizeWorkCity(cl.work_city || cl.work_governorate);
        const storedPlaceOfBirth = sanitizeEnglishText(String(cl.place_of_birth || "")).trim();
        const storedPreviousVisas = normalizePreviousSchengenVisas(cl.schengen_visas_last_5y).map((visa) => ({
          ...visa,
          country: sanitizeEnglishText(visa.country).trim(),
          visa_number: sanitizeEnglishText(visa.visa_number).trim(),
        }));
        if (parsedPhone?.country) setPhoneCountry(parsedPhone.country);
        setCompanySpecialtyOther(companySpecialties.has(storedCompanySpecialty) ? "" : storedCompanySpecialty);
        setWorkCityIsOther(Boolean(storedWorkCity && !IRAQI_GOVERNORATES.includes(storedWorkCity)));
        setWorkCityOther(IRAQI_GOVERNORATES.includes(storedWorkCity) ? "" : storedWorkCity);
        // Pre-fill editable info
        setSearchForm({
          fullName: sanitizeEnglishText(String(cl.full_name_as_passport || "")).trim(),
          surname: sanitizeEnglishText(String(cl.last_name || "")).trim(),
          salutation: sanitizeEnglishText(String(cl.title_salutation || "")).trim(),
          gender: sanitizeEnglishText(String(cl.sex || "")).trim(),
          maritalStatus: sanitizeEnglishText(String(cl.marital_status || "")).trim(),
          passportNumber: sanitizeEnglishText(String(cl.passport_number || "")).trim(),
          nationalId: sanitizeEnglishText(String(cl.national_id || "")).trim(),
          phone: sanitizeEnglishText(String(parsedPhone?.nationalNumber || cl.phone || "")).trim(),
          email: sanitizeEnglishText(String(cl.email || "")).trim(),
          companyName: sanitizeEnglishText(String(cl.employer_name || "")).trim(),
          companySpecialty: companySpecialties.has(storedCompanySpecialty) ? storedCompanySpecialty : storedCompanySpecialty ? "Other" : "",
          dateOfBirth: cl.date_of_birth || "",
          placeOfBirthCountry: storedPlaceOfBirth.split(", ")[1] ? placeOfBirthCountries.find((country) => country.label === storedPlaceOfBirth.split(", ")[0])?.code || "" : "",
          placeOfBirthCity: storedPlaceOfBirth.split(", ")[1] || "",
          placeOfBirth: storedPlaceOfBirth,
          passportIssueDate: cl.passport_issue_date || "",
          passportExpiryDate: cl.passport_expiry_date || "",
          jobTitle: sanitizeEnglishText(String(cl.job_title || "")).trim(),
          department: sanitizeEnglishText(String(cl.department || "")).trim(),
          workCity: normalizeWorkCity(cl.work_city || cl.work_governorate),
          workPhone: sanitizeEnglishText(String(cl.work_phone || "")).trim(),
          workEmail: sanitizeEnglishText(String(cl.work_email || "")).trim(),
          residenceCountry: sanitizeEnglishText(String(cl.residence_country || "Iraq")).trim() || "Iraq",
          previousSchengenVisa: Boolean(cl.previous_schengen_visa),
          previousSchengenVisas: storedPreviousVisas,
          hasOtherResidencePermit: residencePermit.hasPermit,
          otherResidenceCountry: sanitizeEnglishText(residencePermit.country).trim(),
          otherResidenceNumber: sanitizeEnglishText(residencePermit.number).trim(),
          otherResidenceIssueDate: residencePermit.issueDate,
          otherResidenceExpiryDate: residencePermit.expiryDate,
        });
      }

      // Load saved step inputs if they exist in DB
      if (reg.event_id) setSelectedEventId(reg.event_id);
      const ad = (reg.additional_data as any) || {};
      const storedDocuments = normalizeRegistrationDocuments(reg.documents);
      const storedDeliveryPaths = Array.isArray(ad.delivery_document_paths) ? ad.delivery_document_paths.filter((path: unknown): path is string => typeof path === "string") : storedDocuments.map((document) => document.path);
      setDeliveryDocumentPaths(storedDeliveryPaths);
      setDeliveryMessage(ad.delivery_message || "");
      setDeliveryStatus(ad.delivery_status || "not_sent");
      if (ad.participation_type) setParticipationType(ad.participation_type);
      if (ad.travel_purpose) setTravelPurpose(ad.travel_purpose);

      // Step 4 fields
      if (ad.visa_destination_country) setVisaDestination(ad.visa_destination_country);
      if (ad.visa_embassy) setVisaEmbassy(ad.visa_embassy);
      // The embassy city drives the Embassy/Consulate selector. Older rows only
      // stored the composed `visa_embassy` string, so recover the city from it
      // when the dedicated field is missing.
      if (ad.visa_embassy_city) {
        setVisaEmbassyCity(ad.visa_embassy_city);
      } else if (typeof ad.visa_embassy === "string") {
        const recoveredCity = IRAQI_GOVERNORATES.find((city) => ad.visa_embassy.endsWith(` in ${city}`));
        if (recoveredCity) setVisaEmbassyCity(recoveredCity);
      }
      if (ad.visa_type) setVisaType(ad.visa_type);
      if (ad.visa_platform) setVisaPlatform(ad.visa_platform);
      if (ad.visa_submission_method) setVisaSubmissionMethod(ad.visa_submission_method);
      if (ad.visa_portal_email) setVisaPortalEmail(ad.visa_portal_email);
      // Never hydrate the cleartext password from the case payload — only note
      // that one exists so the field can render a masked placeholder.
      setVisaPasswordIsStored(Boolean(ad.visa_portal_password_encrypted || ad.visa_portal_password));
      setVisaPortalPassword("");
      setVisaPasswordDirty(false);
      setShowPassword(false);
      if (ad.visa_portal_status) setVisaAccountStatus(ad.visa_portal_status);
      if (ad.visa_app_ref_number) setVisaAppRefNumber(ad.visa_app_ref_number);
      if (ad.visa_portal_app_status) setVisaPortalAppStatus(ad.visa_portal_app_status);
      if (ad.visa_appointment_channel) setVisaAppointmentChannel(ad.visa_appointment_channel);
      if (ad.visa_appointment_center) setVisaAppointmentCenter(ad.visa_appointment_center);
      if (ad.visa_appointment_city) setVisaAppointmentCity(ad.visa_appointment_city);
      if (ad.visa_appointment_date) setVisaAppointmentDate(ad.visa_appointment_date);
      if (ad.visa_appointment_time) setVisaAppointmentTime(ad.visa_appointment_time);
      if (ad.visa_appointment_ref_number) setVisaAppointmentRefNumber(ad.visa_appointment_ref_number);
      if (ad.visa_appointment_status) setVisaAppointmentStatus(ad.visa_appointment_status);
      if (Array.isArray(ad.visa_appointment_reminders)) {
        setVisaReminders(
          ad.visa_appointment_reminders.filter((item: unknown): item is VisaAppointmentReminder => {
            if (!item || typeof item !== "object") return false;
            const reminder = item as Partial<VisaAppointmentReminder>;
            return typeof reminder.id === "string" && typeof reminder.remindAt === "string";
          }),
        );
      } else if (ad.visa_reminder_date) {
        // Preserve reminders created before multiple reminders were supported.
        setVisaReminders([
          {
            id: `legacy-${ad.visa_reminder_date}`,
            remindAt: `${ad.visa_reminder_date}T09:00`,
            note: "Appointment reminder",
            sound: true,
          },
        ]);
      }

      // Step 5 fields
      if (typeof ad.package_include_client_info === "boolean") setIncludeClientInfoInPackage(ad.package_include_client_info);
      if (Array.isArray(ad.package_selected_document_paths)) {
        setPackageDocumentPaths(ad.package_selected_document_paths.filter((path: unknown): path is string => typeof path === "string"));
      }
      if (ad.package_assembly_name) setPackageName(ad.package_assembly_name);

      // Step 6 fields
      if (ad.payment_category) setPaymentCategory(ad.payment_category);
      if (ad.payment_method) setPaymentMethod(ad.payment_method);
      if (ad.payment_date) setPaymentDate(ad.payment_date);
      if (typeof ad.payment_notes === "string") setPaymentNotes(ad.payment_notes);
      if (ad.payment_currency === "USD" || ad.payment_currency === "IQD" || ad.payment_currency === "EUR") setCurrency(ad.payment_currency);
      if (typeof ad.discount === "number") setDiscount(ad.discount);
      if (typeof ad.amount_paid === "number") setAmountPaid(ad.amount_paid);

    // Reset client autosave baseline so loading doesn't trigger an immediate save
    clientAutosaveBaseline.current = null;
  } catch (e) {
      console.error(e);
      toast.error("Could not load the application.");
    }
  }

  function populateCompanyInformationFromClient(clientRecord: any) {
    const jobTitle = sanitizeEnglishText(String(clientRecord.job_title || "")).trim();
    const workCity = normalizeWorkCity(clientRecord.work_city || clientRecord.work_governorate);
    const standardJobTitles = new Set(["Shareholder", "Owner", "Managing Director", "Authorized Manager", "General Manager", "Department Manager", "CEO", "CFO", "COO", "Engineer", "Accountant", "Sales Manager"]);
    const standardWorkCities = new Set(IRAQI_GOVERNORATES);
    setJobTitleIsOther(Boolean(jobTitle && !standardJobTitles.has(jobTitle)));
    setJobTitleOther(jobTitle && !standardJobTitles.has(jobTitle) ? jobTitle : "");
    setWorkCityIsOther(Boolean(workCity && !standardWorkCities.has(workCity)));
    setWorkCityOther(workCity && !standardWorkCities.has(workCity) ? workCity : "");
    setSearchForm((current) => ({
      ...current,
      companyName: sanitizeEnglishText(String(clientRecord.employer_name || "")).trim() || current.companyName,
      companySpecialty: sanitizeEnglishText(String(clientRecord.professional_specialty || "")).trim() || current.companySpecialty,
      jobTitle: jobTitle || current.jobTitle,
      department: sanitizeEnglishText(String(clientRecord.department || "")).trim() || current.department,
      workCity: workCity || current.workCity,
      workPhone: clientRecord.work_phone || current.workPhone,
      workEmail: clientRecord.work_email || current.workEmail,
    }));
  }

  // --- Weighted Scoring Search Action ---
  function handleSearch() {
    if (!searchForm.fullName.trim() && !searchForm.nationalId.trim() && !searchForm.passportNumber.trim() && !searchForm.dateOfBirth) {
      toast.error("Enter at least one search field: full name, National ID, passport number, or date of birth.");
      return;
    }
    if (phoneValidation.error) {
      toast.error(phoneValidation.error);
      return;
    }
    if (emailValidation.error) {
      toast.error(emailValidation.error);
      return;
    }

    startTransition(async () => {
      const res = await searchClientsWithMatchingScore(normalizedSearchForm);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      setSearchResults(res.data);
      setHasSearched(true);
      setSelectedPotentialMatch(null);

      if (res.data.length > 0) {
        // If there's a strong match, auto-select it for side-by-side review
        const topMatch = res.data[0];
        if (topMatch.matchType === "Exact Match" || topMatch.matchType === "Strong Match" || topMatch.matchType === "Potential Match") {
          setSelectedPotentialMatch(topMatch);
          populateCompanyInformationFromClient(topMatch.client);
        }
      } else {
        toast.info("No matching clients were found.");
      }
    });
  }

  // Helper to update the draft event details once the draft is created in Step 2
  async function updateDraftEventDetails(regId: string) {
    if (!selectedEventId) return;
    const { error } = await supabase
      .from("registrations")
      .update({
        event_id: selectedEventId,
        additional_data: {
          participation_type: participationType,
          travel_purpose: travelPurpose,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", regId);
    if (error) {
      console.error("Failed to bind Step 1 event details:", error);
    }
  }

  // --- Continue with Existing Client (Resolves Differences and updates old passports) ---
  function handleContinueWithClient(match: any, updateProfile: boolean) {
    if (!validateStepBeforeAdvance(3)) return;
    if (phoneValidation.error) {
      toast.error(phoneValidation.error);
      return;
    }
    if (emailValidation.error) {
      toast.error(emailValidation.error);
      return;
    }

    startTransition(async () => {
      const res = await continueWithClientAction({
        clientId: match.client.id,
        updateProfile,
        eventId: selectedEventId,
        newData: normalizedSearchForm,
      });

      if (res.error || !res.data) {
        toast.error(res.error || "Could not link the client.");
        return;
      }

      toast.success(updateProfile ? "Client profile updated and draft saved." : "Client linked to the draft.");
      setRegistrationId(res.data.registrationId);
      setCaseNumber(res.data.caseNumber);
      await updateDraftEventDetails(res.data.registrationId);
      await persistImportedClientDocuments(res.data.registrationId);
      setStep(3);
    });
  }

  // --- Create a completely new client ---
  function handleCreateNewClient() {
    if (!validateStepBeforeAdvance(3)) return;
    if (phoneValidation.error) {
      toast.error(phoneValidation.error);
      return;
    }
    if (emailValidation.error) {
      toast.error(emailValidation.error);
      return;
    }

    // Safe duplication check
    const highMatch = searchResults.find((r) => r.score >= 80);
    if (highMatch && !showWarningDialog) {
      setShowWarningDialog(true);
      toast.warning("Warning: a client with a high match score is already registered in the system. If you are sure and want to create a new client, click the Save button again.");
      return;
    }

    setShowWarningDialog(false);
    startTransition(async () => {
      try {
        const res = await createNewClientAndApplication({
          eventId: selectedEventId,
          clientData: normalizedSearchForm,
        });

        if (res.error || !res.data) {
          toast.error(res.error || "Could not create the client account.");
          return;
        }

        setRegistrationId(res.data.registrationId);
        setCaseNumber(res.data.caseNumber);
        await updateDraftEventDetails(res.data.registrationId);
        await persistImportedClientDocuments(res.data.registrationId);
        setStep(3);
        toast.success("New client account and draft created.");
      } catch (error) {
        console.error("Failed to create new client and application:", error);
        toast.error(error instanceof Error ? error.message : "Could not create the client account.");
      }
    });
  }

  // --- Step 2: Save Intake Details & Snapshot ---
  async function handleSaveIntake() {
    if (!registrationId) return;
    if (!validateStepBeforeAdvance(4)) return;
    if (phoneValidation.error) {
      toast.error(phoneValidation.error);
      return;
    }
    if (emailValidation.error) {
      toast.error(emailValidation.error);
      return;
    }

    try {
      // Changes made during an application belong to this application's snapshot.
      // Updating the reusable client profile is an explicit action outside this flow.
      await saveIntakeSnapshot();
    } catch (e: any) {
      toast.error(e.message || "Could not save the application.");
    }
  }

  async function handleSaveDraftOnly() {
    if (!registrationId) return;
    if (phoneValidation.error) {
      toast.error(phoneValidation.error);
      return;
    }
    if (emailValidation.error) {
      toast.error(emailValidation.error);
      return;
    }

    try {
      const draftSnapshot = buildClientSnapshot(snapshotInputs);
      await updateClientData(registrationId, buildClientResidencyPatch(searchForm));

      const { error } = await (supabase as any)
        .from("registrations")
        .update({
          assigned_employee_id: assignedTo || null,
          notes: appNotes || null,
          client_snapshot: draftSnapshot,
          current_step: 3,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId);

      if (error) throw error;

      toast.success("Draft saved.");
      await loadRegistration(registrationId);
    } catch (e: any) {
      toast.error(e.message || "Could not save the draft.");
    }
  }

  async function saveIntakeSnapshot() {
    if (!registrationId) return;

    try {
      const snapshot = buildClientSnapshot(snapshotInputs);
      await updateClientData(registrationId, buildClientResidencyPatch(searchForm));

      const { error: snapshotError } = await (supabase as any)
        .from("registrations")
        .update({ client_snapshot: snapshot })
        .eq("id", registrationId);
      if (snapshotError) throw snapshotError;

      // Save Wizard Intake
      const { error } = await (supabase as any)
        .from("registrations")
        .update({
          assigned_employee_id: assignedTo || null,
          notes: appNotes || null,
          current_step: 4,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId!);

      if (error) throw error;

      toast.success("Application details saved.");
      setStep(4);
      loadRegistration(registrationId);
    } catch (e: any) {
      toast.error(e.message || "Could not save the application details.");
    }
  }

  async function handleSaveClientDraft(): Promise<boolean> {
    if (!registrationId || !client?.id) return false;
    try {
      const snapshot = buildClientSnapshot(snapshotInputs);

      const emptyToNull = (v: string) => (v === "" ? null : v);
      const clientPatch: Record<string, unknown> = {
        full_name_as_passport: emptyToNull(searchForm.fullName),
        last_name: emptyToNull(searchForm.surname),
        title_salutation: emptyToNull(searchForm.salutation),
        sex: emptyToNull(searchForm.gender),
        marital_status: emptyToNull(searchForm.maritalStatus),
        passport_number: emptyToNull(searchForm.passportNumber),
        national_id: emptyToNull(searchForm.nationalId),
        phone: emptyToNull(normalizedSearchForm.phone),
        email: emptyToNull(searchForm.email),
        employer_name: emptyToNull(searchForm.companyName),
        professional_specialty: emptyToNull(normalizedSearchForm.companySpecialty),
        date_of_birth: emptyToNull(searchForm.dateOfBirth),
        place_of_birth: emptyToNull(searchForm.placeOfBirth),
        passport_issue_date: emptyToNull(searchForm.passportIssueDate),
        passport_expiry_date: emptyToNull(searchForm.passportExpiryDate),
        job_title: emptyToNull(searchForm.jobTitle),
        department: emptyToNull(searchForm.department),
        work_city: emptyToNull(searchForm.workCity),
        work_phone: emptyToNull(workPhoneValidation.normalized),
        work_email: emptyToNull(searchForm.workEmail),
        residence_country: emptyToNull(searchForm.residenceCountry),
        previous_schengen_visa: searchForm.previousSchengenVisa,
        schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
        other_residence_permit: normalizedSearchForm.otherResidencePermit,
        updated_at: new Date().toISOString(),
      };

      const clientId = client.id;
      const { error: clientErr } = await supabase.from("clients").update(clientPatch).eq("id", clientId);
      if (clientErr) throw clientErr;

      const { error: regErr } = await (supabase as any)
        .from("registrations")
        .update({ client_snapshot: snapshot, updated_at: new Date().toISOString() })
        .eq("id", registrationId);
      if (regErr) throw regErr;

      return true;
    } catch (e: any) {
      console.error("Client draft autosave failed:", e);
      return false;
    }
  }

  // --- Step 1: Save Event Selection ---
  // `advance = false` backs the "Save Draft" button, which previously only
  // showed a success toast without writing anything.
  async function handleSaveEventDetails(advance = true) {
    if (!selectedEventId) {
      toast.error("Select an event first.");
      return false;
    }

    if (registrationId) {
      try {
        const ad = (registration?.additional_data as any) || {};
        const updatedAd = {
          ...ad,
          participation_type: participationType,
          travel_purpose: travelPurpose,
        };

        const { error } = await supabase
          .from("registrations")
          .update({
            event_id: selectedEventId,
            additional_data: updatedAd,
            updated_at: new Date().toISOString(),
          })
          .eq("id", registrationId!);

        if (error) throw error;
        toast.success(advance ? "Event details updated." : "Event draft saved.");
        await loadRegistration(registrationId);
      } catch (e: any) {
        toast.error(e.message || "Could not update the event details.");
        return false;
      }
    } else if (!advance) {
      // No registration row exists yet, so there is nothing to persist.
      toast.info("The event will be saved once the client is linked in the next step.");
      return false;
    }

    if (advance) setStep(2);
    return true;
  }

  function handleSaveEventDraft() {
    return handleSaveEventDetails(false);
  }

  function handleVisaPasswordChange(value: string) {
    setVisaPortalPassword(value);
    setVisaPasswordDirty(true);
  }

  async function handleRevealVisaPassword() {
    if (!registrationId) return;
    setIsRevealingPassword(true);
    try {
      const result = await revealVisaPortalPassword(registrationId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (!result.password) {
        toast.info("No portal password has been saved for this application.");
        return;
      }
      setVisaPortalPassword(result.password);
      setShowPassword(true);
      // Revealing must not mark the field dirty, otherwise the next autosave
      // would rewrite the same value and log a spurious change.
      setVisaPasswordDirty(false);
    } finally {
      setIsRevealingPassword(false);
    }
  }

  /** Composes the stored embassy label; blank until a city is picked. */
  function composeEmbassyLabel(country: string, city: string) {
    return country && city ? `${country} Embassy in ${city}` : "";
  }

  function handleVisaDestinationChange(country: string) {
    const route = VISA_ROUTES.find((item) => item.country === country);
    setVisaDestination(country);
    if (!route) return;
    // Fall back to the route's default city so switching destination never
    // leaves the required embassy field as "<country> Embassy in ".
    const city = visaEmbassyCity || route.city;
    setVisaEmbassyCity(city);
    setVisaEmbassy(composeEmbassyLabel(country, city));
    setVisaPlatform(route.portal);
    setVisaSubmissionMethod(route.submissionMethod);
    setVisaAppointmentCenter(route.center);
    setVisaAppointmentCity(route.city);
  }

  function playReminderSound() {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const startAlarm = () => {
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0.9, audioContext.currentTime);
      masterGain.connect(audioContext.destination);

      // Repeat a two-tone alarm for roughly 10 seconds so it is audible
      // even when the first notification sound is missed.
      for (let index = 0; index < 10; index += 1) {
        const start = audioContext.currentTime + index * 0.9;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(index % 2 === 0 ? 880 : 660, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.75, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
        oscillator.connect(gain);
        gain.connect(masterGain);
        oscillator.start(start);
        oscillator.stop(start + 0.7);
      }
      window.setTimeout(() => void audioContext.close(), 11000);
    };

    if (audioContext.state === "suspended") {
      void audioContext.resume().then(startAlarm);
    } else {
      startAlarm();
    }
  }

  function addVisaReminder() {
    if (!newReminderAt) {
      toast.error("Choose a reminder date and time first.");
      return;
    }
    if (new Date(newReminderAt).getTime() <= Date.now()) {
      toast.error("The reminder time must be in the future.");
      return;
    }
    setVisaReminders((current) =>
      [
        ...current,
        {
          id: crypto.randomUUID(),
          remindAt: newReminderAt,
          note: newReminderNote.trim() || "Visa appointment reminder",
          sound: true,
        },
      ].sort((a, b) => a.remindAt.localeCompare(b.remindAt)),
    );
    setNewReminderAt("");
    setNewReminderNote("");
  }

  // Refs to hold the latest state values for the interval check, preventing dependency loops
  const remindersRef = useRef(visaReminders);
  const appointmentDateRef = useRef(visaAppointmentDate);
  const appointmentTimeRef = useRef(visaAppointmentTime);
  const appointmentCenterRef = useRef(visaAppointmentCenter);
  const embassyRef = useRef(visaEmbassy);
  const registrationRef = useRef(registration);

  useEffect(() => { remindersRef.current = visaReminders; }, [visaReminders]);
  useEffect(() => { appointmentDateRef.current = visaAppointmentDate; }, [visaAppointmentDate]);
  useEffect(() => { appointmentTimeRef.current = visaAppointmentTime; }, [visaAppointmentTime]);
  useEffect(() => { appointmentCenterRef.current = visaAppointmentCenter; }, [visaAppointmentCenter]);
  useEffect(() => { embassyRef.current = visaEmbassy; }, [visaEmbassy]);
  useEffect(() => { registrationRef.current = registration; }, [registration]);

  // Appointment reminders are generated from the appointment itself:
  // four daily 08:00 reminders (D-5 through D-2), followed by a final
  // reminder one hour before the appointment.
  useEffect(() => {
    if (!visaAppointmentDate || !visaAppointmentTime) return;
    const appointment = new Date(`${visaAppointmentDate}T${visaAppointmentTime}`);
    if (Number.isNaN(appointment.getTime())) return;

    setVisaReminders((current) => {
      // 1. Keep manual reminders (they don't start with "appointment-")
      const manualReminders = current.filter((r) => !r.id.startsWith("appointment-"));

      // 2. See which generated reminders already exist in current state, preserving their notifiedAt status
      const existingGeneratedMap = new Map(
        current.filter((r) => r.id.startsWith("appointment-")).map((r) => [r.id, r])
      );

      // 3. Re-generate default reminders, but pull from existingGeneratedMap if they exist to preserve notifiedAt
      const generatedReminders: VisaAppointmentReminder[] = [5, 4, 3, 2].map((daysBefore) => {
        const id = `appointment-${visaAppointmentDate}-${visaAppointmentTime}-d${daysBefore}`;
        const existing = existingGeneratedMap.get(id);
        if (existing) return existing;

        const reminderDate = new Date(`${visaAppointmentDate}T08:00`);
        reminderDate.setDate(reminderDate.getDate() - daysBefore);
        return {
          id,
          remindAt: reminderDate.toISOString(),
          note: `Appointment reminder: ${daysBefore} days remaining`,
          sound: true,
        };
      });

      const finalReminderId = `appointment-${visaAppointmentDate}-${visaAppointmentTime}-one-hour`;
      const existingFinal = existingGeneratedMap.get(finalReminderId);
      const finalReminder: VisaAppointmentReminder = existingFinal || (() => {
        const finalRemindAt = new Date(appointment.getTime() - 60 * 60 * 1000);
        return {
          id: finalReminderId,
          remindAt: finalRemindAt.toISOString(),
          note: "Appointment reminder: 1 hour remaining",
          sound: true,
        };
      })();

      // 4. Combine manual, existing preserved, and new generated ones
      const combined = [...manualReminders, ...generatedReminders, finalReminder];

      // 5. Sort them by remindAt
      return combined.sort((a, b) => a.remindAt.localeCompare(b.remindAt));
    });
  }, [visaAppointmentDate, visaAppointmentTime]);

  useEffect(() => {
    if (!registrationId || !currentUser?.id) return;

    const checkReminders = async () => {
      const currentReminders = remindersRef.current;
      if (currentReminders.length === 0) return;

      const dueReminders = currentReminders.filter((reminder) => !reminder.notifiedAt && new Date(reminder.remindAt).getTime() <= Date.now());
      if (dueReminders.length === 0) return;

      for (const reminder of dueReminders) {
        const title = "Visa appointment reminder";
        const appointmentLabel = [appointmentDateRef.current, appointmentTimeRef.current].filter(Boolean).join(" ") || "the scheduled time";
        const body = `${reminder.note}. Appointment: ${appointmentLabel} at ${appointmentCenterRef.current || embassyRef.current}.`;
        
        toast.warning(title, { description: body, duration: 15000 });
        if (reminder.sound) playReminderSound();
        
        await supabase.from("notifications").insert({
          user_id: currentUser.id,
          type: "visa_appointment_reminder",
          title,
          body,
          link_url: `/dashboard/participation-cases/work/clients?registrationId=${registrationId}&step=4`,
        });
      }

      const notifiedIds = new Set(dueReminders.map((reminder) => reminder.id));
      const notifiedAt = new Date().toISOString();
      const updatedReminders = currentReminders.map((reminder) => (notifiedIds.has(reminder.id) ? { ...reminder, notifiedAt } : reminder));
      
      setVisaReminders(updatedReminders);
      remindersRef.current = updatedReminders;

      setRegistration((prev: any) => {
        if (!prev) return prev;
        const updatedReg = {
          ...prev,
          additional_data: {
            ...(prev.additional_data as Record<string, unknown> || {}),
            visa_appointment_reminders: updatedReminders,
          },
          updated_at: notifiedAt,
        };
        registrationRef.current = updatedReg;
        return updatedReg;
      });

      const currentReg = registrationRef.current;
      const ad = (currentReg?.additional_data as Record<string, unknown>) || {};
      await supabase
        .from("registrations")
        .update({
          additional_data: { ...ad, visa_appointment_reminders: updatedReminders },
          updated_at: notifiedAt,
        })
        .eq("id", registrationId);
    };

    void checkReminders();
    const intervalId = window.setInterval(() => void checkReminders(), 120000);
    return () => window.clearInterval(intervalId);
  }, [registrationId, currentUser?.id, supabase]);

  // --- Step 4: Save Visa Platforms & Appointments ---
  async function handleSaveVisaDetails(advance = true, options?: { silent?: boolean }) {
    if (!registrationId) return false;
    if (advance && !validateStepBeforeAdvance(4)) return false;

    const missingFields = [!visaDestination && "visa destination", !visaEmbassy.trim() && "embassy or consulate", !visaType && "visa type", !visaSubmissionMethod && "submission method"].filter(Boolean) as string[];
    if (advance && missingFields.length > 0) {
      toast.error(`Complete the required visa fields: ${missingFields.join(", ")}.`);
      return false;
    }
    if (visaAppointmentDate && visaAppointmentTime) {
      const appointmentAt = new Date(`${visaAppointmentDate}T${visaAppointmentTime}`);
      if (Number.isNaN(appointmentAt.getTime())) {
        toast.error("Enter a valid appointment date and time.");
        return false;
      }
      if (advance && appointmentAt.getTime() < Date.now() && visaAppointmentStatus !== "Completed") {
        toast.error("The appointment date is in the past. Mark it completed or choose a future date.");
        return false;
      }
    }
    if (advance && visaPortalAppStatus === "Completed" && !visaAppRefNumber.trim()) {
      toast.error("Add the application reference number when the portal application is completed.");
      return false;
    }

    try {
      const ad = (registration?.additional_data as any) || {};
      const updatedAd = {
        ...ad,
        visa_destination_country: visaDestination,
        visa_embassy: visaEmbassy,
        visa_embassy_city: visaEmbassyCity,
        visa_type: visaType,
        visa_platform: visaPlatform,
        visa_submission_method: visaSubmissionMethod,
        visa_portal_email: visaPortalEmail,
        visa_portal_status: visaAccountStatus,
        visa_app_ref_number: visaAppRefNumber,
        visa_portal_app_status: visaPortalAppStatus,
        visa_appointment_channel: visaAppointmentChannel,
        visa_appointment_center: visaAppointmentCenter,
        visa_appointment_city: visaAppointmentCity,
        visa_appointment_date: visaAppointmentDate,
        visa_appointment_time: visaAppointmentTime,
        visa_appointment_ref_number: visaAppointmentRefNumber,
        visa_appointment_status: visaAppointmentStatus,
        visa_appointment_reminders: visaReminders,
        visa_reminder_date: visaReminders[0]?.remindAt.split("T")[0] || null,
      };

      const updatePayload = options?.silent
        ? { additional_data: updatedAd, updated_at: new Date().toISOString() }
        : {
            additional_data: updatedAd,
            case_status: "visa_in_progress",
            current_step: advance ? 5 : 4,
            updated_at: new Date().toISOString(),
          };
      const { error } = await supabase.from("registrations").update(updatePayload).eq("id", registrationId!);

      if (error) throw error;

      // The password takes a separate, encrypted path and is only written when
      // the user actually typed a new one.
      if (visaPasswordDirty) {
        const passwordResult = await saveVisaPortalPassword(registrationId, visaPortalPassword);
        if (passwordResult.error) {
          if (!options?.silent) toast.error(passwordResult.error);
          return false;
        }
        setVisaPasswordIsStored(Boolean(visaPortalPassword));
        setVisaPasswordDirty(false);
      }

      // Autosave should not create an activity row every time the user
      // pauses typing. Only an intentional step advance is meaningful
      // in the compact activity history.
      if (!options?.silent) {
        await recordRegistrationActivity({
          registrationId,
          action: "visa_updated",
          description: advance ? "Visa details saved and moved to the documents step." : "Visa changes saved automatically.",
          step: 4,
          metadata: { destination: visaDestination, appointment_status: visaAppointmentStatus },
        });
      }

      if (!options?.silent) {
        toast.success("Visa details and embassy appointment saved.");
        if (advance) setStep(5);
        loadRegistration(registrationId);
      }
      return true;
    } catch (e: any) {
      if (!options?.silent) toast.error(e.message || "Could not save the visa details.");
      return false;
    }
  }

  const visaDraftSnapshot = useMemo(
    () =>
      JSON.stringify({
        visaDestination,
        visaEmbassy,
        visaEmbassyCity,
        visaType,
        visaPlatform,
        visaSubmissionMethod,
        visaPortalEmail,
        visaPortalPassword,
        visaAccountStatus,
        visaAppRefNumber,
        visaPortalAppStatus,
        visaAppointmentChannel,
        visaAppointmentCenter,
        visaAppointmentCity,
        visaAppointmentDate,
        visaAppointmentTime,
        visaAppointmentRefNumber,
        visaAppointmentStatus,
        visaReminders,
      }),
    [visaDestination, visaEmbassy, visaEmbassyCity, visaType, visaPlatform, visaSubmissionMethod, visaPortalEmail, visaPortalPassword, visaAccountStatus, visaAppRefNumber, visaPortalAppStatus, visaAppointmentChannel, visaAppointmentCenter, visaAppointmentCity, visaAppointmentDate, visaAppointmentTime, visaAppointmentRefNumber, visaAppointmentStatus, visaReminders],
  );

  useEffect(() => {
    if (step !== 4 || !registrationId || !registration) return;
    if (visaAutosaveBaseline.current === null) {
      visaAutosaveBaseline.current = visaDraftSnapshot;
      setVisaSaveState("saved");
      return;
    }
    if (visaAutosaveBaseline.current === visaDraftSnapshot) return;
    setVisaSaveState("dirty");
    if (visaAutosaveTimer.current) clearTimeout(visaAutosaveTimer.current);
    visaAutosaveTimer.current = setTimeout(async () => {
      setVisaSaveState("saving");
      const saved = await handleSaveVisaDetails(false, { silent: true });
      if (saved) {
        visaAutosaveBaseline.current = visaDraftSnapshot;
        setVisaSaveState("saved");
      } else {
        setVisaSaveState("error");
        toast.error("Could not autosave the changes. The next edit will retry.");
      }
    }, 2000);
    return () => {
      if (visaAutosaveTimer.current) clearTimeout(visaAutosaveTimer.current);
    };
  }, [step, registrationId, registration, visaDraftSnapshot]);

  // Handle Visa Form & Appointment Confirmation uploads
  async function handleStep4FileUpload(e: React.ChangeEvent<HTMLInputElement>, label: string, docType: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!registrationId) {
      toast.error("Save the client application before uploading documents.");
      e.target.value = "";
      return;
    }

    setUploadError(null);
    setUploadingDocumentType(docType);
    toast.loading(`Uploading ${label}...`);
    try {
      const res = (await uploadRegistrationDocumentDirect(registrationId, file, docType, label)) as any;
      toast.dismiss();
      if (res.error) {
        setUploadError({ type: docType, message: res.error });
        toast.error(res.error);
      } else {
        setRegistration((prev: any) => {
          if (!prev) return prev;

          const currentDocs = Array.isArray(prev.documents) ? prev.documents : [];
          const nextDoc = {
            name: file.name,
            path: res.url,
            uploadedAt: new Date().toISOString(),
            type: docType,
          };

          return {
            ...prev,
            documents: [...currentDocs.filter((doc: any) => doc?.type !== docType), nextDoc],
          };
        });
        if (docType === "visa_application_form" || docType === "appointment_confirmation") {
          const ocrForm = new FormData();
          ocrForm.append("file", file);
          if (docType === "appointment_confirmation") ocrForm.append("kind", "appointment");
          toast.loading(`Processing ${label} with OCR...`);
          if (docType === "appointment_confirmation") setVisaAppointmentRefNumber("");
          const ocrResponse = await fetch("/api/application-ocr", { method: "POST", body: ocrForm });
          const ocrResult = await ocrResponse.json();
          toast.dismiss();
          if (docType === "appointment_confirmation" && ocrResponse.ok && ocrResult.appointmentReferenceNumber) {
            const extractedAppointment = {
              visa_appointment_ref_number: String(ocrResult.appointmentReferenceNumber),
              visa_appointment_date: String(ocrResult.appointmentDate || ""),
              visa_appointment_time: String(ocrResult.appointmentTime || ""),
              visa_appointment_center: String(ocrResult.appointmentCenter || ""),
              visa_appointment_city: String(ocrResult.appointmentCity || ""),
            };
            setVisaAppointmentRefNumber(extractedAppointment.visa_appointment_ref_number);
            setVisaAppointmentDate(extractedAppointment.visa_appointment_date);
            setVisaAppointmentTime(extractedAppointment.visa_appointment_time);
            setVisaAppointmentCenter(extractedAppointment.visa_appointment_center);
            setVisaAppointmentCity(extractedAppointment.visa_appointment_city);

            // Persist OCR values immediately so a reload cannot restore the old appointment time.
            const currentAdditionalData = (registration?.additional_data as Record<string, unknown>) || {};
            await supabase
              .from("registrations")
              .update({
                additional_data: { ...currentAdditionalData, ...extractedAppointment },
                updated_at: new Date().toISOString(),
              })
              .eq("id", registrationId);
            toast.success(`Appointment details extracted successfully. Reference: ${ocrResult.appointmentReferenceNumber}`);
          } else if (docType === "visa_application_form" && ocrResponse.ok && ocrResult.applicationNumber) {
            setVisaAppRefNumber(ocrResult.applicationNumber);
            toast.success(`Application number extracted: ${ocrResult.applicationNumber}`);
          } else {
            toast.warning(docType === "appointment_confirmation" ? "The file was uploaded, but appointment details could not be extracted confidently. Please review them manually." : "The file was uploaded, but Application Number could not be extracted confidently. Please review it manually.");
          }
        }
        toast.success(`${label} uploaded successfully.`);
        await loadRegistration(registrationId);
      }
    } catch (error: any) {
      toast.dismiss();
      const message = error?.message || "Could not upload the file.";
      setUploadError({ type: docType, message });
      toast.error(message);
    } finally {
      setUploadingDocumentType(null);
      e.target.value = "";
    }
  }

  /** Removes a stored document from both storage and the registration row. */
  async function handleDeleteDocument(document: { path: string; name: string }) {
    if (!registrationId) return;
    if (!window.confirm(`Delete "${document.name}"? This cannot be undone.`)) return;

    setDeletingDocumentPath(document.path);
    try {
      const result = await deleteRegistrationDocument(registrationId, document.path, document.name);
      if (result.error) throw new Error(result.error);
      // Drop it from any selection lists so the package/delivery steps do not
      // keep referencing a file that no longer exists.
      setPackageDocumentPaths((current) => current.filter((path) => path !== document.path));
      setDeliveryDocumentPaths((current) => current.filter((path) => path !== document.path));
      toast.success(`${document.name} deleted.`);
      await loadRegistration(registrationId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the document.");
    } finally {
      setDeletingDocumentPath(null);
    }
  }

  // --- Step 5: Document Assembly & Package Index ---
  async function handleMergeFiles() {
    if (!registrationId) {
      toast.error("Save the client application before creating the package.");
      return;
    }
    // packageDocumentPaths is intentionally ordered by the user's drag/drop
    // arrangement, so the merged PDF follows the visible package order.
    const selectedDocuments = packageDocumentPaths
      .map((path) => mergeableDocuments.find((document) => document.path === path))
      .filter((document): document is (typeof mergeableDocuments)[number] => Boolean(document));
    if (selectedDocuments.length === 0 && !includeClientInfoInPackage) {
      toast.error("Select at least one file or include the client information page.");
      return;
    }

    setIsPackageGenerating(true);
    toast.loading("Combining files into one PDF package...");
    try {
      // Client information is rendered first, then the selected source files are
      // appended as real pages in the same PDF package.
      const coverPdf = includeClientInfoInPackage
        ? await buildPackageCoverPdf({
            caseNumber,
            clientName: searchForm.fullName || client?.full_name_as_passport || "Client",
            applicantDetails: [
              ["Full Name", searchForm.fullName || client?.full_name_as_passport],
              ["Surname", searchForm.surname || client?.last_name],
              ["Title / Salutation", searchForm.salutation || client?.title_salutation],
              ["Gender", searchForm.gender || client?.sex],
              ["Marital Status", searchForm.maritalStatus || client?.marital_status],
              ["Passport Number", searchForm.passportNumber || client?.passport_number],
              ["National ID", searchForm.nationalId || client?.national_id],
              ["Date of Birth", searchForm.dateOfBirth || client?.date_of_birth],
              ["Place of Birth", searchForm.placeOfBirth || client?.place_of_birth],
              ["Passport Date of Issue", searchForm.passportIssueDate || client?.passport_issue_date],
              ["Passport Date of Expiry", searchForm.passportExpiryDate || client?.passport_expiry_date],
              ["Phone Number", normalizedSearchForm.phone || client?.phone],
              ["Email Address", normalizedSearchForm.email || client?.email],
              ["Company Name", searchForm.companyName || client?.employer_name],
            ].map(([label, value]) => [String(label), String(value ?? "")] as [string, string]),
            eventName: selectedEvent?.title_ar || selectedEvent?.title || "",
            participationType,
            travelPurpose,
            visaDestination,
            visaEmbassy,
            visaType,
            visaSubmissionMethod,
            appointmentAt: [visaAppointmentDate, visaAppointmentTime].filter(Boolean).join(" "),
            appointmentReference: visaAppointmentRefNumber,
            documents: selectedDocuments,
          })
        : null;

      const mergedBytes = await mergeDocumentsIntoPdf(coverPdf, selectedDocuments);
      const requestedName = packageName.trim() || `${(client?.full_name_as_passport || "Client").replace(/\s+/g, "_")}_Visa_Package.pdf`;
      const fileName = requestedName.toLowerCase().endsWith(".pdf") ? requestedName : `${requestedName}.pdf`;
      const mergedFile = new File([new Blob([mergedBytes as BlobPart], { type: "application/pdf" })], fileName, { type: "application/pdf" });
      const upload = (await uploadRegistrationDocumentDirect(registrationId, mergedFile, "merged_package", fileName)) as any;
      if (upload.error) throw new Error(upload.error);

      const ad = (registration?.additional_data as any) || {};
      const updatedAd = {
        ...ad,
        package_assembly_order: "Selected file order",
        package_assembly_format: "PDF",
        package_assembly_name: fileName,
        package_ready_to_merge: true,
        package_include_client_info: includeClientInfoInPackage,
        package_selected_document_paths: selectedDocuments.map((document) => document.path),
        package_merged_file_url: upload.url || "",
      };

      const { error } = await supabase
        .from("registrations")
        .update({
          additional_data: updatedAd,
          case_status: "final_qc",
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId);

      if (error) throw error;
      toast.dismiss();
      toast.success("The PDF package was created and saved to the application.");
      await loadRegistration(registrationId);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || "Could not create the package PDF.");
    } finally {
      setIsPackageGenerating(false);
    }
  }

  // --- Step 6: Pricing (unified from event) + Payment ---
  // Pricing items come from the selected event's registration_config.pricing_items.
  // They are NOT editable per order — the manager defines them when creating the event.
  // (pricingItems / totalAmount / balanceDue are computed after `selectedEvent` below.)

  async function handleGenerateReceipt() {
    if (!registrationId) return;
    toast.loading("Generating the client receipt...");
    try {
      const receiptInput = {
        receiptId,
        caseNumber,
        registrationId,
        clientName: client?.full_name_as_passport || searchForm.fullName || "Client",
        clientCompany: client?.employer_name || searchForm.companyName || "—",
        eventName: selectedEvent?.title || selectedEvent?.title_ar || "Event not set",
        paymentDate,
        paymentMethod,
        paymentNotes,
        currency,
        pricingItems,
        discount,
        totalAmount,
        amountPaid,
        balanceDue,
      };

      // Internal receipt: full fee breakdown.
      const companyFileName = `Payment_Receipt_${caseNumber || registrationId}.pdf`;
      const companyBlob = await buildCompanyReceiptPdf(receiptInput);
      const upload = (await uploadRegistrationDocumentDirect(
        registrationId,
        new File([companyBlob], companyFileName, { type: "application/pdf" }),
        "receipt",
        companyFileName,
      )) as any;
      if (upload.error) throw new Error(upload.error);
      const receiptUrl = upload.url || "";

      // Client-facing receipt: no internal fee details.
      const clientSafeName = receiptInput.clientName.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "Client";
      const clientFileName = `JAZ_Payment_Receipt_${clientSafeName}_${receiptId}.pdf`;
      const clientBlob = await buildClientReceiptPdf(receiptInput, await loadLogoDataUrl());
      const clientUpload = (await uploadRegistrationDocumentDirect(
        registrationId,
        new File([clientBlob], clientFileName, { type: "application/pdf" }),
        "client_receipt",
        clientFileName,
      )) as any;
      if (clientUpload.error) throw new Error(clientUpload.error);
      const clientReceiptUrl = clientUpload.url || "";

      const ad = (registration?.additional_data as any) || {};
      const updatedAd = {
        ...ad,
        payment_category: paymentCategory,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        payment_notes: paymentNotes,
        payment_currency: currency,
        // Snapshot the event pricing at receipt time so the record stays stable
        // even if the event prices change later. Discount is finance-only.
        pricing_snapshot: pricingItems.map((item) => ({ label: item.label, price: item.price })),
        pricing_currency: currency,
        ...(canEditFeeBreakdown ? { discount } : {}),
        amount_paid: amountPaid,
        balance_due: balanceDue,
        receipt_number: receiptId,
        receipt_pdf_url: receiptUrl,
        client_receipt_pdf_url: clientReceiptUrl,
        client_receipt_file_name: clientFileName,
        receipt_issue_date: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("registrations")
        .update({
          payment_status: amountPaid <= 0 ? "unpaid" : balanceDue <= 0 ? "paid" : "partially_paid",
          total_amount: totalAmount,
          additional_data: updatedAd,
          case_status: "ready_for_next_stage",
          current_step: 6,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId);

      if (error) throw error;

      toast.dismiss();
      toast.success("Receipt generated and saved to the application.");
      await loadRegistration(registrationId);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || "Could not generate the receipt.");
    }
  }

  function getStoredReceipt() {
    return normalizeRegistrationDocuments(registration?.documents).find((document) => document.type === "receipt");
  }

  async function handlePrintReceipt() {
    const receipt = getStoredReceipt();
    if (!receipt?.path) {
      toast.error("Generate the receipt before printing.");
      return;
    }

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.src = receipt.path;
    printFrame.onload = () => {
      window.setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch {
          window.open(receipt.path, "_blank", "noopener,noreferrer");
        }
        window.setTimeout(() => printFrame.remove(), 1000);
      }, 300);
    };
    document.body.appendChild(printFrame);
    toast.success("Receipt print window opened.");
  }

  async function handleDownloadReceipt() {
    const receipt = getStoredReceipt();
    if (!receipt?.path) {
      toast.error("Generate the receipt before downloading.");
      return;
    }

    try {
      const response = await fetch(receipt.path);
      if (!response.ok) throw new Error("Could not download the receipt file.");
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = receipt.name || `Payment_Receipt_${caseNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("Receipt downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not download the receipt.");
    }
  }

  async function handleSavePaymentDraft(options?: { silent?: boolean }) {
    if (!registrationId) return false;
    try {
      const ad = (registration?.additional_data as Record<string, unknown>) || {};
      const paymentStatus = amountPaid <= 0 ? "unpaid" : balanceDue <= 0 ? "paid" : "partially_paid";
      const { error } = await supabase
        .from("registrations")
        .update({
          payment_status: paymentStatus,
          total_amount: totalAmount,
          additional_data: {
            ...ad,
            payment_category: paymentCategory,
            payment_method: paymentMethod,
            payment_date: paymentDate,
            payment_notes: paymentNotes,
            payment_currency: currency,
            pricing_snapshot: pricingItems.map((item) => ({ label: item.label, price: item.price })),
            pricing_currency: currency,
            ...(canEditFeeBreakdown ? { discount } : {}),
            amount_paid: amountPaid,
            balance_due: balanceDue,
          },
          current_step: 6,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId);
      if (error) throw error;
      await recordRegistrationActivity({
        registrationId,
        action: "payment_updated",
        description: "Payment draft saved.",
        step: 6,
        metadata: { payment_status: paymentStatus, amount_paid: amountPaid, payment_currency: currency },
      });
      if (!options?.silent) {
        toast.success("Payment draft saved.");
        await loadRegistration(registrationId);
      }
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the payment draft.");
      return false;
    }
  }

  /** Step 5 → 6. Persists the workflow position so the list view is accurate. */
  async function handleAdvanceToPayment() {
    if (!validateStepBeforeAdvance(6)) return;
    await persistCurrentStep(6);
    setStep(6);
  }

  /**
   * Step 6 → 7. Saves the payment inputs first — previously everything typed
   * on the payment step was discarded unless a receipt had been generated.
   */
  async function handleAdvanceToDelivery() {
    if (!validateStepBeforeAdvance(7)) return;
    const saved = await handleSavePaymentDraft({ silent: true });
    if (!saved) return;
    await persistCurrentStep(7);
    setStep(7);
    if (registrationId) await loadRegistration(registrationId);
  }

  async function handleArchiveReceipt() {
    if (!registrationId) return;
    const receipt = getStoredReceipt();
    if (!receipt?.path) {
      toast.error("Generate the receipt before archiving.");
      return;
    }

    try {
      const archivedAt = new Date().toISOString();
      const ad = (registration?.additional_data as Record<string, unknown>) || {};
      const { error } = await supabase
        .from("registrations")
        .update({
          additional_data: {
            ...ad,
            receipt_archived_at: archivedAt,
            receipt_archived_by: currentUser?.id || null,
          },
          current_step: 6,
          updated_at: archivedAt,
        })
        .eq("id", registrationId);
      if (error) throw error;
      toast.success("Receipt archived in the application.");
      await loadRegistration(registrationId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not archive the receipt.");
    }
  }

  // --- Step 7: Client file delivery ---
  // Step 7 previously had no persistence at all: the message, the selected
  // files and the delivery status were rendered from the database but never
  // written back, so a case could never be marked as delivered.
  const [deliverySaveState, setDeliverySaveState] = useState<"idle" | "saving">("idle");

  async function handleSaveDelivery(markAsSent: boolean) {
    if (!registrationId) return false;
    if (markAsSent && deliveryDocumentPaths.length === 0) {
      toast.error("Select at least one file before recording the delivery.");
      return false;
    }

    setDeliverySaveState("saving");
    try {
      const ad = (registration?.additional_data as Record<string, unknown>) || {};
      const nextStatus = markAsSent ? "sent" : "not_sent";
      const deliveredAt = new Date().toISOString();
      const { error } = await supabase
        .from("registrations")
        .update({
          additional_data: {
            ...ad,
            delivery_message: deliveryMessage,
            delivery_document_paths: deliveryDocumentPaths,
            delivery_status: nextStatus,
            ...(markAsSent ? { delivery_sent_at: deliveredAt, delivery_sent_by: currentUser?.id || null } : {}),
          },
          ...(markAsSent ? { case_status: "completed" } : {}),
          current_step: 7,
          updated_at: deliveredAt,
        })
        .eq("id", registrationId);
      if (error) throw error;

      setDeliveryStatus(nextStatus);
      await recordRegistrationActivity({
        registrationId,
        action: markAsSent ? "delivery_sent" : "delivery_updated",
        description: markAsSent ? "Client file delivery recorded and the case was closed." : "Delivery draft saved.",
        step: 7,
        metadata: { delivery_status: nextStatus, files: deliveryDocumentPaths.length },
      });
      toast.success(markAsSent ? "Delivery recorded and the case is now closed." : "Delivery draft saved.");
      await loadRegistration(registrationId);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the delivery details.");
      return false;
    } finally {
      setDeliverySaveState("idle");
    }
  }

  /** Marks the workflow position without touching stage-specific data. */
  async function persistCurrentStep(nextStep: number) {
    if (!registrationId) return;
    const { error } = await supabase
      .from("registrations")
      .update({ current_step: nextStep, updated_at: new Date().toISOString() })
      .eq("id", registrationId);
    if (error) console.error("Failed to persist the current step:", error);
  }

  function openWhatsApp() {
    const rawPhone = String(client?.phone || searchForm.phone || "");
    let phone = rawPhone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = `964${phone.slice(1)}`;
    if (phone.length < 8) {
      toast.error("Add a valid WhatsApp number before opening the conversation.");
      return;
    }
    const selectedFiles = registrationDocuments
      .filter((document) => deliveryDocumentPaths.includes(document.path))
      .map((document) => {
        const link = /^https?:\/\//i.test(document.path) ? document.path : `${window.location.origin}${document.path}`;
        return `• ${document.name}: ${link}`;
      })
      .join("\n");
    const message = deliveryMessage.trim() || `Hello ${client?.full_name_as_passport || searchForm.fullName || ""}, your visa application files for ${caseNumber} are ready.\n\n${selectedFiles}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function openDeliveryEmail() {
    const recipient = String(client?.email || searchForm.email || "").trim();
    if (!recipient) {
      toast.error("Add the client's email address first.");
      return;
    }

    const selectedFiles = registrationDocuments
      .filter((document) => deliveryDocumentPaths.includes(document.path))
      .map((document) => {
        const link = /^https?:\/\//i.test(document.path) ? document.path : `${window.location.origin}${document.path}`;
        return `• ${document.name}: ${link}`;
      })
      .join("\n");
    const clientName = client?.full_name_as_passport || searchForm.fullName || "Client";
    const eventName = selectedEvent?.title || selectedEvent?.title_ar || "";
    const message = [
      deliveryMessage.trim(),
      `Client: ${clientName}`,
      `Case: ${caseNumber}`,
      eventName ? `Event: ${eventName}` : "",
      selectedFiles ? `Files:\n${selectedFiles}` : "Files: No files selected.",
    ].filter(Boolean).join("\n\n");
    const subject = `JAZ Admin | Case ${caseNumber} documents`;
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  // Check Event host details
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId);
  }, [events, selectedEventId]);

  // Pricing items are unified from the event (registration_config.pricing_items).
  // They are NOT editable per order — the manager defines them when creating the event.
  const pricingItems = useMemo(() => {
    const rc = (selectedEvent?.registration_config as Record<string, unknown> | null) || {};
    const list = Array.isArray(rc.pricing_items) ? rc.pricing_items : [];
    return list
      .map((item: any) => ({ label: String(item?.label || "Item").trim() || "Item", price: Number(item?.price) || 0 }))
      .filter((item) => item.label || item.price);
  }, [selectedEvent]);

  const currencySymbol = currency === "IQD" ? "IQD" : currency === "EUR" ? "€" : "$";

  /**
   * Single source of truth for the receipt number. The payment step used to
   * render a hardcoded `RCPT-2026-…` while the generated PDF used the current
   * year, so the number on screen did not match the number in the file.
   * A receipt that has already been issued keeps its original number.
   */
  const receiptId = useMemo(() => {
    const issued = (registration?.additional_data as Record<string, unknown> | null)?.receipt_number;
    if (typeof issued === "string" && issued) return issued;
    const sequence = caseNumber.split("-").pop() || "00000";
    return `RCPT-${new Date().getFullYear()}-${sequence}`;
  }, [registration?.additional_data, caseNumber]);

  const totalAmount = useMemo(() => {
    const itemsTotal = pricingItems.reduce((acc, item) => acc + item.price, 0);
    return Math.max(0, itemsTotal - (discount || 0));
  }, [pricingItems, discount]);

  const balanceDue = useMemo(() => {
    return totalAmount - amountPaid;
  }, [totalAmount, amountPaid]);

  // Sync the payment currency with the event's pricing currency whenever the
  // selected event changes.
  useEffect(() => {
    const rc = (selectedEvent?.registration_config as Record<string, unknown> | null) || {};
    const eventCurrency = rc.pricing_currency;
    if (eventCurrency === "USD" || eventCurrency === "IQD" || eventCurrency === "EUR") {
      setCurrency(eventCurrency);
    }
  }, [selectedEvent]);

  const phoneValidation = useMemo(() => getPhoneValidation(searchForm.phone, phoneCountry), [searchForm.phone, phoneCountry]);
  const workPhoneValidation = useMemo(() => getPhoneValidation(searchForm.workPhone, workPhoneCountry), [searchForm.workPhone, workPhoneCountry]);

  const emailValidation = useMemo(() => getEmailValidation(searchForm.email), [searchForm.email]);

  const normalizedSearchForm = useMemo(
    () => ({
      ...searchForm,
      phone: phoneValidation.normalized || searchForm.phone,
      workPhone: workPhoneValidation.normalized || searchForm.workPhone,
      email: emailValidation.normalized || searchForm.email,
      companySpecialty: searchForm.companySpecialty === "Other" ? companySpecialtyOther.trim() : searchForm.companySpecialty,
      otherResidencePermit: {
        has_permit: searchForm.hasOtherResidencePermit,
        country: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceCountry : "",
        number: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceNumber : "",
        expiry_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceExpiryDate : "",
        issue_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceIssueDate : "",
      }
    }),
    [searchForm, phoneValidation.normalized, workPhoneValidation.normalized, emailValidation.normalized, companySpecialtyOther],
  );

  /** Inputs for `buildClientSnapshot`, shared by every save path. */
  const snapshotInputs = useMemo(
    () => ({
      searchForm,
      phone: normalizedSearchForm.phone,
      workPhone: workPhoneValidation.normalized,
      companySpecialty: normalizedSearchForm.companySpecialty,
    }),
    [searchForm, normalizedSearchForm.phone, normalizedSearchForm.companySpecialty, workPhoneValidation.normalized],
  );

  const clientDraftSnapshot = useMemo(
    () =>
      JSON.stringify({
        ...searchForm,
        companySpecialtyOther,
        phoneCountry,
        workPhoneCountry,
        jobTitleOther,
        workCityOther,
      }),
    [searchForm, companySpecialtyOther, phoneCountry, workPhoneCountry, jobTitleOther, workCityOther],
  );

  // Client/Intake autosave (debounced, silent, works whenever registration exists)
  useEffect(() => {
    if (!registrationId || !client?.id) return;
    if (clientAutosaveBaseline.current === null) {
      clientAutosaveBaseline.current = clientDraftSnapshot;
      setClientSaveState("saved");
      return;
    }
    if (clientAutosaveBaseline.current === clientDraftSnapshot) return;
    setClientSaveState("dirty");
    if (clientAutosaveTimer.current) clearTimeout(clientAutosaveTimer.current);
    clientAutosaveTimer.current = setTimeout(async () => {
      setClientSaveState("saving");
      const saved = await handleSaveClientDraft();
      if (saved) {
        clientAutosaveBaseline.current = clientDraftSnapshot;
        setClientSaveState("saved");
      } else {
        setClientSaveState("error");
      }
    }, 2000);
    return () => {
      if (clientAutosaveTimer.current) clearTimeout(clientAutosaveTimer.current);
    };
  }, [registrationId, client?.id, clientDraftSnapshot]);

  const registrationDocuments = useMemo(() => normalizeRegistrationDocuments(registration?.documents), [registration?.documents]);

  const packageDocument = useMemo(() => registrationDocuments.find((document) => document.type === "merged_package"), [registrationDocuments]);

  const mergeableDocuments = useMemo(() => registrationDocuments.filter((document) => document.type !== "merged_package"), [registrationDocuments]);

  useEffect(() => {
    setPackageDocumentPaths((current) => {
      const availablePaths = new Set(mergeableDocuments.map((document) => document.path));
      if (current.length === 0) return mergeableDocuments.map((document) => document.path);
      return current.filter((path) => availablePaths.has(path));
    });
  }, [mergeableDocuments]);

  const requiredVisaDocuments = useMemo(() => VISA_DOCUMENTS.filter((document) => document.required), []);

  function findDocument(definition: VisaDocumentDefinition) {
    return registrationDocuments.find((document) => definition.aliases.includes(document.type));
  }

  function validateStepBeforeAdvance(targetStep: number) {
    if (targetStep === 3 || targetStep === 4) {
      if (!searchForm.passportNumber || !passportNumberIsValid) {
        toast.error("Enter a valid passport number before continuing.");
        return false;
      }
      const issue = searchForm.passportIssueDate ? new Date(searchForm.passportIssueDate) : null;
      const expiry = searchForm.passportExpiryDate ? new Date(searchForm.passportExpiryDate) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!searchForm.passportIssueDate) {
        toast.error("Add the passport issue date before continuing.");
        return false;
      }
      if (!searchForm.passportExpiryDate) {
        toast.error("Add the passport expiry date before continuing.");
        return false;
      }
      if (!issue || !expiry || Number.isNaN(issue.getTime()) || Number.isNaN(expiry.getTime())) {
        toast.error("Enter valid passport issue and expiry dates before continuing.");
        return false;
      }
      if (expiry <= issue) {
        toast.error("Passport expiry date must be after the issue date.");
        return false;
      }
      if (expiry < today) {
        toast.error("This passport has expired. Update the passport details before continuing.");
        return false;
      }
      if (searchForm.dateOfBirth) {
        const dob = new Date(searchForm.dateOfBirth);
        if (Number.isNaN(dob.getTime()) || dob > today || !/^\d{4}-\d{2}-\d{2}$/.test(searchForm.dateOfBirth)) {
          toast.error("Enter a valid date of birth. Check the year on the ID card.");
          return false;
        }
      }
      if (selectedEvent?.date) {
        const eventDate = new Date(selectedEvent.date);
        if (!Number.isNaN(eventDate.getTime())) {
          eventDate.setMonth(eventDate.getMonth() + 3);
          if (expiry < eventDate) {
            toast.error("Passport expiry must be at least 3 months after the event date.");
            return false;
          }
        }
      }
    }
    if (targetStep === 6 && !packageDocument) {
      toast.error("Upload the required documents and create the package PDF before continuing.");
      return false;
    }
    if (targetStep === 7 && amountPaid > totalAmount) {
      toast.error("The paid amount cannot be greater than the total amount.");
      return false;
    }
    return true;
  }

  const inviterConfig = useMemo(() => {
    const registrationInviter = selectedEvent?.registration_config?.inviter;
    const hostInfo = selectedEvent?.conference_config?.host_info;
    const contactName = [hostInfo?.contact_first_name, hostInfo?.contact_last_name].filter(Boolean).join(" ");
    return {
      host_org: registrationInviter?.host_org || hostInfo?.org_name || "Not recorded",
      host_address: registrationInviter?.host_address || hostInfo?.org_address || "Not recorded",
      host_contact_name: registrationInviter?.host_contact_name || contactName || "Not recorded",
      host_contact_phone: registrationInviter?.host_contact_phone || hostInfo?.contact_phone || hostInfo?.org_phone || "Not recorded",
      host_contact_email: registrationInviter?.host_contact_email || hostInfo?.contact_email || hostInfo?.org_email || "Not recorded",
      host_contact_position: registrationInviter?.host_contact_position || "Not recorded",
    };
  }, [selectedEvent]);


  // --- Render Helpers ---
  const breadcrumbLabel = useMemo(() => {
    const trail = REGISTRATION_STEPS.slice(0, Math.max(1, Math.min(step, REGISTRATION_STEPS.length)))
      .map((item) => item.label);
    return trail.join(" > ");
  }, [step]);

  const assignedEmployee = employees.find((employee) => employee.id === assignedTo);
  const latestActivity = Array.isArray(registration?.registration_events)
    ? [...registration.registration_events].sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))[0]
    : null;
  const summaryAd = (registration?.additional_data as Record<string, any>) || {};
  const summaryAppointment = summaryAd.visa_appointment_date
    ? `${summaryAd.visa_appointment_date}${summaryAd.visa_appointment_time ? ` ${summaryAd.visa_appointment_time}` : ""}`
    : "";
  const summaryStatus = registration?.case_status === "completed" ? "Completed" : registration?.case_status === "ready_for_next_stage" ? "Ready" : registration ? "In progress" : "Draft";
  const missingSummaryDocuments = requiredVisaDocuments.filter((definition) => !findDocument(definition)).length;

  const stepStatus: Record<number, StepStatus> = {
    1: selectedEvent ? "complete" : "warning",
    2: client ? "complete" : "warning",
    3: registration && client ? "complete" : "warning",
    4: visaDestination && visaEmbassy.trim() && visaType && visaSubmissionMethod ? "complete" : "warning",
    5: missingSummaryDocuments === 0 && !!packageDocument ? "complete" : "warning",
    6: totalAmount > 0 && amountPaid >= totalAmount ? "complete" : "warning",
    7: deliveryStatus === "sent" ? "complete" : "warning",
  };

  const reloadRegistration = async () => {
    if (registrationId) await loadRegistration(registrationId);
  };

  const storedReceipt = getStoredReceipt();

  // The model is assembled slice by slice. Because `WizardModel` is a concrete
  // interface, a key that a step needs but the controller forgets to provide
  // is now a compile error rather than a runtime `undefined`.
  const model: WizardModel = {
    shell: {
      step,
      setStep,
      registrationId,
      registration,
      client,
      caseNumber,
      currentUser,
      employees,
      assignedEmployee,
      isPending,
      onClose,
      breadcrumbLabel,
      stepStatus,
      summaryStatus,
      summaryAppointment,
      latestActivity,
      missingSummaryDocuments,
      validateStepBeforeAdvance,
      reloadRegistration,
    },
    event: {
      events: events as unknown as RegistrationEvent[],
      selectedEvent: selectedEvent as unknown as RegistrationEvent | undefined,
      selectedEventId,
      setSelectedEventId,
      participationType,
      setParticipationType,
      travelPurpose,
      setTravelPurpose,
      inviterConfig,
      handleSaveEventDetails,
      handleSaveEventDraft,
    },
    intake: {
      searchForm,
      setSearchForm,
      fullNameIsValid,
      surnameIsValid,
      passportNumberIsValid,
      nationalIdIsValid,
      phoneValidation,
      workPhoneValidation,
      emailValidation,
      phoneCountry,
      setPhoneCountry,
      workPhoneCountry,
      setWorkPhoneCountry,
      companySpecialtyOther,
      setCompanySpecialtyOther,
      jobTitleIsOther,
      setJobTitleIsOther,
      jobTitleOther,
      setJobTitleOther,
      workCityIsOther,
      setWorkCityIsOther,
      workCityOther,
      setWorkCityOther,
      searchResults,
      setSearchResults,
      hasSearched,
      setHasSearched,
      selectedPotentialMatch,
      setSelectedPotentialMatch,
      handleSearch,
      handleContinueWithClient,
      handleCreateNewClient,
      populateCompanyInformationFromClient,
      assignedTo,
      setAssignedTo,
      appNotes,
      setAppNotes,
      handleSaveIntake,
      handleSaveDraftOnly,
      clientSaveState,
      showDocumentImport,
      setShowDocumentImport,
      documentImportType,
      setDocumentImportType,
      documentImportFile,
      setDocumentImportFile,
      documentImportText,
      setDocumentImportText,
      isImportingDocument,
      processImportedDocument,
      ocrHighlightedFields,
      setOcrHighlightedFields,
    },
    visa: {
      visaDestination,
      setVisaDestination,
      visaEmbassy,
      setVisaEmbassy,
      visaEmbassyCity,
      setVisaEmbassyCity,
      visaType,
      setVisaType,
      visaPlatform,
      setVisaPlatform,
      visaSubmissionMethod,
      setVisaSubmissionMethod,
      visaPortalEmail,
      setVisaPortalEmail,
      visaPortalPassword,
      handleVisaPasswordChange,
      visaPasswordIsStored,
      isRevealingPassword,
      handleRevealVisaPassword,
      showPassword,
      setShowPassword,
      visaAccountStatus,
      setVisaAccountStatus,
      visaAppRefNumber,
      setVisaAppRefNumber,
      visaPortalAppStatus,
      setVisaPortalAppStatus,
      visaAppointmentCenter,
      setVisaAppointmentCenter,
      visaAppointmentCity,
      setVisaAppointmentCity,
      visaAppointmentDate,
      setVisaAppointmentDate,
      visaAppointmentTime,
      setVisaAppointmentTime,
      visaAppointmentRefNumber,
      setVisaAppointmentRefNumber,
      visaAppointmentStatus,
      setVisaAppointmentStatus,
      visaReminders,
      setVisaReminders,
      newReminderAt,
      setNewReminderAt,
      newReminderNote,
      setNewReminderNote,
      addVisaReminder,
      visaSaveState,
      handleVisaDestinationChange,
      handleSaveVisaDetails,
    },
    documents: {
      registrationDocuments,
      mergeableDocuments,
      packageDocument,
      packageDocumentPaths,
      setPackageDocumentPaths,
      packageName,
      setPackageName,
      includeClientInfoInPackage,
      setIncludeClientInfoInPackage,
      isPackageGenerating,
      handleMergeFiles,
      handleUploadDocument: handleStep4FileUpload,
      handleDeleteDocument,
      uploadingDocumentType,
      deletingDocumentPath,
      uploadError,
      requiredVisaDocuments,
      findDocument,
      handleAdvanceToPayment,
    },
    payment: {
      paymentCategory,
      setPaymentCategory,
      paymentMethod,
      setPaymentMethod,
      paymentDate,
      setPaymentDate,
      paymentNotes,
      setPaymentNotes,
      currency,
      setCurrency,
      currencySymbol,
      pricingItems,
      discount,
      setDiscount,
      totalAmount,
      amountPaid,
      setAmountPaid,
      balanceDue,
      canEditFeeBreakdown,
      receiptId,
      storedReceipt,
      clientReceiptUrl: String(summaryAd.client_receipt_pdf_url || ""),
      receiptArchivedAt: String(summaryAd.receipt_archived_at || ""),
      handleGenerateReceipt,
      handleDownloadReceipt,
      handlePrintReceipt,
      handleArchiveReceipt,
      handleSavePaymentDraft,
      handleAdvanceToDelivery,
    },
    delivery: {
      deliveryDocumentPaths,
      setDeliveryDocumentPaths,
      deliveryMessage,
      setDeliveryMessage,
      deliveryStatus,
      deliverySaveState,
      handleSaveDelivery,
      openWhatsApp,
      openDeliveryEmail,
    },
  };

  return <WizardView model={model} />;
}
