import { useTaskLists } from '../hooks/useTaskLists'
import { TaskListView } from '../components/task-lists'

export function TasksPage() {
  const {
    lists,
    loading,
    error,
    createList,
    renameList,
    deleteList,
    createTask,
    editTask,
    completeTask,
    uncompleteTask,
    deleteTask,
  } = useTaskLists()

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-stone-400">
        Loading tasks…
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <TaskListView
      lists={lists}
      onCreateList={createList}
      onRenameList={renameList}
      onDeleteList={deleteList}
      onCreateTask={createTask}
      onEditTask={editTask}
      onCompleteTask={completeTask}
      onUncompleteTask={uncompleteTask}
      onDeleteTask={deleteTask}
    />
  )
}
