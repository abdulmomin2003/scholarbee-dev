# SB-1153: Investigation Steps and Code Snippets

This document provides step-by-step instructions to investigate, reproduce, and verify the findings documented in the investigation report.

---

## Step 1: Verify the Initial Issue - Population Returns Null

### Objective
Reproduce the issue where preference programs return `null` when fetching application details.

### Code Location
**File:** `backend/src/applications/services/applications.service.ts` (Legacy implementation)

### Legacy Code (Buggy)
```typescript
async findOne(
  applicationId: Types.ObjectId,
  populate: boolean = true,
): Promise<ApplicationDocument> {
  let query = this.applicationModel.findById(applicationId);

  if (populate) {
    query = query
      .populate('applicant')
      .populate('admission_id')
      .populate('campus_id')
      .populate('program')
      .populate('admission_program_id')
      .populate({
        path: 'departments.department',
        model: 'AcademicDepartment',
      })
      .populate({
        path: 'departments.preferences.program',
        model: 'Program',  // ❌ WRONG MODEL - Had to manually specify because schema has no ref
      });
  }

  return await query.exec();
}
```

**Why `model` had to be specified:**
- The schema defines `program: String` with **no `ref` property**
- Without a `ref`, Mongoose doesn't know which collection to populate from
- The populate query had to **manually specify** `model: 'Program'` (which was incorrect)
- This is why the wrong model was used - it was a guess that happened to work for older data

### Schema Definition
**File:** `backend/src/applications/schemas/application.schema.ts` (Legacy)

```typescript
@Prop({
  type: [
    {
      department: String,
      preferences: [
        {
          id: String,
          program: String,  // ❌ Legacy: String type, NO reference defined
          preference_order: String,
        },
      ],
    },
  ],
})
departments: IDepartment[];
```

**Note:** The legacy schema defines `program` as a `String` with **no reference** (`ref`). This means:
- Mongoose doesn't know which collection to populate from
- The populate query had to explicitly specify `model: 'Program'` (which was wrong)
- No type safety or validation at the schema level

### How to Reproduce

1. **Fetch a newer application** (created after lookup API implementation):
   ```bash
   # Using API endpoint
   GET /applications/{applicationId}?populate=true
   ```

2. **Check the response:**
   ```json
   {
     "departments": [
       {
         "department": "...",
         "preferences": [
           {
             "program": null,  // ❌ Returns null
             "preference_order": "1st"
           }
         ]
       }
     ]
   }
   ```

3. **Why it fails:**
   - **Schema Issue:** Legacy schema defines `program: String` with **no `ref` property**, so Mongoose doesn't know which collection to populate from
   - **Populate Issue:** Query manually specifies `model: 'Program'` (which was wrong)
   - **Data Issue:** Database contains `AdmissionProgram` ObjectIds in `departments.preferences.program`
   - **Result:** Populate query searches `Program` collection with `AdmissionProgram` IDs → No matches found → returns `null`

---

## Step 2: Verify Schema vs Population Mismatch

### Objective
Confirm that the legacy schema has no reference defined for `program`, but the populate query tries to use `Program` model.

### Legacy Schema Code
**File:** `backend/src/applications/schemas/application.schema.ts:217-222` (Legacy)

```typescript
preferences: [
  {
    id: String,
    program: String,  // ❌ Legacy: String type, NO reference (ref) defined at all
    preference_order: String,
  },
],
```

**Key Issue:**
- Schema defines `program: String` with **no `ref` property**
- This means Mongoose has no information about which collection this field references
- The populate query had to **manually specify** `model: 'Program'` (which was incorrect)
- Since the schema has no reference, Mongoose couldn't validate or automatically determine the correct collection

### Verification Steps

1. **Check legacy schema definition:**
   ```bash
   # View schema file
   cat src/applications/schemas/application.schema.ts | grep -A 10 "preferences:"
   ```

2. **Check populate code:**
   ```bash
   # View service file
   cat src/applications/services/applications.service.ts | grep -A 5 "departments.preferences.program"
   ```

