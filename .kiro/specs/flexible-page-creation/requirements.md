# Flexible Page Creation - Requirements Document

## Introduction

This specification outlines modifications to the page creation system to support both AI-generated and user-written content. Users can choose to write their own content or have AI generate it based on a description. All submitted content will be analyzed to detect if it's AI-generated and tagged accordingly.

## Glossary

- **AI-Generated Content**: Content created by the Gemini AI based on user prompts
- **User-Written Content**: Content manually written by the user
- **AI Detection**: Automated analysis to determine if content was AI-generated
- **Content Mode**: User's choice between "AI Generate" or "Write Myself"
- **AI Confidence Score**: Probability (0-1) that content is AI-generated
- **Content Tag**: Label indicating content origin (ai-generated, user-written, detected-ai)

## Requirements

### Requirement 1: Dual Content Creation Modes

**User Story:** As a user, I want to choose between AI-generating content or writing it myself, so that I have flexibility in how I create pages

#### Acceptance Criteria

1. WHEN the User creates a page, THE System SHALL display two content mode options:
   - "✨ AI Generate" (default)
   - "✍️ Write Myself"
2. THE System SHALL show different form fields based on the selected mode
3. IF "AI Generate" is selected, THEN THE System SHALL show a prompt textarea
4. IF "Write Myself" is selected, THEN THE System SHALL show a content textarea
5. THE System SHALL allow switching between modes without losing the title

### Requirement 2: AI Generation Mode

**User Story:** As a user, I want AI to generate content based on my description, so that I can quickly create pages

#### Acceptance Criteria

1. WHEN "AI Generate" mode is selected, THE System SHALL display a prompt field
2. THE prompt field SHALL have a minimum of 10 characters and maximum of 500 characters
3. THE System SHALL show a character counter for the prompt
4. THE System SHALL include placeholder text with examples
5. WHEN the User submits, THE System SHALL generate content using Gemini API
6. THE System SHALL tag the page as "ai-generated"

### Requirement 3: Manual Writing Mode

**User Story:** As a user, I want to write my own content, so that I can have full control over what appears on my page

#### Acceptance Criteria

1. WHEN "Write Myself" mode is selected, THE System SHALL display a content textarea
2. THE content field SHALL have a minimum of 50 characters and maximum of 5000 characters
3. THE System SHALL show a character counter for the content
4. THE System SHALL support multi-line text with paragraph breaks
5. WHEN the User submits, THE System SHALL save the content as-is
6. THE System SHALL run AI detection on the submitted content

### Requirement 4: AI Content Detection

**User Story:** As a system, I want to detect if user-written content is actually AI-generated, so that content is properly tagged

#### Acceptance Criteria

1. WHEN a User submits content in "Write Myself" mode, THE System SHALL analyze the content
2. THE System SHALL use Gemini API to detect AI-generated patterns
3. THE System SHALL calculate a confidence score (0-1)
4. IF confidence score > 0.7, THEN THE System SHALL tag as "detected-ai"
5. IF confidence score <= 0.7, THEN THE System SHALL tag as "user-written"
6. THE System SHALL store the confidence score in the database

### Requirement 5: Content Tags Display

**User Story:** As a user, I want to see how content was created, so that I know its origin

#### Acceptance Criteria

1. THE System SHALL display content tags on page cards
2. THE System SHALL use different badge styles for each tag:
   - "ai-generated": Blue badge with "🤖 AI Generated"
   - "user-written": Green badge with "✍️ User Written"
   - "detected-ai": Orange badge with "🔍 Detected AI"
3. THE System SHALL show tags on both page list and page detail views
4. THE System SHALL include tooltip explaining what each tag means
5. THE System SHALL allow filtering pages by content tag (future enhancement)

### Requirement 6: Title Requirement

**User Story:** As a user, I must provide a title for my page, so that pages are properly identified

#### Acceptance Criteria

1. THE System SHALL require a title field for all pages
2. THE title field SHALL be separate from content/prompt
3. THE title SHALL have minimum 3 characters and maximum 100 characters
4. THE System SHALL validate title uniqueness within the city
5. THE System SHALL show title character counter

### Requirement 7: Content Validation

**User Story:** As a system, I want to validate content before saving, so that pages meet quality standards

