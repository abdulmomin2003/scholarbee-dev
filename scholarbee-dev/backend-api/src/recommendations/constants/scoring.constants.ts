/**
 * Configurable scoring weights and constants for the ScholarBee Recommendation System.
 * Developers can edit these values to tune the recommendation engine's behavior.
 */
export const RECOMMENDATION_SCORING_CONFIG = {
  // --- Hybrid Mixing Weights ---
  // Alpha (α) is the weight given to onboarding preferences.
  // It starts high for cold-start and decreases as more behavioral data is collected.
  INITIAL_ONBOARDING_WEIGHT_ALPHA: 0.7,

  // Beta (β) is the weight given to behavioral logs (clicks, applications, favorites, search).
  // It grows as more user interaction data is logged.
  INITIAL_BEHAVIORAL_WEIGHT_BETA: 0.3,

  // Alpha weight to use when user has passed the behavioral interaction threshold.
  POST_THRESHOLD_ONBOARDING_WEIGHT_ALPHA: 0.4,

  // Beta weight to use when user has passed the behavioral interaction threshold.
  POST_THRESHOLD_BEHAVIORAL_WEIGHT_BETA: 0.6,

  // The number of behavioral events (e.g., clicks, favorites, searches) required to shift
  // the weights from initial to post-threshold. Set to 1 so that the very first click
  // immediately enables hybrid scoring and clicks are visible in the ranking.
  BEHAVIORAL_EVENT_THRESHOLD: 1,

  // --- Onboarding Preference Scoring Weights (Sum should ideally be 1.0) ---
  ONBOARDING_DIMENSION_WEIGHTS: {
    DEGREE_LEVEL: 0.25,      // Match between user.degree_goal and program_templates.degree_level
    FIELD_OF_STUDY: 0.25,    // Match between user.preferred_fields_of_study and program_templates.field_of_study
    CITY: 0.20,              // Match between user.preferred_cities and campus.address.city
    FEE_RANGE: 0.15,         // Match between user.semester_fee_range and tuition fee
    MARKS_ELIGIBILITY: 0.10, // Match between user.previous_marks_range and program eligibility
    START_TIMELINE: 0.05,    // Match between user.start_timeline and active admission timeline
  },

  // --- Behavioral Scoring Weights (Sum should ideally be 1.0) ---
  BEHAVIORAL_SIGNAL_WEIGHTS: {
    CLICKS: 0.20,                // Program detail page views or listing clicks
    SEARCH_QUERY_ALIGN: 0.15,    // Match with user's past search queries
    APPLICATIONS: 0.30,          // User has applied to similar programs
    FAVORITES: 0.20,             // User has favorited similar programs/universities
    DWELL_TIME: 0.15,            // Higher time spent on program page
  },

  // --- Multiplicative Boosts ---
  // MOU Boost: Promotes ScholarBee verified partner campuses. Reduced to 1.03 (3%)
  // to act as a tiebreaker and not override strong onboarding/behavioral matches.
  MOU_BOOST: 1.03,

  // Freshness Boost: Slight increase for programs with active deadlines.
  // Reduced to 1.02 (2%) to act as a tiebreaker and prevent overriding preference matches.
  FRESHNESS_BOOST: 1.02,

  // --- Time decay parameters for behavioral events (in days) ---
  // Events older than this will be weighted less (exponential decay)
  HALF_LIFE_DAYS: 30,
};