3. **Expected finding:**
   - Schema: `program: String` (no `ref` property at all)
   - Populate: `model: 'Program'` (manually specified, but wrong model)
   - **Issue:** Schema has no reference, so populate had to guess, and guessed wrong ✅

---

## Step 3: Analyze Data - Extract All Preference Program IDs

### Objective
Extract all unique preference program IDs from all applications and analyze what type of IDs they are.

### Aggregation Pipeline

**Run in MongoDB Compass or MongoDB Shell:**

```javascript
// Step 3.1: Extract all preference program IDs grouped by application
db.applications.aggregate([
  // Unwind departments array
  {
    $unwind: {
      path: '$departments',
      preserveNullAndEmptyArrays: true
    }
  },
  
  // Unwind preferences array
  {
    $unwind: {
      path: '$departments.preferences',
      preserveNullAndEmptyArrays: true
    }
  },
  
  // Group by application ID and collect preference program IDs
  {
    $group: {
      _id: '$_id',
      admission_program_id: { $first: '$admission_program_id' },
      prefProgramIds: { $addToSet: '$departments.preferences.program' },
      prefProgramCount: { $sum: 1 }
    }
  },
  
  // Sort by preference count
  {
    $sort: {
      prefProgramCount: -1
    }
  }
])
```

### Step 3.2: Get All Unique Preference Program IDs

```javascript
// Extract unique preference program IDs as array of strings
db.applications.aggregate([
  { $unwind: '$departments' },
  { $unwind: '$departments.preferences' },
  {
    $group: {
      _id: null,
      allPrefProgramObjectIds: { $addToSet: '$departments.preferences.program' }
    }
  },
  {
    $project: {
      _id: 0,
      allPrefProgramObjectIds: {
        $map: {
          input: '$allPrefProgramObjectIds',
          as: 'prefProgramId',
          in: { $toString: '$$prefProgramId' }
        }
      }
    }
  }
])
```

**Expected Result:**
```json
{
  "allPrefProgramObjectIds": [
    "6877d59925ce9bfa136efb0b",
    "67375dda61405134a5b26826",
    // ... 48 unique IDs total
  ]
}
```

---

## Step 4: Verify IDs Against Program Collection

### Objective
Check how many preference program IDs exist in the `programs` collection.

### Aggregation Pipeline

```javascript
// Step 4.1: Check which preference IDs exist in programs collection
db.applications.aggregate([
  {
    $unwind: "$departments"
  },
  {
    $unwind: "$departments.preferences"
  },
  {
    $project:
      /**
       * specifications: The fields to
       *   include or exclude.
       */
      {
        pref_prog: {
          $toObjectId: {
            $toString:
              "$departments.preferences.program"
          }
        }
      }
  },
  {
    $group: {
      _id: "$pref_prog"
    }
  },
  {
    $lookup: {
      from: "programs",
      localField: "_id",
      foreignField: "_id",
      as: "programMatch"
    }
  },
  {
    $lookup: {
      from: "admission_programs",
      localField: "_id",
      foreignField: "_id",
      as: "admissionProgramMatch"
    }
  },
  {
    $project: {
      _id: 1,
      isProgram: {
        $gt: [
          {
            $size: "$programMatch"
          },
          0
        ]
      },
      isAdmissionProgram: {
        $gt: [
          {
            $size: "$admissionProgramMatch"
          },
          0
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      totalUniqueIds: {
        $sum: 1
      },
      not_programIds: {
        $push: {
          $cond: [
            {
              $not: "$isProgram"
            },
            "$_id",
            null
          ]
        }
      },
      real_programIdsCount: {
        $sum: {
          $cond: ["$isProgram", 1, 0]
        }
      },
      real_admissionProgramIdsCount: {
        $sum: {
          $cond: ["$isAdmissionProgram", 1, 0]
        }
      }
    }
  }
])
```

**Expected Result:**
```json
{
  "_id": null,
  "totalUniqueIds": 48,
  "programIds": 46,        // 95.8% are Program IDs
  "admissionProgramIds": 2  // 4.2% are Admission Program IDs
}
```

---

## Step 5: Verify IDs Against Admission Program Collection

