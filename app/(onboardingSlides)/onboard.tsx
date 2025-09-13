import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // form state
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");

  const slides = [
    {
      key: "1",
      render: () => (
        <View style={styles.slide}>
          <Text style={styles.title}>Who are you?</Text>
          <Text style={styles.subtitle}>Let us know your name.</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />
        </View>
      ),
    },
    {
      key: "2",
      render: () => (
        <View style={styles.slide}>
          <Text style={styles.title}>What language would you like to learn?</Text>
          <TextInput
            style={styles.input}
            placeholder="Language here"
            value={language}
            onChangeText={setLanguage}
          />
        </View>
      ),
    },
    {
      key: "3",
      render: () => (
        <View style={styles.slide}>
          <Text style={styles.title}>Pick your level</Text>
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[
                styles.choice,
                level === lvl && styles.choiceActive,
              ]}
              onPress={() => setLevel(lvl)}
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
      ),
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const newIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      setCurrentIndex(newIndex); // 👈 put this back
    } else {
      router.replace("/(tabs)/home");
    }
  
  };
  

  const onMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 40 }]}>
      <FlatList
  data={slides}
  ref={flatListRef}
  horizontal
  pagingEnabled
  //scrollEnabled={false}
  showsHorizontalScrollIndicator={false}
  keyExtractor={(item) => item.key}
  renderItem={({ item }) => (
    <View style={{ width }}>{item.render()}</View>
  )}
  getItemLayout={(_, index) => ({
    length: width,
    offset: width * index,
    index,
  })}
  onMomentumScrollEnd={onMomentumScrollEnd}
/>


      {/* dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, currentIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      {/* next / finish button */}
      <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
  <Text style={styles.buttonText}>
    {currentIndex === slides.length - 1 ? "Finish" : "Next"}
  </Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  choice: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  choiceActive: {
    backgroundColor: "#14354E",
    borderColor: "#14354E",
  },
  choiceText: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
  choiceTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: "#14354E",
    width: 20,
  },
  button: {
    backgroundColor: "#14354E",
    marginHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
