import { useState, useEffect, type JSX } from 'react';
import axios from 'axios';
import Sidebar from "../components/sidebar";
import { BACKEND_URL } from '../config';
import { CalendarDays, RefreshCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ApiTodo {
    _id: string;
    title: string;
    time: string;
    priority: 'urgent' | 'medium' | 'low';
    boardName: string;
    colorTheme: string;
    columnId: string;
}

interface ApiBoard {
    _id: string;
    name: string;
    colorTheme: string;
}

interface BoardsResponse {
    userBoards: ApiBoard[];
}

interface TodosResponse {
    todos: ApiTodo[];
}

interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: 'urgent' | 'medium' | 'low';
  boardName: string;
  boardColor: string;
  columnId: string;
}

interface SelectedDayTasks {
  day: number;
  tasks: Task[];
  date: Date;
}

export default function CalendarPage(): JSX.Element {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState<SelectedDayTasks | null>(null);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const transformTasks = (allTasks: any[]): Task[] => {
    return allTasks.map((task: any) => {
      const clockTime = new Date(task.time);

      const year = clockTime.getFullYear();
      const month = String(clockTime.getMonth() + 1).padStart(2, '0');
      const day = String(clockTime.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;

      const time = clockTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      return {
        id: task._id,
        title: task.title,
        date: date,
        time: time,
        priority: task.priority,
        boardName: task.boardName,
        boardColor: task.colorTheme, 
        columnId: task.columnId
      };
    });
  };

  const fetchTasks = async (): Promise<void> => {
    if (!currentUser) {
      console.log("No user logged in");
      return;
    }
    setIsLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const boardsResponse = await axios.get<BoardsResponse>(`${BACKEND_URL}/board/allBoards`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allTasks: any[] = [];
      for (const board of boardsResponse.data.userBoards) {
        try {
          const todosResponse = await axios.get<TodosResponse>(`${BACKEND_URL}/todo/board/${board._id}/todos`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const tasksWithBoard = todosResponse.data.todos.map((task: any) => ({
            ...task,
            boardName: board.name,
            colorTheme: board.colorTheme 
          }));

          allTasks.push(...tasksWithBoard);
        } catch (boardError) {
          console.warn(`Failed to fetch todos for board ${board.name}:`, boardError);
        }
      }

      const transformedTasks = transformTasks(allTasks);
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentDate.getMonth(), currentDate.getFullYear(), currentUser]);

  const monthNames: string[] = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentYear: number = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    yearOptions.push(i);
  }

  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year: number = date.getFullYear();
    const month: number = date.getMonth();
    const firstDay: Date = new Date(year, month, 1);
    const lastDay: Date = new Date(year, month + 1, 0);
    const daysInMonth: number = lastDay.getDate();
    const startingDayOfWeek: number = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getTasksForDate = (day: number | null): Task[] => {
    if (!day) return [];
    const dateString: string = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => task.date === dateString);
  };

  const handleDayClick = (day: number | null, dayTasks: Task[]): void => {
    if (day && dayTasks.length > 0) {
      setSelectedDayTasks({ day, tasks: dayTasks, date: currentDate });
      setShowTaskModal(true);
    }
  };

  const navigateMonth = (direction: number): void => {
    const newDate: Date = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleMonthChange = (monthIndex: number): void => {
    const newDate: Date = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
  };

  const handleYearChange = (year: number): void => {
    const newDate: Date = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
  };

  const goToToday = (): void => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    const today: Date = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const getPriorityColor = (priority: Task['priority']): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityBorder = (priority: Task['priority']): string => {
    switch (priority) {
      case 'urgent': return 'border-red-400';
      case 'medium': return 'border-amber-400';
      case 'low': return 'border-emerald-400';
      default: return 'border-slate-400';
    }
  };

  const getBoardColorDot = (boardColor: string): string => {
    const colorMap: { [key: string]: string } = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
      teal: 'bg-teal-500'
    };
    return colorMap[boardColor] || 'bg-slate-500';
  };

  const days: (number | null)[] = getDaysInMonth(currentDate);

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-slate-900">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col rounded-xl shadow-4xl m-3 bg-gradient-to-br from-[#1A204F] to-[#0D1538] overflow-auto">
          <div className="px-8 py-6 rounded-t-xl bg-gradient-to-br from-[#07081A] via-[#121A42] to-[#07081A] flex-shrink-0 ">
            <div className="flex items-center justify-between text-white">
              <div className="flex">
                <div className="w-16 h-16 mr-2">
                  <CalendarDays className="w-full h-full text-white"/>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">Unified Calendar</h1>
                  <p className="mt-1 text-slate-300">
                    All your tasks across {tasks.length > 0 ? `${new Set(tasks.map(t => t.boardName)).size} boards` : 'all boards'}
                    ({tasks.length} total tasks)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={fetchTasks}
                  disabled={isLoading}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50"
                  title="Refresh tasks"
                  type="button"
                >
                  <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}/>
                </button>

                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <select
                  value={currentDate.getMonth()}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleMonthChange(parseInt(e.target.value))}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {monthNames.map((month: string, index: number) => (
                    <option key={index} value={index} className="bg-slate-800 text-white">
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={currentDate.getFullYear()}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleYearChange(parseInt(e.target.value))}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map((year: number) => (
                    <option key={year} value={year} className="bg-slate-800 text-white">
                      {year}
                    </option>
                  ))}
                </select>

                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
                  type="button"
                >
                  Today
                </button>

                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full bg-slate-800/50 overflow-auto backdrop-blur-sm rounded-xl p-4 flex flex-col border border-slate-600 ">
              <div className="grid grid-cols-7 gap-2 mb-4 flex-shrink-0">
                {dayNames.map((day: string) => (
                  <div key={day} className="text-center text-slate-300 font-semibold py-2 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 flex-1" style={{ gridTemplateRows: 'repeat(6,minmax(1fr))' }}>
                {days.map((day: number | null, index: number) => {
                  const dayTasks: Task[] = getTasksForDate(day);
                  const todayClass: string = isToday(day) ? 'bg-blue-500/20 ring-2 ring-blue-400/50' : '';
                  const hasTasksClass: string = dayTasks.length > 0 ? 'cursor-pointer hover:bg-slate-700/50' : 'cursor-default';

                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(day, dayTasks)}
                      className={`
                        bg-slate-700/30 rounded-lg p-2 border border-slate-600
                        transition-colors flex flex-col overflow-hidden
                        ${todayClass} ${hasTasksClass}
                      `}
                    >
                      {day && (
                        <>
                          <div className="text-slate-200 font-medium text-sm mb-1 flex-shrink-0">
                            {day}
                          </div>
                          <div className="flex-1 space-y-1 overflow-hidden">
                            {dayTasks.slice(0, 2).map((task: Task) => (
                              <div
                                key={task.id}
                                className="text-xs bg-slate-600/60 rounded px-1 py-1 text-slate-200 truncate border-l-2"
                                style={{ borderLeftColor: getBoardColorDot(task.boardColor).replace('bg-', '#') }}
                                title={`${task.title} - ${task.time} (${task.boardName})`}
                              >
                                <div className="flex items-center gap-1">
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}></div>
                                  <span className="truncate text-xs">{task.title}</span>
                                </div>
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-slate-400 px-1 hover:text-slate-300 transition-colors">
                                +{dayTasks.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {showTaskModal && selectedDayTasks && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto border border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Tasks for {monthNames[selectedDayTasks.date.getMonth()]} {selectedDayTasks.day}, {selectedDayTasks.date.getFullYear()}
                </h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-slate-400 hover:text-white p-1 transition-colors"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {selectedDayTasks.tasks
                  .sort((a: Task, b: Task) => a.time.localeCompare(b.time))
                  .map((task: Task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg bg-slate-700/50 border-l-4 ${getPriorityBorder(task.priority)} border border-slate-600`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white text-lg">{task.title}</h4>
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`}></div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 text-sm font-medium">⏰ {task.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getBoardColorDot(task.boardColor)}`}></div>
                          <span className="text-slate-300 text-sm font-medium">{task.boardName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs capitalize">
                            🏷️ {task.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {selectedDayTasks.tasks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks for this day</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}