import React, { PropsWithChildren } from 'react';
import { Feather } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export function Screen({ children, scroll = true, style }: PropsWithChildren<{ scroll?: boolean; style?: object }>) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const content = <View style={[styles.screenInner, { paddingTop: topInset + 12, paddingBottom: Platform.OS === 'web' ? 34 : 24 }, style]}>{children}</View>;
  return <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>{scroll ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}</SafeAreaView>;
}

export function Header({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.header}>
    <View style={styles.headerCopy}>
      {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
    </View>
    {action && onAction ? <Pressable onPress={onAction} hitSlop={10} style={({ pressed }) => [styles.headerAction, { opacity: pressed ? 0.55 : 1 }]}><Text style={[styles.headerActionText, { color: colors.primary }]}>{action}</Text></Pressable> : null}
  </View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionTitle}><Text style={[styles.sectionTitleText, { color: colors.foreground }]}>{title}</Text>{action && onAction ? <Pressable onPress={onAction} hitSlop={8}><Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text></Pressable> : null}</View>;
}

export function PrimaryButton({ label, icon, onPress, secondary = false, disabled = false }: { label: string; icon?: keyof typeof Feather.glyphMap; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable testID={label} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: secondary ? colors.secondary : colors.primary, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 }]}>{icon ? <Feather name={icon} size={18} color={secondary ? colors.secondaryForeground : colors.primaryForeground} /> : null}<Text style={[styles.primaryButtonText, { color: secondary ? colors.secondaryForeground : colors.primaryForeground }]}>{label}</Text></Pressable>;
}

export function IconButton({ icon, onPress, label, tone = 'default' }: { icon: keyof typeof Feather.glyphMap; onPress: () => void; label?: string; tone?: 'default' | 'primary' }) {
  const colors = useColors();
  return <Pressable accessibilityLabel={label} testID={label} onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.iconButton, { backgroundColor: tone === 'primary' ? colors.primary : colors.muted, opacity: pressed ? 0.65 : 1 }]}><Feather name={icon} size={20} color={tone === 'primary' ? colors.primaryForeground : colors.foreground} /></Pressable>;
}

export function TextField({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; multiline?: boolean }) {
  const colors = useColors();
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.input, minHeight: multiline ? 96 : 50 }]} /></View>;
}

export function Tag({ label, icon, color }: { label: string; icon?: keyof typeof Feather.glyphMap; color?: string }) {
  const colors = useColors();
  return <View style={[styles.tag, { backgroundColor: color ?? colors.secondary }]}>{icon ? <Feather name={icon} size={12} color={colors.secondaryForeground} /> : null}<Text style={[styles.tagText, { color: colors.secondaryForeground }]}>{label}</Text></View>;
}

export function SermonCard({ sermon, onPress }: { sermon: { title: string; church: string; pastor: string; date: string; mainScripture: string; notes: string }; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.sermonCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
    <View style={styles.cardTop}><View style={[styles.scriptureDot, { backgroundColor: colors.accent }]} /><Text style={[styles.cardDate, { color: colors.mutedForeground }]}>{formatCardDate(sermon.date)}</Text><Feather name="arrow-up-right" size={17} color={colors.mutedForeground} /></View>
    <Text numberOfLines={1} style={[styles.cardTitle, { color: colors.foreground }]}>{sermon.title}</Text>
    <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>{sermon.church}  ·  {sermon.pastor}</Text>
    <Tag label={sermon.mainScripture || 'No passage yet'} icon="book-open" color={colors.accent} />
    <Text numberOfLines={2} style={[styles.cardPreview, { color: colors.mutedForeground }]}>{sermon.notes || 'No notes captured yet. Tap to begin.'}</Text>
  </Pressable>;
}

export function EmptyState({ icon, title, body }: { icon: keyof typeof Feather.glyphMap; title: string; body: string }) {
  const colors = useColors();
  return <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={20} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text></View>;
}

export function formatCardDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  screenInner: { paddingHorizontal: 20, gap: 22 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerCopy: { gap: 6, flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  headerTitle: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.8 },
  headerAction: { marginTop: 10 },
  headerActionText: { fontSize: 15, fontWeight: '600' },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleText: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  sectionAction: { fontSize: 14, fontWeight: '600' },
  primaryButton: { minHeight: 54, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontSize: 16, fontWeight: '700' },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  field: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, fontSize: 16 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tagText: { fontSize: 12, fontWeight: '700' },
  sermonCard: { borderWidth: 1, borderRadius: 20, padding: 17, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scriptureDot: { width: 9, height: 9, borderRadius: 5 },
  cardDate: { flex: 1, fontSize: 12, fontWeight: '600' },
  cardTitle: { fontSize: 20, lineHeight: 24, fontWeight: '700', letterSpacing: -0.4 },
  cardMeta: { fontSize: 13 },
  cardPreview: { fontSize: 14, lineHeight: 20 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 22, alignItems: 'center', gap: 8 },
  emptyIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 290 },
});