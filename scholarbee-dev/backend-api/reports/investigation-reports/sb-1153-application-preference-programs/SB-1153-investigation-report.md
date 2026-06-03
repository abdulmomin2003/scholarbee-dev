# Investigation: Application Preferences Program vs Admission Program ID Inconsistency

## Jira Ticket
**Link:** https://scholarbee-team.atlassian.net/browse/SB-1153

## Executive Summary

This investigation documents the discovery and resolution of a data inconsistency issue where application preferences stored either Program IDs or Admission Program IDs in the same field, causing population failures when retrieving application details. The root cause was identified as a lack of validation during application submission, combined with frontend behavior changes over time.

---

## Initial Hypothesis / Preliminary Thoughts

After the issue was raised, the preliminary thoughts were as follows:

1. **Query/Aggregation Logic Issue**: A possible cause is that something is wrong with the querying or the aggregation logic which gets the application data.

2. **Invalid or Undefined IDs**: Another possible cause is that the preferences of the specific application have invalid or undefined IDs, resulting in a null population.

3. **Data Deletion**: This could be due to incorrect submission or, in the worst-case scenario, due to data deletion.

---

## Background

### Initial Investigation: Query Setup

The backend team looked into how the aggregation query was set up. It was found that the aggregation query tried to look into the `program` collection based on the `program` key available in the `preferences` array under the `departments` array. This was also intuitive behavior because:

- The schema stored the `program` key under the preferences
- The DTO of the application submission also stored the `program` key under the preferences

### Frontend Discussion Discovery

However, later a discussion was held with the frontend team and it was found that:

- The frontend team sent **admission program ID** in the preferences array against the `program` key
- Since the DTO had no validation for the application submission, it accepted it as is and saved it in the `program` key in the application schema as well

### Frontend Lookup API

The claim of the frontend to send the admission program ID against the `program` key in the create-application DTO was also backed by the fact that:

- The frontend was using a **lookup API of the admission program service** (`getAdmissionProgramsByAcademicDepartment()`)
- This API returned a list of program name and admission program ID to the frontend
- The frontend then used these results to let the user select an admission program ID of the same department
- Therefore, that admission program ID is what was sent in the preferences array

**Note:** This lookup-based mechanism was a **recent** piece of work. Before that, the frontend was manually getting the program from other queries, with an implementation or mechanism that is currently unknown.

---

## Initial Issue

### The Population Problem

The query service (or the find-one service) of the application was set up in a way that it looked into the `program` collection to populate the program saved in the `preferences` array. It was unable to do so because:

- What was actually being saved in the `program` key of the preferences array was an **admission program ID**
- The population against the `program` collection did not make any sense
- Instead, the population should be done against the **admission program collection**

### Code Location

**Legacy Service (Buggy):**
```typescript
// backend/src/applications/services/applications.legacy.service.ts
.populate({
  path: 'departments.preferences.program',
  model: 'Program',  // ❌ Wrong model - should be 'AdmissionProgram'
});
```

**Schema Definition:**
```typescript
// backend/src/applications/schemas/application.schema.ts
program: { type: Types.ObjectId, ref: AdmissionProgram.name }  // References AdmissionProgram
```

---

## Behavior After Changing Aggregation

### Testing with New Applications

With this discussion in mind, the aggregation query to get the application detail was changed to now rely on the **admission program collection** to populate the `program` key of the preferences array. After this change:

- ✅ The query worked fine and successfully populated the results for the **newly created applications**

### Testing with Older Applications

However, when the query service was tested to get the application detail of **older applications**, the result could still not populate the `program` object. This behavior was confusing.

### Reverting the Change

To confirm, the population reference was again reverted to refer back to the `program` collection instead of the `admission program` collection. After this revert:

- ✅ The population of the **older applications'** preferences programs worked

### Key Insight

This indicated that:

- For all the **older applications**, the applications were submitted with the **actual program ID** in the preferences array
- For the **newer applications**, since a dedicated lookup API was used to get the admission program IDs, the newer applications actually had the **admission program ID** being saved in the `program` key of the preferences array

