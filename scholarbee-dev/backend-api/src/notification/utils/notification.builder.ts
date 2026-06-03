import { Types } from 'mongoose';
import {
  NotificationCategory,
  NavigationTypeEnum,
  AudienceType,
  Notification,
} from '../schemas/notification.schema';

// Method call tracking interface
type MethodName = keyof NotificationBuilder;

type MethodCallTracker = Partial<Record<MethodName, boolean>>;

enum MethodGroupValidationScopeEnum {
  ANY_ONE_OF = 'any_one_of',
  ALL_OF = 'all_of',
  NONE_OF = 'none_of',
}

// Required method group interface
interface RequiredMethodGroup {
  name: string;
  validation_scope: MethodGroupValidationScopeEnum;
  methods: MethodName[];
  description: string;
}

// Utility functions for creating notifications
export class NotificationBuilder {
  private notification: Partial<Notification> = {
    category: NotificationCategory.GENERAL,
  };

  // Track which methods have been called
  private methodCalls: MethodCallTracker = {};

  private requiredMethodGroups: RequiredMethodGroup[] = [
    {
      name: 'basic_info',
      validation_scope: MethodGroupValidationScopeEnum.ALL_OF,
      methods: ['setTitle', 'setMessage', 'setCategory'],
      description: 'Title, message, and category are required',
    },
    {
      name: 'audience',
      // TODO: Check if branded types can be used to enforce this behavior through the type system
      validation_scope: MethodGroupValidationScopeEnum.ANY_ONE_OF,
      methods: [
        'setGlobalUserAudience',
        'setSpecificUserAudience',
        'setGlobalCampusAudience',
        'setSpecificCampusAudience',
      ],
      description:
        'One audience method must be called (either global or specific for users or campuses)',
    },
  ];

  // Helper method to mark a method as called
  private markMethodCalled(methodName: MethodName): void {
    this.methodCalls[methodName] = true;
  }

  // Helper method to check if method group is satisfied based on validation scope
  private isMethodGroupSatisfied(group: RequiredMethodGroup): boolean {
    const calledMethods = group.methods.filter(
      (method) => this.methodCalls[method],
    );

    switch (group.validation_scope) {
      case MethodGroupValidationScopeEnum.ALL_OF:
        // All methods in the group must be called
        return calledMethods.length === group.methods.length;

      case MethodGroupValidationScopeEnum.ANY_ONE_OF:
        // At least one method in the group must be called
        return calledMethods.length >= 1;

      case MethodGroupValidationScopeEnum.NONE_OF:
        // No methods in the group should be called
        return calledMethods.length === 0;

      default:
        return false;
    }
  }

  // Validation method to check all required method groups
  private validateRequiredMethodCalls(): void {
    const unsatisfiedGroups: string[] = [];

    for (const group of this.requiredMethodGroups) {
      if (!this.isMethodGroupSatisfied(group)) {
        unsatisfiedGroups.push(group.description);
      }
    }

    if (unsatisfiedGroups.length > 0) {
      throw new Error(
        `Missing required method calls:\n${unsatisfiedGroups.join('\n')}\n\n` +
          `Called methods: ${Object.keys(this.methodCalls).join(', ')}`,
      );
    }
  }

  // Method to add custom required method groups (for extensibility)
  addRequiredMethodGroup(group: RequiredMethodGroup): this {
    this.requiredMethodGroups.push(group);
    return this;
  }

  /* ******************************************************** */
  /* ******************* BASIC METHODS ********************* */
  /* ******************************************************** */

  // Required methods
  setTitle(title: string) {
    this.notification.title = title;
    this.markMethodCalled('setTitle');
    return this;
  }

  setMessage(message: string) {
    this.notification.message = message;
    this.markMethodCalled('setMessage');
    return this;
  }

  setCategory(category: NotificationCategory) {
    this.notification.category = category;
    this.markMethodCalled('setCategory');
    return this;
  }

  /* ******************************************************** */
  /* ******************* AUDIENCE METHODS ******************* */
  /* ******************************************************** */

