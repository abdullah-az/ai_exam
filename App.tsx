
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { generateQuestionsFromAI, generateQuestionsFromPDFText } from './services/geminiService';
import { UI_TEXTS, MOCK_SPECIALIZATIONS, MOCK_ADMIN_QUESTIONS, DEFAULT_AI_SETTINGS, EXAM_DURATION_SECONDS, GEMINI_MODEL_NAME, AVAILABLE_AI_MODELS, FaIcons, MOCK_ADMIN_EXAM_DEFINITIONS, MOCK_EXAM_SETTINGS_DEFAULT } from './constants';
import { AttachmentType } from './types';
import type { Specialization, Question, Choice, StudentAnswer, ExamSession, UserRole, User, ExamType, ExamConfig, GeneratedQuestionPayload, AISettings, Attachment, AdminQuestionFormValues, AdminExamDefinition, ExamSettingOptions } from './types';

// Components (new structure)
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminDashboard from './components/admin/AdminDashboard';
import AddQuestionModal from './components/modals/AddQuestionModal';
import AISettingsModal from './components/modals/AISettingsModal';
import CreateExamModal from './components/modals/CreateExamModal';


// Setup PDF.js worker path
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.min.mjs";
}

// --- CONTEXTS ---
interface AuthContextType {
  user: User | null;
  login: (role: UserRole, username?: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // TODO: API Call - Replace localStorage with API call to check for active session/token on init
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (role: UserRole, username?: string) => {
    // TODO: API Call - Replace mock login with API call to POST /api/auth/login/
    // On success, store token and user data from response.
    const mockUser: User = { 
      id: `user-${Date.now()}`, 
      username: username || (role === 'admin' ? UI_TEXTS.admin : UI_TEXTS.student) + " " + Math.floor(Math.random()*100), 
      role 
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser)); // Token should be stored, user data can be in context
  };

