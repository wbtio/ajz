import fs from "node:fs/promises";
import path from "node:path";
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

const sourceRoot = path.resolve("tmp/pdfs/client-fix-2026-07-23");
const bucket = "events-bucket";
const cigreEventId = "7efec3a1-c1ef-44f5-a6ab-f32bff0e0496";
const silmoEventId = "fd138f16-667a-41ba-b2b1-268c7d8461b8";
const auditTimestamp = new Date().toISOString();

const cigre = {
  id: cigreEventId,
  title: "CIGRE Paris Session 2026",
  start: "2026-08-23",
  end: "2026-08-28",
  venue: "Palais des Congrès de Paris, 2 Place de la Porte Maillot, 75017 Paris, France",
  host: "CIGRE Association",
  contactName: "Philippe ADAM",
  contactEmail: "registrations@cigre.org",
  contactPhone: "+33153891290",
};

const silmo = {
  id: silmoEventId,
  title: "SILMO Paris 2026 - International Optics & Eyewear Exhibition",
  start: "2026-09-25",
  end: "2026-09-28",
  venue: "Paris Nord Villepinte Exhibition Center, Paris, France",
  host: "SILMO Paris",
  contactName: "Meryll Daillier",
  contactEmail: "meryll.daillier@comexposium.com",
  contactPhone: "+33761780210",
};