### Objective
Check how many preference program IDs exist in the `admissionprograms` collection.

### Aggregation Pipeline

```javascript
// Check which preference IDs exist in admissionprograms collection
db.applications.aggregate([
  { $unwind: '$departments' },
  { $unwind: '$departments.preferences' },
  {
    $group: {
      _id: '$departments.preferences.program'
    }
  },
  {
    $lookup: {
      from: 'admissionprograms',
      localField: '_id',
      foreignField: '_id',
      as: 'match'
    }
  },
  {
    $match: {
      match: { $size: 0 }  // Find IDs that DON'T exist in admissionprograms
    }
  },
  {
    $count: 'idsNotInAdmissionPrograms'
  }
])
```

**Expected Result:**
- Most IDs (46 out of 48) will NOT exist in `admissionprograms` collection
- Only 2 IDs will exist in `admissionprograms` collection

---

## Step 6: Verify Top-Level Admission Program ID in Preferences

### Objective
Check if the top-level `admission_program_id` exists in the preferences array for each application.

### Aggregation Pipeline

```javascript
// Check if admission_program_id is present in preferences array
db.applications.aggregate([
  // Unwind departments
  {
    $unwind: {
      path: '$departments',
      preserveNullAndEmptyArrays: true
    }
  },
  
  // Unwind preferences
  {
    $unwind: {
      path: '$departments.preferences',
      preserveNullAndEmptyArrays: true
    }
  },
  
  // Group by application and collect data
  {
    $group: {
      _id: '$_id',
      originalAdmissionProgramId: { $first: '$admission_program_id' },
      prefProgramIds: { $addToSet: '$departments.preferences.program' },
      prefProgramCount: { $sum: 1 }
    }
  },
  
  // Convert to strings for comparison
  {
    $addFields: {
      originalAdmissionProgramIdStringified: { $toString: '$originalAdmissionProgramId' },
      prefProgramIdsStringified: {
        $map: {
          input: '$prefProgramIds',
          as: 'prefProgramId',
          in: { $toString: '$$prefProgramId' }
        }
      }
    }
  },
  
  // Check if original admission program ID is in preferences
  {
    $match: {
      $expr: {
        $in: ['$originalAdmissionProgramIdStringified', '$prefProgramIdsStringified']
      }
    }
  },
  
  // Count matches
  {
    $count: 'applicationsWithAdmissionProgramIdInPreferences'
  }
])
```

**Expected Result:**
- Only 2-3 applications (the latest test applications) will have the top-level `admission_program_id` in their preferences array
- All older applications will NOT have it

---

## Step 7: Verify Legacy DTO Structure

### Objective
Examine the legacy DTO to understand what fields were required and how preferences were structured.

### Legacy DTO Code
**File:** `backend/src/applications/dto/create-application.legacy.dto.ts`

```typescript
class PreferenceDto {
  @IsMongoId()
  @IsNotEmpty()
  program: string;  // ❌ Ambiguous - could be Program or AdmissionProgram ID
}

class DepartmentDto {
  @IsMongoId()
  @IsNotEmpty()
  department: string;  // ❌ Client must provide
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceDto)
  preferences: PreferenceDto[];
}

export class CreateApplicationDto {
  @IsObjectId()
  admission_program_id: Types.ObjectId;
  
  @IsObjectId()  // ❌ Client must provide
  campus_id: Types.ObjectId;
  
  @IsObjectId()  // ❌ Client must provide
  program: Types.ObjectId;
  
  @IsOptional()
  @IsObjectId()  // ❌ Client must provide
  admission?: Types.ObjectId;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentDto)
  departments: DepartmentDto[];  // ❌ Nested structure
}
```

### Verification Steps

1. **Check legacy DTO file:**
   ```bash
   cat src/applications/dto/create-application.legacy.dto.ts
   ```

2. **Key findings:**
   - ✅ Requires `campus_id`, `program`, `admission` at top level
   - ✅ Requires `department` in nested structure
   - ✅ `program` field in preferences is ambiguous (string type)
   - ✅ No validation that preferences belong to same department

---

