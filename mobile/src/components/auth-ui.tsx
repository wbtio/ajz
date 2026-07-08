import { useState } from 'react';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Txt } from '@/components/ui';
import { colors, font, radius, spacing, rtlRow } from '@/lib/theme';

type FeatherName = keyof typeof Feather.glyphMap;

/**
 * حقل إدخال بأيقونة داخله على اليمين (مطابق لتصميم صفحات الدخول في الموقع).
 */
export function Field({
  icon,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboardType,
  autoCapitalizeNone,
}: {
  icon: FeatherName;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalizeNone?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Feather name={icon} size={19} color={focused ? colors.maroon : colors.ink3} style={styles.fieldIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.ink3}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalizeNone ? 'none' : 'sentences'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.errorBox}>
      <Txt type="small" color={colors.maroon}>{message}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { position: 'relative', justifyContent: 'center' },
  fieldIcon: { position: 'absolute', right: 12, zIndex: 1 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingRight: 40,
    paddingLeft: spacing.md,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.ink,
    writingDirection: 'rtl',
  },
  inputFocused: { borderColor: colors.maroon },
  errorBox: { backgroundColor: colors.redBg, borderRadius: radius.sm, padding: spacing.md },
});