const specs = [
  {
    slug: "shatha",
    caseNumber: "JAZ-26-00002",
    duplicateCases: ["JAZ-26-00008"],
    event: silmo,
    fullName: "SHATHA HASHIM ALI AL-OBAIDI",
    firstName: "SHATHA HASHIM ALI",
    lastName: "AL-OBAIDI",
    sex: "Female",
    birthDate: "1969-11-10",
    birthCity: "BASRA",
    city: "BAGHDAD",
    passport: "B39611975",
    passportIssue: "2025-09-09",
    passportExpiry: "2033-09-08",
    email: "jaz.registr@gmail.com",
    phone: "+9647902625760",
    employer: "SILVANA OPTICAL",
    jobTitle: "Company director",
    workCity: "BAGHDAD",
    workPhone: "+9647902625760",
    workEmail: "jaz.registr@gmail.com",
    homeAddress: "BAGHDAD, BAGHDAD, Iraq",
    workAddress: "BAGHDAD, BAGHDAD, Iraq",
    travelStart: "2026-09-20",
    travelEnd: "2026-10-01",
    visaReference: "FRA1BG20267005609",
    appointmentDate: "2026-07-19",
    appointmentTime: "10:00",
    appointmentReference: "26880802",
    insurancePolicy: "ins_201544248",
    insuranceStart: "2026-09-22",
    insuranceEnd: "2026-10-10",
    previousSchengen: false,
    previousVisaNumber: null,
    invitationRegistration: null,
  },
  {
    slug: "al-hakam",
    caseNumber: "JAZ-26-00003",
    duplicateCases: [],
    event: cigre,
    fullName: "AL-HAKAM TAWFEEQ",
    firstName: "AL-HAKAM",
    lastName: "TAWFEEQ",
    sex: "Male",
    birthDate: "1988-09-11",
    birthCity: "BAGHDAD",
    city: "BAGHDAD",
    passport: "B08773299",
    passportIssue: "2024-01-25",
    passportExpiry: "2032-01-24",
    email: "alhakam.mohanad1988@gmail.com",
    phone: "+9647710309474",
    employer: "GENERAL COMPANY OF ELECTRICITY TRANSMISSION",
    jobTitle: "Employee",
    workCity: "BAGHDAD",
    workPhone: "+9647710309474",
    workEmail: "firstmiddle.2014@yahoo.com",
    homeAddress: "BAGHDAD, BAGHDAD, Iraq",
    workAddress: "BAGHDAD, BAGHDAD, Iraq",
    travelStart: "2026-08-15",
    travelEnd: "2026-09-04",
    visaReference: "FRA1BG20267006360",
    appointmentDate: "2026-07-19",
    appointmentTime: "08:30",
    appointmentReference: "27003875",
    insurancePolicy: "ins_201556128",
    insuranceStart: "2026-08-21",
    insuranceEnd: "2026-08-31",
    previousSchengen: true,
    previousVisaNumber: "FRA615160973",
    invitationRegistration: "QWWN6YREBH",
  },
  {
    slug: "bland",
    caseNumber: "JAZ-26-00010",
    duplicateCases: [],
    event: cigre,
    fullName: "BLAND DAROKA",
    firstName: "BLAND",
    lastName: "DAROKA",
    sex: "Male",
    birthDate: "1976-05-22",
    birthCity: "BAGHDAD",
    city: "BAGHDAD",
    passport: "A21184455",
    passportIssue: "2023-03-22",
    passportExpiry: "2031-03-21",
    email: "Blandraad@yahoo.com",
    phone: "+9647901449954",
    employer: "OUTSTANDING WORKS COMP. FOR GENERAL TRADING AND MANUFACTURE OF ELECTRIC POLES LIMITED",
    jobTitle: "Company executive",
    workCity: "BAGHDAD",
    workPhone: "+9647703998999",
    workEmail: "Blandraad@yahoo.com",
    homeAddress: "BAGHDAD, BAGHDAD, Iraq",
    workAddress: "BAGHDAD, BAGHDAD, Iraq",
    travelStart: "2026-08-22",
    travelEnd: "2026-08-29",
    visaReference: "FRA1BG20267007545",
    appointmentDate: "2026-07-16",
    appointmentTime: "09:30",
    appointmentReference: "27275199",
    insurancePolicy: "ins_201555959",
    insuranceStart: "2026-08-21",
    insuranceEnd: "2026-08-30",
    previousSchengen: false,
    previousVisaNumber: null,
    invitationRegistration: "C65RC8B2F9",
  },
  {
    slug: "hadeer",
    caseNumber: "JAZ-26-00012",
    duplicateCases: [],
    event: cigre,
    fullName: "HADEER AL SALIHI",
    firstName: "HADEER",
    lastName: "AL SALIHI",
    sex: "Male",
    birthDate: "1974-03-30",
    birthCity: "DIYALA",
    city: "BAGHDAD",
    passport: "B06320039",
    passportIssue: "2024-02-06",
    passportExpiry: "2032-02-05",
    email: "ghd994684@gmail.com",
    phone: "+9647721355170",
    employer: "MINISTRY OF ELECTRICITY",
    jobTitle: "Technical Manager",
    department: "Investments and Contracts",
    nationalId: "197487417481",
    workCity: "BAGHDAD",
    workPhone: "+9647721355170",
    workEmail: "ghd994684@gmail.com",
    homeAddress: "BAGHDAD, BAGHDAD, Iraq",
    workAddress: "BAGHDAD, BAGHDAD, Iraq",
    travelStart: "2026-08-22",
    travelEnd: "2026-08-29",
    visaReference: "FRA1BG20267007728",
    appointmentDate: "2026-08-04",
    appointmentTime: "08:15",
    appointmentReference: "27021606",
    insurancePolicy: "ins_201556578",
    insuranceStart: "2026-08-22",
    insuranceEnd: "2026-08-29",
    previousSchengen: true,
    previousVisaNumber: "CHE007406962",
    invitationRegistration: "S8J4XWVK0E",
    companyLetter: true,
  },
  {
    slug: "hussein",
    caseNumber: null,
    duplicateCases: [],
    event: cigre,
    fullName: "HUSSEIN ISAWI",
    firstName: "HUSSEIN",
    lastName: "ISAWI",
    sex: "Male",
    birthDate: "1968-01-18",
    birthCity: "BAGHDAD",
    city: "WASIT",
    passport: "B45635275",
    passportIssue: "2026-04-13",
    passportExpiry: "2034-04-12",
    email: "husen.hashem@gmail.com",
    phone: "+9647801423656",
    employer: "GENERAL COMPANY OF ELECTRICITY TRANSMISSION",
    jobTitle: "Employee",
    workCity: "WASIT",
    workPhone: "+9647801423656",
    workEmail: "firstmiddle.2014@yahoo.com",
    homeAddress: "WASIT, WASIT, Iraq",
    workAddress: "WASIT, WASIT, Iraq",
    travelStart: "2026-08-15",
    travelEnd: "2026-09-04",
    visaReference: "FRA1BG20267006403",
    appointmentDate: "2026-07-19",
    appointmentTime: "10:00",
    appointmentReference: "27004330",
    insurancePolicy: "ins_201556134",
    insuranceStart: "2026-08-21",
    insuranceEnd: "2026-08-31",
    previousSchengen: true,
    previousVisaNumber: "D068330110",
    invitationRegistration: "ZN1CMQZI35",
  },
  {
    slug: "kareem",
    caseNumber: "JAZ-26-00011",
    duplicateCases: [],
    event: cigre,
    fullName: "KAREEM DURAYE",
    firstName: "KAREEM",
    lastName: "DURAYE",
    sex: "Male",
    birthDate: "1979-06-23",
    birthCity: "BAGHDAD",
    city: "BAGHDAD",
    passport: "A20271958",
    passportIssue: "2022-06-13",
    passportExpiry: "2030-06-12",
    email: "kareem.dreeay@gmail.com",
    phone: "+9647880071599",
    employer: "ABER AL-HAREER COMPANY FOR GENERAL TRADING AND PUBLIC TRANSPORTATION",
    jobTitle: "Company director",
    workCity: "BAGHDAD",
    workPhone: "+9647880071599",
    workEmail: "kareem.dreeay@gmail.com",
    homeAddress: "BAGHDAD, BAGHDAD, Iraq",
    workAddress: "BAGHDAD, BAGHDAD, Iraq",
    travelStart: "2026-08-15",
    travelEnd: "2026-09-04",
    visaReference: "FRA1BG20267006365",
    appointmentDate: "2026-07-16",
    appointmentTime: "10:45",
    appointmentReference: "27021361",
    insurancePolicy: "ins_201555953",
    insuranceStart: "2026-08-15",
    insuranceEnd: "2026-09-04",
    previousSchengen: false,
    previousVisaNumber: null,
    invitationRegistration: "FQJ7P4IFJC",
    uncertainDocuments: ["company_documents_pages_13_18"],
  },
  {
    slug: "luay",
    caseNumber: "JAZ-26-00013",
    duplicateCases: [],
    event: cigre,
    fullName: "LUAY AL-SAJRI",
    firstName: "LUAY",
    lastName: "AL-SAJRI",
    sex: "Male",
    birthDate: "1985-09-12",
    birthCity: "BAGHDAD",
    city: "BAGHDAD",
    passport: "B23818317",
    passportIssue: "2025-02-02",
    passportExpiry: "2033-02-01",
    email: "Luay@asg-solution.com",
    phone: "+9647811111356",
    employer: "ALSOQOUR GROUP COMPANY",
    jobTitle: "Company director",
    workCity: "BAGHDAD",
    workPhone: "+9647811111356",
    workEmail: "Luay@asg-solution.com",
    homeAddress: "BAGHDAD, BAGHDAD, Iraq",
    workAddress: "14 RAMADAN STREET, AL MANSOUR DISTRICT, BAGHDAD, Iraq",
    travelStart: "2026-08-15",
    travelEnd: "2026-09-03",
    visaReference: "FRA1BG20267006400",
    appointmentDate: "2026-07-16",
    appointmentTime: "10:00",
    appointmentReference: "27017847",
    insurancePolicy: "ins_201555734",
    insuranceStart: "2026-08-15",
    insuranceEnd: "2026-09-03",
    previousSchengen: true,
    previousVisaNumber: "ITA046138510",
    invitationRegistration: "IM8FEHGKP5",
  },
  {
    slug: "miran",
    caseNumber: "JAZ-2026-00001",
    duplicateCases: [],
    event: cigre,
    fullName: "MIRAN AKRAM",
    firstName: "MIRAN",
    lastName: "AKRAM",
    sex: "Male",
    birthDate: "1990-03-29",
    birthCity: "BAGHDAD",
    city: "BAGHDAD",
    passport: "B00548044",
    passportIssue: "2023-06-08",
    passportExpiry: "2031-06-07",
    email: "Meranpayman90@gmail.com",
    phone: "+9647700853474",
    employer: "SOLAR PILLARS TECHNOLOGY",
    jobTitle: "Company director",
    workCity: "BAGHDAD",
    workPhone: "+9647700853474",
    workEmail: "Meranpayman90@gmail.com",
    homeAddress: "BAGHDAD, BAGHDAD, Iraq",
    workAddress: "BAGHDAD, BAGHDAD, Iraq",
    travelStart: "2026-08-15",
    travelEnd: "2026-09-03",
    visaReference: "FRA1BG20267006465",
    appointmentDate: "2026-07-19",
    appointmentTime: "10:15",
    appointmentReference: "27058522",
    insurancePolicy: "ins_201556518",
    insuranceStart: "2026-08-15",
    insuranceEnd: "2026-09-03",
    previousSchengen: false,
    previousVisaNumber: null,
    invitationRegistration: "NPETQ848YZ",
  },
  {
    slug: "mohammed",
    caseNumber: "JAZ-26-00014",
    duplicateCases: [],
    event: cigre,
    fullName: "MOHAMMED KHUDHAIR ALI AL SHAMARTI",
    firstName: "MOHAMMED KHUDHAIR ALI",
    lastName: "AL SHAMARTI",
    sex: "Male",
    birthDate: "1984-10-09",
    birthCity: "NAJAF",
    city: "NAJAF",
    passport: "B00888694",
    passportIssue: "2023-07-13",
    passportExpiry: "2031-07-12",
    email: "mohammed.fayroz@gmail.com",
    phone: "+9647809169797",
    employer: "OUTSTANDING WORKS COMP.",
    jobTitle: "Company executive",
    workCity: "BAGHDAD",
    workPhone: "+9647703998999",
    workEmail: "mohammed.fayroz@gmail.com",
    homeAddress: "NAJAF, NAJAF, Iraq",
    workAddress: "BAGHDAD, BAGHDAD, Iraq",
    travelStart: "2026-08-22",
    travelEnd: "2026-08-29",
    visaReference: "FRA1BG20267007548",
    appointmentDate: "2026-07-05",
    appointmentTime: "08:45",
    appointmentReference: "27274837",
    insurancePolicy: "ins_201551623",
    insuranceStart: "2026-08-22",
    insuranceEnd: "2026-08-29",
    previousSchengen: true,
    previousVisaNumber: "D071073233",
    invitationRegistration: "F585DA2WUY",
  },
  {
    slug: "muayad",
    caseNumber: "JAZ-26-00004",
    duplicateCases: ["JAZ-26-00005"],
    event: cigre,
    fullName: "MUAYAD JABBOOREE",
    firstName: "MUAYAD",
    lastName: "JABBOOREE",
    sex: "Male",
    birthDate: "1978-08-28",
    birthCity: "BAGHDAD",
    city: "BAGHDAD",
    passport: "B43990552",
    passportIssue: "2026-01-13",
    passportExpiry: "2034-01-12",
    email: "muaied_azeez300@yahoo.com",
    phone: "+9647901811310",
    employer: "GENERAL COMPANY OF ELECTRICITY TRANSMISSION",
    jobTitle: "Employee",
    workCity: "BAGHDAD",
    workPhone: "+9647901811310",
    workEmail: "firstmiddle.2014@yahoo.com",
    homeAddress: "BAGHDAD, BAGHDAD, Iraq",
    workAddress: "BAGHDAD, BAGHDAD, Iraq",
    travelStart: "2026-08-15",
    travelEnd: "2026-09-04",
    visaReference: "FRA1BG20267006361",
    appointmentDate: "2026-07-19",
    appointmentTime: "08:45",
    appointmentReference: "27004049",
    insurancePolicy: "ins_201556131",
    insuranceStart: "2026-08-21",
    insuranceEnd: "2026-08-31",
    previousSchengen: false,
    previousVisaNumber: null,
    invitationRegistration: "DP3N49FYJK",
  },
  {
    slug: "tahseen",
    caseNumber: "JAZ-26-00015",
    duplicateCases: [],
    event: cigre,
    fullName: "TAHSEEN ALI ABD ALMUHSEN",
    firstName: "TAHSEEN ALI ABD ALMUHSEN",
    lastName: "ABD ALMUHSEN",
    sex: "Male",
    birthDate: "1983-08-29",
    birthCity: "WASIT",
    city: "WASIT",
    passport: "B45679132",
    passportIssue: "2026-06-03",
    passportExpiry: "2034-06-02",
    email: "tahseenengineer@gmx.com",
    phone: "+9647726526714",
    employer: "GENERAL COMPANY OF ELECTRICITY TRANSMISSION",
    jobTitle: "Employee",
    workCity: "WASIT",
    workPhone: "+9647726526714",
    workEmail: "firstmiddle.2014@yahoo.com",
    homeAddress: "WASIT, WASIT, Iraq",
    workAddress: "WASIT, WASIT, Iraq",
    travelStart: "2026-08-15",
    travelEnd: "2026-09-04",
    visaReference: "FRA1BG20267006366",
    appointmentDate: "2026-07-19",
    appointmentTime: "10:00",
    appointmentReference: "27004170",
    insurancePolicy: "ins_201556137",
    insuranceStart: "2026-08-21",
    insuranceEnd: "2026-08-31",
    previousSchengen: true,
    previousVisaNumber: "D071073215",
    invitationRegistration: "IKAMCIJ1N7",
  },
];

