import { useEffect, useState } from 'react'
import './App.css'
import {
  Waves,
  Check,
  Clock3,
  Plus,
  Pencil,
  StickyNote,
  Trash2,
  Save,
  X,
  CalendarDays,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editDueDate, setEditDueDate] = useState('')

  const [editingNote, setEditingNote] = useState(null)
  const [noteText, setNoteText] = useState('')

  // Add task
  const addTask = () => {
    if (!newTask.trim()) return

    fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newTask.trim(),
        completed: false,
        priority,
        due_date: dueDate || null,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add task')
        }

        return response.json()
      })
      .then(data => {
        setTasks(prev => [...prev, data[0]])
        setNewTask('')
        setPriority('medium')
        setDueDate('')
      })
      .catch(error => {
        console.error('Error adding task:', error)
      })
  }

  // Toggle task
  const toggleTask = (task) => {
    fetch(
      `${API_URL}/task/${task.id}?completed=${!task.completed}`,
      {
        method: 'PATCH',
      }
    )
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update task')
        }

        return response.json()
      })
      .then(data => {
        setTasks(prev =>
          prev.map(t =>
            t.id === task.id ? data[0] : t
          )
        )
      })
      .catch(error => {
        console.error('Error updating task:', error)
      })
  }

  // Delete task
  const deleteTask = (task) => {
    fetch(`${API_URL}/task/${task.id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete task')
        }

        return response.json()
      })
      .then(() => {
        setTasks(prev =>
          prev.filter(t => t.id !== task.id)
        )
      })
      .catch(error => {
        console.error('Error deleting task:', error)
      })
  }

  // Start editing
  const startEditing = (task) => {
    setEditingTask(task.id)
    setEditTitle(task.title)
    setEditPriority(task.priority || 'medium')
    setEditDueDate(
      task.due_date
        ? String(task.due_date).split('T')[0]
        : ''
    )

    setEditingNote(null)
    setNoteText('')
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingTask(null)
    setEditTitle('')
    setEditPriority('medium')
    setEditDueDate('')
  }

  // Save task edit
  const saveTaskEdit = (taskId) => {
    if (!editTitle.trim()) return

    fetch(`${API_URL}/task/${taskId}/edit`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: editTitle.trim(),
        priority: editPriority,
        due_date: editDueDate || null,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to edit task')
        }

        return response.json()
      })
      .then(data => {
        setTasks(prev =>
          prev.map(task =>
            task.id === taskId ? data[0] : task
          )
        )

        cancelEditing()
      })
      .catch(error => {
        console.error('Error editing task:', error)
      })
  }

  // Start note editing
  const startNote = (task) => {
    setEditingNote(task.id)
    setNoteText(task.note || '')
    setEditingTask(null)
  }

  // Cancel note editing
  const cancelNote = () => {
    setEditingNote(null)
    setNoteText('')
  }

  // Save note
  const saveNote = (task) => {
    fetch(
      `${API_URL}/task/${task.id}/note?note=${encodeURIComponent(noteText)}`,
      {
        method: 'PATCH',
      }
    )
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save note')
        }

        return response.json()
      })
      .then(data => {
        setTasks(prev =>
          prev.map(t =>
            t.id === task.id ? data[0] : t
          )
        )

        setEditingNote(null)
        setNoteText('')
      })
      .catch(error => {
        console.error('Error saving note:', error)
      })
  }

  // Load tasks
  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }

        return response.json()
      })
      .then(data => setTasks(data))
      .catch(error => {
        console.error('Error fetching tasks:', error)
      })
  }, [])

  const completedTasks = tasks.filter(
    task => task.completed
  ).length

  const activeTasks = tasks.length - completedTasks

  const formatDueDate = (date) => {
    if (!date) return null

    const dateOnly = String(date).split('T')[0]
    const formattedDate = new Date(`${dateOnly}T00:00:00`)

    if (Number.isNaN(formattedDate.getTime())) {
      return null
    }

    return formattedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="app-container">

      <header className="app-header">
        <div>
          <span className="eyebrow">
            YOUR WORKSPACE
          </span>

          <h1>Tideflow</h1>

          <p>
            Find your rhythm. Make progress.
          </p>
        </div>

        <div className="header-decoration">
          <Waves size={23} strokeWidth={1.7} />
        </div>
      </header>

      <div className="dashboard">

        <aside className="sidebar">

          <div className="sidebar-heading">
            <span>Your Flow</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Check size={18} strokeWidth={2} />
            </div>

            <div>
              <span className="stat-number">
                {tasks.length}
              </span>

              <span className="stat-label">
                Total tasks
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <Check size={18} strokeWidth={2} />
            </div>

            <div>
              <span className="stat-number">
                {completedTasks}
              </span>

              <span className="stat-label">
                Completed
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Clock3 size={18} strokeWidth={2} />
            </div>

            <div>
              <span className="stat-number">
                {activeTasks}
              </span>

              <span className="stat-label">
                In progress
              </span>
            </div>
          </div>

          <div className="sidebar-message">
            <span>
              <Waves size={15} strokeWidth={1.8} />
            </span>

            <p>
              Small steps every day
              lead to big results.
            </p>
          </div>

        </aside>

        <main className="task-section">

          <div className="section-heading">
            <div>
              <span className="section-label">
                CURRENT FLOW
              </span>

              <h2>Your Tasks</h2>

              <p>
                Keep track of what needs to move forward.
              </p>
            </div>

            <div className="task-count">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          <div className="task-input">

            <div className="task-input-main">

              <input
                type="text"
                placeholder="What needs to move forward?"
                value={newTask}
                onChange={(event) =>
                  setNewTask(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    addTask()
                  }
                }}
              />

              <button
                className="add-button"
                onClick={addTask}
              >
                <Plus size={17} strokeWidth={2} />
                Add Task
              </button>

            </div>

            <div className="task-input-options">

              <div className="priority-control">

                <span className="input-option-label">
                  Priority
                </span>

                <div className="priority-options">

                  <button
                    type="button"
                    className={
                      priority === 'low'
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setPriority('low')
                    }
                  >
                    Low
                  </button>

                  <button
                    type="button"
                    className={
                      priority === 'medium'
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setPriority('medium')
                    }
                  >
                    Medium
                  </button>

                  <button
                    type="button"
                    className={
                      priority === 'high'
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setPriority('high')
                    }
                  >
                    High
                  </button>

                </div>

              </div>

              <div className="due-date-control">

                <span className="input-option-label">
                  Due date
                </span>

                <div className="date-picker">

                  <CalendarDays
                    size={15}
                    strokeWidth={1.8}
                  />

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => {
                      setDueDate(event.target.value)
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="task-list">

            {tasks.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  <Check
                    size={24}
                    strokeWidth={1.8}
                  />
                </div>

                <h3>No tasks yet</h3>

                <p>
                  Add your first task above
                  and start getting things done.
                </p>

              </div>

            ) : (

              tasks.map(task => (

                <div
                  key={task.id}
                  className={`task-card ${
                    task.completed ? 'completed' : ''
                  }`}
                >

                  <div className="task-main">

                    <div className="task-indicator">
                      {task.completed && (
                        <Check
                          size={16}
                          strokeWidth={2.2}
                        />
                      )}
                    </div>

                    <div className="task-info">

                      {editingTask === task.id ? (

                        <div className="task-edit-form">

                          <input
                            className="task-edit-title"
                            type="text"
                            value={editTitle}
                            onChange={(event) =>
                              setEditTitle(
                                event.target.value
                              )
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                saveTaskEdit(task.id)
                              }

                              if (event.key === 'Escape') {
                                cancelEditing()
                              }
                            }}
                            autoFocus
                          />

                          <div className="task-edit-options">

                            <div className="priority-control">

                              <span className="input-option-label">
                                Priority
                              </span>

                              <div className="priority-options">

                                <button
                                  type="button"
                                  className={
                                    editPriority === 'low'
                                      ? 'selected'
                                      : ''
                                  }
                                  onClick={() =>
                                    setEditPriority('low')
                                  }
                                >
                                  Low
                                </button>

                                <button
                                  type="button"
                                  className={
                                    editPriority === 'medium'
                                      ? 'selected'
                                      : ''
                                  }
                                  onClick={() =>
                                    setEditPriority('medium')
                                  }
                                >
                                  Medium
                                </button>

                                <button
                                  type="button"
                                  className={
                                    editPriority === 'high'
                                      ? 'selected'
                                      : ''
                                  }
                                  onClick={() =>
                                    setEditPriority('high')
                                  }
                                >
                                  High
                                </button>

                              </div>

                            </div>

                            <div className="due-date-control">

                              <span className="input-option-label">
                                Due date
                              </span>

                              <div className="date-picker">

                                <CalendarDays
                                  size={15}
                                  strokeWidth={1.8}
                                />

                                <input
                                  type="date"
                                  value={editDueDate}
                                  onChange={(event) =>
                                    setEditDueDate(
                                      event.target.value
                                    )
                                  }
                                />

                              </div>

                            </div>

                          </div>

                          <div className="task-edit-actions">

                            <button
                              className="save-edit-button"
                              onClick={() =>
                                saveTaskEdit(task.id)
                              }
                            >
                              <Save
                                size={14}
                                strokeWidth={2}
                              />
                              Save changes
                            </button>

                            <button
                              className="cancel-edit-button"
                              onClick={cancelEditing}
                            >
                              <X
                                size={14}
                                strokeWidth={2}
                              />
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        <>

                          <h3>
                            {task.title}
                          </h3>

                          <div className="task-meta">

                            <span
                              className={`priority-badge ${
                                task.priority || 'medium'
                              }`}
                            >
                              {task.priority === 'high'
                                ? 'High'
                                : task.priority === 'low'
                                  ? 'Low'
                                  : 'Medium'}
                            </span>

                            {task.due_date && (
                              <span className="due-date">

                                <CalendarDays
                                  size={13}
                                  strokeWidth={1.8}
                                />

                                {formatDueDate(
                                  task.due_date
                                )}

                              </span>
                            )}

                            <span
                              className={
                                task.completed
                                  ? 'status completed-status'
                                  : 'status'
                              }
                            >
                              {task.completed
                                ? 'Completed'
                                : 'In progress'}
                            </span>

                          </div>

                        </>

                      )}

                      {editingTask !== task.id && (
                        <>
                          {task.note &&
                            editingNote !== task.id && (
                              <div className="saved-note">

                                <span className="note-icon">
                                  <StickyNote
                                    size={14}
                                    strokeWidth={1.8}
                                  />
                                </span>

                                <span>
                                  {task.note}
                                </span>

                              </div>
                            )}

                          {editingNote === task.id ? (

                            <div className="note-editor">

                              <textarea
                                value={noteText}
                                onChange={(event) =>
                                  setNoteText(
                                    event.target.value
                                  )
                                }
                                placeholder="Add a small note about this task..."
                                rows="3"
                                autoFocus
                              />

                              <div className="note-actions">

                                <button
                                  className="save-note-button"
                                  onClick={() =>
                                    saveNote(task)
                                  }
                                >
                                  <Save
                                    size={14}
                                    strokeWidth={2}
                                  />
                                  Save Note
                                </button>

                                <button
                                  className="cancel-note-button"
                                  onClick={cancelNote}
                                >
                                  <X
                                    size={14}
                                    strokeWidth={2}
                                  />
                                  Cancel
                                </button>

                              </div>

                            </div>

                          ) : (

                            <button
                              className="note-button"
                              onClick={() =>
                                startNote(task)
                              }
                            >
                              {task.note ? (
                                <>
                                  <Pencil
                                    size={14}
                                    strokeWidth={1.9}
                                  />
                                  Edit note
                                </>
                              ) : (
                                <>
                                  <Plus
                                    size={14}
                                    strokeWidth={1.9}
                                  />
                                  Add note
                                </>
                              )}
                            </button>

                          )}
                        </>
                      )}

                    </div>

                  </div>

                  <div className="task-actions">

                    {editingTask !== task.id && (
                      <button
                        className="edit-task-button"
                        onClick={() => startEditing(task)}
                        aria-label="Edit task"
                        title="Edit task"
>
                        <Pencil size={16} strokeWidth={1.9} />
                      </button>
                    )}

                    <button
                      className="complete-button"
                      onClick={() => toggleTask(task)}
                    >
                      {task.completed ? (
                        <>
                        Mark Incomplete
                          <X
                            size={15}
                            strokeWidth={2}
                          />
                        </>
                      ) : (
                        <>
                          Mark Complete
                          <Check
                            size={15}
                            strokeWidth={2}
                          />
                        </>
                      )}
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteTask(task)
                      }
                    >
                      <Trash2
                        size={15}
                        strokeWidth={1.9}
                      />
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </main>

      </div>

    </div>
  )
}

export default App