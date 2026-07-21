"use client";

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PLACE_OF_BIRTH_CITIES as placeOfBirthCitiesByCountry, PLACE_OF_BIRTH_COUNTRIES as placeOfBirthCountries, VISA_ROUTES, VISA_DOCUMENTS } from "./wizard-constants";
import { EMPTY_SCHENGEN_VISA, normalizePreviousSchengenVisas, normalizeResidencePermit, normalizeRegistrationDocuments, buildTravelPurpose, getPhoneValidation, getEmailValidation, normalizeLocalPhoneInput } from "./wizard-helpers";
import { EmailField, PhoneNumberField } from "./wizard-fields";
import { SearchableChoice } from "./searchable-choice";
import type { PreviousSchengenVisa, VisaAppointmentReminder, VisaDocumentDefinition } from "./wizard-types";
import { formatEventDate } from "./wizard-helpers";
import { WizardView } from "./wizard-view";
import { sanitizeEnglishText } from "@/lib/english-only";

const IRAQI_GOVERNORATES = ["Baghdad", "Basra", "Nineveh", "Anbar", "Najaf", "Karbala", "Babil", "Wasit", "Qadisiyah", "Muthanna", "Dhi Qar", "Maysan", "Kirkuk", "Salah Al-Din", "Diyala", "Erbil", "Duhok", "Sulaymaniyah"];
const normalizeWorkCity = (value: unknown) => {
  const raw = sanitizeEnglishText(String(value || "")).trim();
  const normalized = raw.replace(/\s+governorate$/i, "").trim();
  return IRAQI_GOVERNORATES.find((city) => city.toLowerCase() === normalized.toLowerCase()) || raw;
};
const SCHENGEN_COUNTRIES = ["Austria", "Belgium", "Bulgaria", "Croatia", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Italy", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland"];
const VISA_TYPE_OPTIONS = [
  { value: "C", label: "C" },
  { value: "T", label: "T" },
];
const VISA_SUBMISSION_METHODS = [
  "TLScontact",
  "VFS Global",
  "VFS Global - Baghdad",
  "VFS Global - Erbil",
  "VFS Global - Basra",
  "TLScontact - Baghdad",
  "BLS International",
  "iDATA",
  "Embassy Direct",
  "Consulate Direct",
  "Online Portal",
  "Other",
];
import { hasExactPermission } from "@/lib/permissions";
import { searchClientsWithMatchingScore, continueWithClientAction, createNewClientAndApplication, recordRegistrationActivity, updateClientData } from "../../actions";
import { uploadRegistrationDocumentDirect } from "../../registration-document-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientSummary } from "./client-summary";
import { ApplicationSummary } from "./application-summary";
import { REGISTRATION_STEPS, RegistrationProgress } from "./registration-progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, FileText, CheckCircle2, AlertTriangle, Eye, EyeOff, X, Plus, Printer, Download, FolderKanban, Lock, Clock, FileCode, RefreshCw, ExternalLink, MessageCircle, Mail, Bell, Volume2, Trash2, Upload } from "lucide-react";

// --- Types ---
// Shape of rows coming from the drift_events table (filtered by the parent
// page to `is_active = true` AND `status = 'active'`). Keep this in sync with
// progress-dashboard-client.tsx and supabase/migrations/015.
interface Event {
  id: string;
  title: string;
  title_ar: string | null;
  date: string;
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
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const canEditFeeBreakdown = hasExactPermission(currentUser?.role, "/dashboard/participation-cases/work/payment", Array.isArray(currentUser?.permissions) ? currentUser.permissions : null);

