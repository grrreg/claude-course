"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data for UI demonstration
const mockWorkouts = [
  {
    id: "1",
    name: "Bench Press",
    sets: 4,
    reps: 8,
    weight: 135,
  },
  {
    id: "2",
    name: "Squat",
    sets: 5,
    reps: 5,
    weight: 225,
  },
  {
    id: "3",
    name: "Deadlift",
    sets: 3,
    reps: 5,
    weight: 275,
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={new Date()}
        />
      </div>

      {date && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Workouts for {format(date, "do MMM yyyy")}
          </h2>
        {mockWorkouts.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No workouts logged for this date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle>{workout.name}</CardTitle>
                  <CardDescription>
                    {workout.sets} sets × {workout.reps} reps @ {workout.weight}{" "}
                    lbs
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
      )}
    </main>
  );
}
