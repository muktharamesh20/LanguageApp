// app/flashcards/[id].tsx
import { supabase } from "@/constants/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Word = {
  id: string;
  word_or_phrase: string;
  translated_word_or_phrase: string;
  correct: number;
  wrong: number;
  last_ten: boolean[];
};

export default function FlashcardsPage() {
  const { id: collectionId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [words, setWords] = useState<Word[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [wordInput, setWordInput] = useState("");
  const [translationInput, setTranslationInput] = useState("");

  useEffect(() => {
    if (collectionId) fetchWords();
  }, [collectionId]);

  const fetchWords = async () => {
    try {
      const { data, error } = await supabase
        .from("collections_to_words")
        .select("*")
        .eq("collection_id", collectionId);

      if (error) throw error;
      setWords(data as Word[]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to fetch words.");
    }
  };

  const openModal = (word?: Word) => {
    if (word) {
      setEditingWord(word);
      setWordInput(word.word_or_phrase);
      setTranslationInput(word.translated_word_or_phrase);
    } else {
      setEditingWord(null);
      setWordInput("");
      setTranslationInput("");
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!wordInput.trim() || !translationInput.trim()) return;
    try {
      if (editingWord) {
        await supabase
          .from("collections_to_words")
          .update({
            word_or_phrase: wordInput,
            translated_word_or_phrase: translationInput,
          })
          .eq("id", editingWord.id);
      } else {
        await supabase.from("collections_to_words").insert([
          {
            collection_id: collectionId,
            word_or_phrase: wordInput,
            translated_word_or_phrase: translationInput,
            correct: 0,
            wrong: 0,
            last_ten: [],
          },
        ]);
      }
      fetchWords();
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save word.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("collections_to_words").delete().eq("id", id);
      fetchWords();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete word.");
    }
  };

  // --- Group words into sections ---
  const groupedWords = useMemo(() => {
    const neverSeen = words.filter((w) => w.correct === 0 && w.wrong === 0);
    const needWork = words.filter((w) => w.wrong > w.correct);
    const mastered = words.filter((w) => w.correct >= 5 && w.wrong === 0);
    const other = words.filter(
      (w) =>
        !neverSeen.includes(w) && !needWork.includes(w) && !mastered.includes(w)
    );
    return [
      { title: "Never Seen", data: neverSeen },
      { title: "Need to Work On", data: needWork },
      { title: "Mastered", data: mastered },
      { title: "In Progress", data: other },
    ].filter((section) => section.data.length > 0);
  }, [words]);

  // --- Progress ---
  const progress = useMemo(() => {
    if (words.length === 0) return 0;
    const mastered = words.filter((w) => w.correct >= 5 && w.wrong === 0).length;
    return mastered / words.length;
  }, [words]);

  const renderWord = ({ item }: { item: Word }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.word}>{item.word_or_phrase}</Text>
        <Text style={styles.translation}>{item.translated_word_or_phrase}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => openModal(item)} style={styles.iconButton}>
          <Ionicons name="create-outline" size={18} color="#333" />
        </Pressable>
        <Pressable onPress={() => handleDelete(item.id)} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={18} color="#e63946" />
        </Pressable>
      </View>
    </View>
  );

  const router = useRouter();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 15, paddingBottom: insets.bottom + 20 },
      ]}
    >
<Ionicons name="arrow-back" size={24} color="#000" onPress={() => {router.back()}} style={{ marginBottom: 10 }} />
<Text style={styles.title}>Your Flashcards</Text>

      {/* Progress bar */}
      <View style={styles.progressWrapper}>
        <View style={[styles.progressFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={styles.progressText}>
        {Math.round(progress * 100)}% mastered
      </Text>

      <FlatList
        data={groupedWords}
        keyExtractor={(section) => section.title}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((word) => (
              <View key={word.id}>{renderWord({ item: word })}</View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No words yet. Add your first flashcard!
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Add Button */}
<TouchableOpacity
  style={[styles.fab, { bottom: insets.bottom + 30 }]}
  onPress={() => openModal()}
  activeOpacity={0.8}
>
  <Ionicons name="add" size={28} color="#fff" />
</TouchableOpacity>

{/* Floating Practice Button */}
{/* Floating Practice Button */}
<TouchableOpacity
  style={[styles.fabLeft, { bottom: insets.bottom + 30 }]}
  onPress={() => router.push(`/practice/${collectionId}`)}
  activeOpacity={0.8}
>
  <Text style={styles.fabText}>Practice</Text>
</TouchableOpacity>



     {/* Add/Edit Modal */}
<Modal
  visible={modalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, justifyContent: "flex-end" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}
        >
          <Text style={styles.modalTitle}>
            {editingWord ? "Edit Word" : "Add Word"}
          </Text>
          <TextInput
            value={wordInput}
            onChangeText={setWordInput}
            placeholder="Word or phrase"
            style={styles.input}
            placeholderTextColor={"#999"}
          />
          <TextInput
            value={translationInput}
            onChangeText={setTranslationInput}
            placeholder="Translation"
            style={styles.input}
            placeholderTextColor={"#999"}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  progressWrapper: {
    height: 6,
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#111" },
  progressFill: {
    backgroundColor: "#000",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    textAlign: "right",
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  word: { fontSize: 16, fontWeight: "600", color: "#333" },
  translation: { fontSize: 14, color: "#666", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  iconButton: { padding: 8 },
  fab: {
    position: "absolute",
    right: 20,
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  fabLeft: {
    position: "absolute",
    left: 20,
    backgroundColor: "#000",
    padding: 25,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  button: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  cancelButton: { backgroundColor: "#f1f1f1" },
  saveButton: { backgroundColor: "#000" },
  cancelText: { color: "#333", fontWeight: "500" },
  saveText: { color: "#fff", fontWeight: "600" },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
});
