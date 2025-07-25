import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  LogOut,
  CheckSquare,
  Search,
  Filter,
  ChevronDown,
  Circle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';

interface SidebarLinkProps {
  icon: React.ElementType;
  text: string;
  to?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon: Icon, text, to, className = "", children, onClick }) => {
  const navigate = useNavigate();
  const baseClasses = "group flex items-center p-3 text-lg transition-all duration-300 cursor-pointer relative overflow-hidden";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <li className="mb-1">
      <a href="#" onClick={handleClick} className={`${baseClasses} ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/5 transition-all duration-300 rounded-lg"></div>
        <Icon className="w-5 h-5 mr-4 relative z-10 transition-transform duration-300 group-hover:scale-110" />
        <span className="relative z-10 font-medium">{text}</span>
        {children}
      </a>
    </li>
  );
};

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, priorityFilters, setPriorityFilters } = useSearch();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);

  const handlePriorityChange = (priority: "urgent" | "medium" | "low") => {
    setPriorityFilters((prev: ("urgent" | "medium" | "low")[]) =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Failed to logout');
    }
  };

  const priorityConfig = {
    urgent: { 
      color: 'text-red-400', 
      bg: 'bg-red-500/10 border-red-500/20', 
      dot: 'bg-red-500',
      label: 'Urgent'
    },
    medium: { 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10 border-yellow-500/20', 
      dot: 'bg-yellow-500',
      label: 'Medium'
    },
    low: { 
      color: 'text-green-400', 
      bg: 'bg-green-500/10 border-green-500/20', 
      dot: 'bg-green-500',
      label: 'Low'
    }
  };

  return (
    <div className="w-64 h-[97vh] flex flex-col shadow-2xl m-3 mr-0 backdrop-blur-xl">
      <div className="flex items-center rounded-t-xl p-8 bg-gradient-to-br from-[#13223d] via-[#1a2d4a] to-[#0f1b2e] border-b border-blue-500/20">
        <div className="p-2 bg-blue-500/20 rounded-lg mr-3 backdrop-blur-sm">
          <CheckSquare className="text-blue-400 w-6 h-6" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
          Taskify
        </span>
      </div>

      <div className="flex-grow bg-gradient-to-b from-[#172f51] via-[#1a3458] to-[#16304e] text-gray-300 flex flex-col rounded-b-xl border-l border-r border-b border-blue-500/10">
        <nav className="flex-grow p-6">
          <ul className="space-y-1">
            <SidebarLink
              icon={LayoutDashboard}
              text="Dashboard"
              to="/dashboard"
              className="text-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-400/10 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/10"
            />

            <li className="mb-1">
              <div
                onClick={() => setIsSearchVisible(p => !p)}
                className="group flex items-center p-3 text-lg transition-all duration-300 cursor-pointer text-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-400/10 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/10 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/5 transition-all duration-300 rounded-lg"></div>
                <Search className="w-5 h-5 mr-4 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative z-10 font-medium flex-grow">Search</span>
                <ChevronDown 
                  className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
                    isSearchVisible ? 'rotate-180' : ''
                  }`} 
                />
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                isSearchVisible ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'
              }`}>
                <div className="mx-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0f1b2e]/80 text-white placeholder-gray-400 border border-blue-500/20 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30"
                  />
                </div>
              </div>
            </li>
            <li className="mb-1">
              <div
                onClick={() => setIsFilterVisible(p => !p)}
                className="group flex items-center p-3 text-lg cursor-pointer text-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-400/10 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/10 relative overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/5 transition-all duration-300 rounded-lg"></div>
                <Filter className="w-5 h-5 mr-4 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative z-10 font-medium flex-grow">Filter</span>
                {priorityFilters.length > 0 && (
                  <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full mr-2 relative z-10 backdrop-blur-sm">
                    {priorityFilters.length}
                  </span>
                )}
                <ChevronDown 
                  className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
                    isFilterVisible ? 'rotate-180' : ''
                  }`} 
                />
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                isFilterVisible ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
              }`}>
                <div className="mx-2 bg-[#0f1b2e]/40 border border-blue-500/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Priority Levels
                  </div>
                  
                  <div className="space-y-2">
                    {(["urgent", "medium", "low"] as const).map((priority, index) => {
                      const config = priorityConfig[priority];
                      const isChecked = priorityFilters.includes(priority);
                      
                      return (
                        <label 
                          key={priority} 
                          className={`flex items-center space-x-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-500/10 ${
                            isChecked ? config.bg : 'hover:bg-gray-700/20'
                          } border ${isChecked ? config.bg.replace('bg-', 'border-').replace('/10', '/30') : 'border-transparent'}`}
                          style={{
                            animationDelay: `${index * 50}ms`
                          }}
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePriorityChange(priority)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                              isChecked 
                                ? `${config.dot} border-transparent` 
                                : 'border-gray-500 bg-gray-700/50'
                            }`}>
                              {isChecked && (
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-1">
                            <Circle className={`h-2 w-2 ${config.dot} rounded-full`} />
                            <span className={`font-medium text-sm ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600/30">
                    <button
                      onClick={() => setPriorityFilters([])}
                      className="text-xs text-gray-400 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-700/30"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setPriorityFilters(["urgent", "medium", "low"])}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-500/10"
                    >
                      Select All
                    </button>
                  </div>
                </div>
              </div>
            </li>
            
            <SidebarLink
              icon={CalendarCheck}
              text="Calendar"
              to="/calendar"
              className="text-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-400/10 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/10"
            />
            <SidebarLink
              icon={User}
              text="Profile"
              to="/profile"
              className="text-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-400/10 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/10"
            />
          </ul>

          <div className="my-8 relative">
            <div className="border-t border-gradient-to-r border-gray-600/50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent h-px"></div>
          </div>

          <ul>
            <SidebarLink
              icon={LogOut}
              text="Logout"
              onClick={handleLogout}
              className="text-red-400 rounded-lg hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-400/10 hover:text-red-300 hover:shadow-lg hover:shadow-red-500/10"
            />
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;