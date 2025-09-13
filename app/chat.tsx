import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      className={`mb-3 ${message.isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          message.isUser
            ? "bg-blue-500 rounded-br-md"
            : "bg-gray-200 rounded-bl-md"
        }`}
      >
        <Text
          className={`text-base ${
            message.isUser ? "text-white" : "text-gray-800"
          }`}
        >
          {message.text}
        </Text>
      </View>
      <Text className="text-xs text-gray-500 mt-1">
        {message.timestamp.toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-500 px-4 py-6 pt-12">
        <Text className="text-white text-xl font-bold text-center">
          🐰 Language App Chat
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-500 text-center text-lg">
              Start a conversation by typing a message below
            </Text>
          </View>
        ) : (
          messages.map(renderMessage)
        )}

        {isLoading && (
          <View className="items-start mb-3">
            <View className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
              <ActivityIndicator size="small" color="#6B7280" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        <View className="flex-row items-end space-x-3">
          <TextInput
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-base min-h-[48px] max-h-[120px]"
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            className={`w-12 h-12 rounded-full justify-center items-center ${
              inputText.trim() && !isLoading ? "bg-blue-500" : "bg-gray-300"
            }`}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text className="text-white font-bold text-lg">→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
