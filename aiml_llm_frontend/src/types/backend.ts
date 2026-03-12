export interface BackendAnalysisResult {
    feedbackMessage: string;
    encouragement: string;
    overallScore: number;
    pronunciationErrors: Array<{
        originalWord: string;
        spokenAs: string;
        phonetic?: string;
        tip?: string;
    }>;
    vocabularyItems: Array<{
        word: string;
        meaning: string;
        simpleDefinition: string;
        exampleSentence: string;
        difficulty: string;
    }>;
    grammarErrors: Array<{
        incorrectPhrase: string;
        correctPhrase: string;
        errorType: string;
        explanation: string;
        simpleExplanation: string;
    }>;
    missingWords: Array<{
        word: string;
        position: number;
        context: string;
    }>;
    accuracyPercentage: number;
    totalWordsRead: number;
    correctWordsCount: number;
    errorCount: number;
    practiceWords: string[];
    focusAreas: string[];
    nextSteps: string;
}

export interface BackendGeneratedContent {
    title: string;
    text: string;
    difficulty: string;
    ageRange: string;
    topic: string;
    comprehensionQuestions: string[];
    vocabularyWords: string[];
    wordBank: Array<{
        word: string;
        definition: string;
        example: string;
    }>;
    estimatedReadingTime: string;
    focusSkills: string[];
}

export interface BackendSimplifiedText {
    originalText: string;
    simplifiedText: string;
    targetLevel: string;
    changesExplanation: string;
}

export interface BackendTranslationResult {
    originalText: string;
    translatedText: string;
    targetLanguage: string;
    pronunciation: string;
}

export interface BackendReadingTips {
    tips: string[];
    exercises: string[];
    parentGuidance: string;
}

export interface BackendDifficultyGuide {
    levels: {
        [key: string]: {
            ageRange: string;
            description: string;
            wordCount: string;
            examples: string[];
        };
    };
}

export interface BackendSupportedLanguages {
    languages: string[];
    note: string;
}

export interface BackendHealth {
    status: string;
    service: string;
    version: string;
}