## Step 8: Verify Legacy Service Implementation

### Objective
Examine the legacy service to see how it handled application creation without validation.

### Legacy Service Code
**File:** `backend/src/applications/services/applications.legacy.service.ts`

```typescript
async createApplicationDraft(
  user: AuthenticatedRequest['user'],
  createApplicationDto: CreateApplicationDto,
): Promise<ApplicationDocument> {
  // ❌ No validation of admission_program_id
  // ❌ No auto-extraction of related entities
  // ❌ No validation of preferences
  
  const application = new this.applicationModel({
    ...createApplicationDto,  // ❌ Blindly accepts all DTO fields
    applicant: stringToObjectId(user._id),
    admission_id: createApplicationDto.admission,  // ❌ Direct mapping (may be undefined)
    submission_date: new Date(),
    status: ApplicationStatus.DRAFT,
  });
  
  return await application.save();
}
```

### Verification Steps

1. **Check legacy service:**
   ```bash
   cat src/applications/services/applications.legacy.service.ts | grep -A 30 "createApplicationDraft"
   ```

2. **Key findings:**
   - ✅ No validation that `admission_program_id` exists
   - ✅ No auto-extraction of `program`, `campus_id`, `admission`
   - ✅ No validation that preferences belong to same department
   - ✅ Blindly spreads all DTO fields into the model

---

## Step 9: Verify New DTO Structure

### Objective
Examine the new DTO to see how it was simplified and what validation was added.

### New DTO Code
**File:** `backend/src/applications/dto/create-application.dto.ts`

```typescript
// Custom validator for first preference
@ValidatorConstraint({ name: 'firstPreferenceMatchesTopLevel', async: false })
class FirstPreferenceMatchesTopLevelConstraint
  implements ValidatorConstraintInterface {
  validate(preferences: PreferenceDto[], args: ValidationArguments) {
    const dto = args.object as CreateApplicationDto;
    return (
      dto.admission_program_id &&
      Array.isArray(preferences) &&
      preferences.length > 0 &&
      preferences[0]?.admission_program_id?.toString() === dto.admission_program_id.toString()
    );
  }

  defaultMessage() {
    return '1st preference must have the same admission_program_id as the top-level one';
  }
}

class PreferenceDto {
  @IsNotEmpty({ message: 'admission_program_id is required' })
  @IsObjectId({
    message: 'admission_program_id must be a valid MongoDB ObjectId',
  })
  @ToObjectId()
  admission_program_id: Types.ObjectId;  // ✅ Explicit - only AdmissionProgram ID
  
  @IsString()
  @IsEnum(['1st', '2nd', '3rd'])
  preference_order: string;
}

export class CreateApplicationDto {
  @IsObjectId({ message: 'admission_program_id must be a valid MongoDB ObjectId' })
  @ToObjectId()
  admission_program_id: Types.ObjectId;  // ✅ Only top-level admission_program_id
  
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  total_processing_fee?: number = 1000;
  
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one preference is required' })
  @ValidateNested({ each: true })
  @Type(() => PreferenceDto)
  @Validate(FirstPreferenceMatchesTopLevelConstraint)  // ✅ Validates 1st preference matches
  preferences: PreferenceDto[];  // ✅ Flat array structure
  
  // ✅ All other fields (campus_id, program, admission) removed - auto-extracted by service
}
```

### Verification Steps

1. **Check new DTO:**
   ```bash
   cat src/applications/dto/create-application.dto.ts
   ```

2. **Key improvements:**
   - ✅ Only requires `admission_program_id` and `preferences[]`
   - ✅ `preferences` is flat array (not nested `departments[]`)
   - ✅ Custom validator ensures 1st preference matches top-level
   - ✅ All related IDs removed from DTO (auto-extracted by service)

---

## Step 10: Verify New Service Implementation

### Objective
Examine the new service to see how it validates and auto-extracts related entities.

### New Service Code
**File:** `backend/src/applications/services/applications.service.ts`

