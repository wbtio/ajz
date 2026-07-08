/**
 * نظام التصميم لتطبيق JAZ — مستمدّ من هوية الموقع
 * الأحمر الغامق #8b0000 مع لمسات خضراء، وضع فاتح (Light).
 */
import { Platform } from 'react-native';

/**
 * ترتيب صفّي يبدأ من اليمين (RTL). على الأجهزة الحقيقية (iOS/Android) يعكس
 * Yoga اتجاه "row" تلقائياً بسبب I18nManager.forceRTL، لكن react-native-web
 * لا يفعل ذلك — لذا نعكسه يدوياً على الويب فقط لنحصل على نفس الشكل بالمنصّتين.
 */
export const rtlRow = Platform.OS === 'web' ? 'row-reverse' : 'row';

export const colors = {
  maroon: '#8b0000',
  maroonDeep: '#5e0000',
  maroon2: '#a8201a',
  navy: '#001a33',
  ink: '#1d1614',
  ink2: '#6b5f5a',
  ink3: '#988a84',
  green: '#1f7a4d',
  greenBg: '#e8f3ec',
  gold: '#b08d4b',
  bg: '#f6f2ef',
  card: '#ffffff',
  line: '#ece3df',
  white: '#ffffff',
  amberBg: '#fcf0db',
  redBg: '#fbe6e5',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 100,
};

export const font = {
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  semibold: 'IBMPlexSansArabic_600SemiBold',
  bold: 'IBMPlexSansArabic_700Bold',
};

export const shadow = {
  card: {
    boxShadow: '0 6px 16px rgba(29,22,20,0.08)',
  },
};
