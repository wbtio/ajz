import type { Tables } from "@/lib/database.types";
import type { FormField } from "@/lib/types";

type SectorRow = Tables<"sectors">;

export interface SectorContentEntry {
  key: "medical" | "industrie" | "technology" | "academia";
  order: number;
  name: string;
  nameAr: string;
  shortDescription: string;
  shortDescriptionAr: string;
  heroDescription: string;
  heroDescriptionAr: string;
  overviewTitle: string;
  overviewTitleAr: string;
  scope: string;
  scopeAr: string;
  professionalLink: string;
  professionalLinkAr: string;
  benefit: string;
  benefitAr: string;
  registrationIntro: string;
  registrationIntroAr: string;
  accent: string;
}

const sectorEntries: SectorContentEntry[] = [
  {
    key: "medical",
    order: 1,
    name: "JAZ Healthcare and Life Sciences",
    nameAr: "جاز للرعاية الصحية وعلوم الحياة",
    shortDescription:
      "Connecting Iraqi clinical professionals with global medical pioneers to advance healthcare delivery and clinical standards.",
    shortDescriptionAr:
      "ربط الكوادر الطبية العراقية برواد الرعاية الصحية عالمياً للارتقاء بالخدمات الطبية والمعايير السريرية.",
    heroDescription:
      "JAZ Healthcare & Life Sciences acts as the official gateway for clinical advancement in Iraq. We facilitate bilateral academic symposia, specialized medical training, international clinical delegations, and strategic technology transfer with world-class healthcare institutions.",
    heroDescriptionAr:
      "يمثل قسم الرعاية الصحية وعلوم الحياة في جاز البوابة الرسمية للتطوير السريري في العراق؛ حيث نعمل على تسهيل المؤتمرات الأكاديمية الثنائية، والبرامج التدريبية الطبية المتخصصة، وإيفاد البعثات السريرية الدولية، ونقل التكنولوجيا الطبية المتقدمة بالتعاون مع كبرى المؤسسات الصحية العالمية.",
    overviewTitle: "Core Focus",
    overviewTitleAr: "التركيز الاستراتيجي",
    scope: "Clinical Excellence, Healthcare Innovation, Global Partnerships",
    scopeAr: "التميز السريري، الابتكار الصحي، الشراكات العالمية",
    professionalLink:
      "Unlocks direct channels for institutional partnerships, accredited medical training programs, and exclusive clinical delegations.",
    professionalLinkAr:
      "تتيح قنوات اتصال مباشرة لبناء الشراكات المؤسسية، والبرامج التدريبية المعتمدة، والمشاركة في البعثات الطبية التخصصية.",
    benefit:
      "Creates direct pathways for knowledge transfer, clinical innovation exposure, and professional healthcare collaboration.",
    benefitAr:
      "إنشاء مسارات مباشرة لنقل المعرفة، والاطلاع على الابتكار السريري، وبناء التعاون المهني في قطاع الرعاية الصحية.",
    registrationIntro:
      "To register your institution's interest in JAZ Healthcare & Life Sciences partnership, clinical programs, or international delegations, please complete the official intake form below. Our registration office will review your dossier and follow up within 3 business days.",
    registrationIntroAr:
      "لتسجيل اهتمام مؤسستكم في شراكات قسم الرعاية الصحية وعلوم الحياة، أو البرامج السريرية، أو البعثات الطبية الدولية في جاز، يرجى استكمال نموذج تقديم الطلب الرسمي أدناه. سيقوم مكتب التسجيل لدينا بمراجعة ملفكم والرد خلال 3 أيام عمل.",
    accent: "#b42318",
  },
  {
    key: "technology",
    order: 2,
    name: "JAZ Digital Transformation and Technology",
    nameAr: "جاز للتحول الرقمي والتكنولوجيا",
    shortDescription:
      "Accelerating digital readiness across national organizations through elite international technology transfers and secure infrastructure partnerships.",
    shortDescriptionAr:
      "تسريع الجاهزية الرقمية للمؤسسات الوطنية من خلال نقل التكنولوجيا الدولية المتطورة وشراكات البنية التحتية الآمنة.",
    heroDescription:
      "We serve as the primary institutional link for Iraqi enterprises adopting advanced technologies. Our mandate is to guide digital transformation, certify technology providers, and facilitate partnerships with global pioneers in software, security, and cloud infrastructure.",
    heroDescriptionAr:
      "نعمل كحلقة وصل مؤسسية رئيسية للشركات العراقية في تبني التكنولوجيا المتقدمة. وتتمثل مهامنا في توجيه مسيرة التحول الرقمي، واعتماد مزودي الحلول التقنية، وتسهيل الشراكات مع كبرى الشركات العالمية في مجالات البرمجيات، والأمن السيبراني، والبنية التحتية السحابية.",
    overviewTitle: "Core Focus",
    overviewTitleAr: "التركيز الاستراتيجي",
    scope: "Enterprise Technology, Digital Infrastructure, IT Innovation",
    scopeAr: "تكنولوجيا المؤسسات، البنية التحتية الرقمية، ابتكار تكنولوجيا المعلومات",
    professionalLink:
      "Enables access to global technology summits, enterprise certification programs, and secure international software vendors.",
    professionalLinkAr:
      "تمنح إمكانية الوصول إلى القمم التكنولوجية العالمية، وبرامج اعتماد الشركات، والتعامل الآمن مع موفري البرمجيات الدوليين.",
    benefit:
      "Helps organizations identify, evaluate, and implement technologies that accelerate digital readiness and operational growth.",
    benefitAr:
      "مساعدة المؤسسات على تحديد وتقييم وتطبيق التقنيات التي تسرّع الجاهزية الرقمية والنمو التشغيلي.",
    registrationIntro:
      "To request digital infrastructure support, enterprise technology partnerships, or international tech transfers under this division, please submit your institutional details below. Our official technology registry office will review your request.",
    registrationIntroAr:
      "لطلب دعم البنية التحتية الرقمية، أو شراكات تكنولوجيا المؤسسات، أو عمليات نقل التكنولوجيا الدولية ضمن هذا القسم، يرجى تقديم تفاصيل مؤسستكم أدناه. سيقوم مكتب السجل التكنولوجي الرسمي بمراجعة طلبكم.",
    accent: "#0f766e",
  },
  {
    key: "academia",
    order: 3,
    name: "JAZ Professional and Academic Affairs",
    nameAr: "جاز للشؤون المهنية والأكاديمية",
    shortDescription:
      "Fostering academic excellence by connecting national universities with elite international research institutions and scientific centers.",
    shortDescriptionAr:
      "تعزيز التميز الأكاديمي عبر ربط الجامعات الوطنية بالمؤسسات البحثية والمراكز العلمية العالمية المرموقة.",
    heroDescription:
      "Our division bridges the academic gap, fostering high-level scientific and professional partnerships. We organize international academic symposia, coordinate joint research projects, and establish bilateral education pathways between Iraqi universities and global centers of excellence.",
    heroDescriptionAr:
      "يعمل قسمنا على مد جسور التعاون المعرفي والأكاديمي، وبناء شراكات علمية ومهنية رفيعة المستوى؛ حيث ننظم المؤتمرات الأكاديمية الدولية، وننسق المشاريع البحثية المشتركة، وننشئ مسارات تعليمية ثنائية بين الجامعات العراقية ومراكز التميز العالمية.",
    overviewTitle: "Core Focus",
    overviewTitleAr: "التركيز الاستراتيجي",
    scope: "Academic Partnerships, Scientific Research, Professional Growth",
    scopeAr: "الشراكات الأكاديمية، البحث العلمي، التطوير المهني",
    professionalLink:
      "Opens pathways for university affiliations, joint international research publications, and fully accredited academic exchange programs.",
    professionalLinkAr:
      "تفتح آفاقاً رحبة للشراكات الجامعية، والنشر البحثي المشترك دولياً، وبرامج التبادل الأكاديمي المعتمدة بالكامل.",
    benefit:
      "Supports academic institutions in building international relationships that strengthen research, institutional development, and professional advancement.",
    benefitAr:
      "دعم المؤسسات الأكاديمية في بناء علاقات دولية تعزز البحث والتطوير المؤسسي والتقدم المهني.",
    registrationIntro:
      "To establish research university partnerships, academic exchange agreements, or professional development programs, please submit your institutional dossier below. Our academic affairs committee will coordinate the next steps.",
    registrationIntroAr:
      "لتأسيس شراكات مع الجامعات البحثية، أو اتفاقيات التبادل الأكاديمي، أو برامج التطوير المهني، يرجى تقديم ملف مؤسستكم أدناه. ستقوم لجنة الشؤون الأكاديمية بتنسيق الخطوات التالية.",
    accent: "#4338ca",
  },
  {
    key: "industrie",
    order: 4,
    name: "JAZ Industrial and Commercial Development",
    nameAr: "جاز للتطوير الصناعي والتجاري",
    shortDescription:
      "Expanding trade horizons by connecting Iraqi industry leaders and merchants with European manufacturing centers and export markets.",
    shortDescriptionAr:
      "توسيع آفاق التبادل التجاري من خلال ربط قادة الصناعة والتجار العراقيين بمراكز التصنيع وأسواق التصدير الأوروبية.",
    heroDescription:
      "We serve as Iraq's premier industrial and commercial gateway. By building direct economic links with European manufacturing hubs, we facilitate machinery acquisition, export-import trade agreements, and high-level commercial delegations.",
    heroDescriptionAr:
      "نعمل كبوابة صناعية وتجارية رائدة في العراق. ومن خلال بناء روابط اقتصادية مباشرة مع مراكز التصنيع الأوروبية، نسهل عمليات استيراد الآلات والمعدات، واتفاقيات التبادل التجاري والتصدير، وتنسيق الوفود التجارية رفيعة المستوى.",
    overviewTitle: "Core Focus",
    overviewTitleAr: "التركيز الاستراتيجي",
    scope: "Industrial Innovation, Trade Expansion, Global Sourcing",
    scopeAr: "الابتكار الصناعي، التوسع التجاري، التوريد العالمي",
    professionalLink:
      "Connects you with European trade registries, verified manufacturing suppliers, and exclusive international business delegations.",
    professionalLinkAr:
      "تؤمن تواصلكم مع السجلات التجارية الأوروبية، وموردي التصنيع المعتمدين، والوفود الاقتصادية الدولية الحصرية.",
    benefit:
      "Creates commercial pathways for market access, manufacturing partnerships, and industry-led trade development.",
    benefitAr:
      "إنشاء مسارات تجارية للوصول إلى الأسواق، وبناء شراكات التصنيع، وتطوير التجارة بقيادة القطاع الصناعي.",
    registrationIntro:
      "To register your enterprise for European market access, industrial manufacturing hubs, or bilateral trade delegations, please submit your commercial registration below. Our commercial development team will contact you.",
    registrationIntroAr:
      "لتسجيل مؤسستكم للوصول إلى الأسواق الأوروبية، أو مراكز التصنيع الصناعي، أو البعثات التجارية الثنائية، يرجى تقديم طلبكم التجاري أدناه. سيتواصل معكم فريق التطوير التجاري لدينا.",
    accent: "#9a3412",
  },
];