  // Audience methods - Global User Audience
  setGlobalUserAudience() {
    this.notification.audience = {
      audienceType: AudienceType.User,
      isGlobal: true,
    };
    this.markMethodCalled('setGlobalUserAudience');
    return this;
  }

  // Audience methods - Specific User Audience
  setSpecificUserAudience(userIds: Types.ObjectId[]) {
    this.notification.audience = {
      audienceType: AudienceType.User,
      isGlobal: false,
      recipients: userIds,
    };
    this.markMethodCalled('setSpecificUserAudience');
    return this;
  }

  // Audience methods - Global Campus Audience
  setGlobalCampusAudience() {
    this.notification.audience = {
      audienceType: AudienceType.Campus,
      isGlobal: true,
    };
    this.markMethodCalled('setGlobalCampusAudience');
    return this;
  }

  // Audience methods - Specific Campus Audience
  setSpecificCampusAudience(campusIds: Types.ObjectId[]) {
    this.notification.audience = {
      audienceType: AudienceType.Campus,
      isGlobal: false,
      recipients: campusIds,
    };
    this.markMethodCalled('setSpecificCampusAudience');
    return this;
  }

  /* ******************************************************** */
  /* ******************* Enhancement METHODS *************** */
  /* ******************************************************** */

  // Navigation methods (optional)
  setNavigation(
    type: NavigationTypeEnum,
    entityId?: Types.ObjectId,
    params?: Record<string, any>,
  ) {
    // Initialize navigation array if it doesn't exist
    if (!this.notification.navigation) {
      this.notification.navigation = [];
    }

    // Add the navigation context to the array
    this.notification.navigation.push({
      type,
      entityId,
      params,
    });
    this.markMethodCalled('setNavigation');
    return this;
  }

  // Add multiple navigation contexts at once
  setMultipleNavigation(
    navigationContexts: Array<{
      type: NavigationTypeEnum;
      entityId?: Types.ObjectId;
      params?: Record<string, any>;
    }>,
  ) {
    this.notification.navigation = navigationContexts;
    this.markMethodCalled('setNavigation');
    return this;
  }

  // // Clear all navigation contexts
  // clearNavigation() {
  //   this.notification.navigation = [];
  //   return this;
  // }

  // Optional enhancement methods
  setPriority(priority: 'low' | 'medium' | 'high' | 'urgent') {
    this.notification.priority = priority;
    this.markMethodCalled('setPriority');
    return this;
  }

  setImageUrl(imageUrl?: string) {
    if (imageUrl) {
      this.notification.image_url = imageUrl;
    }
    this.markMethodCalled('setImageUrl');
    return this;
  }

  build(): Notification {
    // Validate method calls first
    this.validateRequiredMethodCalls();

    // Additional field-level validations
    if (this.notification.navigation) {
      // Entity ID is optional for all navigation types
      // Client can decide to show detail or list based on entityId presence
    }

    return this.notification as Notification;
  }
}

// Example Frontend route mapping (something like this should be in the frontend code)
export const FRONTEND_ROUTE_MAPPING = {
  [NavigationTypeEnum.ADMISSION_PROGRAM]: {
    detail: '/admission-programs/:id',
    list: '/admission-programs',
  },
  [NavigationTypeEnum.PROGRAM]: {
    detail: '/programs/:id',
    list: '/programs',
  },
  [NavigationTypeEnum.CAMPUS]: {
    detail: '/campuses/:id',
    list: '/campuses',
  },
  [NavigationTypeEnum.SCHOLARSHIP]: {
    detail: '/scholarships/:id',
    list: '/scholarships',
  },
  [NavigationTypeEnum.APPLICATION]: {
    detail: '/applications/:id',
    list: '/applications',
  },
  [NavigationTypeEnum.BLOG_POST]: {
    detail: '/blog-posts/:id',
    list: '/blog-posts',
  },
  [NavigationTypeEnum.USER_PROFILE]: '/profile',
  [NavigationTypeEnum.USER_DASHBOARD]: '/dashboard',
  [NavigationTypeEnum.APPLICATION_STATUS]: '/applications/:id/status',
  [NavigationTypeEnum.CHAT_CONVERSATION]: '/chat/:id',
} as const;
