import { images } from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateStarterCollections } from "./services/anthropicCollections";

export default function CreateFlashcards() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [collectionName, setCollectionName] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");

  const handleCreateFlashcards = async () => {
    if (!collectionName.trim() || !language.trim() || !level) {
      Alert.alert("Please complete all fields");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("@userId");

      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      await generateStarterCollections(
        userId,
        `The user wants a collection about ${collectionName} at ${level} level`
      );

      Alert.alert(
        "Success!",
        "Your flashcard collection has been created. You can now add words to it.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/home"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creating flashcards:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#FFFFFF"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {isFocused ? <StatusBar style="dark" /> : null}

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create New Flashcards</Text>
        </View>

        <Image source={images.butterfly} style={styles.image} />

        {/* Collection Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>What is the collection about?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a name for your flashcard collection"
            value={collectionName}
            onChangeText={setCollectionName}
            autoCapitalize="words"
          />
        </View>

        {/* Language Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>What language are you learning?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter language (e.g., Spanish, French, Japanese)"
            value={language}
            onChangeText={setLanguage}
            autoCapitalize="words"
          />
        </View>

        {/* Level Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Pick your level</Text>
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.choice, level === lvl && styles.choiceActive]}
              onPress={() => setLevel(lvl)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.choiceText,
                  level === lvl && styles.choiceTextActive,
                ]}
              >
                {lvl.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Collection Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!collectionName.trim() || !language.trim() || !level) &&
              styles.createButtonDisabled,
          ]}
          onPress={handleCreateFlashcards}
          disabled={!collectionName.trim() || !language.trim() || !level}
        >
          <Text style={styles.createButtonText}>Create Flashcards</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  image: {
    width: "80%",
    height: 200,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 30,
  },
  inputSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    color: "#333",
  },
  choice: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 6,
    backgroundColor: "#fff",
  },
  choiceActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  choiceText: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  choiceTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#000",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
