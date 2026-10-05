import { ppmoOpsPart1, PpmoOpinionRaw } from './ppmoOpsPart1';
import { ppmoOpsPart2 } from './ppmoOpsPart2';
import { ppmoOpsPart3 } from './ppmoOpsPart3';
import { ppmoOpsPart4 } from './ppmoOpsPart4';
import { ppmoOpsPart5 } from './ppmoOpsPart5';
import { ppmoOpsPart6 } from './ppmoOpsPart6';
import { ppmoOpsPart7 } from './ppmoOpsPart7';
import { raya2080Opinions } from './raya2080Opinions';

import { pprcDecisionsPart1, PprcDecisionRaw } from './pprcDecisionsPart1';
import { pprcDecisionsPart2 } from './pprcDecisionsPart2';
import { pprcDecisionsPart3 } from './pprcDecisionsPart3';
import { pprcDecisionsPart4 } from './pprcDecisionsPart4';
import { pprcDecisionsPart5 } from './pprcDecisionsPart5';

export type { PpmoOpinionRaw, PprcDecisionRaw };

const existingPpmoOpinions: PpmoOpinionRaw[] = [
  ...ppmoOpsPart1,
  ...ppmoOpsPart2,
  ...ppmoOpsPart3,
  ...ppmoOpsPart4,
  ...ppmoOpsPart5,
  ...ppmoOpsPart6,
  ...ppmoOpsPart7,
];

type Raya2080Opinion = (typeof raya2080Opinions)[number];

const normalizeOpinionDate = (date: string) =>
  date.replace(/[^\p{L}\p{N}]/gu, '');
const normalizeOpinionText = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const getRayaOpinionKey = (no: number, date: string) =>
  `${no}:${normalizeOpinionDate(date)}`;
const getRayaOpinionDate = (opinion: Raya2080Opinion) => {
  if (normalizeOpinionDate(opinion.date)) return opinion.date;
  return opinion.opinion.match(
    /(?:निर्णय\s*)?मिति\s*[:ः]?\s*(२०[०-९]{2}[./÷।][०-९./÷।]+)/
  )?.[1] ?? '';
};

const rayaOpinionsByNumberAndDate = new Map<string, Raya2080Opinion>();
const rayaOpinionsByDateAndContent = new Map<string, Raya2080Opinion>();
raya2080Opinions.forEach((opinion) => {
  const date = getRayaOpinionDate(opinion);
  if (normalizeOpinionDate(date)) {
    rayaOpinionsByNumberAndDate.set(
      getRayaOpinionKey(opinion.no, date),
      opinion
    );
    rayaOpinionsByDateAndContent.set(
      `${normalizeOpinionDate(date)}:${normalizeOpinionText(opinion.subject)}`,
      opinion
    );
    rayaOpinionsByDateAndContent.set(
      `${normalizeOpinionDate(date)}:${normalizeOpinionText(opinion.opinion)}`,
      opinion
    );
  }
});

const matchedRayaOpinions = new Set<Raya2080Opinion>();
const mergedPpmoOpinions = existingPpmoOpinions.map((opinion) => {
  const dateKey = normalizeOpinionDate(opinion.date);
  const rayaOpinion =
    rayaOpinionsByNumberAndDate.get(
      getRayaOpinionKey(opinion.no, opinion.date)
    ) ??
    rayaOpinionsByDateAndContent.get(
      `${dateKey}:${normalizeOpinionText(opinion.subject)}`
    ) ??
    rayaOpinionsByDateAndContent.get(
      `${dateKey}:${normalizeOpinionText(opinion.opinion)}`
    );
  if (!rayaOpinion) return opinion;

  matchedRayaOpinions.add(rayaOpinion);
  return {
    ...opinion,
    opinion: rayaOpinion.opinion,
    act: rayaOpinion.act,
    rule: rayaOpinion.rule,
    src: rayaOpinion.src,
  };
});

export const rawPpmoOpinions: PpmoOpinionRaw[] = [
  ...mergedPpmoOpinions,
  ...raya2080Opinions.filter((opinion) => {
    if (matchedRayaOpinions.has(opinion)) return false;

    const dateKey = normalizeOpinionDate(getRayaOpinionDate(opinion));
    return !mergedPpmoOpinions.some(
      (existing) =>
        normalizeOpinionDate(existing.date) === dateKey &&
        (normalizeOpinionText(existing.subject) ===
          normalizeOpinionText(opinion.subject) ||
          normalizeOpinionText(existing.opinion) ===
            normalizeOpinionText(opinion.opinion))
    );
  }),
];

