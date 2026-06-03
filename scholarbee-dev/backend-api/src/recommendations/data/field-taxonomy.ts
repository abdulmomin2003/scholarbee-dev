export interface TaxonomyNode {
  id: string;
  name: string;
  cluster: 'Technology' | 'Business' | 'Health' | 'Engineering' | 'Social Sciences';
}

export interface TaxonomyEdge {
  source: string;
  target: string;
  weight: number; // 0.0 to 1.0
}

export const TAXONOMY_NODES: TaxonomyNode[] = [
  // Technology
  { id: 'computer_science', name: 'Computer Science', cluster: 'Technology' },
  { id: 'software_engineering', name: 'Software Engineering', cluster: 'Technology' },
  { id: 'information_technology', name: 'Information Technology', cluster: 'Technology' },
  { id: 'artificial_intelligence', name: 'Artificial Intelligence', cluster: 'Technology' },
  { id: 'data_science', name: 'Data Science', cluster: 'Technology' },
  { id: 'cybersecurity', name: 'Cybersecurity', cluster: 'Technology' },
  { id: 'electrical_engineering', name: 'Electrical Engineering', cluster: 'Technology' },

  // Business
  { id: 'business_administration', name: 'Business Administration', cluster: 'Business' },
  { id: 'accounting', name: 'Accounting', cluster: 'Business' },
  { id: 'marketing', name: 'Marketing', cluster: 'Business' },
  { id: 'economics', name: 'Economics', cluster: 'Business' },
  { id: 'finance', name: 'Finance', cluster: 'Business' },

  // Health
  { id: 'medicine_surgery', name: 'Medicine & Surgery (MBBS)', cluster: 'Health' },
  { id: 'pharmacy', name: 'Pharmacy', cluster: 'Health' },
  { id: 'dentistry', name: 'Dentistry', cluster: 'Health' },
  { id: 'public_health', name: 'Public Health', cluster: 'Health' },
  { id: 'nursing', name: 'Nursing', cluster: 'Health' },

  // Engineering
  { id: 'civil_engineering', name: 'Civil Engineering', cluster: 'Engineering' },
  { id: 'mechanical_engineering', name: 'Mechanical Engineering', cluster: 'Engineering' },
  { id: 'chemical_engineering', name: 'Chemical Engineering', cluster: 'Engineering' },
  { id: 'industrial_engineering', name: 'Industrial Engineering', cluster: 'Engineering' },

  // Social Sciences
  { id: 'psychology', name: 'Psychology', cluster: 'Social Sciences' },
  { id: 'sociology', name: 'Sociology', cluster: 'Social Sciences' },
  { id: 'education', name: 'Education', cluster: 'Social Sciences' },
  { id: 'law', name: 'Law', cluster: 'Social Sciences' },
  { id: 'media_studies', name: 'Media Studies', cluster: 'Social Sciences' },
];

