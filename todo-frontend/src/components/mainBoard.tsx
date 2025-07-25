import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import {
  ListTodo, Clock, Eye, CheckCircle, FileText, Code, TestTube, Rocket, Lightbulb, Palette,
  BookOpen, ShoppingCart, Home, Dumbbell, Target, Plus, PanelsTopLeft, GraduationCap, Briefcase, Heart
} from 'lucide-react';

import Sidebar from './sidebar';
import TodoForm from './modal';
import TodoCard from './todo';
import UpdateModal from './modalupdate';
import { BACKEND_URL } from '../config';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';

interface TodoItem {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "urgent";
  time: string;
  type: string;
  columnId: string;
  boardId: string;
  position?: number;
}

interface Column {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  items: TodoItem[];
}

interface BoardData {
  _id: string;
  name: string;
  columns: { id: string; name: string }[];
  colorTheme: string;
}

const getIconForColumn = (columnId: string) => {
    const iconMap: { [key: string]: any } = { 'todo': ListTodo, 'inprogress': Clock, 'underreview': Eye, 'finished': CheckCircle, 'onhold': Clock, 'completed': CheckCircle, 'backlog': FileText, 'development': Code, 'testing': TestTube, 'deployed': Rocket, 'ideas': Lightbulb, 'sketching': Palette, 'creating': Palette, 'published': Rocket, 'learning': BookOpen, 'practicing': Code, 'mastered': CheckCircle, 'need': ListTodo, 'researching': Eye, 'cart': ShoppingCart, 'purchased': CheckCircle, 'shopping': ShoppingCart, 'cooking': Home, 'cleaning': Home, 'done': CheckCircle, 'goals': Target, 'training': Dumbbell, 'recovery': Clock, 'achieved': CheckCircle };
    return iconMap[columnId] || ListTodo;
};

const getIconColor = (columnId: string) => {
  const colorMap: { [key: string]: string } = { 'todo': 'text-blue-600', 'inprogress': 'text-orange-500', 'underreview': 'text-purple-600', 'finished': 'text-green-600', 'onhold': 'text-gray-500', 'completed': 'text-green-600', 'backlog': 'text-gray-600', 'development': 'text-blue-600', 'testing': 'text-orange-500', 'deployed': 'text-green-600', 'ideas': 'text-yellow-500', 'sketching': 'text-orange-500', 'creating': 'text-red-500', 'published': 'text-green-600', 'need': 'text-red-500', 'researching': 'text-blue-500', 'cart': 'text-orange-500', 'purchased': 'text-green-600', 'shopping': 'text-blue-500', 'cooking': 'text-orange-500', 'cleaning': 'text-purple-500', 'done': 'text-green-600', 'goals': 'text-blue-600', 'training': 'text-orange-500', 'recovery': 'text-purple-500', 'achieved': 'text-green-600' };
  return colorMap[columnId] || 'text-blue-600';
};

const getIconBg = (columnId: string) => {
  const bgMap: { [key: string]: string } = { 'todo': 'bg-blue-50', 'inprogress': 'bg-orange-50', 'underreview': 'bg-purple-50', 'finished': 'bg-green-50', 'onhold': 'bg-gray-50', 'completed': 'bg-green-50', 'backlog': 'bg-gray-50', 'development': 'bg-blue-50', 'testing': 'bg-orange-50', 'deployed': 'bg-green-50', 'ideas': 'bg-yellow-50', 'sketching': 'bg-orange-50', 'creating': 'bg-red-50', 'published': 'bg-green-50', 'need': 'bg-red-50', 'researching': 'bg-blue-50', 'cart': 'bg-orange-50', 'purchased': 'bg-green-50', 'shopping': 'bg-blue-50', 'cooking': 'text-orange-500', 'cleaning': 'text-purple-500', 'done': 'bg-green-50', 'goals': 'bg-blue-50', 'training': 'text-orange-500', 'recovery': 'text-purple-500', 'achieved': 'text-green-50' };
  return bgMap[columnId] || 'bg-blue-50';
};

const getBorderColor = (columnId: string) => {
  const borderMap: { [key: string]: string } = { 'todo': 'border-blue-200', 'inprogress': 'border-orange-200', 'underreview': 'border-purple-200', 'finished': 'border-green-200', 'onhold': 'border-gray-200', 'completed': 'border-green-200', 'backlog': 'border-gray-200', 'development': 'border-blue-200', 'testing': 'border-orange-200', 'deployed': 'border-green-200', 'ideas': 'border-yellow-200', 'sketching': 'border-orange-200', 'creating': 'border-red-200', 'published': 'border-green-200', 'need': 'border-red-200', 'researching': 'border-blue-200', 'cart': 'border-orange-200', 'purchased': 'border-green-200', 'shopping': 'border-blue-200', 'cooking': 'text-orange-500', 'cleaning': 'text-purple-500', 'done': 'text-green-200', 'goals': 'border-blue-200', 'training': 'text-orange-500', 'recovery': 'text-purple-500', 'achieved': 'text-green-600' };
  return borderMap[columnId] || 'border-blue-200';
};

