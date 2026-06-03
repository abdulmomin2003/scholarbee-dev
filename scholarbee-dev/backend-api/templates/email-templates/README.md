# Email Templates System

This system provides a flexible way to manage email templates with dynamic value injection for the ScholarBee application.

## Directory Structure

```
templates/
└── email-templates/
    ├── application-status/
    │   ├── under-review.html
    │   ├── approved.html
    │   └── rejected.html
    └── shared/
        ├── base-template.html
        └── styles.css
```

## Template Format

Each template file should include metadata in HTML comments at the top:

```html
<!-- TEMPLATE: {"name": "Template Name", "subject": "Email Subject - {{variable}}", "variables": ["variable1", "variable2"], "category": "application_status"} -->
<!DOCTYPE html>
<html>
<head>
    <!-- Your CSS styles -->
</head>
<body>
    <!-- Your HTML content with {{variable}} placeholders -->
    <h1>Hello {{applicantName}}</h1>
    <p>Your application for {{programName}} is {{status}}.</p>
    
    <!-- Conditional blocks -->
    {{#if feedback}}
    <div class="feedback">{{feedback}}</div>
    {{/if}}
    
    <!-- Loop blocks -->
    {{#each items}}
    <div>{{this.name}}</div>
    {{/each}}
</body>
</html>
```

## Available Variables

### Application Status Templates
- `applicantName` - Full name of the applicant
- `userEmail` - Applicant's email address
- `programName` - Name of the program
- `universityName` - Name of the university
- `applicationId` - Application ID
- `reviewTimeline` - Expected review duration
- `nextSteps` - Next steps for the applicant
- `dashboardUrl` - Link to application dashboard
- `supportUrl` - Link to support page
- `feedback` - Optional feedback message (for rejected applications)

## Template Syntax (Handlebars)

### Variable Replacement
- `{{variableName}}` - Simple variable replacement
- `{{nested.object.property}}` - Nested object access

### Conditional Blocks
```html
{{#if condition}}
  <!-- Content shown if condition is truthy -->
{{/if}}

{{#unless condition}}
  <!-- Content shown if condition is falsy -->
{{/unless}}
```

### Loop Blocks
```html
{{#each arrayName}}
  <!-- Content repeated for each item -->
  <!-- Use {{this.property}} to access item properties -->
{{/each}}
```

### Custom Helpers Available
- `{{capitalize text}}` - Capitalizes the first letter of text
- `{{formatDate date "short"}}` - Formats dates (short, long, or default)
- `{{statusText status}}` - Converts status to user-friendly text
- `{{applicationUrl applicationId}}` - Generates application dashboard URL

### Advanced Features
```html
<!-- Conditional with else -->
{{#if feedback}}
  <div class="feedback">{{feedback}}</div>
{{else}}
  <div class="no-feedback">No feedback available</div>
{{/if}}

<!-- Loop with index -->
{{#each items}}
  <div>{{@index}}: {{this.name}}</div>
{{/each}}

<!-- Nested objects -->
{{#if user.profile}}
  <p>Welcome {{user.profile.firstName}} {{user.profile.lastName}}</p>
{{/if}}
```

## Type-Safe Template System

The email template system now provides full TypeScript type safety, ensuring that each template receives the correct data structure.

### Template ID Enum

Template IDs are defined as an enum for better type safety and maintainability:

```typescript
// Template ID enum
export enum EmailTemplateId {
  APPLICATION_STATUS_UNDER_REVIEW = 'application-status/under-review',
  APPLICATION_STATUS_APPROVED = 'application-status/approved',
  APPLICATION_STATUS_REJECTED = 'application-status/rejected',
}

// Each template ID maps to a specific data type
interface TemplateDataMap {
  [EmailTemplateId.APPLICATION_STATUS_UNDER_REVIEW]: UnderReviewTemplateData;
  [EmailTemplateId.APPLICATION_STATUS_APPROVED]: ApprovedTemplateData;
  [EmailTemplateId.APPLICATION_STATUS_REJECTED]: RejectedTemplateData;
}
```

### Type-Safe Usage

```typescript
// ✅ Type-safe - TypeScript will enforce correct data structure
const data = TemplateDataBuilder.createUnderReviewData({
  applicantName: 'John Doe',
  userEmail: 'john@example.com',
  programName: 'Computer Science',
  universityName: 'National University',
  applicationId: '12345',
  reviewTimeline: '2-4 weeks'
});

const email = await templateRenderer.renderTemplate(
  EmailTemplateId.APPLICATION_STATUS_UNDER_REVIEW, // Enum value is validated
  data // Data type is enforced
);

// ❌ TypeScript error - wrong template ID
await templateRenderer.renderTemplate('invalid-template', data);

// ❌ TypeScript error - missing required fields
const incompleteData = { applicantName: 'John' };
await templateRenderer.renderTemplate(EmailTemplateId.APPLICATION_STATUS_UNDER_REVIEW, incompleteData);
```

### Data Builder Utilities

Use the `TemplateDataBuilder` for type-safe data creation:

```typescript
// For under-review emails
const underReviewData = TemplateDataBuilder.createUnderReviewData({
  applicantName: 'John Doe',
  userEmail: 'john@example.com',
  programName: 'Computer Science',
  universityName: 'National University',
  applicationId: '12345',
  reviewTimeline: '2-4 weeks' // Optional, defaults to '2-4 weeks'
});

// For approved emails
const approvedData = TemplateDataBuilder.createApprovedData({
  applicantName: 'John Doe',
  userEmail: 'john@example.com',
  programName: 'Computer Science',
  universityName: 'National University',
  applicationId: '12345',
  nextSteps: 'Complete enrollment by...' // Optional
});

// For rejected emails
const rejectedData = TemplateDataBuilder.createRejectedData({
  applicantName: 'John Doe',
  userEmail: 'john@example.com',
  programName: 'Computer Science',
  universityName: 'National University',
  applicationId: '12345',
  feedback: 'Please improve your qualifications...' // Optional
});
```

## Adding New Templates

1. Create a new HTML file in the appropriate directory
2. Add template metadata in HTML comments
3. Use the template ID in your service code
4. Ensure all required variables are provided in templateData

## Template Categories

- `application_status` - Application status change notifications
- `application_submission` - Application submission confirmations
- `general` - General purpose templates
