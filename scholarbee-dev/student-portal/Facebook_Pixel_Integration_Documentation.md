# Facebook Pixel Integration Documentation

## ScholarBee Student Frontend Application

### Overview

This document outlines the Facebook Pixel integration implementation in the ScholarBee student frontend application, including current implementation status, analytics collection points, and recommendations for enhanced tracking.

---

## 🎯 Current Implementation Status

### ✅ Implemented Features

1. **Basic Facebook Pixel Setup**

   - Pixel ID: `1169071441410489`
   - Location: `src/components/organisms/facebookPixel.tsx`
   - Integration: Dynamic import in `src/app/layout.tsx`

2. **Page View Tracking**

   - Automatic page view tracking on route changes
   - URL parameter tracking
   - Client-side rendering with SSR disabled

#### 2. **User Engagement Tracking**

**Location**: Various components across the application

| Event Type               | Location                  | Description                     |
| ------------------------ | ------------------------- | ------------------------------- |
| Page Views               | `facebookPixel.tsx`       | Automatic tracking on all pages |
| Chat Interactions        | `chat/` directory         | User-campus communication       |
| Scholarship Applications | `scholarships/` directory | Scholarship application process |
| Program Favorites        | `profile/favorites/`      | User saves programs             |

#### 3. **Lead Generation Points**

**Location**: Contact and registration forms

| Form Type                | Location                          | Conversion Type |
| ------------------------ | --------------------------------- | --------------- |
| Coming Soon Registration | `coming-soon/useSubscribeForm.ts` | Lead Generation |
| Contact Us Form          | `contactUsSection.tsx`            | Lead Generation |
| Newsletter Subscription  | Various components                | Lead Generation |

---

## 🔧 Technical Implementation Details

### Facebook Pixel Component

```typescript
// src/components/organisms/facebookPixel.tsx
const FB_PIXEL_ID = 1169071441410489;

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!FB_PIXEL_ID) return;

    // Initialize Facebook Pixel
    window.fbq('init', FB_PIXEL_ID);
    window.fbq('track', 'PageView');

    // Track page views on route changes
    const url = pathname + searchParams.toString();
    window.fbq('track', 'PageView', { url });
  }, [pathname, searchParams]);
}
```

---

## 🚀 Recommended Facebook Pixel Events

### 1. **Standard Events to Implement**

#### Lead Generation Events

```javascript
// Lead Generation
fbq('track', 'Lead', {
  content_name: 'Scholarship Application',
  content_category: 'Education',
  value: 0.0,
  currency: 'PKR'
});

// Complete Registration
fbq('track', 'CompleteRegistration', {
  content_name: 'Student Profile Creation',
  content_category: 'Education',
  value: 0.0,
  currency: 'PKR'
});
```

#### Conversion Events

```javascript
// Application Submission
fbq('track', 'Purchase', {
  content_name: 'University Application',
  content_category: 'Education',
  value: 0.0,
  currency: 'PKR',
  content_ids: [programId],
  content_type: 'product'
});

// Scholarship Application
fbq('track', 'Purchase', {
  content_name: 'Scholarship Application',
  content_category: 'Education',
  value: 0.0,
  currency: 'PKR',
  content_ids: [scholarshipId],
  content_type: 'product'
});
```

### 2. **Custom Events for Enhanced Tracking**

#### User Journey Events

```javascript
// Program View
fbq('track', 'ViewContent', {
  content_name: 'Program Details',
  content_category: 'Education',
  content_ids: [programId],
  content_type: 'product'
});

// Add to Favorites
fbq('track', 'AddToWishlist', {
  content_name: 'Program Favorited',
  content_category: 'Education',
  content_ids: [programId],
  content_type: 'product'
});

// Chat Initiation
fbq('track', 'InitiateCheckout', {
  content_name: 'Chat with University',
  content_category: 'Education',
  content_ids: [campusId],
  content_type: 'product'
});
```

---

## 📍 Implementation Locations

### 1. **Application Flow Events**

**File**: `src/app/create-profile/(pageComponents)/`

| Event                | Location                                      | Implementation                 |
| -------------------- | --------------------------------------------- | ------------------------------ |
| Lead Generation      | `personalInfo/usePersonalInfo.ts`             | After personal info completion |
| Contact Info         | `contactInfo/useContactInfo.ts`               | After contact info completion  |
| Education Info       | `educationalInfo/useEducationalBackground.ts` | After education completion     |
| Document Upload      | `idCardInfo/useNationalIdCard.ts`             | After document upload          |
| Program Selection    | `chooseProgram/index.tsx`                     | After program selection        |
| Application Complete | `chooseProgram/index.tsx`                     | After application submission   |

### 2. **User Engagement Events**

**File**: `src/app/program-details/`

| Event               | Location                               | Implementation                  |
| ------------------- | -------------------------------------- | ------------------------------- |
| View Content        | `[id]/page.tsx`                        | When program details are viewed |
| Apply for Admission | `pageComponents/applyForAdmission.tsx` | When user clicks apply          |

### 3. **Lead Generation Events**

**File**: Various contact forms

| Event           | Location                          | Implementation                |
| --------------- | --------------------------------- | ----------------------------- |
| Lead Generation | `coming-soon/useSubscribeForm.ts` | After form submission         |
| Contact Form    | `contactUsSection.tsx`            | After contact form submission |

### 4. **User Behavior Events**

**File**: Profile and favorites sections

