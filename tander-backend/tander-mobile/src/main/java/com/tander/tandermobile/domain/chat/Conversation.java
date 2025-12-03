package com.tander.tandermobile.domain.chat;

import com.tander.tandermobile.domain.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversation implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "last_message_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastMessageAt;

    @Column(name = "is_active")
    private boolean isActive;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        lastMessageAt = new Date();
        isActive = true;
    }
}
