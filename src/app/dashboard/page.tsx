import Link from "next/link";
import { format } from "date-fns";
import { getWorkoutsByDate } from "@/data/workouts";
import { WorkoutCalendar } from "./workout-calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(dateParam + "T00:00:00") : new Date();

  const workouts = await getWorkoutsByDate(date);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/workout/new">Log New Workout</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <WorkoutCalendar />
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            Workouts for {format(date, "do MMM yyyy")}
          </h2>
          {workouts.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No workouts logged for this date.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {workouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <CardTitle>{workout.name}</CardTitle>
                    <CardDescription>
                      {workout.workoutExercises.length} exercise
                      {workout.workoutExercises.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workout.workoutExercises.map((workoutExercise) => (
                        <div
                          key={workoutExercise.id}
                          className="border-l-2 border-muted pl-3"
                        >
                          <p className="font-medium">
                            {workoutExercise.exercise.name}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            {workoutExercise.sets.map((set) => (
                              <span key={set.id} className="mr-3">
                                Set {set.setNumber}: {set.reps} reps
                                {set.weight ? ` @ ${set.weight} lbs` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
