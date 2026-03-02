"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

export function WorkoutCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const initialDate = dateParam ? new Date(dateParam) : new Date();

  const [date, setDate] = useState<Date | undefined>(initialDate);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      router.push(`/dashboard?date=${dateString}`);
    }
  };

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleSelect}
      defaultMonth={initialDate}
    />
  );
}
