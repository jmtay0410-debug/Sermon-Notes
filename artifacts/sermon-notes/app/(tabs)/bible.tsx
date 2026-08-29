import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Header, PrimaryButton, Screen, SectionTitle, Tag } from '@/components/AppUI';

const books = ['Matthew', 'John', 'Romans', 'Psalms', 'Ephesians'];
const passages = [
  { reference: 'John 3:16', book: 'John', verseText: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.' },
  { reference: 'Romans 8:28', book: 'Romans', verseText: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.' },
  { reference: 'Psalm 23:1', book: 'Psalms', verseText: 'The Lord is my shepherd; I shall not want.' },
  { reference: 'Ephesians 2:8-10', book: 'Ephesians', verseText: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.' },
];

export default function BibleScreen() {
  const colors = useColors();
  const { savedVerses, saveVerse, appendScripture, activeSermonId } = useApp();
  const [book, setBook] = useState('John');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<typeof passages[number] | null>(null);
  const visible = useMemo(() => passages.filter((passage) => passage.book === book && (!query || `${passage.reference} ${passage.verseText}`.toLowerCase().includes(query.toLowerCase()))), [book, query]);

  return <Screen><Header eyebrow="A quiet place to return" title="Bible" action="Saved" onAction={() => router.push('/(tabs)/profile')} />
    <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.input }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="Search Scripture" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} /></View>
    <View><Text style={[styles.selectorLabel, { color: colors.mutedForeground }]}>BOOK</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookRow}>{books.map((item) => <Pressable key={item} onPress={() => setBook(item)} style={[styles.bookPill, { backgroundColor: book === item ? colors.primary : colors.secondary }]}><Text style={[styles.bookPillText, { color: book === item ? colors.primaryForeground : colors.secondaryForeground }]}>{item}</Text></Pressable>)}</ScrollView></View>
    <View style={[styles.translationNote, { backgroundColor: colors.secondary }]}><Feather name="book-open" size={16} color={colors.primary} /><Text style={[styles.translationText, { color: colors.secondaryForeground }]}>Sample passages for this prototype · Scripture is clearly separated from your notes.</Text></View>
    <SectionTitle title={`${book} passages`} />
    {visible.map((passage) => <Pressable key={passage.reference} onPress={() => setSelected(passage)} style={({ pressed }) => [styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}><View style={styles.verseHeader}><Text style={[styles.reference, { color: colors.primary }]}>{passage.reference}</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></View><Text style={[styles.verseText, { color: colors.foreground }]}>{passage.verseText}</Text></Pressable>)}
    <SectionTitle title="Saved verses" action={`${savedVerses.length} saved`} onAction={() => router.push('/(tabs)/profile')} />
    {savedVerses.slice(0, 2).map((verse) => <View key={verse.id} style={[styles.savedRow, { borderBottomColor: colors.border }]}><View style={{ flex: 1, gap: 4 }}><Text style={[styles.reference, { color: colors.primary }]}>{verse.reference}</Text><Text numberOfLines={1} style={[styles.savedText, { color: colors.foreground }]}>{verse.verseText}</Text></View><Feather name="bookmark" size={17} color={colors.primary} /></View>)}
    <Modal transparent animationType="slide" visible={!!selected} onRequestClose={() => setSelected(null)}><View style={styles.modalBackdrop}><View style={[styles.sheet, { backgroundColor: colors.card }]}><View style={[styles.sheetHandle, { backgroundColor: colors.border }]} /><View style={styles.sheetHeader}><View style={{ flex: 1, gap: 5 }}><Text style={[styles.sheetKicker, { color: colors.primary }]}>SCRIPTURE</Text><Text style={[styles.sheetTitle, { color: colors.foreground }]}>{selected?.reference}</Text></View><Pressable onPress={() => setSelected(null)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable></View><Text style={[styles.sheetVerse, { color: colors.foreground }]}>{selected?.verseText}</Text><Text style={[styles.attribution, { color: colors.mutedForeground }]}>Sample Scripture text · Tap save to keep this verse close.</Text><View style={styles.sheetActions}><PrimaryButton label="Save verse" icon="bookmark" onPress={() => { if (selected) saveVerse(selected.reference, selected.verseText); setSelected(null); Alert.alert('Verse saved', 'You can find it in your Profile.'); }} /><PrimaryButton label={activeSermonId ? 'Add to current sermon' : 'No sermon open'} icon="plus" secondary={!activeSermonId} disabled={!activeSermonId} onPress={() => { if (selected && activeSermonId) appendScripture(activeSermonId, selected.reference, selected.verseText); setSelected(null); }} /></View></View></View></Modal>
  </Screen>;
}

const styles = StyleSheet.create({
  searchBox: { borderWidth: 1, borderRadius: 15, height: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  selectorLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 9 },
  bookRow: { gap: 8 },
  bookPill: { borderRadius: 11, paddingHorizontal: 14, paddingVertical: 10 },
  bookPillText: { fontSize: 13, fontWeight: '700' },
  translationNote: { borderRadius: 14, padding: 12, flexDirection: 'row', gap: 8 },
  translationText: { fontSize: 12, lineHeight: 17, flex: 1 },
  verseCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reference: { fontSize: 14, fontWeight: '800' },
  verseText: { fontSize: 16, lineHeight: 25 },
  savedRow: { paddingVertical: 13, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  savedText: { fontSize: 14, lineHeight: 19 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(20, 25, 21, 0.42)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 34, gap: 18 },
  sheetHandle: { width: 42, height: 4, borderRadius: 2, alignSelf: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  sheetKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  sheetTitle: { fontSize: 25, fontWeight: '700' },
  sheetVerse: { fontSize: 19, lineHeight: 29, fontWeight: '500' },
  attribution: { fontSize: 12 },
  sheetActions: { gap: 10 },
});