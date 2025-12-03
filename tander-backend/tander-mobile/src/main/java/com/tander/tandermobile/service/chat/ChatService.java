package com.tander.tandermobile.service.chat;

import com.tander.tandermobile.domain.chat.ChatMessage;
import com.tander.tandermobile.domain.chat.Conversation;
import com.tander.tandermobile.domain.chat.MessageStatus;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.dto.chat.ChatMessageDTO;
import com.tander.tandermobile.dto.chat.ConversationDTO;

import java.util.List;

public interface ChatService {

    Conversation getOrCreateConversation(User user1, User user2);

    ChatMessage sendMessage(User sender, User receiver, String content);

    List<ChatMessageDTO> getConversationMessages(Long conversationId, User currentUser);

    List<ConversationDTO> getUserConversations(User user);

    void markMessagesAsRead(Long conversationId, User currentUser);

    void markMessageAsDelivered(Long messageId);

    void deleteMessage(Long messageId, User currentUser);

    ChatMessageDTO convertToDTO(ChatMessage message);

    ConversationDTO convertToDTO(Conversation conversation, User currentUser);
}
