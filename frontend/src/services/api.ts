import { KitProfile, TestAnalysisResponse, VerificationResponse, KnowledgeQueryResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';


export async function fetchKitProfiles(): Promise<KitProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/kits`);
    if (!res.ok) throw new Error('Failed to fetch kit profiles');
    return await res.json();
  } catch (err) {
    // Fallback static profiles
    return [
      {
        id: 'kit-marquis-default',
        kit_code: 'KIT-MARQUIS-V1',
        name: 'NCB Marquis Reagent Field Test Kit v1.2',
        manufacturer: 'Central Revenue Control Laboratory / NCB Approved',
        test_type: 'Marquis Colorimetric Reagent',
        version: '1.2',
        is_active: true,
        target_substances: ['Morphine', 'Heroin', 'Codeine', 'Amphetamine'],
        reference_card_profile: {},
        classification_profile: {},
        instructions: 'Add 2 drops of Marquis Reagent to sample spot. Observe color change within 30-60 seconds.',
        source_reference: 'NCB Technical Field Manual Section 4.2'
      },
      {
        id: 'kit-cobalt-default',
        kit_code: 'KIT-COBALT-V2',
        name: 'NCB Cobalt Thiocyanate Reagent Kit v2.0',
        manufacturer: 'NCB Standard Field Equipment Wing',
        test_type: 'Cobalt Thiocyanate Reagent',
        version: '2.0',
        is_active: true,
        target_substances: ['Cocaine Hydrochloride', 'Cocaine Base (Crack)'],
        reference_card_profile: {},
        classification_profile: {},
        instructions: 'Add 5 drops of Cobalt Thiocyanate to sample. Intense turquoise blue precipitate indicates positive.',
        source_reference: 'NCB SOP 2026-04 Section 7.1'
      },
      {
        id: 'kit-duquenois-default',
        kit_code: 'KIT-DUQUENOIS-V1',
        name: 'NCB Duquenois-Levine Cannabis Kit v1.0',
        manufacturer: 'Central Forensic Science Wing',
        test_type: 'Modified Duquenois-Levine Reagent',
        version: '1.0',
        is_active: true,
        target_substances: ['Cannabis Resin (Charas)', 'Cannabis Herb (Ganja)'],
        reference_card_profile: {},
        classification_profile: {},
        instructions: 'Violet color transferring into lower chloroform layer indicates positive reaction.',
        source_reference: 'UNODC Guidelines ST/NAR/40'
      }
    ];
  }
}

export async function analyzeFieldTest(payload: {
  base64_image: string;
  kit_id: string;
  operator_id: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy_m?: number;
}): Promise<TestAnalysisResponse> {
  const res = await fetch(`${API_BASE}/tests/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Analysis failed on server.');
  }
  return await res.json();
}

export async function fetchTestHistory(filters?: { result?: string }): Promise<any[]> {
  let url = `${API_BASE}/tests`;
  if (filters?.result) {
    url += `?result=${filters.result}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch test log');
  return await res.json();
}

export async function fetchTestDetail(test_id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tests/${test_id}`);
  if (!res.ok) throw new Error('Test record not found');
  return await res.json();
}

export async function verifyEvidence(test_id: string): Promise<VerificationResponse> {
  const res = await fetch(`${API_BASE}/evidence/${test_id}/verify`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Verification service error');
  return await res.json();
}

export async function tamperTestRecordDemo(test_id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tests/${test_id}/tamper-demo`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Tamper demo endpoint failed');
  return await res.json();
}

export async function queryKnowledgeAssistant(query: string): Promise<KnowledgeQueryResult> {
  const res = await fetch(`${API_BASE}/knowledge/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Knowledge query failed');
  return await res.json();
}
