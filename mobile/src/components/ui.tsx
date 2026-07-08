/**
 * مكوّنات واجهة مشتركة بهوية JAZ: نص، زر، بطاقة، شارة، شاشة.
 */
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, font, radius, shadow, spacing } from '@/lib/theme';

type TxtType = 'title' | 'h2' | 'h3' | 'body' | 'small' | 'label';

export function Txt({
  children,
  type = 'body',
  color,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  type?: TxtType;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  return (
    <Text numberOfLines={numberOfLines} style={[styles.base, txtStyles[type], color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Button({
  title,
  onPress,
  variant = 'solid',
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'solid' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        ghost ? styles.btnGhost : styles.btnSolid,
        (disabled || loading) && { opacity: 0.6 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={ghost ? colors.maroon : colors.white} />
      ) : (
        <Text style={[styles.btnText, { color: ghost ? colors.maroon : colors.white }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** مونوغرام JAZ — نفس تصميم أيقونة التطبيق (كحلي + J أبيض + خط ذهبي). */
export function Monogram({ size = 72 }: { size?: number }) {
  return (
    <View
      style={[
        styles.monogram,
        { width: size, height: size, borderRadius: size * 0.22 },
      ]}
    >
      <Text style={[styles.monogramLetter, { fontSize: size * 0.6, lineHeight: size * 0.68 }]}>J</Text>
      <View style={[styles.monogramBar, { width: size * 0.36, height: Math.max(3, size * 0.035) }]} />
    </View>
  );
}

export function Badge({
  label,
  tone = 'maroon',
}: {
  label: string;
  tone?: 'maroon' | 'green' | 'amber';
}) {
  const map = {
    maroon: { bg: colors.redBg, fg: colors.maroon },
    green: { bg: colors.greenBg, fg: colors.green },
    amber: { bg: colors.amberBg, fg: colors.gold },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <Text style={[styles.badgeText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { color: colors.ink, writingDirection: 'rtl' },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSolid: { backgroundColor: colors.maroon },
  btnGhost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.maroon },
  btnText: { fontFamily: font.semibold, fontSize: 15 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    ...shadow.card,
  },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontFamily: font.bold, fontSize: 11 },
  monogram: { backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  monogramLetter: { fontFamily: font.bold, color: colors.white },
  monogramBar: { backgroundColor: colors.gold, borderRadius: 4, marginTop: 2 },
});

const txtStyles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: 26, lineHeight: 34 },
  h2: { fontFamily: font.bold, fontSize: 21, lineHeight: 30 },
  h3: { fontFamily: font.semibold, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 24, color: colors.ink2 },
  small: { fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: colors.ink2 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.maroon },
});

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[screenStyles.screen, style]}>{children}</View>;
}

const screenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
