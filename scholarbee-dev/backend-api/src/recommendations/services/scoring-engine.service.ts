import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdmissionProgram, AdmissionProgramDocument } from 'src/admission-programs/schemas/admission-program.schema';
import { Campus } from 'src/campuses/schemas/campus.schema';
import { University, UniversityDocument } from 'src/universities/schemas/university.schema';
import { UserEvent, UserEventDocument } from '../schemas/user-event.schema';
import { UserDocument, User } from 'src/users/schemas/user.schema';
import { RECOMMENDATION_SCORING_CONFIG } from '../constants/scoring.constants';
import { IRecommendedProgramResponse, IRecommendedUniversityResponse, UserRecommendationEventType } from '../types/recommendation.types';
import { Application } from 'src/applications/schemas/application.schema';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { BayesianWeightService } from './bayesian-weight.service';

// Additional referenced schemas for lightweight pre-queries in scoring engine
import { Admission } from 'src/admissions/schemas/admission.schema';
import { Program } from 'src/programs/schemas/program.schema';
import { ProgramTemplate } from 'src/program-templates/schemas/program-template.schema';
import { Address } from 'src/addresses/schemas/address.schema';

/**
 * === MongoDB Query Audit Findings ===
 * 1. Previously, the system loaded ALL active admission programs (via status !== 'draft') and ALL universities
 *    without any pre-filters, then performed heavy Mongoose document hydration and filtered in-memory.
 * 2. In Mongoose, you cannot filter root collection queries by properties of referenced, populated documents
 *    (e.g. program template's degree_level, address's city, or admission's deadline) during .find().
 * 3. Pre-filters have been optimized:
 *    - Queries run as lightweight, read-only `.lean()` executions.
 *    - Projections select only the fields needed for scoring (no description, metadata, images, etc.).
 *    - Pre-queries on Admission (active deadline), Address, Campus, Program, and ProgramTemplate resolve lists of
 *      allowed Reference IDs in parallel via Promise.all.
 *    - The main queries filter by these allowed Reference ID sets, eliminating full collection scans.
 */

@Injectable()
export class ScoringEngineService {
  constructor(
    @InjectModel(AdmissionProgram.name)
    private readonly admissionProgramModel: Model<AdmissionProgramDocument>,
    @InjectModel(University.name)
    private readonly universityModel: Model<UniversityDocument>,
    @InjectModel(UserEvent.name)
    private readonly userEventModel: Model<UserEventDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<any>,
    @InjectModel(Admission.name)
    private readonly admissionModel: Model<any>,
    @InjectModel(Program.name)
    private readonly programModel: Model<any>,
    @InjectModel(ProgramTemplate.name)
    private readonly programTemplateModel: Model<any>,
    @InjectModel(Campus.name)
    private readonly campusModel: Model<any>,
    @InjectModel(Address.name)
    private readonly addressModel: Model<any>,
    private readonly knowledgeGraphService: KnowledgeGraphService,
    private readonly bayesianWeightService: BayesianWeightService,
  ) { }

