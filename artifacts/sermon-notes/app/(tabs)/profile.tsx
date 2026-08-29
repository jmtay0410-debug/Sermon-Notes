import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { EmptyState, Header, Screen, SectionTitle } from '@/components/AppUI';

export default function ProfileScreen() {
  const colors = useColors();
  const scheme = useColorScheme();
  const { sermons, savedVerses, removeSavedVerse } = useApp();
  const prayers = sermons.flatMap((sermon) => sermon.prayers);
  return <Screen><Header eyebrow="Your private space" title="Profile" />
    <View style={[styles.profileCard, { backgroundColor: colors.primary }]}><View style={[styles.avatar, { backgroundColor: colors.accent }]}><Text style={[styles.avatarText, { color: colors.accentForeground }]}>J</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={[styles.profileName, { color: colors.primaryForeground }]}>Jake</Text><Text style={[styles.profileMeta, { color: colors.primaryForeground }]}>Notes stay on this device</Text></View><Feather name="shield" size={20} color={colors.primaryForeground} /></View>
    <View style={styles.statRow}><Stat value={`${sermons.length}`} label="Sermons" /><Stat value={`${savedVerses.length}`} label="Saved verses" /><Stat value={`${prayers.length}`} label="Prayer items" /></View>
    <SectionTitle title="Saved verses" action="Export later" onAction={() => Alert.alert('Export coming soon', 'Your notes will always remain yours and export will be added in a future update.')} />
    {savedVerses.length ? savedVerses.map((verse) => <View key={verse.id} style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.savedHeader}><Text style={[styles.reference, { color: colors.primary }]}>{verse.reference}</Text><Pressable onPress={() => removeSavedVerse(verse.id)} hitSlop={8}><Feather name="bookmark" size={18} color={colors.primary} /></Pressable></View><Text style={[styles.savedVerse, { color: colors.foreground }]}>{verse.verseText}</Text><Text style={[styles.savedDate, { color: colors.mutedForeground }]}>Saved {verse.dateSaved}</Text></View>) : <EmptyState icon="bookmark" title="No saved verses yet" body="Save a passage from the Bible tab to keep it close." />}
    <SectionTitle title="Preferences" />
    <View style={[styles.preferenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}><PreferenceRow icon="moon" title="Appearance" value={scheme === 'dark' ? 'Dark' : 'Light'} onPress={() => Alert.alert('Appearance', 'Sermon Notes follows your device appearance settings.')} /><PreferenceRow icon="lock" title="Privacy" value="On device" onPress={() => Alert.alert('Private by design', 'Your sermons, prayers, and saved verses are stored locally on this device.')} /><PreferenceRow icon="download" title="Backup & export" value="Planned" onPress={() => Alert.alert('Backup & export', 'Export is planned so your notes are never locked into this app.')} /></View>
  </Screen>;
}

function Stat({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return <View style={styles.stat}><Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

function PreferenceRow({ icon, title, value, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; value: string; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.preferenceRow, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><View style={[styles.preferenceIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={17} color={colors.primary} /></View><Text style={[styles.preferenceTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.preferenceValue, { color: colors.mutedForeground }]}>{value}</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}

const styles = StyleSheet.create({
  profileCard: { borderRadius: 21, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800' },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileMeta: { fontSize: 12, opacity: 0.8 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 },
  stat: { alignItems: 'center', gap: 3 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  savedCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  savedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reference: { fontSize: 14, fontWeight: '800' },
  savedVerse: { fontSize: 15, lineHeight: 22 },
  savedDate: { fontSize: 12 },
  preferenceCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 15 },
  preferenceRow: { minHeight: 62, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  preferenceRowLast: { borderBottomWidth: 0 },
  preferenceIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  preferenceTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  preferenceValue: { fontSize: 13 },
});