  // --- State ---
  const [step, setStep] = useState<number>(initialStep);
  const [registrationId, setRegistrationId] = useState<string | undefined>(initialRegistrationId);
  const [caseNumber, setCaseNumber] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Step 1 Search inputs
  const [searchForm, setSearchForm] = useState({
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
    previousSchengenVisas: [] as PreviousSchengenVisa[],
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
  const [visaPortalPassword, setVisaPortalPassword] = useState("");
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
  const [uploadError, setUploadError] = useState<{ type: string; message: string } | null>(null);
  const [isPackageGenerating, setIsPackageGenerating] = useState(false);

  // Step 6 Payment fields
  const [paymentCategory, setPaymentCategory] = useState("Visa Application & Services");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fees, setFees] = useState({
    service: 150,
    event: 300,
    invitation: 75,
    coordination: 200,
    appointment: 80,
    insurance: 60,
    printing: 25,
    discount: -50,
  });
  const [amountPaid, setAmountPaid] = useState(840);

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
      if (ad.visa_type) setVisaType(ad.visa_type);
      if (ad.visa_platform) setVisaPlatform(ad.visa_platform);
      if (ad.visa_submission_method) setVisaSubmissionMethod(ad.visa_submission_method);
      if (ad.visa_portal_email) setVisaPortalEmail(ad.visa_portal_email);
      if (ad.visa_portal_password) setVisaPortalPassword(ad.visa_portal_password);
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
      if (ad.payment_currency === "USD" || ad.payment_currency === "IQD") setCurrency(ad.payment_currency);
      if (ad.fee_breakdown) setFees(ad.fee_breakdown);
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
      toast.warning("تنبيه: يوجد عميل مسجل بنسبة تطابق عالية في النظام. إذا كنت متأكداً وتريد إنشاء عميل جديد، اضغط مرة أخرى على زر الحفظ.");
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
      const draftSnapshot = {
        full_name: searchForm.fullName || null,
        surname: searchForm.surname || null,
        salutation: searchForm.salutation || null,
        gender: searchForm.gender || null,
        marital_status: searchForm.maritalStatus || null,
        passport_number: searchForm.passportNumber || null,
        passport_issue_date: searchForm.passportIssueDate || null,
        passport_expiry_date: searchForm.passportExpiryDate || null,
        national_id: searchForm.nationalId || null,
        date_of_birth: searchForm.dateOfBirth || null,
        place_of_birth: searchForm.placeOfBirth || null,
        phone: normalizedSearchForm.phone || null,
        email: searchForm.email || null,
        company_name: searchForm.companyName || null,
        job_title: searchForm.jobTitle || null,
        department: searchForm.department || null,
        work_city: searchForm.workCity || null,
        work_phone: workPhoneValidation.normalized || null,
        work_email: searchForm.workEmail || null,
        residence_country: searchForm.residenceCountry || null,
        previous_schengen_visa: searchForm.previousSchengenVisa,
        schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
        other_residence_permit: {
          has_permit: searchForm.hasOtherResidencePermit,
          country: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceCountry : "",
          number: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceNumber : "",
          expiry_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceExpiryDate : "",
          issue_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceIssueDate : "",
        },
        timestamp: new Date().toISOString(),
      };

      const clientUpdateData = {
        residence_country: searchForm.residenceCountry || null,
        previous_schengen_visa: searchForm.previousSchengenVisa,
        schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
        other_residence_permit: {
          has_permit: searchForm.hasOtherResidencePermit,
          country: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceCountry : "",
          number: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceNumber : "",
          expiry_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceExpiryDate : "",
          issue_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceIssueDate : "",
        }
      };
      await updateClientData(registrationId, clientUpdateData);

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
      const snapshot = {
          full_name: searchForm.fullName || null,
          surname: searchForm.surname || null,
          salutation: searchForm.salutation || null,
          gender: searchForm.gender || null,
          marital_status: searchForm.maritalStatus || null,
          passport_number: searchForm.passportNumber || null,
          passport_issue_date: searchForm.passportIssueDate || null,
          passport_expiry_date: searchForm.passportExpiryDate || null,
          national_id: searchForm.nationalId || null,
          date_of_birth: searchForm.dateOfBirth || null,
          place_of_birth: searchForm.placeOfBirth || null,
          phone: normalizedSearchForm.phone || null,
          email: searchForm.email || null,
          company_name: searchForm.companyName || null,
          job_title: searchForm.jobTitle || null,
          department: searchForm.department || null,
          work_city: searchForm.workCity || null,
          work_phone: workPhoneValidation.normalized || null,
          work_email: searchForm.workEmail || null,
          residence_country: searchForm.residenceCountry || null,
          previous_schengen_visa: searchForm.previousSchengenVisa,
          schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
          other_residence_permit: {
            has_permit: searchForm.hasOtherResidencePermit,
            country: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceCountry : "",
            number: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceNumber : "",
            expiry_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceExpiryDate : "",
            issue_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceIssueDate : "",
          },
          timestamp: new Date().toISOString(),
      };

      const clientUpdateData = {
        residence_country: searchForm.residenceCountry || null,
        previous_schengen_visa: searchForm.previousSchengenVisa,
        schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
        other_residence_permit: {
          has_permit: searchForm.hasOtherResidencePermit,
          country: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceCountry : "",
          number: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceNumber : "",
          expiry_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceExpiryDate : "",
          issue_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceIssueDate : "",
        }
      };
      await updateClientData(registrationId, clientUpdateData);

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
      const snapshot = {
        full_name: searchForm.fullName || null,
        surname: searchForm.surname || null,
        salutation: searchForm.salutation || null,
        gender: searchForm.gender || null,
        marital_status: searchForm.maritalStatus || null,
        passport_number: searchForm.passportNumber || null,
        passport_issue_date: searchForm.passportIssueDate || null,
        passport_expiry_date: searchForm.passportExpiryDate || null,
        national_id: searchForm.nationalId || null,
        date_of_birth: searchForm.dateOfBirth || null,
        place_of_birth: searchForm.placeOfBirth || null,
        phone: normalizedSearchForm.phone || null,
        email: searchForm.email || null,
        company_name: searchForm.companyName || null,
        company_specialty: normalizedSearchForm.companySpecialty || null,
        job_title: searchForm.jobTitle || null,
        department: searchForm.department || null,
        work_city: searchForm.workCity || null,
        work_phone: workPhoneValidation.normalized || null,
        work_email: searchForm.workEmail || null,
        residence_country: searchForm.residenceCountry || null,
        previous_schengen_visa: searchForm.previousSchengenVisa,
        schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
        other_residence_permit: normalizedSearchForm.otherResidencePermit,
        timestamp: new Date().toISOString(),
      };

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
  async function handleSaveEventDetails() {
    if (!selectedEventId) {
      toast.error("Select an event first.");
      return;
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
        toast.success("Event details updated.");
        loadRegistration(registrationId);
      } catch (e: any) {
        toast.error(e.message || "Could not update the event details.");
        return;
      }
    }

    setStep(2);
  }