  const logout = () => {
    // TODO: API Call - Optionally call POST /api/auth/logout/ to invalidate server-side token/session
    setUser(null);
    localStorage.removeItem('user'); // Remove token
    localStorage.removeItem('currentExamSession'); 
    localStorage.removeItem('aiSettings');
  };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface QuestionsContextType {
  adminQuestions: Question[];
  getQuestionById: (id: string) => Question | undefined;
  addQuestion: (question: Question) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (id: string) => void;
  isLoadingAi: boolean; 
  generateStandardQuestions: (specializationId: string, numQuestions: number) => Promise<Question[]>;
  generatePdfQuestions: (pdfFile: File, specializationId: string, numQuestions: number) => Promise<Question[]>;
}

const QuestionsContext = createContext<QuestionsContextType | null>(null);

const QuestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminQuestions, setAdminQuestions] = useState<Question[]>(() => {
    // TODO: API Call - Replace localStorage with API call to GET /api/admin/questions/ on init
    const storedQuestions = localStorage.getItem('adminQuestions');
    return storedQuestions ? JSON.parse(storedQuestions) : MOCK_ADMIN_QUESTIONS;
  });
  const [isLoadingAi, setIsLoadingAi] = useState(false);


  useEffect(() => {
    // TODO: API Call - Remove this useEffect. Data should be fetched on demand or on component mount.
    localStorage.setItem('adminQuestions', JSON.stringify(adminQuestions));
  }, [adminQuestions]);

  const getQuestionById = (id: string) => {
    // TODO: API Call - If questions are fetched in bulk, this can stay. If fetched individually, replace with GET /api/admin/questions/<id>/
    return adminQuestions.find(q => q.id === id);
  }
  
  const addQuestion = (question: Question) => {
    // TODO: API Call - Replace with POST /api/admin/questions/
    // On success, update local state with response or refetch list.
    setAdminQuestions(prev => {
      if (prev.find(q => q.id === question.id)) {
        return prev.map(q_1 => q_1.id === question.id ? question : q_1);
      }
      return [question, ...prev ]; 
    });
  };
  
  const updateQuestion = (updatedQuestion: Question) => {
    // TODO: API Call - Replace with PUT /api/admin/questions/<id>/
    // On success, update local state or refetch.
    setAdminQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  };

  const deleteQuestion = (id: string) => {
    // TODO: API Call - Replace with DELETE /api/admin/questions/<id>/
    // On success, update local state.
    setAdminQuestions(prev => prev.filter(q => q.id !== id));
  };

  const generateStandardQuestions = async (specializationId: string, numQuestionsToGenerate: number): Promise<Question[]> => {
    setIsLoadingAi(true);
    try {
        // TODO: API Call - This whole block should be replaced by a call to POST /api/ai/generate-questions-from-examples/
        // The backend will handle example selection and prompting Gemini.
        if (!process.env.API_KEY) {
          throw new Error(UI_TEXTS.apiKeyMissing);
        }
        let exampleQs = adminQuestions
          .filter(q => q.specialization_id === specializationId && !q.is_ai_generated)
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(5, adminQuestions.filter(q_1 => q_1.specialization_id === specializationId && !q_1.is_ai_generated).length));

        if (exampleQs.length < 1 && adminQuestions.length > 0) { 
             exampleQs = adminQuestions
                .filter(q => !q.is_ai_generated)
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.min(5, adminQuestions.filter(q_1 => !q_1.is_ai_generated).length));
        }
        
        if (exampleQs.length === 0 && adminQuestions.length === 0) {
             exampleQs.push({
                id: "dummy-ex-1", text: "ما هو ناتج 1+1؟", specialization_id: specializationId, course_year: new Date().getFullYear(), mark: 1, is_ai_generated: false,
                choices: [{id: "c1", text: "2", is_correct: true}, {id: "c2", text: "3", is_correct: false}]
            });
        } else if (exampleQs.length === 0) {
             throw new Error("لا توجد أسئلة كافية في النظام لإنشاء أمثلة للامتحان الذكي. يرجى أن يقوم المسؤول بإضافة المزيد من الأسئلة الأساسية.");
        }
        
        const specName = MOCK_SPECIALIZATIONS.find(s => s.id === specializationId)?.name || specializationId;
        const generatedPayloads = await generateQuestionsFromAI(exampleQs, specName, numQuestionsToGenerate); // Direct Gemini call, see geminiService.ts
        
        const newQuestions: Question[] = generatedPayloads.map((payload, index) => ({
          id: `ai-q${Date.now()}-${index}`,
          ...payload,
          specialization_id: specializationId,
          is_ai_generated: true,
          choices: payload.choices.map((c, cIndex) => ({ ...c, id: `ai-q${Date.now()}-${index}-c${cIndex}` })),
          attachments: [], 
        }));
        // TODO: API Call - If questions generated by backend are to be added to admin's list, handle here.
        // The current design suggests student smart exams might not save Qs permanently or save them differently.
        return newQuestions;
    } finally {
        setIsLoadingAi(false);
    }
  };

  const generatePdfQuestions = async (pdfFile: File, specializationId: string, numQuestionsToGenerate: number): Promise<Question[]> => {
    setIsLoadingAi(true);
    try {
        // TODO: API Call - This whole block should be replaced by a call to POST /api/ai/generate-questions-from-pdf/
        // The backend will handle PDF parsing and prompting Gemini.
        if (!process.env.API_KEY) throw new Error(UI_TEXTS.apiKeyMissing);

        const reader = new FileReader();
        const fileReadPromise = new Promise<ArrayBuffer>((resolve, reject) => {
            reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
            reader.onerror = () => reject(new Error(UI_TEXTS.errorProcessingPDF));
        });
        reader.readAsArrayBuffer(pdfFile);
        const fileBuffer = await fileReadPromise;

        const typedArray = new Uint8Array(fileBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(" ");
          fullText += pageText + "\n";
        }
        
        const specName = MOCK_SPECIALIZATIONS.find(s => s.id === specializationId)?.name || specializationId;
        const generatedPayloads = await generateQuestionsFromPDFText(fullText, specName, numQuestionsToGenerate); // Direct Gemini call

        const newQuestions: Question[] = generatedPayloads.map((payload, index) => ({
           id: `pdf-ai-q${Date.now()}-${index}`,
           ...payload,
           specialization_id: specializationId,
           is_ai_generated: true,
           choices: payload.choices.map((c, cIndex) => ({ ...c, id: `pdf-ai-q${Date.now()}-${index}-c${cIndex}` })),
           attachments: [],
        }));
        // TODO: API Call - If these questions are added to the main list by an admin, the `addQuestion` (which should call API) would handle it.
        return newQuestions;
    } finally {
        setIsLoadingAi(false);
    }
  };

  return (
    <QuestionsContext.Provider value={{ adminQuestions, getQuestionById, addQuestion, updateQuestion, deleteQuestion, isLoadingAi, generateStandardQuestions, generatePdfQuestions }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => { 
  const context = useContext(QuestionsContext);
  if (!context) throw new Error("useQuestions must be used within a QuestionsProvider");
  return context;
};

// Exams Context (New)
interface ExamsContextType {
  adminExamDefinitions: AdminExamDefinition[];
  addAdminExamDefinition: (definitionData: Omit<AdminExamDefinition, 'id' | 'createdAt'>) => AdminExamDefinition;
  updateAdminExamDefinition: (definition: AdminExamDefinition) => void;
  deleteAdminExamDefinition: (id: string) => void;
  getAdminExamDefinitionById: (id: string) => AdminExamDefinition | undefined;

  examSessions: ExamSession[]; // Student attempts
  addExamSession: (session: ExamSession) => void;
  getExamSessionById: (id: string) => ExamSession | undefined;
  getAllExamSessions: () => ExamSession[];
}

const ExamsContext = createContext<ExamsContextType | null>(null);

const ExamsProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [adminExamDefinitions, setAdminExamDefinitions] = useState<AdminExamDefinition[]>(() => {
        // TODO: API Call - Replace localStorage with API call to GET /api/admin/exam-definitions/
        const stored = localStorage.getItem('adminExamDefinitions');
        return stored ? JSON.parse(stored) : MOCK_ADMIN_EXAM_DEFINITIONS;
    });
    const [examSessions, setExamSessions] = useState<ExamSession[]>(() => {
        // TODO: API Call - Replace localStorage with API call to GET /api/student/exam-sessions/
        const stored = localStorage.getItem('pastExams'); // Student attempts
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        // TODO: API Call - Remove this. Data persistence handled by backend.
        localStorage.setItem('adminExamDefinitions', JSON.stringify(adminExamDefinitions));
    }, [adminExamDefinitions]);

    useEffect(() => {
        // TODO: API Call - Remove this. Data persistence handled by backend.
        localStorage.setItem('pastExams', JSON.stringify(examSessions));
    }, [examSessions]);

    const addAdminExamDefinition = (definitionData: Omit<AdminExamDefinition, 'id' | 'createdAt'>) => {
        // TODO: API Call - Replace with POST /api/admin/exam-definitions/
        // Update state with response from API.
        const newDefinition: AdminExamDefinition = {
            ...definitionData,
            id: `examdef-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setAdminExamDefinitions(prev => [newDefinition, ...prev]);
        return newDefinition;
    };

    const updateAdminExamDefinition = (updatedDefinition: AdminExamDefinition) => {
        // TODO: API Call - Replace with PUT /api/admin/exam-definitions/<id>/
        setAdminExamDefinitions(prev => prev.map(def => def.id === updatedDefinition.id ? updatedDefinition : def));
    };

    const deleteAdminExamDefinition = (id: string) => {
        // TODO: API Call - Replace with DELETE /api/admin/exam-definitions/<id>/
        setAdminExamDefinitions(prev => prev.filter(def => def.id !== id));
    };
    
    const getAdminExamDefinitionById = (id: string) => {
      // TODO: API Call - If not all definitions are pre-loaded, this might need GET /api/admin/exam-definitions/<id>/
      return adminExamDefinitions.find(d => d.id === id);
    }


    const addExamSession = (session: ExamSession) => {
        // TODO: API Call - This is called after an exam is submitted.
        // It should instead be a result of the POST /api/student/exam-sessions/submit/ call.
        // The backend calculates score and returns the completed ExamSession.
        setExamSessions(prev => [session, ...prev].sort((a,b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
    };
    
    const getExamSessionById = (id: string) => {
      // TODO: API Call - If not all sessions are pre-loaded, this might need GET /api/student/exam-sessions/<id>/
      return examSessions.find(s => s.id === id);
    }
    const getAllExamSessions = () => {
      // TODO: API Call - Primarily for admin views, might need pagination/filtering.
      return examSessions;
    }


    return (
        <ExamsContext.Provider value={{
            adminExamDefinitions, addAdminExamDefinition, updateAdminExamDefinition, deleteAdminExamDefinition, getAdminExamDefinitionById,
            examSessions, addExamSession, getExamSessionById, getAllExamSessions
        }}>
            {children}
        </ExamsContext.Provider>
    );
};

export const useExams = () => {
    const context = useContext(ExamsContext);
    if(!context) throw new Error("useExams must be used within an ExamsProvider");
    return context;
};


// Modal Context
interface ModalContextType {
  isAddQuestionModalOpen: boolean;
  openAddQuestionModal: (questionToEdit?: Question) => void;
  closeAddQuestionModal: () => void;
  editingQuestion: Question | null | undefined; 

  isAISettingsModalOpen: boolean;
  openAISettingsModal: () => void;
  closeAISettingsModal: () => void;

  isCreateExamModalOpen: boolean;
  openCreateExamModal: (examToEdit?: AdminExamDefinition) => void; 
  closeCreateExamModal: () => void;
  editingExamDefinition: AdminExamDefinition | null | undefined; 
}

const ModalContext = createContext<ModalContextType | null>(null);

const ModalProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null | undefined>(null);
    
    const [isAISettingsModalOpen, setIsAISettingsModalOpen] = useState(false);
    
    const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
    const [editingExamDefinition, setEditingExamDefinition] = useState<AdminExamDefinition | null | undefined>(null);


    const openAddQuestionModal = (questionToEdit?: Question) => {
        setEditingQuestion(questionToEdit);
        setIsAddQuestionModalOpen(true);
    };
    const closeAddQuestionModal = () => setIsAddQuestionModalOpen(false);

    const openAISettingsModal = () => setIsAISettingsModalOpen(true);
    const closeAISettingsModal = () => setIsAISettingsModalOpen(false);
    
    const openCreateExamModal = (examToEdit?: AdminExamDefinition) => {
        setEditingExamDefinition(examToEdit);
        setIsCreateExamModalOpen(true);
    };
    const closeCreateExamModal = () => setIsCreateExamModalOpen(false);

    return (
        <ModalContext.Provider value={{
            isAddQuestionModalOpen, openAddQuestionModal, closeAddQuestionModal, editingQuestion,
            isAISettingsModalOpen, openAISettingsModal, closeAISettingsModal,
            isCreateExamModalOpen, openCreateExamModal, closeCreateExamModal, editingExamDefinition
        }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModals = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error("useModals must be used within a ModalProvider");
    return context;
};


// --- HELPER COMPONENTS (can be moved to a separate file) ---
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    {message && <p className="mt-4 text-lg text-gray-700">{message}</p>}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'link'; icon?: string;}> = ({ children, className, variant = 'primary', icon, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400",
    link: "bg-transparent text-blue-600 hover:text-blue-800 hover:underline shadow-none p-1",
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {icon && <i className={`${icon} ${children ? 'ml-2' : ''}`}></i>}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label?: string; error?: string}> = ({label, id, error, className, ...props}) => (
  <div className="w-full">
    {label && <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-2">{label}</label>}
    <input id={id} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${error ? 'border-red-500' : ''} ${className}`} {...props} />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {label?: string; error?: string; options: {value: string | number; label: string}[]}> = ({label, id, error, options, className, ...props}) => (
 <div className="w-full">
    {label && <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-2">{label}</label>}
    <select id={id} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white ${error ? 'border-red-500' : ''} ${className}`} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {label?: string; error?: string}> = ({label, id, error, className, ...props}) => (
  <div className="w-full">
    {label && <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-2">{label}</label>}
    <textarea id={id} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${error ? 'border-red-500' : ''} ${className}`} {...props} />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const AttachmentViewer: React.FC<{ attachment: Attachment }> = ({ attachment }) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderContent = () => {
    switch (attachment.attachment_type) {
      case AttachmentType.IMAGE:
        // TODO: Backend Integration - Ensure attachment.file_url points to a Django-served media file.
        return <img src={attachment.file_url} alt={attachment.file_name || UI_TEXTS.image} className="max-w-full h-auto rounded-md shadow-lg" />;
      case AttachmentType.CODE:
        return <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap">{attachment.content || ''}</pre>;
      case AttachmentType.TEXT:
        return <pre className="bg-white p-4 rounded-md shadow overflow-x-auto text-sm whitespace-pre-wrap">{attachment.content || attachment.file_url}</pre>;
      case AttachmentType.DIAGRAM:
         // TODO: Backend Integration - Ensure attachment.file_url points to a Django-served media file.
         return <img src={attachment.file_url} alt={attachment.file_name || UI_TEXTS.diagram} className="max-w-full h-auto rounded-md shadow-lg" />;
      default:
        return <p>{UI_TEXTS.errorOccurred}: نوع مرفق غير معروف.</p>;
    }
  };

  return (
    <div className="my-2">
      <Button variant="secondary" onClick={() => setIsOpen(true)} className="text-sm py-1 px-3">
        {UI_TEXTS.viewAttachment}: {attachment.file_name || attachment.attachment_type}
      </Button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]" onClick={() => setIsOpen(false)}> {/* Increased z-index */}
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{attachment.file_name || UI_TEXTS.attachments}</h3>
            {renderContent()}
            <Button onClick={() => setIsOpen(false)} className="mt-4">إغلاق</Button>
          </div>
        </div>
      )}
    </div>
  );
};


