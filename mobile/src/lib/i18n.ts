/**
 * نصوص التطبيق بالعربية (الافتراضية). جاهزة للتوسعة للإنجليزية لاحقاً.
 */
export const t = {
  appName: 'JAZ',
  tagline: 'بوّابتك للفعاليات الدولية',

  // تبويبات
  tabHome: 'الرئيسية',
  tabEvents: 'الفعاليات',
  tabTicket: 'تذكرتي',
  tabAccount: 'حسابي',

  // الدخول
  loginTitle: 'سجّل الدخول',
  loginSubtitle: 'نفس حساب الموقع — بياناتك كلها معك',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  login: 'دخول',
  loggingIn: 'جارٍ الدخول…',
  loginError: 'تعذّر تسجيل الدخول، تحقّق من البيانات',
  noAccount: 'ليس لديك حساب؟ سجّل من الموقع',

  // الرئيسية
  welcome: 'أهلاً',
  resumeTitle: 'أكمل من حيث توقفت',
  upcomingDelegation: 'فعاليتك القادمة',
  recommended: 'مُوصى لك',
  quickEvents: 'الفعاليات',
  quickInvitations: 'الدعوات',
  quickTicket: 'تذكرتي',
  quickAssistant: 'مساعد',

  // الفعاليات
  eventsTitle: 'استكشف الفعاليات',
  searchPlaceholder: 'ابحث عن فعالية أو دولة…',
  filterAll: 'الكل',
  filterIntl: 'دولية',
  filterLocal: 'محلية',
  filterFeatured: 'مميزة',
  noEvents: 'لا توجد فعاليات حالياً',
  register: 'انضمّ للوفد · سجّل الآن',
  limitedSeats: 'مقاعد محدودة',
  open: 'التسجيل مفتوح',

  // تذكرتي
  ticketTitle: 'تذكرتي ورحلتي',
  ticketEmpty: 'ستظهر بطاقتك هنا بعد تأكيد مشاركتك في فعالية.',

  // الحساب
  accountTitle: 'حسابي',
  logout: 'تسجيل الخروج',

  loading: 'جارٍ التحميل…',
};

export type Strings = typeof t;
