import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Plus, X, ChevronDown, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { TaskListsProps, TaskList } from '../../types/task-lists'
import { TaskRow } from './TaskRow'
import { ConfirmDialog } from '../ConfirmDialog'

export function TaskListView({
  lists,
  onCreateList,
  onRenameList,
  onDeleteList,
  onCreateTask,
  onEditTask,
  onCompleteTask,
  onUncompleteTask,
  onDeleteTask,
  onCreateSubtask,
  onCompleteSubtask,
  onUncompleteSubtask,
  onEditSubtask,
  onDeleteSubtask,
  onUpdateDueDate,
  onMoveTask,
}: TaskListsProps) {
  const [activeListId, setActiveListId] = useState<string | null>(lists[0]?.id ?? null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListName, setEditingListName] = useState('')
  const [addingList, setAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [confirmDeleteListId, setConfirmDeleteListId] = useState<string | null>(null)
  const [kebabListId, setKebabListId] = useState<string | null>(null)

  const newTaskInputRef = useRef<HTMLInputElement>(null)
  const kebabMenuRef = useRef<HTMLDivElement>(null)

  const activeList = lists.find((l) => l.id === activeListId) ?? null

  // If the active list no longer exists (e.g. after data refresh), select the first list
  if (!activeList && lists.length > 0 && activeListId !== lists[0].id) {
    setActiveListId(lists[0].id)
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !activeListId) return
    onCreateTask?.(activeListId, newTaskTitle.trim())
    setNewTaskTitle('')
  }

  const handleNewTaskKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddTask()
  }

  const handleAddList = () => {
    if (!newListName.trim()) {
      setAddingList(false)
      return
    }
    onCreateList?.(newListName.trim())
    setNewListName('')
    setAddingList(false)
  }

  const handleNewListKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddList()
    if (e.key === 'Escape') {
      setAddingList(false)
      setNewListName('')
    }
  }

  const handleStartRename = (list: TaskList) => {
    setEditingListId(list.id)
    setEditingListName(list.name)
  }

  const handleRenameSubmit = () => {
    if (!editingListId || !editingListName.trim()) {
      setEditingListId(null)
      return
    }
    onRenameList?.(editingListId, editingListName.trim())
    setEditingListId(null)
    setEditingListName('')
  }

  const handleRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameSubmit()
    if (e.key === 'Escape') {
      setEditingListId(null)
      setEditingListName('')
    }
  }

  // Close kebab menu on outside click
  useEffect(() => {
    if (!kebabListId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (kebabMenuRef.current && !kebabMenuRef.current.contains(e.target as Node)) {
        setKebabListId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [kebabListId])

  const handleDeleteList = (listId: string) => {
    const list = lists.find((l) => l.id === listId)
    const hasTasks =
      (list?.tasks.length ?? 0) > 0 || (list?.completedTasks.length ?? 0) > 0
    if (hasTasks) {
      setConfirmDeleteListId(listId)
    } else {
      doDeleteList(listId)
    }
  }

  const doDeleteList = (listId: string) => {
    onDeleteList?.(listId)
    if (activeListId === listId) {
      const remaining = lists.filter((l) => l.id !== listId)
      setActiveListId(remaining[0]?.id ?? null)
    }
  }

  return (
    <div className="font-['Inter',sans-serif] min-h-[calc(100vh-3.5rem)]">
      {/* List tabs */}
      <div className="border-b border-stone-200 dark:border-stone-800 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex items-end gap-0.5 overflow-x-auto">
          {lists.map((list) => (
            <div key={list.id} className="relative group/tab shrink-0 flex items-end">
              {editingListId === list.id ? (
                <input
                  autoFocus
                  value={editingListName}
                  onChange={(e) => setEditingListName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  className="px-3 py-2.5 text-sm font-medium bg-transparent border-b-2 border-indigo-500 text-stone-900 dark:text-stone-100 outline-none w-28"
                />
              ) : (
                <button
                  onClick={() => {
                    setActiveListId(list.id)
                    setShowCompleted(false)
                  }}
                  onDoubleClick={() => handleStartRename(list)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                    list.id === activeListId
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600',
                  ].join(' ')}
                >
                  {list.name}
                  {list.tasks.length > 0 && (
                    <span
                      className={[
                        'text-xs tabular-nums px-1.5 py-0.5 rounded-full font-normal',
                        list.id === activeListId
                          ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-500',
                      ].join(' ')}
                    >
                      {list.tasks.length}
                    </span>
                  )}
                </button>
              )}

              {editingListId !== list.id && list.id === activeListId && (
                <div className="relative inline-flex" ref={kebabListId === list.id ? kebabMenuRef : undefined}>
                  <button
                    onClick={() => setKebabListId(kebabListId === list.id ? null : list.id)}
                    aria-label="List options"
                    className="ml-0.5 p-1 -mr-1 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors rounded"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {kebabListId === list.id && (
                    <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 py-1">
                      <button
                        onClick={() => {
                          setKebabListId(null)
                          handleStartRename(list)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      >
                        <Pencil size={13} />
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setKebabListId(null)
                          handleDeleteList(list.id)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {list.id !== activeListId && editingListId !== list.id && (
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 items-center justify-center hidden group-hover/tab:flex hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-colors z-10"
                >
                  <X size={8} />
                </button>
              )}
            </div>
          ))}

          {addingList ? (
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onBlur={handleAddList}
              onKeyDown={handleNewListKeyDown}
              placeholder="List name…"
              className="px-3 py-2.5 text-sm font-medium bg-transparent border-b-2 border-indigo-400 text-stone-900 dark:text-stone-100 outline-none w-28 placeholder:text-stone-400 dark:placeholder:text-stone-600"
            />
          ) : (
            <button
              onClick={() => setAddingList(true)}
              className="flex items-center gap-1 px-3 py-2.5 text-sm text-stone-400 dark:text-stone-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors shrink-0 border-b-2 border-transparent"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Add list</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="py-8 max-w-2xl">
        {activeList ? (
          <>
            {/* New task input */}
            <div className="flex items-center gap-3 mb-8 group/input pb-3 border-b border-stone-100 dark:border-stone-800 focus-within:border-indigo-200 dark:focus-within:border-indigo-900 transition-colors">
              <div className="w-[18px] h-[18px] rounded-full border-2 border-stone-300 dark:border-stone-600 group-focus-within/input:border-indigo-400 transition-colors shrink-0" />
              <input
                ref={newTaskInputRef}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleNewTaskKeyDown}
                placeholder="Add a task…"
                className="flex-1 bg-transparent text-sm text-stone-700 dark:text-stone-300 placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none"
              />
              {newTaskTitle.trim() && (
                <button
                  onClick={handleAddTask}
                  className="text-xs font-medium text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950"
                >
                  Add ↵
                </button>
              )}
            </div>

            {activeList.tasks.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center">
                  <Plus size={18} className="text-stone-300 dark:text-stone-700" />
                </div>
                <p className="text-sm text-stone-400 dark:text-stone-600">
                  No tasks in <span className="font-medium text-stone-500 dark:text-stone-500">{activeList.name}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {activeList.tasks.map((task, index) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    taskIndex={index}
                    parentId={null}
                    onComplete={() => onCompleteTask?.(activeList.id, task.id)}
                    onEdit={(title) => onEditTask?.(activeList.id, task.id, title)}
                    onDelete={() => onDeleteTask?.(activeList.id, task.id)}
                    onCreateSubtask={(title) => onCreateSubtask?.(activeList.id, task.id, title)}
                    onCompleteSubtask={(subtaskId) => onCompleteSubtask?.(activeList.id, task.id, subtaskId)}
                    onUncompleteSubtask={(subtaskId) => onUncompleteSubtask?.(activeList.id, task.id, subtaskId)}
                    onEditSubtask={(subtaskId, title) => onEditSubtask?.(activeList.id, task.id, subtaskId, title)}
                    onDeleteSubtask={(subtaskId) => onDeleteSubtask?.(activeList.id, task.id, subtaskId)}
                    onUpdateDueDate={(date) => onUpdateDueDate?.(task.id, date)}
                    onMoveTask={onMoveTask}
                  />
                ))}
              </div>
            )}

            {activeList.completedTasks.length > 0 && (
              <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => setShowCompleted((v) => !v)}
                  className="flex items-center gap-2 text-xs font-medium text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
                >
                  {showCompleted ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                  <span>{activeList.completedTasks.length} completed</span>
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-500 text-xs font-normal tabular-nums">
                    {activeList.completedTasks.length}
                  </span>
                </button>

                {showCompleted && (
                  <div className="mt-3 space-y-0.5 opacity-60">
                    {activeList.completedTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        completed
                        onUncomplete={() => onUncompleteTask?.(activeList.id, task.id)}
                        onDelete={() => onDeleteTask?.(activeList.id, task.id)}
                        onCompleteSubtask={(subtaskId) => onCompleteSubtask?.(activeList.id, task.id, subtaskId)}
                        onUncompleteSubtask={(subtaskId) => onUncompleteSubtask?.(activeList.id, task.id, subtaskId)}
                        onEditSubtask={(subtaskId, title) => onEditSubtask?.(activeList.id, task.id, subtaskId, title)}
                        onDeleteSubtask={(subtaskId) => onDeleteSubtask?.(activeList.id, task.id, subtaskId)}
                        onUpdateDueDate={(date) => onUpdateDueDate?.(task.id, date)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-stone-400 dark:text-stone-600">
              Create a list to get started
            </p>
          </div>
        )}
      </div>

      {/* Delete list confirmation modal */}
      {confirmDeleteListId && (() => {
        const listToDelete = lists.find((l) => l.id === confirmDeleteListId)
        const taskCount = (listToDelete?.tasks.length ?? 0) + (listToDelete?.completedTasks.length ?? 0)
        return (
          <ConfirmDialog
            title={`Delete "${listToDelete?.name}"?`}
            message={`This will permanently delete ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'}. This can't be undone.`}
            onConfirm={() => {
              doDeleteList(confirmDeleteListId)
              setConfirmDeleteListId(null)
            }}
            onCancel={() => setConfirmDeleteListId(null)}
          />
        )
      })()}
    </div>
  )
}