### The Dilemma

Therefore:

- The population of **older applications** worked fine when referring to the `program` collection, but did not work for the **newer applications** which had an admission program ID stored against the `program` key
- Conversely, the population of **newer applications** only worked when the reference of population was the **admission program collection** instead of the program collection, and then the older applications would fail

---

## Aggregation Analysis of Stored IDs

### Investigation Query

To further solidify and investigate this behavior, an aggregation query was set up intending to:

- Get a list of all the programs in the `preferences` array of all the applications
- Then see how many of these IDs matched against the **admission programs** and how many matched against the **programs**

### Results

After deduplicating the IDs in the list:

- There were **48 unique items**
- Out of those 48, **46 IDs** were actually **program IDs**
- Only **2 IDs** were **admission program IDs**

### Conclusion

This further solidified the assumption or hypothesis that:

- All the older applications were basically saving **programs** in them instead of admission programs
- It is possibly only after the implementation of the **dedicated lookup API** that we started to save the **admission program IDs** in the preferences array instead of program IDs

---

## Expected Frontend Behavior vs Actual Data

### Frontend Discussion

In a previously held discussion with the frontend, it was found that the frontend was sending the admission program ID even for the admission program the user is applying on.

**Example:**
- If a department offered four programs A, B, C, and D
- Then in the preferences array the frontend would send other preferences followed by the admission program that the user is applying on
- So basically, the preferences array would be something like: A, and then it could be C or D
- But the **first element** of the preferences array should always have the **admission program ID** set to the `program` key

### Validation Query

Based on this discussion, another aggregation was created. The point of this aggregation was to test if, for **every application** in the database, the preferences array contains (in their program keys) the **admission program ID on which the application is submitted**, or not.

### Results

The results showed that:

- Apart from the latest two or three test applications
- There was **no application** for which we could find the admission program ID (on which the user submitted the application) in the preferences array against the `program` key

### Conclusion

This further solidified the fact that the ID being saved in the `program` key of the preferences array is **not** the admission program ID in the vast majority of existing records.

---

## Identified Issues

After all this investigation, multiple issues were found in the code, other than the one discussed just now.

### 1. Lack of Validation on Submission

**Problem:** There was no validation set up at the time of submission. Therefore, whatever the frontend was submitting was blindly being added to the database, which caused data inconsistency.

**Impact:**
- Frontend could send any ID type (Program ID or Admission Program ID)
- No verification that the submitted IDs are valid
- No validation that preferences belong to the same department
- Data corruption and inconsistency across the database

### 2. Unnecessary Fields Required in Submission Payload

**Problem:** When the user submits an application, they are required to send in the payload many IDs that are not required, like:

- Admission ID
- Campus ID
- Program ID

As well as other fields like:

- Submission date
- Admission fee (which is basically a hard-coded number of one thousand rupees for now)

**Impact:**
- Increased complexity for frontend developers
- Higher chance of errors (sending wrong IDs)
- Unnecessary data transmission
- Client-side logic to fetch and provide these IDs

**Solution:** All of these fields are not required, as all of them could be extracted based on the **admission program ID** on which the application is submitted.

### 3. Unnecessary Fields in the Database Schema

**Problem:** There is no actual need to store all these fields in the first place in the database. Fields like the IDs just discussed in point number 2, and even the **department ID** being saved in the program or application document, do not make much sense.

**Additional Issue:** Even the **schema structure** of the application is not following good schema design and instead should be optimized and restructured to store the preferences in a **top-level array** of the document.

**Note:** However, this restructuring should be done with extreme care, as the application model might still be referenced across the application in multiple places and the consumers may still rely on the old structure. However, the **submission DTO** can still be simplified.

---

## Implemented / Planned Fixes

Following these observations and investigations, the backend team worked on:

### 1. Simplifying the Application Submission DTO

**Change:** The application submission DTO was simplified to only accept:

- The **application admission program ID**, and
- The **preferences array of admission program IDs**

**Validation Added:**
- Validates that **all the preferences are from the same department** in which the user is applying, based on the admission program ID
- Validates that the first preference matches the top-level admission program ID

