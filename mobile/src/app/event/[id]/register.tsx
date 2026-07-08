/**
 * التسجيل الشامل بالفعالية — نموذج من 4 خطوات: بياناته المهنية، الخدمات المدفوعة،
 * رفع الوثائق، ثم مراجعة ودفع (وهمي مؤقتاً). ينتهي بإصدار الدعوة بعد مراجعة الإدارة.
 * حفظ تلقائي بعد كل خطوة — لا يضيع شيء عند الانقطاع.
 */
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button, Card, Txt } from '@/components/ui';
import { ErrorBox } from '@/components/auth-ui';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/sectors';
import { eventTitle, useEvent } from '@/lib/events';
import {
  getRegistrationFields,
  pickDocumentImage,
  useMyRegistration,
  useSaveRegistrationStep,
  useUploadDocument,
  SERVICE_PRICING,
  type FormField,
  type SelectedService,
  type UploadedDocument,
} from '@/lib/registration';
import { t } from '@/lib/i18n';
import { colors, font, radius, rtlRow, spacing } from '@/lib/theme';

const STEPS = [t.regStepInfo, t.regStepServices, t.regStepDocs, t.regStepPayment];

function money(n: number) {
  return n > 0 ? `${n.toLocaleString('ar')} د.ع` : t.regFree;
}

