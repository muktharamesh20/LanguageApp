import { images } from "@/constants/images";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const baseTextStyle: TextStyle = {
  color: "white",
  textAlign: "center",
  fontFamily: "System",
};

const Onboarding = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <LinearGradient
      colors={["#FFFFFF", "#FFFFFF"]}
      style={{ flex: 1, alignItems: "center" }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {isFocused ? <StatusBar style="light" /> : null}

      {/* Help button in upper right */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 15,
          right: 20,
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text className="text-primary text-lg font-semibold">Help</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View
        className="w-full items-center"
        style={{ marginTop: insets.top + 130 }}
      >
        <Image
          source={images.bunnyLanguage}
          style={{ width: "80%", height: 300, resizeMode: "contain" }}
        />

        <Text className="py-4 font-semibold text-[40px] text-secondary w-full text-center">
          Hi there!
        </Text>
        <Text className="py-2 font-small text-[15px] text-secondary w-80 text-center">
          Kikai is here to assist you with your language needs.
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: insets.bottom,
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <Link href={"/(onboarding)/login"} asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#000000",
              marginHorizontal: 32,
              paddingVertical: 16,
              marginTop: 10,
              borderRadius: 12,
              alignItems: "center",
              width: "80%",
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Log in
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href={"/(onboarding)/signup"} asChild>
          <TouchableOpacity
            style={{
              borderColor: "#fffff",
              borderWidth: 1,
              marginHorizontal: 32,
              marginVertical: 10,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              width: "80%",
            }}
          >
            <Text
              style={{
                color: "#000000",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </Link>

        <Text
          style={{
            ...baseTextStyle,
            fontSize: 18,
            marginTop: 10,
            marginBottom: 8,
            fontWeight: "600",
          }}
        >
          Already have an account?{" "}
        </Text>

        <Text
          style={{
            ...baseTextStyle,
            fontSize: 9,
            marginHorizontal: 16,
            marginTop: 25,
            width: 200,
          }}
        >
          By continuing, you agree to the Tempest{" "}
          <Link
            href="https://google.com"
            style={{
              textDecorationLine: "underline",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="https://google.com"
            style={{
              textDecorationLine: "underline",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Privacy Policy
          </Link>
        </Text>
      </View>
    </LinearGradient>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  flipCard: {
    backfaceVisibility: "hidden",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  typeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});
