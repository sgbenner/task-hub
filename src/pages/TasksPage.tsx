import { useTaskLists } from '../hooks/useTaskLists'
import { useAiTaskCreator } from '../hooks/useAiTaskCreator'
import { TaskListView } from '../components/task-lists'
import type { AiTaskCreatorProps } from '../types/task-lists'

export function TasksPage() {
  const {
    lists,
    loading,
    error,
    fetchAll,
    createList,
    renameList,
    deleteList,
    createTask,
    editTask,
    completeTask,
    uncompleteTask,
    deleteTask,
    createSubtask,
    editSubtask,
    completeSubtask,
    uncompleteSubtask,
    deleteSubtask,
    updateDueDate,
    reorderTasks,
    moveTask,
  } = useTaskLists()

  const aiTaskCreator = useAiTaskCreator(lists, fetchAll)

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

  const aiTaskCreatorProps: AiTaskCreatorProps = {
    status: aiTaskCreator.status,
    createdTasks: aiTaskCreator.createdTasks,
    errorMessage: aiTaskCreator.errorMessage,
    createTasksFromPrompt: aiTaskCreator.createTasksFromPrompt,
    reset: aiTaskCreator.reset,
  }

  return (
    <TaskListView
      lists={lists}
      aiTaskCreatorProps={aiTaskCreatorProps}
      onCreateList={createList}
      onRenameList={renameList}
      onDeleteList={deleteList}
      onCreateTask={createTask}
      onEditTask={editTask}
      onCompleteTask={completeTask}
      onUncompleteTask={uncompleteTask}
      onDeleteTask={deleteTask}
      onCreateSubtask={createSubtask}
      onEditSubtask={editSubtask}
      onCompleteSubtask={completeSubtask}
      onUncompleteSubtask={uncompleteSubtask}
      onDeleteSubtask={deleteSubtask}
      onUpdateDueDate={updateDueDate}
      onReorderTasks={reorderTasks}
      onMoveTask={moveTask}
    />
  )
}
