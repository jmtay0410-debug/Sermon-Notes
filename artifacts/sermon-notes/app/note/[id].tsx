import React, { useMemo, useState } from 'react';
import { Alert, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp, formatDate } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { IconButton, PrimaryButton, Screen, Tag } from '@/components/AppUI';

const categories = [
  { kind: 'keyPoints' as const, label: 'Key point', icon: 'star' as const, description: 'An important statement from the sermon.' },
  { kind: 'scriptures' as const, label: 'Scripture', icon: 'book-open' as const, description: 'A verse or reference to revisit.' },
  { kind: 'prayers' as const, label: 'Prayer', icon: 'heart' as const, description: 'Something to bring to God.' },
  { kind: 'applications' as const, label: 'Application', icon: 'compass' as const, description: 'Something to practice this week.' },
  { kind: 'reminders' as const, label: 'Remember', icon: 'bookmark' as const, description: 'A thought you want to keep close.' },
];

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { sermons, updateSermon, addTaggedItem, setActiveSermonId } = useApp();
  const sermon = sermons.find((item) => item.id === id);
  const [category, setCategory] = useState<typeof categories[number] | null>(null);
  const [categoryText, setCategoryText] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [biblePreview, setBiblePreview] = useState<string | null>(null);
  React.useEffect(() => { setActiveSermonId(id ?? null); return () => setActiveSermonId(null); }, [id, setActiveSermonId]);
  const reference = useMemo(() => sermon?.notes.match(/\b(?:John|Romans|Matthew|Mark|Luke|Psalms?|Ephesians|1 Corinthians|2 Corinthians)\s+\d+(?::\d+(?:-\d+)?)?/i)?.[0], [sermon?.notes]);
  if (!sermon) return <Screen><Text style={{ color: colors.foreground }}>Sermon not found.</Text></Screen>;
  const insertText = (value: string) => {
    const before = sermon.notes.slice(0, selection.start);
    const after = sermon.notes.slice(selection.end);
    updateSermon(sermon.id, { notes: `${before}${value}${after}` });
  };
  const submitCategory = () => {
    const trimmed = categoryText.trim();
    if (!trimmed || !category) return;
    if (category.kind === 'scriptures') {
      insertText(`\n${trimmed}\n`);
    } else {
      addTaggedItem(sermon.id, category.kind, trimmed);
    }
    setCategoryText('');
    setCategory(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  return <Screen scroll={false} style={styles.screen}><View style={styles.noteHeader}><IconButton icon="chevron-left" label="Back" onPress={() => router.back()} /><View style={styles.noteHeading}><Text numberOfLines={1} style={[styles.noteTitle, { color: colors.foreground }]}>{sermon.title}</Text><Text numberOfLines={1} style={[styles.noteMeta, { color: colors.mutedForeground }]}>{sermon.mainScripture || 'Add a passage'} · {sermon.pastor} · {formatDate(sermon.date)}</Text></View><IconButton icon="more-horizontal" label="More options" onPress={() => Alert.alert('Sermon options', 'Your notes save automatically. A full export option is coming later.')} /></View><View style={[styles.saveStatus, { backgroundColor: colors.secondary }]}><Feather name="check" size={13} color={colors.primary} /><Text style={[styles.saveStatusText, { color: colors.secondaryForeground }]}>Saved on this device</Text></View><View style={[styles.editorCard, { backgroundColor: colors.card, borderColor: colors.border }]}><TextInput testID="Sermon note editor" multiline autoFocus value={sermon.notes} onChangeText={(notes) => updateSermon(sermon.id, { notes })} onSelectionChange={(event) => setSelection(event.nativeEvent.selection)} placeholder="Start writing what stands out…" placeholderTextColor={colors.mutedForeground} style={[styles.editor, { color: colors.foreground }]} textAlignVertical="top" scrollEnabled={true} /></View>{reference ? <Pressable onPress={() => setBiblePreview(reference)} style={[styles.referencePill, { backgroundColor: colors.accent }]}><Feather name="book-open" size={14} color={colors.accentForeground} /><Text style={[styles.referencePillText, { color: colors.accentForeground }]}>View {reference}</Text><Feather name="arrow-up-right" size={14} color={colors.accentForeground} /></Pressable> : null}<View style={[styles.toolbar, { backgroundColor: colors.card, borderColor: colors.border }]}>{toolbarOpen ? <View style={styles.toolbarExpanded}><ToolbarButton icon="bold" label="Bold" onPress={() => insertText('**bold**')} /><ToolbarButton icon="italic" label="Italic" onPress={() => insertText('_italic_')} /><ToolbarButton icon="list" label="Bullets" onPress={() => insertText('\n• ')} /><ToolbarButton icon="hash" label="Heading" onPress={() => insertText('\n## ')} /><ToolbarButton icon="message-circle" label="Quote" onPress={() => insertText('\n“ “')} /><ToolbarButton icon="edit-3" label="Highlight" onPress={() => insertText(' ==highlight==')} /></View> : null}<View style={styles.toolbarRow}><Pressable onPress={() => setToolbarOpen((open) => !open)} style={styles.toolbarToggle}><Feather name={toolbarOpen ? 'chevron-down' : 'sliders'} size={18} color={colors.primary} /><Text style={[styles.toolbarLabel, { color: colors.primary }]}>{toolbarOpen ? 'Hide tools' : 'Formatting'}</Text></Pressable><View style={styles.quickActions}>{categories.filter((item) => item.kind !== 'scriptures').slice(0, 3).map((item) => <Pressable key={item.kind} onPress={() => { Keyboard.dismiss(); setCategory(item); }} style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 }]}><Feather name={item.icon} size={14} color={colors.primary} /><Text style={[styles.quickActionText, { color: colors.secondaryForeground }]}>{item.label}</Text></Pressable>)}</View></View></View><View style={styles.bottomActions}><Pressable onPress={() => { Keyboard.dismiss(); setCategory(categories[3]); }} style={[styles.addBlockButton, { borderColor: colors.border }]}><Feather name="plus" size={16} color={colors.primary} /><Text style={[styles.addBlockText, { color: colors.primary }]}>Add a moment</Text></Pressable><PrimaryButton label="Finish sermon" icon="check" onPress={() => { updateSermon(sermon.id, { completed: true }); router.replace(`/summary/${sermon.id}`); }} /></View><Modal transparent animationType="slide" visible={!!category} onRequestClose={() => setCategory(null)}><View style={styles.modalBackdrop}><View style={[styles.sheet, { backgroundColor: colors.card }]}><View style={[styles.sheetHandle, { backgroundColor: colors.border }]} /><View style={styles.sheetHeader}><View style={{ flex: 1, gap: 4 }}><Text style={[styles.sheetKicker, { color: colors.primary }]}>{category?.label.toUpperCase()}</Text><Text style={[styles.sheetTitle, { color: colors.foreground }]}>{category?.description}</Text></View><Pressable onPress={() => setCategory(null)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable></View><TextInput autoFocus value={categoryText} onChangeText={setCategoryText} placeholder="Capture it in a sentence…" placeholderTextColor={colors.mutedForeground} multiline style={[styles.categoryInput, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} /><PrimaryButton label={`Add ${category?.label ?? 'moment'}`} icon="plus" onPress={submitCategory} /></View></View></Modal><Modal transparent animationType="slide" visible={!!biblePreview} onRequestClose={() => setBiblePreview(null)}><View style={styles.modalBackdrop}><View style={[styles.sheet, { backgroundColor: colors.card }]}><View style={[styles.sheetHandle, { backgroundColor: colors.border }]} /><View style={styles.sheetHeader}><View style={{ flex: 1 }}><Text style={[styles.sheetKicker, { color: colors.primary }]}>SCRIPTURE REFERENCE</Text><Text style={[styles.sheetTitle, { color: colors.foreground }]}>{biblePreview}</Text></View><Pressable onPress={() => setBiblePreview(null)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable></View><Text style={[styles.sheetVerse, { color: colors.foreground }]}>For this prototype, this passage preview stays right here so you never lose your place in the sermon notes.</Text><Tag label="Sample Scripture text" icon="book-open" color={colors.accent} /><PrimaryButton label="Close and continue writing" onPress={() => setBiblePreview(null)} /></View></View></Modal></Screen>;
}

function ToolbarButton({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void }) {
  const colors = useColors();
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.toolButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.65 : 1 }]}><Feather name={icon} size={16} color={colors.secondaryForeground} /></Pressable>;
}

