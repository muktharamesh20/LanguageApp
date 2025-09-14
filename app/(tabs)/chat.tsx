import MarkdownText from "@/components/MarkdownText";
import { supabase } from "@/constants/supabaseClient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ConversationMessage,
  sendToAnthropic,
  UserContext,
} from "../services/anthropic";

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      //const storedName = await AsyncStorage.getItem("@user_name");
      const userId = (await supabase.auth.getUser()!).data!.user!.id;
      const storedData = await supabase.from("usersettings").select("*").eq("id", userId).single();
      const storedName = storedData.data?.name;
      const storedLanguage = storedData.data?.language;
      //const storedLevel = await AsyncStorage.getItem("@user_level");
      //const storedPurpose = await AsyncStorage.getItem("@user_purpose");
      const storedLevel = storedData.data?.level;
      const storedPurpose = storedData.data?.reason;
      if (storedName && storedLanguage && storedLevel && storedPurpose) {
        setName(storedName);
        setLanguage(storedLanguage);
        setLevel(storedLevel);
        setPurpose(storedPurpose);
      } else {
        Alert.alert(
          "User data missing",
          "Please complete the onboarding process."
        );
      }
      console.log(storedName, storedLanguage, storedLevel, storedPurpose);
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
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
      // Create user context for the system prompt
      const userContext: UserContext = {
        name,
        language,
        level,
        purpose,
      };

      // Convert existing messages to conversation history format
      // Only keep the last user message + last model response + current user message
      const conversationHistory: ConversationMessage[] = [];

      // Find the last user message and last assistant message from existing messages
      let lastUserMessage: Message | null = null;
      let lastAssistantMessage: Message | null = null;

      // Iterate through messages in reverse to find the most recent ones
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.isUser && !lastUserMessage) {
          lastUserMessage = msg;
        } else if (!msg.isUser && !lastAssistantMessage) {
          lastAssistantMessage = msg;
        }

        // Stop if we found both
        if (lastUserMessage && lastAssistantMessage) break;
      }

      // Add the last assistant message if it exists
      if (lastAssistantMessage) {
        conversationHistory.push({
          role: "assistant",
          content: lastAssistantMessage.text,
        });
      }

      // Add the last user message if it exists
      if (lastUserMessage) {
        conversationHistory.push({
          role: "user",
          content: lastUserMessage.text,
        });
      }

      const response = await sendToAnthropic(
        userMessage.text,
        userContext,
        conversationHistory
      );

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
        {message.isUser ? (
          <Text
            style={{
              color: "#FFF",
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {message.text}
          </Text>
        ) : (
          <MarkdownText isUser={false}>{message.text}</MarkdownText>
        )}
      </View>
      <Text
        style={{
          fontSize: 12,
          color: "#888",
          marginTop: 4,
          alignSelf: message.isUser ? "flex-end" : "flex-start",
        }}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
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
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80 + keyboardHeight,
        }}
      >
        {messages.length === 0 && !isLoading && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
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

      {/* Background for bottom area */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: keyboardHeight + insets.bottom + 80,
          backgroundColor: "#FFF",
        }}
      />

      {/* Input Area */}
      <View
        style={{
          position: "absolute",
          bottom: keyboardHeight + insets.bottom + 12,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
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
              backgroundColor:
                inputText.trim() && !isLoading ? "#0D3B66" : "#CCC",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 20 }}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
