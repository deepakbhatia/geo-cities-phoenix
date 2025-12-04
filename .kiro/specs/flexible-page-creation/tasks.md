# Flexible Page Creation - Tasks

## Phase 1: Database Schema & Migration

### Task 1.1: Update Page Data Model
**Status:** not started
**Priority:** High

- Add contentMode field to page schema
- Add contentTag field to page schema
- Add aiConfidenceScore field to page schema
- Add originalPrompt field to page schema
- Update TypeScript/JSDoc types
- _Requirements: 8_

### Task 1.2: Create Migration Script
**Status:** not started
**Priority:** High

- Create backend/scripts/migrate-pages.js
- Implement Firestore migration function
- Implement in-memory migration function
- Add backward compatibility checks
- Make migration idempotent
- Test migration with sample data
- _Requirements: 9_

### Task 1.3: Run Migration on Existing Data
**Status:** not started
**Priority:** High

- Backup existing data
- Run migration script
- Verify all pages have new fields
- Test that existing pages still work
- Document migration process
- _Requirements: 9_

## Phase 2: Backend Implementation

### Task 2.1: Update Content Controller
**Status:** not started
**Priority:** High

- Modify createPage to accept contentMode
- Add validation for ai-generate mode (prompt)
- Add validation for write-myself mode (content)
- Update page creation logic for both modes
- Add updatePageTag helper function
- Handle async AI detection
- _Requirements: 1, 2, 3, 7_

### Task 2.2: Implement AI Detection Function
**Status:** not started
**Priority:** High

- Create detectAIContent function in aiController
- Build AI detection prompt
- Parse JSON response from Gemini
- Calculate confidence score
- Determine content tag based on threshold
- Handle detection errors gracefully
- _Requirements: 4_

### Task 2.3: Add Async Detection Processing
**Status:** not started
**Priority:** High

- Implement non-blocking detection
- Save page with "pending" tag initially
- Update tag after detection completes
- Add error handling for failed detection
- Log detection results
- _Requirements: 4, 12_

### Task 2.4: Update API Responses
**Status:** not started
**Priority:** Medium

- Include new fields in page responses
- Add contentTag to page list
- Add aiConfidenceScore to page detail
- Update API documentation
- _Requirements: 5_

## Phase 3: Frontend Components

### Task 3.1: Update CreatePage Component
**Status:** not started
**Priority:** High

- Add content mode selector UI
- Create mode toggle buttons
- Show prompt field for AI Generate mode
- Show content field for Write Myself mode
- Update form validation for each mode
- Handle mode switching
- Update submit logic
- _Requirements: 1, 2, 3, 10_

### Task 3.2: Add Mode Selection UI
**Status:** not started
**Priority:** High

- Design mode selector cards
- Add icons and descriptions
- Implement active state styling
- Add hover effects
- Make responsive for mobile
- _Requirements: 10_

### Task 3.3: Update Form Validation
**Status:** not started
**Priority:** High

- Validate prompt (10-500 chars) for AI mode
- Validate content (50-5000 chars) for Write mode
- Show real-time character counters
- Display validation errors inline
- Prevent submission if invalid
- _Requirements: 6, 7_

### Task 3.4: Add Field Hints and Examples
**Status:** not started
**Priority:** Medium

- Add helpful placeholder text
- Show example prompts
- Add field hints below textareas
- Explain AI detection for Write mode
- Show estimated generation time
- _Requirements: 10_

### Task 3.5: Update PageList Component
**Status:** not started
**Priority:** High

- Add content tag badges to page cards
- Style badges with different colors
- Add tooltips explaining tags
- Show both type and content badges
- Make badges responsive
- _Requirements: 5_

### Task 3.6: Update PageDetail Component
**Status:** not started
**Priority:** Medium

- Display content tag on page detail
- Show AI confidence score if available
- Display original prompt for AI-generated pages
- Add tag explanation tooltips
- Style tags consistently
- _Requirements: 5_

## Phase 4: Styling & Polish

### Task 4.1: Style Mode Selector
**Status:** not started
**Priority:** Medium

- Create CSS for mode-options grid
- Style mode-option cards
- Add active state styling
- Add hover animations
- Make responsive for mobile
- _Requirements: 10_

### Task 4.2: Style Content Tag Badges
**Status:** not started
**Priority:** Medium

- Create badge styles for each tag type
- Use distinct colors (blue, green, orange)
- Add icons to badges
- Ensure readability
- Make badges accessible
- _Requirements: 5_

### Task 4.3: Add Field Hint Styling
**Status:** not started
**Priority:** Low

- Style field hints below inputs
- Use italic, smaller font
- Add appropriate spacing
- Make hints visually distinct
- Ensure mobile readability
- _Requirements: 10_

### Task 4.4: Improve Form Layout
**Status:** not started
**Priority:** Low

