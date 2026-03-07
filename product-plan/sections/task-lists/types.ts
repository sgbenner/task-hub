export interface Task {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  order: number
}

export interface TaskList {
  id: string
  name: string
  order: number
  tasks: Task[]
  completedTasks: Task[]
}

export interface TaskListsProps {
  lists: TaskList[]

  /** Called when the user creates a new task list with the given name. */
  onCreateList?: (name: string) => void
  /** Called when the user renames a task list. */
  onRenameList?: (listId: string, newName: string) => void
  /** Called when the user deletes a task list. */
  onDeleteList?: (listId: string) => void
  /** Called when the user reorders lists. Provides the new ordered array of list IDs. */
  onReorderLists?: (orderedIds: string[]) => void

  /** Called when the user creates a new task in a list. */
  onCreateTask?: (listId: string, title: string) => void
  /** Called when the user edits a task's title. */
  onEditTask?: (listId: string, taskId: string, title: string) => void
  /** Called when the user checks a task as complete. */
  onCompleteTask?: (listId: string, taskId: string) => void
  /** Called when the user unchecks a completed task (moves back to active). */
  onUncompleteTask?: (listId: string, taskId: string) => void
  /** Called when the user deletes a task. */
  onDeleteTask?: (listId: string, taskId: string) => void
  /** Called when the user reorders tasks within a list. Provides the new ordered array of task IDs. */
  onReorderTasks?: (listId: string, orderedIds: string[]) => void
}
