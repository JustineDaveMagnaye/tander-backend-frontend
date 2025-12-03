package com.tander.tandermobile.repository.chat;

import com.tander.tandermobile.domain.chat.ChatMessage;
import com.tander.tandermobile.domain.chat.Conversation;
import com.tander.tandermobile.domain.chat.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationAndIsDeletedFalseOrderBySentAtAsc(Conversation conversation);

    @Query("SELECT m FROM ChatMessage m WHERE m.conversation = :conversation AND m.isDeleted = false ORDER BY m.sentAt DESC")
    List<ChatMessage> findRecentMessagesByConversation(@Param("conversation") Conversation conversation);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.status = :status WHERE m.id IN :messageIds")
    void updateMessageStatus(@Param("messageIds") List<Long> messageIds, @Param("status") MessageStatus status);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.conversation = :conversation AND m.receiver.id = :userId AND m.status != 'READ' AND m.isDeleted = false")
    Long countUnreadMessagesInConversation(@Param("conversation") Conversation conversation, @Param("userId") Long userId);
}