- Optimize spacing between fields
- Improve label styling
- Add focus states
- Enhance textarea styling
- Make form mobile-friendly
- _Requirements: 10_

## Phase 5: Testing & Validation

### Task 5.1: Test AI Generate Mode
**Status:** not started
**Priority:** High

- Test with valid prompts
- Test with too short prompts
- Test with too long prompts
- Verify AI generation works
- Test error handling
- Verify tag is "ai-generated"

### Task 5.2: Test Write Myself Mode
**Status:** not started
**Priority:** High

- Test with valid content
- Test with too short content
- Test with too long content
- Verify content is saved correctly
- Test AI detection triggers
- Verify tags update correctly

### Task 5.3: Test AI Detection
**Status:** not started
**Priority:** High

- Test with clearly AI-generated text
- Test with clearly human-written text
- Test with ambiguous text
- Verify confidence scores
- Test detection error handling
- Verify default to "user-written" on error

### Task 5.4: Test Mode Switching
**Status:** not started
**Priority:** Medium

- Switch from AI to Write mode
- Switch from Write to AI mode
- Verify title is preserved
- Verify form resets appropriately
- Test multiple switches

### Task 5.5: Test Tag Display
**Status:** not started
**Priority:** Medium

- Verify tags show on page cards
- Verify tags show on page detail
- Test all tag types display correctly
- Verify tooltips work
- Test mobile display

### Task 5.6: Test Migration
**Status:** not started
**Priority:** High

- Run migration on test data
- Verify all pages migrated
- Test backward compatibility
- Verify no data loss
- Test idempotency

## Phase 6: Error Handling & Edge Cases

### Task 6.1: Handle AI Generation Failures
**Status:** not started
**Priority:** High

- Test with invalid prompts
- Test with API errors
- Show clear error messages
- Allow retry without losing data
- Log errors for debugging
- _Requirements: 11_

### Task 6.2: Handle AI Detection Failures
**Status:** not started
**Priority:** High

- Test detection timeout
- Test invalid API responses
- Default to "user-written" on error
- Log detection failures
- Don't block page creation
- _Requirements: 11, 12_

### Task 6.3: Handle Validation Errors
**Status:** not started
**Priority:** Medium

- Test all validation scenarios
- Show specific error messages
- Preserve user input on errors
- Highlight invalid fields
- Make errors dismissible
- _Requirements: 7, 11_

### Task 6.4: Handle Edge Cases
**Status:** not started
**Priority:** Low

- Test with special characters
- Test with very long titles
- Test with empty content
- Test with whitespace-only content
- Test rapid mode switching

## Phase 7: Performance Optimization

### Task 7.1: Optimize AI Detection
**Status:** not started
**Priority:** Medium

- Ensure detection is non-blocking
- Add timeout for detection (30s)
- Cache detection results
- Optimize detection prompt
- Monitor detection performance
- _Requirements: 12_

### Task 7.2: Optimize Page Creation
**Status:** not started
**Priority:** Medium

- Minimize API calls
- Optimize validation logic
- Reduce form re-renders
- Optimize mode switching
- Test with slow connections

### Task 7.3: Add Loading Indicators
**Status:** not started
**Priority:** Low

- Show spinner during AI generation
- Show progress for detection
- Add estimated time messages
- Make loading states clear
- Test loading UX

## Phase 8: Documentation

### Task 8.1: Update API Documentation
**Status:** not started
**Priority:** Low

- Document new contentMode parameter
- Document new response fields
- Add examples for both modes
- Document AI detection behavior
- Update error codes

### Task 8.2: Create User Guide
**Status:** not started
**Priority:** Low

- Explain AI Generate mode
- Explain Write Myself mode
- Provide prompt writing tips
- Explain content tags
- Add screenshots

### Task 8.3: Document Migration Process
**Status:** not started
**Priority:** Low

- Document migration script usage
- Explain new schema fields
- Provide rollback instructions
- Document testing procedures
- Add troubleshooting guide

## Future Enhancements (Not in MVP)

### Task F.1: Add Content Filtering
**Status:** not started
**Priority:** Future

- Filter pages by content tag
- Add tag filter dropdown
- Update URL with filter params
- Show filter count
- Clear filters option

### Task F.2: Add Confidence Score Display
**Status:** not started
**Priority:** Future

- Show confidence percentage
- Add visual indicator (progress bar)
- Explain what score means
- Allow manual override
- Show detection reasoning

### Task F.3: Add Content Editing
**Status:** not started
**Priority:** Future

- Allow editing content
- Re-run detection on edit
- Update tags if needed
- Preserve edit history
- Show last edited date

### Task F.4: Add Batch Detection
**Status:** not started
**Priority:** Future

- Run detection on multiple pages
- Show batch progress
- Update tags in bulk
- Export detection results
- Schedule periodic re-detection
