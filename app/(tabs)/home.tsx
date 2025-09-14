import { supabase } from "@/constants/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
}

interface FlashcardCollection {
  id: string;
  name: string;
  lastPracticed: string;
  wordCount: number;
}

const Home = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [flashcardCollections, setFlashcardCollections] = useState<
    FlashcardCollection[]
  >([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("User not authenticated");
        }

        // Load user name
        const { data: userData, error: userError } = await supabase
          .from("usersettings")
          .select("name")
          .eq("id", user.id)
          .single();

        if (userError || !userData?.name) {
          throw new Error("Could not fetch user name.");
        }

        setName(userData.name);

        // Load recent chats by grouping messages by time ranges
        const { data: chatData, error: chatError } = await supabase
          .from("chat_histories")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!chatError && chatData) {
          // Group messages by time ranges to create chat sessions
          const chatSessions: ChatSession[] = [];
          const messageGroups: { [key: string]: any[] } = {};

          chatData.forEach((message) => {
            const messageTime = new Date(message.created_at);
            const date = messageTime.toDateString();

            if (!messageGroups[date]) {
              messageGroups[date] = [];
            }
            messageGroups[date].push(message);
          });

          Object.entries(messageGroups).forEach(([date, messages]) => {
            const sortedMessages = messages.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
            const lastMessage = sortedMessages[sortedMessages.length - 1];

            chatSessions.push({
              id: `chat_${date}`,
              title: `Chat - ${date}`,
              lastMessage:
                lastMessage.text.substring(0, 50) +
                (lastMessage.text.length > 50 ? "..." : ""),
              createdAt: lastMessage.created_at,
            });
          });

          setRecentChats(chatSessions);
        }

        // Load flashcard collections
        const { data: collectionData, error: collectionError } = await supabase
          .from("collections")
          .select("*")
          .eq("user_id", user.id)
          .order("last_practiced", { ascending: false });

        if (!collectionError && collectionData) {
          const collections: FlashcardCollection[] = collectionData.map(
            (collection) => ({
              id: collection.id,
              name: collection.name,
              lastPracticed: collection.last_practiced,
              wordCount: 0, // We'll update this later if needed
            })
          );
          setFlashcardCollections(collections);
        }
      } catch (err: any) {
        console.error(err);
        Alert.alert("Error", err.message || "Something went wrong.");
      }
    };

    loadUserData();
  }, []);
  const renderChatItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={async () => {
        // Extract date from the chat ID and create a timestamp range
        const dateStr = item.id.replace("chat_", "");
        const startOfDay = new Date(dateStr).toISOString();
        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);
        const endOfDayStr = endOfDay.toISOString();

        // Store session data in AsyncStorage
        await AsyncStorage.setItem("@chat_session_id", item.id);
        await AsyncStorage.setItem("@chat_name", item.title);
        await AsyncStorage.setItem("@chat_session_start_time", startOfDay);
        // Clear new chat flag for existing chats
        await AsyncStorage.removeItem("@is_new_chat");

        // Navigate to chat
        router.push("/(tabs)/chat");
      }}
    >
      <Text style={styles.chatTitle}>{item.title}</Text>
      <Text style={styles.chatPreview}>{item.lastMessage}</Text>
      <Text style={styles.chatDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderCollectionItem = ({ item }: { item: FlashcardCollection }) => (
    <TouchableOpacity style={styles.collectionItem}>
      <Text style={styles.collectionTitle}>{item.name}</Text>
      <Text style={styles.collectionInfo}>{item.wordCount} words</Text>
      <Text style={styles.collectionDate}>
        Last practiced: {new Date(item.lastPracticed).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        ...styles.container,
        paddingTop: insets.top + 15,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <Text style={styles.title}>
        {name
          ? `Welcome back, ${name}!`
          : "Welcome to Your Language Learning App!"}
      </Text>

      {/* Create New Section */}
      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>Create New</Text>
        <View style={styles.createButtons}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-chat")}
          >
            <Text style={styles.createButtonText}>🗣️ New Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-flashcards")}
          >
            <Text style={styles.createButtonText}>📚 New Flashcards</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Chats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Chats</Text>
        {recentChats.length > 0 ? (
          <FlatList
            data={recentChats.slice(0, 3)}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            No chats yet. Start a new conversation!
          </Text>
        )}
        {recentChats.length > 3 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Chats</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Flashcard Collections Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flashcard Collections</Text>
        {flashcardCollections.length > 0 ? (
          <FlatList
            data={flashcardCollections.slice(0, 3)}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            No flashcard collections yet. Create your first set!
          </Text>
        )}
        {flashcardCollections.length > 3 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Collections</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    minHeight: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  createSection: {
    marginBottom: 30,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
  },
  createButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  createButton: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  chatItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  chatPreview: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  chatDate: {
    fontSize: 12,
    color: "#999",
  },
  collectionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  collectionInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  collectionDate: {
    fontSize: 12,
    color: "#999",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  viewAllButton: {
    marginTop: 10,
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
});

export default Home;
