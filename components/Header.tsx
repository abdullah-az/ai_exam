import React from 'react';
import { useAuth } from '../App'; // Adjust path
import { useNavigate } from 'react-router-dom';
import { UI_TEXTS, FaIcons } from '../constants';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <i className={`${FaIcons.BELL} text-gray-600`}></i>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700 hover:text-blue-600">
            <span>{UI_TEXTS.logout}</span>
            <i className={`${FaIcons.LOGOUT} text-gray-600`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
