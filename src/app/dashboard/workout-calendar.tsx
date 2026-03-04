"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

export function WorkoutCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const initialDate = dateParam ? new Date(dateParam + "T00:00:00") : new Date();

  const [date, setDate] = useState<Date | undefined>(initialDate);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
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
