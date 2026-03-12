from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from services.groq_service import (
    groq_service,
    AnalysisResult,
    GeneratedContent,
    SimplifiedText,
    TranslationResult,
    ReadingTips
)

router = APIRouter(tags=["reading"])

# ============= REQUEST MODELS =============

class ReadingAnalysisRequest(BaseModel):
    """Request model for reading analysis"""
    originalText: str = Field(..., description="The original text to be read")
    spokenText: str = Field(..., description="What the child actually read")
    includeVocabulary: bool = Field(default=True, description="Include vocabulary analysis")
    includeGrammar: bool = Field(default=True, description="Include grammar analysis")

class ContentGenerationRequest(BaseModel):
    """Request model for content generation"""
    difficulty: str = Field(default="medium", description="easy, medium, or hard")
    topic: Optional[str] = Field(default=None, description="Topic for the content")
    ageRange: Optional[str] = Field(default=None, description="Target age range (e.g., '5-7')")
    length: str = Field(default="short", description="short, medium, or long")

class SimplifyTextRequest(BaseModel):
    """Request model for text simplification"""
    text: str = Field(..., description="Text to simplify")
    targetLevel: str = Field(default="Grade 1", description="Target reading level")

class TranslateRequest(BaseModel):
    """Request model for translation"""
    text: str = Field(..., description="Text to translate")
    targetLanguage: str = Field(..., description="Target language (e.g., 'Spanish', 'Hindi')")
    includePronunciation: bool = Field(default=True, description="Include pronunciation guide")

# ============= API ENDPOINTS =============

@router.post("/analyze-reading", response_model=AnalysisResult)
async def analyze_reading(request: ReadingAnalysisRequest):
    """
    🎯 **Analyze Reading Performance**
    
    Compare original text with what a child read and provide comprehensive feedback.
    
    **Perfect for:**
    - Reading assessment
    - Identifying pronunciation errors
    - Vocabulary building
    - Grammar checking
    - Progress tracking
    
    **Returns:**
    - Detailed analysis with errors, vocabulary, and feedback
    - Overall accuracy percentage
    - Practice recommendations
    - Encouraging messages for early learners
    """
    try:
        if not request.originalText.strip():
            raise HTTPException(status_code=400, detail="Original text cannot be empty")
        if not request.spokenText.strip():
            raise HTTPException(status_code=400, detail="Spoken text cannot be empty")
        
        result = groq_service.analyze_reading(
            original_text=request.originalText,
            spoken_text=request.spokenText
        )
        return result
    
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing reading: {str(e)}"
        )

@router.post("/generate-content", response_model=GeneratedContent)
async def generate_content(request: ContentGenerationRequest):
    """
    ✨ **Generate Reading Content**
    
    Create custom AI-generated reading passages for practice.
    
    **Perfect for:**
    - Daily reading practice
    - Homework assignments
    - Skill-level appropriate content
    - Topic-specific learning
    
    **Features:**
    - Age-appropriate content
    - Comprehension questions included
    - Vocabulary word bank
    - Adjustable difficulty and length
    """
    try:
        valid_difficulties = ["easy", "medium", "hard"]
        if request.difficulty not in valid_difficulties:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}"
            )
        
        valid_lengths = ["short", "medium", "long"]
        if request.length not in valid_lengths:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid length. Must be one of: {', '.join(valid_lengths)}"
            )
        
        result = groq_service.generate_reading_content(
            difficulty=request.difficulty,
            topic=request.topic,
            age_range=request.ageRange,
            length=request.length
        )
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating content: {str(e)}"
        )

@router.get("/generate-content", response_model=GeneratedContent)
async def generate_content_get(
    difficulty: str = Query(default="medium", description="Difficulty: easy, medium, hard"),
    topic: Optional[str] = Query(default=None, description="Content topic"),
    ageRange: Optional[str] = Query(default=None, description="Age range (e.g., '5-7')"),
    length: str = Query(default="short", description="Length: short, medium, long")
):
    """
    ✨ **Generate Reading Content (GET)**
    
    Same as POST /generate-content but using URL parameters for easy integration.
    """
    try:
        valid_difficulties = ["easy", "medium", "hard"]
        if difficulty not in valid_difficulties:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}"
            )
        
        valid_lengths = ["short", "medium", "long"]
        if length not in valid_lengths:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid length. Must be one of: {', '.join(valid_lengths)}"
            )
        
        result = groq_service.generate_reading_content(
            difficulty=difficulty,
            topic=topic,
            age_range=ageRange,
            length=length
        )
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating content: {str(e)}"
        )

