package com.tander.tandermobile.repository.chat;

import com.tander.tandermobile.domain.chat.Conversation;
import com.tander.tandermobile.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE (c.user1 = :user1 AND c.user2 = :user2) OR (c.user1 = :user2 AND c.user2 = :user1)")
    Optional<Conversation> findConversationBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT c FROM Conversation c WHERE (c.user1 = :user OR c.user2 = :user) AND c.isActive = true ORDER BY c.lastMessageAt DESC")
    List<Conversation> findActiveConversationsByUser(@Param("user") User user);

    @Query("SELECT c FROM Conversation c WHERE c.id = :conversationId AND (c.user1 = :user OR c.user2 = :user)")
    Optional<Conversation> findConversationByIdAndUser(@Param("conversationId") Long conversationId, @Param("user") User user);
}
