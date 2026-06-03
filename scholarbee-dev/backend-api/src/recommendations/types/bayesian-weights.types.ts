export interface BayesianWeightDimension {
  alpha: number;
  beta: number;
}

export interface WeightPriors {
  degree_match: BayesianWeightDimension;
  field_match: BayesianWeightDimension;
  city_match: BayesianWeightDimension;
  fee_match: BayesianWeightDimension;
}

export interface StudentWeights {
  degree_match: number;
  field_match: number;
  city_match: number;
  fee_match: number;
}

export const DEFAULT_PRIORS: WeightPriors = {
  degree_match: { alpha: 2.5, beta: 7.5 }, // mean = 0.25
  field_match: { alpha: 2.5, beta: 7.5 },  // mean = 0.25
  city_match: { alpha: 2.0, beta: 8.0 },   // mean = 0.20
  fee_match: { alpha: 1.5, beta: 8.5 },    // mean = 0.15
};