export const rawPprcDecisions: PprcDecisionRaw[] = [
  ...pprcDecisionsPart1,
  ...pprcDecisionsPart2,
  ...pprcDecisionsPart3,
  ...pprcDecisionsPart4,
  ...pprcDecisionsPart5,
];

export type TopicCategory =
  | 'बोलपत्र परीक्षण र मूल्याङ्कन'
  | 'जमानत (Bid / Performance Bond)'
  | 'योग्यता, अनुभव र टर्नओभर'
  | 'भेरिएसन र मूल्य समायोजन'
  | 'म्याद थप, ठेक्का अन्त्य र कालोसूची'
  | 'परामर्श सेवा (EOI / RFP)'
  | 'सोझै खरिद, दरभाउपत्र र उपभोक्ता समिति'
  | 'राशन तथा औषधि/उपकरण खरिद'
  | 'संयुक्त उपक्रम (JV) र अख्तियारनामा'
  | 'विद्युतीय खरिद (e-GP) र प्रक्रियागत विवाद';

export const TOPIC_CATEGORIES: TopicCategory[] = [
  'बोलपत्र परीक्षण र मूल्याङ्कन',
  'योग्यता, अनुभव र टर्नओभर',
  'जमानत (Bid / Performance Bond)',
  'भेरिएसन र मूल्य समायोजन',
  'म्याद थप, ठेक्का अन्त्य र कालोसूची',
  'परामर्श सेवा (EOI / RFP)',
  'सोझै खरिद, दरभाउपत्र र उपभोक्ता समिति',
  'राशन तथा औषधि/उपकरण खरिद',
  'संयुक्त उपक्रम (JV) र अख्तियारनामा',
  'विद्युतीय खरिद (e-GP) र प्रक्रियागत विवाद',
];

export interface EnrichedPpmoOpinion extends PpmoOpinionRaw {
  id: string;
  requestingEntity: string;
  cleanSubject: string;
  year: string;
  topics: TopicCategory[];
  actRefs: string[];
  ruleRefs: string[];
  keyTakeaway: string;
}

export interface EnrichedPprcDecision extends PprcDecisionRaw {
  id: string;
  topics: TopicCategory[];
  actRefs: string[];
  ruleRefs: string[];
  decisionDate: string;
  outcomeCategory: 'बदर / पुनर्मूल्याङ्कन' | 'निवेदन खारेज' | 'अन्य आदेश / फिर्ता' | 'दरपीठ';
}