const getBoardGradient = (colorTheme: string) => {
  const gradients: { [key: string]: string } = { purple: 'bg-[linear-gradient(135deg,_#3f0d7e_0%,_#b83280_100%)]', blue: 'bg-[linear-gradient(135deg,_#090979_0%,_#0398D7_100%)]', green: 'bg-[linear-gradient(135deg,_#173817_0%,_#15AD33_100%)]', orange: 'bg-[linear-gradient(135deg,_#A33612_0%,_#FF8800_100%)]', red: 'bg-[linear-gradient(135deg,_#750000_0%,_#FF4C38_100%)]', pink: 'bg-[linear-gradient(135deg,_#7A0B55_0%,_#FF19C6_100%)]', teal: 'bg-[linear-gradient(135deg,_#154238_0%,_#03A194_100%)]' };
  return gradients[colorTheme] || gradients.purple;
};

const getHeaderGradient = (colorTheme: string) => {
  const headerGradients: { [key: string]: string } = { purple: 'bg-[linear-gradient(135deg,_#2d0a5c_0%,_#8f2766_100%)]', blue: 'bg-[linear-gradient(135deg,_#02124D_0%,_#1e40af_100%)]', green: 'bg-[linear-gradient(135deg,_#122B12_0%,_#03801C_100%)]', orange: 'bg-[linear-gradient(135deg,_#7c2d12_0%,_#ea580c_100%)]', red: 'bg-[linear-gradient(135deg,_#540101_0%,_#C41400_100%)]', pink: 'bg-[linear-gradient(135deg,_#40002C_0%,_#A3087C_100%)]', teal: 'bg-[linear-gradient(135deg,_#0c2825_0%,_#0f766e_100%)]' };
  return headerGradients[colorTheme] || headerGradients.purple;
};

const addTaskColor = (colorTheme: string) => {
  const addColor: { [key: string]: string } = { purple: 'bg-purple-900', blue: 'bg-[#090979]', green: 'bg-green-900', orange: 'bg-orange-800', red: 'bg-red-900', pink: 'bg-pink-800', teal: 'bg-teal-900' };
  return addColor[colorTheme] || addColor.purple;
};

const getTemplateIcon = (colorTheme: string) => {
  const icons: { [key: string]: React.ComponentType<any> } = { purple: PanelsTopLeft, blue: GraduationCap, green: Briefcase, orange: Lightbulb, red: ShoppingCart, pink: Home, teal: Heart };
  return icons[colorTheme] || icons.purple;
};

