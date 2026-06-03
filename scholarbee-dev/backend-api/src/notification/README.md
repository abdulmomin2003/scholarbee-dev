# Notification Navigation System

## Overview

The notification system has been enhanced to support frontend navigation capabilities. Notifications can now include routing information that helps the frontend redirect users to specific pages based on the notification type and context.

## Key Features

1. **Category-based Classification**: Notifications are categorized by their domain (applications, campuses, programs, etc.)
2. **Navigation Context**: Each notification can include navigation information for frontend routing
3. **Flexible Routing**: Support for both specific entity pages and list pages
4. **Optional Enhancements**: Priority system, icons, and action buttons for advanced use cases

## Core Schema Structure

### Required Fields

```typescript
{
  title: string;           // Notification title
  message: string;         // Notification message
  audience: Audience;      // Who should receive this notification
  category: NotificationCategory;  // What type of notification
  navigation?: NavigationContext;  // Where to navigate when clicked (optional)
}
```

### Optional Enhancement Fields

```typescript
{
  priority?: 'low' | 'medium' | 'high' | 'urgent';  // For UI prioritization
  icon?: string;           // Visual indicator
  actions?: NotificationAction[];  // Action buttons for complex notifications
}
```

### Navigation Context

```typescript
{
  type: NavigationType;    // What kind of navigation
  entityId?: ObjectId;     // Specific entity ID (if applicable)
  params?: Record<string, any>;  // Additional parameters
}
```

## Quick Start

### Basic Usage

```typescript
// Inject the helper service
constructor(private notificationHelper: NotificationHelperService) {}

// Create a simple notification
const notification = this.notificationHelper.createNotification(
  NotificationCategory.APPLICATION,
  'Application Updated',
  'Your application status has changed',
  NavigationType.ENTITY_DETAIL,
  applicationId
);
```

### Common Use Cases

```typescript
// Application status update
const appNotification = this.notificationHelper.createApplicationNotification(
  applicationId,
  'Application Accepted!',
  'Congratulations! Your application has been accepted.'
);

// Campus-specific notification
const campusNotification = this.notificationHelper.createCampusNotification(
  campusId,
  'Campus Update',
  'New facilities are now available at your campus.'
);

// System notification (no navigation)
const systemNotification = this.notificationHelper.createSystemNotification(
  'System Maintenance',
  'Scheduled maintenance on Sunday 2-4 AM'
);

// List navigation (no specific entity)
const listNotification = this.notificationHelper.createListNotification(
  NotificationCategory.SCHOLARSHIP,
  'New Scholarships',
  '5 new scholarships matching your profile are available.'
);
```

## Notification Categories

| Category | Description | Use Case |
|----------|-------------|----------|
| `APPLICATION` | Application-related | Status updates, submissions |
| `APPLICATION_STATUS` | Application status changes | Accepted, rejected, pending |
| `APPLICATION_DEADLINE` | Deadline reminders | Application deadlines |
| `ADMISSION` | Admission-related | Admission updates |
| `ADMISSION_PROGRAM` | Admission program updates | New programs, changes |
| `PROGRAM` | Program-related | Program updates, new offerings |
| `PROGRAM_TEMPLATE` | Program template updates | Template changes |
| `UNIVERSITY` | University-wide | University announcements |
| `CAMPUS` | Campus-specific | Campus updates, events |
| `ACADEMIC_DEPARTMENT` | Department-specific | Department news |
| `PROFILE` | User profile | Profile updates, verification |
| `USER_SETTINGS` | User settings | Settings changes |
| `SCHOLARSHIP` | Scholarship-related | New scholarships, awards |
| `STUDENT_SCHOLARSHIP` | Student scholarship status | Award status |
| `FEES` | Fee-related | Payment reminders, fee updates |
| `CHAT` | Chat messages | New messages, conversations |
| `MESSAGE` | General messages | System messages |
| `BLOG_POST` | Blog content | New blog posts |
| `LEGAL_DOCUMENT` | Legal documents | Document updates |
| `SYSTEM` | System notifications | Maintenance, updates |
| `GENERAL` | General notifications | Default category |

## Navigation Types

| Type | Description | Use Case |
|------|-------------|----------|
| `ENTITY_DETAIL` | Specific entity page | Campus details, program details |
| `ENTITY_LIST` | List page | All campuses, all programs |
| `USER_PROFILE` | User profile page | Profile management |
| `USER_DASHBOARD` | User dashboard | Main dashboard |
| `APPLICATION_FORM` | Application form | Apply for programs |
| `APPLICATION_STATUS` | Application status page | Check application status |
| `CHAT_CONVERSATION` | Specific chat | Direct to conversation |
| `MESSAGE_CENTER` | Message center | All messages |
| `SETTINGS` | Settings page | User settings |
| `NONE` | No navigation | System notifications |

## Frontend Integration

### Route Mapping

Create a route mapping in your frontend:

