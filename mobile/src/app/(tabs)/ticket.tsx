import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Txt } from '@/components/ui';
import { t } from '@/lib/i18n';
import { colors, radius, spacing } from '@/lib/theme';

export default function Ticket() {
  // المرحلة 5: ستعرض البطاقة الرقمية (QR) وجدول الرحلة بعد تأكيد المشاركة.
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Txt type="h2">{t.ticketTitle}</Txt>
      </View>
      <View style={styles.center}>
        <Txt style={{ fontSize: 48 }}>🎫</Txt>
        <Card style={styles.empty}>
          <Txt type="body" style={{ textAlign: 'center' }}>{t.ticketEmpty}</Txt>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  empty: { borderRadius: radius.lg },
});