#### Acceptance Criteria

1. THE System SHALL validate content length based on mode:
   - AI Generate: prompt 10-500 chars
   - Write Myself: content 50-5000 chars
2. THE System SHALL check for empty or whitespace-only content
3. THE System SHALL sanitize content to prevent XSS attacks
4. THE System SHALL preserve paragraph breaks and basic formatting
5. THE System SHALL show validation errors inline

### Requirement 8: Database Schema Updates

**User Story:** As a developer, I want to update the database schema to support new fields, so that content metadata is stored

#### Acceptance Criteria

1. THE System SHALL add "contentMode" field to page documents
2. THE System SHALL add "contentTag" field to page documents
3. THE System SHALL add "aiConfidenceScore" field to page documents
4. THE System SHALL add "originalPrompt" field (for AI-generated pages)
5. THE System SHALL maintain backward compatibility with existing pages

### Requirement 9: Migration Script

**User Story:** As a developer, I want to migrate existing pages to the new schema, so that all pages have proper tags

#### Acceptance Criteria

1. THE System SHALL provide a migration script for existing pages
2. THE migration SHALL tag all existing pages as "ai-generated"
3. THE migration SHALL set contentMode to "ai-generate" for existing pages
4. THE migration SHALL preserve all existing data
5. THE migration SHALL be idempotent (can run multiple times safely)

### Requirement 10: UI/UX Improvements

**User Story:** As a user, I want clear guidance on how to create pages, so that I understand my options

#### Acceptance Criteria

1. THE System SHALL show mode selection prominently at the top of the form
2. THE System SHALL use radio buttons or toggle for mode selection
3. THE System SHALL show helpful descriptions for each mode
4. THE System SHALL display examples of good prompts/content
5. THE System SHALL show estimated generation time for AI mode

### Requirement 11: Error Handling

**User Story:** As a user, I want clear error messages if something goes wrong, so that I can fix issues

#### Acceptance Criteria

1. IF AI generation fails, THEN THE System SHALL show error with retry option
2. IF AI detection fails, THEN THE System SHALL default to "user-written" tag
3. IF content validation fails, THEN THE System SHALL show specific validation errors
4. THE System SHALL preserve user input on errors
5. THE System SHALL log errors for debugging

### Requirement 12: Performance Optimization

**User Story:** As a user, I want fast page creation, so that I don't wait unnecessarily

#### Acceptance Criteria

1. THE System SHALL run AI detection asynchronously (non-blocking)
2. THE System SHALL save the page immediately with temporary tag
3. THE System SHALL update the tag once detection completes
4. THE System SHALL show loading indicator during detection
5. THE System SHALL cache detection results to avoid re-analysis

## Data Model Changes

### Updated Page Schema

```typescript
interface Page {
  id: string;
  cityId: string;
  title: string;
  titleSlug: string;
  type: PageType;
  
  // NEW FIELDS
  contentMode: 'ai-generate' | 'write-myself';
  contentTag: 'ai-generated' | 'user-written' | 'detected-ai';
  aiConfidenceScore?: number;  // 0-1, only for detected-ai
  originalPrompt?: string;     // Only for ai-generated
  
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## AI Detection Strategy

### Detection Prompt

```
Analyze the following text and determine if it was likely generated by an AI language model.

Consider these indicators:
1. Overly formal or structured language
2. Lack of personal anecdotes or specific details
3. Generic or templated phrasing
4. Perfect grammar and punctuation
5. Balanced, neutral tone without strong opinions
6. Repetitive sentence structures
7. Lack of colloquialisms or informal language

Text to analyze:
[USER CONTENT]

Respond with ONLY a JSON object:
{
  "isAiGenerated": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}
```

## Non-Functional Requirements

### Performance
- AI generation: < 10 seconds
- AI detection: < 5 seconds (async)
- Page save: < 1 second
- Detection should not block page creation

### Accuracy
- AI detection accuracy: > 80%
- False positive rate: < 15%
- False negative rate: < 20%

### Usability
- Mode switching: instant
- Form validation: real-time
- Error messages: clear and actionable
- Mobile-friendly interface

### Security
- Content sanitization to prevent XSS
- Rate limiting on AI API calls
- Input validation on all fields
- No sensitive data in prompts
