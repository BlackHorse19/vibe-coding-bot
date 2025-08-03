import { Button } from "@/components/ui/button";
import { Calendar, History, CreditCard, X, Users, Search, HelpCircle } from "lucide-react";

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
  suggestions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
  }>;
}

const defaultSuggestions = [
  {
    label: "Check Balance",
    action: "What's my leave balance?",
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    label: "Apply Leave",
    action: "I want to apply for leave",
    icon: <Calendar className="h-4 w-4" />
  },
  {
    label: "Team Stats",
    action: "Show team statistics",
    icon: <Users className="h-4 w-4" />
  },
  {
    label: "Search Employee",
    action: "Find employee",
    icon: <Search className="h-4 w-4" />
  },
  {
    label: "Help",
    action: "What can you do?",
    icon: <HelpCircle className="h-4 w-4" />
  }
];

export const SuggestionChips = ({
  onSuggestionClick,
  suggestions = defaultSuggestions
}: SuggestionChipsProps) => {
  return (
    <div className="p-4 border-t bg-muted/30">
      <p className="text-sm text-muted-foreground mb-3 font-medium">
        Quick actions:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion.action)}
            className="rounded-full bg-background hover:bg-accent transition-all duration-200 border-2 hover:border-primary/20"
          >
            {suggestion.icon && (
              <span className="mr-2">{suggestion.icon}</span>
            )}
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