const styles = StyleSheet.create({
  screen: { gap: 12 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  noteHeading: { flex: 1, gap: 4 },
  noteTitle: { fontSize: 17, fontWeight: '700' },
  noteMeta: { fontSize: 11 },
  saveStatus: { alignSelf: 'center', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  saveStatusText: { fontSize: 11, fontWeight: '700' },
  editorCard: { flex: 1, minHeight: 280, borderWidth: 1, borderRadius: 19, padding: 17 },
  editor: { flex: 1, fontSize: 18, lineHeight: 29 },
  referencePill: { alignSelf: 'flex-start', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  referencePillText: { fontSize: 13, fontWeight: '700' },
  toolbar: { borderWidth: 1, borderRadius: 16, padding: 9, gap: 9 },
  toolbarExpanded: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toolButton: { width: 36, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  toolbarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolbarToggle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  toolbarLabel: { fontSize: 12, fontWeight: '700' },
  quickActions: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  quickAction: { paddingHorizontal: 8, paddingVertical: 7, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickActionText: { fontSize: 10, fontWeight: '700' },
  bottomActions: { flexDirection: 'row', gap: 9, paddingBottom: 3 },
  addBlockButton: { minHeight: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBlockText: { fontSize: 13, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(20, 25, 21, 0.42)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 34, gap: 17 },
  sheetHandle: { width: 42, height: 4, borderRadius: 2, alignSelf: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  sheetKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  sheetTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  categoryInput: { minHeight: 110, borderWidth: 1, borderRadius: 15, padding: 14, fontSize: 16, textAlignVertical: 'top' },
  sheetVerse: { fontSize: 18, lineHeight: 27 },
});