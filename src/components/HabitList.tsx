import * as Checkbox from "@radix-ui/react-checkbox";
import { useEffect, useState } from "react";
import { Check } from "phosphor-react";
import { api } from "../lib/axios";
import dayjs from "dayjs";

interface HabitListPorps {
  date: Date;
  onCompletedChanged: (completed: number) => void;
}

interface habitsInfo {
  possibleHabits: Array<{
    id: string;
    title: string;
    created_at: string;
  }>,
  completedHabit: string[]
}

export function HabitsList({ date, onCompletedChanged }: HabitListPorps) {
  const [ habitsInfo, setHabitsInfo ] = useState<habitsInfo>();

  useEffect(() => {
    api.get('/day', { params: { date: date.toISOString() } }).then(response => {
      setHabitsInfo(response.data)
    })
  }, [])

  async function toggleHabit(habitId: string) {
    const isCompleted = habitsInfo?.completedHabit.includes(habitId)

    await api.patch(`/habits/${habitId}/toggle`)

    let completedHabits: string[] = []

    if(isCompleted) {
      completedHabits = habitsInfo!.completedHabit.filter(id => id !== habitId);
    } else {
      completedHabits = [...habitsInfo!.completedHabit, habitId]
    }
    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabit: completedHabits,
    })

    onCompletedChanged(completedHabits.length)
  }

  const isDateInPast = dayjs(date).endOf('day').isBefore(new Date());

  return (
    <div className="mt-6 flex flex-col gap-3">
      { 
        habitsInfo?.possibleHabits.map(habit => {
          return (
            <Checkbox.Root key={ habit.id } className="flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed"
              onCheckedChange={() => { toggleHabit(habit.id) }}
              checked={habitsInfo.completedHabit.includes(habit.id)} disabled={isDateInPast}>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-600 group-focus:ring-offset-2 group-focus:ring-offset-background">
                <Checkbox.Indicator>
                  <Check size={ 20 } className="text-white" />
                </Checkbox.Indicator>
              </div>

              <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
                { habit.title }
              </span>
            </Checkbox.Root>
          )
        })
      }
    </div>
  )
}