function classifyTopics(text: string): TopicCategory[] {
  const topics: TopicCategory[] = [];
  const lower = text.toLowerCase();

  if (
    text.includes('भेरिएसन') ||
    text.includes('भेरिएशन') ||
    text.includes('भेरियसन') ||
    text.includes('मूल्य समायोजन') ||
    text.includes('मुल्य समायोजन') ||
    text.includes('मूल्यवृद्धि') ||
    text.includes('मुल्यबृद्धि') ||
    lower.includes('variation') ||
    lower.includes('price adjustment') ||
    lower.includes('price escalation')
  ) {
    topics.push('भेरिएसन र मूल्य समायोजन');
  }

  if (
    text.includes('जमानत') ||
    text.includes('ग्यारेन्टी') ||
    text.includes('ग्यारेण्टी') ||
    text.includes('बिडबण्ड') ||
    text.includes('विड वण्ड') ||
    text.includes('धरौटी') ||
    text.includes('काउन्टर') ||
    lower.includes('bid bond') ||
    lower.includes('bid security') ||
    lower.includes('performance bond') ||
    lower.includes('counter guarantee')
  ) {
    topics.push('जमानत (Bid / Performance Bond)');
  }

  if (
    text.includes('अनुभव') ||
    text.includes('टर्न ओभर') ||
    text.includes('कारोबार') ||
    text.includes('कर चुक्ता') ||
    text.includes('करचुक्ता') ||
    text.includes('इजाजतपत्र') ||
    text.includes('ग्राह्यता') ||
    lower.includes('turnover') ||
    lower.includes('turn over') ||
    lower.includes('experience') ||
    lower.includes('qualification') ||
    lower.includes('line of credit') ||
    lower.includes('liquid asset')
  ) {
    topics.push('योग्यता, अनुभव र टर्नओभर');
  }

  if (
    text.includes('परामर्श') ||
    text.includes('आशयपत्र') ||
    text.includes('संक्षिप्त सूची') ||
    text.includes('संक्षिप्त सूचि') ||
    lower.includes('rfp') ||
    lower.includes('eoi') ||
    lower.includes('consultant') ||
    lower.includes('qcbs') ||
    lower.includes('tor')
  ) {
    topics.push('परामर्श सेवा (EOI / RFP)');
  }

  if (
    text.includes('सोझै खरिद') ||
    text.includes('दरभाउपत्र') ||
    text.includes('उपभोक्ता समिति') ||
    text.includes('मौजुदा सूची') ||
    text.includes('प्रोप्राइटरी') ||
    lower.includes('quotation')
  ) {
    topics.push('सोझै खरिद, दरभाउपत्र र उपभोक्ता समिति');
  }

  if (
    text.includes('म्याद थप') ||
    text.includes('हर्जाना') ||
    text.includes('हर्जना') ||
    text.includes('क्षतिपूर्ति') ||
    text.includes('क्षतिपूर्ती') ||
    text.includes('कालोसूची') ||
    text.includes('कालोसूचि') ||
    text.includes('कालो सूचि') ||
    text.includes('सम्झौता अन्त्य') ||
    text.includes('ठेक्का तोड') ||
    lower.includes('liquidated') ||
    lower.includes('ld ')
  ) {
    topics.push('म्याद थप, ठेक्का अन्त्य र कालोसूची');
  }

  if (
    text.includes('राशन') ||
    text.includes('रासन') ||
    text.includes('औषधी') ||
    text.includes('औषधि') ||
    text.includes('अस्पताल') ||
    text.includes('बिस्कुट') ||
    lower.includes('mri') ||
    lower.includes('ct scan') ||
    lower.includes('ventilator') ||
    lower.includes('medical') ||
    lower.includes('gmp')
  ) {
    topics.push('राशन तथा औषधि/उपकरण खरिद');
  }

  if (
    text.includes('संयुक्त उपक्रम') ||
    text.includes('जे.भी') ||
    text.includes('जे.भि') ||
    text.includes('अख्तियारनामा') ||
    text.includes('एजेन्ट') ||
    lower.includes('joint venture') ||
    lower.includes(' jv') ||
    lower.includes('j/v') ||
    lower.includes('power of attorney') ||
    lower.includes('manufacturer authorization')
  ) {
    topics.push('संयुक्त उपक्रम (JV) र अख्तियारनामा');
  }

  if (
    text.includes('विद्युतीय') ||
    text.includes('अनलाइन') ||
    text.includes('फिर्ता') ||
    text.includes('संशोधन') ||
    text.includes('हदम्याद') ||
    lower.includes('e-gp') ||
    lower.includes('e-bid') ||
    lower.includes('ebid') ||
    lower.includes('e-submission') ||
    lower.includes('upload') ||
    lower.includes('portal')
  ) {
    topics.push('विद्युतीय खरिद (e-GP) र प्रक्रियागत विवाद');
  }

  if (
    topics.length === 0 ||
    text.includes('मूल्यांकन') ||
    text.includes('मुल्यांकन') ||
    text.includes('मूल्याङ्कन') ||
    text.includes('प्रभावग्राही') ||
    text.includes('स्पेसिफिकेशन') ||
    text.includes('छुट') ||
    lower.includes('boq') ||
    lower.includes('responsive') ||
    lower.includes('discount')
  ) {
    if (!topics.includes('बोलपत्र परीक्षण र मूल्याङ्कन')) {
      topics.push('बोलपत्र परीक्षण र मूल्याङ्कन');
    }
  }

  return topics;
}

