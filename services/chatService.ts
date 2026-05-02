import { apiClient } from "@/lib/api";

export interface Conversation {
  MessageList_id: number;
  user_id: number;
  coach_id: number;
  last_message_at: string | null;
  created_at: string;
  other_name?: string;
}

export interface ChatMessage {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const chatService = {
  getOrCreateConversation: (coachUserId: number) =>
    apiClient<{ Conversation: Conversation }>(`chat/conversations/${coachUserId}`, {
      method: "POST",
    }),

  getConversations: () =>
    apiClient<{ Conversations: Conversation[] }>("chat/conversations", {
      method: "GET",
    }),

  getMessages: async (conversationId: number): Promise<ChatMessage[]> => {
    try {
      const res = await apiClient<{ messages: ChatMessage[] }>(
        `chat/conversations/${conversationId}/messages`,
        { method: "GET" },
      );
      return res.messages ?? [];
    } catch {
      return [];
    }
  },
};
