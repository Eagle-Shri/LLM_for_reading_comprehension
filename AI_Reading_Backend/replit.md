# Reading Tutor API

## Overview

This is a FastAPI-based backend service that provides AI-powered reading analysis for educational purposes. The application accepts original text and spoken text from a child reader, then uses Google's Gemini AI to analyze the reading performance and provide personalized feedback with practice recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Structure

The application follows a clean, modular architecture with clear separation of concerns:

```
├── main.py                 # Main application entry point, configures FastAPI app
├── routes/                 # API endpoint definitions
│   └── reading_routes.py   # Reading analysis endpoint
├── services/               # Business logic and external service integration
│   └── gemini_service.py   # Gemini AI integration for reading analysis
├── templates/              # HTML templates
│   └── index.html          # Frontend UI
├── static/                 # Static assets
│   ├── styles.css          # CSS styling
│   └── script.js           # Frontend JavaScript
└── requirements.txt        # Python dependencies
```

**Design Principles:**
- Service Layer: All AI/LLM logic isolated in `services/`
- Routes Layer: HTTP request/response handling in `routes/`
- Main Entry: Minimal configuration in `main.py`
- Frontend Assets: Organized in `static/` and `templates/`

## System Architecture

### Backend Architecture

**Framework: FastAPI**
- FastAPI was chosen for its modern async capabilities, automatic API documentation, and built-in request/response validation through Pydantic models
- Provides high performance with minimal overhead for AI-driven educational tools
- Built-in OpenAPI schema generation facilitates frontend integration and testing

**Server: Uvicorn**
- ASGI server selected for its performance with async Python applications
- Handles concurrent requests efficiently, important for real-time educational feedback scenarios

**API Design Pattern: REST**
- Single endpoint architecture (`/analyze-reading`) focused on the core use case
- POST method for submitting reading data and receiving analysis
- Structured request/response models ensure type safety and validation

**Data Models (Pydantic)**
- `ReadingInput`: Validates incoming reading data (originalText, spokenText)
- `PracticeItem`: Represents individual practice recommendations with optional comments
- `AnalysisResult`: Structures the AI feedback response with message and practice items list
- Type validation prevents malformed data from reaching the AI processing layer

**CORS Configuration**
- Wildcard origins enabled for development flexibility
- Allows cross-origin requests from any frontend application
- Should be restricted to specific domains in production environments

### Frontend Architecture

**HTML/CSS/JavaScript Frontend**
- Single-page application served by FastAPI
- Clean, modern UI with gradient purple background
- Two input fields for original and spoken text
- Real-time analysis with loading states and error handling
- Responsive design that works on mobile and desktop
- Static files served from `/static` directory
- Templates served from `/templates` directory using Jinja2

### AI Integration Architecture

**Google Gemini AI (gemini-2.0-flash-exp model)**
- Selected for its balance of speed and capability in text analysis tasks
- Flash variant chosen for lower latency in educational feedback scenarios
- API key authentication pattern using environment variables for security
- Client initialized at application startup with fail-fast validation

**Integration Pattern**
- Direct SDK integration using `google-genai` library (blueprint:python_gemini)
- Structured output using Pydantic schema validation
- API key validated at startup to fail fast if missing
- Synchronous AI calls within async endpoint handlers with error handling

### Authentication & Authorization

**Current State: None**
- No authentication mechanism implemented
- API is publicly accessible
- Suitable for MVP/development phase

**Future Considerations**
- Add API key authentication for production use
- Implement rate limiting to prevent abuse
- Consider user session management if personalized history is needed

## External Dependencies

### Third-Party Services

**Google Gemini AI API**
- Primary AI service for reading analysis and feedback generation
- Requires `GEMINI_API_KEY` environment variable
- Model: gemini-2.5-flash (optimized for speed and educational content)
- Purpose: Analyzes differences between original and spoken text, generates educational feedback

### Python Packages

**Core Framework**
- `fastapi`: Web framework for building the REST API
- `uvicorn[standard]`: ASGI server with websocket support
- `pydantic`: Data validation and settings management

**AI Integration**
- `google-genai`: Official Google Generative AI Python SDK

**Utilities**
- `python-dotenv`: Environment variable management (listed but not actively imported in current code)

### Environment Variables

**Required**
- `GEMINI_API_KEY`: Authentication key for Google Gemini AI service (validated at startup)

### Database

**Current State: None**
- No database implementation
- All processing is stateless
- Each request is independent with no data persistence

**Future Considerations**
- Could add database for storing reading history, progress tracking, or user profiles
- Drizzle ORM may be considered for future database integration if needed