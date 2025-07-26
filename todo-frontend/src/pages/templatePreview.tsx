import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import {
    ListTodo,
    Clock,
    Eye,
    CheckCircle,
    FileText,
    Code,
    TestTube,
    Rocket,
    Lightbulb,
    Palette,
    BookOpen,
    ShoppingCart,
    Home,
    Dumbbell,
    Target,
    Plus,
    PanelsTopLeft,
    GraduationCap,
    Briefcase,
    Heart,
    CheckSquare,
    LayoutDashboard
} from 'lucide-react';


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

interface Board {
    _id: string;
    name: string;
    colorTheme: string;
    columns: any[];
    isTemplate: boolean;
}

interface OneBoardResponse {
    board: Board;
}

interface CreateFromTemplateResponse {
    board: {
        _id: string;
    };
}

const getIconForColumn = (columnId: string) => {
    const iconMap: { [key: string]: any } = {
        'todo': ListTodo,
        'inprogress': Clock,
        'underreview': Eye,
        'finished': CheckCircle,
        'onhold': Clock,
        'completed': CheckCircle,

        'backlog': FileText,
        'development': Code,
        'testing': TestTube,
        'deployed': Rocket,

        'ideas': Lightbulb,
        'sketching': Palette,
        'creating': Palette,
        'published': Rocket,

        'learning': BookOpen,
        'practicing': Code,
        'mastered': CheckCircle,

        'need': ListTodo,
        'researching': Eye,
        'cart': ShoppingCart,
        'purchased': CheckCircle,

        'shopping': ShoppingCart,
        'cooking': Home,
        'cleaning': Home,
        'done': CheckCircle,

        'goals': Target,
        'training': Dumbbell,
        'recovery': Clock,
        'achieved': CheckCircle
    };
    return iconMap[columnId] || ListTodo;
};

const getIconColor = (columnId: string) => {
    const colorMap: { [key: string]: string } = {
        'todo': 'text-blue-600',
        'inprogress': 'text-orange-500',
        'underreview': 'text-purple-600',
        'finished': 'text-green-600',
        'onhold': 'text-gray-500',
        'completed': 'text-green-600',

        'backlog': 'text-gray-600',
        'development': 'text-blue-600',
        'testing': 'text-orange-500',
        'deployed': 'text-green-600',

        'ideas': 'text-yellow-500',
        'sketching': 'text-orange-500',
        'creating': 'text-red-500',
        'published': 'text-green-600',

        'need': 'text-red-500',
        'researching': 'text-blue-500',
        'cart': 'text-orange-500',
        'purchased': 'text-green-600',

        'shopping': 'text-blue-500',
        'cooking': 'text-orange-500',
        'cleaning': 'text-purple-500',
        'done': 'text-green-600',

        'goals': 'text-blue-600',
        'training': 'text-orange-500',
        'recovery': 'text-purple-500',
        'achieved': 'text-green-600'
    };
    return colorMap[columnId] || 'text-blue-600';
};

const getIconBg = (columnId: string) => {
    const bgMap: { [key: string]: string } = {
        'todo': 'bg-blue-50',
        'inprogress': 'bg-orange-50',
        'underreview': 'bg-purple-50',
        'finished': 'bg-green-50',
        'onhold': 'bg-gray-50',
        'completed': 'bg-green-50',

        'backlog': 'bg-gray-50',
        'development': 'bg-blue-50',
        'testing': 'bg-orange-50',
        'deployed': 'bg-green-50',

        'ideas': 'bg-yellow-50',
        'sketching': 'bg-orange-50',
        'creating': 'bg-red-50',
        'published': 'bg-green-50',

        'need': 'bg-red-50',
        'researching': 'bg-blue-50',
        'cart': 'bg-orange-50',
        'purchased': 'bg-green-50',

        'shopping': 'bg-blue-50',
        'cooking': 'bg-orange-50',
        'cleaning': 'bg-purple-50',
        'done': 'bg-green-50',

        'goals': 'bg-blue-50',
        'training': 'bg-orange-50',
        'recovery': 'bg-purple-50',
        'achieved': 'bg-green-50'
    };
    return bgMap[columnId] || 'bg-blue-50';
};

