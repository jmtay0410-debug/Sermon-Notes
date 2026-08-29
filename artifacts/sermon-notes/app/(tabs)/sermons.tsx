import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { EmptyState, Header, Screen, SermonCard, Tag } from '@/components/AppUI';

const filterOptions = ['All', 'Church', 'Pastor', 'Series', 'Book'];

export default function SermonsScreen() {
  const colors = useColors();
  const { sermons } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(() => sermons.slice().sort((a, b) => b.date.localeCompare(a.date)).filter((sermon) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const searchable = [sermon.title, sermon.notes, sermon.mainScripture, sermon.pastor, sermon.church, sermon.series, ...sermon.keyPoints.map((item) => item.text), ...sermon.applications.map((item) => item.text), ...sermon.prayers.map((item) => item.text)].join(' ').toLowerCase();
    if (filter === 'Church') return sermon.church.toLowerCase().includes(term);
    if (filter === 'Pastor') return sermon.pastor.toLowerCase().includes(term);
    if (filter === 'Series') return sermon.series.toLowerCase().includes(term);
    if (filter === 'Book') return sermon.mainScripture.toLowerCase().includes(term);
    return searchable.includes(term);
  }), [sermons, search, filter]);

  return <Screen><Header eyebrow={`${sermons.length} saved notes`} title="Sermons" action="New" onAction={() => router.push('/new-sermon')} />
    <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.input }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput value={search} onChangeText={setSearch} placeholder="Search notes, passages, people…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} /><Feather name="sliders" size={17} color={colors.mutedForeground} /></View>
    <View style={styles.filters}>{filterOptions.map((option) => <Pressable key={option} onPress={() => setFilter(option)} style={[styles.filter, { backgroundColor: filter === option ? colors.primary : colors.secondary }]}><Text style={[styles.filterText, { color: filter === option ? colors.primaryForeground : colors.secondaryForeground }]}>{option}</Text></Pressable>)}</View>
    <View style={styles.resultMeta}><Text style={[styles.resultText, { color: colors.mutedForeground }]}>{filtered.length} {filtered.length === 1 ? 'sermon' : 'sermons'}</Text>{search ? <Pressable onPress={() => setSearch('')}><Text style={[styles.clearText, { color: colors.primary }]}>Clear search</Text></Pressable> : null}</View>
    {filtered.length ? filtered.map((sermon) => <SermonCard key={sermon.id} sermon={sermon} onPress={() => router.push(`/note/${sermon.id}`)} />) : <EmptyState icon="search" title="No sermons found" body="Try a different phrase or clear your search." />}
    <View style={[styles.searchHint, { backgroundColor: colors.secondary }]}><Feather name="info" size={15} color={colors.primary} /><Text style={[styles.searchHintText, { color: colors.secondaryForeground }]}>Search also looks inside key points, applications, prayers, and Bible references.</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({
  searchBox: { borderWidth: 1, borderRadius: 15, height: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filter: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  filterText: { fontSize: 12, fontWeight: '700' },
  resultMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultText: { fontSize: 13, fontWeight: '600' },
  clearText: { fontSize: 13, fontWeight: '700' },
  searchHint: { borderRadius: 14, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  searchHintText: { flex: 1, fontSize: 12, lineHeight: 17 },
});