import { getWorkoutById } from "@/data/workouts";
import { notFound } from "next/navigation";
import { EditWorkoutForm } from "../edit-workout-form";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <EditWorkoutForm workout={workout} />
    </main>
  );
}
