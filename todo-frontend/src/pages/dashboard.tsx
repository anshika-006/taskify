import axios from "axios";
import { BACKEND_URL } from "../config";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateBoardModal from "../components/modalDB";
import { Search, Plus, User, Home, Bell, HelpCircle, CircleCheckBig, KeyboardIcon, LogOut, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import DeleteConfirmationModal from "../components/deletemodal";

interface Board {
    _id: string;
    name: string;
    colorTheme: string;
    lastAccessed?: string;
    isTemplate: boolean;
}

interface AllBoardsResponse {
    templateBoards: Board[];
    userBoards: Board[];
}

interface AddBoardResponse {
    board: Board;
}


export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    useEffect(() => {
        console.log("🔍 Dashboard mounted, currentUser:", currentUser);
        console.log("🔍 User exists:", !!currentUser);
        if (currentUser) {
            console.log("🔍 User email:", currentUser.email);
            console.log("🔍 User UID:", currentUser.uid);
        }
    }, [currentUser]);
    const [templateBoards, setTemplateBoards] = useState<Board[]>([]);
    const [userBoards, setUserBoards] = useState<Board[]>([]);
    const [recentBoards, setRecentBoards] = useState<Board[]>([]);
    const [filteredUserBoards, setFilteredUserBoards] = useState<Board[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [templateSlide, setTemplateSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
    const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
    const [editingBoardName, setEditingBoardName] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [boardToDelete, setBoardToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();

    const colorThemes = [
        { value: 'purple', name: 'Purple Dreams', gradient: 'from-purple-500 via-purple-700 to-purple-900' },
        { value: 'blue', name: 'Ocean Blue', gradient: 'from-blue-500 via-blue-700 to-blue-900' },
        { value: 'green', name: 'Forest Green', gradient: 'from-green-500 via-green-700 to-green-900' },
        { value: 'orange', name: 'Sunset Orange', gradient: 'from-orange-500 via-orange-700 to-orange-900' },
        { value: 'red', name: 'Ruby Red', gradient: 'from-red-500 via-red-700 to-red-900' },
        { value: 'pink', name: 'Rose Pink', gradient: 'from-pink-500 via-pink-700 to-pink-900' },
        { value: 'teal', name: 'Teal Waves', gradient: 'from-teal-500 via-teal-700 to-teal-900' }
    ];

    useEffect(() => {
        console.log("useEffect triggered, currentUser exists:", !!currentUser);
        if (currentUser) {
            fetchAllBoards();
        }
    }, [currentUser]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUserBoards(userBoards);
        } else {
            const filtered = userBoards.filter(board =>
                board.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUserBoards(filtered);
        }
    }, [searchQuery, userBoards]);

    async function createCustomBoardFromModal(name: string, colorTheme: string) {
        if (!currentUser) {
            console.log("No user logged in");
            return;
        }
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post<AddBoardResponse>(`${BACKEND_URL}/board/addBoard`, {
                name,
                colorTheme
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setShowCreateForm(false);
            fetchAllBoards();

            const newBoard = response.data.board;
            navigate(`/board/${newBoard._id}`);
        } catch (e) {
            console.log(e);
            alert("Can't create board");
        }
    }

    async function fetchAllBoards() {
        if (!currentUser) {
            console.log("No user logged in");
            return;
        }
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get<AllBoardsResponse>(`${BACKEND_URL}/board/allBoards`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setTemplateBoards(response.data.templateBoards);
            setUserBoards(response.data.userBoards);

            const recent = response.data.userBoards
                .filter((board: Board) => board.lastAccessed)
                .sort((a: Board, b: Board) =>
                    new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime()
                )
                .slice(0, 4);
            setRecentBoards(recent);
        } catch (e) {
            console.log(e);
            alert("Can't fetch boards");
        }
    }

    async function createFromTemplate(templateId: string) {
        if (!currentUser) {
            console.log("No user logged in");
            return;
        }
        navigate(`/template-preview/${templateId}`);
    }

    async function handleBoardClick(boardId: string) {
        if (!currentUser) {
            console.log("No user logged in");
            return;
        }
        try {
            const token = await currentUser.getIdToken();
            await axios.put(`${BACKEND_URL}/board/updateAccess/${boardId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (e) {
            console.log("Error updating access time:", e);
        }

        navigate(`/board/${boardId}`);
    }

    const handleDeleteBoard = async (boardId: string, boardName: string) => {
        if (!currentUser) {
            console.log("No user logged in");
            return;
        }

        setBoardToDelete({ id: boardId, name: boardName });
        setShowDeleteModal(true);
    };

    const confirmDeleteBoard = async () => {
        if (!currentUser || !boardToDelete) return;

        setIsDeleting(true);

        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`${BACKEND_URL}/board/delete/${boardToDelete.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUserBoards(prevBoards => prevBoards.filter(board => board._id !== boardToDelete.id));
            setRecentBoards(prevRecent => prevRecent.filter(board => board._id !== boardToDelete.id));

            setShowDeleteModal(false);
            setBoardToDelete(null);

        } catch (e) {
            console.error('Error deleting board:', e);
            alert("Failed to delete board. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDeleteBoard = () => {
        setShowDeleteModal(false);
        setBoardToDelete(null);
        setIsDeleting(false);
    };

    const handleUpdateBoardName = async (boardId: string, newName: string) => {
        if (!currentUser || !newName.trim()) {
            alert("Please enter a valid board name");
            return;
        }

        try {
            const token = await currentUser.getIdToken();
            await axios.put(`${BACKEND_URL}/board/updateName/${boardId}`, {
                name: newName.trim()
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUserBoards(prevBoards =>
                prevBoards.map(board =>
                    board._id === boardId
                        ? { ...board, name: newName.trim() }
                        : board
                )
            );

            setRecentBoards(prevRecent =>
                prevRecent.map(board =>
                    board._id === boardId
                        ? { ...board, name: newName.trim() }
                        : board
                )
            );

            setEditingBoardId(null);
            setEditingBoardName("");
            alert("Board name updated successfully!");

        } catch (e) {
            console.error('Error updating board name:', e);
            alert("Failed to update board name. Please try again.");
        }
    };

    const startEditingBoard = (boardId: string, currentName: string) => {
        setEditingBoardId(boardId);
        setEditingBoardName(currentName);
    };

    const cancelEditing = () => {
        setEditingBoardId(null);
        setEditingBoardName("");
    };

    function getThemeGradient(theme: string) {
        const themeObj = colorThemes.find(t => t.value === theme);
        return themeObj ? themeObj.gradient : 'from-purple-600 to-purple-800';
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleLogout = async () => {
        try {
            console.log('User attempting to log out...');
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
            alert('Failed to logout');
        }
    };

    return (
        <div className="bg-slate-900 min-w-full min-h-screen overflow-y-auto">
            <nav className="px-2 py-2">
                <div className="flex items-center justify-between max-w-[90vw] mx-auto">
                    <div className="flex items-center ">
                        <div className="flex items-center space-x-2">
                            <CircleCheckBig className="w-6 h-6 text-blue-500" />
                            <span className="text-xl font-bold text-white">Taskify</span>
                        </div>
                    </div>

                    <div className="flex-1 max-w-4xl mx-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search boards..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create</span>
                        </button>

                        <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>

                        <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                            <HelpCircle className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium"
                        >
                            <User className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex xl:px-64">
                <div className="w-64 ">
                    <div className="p-4">
                        <div className="space-y-1 mb-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span>Boards</span>
                            </button>

                            <button onClick={() => {
                                setShowTemplatesOnly(!showTemplatesOnly);
                                setSearchQuery("");
                            }}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors">
                                <KeyboardIcon className="w-4 h-4" />
                                <span>Templates</span>
                            </button>

                            <button
                                onClick={() => navigate('/calendar')}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span>Calendar</span>
                            </button>
                        </div>

                        <div className="border-t border-slate-700 pt-4">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspaces</h3>

                            <div className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded-md cursor-pointer">
                                <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center text-white font-medium text-sm">
                                    T
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium">Taskify Workspace</div>
                                    <div className="text-xs text-slate-400">Personal</div>
                                </div>
                            </div>

                            <div className="mt-3 space-y-1 pl-2">
                                <button onClick={() => navigate('/dashboard')} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded-md transition-colors">
                                    <Home className="w-4 h-4" />
                                    <span>Boards</span>
                                </button>

                                <button onClick={() => navigate('/profile')} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors">
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </button>

                                <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors">
                                    <Users className="w-4 h-4" />
                                    <span>Members</span>
                                </button>

                                <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors">
                                    <LogOut className="w-4 h-4" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8">
                    {showTemplatesOnly ? (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-white text-2xl font-bold">Templates</h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Get going faster with a template from the Taskify community
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowTemplatesOnly(false)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {templateBoards.map((board) => (
                                    <div
                                        key={board._id}
                                        onClick={() => createFromTemplate(board._id)}
                                        className="relative overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg group"
                                        style={{ height: '160px' }}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(board.colorTheme)}`}></div>
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
                                            TEMPLATE
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
                                            <div className="p-4">
                                                <h3 className="text-white font-medium text-base mb-1">{board.name}</h3>
                                                <p className="text-slate-300 text-xs">Template by Taskify</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {templateBoards.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <div className="text-4xl mb-4">📋</div>
                                    <p className="text-lg">No templates available</p>
                                    <p className="text-sm mt-2">Check back later for new templates</p>
                                </div>
                            )}
                        </section>
                    ) : (
                        <>
                            {!searchQuery && (
                                <>
                                    <section className="mb-12">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-white text-2xl font-bold">Most popular templates</h2>
                                            {templateBoards.length > 4 && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setTemplateSlide(Math.max(0, templateSlide - 4))}
                                                        disabled={templateSlide === 0}
                                                        className="text-white hover:text-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                                                    >
                                                        &#8249;
                                                    </button>
                                                    <button
                                                        onClick={() => setTemplateSlide(Math.min(templateBoards.length - 4, templateSlide + 4))}
                                                        disabled={templateSlide + 4 >= templateBoards.length}
                                                        className="text-white hover:text-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                                                    >
                                                        &#8250;
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {templateBoards.slice(templateSlide, templateSlide + 4).map((board) => (
                                                <div
                                                    key={board._id}
                                                    onClick={() => createFromTemplate(board._id)}
                                                    className="relative overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg group"
                                                    style={{ height: '140px' }}
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(board.colorTheme)}`}></div>
                                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                    <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
                                                        TEMPLATE
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
                                                        <div className="p-3">
                                                            <h3 className="text-white font-medium text-sm">{board.name}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {recentBoards.length > 0 && (
                                        <section className="mb-12">
                                            <h2 className="text-white text-2xl font-bold mb-6">Recently viewed</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {recentBoards.map((board) => (
                                                    <div
                                                        key={board._id}
                                                        onClick={() => handleBoardClick(board._id)}
                                                        className="relative overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg group"
                                                        style={{ height: '140px' }}
                                                    >
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(board.colorTheme)}`}></div>
                                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
                                                            <div className="p-3">
                                                                <h3 className="text-white font-medium text-sm">{board.name}</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                </>
                            )}

                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-white text-2xl font-bold">
                                        {searchQuery ? `Search results for "${searchQuery}"` : "Your boards"}
                                    </h2>
                                    {searchQuery && (
                                        <span className="text-slate-400 text-sm">
                                            {filteredUserBoards.length} of {userBoards.length} boards
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredUserBoards.map((board) => (
                                        <div key={board._id} className="relative group">
                                            <div
                                                onClick={() => handleBoardClick(board._id)}
                                                className="relative overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                                                style={{ height: '140px' }}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(board.colorTheme)}`}></div>
                                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
                                                    <div className="p-3">
                                                        {editingBoardId === board._id ? (
                                                            // Edit mode - show input field
                                                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="text"
                                                                    value={editingBoardName}
                                                                    onChange={(e) => setEditingBoardName(e.target.value)}
                                                                    className="flex-1 bg-white/20 border border-white/40 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleUpdateBoardName(board._id, editingBoardName);
                                                                        } else if (e.key === 'Escape') {
                                                                            cancelEditing();
                                                                        }
                                                                    }}
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={() => handleUpdateBoardName(board._id, editingBoardName)}
                                                                    className="text-green-400 hover:text-green-300 transition-colors"
                                                                    title="Save"
                                                                >
                                                                    ✓
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                                    title="Cancel"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <h3 className="text-white font-medium text-sm">{board.name}</h3>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons - edit and delete */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditingBoard(board._id, board.name);
                                                    }}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg text-xs"
                                                    title="Edit board name"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteBoard(board._id, board.name);
                                                    }}
                                                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg text-xs"
                                                    title="Delete board"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div
                                        onClick={() => setShowCreateForm(!showCreateForm)}
                                        className="border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 transition-colors duration-200 flex flex-col items-center justify-center"
                                        style={{ height: '140px' }}
                                    >
                                        <div className="text-4xl text-gray-400 mb-2">+</div>
                                        <p className="text-gray-400 font-semibold">Create new board</p>
                                    </div>
                                </div>
                                {searchQuery && filteredUserBoards.length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        <div className="text-4xl mb-4">🔍</div>
                                        <p className="text-lg">No boards found</p>
                                        <p className="text-sm mt-2">Try searching with different keywords</p>
                                    </div>

                                )}
                            </section>
                        </>
                    )}
                    <CreateBoardModal
                        isOpen={showCreateForm}
                        onClose={() => setShowCreateForm(false)}
                        onCreateBoard={createCustomBoardFromModal}
                    />
                    <DeleteConfirmationModal
                        isOpen={showDeleteModal}
                        boardName={boardToDelete?.name || ""}
                        onConfirm={confirmDeleteBoard}
                        onCancel={cancelDeleteBoard}
                        isDeleting={isDeleting}
                    />
                </div>
            </div>
        </div>
    );
}