const getBorderColor = (columnId: string) => {
    const borderMap: { [key: string]: string } = {
        'todo': 'border-blue-200',
        'inprogress': 'border-orange-200',
        'underreview': 'border-purple-200',
        'finished': 'border-green-200',
        'onhold': 'border-gray-200',
        'completed': 'border-green-200',

        'backlog': 'border-gray-200',
        'development': 'border-blue-200',
        'testing': 'border-orange-200',
        'deployed': 'border-green-200',

        'ideas': 'border-yellow-200',
        'sketching': 'border-orange-200',
        'creating': 'border-red-200',
        'published': 'border-green-200',

        'need': 'border-red-200',
        'researching': 'border-blue-200',
        'cart': 'border-orange-200',
        'purchased': 'border-green-200',

        'shopping': 'border-blue-200',
        'cooking': 'border-orange-200',
        'cleaning': 'border-purple-200',
        'done': 'border-green-200',

        'goals': 'border-blue-200',
        'training': 'border-orange-200',
        'recovery': 'border-purple-200',
        'achieved': 'border-green-200'
    };
    return borderMap[columnId] || 'border-blue-200';
};

const getBoardGradient = (colorTheme: string) => {
    const gradients: { [key: string]: string } = {
        purple: 'bg-[linear-gradient(135deg,_#3f0d7e_0%,_#b83280_100%)]',
        blue: 'bg-[linear-gradient(135deg,_#090979_0%,_#0398D7_100%)]',
        green: 'bg-[linear-gradient(135deg,_#173817_0%,_#15AD33_100%)]',
        orange: 'bg-[linear-gradient(135deg,_#A33612_0%,_#FF8800_100%)]',
        red: 'bg-[linear-gradient(135deg,_#750000_0%,_#FF4C38_100%)]',
        pink: 'bg-[linear-gradient(135deg,_#7A0B55_0%,_#FF19C6_100%)]',
        teal: 'bg-[linear-gradient(135deg,_#154238_0%,_#03A194_100%)]'
    };
    return gradients[colorTheme] || gradients.purple;
};

const getHeaderGradient = (colorTheme: string) => {
    const headerGradients: { [key: string]: string } = {
        purple: 'bg-[linear-gradient(135deg,_#2d0a5c_0%,_#8f2766_100%)]',
        blue: 'bg-[linear-gradient(135deg,_#02124D_0%,_#1e40af_100%)]',
        green: 'bg-[linear-gradient(135deg,_#122B12_0%,_#03801C_100%)]',
        orange: 'bg-[linear-gradient(135deg,_#7c2d12_0%,_#ea580c_100%)]',
        red: 'bg-[linear-gradient(135deg,_#540101_0%,_#C41400_100%)]',
        pink: 'bg-[linear-gradient(135deg,_#40002C_0%,_#A3087C_100%)]',
        teal: 'bg-[linear-gradient(135deg,_#0c2825_0%,_#0f766e_100%)]'
    };
    return headerGradients[colorTheme] || headerGradients.purple;
};

const addTaskColor = (colorTheme: string) => {
    const addColor: { [key: string]: string } = {
        purple: 'bg-purple-900',
        blue: 'bg-[#090979]',
        green: 'bg-green-900',
        orange: 'bg-orange-800',
        red: 'bg-red-900',
        pink: 'bg-pink-800',
        teal: 'bg-teal-900',
    };
    return addColor[colorTheme] || addColor.purple;
};

const getTemplateIcon = (colorTheme: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
        purple: PanelsTopLeft,
        blue: GraduationCap,
        green: Briefcase,
        orange: Lightbulb,
        red: ShoppingCart,
        pink: Home,
        teal: Heart
    };
    return icons[colorTheme] || icons.purple;
};