const QuestionDisplay: React.FC<{
  question: Question;
  onSelectAnswer: (choiceId: string) => void;
  selectedChoiceId: string | null;
  showCorrectAnswer?: boolean;
}> = ({ question, onSelectAnswer, selectedChoiceId, showCorrectAnswer = false }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
      <div 
        className={`prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none mb-4 text-gray-800 ${question.is_ai_generated ? 'ai-generated' : ''}`} 
        dangerouslySetInnerHTML={{ __html: question.text.replace(/\n/g, '<br/>').replace(/```(python|java|csharp|javascript|shell|bash)?\n([\s\S]*?)\n```/g, '<pre class="bg-gray-800 text-white p-3 my-2 rounded-md overflow-x-auto text-sm"><code>$2</code></pre>') }}
      ></div>
      
      {question.attachments && question.attachments.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700">{UI_TEXTS.attachments}:</h4>
          {question.attachments.map(att => <AttachmentViewer key={att.id} attachment={att} />)}
        </div>
      )}

      <div className="space-y-3">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          let choiceClasses = "block w-full text-right p-4 border rounded-lg cursor-pointer transition-colors duration-150 ";
          if (showCorrectAnswer) {
            if (choice.is_correct) choiceClasses += "bg-green-100 border-green-400 text-green-700 font-semibold";
            else if (isSelected && !choice.is_correct) choiceClasses += "bg-red-100 border-red-400 text-red-700";
            else choiceClasses += "bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-800";
          } else {
             choiceClasses += isSelected ? "bg-blue-100 border-primary ring-2 ring-primary text-primary" : "bg-gray-50 border-gray-300 hover:bg-blue-50 text-gray-800";
          }

          return (
            <label key={choice.id} className={`${choiceClasses} flex items-center`}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={choice.id}
                checked={isSelected}
                onChange={() => onSelectAnswer(choice.id)}
                className="ml-3 opacity-0 w-0 h-0"
                disabled={showCorrectAnswer}
              />
              <span className="flex-1">{choice.text}</span>
              {showCorrectAnswer && choice.is_correct && <i className={`${FaIcons.CHECK_CIRCLE} text-green-500`}></i>}
              {showCorrectAnswer && isSelected && !choice.is_correct && <i className={`${FaIcons.X_CIRCLE} text-red-500`}></i>}
            </label>
          );
        })}
      </div>
      {showCorrectAnswer && selectedChoiceId === null && (
         <p className="mt-2 text-sm text-yellow-600">لم يتم اختيار إجابة لهذا السؤال.</p>
      )}
    </div>
  );
};