```typescript
async createApplicationDraft(
  user: AuthenticatedRequest['user'],
  createApplicationDto: CreateApplicationDto,
): Promise<ApplicationDocument> {
  // ✅ Validates and auto-detects related entities
  const admissionProgram = await this.admissionProgramModel
    .findById(createApplicationDto.admission_program_id)
    .populate('admission', { select: '_id' })
    .populate({
      path: 'program',
      select: '_id campus_id academic_departments',
      populate: [
        { path: 'campus_id', select: '_id' },
        { path: 'academic_departments', select: '_id' }
      ]
    })
    .lean();
  
  // ✅ Comprehensive validation of populated fields
  if (!admissionProgram) {
    throw new NotFoundException(
      `Admission Program with ID ${createApplicationDto.admission_program_id} not found`,
    );
  }
  
  if (!admissionProgram.admission) {
    throw new BadRequestException(
      `Admission Program does not have a valid admission reference`,
    );
  }
  
  if (!admissionProgram.program) {
    throw new BadRequestException(
      `Admission Program does not have a valid program reference`,
    );
  }
  
  if (!admissionProgram.program.campus_id) {
    throw new BadRequestException(
      `Program does not have a valid campus_id reference`,
    );
  }
  
  if (!admissionProgram.program.academic_departments) {
    throw new BadRequestException(
      `Program does not have a valid academic_departments reference`,
    );
  }
  
  const expectedDepartmentId = admissionProgram.program.academic_departments._id.toString();
  
  // ✅ Validates all preferences belong to same department
  for (const preference of createApplicationDto.preferences) {
    const prefAdmissionProgram = await this.admissionProgramModel
      .findById(preference.admission_program_id)
      .populate('program')
      .lean();
    
    if (!prefAdmissionProgram) {
      throw new NotFoundException(
        `Admission Program with ID ${preference.admission_program_id} in preferences not found`,
      );
    }
    
    const prefProgram = await this.programModel
      .findById(prefAdmissionProgram.program._id)
      .lean();
    
    const prefDepartmentId = prefProgram.academic_departments.toString();
    if (prefDepartmentId !== expectedDepartmentId) {
      throw new BadRequestException(
        `All preferences must belong to the same department. Preference with Admission Program ID ${preference.admission_program_id} belongs to department ${prefDepartmentId}, but expected department is ${expectedDepartmentId}`,
      );
    }
  }
  
  // ✅ Transforms DTO structure to database structure
  const application = new this.applicationModel({
    total_processing_fee: createApplicationDto.total_processing_fee,
    applicant: stringToObjectId(user._id),
    admission_program_id: admissionProgram._id,  // ✅ From validated admissionProgram
    program: admissionProgram.program._id,  // ✅ Auto-extracted
    campus_id: admissionProgram.program.campus_id._id,  // ✅ Auto-extracted
    admission_id: admissionProgram.admission._id,  // ✅ Auto-extracted
    departments: [{
      department: expectedDepartmentId,  // ✅ Auto-extracted
      preferences: createApplicationDto.preferences.map(pref => ({
        program: pref.admission_program_id,  // ✅ Correctly saves AdmissionProgram ID
        preference_order: pref.preference_order,
      })),
    }],
    submission_date: new Date(),
    status: ApplicationStatus.DRAFT,
  });
  
  return await application.save();
}
```

### Verification Steps

1. **Check new service:**
   ```bash
   cat src/applications/services/applications.service.ts | grep -A 100 "createApplicationDraft"
   ```

2. **Key improvements:**
   - ✅ Validates `admission_program_id` exists
   - ✅ Auto-extracts `program`, `campus_id`, `admission`, `department`
   - ✅ Validates all populated fields exist
   - ✅ Validates all preferences belong to same department
   - ✅ Transforms flat `preferences[]` to nested `departments[].preferences[]`

---

## Step 11: Verify New Query Implementation (findOne)

### Objective
Examine how the `findOne` method was fixed to handle preferences correctly.

### New Service Code
**File:** `backend/src/applications/services/applications.service.ts`

