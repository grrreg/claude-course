"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addExerciseAction,
  removeExerciseAction,
  addSetAction,
  updateSetAction,
  deleteSetAction,
} from "./actions";
import type { WorkoutWithExercisesAndSets } from "@/data/workouts";

interface WorkoutLoggerProps {
  workout: WorkoutWithExercisesAndSets;
  allExercises: { id: string; name: string }[];
}

interface SetRowProps {
  set: WorkoutWithExercisesAndSets["workoutExercises"][number]["sets"][number];
  workoutId: string;
}

function SetRow({ set, workoutId }: SetRowProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(set.weight ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    setIsSubmitting(true);
    await updateSetAction({
      setId: set.id,
      workoutId,
      weight: weight || undefined,
      reps: reps ? Number(reps) : undefined,
    });
    router.refresh();
    setIsSubmitting(false);
    setIsEditing(false);
  }

  async function handleDelete() {
    setIsSubmitting(true);
    await deleteSetAction({ setId: set.id, workoutId });
    router.refresh();
    setIsSubmitting(false);
  }

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>{set.setNumber}</TableCell>
        <TableCell>
          <Input
            type="number"
            step="0.5"
            min="0"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-24 h-8"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            min="1"
            placeholder="reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-20 h-8"
          />
        </TableCell>
        <TableCell className="space-x-1">
          <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{set.setNumber}</TableCell>
      <TableCell>{set.weight ? `${set.weight} kg` : "—"}</TableCell>
      <TableCell>{set.reps ?? "—"}</TableCell>
      <TableCell className="space-x-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
          disabled={isSubmitting}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface ExerciseCardProps {
  workoutExercise: WorkoutWithExercisesAndSets["workoutExercises"][number];
  workoutId: string;
}

function ExerciseCard({ workoutExercise, workoutId }: ExerciseCardProps) {
  const router = useRouter();
  const [showAddSet, setShowAddSet] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleRemoveExercise() {
    setIsSubmitting(true);
    await removeExerciseAction({
      workoutExerciseId: workoutExercise.id,
      workoutId,
    });
    router.refresh();
    setIsSubmitting(false);
  }

  async function handleAddSet() {
    setIsSubmitting(true);
    setErrors({});

    const result = await addSetAction({
      workoutExerciseId: workoutExercise.id,
      workoutId,
      weight: weight || undefined,
      reps: reps ? Number(reps) : undefined,
    });

    if (!result.success) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    router.refresh();
    setWeight("");
    setReps("");
    setShowAddSet(false);
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{workoutExercise.exercise.name}</CardTitle>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleRemoveExercise}
          disabled={isSubmitting}
        >
          Remove
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {workoutExercise.sets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Set</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Reps</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workoutExercise.sets.map((set) => (
                <SetRow key={set.id} set={set} workoutId={workoutId} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No sets logged yet.</p>
        )}

        {showAddSet ? (
          <div className="space-y-3 border rounded-md p-3">
            <p className="text-sm font-medium">
              Set {workoutExercise.sets.length + 1}
            </p>
            <div className="flex gap-3">
              <div className="space-y-1 flex-1">
                <Label htmlFor={`weight-${workoutExercise.id}`}>Weight (kg)</Label>
                <Input
                  id={`weight-${workoutExercise.id}`}
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 60"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label htmlFor={`reps-${workoutExercise.id}`}>Reps</Label>
                <Input
                  id={`reps-${workoutExercise.id}`}
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
            </div>
            {errors._form && (
              <p className="text-sm text-destructive">{errors._form[0]}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddSet(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddSet} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Set"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddSet(true)}
          >
            + Add Set
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkoutLogger({ workout, allExercises }: WorkoutLoggerProps) {
  const router = useRouter();
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const addedExerciseIds = new Set(
    workout.workoutExercises.map((we) => we.exerciseId)
  );
  const availableExercises = allExercises.filter(
    (e) => !addedExerciseIds.has(e.id)
  );

  async function handleAddExercise() {
    if (!selectedExerciseId) return;
    setIsAddingExercise(true);
    setErrors({});

    const result = await addExerciseAction({
      workoutId: workout.id,
      exerciseId: selectedExerciseId,
    });

    if (!result.success) {
      setErrors(result.errors);
      setIsAddingExercise(false);
      return;
    }

    router.refresh();
    setSelectedExerciseId("");
    setIsAddingExercise(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {workout.workoutExercises.length === 0 ? (
          <p className="text-muted-foreground">
            No exercises added yet. Add an exercise below to get started.
          </p>
        ) : (
          workout.workoutExercises.map((workoutExercise) => (
            <ExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
              workoutId={workout.id}
            />
          ))
        )}
      </div>

      {availableExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Exercise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={selectedExerciseId}
              onValueChange={setSelectedExerciseId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an exercise..." />
              </SelectTrigger>
              <SelectContent>
                {availableExercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors._form && (
              <p className="text-sm text-destructive">{errors._form[0]}</p>
            )}
            <Button
              onClick={handleAddExercise}
              disabled={!selectedExerciseId || isAddingExercise}
            >
              {isAddingExercise ? "Adding..." : "Add Exercise"}
            </Button>
          </CardContent>
        </Card>
      )}

      {availableExercises.length === 0 && allExercises.length > 0 && (
        <p className="text-sm text-muted-foreground">
          All available exercises have been added to this workout.
        </p>
      )}
    </div>
  );
}
