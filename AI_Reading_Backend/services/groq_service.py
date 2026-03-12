import os
import json
import logging
from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# ============= CONFIGURE LOGGING =============
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= RESPONSE MODELS =============

class PronunciationError(BaseModel):
    """Represents a word that was mispronounced"""
    originalWord: str
    spokenAs: str
    phonetic: Optional[str] = None
    tip: Optional[str] = None

class VocabularyItem(BaseModel):
    """Vocabulary word with meaning for language learning"""
    word: str
    meaning: str
    simpleDefinition: str
    exampleSentence: str
    difficulty: str  # "easy", "medium", "hard"

class GrammarError(BaseModel):
    """Grammar mistakes in spoken text"""
    incorrectPhrase: str
    correctPhrase: str
    errorType: str  # e.g., "verb tense", "subject-verb agreement"
    explanation: str
    simpleExplanation: str  # Child-friendly explanation

class MissingWord(BaseModel):
    """Words that were skipped or not read"""
    word: str
    position: int
    context: str

class ReadingFluency(BaseModel):
    """Fluency metrics for reading assessment"""
    wordsPerMinute: Optional[int] = None
    pausesCount: Optional[int] = None
    smoothness: str  # "excellent", "good", "needs practice"
    confidence: str  # "confident", "hesitant", "struggling"

class AnalysisResult(BaseModel):
    """Comprehensive reading analysis result"""
    feedbackMessage: str
    encouragement: str
    overallScore: float  # 0-100
    
    # Detailed analysis
    pronunciationErrors: List[PronunciationError]
    vocabularyItems: List[VocabularyItem]
    grammarErrors: List[GrammarError]
    missingWords: List[MissingWord]
    
    # Metrics
    accuracyPercentage: float
    totalWordsRead: int
    correctWordsCount: int
    errorCount: int
    
    # Fluency (optional, for future speech-to-text integration)
    fluency: Optional[ReadingFluency] = None
    
    # Practice recommendations
    practiceWords: List[str]
    focusAreas: List[str]
    nextSteps: str

class GeneratedContent(BaseModel):
    """AI-generated reading content for practice"""
    title: str
    text: str
    difficulty: str
    ageRange: str
    topic: str
    
    # Educational metadata
    vocabularyWords: List[str]
    focusSkills: List[str]
    estimatedReadingTime: str
    
    # Optional support materials
    comprehensionQuestions: Optional[List[str]] = None
    wordBank: Optional[List[VocabularyItem]] = None

class SimplifiedText(BaseModel):
    """Simplified version of text for early learners"""
    originalText: str
    simplifiedText: str
    readingLevel: str
    simplifications: List[str]

class TranslationResult(BaseModel):
    """Text translation for multilingual support"""
    originalText: str
    translatedText: str
    sourceLanguage: str
    targetLanguage: str
    pronunciationGuide: Optional[str] = None

class ReadingTips(BaseModel):
    """Personalized reading tips based on analysis"""
    tips: List[str]
    exercises: List[str]
    parentGuidance: str

# ============= GROQ SERVICE =============