export default function TemplatePreview() {
    const { templateId } = useParams<{ templateId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [templateData, setTemplateData] = useState<Board | null>(null);
    const [columns, setColumns] = useState<Record<string, Column>>({});
    const [showModal, setShowModal] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        async function fetchTemplate() {
            if (!currentUser) {
                console.log("No user logged in");
                navigate('/signin');
                return;
            }

            try {
                const token = await currentUser.getIdToken();
                const response = await axios.get<OneBoardResponse>(`${BACKEND_URL}/board/oneBoard/${templateId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const board = response.data.board;
                setTemplateData(board);

                const newColumns: Record<string, Column> = {};
                board.columns.forEach((col: any) => {
                    newColumns[col.id] = {
                        id: col.id,
                        title: col.name,
                        icon: getIconForColumn(col.id),
                        iconColor: getIconColor(col.id),
                        iconBg: getIconBg(col.id),
                        borderColor: getBorderColor(col.id),
                        items: []
                    };
                });
                setColumns(newColumns);

            } catch (e) {
                console.error('Error fetching template:', e);
                navigate('/dashboard');
            }
        }

        if (templateId && currentUser) {
            fetchTemplate();
        }
    }, [templateId, navigate, currentUser]);

    const handleAddToMyBoards = async () => {
        if (!templateData || !currentUser) return;

        setIsCreating(true);
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post<CreateFromTemplateResponse>(`${BACKEND_URL}/board/createFromTemplate/${templateId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const newBoard = response.data.board;
            navigate(`/board/${newBoard._id}`);
        } catch (e) {
            console.error('Error creating board:', e);
            alert("Can't create board from template");
        } finally {
            setIsCreating(false);
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const handleJustPreview = () => {
        setShowModal(false);
    };

    if (!currentUser) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center min-w-full">
                <div className="text-white text-xl">Checking authentication...</div>
            </div>
        );
    }

    if (!templateData) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center min-w-full">
                <div className="text-white text-xl">Loading template...</div>
            </div>
        );
    }

    const IconComponent = getTemplateIcon(templateData?.colorTheme);

    return (
        <div className="flex relative h-screen bg-slate-900 overflow-hidden">
            <div className="w-64 h-[97vh] flex flex-col shadow-lg m-3 mr-0">
                <div className="flex items-center rounded-t-xl p-9 bg-[#13223d] ">
                    <CheckSquare className="text-blue-500 w-8 h-8 mr-3" />
                    <span className="text-3xl font-bold text-white">Taskify</span>
                </div>

                <div className="flex-grow bg-[#172f51] text-gray-300 flex flex-col rounded-b-xl">
                    <nav className="flex-grow p-6">
                        <ul className="space-y-2 ">
                            <li className="flex items-center space-x-3 text-lg text-gray-300 rounded-lg hover:bg-blue-100 hover:text-blue-900 p-3 transition-all duration-200 cursor-pointer">
                                <LayoutDashboard className="h-6 w-6" />
                                <Link to='/dashboard' className='flex-grow'>Dashboard</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
            {/* Modal Overlay */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                    onClick={handleBackToDashboard}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6">
                            <div className={`w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center ${getBoardGradient(templateData.colorTheme)}`}>
                                <IconComponent className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{templateData.name}</h2>
                            <p className="text-gray-600">Preview this template board</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAddToMyBoards}
                                disabled={isCreating}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creating...' : 'Add to My Boards'}
                            </button>

                            <button
                                onClick={handleJustPreview}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
                            >
                                Just Preview
                            </button>

                            <button
                                onClick={handleBackToDashboard}
                                className="w-full text-gray-500 hover:text-gray-700 py-2 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Content */}
            <div className={`flex h-screen overflow-hidden bg-slate-900 w-full`}>
                <div className={`flex-1 min-w-0 rounded-xl shadow m-3 ${getBoardGradient(templateData.colorTheme)} overflow-hidden`}>
                    <div className={`overflow-hidden px-8 py-6 ${getHeaderGradient(templateData.colorTheme)}`}>
                        <div className="flex overflow-y-hidden items-center justify-between text-white">
                            <div className="flex">
                                <div className="w-16 h-16 mr-2">
                                    <IconComponent className="w-full h-full" />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold">{templateData.name || 'Loading...'}</h1>
                                    <p className="mt-1">Manage your tasks efficiently</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddToMyBoards}
                                disabled={isCreating}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${addTaskColor(templateData?.colorTheme)}`}
                            >
                                <Plus className="w-4 h-4" />
                                {isCreating ? 'Creating Board...' : 'Add to My Boards'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <div className="h-full overflow-x-auto">
                            <div className="flex h-full gap-6 p-6 w-[99%]" style={{ minWidth: 'fit-content' }}>
                                {Object.values(columns).map((column) => {
                                    const ColumnIconComponent = column.icon;
                                    return (
                                        <div
                                            key={column.id}
                                            className="flex flex-col w-[24%] rounded-xl flex-shrink-0 shadow-xl"
                                            style={{ height: 'calc(100vh - 180px)' }}
                                        >
                                            <div className="flex items-center gap-3 p-5 pb-4 border-b text-white flex-shrink-0 bg-[#1d2024] rounded-t-lg">
                                                <div className={`w-10 h-10 ${column.iconBg} rounded-xl flex items-center justify-center`}>
                                                    <ColumnIconComponent className={`w-5 h-5 ${column.iconColor}`} />
                                                </div>
                                                <h2 className="text-lg font-semibold flex-1">{column.title}</h2>
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-900">
                                                        0
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto overflow-x-hidden text-white custom-scrollbar bg-[#1d2024] rounded-b-lg">
                                                <div className="p-4 h-full">
                                                    <div className="flex flex-col gap-3 transition-all duration-300 min-h-full">
                                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                            <ColumnIconComponent className="w-12 h-12 mb-3 opacity-30" />
                                                            <p className="text-sm font-medium">No tasks yet</p>
                                                            <p className="text-xs opacity-60 mt-1">Add this to your boards to start adding tasks</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}