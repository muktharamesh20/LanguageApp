import { ChatService } from "@/app/services/chatService";
import MarkdownText from "@/components/MarkdownText";
import { supabase } from "@/constants/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
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

  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [chatName, setChatName] = useState("");
  const [chatId, setChatId] = useState("");
  const [isNewChat, setIsNewChat] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      console.log(
        "initializeChat called with chatId:",
        chatId,
        "isNewChat:",
        isNewChat
      );

      // Only load messages if we have a chat ID and it's not a new chat
      if (!chatId || isNewChat) {
        console.log(
          "Skipping chat initialization - chatId:",
          chatId,
          "isNewChat:",
          isNewChat
        );
        return;
      }

      try {
        console.log("Loading messages for chat ID:", chatId);
        const chatWithMessages = await ChatService.getChatWithMessages(
          chatId,
          (
            await supabase.auth.getUser()
          ).data.user!.id
        );

        if (chatWithMessages) {
          console.log(
            "Found chat with",
            chatWithMessages.messages.length,
            "messages"
          );
          const welcomeMessages: Message[] = chatWithMessages.messages.map(
            (item) => ({
              id: item.id.toString(),
              text: item.text,
              isUser: item.user_spoke,
              timestamp: new Date(item.created_at),
            })
          );
          setMessages(welcomeMessages);
        } else {
          console.log("No chat found for ID:", chatId);
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error);
        setMessages([]);
      }
    };

    // Clear messages first when chatId changes to prevent showing old messages
    if (chatId) {
      console.log("Clearing messages for new chatId:", chatId);
      setMessages([]);
    }

    // Only initialize chat if we have all required data loaded
    if (chatId && !isNewChat) {
      console.log("Calling initializeChat for existing chat:", chatId);
      initializeChat();
    } else {
      console.log(
        "Not calling initializeChat - chatId:",
        chatId,
        "isNewChat:",
        isNewChat
      );
    }
  }, [chatId, isNewChat]);

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          // Load user settings from database
          const userId = (await supabase.auth.getUser()!).data!.user!.id;
          const storedData = await supabase
            .from("usersettings")
            .select("*")
            .eq("id", userId)
            .single();
          const storedName = storedData.data?.name;

          // Load chat-specific data from AsyncStorage
          const storedChatName = await AsyncStorage.getItem("@chat_name");
          const storedChatLanguage = await AsyncStorage.getItem(
            "@chat_language"
          );
          const storedChatLevel = await AsyncStorage.getItem("@chat_level");
          const storedChatId = await AsyncStorage.getItem("@chat_id");
          const storedIsNewChat = await AsyncStorage.getItem("@is_new_chat");

          console.log("Loaded from AsyncStorage:", {
            storedChatId,
            storedChatLanguage,
            storedChatLevel,
            storedChatName,
            storedIsNewChat,
            storedName,
          });

          if (
            storedName &&
            storedChatName &&
            storedChatLanguage &&
            storedChatLevel &&
            storedChatId
          ) {
            console.log(
              "Setting chat data - chatId:",
              storedChatId,
              "isNewChat:",
              storedIsNewChat
            );
            setName(storedName);
            setLanguage(storedChatLanguage);
            setLevel(storedChatLevel);
            setChatName(storedChatName);
            setChatId(storedChatId);
            // Handle both new chats (true) and existing chats (null/undefined)
            setIsNewChat(storedIsNewChat === "true");
          } else {
            console.log("Missing chat data - showing alert");
            Alert.alert("Chat data missing", "Please create a new chat first.");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          Alert.alert("Error", "Failed to load chat data.");
        }
      };
      loadUserData();
    }, [])
  );

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

    // Clear the new chat flag after first message
    if (isNewChat) {
      await AsyncStorage.removeItem("@is_new_chat");
      setIsNewChat(false);
    }

    try {
      // Create user context for the system prompt
      const userContext: UserContext = {
        name,
        language,
        level,
        chatName,
      };

      // Store user message in database
      await ChatService.addMessage(
        chatId,
        userMessage.text,
        true,
        (
          await supabase.auth.getUser()
        ).data.user!.id
      );

      // Get conversation history from database
      const chatWithMessages = await ChatService.getChatWithMessages(
        chatId,
        (
          await supabase.auth.getUser()
        ).data.user!.id
      );
      const conversationHistory: ConversationMessage[] =
        chatWithMessages?.messages.map((item) => ({
          role: item.user_spoke ? ("user" as const) : ("assistant" as const),
          content: item.text,
        })) || [];

      const response = await sendToAnthropic(
        userMessage.text,
        userContext,
        conversationHistory
      );

      if (response.error) {
        Alert.alert("Error", response.error);
        return;
      }

      // Store bot response in database
      await ChatService.addMessage(
        chatId,
        response.content,
        false,
        (
          await supabase.auth.getUser()
        ).data.user!.id
      );

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
          backgroundColor: message.isUser ? "#000000" : "#E5E5E5",
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          backgroundColor: "#000000",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}>
          Kikai Chat
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
        contentContainerStyle={{
          paddingBottom: 20,
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

      {/* Input Area */}
      <View
        style={{
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
            placeholderTextColor="#CCC"
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
                inputText.trim() && !isLoading ? "#000000" : "#CCC",
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
    </KeyboardAvoidingView>
  );
}
