package com.tander.tandermobile.controller.chat;

import com.tander.tandermobile.domain.chat.ChatMessage;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.dto.chat.ChatMessageDTO;
import com.tander.tandermobile.dto.chat.ConversationDTO;
import com.tander.tandermobile.dto.chat.SendMessageRequest;
import com.tander.tandermobile.repository.user.UserRepository;
import com.tander.tandermobile.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findUserByUsername(username);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ConversationDTO> conversations = chatService.getUserConversations(user);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getConversationMessages(
            @PathVariable Long conversationId,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findUserByUsername(username);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<ChatMessageDTO> messages = chatService.getConversationMessages(conversationId, user);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @RequestBody SendMessageRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        User sender = userRepository.findUserByUsername(username);

        if (sender == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        ChatMessage message = chatService.sendMessage(sender, receiver, request.getContent());
        ChatMessageDTO messageDTO = chatService.convertToDTO(message);

        return ResponseEntity.status(HttpStatus.CREATED).body(messageDTO);
    }

    @PostMapping("/conversations/{conversationId}/mark-read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long conversationId,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findUserByUsername(username);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            chatService.markMessagesAsRead(conversationId, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findUserByUsername(username);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            chatService.deleteMessage(messageId, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    @GetMapping("/users/{userId}/start-conversation")
    public ResponseEntity<ConversationDTO> startOrGetConversation(
            @PathVariable Long userId,
            Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findUserByUsername(username);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        var conversation = chatService.getOrCreateConversation(currentUser, otherUser);
        ConversationDTO conversationDTO = chatService.convertToDTO(conversation, currentUser);

        return ResponseEntity.ok(conversationDTO);
    }
}