// --- LAYOUT ---
const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      // User state is null, redirect to login
      navigate('/login', { replace: true, state: { from: location } });
    } else if (!allowedRoles.includes(user.role)) {
      // User is logged in but role is not allowed for this route
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true }); 
    }
  }, [user, allowedRoles, navigate, location]);

  // If user data is still loading or role check is pending, show loading
  // This depends on how quickly `user` state updates after API call in AuthProvider
  if (!user || !allowedRoles.includes(user.role)) {
    // If not logged in and navigating to login, this check will pass briefly
    // It's okay as navigate will happen. Or show loader if user is null and not on login page.
    return <LoadingSpinner message={UI_TEXTS.loading} />;
  }
  return <Outlet />;
};


// --- PAGES / VIEWS ---

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Added for Django
  const [error, setError] = useState(''); // Added for API errors
  const from = location.state?.from?.pathname || (role === 'admin' ? '/admin' : '/student');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError("الرجاء إدخال اسم المستخدم وكلمة المرور."); return; }
    // TODO: API Call - Replace login(role, username) with API call to Django
    // e.g., const response = await apiService.login(username, password, role_hint_for_redirect);
    // if (response.success) { navigate(from, {replace: true}); } else { setError(response.message); }
    login(role, username.trim()); // Mock login for now
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">{UI_TEXTS.appName}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-8">{UI_TEXTS.login}</h2>
        {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded-md">{error}</p>}
        <div className="mb-4">
            <Input label={UI_TEXTS.username} type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder={UI_TEXTS.username} required />
        </div>
         <div className="mb-4"> {/* Added password field */}
            <Input label={UI_TEXTS.password} type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={UI_TEXTS.password} required />
        </div>
        <div className="mb-6">
          <Select 
            label={UI_TEXTS.role} 
            id="role-select" 
            value={role || 'student'} 
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[ {value: "student", label: UI_TEXTS.student}, {value: "admin", label: UI_TEXTS.admin} ]}
          />
        </div>
        <Button type="submit" className="w-full text-lg"> {UI_TEXTS.login} </Button>
        <p className="mt-6 text-sm"> {UI_TEXTS.dontHaveAccount}{' '} <Link to="/register" className="font-medium text-primary hover:underline">{UI_TEXTS.register}</Link> </p>
      </form>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const { login } = useAuth(); // Will be replaced by an API call for registration
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Added
  const [confirmPassword, setConfirmPassword] = useState(''); // Added
  const [email, setEmail] = useState(''); // Added
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState(''); // Added

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim() || !email.trim()) { setError("جميع الحقول (اسم المستخدم، كلمة المرور، البريد الإلكتروني) مطلوبة."); return; }
    if (password !== confirmPassword) { setError("كلمتا المرور غير متطابقتين."); return; }
    
    // TODO: API Call - Replace with API call to POST /api/auth/register/
    // e.g., const response = await apiService.register({username, password, email, role});
    // if (response.success) { login(role, username); /* or auto-login with token from response */ navigate(...); } else { setError(response.message); }
    login(role, username.trim()); // Mock registration and login for now
    navigate(role === 'admin' ? '/admin' : '/student');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">{UI_TEXTS.appName}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-8">{UI_TEXTS.register}</h2>
        {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded-md">{error}</p>}
        <div className="mb-4"> <Input label={UI_TEXTS.username} type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder={UI_TEXTS.username} required /> </div>
        <div className="mb-4"> <Input label={UI_TEXTS.email} type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={UI_TEXTS.email} required /> </div>
        <div className="mb-4"> <Input label={UI_TEXTS.password} type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={UI_TEXTS.password} required /> </div>
        <div className="mb-4"> <Input label={UI_TEXTS.confirmPassword} type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={UI_TEXTS.confirmPassword} required /> </div>
        <div className="mb-6">
           <Select label={UI_TEXTS.role} id="role-select" value={role || 'student'} onChange={(e) => setRole(e.target.value as UserRole)}
            options={[ {value: "student", label: UI_TEXTS.student}, {value: "admin", label: UI_TEXTS.admin} ]} />
        </div>
        <Button type="submit" className="w-full text-lg"> {UI_TEXTS.registerButton} </Button>
         <p className="mt-6 text-sm"> {UI_TEXTS.alreadyHaveAccount}{' '} <Link to="/login" className="font-medium text-primary hover:underline">{UI_TEXTS.login}</Link> </p>
      </form>
    </div>
  );
};

