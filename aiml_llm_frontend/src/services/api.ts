import type {
  ReadingAnalysisRequest,
  AnalysisResult,
  ContentGenerationRequest,
  GeneratedContent,
  SimplifyTextRequest,
  SimplifiedText,
  TranslateRequest,
  TranslationResult,
  ReadingTips,
  HealthResponse,
  SupportedLanguagesResponse,
  DifficultyGuideResponse,
} from '../types/api';

import type {
  BackendAnalysisResult,
  BackendGeneratedContent,
  BackendSimplifiedText,
  BackendTranslationResult,
  BackendReadingTips,
  BackendHealth,
  BackendSupportedLanguages,
  BackendDifficultyGuide,
} from '../types/backend';

const API_BASE_URL = 'http://localhost:8000/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export const api = {
  analyzeReading: async (data: ReadingAnalysisRequest): Promise<AnalysisResult> => {
    const backendResult = await fetchAPI<BackendAnalysisResult>('/analyze-reading', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('Backend analyze-reading result:', backendResult);

    // Calculate word positions for pronunciation errors
    const words = data.originalText.split(' ');
    const wordPositionMap = new Map<string, number[]>();
    words.forEach((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      if (cleanWord) {
        if (!wordPositionMap.has(cleanWord)) {
          wordPositionMap.set(cleanWord, []);
        }
        wordPositionMap.get(cleanWord)!.push(index);
      }
    });

    // Map pronunciation errors with calculated positions
    const pronunciationErrorsWithPositions = (backendResult.pronunciationErrors || []).map((err, idx) => {
      const cleanWord = err.originalWord.toLowerCase();
      const positions = wordPositionMap.get(cleanWord) || [];
      const position = positions[idx % positions.length] || idx;
      return {
        ...err,
        position
      };
    });

    return {
      feedbackMessage: backendResult.feedbackMessage,
      encouragement: backendResult.encouragement,
      overallScore: backendResult.overallScore,
      pronunciationErrors: pronunciationErrorsWithPositions,
      missingWords: backendResult.missingWords || [],
      vocabularyItems: backendResult.vocabularyItems || [],
      grammarErrors: backendResult.grammarErrors || [],
      accuracyPercentage: backendResult.accuracyPercentage,
      totalWordsRead: backendResult.totalWordsRead,
      correctWordsCount: backendResult.correctWordsCount,
      errorCount: backendResult.errorCount,
      practiceWords: backendResult.practiceWords || [],
      focusAreas: backendResult.focusAreas || [],
      nextSteps: backendResult.nextSteps
    };
  },

  generateContent: async (data: ContentGenerationRequest): Promise<GeneratedContent> => {
    const backendResult = await fetchAPI<BackendGeneratedContent>('/generate-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('Backend generate-content result:', backendResult);

    return {
      title: backendResult.title || 'New Story',
      text: backendResult.text,
      difficulty: backendResult.difficulty,
      ageRange: backendResult.ageRange,
      topic: backendResult.topic,
      comprehensionQuestions: backendResult.comprehensionQuestions.map(q => ({
        question: q,
        answer: '' // Backend doesn't provide answers
      })),
      wordBank: backendResult.vocabularyWords || []
    };
  },

  simplifyText: async (data: SimplifyTextRequest): Promise<SimplifiedText> => {
    const backendResult = await fetchAPI<BackendSimplifiedText>('/simplify-text', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      originalText: backendResult.originalText,
      simplifiedText: backendResult.simplifiedText,
      readingLevel: backendResult.targetLevel,
      simplifications: [backendResult.changesExplanation]
    };
  },

  translate: async (data: TranslateRequest): Promise<TranslationResult> => {
    const backendResult = await fetchAPI<BackendTranslationResult>('/translate', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      originalText: backendResult.originalText,
      translatedText: backendResult.translatedText,
      sourceLanguage: 'Detected', // Backend doesn't provide
      targetLanguage: backendResult.targetLanguage,
      pronunciationGuide: backendResult.pronunciation,
      sentenceBreakdown: [] // Backend doesn't provide
    };
  },

  getTips: async (analysisResult: AnalysisResult): Promise<ReadingTips> => {
    // We pass the analysis result which now matches backend structure better,
    // but the backend endpoint might expect specific keys.
    // Given the previous mismatches, it's safer to just forward the whole object 
    // if the backend is flexible, OR construct exactly what it needs.
    // Based on Groq logic, it likely consumes the same structure it produces.

    // However, to be safe and match the likely expected input for /get-tips:
    const requestBody = {
      overallScore: analysisResult.overallScore,
      accuracy: analysisResult.accuracyPercentage,
      errors: [
        // Flatten errors back to mixed list if backend expects that legacy format?
        // Unknown. But let's assume it accepts the modern decomposed format if it PRODUCES it.
        // Actually, let's just send what we have.
      ],
      // Wait, let's keep the existing logic for getTips but map correctly from our new AnalysisResult
      // to the 'legacy' structure if that's what backend expects on INPUT?
      // Or maybe backend /get-tips input also matches the new structure?
      // Let's assume input structure should maximize compatibility.

      // Let's assume /get-tips takes the SAME structure as the output of /analyze-reading
      ...analysisResult
    };

    // The previous implementation tried to map back to 'legacy' errors list.
    // Let's rely on the previous implementation for getTips for now, but update property access.

    const legacyRequestBody = {
      overallScore: analysisResult.overallScore,
      accuracy: analysisResult.accuracyPercentage,
      errors: [
        ...analysisResult.pronunciationErrors.map(e => ({
          type: 'pronunciation',
          original: e.originalWord,
          spoken: e.spokenAs
        })),
        ...analysisResult.grammarErrors.map(e => ({
          type: 'grammar',
          original: e.correctPhrase,
          spoken: e.incorrectPhrase,
          correction: e.correctPhrase,
          explanation: e.simpleExplanation
        }))
      ],
      vocabulary: analysisResult.vocabularyItems.map(v => ({
        word: v.word,
        definition: v.simpleDefinition,
        example: v.exampleSentence
      })),
      feedbackMessage: analysisResult.feedbackMessage,
      practiceItems: analysisResult.practiceWords.map(w => ({
        text: w,
        comment: 'Practice word' // Placeholder
      }))
    };

    const backendResult = await fetchAPI<BackendReadingTips>('/get-tips', {
      method: 'POST',
      body: JSON.stringify(legacyRequestBody),
    });

    return {
      tips: backendResult.tips,
      exercises: backendResult.exercises,
      parentGuidance: [backendResult.parentGuidance]
    };
  },

  checkHealth: async (): Promise<HealthResponse> => {
    const result = await fetchAPI<BackendHealth>('/health');
    return result;
  },

  getSupportedLanguages: async (): Promise<SupportedLanguagesResponse> => {
    const result = await fetchAPI<BackendSupportedLanguages>('/supported-languages');
    return result;
  },

  getDifficultyGuide: async (): Promise<DifficultyGuideResponse> => {
    const result = await fetchAPI<BackendDifficultyGuide>('/difficulty-guide');
    return {
      levels: {
        easy: result.levels.easy,
        medium: result.levels.medium,
        hard: result.levels.hard
      }
    };
  },
};
