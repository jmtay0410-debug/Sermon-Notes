import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Header, PrimaryButton, Screen, TextField } from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';
import { todayString, useApp } from '@/context/AppContext';

export default function NewSermonScreen() {
  const colors = useColors();
  const { createSermon } = useApp();
  const [title, setTitle] = useState('');
  const [church, setChurch] = useState('');
  const [pastor, setPastor] = useState('');
  const [series, setSeries] = useState('');
  const [date, setDate] = useState(todayString());
  const [scripture, setScripture] = useState('');
  const start = () => {
    const sermon = createSermon({ title: title.trim() || 'Sunday sermon', church: church.trim() || 'My church', pastor: pastor.trim() || 'Speaker', series: series.trim(), date, mainScripture: scripture.trim() });
    router.replace(`/note/${sermon.id}`);
  };
  return <Screen scroll={false}><View style={styles.top}><Pressable onPress={() => router.back()} hitSlop={10}><Feather name="x" size={23} color={colors.foreground} /></Pressable><Text style={[styles.topTitle, { color: colors.foreground }]}>New sermon</Text><View style={{ width: 23 }} /></View><KeyboardAwareScrollViewCompat bottomOffset={24} contentContainerStyle={styles.form}><View style={styles.intro}><View style={[styles.introIcon, { backgroundColor: colors.secondary }]}><Feather name="edit-3" size={20} color={colors.primary} /></View><Text style={[styles.formTitle, { color: colors.foreground }]}>Set up your page</Text><Text style={[styles.formBody, { color: colors.mutedForeground }]}>Add what you know now. Everything is optional — you can fill in the details later.</Text></View><TextField label="SERMON TITLE" value={title} onChangeText={setTitle} placeholder="What is the message called?" /><TextField label="CHURCH" value={church} onChangeText={setChurch} placeholder="Where are you worshipping?" /><TextField label="PASTOR / SPEAKER" value={pastor} onChangeText={setPastor} placeholder="Who is speaking?" /><TextField label="SERIES" value={series} onChangeText={setSeries} placeholder="Optional" /><TextField label="DATE" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /><TextField label="MAIN BIBLE PASSAGE" value={scripture} onChangeText={setScripture} placeholder="e.g. John 3:16" /><View style={styles.bottom}><PrimaryButton label="Start taking notes" icon="arrow-right" onPress={start} /><Text style={[styles.autoSaveNote, { color: colors.mutedForeground }]}><Feather name="check-circle" size={13} color={colors.primary} /> Notes save automatically as you type</Text></View></KeyboardAwareScrollViewCompat></Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 5 },
  topTitle: { fontSize: 17, fontWeight: '700' },
  form: { gap: 17, paddingTop: 8, paddingBottom: 30 },
  intro: { gap: 8, paddingBottom: 4 },
  introIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  formTitle: { fontSize: 25, lineHeight: 30, fontWeight: '700', letterSpacing: -0.5 },
  formBody: { fontSize: 14, lineHeight: 20 },
  bottom: { gap: 12, paddingTop: 5 },
  autoSaveNote: { textAlign: 'center', fontSize: 12 },
});