| Event           | Location             | Implementation                          |
| --------------- | -------------------- | --------------------------------------- |
| Add to Wishlist | `profile/favorites/` | When user favorites program/scholarship |
| View Profile    | `profile/page.tsx`   | When user views their profile           |

---

## 🛠️ Implementation Steps

### Step 1: Create Facebook Pixel Utility

```typescript
// src/utils/facebookPixel.ts
export const FB_PIXEL_ID = 1169071441410489;

export const trackFacebookEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

export const trackLead = (contentName: string, value = 0) => {
  trackFacebookEvent('Lead', {
    content_name: contentName,
    content_category: 'Education',
    value: value,
    currency: 'PKR'
  });
};

export const trackCompleteRegistration = (contentName: string, value = 0) => {
  trackFacebookEvent('CompleteRegistration', {
    content_name: contentName,
    content_category: 'Education',
    value: value,
    currency: 'PKR'
  });
};

export const trackPurchase = (
  contentName: string,
  contentIds: string[],
  value = 0
) => {
  trackFacebookEvent('Purchase', {
    content_name: contentName,
    content_category: 'Education',
    value: value,
    currency: 'PKR',
    content_ids: contentIds,
    content_type: 'product'
  });
};
```

### Step 2: Integrate Events in Application Flow

```typescript
// Example: In personalInfo/usePersonalInfo.ts
import { trackCompleteRegistration } from '@/utils/facebookPixel';

const handleSubmitData = useCallback(
  async () => {
    try {
      await registerEvent({
        step: 'profile/self',
        universityId,
        admissionProgramId,
        programId,
        eventType: 'navigate',
        campusId
      });

      // Add Facebook Pixel tracking
      trackCompleteRegistration('Personal Information Completed');

      // ... rest of the function
    } catch (error) {
      // ... error handling
    }
  },
  [
    /* dependencies */
  ]
);
```

### Step 3: Add Conversion Tracking

```typescript
// Example: In chooseProgram/index.tsx
import { trackPurchase } from '@/utils/facebookPixel';

const onSubmit = async () => {
  try {
    await registerEvent({
      step: 'application/complete',
      universityId,
      admissionProgramId,
      programId,
      eventType: 'navigate',
      campusId
    });

    // Add Facebook Pixel purchase tracking
    trackPurchase('University Application Submitted', [programId]);

    // ... rest of the function
  } catch (error) {
    // ... error handling
  }
};
```

---

## 📈 Analytics Dashboard Setup

### 1. **Facebook Events Manager**

- **Pixel ID**: 1169071441410489
- **Events to Configure**:
  - PageView (automatic)
  - Lead
  - CompleteRegistration
  - Purchase
  - ViewContent
  - AddToWishlist
  - InitiateCheckout

### 2. **Custom Conversions**

- **Lead Generation**: Track form submissions
- **Application Completion**: Track successful applications
- **Program Views**: Track program detail page visits
- **Chat Initiations**: Track chat with university events

### 3. **Audience Building**

- **Website Visitors**: All page views
- **Lead Prospects**: Form submissions
- **Application Starters**: Users who begin application
- **Application Completers**: Users who finish application
- **Engaged Users**: Users who view multiple programs

---

## 🔍 Testing and Validation

### 1. **Facebook Pixel Helper**

- Install Facebook Pixel Helper browser extension
- Verify pixel fires on all pages
- Check event parameters are correct

### 2. **Test Events**

```javascript
// Test in browser console
fbq('track', 'Lead', {
  content_name: 'Test Lead',
  content_category: 'Education',
  value: 0.0,
  currency: 'PKR'
});
```

### 3. **Event Validation**

- Check Facebook Events Manager for event firing
- Verify custom conversions are working
- Monitor audience building progress

---

## 📋 Implementation Checklist

### Phase 1: Basic Events

- [ ] Implement Lead tracking in contact forms
- [ ] Implement CompleteRegistration in profile creation
- [ ] Implement Purchase tracking in application submission
- [ ] Test all events in development

### Phase 2: Enhanced Tracking

- [ ] Implement ViewContent for program pages
- [ ] Implement AddToWishlist for favorites
- [ ] Implement InitiateCheckout for chat
- [ ] Add custom parameters for better targeting

### Phase 3: Optimization

- [ ] Set up custom conversions
- [ ] Create lookalike audiences
- [ ] Implement dynamic ads
- [ ] A/B test different event parameters

---

## 🎯 Expected Outcomes

### 1. **Lead Generation**

- Track form submissions across the site
- Build audiences of interested prospects
- Retarget users who started but didn't complete applications

### 2. **Conversion Optimization**

- Identify drop-off points in application flow
- Optimize user experience based on pixel data
- Improve application completion rates

### 3. **Audience Building**

- Create custom audiences for retargeting
- Build lookalike audiences for prospecting
- Segment users by behavior and interests

### 4. **ROI Measurement**

- Track cost per lead
- Measure application completion rates
- Calculate return on ad spend

---

## 📞 Support and Maintenance

### 1. **Monitoring**

- Regular check of Facebook Events Manager
- Monitor pixel firing rates
- Track conversion performance

### 2. **Updates**

- Keep Facebook Pixel code updated
- Add new events as features are added
- Optimize based on performance data

### 3. **Troubleshooting**

- Use Facebook Pixel Helper for debugging
- Check browser console for errors
- Verify server-side events are firing

---

_This documentation should be updated as new features are added and tracking requirements evolve._