function StepIndicator({ step }: { step: number }) {
  return (
    <View style={styles.stepsRow}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}>
              {done ? (
                <Feather name="check" size={12} color={colors.white} />
              ) : (
                <Txt style={[styles.stepDotText, active && { color: colors.white }]}>{n}</Txt>
              )}
            </View>
            <Txt style={[styles.stepLabel, active && styles.stepLabelActive]} numberOfLines={1}>{label}</Txt>
          </View>
        );
      })}
    </View>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = field.options_ar?.length ? field.options_ar : field.options ?? [];

  if (field.type === 'select' && options.length > 0) {
    return (
      <View style={styles.chips}>
        {options.map((opt) => {
          const on = value === opt;
          return (
            <Pressable key={opt} onPress={() => onChange(opt)} style={[styles.chip, on && styles.chipOn]}>
              <Txt type="small" color={on ? colors.white : colors.ink2}>{opt}</Txt>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      style={[styles.input, field.type === 'textarea' && styles.inputMultiline]}
      multiline={field.type === 'textarea'}
      keyboardType={field.type === 'number' ? 'numeric' : field.type === 'email' ? 'email-address' : 'default'}
      placeholder={field.placeholder_ar}
      placeholderTextColor={colors.ink3}
    />
  );
}

export default function EventRegister() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: event, isLoading: eventLoading } = useEvent(id);
  const { data: profile } = useProfile();
  const { data: existing, isLoading: regLoading } = useMyRegistration(id);
  const saveStep = useSaveRegistrationStep();
  const uploadDoc = useUploadDocument();

  const fields = useMemo(() => (event ? getRegistrationFields(event) : []), [event]);

  const [hydrated, setHydrated] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | undefined>(undefined);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<Record<string, string>>({});

  const [wantsInsurance, setWantsInsurance] = useState(false);
  const [insuranceCountry, setInsuranceCountry] = useState('');
  const [insuranceStart, setInsuranceStart] = useState('');
  const [insuranceEnd, setInsuranceEnd] = useState('');
  const [wantsApplicationHelp, setWantsApplicationHelp] = useState(false);
  const [wantsAppointment, setWantsAppointment] = useState(false);

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // تعبئة الحالة من تسجيل موجود أو من الملف الشخصي (مرّة واحدة فقط)
  useEffect(() => {
    if (hydrated || regLoading || !event) return;

    if (existing) {
      if (existing.current_step >= 5) {
        setAlreadySubmitted(true);
        setHydrated(true);
        return;
      }
      setRegistrationId(existing.id);
      setStep(Math.min(Math.max(existing.current_step, 1), 4));
      setValues((existing.additional_data as Record<string, string>) ?? {});
      const services = (existing.selected_services as SelectedService[] | null) ?? [];
      setWantsInsurance(services.some((s) => s.key === 'insurance'));
      const ins = services.find((s) => s.key === 'insurance');
      if (ins?.meta) {
        setInsuranceCountry(ins.meta.country ?? '');
        setInsuranceStart(ins.meta.start ?? '');
        setInsuranceEnd(ins.meta.end ?? '');
      }
      setWantsApplicationHelp(services.some((s) => s.key === 'applicationHelp'));
      setWantsAppointment(services.some((s) => s.key === 'appointmentBooking'));
      setDocuments((existing.documents as UploadedDocument[] | null) ?? []);
    } else {
      // تعبئة مسبقة بسيطة من الملف الشخصي حسب تسمية الحقل
      const prefill: Record<string, string> = {};
      for (const f of fields) {
        const label = f.label_ar || '';
        if (label.includes('شركة') && profile?.company_name) prefill[f.id] = profile.company_name;
        else if (label.includes('بريد') && user?.email) prefill[f.id] = user.email;
        else if (label.includes('هاتف') && profile?.phone) prefill[f.id] = profile.phone;
        else if (label.includes('مدينة') && profile?.city) prefill[f.id] = profile.city;
        else if (label.includes('دولة') && profile?.country) prefill[f.id] = profile.country;
        else if (label === 'الاسم' || label.includes('الاسم الكامل')) {
          const name = (user?.user_metadata?.full_name as string) ?? '';
          if (name) prefill[f.id] = name;
        }
      }
      setValues(prefill);
    }
    setHydrated(true);
  }, [hydrated, regLoading, event, existing, fields, profile, user]);

  const selectedServices: SelectedService[] = useMemo(() => {
    const list: SelectedService[] = [];
    if (wantsInsurance) {
      list.push({
        key: 'insurance',
        label: t.regInsurance,
        amount: SERVICE_PRICING.insurance,
        meta: { country: insuranceCountry, start: insuranceStart, end: insuranceEnd },
      });
    }
    if (wantsApplicationHelp) {
      list.push({ key: 'applicationHelp', label: t.regApplicationHelp, amount: SERVICE_PRICING.applicationHelp });
    }
    if (wantsAppointment) {
      list.push({ key: 'appointmentBooking', label: t.regAppointment, amount: SERVICE_PRICING.appointmentBooking });
    }
    return list;
  }, [event, wantsInsurance, insuranceCountry, insuranceStart, insuranceEnd, wantsApplicationHelp, wantsAppointment]);

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.amount, 0);

  async function goStep1Next() {
    const missing = fields.some((f) => f.required && !values[f.id]?.trim());
    if (missing) {
      setError(t.regRequiredField);
      return;
    }
    setError(null);
    try {
      const fullNameField = fields.find((f) => (f.label_ar || '').includes('الاسم') && !(f.label_ar || '').includes('شركة'));
      const emailField = fields.find((f) => f.type === 'email');
      const row = await saveStep.mutateAsync({
        registrationId,
        eventId: id,
        step: 2,
        fullName: (fullNameField && values[fullNameField.id]) || (user?.user_metadata?.full_name as string) || undefined,
        email: (emailField && values[emailField.id]) || user?.email || undefined,
        additionalData: values,
      });
      setRegistrationId(row.id);
      setStep(2);
    } catch {
      setError(t.profileSetupError);
    }
  }

  async function goStep2Next() {
    setError(null);
    try {
      const row = await saveStep.mutateAsync({
        registrationId,
        eventId: id,
        step: 3,
        selectedServices,
        totalAmount,
      });
      setRegistrationId(row.id);
      setStep(3);
    } catch {
      setError(t.profileSetupError);
    }
  }

  async function onAddDocument() {
    setError(null);
    const asset = await pickDocumentImage();
    if (!asset) return;
    try {
      const doc = await uploadDoc.mutateAsync({ eventId: id, asset });
      setDocuments((prev) => [...prev, doc]);
    } catch {
      setError(t.regDocRequired);
    }
  }

  async function goStep3Next() {
    if (documents.length === 0) {
      setError(t.regDocRequired);
      return;
    }
    setError(null);
    try {
      const row = await saveStep.mutateAsync({
        registrationId,
        eventId: id,
        step: 4,
        documents,
      });
      setRegistrationId(row.id);
      setStep(4);
    } catch {
      setError(t.profileSetupError);
    }
  }

  async function onConfirm() {
    setError(null);
    try {
      await saveStep.mutateAsync({
        registrationId,
        eventId: id,
        step: 5,
        status: 'pending',
        paymentStatus: 'pending',
      });
      setDone(true);
    } catch {
      setError(t.regRequiredField);
    }
  }

  if (eventLoading || regLoading || !hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.maroon} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Txt type="body">{t.noEvents}</Txt>
      </View>
    );
  }

  if (fields.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Txt type="h3" style={styles.center}>{t.regFieldsEmpty}</Txt>
          <Button title={t.eventBack} variant="ghost" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  if (alreadySubmitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <View style={styles.doneIcon}>
            <Feather name="check" size={36} color={colors.white} />
          </View>
          <Txt type="h2" style={styles.center}>{t.regAlreadyTitle}</Txt>
          <Button
            title={t.regAlreadyContinue}
            onPress={() => router.replace('/(tabs)/ticket')}
            style={{ marginTop: spacing.md, alignSelf: 'stretch' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <View style={styles.doneIcon}>
            <Feather name="check" size={36} color={colors.white} />
          </View>
          <Txt type="h2" style={styles.center}>{t.regDoneTitle}</Txt>
          <Txt type="small" style={styles.center}>{t.regDoneMessage}</Txt>
          <Button
            title={t.regDoneBackHome}
            onPress={() => router.replace('/(tabs)/ticket')}
            style={{ marginTop: spacing.md, alignSelf: 'stretch' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <Feather name="chevron-right" size={22} color={colors.maroon} />
        </Pressable>
        <Txt type="h3" numberOfLines={1} style={{ flex: 1 }}>{eventTitle(event)}</Txt>
      </View>

      <StepIndicator step={step} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {error ? <ErrorBox message={error} /> : null}

        {step === 1 ? (
          <Card style={styles.card}>
            {fields.map((f) => (
              <View key={f.id} style={styles.question}>
                <Txt type="label">{f.label_ar}{f.required ? ' *' : ''}</Txt>
                <FieldInput field={f} value={values[f.id] ?? ''} onChange={(v) => setValues((p) => ({ ...p, [f.id]: v }))} />
              </View>
            ))}
          </Card>
        ) : null}

        {step === 2 ? (
          <Card style={styles.card}>
            <Txt type="label">{t.regServicesTitle}</Txt>
            <Txt type="small">{t.regServicesSubtitle}</Txt>

            <Pressable style={styles.serviceRow} onPress={() => setWantsInsurance((v) => !v)}>
              <Feather name={wantsInsurance ? 'check-square' : 'square'} size={18} color={colors.maroon} />
              <View style={{ flex: 1 }}>
                <Txt style={styles.serviceLabel}>{t.regInsurance}</Txt>
                <Txt type="small">{t.regInsuranceHint}</Txt>
              </View>
              <Txt style={styles.servicePrice}>{money(SERVICE_PRICING.insurance)}</Txt>
            </Pressable>
            {wantsInsurance ? (
              <View style={styles.subFields}>
                <TextInput
                  value={insuranceCountry}
                  onChangeText={setInsuranceCountry}
                  placeholder={t.regInsuranceCountry}
                  placeholderTextColor={colors.ink3}
                  style={styles.input}
                />
                <View style={styles.row}>
                  <TextInput
                    value={insuranceStart}
                    onChangeText={setInsuranceStart}
                    placeholder={t.regInsuranceStart}
                    placeholderTextColor={colors.ink3}
                    style={[styles.input, styles.rowItem]}
                  />
                  <TextInput
                    value={insuranceEnd}
                    onChangeText={setInsuranceEnd}
                    placeholder={t.regInsuranceEnd}
                    placeholderTextColor={colors.ink3}
                    style={[styles.input, styles.rowItem]}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.divider} />

            <Pressable style={styles.serviceRow} onPress={() => setWantsApplicationHelp((v) => !v)}>
              <Feather name={wantsApplicationHelp ? 'check-square' : 'square'} size={18} color={colors.maroon} />
              <View style={{ flex: 1 }}>
                <Txt style={styles.serviceLabel}>{t.regApplicationHelp}</Txt>
                <Txt type="small">{t.regApplicationHelpHint}</Txt>
              </View>
              <Txt style={styles.servicePrice}>{money(SERVICE_PRICING.applicationHelp)}</Txt>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.serviceRow} onPress={() => setWantsAppointment((v) => !v)}>
              <Feather name={wantsAppointment ? 'check-square' : 'square'} size={18} color={colors.maroon} />
              <View style={{ flex: 1 }}>
                <Txt style={styles.serviceLabel}>{t.regAppointment}</Txt>
                <Txt type="small">{t.regAppointmentHint}</Txt>
              </View>
              <Txt style={styles.servicePrice}>{money(SERVICE_PRICING.appointmentBooking)}</Txt>
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Txt type="h3">{t.regTotal}</Txt>
              <Txt type="h3" color={colors.maroon}>{money(totalAmount)}</Txt>
            </View>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card style={styles.card}>
            <Txt type="label">{t.regDocsTitle}</Txt>
            <Txt type="small">{t.regDocsSubtitle}</Txt>

            {documents.map((doc) => (
              <View key={doc.path} style={styles.docRow}>
                <Feather name="file" size={16} color={colors.maroon} />
                <Txt style={{ flex: 1 }} numberOfLines={1}>{doc.name}</Txt>
                <Pressable hitSlop={8} onPress={() => setDocuments((prev) => prev.filter((d) => d.path !== doc.path))}>
                  <Feather name="x" size={16} color={colors.ink3} />
                </Pressable>
              </View>
            ))}

            <Pressable style={styles.addDocBtn} onPress={onAddDocument} disabled={uploadDoc.isPending}>
              {uploadDoc.isPending ? (
                <ActivityIndicator color={colors.maroon} />
              ) : (
                <>
                  <Feather name="camera" size={18} color={colors.maroon} />
                  <Txt style={styles.addDocText}>{t.regAddDocument}</Txt>
                </>
              )}
            </Pressable>
          </Card>
        ) : null}

        {step === 4 ? (
          <Card style={styles.card}>
            <Txt type="label">{t.regPaymentTitle}</Txt>
            {selectedServices.map((s) => (
              <View key={s.key} style={styles.serviceRow}>
                <Txt style={{ flex: 1 }}>{s.label}</Txt>
                <Txt style={styles.servicePrice}>{money(s.amount)}</Txt>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Txt type="h3">{t.regTotal}</Txt>
              <Txt type="h3" color={colors.maroon}>{money(totalAmount)}</Txt>
            </View>
            <View style={styles.notice}>
              <Feather name="info" size={16} color={colors.gold} />
              <Txt type="small" style={{ flex: 1 }}>{t.regPaymentNotice}</Txt>
            </View>
            <Txt type="small" style={styles.invitationNotice}>{t.regInvitationNotice}</Txt>
          </Card>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {step < 4 ? (
          <Button
            title={saveStep.isPending ? t.regSaving : t.regNext}
            loading={saveStep.isPending}
            onPress={step === 1 ? goStep1Next : step === 2 ? goStep2Next : goStep3Next}
          />
        ) : (
          <Button
            title={saveStep.isPending ? t.regSaving : t.regConfirm}
            loading={saveStep.isPending}
            onPress={onConfirm}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.xl },
  header: { flexDirection: rtlRow, alignItems: 'center', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: 40 },
  card: { gap: spacing.md, borderRadius: radius.lg },
  question: { gap: 6 },
  stepsRow: { flexDirection: rtlRow, paddingHorizontal: spacing.lg, gap: 4 },
  stepItem: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { borderColor: colors.maroon, backgroundColor: colors.maroon },
  stepDotDone: { borderColor: colors.green, backgroundColor: colors.green },
  stepDotText: { fontSize: 11, fontFamily: font.bold, color: colors.ink3 },
  stepLabel: { fontSize: 10, fontFamily: font.medium, color: colors.ink3 },
  stepLabelActive: { color: colors.maroon, fontFamily: font.semibold },
  chips: { flexDirection: rtlRow, flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.ink,
    textAlign: 'right',
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: rtlRow, gap: spacing.sm },
  rowItem: { flex: 1 },
  subFields: { gap: spacing.sm, marginTop: -spacing.xs },
  divider: { height: 1, backgroundColor: colors.line },
  serviceRow: { flexDirection: rtlRow, alignItems: 'center', gap: spacing.md },
  serviceLabel: { fontSize: 14, fontFamily: font.medium, color: colors.ink },
  servicePrice: { fontSize: 13, fontFamily: font.semibold, color: colors.maroon },
  totalRow: { flexDirection: rtlRow, alignItems: 'center', justifyContent: 'space-between' },
  docRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  addDocBtn: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.maroon,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  addDocText: { fontSize: 14, fontFamily: font.semibold, color: colors.maroon },
  notice: {
    flexDirection: rtlRow,
    gap: spacing.sm,
    backgroundColor: colors.amberBg,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  invitationNotice: { textAlign: 'center' },
  footer: { padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
});
