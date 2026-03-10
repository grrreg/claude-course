import { getWorkoutWithExercises } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkoutLogger } from "./workout-logger";

interface WorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { workoutId } = await params;

  const [workout, allExercises] = await Promise.all([
    getWorkoutWithExercises(workoutId),
    getAllExercises(),
  ]);

  if (!workout) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(new Date(workout.startedAt), "do MMM yyyy")}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/workout/${workoutId}/edit`}>Edit</Link>
        </Button>
      </div>

      <WorkoutLogger workout={workout} allExercises={allExercises} />
    </main>
  );
}
