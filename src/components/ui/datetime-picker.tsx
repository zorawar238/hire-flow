"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { CalendarIcon } from "lucide-react"
import { format, startOfDay } from "date-fns"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import "react-day-picker/dist/style.css"

export interface DateTimePickerProps {
  id?: string
  name?: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
}

export function DateTimePicker({
  id,
  name,
  required,
  defaultValue,
  placeholder = "Pick a date and time",
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined
  )
  const [time, setTime] = React.useState<string>(
    defaultValue ? format(new Date(defaultValue), "HH:mm") : "12:00"
  )
  const [isOpen, setIsOpen] = React.useState(false)

  // Formatted date string for display
  const displayValue = date
    ? format(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          parseInt(time.split(":")[0] || "0"),
          parseInt(time.split(":")[1] || "0")
        ),
        "PPP p"
      )
    : placeholder

  // ISO string for the hidden input value (matches datetime-local native format)
  const hiddenValue = date
    ? format(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          parseInt(time.split(":")[0] || "0"),
          parseInt(time.split(":")[1] || "0")
        ),
        "yyyy-MM-dd'T'HH:mm"
      )
    : ""

  const handleSet = () => {
    setIsOpen(false)
  }

  // Prevent selecting dates before today
  const disabledDays = { before: startOfDay(new Date()) }

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Trigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 px-3",
              !date && "text-muted-foreground"
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {displayValue}
      </PopoverPrimitive.Trigger>
      
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner align="start" sideOffset={4} className="z-[100]">
          <PopoverPrimitive.Popup className="z-[100] rounded-lg border bg-card text-card-foreground shadow-lg outline-none data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95">
            <div className="flex flex-col p-4 space-y-4">
              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={disabledDays}
                className="p-0 bg-transparent"
                style={{
                  "--rdp-accent-color": "hsl(var(--primary))",
                  "--rdp-background-color": "hsl(var(--primary))",
                } as React.CSSProperties}
              />

              <div className="border-t pt-4 flex flex-col space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-9"
                />
              </div>

              <Button onClick={handleSet} className="w-full mt-2" disabled={!date}>
                Set
              </Button>
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>

      {/* Hidden input to pass value to FormData naturally */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={hiddenValue}
        required={required}
      />
    </PopoverPrimitive.Root>
  )
}
