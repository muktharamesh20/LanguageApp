import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sendToAnthropic } from "./services/anthropic";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const storedName = await AsyncStorage.getItem('@user_name');
      const storedLanguage = await AsyncStorage.getItem('@user_language');
      const storedLevel = await AsyncStorage.getItem('@user_level');
      if (storedName && storedLanguage && storedLevel) {
        setName(storedName);
        setLanguage(storedLanguage);
        setLevel(storedLevel);
      }else {
        Alert.alert("User data missing", "Please complete the onboarding process.");
      }
      console.log(storedName, storedLanguage, storedLevel);
    };
    loadUserData();
  }, []);


  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendToAnthropic(userMessage.text);

      if (response.error) {
        Alert.alert("Error", response.error);
        return;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.content,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={{
        marginBottom: 12,
        alignSelf: message.isUser ? "flex-end" : "flex-start",
        maxWidth: "75%",
      }}
    >
      <View
        style={{
          backgroundColor: message.isUser ? "#0D3B66" : "#E5E5E5",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 20,
          borderBottomRightRadius: message.isUser ? 6 : 20,
          borderBottomLeftRadius: message.isUser ? 20 : 6,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          style={{
            color: message.isUser ? "#FFF" : "#111",
            fontSize: 16,
            lineHeight: 22,
          }}
        >
          {message.text}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 12,
          color: "#888",
          marginTop: 4,
          alignSelf: message.isUser ? "flex-end" : "flex-start",
        }}
      >
        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? -10 : 0}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          backgroundColor: "#0D3B66",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}>
          Language App Chat
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {messages.length === 0 && !isLoading && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: "#888", fontSize: 16, textAlign: "center" }}>
              Start a conversation by typing a message below
            </Text>
          </View>
        )}

        {messages.map(renderMessage)}

        {isLoading && (
          <View style={{ alignSelf: "flex-start", marginBottom: 12 }}>
            <View
              style={{
                backgroundColor: "#E5E5E5",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 20,
                borderBottomLeftRadius: 6,
              }}
            >
              <ActivityIndicator size="small" color="#888" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View
        style={{
          paddingBottom: insets.bottom + 12,
          paddingHorizontal: 16,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          backgroundColor: "#FFF",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: "#F5F5F5",
              borderRadius: 24,
              paddingVertical: 12,
              paddingHorizontal: 16,
              fontSize: 16,
              maxHeight: 120,
              minHeight: 48,
            }}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: inputText.trim() && !isLoading ? "#0D3B66" : "#CCC",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 20 }}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