  function handleVisaDestinationChange(country: string) {
    const route = VISA_ROUTES.find((item) => item.country === country);
    setVisaDestination(country);
    if (!route) return;
    setVisaEmbassy(`${country} Embassy in ${visaEmbassyCity}`);
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

  async function requestReminderPermission() {
    playReminderSound();
    toast.success("Appointment reminder enabled in the dashboard.");
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

  // Appointment reminders are generated from the appointment itself:
  // four daily 08:00 reminders (D-5 through D-2), followed by a final
  // reminder one hour before the appointment.
  useEffect(() => {
    if (!visaAppointmentDate || !visaAppointmentTime) return;
    const appointment = new Date(`${visaAppointmentDate}T${visaAppointmentTime}`);
    if (Number.isNaN(appointment.getTime())) return;

    const reminders: VisaAppointmentReminder[] = [5, 4, 3, 2].map((daysBefore) => {
      const reminderDate = new Date(`${visaAppointmentDate}T08:00`);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);
      return {
        id: `appointment-${visaAppointmentDate}-${visaAppointmentTime}-d${daysBefore}`,
        remindAt: reminderDate.toISOString(),
        note: `Appointment reminder: ${daysBefore} days remaining`,
        sound: true,
      };
    });
    const finalReminder = new Date(appointment.getTime() - 60 * 60 * 1000);
    reminders.push({
      id: `appointment-${visaAppointmentDate}-${visaAppointmentTime}-one-hour`,
      remindAt: finalReminder.toISOString(),
      note: "Appointment reminder: 1 hour remaining",
      sound: true,
    });
    setVisaReminders(reminders.sort((a, b) => a.remindAt.localeCompare(b.remindAt)));
  }, [visaAppointmentDate, visaAppointmentTime]);

  useEffect(() => {
    if (!registrationId || visaReminders.length === 0) return;

    const checkReminders = async () => {
      const dueReminders = visaReminders.filter((reminder) => !reminder.notifiedAt && new Date(reminder.remindAt).getTime() <= Date.now());
      if (dueReminders.length === 0) return;

      for (const reminder of dueReminders) {
        const title = "Visa appointment reminder";
        const appointmentLabel = [visaAppointmentDate, visaAppointmentTime].filter(Boolean).join(" ") || "the scheduled time";
        const body = `${reminder.note}. Appointment: ${appointmentLabel} at ${visaAppointmentCenter || visaEmbassy}.`;
        toast.warning(title, { description: body, duration: 15000 });
        if (reminder.sound) playReminderSound();
        if (currentUser?.id) {
          await supabase.from("notifications").insert({
            user_id: currentUser.id,
            type: "visa_appointment_reminder",
            title,
            body,
            // Reopen this exact application in the Visa step.
            link_url: `/dashboard/participation-cases/work/clients?registrationId=${registrationId}&step=4`,
          });
        }
      }

      const notifiedIds = new Set(dueReminders.map((reminder) => reminder.id));
      const notifiedAt = new Date().toISOString();
      const updatedReminders = visaReminders.map((reminder) => (notifiedIds.has(reminder.id) ? { ...reminder, notifiedAt } : reminder));
      setVisaReminders(updatedReminders);
      const ad = (registration?.additional_data as Record<string, unknown>) || {};
      await supabase
        .from("registrations")
        .update({
          additional_data: { ...ad, visa_appointment_reminders: updatedReminders },
          updated_at: notifiedAt,
        })
        .eq("id", registrationId);
    };

    void checkReminders();
    // Reminders are intentionally checked every two minutes. The immediate
    // check keeps the UI responsive when the step opens without polling
    // Supabase aggressively while the wizard is idle.
    const intervalId = window.setInterval(() => void checkReminders(), 120000);
    return () => window.clearInterval(intervalId);
  }, [registrationId, visaReminders, visaAppointmentDate, visaAppointmentTime, visaAppointmentCenter, visaEmbassy, currentUser?.id, registration?.additional_data, supabase]);

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
        visa_type: visaType,
        visa_platform: visaPlatform,
        visa_submission_method: visaSubmissionMethod,
        visa_portal_email: visaPortalEmail,
        visa_portal_password: visaPortalPassword,
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
    [visaDestination, visaEmbassy, visaType, visaPlatform, visaSubmissionMethod, visaPortalEmail, visaPortalPassword, visaAccountStatus, visaAppRefNumber, visaPortalAppStatus, visaAppointmentChannel, visaAppointmentCenter, visaAppointmentCity, visaAppointmentDate, visaAppointmentTime, visaAppointmentRefNumber, visaAppointmentStatus, visaReminders],
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
      const { jsPDF } = await import("jspdf");
      const { PDFDocument } = await import("pdf-lib");
      const pdf = new jsPDF();
      const generatedAt = new Date().toLocaleString("en-GB");
      const valueOrDash = (value: unknown) => {
        const normalized = String(value ?? "").trim();
        return normalized || "—";
      };
      const applicantDetails = [
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
      ] as const;

      pdf.setFontSize(18);
      pdf.text("JAZ Visa Document Package", 20, 22);
      pdf.setFontSize(10);
      pdf.text(`Application: ${caseNumber || "Draft"}`, 20, 34);
      pdf.text(`Client: ${searchForm.fullName || client?.full_name_as_passport || "Client"}`, 20, 41);
      pdf.text(`Destination: ${visaDestination}`, 20, 48);
      pdf.text(`Generated: ${generatedAt}`, 20, 55);
      pdf.line(20, 62, 190, 62);

      pdf.setFontSize(12);
      pdf.text("Applicant details", 20, 74);
      pdf.setDrawColor(220);
      let detailsY = 82;
      applicantDetails.forEach(([label, value], index) => {
        const column = index % 2;
        const x = column === 0 ? 20 : 108;
        if (column === 0 && index > 0) detailsY += 18;
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(label, x, detailsY);
        pdf.setFontSize(10);
        pdf.setTextColor(25);
        const wrappedValue = pdf.splitTextToSize(valueOrDash(value), 78);
        pdf.text(wrappedValue.slice(0, 2), x, detailsY + 6);
        pdf.line(x, detailsY + 12, x + 78, detailsY + 12);
      });

      const detailsBottom = detailsY + 22;
      pdf.setTextColor(25);
      pdf.setFontSize(12);
      pdf.text("Visa application details", 20, detailsBottom);
      const applicationDetails = [`Event: ${selectedEvent?.title_ar || selectedEvent?.title || "—"}`, `Participation type: ${participationType || "—"}`, `Travel purpose: ${travelPurpose || "—"}`, `Visa destination: ${visaDestination || "—"}`, `Embassy: ${visaEmbassy || "—"}`, `Visa type: ${visaType || "—"}`, `Submission method: ${visaSubmissionMethod || "—"}`, `Appointment: ${[visaAppointmentDate, visaAppointmentTime].filter(Boolean).join(" ") || "—"}`, `Appointment reference: ${visaAppointmentRefNumber || "—"}`];
      pdf.setFontSize(9);
      let applicationY = detailsBottom + 9;
      applicationDetails.forEach((line) => {
        const wrappedLine = pdf.splitTextToSize(line, 166);
        pdf.text(wrappedLine, 24, applicationY);
        applicationY += wrappedLine.length * 5 + 2;
      });

      pdf.addPage();
      pdf.setFontSize(15);
      pdf.text("Documents included in this JAZ file", 20, 22);
      pdf.setFontSize(9);
      pdf.text(`Application: ${caseNumber || "Draft"}  |  Total files: ${selectedDocuments.length}`, 20, 31);
      pdf.line(20, 37, 190, 37);
      let documentsY = 48;
      selectedDocuments.forEach((document, index) => {
        const documentLine = `${index + 1}. ${document.name} (${document.type})`;
        const wrappedLine = pdf.splitTextToSize(documentLine, 160);
        const requiredHeight = wrappedLine.length * 6 + 4;
        if (documentsY + requiredHeight > 278) {
          pdf.addPage();
          pdf.setFontSize(12);
          pdf.text("Documents included — continued", 20, 22);
          pdf.line(20, 28, 190, 28);
          documentsY = 40;
          pdf.setFontSize(9);
        }
        pdf.text(wrappedLine, 24, documentsY);
        documentsY += requiredHeight;
      });
      pdf.setFontSize(8);
      pdf.text("The original documents remain available from the application record.", 20, 288);

      const mergedPdf = await PDFDocument.create();
      if (includeClientInfoInPackage) {
        const infoPdf = await PDFDocument.load(pdf.output("arraybuffer"));
        const infoPages = await mergedPdf.copyPages(infoPdf, infoPdf.getPageIndices());
        infoPages.forEach((page) => mergedPdf.addPage(page));
      }

      for (const document of selectedDocuments) {
        const response = await fetch(document.path);
        if (!response.ok) throw new Error(`Could not load file: ${document.name}`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        const contentType = response.headers.get("content-type")?.toLowerCase() || "";
        const lowerName = document.name.toLowerCase();

        if (contentType.includes("pdf") || lowerName.endsWith(".pdf")) {
          const sourcePdf = await PDFDocument.load(bytes);
          const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
          pages.forEach((page) => mergedPdf.addPage(page));
        } else if (contentType.includes("png") || lowerName.endsWith(".png")) {
          const image = await mergedPdf.embedPng(bytes);
          const page = mergedPdf.addPage([595.28, 841.89]);
          const scale = Math.min(555.28 / image.width, 801.89 / image.height);
          page.drawImage(image, { x: (595.28 - image.width * scale) / 2, y: (841.89 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
        } else if (contentType.includes("jpeg") || contentType.includes("jpg") || /\.(jpe?g)$/i.test(lowerName)) {
          const image = await mergedPdf.embedJpg(bytes);
          const page = mergedPdf.addPage([595.28, 841.89]);
          const scale = Math.min(555.28 / image.width, 801.89 / image.height);
          page.drawImage(image, { x: (595.28 - image.width * scale) / 2, y: (841.89 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
        } else {
          throw new Error(`Unsupported package file: ${document.name}. Use PDF, PNG, or JPG.`);
        }
      }

      const mergedBytes = await mergedPdf.save();
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

  // --- Step 6: Fee Calculation & Receipt Issue ---
  const totalAmount = useMemo(() => {
    return Object.values(fees).reduce((acc, val) => acc + val, 0);
  }, [fees]);

  const balanceDue = useMemo(() => {
    return totalAmount - amountPaid;
  }, [totalAmount, amountPaid]);

  async function handleGenerateReceipt() {
    if (!registrationId) return;
    toast.loading("Generating the client receipt...");
    try {
      const { jsPDF } = await import("jspdf");
      const receiptId = `RCPT-${new Date().getFullYear()}-${caseNumber.split("-").pop() || "00124"}`;
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const left = 18;
      const right = pageWidth - 18;
      const clientName = client?.full_name_as_passport || searchForm.fullName || "Client";
      const eventName = selectedEvent?.title || selectedEvent?.title_ar || "Event not set";
      const money = (value: number) => `${currency === "IQD" ? "د.ع" : "$"} ${value.toFixed(2)}`;
      const drawLabelValue = (label: string, value: string, x: number, y: number, width: number) => {
        pdf.setFontSize(7.5);
        pdf.setTextColor(112, 128, 144);
        pdf.text(label.toUpperCase(), x, y);
        pdf.setFontSize(9.5);
        pdf.setTextColor(31, 41, 55);
        const lines = pdf.splitTextToSize(value || "—", width);
        pdf.text(lines, x, y + 5);
      };

      // Branded header
      pdf.setFillColor(139, 0, 0);
      pdf.rect(0, 0, pageWidth, 34, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(21);
      pdf.text("JAZ", left, 16);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("APPLICATIONS CONTROL", left, 23);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      pdf.text("PAYMENT RECEIPT", right, 16, { align: "right" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.text(receiptId, right, 23, { align: "right" });

      // Receipt metadata
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(left, 44, pageWidth - 36, 27, 3, 3, "F");
      drawLabelValue("Receipt number", receiptId, left + 6, 51, 45);
      drawLabelValue("Issue date", paymentDate || new Date().toLocaleDateString("en-GB"), left + 62, 51, 45);
      drawLabelValue("Payment method", paymentMethod || "—", left + 118, 51, 55);

      // Client and application details
      pdf.setTextColor(139, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("CLIENT & APPLICATION", left, 84);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(left, 87, right, 87);
      drawLabelValue("Client name", clientName, left, 96, 75);
      drawLabelValue("Application ID", caseNumber || "Draft", left + 82, 96, 45);
      drawLabelValue("Event", eventName, left + 137, 96, 37);

      // Complete fee breakdown
      pdf.setTextColor(139, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("FEE BREAKDOWN", left, 124);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(left, 128, pageWidth - 36, 70, 3, 3, "F");
      const feeRows = [
        ["Service Fee", fees.service],
        ["Event Registration Fee", fees.event],
        ["Invitation Letter Fee", fees.invitation],
        ["Visa Coordination Fee", fees.coordination],
        ["Appointment Fee", fees.appointment],
        ["Insurance Fee", fees.insurance],
        ["Printing / Document Fee", fees.printing],
        ["Discount", fees.discount],
      ] as const;
      let feeY = 138;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      feeRows.forEach(([label, value]) => {
        pdf.setTextColor(label === "Discount" ? 190 : 71, label === "Discount" ? 24 : 85, label === "Discount" ? 93 : 105);
        pdf.text(label, left + 7, feeY);
        pdf.text(money(value), right - 7, feeY, { align: "right" });
        pdf.setDrawColor(226, 232, 240);
        pdf.line(left + 7, feeY + 3, right - 7, feeY + 3);
        feeY += 7.5;
      });

      // Totals panel
      pdf.setFillColor(139, 0, 0);
      pdf.roundedRect(left, 208, pageWidth - 36, 39, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("TOTAL AMOUNT", left + 8, 219);
      pdf.text("AMOUNT PAID", left + 8, 230);
      pdf.text("BALANCE DUE", left + 8, 241);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(money(totalAmount), right - 8, 219, { align: "right" });
      pdf.text(money(amountPaid), right - 8, 230, { align: "right" });
      pdf.text(money(balanceDue), right - 8, 241, { align: "right" });

      if (paymentNotes) {
        pdf.setTextColor(71, 85, 105);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("NOTES", left, 263);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(pdf.splitTextToSize(paymentNotes, pageWidth - 36), left, 270);
      }
      pdf.setDrawColor(226, 232, 240);
      pdf.line(left, 282, right, 282);
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(8);
      pdf.text("Generated by JAZ Applications Control", left, 290);
      pdf.text(caseNumber || registrationId, right, 290, { align: "right" });

      const fileName = `Payment_Receipt_${caseNumber || registrationId}.pdf`;
      const receiptFile = new File([pdf.output("blob")], fileName, { type: "application/pdf" });
      const upload = (await uploadRegistrationDocumentDirect(registrationId, receiptFile, "receipt", fileName)) as any;
      if (upload.error) throw new Error(upload.error);
      const receiptUrl = upload.url || "";

      // Create a separate client-facing receipt without internal fee details.
      const clientPdf = new jsPDF({ unit: "mm", format: "a4" });
      const clientSafeName = clientName.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "Client";
      const clientCompany = client?.company_name || client?.employer_name || searchForm.companyName || "—";
      const clientFileName = `JAZ_Payment_Receipt_${clientSafeName}_${receiptId}.pdf`;
      let logoDataUrl = "";
      try {
        const logoBlob = await fetch("/Joint Annual Zone logo.png").then((response) => response.blob());
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.readAsDataURL(logoBlob);
        });
      } catch {
        logoDataUrl = "";
      }
      clientPdf.setFillColor(11, 52, 58);
      clientPdf.rect(0, 0, pageWidth, 42, "F");
      clientPdf.setFillColor(38, 190, 151);
      clientPdf.rect(0, 0, pageWidth * 0.22, 42, "F");
      clientPdf.setFillColor(246, 190, 32);
      clientPdf.triangle(pageWidth * 0.22, 42, pageWidth * 0.31, 42, pageWidth * 0.27, 25, "F");
      if (logoDataUrl) clientPdf.addImage(logoDataUrl, "PNG", left, 8, 30, 20);
      clientPdf.setTextColor(255, 255, 255);
      clientPdf.setFont("helvetica", "bold");
      clientPdf.setFontSize(17);
      clientPdf.text("PAYMENT RECEIPT", right, 18, { align: "right" });
      clientPdf.setFont("helvetica", "normal");
      clientPdf.setFontSize(8.5);
      clientPdf.text(receiptId, right, 27, { align: "right" });
      clientPdf.setTextColor(83, 48, 91);
      clientPdf.setFont("helvetica", "bold");
      clientPdf.setFontSize(15);
      clientPdf.text("Your payment", pageWidth / 2, 57, { align: "center" });
      clientPdf.setTextColor(31, 41, 55);
      clientPdf.setFont("helvetica", "normal");
      clientPdf.setFontSize(8.5);
      clientPdf.text(`Order number: ${receiptId}`, left, 72);
      clientPdf.text(`Order date: ${paymentDate || new Date().toLocaleDateString("en-GB")}`, left, 79);
      clientPdf.text("Order status: Confirmed", left, 86);
      clientPdf.text(`Method of payment: ${paymentMethod || "—"}`, left, 93);
      const clientInfoX = right - 76;
      clientPdf.text(`Client name: ${clientName}`, clientInfoX, 72);
      clientPdf.text(`Company: ${clientCompany}`, clientInfoX, 79);
      clientPdf.text(`Application: ${caseNumber || "—"}`, clientInfoX, 86);
      clientPdf.setDrawColor(148, 163, 184);
      clientPdf.setLineWidth(0.35);
      const tableTop = 119;
      const tableBottom = 139;
      const quantityX = left + 48;
      const amountX = right - 92;
      clientPdf.line(left, tableTop, right, tableTop);
      clientPdf.line(left, tableTop + 8, right, tableTop + 8);
      clientPdf.line(left, tableBottom, right, tableBottom);
      clientPdf.line(quantityX, tableTop, quantityX, tableBottom);
      clientPdf.line(amountX, tableTop, amountX, tableBottom);
      clientPdf.setFont("helvetica", "bold");
      clientPdf.setFontSize(8);
      clientPdf.text("Description", left + 5, tableTop + 5);
      clientPdf.text("Quantity", quantityX + 5, tableTop + 5);
      clientPdf.text("Total amount (incl. services)", amountX + 5, tableTop + 5);
      clientPdf.setFont("helvetica", "normal");
      clientPdf.text("Event & visa services", left + 2, tableTop + 15);
      clientPdf.text("1", quantityX + 8, tableTop + 15);
      clientPdf.text(`(${money(totalAmount)})`, right - 5, tableTop + 15, { align: "right" });
      clientPdf.setFont("helvetica", "bold");
      clientPdf.setFontSize(9);
      clientPdf.text("TOTAL (incl. services):", right - 5, 155, { align: "right" });
      clientPdf.text(`(${money(totalAmount)})`, right - 5, 163, { align: "right" });
      clientPdf.setTextColor(100, 116, 139);
      clientPdf.setFont("helvetica", "normal");
      clientPdf.setFontSize(8.5);
      clientPdf.text("Thank you for your payment.", left, 252);
      clientPdf.setDrawColor(226, 232, 240);
      clientPdf.line(left, 263, right, 263);
      clientPdf.setTextColor(71, 85, 105);
      clientPdf.setFont("helvetica", "bold");
      clientPdf.setFontSize(8);
      clientPdf.text("JOINT ANNUAL ZONE (JAZ)", left, 272);
      clientPdf.setFont("helvetica", "normal");
      clientPdf.setFontSize(7.5);
      clientPdf.text("Iraq's gateway to international exhibitions and partnerships", left, 278);
      clientPdf.text("info@jaz.iq  •  +964 771 900 0600  •  www.jaz.iq", left, 284);
      clientPdf.text(receiptId, right, 287, { align: "right" });
      const clientReceiptFile = new File([clientPdf.output("blob")], clientFileName, { type: "application/pdf" });
      const clientUpload = (await uploadRegistrationDocumentDirect(registrationId, clientReceiptFile, "client_receipt", clientFileName)) as any;
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
        ...(canEditFeeBreakdown ? { fee_breakdown: fees } : {}),
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
          payment_status: balanceDue <= 0 ? "paid" : "partially_paid",
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

  async function handleSavePaymentDraft() {
    if (!registrationId) return;
    try {
      const ad = (registration?.additional_data as Record<string, unknown>) || {};
      const { error } = await supabase
        .from("registrations")
        .update({
          total_amount: totalAmount,
          additional_data: {
            ...ad,
            payment_category: paymentCategory,
            payment_method: paymentMethod,
            payment_date: paymentDate,
            payment_notes: paymentNotes,
            payment_currency: currency,
            ...(canEditFeeBreakdown ? { fee_breakdown: fees } : {}),
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
        metadata: { payment_status: registration?.payment_status, amount_paid: amountPaid, payment_currency: currency },
      });
      toast.success("Payment draft saved.");
      await loadRegistration(registrationId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the payment draft.");
    }
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
    switch (step) {
      case 1:
        return "Select Event";
      case 2:
        return "Select Event > Search Client";
      case 3:
        return "Select Event > Search Client > New Application";
      case 4:
        return "Select Event > Search Client > New Application > Visa Application & Appointment";
      case 5:
        return "Select Event > Search Client > New Application > Visa Application & Appointment > Document Assembly & Archiving";
      case 6:
        return "Select Event > Search Client > New Application > Visa Application & Appointment > Document Assembly & Archiving > Payment & Receipt";
      case 7:
        return "Select Event > Search Client > New Application > Visa Application & Appointment > Document Assembly & Archiving > Payment & Receipt > Client File Delivery & Status";
      default:
        return "Select Event";
    }
  }, [step]);

  const assignedEmployee = employees.find((employee) => employee.id === assignedTo);
  const latestActivity = Array.isArray(registration?.registration_events) ? [...registration.registration_events].sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))[0] : null;
  const summaryAd = (registration?.additional_data as Record<string, any>) || {};
  const summaryAppointment = summaryAd.visa_appointment_date ? `${summaryAd.visa_appointment_date}${summaryAd.visa_appointment_time ? ` ${summaryAd.visa_appointment_time}` : ""}` : "";
  const summaryStatus = registration?.case_status === "completed" ? "Completed" : registration?.case_status === "ready_for_next_stage" ? "Ready" : registration ? "In progress" : "Draft";
  const missingSummaryDocuments = requiredVisaDocuments.filter((definition) => !findDocument(definition)).length;
  const stepStatus = {
    1: selectedEvent ? "complete" : "warning",
    2: client ? "complete" : "warning",
    3: registration && client ? "complete" : "warning",
    4: visaDestination && visaEmbassy.trim() && visaType && visaSubmissionMethod ? "complete" : "warning",
    5: missingSummaryDocuments === 0 && !!packageDocument ? "complete" : "warning",
    6: amountPaid >= totalAmount ? "complete" : "warning",
    7: deliveryStatus === "sent" ? "complete" : "warning",
  } as const;

  return (
    <WizardView
      {...{
        AlertTriangle,
        ApplicationSummary,
        Badge,
        Bell,
        Button,
        Card,
        CheckCircle2,
        ClientSummary,
        Clock,
        Download,
        EMPTY_SCHENGEN_VISA,
        EmailField,
        ExternalLink,
        Eye,
        EyeOff,
        FileCode,
        FileText,
        FolderKanban,
        IRAQI_GOVERNORATES,
        Input,
        Lock,
        Mail,
        MessageCircle,
        PhoneNumberField,
        Plus,
        Printer,
        REGISTRATION_STEPS,
        RefreshCw,
        RegistrationProgress,
        SCHENGEN_COUNTRIES,
        Search,
        SearchableChoice,
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
        Trash2,
        Upload,
        User,
        VISA_DOCUMENTS,
        VISA_ROUTES,
        VISA_SUBMISSION_METHODS,
        VISA_TYPE_OPTIONS,
        Volume2,
        X,
        addVisaReminder,
        amountPaid,
        appNotes,
        assignedEmployee,
        assignedTo,
        balanceDue,
        breadcrumbLabel,
        buildTravelPurpose,
        canEditFeeBreakdown,
        caseNumber,
        client,
        clientSaveState,
        cn,
        companySpecialtyOther,
        currentUser,
        deliveryDocumentPaths,
        deliveryMessage,
        deliveryStatus,
        documentImportFile,
        documentImportText,
        documentImportType,
        emailValidation,
        employees,
        events,
        fees,
        findDocument,
        formatEventDate,
        fullNameIsValid,
        handleArchiveReceipt,
        handleContinueWithClient,
        handleCreateNewClient,
        handleDownloadReceipt,
        handleGenerateReceipt,
        handleMergeFiles,
        handlePrintReceipt,
        handleSaveDraftOnly,
        handleSaveEventDetails,
        handleSaveIntake,
        handleSavePaymentDraft,
        handleSaveVisaDetails,
        handleSearch,
        handleStep4FileUpload,
        handleVisaDestinationChange,
        hasSearched,
        includeClientInfoInPackage,
        inviterConfig,
        isImportingDocument,
        isPackageGenerating,
        isPending,
        jobTitleIsOther,
        jobTitleOther,
        latestActivity,
        mergeableDocuments,
        missingSummaryDocuments,
        nationalIdIsValid,
        newReminderAt,
        newReminderNote,
        onClose,
        openWhatsApp,
        openDeliveryEmail,
        packageDocument,
        packageDocumentPaths,
        packageName,
        participationType,
        passportNumberIsValid,
        paymentCategory,
        currency,
        paymentDate,
        paymentMethod,
        paymentNotes,
        phoneCountry,
        workPhoneCountry,
        setWorkPhoneCountry,
        phoneValidation,
        placeOfBirthCitiesByCountry,
        placeOfBirthCountries,
        processImportedDocument,
        populateCompanyInformationFromClient,
        ocrHighlightedFields,
        setOcrHighlightedFields,
        registration,
        registrationDocuments,
        registrationId,
        requiredVisaDocuments,
        router,
        searchForm,
        searchResults,
        selectedEvent,
        selectedEventId,
        selectedPotentialMatch,
        setAmountPaid,
        setCurrency,
        setAppNotes,
        setAssignedTo,
        setCompanySpecialtyOther,
        setDeliveryDocumentPaths,
        setDeliveryMessage,
        setDocumentImportFile,
        setDocumentImportText,
        setDocumentImportType,
        setFees,
        setHasSearched,
        setIncludeClientInfoInPackage,
        setJobTitleIsOther,
        setJobTitleOther,
        setNewReminderAt,
        setNewReminderNote,
        setPackageDocumentPaths,
        setPackageName,
        setParticipationType,
        setPaymentCategory,
        setPaymentDate,
        setPaymentMethod,
        setPaymentNotes,
        setPhoneCountry,
        setSearchForm,
        setSearchResults,
        setSelectedEventId,
        setSelectedPotentialMatch,
        setShowDocumentImport,
        setShowPassword,
        setStep,
        setTravelPurpose,
        setVisaAccountStatus,
        setVisaAppRefNumber,
        setVisaAppointmentCenter,
        setVisaAppointmentChannel,
        setVisaAppointmentCity,
        setVisaAppointmentDate,
        setVisaAppointmentRefNumber,
        setVisaAppointmentStatus,
        setVisaAppointmentTime,
        setVisaEmbassy,
        setVisaEmbassyCity,
        setVisaPlatform,
        setVisaPortalAppStatus,
        setVisaPortalEmail,
        setVisaPortalPassword,
        setVisaReminders,
        setVisaSubmissionMethod,
        setVisaType,
        setWorkCityIsOther,
        setWorkCityOther,
        showDocumentImport,
        showPassword,
        step,
        stepStatus,
        summaryAppointment,
        summaryStatus,
        surnameIsValid,
        toast,
        totalAmount,
        travelPurpose,
        uploadError,
        uploadingDocumentType,
        validateStepBeforeAdvance,
        visaAccountStatus,
        visaAppRefNumber,
        visaAppointmentCenter,
        visaAppointmentChannel,
        visaAppointmentCity,
        visaAppointmentDate,
        visaAppointmentRefNumber,
        visaAppointmentStatus,
        visaAppointmentTime,
        visaDestination,
        visaEmbassyCity,
        visaPlatform,
        visaPortalAppStatus,
        visaPortalEmail,
        visaPortalPassword,
        visaReminders,
        visaSubmissionMethod,
        visaType,
        workCityIsOther,
        workCityOther,
      }}
    />
  );
}
