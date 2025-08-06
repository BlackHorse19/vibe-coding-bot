import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestionChips } from "./SuggestionChips";
import { DatePicker } from "./DatePicker";
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
    action: () => void | Promise<ChatResponse>;
    variant?: "default" | "outline" | "secondary";
  }>;
  status?: "pending" | "approved" | "rejected";
  showCalendar?: boolean;
}

export const ChatInterface = () => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Debug: Log showDatePicker state changes
  useEffect(() => {
    console.log('showDatePicker state changed to:', showDatePicker);
  }, [showDatePicker]);

  // Load employee data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await employeeDataService.loadEmployeeData();
        await employeeDataService.loadLeaveApplications(); // Load leave applications data
        setIsDataLoaded(true);

        // Add welcome message after data is loaded
        setMessages([
          {
            id: "1",
            message: "Hey! I'm your Leave Assistant. I can help you check leave balances, apply for leave, view team stats, or find employees. What do you need?",
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
        showCalendar: chatResponse.showCalendar,
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Show calendar if requested
      if (chatResponse.showCalendar) {
        console.log('Setting showDatePicker to true from handleSendMessage');
        setShowDatePicker(true);
      }
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

    const handleActionClick = async (action: () => void | Promise<ChatResponse>) => {
    console.log('Action clicked, executing action...');
    const result = action();
    console.log('Action result:', result);
    
    // Check if the action returns a Promise (async action)
    if (result instanceof Promise) {
      setIsLoading(true);
      try {
        const chatResponse = await result;
        console.log('Chat response from action:', chatResponse);
        
        // Add the response as a new bot message
        const botMessage: Message = {
          id: Date.now().toString(),
          message: chatResponse.message,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: chatResponse.actions,
          status: chatResponse.status,
          showCalendar: chatResponse.showCalendar,
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Show calendar if requested
        if (chatResponse.showCalendar) {
          console.log('Setting showDatePicker to true');
          setShowDatePicker(true);
        }
      } catch (error) {
        console.error('Error handling async action:', error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          message: "Sorry, I encountered an error while processing your request. Please try again.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
    // For sync actions, just execute them (existing behavior)
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

  const handleDateSelect = async (startDate: string, endDate?: string) => {
    const dateMessage = endDate ? `${startDate} to ${endDate}` : startDate;
    
    // Send the selected date as a user message
    await handleSendMessage(dateMessage);
    
    setShowDatePicker(false);
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

      {/* Date Picker - Conditionally rendered based on state */}
      {showDatePicker && (
        <div className="p-4 border-t bg-slate-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-slate-900">Select your leave dates</h3>
            <button 
              onClick={() => setShowDatePicker(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <DatePicker onDateSelect={handleDateSelect} allowRange={true} />
        </div>
      )}
    </Card>
  );
};
