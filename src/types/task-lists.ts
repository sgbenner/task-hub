export interface Task {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  scheduledDate?: string
  dueDate?: string
  order: number
  subtasks: Task[]
}

export interface TodayTask extends Task {
  listId: string
  listName: string
}

export interface TodayTaskGroup {
  listId: string
  listName: string
  tasks: TodayTask[]
}

export interface SearchableTask {
  id: string
  title: string
  listId: string
  listName: string
}

export interface TodayViewProps {
  groups: TodayTaskGroup[]
  completedTasks: TodayTask[]
  searchResults: SearchableTask[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onScheduleTask: (taskId: string) => void
  onUnscheduleTask: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
  onUncompleteTask: (taskId: string) => void
  onCompleteSubtask: (parentId: string, subtaskId: string) => void
  onUncompleteSubtask: (parentId: string, subtaskId: string) => void
  plannerProps?: AiPlannerProps
}

export interface TaskList {
  id: string
  name: string
  order: number
  tasks: Task[]
  completedTasks: Task[]
}

export interface AiTaskSuggestion {
  taskId: string
  suggestedDate: string // YYYY-MM-DD
  reason: string
}

export interface AiPlannerState {
  status: 'idle' | 'loading' | 'done' | 'error'
  suggestions: AiTaskSuggestion[]
  pendingSuggestions: AiTaskSuggestion[]
  decidedCount: number
  errorMessage: string | null
}

export interface AiPlannerCallbacks {
  requestPlan: (context: string) => void
  acceptSuggestion: (taskId: string) => void
  rejectSuggestion: (taskId: string) => void
  reset: () => void
}

export type AiPlannerProps = AiPlannerState & AiPlannerCallbacks & {
  taskMap: Map<string, SearchableTask>
}

export interface AiCreatedTask {
  title: string
  listId: string
  dueDate?: string
  subtasks?: { title: string }[]
}

export interface AiTaskCreatorState {
  status: 'idle' | 'loading' | 'done' | 'error'
  createdTasks: AiCreatedTask[]
  errorMessage: string | null
}

export interface AiTaskCreatorCallbacks {
  createTasksFromPrompt: (prompt: string) => void
  reset: () => void
}

export type AiTaskCreatorProps = AiTaskCreatorState & AiTaskCreatorCallbacks

export interface TaskListsProps {
  lists: TaskList[]
  aiTaskCreatorProps?: AiTaskCreatorProps
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
  onCreateSubtask?: (listId: string, parentId: string, title: string) => void
  onCompleteSubtask?: (listId: string, parentId: string, subtaskId: string) => void
  onUncompleteSubtask?: (listId: string, parentId: string, subtaskId: string) => void
  onEditSubtask?: (listId: string, parentId: string, subtaskId: string, title: string) => void
  onDeleteSubtask?: (listId: string, parentId: string, subtaskId: string) => void
  onUpdateDueDate?: (taskId: string, date: string | null) => void
}
