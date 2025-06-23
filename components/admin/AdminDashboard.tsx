import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuestions, useModals, LoadingSpinner, Button, Input, Select, useExams } from '../../App'; // Adjust path
import { UI_TEXTS, FaIcons, MOCK_SPECIALIZATIONS } from '../../constants';
import type { Question, AdminExamDefinition, ExamSession, User, UserRole } from '../../types';

// Tab Components
const ManageQuestionsTab: React.FC = () => {
  const { adminQuestions, deleteQuestion } = useQuestions();
  const { openAddQuestionModal } = useModals();
  
  const [filterSpecialization, setFilterSpecialization] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleDelete = (id: string) => {
    if (window.confirm(UI_TEXTS.confirmDeleteQuestion)) {
      deleteQuestion(id);
    }
  };

  const filteredQuestions = useMemo(() => {
    return adminQuestions.filter(q => {
      const specializationMatch = filterSpecialization ? q.specialization_id === filterSpecialization : true;
      const yearMatch = filterYear ? q.course_year === parseInt(filterYear) : true;
      const searchTermMatch = searchTerm ? q.text.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return specializationMatch && yearMatch && searchTermMatch;
    }).sort((a,b) => b.course_year - a.course_year || (a.id > b.id ? -1 : 1)); // Sort by year, then by id (pseudo-recency)
  }, [adminQuestions, filterSpecialization, filterYear, searchTerm]);

  const uniqueCourseYears = useMemo(() => {
    const years = new Set(adminQuestions.map(q => q.course_year));
    return Array.from(years).sort((a, b) => b - a);
  }, [adminQuestions]);

  const clearFilters = () => {
    setFilterSpecialization('');
    setFilterYear('');
    setSearchTerm('');
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-800">{UI_TEXTS.manageQuestions}</h3>
        <Button onClick={() => openAddQuestionModal(null)} variant="primary" icon={FaIcons.PLUS}>
          {UI_TEXTS.addNewQuestion}
        </Button>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input 
            label={UI_TEXTS.searchQuestionText}
            id="searchTerm"
            type="text"
            placeholder={UI_TEXTS.searchQuestionText}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label={UI_TEXTS.filterBySpecialization}
            id="filterSpecialization"
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            options={[{ value: '', label: UI_TEXTS.allSpecializations }, ...MOCK_SPECIALIZATIONS.map(s => ({ value: s.id, label: s.name }))]}
          />
          <Select
            label={UI_TEXTS.filterByCourseYear}
            id="filterYear"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            options={[{ value: '', label: UI_TEXTS.allCourseYears }, ...uniqueCourseYears.map(y => ({ value: y.toString(), label: y.toString() }))]}
          />
          <Button onClick={clearFilters} variant="secondary" icon={FaIcons.RECYCLE}>
            {UI_TEXTS.clearFilters}
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.questionText}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.selectSpecialization}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.courseYear}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.mark}</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredQuestions.length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500 text-lg">{UI_TEXTS.noQuestionsMatchFilters}</td></tr>
            )}
            {filteredQuestions.map(q => (
              <tr key={q.id} className={`hover:bg-gray-50 ${q.is_ai_generated ? 'ai-generated' : ''}`}>
                <td className="px-6 py-4 whitespace-normal max-w-md">
                  <div className="text-sm font-medium text-gray-900 break-words" title={q.text}>{q.text}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    q.specialization_id === 'swe' ? 'bg-green-100 text-green-800' : 
                    q.specialization_id === 'net' ? 'bg-purple-100 text-purple-800' :
                    q.specialization_id === 'ai' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {MOCK_SPECIALIZATIONS.find(s => s.id === q.specialization_id)?.name || q.specialization_id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.course_year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.mark}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <Button variant='link' icon={FaIcons.EDIT} onClick={() => openAddQuestionModal(q)} className="text-blue-600 hover:text-blue-900 mx-1 p-1" title={UI_TEXTS.edit}></Button>
                  <Button variant='link' icon={FaIcons.TRASH} onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900 mx-1 p-1" title={UI_TEXTS.delete}></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RecentExamsTab: React.FC = () => {
  const { examSessions } = useExams();
  // Display top 10 recent sessions
  const recentSessions = examSessions.sort((a,b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).slice(0, 10);

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">{UI_TEXTS.tabRecentExams}</h3>
       {recentSessions.length === 0 ? (
        <p className="text-gray-500">{UI_TEXTS.noExamSessions}</p>
      ) : (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.examName}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.selectSpecialization}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.takenBy}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.score}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.dateCompleted}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentSessions.map(session => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.exam_name || UI_TEXTS.standardExam}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{MOCK_SPECIALIZATIONS.find(s => s.id === session.specialization_id)?.name || session.specialization_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.student_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{UI_TEXTS.finalScore(session.score, session.questions.reduce((sum, q) => sum + q.mark, 0))}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.completed_at).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

const NewStudentsTab: React.FC = () => {
    // Mock data for students as user management is not fully implemented
    const mockStudents: (User & { registrationDate: string; email: string })[] = [
        { id: 'student1', username: 'محمد أحمد', role: 'student' as UserRole, registrationDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), email: 'mohamed@example.com' },
        { id: 'student2', username: 'نورا خالد', role: 'student' as UserRole, registrationDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), email: 'nora@example.com' },
        { id: 'student3', username: 'علي محمود', role: 'student' as UserRole, registrationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), email: 'ali@example.com' },
        { id: 'student4', username: 'سارة ياسين', role: 'student' as UserRole, registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), email: 'sara@example.com' },
    ].sort((a,b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">{UI_TEXTS.tabNewStudents}</h3>
      {mockStudents.length === 0 ? (
        <p className="text-gray-500">{UI_TEXTS.noStudentsRegistered}</p>
      ) : (
      <div className="space-y-4">
        {mockStudents.map(student => (
          <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <i className={FaIcons.USER_PROFILE}></i>
              </div>
              <div>
                <p className="font-medium text-gray-800">{student.username}</p>
                <p className="text-sm text-gray-500">{student.email}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{new Date(student.registrationDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

const ExamsManagementTab: React.FC = () => {
    const { adminExamDefinitions, deleteAdminExamDefinition } = useExams();
    const { openCreateExamModal } = useModals();

    const handleDeleteExam = (id: string) => {
        if (window.confirm(UI_TEXTS.confirmDeleteExam)) {
            deleteAdminExamDefinition(id);
            // alert(UI_TEXTS.examDeleted); // Add proper notifications later
        }
    };
    
    // Sort by creation date, newest first
    const sortedExamDefinitions = [...adminExamDefinitions].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{UI_TEXTS.tabManageExams}</h3>
                <Button onClick={() => openCreateExamModal(null)} variant="primary" icon={FaIcons.PLUS}>
                    {UI_TEXTS.createExam}
                </Button>
            </div>
             {sortedExamDefinitions.length === 0 ? (
                <p className="text-gray-500">{UI_TEXTS.noExamsDefined}</p>
            ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.examName}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.selectSpecialization}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.examDuration}</th>
                            {/* <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.examStatus}</th> */}
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_TEXTS.action}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedExamDefinitions.map(examDef => (
                            <tr key={examDef.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{examDef.name}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs" title={examDef.description}>{examDef.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {MOCK_SPECIALIZATIONS.find(s => s.id === examDef.specialization_id)?.name || examDef.specialization_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{examDef.durationMinutes}</td>
                                {/* Status can be added if exam definitions have a status field 
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${examDef.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {examDef.status === 'active' ? UI_TEXTS.examStatusActive : UI_TEXTS.examStatusDraft}
                                    </span>
                                </td>
                                */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <Button variant='link' icon={FaIcons.EDIT} onClick={() => openCreateExamModal(examDef)} className="text-blue-600 hover:text-blue-900 mx-1 p-1"></Button>
                                    <Button variant='link' icon={FaIcons.TRASH} onClick={() => handleDeleteExam(examDef.id)} className="text-red-600 hover:text-red-900 mx-1 p-1"></Button>
                                    {/* <Button variant='link' icon={FaIcons.VIEW} className="text-purple-600 hover:text-purple-900 mx-1 p-1" title={UI_TEXTS.view}></Button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};


const AdminDashboard: React.FC = () => {
  const { adminQuestions } = useQuestions(); 
  const { adminExamDefinitions, examSessions } = useExams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'questions'; 
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    setActiveTab(queryParams.get('tab') || 'questions');
  }, [location.search]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/admin?tab=${tabId}`); 
  };
  
  const mockStudentsCount = 5; // Example, replace with actual if user management is added

  const stats = [
    { title: UI_TEXTS.statsTotalQuestions, value: adminQuestions.length, icon: FaIcons.QUESTIONS, color: 'blue', growth: adminQuestions.length > 10 ? 12 : 5 },
    { title: UI_TEXTS.statsDefinedExams, value: adminExamDefinitions.length, icon: FaIcons.EXAMS, color: 'indigo', growth: adminExamDefinitions.length > 2 ? 10 : 3 },
    { title: UI_TEXTS.statsSubmittedExams, value: examSessions.length, icon: FaIcons.MANAGE_EXAMS, color: 'purple', growth: examSessions.length > 5 ? 15 : 2 },
    { title: UI_TEXTS.statsAIQuestions, value: adminQuestions.filter(q => q.is_ai_generated).length, icon: FaIcons.AI, color: 'yellow', growth: adminQuestions.filter(q => q.is_ai_generated).length > 3 ? 23 : 7 },
    // { title: UI_TEXTS.statsTotalStudents, value: mockStudentsCount, icon: FaIcons.USERS, color: 'green', growth: 8 }, // Placeholder if student count is tracked
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.title} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                <i className={`${stat.icon} text-${stat.color}-600`}></i>
              </div>
            </div>
            {/* 
            <div className={`mt-2 text-sm text-${stat.color}-600`}>
              <i className={FaIcons.ARROW_UP}></i> {UI_TEXTS.statsGrowthLastMonth(stat.growth)}
            </div>
            */}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-2 overflow-x-auto">
            {[
              { id: 'questions', label: UI_TEXTS.manageQuestions }, // Updated Label
              { id: 'exams-management', label: UI_TEXTS.tabManageExams },
              { id: 'recent-exams', label: UI_TEXTS.tabRecentExams },
              { id: 'students', label: UI_TEXTS.tabNewStudents },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm focus:outline-none whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div>
          {activeTab === 'questions' && <ManageQuestionsTab />}
          {activeTab === 'exams-management' && <ExamsManagementTab />}
          {activeTab === 'recent-exams' && <RecentExamsTab />}
          {activeTab === 'students' && <NewStudentsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;