export const PDFQuestionGeneratorTool: React.FC<{isStudentView?: boolean; onQuestionsGenerated?: (questions: Question[]) => void}> = ({ isStudentView = false, onQuestionsGenerated }) => {
  const { addQuestion: addQuestionToGlobalList, generatePdfQuestions, isLoadingAi } = useQuestions();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [numQuestionsToGenerate, setNumQuestionsToGenerate] = useState(isStudentView ? 3 : 5);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState<string>(MOCK_SPECIALIZATIONS[0]?.id || '');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
      setStatusMessage('');
    } else {
      setSelectedFile(null);
    }
  };

  const handleGenerateFromPDF = async () => {
    if (!selectedFile) { setError(UI_TEXTS.noFileSelected); return; }
    // API_KEY check for direct Gemini calls is in generatePdfQuestions, will be removed when backend proxy is used.
    
    setError(null);
    setStatusMessage(UI_TEXTS.processingPDF);

    try {
        // `generatePdfQuestions` currently calls Gemini directly. This should call a backend endpoint.
        // TODO: API Call - Replace call to `generatePdfQuestions` with a call to a backend service.
        // e.g., const generatedQs = await apiService.generateQuestionsFromPdf(selectedFile, selectedSpecializationId, numQuestionsToGenerate);
        const generatedQs = await generatePdfQuestions(selectedFile, selectedSpecializationId, numQuestionsToGenerate);
        
        if(onQuestionsGenerated) {
            onQuestionsGenerated(generatedQs);
        } else {
             if (!isStudentView) {
                // TODO: API Call - Ensure `addQuestionToGlobalList` internally calls the backend to save each question.
                generatedQs.forEach(q => addQuestionToGlobalList(q));
             }
        }
        setStatusMessage(`${generatedQs.length} ${UI_TEXTS.questionsGeneratedAndAdded.replace("سؤال/أسئلة", generatedQs.length === 1 ? "سؤال" : "أسئلة")}`);
    } catch (err) {
        console.error("Error in PDF processing or AI generation:", err);
        setError(err instanceof Error ? err.message : String(err));
        setStatusMessage('');
    }
  };

  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${isStudentView ? 'hover:shadow-lg transition-shadow' : ''}`}>
      <h2 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
        <i className={`${FaIcons.UPLOAD} ml-2`}></i>
        {isStudentView ? UI_TEXTS.studentPdfFeatureTitle : UI_TEXTS.generateFromPDF}
      </h2>
      <p className="text-gray-600 mb-4 text-sm">{isStudentView ? UI_TEXTS.studentPdfFeatureDescription : UI_TEXTS.pdfFeatureDescription}</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor={`pdf-upload-${isStudentView ? 'student' : 'admin'}`} className="block text-sm font-medium text-gray-700 mb-1">{UI_TEXTS.uploadPDFFile}</label>
          {/* TODO: Backend Integration - File upload needs to send to Django backend, not just client-side processing. */}
          <Input type="file" id={`pdf-upload-${isStudentView ? 'student' : 'admin'}`} accept=".pdf" onChange={handleFileChange} className="p-2"/>
          {selectedFile && <p className="text-xs text-gray-500 mt-1">الملف المختار: {selectedFile.name}</p>}
        </div>
         <Select
            label={UI_TEXTS.selectSpecialization}
            id={`pdf-specialization-${isStudentView ? 'student' : 'admin'}`}
            value={selectedSpecializationId}
            onChange={(e) => setSelectedSpecializationId(e.target.value)}
            options={MOCK_SPECIALIZATIONS.map(spec => ({ value: spec.id, label: spec.name }))}
        />
        <Input
            label={UI_TEXTS.numberOfQuestions}
            type="number"
            id={`pdf-numQuestions-${isStudentView ? 'student' : 'admin'}`}
            value={numQuestionsToGenerate}
            onChange={(e) => setNumQuestionsToGenerate(Math.max(1, parseInt(e.target.value)))}
            min="1" max="20"
        />
        <Button onClick={handleGenerateFromPDF} disabled={isLoadingAi || !selectedFile} className="w-full">
          {isLoadingAi ? UI_TEXTS.loading : UI_TEXTS.generateQuestionsFromPDFButton}
        </Button>
      </div>

      {statusMessage && <p className="mt-3 text-green-600 text-sm">{statusMessage}</p>}
      {error && <p className="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
       {!process.env.API_KEY && ( // This check will be irrelevant if backend handles AI calls.
           <p className="mt-3 text-red-600 bg-red-50 p-2 rounded text-sm">{UI_TEXTS.apiKeyMissing}</p>
      )}
    </div>
  );
};


const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  // TODO: API Call - `examSessions` should be fetched from GET /api/student/exam-sessions/
  const { examSessions } = useExams(); 

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{UI_TEXTS.studentDashboard}</h1>
      <p className="text-lg text-gray-600 mb-8">{UI_TEXTS.welcomeStudent}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center">
            <i className={`${FaIcons.DOCUMENT_TEXT} text-4xl text-blue-600 mb-3`}></i>
            <h2 className="text-xl font-semibold text-primary mt-3 mb-2">{UI_TEXTS.startNewExam}</h2>
            <p className="text-gray-600 mb-4">هل أنت مستعد لاختبار معلوماتك؟ ابدأ امتحانًا جديدًا الآن.</p>
            <Button onClick={() => navigate('/student/exam-setup')} className="w-full md:w-auto"> {UI_TEXTS.startNewExam} </Button>
        </div>
        <div className="md:col-span-1">
           <PDFQuestionGeneratorTool isStudentView={true} />
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">{UI_TEXTS.pastExams}</h2>
      {examSessions.length === 0 ? ( <p className="text-gray-500">{UI_TEXTS.noPastExams}</p> ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-right">{UI_TEXTS.examID}</th>
                <th className="py-3 px-6 text-right">اسم الامتحان/التخصص</th>
                <th className="py-3 px-6 text-right">{UI_TEXTS.score}</th>
                <th className="py-3 px-6 text-right">{UI_TEXTS.dateCompleted}</th>
                <th className="py-3 px-6 text-center">{UI_TEXTS.action}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {examSessions.map(exam => (
                <tr key={exam.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-right whitespace-nowrap">{exam.id.substring(0,8)}...</td>
                  <td className="py-3 px-6 text-right">{exam.exam_name || MOCK_SPECIALIZATIONS.find(s => s.id === exam.specialization_id)?.name || exam.specialization_id}</td>
                  <td className="py-3 px-6 text-right">{UI_TEXTS.finalScore(exam.score, exam.questions.reduce((sum, q) => sum + q.mark, 0))}</td>
                  <td className="py-3 px-6 text-right">{new Date(exam.completed_at).toLocaleString('ar-EG')}</td>
                  <td className="py-3 px-6 text-center">
                    <Button variant="secondary" className="text-xs py-1 px-2" icon={FaIcons.VIEW} onClick={() => navigate(`/student/results/${exam.id}`)}> {UI_TEXTS.viewResults} </Button>
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

const ExamSetupPage: React.FC = () => {
  const navigate = useNavigate();
  // TODO: API Call - `adminQuestions` for 'standard' exam type might come from a dedicated student-facing endpoint,
  // or `generateStandardQuestions` will call the backend for AI-generated ones.
  const { adminQuestions, generateStandardQuestions, isLoadingAi } = useQuestions();
  const [specializationId, setSpecializationId] = useState<string>(MOCK_SPECIALIZATIONS[0]?.id || '');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [examType, setExamType] = useState<ExamType>('standard');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  // const { addExamSession } = useExams(); // Not needed here, session is added on submit.

  const handleStartExam = async () => {
    setError(null);
    let questionsForExam: Question[] = [];

    try {
      if (examType === 'smart') {
        // TODO: API Call - `generateStandardQuestions` should call POST /api/student/exams/start-smart/ or similar.
        // It returns the questions for the exam.
        questionsForExam = await generateStandardQuestions(specializationId, numQuestions);
      } else { 
        // TODO: API Call - This block should call POST /api/student/exams/start-standard/
        // It returns the questions for the exam.
        questionsForExam = adminQuestions
          .filter(q => q.specialization_id === specializationId && !q.is_ai_generated) 
          .sort(() => 0.5 - Math.random()) 
          .slice(0, numQuestions);
      }

      if (questionsForExam.length === 0) {
        setError(UI_TEXTS.noQuestionsAvailable);
        return;
      }
      
      // Ensure questions have at least 2 choices and one correct answer (frontend patch)
      questionsForExam = questionsForExam.map(q => {
        if (q.choices.length < 2) {
          while (q.choices.length < 2) { q.choices.push({ id: `dummy-c-${Date.now()}-${q.choices.length}`, text: "اختيار إضافي", is_correct: false }); }
        }
        if (!q.choices.some(c => c.is_correct)) { q.choices[0].is_correct = true; }
        return q;
      });
      
      const newExamSessionData: ExamSession = {
        id: `sess-${Date.now()}`, // Backend should generate ID
        student_id: user?.id || 'student1', 
        specialization_id: specializationId,
        exam_name: `${examType === 'smart' ? UI_TEXTS.smartExam : UI_TEXTS.standardExam} - ${MOCK_SPECIALIZATIONS.find(s=>s.id === specializationId)?.name || ''}`,
        score: 0, 
        completed_at: '', // Will be set on submission
        answers: questionsForExam.map(q => ({ question_id: q.id, selected_choice_id: null })),
        questions: questionsForExam,
      };
      // TODO: Backend Integration - Storing 'currentExamSession' in localStorage is a temporary frontend solution.
      // For a robust system, the backend might create a pending exam session record.
      // Or, the exam player receives questions and submits them all at once.
      localStorage.setItem('currentExamSession', JSON.stringify(newExamSessionData)); 
      navigate('/student/exam-player');

    } catch (err) {
      console.error("Error starting exam:", err);
      setError(err instanceof Error ? err.message : UI_TEXTS.errorOccurred);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{UI_TEXTS.examSetup}</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">{error}</div>}
      {isLoadingAi && <LoadingSpinner message={examType === 'smart' ? UI_TEXTS.generatingQuestions : UI_TEXTS.loading} />}
      
      {!isLoadingAi && (
        <div className="bg-white p-8 rounded-lg shadow-xl space-y-6 max-w-lg mx-auto">
          <div> <Select label={UI_TEXTS.selectSpecialization} id="specialization" value={specializationId} onChange={e => setSpecializationId(e.target.value)} options={MOCK_SPECIALIZATIONS.map(spec => ({value: spec.id, label: spec.name}))}/> </div>
          <div> <Input type="number" label={UI_TEXTS.numberOfQuestions} id="numQuestions" value={numQuestions} onChange={e => setNumQuestions(Math.max(1, parseInt(e.target.value)))} min="1" max="50" /> </div>
          <div> <Select label={UI_TEXTS.examType} id="examType" value={examType} onChange={e => setExamType(e.target.value as ExamType)} options={[ {value: "standard", label: UI_TEXTS.standardExam}, {value: "smart", label: UI_TEXTS.smartExam} ]}/> </div>
          <Button onClick={handleStartExam} disabled={isLoadingAi} className="w-full text-lg"> {isLoadingAi ? UI_TEXTS.loading : UI_TEXTS.startExam} </Button>
        </div>
      )}
    </div>
  );
};

const ExamPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addExamSession } = useExams();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS); // Duration could come from AdminExamDefinition

  useEffect(() => {
    // TODO: Backend Integration - Retrieve current exam session if it's managed by backend,
    // or rely on data passed from ExamSetupPage (e.g., via location state or context).
    const storedSession = localStorage.getItem('currentExamSession');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession) as ExamSession;
      if (!parsedSession.questions || parsedSession.questions.length === 0) {
        localStorage.removeItem('currentExamSession');
        navigate('/student/exam-setup', {replace: true}); return;
      }
      setSession(parsedSession);
      // Potentially fetch duration from exam definition if available
      // e.g. if (parsedSession.admin_exam_definition_id) { const def = getAdminExamDefinitionById(parsedSession.admin_exam_definition_id); if (def) setTimeLeft(def.durationMinutes * 60) }
    } else { navigate('/student/exam-setup', {replace: true}); }
  }, [navigate]);

  const handleSubmitExam = useCallback(() => {
    if (!session || session.completed_at) return; // Prevent double submission
    
    // TODO: API Call - Replace this block with a POST /api/student/exam-sessions/submit/
    // The request body should contain session details and answers.
    // The backend will calculate the score and save the session.
    // `addExamSession` should be called with the response from the backend.
    
    let score = 0;
    const updatedAnswers = session.answers.map(ans => {
      const question = session.questions.find(q => q.id === ans.question_id);
      const correctChoice = question?.choices.find(c => c.is_correct);
      const isCorrect = ans.selected_choice_id === correctChoice?.id;
      if (isCorrect && question) { score += question.mark; }
      return { ...ans, is_correct_answer: isCorrect };
    });
    const completedSession: ExamSession = { ...session, answers: updatedAnswers, score, completed_at: new Date().toISOString() };
    
    addExamSession(completedSession); 
    localStorage.removeItem('currentExamSession');
    alert(UI_TEXTS.examSubmittedSuccessfully);
    navigate(`/student/results/${completedSession.id}`, {replace: true});
  }, [session, navigate, addExamSession]);

  useEffect(() => {
    if (!session || timeLeft <= 0 || session.completed_at) { 
        if (session && timeLeft <=0 && !session.completed_at ) { 
            const currentStoredSession = localStorage.getItem('currentExamSession'); 
            if(currentStoredSession) handleSubmitExam();
        }
        return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          const currentStoredSession = localStorage.getItem('currentExamSession');
          if(currentStoredSession && !JSON.parse(currentStoredSession).completed_at) { handleSubmitExam(); } 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, timeLeft, handleSubmitExam]);

  const handleSelectAnswer = (choiceId: string) => {
    if (!session || session.completed_at) return;
    const updatedAnswers = session.answers.map((ans, index) => index === currentQuestionIndex ? { ...ans, selected_choice_id: choiceId } : ans );
    const newSessionState = { ...session, answers: updatedAnswers };
    setSession(newSessionState);
    // Persist intermediate state in case of refresh - backend might handle this with periodic saves or draft submissions.
    localStorage.setItem('currentExamSession', JSON.stringify(newSessionState)); 
  };
  
  const triggerSubmitConfirmation = () => { if(window.confirm(UI_TEXTS.confirmSubmission)) { handleSubmitExam(); } }

  if (!session) return <LoadingSpinner message={UI_TEXTS.loading} />;
  const currentQuestion = session.questions[currentQuestionIndex];
  const currentAnswer = session.answers[currentQuestionIndex];
  if (!currentQuestion || !currentAnswer) { 
    console.error("ExamPlayer: Inconsistent session data", session, currentQuestionIndex);
    localStorage.removeItem('currentExamSession'); navigate('/student/exam-setup', {replace: true});
    return <LoadingSpinner message={UI_TEXTS.errorOccurred} />;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60); const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow-xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{session.exam_name || UI_TEXTS.examInProgress}</h1>
          <div className={`text-lg font-semibold flex items-center ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
            <i className={`${FaIcons.CLOCK} ml-1`}></i> {UI_TEXTS.timeLeft}: {formatTime(timeLeft)}
          </div>
        </div>
        <div className="text-md text-gray-600 mb-1">{UI_TEXTS.questionOutOf(currentQuestionIndex + 1, session.questions.length)}</div>
         <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6"> <div className="bg-primary h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%` }}></div> </div>
      </div>
      <QuestionDisplay question={currentQuestion} onSelectAnswer={handleSelectAnswer} selectedChoiceId={currentAnswer.selected_choice_id} />
      <div className="flex justify-between items-center mt-8">
        <Button onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))} disabled={currentQuestionIndex === 0} icon={FaIcons.CHEVRON_RIGHT}> {UI_TEXTS.prevQuestion} </Button>
        {currentQuestionIndex === session.questions.length - 1 ? (
          <Button onClick={triggerSubmitConfirmation} variant="success"> {UI_TEXTS.submitExam} </Button>
        ) : (
          <Button onClick={() => setCurrentQuestionIndex(i => Math.min(session.questions.length - 1, i + 1))} disabled={currentQuestionIndex === session.questions.length - 1 || !currentAnswer.selected_choice_id} icon={FaIcons.CHEVRON_LEFT}> {UI_TEXTS.nextQuestion} </Button>
        )}
      </div>
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  // TODO: API Call - `getExamSessionById` should fetch from GET /api/student/exam-sessions/<sessionId>/
  const { getExamSessionById } = useExams();
  const [session, setSession] = useState<ExamSession | null>(null);

  useEffect(() => {
    if (sessionId) {
        const foundSession = getExamSessionById(sessionId);
        if (foundSession) { setSession(foundSession); } 
        else { 
            // TODO: API Call - If session not found in local state, attempt to fetch from API before navigating.
            console.warn(`Session ${sessionId} not found in local context. Redirecting. Consider API fetch here.`);
            navigate('/student', {replace: true}); 
        }
    } else {
        navigate('/student', {replace: true});
    }
  }, [sessionId, navigate, getExamSessionById]);

  if (!session) return <LoadingSpinner message={UI_TEXTS.loading} />;
  const totalMarks = session.questions.reduce((sum, q) => sum + q.mark, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">{UI_TEXTS.examResults}</h1>
        <p className="text-lg text-gray-600 mb-1">اسم الامتحان: {session.exam_name || UI_TEXTS.standardExam}</p>
        <p className="text-2xl font-semibold text-gray-700 mb-2"> {UI_TEXTS.yourScore}: <span className="text-green-600">{session.score}</span> / {totalMarks} </p>
        <p className="text-gray-600"> {UI_TEXTS.dateCompleted}: {new Date(session.completed_at).toLocaleString('ar-EG')} </p>
         <p className="text-gray-600"> التخصص: {MOCK_SPECIALIZATIONS.find(s => s.id === session.specialization_id)?.name || session.specialization_id} </p>
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{UI_TEXTS.reviewAnswers}</h2>
      {session.questions.map((q, index) => {
        const studentAnswer = session.answers.find(ans => ans.question_id === q.id);
        return (
          <div key={q.id} className="mb-8">
             <h3 className="text-xl font-semibold text-gray-700 mb-2">{UI_TEXTS.question} {index + 1} ({q.mark} {q.mark === 1 ? 'علامة' : (q.mark >=2 && q.mark <=10) ? 'علامات' : 'علامة'})</h3>
            <QuestionDisplay question={q} selectedChoiceId={studentAnswer?.selected_choice_id || null} onSelectAnswer={() => {}} showCorrectAnswer={true} />
          </div>
        );
      })}
       <Button onClick={() => navigate('/student')} className="mt-8" icon={FaIcons.CHEVRON_RIGHT}> {UI_TEXTS.backToDashboard} </Button>
    </div>
  );
};


const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
    <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
    <h2 className="text-3xl font-semibold text-gray-700 mb-6">{UI_TEXTS.pageNotFound}</h2>
    <p className="text-gray-500 mb-8">عذرًا، الصفحة التي تبحث عنها غير موجودة.</p>
    <Link to="/" className="text-blue-600 hover:underline font-semibold text-lg">{UI_TEXTS.goHome}</Link>
  </div>
);

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    // This logic relies on user state being initialized (possibly from an API call in AuthProvider)
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);
  return <LoadingSpinner />; // Show loader while redirecting or checking auth state
};

// --- APP ---
function App() {
  const { user } = useAuth(); 
  const { 
    isAddQuestionModalOpen, editingQuestion, closeAddQuestionModal, 
    isAISettingsModalOpen, closeAISettingsModal, 
    isCreateExamModalOpen, editingExamDefinition, closeCreateExamModal 
  } = useModals();


  const location = useLocation();
  let headerTitle = UI_TEXTS.adminDashboard; 
  if (location.pathname.startsWith('/student/exam-setup')) headerTitle = UI_TEXTS.examSetup;
  else if (location.pathname.startsWith('/student/exam-player')) headerTitle = UI_TEXTS.examInProgress;
  else if (location.pathname.startsWith('/student/results')) headerTitle = UI_TEXTS.examResults;
  else if (location.pathname.startsWith('/student')) headerTitle = UI_TEXTS.studentDashboard;
  else if (location.pathname.startsWith('/admin')) headerTitle = UI_TEXTS.adminDashboard;
  

  const MainLayout: React.FC<{children: React.ReactNode}> = ({children}) => (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-grow md:mr-64"> 
            <Header title={headerTitle} />
            <main className="p-4">
                {children}
            </main>
             <footer className="bg-gray-200 text-gray-700 text-center p-4 mt-auto md:mr-64">
              © {new Date().getFullYear()} {UI_TEXTS.appName}. جميع الحقوق محفوظة.
            </footer>
        </div>
        {isAddQuestionModalOpen && <AddQuestionModal questionToEdit={editingQuestion} onClose={closeAddQuestionModal} />}
        {isAISettingsModalOpen && <AISettingsModal onClose={closeAISettingsModal} />}
        {isCreateExamModalOpen && <CreateExamModal examToEdit={editingExamDefinition} onClose={closeCreateExamModal} />}
    </div>
  );


  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* All routes below require user to be determined (either logged in or redirected to login) */}
        <Route path="/*" element={
          // This ternary logic might be simplified if RootRedirect handles the initial auth check and redirect
          // Or if ProtectedRoute itself handles the "no user" case by redirecting.
          user ? (
            <MainLayout>
              <Routes>
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                  <Route path="/student" element={<StudentDashboardPage />} />
                  <Route path="/student/exam-setup" element={<ExamSetupPage />} />
                  <Route path="/student/exam-player" element={<ExamPlayerPage />} />
                  <Route path="/student/results/:sessionId" element={<ResultsPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
                
                {/* Fallback for logged-in users hitting "/" or unknown authenticated routes */}
                <Route path="/" element={<RootRedirect />} /> 
                <Route path="*" element={<NotFoundPage />} /> 
              </Routes>
            </MainLayout>
          ) : (
             // If user is null (still loading or not logged in), these routes are available.
             // RootRedirect will handle "/" and send to /login if no user.
             <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<RootRedirect />} />
                <Route path="*" element={<NotFoundPage />} /> {/* Or redirect to login */}
             </Routes>
          )
        }/>
      </Routes>
  );
}

const WrappedApp = () => (
  <AuthProvider>
    <QuestionsProvider>
      <ExamsProvider> 
        <ModalProvider>
          <HashRouter> 
            <App />
          </HashRouter>
        </ModalProvider>
      </ExamsProvider>
    </QuestionsProvider>
  </AuthProvider>
);

export default WrappedApp;