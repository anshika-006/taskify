import { Flag, FileText, X, BookType, ClipboardPenLine, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface Todo {
    _id: string;
    title: string;
    description: string;
    time: string;
    type: string;
    priority: "low" | "medium" | "urgent";
    columnId: string;
    boardId: string;
    position?: number;
}

interface TodoResponse {
    msg: string;
    todo: Todo;
}

interface TodoFormProps {
    boardId: string;
    onClose: () => void;
    onTodoAdded: (todo: Todo) => void;
}

interface BoardColumn {
    id: string;
    name: string;
}

interface BoardResponse {
    board: {
        columns: BoardColumn[];
    };
}

export default function TodoForm({ boardId, onClose, onTodoAdded }: TodoFormProps) {
    const { currentUser } = useAuth();
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [month, setMonth] = useState<Date>(today);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [type, setType] = useState('');
    const [clockTime, setClockTime] = useState('');
    const [ap, setAp] = useState('AM');
    const [columnId, setColumnId] = useState('');
    const [availableColumns, setAvailableColumns] = useState<BoardColumn[]>([]);

    useEffect(() => {
        async function fetchBoardColumns() {
            if (!currentUser) {
                console.log("No user logged in");
                return;
            }

            try {
                const token = await currentUser.getIdToken();
                const response = await axios.get<BoardResponse>(`${BACKEND_URL}/board/oneBoard/${boardId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const board = response.data.board;
                setAvailableColumns(board.columns);
                if (board.columns.length > 0) {
                    setColumnId(board.columns[0].id);
                }
            } catch (e) {
                console.error('Error fetching board columns:', e);
            }
        }

        if (boardId && currentUser) {
            fetchBoardColumns();
        }
    }, [boardId, currentUser]);

    const handleTodayClick = () => {
        setSelectedDate(today);
        setMonth(today);
    };

    const formattedDate = selectedDate ? format(selectedDate, 'dd-MM-yyyy') : '';

    const handleSubmit = async () => {
        if (!currentUser) {
            console.log("No user logged in");
            return;
        }

        if (!formattedDate || !clockTime || !ap) {
            console.error("Missing date/time");
            alert("Please select date and time");
            return;
        }

        const [date, monthStr, year] = formattedDate.split("-").map(Number);
        let [hour, minute] = clockTime.split(":").map(Number);

        if (isNaN(date) || isNaN(monthStr) || isNaN(year) || isNaN(hour) || isNaN(minute)) {
            alert("Please fill in the correct date and time format");
            return;
        }

        if (ap === "PM" && hour < 12) hour += 12;
        if (ap === "AM" && hour === 12) hour = 0;

        const time = new Date(year, monthStr - 1, date, hour, minute);

        if (!title || !description || !time || !priority || !type || !columnId) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post<TodoResponse>(`${BACKEND_URL}/todo/add`, {
                title,
                description,
                time,
                type,
                priority,
                columnId,
                boardId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const addedTodo = response.data.todo;
            onTodoAdded(addedTodo);
            onClose();
        } catch (e) {
            console.log(e);
            alert("todo can't be added");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-3xl transform transition-all duration-300 hover:shadow-2xl flex flex-col max-h-[95vh]">
                <div onClick={onClose} className=' font-black flex justify-end cursor-pointer text-xl text-red-500'>
                    <X />
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Todo</h2>
                    <p className="text-gray-600">Add a new task to your list</p>
                </div>

                <div className='flex gap-4 overflow-y-auto scrollbar scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                    <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <ClipboardPenLine className="w-4 h-4 mr-2 text-indigo-600" />
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Add more details about your task..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder-gray-400 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <BookType className="w-4 h-4 mr-2 text-indigo-600" />
                                Type
                            </label>
                            <input
                                type="text"
                                name="type"
                                value={type}
                                onChange={e => setType(e.target.value)}
                                placeholder="What kind of task"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Flag className="w-4 h-4 mr-2 text-indigo-600" />
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                            >
                                <option value="" disabled>low/medium/urgent</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <ClipboardPenLine className="w-4 h-4 mr-2 text-indigo-600" />
                                Column
                            </label>
                            <select
                                name="columnId"
                                value={columnId}
                                onChange={e => setColumnId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                            >
                                <option value="" disabled>Select column</option>
                                {availableColumns.map((column) => (
                                    <option key={column.id} value={column.id}>
                                        {column.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='flex-1'>
                        <div className="space-y-2 ">
                            <div className='flex'>
                                <label className="flex items-center text-lg font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                                    Day/Time
                                </label>
                                <div className='ml-auto'>
                                    <button onClick={handleTodayClick}
                                        className='rounded-lg bg-blue-100 p-1 px-3 text-md border border-blue-600'
                                    >Today</button>
                                </div>
                            </div>
                            <div className='mb-20'>
                                <DayPicker
                                    mode="single"
                                    required
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    month={month}
                                    onMonthChange={setMonth}
                                    weekStartsOn={0}
                                    captionLayout="dropdown"
                                    startMonth={new Date()}
                                    endMonth={new Date(2075, 0)}
                                    styles={{
                                        caption: { color: "white" },
                                        day: { color: "black" },
                                        head_cell: { color: "#2e60b6ff" }
                                    }}
                                />
                                <div className="mt-4 space-y-2">
                                    {selectedDate && (
                                        <p className="text-white">
                                            Selected Date: {formattedDate}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className='flex gap-2 mt-auto'>
                                <div className='flex-1'>
                                    <input
                                        name="day"
                                        value={formattedDate}
                                        placeholder="Day"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg duration-200 placeholder-gray-400 resize-none"
                                        readOnly
                                    />
                                </div>
                                <div className='flex flex-1'>
                                    <input
                                        name="time"
                                        value={clockTime}
                                        onChange={e => setClockTime(e.target.value)}
                                        placeholder="12:00"
                                        className="w-full px-4 py-3 border border-gray-300 border-r-0  rounded-l-lg outline-none duration-200 placeholder-gray-400 resize-none"
                                    />
                                    <select name='am/pm' value={ap} onChange={e => setAp(e.target.value)} className='border border-gray-300 color-gray-700 text-md rounded-r-lg'>
                                        <option value='AM'>AM</option>
                                        <option value='PM'>PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-4 mt-3">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Create Todo
                    </button>
                </div>
            </div>
        </div>
    );
}