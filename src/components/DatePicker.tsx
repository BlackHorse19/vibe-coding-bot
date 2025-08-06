import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface DatePickerProps {
  onDateSelect: (startDate: string, endDate?: string) => void;
  allowRange?: boolean;
}

export const DatePicker = ({ onDateSelect, allowRange = false }: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const handleDateConfirm = () => {
    if (allowRange && dateRange?.from) {
      const startDate = format(dateRange.from, "dd/MM/yyyy");
      const endDate = dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : startDate;
      onDateSelect(startDate, endDate);
    } else if (date) {
      const selectedDate = format(date, "dd/MM/yyyy");
      onDateSelect(selectedDate);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {allowRange ? (
            dateRange?.from ? (
              dateRange.to ? (
                `${format(dateRange.from, "dd/MM/yyyy")} to ${format(dateRange.to, "dd/MM/yyyy")}`
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              "Select date range"
            )
          ) : (
            date ? format(date, "dd/MM/yyyy") : "Select date"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {allowRange ? (
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        ) : (
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        )}
        <div className="p-3 border-t">
          <Button 
            onClick={handleDateConfirm} 
            className="w-full"
            disabled={allowRange ? !dateRange?.from : !date}
          >
            Confirm Selection
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