function extractLegalRefs(text: string): { actRefs: string[]; ruleRefs: string[] } {
  const actSet = new Set<string>();
  const ruleSet = new Set<string>();

  const actMatches = text.match(/दफा\s*[०-९0-9]+(?:\s*\([०-९0-9क-ज्ञ]+\))*/g);
  if (actMatches) {
    actMatches.forEach((m) => actSet.add(m.replace(/\s+/g, ' ').trim()));
  }

  const ruleMatches = text.match(/नियम\s*[०-९0-9]+(?:\s*[क-ज्ञ])?(?:\s*\([०-९0-9क-ज्ञ]+\))*/g);
  if (ruleMatches) {
    ruleMatches.forEach((m) => ruleSet.add(m.replace(/\s+/g, ' ').trim()));
  }

  return {
    actRefs: Array.from(actSet).slice(0, 5),
    ruleRefs: Array.from(ruleSet).slice(0, 5),
  };
}

function extractYear(dateStr: string): string {
  const match = dateStr.match(/(२०[६७८][०-९])/);
  return match ? `${match[1]}` : 'अन्य';
}

export const enrichedPpmoOpinions: EnrichedPpmoOpinion[] = rawPpmoOpinions.map((item, idx) => {
  let requestingEntity = 'विभिन्न सार्वजनिक निकाय';
  let cleanSubject = item.subject.trim();

  if (cleanSubject.startsWith('माग गर्ने निकाय:')) {
    const afterPrefix = cleanSubject.replace(/^माग गर्ने निकाय:\s*/, '');
    const dashSplit = afterPrefix.split(/\s*—\s*|\s*\|\s*/);
    if (dashSplit.length >= 2) {
      requestingEntity = dashSplit[0].trim();
      cleanSubject = dashSplit.slice(1).join(' — ').trim();
    } else {
      const periodIdx = afterPrefix.indexOf('।');
      if (periodIdx > 0 && periodIdx < 80) {
        requestingEntity = afterPrefix.slice(0, periodIdx).trim();
        cleanSubject = afterPrefix.slice(periodIdx + 1).trim();
      }
    }
  }

  const combinedText = `${item.subject} ${item.opinion}`;
  const extractedRefs = extractLegalRefs(combinedText);
  const topics = classifyTopics(combinedText);
  const year = extractYear(item.date);

  // Extract concise key takeaway from opinion
  const sentences = item.opinion
    .replace(/^[“"«'\s]+|[”"»'\s]+$/g, '')
    .split(/।/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
  const keyTakeaway =
    sentences.length > 0
      ? `${sentences[sentences.length - 1]}।`
      : item.opinion.slice(0, 160);

  return {
    ...item,
    id: `ppmo-${idx + 1}`,
    requestingEntity,
    cleanSubject,
    year,
    topics,
    actRefs: item.act && item.act !== '—'
      ? [item.act]
      : extractedRefs.actRefs,
    ruleRefs: item.rule && item.rule !== '—'
      ? [item.rule]
      : extractedRefs.ruleRefs,
    keyTakeaway,
  };
});

export const enrichedPprcDecisions: EnrichedPprcDecision[] = rawPprcDecisions.map((item) => {
  const combinedText = `${item.subject} ${item.decision} ${item.act} ${item.rule} ${item.use}`;
  const { actRefs, ruleRefs } = extractLegalRefs(combinedText);
  const topics = classifyTopics(combinedText);

  const dateMatch = item.decision.match(/\((?:निर्णय\s*)?(?:आदेश\s*)?(?:मिति[:\s]*)?(२०[७८][०-९][^\)]+)\)/);
  const decisionDate = dateMatch ? dateMatch[1].trim() : '२०७५–२०८२';

  let outcomeCategory: EnrichedPprcDecision['outcomeCategory'] = 'अन्य आदेश / फिर्ता';
  if (item.type.includes('बदर')) {
    outcomeCategory = 'बदर / पुनर्मूल्याङ्कन';
  } else if (item.type.includes('खारेज')) {
    outcomeCategory = 'निवेदन खारेज';
  } else if (item.type.includes('दरपीठ')) {
    outcomeCategory = 'दरपीठ';
  }

  return {
    ...item,
    id: `pprc-${item.no}`,
    topics,
    actRefs: item.act && item.act !== '—' ? item.act.split(';').map((s) => s.trim()) : actRefs,
    ruleRefs: item.rule && item.rule !== '—' ? item.rule.split(';').map((s) => s.trim()) : ruleRefs,
    decisionDate,
    outcomeCategory,
  };
});
