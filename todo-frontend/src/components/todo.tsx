import { Clock, Trash2, Tag, Pencil} from "lucide-react";
import { useState } from "react";
import Modalupdate from "./modalupdate";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { differenceInMinutes } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

interface Todo {
    _id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "urgent";
    time: string;
    type: string;
    columnId: string;
    boardId: string;
    position?:number
}
interface Deleted{
    todoId: string;
    columnId:string
}

interface TodoCardProps {
    todo: Todo;
    onTodoUpdated: (updatedTodo: Todo) => void;
    onTodoDeleted: ({todoId, columnId}: Deleted) => void;
}

type PriorityLevel = "low" | "medium" | "urgent";

interface PriorityConfig {
    bgColor: string;
    textColor: string;
    label: string;
}

function getDueTimeLabel(dueTime: string) {
    const now = new Date();
    const dueDate = new Date(dueTime);

    const diffMins = Math.max(0, differenceInMinutes(dueDate, now));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (
        dueDate.getDate() === now.getDate() &&
        dueDate.getMonth() === now.getMonth() &&
        dueDate.getFullYear() === now.getFullYear()
    ) {
        if (diffMins < 60) {
            return `Due: ${mins} min`;
        } else {
            return `Due: ${hours} hour${hours !== 1 ? 's' : ''} ${mins} min`;
        }
    } else {
        return `Due: ${dueDate.getDate().toString().padStart(2, "0")}-${(dueDate.getMonth() + 1).toString().padStart(2, "0")}-${dueDate.getFullYear()} ${dueDate.getHours().toString().padStart(2, "0")}:${dueDate.getMinutes().toString().padStart(2, "0")}`;
    }
}

export default function TodoCard({ todo, onTodoUpdated, onTodoDeleted }: TodoCardProps) {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { currentUser } = useAuth(); 

    const getPriorityConfig = (priority: PriorityLevel): PriorityConfig => {
        switch (priority) {
            case "low":
                return {
                    bgColor: "bg-[#DCFCE7]",
                    textColor: "text-[#166534]",
                    label: "Low"
                };
            case "medium":
                return {
                    bgColor: "bg-[#FEF3C7]",
                    textColor: "text-[#92400E]",
                    label: "Medium"
                };
            case "urgent":
                return {
                    bgColor: "bg-[#FEE2E2]",
                    textColor: "text-[#991B1B]",
                    label: "Urgent"
                };
            default:
                return {
                    bgColor: "bg-[#F3F4F6]",
                    textColor: "text-[#374151]",
                    label: "Unknown"
                };
        }
    };

    const handleDelete = async () => {
        if(!currentUser) return
        setIsDeleting(true);

        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`${BACKEND_URL}/todo/delete/${todo._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            onTodoDeleted({todoId: todo._id, columnId: todo.columnId});
        } catch (e) {
            console.error('Error deleting todo:', e);
            alert("Could not delete todo. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const priorityConfig = getPriorityConfig(todo.priority);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#1F2937] leading-tight">
                    {todo.title}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.textColor}`}>
                    {priorityConfig.label}
                </div>
                <button
                    onClick={() => setShowUpdateModal(true)}
                    className="flex ml-auto items-center justify-center p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors duration-200"
                    title="Edit todo"
                >
                    <Pencil size={16} />
                </button>
                {showUpdateModal && (
                    <Modalupdate
                        todo={todo}
                        onClose={() => setShowUpdateModal(false)}
                        //@ts-ignore
                        onTodoUpdated={onTodoUpdated}
                    />
                )}
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200 disabled:opacity-50"
                    title="Delete todo"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Description */}
            <p className="text-[#6B7280] text-sm mb-4 leading-relaxed">
                {todo.description}
            </p>

            {/* Type */}
            <div className="flex items-center gap-1 mb-4">
                <Tag className="w-4 h-4 text-[#6B7280]" />
                <span className="text-sm text-[#6B7280] bg-[#F9FAFB] px-2 py-1 rounded-md border border-[#E5E7EB]">
                    {todo.type}
                </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-[#6B7280]">
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{getDueTimeLabel(todo.time)}</span>
                </div>

            </div>
        </div>
    );
}