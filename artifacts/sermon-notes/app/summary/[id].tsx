import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp, formatDate } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { Screen, SectionTitle, Tag } from '@/components/AppUI';

export default function SummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { sermons, toggleItem } = useApp();
  const sermon = sermons.find((item) => item.id === id);
  if (!sermon) return <Screen><Text style={{ color: colors.foreground }}>Sermon not found.</Text></Screen>;
  return <Screen><View style={styles.header}><Pressable onPress={() => router.replace('/(tabs)')} hitSlop={10}><Feather name="x" size={23} color={colors.foreground} /></Pressable><Text style={[styles.headerTitle, { color: colors.foreground }]}>Sermon recap</Text><Pressable onPress={() => router.push(`/note/${sermon.id}`)} hitSlop={10}><Feather name="edit-3" size={20} color={colors.primary} /></Pressable></View><View style={[styles.hero, { backgroundColor: colors.primary }]}><View style={[styles.checkMark, { backgroundColor: colors.accent }]}><Feather name="check" size={23} color={colors.accentForeground} /></View><Text style={[styles.heroKicker, { color: colors.primaryForeground }]}>SERMON COMPLETE</Text><Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>{sermon.title}</Text><Text style={[styles.heroMeta, { color: colors.primaryForeground }]}>{sermon.church} · {formatDate(sermon.date)}</Text></View><View style={styles.summaryMeta}><Meta label="Speaker" value={sermon.pastor} /><Meta label="Main passage" value={sermon.mainScripture || 'Not added'} /><Meta label="Series" value={sermon.series || 'Not added'} /></View><View style={styles.section}><SectionTitle title="Full notes" /><View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.notesText, { color: colors.foreground }]}>{sermon.notes || 'No notes captured.'}</Text></View></View><SummaryList title="Key points" icon="star" items={sermon.keyPoints.map((item) => item.text)} /><SummaryList title="Scriptures mentioned" icon="book-open" items={sermon.scriptures.map((item) => item.reference)} /><SummaryList title="Applications" icon="compass" items={sermon.applications.map((item) => item.text)} toggleable={sermon.applications} onToggle={(itemId) => toggleItem(sermon.id, 'applications', itemId)} /><SummaryList title="Prayer items" icon="heart" items={sermon.prayers.map((item) => item.text)} toggleable={sermon.prayers} onToggle={(itemId) => toggleItem(sermon.id, 'prayers', itemId)} /><SummaryList title="Remember" icon="bookmark" items={sermon.reminders.map((item) => item.text)} /></Screen>;
}

function Meta({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return <View style={styles.meta}><Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{label}</Text><Text numberOfLines={2} style={[styles.metaValue, { color: colors.foreground }]}>{value}</Text></View>;
}

function SummaryList({ title, icon, items, toggleable, onToggle }: { title: string; icon: keyof typeof Feather.glyphMap; items: string[]; toggleable?: { id: string; completed?: boolean }[]; onToggle?: (id: string) => void }) {
  const colors = useColors();
  return <View style={styles.section}><SectionTitle title={title} /><View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>{items.length ? items.map((item, index) => <Pressable key={`${item}-${index}`} onPress={() => { const entry = toggleable?.[index]; if (entry && onToggle) onToggle(entry.id); }} style={[styles.listRow, index < items.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: 1 } : null]}><View style={[styles.listIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={14} color={colors.primary} /></View><Text style={[styles.listText, { color: colors.foreground, textDecorationLine: toggleable?.[index]?.completed ? 'line-through' : 'none' }]}>{item}</Text>{toggleable ? <Feather name={toggleable[index]?.completed ? 'check-circle' : 'circle'} size={18} color={toggleable[index]?.completed ? colors.primary : colors.mutedForeground} /> : null}</Pressable>) : <Text style={[styles.noItems, { color: colors.mutedForeground }]}>Nothing added yet.</Text>}</View></View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  hero: { borderRadius: 23, padding: 21, gap: 8 },
  checkMark: { width: 45, height: 45, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, opacity: 0.75 },
  heroTitle: { fontSize: 28, lineHeight: 32, fontWeight: '700', letterSpacing: -0.8 },
  heroMeta: { fontSize: 13, opacity: 0.8 },
  summaryMeta: { flexDirection: 'row', gap: 10 },
  meta: { flex: 1, gap: 5 },
  metaLabel: { fontSize: 11, fontWeight: '700' },
  metaValue: { fontSize: 13, fontWeight: '600' },
  section: { gap: 11 },
  notesCard: { borderWidth: 1, borderRadius: 18, padding: 17 },
  notesText: { fontSize: 16, lineHeight: 25 },
  listCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 15 },
  listRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  listIcon: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  listText: { flex: 1, fontSize: 14, lineHeight: 19 },
  noItems: { paddingVertical: 17, fontSize: 14 },
});