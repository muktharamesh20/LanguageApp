import { images } from "@/constants/images";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import {
    Image,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "@/constants/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, AppState } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// Handle session refresh when app is foregrounded
useEffect(() => {
  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
  return () => subscription.remove();
}, []);

const baseTextStyle: TextStyle = {
  color: "white",
  textAlign: "center",
  fontFamily: "System", // or your custom font if used elsewhere
};

const signup = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    if (!name.trim()) {
      Alert.alert("Please enter your name");
      setLoading(false);
      return;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (session) {
      // Save user name to usersettings table
      const { error: userError } = await supabase.from("usersettings").upsert({
        id: session.user.id,
        name: name.trim(),
      });

      if (userError) {
        console.error("Error saving user name:", userError);
      }

      Alert.alert("Please check your inbox for email verification!");
    } else {
      Alert.alert("Please check your inbox for email verification!");
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
    // Generate a redirect URL with your Expo app's scheme (make sure scheme is set in app config)
    // const redirectUrl = AuthSession.makeRedirectUri({
    //   scheme: 'tempest', // <-- your app scheme here, e.g. "tempest"
    //   path: 'auth/callback', // <-- optional path to handle the redirect
    // })
    const redirectUrl = "hackmit2025://auth/callback";

    // Pass redirectUrl to Supabase so OAuth redirects here after login
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    console.log("Redirect URI:", redirectUrl);

    if (data?.url) {
      // Open the OAuth URL in a browser session and wait for the redirect back to your app
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === "success" && "url" in result && result.url) {
        // Parse the fragment/hash part of the URL
        const url = result.url;
        const hash = url.split("#")[1];
        const params = new URLSearchParams(hash);

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            Alert.alert("Session error", error.message);
            return;
          }

          // Now you have a valid session!
          console.log("Session set!", data.session);
          AsyncStorage.setItem("@session", JSON.stringify(data.session));
          AsyncStorage.setItem("@access_token", access_token);
          AsyncStorage.setItem("@refresh_token", refresh_token);
          AsyncStorage.setItem("@userId", data!.session!.user.id ?? "");

          router.navigate("/(onboardingSlides)/onboard");
        } else {
          Alert.alert("Could not extract tokens from redirect URL");
        }
      } else {
        Alert.alert("No URL returned from Supabase");
      }
    }
  }

  return (
    <LinearGradient
      colors={["#ffffff", "#ffffff"]}
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
        <TouchableOpacity>
          <Text className="text-primary text-lg font-semibold">Help</Text>
        </TouchableOpacity>
      </View>

      {/** Entire start block */}
      <View
        className="w-full items-center"
        style={{ marginTop: insets.top + 115 }}
      >
        <Image
          source={images.bunnyLanguage}
          style={{ width: "60%", height: 100, resizeMode: "contain" }}
        />

        <Text className="py-4 font-bold text-[20px] text-black w-full text-start ml-[20%]">
          Sign Up
        </Text>

        {/* Name Input */}
        <TextInput
          placeholder="name"
          placeholderTextColor="#F9F8F5"
          style={{
            width: "80%",
            backgroundColor: "black",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            fontSize: 20,
            marginBottom: 16,
            color: "#F9F8F5",
            fontWeight: "600",
            borderWidth: 2,
            borderColor: "#F9F8F5",
          }}
          autoCapitalize="words"
          onChangeText={setName}
        />

        {/* Email Input */}
        <TextInput
          placeholder="email"
          placeholderTextColor="#F9F8F5"
          style={{
            width: "80%",
            backgroundColor: "black",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            fontSize: 20,
            marginBottom: 16,
            color: "#F9F8F5",
            fontWeight: "600",
            borderWidth: 2,
            borderColor: "#F9F8F5",
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />

        {/* Password Input */}
        <TextInput
          placeholder="password"
          placeholderTextColor="#F9F8F5"
          style={{
            width: "80%",
            backgroundColor: "black",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            fontSize: 20,
            marginBottom: 24,
            color: "#F9F8F5",
            fontWeight: "600",
            borderWidth: 2,
            borderColor: "#F9F8F5",
          }}
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setPassword}
        />

        {/* Sign Up Button */}
        <TouchableOpacity
          style={{
            width: "80%",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={signUpWithEmail}
        >
          <Text
            style={{
              paddingVertical: 12,
              //backgroundColor: '#F9F8F5',
              borderColor: "black",
              borderWidth: 1,
              borderRadius: 16,
              fontWeight: "bold",
              fontSize: 20,
              color: "#14354E",
              width: "100%",
              textAlign: "center",
            }}
          >
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Forgot Password Link
        <TouchableOpacity
          style={{ marginTop: 12, marginBottom: 24, alignSelf: 'flex-end', marginRight: '10%' }}
          onPress={() => router.push('/forgotPassword')}
        >
          <Text style={{
            color: numbers.primaryColor,
            textDecorationLine: 'underline',
            fontWeight: '600',
            fontSize: 15,
          }}>
            Forgot password?
          </Text>
        </TouchableOpacity> */}

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "80%",
            alignSelf: "center",
            marginVertical: 12,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: "#E4E4E4" }} />
          <Text
            style={{ marginHorizontal: 8, color: "ffffff", fontWeight: "600" }}
          >
            or
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#E4E4E4" }} />
        </View>

        {/* Sign in with Google Button */}
        <TouchableOpacity
          style={{
            width: "80%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            borderRadius: 16,
            paddingVertical: 12,
            flexDirection: "row",
            borderWidth: 1,
            borderColor: "#000000",
          }}
          onPress={signInWithGoogle}
        >
          <Image
            source={images.googleLogo}
            style={{ width: 24, height: 24, marginRight: 5 }}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#000000",
            }}
          >
            Sign in with Google
          </Text>
        </TouchableOpacity>

        {/* Top text */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              ...baseTextStyle,
              fontSize: 18,
              fontWeight: "600",
              color: "white",
            }}
          >
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text
              style={{
                ...baseTextStyle,
                fontSize: 18,
                fontWeight: "bold",
                color: "white",
                textDecorationLine: "underline",
              }}
            >
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default signup;
