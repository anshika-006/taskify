import React from 'react';
import {
  LayoutDashboard,
  Filter,
  CalendarCheck,
  User,
  LogOut,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dropDown from './dropDown';

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
  const baseClasses = "flex items-center p-3 text-lg transition-all duration-200 cursor-pointer";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <li className="mb-2">
      
       <a href="#"
        onClick={handleClick}
        className={`${baseClasses} ${className}`}
      >
        <Icon className="w-6 h-6 mr-4" />
        <span>{text}</span>
        {children}
      </a>
    </li>
  );
};

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="w-64 h-[97vh] flex flex-col shadow-lg m-3 mr-0">
      <div className="flex items-center rounded-t-xl p-9 bg-[#13223d] ">
        <CheckSquare className="text-blue-500 w-8 h-8 mr-3" />
        <span className="text-3xl font-bold text-white">Taskify</span>
      </div>

      <div className="flex-grow bg-[#172f51] text-gray-300 flex flex-col rounded-b-xl">
        <nav className="flex-grow p-6">
          <ul className="space-y-2">
            <SidebarLink
              icon={LayoutDashboard}
              text="Dashboard"
              to="/dashboard"
              className="text-gray-300 rounded-lg hover:bg-blue-100 hover:text-blue-900"
            />
            <li className="mb-2">
              <div onClick={dropDown} className='flex gap-1 items-center p-3 text-lg transition-all duration-200 cursor-pointer text-gray-300 rounded-lg hover:bg-blue-100 hover:text-blue-900'>
                <Filter className="w-6 h-6 mr-4" />
                <span>Filter</span>
              </div>
            </li>
            <SidebarLink
              icon={CalendarCheck}
              text="Calendar"
              to="/calendar"
              className="text-gray-300 rounded-lg hover:bg-blue-100 hover:text-blue-900"
            />
            <SidebarLink
              icon={User}
              text="Profile"
              to="/profile"
              className="text-gray-300 rounded-lg hover:bg-blue-100 hover:text-blue-900"
            />
          </ul>

          <div className="my-8 border-t border-gray-700"></div>

          <ul>
            <SidebarLink
              icon={LogOut}
              text="Logout"
              onClick={handleLogout}
              className="text-red-500 rounded-lg hover:text-red-600 hover:bg-red-200"
            />
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;