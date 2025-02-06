import { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'agent',
      content: 'Hello! How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-responses based on keywords
  const autoResponses: { [key: string]: string } = {
    shipping: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days delivery.",
    return: "Our return policy allows returns within 30 days of delivery. Please ensure the item is in its original condition.",
    payment: "We accept all major credit cards, PayPal, and Apple Pay.",
    size: "You can find our size guide in the product description. If you're between sizes, we recommend going up a size.",
    track: "You can track your order by clicking the tracking link in your shipping confirmation email.",
    price: "Our prices are competitive and we often have sales. Sign up for our newsletter to get notified of discounts!",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = () => {
    setIsTyping(true);
    return new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate agent typing
    await simulateTyping();

    // Generate auto-response based on keywords
    let responseContent = "I'll connect you with a customer service representative who can better assist you. In the meantime, you can also reach us at support@example.com or call 1-800-123-4567.";
    
    // Check for keywords in the message
    const lowercaseContent = content.toLowerCase();
    for (const [keyword, response] of Object.entries(autoResponses)) {
      if (lowercaseContent.includes(keyword)) {
        responseContent = response;
        break;
      }
    }

    // Add agent response
    const agentMessage: Message = {
      id: messages.length + 2,
      type: 'agent',
      content: responseContent,
      timestamp: new Date(),
    };
    
    setIsTyping(false);
    setMessages(prev => [...prev, agentMessage]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <ChatWindow
        isOpen={isOpen}
        messages={messages}
        isTyping={isTyping}
        onClose={() => setIsOpen(false)}
        onSendMessage={handleSendMessage}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
