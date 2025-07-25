import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { CircleCheckBig, Pencil, SquareUserRound } from "lucide-react";
import Sidebar from "../components/sidebar";
import { BACKEND_URL } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { updatePassword as firebaseUpdatePassword } from 'firebase/auth';

interface Board {
    _id: string;
    name: string;
    colorTheme: string;
    lastAccessed?: string;
}

interface AllBoardsResponse {
    userBoards: Board[];
}

interface Todo {
    _id: string;
    columnId: string;
}

interface TodosResponse {
    todos: Todo[];
}

interface UserInfo {
    name: string;
    avatar: string;
}

interface UserInfoResponse {
    user: UserInfo;
}

export default function Profile() {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [showAvatarSelector, setShowAvatarSelector] = useState<boolean>(false);
  const [disable, setDisable] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [showPasswordUpdate, setShowPasswordUpdate] = useState<boolean>(false);
  const [boardStats, setBoardStats] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  
  const nameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const { currentUser } = useAuth();

  const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Kelly',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan'
  ];

  const [currentPage, setCurrentPage] = useState<number>(0);
  const avatarsPerPage = 5;
  const totalPages = Math.ceil(avatarOptions.length / avatarsPerPage);

  const getCurrentAvatars = () => {
    const startIndex = currentPage * avatarsPerPage;
    return avatarOptions.slice(startIndex, startIndex + avatarsPerPage);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleAvatarSelect = async (avatar: string) => {
    if (!currentUser) return;
    setSelectedAvatar(avatar);
    setShowAvatarSelector(false);

    try {
      const token = await currentUser.getIdToken();
      await axios.put(`${BACKEND_URL}/user/updateAvatar`, {
        avatar: avatar
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Avatar saved successfully');
    } catch (e) {
      console.error('Failed to save avatar:', e);
      alert('Failed to update avatar');
    }
  };

  async function getInfo() {
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      try {
        const response = await axios.get<UserInfoResponse>(`${BACKEND_URL}/user/userInfo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const { name, avatar } = response.data.user;
        setName(name || '');
        setSelectedAvatar(avatar || '');
      } catch (backendError) {
        console.log('User not found in backend, using Firebase data');
        await createUserProfile();
      }
      setEmail(currentUser.email || '');
      
    } catch (e) {
      console.error('Error getting user info:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createUserProfile() {
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.post(`${BACKEND_URL}/user/create`, {
        name: currentUser.displayName || '',
        email: currentUser.email,
        avatar: ''
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setName(currentUser.displayName || '');
    } catch (e) {
      console.error('Error creating user profile:', e);
    }
  }

  async function updateName() {
    if (!currentUser || !nameRef.current?.value) return;
    
    const newName = nameRef.current.value;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.put(`${BACKEND_URL}/user/update`, {
        name: newName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDisable(true);
      setName(newName);
      alert('Name updated successfully!');
    } catch (e) {
      console.error('Error updating name:', e);
      alert('Failed to update name');
    }
  }

  async function updatePassword() {
    if (!currentUser || !passwordRef.current?.value) return;
    
    const newPassword = passwordRef.current.value;
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await firebaseUpdatePassword(currentUser, newPassword);
      
      setShowPasswordUpdate(false);
      if (passwordRef.current) {
        passwordRef.current.value = '';
      }
      alert('Password updated successfully!');
    } catch (e: any) {
      console.error('Error updating password:', e);
      if (e.code === 'auth/requires-recent-login') {
        alert('Please sign out and sign in again before changing your password');
      } else {
        alert('Failed to update password: ' + e.message);
      }
    }
  }

  async function getStatistics() {
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      
      // Get all user boards first
      const boardsResponse = await axios.get<AllBoardsResponse>(`${BACKEND_URL}/board/allBoards`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const userBoards = boardsResponse.data.userBoards || [];
      let allTodos: any[] = [];
      let boardStatsData: any[] = [];

      for (const board of userBoards) {
        try {
          const todosResponse = await axios.get<TodosResponse>(`${BACKEND_URL}/todo/board/${board._id}/todos`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const boardTodos = todosResponse.data.todos || [];
          allTodos = [...allTodos, ...boardTodos];

          const completedTodos = boardTodos.filter(todo => 
            todo.columnId === 'finished' ||
            todo.columnId === 'completed' ||
            todo.columnId === 'done' ||
            todo.columnId === 'deployed' ||
            todo.columnId === 'published' ||
            todo.columnId === 'purchased' ||
            todo.columnId === 'achieved'
          );
          
          const boardCompletionRate = boardTodos.length > 0 
            ? Math.round((completedTodos.length / boardTodos.length) * 100) 
            : 0;
          
          // Get color theme for visual representation
          const getThemeColor = (colorTheme: string) => {
            const colorMap: { [key: string]: string } = {
              purple: 'bg-purple-500',
              blue: 'bg-blue-500',
              green: 'bg-green-500',
              orange: 'bg-orange-500',
              red: 'bg-red-500',
              pink: 'bg-pink-500',
              teal: 'bg-teal-500'
            };
            return colorMap[colorTheme] || 'bg-purple-500';
          };
          
          boardStatsData.push({
            boardId: board._id,
            boardName: board.name,
            colorTheme: board.colorTheme,
            themeColor: getThemeColor(board.colorTheme),
            totalTasks: boardTodos.length,
            completedTasks: completedTodos.length,
            pendingTasks: boardTodos.length - completedTodos.length,
            completionRate: boardCompletionRate,
            lastAccessed: board.lastAccessed
          });
          
        } catch (e) {
          console.warn(`Failed to fetch todos for board ${board.name}`);
          // Still add board to stats even if todos fail to load
          boardStatsData.push({
            boardId: board._id,
            boardName: board.name,
            colorTheme: board.colorTheme,
            themeColor: 'bg-gray-500',
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            completionRate: 0,
            lastAccessed: board.lastAccessed
          });
        }
      }
      
      // Calculate overall statistics
      const overallCompleted = allTodos.filter(todo => 
        todo.columnId === 'finished' ||
        todo.columnId === 'completed' ||
        todo.columnId === 'done' ||
        todo.columnId === 'deployed' ||
        todo.columnId === 'published' ||
        todo.columnId === 'purchased' ||
        todo.columnId === 'achieved'
      );
      
      const overallCompletionRate = allTodos.length > 0 
        ? Math.round((overallCompleted.length / allTodos.length) * 100) 
        : 0;

      boardStatsData.sort((a, b) => {
        if (!a.lastAccessed && !b.lastAccessed) return 0;
        if (!a.lastAccessed) return 1;
        if (!b.lastAccessed) return -1;
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      });
      
      setBoardStats(boardStatsData);
      setOverallStats({
        totalTasks: allTodos.length,
        completedTasks: overallCompleted.length,
        completionRate: overallCompletionRate
      });
      
    } catch (e) {
      console.error('Error getting statistics:', e);
    }
  }

  useEffect(() => {
    if (currentUser) {
      getInfo();
      getStatistics();
    }
  }, [currentUser]);

  const pendingTasks = overallStats.totalTasks - overallStats.completedTasks;

  if (loading) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-900 items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-slate-900">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col rounded-xl shadow m-3 bg-gradient-to-br from-[#1A204F] to-[#0D1538]  overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 rounded-t-xl bg-gradient-to-br from-[#07081A] via-[#121A42] to-[#07081A] flex-shrink-0">
            <div className="flex items-center justify-between text-white">
              <div className="flex">
                <div className="w-16 h-16 mr-2">
                  <SquareUserRound className="w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">Profile</h1>
                  <p className="mt-1">Manage your account settings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">

              {/* Profile Avatar Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>

                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                        {selectedAvatar ? (
                          <img
                            src={selectedAvatar}
                            alt="Profile avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <SquareUserRound className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                      className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  {showAvatarSelector && (
                    <div className="w-full max-w-md bg-white/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={prevPage}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <h3 className="text-white font-medium">Choose Your Avatar</h3>

                        <button
                          onClick={nextPage}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      <div className="text-center mb-3">
                        <span className="text-white/70 text-sm">
                          {currentPage + 1} of {totalPages}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {getCurrentAvatars().map((avatar, index) => (
                          <button
                            key={`avatar-${currentPage}-${index}`}
                            onClick={() => handleAvatarSelect(avatar)}
                            className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-105 ${selectedAvatar === avatar
                                ? 'border-white ring-2 ring-white/50'
                                : 'border-white/30 hover:border-white/60'
                              }`}
                          >
                            <img
                              src={avatar}
                              alt={`Avatar ${index + 1}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setShowAvatarSelector(false)}
                        className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">

                {/* User Information */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Email</label>
                      <input
                        disabled
                        type="email"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none"
                        value={email}
                        placeholder="Email from Firebase"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Display Name</label>
                      <div className="flex">
                        <input
                          ref={nameRef}
                          disabled={disable}
                          type="text"
                          className={`w-full bg-white/10 border border-white/20 border-r-0 rounded-l-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${disable ? 'placeholder-white/70' : 'placeholder-white/50'}`}
                          placeholder={name || 'Enter your name'}
                          defaultValue={name}
                        />
                        <button
                          onClick={() => {
                            if (disable) {
                              setDisable(false);
                            } else {
                              updateName();
                            }
                          }}
                          className="bg-white/10 border border-white/20 border-l-0 rounded-r-lg px-3 py-2 text-white cursor-pointer hover:bg-white/20 transition-colors"
                        >
                          {disable ? (
                            <Pencil className="w-4 h-4" />
                          ) : (
                            <CircleCheckBig className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
                        className="text-white hover:text-white/80 text-sm transition-colors border border-white/70 rounded-lg px-4 py-2"
                      >
                        Update Password
                      </button>
                      {showPasswordUpdate && (
                        <div className="mt-3">
                          <label className="block text-white/70 text-sm mb-1">New password</label>
                          <div className="flex">
                            <input
                              ref={passwordRef}
                              type="password"
                              className="w-full bg-white/10 border border-white/20 border-r-0 rounded-l-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                              placeholder="Enter new password (min 6 chars)"
                            />
                            <button
                              onClick={updatePassword}
                              className="bg-white/10 border border-white/20 border-l-0 rounded-r-lg px-3 py-2 text-white hover:bg-white/20 transition-colors"
                            >
                              <CircleCheckBig className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overall Statistics */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Overall Statistics</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{overallStats.totalTasks}</div>
                      <div className="text-white/70 text-sm">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{overallStats.completedTasks}</div>
                      <div className="text-white/70 text-sm">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{pendingTasks}</div>
                      <div className="text-white/70 text-sm">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{overallStats.completionRate}%</div>
                      <div className="text-white/70 text-sm">Completion Rate</div>
                    </div>
                  </div>
                </div>

                {/* Board-wise Statistics */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Board Statistics</h2>
                  {boardStats.length > 0 ? (
                    <div className="space-y-4">
                      {boardStats.map((board) => (
                        <div key={board.boardId} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${board.themeColor}`}></div>
                              <h3 className="text-white font-medium">{board.boardName}</h3>
                            </div>
                            <div className="text-white/70 text-sm">
                              {board.completionRate}% complete
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-semibold text-white">{board.totalTasks}</div>
                              <div className="text-white/60 text-xs">Total</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-green-400">{board.completedTasks}</div>
                              <div className="text-white/60 text-xs">Done</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-yellow-400">{board.pendingTasks}</div>
                              <div className="text-white/60 text-xs">Pending</div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${board.themeColor}`}
                                style={{ width: `${board.completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <div className="text-4xl mb-3">📊</div>
                      <p>No boards found</p>
                      <p className="text-sm mt-1">Create your first board to see statistics</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}