  /**
   * Generates scored program recommendations for a user.
   */
  async scorePrograms(
    user: any | null,
    events: UserEventDocument[],
    applications: any[],
  ): Promise<IRecommendedProgramResponse[]> {
    const pref = user?.onboarding_preferences;
    const now = new Date();

    // 1. Resolve active admissions and matching reference IDs in parallel
    const activeAdmissionsPromise = this.admissionModel
      .find({
        is_active: { $ne: false },
        admission_deadline: { $gte: now },
      })
      .select('_id')
      .lean()
      .exec();

    // Soft-filter by city if preferred cities exist
    let addressIdsPromise = Promise.resolve([] as any[]);
    if (pref?.preferred_cities && pref.preferred_cities.length > 0) {
      addressIdsPromise = this.addressModel
        .find({ city: { $in: pref.preferred_cities } })
        .select('_id')
        .lean()
        .exec();
    }

    // Filter by degree goal if set
    let templateIdsPromise = Promise.resolve([] as any[]);
    if (pref?.degree_goal) {
      templateIdsPromise = this.programTemplateModel
        .find({ degree_level: pref.degree_goal })
        .select('_id')
        .lean()
        .exec();
    }

    // Resolve pre-queries in parallel
    const [activeAdmissions, matchingAddresses, matchingTemplates] = await Promise.all([
      activeAdmissionsPromise,
      addressIdsPromise,
      templateIdsPromise,
    ]);

    const activeAdmissionIds = activeAdmissions.map((a) => a._id);

    // If preferred cities were set, find campuses in those cities
    let campusFilter: any = {};
    if (pref?.preferred_cities && pref.preferred_cities.length > 0 && matchingAddresses.length > 0) {
      const addressIds = matchingAddresses.map((addr) => addr._id);
      const matchingCampuses = await this.campusModel
        .find({ address_id: { $in: addressIds } })
        .select('_id')
        .lean()
        .exec();
      const campusIds = matchingCampuses.map((c) => c._id);
      campusFilter = { campus_id: { $in: campusIds } };
    }

    // Find programs matching template and campus filters
    const programQuery: any = {};
    if (pref?.degree_goal) {
      programQuery.template = { $in: matchingTemplates.map((t) => t._id) };
    }
    if (campusFilter.campus_id) {
      programQuery.campus_id = campusFilter.campus_id;
    }

    // Resolve program IDs
    let programIds: any[] | null = null;
    if (Object.keys(programQuery).length > 0) {
      const matchingPrograms = await this.programModel
        .find(programQuery)
        .select('_id')
        .lean()
        .exec();
      programIds = matchingPrograms.map((p) => p._id);
    }

    // 2. Build AdmissionProgram query pushing hard pre-filters
    const admissionProgramQuery: any = {
      status: { $ne: 'draft' },
      admission: { $in: activeAdmissionIds },
    };

    // Apply program ID filters (soft city match / hard degree match)
    if (programIds !== null) {
      if (programIds.length > 0) {
        admissionProgramQuery.program = { $in: programIds };
      } else {
        // Mismatch yielded 0 program IDs.
        // If preferred cities was the only filter, skip it to avoid empty results (soft filter requirement).
        // If degree goal was the filter, we must keep the filter (degree is a hard pre-filter).
        if (pref?.degree_goal) {
          admissionProgramQuery.program = { $in: [] }; // force empty results since degree didn't match
        }
      }
    }

    // Fetch populated active programs with projections, utilizing .lean()
    const admissionPrograms = await this.admissionProgramModel
      .find(admissionProgramQuery)
      .populate({
        path: 'program',
        select: '_id name template campus_id fee_structure slug mode_of_study',
        populate: [
          {
            path: 'template',
            select: '_id name degree_level field_of_study seo_title_key',
          },
          {
            path: 'campus_id',
            select: '_id name logo_url address_id scholarbee_verified slug',
            populate: [
              {
                path: 'address_id',
                select: '_id address_line_1 city state country latitude longitude',
              },
              {
                path: 'university_id',
                select: '_id name logo_url slug',
              },
            ],
          },
          {
            path: 'fee_structure',
            select: '_id tuition_fee payment_schedule currency',
          },
        ],
      })
      .populate({
        path: 'admission',
        select: '_id admission_deadline session_term session_year admission_startdate',
      })
      .select('_id slug admission_fee receiving_applications favouriteBy redirected_students program admission')
      .lean()
      .exec();

    // 3. Map & Score each program
    const config = RECOMMENDATION_SCORING_CONFIG;
    const scoredList: (IRecommendedProgramResponse & { rawScore: number })[] = [];

    // Calculate dynamic weights
    let alpha = config.INITIAL_ONBOARDING_WEIGHT_ALPHA;
    let beta = config.INITIAL_BEHAVIORAL_WEIGHT_BETA;
    let scoringMode: 'onboarding' | 'behavioral' | 'hybrid' | 'trending' = 'trending';

    const hasOnboarding = pref &&
      (pref.degree_goal ||
        (pref.preferred_cities && pref.preferred_cities.length > 0) ||
        (pref.preferred_fields_of_study && pref.preferred_fields_of_study.length > 0));

    if (user && events.length >= config.BEHAVIORAL_EVENT_THRESHOLD) {
      alpha = config.POST_THRESHOLD_ONBOARDING_WEIGHT_ALPHA;
      beta = config.POST_THRESHOLD_BEHAVIORAL_WEIGHT_BETA;
      scoringMode = hasOnboarding ? 'hybrid' : 'behavioral';
    } else if (user && hasOnboarding) {
      // Even before the threshold, use hybrid so that even a single click has visible effect.
      // Alpha stays high (0.7) so onboarding preferences still dominate, but beta (0.3)
      // ensures clicks are not completely invisible.
      scoringMode = 'hybrid';
    } else if (user) {
      // Logged-in user with no onboarding preferences — pure behavioral
      scoringMode = 'behavioral';
    }

    // Build user behavior profile indices for faster matching with 30-day half-life decay
    const clickCountMap = new Map<string, number>();
    const favoriteWeightMap = new Map<string, number>();
    const appliedSet = new Set<string>();

    const nowTime = now.getTime();
    const halfLifeMs = config.HALF_LIFE_DAYS * 24 * 60 * 60 * 1000;

    for (const event of events) {
      const resourceIdStr = event.resource_id.toString();
      const eventTime = new Date(event.created_at || now).getTime();
      const ageMs = Math.max(0, nowTime - eventTime);

      const decayFactor = Math.pow(2, -ageMs / halfLifeMs);

      if (event.event_type === UserRecommendationEventType.CLICK) {
        clickCountMap.set(resourceIdStr, (clickCountMap.get(resourceIdStr) || 0) + decayFactor);
      } else if (event.event_type === UserRecommendationEventType.FAVORITE) {
        favoriteWeightMap.set(resourceIdStr, Math.max(favoriteWeightMap.get(resourceIdStr) || 0, decayFactor));
      } else if (event.event_type === UserRecommendationEventType.APPLY) {
        appliedSet.add(resourceIdStr);
      }
    }

    // Add favorites from user's actual database bookmarks if available
    if (user) {
      for (const app of applications) {
        if (app.departments) {
          for (const dept of app.departments) {
            if (dept.preferences) {
              for (const prefObj of dept.preferences) {
                if (prefObj.program) {
                  appliedSet.add(prefObj.program.toString());
                }
              }
            }
          }
        }
      }
    }

    let maxClicks = 1;
    for (const clicks of clickCountMap.values()) {
      if (clicks > maxClicks) maxClicks = clicks;
    }

    // Load student's Bayesian weights once (falling back to DEFAULT_PRIORS if not present)
    const studentWeights = this.bayesianWeightService.getWeights(user?.bayesian_weights);
    const wDegree = studentWeights.degree_match * 0.85;
    const wField = studentWeights.field_match * 0.85;
    const wCity = studentWeights.city_match * 0.85;
    const wFee = studentWeights.fee_match * 0.85;

    // Score loop
    for (const ap of admissionPrograms) {
      const programObj: any = ap.program;
      if (!programObj || !programObj.template || !programObj.campus_id) {
        continue; // Skip malformed documents
      }

      const template = programObj.template;
      const campus = programObj.campus_id;
      const university = campus.university_id;
      const address = campus.address_id;
      const feeStructure = programObj.fee_structure;

      const apIdStr = ap._id.toString();
      const programIdStr = programObj._id.toString();

      const matchReasons: string[] = [];

      // A. Calculate Onboarding Score
      let onboardingScore = 0;
      
      // Feature variables
      let f_degree_match = 0;
      let f_field_similarity = 0;
      let f_city_match = 0;
      let f_fee_match = 1.0;
      let maxSimilarity = 0;

      if (hasOnboarding && user) {
        const w = config.ONBOARDING_DIMENSION_WEIGHTS;

        // 1. Degree Level Match
        if (pref.degree_goal && template.degree_level === pref.degree_goal) {
          onboardingScore += wDegree * 1.0;
          f_degree_match = 1;
          matchReasons.push('Matches your degree goal');
        }

        // 2. Field of Study Match
        if (pref.preferred_fields_of_study && pref.preferred_fields_of_study.length > 0 && template.field_of_study) {
          for (const preferredField of pref.preferred_fields_of_study) {
            const similarity = this.knowledgeGraphService.getFieldSimilarity(preferredField, template.field_of_study);
            if (similarity > maxSimilarity) {
              maxSimilarity = similarity;
            }
          }

          if (maxSimilarity > 0) {
            onboardingScore += wField * maxSimilarity;
            if (maxSimilarity >= 0.95) {
              matchReasons.push('In your preferred field of study');
            } else if (maxSimilarity >= 0.5) {
              matchReasons.push('Related to your preferred field');
            } else {
              matchReasons.push('Slightly matches your academic interest');
            }
          }
        }

        // 3. City Match
        if (pref.preferred_cities && pref.preferred_cities.length > 0 && address?.city) {
          const cityMatch = pref.preferred_cities.some(
            (c) => c.toLowerCase() === address.city.toLowerCase()
          );
          if (cityMatch) {
            onboardingScore += wCity * 1.0;
            f_city_match = 1;
            matchReasons.push(`Located in ${address.city}`);
          }
        }

        // 4. Fee Range Match
        const fee = feeStructure?.tuition_fee || parseFloat(ap.admission_fee) || 0;
        if (pref.semester_fee_range && fee > 0) {
          const { min, max } = pref.semester_fee_range;
          const minVal = min || 0;
          const maxVal = max || Infinity;

          if (fee >= minVal && fee <= maxVal) {
            onboardingScore += wFee * 1.0;
            f_fee_match = 1.0;
            matchReasons.push('Fits your budget');
          } else if (fee > maxVal && fee <= maxVal * 1.2) {
            onboardingScore += wFee * 0.5;
            f_fee_match = 0.5;
            matchReasons.push('Slightly above preferred budget');
          } else {
            f_fee_match = 0.0;
          }
        } else {
          onboardingScore += wFee * 1.0;
        }

        // 5. Marks Eligibility Match (0.10)
        onboardingScore += w.MARKS_ELIGIBILITY * 1.0;

        // 6. Start Timeline Match (0.05)
        onboardingScore += w.START_TIMELINE * 1.0;
      }

      // B. Calculate Behavioral Score
      let behavioralScore = 0;
      let favorited = false;
      if (user) {
        const w = config.BEHAVIORAL_SIGNAL_WEIGHTS;

        // 1. Clicks (0.20)
        const clicks = clickCountMap.get(apIdStr) || 0;
        const normalizedClicks = clicks / maxClicks;
        behavioralScore += w.CLICKS * normalizedClicks;
        if (clicks > 2) {
          matchReasons.push('Based on your views');
        }

        // 2. Search Query Alignment (0.15)
        // NOTE: Search query tracking is not yet implemented.
        // Scoring 1.0 for all programs creates a noise floor that drowns out click signals.
        // Score 0 until real search-query matching is available.
        behavioralScore += 0;

        // 3. Applications (0.30)
        const applied = appliedSet.has(apIdStr) || appliedSet.has(programIdStr);
        if (applied) {
          behavioralScore += w.APPLICATIONS * 1.0;
          matchReasons.push('Similar to programs you applied to');
        }

        // 4. Favorites (0.20)
        const favoriteWeight = favoriteWeightMap.get(apIdStr) || (ap.favouriteBy?.some((uid) => uid.toString() === user._id.toString()) ? 1.0 : 0.0);
        favorited = favoriteWeight > 0;
        if (favorited) {
          behavioralScore += w.FAVORITES * favoriteWeight;
          matchReasons.push('Favourited program');
        }

        // 5. Dwell Time (0.15)
        // NOTE: Dwell-time tracking is not yet implemented.
        // Scoring 1.0 for all programs creates a noise floor that drowns out click signals.
        // Score 0 until real dwell-time data is available.
        behavioralScore += 0;
      }

      // C. MOU Boost
      // MOU Boost promotes verified partner campuses. Lowered to 1.03 (3%) to act as a
      // tiebreaker only, ensuring preference signals are not overridden by partner status.
      const isVerified = !!(campus.scholarbee_verified || (ap as any).scholarbee_verified);
      const mouBoost = isVerified ? config.MOU_BOOST : 1.0;
      if (isVerified) {
        matchReasons.push('ScholarBee Verified Campus');
      }

      // D. Freshness Boost
      // Freshness boost promotes programs with active deadlines. Lowered to 1.02 (2%)
      // to act as a tiebreaker and not override strong onboarding preferences.
      const deadline = (ap.admission as any)?.admission_deadline || null;
      const hasActiveDeadline = deadline ? new Date(deadline) > new Date() : true;
      const freshnessBoost = hasActiveDeadline ? config.FRESHNESS_BOOST : 1.0;

      // Extract remaining features
      f_field_similarity = maxSimilarity;
      const popularity = (ap.favouriteBy?.length || 0) + (ap.redirected_students?.length || 0);
      const f_program_popularity = Math.min(popularity / 10.0, 1.0);
      const clicks = clickCountMap.get(apIdStr) || 0;

      // Combine
      let finalScore = 0;
      if (scoringMode === 'onboarding') {
        finalScore = onboardingScore * mouBoost * freshnessBoost;
      } else if (scoringMode === 'behavioral') {
        finalScore = behavioralScore * mouBoost * freshnessBoost;
      } else if (scoringMode === 'hybrid') {
        finalScore = (alpha * onboardingScore + beta * behavioralScore) * mouBoost * freshnessBoost;
      } else {
        const popularity = (ap.favouriteBy?.length || 0) + (ap.redirected_students?.length || 0) + clicks;
        // Do not cap popularity, so that a program with 10 clicks beats one with 5 clicks
        finalScore = popularity * mouBoost * freshnessBoost;
        if (popularity > 0) {
          matchReasons.push('Popular program');
        }
      }

      scoredList.push({
        _id: apIdStr,
        slug: ap.slug || programObj.slug || '',
        campus_image: campus.logo_url || university?.logo_url || '',
        location_details: {
          complete_address: address ? `${address.address_line_1}, ${address.city}` : '',
          city: address?.city || '',
          state: address?.state || '',
          country: address?.country || '',
          latitude: address?.latitude || 0,
          longitude: address?.longitude || 0,
        },
        university_logo: university?.logo_url || '',
        program_title: template.name || programObj.name || '',
        study_mode: programObj.mode_of_study || '',
        first_semester_fee: feeStructure?.tuition_fee || parseFloat(ap.admission_fee) || 0,
        payment_schedule: feeStructure?.payment_schedule || 'per semester',
        university_id: university?._id?.toString() || '',
        university_name: university?.name || '',
        university_slug: university?.slug || '',
        campus_id: campus._id.toString(),
        campus_slug: campus.slug || '',
        seo_title_key: template.seo_title_key || '',
        campus_name: campus.name || '',
        program_id: programObj._id.toString(),
        admission_id: (ap.admission as any)?._id?.toString() || '',
        degree_level: template.degree_level || '',
        intake_period: (ap.admission as any)?.session_term || '',
        session_term: (ap.admission as any)?.session_term || '',
        session_year: (ap.admission as any)?.session_year || undefined,
        intake_year: (ap.admission as any)?.session_year || undefined,
        admission_startdate: (ap.admission as any)?.admission_startdate || '',
        admission_enddate: (ap.admission as any)?.admission_deadline || '',
        major: template.field_of_study || '',
        currency: feeStructure?.currency || 'PKR',
        isFavorite: !!favorited,
        receiving_applications: ap.receiving_applications || 'inherit',

        rawScore: finalScore,
        scoring_mode: scoringMode,
        match_reasons: Array.from(new Set(matchReasons)),
        features: {
          degree_match: f_degree_match,
          field_similarity: f_field_similarity,
          city_match: f_city_match,
          fee_match: f_fee_match,
          is_partner: isVerified,
          has_active_deadline: hasActiveDeadline,
          program_popularity: f_program_popularity,
          student_city_weight: studentWeights.city_match,
          student_field_weight: studentWeights.field_match,
          student_degree_weight: studentWeights.degree_match,
          student_fee_weight: studentWeights.fee_match,
          prior_clicks_on_field: clicks, // Proxied from program clicks for now
          prior_clicks_on_city: 0, // Placeholder
          position_in_list: 0, // Assigned later
        }
      });
    }

    scoredList.sort((a, b) => b.rawScore - a.rawScore);

    return scoredList.map((item) => {
      const { rawScore, ...rest } = item;
      return {
        ...rest,
        relevance_score: Math.round(Math.min(rawScore, 1.0) * 100) / 100,
      };
    });
  }