const slugAliases: Record<string, SectorContentEntry["key"]> = {
  medical: "medical",
  "medical-healthcare": "medical",
  healthcare: "medical",
  health: "medical",
  "life-sciences": "medical",
  "life sciences": "medical",
  industrie: "industrie",
  industrial: "industrie",
  commercial: "industrie",
  "commercial-industrial": "industrie",
  "industrial-commercial": "industrie",
  "industrial and commercial": "industrie",
  technology: "technology",
  tech: "technology",
  digital: "technology",
  "digital transformation": "technology",
  education: "academia",
  academia: "academia",
  academic: "academia",
  "professional and academic": "academia",
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

export function getSectorContent(
  input: Pick<SectorRow, "slug" | "name" | "name_ar"> | string,
) {
  const raw =
    typeof input === "string"
      ? input
      : [input.slug, input.name, input.name_ar]
          .filter(Boolean)
          .map(normalize)
          .join(" ");

  const matchedKey = Object.entries(slugAliases).find(([alias]) =>
    raw.includes(alias),
  )?.[1];
  return sectorEntries.find((entry) => entry.key === matchedKey) || null;
}

export function getSectorRegistrationFallback(): FormField[] {
  return [
    {
      id: "company_name",
      label_en: "Company Name",
      label_ar: "اسم الشركة",
      type: "text",
      required: true,
      description_en:
        "Enter the details exactly as shown in the official documents.",
      description_ar: "يرجى إدخال البيانات تماماً كما تظهر في الوثائق الرسمية.",
      width: "half",
    },
    {
      id: "company_specialization",
      label_en: "Company Specialization",
      label_ar: "تخصص الشركة",
      type: "text",
      required: false,
      description_en: "Enter the company specialization or field of work.",
      description_ar: "أدخل تخصص الشركة أو مجال عملها.",
      placeholder_en: "Company specialization",
      placeholder_ar: "تخصص الشركة",
      width: "half",
    },
    {
      id: "zip_code",
      label_en: "ZIP Code",
      label_ar: "الرمز البريدي",
      type: "text",
      required: true,
      width: "half",
    },
    {
      id: "city",
      label_en: "City",
      label_ar: "المدينة",
      type: "text",
      required: true,
      width: "half",
    },
    {
      id: "country",
      label_en: "Country",
      label_ar: "الدولة",
      type: "text",
      required: true,
      width: "half",
    },
    {
      id: "telephone",
      label_en: "Company Telephone",
      label_ar: "هاتف الشركة",
      type: "text",
      required: false,
      width: "half",
    },
    {
      id: "email",
      label_en: "Company E-Mail",
      label_ar: "البريد الإلكتروني للشركة",
      type: "email",
      required: false,
      width: "half",
      description_en:
        "We will not follow up on email addresses other than the company domain.",
      description_ar:
        "لن تتم المتابعة مع عناوين البريد الإلكتروني التي لا تستخدم نطاق الشركة.",
    },
    {
      id: "company_website",
      label_en: "Company Website",
      label_ar: "الموقع الإلكتروني للشركة",
      type: "text",
      required: false,
      width: "half",
    },
    {
      id: "position_in_company",
      label_en: "Position in the Company",
      label_ar: "المنصب في الشركة",
      type: "text",
      required: true,
      description_en:
        "Enter the details exactly as shown in the official documents.",
      description_ar: "يرجى إدخال البيانات تماماً كما تظهر في الوثائق الرسمية.",
      width: "half",
    },
    {
      id: "company_registration_number",
      label_en: "Registration Number of the Company",
      label_ar: "رقم تسجيل الشركة",
      type: "text",
      required: false,
      width: "half",
      description_en: "At the Chamber of Commerce or similar organization.",
      description_ar: "في غرفة التجارة أو جهة مماثلة.",
    },
    {
      id: "full_name",
      label_en: "Full Name",
      label_ar: "الاسم الكامل",
      type: "text",
      required: true,
      width: "half",
      description_en:
        "Enter the full name exactly as it appears in the passport.",
      description_ar: "يرجى إدخال الاسم الكامل تماماً كما يظهر في جواز السفر الرسمي.",
      placeholder_en: "Full name as shown in passport",
      placeholder_ar: "الاسم الكامل كما هو مثبت في جواز السفر",
    },
    {
      id: "surname",
      label_en: "Surname",
      label_ar: "اللقب",
      type: "text",
      required: false,
      width: "half",
      placeholder_en: "Surname as shown in passport",
      placeholder_ar: "اللقب كما هو مكتوب في جواز السفر",
    },
    {
      id: "sex",
      label_en: "Sex",
      label_ar: "الجنس",
      type: "select",
      required: true,
      width: "half",
      options: ["Male", "Female"],
      options_ar: ["ذكر", "أنثى"],
    },
    {
      id: "civil_status",
      label_en: "Civil Status",
      label_ar: "الحالة الاجتماعية",
      type: "select",
      required: false,
      width: "half",
      options: [
        "Single",
        "Married",
        "Registered partnership",
        "Separated",
        "Divorced",
        "Widow(er)",
        "Other",
      ],
      options_ar: [
        "أعزب",
        "متزوج",
        "شراكة مسجلة",
        "منفصل",
        "مطلق",
        "أرمل",
        "أخرى",
      ],
    },
    {
      id: "date_of_birth",
      label_en: "Date of Birth",
      label_ar: "تاريخ الميلاد",
      type: "date",
      required: true,
      width: "half",
    },
    {
      id: "nationality",
      label_en: "Nationality",
      label_ar: "الجنسية",
      type: "text",
      required: true,
      width: "half",
    },
    {
      id: "personal_telephone",
      label_en: "Personal Telephone",
      label_ar: "الهاتف الشخصي",
      type: "text",
      required: true,
      width: "half",
    },
    {
      id: "personal_email_address",
      label_en: "Personal E-Mail",
      label_ar: "البريد الإلكتروني الشخصي",
      type: "email",
      required: true,
      width: "half",
    },
    {
      id: "personal_home_address",
      label_en: "Home Address",
      label_ar: "عنوان السكن",
      type: "textarea",
      required: false,
      placeholder_en: "Country, governorate, district, and area",
      placeholder_ar: "الدولة، والمحافظة، والقضاء، والمنطقة السكنية بالتفصيل",
      width: "full",
    },
    {
      id: "type_of_travel_document",
      label_en: "Type of Travel Document",
      label_ar: "نوع وثيقة السفر",
      type: "select",
      required: true,
      width: "half",
      options: [
        "Ordinary passport",
        "Diplomatic passport",
        "Service passport",
        "Official passport",
        "Special passport",
        "Other travel document",
      ],
      options_ar: [
        "جواز عادي",
        "جواز دبلوماسي",
        "جواز خدمة",
        "جواز رسمي",
        "جواز خاص",
        "وثيقة سفر أخرى",
      ],
    },
    {
      id: "number_of_travel_document",
      label_en: "Number of Travel Document",
      label_ar: "رقم وثيقة السفر",
      type: "text",
      required: true,
      width: "half",
    },
    {
      id: "date_of_issue",
      label_en: "Date of Issue",
      label_ar: "تاريخ الإصدار",
      type: "date",
      required: true,
      width: "half",
    },
    {
      id: "date_of_expiry",
      label_en: "Date of Expiry",
      label_ar: "تاريخ الانتهاء",
      type: "date",
      required: true,
      width: "half",
    },
    {
      id: "issuing_authority",
      label_en: "Issuing Authority",
      label_ar: "جهة الإصدار",
      type: "text",
      required: true,
      width: "half",
      placeholder_en: "Enter issuing authority...",
      placeholder_ar: "أدخل جهة الإصدار...",
    },
    {
      id: "issued_by_country",
      label_en: "Place of Birth",
      label_ar: "محل الميلاد",
      type: "text",
      required: true,
      width: "half",
      placeholder_en: "Enter place of birth...",
      placeholder_ar: "أدخل محل الميلاد...",
    },
    {
      id: "residence_in_other_country",
      label_en: "Residence in a Country Other Than Current Nationality",
      label_ar: "إقامة في دولة غير دولة الجنسية الحالية",
      type: "select",
      required: false,
      width: "full",
      options: ["No", "Yes"],
      options_ar: ["لا", "نعم"],
    },
    {
      id: "residence_permit_number",
      label_en: "Residence Permit or Equivalent Number",
      label_ar: "رقم تصريح الإقامة أو ما يعادله",
      type: "text",
      required: false,
      width: "half",
    },
    {
      id: "residence_permit_country",
      label_en: "Country",
      label_ar: "الدولة",
      type: "text",
      required: false,
      width: "half",
      placeholder_en: "Enter country...",
      placeholder_ar: "أدخل الدولة...",
    },
    {
      id: "residence_permit_issue_date",
      label_en: "Residence Permit Issue Date",
      label_ar: "تاريخ الإصدار",
      type: "date",
      required: false,
      width: "half",
    },
    {
      id: "residence_permit_valid_until",
      label_en: "Residence Permit Expiry Date",
      label_ar: "تاريخ النفاذ",
      type: "date",
      required: false,
      width: "half",
    },
    {
      id: "additional_residence_in_other_country",
      label_en: "Do You Hold Another Residence Permit?",
      label_ar: "هل لديكم إقامة أخرى أيضًا؟",
      type: "select",
      required: false,
      width: "full",
      options: ["No", "Yes"],
      options_ar: ["لا", "نعم"],
    },
    {
      id: "secondary_residence_permit_number",
      label_en: "Second Residence Permit or Equivalent Number",
      label_ar: "رقم تصريح الإقامة الأخرى أو ما يعادله",
      type: "text",
      required: false,
      width: "half",
    },
    {
      id: "secondary_residence_permit_country",
      label_en: "Second Residence Country",
      label_ar: "دولة الإقامة الأخرى",
      type: "text",
      required: false,
      width: "half",
      placeholder_en: "Enter second residence country...",
      placeholder_ar: "أدخل دولة الإقامة الأخرى...",
    },
    {
      id: "secondary_residence_permit_issue_date",
      label_en: "Second Residence Permit Issue Date",
      label_ar: "تاريخ إصدار الإقامة الأخرى",
      type: "date",
      required: false,
      width: "half",
    },
    {
      id: "secondary_residence_permit_valid_until",
      label_en: "Second Residence Permit Expiry Date",
      label_ar: "تاريخ نفاذ الإقامة الأخرى",
      type: "date",
      required: false,
      width: "half",
    },
    {
      id: "fingerprints_collected_previously",
      label_en: "Do You Have a Previous Visa?",
      label_ar: "هل لديك فيزا سابقة؟",
      type: "select",
      required: false,
      width: "full",
      options: ["No", "Yes"],
      options_ar: ["لا", "نعم"],
    },
    {
      id: "previous_visa_issue_date",
      label_en: "Previous Visa Issue Date",
      label_ar: "تاريخ إصدار التأشيرة السابقة",
      type: "date",
      required: false,
      width: "half",
    },
    {
      id: "previous_visa_valid_until",
      label_en: "Previous Visa Expiry Date",
      label_ar: "تاريخ نفاذ التأشيرة السابقة",
      type: "date",
      required: false,
      width: "half",
    },
    {
      id: "previous_visa_number_if_known",
      label_en: "Previous Visa Number (If Known)",
      label_ar: "رقم التأشيرة السابقة إن وجد",
      type: "text",
      required: false,
      width: "half",
    },
    {
      id: "previous_visa_source_country",
      label_en: "Source Country",
      label_ar: "دولة المصدر",
      type: "text",
      required: false,
      width: "half",
      placeholder_en: "Enter source country...",
      placeholder_ar: "أدخل دولة المصدر...",
    },
    {
      id: "additional_previous_visa",
      label_en: "Do You Have Another Previous Visa?",
      label_ar: "هل لديكم فيزا سابقة أخرى أيضًا؟",
      type: "select",
      required: false,
      width: "full",
      options: ["No", "Yes"],
      options_ar: ["لا", "نعم"],
    },
    {
      id: "secondary_previous_visa_issue_date",
      label_en: "Second Previous Visa Issue Date",
      label_ar: "تاريخ إصدار الفيزا السابقة الأخرى",
      type: "date",
      required: false,
      width: "half",
    },
    {
      id: "secondary_previous_visa_valid_until",
      label_en: "Second Previous Visa Expiry Date",
      label_ar: "تاريخ نفاذ الفيزا السابقة الأخرى",
      type: "date",
      required: false,
      width: "half",
    },
    {
      id: "secondary_previous_visa_number_if_known",
      label_en: "Second Previous Visa Number (If Known)",
      label_ar: "رقم الفيزا السابقة الأخرى إن وجد",
      type: "text",
      required: false,
      width: "half",
    },
    {
      id: "secondary_previous_visa_source_country",
      label_en: "Second Previous Visa Source Country",
      label_ar: "دولة مصدر الفيزا السابقة الأخرى",
      type: "text",
      required: false,
      width: "half",
      placeholder_en: "Enter second previous visa source country...",
      placeholder_ar: "أدخل دولة مصدر الفيزا السابقة الأخرى...",
    },
  ];
}

export function mergeSectorWithContent<T extends SectorRow>(sector: T) {
  const content = getSectorContent(sector);

  if (!content) return sector;

  return {
    ...sector,
    name: content.name,
    name_en: content.name,
    name_ar: content.nameAr,
    description: content.shortDescription,
    description_ar: content.shortDescriptionAr,
    color: sector.color || content.accent,
    sort_order: content.order,
  };
}

export const sectorContentList = sectorEntries;