```typescript
async findOne(
  applicationId: Types.ObjectId,
  populate: boolean = true,
): Promise<ApplicationDocument> {
  let query = this.applicationModel.findById(applicationId);

  if (populate) {
    query = query
      .populate('applicant')
      .populate('admission_id')
      .populate('campus_id')
      .populate('program')
      .populate('admission_program_id')
      .populate({
        path: 'departments.department',
        model: 'AcademicDepartment',
      });
      // ✅ Removed incorrect populate for departments.preferences.program
      // Field now returns ObjectId directly (no population needed)
  }

  // Note: preferences.program is not populated - it returns only the ObjectId (admission program ID)
  return await query.exec();
}
```

### Verification Steps

1. **Check findOne method:**
   ```bash
   cat src/applications/services/applications.service.ts | grep -A 30 "async findOne"
   ```

2. **Key changes:**
   - ✅ Removed `.populate({ path: 'departments.preferences.program', model: 'Program' })`
   - ✅ Field returns ObjectId directly
   - ✅ No more null values for newer applications

---

## Step 12: Test the Fix - Create New Application

### Objective
Test that new applications are created correctly with the new implementation.

### Test Request

```bash
# Create a new application with simplified DTO
POST /applications
Content-Type: application/json
Authorization: Bearer {token}

{
  "admission_program_id": "687934bb7b51f1659906d5d8",
  "preferences": [
    {
      "admission_program_id": "687934bb7b51f1659906d5d8",
      "preference_order": "1st"
    },
    {
      "admission_program_id": "6878e19a7b51f1659906a45c",
      "preference_order": "2nd"
    }
  ],
  "total_processing_fee": 1000
}
```

### Expected Behavior

1. **Validation:**
   - ✅ Validates `admission_program_id` exists
   - ✅ Validates all preferences' `admission_program_id` exist
   - ✅ Validates all preferences belong to same department
   - ✅ Validates 1st preference matches top-level `admission_program_id`

2. **Auto-extraction:**
   - ✅ Extracts `program` from `admission_program_id`
   - ✅ Extracts `campus_id` from `program`
   - ✅ Extracts `admission` from `admission_program_id`
   - ✅ Extracts `department` from `program.academic_departments`

3. **Data saved:**
   - ✅ `departments[].preferences[].program` contains `AdmissionProgram` ObjectId
   - ✅ All related fields correctly populated

---

## Step 13: Test the Fix - Fetch Application Details

### Objective
Test that fetching application details returns correct data (no null values).

### Test Request

```bash
# Fetch application details
GET /applications/{applicationId}?populate=true
Authorization: Bearer {token}
```

### Expected Response

```json
{
  "_id": "...",
  "admission_program_id": "...",
  "program": "...",
  "campus_id": "...",
  "departments": [
    {
      "department": "...",
      "preferences": [
        {
          "program": "687934bb7b51f1659906d5d8",  // ✅ ObjectId (not null)
          "preference_order": "1st"
        },
        {
          "program": "6878e19a7b51f1659906a45c",  // ✅ ObjectId (not null)
          "preference_order": "2nd"
        }
      ]
    }
  ]
}
```

### Verification

1. **Check response:**
   - ✅ `departments[].preferences[].program` is NOT null
   - ✅ Contains valid ObjectId (Admission Program ID)
   - ✅ Can be used to fetch admission program details if needed

---

## Step 14: Verify Frontend Lookup API

### Objective
Verify that the frontend uses the lookup API that returns admission program IDs.

### Frontend Lookup API
**File:** `backend/src/admission-programs/services/admission-programs.service.ts:1758-1825`

