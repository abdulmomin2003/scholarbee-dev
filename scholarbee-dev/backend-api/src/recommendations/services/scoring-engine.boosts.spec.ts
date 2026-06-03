import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ScoringEngineService } from './scoring-engine.service';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { BayesianWeightService } from './bayesian-weight.service';
import { AdmissionProgram } from 'src/admission-programs/schemas/admission-program.schema';
import { University } from 'src/universities/schemas/university.schema';
import { UserEvent } from '../schemas/user-event.schema';
import { Application } from 'src/applications/schemas/application.schema';
import { Admission } from 'src/admissions/schemas/admission.schema';
import { Program } from 'src/programs/schemas/program.schema';
import { ProgramTemplate } from 'src/program-templates/schemas/program-template.schema';
import { Campus } from 'src/campuses/schemas/campus.schema';
import { Address } from 'src/addresses/schemas/address.schema';
import { Types } from 'mongoose';

describe('ScoringEngineService Boosts (Phase 3 & 5)', () => {
  let service: ScoringEngineService;
  let mockPrograms: any[] = [];

  const mockAdmissionProgramModel = {
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => Promise.resolve(mockPrograms)),
  };

  const mockUniversityModel = {
    find: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => Promise.resolve([])),
  };
  
  const mockUserEventModel = {};
  const mockApplicationModel = {};

  const mockAdmissionModel = {
    find: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockPrograms.map(p => ({ _id: p.admission?._id || new Types.ObjectId() })));
    }),
  };

  const mockAddressModel = {
    find: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockPrograms.map(p => ({ _id: p.program?.campus_id?.address_id?._id || new Types.ObjectId() })));
    }),
  };

  const mockProgramTemplateModel = {
    find: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockPrograms.map(p => ({ _id: p.program?.template?._id || new Types.ObjectId() })));
    }),
  };

  const mockCampusModel = {
    find: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockPrograms.map(p => ({ _id: p.program?.campus_id?._id || new Types.ObjectId() })));
    }),
  };

  const mockProgramModel = {
    find: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockPrograms.map(p => ({ _id: p.program?._id || new Types.ObjectId() })));
    }),
  };

  const mockKnowledgeGraphService = {
    getFieldSimilarity: jest.fn((f1, f2) => (f1.toLowerCase() === f2.toLowerCase() ? 1.0 : 0.0)),
  };

  const mockBayesianWeightService = {
    getWeights: jest.fn().mockReturnValue({
      degree_match: 0.25 / 0.85,
      field_match: 0.25 / 0.85,
      city_match: 0.20 / 0.85,
      fee_match: 0.15 / 0.85,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringEngineService,
        { provide: getModelToken(AdmissionProgram.name), useValue: mockAdmissionProgramModel },
        { provide: getModelToken(University.name), useValue: mockUniversityModel },
        { provide: getModelToken(UserEvent.name), useValue: mockUserEventModel },
        { provide: getModelToken(Application.name), useValue: mockApplicationModel },
        { provide: getModelToken(Admission.name), useValue: mockAdmissionModel },
        { provide: getModelToken(Program.name), useValue: mockProgramModel },
        { provide: getModelToken(ProgramTemplate.name), useValue: mockProgramTemplateModel },
        { provide: getModelToken(Campus.name), useValue: mockCampusModel },
        { provide: getModelToken(Address.name), useValue: mockAddressModel },
        { provide: KnowledgeGraphService, useValue: mockKnowledgeGraphService },
        { provide: BayesianWeightService, useValue: mockBayesianWeightService },
      ],
    }).compile();

    service = module.get<ScoringEngineService>(ScoringEngineService);
  });

  it('should prove preference signals beat partner status (Option B: tiebreaker boosts)', async () => {
    const user: any = {
      _id: new Types.ObjectId(),
      onboarding_preferences: {
        degree_goal: 'Bachelors',
        preferred_cities: ['Islamabad'],
        preferred_fields_of_study: ['Computer Science'],
        semester_fee_range: { min: 100000, max: 200000 },
      },
    };

    // Program 1: Perfect Match, Non-Partner
    const prog1 = {
      _id: new Types.ObjectId(),
      slug: 'perfect-non-partner',
      admission_fee: '150000',
      receiving_applications: true,
      program: {
        _id: new Types.ObjectId(),
        name: 'BS Computer Science',
        mode_of_study: 'regular',
        template: {
          _id: new Types.ObjectId(),
          degree_level: 'Bachelors',
          field_of_study: 'Computer Science',
        },
        campus_id: {
          _id: new Types.ObjectId(),
          name: 'Islamabad Campus',
          scholarbee_verified: false, // Non-partner
          address_id: {
            _id: new Types.ObjectId(),
            city: 'Islamabad',
          },
        },
        fee_structure: {
          tuition_fee: 150000,
        },
      },
      admission: {
        _id: new Types.ObjectId(),
        admission_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // active deadline
      },
      favouriteBy: [],
    };

    // Program 2: Poor Match (Mismatch on field & city), Partner
    const prog2 = {
      _id: new Types.ObjectId(),
      slug: 'poor-partner',
      admission_fee: '150000',
      receiving_applications: true,
      program: {
        _id: new Types.ObjectId(),
        name: 'BS Fine Arts',
        mode_of_study: 'regular',
        template: {
          _id: new Types.ObjectId(),
          degree_level: 'Bachelors',
          field_of_study: 'Fine Arts', // mismatch
        },
        campus_id: {
          _id: new Types.ObjectId(),
          name: 'Karachi Campus',
          scholarbee_verified: true, // Partner
          address_id: {
            _id: new Types.ObjectId(),
            city: 'Karachi', // mismatch
          },
        },
        fee_structure: {
          tuition_fee: 150000,
        },
      },
      admission: {
        _id: new Types.ObjectId(),
        admission_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // active deadline
      },
      favouriteBy: [],
    };

    mockPrograms = [prog1, prog2];

    const results = await service.scorePrograms(user, [], []);
    
    // Assert perfect match non-partner (higher base relevance score) ranks higher than poor partner
    expect(results[0].slug).toBe('perfect-non-partner');
    expect(results[1].slug).toBe('poor-partner');
  });

  it('should prove partner status acts as a tiebreaker for equal matches', async () => {
    const user: any = {
      _id: new Types.ObjectId(),
      onboarding_preferences: {
        degree_goal: 'Bachelors',
        preferred_cities: ['Islamabad'],
        preferred_fields_of_study: ['Computer Science'],
        semester_fee_range: { min: 100000, max: 200000 },
      },
    };

    // Equal Base Match (both match onboarding perfectly)
    // Program A: Non-Partner
    const progA = {
      _id: new Types.ObjectId(),
      slug: 'equal-non-partner',
      admission_fee: '150000',
      receiving_applications: true,
      program: {
        _id: new Types.ObjectId(),
        name: 'BS Computer Science',
        mode_of_study: 'regular',
        template: {
          _id: new Types.ObjectId(),
          degree_level: 'Bachelors',
          field_of_study: 'Computer Science',
        },
        campus_id: {
          _id: new Types.ObjectId(),
          name: 'Islamabad Campus A',
          scholarbee_verified: false, // Non-partner
          address_id: {
            _id: new Types.ObjectId(),
            city: 'Islamabad',
          },
        },
        fee_structure: {
          tuition_fee: 150000,
        },
      },
      admission: {
        _id: new Types.ObjectId(),
        admission_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // active deadline
      },
      favouriteBy: [],
    };

    // Program B: Partner
    const progB = {
      _id: new Types.ObjectId(),
      slug: 'equal-partner',
      admission_fee: '150000',
      receiving_applications: true,
      program: {
        _id: new Types.ObjectId(),
        name: 'BS Computer Science',
        mode_of_study: 'regular',
        template: {
          _id: new Types.ObjectId(),
          degree_level: 'Bachelors',
          field_of_study: 'Computer Science',
        },
        campus_id: {
          _id: new Types.ObjectId(),
          name: 'Islamabad Campus B',
          scholarbee_verified: true, // Partner
          address_id: {
            _id: new Types.ObjectId(),
            city: 'Islamabad',
          },
        },
        fee_structure: {
          tuition_fee: 150000,
        },
      },
      admission: {
        _id: new Types.ObjectId(),
        admission_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // active deadline
      },
      favouriteBy: [],
    };

    mockPrograms = [progA, progB];

    const results = await service.scorePrograms(user, [], []);

    // Assert that partner wins the tie (ranked #1)
    expect(results[0].slug).toBe('equal-partner');
    expect(results[1].slug).toBe('equal-non-partner');
  });
});
