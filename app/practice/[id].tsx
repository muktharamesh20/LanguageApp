// app/practice/[id].tsx
import { supabase } from "@/constants/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

  
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Word = {
  id: string;
  word_or_phrase: string;
  translated_word_or_phrase: string;
  correct: number;
  wrong: number;
  last_ten: boolean[];
};

export default function PracticePage() {
  const { id: collectionId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [mode, setMode] = useState<"en-to-foreign" | "foreign-to-en" | "both">("en-to-foreign");

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const translateX = useSharedValue(0);
  const current = words[currentIndex];

  useEffect(() => {
    const fetchWords = async () => {
      const { data, error } = await supabase
        .from("collections_to_words")
        .select("*")
        .eq("collection_id", collectionId);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      if (data) setWords(data as Word[]);
    };
    fetchWords();
  }, [collectionId]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      translateX.value = gestureState.dx;
    },
    onPanResponderRelease: async (_, gestureState) => {
      if (!current) return;

      const threshold = 120;
      const isRight = gestureState.dx > threshold;
      const isLeft = gestureState.dx < -threshold;

      if (isRight || isLeft) {
        const isCorrect = isRight;

        const newLastTen = [...current.last_ten, isCorrect].slice(-10);
        await supabase
          .from("collections_to_words")
          .update({
            correct: isCorrect ? current.correct + 1 : current.correct,
            wrong: !isCorrect ? current.wrong + 1 : current.wrong,
            last_ten: newLastTen,
          })
          .eq("id", current.id);

        setCorrectCount((c) => c + (isCorrect ? 1 : 0));
        setWrongCount((w) => w + (!isCorrect ? 1 : 0));

        translateX.value = withSpring(0);
        setShowAnswer(false);
        setCurrentIndex((prev) => (prev + 1) % words.length);
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

 

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!current) return <Text style={{ padding: 20 }}>Loading...</Text>;

  const prompt =
    mode === "en-to-foreign"
      ? current.word_or_phrase
      : mode === "foreign-to-en"
      ? current.translated_word_or_phrase
      : Math.random() > 0.5
      ? current.word_or_phrase
      : current.translated_word_or_phrase;

  const answer =
    prompt === current.word_or_phrase
      ? current.translated_word_or_phrase
      : current.word_or_phrase;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 15, paddingBottom: insets.bottom + 15 },
      ]}
    >
      {/* Header with Back + Settings */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.headerButton}>
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressSection, { flex: correctCount, backgroundColor: "#4CAF50" }]}
        />
        <View
          style={[styles.progressSection, { flex: wrongCount, backgroundColor: "#E63946" }]}
        />
      </View>

      {/* Flashcard */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.card, cardStyle]}
      >
        <Pressable onPress={() => setShowAnswer((prev) => !prev)}>
          <Text style={styles.word}>{prompt}</Text>
          {showAnswer && <Text style={styles.translation}>{answer}</Text>}
          {!showAnswer && <Text style={styles.translation}>(Tap to show answer)</Text>}
        </Pressable>
      </Animated.View>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.modalTitle}>Practice Settings</Text>
            {["en-to-foreign", "foreign-to-en", "both"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionButton,
                  mode === opt && styles.optionSelected,
                ]}
                onPress={() => {
                  setMode(opt as any);
                  setSettingsVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    mode === opt && styles.optionTextSelected,
                  ]}
                >
                  {opt === "en-to-foreign"
                    ? "English ➝ Other language"
                    : opt === "foreign-to-en"
                    ? "Other language ➝ English"
                    : "Both (mixed)"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerButton: { padding: 5 },
  settingsText: { fontSize: 16, fontWeight: "500", color: "#000" },
  progressBarContainer: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#eee",
    marginBottom: 20,
  },
  progressSection: { height: "100%" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  word: { fontSize: 22, fontWeight: "600", color: "#111", textAlign: "center" },
  translation: {
    fontSize: 18,
    color: "#555",
    marginTop: 12,
    textAlign: "center",
    fontStyle: "italic",
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
  optionButton: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
  },
  optionSelected: { backgroundColor: "#000" },
  optionText: { fontSize: 16, color: "#333", textAlign: "center" },
  optionTextSelected: { color: "#fff", fontWeight: "600" },
});
