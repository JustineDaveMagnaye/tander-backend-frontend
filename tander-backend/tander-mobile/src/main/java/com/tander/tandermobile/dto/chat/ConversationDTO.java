package com.tander.tandermobile.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private Long user1Id;
    private String user1Username;
    private Long user2Id;
    private String user2Username;
    private Date createdAt;
    private Date lastMessageAt;
    private String lastMessage;
    private Long unreadCount;
    private boolean isActive;
}
