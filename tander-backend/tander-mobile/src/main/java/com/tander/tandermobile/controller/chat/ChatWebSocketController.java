package com.tander.tandermobile.controller.chat;

import com.tander.tandermobile.domain.chat.ChatMessage;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.dto.chat.ChatMessageDTO;
import com.tander.tandermobile.dto.chat.SendMessageRequest;
import com.tander.tandermobile.repository.user.UserRepository;
import com.tander.tandermobile.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        String senderUsername = principal.getName();
        User sender = userRepository.findUserByUsername(senderUsername);

        if (sender == null) {
            throw new RuntimeException("Sender not found");
        }

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        ChatMessage message = chatService.sendMessage(sender, receiver, request.getContent());
        ChatMessageDTO messageDTO = chatService.convertToDTO(message);

        messagingTemplate.convertAndSendToUser(
                receiver.getUsername(),
                "/queue/messages",
                messageDTO
        );

        messagingTemplate.convertAndSendToUser(
                sender.getUsername(),
                "/queue/messages",
                messageDTO
        );
    }

    @MessageMapping("/chat.markDelivered")
    public void markAsDelivered(@Payload Long messageId, Principal principal) {
        chatService.markMessageAsDelivered(messageId);
    }

    @MessageMapping("/chat.markRead")
    public void markAsRead(@Payload Long conversationId, Principal principal) {
        String username = principal.getName();
        User user = userRepository.findUserByUsername(username);

        if (user != null) {
            chatService.markMessagesAsRead(conversationId, user);
        }
    }
}