```typescript
async getAdmissionProgramsByAcademicDepartment(
  academicDepartmentId: Types.ObjectId,
): Promise<
  Array<{
    program_name: string;
    admission_program_id: Types.ObjectId;  // ✅ Returns admission_program_id
  }>
> {
  const currentDate = new Date();

  const pipeline: PipelineStage[] = [
    // Match programs by academic department
    {
      $match: {
        academic_departments: academicDepartmentId,
        deleted: { $ne: true },
      },
    },
    // Lookup admission programs
    {
      $lookup: {
        from: DB_COLLECTIONS.ADMISSION_PROGRAMS,
        localField: '_id',
        foreignField: 'program',
        as: 'admission_programs',
      },
    },
    { $unwind: '$admission_programs' },
    // Lookup admission details
    {
      $lookup: {
        from: DB_COLLECTIONS.ADMISSIONS,
        localField: 'admission_programs.admission',
        foreignField: '_id',
        as: 'admission',
      },
    },
    { $unwind: { path: '$admission', preserveNullAndEmptyArrays: true } },
    // Filter by valid deadlines
    {
      $match: {
        $or: [
          { 'admission.admission_deadline': null },
          { 'admission.admission_deadline': { $exists: false } },
          { 'admission.admission_deadline': { $gte: currentDate } },
        ],
      },
    },
    // Project output
    {
      $project: {
        _id: 0,
        program_name: '$name',
        admission_program_id: '$admission_programs._id',  // ✅ Returns admission_program_id
      },
    },
  ];

  return await this.programModel.aggregate(pipeline).exec();
}
```

### Verification Steps

1. **Check API endpoint:**
   ```bash
   GET /admission-programs/by-academic-department/{academicDepartmentId}
   ```

2. **Expected response:**
   ```json
   [
     {
       "program_name": "Computer Science",
       "admission_program_id": "687934bb7b51f1659906d5d8"
     },
     {
       "program_name": "Software Engineering",
       "admission_program_id": "6878e19a7b51f1659906a45c"
     }
   ]
   ```

3. **Key finding:**
   - ✅ API returns `admission_program_id` (not `program_id`)
   - ✅ Frontend uses these IDs in preferences array
   - ✅ This confirms frontend sends Admission Program IDs

---

## Step 15: Compare Legacy vs New Implementation

### Objective
Create a side-by-side comparison to understand all changes made.

### Comparison Table

| Aspect | Legacy | New |
|--------|--------|-----|
| **Schema Definition** | `program: String` (no `ref` property) | `program: { type: Types.ObjectId, ref: AdmissionProgram.name }` |
| **DTO Structure** | Nested `departments[]` with `preferences[]` | Flat `preferences[]` array |
| **Top-level Fields** | Requires `campus_id`, `program`, `admission` | Only requires `admission_program_id` |
| **Preference Field** | `program: string` (ambiguous) | `admission_program_id: ObjectId` (explicit) |
| **Validation** | Basic type validation only | Comprehensive validation + custom validators |
| **Service Logic** | Blindly accepts DTO fields | Validates and auto-extracts all related entities |
| **Query Population** | Tries to populate with `Program` model (manually specified) | Returns ObjectId directly (no population) |
| **Data Integrity** | Client can send incorrect data | Service ensures data consistency |

### Code Comparison

**Legacy DTO:**
```typescript
departments: DepartmentDto[];  // Nested structure
// Requires: campus_id, program, admission at top level
```

**New DTO:**
```typescript
preferences: PreferenceDto[];  // Flat structure
// Only requires: admission_program_id at top level
```

**Legacy Service:**
```typescript
const application = new this.applicationModel({
  ...createApplicationDto,  // Blind spread
  admission_id: createApplicationDto.admission,  // May be undefined
});
```

**New Service:**
```typescript
const application = new this.applicationModel({
  admission_program_id: admissionProgram._id,  // Validated
  program: admissionProgram.program._id,  // Auto-extracted
  campus_id: admissionProgram.program.campus_id._id,  // Auto-extracted
  admission_id: admissionProgram.admission._id,  // Auto-extracted
  departments: [{
    department: expectedDepartmentId,  // Auto-extracted
    preferences: createApplicationDto.preferences.map(pref => ({
      program: pref.admission_program_id,  // Correctly saves AdmissionProgram ID
      preference_order: pref.preference_order,
    })),
  }],
});
```

---

## Step 16: Verify Controller Changes

### Objective
Check what changes were made to the controller.

### Legacy Controller
**File:** `backend/src/applications/controllers/applications.legacy.controller.ts`

```typescript
@Post()
@CreateApplicationApiDoc()
async create(
  @AuthReq() authReq: AuthenticatedRequest,
  @Body() createApplicationDto: CreateApplicationDto,
) {
  return this.applicationsService.createApplicationDraft(
    authReq.user,
    createApplicationDto,
  );
}
```