@router.post("/simplify-text", response_model=SimplifiedText)
async def simplify_text(request: SimplifyTextRequest):
    """
    📖 **Simplify Complex Text**
    
    Convert difficult texts into simpler versions for early readers.
    
    **Perfect for:**
    - Adapting books/articles for younger readers
    - Making homework more accessible
    - Creating differentiated content
    - Supporting struggling readers
    
    **Features:**
    - Maintains original meaning
    - Age-appropriate vocabulary
    - Shorter, clearer sentences
    - Shows what was simplified
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        result = groq_service.simplify_text(
            text=request.text,
            target_level=request.targetLevel
        )
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error simplifying text: {str(e)}"
        )

@router.post("/translate", response_model=TranslationResult)
async def translate_text(request: TranslateRequest):
    """
    🌍 **Translate Text**
    
    Translate reading content for multilingual support.
    
    **Perfect for:**
    - Multilingual learners
    - ESL/EFL students
    - Bilingual education
    - Home language support
    
    **Features:**
    - Accurate translations
    - Optional pronunciation guides
    - Supports multiple languages
    - Educational context preserved
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        if not request.targetLanguage.strip():
            raise HTTPException(status_code=400, detail="Target language cannot be empty")
        
        result = groq_service.translate_text(
            text=request.text,
            target_language=request.targetLanguage,
            include_pronunciation=request.includePronunciation
        )
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error translating text: {str(e)}"
        )

@router.post("/get-tips", response_model=ReadingTips)
async def get_reading_tips(analysis: AnalysisResult):
    """
    💡 **Get Personalized Reading Tips**
    
    Generate personalized practice tips based on reading analysis.
    
    **Perfect for:**
    - Follow-up practice
    - Parent guidance
    - Teacher recommendations
    - Personalized learning plans
    
    **Features:**
    - Specific improvement tips
    - Fun practice exercises
    - Parent/teacher guidance
    - Based on actual performance
    """
    try:
        result = groq_service.get_reading_tips(analysis_result=analysis)
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating tips: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    ✅ **Health Check**
    
    Check if the API is running properly.
    """
    return {
        "status": "healthy",
        "service": "Reading Tutor API for Early Learners",
        "version": "1.0.0"
    }

@router.get("/supported-languages")
async def get_supported_languages():
    """
    🌐 **Get Supported Languages**
    
    List of languages supported for translation.
    """
    return {
        "languages": [
            "Spanish", "French", "German", "Italian", "Portuguese",
            "Hindi", "Tamil", "Telugu", "Kannada", "Bengali",
            "Mandarin", "Japanese", "Korean", "Arabic", "Russian",
            "Dutch", "Swedish", "Polish", "Turkish", "Vietnamese"
        ],
        "note": "Groq supports many more languages. These are common for early learners."
    }

@router.get("/difficulty-guide")
async def get_difficulty_guide():
    """
    📊 **Difficulty Level Guide**
    
    Information about difficulty levels and age ranges.
    """
    return {
        "levels": {
            "easy": {
                "ageRange": "5-7 years",
                "description": "Simple sentences, common words, present tense",
                "wordCount": "3-5 words per sentence",
                "examples": ["The cat is big.", "I like to play."]
            },
            "medium": {
                "ageRange": "7-9 years",
                "description": "Longer sentences, some complex words, varied tenses",
                "wordCount": "8-12 words per sentence",
                "examples": ["The curious cat climbed up the tall tree yesterday."]
            },
            "hard": {
                "ageRange": "9-11 years",
                "description": "Complex sentences, advanced vocabulary, varied structures",
                "wordCount": "12+ words per sentence",
                "examples": ["Despite feeling nervous, the determined student practiced diligently."]
            }
        }
    }