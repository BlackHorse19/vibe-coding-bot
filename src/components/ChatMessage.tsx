import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  avatar?: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: "default" | "outline" | "secondary";
  }>;
  status?: "pending" | "approved" | "rejected";
  onActionClick?: (action: () => void) => void;
}

export const ChatMessage = ({
  message,
  isUser,
  timestamp,
  avatar,
  actions,
  status,
  onActionClick
}: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 mb-6 animate-in slide-in-from-bottom-2 duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "max-w-[80%] space-y-2",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-chat-user-bg text-chat-user-text rounded-br-md"
            : "bg-chat-bot-bg text-chat-bot-text rounded-bl-md"
        )}>
          {message}

          {status && (
            <div className="mt-2">
              <Badge
                variant={
                  status === "approved" ? "default" :
                  status === "rejected" ? "destructive" :
                  "secondary"
                }
                className={cn(
                  "text-xs",
                  status === "approved" && "bg-success text-success-foreground",
                  status === "pending" && "bg-warning text-warning-foreground"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => onActionClick?.(action.action)}
                className="h-8 text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {timestamp && (
          <p className="text-xs text-muted-foreground px-1">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};