**Implementation:**
- This was done **while keeping the same schema structure** to avoid affecting the existing codebase
- Service now auto-extracts all related entities (program, campus_id, admission, department) from the admission_program_id

**Files Changed:**
- `backend/src/applications/dto/create-application.dto.ts`
- `backend/src/applications/services/applications.service.ts`

### 2. Updating the Read Query

**Change:** The read query for the application detail was changed to:

- Refer to the **admission program collection**
- To populate the `program` key of the application's preferences

**Note:** However, after further investigation, it was determined that the field should return the ObjectId directly (no population needed) to avoid confusion and maintain consistency.

**Files Changed:**
- `backend/src/applications/services/applications.service.ts` - `findOne()` method

### 3. Data Sanitization for Corrupted / Older Data

**Planned Action:** As far as the corrupted data is concerned for the old applications—where the frontend manually sent the value against the `program` key of the preferences array—the backend intends to:

- Run a script to sanitize the data, and
- Replace each of those `program` keys with the **most recent admission program ID**

**Status:** ⏳ Planned (not yet implemented)

---

## Root Cause Summary

### Primary Root Cause

The issue was caused by a combination of factors:

1. **No Validation**: The DTO accepted any value for the `program` field in preferences without validation
2. **Frontend Behavior Change**: Frontend behavior changed over time:
   - **Older applications**: Frontend sent Program IDs (manually fetched)
   - **Newer applications**: Frontend sent Admission Program IDs (via lookup API)
3. **Incorrect Population**: The query service tried to populate using the wrong model (`Program` instead of `AdmissionProgram`)
4. **Schema Ambiguity**: The schema field was named `program` but actually stored `AdmissionProgram` IDs (in newer records)

### Why It Failed

1. **For Newer Applications:**
   - Database contains `AdmissionProgram` ObjectIds in `departments.preferences.program`
   - Populate query searches `Program` collection with `AdmissionProgram` IDs
   - No matches found → returns `null`

2. **For Older Applications:**
   - Database contains `Program` ObjectIds in `departments.preferences.program`
   - Populate query searches `Program` collection with `Program` IDs
   - Matches found → population works
   - But if changed to search `AdmissionProgram` collection → no matches → returns `null`

---

## Data Analysis Summary

### Aggregation Results

| Metric | Count |
|--------|-------|
| Total unique preference program IDs | 48 |
| IDs matching Program collection | 46 (95.8%) |
| IDs matching Admission Program collection | 2 (4.2%) |

### Application Analysis

- **Older applications**: Store Program IDs in preferences
- **Newer applications** (2-3 test applications): Store Admission Program IDs in preferences
- **No application** (except latest 2-3) has the top-level admission program ID in its preferences array

---

## Technical Changes Made

### DTO Changes

**Before (Legacy):**
```typescript
class PreferenceDto {
  @IsMongoId()
  program: string;  // Ambiguous - could be Program or AdmissionProgram ID
}

class DepartmentDto {
  department: string;  // Client must provide
  preferences: PreferenceDto[];
}

export class CreateApplicationDto {
  admission_program_id: Types.ObjectId;
  campus_id: Types.ObjectId;  // ❌ Client must provide
  program: Types.ObjectId;  // ❌ Client must provide
  admission?: Types.ObjectId;  // ❌ Client must provide
  departments: DepartmentDto[];  // ❌ Nested structure
}
```

**After (New):**
```typescript
class PreferenceDto {
  @IsObjectId()
  @ToObjectId()
  admission_program_id: Types.ObjectId;  // ✅ Explicit - only AdmissionProgram ID
  preference_order: string;
}

export class CreateApplicationDto {
  @IsObjectId()
  admission_program_id: Types.ObjectId;  // ✅ Only top-level admission_program_id
  @IsArray()
  @ArrayNotEmpty()
  @Validate(FirstPreferenceMatchesTopLevelConstraint)
  preferences: PreferenceDto[];  // ✅ Flat array structure
  // ✅ All other fields auto-extracted by service
}
```

### Service Changes

