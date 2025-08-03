import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestionChips } from "./SuggestionChips";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { chatIntelligence, ChatResponse } from "@/lib/chatIntelligence";
import { employeeDataService } from "@/lib/data";

interface Message {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: "default" | "outline" | "secondary";
  }>;
  status?: "pending" | "approved" | "rejected";
}

export const ChatInterface = () => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load employee data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await employeeDataService.loadEmployeeData();
        setIsDataLoaded(true);

        // Add welcome message after data is loaded
        setMessages([
          {
            id: "1",
            message: "Hello! I'm your Leave Management Assistant. I can help you apply for leave, check your balance, view team statistics, or search for employees. What would you like to do today?",
            isUser: false,
            timestamp: "Just now",
          }
        ]);
      } catch (error) {
        console.error('Error loading employee data:', error);
        setMessages([
          {
            id: "1",
            message: "Sorry, I'm having trouble loading the employee data. Please refresh the page and try again.",
            isUser: false,
            timestamp: "Just now",
          }
        ]);
      }
    };

    loadData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!isDataLoaded) {
      toast({
        title: "Data not loaded",
        description: "Please wait for the employee data to load before sending messages.",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Generate intelligent response
      const chatResponse = await chatIntelligence.generateResponse(message);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: chatResponse.message,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: chatResponse.actions,
        status: chatResponse.status,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: "Sorry, I encountered an error while processing your request. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

    const handleActionClick = (action: () => void) => {
    action();
  };

  const handleFileUpload = (file: File) => {
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });

    const message: Message = {
      id: Date.now().toString(),
      message: `I've received your file: ${file.name}. This will be attached to your leave request.`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.message}
            isUser={message.isUser}
            timestamp={message.timestamp}
            actions={message.actions}
            status={message.status}
            onActionClick={handleActionClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <SuggestionChips onSuggestionClick={handleSuggestionClick} />

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        placeholder="Ask me about leave applications, balances, or history..."
      />
    </Card>
  );
};
