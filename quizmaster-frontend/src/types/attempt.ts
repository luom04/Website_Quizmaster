export type QuestionType = "single" | "multiple";

export type AttemptStatus = "in_progress" | "submitted" | "timed_out";

export type QuizEventType =
  | "tab_blur"
  | "tab_focus"
  | "copy_attempt"
  | "right_click"
  | "auto_submitted";

export type StartAttemptRequest = {
  password?: string;
};

export type AttemptOption = {
  id: string;
  optionId: string;
  content: string;
  orderIndex: number;
};

export type AttemptQuestion = {
  id: string;
  questionId: string;
  content: string;
  type: QuestionType;
  orderIndex: number;
  selectedOptionIds: string[];
  options: AttemptOption[];
};

export type StartAttemptResponse = {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  deadlineAt: string;
  submittedAt?: string | null;
  totalQuestions: number;
  isExpired: boolean;
  questions: AttemptQuestion[];
};

export type AttemptForTaking = StartAttemptResponse;

export type SubmitAnswerItem = {
  attemptQuestionId: string;
  selectedOptionIds: string[];
};

export type SubmitAttemptRequest = {
  answers: SubmitAnswerItem[];
};

export type SubmitAttemptResponse = {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  isPassed: boolean;
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  timeSpentSeconds?: number | null;
};

export type AttemptResultOption = {
  id: string;
  optionId: string;
  content: string;
  orderIndex: number;
  selected: boolean;
  isCorrect?: boolean;
};

export type AttemptResultQuestion = {
  id: string;
  questionId: string;
  content: string;
  type: QuestionType;
  orderIndex: number;
  isCorrect?: boolean;
  options: AttemptResultOption[];
};

export type AttemptResult = {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  timeSpentSeconds: number | null;
  score: number;
  maxScore: number;
  totalQuestions: number;
  correctCount: number;
  isPassed: boolean | null;
  tabSwitchCount?: number;
  quiz: {
    id: string;
    title: string;
    showAnswer: boolean;
    passingScore: number | null;
  };
  questions: AttemptResultQuestion[];
};

export type AttemptHistoryItem = {
  id: string;
  attemptId?: string;
  quizId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  timeSpentSeconds: number | null;
  score: number | null;
  maxScore: number;
  totalQuestions: number;
  correctCount: number;
  isPassed: boolean | null;
  tabSwitchCount?: number;
  quiz: {
    id: string;
    title: string;
    durationMinutes: number;
    passingScore: number | null;
    showAnswer: boolean;
  };
};

export type AttemptHistoryQueryParams = {
  page?: number;
  limit?: number;
  status?: AttemptStatus;
  quizId?: string;
};

export type AttemptEvent = {
  id: string;
  attemptId: string;
  eventType: QuizEventType;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type LogAttemptEventRequest = {
  eventType: QuizEventType;
  metadata?: Record<string, unknown>;
};

export type AttemptEventsQueryParams = {
  page?: number;
  limit?: number;
  eventType?: QuizEventType;
};
