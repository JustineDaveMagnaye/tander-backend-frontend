package com.tander.tandermobile.service.chat.impl;

import com.tander.tandermobile.domain.audit.AuditEventType;
import com.tander.tandermobile.domain.audit.AuditStatus;
import com.tander.tandermobile.domain.chat.ChatMessage;
import com.tander.tandermobile.domain.chat.Conversation;
import com.tander.tandermobile.domain.chat.MessageStatus;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.dto.chat.ChatMessageDTO;
import com.tander.tandermobile.dto.chat.ConversationDTO;
import com.tander.tandermobile.repository.chat.ChatMessageRepository;
import com.tander.tandermobile.repository.chat.ConversationRepository;
import com.tander.tandermobile.service.audit.AuditLogService;
import com.tander.tandermobile.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public Conversation getOrCreateConversation(User user1, User user2) {
        return conversationRepository.findConversationBetweenUsers(user1, user2)
                .orElseGet(() -> {
                    Conversation conversation = new Conversation();
                    conversation.setUser1(user1);
                    conversation.setUser2(user2);
                    conversation.setActive(true);
                    Conversation saved = conversationRepository.save(conversation);

                    auditLogService.logEventWithDetails(
                        AuditEventType.CHAT_CONVERSATION_STARTED,
                        AuditStatus.SUCCESS,
                        user1.getId(),
                        user1.getUsername(),
                        "Conversation",
                        saved.getId(),
                        "Started conversation with user: " + user2.getUsername(),
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    );

                    return saved;
                });
    }

    @Override
    @Transactional
    public ChatMessage sendMessage(User sender, User receiver, String content) {
        Conversation conversation = getOrCreateConversation(sender, receiver);

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setStatus(MessageStatus.SENT);

        ChatMessage savedMessage = chatMessageRepository.save(message);

        conversation.setLastMessageAt(new Date());
        conversationRepository.save(conversation);

        auditLogService.logEventWithDetails(
            AuditEventType.CHAT_MESSAGE_SENT,
            AuditStatus.SUCCESS,
            sender.getId(),
            sender.getUsername(),
            "ChatMessage",
            savedMessage.getId(),
            "Message sent to user: " + receiver.getUsername(),
            null,
            null,
            null,
            null,
            null,
            null
        );

        return savedMessage;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getConversationMessages(Long conversationId, User currentUser) {
        Conversation conversation = conversationRepository.findConversationByIdAndUser(conversationId, currentUser)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));

        List<ChatMessage> messages = chatMessageRepository.findByConversationAndIsDeletedFalseOrderBySentAtAsc(conversation);

        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDTO> getUserConversations(User user) {
        List<Conversation> conversations = conversationRepository.findActiveConversationsByUser(user);

        return conversations.stream()
                .map(conv -> convertToDTO(conv, user))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long conversationId, User currentUser) {
        Conversation conversation = conversationRepository.findConversationByIdAndUser(conversationId, currentUser)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));

        List<ChatMessage> unreadMessages = chatMessageRepository.findByConversationAndIsDeletedFalseOrderBySentAtAsc(conversation)
                .stream()
                .filter(msg -> msg.getReceiver().getId().equals(currentUser.getId()) && msg.getStatus() != MessageStatus.READ)
                .collect(Collectors.toList());

        if (!unreadMessages.isEmpty()) {
            List<Long> messageIds = unreadMessages.stream().map(ChatMessage::getId).collect(Collectors.toList());
            chatMessageRepository.updateMessageStatus(messageIds, MessageStatus.READ);
        }
    }

    @Override
    @Transactional
    public void markMessageAsDelivered(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (message.getStatus() == MessageStatus.SENT) {
            message.setStatus(MessageStatus.DELIVERED);
            chatMessageRepository.save(message);

            auditLogService.logEventWithDetails(
                AuditEventType.CHAT_MESSAGE_RECEIVED,
                AuditStatus.SUCCESS,
                message.getReceiver().getId(),
                message.getReceiver().getUsername(),
                "ChatMessage",
                messageId,
                "Message delivered",
                null,
                null,
                null,
                null,
                null,
                null
            );
        }
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, User currentUser) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Cannot delete message from another user");
        }

        message.setDeleted(true);
        message.setDeletedAt(new Date());
        chatMessageRepository.save(message);

        auditLogService.logEventWithDetails(
            AuditEventType.CHAT_MESSAGE_DELETED,
            AuditStatus.SUCCESS,
            currentUser.getId(),
            currentUser.getUsername(),
            "ChatMessage",
            messageId,
            "Message deleted",
            null,
            null,
            null,
            null,
            null,
            null
        );
    }

    @Override
    public ChatMessageDTO convertToDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversation().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderUsername(message.getSender().getUsername());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverUsername(message.getReceiver().getUsername());
        dto.setContent(message.getContent());
        dto.setSentAt(message.getSentAt());
        dto.setStatus(message.getStatus());
        return dto;
    }

    @Override
    public ConversationDTO convertToDTO(Conversation conversation, User currentUser) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setUser1Id(conversation.getUser1().getId());
        dto.setUser1Username(conversation.getUser1().getUsername());
        dto.setUser2Id(conversation.getUser2().getId());
        dto.setUser2Username(conversation.getUser2().getUsername());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setLastMessageAt(conversation.getLastMessageAt());
        dto.setActive(conversation.isActive());

        List<ChatMessage> recentMessages = chatMessageRepository.findRecentMessagesByConversation(conversation);
        if (!recentMessages.isEmpty()) {
            dto.setLastMessage(recentMessages.get(0).getContent());
        }

        Long unreadCount = chatMessageRepository.countUnreadMessagesInConversation(conversation, currentUser.getId());
        dto.setUnreadCount(unreadCount);

        return dto;
    }
}