interface MainBoardProps {
  boardId: string;
  showModal: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

export default function MainBoard({ boardId, showModal, onCloseModal, onOpenModal }: MainBoardProps) {
  const [columns, setColumns] = useState<Record<string, Column>>({});
  const [updateTodo, setUpdateTodo] = useState<TodoItem | null>(null);
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const { currentUser } = useAuth();
  const { searchTerm, priorityFilters } = useSearch();

  useEffect(() => {
    async function fetchBoardData() {
      if (!currentUser || !boardId) return;
      try {
        const token = await currentUser.getIdToken();
        const [boardRes, todosRes] = await Promise.all([
          axios.get<{ board: BoardData }>(`${BACKEND_URL}/board/oneBoard/${boardId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<{ todos: TodoItem[] }>(`${BACKEND_URL}/todo/board/${boardId}/todos`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const board = boardRes.data.board;
        const todos = todosRes.data.todos;
        setBoardData(board);
        const newColumns: Record<string, Column> = {};
        board.columns.forEach(col => {
          newColumns[col.id] = {
            id: col.id, title: col.name, icon: getIconForColumn(col.id),
            iconColor: getIconColor(col.id), iconBg: getIconBg(col.id),
            borderColor: getBorderColor(col.id),
            items: todos.filter((todo: TodoItem) => todo.columnId === col.id)
          };
        });
        setColumns(newColumns);
      } catch (err) {
        console.error('Error fetching board data:', err);
      }
    }
    fetchBoardData();
  }, [boardId, currentUser]);

  const handleTodoAdded = (todo: TodoItem) => {
    setColumns(prev => {
      const col = prev[todo.columnId];
      if (!col) return prev;
      return { ...prev, [todo.columnId]: { ...col, items: [todo, ...col.items] } };
    });
  };

  const handleTodoUpdated = (updated: TodoItem) => {
    setColumns(prev => {
      const newCols = { ...prev };
      Object.values(newCols).forEach(col => {
        col.items = col.items.filter(t => t._id !== updated._id);
      });
      if (newCols[updated.columnId]) {
        newCols[updated.columnId].items.unshift(updated);
      }
      return newCols;
    });
  };

  const handleTodoDeleted = (id: string, columnId: string) => {
    setColumns(prev => {
      const col = prev[columnId];
      if (!col) return prev;
      return { ...prev, [columnId]: { ...col, items: col.items.filter(t => t._id !== id) } };
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !currentUser) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const startCol = columns[source.droppableId];
    const finishCol = columns[destination.droppableId];
    if (startCol === finishCol) {
      const newItems = Array.from(startCol.items);
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);
      const newCol = { ...startCol, items: newItems };
      setColumns({ ...columns, [newCol.id]: newCol });
      return;
    }
    const startItems = Array.from(startCol.items);
    const [movedItem] = startItems.splice(source.index, 1);
    const finishItems = Array.from(finishCol.items);
    finishItems.splice(destination.index, 0, movedItem);
    setColumns({
      ...columns,
      [startCol.id]: { ...startCol, items: startItems },
      [finishCol.id]: { ...finishCol, items: finishItems },
    });
    try {
      const token = await currentUser.getIdToken();
      await axios.put(`${BACKEND_URL}/todo/updateColumn/${draggableId}`,
        { columnId: destination.droppableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert("Failed to move task. Reverting changes.");
      setColumns(prev => ({ ...prev, [startCol.id]: startCol, [finishCol.id]: finishCol }));
    }
  };

  const filteredColumns = useMemo(() => {
    if (!columns || Object.keys(columns).length === 0) {
      return {};
    }
    const filteredEntries = Object.entries(columns).map(([columnId, columnData]) => {
      let items = columnData.items;
      if (priorityFilters.length > 0) {
        items = items.filter(item => priorityFilters.includes(item.priority));
      }
      if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        items = items.filter(item =>
          item.title.toLowerCase().includes(lowercasedTerm) ||
          item.description.toLowerCase().includes(lowercasedTerm)
        );
      }
      return [columnId, { ...columnData, items }];
    });
    return Object.fromEntries(filteredEntries) as Record<string, Column>;
  }, [searchTerm, priorityFilters, columns]);

  const IconComponent = getTemplateIcon(boardData?.colorTheme || '');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      <div className={`flex-1 min-w-0 rounded-xl shadow m-3 ${getBoardGradient(boardData?.colorTheme || '')} overflow-hidden`}>
        <div className={`overflow-hidden px-8 py-6 ${getHeaderGradient(boardData?.colorTheme || '')}`}>
          <div className="flex overflow-y-hidden items-center justify-between text-white">
            <div className="flex items-center">
              <div className="w-16 h-16 mr-4">
                {IconComponent && <IconComponent className="w-full h-full" />}
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">{boardData?.name || 'Loading...'}</h1>
                <p className="mt-1">Manage your tasks efficiently</p>
              </div>
            </div>
            <button
              onClick={onOpenModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${addTaskColor(boardData?.colorTheme || '')}`}
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto">
            <div className="flex h-full gap-6 p-6" style={{ minWidth: 'fit-content' }}>
              <DragDropContext onDragEnd={handleDragEnd}>
                {Object.values(filteredColumns).map((column) => {
                  const ColumnIcon = column.icon;
                  return (
                    <div
                      key={column.id}
                      className="flex flex-col w-80 rounded-xl flex-shrink-0 shadow-xl"
                      style={{ height: 'calc(100vh - 180px)' }}
                    >
                      <div className="flex items-center gap-3 p-5 pb-4 border-b text-white flex-shrink-0 bg-[#1d2024] rounded-t-lg">
                        <div className={`w-10 h-10 ${column.iconBg} rounded-xl flex items-center justify-center`}>
                          <ColumnIcon className={`w-5 h-5 ${column.iconColor}`} />
                        </div>
                        <h2 className="text-lg font-semibold flex-1">{column.title}</h2>
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-900">
                            {column.items.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto overflow-x-hidden text-white custom-scrollbar bg-[#1d2024] rounded-b-lg">
                        <div className="p-4 h-full">
                          <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`flex flex-col gap-3 transition-all duration-300 ${snapshot.isDraggingOver
                                    ? `bg-muted/20 rounded-lg p-3 ${column.borderColor} border-2 border-dashed min-h-full`
                                    : 'min-h-full'
                                  }`}
                              >
                                {column.items.map((item, index) => (
                                  <Draggable key={item._id} draggableId={item._id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`transition-all duration-300 ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg z-50' : 'hover:shadow-md'}`}
                                        style={{
                                          ...provided.draggableProps.style,
                                          transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} rotate(2deg)` : provided.draggableProps.style?.transform
                                        }}
                                      >
                                        <TodoCard
                                          todo={item}
                                          onTodoUpdated={handleTodoUpdated}
                                          onTodoDeleted={({ todoId, columnId }) => handleTodoDeleted(todoId, columnId)}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {column.items.length === 0 && !snapshot.isDraggingOver && (
                                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <ColumnIcon className="w-12 h-12 mb-3 opacity-30" />
                                    <p className="text-sm font-medium">No tasks yet</p>
                                    <p className="text-xs opacity-60 mt-1">Drag tasks here or create new ones</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <TodoForm
          boardId={boardId}
          onClose={onCloseModal}
          onTodoAdded={handleTodoAdded}
        />
      )}
      {updateTodo && (
        <UpdateModal
          onClose={() => setUpdateTodo(null)}
          todo={updateTodo}
          onTodoUpdated={handleTodoUpdated}
        />
      )}
    </div>
  );
}