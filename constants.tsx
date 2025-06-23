import React from 'react';
import { Specialization, Question, AttachmentType, AISettings, AdminExamDefinition, ExamSettingOptions } from './types';

export const UI_TEXTS = {
  appName: "منصة امتحانات هندسة المعلوماتية الموحدة",
  login: "تسجيل الدخول",
  register: "تسجيل حساب جديد",
  username: "اسم المستخدم",
  password: "كلمة المرور", 
  confirmPassword: "تأكيد كلمة المرور",
  email: "البريد الإلكتروني",
  role: "الدور",
  student: "طالب",
  admin: "مسؤول",
  registerButton: "تسجيل",
  alreadyHaveAccount: "لديك حساب بالفعل؟",
  dontHaveAccount: "ليس لديك حساب؟",
  studentDashboard: "لوحة تحكم الطالب",
  adminDashboard: "لوحة التحكم", // Updated to match new design
  startNewExam: "بدء امتحان جديد",
  pastExams: "الامتحانات السابقة",
  examSetup: "إعدادات الامتحان",
  selectSpecialization: "اختر التخصص",
  numberOfQuestions: "عدد الأسئلة",
  examType: "نوع الامتحان",
  standardExam: "امتحان قياسي",
  smartExam: "امتحان ذكي (AI)",
  startExam: "ابدأ الامتحان",
  submitExam: "إرسال الإجابات",
  nextQuestion: "السؤال التالي",
  prevQuestion: "السؤال السابق",
  timeLeft: "الوقت المتبقي",
  examResults: "نتائج الامتحان",
  yourScore: "درجتك",
  reviewAnswers: "مراجعة الإجابات",
  question: "سؤال",
  yourAnswer: "إجابتك",
  correctAnswer: "الإجابة الصحيحة",
  adminSettings: "الإعدادات", // Updated
  aiModel: "نموذج الذكاء الاصطناعي",
  saveSettings: "حفظ الإعدادات",
  settingsSaved: "تم حفظ الإعدادات بنجاح!",
  generatingQuestions: "جاري إنشاء الأسئلة باستخدام الذكاء الاصطناعي...",
  loading: "جاري التحميل...",
  errorOccurred: "حدث خطأ",
  noQuestionsAvailable: "لا توجد أسئلة متاحة لهذا التخصص.",
  confirmSubmission: "هل أنت متأكد من أنك تريد إرسال إجاباتك؟",
  examSubmittedSuccessfully: "تم إرسال الامتحان بنجاح!",
  backToDashboard: "العودة إلى لوحة التحكم",
  selectChoice: "الرجاء تحديد اختيار",
  adminPanel: "لوحة المسؤول", // Used in Navbar
  studentPanel: "لوحة الطالب", // Used in Navbar
  switchView: "تبديل العرض",
  apiKeyMissing: "مفتاح API الخاص بـ Gemini غير متوفر. يرجى التأكد من تعيين متغير البيئة API_KEY.",
  attachments: "المرفقات",
  code: "كود برمجي",
  image: "صورة",
  diagram: "مخطط",
  text: "ملف نصي",
  viewAttachment: "عرض المرفق",
  currentAiModel: "نموذج الذكاء الاصطناعي الحالي",
  aiModelDescription: "يتم استخدام هذا النموذج لإنشاء أسئلة 'الامتحان الذكي'. يتم توفير مفتاح API عبر متغيرات البيئة.",
  noPastExams: "ليس لديك أي امتحانات سابقة.",
  examID: "معرف الامتحان",
  score: "الدرجة",
  dateCompleted: "تاريخ الإكمال",
  action: "الإجراءات", // Updated
  viewResults: "عرض النتائج",
  welcomeStudent: "مرحباً بك في لوحة تحكم الطالب!",
  welcomeAdmin: "مرحباً بك في لوحة تحكم المسؤول!",
  examInProgress: "الامتحان قيد التنفيذ",
  questionOutOf: (current: number, total: number) => `سؤال ${current} من ${total}`,
  finalScore: (score: number, totalMarks: number) => `النتيجة النهائية: ${score} / ${totalMarks}`,
  logout: "تسجيل الخروج",
  loginPrompt: "الرجاء تسجيل الدخول للمتابعة.",
  pageNotFound: "الصفحة غير موجودة",
  goHome: "العودة للرئيسية",
  manageQuestions: "إدارة الأسئلة",
  addQuestion: "إضافة سؤال جديد",
  editQuestion: "تعديل السؤال",
  deleteQuestion: "حذف السؤال",
  confirmDeleteQuestion: "هل أنت متأكد أنك تريد حذف هذا السؤال؟",
  questionDeleted: "تم حذف السؤال بنجاح.",
  questionSaved: "تم حفظ السؤال بنجاح.",
  questionText: "نص السؤال",
  courseYear: "سنة المقرر", // Or "السنة" as in new design
  mark: "العلامة",
  choices: "الاختيارات", // Or "خيارات الإجابة"
  addChoice: "إضافة اختيار",
  removeChoice: "إزالة الاختيار",
  isCorrect: "صحيح؟",
  addAttachment: "إضافة مرفق",
  removeAttachment: "إزالة المرفق",
  fileName: "اسم الملف",
  fileURL: "رابط الملف/المحتوى", // Or "رابط الملف" for images
  attachmentType: "نوع المرفق",
  saveQuestion: "حفظ السؤال",
  cancel: "إلغاء",
  filterBySpecialization: "فلترة حسب التخصص",
  filterByCourseYear: "فلترة حسب سنة المقرر",
  allSpecializations: "جميع التخصصات",
  noQuestionsMatchFilters: "لا توجد أسئلة تطابق معايير الفلترة.",
  questionsList: "قائمة الأسئلة",
  selectAiModel: "اختر نموذج الذكاء الاصطناعي",
  questionId: "معرف السؤال",
  aiGenerated: "مولد بالـ AI",
  yes: "نعم",
  no: "لا",
  generateFromPDF: "إنشاء أسئلة من ملف PDF",
  uploadPDFFile: "رفع ملف PDF",
  selectPDFFile: "اختر ملف PDF...",
  processingPDF: "جاري معالجة ملف PDF...",
  pdfProcessedGeneratingQuestions: "تمت معالجة PDF، جاري إنشاء الأسئلة...",
  questionsGeneratedAndAdded: "سؤال/أسئلة تم إنشاؤها وإضافتها بنجاح.",
  errorProcessingPDF: "خطأ أثناء معالجة ملف PDF.",
  noFileSelected: "لم يتم اختيار أي ملف.",
  generateQuestionsFromPDFButton: "إنشاء أسئلة من PDF",
  pdfFeatureDescription: "قم برفع ملف PDF لاستخراج محتواه وإنشاء أسئلة ذات صلة بواسطة الذكاء الاصطناعي.",
  studentPdfFeatureTitle: "أداة إنشاء أسئلة من PDF (للمذاكرة)",
  studentPdfFeatureDescription: "هل لديك ملف PDF لمادة دراسية؟ قم برفعه هنا وسيحاول النظام إنشاء أسئلة لمساعدتك في المراجعة. الأسئلة المولدة ستكون متاحة لك (وفي النظام بشكل عام).",

  // New texts from the design
  platformTitleShort: "منصة الامتحانات",
  sidebarManageUsers: "إدارة المستخدمين",
  sidebarAttachments: "المرفقات", // Already exists
  sidebarExams: "الامتحانات",
  sidebarManageExams: "إدارة الامتحانات",
  sidebarSettings: "الإعدادات", // Already adminSettings
  sidebarAI: "الذكاء الاصطناعي",
  headerNotifications: "الإشعارات", // Placeholder for icon
  statsTotalQuestions: "عدد الأسئلة",
  statsTotalStudents: "عدد الطلاب",
  statsSubmittedExams: "الامتحانات المقدمة",
  statsAIQuestions: "أسئلة الذكاء الاصطناعي",
  statsDefinedExams: "الامتحانات المعرفة", // New Stat
  statsGrowthLastMonth: (percentage: number) => `${percentage}% عن الشهر الماضي`,
  tabRecentQuestions: "الأسئلة الحديثة", // Will be updated to "Manage Questions" effectively
  tabRecentExams: "الامتحانات الأخيرة",
  tabNewStudents: "الطلاب الجدد",
  tabManageExams: "إدارة الامتحانات", // Same as sidebarManageExams
  recentQuestionsTitle: "آخر الأسئلة المضافة", // Will be updated
  recentExamsTitle: "آخر الامتحانات المقدمة",
  newStudentsTitle: "الطلاب المسجلين حديثاً",
  addNewQuestion: "إضافة سؤال جديد", // same as addQuestion
  createExam: "إنشاء امتحان جديد",
  editExam: "تعديل امتحان",
  examName: "اسم الامتحان",
  examDuration: "المدة (دقيقة)",
  examStatus: "الحالة",
  examStatusActive: "نشط",
  examStatusDraft: "قيد الإنشاء",
  view: "عرض", // For view icon
  edit: "تعديل", // For edit icon
  delete: "حذف", // For delete icon
  examPassingGrade: "النجاح (%)",
  examDescription: "وصف الامتحان",
  examSettings: "إعدادات الامتحان",
  settingShowResultImmediately: "عرض النتيجة فور الانتهاء",
  settingAllowRetries: "السماح بإعادة المحاولة",
  settingAllowNavigateBack: "السماح بالرجوع للأسئلة",
  settingAllowAutoGrading: "السماح بالتصحيح الآلي",
  saveExam: "حفظ الامتحان",
  aiSettingsTitle: "إعدادات الذكاء الاصطناعي",
  apiKey: "مفتاح API",
  apiKeyDescription: "سيتم تخزين المفتاح بشكل آمن في قاعدة البيانات",
  generateQuestionsFromPDFLabel: "توليد الأسئلة من ملف PDF",
  uploadPDFPrompt: "انقر لرفع ملف PDF أو اسحب الملف هنا",
  uploadPDFHint: "الصور، الكود، النصوص، الرسومات (حتى 5MB)", // for question attachments
  uploadPDFHintAI: "حدد ملف PDF لاستخراج الأسئلة منه (حتى 10MB)", // for AI PDF
  markGeneratedAsAI: "تمييز الأسئلة المولدة بأنها من الذكاء الاصطناعي",
  testConnection: "اختبار الاتصال",
  choicesLabel: "خيارات الإجابة",
  optionPlaceholder: (num: number) => `الخيار ${num}`,
  uploadFilePrompt: "انقر لرفع ملف",
  mobileMenu: "القائمة",
  close: "إغلاق",
  noExamsDefined: "لا توجد امتحانات معرفة حتى الآن.",
  confirmDeleteExam: "هل أنت متأكد أنك تريد حذف هذا الامتحان؟",
  examDeleted: "تم حذف الامتحان بنجاح.",
  examSaved: "تم حفظ الامتحان بنجاح.",
  studentName: "اسم الطالب",
  studentEmail: "بريد الطالب",
  registrationDate: "تاريخ التسجيل",
  noStudentsRegistered: "لا يوجد طلاب مسجلون حديثاً (بيانات وهمية).",
  noExamSessions: "لا توجد أي جلسات امتحان مسجلة.",
  takenBy: "مقدم بواسطة",
  allCourseYears: "جميع السنوات",
  searchQuestionText: "ابحث في نص السؤال...",
  clearFilters: "مسح الفلاتر",
};

