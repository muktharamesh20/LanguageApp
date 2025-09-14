import { supabase } from "@/constants/supabaseClient";
import { Tables, TablesInsert } from "@/databasetypes";

export type Chat = Tables<"chats">;
export type ChatHistory = Tables<"chat_histories">;
export type ChatInsert = TablesInsert<"chats">;
export type ChatHistoryInsert = TablesInsert<"chat_histories">;

export interface ChatWithMessages extends Chat {
  messages: ChatHistory[];
}

export class ChatService {
  /**
   * Creates a new chat and returns the chat ID
   */
  static async createChat(chatName: string, userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("chats")
        .insert({
          chat_name: chatName,
          user_id: userId,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating chat:", error);
        throw new Error(`Failed to create chat: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error("Error in createChat:", error);
      throw error;
    }
  }

  /**
   * Gets all chats for a user
   */
  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user chats:", error);
        throw new Error(`Failed to fetch chats: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserChats:", error);
      throw error;
    }
  }

  /**
   * Gets a specific chat with its messages
   */
  static async getChatWithMessages(
    chatId: string,
    userId: string
  ): Promise<ChatWithMessages | null> {
    try {
      // First get the chat
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .eq("user_id", userId)
        .single();

      if (chatError || !chatData) {
        console.error("Error fetching chat:", chatError);
        return null;
      }

      // Then get the messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("chat_histories")
        .select("*")
        .eq("chat_associated", chatId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching chat messages:", messagesError);
        throw new Error(`Failed to fetch messages: ${messagesError.message}`);
      }

      return {
        ...chatData,
        messages: messagesData || [],
      };
    } catch (error) {
      console.error("Error in getChatWithMessages:", error);
      throw error;
    }
  }

  /**
   * Adds a message to a chat
   */
  static async addMessage(
    chatId: string,
    text: string,
    userSpoke: boolean,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from("chat_histories").insert({
        chat_associated: chatId,
        text,
        user_spoke: userSpoke,
        user_id: userId,
      });

      if (error) {
        console.error("Error adding message:", error);
        throw new Error(`Failed to add message: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in addMessage:", error);
      throw error;
    }
  }

  /**
   * Deletes a chat and all its messages
   */
  static async deleteChat(chatId: string, userId: string): Promise<void> {
    try {
      // First delete all messages in the chat
      const { error: messagesError } = await supabase
        .from("chat_histories")
        .delete()
        .eq("chat_associated", chatId)
        .eq("user_id", userId);

      if (messagesError) {
        console.error("Error deleting chat messages:", messagesError);
        throw new Error(
          `Failed to delete chat messages: ${messagesError.message}`
        );
      }

      // Then delete the chat
      const { error: chatError } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId)
        .eq("user_id", userId);

      if (chatError) {
        console.error("Error deleting chat:", chatError);
        throw new Error(`Failed to delete chat: ${chatError.message}`);
      }
    } catch (error) {
      console.error("Error in deleteChat:", error);
      throw error;
    }
  }

  /**
   * Updates a chat name
   */
  static async updateChatName(
    chatId: string,
    newName: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("chats")
        .update({ chat_name: newName })
        .eq("id", chatId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating chat name:", error);
        throw new Error(`Failed to update chat name: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in updateChatName:", error);
      throw error;
    }
  }
}
