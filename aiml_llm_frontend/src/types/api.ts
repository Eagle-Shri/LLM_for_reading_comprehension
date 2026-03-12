export interface ReadingAnalysisRequest {
  originalText: string;
  spokenText: string;
  includeVocabulary?: boolean;
  includeGrammar?: boolean;
}

export interface PronunciationError {
  originalWord: string;
  spokenAs: string;
  phonetic?: string;
  tip?: string;
  position?: number;
}

export interface VocabularyItem {
  word: string;
  simpleDefinition: string;
  exampleSentence: string;
}

export interface GrammarError {
  incorrectPhrase: string;
  correctPhrase: string;
  errorType?: string;
  explanation?: string;
  simpleExplanation: string;
  exampleSentence?: string;
}

export interface AnalysisResult {
  feedbackMessage: string;
  encouragement: string;
  overallScore: number;
  pronunciationErrors: PronunciationError[];
  missingWords: Array<{
    word: string;
    position: number;
    context: string;
  }>;
  vocabularyItems: VocabularyItem[];
  grammarErrors: GrammarError[];
  accuracyPercentage: number;
  totalWordsRead?: number;
  correctWordsCount?: number;
  errorCount?: number;
  practiceWords: string[];
  focusAreas: string[];
  nextSteps: string;
}

export interface ContentGenerationRequest {
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  ageRange?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface ComprehensionQuestion {
  question: string;
  answer: string;
}

export interface GeneratedContent {
  title: string;
  text: string;
  difficulty: string;
  ageRange?: string;
  topic?: string;
  comprehensionQuestions: ComprehensionQuestion[];
  wordBank: string[];
}

export interface SimplifyTextRequest {
  text: string;
  targetLevel: string;
}

export interface SimplifiedText {
  originalText: string;
  simplifiedText: string;
  readingLevel: string;
  simplifications?: string[];
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  includePronunciation?: boolean;
}

export interface SentenceTranslation {
  originalSentence: string;
  translatedSentence: string;
  simplifiedExplanation: string;
  wordByWord?: Array<{
    original: string;
    translation: string;
  }>;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  pronunciationGuide?: string;
  sentenceBreakdown?: SentenceTranslation[];
}

export interface ReadingTips {
  tips: string[];
  exercises: string[];
  parentGuidance: string[];
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface SupportedLanguagesResponse {
  languages: string[];
  note: string;
}

export interface DifficultyLevel {
  ageRange: string;
  description: string;
}

export interface DifficultyGuideResponse {
  levels: {
    easy: DifficultyLevel;
    medium: DifficultyLevel;
    hard: DifficultyLevel;
  };
}