```typescript
const ROUTE_MAPPING = {
  [NotificationCategory.APPLICATION]: {
    [NavigationType.ENTITY_DETAIL]: '/applications/:id',
    [NavigationType.ENTITY_LIST]: '/applications',
  },
  [NotificationCategory.CAMPUS]: {
    [NavigationType.ENTITY_DETAIL]: '/campuses/:id',
    [NavigationType.ENTITY_LIST]: '/campuses',
  },
  [NotificationCategory.SCHOLARSHIP]: {
    [NavigationType.ENTITY_DETAIL]: '/scholarships/:id',
    [NavigationType.ENTITY_LIST]: '/scholarships',
  },
  // ... more mappings
};
```

### Navigation Handler

```typescript
function handleNotificationClick(notification) {
  const { category, navigation } = notification;
  
  if (!navigation || navigation.type === NavigationType.NONE) {
    return; // No navigation needed
  }
  
  const routeTemplate = ROUTE_MAPPING[category]?.[navigation.type];
  if (!routeTemplate) {
    return; // No route mapping found
  }
  
  let route = routeTemplate;
  if (navigation.entityId) {
    route = route.replace(':id', navigation.entityId);
  }
  
  // Add query parameters
  if (navigation.params) {
    const queryParams = new URLSearchParams(navigation.params);
    route += `?${queryParams.toString()}`;
  }
  
  // Navigate to the route
  router.push(route);
}
```

## Helper Service Methods

### Core Methods (Recommended for most use cases)

```typescript
// Basic notification creation
createNotification(category, title, message, navigationType?, entityId?, params?)

// Specific entity notifications
createApplicationNotification(applicationId, title, message, status?)
createCampusNotification(campusId, title, message)
createUniversityNotification(universityId, title, message)
createScholarshipNotification(scholarshipId, title, message)
createProgramNotification(programId, title, message)

// User-related notifications
createProfileNotification(title, message)
createSystemNotification(title, message)

// List navigation
createListNotification(category, title, message)
```

### Advanced Methods (Optional - see advanced-features.md)

```typescript
// Priority-based notifications
createNotificationWithPriority(category, title, message, priority, navigationType?, entityId?)

// Icon-based notifications
createNotificationWithIcon(category, title, message, icon, navigationType?, entityId?)

// Action-based notifications
createChatNotificationWithActions(conversationId, senderName, messagePreview)
createDeadlineNotificationWithActions(entityId, entityType, deadline, entityName)
createFeesNotificationWithActions(feesId, title, message, amount?)

// Builder pattern for complex notifications
createComplexNotification()
```

## Examples

### 1. Application Status Update

```typescript
const notification = {
  title: 'Application Status Updated',
  message: 'Your application has been accepted!',
  category: NotificationCategory.APPLICATION_STATUS,
  navigation: {
    type: NavigationType.ENTITY_DETAIL,
    entityId: applicationId,
  },
};
```

### 2. Campus-Specific Notification

```typescript
const notification = {
  title: 'Campus Update',
  message: 'New facilities available at your campus',
  category: NotificationCategory.CAMPUS,
  navigation: {
    type: NavigationType.ENTITY_DETAIL,
    entityId: campusId,
  },
};
```

### 3. System Notification (No Navigation)

```typescript
const notification = {
  title: 'System Maintenance',
  message: 'Scheduled maintenance on Sunday 2-4 AM',
  category: NotificationCategory.SYSTEM,
  navigation: {
    type: NavigationType.NONE
  },
};
```

## Best Practices

1. **Always set a category**: Use the most specific category available
2. **Use appropriate navigation types**: Choose the right navigation type for the context
3. **Keep it simple**: Start with basic notifications, add enhancements as needed
4. **Test navigation flows**: Ensure all notification types route correctly
5. **Handle edge cases**: Always check for navigation existence before routing

## Advanced Features

For advanced features like priority levels, icons, and action buttons, see the comprehensive documentation in:

📖 **[Advanced Features Documentation](./docs/advanced-features.md)**

This includes:
- Priority system for notification ordering
- Icon support for visual indicators
- Action buttons for complex interactions
- Builder pattern for complex notifications
- Frontend integration examples
- Best practices and migration strategies

## Migration Guide

If you have existing notifications:

1. **Add category field**: Set to `NotificationCategory.GENERAL` for existing notifications
2. **Add navigation field**: Set to `{ type: NavigationType.NONE }` for notifications that don't need navigation
3. **Update frontend**: Implement the route mapping and navigation handler
4. **Test thoroughly**: Ensure all notification types work correctly

## Edge Cases Handled

1. **Missing navigation**: Frontend gracefully handles notifications without navigation
2. **Invalid entity IDs**: Route mapping validates entity IDs before navigation
3. **Unknown categories**: Default fallback for unmapped categories
4. **Complex parameters**: Support for query parameters and complex navigation states
5. **Optional enhancements**: Priority, icons, and actions are completely optional 