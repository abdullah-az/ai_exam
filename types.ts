
export interface Specialization {
  id: string;
  name: string;
}

export interface Choice {
  id: string;
  text: string;
  is_correct: boolean;
}

export enum AttachmentType {
  IMAGE = "image",
  CODE = "code",
  DIAGRAM = "diagram",
  TEXT = "text",
}

export interface Attachment {
  id:string;
  file_url: string; // Using URL for simplicity in frontend
  attachment_type: AttachmentType;
  file_name?: string; // Optional: for display
  content?: string; // For code or text attachments
}

export interface Question {
  id: string;
  text: string;
  specialization_id: string;
  course_year: number;
  mark: number;
  is_ai_generated: boolean;
  choices: Choice[];
  attachments?: Attachment[];
}

// For AI generation request and response
export interface GeneratedQuestionPayload {
  text: string;
  choices: Array<{ text: string; is_correct: boolean }>;
  course_year: number;
  mark: number;
}

export interface StudentAnswer {
  question_id: string;
  selected_choice_id: string | null;
  is_correct_answer?: boolean; // Calculated on submission
}

export interface ExamSession {
  id: string;
  student_id: string; // Mocked
  specialization_id: string; // Could be from AdminExamDefinition
  admin_exam_definition_id?: string; // Link to the defined exam
  exam_name?: string; // Copied from AdminExamDefinition for display ease
  score: number;
  completed_at: string; // ISO date string
  answers: StudentAnswer[];
  questions: Question[]; // Questions included in this session
}

export interface AISettings {
  selected_model: string;
  // API key is handled by process.env.API_KEY, not stored in frontend state
}

export type UserRole = 'student' | 'admin' | null;

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export type ExamType = 'standard' | 'smart';

export interface ExamConfig {
  specialization_id: string;
  num_questions: number;
  type: ExamType;
}

export interface AdminQuestionFormValues extends Omit<Question, 'id' | 'is_ai_generated' | 'choices' | 'attachments'> {
  id?: string; // Present if editing
  choices: Array<Omit<Choice, 'id'> & { id?: string }>; // id optional for new choices
  attachments: Array<Omit<Attachment, 'id'> & { id?: string }>; // id optional for new attachments
}

// New types for Admin Defined Exams
export interface ExamSettingOptions {
  showResultImmediately: boolean;
  allowRetries: boolean;
  allowNavigateBack: boolean;
  allowAutoGrading: boolean;
}

export interface AdminExamDefinition {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  passingGradePercent: number;
  settings: ExamSettingOptions;
  specialization_id: string; 
  createdAt: string; // ISO date string
  // Future: could store an array of question IDs or tags for question selection
}
