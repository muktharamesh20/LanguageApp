import { images } from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
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
  const [purpose, setPurpose] = useState("");

  const handleFinish = async () => {
    try {
      if (!name || !language || !level || !purpose) {
        alert("Please complete all fields.");
        return;
      }
      await AsyncStorage.setItem("@user_name", name);
      await AsyncStorage.setItem("@user_language", language);
      await AsyncStorage.setItem("@user_level", level);
      await AsyncStorage.setItem("@user_purpose", purpose);
      router.push("/chat"); // navigate to main app
    } catch (e) {
      console.error("Failed to save user data:", e);
    }
  };

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
          <Text style={styles.title}>
            What language would you like to learn?
          </Text>
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
              style={[level === lvl ? styles.choiceActive : styles.choice]}
              onPress={() => setLevel(lvl)}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.choiceText,
                  level === lvl ? styles.choiceTextActive : styles.choiceText,
                ]}
              >
                {lvl.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      key: "4",
      render: () => (
        <View style={styles.slide}>
          <Text style={styles.title}>Why are you learning?</Text>
          {["Family", "Career", "School", "Hobby", "Other"].map(
            (purposeOption) => (
              <TouchableOpacity
                key={purposeOption}
                style={[
                  purpose === purposeOption
                    ? styles.choiceActive
                    : styles.choice,
                ]}
                onPress={() => {
                  setPurpose(purposeOption);
                }}
                activeOpacity={1}
              >
                <Text
                  style={[
                    styles.choiceText,
                    purpose === purposeOption
                      ? styles.choiceTextActive
                      : styles.choiceText,
                  ]}
                >
                  {purposeOption.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      ),
    },
    {
      key: "5",
      render: () => (
      <View>
      <View
        className="w-full items-center"
        style={{ marginTop: insets.top + 130 }}
      ></View>
      <Image
      source={images.butterfly}
      style={{ width: "80%", height: 300, resizeMode: "contain" }}
      />
      <View style={styles.slide}>
      <Text className="py-4 font-semibold text-[40px] text-secondary w-full text-center">We're all set!</Text>
      <Text style={styles.subtitle}>Start learning now.</Text>
      <TouchableOpacity
        style={[styles.button, { marginTop: 30 }]}
        onPress={handleFinish}
        activeOpacity={1}
      >
      <Text style={styles.buttonText}>Let's go!</Text>
      </TouchableOpacity>
       </View>
      </View> 
      ),
    },
  ];

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
      {/* {currentIndex === slides.length - 1 && (
      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? "Finish" : "Next"}
        </Text>
      </TouchableOpacity>)} */}
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
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  // choiceActive: {
  //   backgroundColor: "#000",
  //   borderColor: "#000000",
  // },
  choiceActive: {
    borderWidth: 1,
    backgroundColor: "#000",
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
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
    backgroundColor: "#000000",
    width: 20,
  },
  button: {
    backgroundColor: "#000000",
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
