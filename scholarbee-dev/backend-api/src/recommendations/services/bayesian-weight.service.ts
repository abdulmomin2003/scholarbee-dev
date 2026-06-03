import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_PRIORS, WeightPriors, StudentWeights } from '../types/bayesian-weights.types';
import { KnowledgeGraphService } from './knowledge-graph.service';

export interface BayesianInteraction {
  program: any;
  student: any;
  action: 'click' | 'favorite' | 'apply' | 'ignore';
}

@Injectable()
export class BayesianWeightService {
  private readonly logger = new Logger(BayesianWeightService.name);

  constructor(private readonly knowledgeGraphService: KnowledgeGraphService) {}

  /**
   * Updates student's prior weights based on behavioral interaction.
   */
  updateWeights(currentPriors: WeightPriors | undefined | null, interaction: BayesianInteraction): WeightPriors {
    const priors = currentPriors ? { ...currentPriors } : { ...DEFAULT_PRIORS };

    // Deep copy prior objects to prevent mutation of static default config
    const updatedPriors: WeightPriors = {
      degree_match: { ...priors.degree_match },
      field_match: { ...priors.field_match },
      city_match: { ...priors.city_match },
      fee_match: { ...priors.fee_match },
    };

    const { program, student, action } = interaction;
    if (!program || !student) {
      return updatedPriors;
    }

    const actionMultipliers = {
      apply: 3,
      favorite: 2,
      click: 1,
      ignore: 0.5,
    };
    const strength = actionMultipliers[action] || 1;

    const pref = student.onboarding_preferences;
    if (!pref) {
      return updatedPriors;
    }

    // Extract program attributes
    const programObj = program.program || program;
    const template = programObj.template || {};
    const campus = programObj.campus_id || {};
    const address = campus.address_id || {};
    const feeStructure = programObj.fee_structure || {};

    const programDegree = template.degree_level || program.degree_level || '';
    const programField = template.field_of_study || program.field || '';
    const programCity = address.city || campus.city || program.city || '';
    const programFee = feeStructure.tuition_fee || parseFloat(program.admission_fee) || program.first_semester_fee || 0;

    // 1. Degree Match
    let degreeMatch = 0.0;
    if (pref.degree_goal && programDegree) {
      degreeMatch = programDegree.toLowerCase() === pref.degree_goal.toLowerCase() ? 1.0 : 0.0;
    }

    // 2. Field Match (continuous similarity)
    let fieldMatch = 0.0;
    if (pref.preferred_fields_of_study && pref.preferred_fields_of_study.length > 0 && programField) {
      let maxSim = 0.0;
      for (const prefField of pref.preferred_fields_of_study) {
        const sim = this.knowledgeGraphService.getFieldSimilarity(prefField, programField);
        if (sim > maxSim) maxSim = sim;
      }
      fieldMatch = maxSim;
    }

    // 3. City Match
    let cityMatch = 0.0;
    if (pref.preferred_cities && pref.preferred_cities.length > 0 && programCity) {
      cityMatch = pref.preferred_cities.some(
        (c) => c.toLowerCase() === programCity.toLowerCase()
      ) ? 1.0 : 0.0;
    }

    // 4. Fee Match
    let feeMatch = 0.0;
    if (pref.semester_fee_range && programFee > 0) {
      const minFee = pref.semester_fee_range.min || 0;
      const maxFee = pref.semester_fee_range.max || Infinity;
      if (programFee >= minFee && programFee <= maxFee) {
        feeMatch = 1.0;
      } else if (programFee > maxFee && programFee <= maxFee * 1.2) {
        feeMatch = 0.5;
      }
    }

    const matches = {
      degree_match: degreeMatch,
      field_match: fieldMatch,
      city_match: cityMatch,
      fee_match: feeMatch,
    };

    // Apply Bayesian update:
    // Positive signal is reinforcement of preference.
    // If the action is positive (click, favorite, apply), a match increases alpha (reinforces importance),
    // and a mismatch increases beta (indicating user does not strictly require this dimension).
    // If the action is ignore (negative signal):
    // A match indicates the user ignored it despite it matching their preference (increases beta),
    // and a mismatch indicates user ignored it as expected (increases alpha).
    const isPositiveAction = action !== 'ignore';

    for (const dim of ['degree_match', 'field_match', 'city_match', 'fee_match'] as const) {
      const matchScore = matches[dim];
      if (isPositiveAction) {
        updatedPriors[dim].alpha += matchScore * strength;
        updatedPriors[dim].beta += (1 - matchScore) * strength;
      } else {
        updatedPriors[dim].beta += matchScore * strength;
        updatedPriors[dim].alpha += (1 - matchScore) * strength;
      }
    }

    return updatedPriors;
  }

  /**
   * Normalizes priors using Beta distribution parameterization (mean = alpha / (alpha + beta))
   * and scales them so that they sum to 1.0.
   */
  getWeights(priors: WeightPriors | undefined | null): StudentWeights {
    const p = priors || DEFAULT_PRIORS;

    const degreeMean = p.degree_match.alpha / (p.degree_match.alpha + p.degree_match.beta);
    const fieldMean = p.field_match.alpha / (p.field_match.alpha + p.field_match.beta);
    const cityMean = p.city_match.alpha / (p.city_match.alpha + p.city_match.beta);
    const feeMean = p.fee_match.alpha / (p.fee_match.alpha + p.fee_match.beta);

    const sum = degreeMean + fieldMean + cityMean + feeMean;

    if (sum === 0) {
      return this.getDefaultWeights();
    }

    return {
      degree_match: degreeMean / sum,
      field_match: fieldMean / sum,
      city_match: cityMean / sum,
      fee_match: feeMean / sum,
    };
  }

  /**
   * Returns default weights corresponding to normalized 25/25/20/15 starting weights.
   */
  getDefaultWeights(): StudentWeights {
    return this.getWeights(DEFAULT_PRIORS);
  }
}