export const MOCK_SPECIALIZATIONS: Specialization[] = [
  { id: 'swe', name: 'هندسة البرمجيات' },
  { id: 'net', name: 'هندسة الشبكات' },
  { id: 'ai', name: 'الذكاء الاصطناعي' },
  { id: 'gen', name: 'عام' },
];

export const MOCK_ADMIN_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'ما هي الوظيفة الأساسية لبروتوكول TCP في نموذج OSI؟',
    specialization_id: 'net',
    course_year: 2023,
    mark: 5,
    is_ai_generated: false,
    choices: [
      { id: 'q1c1', text: 'توجيه الرزم بين الشبكات المختلفة', is_correct: false },
      { id: 'q1c2', text: 'ضمان تسليم البيانات بشكل موثوق ومنظم', is_correct: true },
      { id: 'q1c3', text: 'تحويل أسماء النطاقات إلى عناوين IP', is_correct: false },
      { id: 'q1c4', text: 'إدارة عنونة الأجهزة على المستوى الفيزيائي', is_correct: false },
    ],
    attachments: [
      { id: 'att1', file_url: 'https://picsum.photos/seed/q1att1/400/200', attachment_type: AttachmentType.IMAGE, file_name: 'OSI_Model.png'}
    ]
  },
  {
    id: 'q2',
    text: 'أي من هياكل البيانات التالية يعمل بمبدأ "الداخل أولاً، يخرج أخيراً" (LIFO)؟',
    specialization_id: 'swe',
    course_year: 2023,
    mark: 5,
    is_ai_generated: false,
    choices: [
      { id: 'q2c1', text: 'الطابور (Queue)', is_correct: false },
      { id: 'q2c2', text: 'المكدس (Stack)', is_correct: true },
      { id: 'q2c3', text: 'القائمة المتصلة (Linked List)', is_correct: false },
      { id: 'q2c4', text: 'الشجرة (Tree)', is_correct: false },
    ],
  },
   {
    id: 'q3',
    text: 'ما هي نتيجة تنفيذ الكود التالي بلغة Python؟\n```python\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)\n```',
    specialization_id: 'swe',
    course_year: 2024,
    mark: 2, 
    is_ai_generated: false,
    choices: [
      { id: 'q3c1', text: '[1, 2, 3]', is_correct: false },
      { id: 'q3c2', text: '[1, 2, 3, 4]', is_correct: true },
      { id: 'q3c3', text: '[1, 2, 3, [4]]', is_correct: false },
      { id: 'q3c4', text: 'خطأ في الكود', is_correct: false },
    ],
    attachments: [
      { id: 'att2', file_url: '', content: 'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)', attachment_type: AttachmentType.CODE, file_name: 'script.py'}
    ]
  },
   {
    id: 'q4',
    text: 'ما هو البروتوكول المستخدم في نقل البريد الإلكتروني؟',
    specialization_id: 'net',
    course_year: 2023,
    mark: 1, 
    is_ai_generated: true, 
    choices: [
      { id: 'q4c1', text: 'HTTP', is_correct: false },
      { id: 'q4c2', text: 'SMTP', is_correct: true },
      { id: 'q4c3', text: 'FTP', is_correct: false },
      { id: 'q4c4', text: 'DNS', is_correct: false },
    ],
  },
  {
    id: 'q5',
    text: 'ما هي خوارزمية التعلم العميق الأكثر استخداماً في معالجة الصور؟',
    specialization_id: 'ai',
    course_year: 2022,
    mark: 3, 
    is_ai_generated: false,
    choices: [
      { id: 'q5c1', text: 'Recurrent Neural Networks (RNN)', is_correct: false },
      { id: 'q5c2', text: 'Convolutional Neural Networks (CNN)', is_correct: true },
      { id: 'q5c3', text: 'Support Vector Machines (SVM)', is_correct: false },
      { id: 'q5c4', text: 'K-Nearest Neighbors (KNN)', is_correct: false },
    ],
  }
];

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
export const AVAILABLE_AI_MODELS = [
    { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash (Preview)' },
];
export const DEFAULT_AI_SETTINGS: AISettings = {
  selected_model: GEMINI_MODEL_NAME,
};
export const EXAM_DURATION_SECONDS = 30 * 60; // 30 minutes
export const PDF_TEXT_MAX_LENGTH = 50000; // Character limit for PDF text to send to AI

export const FaIcons = {
  DASHBOARD: "fas fa-tachometer-alt",
  QUESTIONS: "fas fa-question-circle",
  USERS: "fas fa-users",
  ATTACHMENTS: "fas fa-paperclip",
  EXAMS: "fas fa-graduation-cap",
  MANAGE_EXAMS: "fas fa-clipboard-list",
  SETTINGS: "fas fa-cog",
  AI: "fas fa-robot",
  LOGOUT: "fas fa-sign-out-alt",
  USER_PROFILE: "fas fa-user",
  BELL: "fas fa-bell",
  PLUS: "fas fa-plus",
  EDIT: "fas fa-edit",
  TRASH: "fas fa-trash",
  VIEW: "fas fa-eye", // Eye icon
  ARROW_UP: "fas fa-arrow-up",
  CLOCK: "fas fa-clock",
  CHECK_CIRCLE: "fas fa-check-circle", // For correct answers
  X_CIRCLE: "fas fa-times-circle", // For incorrect answers
  CHEVRON_LEFT: "fas fa-chevron-left", // RTL next
  CHEVRON_RIGHT: "fas fa-chevron-right", // RTL prev
  UPLOAD: "fas fa-cloud-upload-alt", // For file uploads
  PDF_FILE: "fas fa-file-pdf",
  BARS: "fas fa-bars", // Mobile menu
  TIMES: "fas fa-times", // Close button
  LIST_BULLET: "fas fa-list-ul", // Generic list
  PLUS_CIRCLE: "fas fa-plus-circle",
  PENCIL_SQUARE: "fas fa-pencil-alt", // Or fa-edit
  DOCUMENT_TEXT: "fas fa-file-alt", // For start new exam
  FILTER: "fas fa-filter",
  SEARCH: "fas fa-search",
  RECYCLE: "fas fa-recycle"
};

export const MOCK_EXAM_SETTINGS_DEFAULT: ExamSettingOptions = {
  showResultImmediately: true,
  allowRetries: false,
  allowNavigateBack: true,
  allowAutoGrading: true,
};

export const MOCK_ADMIN_EXAM_DEFINITIONS: AdminExamDefinition[] = [
  {
    id: 'exam-def-1',
    name: 'امتحان هندسة البرمجيات النهائي',
    description: 'امتحان شامل لمادة هندسة البرمجيات للسنة الثالثة.',
    durationMinutes: 90,
    passingGradePercent: 60,
    specialization_id: 'swe',
    settings: { ...MOCK_EXAM_SETTINGS_DEFAULT },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
  },
  {
    id: 'exam-def-2',
    name: 'اختبار سريع في الشبكات',
    description: 'اختبار قصير لمراجعة أساسيات بروتوكولات الشبكات.',
    durationMinutes: 30,
    passingGradePercent: 70,
    specialization_id: 'net',
    settings: { ...MOCK_EXAM_SETTINGS_DEFAULT, allowRetries: true },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
];