export const TAXONOMY_EDGES: TaxonomyEdge[] = [
  // Technology
  { source: 'computer_science', target: 'software_engineering', weight: 0.9 },
  { source: 'computer_science', target: 'information_technology', weight: 0.8 },
  { source: 'computer_science', target: 'artificial_intelligence', weight: 0.85 },
  { source: 'computer_science', target: 'data_science', weight: 0.8 },
  { source: 'computer_science', target: 'cybersecurity', weight: 0.8 },
  { source: 'computer_science', target: 'electrical_engineering', weight: 0.6 },
  { source: 'software_engineering', target: 'information_technology', weight: 0.8 },
  { source: 'software_engineering', target: 'artificial_intelligence', weight: 0.75 },
  { source: 'software_engineering', target: 'electrical_engineering', weight: 0.5 },
  { source: 'information_technology', target: 'cybersecurity', weight: 0.85 },
  { source: 'artificial_intelligence', target: 'data_science', weight: 0.9 },

  // Business
  { source: 'business_administration', target: 'accounting', weight: 0.8 },
  { source: 'business_administration', target: 'marketing', weight: 0.8 },
  { source: 'business_administration', target: 'finance', weight: 0.85 },
  { source: 'business_administration', target: 'economics', weight: 0.7 },
  { source: 'accounting', target: 'finance', weight: 0.85 },
  { source: 'accounting', target: 'marketing', weight: 0.5 },
  { source: 'finance', target: 'economics', weight: 0.75 },

  // Cross-cluster bridge: Business to Social Sciences (Marketing & Media Studies)
  { source: 'marketing', target: 'media_studies', weight: 0.6 },

  // Health
  { source: 'medicine_surgery', target: 'dentistry', weight: 0.85 },
  { source: 'medicine_surgery', target: 'pharmacy', weight: 0.75 },
  { source: 'medicine_surgery', target: 'public_health', weight: 0.7 },
  { source: 'medicine_surgery', target: 'nursing', weight: 0.8 },
  { source: 'pharmacy', target: 'public_health', weight: 0.6 },
  { source: 'dentistry', target: 'nursing', weight: 0.7 },
  { source: 'public_health', target: 'nursing', weight: 0.75 },

  // Engineering
  { source: 'civil_engineering', target: 'mechanical_engineering', weight: 0.7 },
  { source: 'civil_engineering', target: 'electrical_engineering', weight: 0.6 },
  { source: 'mechanical_engineering', target: 'electrical_engineering', weight: 0.75 },
  { source: 'mechanical_engineering', target: 'chemical_engineering', weight: 0.65 },
  { source: 'mechanical_engineering', target: 'industrial_engineering', weight: 0.8 },
  { source: 'electrical_engineering', target: 'industrial_engineering', weight: 0.7 },
  { source: 'chemical_engineering', target: 'industrial_engineering', weight: 0.6 },

  // Social Sciences
  { source: 'psychology', target: 'sociology', weight: 0.8 },
  { source: 'psychology', target: 'education', weight: 0.7 },
  { source: 'sociology', target: 'education', weight: 0.75 },
  { source: 'sociology', target: 'law', weight: 0.6 },
  { source: 'sociology', target: 'media_studies', weight: 0.7 },
  { source: 'education', target: 'media_studies', weight: 0.6 },
  { source: 'law', target: 'media_studies', weight: 0.5 },
];

export const FIELD_TAXONOMY = {
  nodes: TAXONOMY_NODES,
  edges: TAXONOMY_EDGES,
};

// Build pairwise similarity map
export type SimilarityMap = Record<string, Record<string, number>>;

export function computeSimilarityMap(): SimilarityMap {
  const map: SimilarityMap = {};

  // Initialize with 1.0 for self
  for (const node of TAXONOMY_NODES) {
    map[node.id] = { [node.id]: 1.0 };
  }

  // Populate direct edges (1-hop)
  for (const edge of TAXONOMY_EDGES) {
    const s = edge.source;
    const t = edge.target;
    const w = edge.weight;
    
    map[s][t] = Math.max(map[s][t] || 0, w);
    map[t][s] = Math.max(map[t][s] || 0, w);
  }

  // Compute two-hop relationships (friend-of-friend) with 0.7 penalty
  const penalty = 0.7;
  for (const u of TAXONOMY_NODES) {
    for (const v of TAXONOMY_NODES) {
      if (u.id === v.id) continue;
      
      // Look for a middle node w
      for (const wNode of TAXONOMY_NODES) {
        const w = wNode.id;
        if (u.id === w || v.id === w) continue;

        const w1 = map[u.id][w];
        const w2 = map[w][v.id];

        if (w1 !== undefined && w2 !== undefined) {
          const twoHopWeight = w1 * w2 * penalty;
          map[u.id][v.id] = Math.max(map[u.id][v.id] || 0, twoHopWeight);
          map[v.id][u.id] = Math.max(map[v.id][u.id] || 0, twoHopWeight);
        }
      }
    }
  }

  // Round values to 4 decimal places for clean representation
  for (const u of Object.keys(map)) {
    for (const v of Object.keys(map[u])) {
      map[u][v] = Math.round(map[u][v] * 10000) / 10000;
    }
  }

  return map;
}

export const PRECOMPUTED_SIMILARITY_MAP = computeSimilarityMap();
