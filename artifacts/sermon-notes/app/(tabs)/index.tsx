import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, formatDate, shortDate } from '@/context/AppContext';
import { Header, PrimaryButton, Screen, SectionTitle, SermonCard, Tag } from '@/components/AppUI';

export default function HomeScreen() {
  const colors = useColors();
  const { sermons } = useApp();
  const recent = sermons.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 2);
  const activePrayers = useMemo(() => sermons.flatMap((sermon) => sermon.prayers.filter((item) => !item.completed).map((item) => ({ ...item, sermonTitle: sermon.title }))).slice(0, 2), [sermons]);
  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return <Screen>
    <Header eyebrow={formatDate(today.toISOString().slice(0, 10))} title={`${greeting}, Jake`} action="Settings" onAction={() => router.push('/(tabs)/profile')} />
    <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
      <View style={styles.welcomeCopy}><Text style={[styles.welcomeKicker, { color: colors.primaryForeground }]}>MAKE ROOM TO LISTEN</Text><Text style={[styles.welcomeTitle, { color: colors.primaryForeground }]}>Capture what matters.</Text><Text style={[styles.welcomeBody, { color: colors.primaryForeground }]}>Your quiet place for Sunday notes, prayers, and next steps.</Text></View>
      <View style={[styles.sunMark, { backgroundColor: colors.accent }]}><Feather name="sunrise" size={27} color={colors.accentForeground} /></View>
      <Pressable testID="New Sermon" onPress={() => router.push('/new-sermon')} style={({ pressed }) => [styles.newButton, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}><Feather name="plus" size={19} color={colors.primary} /><Text style={[styles.newButtonText, { color: colors.primary }]}>New Sermon</Text><Feather name="arrow-up-right" size={18} color={colors.primary} /></Pressable>
    </View>
    <View style={styles.section}><SectionTitle title="Recent sermons" action="View all" onAction={() => router.push('/(tabs)/sermons')} />{recent.map((sermon) => <SermonCard key={sermon.id} sermon={sermon} onPress={() => router.push(`/note/${sermon.id}`)} />)}</View>
    <View style={styles.section}><SectionTitle title="This week" /><View style={[styles.reminderCard, { backgroundColor: colors.accent }]}><View style={[styles.reminderIcon, { backgroundColor: colors.card }]}><Feather name="bookmark" size={18} color={colors.accentForeground} /></View><View style={styles.reminderCopy}><Text style={[styles.reminderLabel, { color: colors.accentForeground }]}>REMEMBER</Text><Text style={[styles.reminderText, { color: colors.accentForeground }]}>{sermons[0]?.reminders[0]?.text ?? 'Make space for what you heard this week.'}</Text><Text style={[styles.reminderMeta, { color: colors.accentForeground }]}>{sermons[0] ? shortDate(sermons[0].date) : 'This week'} · {sermons[0]?.title ?? 'Your sermon notes'}</Text></View></View></View>
    <View style={styles.section}><SectionTitle title="Prayers" action="See all" onAction={() => router.push('/(tabs)/profile')} />{activePrayers.length ? activePrayers.map((prayer) => <Pressable key={prayer.id} onPress={() => router.push(`/note/${prayer.sermonId}`)} style={[styles.prayerRow, { borderBottomColor: colors.border }]}><View style={[styles.prayerDot, { backgroundColor: colors.secondary }]}><Feather name="heart" size={15} color={colors.primary} /></View><View style={styles.prayerCopy}><Text numberOfLines={2} style={[styles.prayerText, { color: colors.foreground }]}>{prayer.text}</Text><Text style={[styles.prayerMeta, { color: colors.mutedForeground }]}>{prayer.sermonTitle}</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>) : <Text style={{ color: colors.mutedForeground }}>Your prayer items will appear here.</Text>}</View>
    <PrimaryButton label="Start a new sermon" icon="plus" onPress={() => router.push('/new-sermon')} secondary />
  </Screen>;
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  welcomeCard: { borderRadius: 24, padding: 20, gap: 20, overflow: 'hidden', minHeight: 226 },
  welcomeCopy: { gap: 7, paddingRight: 60 },
  welcomeKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, opacity: 0.75 },
  welcomeTitle: { fontSize: 27, lineHeight: 31, fontWeight: '700', letterSpacing: -0.8 },
  welcomeBody: { fontSize: 14, lineHeight: 20, opacity: 0.82 },
  sunMark: { position: 'absolute', right: 22, top: 20, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  newButton: { height: 53, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 'auto' },
  newButtonText: { fontSize: 16, fontWeight: '700', flex: 1 },
  reminderCard: { borderRadius: 18, padding: 16, flexDirection: 'row', gap: 12 },
  reminderIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  reminderCopy: { flex: 1, gap: 5 },
  reminderLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  reminderText: { fontSize: 16, lineHeight: 21, fontWeight: '700' },
  reminderMeta: { fontSize: 12, opacity: 0.8 },
  prayerRow: { paddingVertical: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  prayerDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  prayerCopy: { flex: 1, gap: 4 },
  prayerText: { fontSize: 14, lineHeight: 19, fontWeight: '600' },
  prayerMeta: { fontSize: 12 },
});