  /**
   * Generates scored university recommendations for a user.
   */
  async scoreUniversities(
    user: any | null,
    events: UserEventDocument[],
    applications: any[],
  ): Promise<IRecommendedUniversityResponse[]> {
    const pref = user?.onboarding_preferences;

    // 1. Fetch matching address IDs for soft city filter
    let addressIds: any[] = [];
    if (pref?.preferred_cities && pref.preferred_cities.length > 0) {
      const matchingAddresses = await this.addressModel
        .find({ city: { $in: pref.preferred_cities } })
        .select('_id')
        .lean()
        .exec();
      addressIds = matchingAddresses.map((a) => a._id);
    }

    // 2. Fetch all universities matching the address filter (if city was set)
    const uniQuery: any = {};
    if (addressIds.length > 0) {
      uniQuery.address_id = { $in: addressIds };
    }

    let universities = await this.universityModel
      .find(uniQuery)
      .select('_id name logo_url slug address_id ranking')
      .populate('address_id', '_id city state country')
      .lean()
      .exec();

    // Soft filter bypass: if city filter yielded 0 universities, fetch all universities
    if (universities.length === 0 && pref?.preferred_cities && pref.preferred_cities.length > 0) {
      universities = await this.universityModel
        .find()
        .select('_id name logo_url slug address_id ranking')
        .populate('address_id', '_id city state country')
        .lean()
        .exec();
    }

    // Fetch active programs needed to calculate verified status, cities, fields, etc.
    const activeAdmissions = await this.admissionModel
      .find({ admission_deadline: { $gte: new Date() } })
      .select('_id')
      .lean()
      .exec();
    const activeAdmissionIds = activeAdmissions.map((a) => a._id);

    const programs = await this.admissionProgramModel
      .find({ status: { $ne: 'draft' }, admission: { $in: activeAdmissionIds } })
      .populate({
        path: 'program',
        select: '_id template campus_id',
        populate: [
          { path: 'template', select: '_id field_of_study' },
          { path: 'campus_id', select: '_id address_id scholarbee_verified established_date campus_area residential_facilities', populate: { path: 'address_id', select: '_id city state country' } },
        ],
      })
      .select('_id program')
      .lean()
      .exec();

    const config = RECOMMENDATION_SCORING_CONFIG;
    const scoredList: (IRecommendedUniversityResponse & { rawScore: number })[] = [];

    const hasOnboarding = pref &&
      (pref.degree_goal ||
        (pref.preferred_cities && pref.preferred_cities.length > 0) ||
        (pref.preferred_fields_of_study && pref.preferred_fields_of_study.length > 0));

    let scoringMode: 'onboarding' | 'behavioral' | 'hybrid' | 'trending' = 'trending';
    if (user && events.length >= config.BEHAVIORAL_EVENT_THRESHOLD) {
      scoringMode = hasOnboarding ? 'hybrid' : 'behavioral';
    } else if (hasOnboarding) {
      scoringMode = 'onboarding';
    }

    const uniClicks = new Map<string, number>();
    const appliedEventPrograms = new Set<string>();
    const now = new Date().getTime();
    const halfLifeMs = config.HALF_LIFE_DAYS * 24 * 60 * 60 * 1000;

    for (const event of events) {
      if (event.resource_type === 'university' && event.event_type === UserRecommendationEventType.CLICK) {
        const key = event.resource_id.toString();
        const eventTime = new Date(event.created_at || now).getTime();
        const ageMs = Math.max(0, now - eventTime);
        const decayFactor = Math.pow(2, -ageMs / halfLifeMs);

        uniClicks.set(key, (uniClicks.get(key) || 0) + decayFactor);
      } else if (event.event_type === UserRecommendationEventType.APPLY) {
        appliedEventPrograms.add(event.resource_id.toString());
      }
    }

    for (const uni of universities) {
      const uniIdStr = uni._id.toString();
      const matchReasons: string[] = [];

      const uniPrograms = programs.filter((p) => {
        const prog: any = p.program;
        return prog?.campus_id?.university_id?.toString() === uniIdStr;
      });

      const campuses = Array.from(new Set(uniPrograms.map((p) => (p.program as any)?.campus_id).filter(Boolean)));
      const cities = Array.from(new Set(campuses.map((c: any) => c.address_id?.city).filter(Boolean)));
      const fields = Array.from(new Set(uniPrograms.map((p) => (p.program as any)?.template?.field_of_study).filter(Boolean)));
      const isVerified = campuses.some((c: any) => c.scholarbee_verified);

      let onboardingScore = 0;
      if (hasOnboarding && user) {
        if (pref.preferred_cities && pref.preferred_cities.length > 0) {
          const hasCityMatch = cities.some((city) =>
            pref.preferred_cities.some((pc) => pc.toLowerCase() === city.toLowerCase())
          );
          if (hasCityMatch) {
            onboardingScore += 0.40;
            matchReasons.push('Located in your preferred city');
          }
        }

        if (pref.preferred_fields_of_study && pref.preferred_fields_of_study.length > 0 && fields.length > 0) {
          let maxUniFieldSimilarity = 0;
          for (const pf of pref.preferred_fields_of_study) {
            for (const f of fields) {
              const similarity = this.knowledgeGraphService.getFieldSimilarity(pf, f);
              if (similarity > maxUniFieldSimilarity) {
                maxUniFieldSimilarity = similarity;
              }
            }
          }
          if (maxUniFieldSimilarity > 0) {
            onboardingScore += 0.30 * maxUniFieldSimilarity;
            if (maxUniFieldSimilarity >= 0.95) {
              matchReasons.push('Offers your preferred fields of study');
            } else {
              matchReasons.push('Offers fields related to your preferences');
            }
          }
        }

        onboardingScore += 0.30;
      }

      let behavioralScore = 0;
      if (user) {
        const clickWeight = uniClicks.get(uniIdStr) || 0;
        if (clickWeight > 0) {
          behavioralScore += 0.50 * clickWeight;
          matchReasons.push('Based on your past visits');
        }

        let appliedToUni = applications.some((app: any) => {
          return app.departments?.some((dept: any) => {
            return dept.preferences?.some((prefObj: any) => {
              const progId = prefObj.program?.toString();
              return uniPrograms.some((up) => up._id.toString() === progId || (up.program as any)?._id.toString() === progId);
            });
          });
        });
        
        if (!appliedToUni) {
          appliedToUni = uniPrograms.some((up) => appliedEventPrograms.has(up._id.toString()) || appliedEventPrograms.has((up.program as any)?._id?.toString()));
        }

        if (appliedToUni) {
          behavioralScore += 0.50;
          matchReasons.push('You applied to this university');
        }
      }

      const mouBoost = isVerified ? config.MOU_BOOST : 1.0;
      if (isVerified) {
        matchReasons.push('ScholarBee Verified Partner');
      }

      let finalScore = 0;
      if (scoringMode === 'onboarding') {
        finalScore = onboardingScore * mouBoost;
      } else if (scoringMode === 'behavioral') {
        finalScore = behavioralScore * mouBoost;
      } else if (scoringMode === 'hybrid') {
        finalScore = (0.5 * onboardingScore + 0.5 * behavioralScore) * mouBoost;
      } else {
        const clickWeight = uniClicks.get(uniIdStr) || 0;
        finalScore = (0.5 + clickWeight) * mouBoost;
        if (clickWeight > 0) {
          matchReasons.push('Trending University');
        }
      }

      const firstCampus: any = campuses[0] || {};
      const uniAddress: any = uni.address_id || {};

      scoredList.push({
        university_id: uniIdStr,
        university_name: uni.name,
        scholarbee_verified: !!isVerified,
        rawScore: finalScore,
        scoring_mode: scoringMode,
        match_reasons: Array.from(new Set(matchReasons)),
        slug: uni.slug || '',
        logo_url: uni.logo_url,
        city: uniAddress.city || cities[0] || undefined,
        state: uniAddress.state || firstCampus.address_id?.state,
        country: uniAddress.country || firstCampus.address_id?.country,
        ranking: uni.ranking,
        established_date: firstCampus.established_date,
        campus_area: firstCampus.campus_area,
        residential_facilities: firstCampus.residential_facilities,
      });
    }

    scoredList.sort((a, b) => b.rawScore - a.rawScore);

    return scoredList.map((item) => {
      const { rawScore, ...rest } = item;
      return {
        ...rest,
        relevance_score: Math.round(Math.min(rawScore, 1.0) * 100) / 100,
      };
    });
  }
}