class GroqService:
    def __init__(self):
        logger.info("Initializing GroqService...")
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.error("GROQ_API_KEY not found in environment variables")
            raise ValueError("GROQ_API_KEY not found in .env file")
        
        # Key loaded successfully (logging suppressed for security)
        
        try:
            self.client = Groq(api_key=api_key)
            logger.info("Groq client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            raise

        # Model to use for all operations
        self.model = "llama-3.3-70b-versatile"
        logger.info(f"Using model: {self.model}")

        # ===== SYSTEM PROMPTS =====
        self.analysis_system_prompt = """You are an expert reading tutor specialized in early childhood literacy. Your role is to:

1. **Analyze reading performance** by comparing original text with what a child actually read
2. **Identify ALL errors**: mispronunciations, skipped words, added words, grammar mistakes
3. **Extract vocabulary** that is important for language development
4. **Provide encouraging, age-appropriate feedback**
5. **Generate specific practice recommendations**

IMPORTANT GUIDELINES:
- Be encouraging and positive while being accurate
- Use simple, child-friendly language
- Focus on learning opportunities, not failures
- Provide actionable practice suggestions
- Consider that these are EARLY LEARNERS (typically ages 5-10)

Return ONLY valid JSON matching this exact structure:

{
  "feedbackMessage": "Main feedback (2-3 sentences, encouraging)",
  "encouragement": "Specific praise for what they did well",
  "overallScore": 85.5,
  "pronunciationErrors": [
    {
      "originalWord": "word in text",
      "spokenAs": "how child said it",
      "phonetic": "correct pronunciation guide",
      "tip": "helpful tip for practice"
    }
  ],
  "vocabularyItems": [
    {
      "word": "word",
      "meaning": "definition",
      "simpleDefinition": "child-friendly meaning",
      "exampleSentence": "example use",
      "difficulty": "easy/medium/hard"
    }
  ],
  "grammarErrors": [
    {
      "incorrectPhrase": "what child said",
      "correctPhrase": "correct version",
      "errorType": "type of error",
      "explanation": "detailed explanation",
      "simpleExplanation": "child-friendly explanation"
    }
  ],
  "missingWords": [
    {
      "word": "skipped word",
      "position": 3,
      "context": "surrounding text"
    }
  ],
  "accuracyPercentage": 85.5,
  "totalWordsRead": 20,
  "correctWordsCount": 17,
  "errorCount": 3,
  "practiceWords": ["word1", "word2"],
  "focusAreas": ["pronunciation", "fluency"],
  "nextSteps": "specific next action"
}"""

        self.content_generation_prompt = """You are a creative educational content generator for early readers. Create engaging, age-appropriate reading materials.

GUIDELINES:
- Content must be educational yet fun
- Use appropriate vocabulary for the age/difficulty level
- Include diverse topics (animals, nature, friendship, adventure, science)
- Ensure proper grammar and sentence structure
- Make content culturally inclusive
- Add comprehension questions to reinforce learning

DIFFICULTY LEVELS:
- **Easy**: Simple sentences (4-6 words), common words, present tense, ages 5-7
- **Medium**: Longer sentences (8-12 words), some complex words, varied tenses, ages 7-9
- **Hard**: Complex sentences, advanced vocabulary, varied structures, ages 9-11

Return ONLY valid JSON:

{
  "title": "engaging title",
  "text": "the reading passage (appropriate length for level)",
  "difficulty": "easy/medium/hard",
  "ageRange": "5-7",
  "topic": "main topic",
  "vocabularyWords": ["word1", "word2"],
  "focusSkills": ["skill1", "skill2"],
  "estimatedReadingTime": "2 minutes",
  "comprehensionQuestions": ["question1", "question2"],
  "wordBank": [
    {
      "word": "word",
      "meaning": "definition",
      "simpleDefinition": "easy meaning",
      "exampleSentence": "example",
      "difficulty": "easy"
    }
  ]
}"""

        self.simplification_prompt = """You are an expert at adapting texts for early readers. Simplify complex texts while maintaining meaning.

RULES:
- Replace difficult words with simpler alternatives
- Shorten long sentences
- Use active voice
- Maintain the core message
- Specify what reading level the simplified version is appropriate for

Return ONLY valid JSON:

{
  "originalText": "original",
  "simplifiedText": "simplified version",
  "readingLevel": "Grade 1/2/3",
  "simplifications": ["change1", "change2"]
}"""

        self.translation_prompt = """You are a translation expert specialized in educational content for children. Provide accurate translations with pronunciation guides.

Return ONLY valid JSON:

{
  "originalText": "original",
  "translatedText": "translated",
  "sourceLanguage": "detected language",
  "targetLanguage": "target language",
  "pronunciationGuide": "how to pronounce (optional)"
}"""

        self.tips_prompt = """You are a reading coach providing personalized guidance for early learners and their parents.

Return ONLY valid JSON:

{
  "tips": ["tip1", "tip2", "tip3"],
  "exercises": ["exercise1", "exercise2"],
  "parentGuidance": "advice for parents/teachers"
}"""

        logger.info("GroqService initialization complete")

    # ============= HELPER METHOD =============

    def _call_groq(self, system_prompt: str, user_prompt: str, temperature: float = 0.7) -> dict:
        """Helper method to call Groq API and return parsed JSON"""
        
        try:
            logger.info("Sending request to Groq API...")
            logger.debug(f"Temperature: {temperature}")
            logger.debug(f"User prompt length: {len(user_prompt)} chars")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                response_format={"type": "json_object"}
            )
            
            logger.info("Received response from Groq API")
            
            response_text = response.choices[0].message.content
            logger.debug(f"Response text length: {len(response_text)} chars")
            
            result_data = json.loads(response_text)
            logger.info("JSON parsed successfully")
            
            return result_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.error(f"Raw response: {response_text}")
            raise
        except Exception as e:
            logger.error(f"API request failed: {e}", exc_info=True)
            raise

    # ============= SERVICE METHODS =============

    def analyze_reading(self, original_text: str, spoken_text: str) -> AnalysisResult:
        """Comprehensive reading analysis for early learners"""
        
        logger.info("=" * 50)
        logger.info("Starting reading analysis")
        logger.debug(f"Original text: {original_text}")
        logger.debug(f"Spoken text: {spoken_text}")
        
        user_prompt = f"""Analyze this early learner's reading performance:

**Original Text:**
"{original_text}"

**What the child read:**
"{spoken_text}"

Provide comprehensive analysis including:
- All pronunciation errors
- Important vocabulary words for learning
- Any grammar mistakes
- Words that were skipped
- Specific practice recommendations
- Encouraging feedback

Remember: This is an early learner, so be encouraging and constructive!"""

        try:
            result_data = self._call_groq(self.analysis_system_prompt, user_prompt, temperature=0.7)
            result = AnalysisResult(**result_data)
            logger.info("AnalysisResult model created successfully")
            logger.info(f"Overall score: {result.overallScore}")
            logger.info(f"Accuracy: {result.accuracyPercentage}%")
            logger.info(f"Errors found: {result.errorCount}")
            return result
        except Exception as e:
            logger.error(f"Failed to create AnalysisResult: {e}", exc_info=True)
            raise

    def generate_reading_content(
        self,
        difficulty: str = "medium",
        topic: Optional[str] = None,
        age_range: Optional[str] = None,
        length: str = "short"
    ) -> GeneratedContent:
        """Generate custom reading content for practice"""

        logger.info("=" * 50)
        logger.info("Starting content generation")
        logger.debug(f"Parameters: difficulty={difficulty}, topic={topic}, age_range={age_range}, length={length}")

        user_prompt = f"""Generate engaging reading content for early learners:

**Difficulty:** {difficulty}
**Length:** {length} (short=3-5 sentences, medium=6-10, long=10-15)
"""
        if topic:
            user_prompt += f"**Topic:** {topic}\n"
        if age_range:
            user_prompt += f"**Age Range:** {age_range}\n"

        user_prompt += """
Create an educational, engaging passage that:
- Is fun to read
- Teaches something interesting
- Uses appropriate vocabulary
- Includes comprehension questions
- Has a word bank with definitions"""

        try:
            result_data = self._call_groq(self.content_generation_prompt, user_prompt, temperature=0.9)
            result = GeneratedContent(**result_data)
            logger.info(f"Generated content: '{result.title}'")
            return result
        except Exception as e:
            logger.error(f"Failed to generate content: {e}", exc_info=True)
            raise

    def simplify_text(self, text: str, target_level: str = "Grade 1") -> SimplifiedText:
        """Simplify complex text for early readers"""

        logger.info("=" * 50)
        logger.info("Starting text simplification")
        logger.debug(f"Text to simplify: {text}")
        logger.debug(f"Target level: {target_level}")

        user_prompt = f"""Simplify this text for early readers:

**Original Text:**
"{text}"

**Target Reading Level:** {target_level}

Make it easier to read while keeping the meaning."""

        try:
            result_data = self._call_groq(self.simplification_prompt, user_prompt, temperature=0.5)
            result = SimplifiedText(**result_data)
            logger.info("Text simplified successfully")
            return result
        except Exception as e:
            logger.error(f"Failed to simplify text: {e}", exc_info=True)
            raise

    def translate_text(
        self,
        text: str,
        target_language: str,
        include_pronunciation: bool = True
    ) -> TranslationResult:
        """Translate text for multilingual support"""

        logger.info("=" * 50)
        logger.info("Starting translation")
        logger.debug(f"Text: {text}")
        logger.debug(f"Target language: {target_language}")

        user_prompt = f"""Translate this text:

**Text:** "{text}"
**Target Language:** {target_language}
"""
        if include_pronunciation:
            user_prompt += "\n**Include:** Pronunciation guide for the target language"

        try:
            result_data = self._call_groq(self.translation_prompt, user_prompt, temperature=0.3)
            result = TranslationResult(**result_data)
            logger.info("Translation completed successfully")
            return result
        except Exception as e:
            logger.error(f"Failed to translate text: {e}", exc_info=True)
            raise

    def get_reading_tips(
        self,
        analysis_result: AnalysisResult
    ) -> ReadingTips:
        """Generate personalized reading tips based on analysis"""

        logger.info("=" * 50)
        logger.info("Generating reading tips")
        logger.debug(f"Based on analysis with accuracy: {analysis_result.accuracyPercentage}%")

        user_prompt = f"""Based on this reading analysis, provide personalized tips:

**Accuracy:** {analysis_result.accuracyPercentage}%
**Focus Areas:** {', '.join(analysis_result.focusAreas)}
**Error Count:** {analysis_result.errorCount}

Provide:
1. 3-5 specific tips for improvement
2. Fun practice exercises
3. Guidance for parents/teachers"""

        try:
            result_data = self._call_groq(self.tips_prompt, user_prompt, temperature=0.8)
            result = ReadingTips(**result_data)
            logger.info(f"Generated {len(result.tips)} tips")
            return result
        except Exception as e:
            logger.error(f"Failed to generate tips: {e}", exc_info=True)
            raise

# Create singleton instance
logger.info("Creating GroqService singleton instance...")
groq_service = GroqService()
logger.info("GroqService singleton created successfully")