### New Controller
**File:** `backend/src/applications/controllers/applications.controller.ts`

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true, whitelist: false, forbidNonWhitelisted: false }))
@CreateApplicationApiDoc()
async create(
  @AuthReq() authReq: AuthenticatedRequest,
  @Body() createApplicationDto: CreateApplicationDto,
) {
  return this.applicationsService.createApplicationDraft(
    authReq.user,
    createApplicationDto,
  );
}
```

### Key Change

- ✅ Added explicit `@UsePipes` decorator with custom ValidationPipe configuration
- ✅ Ensures proper transformation and validation of DTO

---

## Step 17: Verify Schema Changes

### Objective
Check what changes were made to the schema (if any).

### Legacy Schema
**File:** `backend/src/applications/schemas/application.schema.ts` (Current/Legacy)

```typescript
preferences: [
  {
    id: String,  // ❌ Has id field
    program: String,  // ❌ String type, NO reference (ref) defined at all
    preference_order: String,
  },
],
```

**Key Issues:**
- `program` is defined as `String` with **no `ref` property**
- Mongoose has no information about which collection this references
- Populate queries must manually specify the model (which was done incorrectly)

### New Schema (Recommended Fix)
**File:** `backend/src/applications/schemas/application.schema.ts` (Should be updated to)

```typescript
preferences: [
  {
    program: { type: Types.ObjectId, ref: AdmissionProgram.name },  // ✅ ObjectId with explicit ref
    preference_order: String,
  },
],
```

### Key Changes Needed

- ✅ Remove `id` field from preferences (not needed)
- ✅ Change `program` from `String` to `Types.ObjectId` with `ref: AdmissionProgram.name`
- ✅ Explicit reference definition makes it clear what the field stores
- ✅ Mongoose can now automatically determine the correct collection for population

### Current Status

**Note:** The current schema file (`application.schema.ts`) still has the legacy definition (`program: String`). The fix should update it to use `Types.ObjectId` with `ref: AdmissionProgram.name`.

---

## Summary of Investigation Steps

### Quick Reference

1. **Reproduce Issue**: Fetch application → Check for null values in `departments.preferences.program`
2. **Verify Schema Mismatch**: Compare schema `ref` vs populate `model`
3. **Extract All IDs**: Run aggregation to get all unique preference program IDs
4. **Check Program Collection**: Verify how many IDs match `programs` collection
5. **Check Admission Program Collection**: Verify how many IDs match `admissionprograms` collection
6. **Verify Top-Level in Preferences**: Check if `admission_program_id` exists in preferences
7. **Examine Legacy DTO**: Review what fields were required
8. **Examine Legacy Service**: Review how data was saved
9. **Examine New DTO**: Review simplified structure and validation
10. **Examine New Service**: Review validation and auto-extraction logic
11. **Examine New Query**: Review how `findOne` was fixed
12. **Test New Application**: Create application with new DTO
13. **Test Fetch Application**: Verify no null values returned
14. **Verify Frontend API**: Check lookup API returns admission program IDs
15. **Compare Implementations**: Side-by-side comparison
16. **Verify Controller**: Check controller changes
17. **Verify Schema**: Check schema changes

---

## Files to Review

### Legacy Files (Reference)
- `backend/src/applications/dto/create-application.legacy.dto.ts`
- `backend/src/applications/services/applications.legacy.service.ts`
- `backend/src/applications/controllers/applications.legacy.controller.ts`
- `backend/src/applications/schemas/application.legacy.schema.ts`

### Current Files (Fixed)
- `backend/src/applications/dto/create-application.dto.ts`
- `backend/src/applications/services/applications.service.ts`
- `backend/src/applications/controllers/applications.controller.ts`
- `backend/src/applications/schemas/application.schema.ts`

### Related Files
- `backend/src/admission-programs/services/admission-programs.service.ts` (Lookup API)

---

**Last Updated:** January 3, 2026  
**Purpose:** Step-by-step guide to investigate and verify SB-1153 findings