**Before (Legacy):**
```typescript
async createApplicationDraft(dto: CreateApplicationDto) {
  // ❌ No validation
  // ❌ Blindly accepts all DTO fields
  const application = new this.applicationModel({
    ...createApplicationDto,  // ❌ Direct spread
    applicant: user._id,
    admission_id: createApplicationDto.admission,  // ❌ May be undefined
  });
  return await application.save();
}
```

**After (New):**
```typescript
async createApplicationDraft(dto: CreateApplicationDto) {
  // ✅ Validates admission_program_id exists
  const admissionProgram = await this.admissionProgramModel
    .findById(dto.admission_program_id)
    .populate('admission')
    .populate('program')
    .lean();
  
  // ✅ Validates all populated fields
  // ✅ Validates all preferences belong to same department
  
  // ✅ Auto-extracts all related entities
  const application = new this.applicationModel({
    admission_program_id: admissionProgram._id,
    program: admissionProgram.program._id,  // ✅ Auto-extracted
    campus_id: admissionProgram.program.campus_id._id,  // ✅ Auto-extracted
    admission_id: admissionProgram.admission._id,  // ✅ Auto-extracted
    departments: [{
      department: expectedDepartmentId,  // ✅ Auto-extracted
      preferences: dto.preferences.map(pref => ({
        program: pref.admission_program_id,  // ✅ Correctly saves AdmissionProgram ID
        preference_order: pref.preference_order,
      })),
    }],
  });
  return await application.save();
}
```

### Query Changes

**Before (Legacy):**
```typescript
.populate({
  path: 'departments.preferences.program',
  model: 'Program',  // ❌ Wrong model
});
```

**After (New):**
```typescript
// ✅ Removed incorrect populate
// Field now returns ObjectId directly (correct behavior)
// Note: preferences.program is not populated - it returns only the ObjectId (admission program ID)
```

---

## Impact Assessment

### What Was Fixed

1. ✅ **Population Bug**: Preferences no longer return `null` for newer applications
2. ✅ **Data Integrity**: Service ensures correct IDs are saved (Admission Program IDs)
3. ✅ **Validation**: Comprehensive checks prevent invalid data submission
4. ✅ **API Simplicity**: Client only needs to provide `admission_program_id` and preferences
5. ✅ **Auto-Extraction**: Service automatically derives all related entities

### What Remains

1. ⚠️ **Older Data**: Existing applications still have Program IDs in preferences (needs sanitization)
2. ⚠️ **Schema Structure**: Still uses nested `departments[]` structure (could be optimized)
3. ⚠️ **Field Naming**: Field named `program` but stores `AdmissionProgram` ID (potentially confusing)

### Data Migration Status

- ⏳ **Planned**: Script to sanitize older data by replacing Program IDs with corresponding Admission Program IDs
- ⏳ **Not Yet Implemented**: Migration strategy needs to be defined

---

## Lessons Learned

1. **Validation is Critical**: Always validate data at the API boundary to prevent data corruption
2. **Single Source of Truth**: Derive related data from a single source (admission_program_id) rather than requiring clients to provide all IDs
3. **Schema Clarity**: Field names should clearly indicate what they store (e.g., `admission_program` instead of `program`)
4. **Documentation**: Frontend-backend communication and API documentation could have prevented this issue
5. **Backward Compatibility**: When changing frontend behavior, consider impact on existing data and queries

---

## Related Documentation

- [Legacy vs New Implementation Comparison](./SB-1153-legacy-vs-new-comparison.md)
- [Technical Investigation Details](./SB-1153-preferences-program-id-bug-investigation.md)

---

## Status

- ✅ **Root Cause Identified**: Incorrect populate model and lack of validation
- ✅ **Fix Implemented**: DTO simplified, service validates and auto-extracts, query fixed
- ⏳ **Data Migration**: Planned but not yet implemented
- ✅ **Issue Resolved**: For new applications, the issue is fixed

---

**Last Updated:** January 3, 2026  
**Investigation Status:** Complete  
**Fix Status:** Implemented  
**Migration Status:** Planned

