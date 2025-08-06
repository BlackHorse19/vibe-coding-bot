import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  onFileUpload, 
  disabled = false,
  placeholder = "Type your message..." 
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    e.target.value = "";
  };

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-12 rounded-full border-2 focus:border-primary"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-accent"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || disabled}
          className={cn(
            "rounded-full h-10 w-10 p-0 transition-all duration-200",
            message.trim() && !disabled 
              ? "bg-primary hover:bg-primary-dark shadow-md" 
              : "bg-muted"
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};