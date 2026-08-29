import React, { useMemo, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [biblePreview, setBiblePreview] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const keyboardOffset = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    setActiveSermonId(id ?? null);
    return () => setActiveSermonId(null);
  }, [id, setActiveSermonId]);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardVisible(true);
      Animated.timing(keyboardOffset, {
        toValue: -event.endCoordinates.height,
        duration: event.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      setKeyboardVisible(false);
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: event.duration || 220,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardOffset]);

  const reference = useMemo(
    () => sermon?.notes.match(/\b(?:John|Romans|Matthew|Mark|Luke|Psalms?|Ephesians|1 Corinthians|2 Corinthians)\s+\d+(?::\d+(?:-\d+)?)?/i)?.[0],
    [sermon?.notes]
  );

  if (!sermon) {
    return (
      <Screen>
        <Text style={{ color: colors.foreground }}>Sermon not found.</Text>
      </Screen>
    );
  }

  const insertText = (value: string) => {
    const before = sermon.notes.slice(0, selection.start);
    const after = sermon.notes.slice(selection.end);
    updateSermon(sermon.id, { notes: `${before}${value}${after}` });
  };

  const openCategory = (item: typeof categories[number]) => {
    Keyboard.dismiss();
    setCategoryText('');
    setCategory(item);
  };

  const closeCategory = () => {
    Keyboard.dismiss();
    setCategory(null);
  };

  const submitCategory = () => {
    const trimmed = categoryText.trim();
    if (!trimmed || !category) return;

    if (category.kind === 'scriptures') {
      insertText(`\n${trimmed}\n`);
    } else {
      addTaggedItem(sermon.id, category.kind, trimmed);
    }

    Keyboard.dismiss();
    setCategoryText('');
    setCategory(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.noteLayout}>
        <View style={styles.noteHeader}>
          <IconButton icon="chevron-left" label="Back" onPress={() => router.back()} />

          <View style={styles.noteHeading}>
            <Text numberOfLines={1} style={[styles.noteTitle, { color: colors.foreground }]}>
              {sermon.title}
            </Text>
            <Text numberOfLines={1} style={[styles.noteMeta, { color: colors.mutedForeground }]}>
              {sermon.mainScripture || 'Add a passage'} · {sermon.pastor} · {formatDate(sermon.date)}
            </Text>
          </View>

          <Pressable
            testID="Finish sermon"
            hitSlop={8}
            onPress={() => {
              Keyboard.dismiss();
              updateSermon(sermon.id, { completed: true });
              router.replace(`/summary/${sermon.id}`);
            }}
            style={({ pressed }) => [styles.finishButton, { opacity: pressed ? 0.55 : 1 }]}
          >
            <Text style={[styles.finishText, { color: colors.primary }]}>Finish</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setDetailsOpen((open) => !open)}
          style={({ pressed }) => [styles.detailToggle, { opacity: pressed ? 0.65 : 1 }]}
        >
          <View style={[styles.saveDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.detailToggleText, { color: colors.mutedForeground }]}>Saved on this device</Text>
          <Feather name={detailsOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.mutedForeground} />
        </Pressable>

        {detailsOpen ? (
          <View style={[styles.detailRow, { borderColor: colors.border }]}>
            <Tag label={sermon.mainScripture || 'No passage'} icon="book-open" color={colors.accent} />
            <Text numberOfLines={1} style={[styles.detailText, { color: colors.mutedForeground }]}>
              {sermon.church} · {sermon.pastor} · {formatDate(sermon.date)}
            </Text>
          </View>
        ) : null}

        <View style={[styles.editorArea, { backgroundColor: colors.background }]}>
          <TextInput
            testID="Sermon note editor"
            multiline
            autoFocus
            value={sermon.notes}
            onChangeText={(notes) => updateSermon(sermon.id, { notes })}
            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
            placeholder="Start writing what stands out…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.editor, { color: colors.foreground }]}
            textAlignVertical="top"
            scrollEnabled
          />
        </View>

        {reference ? (
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setBiblePreview(reference);
            }}
            style={[styles.referencePill, { backgroundColor: colors.accent }]}
          >
            <Feather name="book-open" size={14} color={colors.accentForeground} />
            <Text style={[styles.referencePillText, { color: colors.accentForeground }]}>View {reference}</Text>
            <Feather name="arrow-up-right" size={14} color={colors.accentForeground} />
          </Pressable>
        ) : null}

        <Animated.View
          style={[
            styles.keyboardDock,
            {
              transform: [{ translateY: keyboardOffset }],
            },
          ]}
        >
          <View style={[styles.toolbar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.toolbarRow}>
              <Pressable
                testID="Dismiss keyboard"
                accessibilityLabel="Dismiss keyboard"
                onPress={Keyboard.dismiss}
                style={({ pressed }) => [
                  styles.keyboardButton,
                  { backgroundColor: colors.secondary, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="chevron-down" size={17} color={colors.primary} />
                <Text style={[styles.keyboardText, { color: colors.secondaryForeground }]}>Done</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Formatting tools"
                onPress={() => setToolbarOpen((open) => !open)}
                style={({ pressed }) => [styles.formatButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Feather name={toolbarOpen ? 'chevron-down' : 'sliders'} size={18} color={colors.primary} />
                <Text style={[styles.toolbarLabel, { color: colors.primary }]}>
                  {toolbarOpen ? 'Hide tools' : 'Format'}
                </Text>
              </Pressable>

              <View style={styles.quickActions}>
                {categories.filter((item) => item.kind !== 'scriptures').slice(0, 3).map((item) => (
                  <Pressable
                    key={item.kind}
                    onPress={() => openCategory(item)}
                    style={({ pressed }) => [
                      styles.quickAction,
                      { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Feather name={item.icon} size={14} color={colors.primary} />
                    <Text style={[styles.quickActionText, { color: colors.secondaryForeground }]}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {toolbarOpen ? (
              <View style={styles.toolbarExpanded}>
                <ToolbarButton icon="bold" label="Bold" onPress={() => insertText('**bold**')} />
                <ToolbarButton icon="italic" label="Italic" onPress={() => insertText('_italic_')} />
                <ToolbarButton icon="list" label="Bullets" onPress={() => insertText('\n• ')} />
                <ToolbarButton icon="hash" label="Heading" onPress={() => insertText('\n## ')} />
                <ToolbarButton icon="message-circle" label="Quote" onPress={() => insertText('\n“ “')} />
                <ToolbarButton icon="edit-3" label="Highlight" onPress={() => insertText(' ==highlight==')} />
              </View>
            ) : null}
          </View>
        </Animated.View>
      </View>

      <Modal transparent animationType="slide" visible={!!category} onRequestClose={closeCategory} statusBarTranslucent>
        <KeyboardAvoidingView
          style={styles.modalKeyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <Pressable style={styles.modalBackdrop} onPress={Keyboard.dismiss}>
            <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={(event) => event.stopPropagation()}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
              <View style={styles.sheetHeader}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.sheetKicker, { color: colors.primary }]}>{category?.label.toUpperCase()}</Text>
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{category?.description}</Text>
                </View>
                <Pressable onPress={closeCategory} hitSlop={12} style={styles.closeButton}>
                  <Feather name="x" size={22} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <TextInput
                autoFocus
                value={categoryText}
                onChangeText={setCategoryText}
                placeholder="Capture it in a sentence…"
                placeholderTextColor={colors.mutedForeground}
                multiline
                blurOnSubmit={false}
                style={[
                  styles.categoryInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.input,
                    color: colors.foreground,
                  },
                ]}
              />

              {keyboardVisible ? (
                <View style={styles.keyboardControlRow}>
                  <Pressable
                    accessibilityLabel="Hide keyboard"
                    onPress={Keyboard.dismiss}
                    style={[
                      styles.keyboardDoneButton,
                      { backgroundColor: colors.secondary, borderColor: colors.border },
                    ]}
                  >
                    <Feather name="chevron-down" size={17} color={colors.primary} />
                    <Text style={[styles.keyboardDoneText, { color: colors.secondaryForeground }]}>Done</Text>
                  </Pressable>
                </View>
              ) : null}

              <PrimaryButton label={`Add ${category?.label ?? 'moment'}`} icon="plus" onPress={submitCategory} />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent animationType="slide" visible={!!biblePreview} onRequestClose={() => setBiblePreview(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetKicker, { color: colors.primary }]}>SCRIPTURE REFERENCE</Text>
                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{biblePreview}</Text>
              </View>
              <Pressable onPress={() => setBiblePreview(null)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={[styles.sheetVerse, { color: colors.foreground }]}>
              For this prototype, this passage preview stays right here so you never lose your place in the sermon notes.
            </Text>
            <Tag label="Sample Scripture text" icon="book-open" color={colors.accent} />
            <PrimaryButton label="Close and continue writing" onPress={() => setBiblePreview(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function ToolbarButton({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolButton,
        { backgroundColor: colors.secondary, opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <Feather name={icon} size={16} color={colors.secondaryForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 0 },
  noteLayout: { flex: 1, gap: 8 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteHeading: { flex: 1, gap: 3, minWidth: 0 },
  noteTitle: { fontSize: 17, fontWeight: '700' },
  noteMeta: { fontSize: 11 },
  finishButton: { paddingVertical: 9, paddingLeft: 5 },
  finishText: { fontSize: 14, fontWeight: '700' },
  detailToggle: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 2 },
  saveDot: { width: 6, height: 6, borderRadius: 3 },
  detailToggleText: { fontSize: 11, fontWeight: '600' },
  detailRow: { minHeight: 38, borderWidth: 1, borderRadius: 11, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { flex: 1, fontSize: 11 },
  editorArea: { flex: 1, minHeight: 180 },
  editor: { flex: 1, paddingHorizontal: 1, paddingVertical: 8, fontSize: 18, lineHeight: 29 },
  referencePill: { alignSelf: 'flex-start', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  referencePillText: { fontSize: 13, fontWeight: '700' },
  keyboardDock: { marginBottom: 0 },
  toolbar: { borderWidth: 1, borderRadius: 14, padding: 8, gap: 9 },
  toolbarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  keyboardButton: { height: 35, borderRadius: 9, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 4 },
  keyboardText: { fontSize: 12, fontWeight: '700' },
  formatButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 2 },
  toolbarLabel: { fontSize: 12, fontWeight: '700' },
  quickActions: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 5 },
  quickAction: { paddingHorizontal: 7, paddingVertical: 7, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickActionText: { fontSize: 10, fontWeight: '700' },
  toolbarExpanded: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toolButton: { width: 36, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  modalKeyboardView: { flex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(20, 25, 21, 0.42)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 20, gap: 17, maxHeight: '85%' },
  sheetHandle: { width: 42, height: 4, borderRadius: 2, alignSelf: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  closeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sheetKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  sheetTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  categoryInput: { minHeight: 100, maxHeight: 160, borderWidth: 1, borderRadius: 15, padding: 14, fontSize: 16, textAlignVertical: 'top' },
  keyboardControlRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: -5 },
  keyboardDoneButton: { minHeight: 40, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  keyboardDoneText: { fontSize: 13, fontWeight: '700' },
  sheetVerse: { fontSize: 18, lineHeight: 27 },
});