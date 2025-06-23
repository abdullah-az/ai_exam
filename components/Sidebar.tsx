import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App'; // Adjust path as needed
import { useModals } from '../App'; // Adjust path as needed
import { UI_TEXTS, FaIcons } from '../constants';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { openAISettingsModal, openCreateExamModal } = useModals();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Mobile menu controls (could be enhanced with React state)
  const toggleMobileSidebar = (action: 'open' | 'close') => {
    const sidebarEl = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn'); // For completeness if we want to hide it
    if (sidebarEl) {
        if (action === 'open') sidebarEl.classList.add('active');
        else sidebarEl.classList.remove('active');
    }
  };


  return (
    <>
      {/* Mobile Menu Button - Placed outside sidebar div for fixed positioning */}
      <div className="md:hidden fixed top-4 right-4 z-[60]"> {/* right-4 for RTL */}
        <button id="mobileMenuBtn" onClick={() => toggleMobileSidebar('open')} className="p-2 rounded-md bg-blue-600 text-white">
          <i className={FaIcons.BARS}></i>
        </button>
      </div>

      <div id="sidebar" className="sidebar w-64 bg-blue-800 text-white fixed h-full overflow-y-auto z-50">
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          <h1 className="text-xl font-bold">{UI_TEXTS.platformTitleShort}</h1>
          <button id="closeSidebarBtn" onClick={() => toggleMobileSidebar('close')} className="md:hidden p-1 rounded-md hover:bg-blue-700">
            <i className={FaIcons.TIMES}></i>
          </button>
        </div>
        
        <div className="p-4">
          {user && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <i className={FaIcons.USER_PROFILE}></i>
              </div>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-blue-200">
                  {user.role === 'admin' ? UI_TEXTS.admin : UI_TEXTS.student}
                </p>
              </div>
            </div>
          )}
          
          <nav>
            <ul className="space-y-2">
              <li>
                <Link to={user?.role === 'admin' ? "/admin" : "/student"} className="flex items-center p-2 rounded-md hover:bg-blue-700 aria-[current=page]:bg-blue-700"
                 aria-current={location.pathname === (user?.role === 'admin' ? "/admin" : "/student") ? "page" : undefined}
                >
                  <i className={`${FaIcons.DASHBOARD} ml-3`}></i> {/* ml-3 for RTL */}
                  <span>{UI_TEXTS.adminDashboard}</span>
                </Link>
              </li>
              {user?.role === 'admin' && (
                <>
                  <li>
                    <Link to="/admin" onClick={(e) => { e.preventDefault(); navigate("/admin?tab=questions") }} className="flex items-center p-2 rounded-md hover:bg-blue-700"> {/* Manage Questions is a tab now */}
                      <i className={`${FaIcons.QUESTIONS} ml-3`}></i>
                      <span>{UI_TEXTS.manageQuestions}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="flex items-center p-2 rounded-md hover:bg-blue-700 opacity-50 cursor-not-allowed"> {/* Placeholder */}
                      <i className={`${FaIcons.USERS} ml-3`}></i>
                      <span>{UI_TEXTS.sidebarManageUsers}</span>
                    </Link>
                  </li>
                   <li>
                    <Link to="#" onClick={(e) => { e.preventDefault(); openCreateExamModal(); }} className="flex items-center p-2 rounded-md hover:bg-blue-700">
                      <i className={`${FaIcons.MANAGE_EXAMS} ml-3`}></i>
                      <span>{UI_TEXTS.sidebarManageExams}</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={openAISettingsModal} className="w-full flex items-center p-2 rounded-md hover:bg-blue-700 text-right">
                      <i className={`${FaIcons.AI} ml-3`}></i>
                      <span>{UI_TEXTS.sidebarAI}</span>
                    </button>
                  </li>
                   <li>
                     <button onClick={openAISettingsModal}  className="w-full flex items-center p-2 rounded-md hover:bg-blue-700 text-right"> {/* Settings can be part of AI modal or separate */}
                      <i className={`${FaIcons.SETTINGS} ml-3`}></i>
                      <span>{UI_TEXTS.sidebarSettings}</span>
                    </button>
                  </li>
                </>
              )}
              {user?.role === 'student' && (
                 <li>
                    <Link to="/student/exam-setup" className="flex items-center p-2 rounded-md hover:bg-blue-700">
                      <i className={`${FaIcons.EXAMS} ml-3`}></i>
                      <span>{UI_TEXTS.startNewExam}</span>
                    </Link>
                  </li>
              )}
               <li>
                <button onClick={handleLogout} className="w-full flex items-center p-2 rounded-md hover:bg-blue-700 text-right mt-4">
                  <i className={`${FaIcons.LOGOUT} ml-3`}></i>
                  <span>{UI_TEXTS.logout}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
