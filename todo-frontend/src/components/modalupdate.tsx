import { BookType, Calendar, ClipboardPenLine, FileText, Flag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../config';
import axios from 'axios';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { useAuth } from '../contexts/AuthContext'; // ✅ Add this import

interface Todo {
    _id: string;
    title: string;
    description: string;
    time: string;
    type: string;
    priority: string;
    columnId: string;
    boardId: string;
    position?: number;
}

interface TodoResponse {
    msg: string;
    todo: Todo;
}

interface UpdateModalProps {
    onClose: () => void;
    todo: Todo;
    onTodoUpdated: (updatedTodo: Todo) => void;
}

export default function UpdateModal({ onClose, todo, onTodoUpdated }: UpdateModalProps) {
    const { currentUser } = useAuth(); // ✅ Add Firebase auth
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
    const [availableColumns, setAvailableColumns] = useState<any[]>([]);

    useEffect(() => {
        async function fetchBoardColumns() {
            if (!currentUser) {
                console.log("No user logged in");
                return;
            }

            try {
                const token = await currentUser.getIdToken();
                const response = await axios.get(`${BACKEND_URL}/board/oneBoard/${todo.boardId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const board = response.data.board;
                setAvailableColumns(board.columns);
            } catch (e) {
                console.error('Error fetching board columns:', e);
            }
        }
        
        if (currentUser) {
            fetchBoardColumns();
        }
    }, [todo.boardId, currentUser]);

    useEffect(() => {
        setTitle(todo.title);
        setDescription(todo.description);
        setPriority(todo.priority);
        setType(todo.type);
        setColumnId(todo.columnId);
        
        if (todo.time) {
            const dateObj = new Date(todo.time);
            setSelectedDate(dateObj);
            setMonth(dateObj);
            let hour = dateObj.getHours();
            const minute = dateObj.getMinutes();
            const apValue = hour >= 12 ? "PM" : "AM";
            hour = hour % 12;
            if (hour === 0) hour = 12;
            setClockTime(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
            setAp(apValue);
        } else {
            setClockTime('');
            setAp('AM');
        }
    }, [todo]);

    const formattedDate = selectedDate ? format(selectedDate, 'dd-MM-yyyy') : '';

    const handleTodayClick = () => {
        setSelectedDate(today);
        setMonth(today);
    };

    const handleSubmit = async () => {
        if (!currentUser) {
            console.log("No user logged in");
            return;
        }

        if (!formattedDate || !clockTime || !ap) {
            alert("Missing time or date");
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

        if (!title || !description || !priority || !type || !columnId || isNaN(time.getTime())) {
            alert("Please fill in all fields correctly");
            return;
        }

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.put<TodoResponse>(`${BACKEND_URL}/todo/update/${todo._id}`, {
                time,
                title,
                type,
                description,
                priority,
                columnId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const updatedTodo = response.data.todo;
            onTodoUpdated(updatedTodo);
            onClose();
        } catch (e) {
            console.log(e);
            alert("can't update");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl transform transition-all duration-300 hover:shadow-2xl">
                <div onClick={onClose} className=' font-black flex justify-end cursor-pointer text-xl text-red-500'>
                    <X />
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Update Todo</h2>
                </div>
                <div className='flex gap-4 text-black'>
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
                                placeholder="Which one to be Updated?"
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
                                placeholder="Add the updated Description"
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
                                placeholder="Choose the corrected type"
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
                                        className="w-full px-4 py-3 border border-gray-300 border-r-0 rounded-l-lg outline-none duration-200 placeholder-gray-400 resize-none"
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
                        Update Todo
                    </button>
                </div>
            </div>
        </div>
    );
}