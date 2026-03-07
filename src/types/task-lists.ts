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
  onCreateList?: (name: string) => void
  onRenameList?: (listId: string, newName: string) => void
  onDeleteList?: (listId: string) => void
  onReorderLists?: (orderedIds: string[]) => void
  onCreateTask?: (listId: string, title: string) => void
  onEditTask?: (listId: string, taskId: string, title: string) => void
  onCompleteTask?: (listId: string, taskId: string) => void
  onUncompleteTask?: (listId: string, taskId: string) => void
  onDeleteTask?: (listId: string, taskId: string) => void
  onReorderTasks?: (listId: string, orderedIds: string[]) => void
}