function normalize(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function iraqPhoneParts(phone) {
  const digits = phone.replace(/\D/g, "");
  if (!digits.startsWith("964")) throw new Error(`Unexpected Iraqi phone: ${phone}`);
  return { code: "+964", number: `0${digits.slice(3)}` };
}

function coverageConflict(spec) {
  return spec.insuranceStart > spec.travelStart || spec.insuranceEnd < spec.travelEnd;
}

function formData(spec) {
  const phone = iraqPhoneParts(spec.phone);
  const workPhone = iraqPhoneParts(spec.workPhone);
  return {
    title: null,
    first_name: spec.firstName,
    last_name: spec.lastName,
    full_name_as_passport: spec.fullName,
    sex: spec.sex,
    marital_status: "Married",
    nationality: "Iraqi",
    birth_date: spec.birthDate,
    birth_country: "Iraq",
    birth_city: spec.birthCity,
    passport_number: spec.passport,
    passport_type: "Ordinary passport",
    passport_issue_date: spec.passportIssue,
    passport_expiry_date: spec.passportExpiry,
    national_id: spec.nationalId || null,
    residence_country: "Iraq",
    phone_country_code: phone.code,
    phone_number: phone.number,
    email: spec.email,
    employer_name: spec.employer,
    company_specialty: null,
    job_title: spec.jobTitle,
    department: spec.department || null,
    work_city: spec.workCity,
    work_phone_country_code: workPhone.code,
    work_phone: workPhone.number,
    work_email: spec.workEmail,
    home_address: spec.homeAddress,
    previous_schengen_visa: spec.previousSchengen,
    other_residence_permit: false,
  };
}

function additionalData(spec) {
  const unknown = ["title", "company_specialty"];
  if (!spec.nationalId) unknown.push("national_id");
  if (!spec.department) unknown.push("department");
  if (spec.uncertainDocuments) unknown.push(...spec.uncertainDocuments);
  return {
    visa_reference: spec.visaReference,
    visa_destination_country: "France",
    visa_type: "C",
    visa_purpose: "Business / event attendance",
    travel_start_date: spec.travelStart,
    travel_end_date: spec.travelEnd,
    visa_appointment_date: spec.appointmentDate,
    visa_appointment_time: spec.appointmentTime,
    visa_appointment_status: "Booked",
    visa_appointment_center: "TLScontact Baghdad",
    visa_appointment_ref_number: spec.appointmentReference,
    previous_schengen_visa_number: spec.previousVisaNumber,
    insurance_policy_number: spec.insurancePolicy,
    insurance_start_date: spec.insuranceStart,
    insurance_end_date: spec.insuranceEnd,
    insurance_company: "Mutuaide / Insurte",
    event_title: spec.event.title,
    event_start_date: spec.event.start,
    event_end_date: spec.event.end,
    event_country: "France",
    event_city: "Paris",
    event_venue: spec.event.venue,
    event_host_organization: spec.event.host,
    event_contact_name: spec.event.contactName,
    event_contact_email: spec.event.contactEmail,
    event_contact_phone: spec.event.contactPhone,
    event_registration_number: spec.invitationRegistration,
    internal_notes: "Source-backed normalization authorized by the user on 2026-07-23. No missing document was fabricated.",
    missing_profile_fields: [],
    unknown_fields: unknown,
    extraction_source_summary: "Visa application pages 1-6; TLS appointment page 7; insurance pages 8-10; invitation page 11; badge page 12.",
    documents_found: [
      "visa_application_form",
      "tls_appointment",
      "travel_insurance",
      "invitation_letter",
      "badge",
      ...(spec.companyLetter ? ["company_letter"] : []),
    ],
    documents_missing: [
      "passport_copy",
      "travel_booking",
      "hotel_booking",
      "residence_permit",
      "previous_schengen_visa",
    ],
    documents_uncertain: spec.uncertainDocuments || [],
    insurance_travel_date_conflict: coverageConflict(spec),
  };
}

function clientData(spec) {
  return {
    full_name_as_passport: spec.fullName,
    first_name: spec.firstName,
    last_name: spec.lastName,
    date_of_birth: spec.birthDate,
    place_of_birth: spec.birthCity,
    sex: spec.sex,
    nationality: "Iraqi",
    marital_status: "Married",
    residence_country: "Iraq",
    city: spec.city,
    full_address: spec.homeAddress,
    passport_number: spec.passport,
    passport_type: "Ordinary passport",
    passport_issue_date: spec.passportIssue,
    passport_expiry_date: spec.passportExpiry,
    passport_place_of_issue: "Iraq",
    passport_copy_url: null,
    email: spec.email,
    phone: spec.phone,
    whatsapp_number: null,
    employer_name: spec.employer,
    work_address: spec.workAddress,
    work_city: spec.workCity,
    work_governorate: spec.workCity,
    job_title: spec.jobTitle,
    department: spec.department || null,
    professional_specialty: null,
    work_phone: spec.workPhone,
    work_email: spec.workEmail,
    previous_schengen_visa: spec.previousSchengen,
    schengen_visas_last_5y: spec.previousVisaNumber
      ? [{ visa_number: spec.previousVisaNumber }]
      : [],
    other_residence_permit: { has_permit: false },
    national_id: spec.nationalId || null,
    title_salutation: null,
    source_event_name: spec.event.title,
    source_note: "Normalized from the supplied visa-client PDF on 2026-07-23.",
    updated_at: auditTimestamp,
  };
}

async function requireData(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

async function prepareEvents() {
  await requireData(
    await supabase
      .from("events")
      .update({
        title: silmo.title,
        date: `${silmo.start}T00:00:00Z`,
        end_date: `${silmo.end}T00:00:00Z`,
        location: silmo.venue,
        country: "France",
        sector: "Optics & Eyewear",
        event_type: "international",
        status: "draft",
        updated_at: auditTimestamp,
      })
      .eq("id", silmoEventId),
    "update SILMO event",
  );

  const linked = await requireData(
    await supabase.from("drift_events").select("id").eq("events_id", silmoEventId),
    "lookup SILMO drift event",
  );

  const driftPayload = {
    title: silmo.title,
    date: silmo.start,
    end_date: silmo.end,
    country: "France",
    location: silmo.venue,
    sector: "Optics & Eyewear",
    event_type: "international",
    status: "active",
    is_active: true,
    events_id: silmoEventId,
    updated_at: auditTimestamp,
  };

  if (linked.length) {
    await requireData(
      await supabase.from("drift_events").update(driftPayload).eq("id", linked[0].id),
      "update SILMO drift event",
    );
  } else {
    await requireData(
      await supabase.from("drift_events").insert(driftPayload).select("id").single(),
      "create SILMO drift event",
    );
  }
}

async function findOrCreateClient(spec) {
  let matches = await requireData(
    await supabase.from("clients").select("id,passport_number,full_name_as_passport"),
    `list clients for ${spec.slug}`,
  );
  matches = matches.filter(
    (row) =>
      normalize(row.passport_number) === normalize(spec.passport) ||
      normalize(row.full_name_as_passport) === normalize(spec.fullName),
  );

  if (matches.length > 1) {
    throw new Error(`Ambiguous client match for ${spec.slug}: ${matches.length} records`);
  }

  if (matches.length === 1) {
    const id = matches[0].id;
    await requireData(
      await supabase.from("clients").update(clientData(spec)).eq("id", id),
      `update client ${spec.slug}`,
    );
    return { id, created: false };
  }

  const created = await requireData(
    await supabase.from("clients").insert(clientData(spec)).select("id").single(),
    `create client ${spec.slug}`,
  );
  return { id: created.id, created: true };
}

async function nextCaseNumber() {
  const rows = await requireData(
    await supabase.from("registrations").select("case_number"),
    "list case numbers",
  );
  const used = new Set(rows.map((row) => row.case_number).filter(Boolean));
  for (let i = 1; i < 100000; i += 1) {
    const candidate = `JAZ-26-${String(i).padStart(5, "0")}`;
    if (!used.has(candidate)) return candidate;
  }
  throw new Error("Could not allocate a case number.");
}

async function findOrCreateRegistration(spec, clientId) {
  let registration = null;

  if (spec.caseNumber) {
    const rows = await requireData(
      await supabase.from("registrations").select("id,case_number").eq("case_number", spec.caseNumber),
      `lookup registration ${spec.caseNumber}`,
    );
    if (rows.length !== 1) {
      throw new Error(`Expected one registration for ${spec.caseNumber}; found ${rows.length}`);
    }
    registration = rows[0];
  } else {
    const rows = await requireData(
      await supabase
        .from("registrations")
        .select("id,case_number,additional_data")
        .eq("client_id", clientId),
      `lookup registration ${spec.slug}`,
    );
    registration =
      rows.find((row) => row.additional_data?.visa_reference === spec.visaReference) || null;
  }

  if (!registration) {
    const caseNumber = await nextCaseNumber();
    const created = await requireData(
      await supabase
        .from("registrations")
        .insert({
          client_id: clientId,
          event_id: spec.event.id,
          status: "confirmed",
          full_name: spec.fullName,
          email: spec.email,
          case_number: caseNumber,
          case_status: "new_request",
          case_source: "authorized_pdf_import",
          current_step: 1,
          form_data: {},
          additional_data: {},
          documents: [],
          payment_status: "pending",
          selected_services: [],
          total_amount: 0,
        })
        .select("id,case_number")
        .single(),
      `create registration ${spec.slug}`,
    );
    registration = created;
  }

  const payload = {
    client_id: clientId,
    event_id: spec.event.id,
    full_name: spec.fullName,
    email: spec.email,
    form_data: formData(spec),
    additional_data: additionalData(spec),
    client_snapshot: clientData(spec),
    case_source: "authorized_pdf_import",
    case_status: "new_request",
    status: "confirmed",
    payment_status: "pending",
    current_step: 4,
    updated_at: auditTimestamp,
  };

  await requireData(
    await supabase.from("registrations").update(payload).eq("id", registration.id),
    `update registration ${spec.slug}`,
  );

  return registration;
}

async function uploadDocument(registrationId, spec, docType, pageCount) {
  const filePath = path.join(sourceRoot, spec.slug, `${docType}.pdf`);
  const body = await fs.readFile(filePath);
  const storagePath = `registrations/${registrationId}/source-audit-2026-07-23/${docType}.pdf`;
  await requireData(
    await supabase.storage.from(bucket).upload(storagePath, body, {
      contentType: "application/pdf",
      upsert: true,
    }),
    `upload ${spec.slug}/${docType}`,
  );
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return {
    name: `${spec.fullName} - ${docType}.pdf`,
    path: data.publicUrl,
    type: docType,
    pages: pageCount,
    bucket,
    uploadedAt: auditTimestamp,
    sourceVerified: true,
  };
}

async function normalizeDocuments(registrationId, spec) {
  const documents = [
    await uploadDocument(registrationId, spec, "visa_application_form", 6),
    await uploadDocument(registrationId, spec, "tls_appointment", 1),
    await uploadDocument(registrationId, spec, "travel_insurance", 3),
    await uploadDocument(registrationId, spec, "invitation_letter", 1),
    await uploadDocument(registrationId, spec, "badge", 1),
  ];

  if (spec.companyLetter) {
    documents.push(await uploadDocument(registrationId, spec, "company_letter", 6));
  }

  await requireData(
    await supabase
      .from("registrations")
      .update({ documents, current_step: 4, updated_at: auditTimestamp })
      .eq("id", registrationId),
    `save documents ${spec.slug}`,
  );

  return documents;
}

async function cancelDuplicates(spec, primaryRegistrationId) {
  for (const caseNumber of spec.duplicateCases) {
    const duplicate = await requireData(
      await supabase
        .from("registrations")
        .select("id,notes")
        .eq("case_number", caseNumber)
        .maybeSingle(),
      `lookup duplicate ${caseNumber}`,
    );
    if (!duplicate || duplicate.id === primaryRegistrationId) continue;
    const note = [
      duplicate.notes,
      `Cancelled as a duplicate after source-backed review on 2026-07-23. Primary case: ${spec.caseNumber}.`,
    ]
      .filter(Boolean)
      .join("\n");
    await requireData(
      await supabase
        .from("registrations")
        .update({
          status: "cancelled",
          case_status: "cancelled_duplicate",
          current_step: 1,
          notes: note,
          updated_at: auditTimestamp,
        })
        .eq("id", duplicate.id),
      `cancel duplicate ${caseNumber}`,
    );
  }
}

async function logNormalization(registrationId, spec, createdClient, documentTypes) {
  await requireData(
    await supabase.from("registration_events").insert({
      registration_id: registrationId,
      action: "source_backed_normalization",
      description: "Authorized staff-assisted normalization from the supplied source PDF.",
      performed_by: null,
      performed_by_name: "Codex (authorized by user)",
      metadata: {
        source_date: "2026-07-23",
        client_created: createdClient,
        canonical_document_types: documentTypes,
        unresolved_missing_documents: [
          "passport_copy",
          "travel_booking",
          "hotel_booking",
          "residence_permit",
          "previous_schengen_visa",
        ],
        insurance_travel_date_conflict: coverageConflict(spec),
      },
    }),
    `log normalization ${spec.slug}`,
  );
}

async function verify(spec, clientId, registrationId) {
  const client = await requireData(
    await supabase
      .from("clients")
      .select(
        "id,full_name_as_passport,phone,nationality,date_of_birth,place_of_birth,sex,passport_number,passport_type,passport_issue_date,passport_expiry_date,residence_country,city,job_title,employer_name",
      )
      .eq("id", clientId)
      .single(),
    `verify client ${spec.slug}`,
  );
  const registration = await requireData(
    await supabase
      .from("registrations")
      .select("id,case_number,event_id,current_step,status,case_status,form_data,additional_data,documents")
      .eq("id", registrationId)
      .single(),
    `verify registration ${spec.slug}`,
  );

  const coreFields = [
    "phone",
    "nationality",
    "date_of_birth",
    "place_of_birth",
    "sex",
    "passport_number",
    "passport_type",
    "passport_issue_date",
    "passport_expiry_date",
    "residence_country",
    "city",
    "job_title",
    "employer_name",
  ];
  const missing = coreFields.filter((key) => !client[key]);
  const types = (registration.documents || []).map((doc) => doc.type).sort();
  const expected = [
    "badge",
    ...(spec.companyLetter ? ["company_letter"] : []),
    "invitation_letter",
    "tls_appointment",
    "travel_insurance",
    "visa_application_form",
  ].sort();

  if (missing.length) throw new Error(`Core profile incomplete for ${spec.slug}: ${missing.join(",")}`);
  if (normalize(client.passport_number) !== normalize(spec.passport)) {
    throw new Error(`Passport verification failed for ${spec.slug}`);
  }
  if (registration.event_id !== spec.event.id) {
    throw new Error(`Event verification failed for ${spec.slug}`);
  }
  if (registration.current_step !== 4) {
    throw new Error(`current_step verification failed for ${spec.slug}`);
  }
  if (JSON.stringify(types) !== JSON.stringify(expected)) {
    throw new Error(`Document verification failed for ${spec.slug}: ${types.join(",")}`);
  }
  if (registration.form_data?.passport_number !== spec.passport) {
    throw new Error(`form_data verification failed for ${spec.slug}`);
  }
  if (registration.additional_data?.visa_reference !== spec.visaReference) {
    throw new Error(`additional_data verification failed for ${spec.slug}`);
  }

  return {
    name: spec.fullName,
    caseNumber: registration.case_number,
    clientCreated: false,
    core: "13/13",
    step: registration.current_step,
    documents: types,
    insuranceConflict: coverageConflict(spec),
  };
}

await prepareEvents();

const results = [];
for (const spec of specs) {
  const client = await findOrCreateClient(spec);
  const registration = await findOrCreateRegistration(spec, client.id);
  const documents = await normalizeDocuments(registration.id, spec);
  await cancelDuplicates(spec, registration.id);
  await logNormalization(
    registration.id,
    spec,
    client.created,
    documents.map((doc) => doc.type),
  );
  const verified = await verify(spec, client.id, registration.id);
  verified.clientCreated = client.created;
  results.push(verified);
  console.log(
    JSON.stringify({
      name: verified.name,
      caseNumber: verified.caseNumber,
      clientCreated: verified.clientCreated,
      core: verified.core,
      currentStep: verified.step,
      documentCount: verified.documents.length,
      insuranceConflict: verified.insuranceConflict,
    }),
  );
}

console.log(
  JSON.stringify({
    complete: true,
    clientsProcessed: results.length,
    clientsCreated: results.filter((row) => row.clientCreated).length,
    profilesComplete: results.filter((row) => row.core === "13/13").length,
    insuranceConflicts: results.filter((row) => row.insuranceConflict).map((row) => row.name),
  }),
);
