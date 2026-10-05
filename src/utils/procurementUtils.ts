import { ProcurementType } from '../types/procurement';

// Format numbers in Nepali/South Asian style (Lakhs, Crores)
export function formatNepaliCurrency(amount: number): string {
  if (isNaN(amount)) return 'रु ०/-';
  
  if (amount >= 1000000000) {
    const arab = amount / 1000000000;
    return `रु ${arab.toFixed(2)} अर्ब (रु ${amount.toLocaleString('en-IN')}/-)`;
  }
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `रु ${crore.toFixed(2)} करोड (रु ${amount.toLocaleString('en-IN')}/-)`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `रु ${lakh.toFixed(2)} लाख (रु ${amount.toLocaleString('en-IN')}/-)`;
  }
  return `रु ${amount.toLocaleString('en-IN')}/-`;
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `रु ${(amount / 1000000000).toFixed(1)} अर्ब`;
  }
  if (amount >= 10000000) {
    return `रु ${(amount / 10000000).toFixed(1)} करोड`;
  }
  if (amount >= 100000) {
    return `रु ${(amount / 100000).toFixed(1)} लाख`;
  }
  return `रु ${amount.toLocaleString('en-IN')}`;
}

export interface ThresholdAnalysis {
  type: ProcurementType;
  amount: number;
  recommendedMethods: {
    id: string;
    name: string;
    isPrimary: boolean;
    reason: string;
    legalClause: string;
  }[];
  approvingAuthorityCostEstimate: string;
  approvingAuthorityBidAcceptance: string;
  requiredBidSecurityRange: {
    minPercent: number;
    maxPercent: number;
    minAmount: number;
    maxAmount: number;
  };
  minimumPerformanceSecurity: number;
  bidValidityDays: number;
  bidSecurityValidityDays: number;
  minimumNoticeDays: number;
  isTwoEnvelopeRequired: boolean;
  masterPlanRequired: boolean;
  annualPlanRequired: boolean;
  canUseUserCommittee: boolean;
  domesticPreferenceApplies: boolean;
}

export function analyzeProcurementThreshold(type: ProcurementType, amount: number): ThresholdAnalysis {
  const masterPlanRequired = amount > 100000000; // > 10 Crore
  const annualPlanRequired = amount > 1000000; // > 10 Lakh
  const isTwoEnvelopeRequired = type === 'works' ? amount > 20000000 : amount > 20000000;
  const canUseUserCommittee = type === 'works' && amount <= 10000000;
  const domesticPreferenceApplies = amount <= 5000000000; // Under 5 billion works strictly domestic

  // Notice period
  let minimumNoticeDays = 21;
  if (amount > 5000000000 || (type === 'consulting' && amount > 150000000)) {
    minimumNoticeDays = 30; // ICB
  } else if (amount <= 2000000) {
    minimumNoticeDays = 7; // Sealed Quotation or direct
  }

  // Bid validity
  const bidValidityDays = amount <= 500000000 ? 90 : 120; // 50 Crore threshold
  const bidSecurityValidityDays = bidValidityDays + 30;

  // Bid security
  const minSec = amount * 0.02;
  const maxSec = amount * 0.03;

  // Performance security (standard 5%)
  const minimumPerformanceSecurity = amount * 0.05;

  // Approval authority cost estimate (Rule 14)
  let approvingAuthorityCostEstimate = '';
  let approvingAuthorityBidAcceptance = '';

  if (type === 'consulting') {
    if (amount <= 2000000) {
      approvingAuthorityCostEstimate = 'राजपत्राङ्कित तृतीय श्रेणी (शाखा अधिकृत/इन्जिनियर)';
      approvingAuthorityBidAcceptance = 'राजपत्राङ्कित तृतीय श्रेणी कार्यालय प्रमुख';
    } else if (amount <= 5000000) {
      approvingAuthorityCostEstimate = 'राजपत्राङ्कित द्वितीय श्रेणी (उपसचिव/सि.डि.ई.)';
      approvingAuthorityBidAcceptance = 'राजपत्राङ्कित द्वितीय श्रेणी कार्यालय प्रमुख';
    } else if (amount <= 10000000) {
      approvingAuthorityCostEstimate = 'राजपत्राङ्कित प्रथम श्रेणी (सहसचिव/डिभिजन प्रमुख)';
      approvingAuthorityBidAcceptance = 'राजपत्राङ्कित प्रथम श्रेणी कार्यालय प्रमुख';
    } else if (amount <= 50000000) {
      approvingAuthorityCostEstimate = 'राजपत्राङ्कित प्रथम श्रेणी (सहसचिव/महानिर्देशक)';
      approvingAuthorityBidAcceptance = 'राजपत्राङ्कित प्रथम श्रेणी कार्यालय प्रमुख';
    } else {
      approvingAuthorityCostEstimate = 'सम्बन्धित विभागीय प्रमुख वा सचिव';
      approvingAuthorityBidAcceptance = 'सम्बन्धित विभागीय प्रमुख वा मन्त्रालयका सचिव';
    }
  } else {
    // Works, Goods, Services (Rule 14 & Rule 67 as amended by 16th amendment)
    if (amount <= 150000000) { // 15 Crore
      approvingAuthorityCostEstimate = 'राजपत्राङ्कित तृतीय श्रेणी कार्यालय प्रमुख (रु १५ करोड सम्म)';
      approvingAuthorityBidAcceptance = 'राजपत्राङ्कित तृतीय श्रेणी कार्यालय प्रमुख (रु २० करोड सम्म)';
    } else if (amount <= 500000000) { // 50 Crore
      approvingAuthorityCostEstimate = 'राजपत्राङ्कित द्वितीय श्रेणी कार्यालय प्रमुख (रु ५० करोड सम्म)';
      approvingAuthorityBidAcceptance = 'राजपत्राङ्कित द्वितीय श्रेणी कार्यालय प्रमुख (रु १ अर्ब सम्म)';
    } else if (amount <= 1000000000) { // 1 Arab
      approvingAuthorityCostEstimate = 'राजपत्राङ्कित प्रथम श्रेणी कार्यालय प्रमुख (रु १ अर्ब सम्म)';
      approvingAuthorityBidAcceptance = 'राजपत्राङ्कित प्रथम श्रेणी कार्यालय प्रमुख (रु १ अर्ब ५० करोड सम्म)';
    } else {
      approvingAuthorityCostEstimate = 'सम्बन्धित विभागीय प्रमुख वा मन्त्रालय सचिव (रु १ अर्ब भन्दा माथि)';
      approvingAuthorityBidAcceptance = 'विभागीय प्रमुख वा मन्त्रालय सचिव';
    }
  }

  // Recommended methods
  const recommendedMethods: ThresholdAnalysis['recommendedMethods'] = [];

  if (type === 'works') {
    if (amount <= 1500000) {
      recommendedMethods.push({
        id: 'direct-procurement',
        name: 'सोझै खरिद (Direct Purchase)',
        isPrimary: true,
        reason: 'रु १५ लाख सम्मको निर्माण कार्य मौजुदा सूचीका ३ वटा फर्मबाट दरभाउ लिई सोझै गराउन सकिन्छ (१६औँ संशोधन)।',
        legalClause: 'ऐन दफा ४१(१)(क), नियम ८५(१)(क)',
      });
    }
    if (amount <= 2000000) {
      recommendedMethods.push({
        id: 'sealed-quotation',
        name: 'सिलबन्दी दरभाउपत्र (Sealed Quotation)',
        isPrimary: amount > 1500000,
        reason: 'रु २० लाख सम्मको निर्माण कार्यमा कम्तीमा ७ दिनको सूचना दिई सिलबन्दी दरभाउपत्र आह्वान गर्न सकिन्छ।',
        legalClause: 'ऐन दफा ४०, नियम ८४',
      });
    }
    if (amount <= 10000000) {
      recommendedMethods.push({
        id: 'user-committee',
        name: 'उपभोक्ता समितिबाट निर्माण (User Committee)',
        isPrimary: false,
        reason: 'स्थानीय बासिन्दा प्रत्यक्ष लाभग्राही हुने र जटिल मेसिन नचाहिने अवस्थामा रु १ करोड सम्म उपभोक्ता समिति मार्फत गराउन सकिने।',
        legalClause: 'ऐन दफा ४४, नियम ९७',
      });
    }
    if (amount <= 20000000) {
      recommendedMethods.push({
        id: 'ncb-works',
        name: 'एकमुष्ट दर वा एक खाम खुला बोलपत्र (Single Stage NCB)',
        isPrimary: amount > 2000000,
        reason: 'रु २ करोड सम्म योग्यता नपर्ने प्रकृतिको भए एकमुष्ट दर वा १ खाम प्रणालीबाट प्रतिस्पर्धा गराउन सकिन्छ।',
        legalClause: 'ऐन दफा ११(४), नियम ३१क',
      });
    }
    if (amount > 20000000 && amount <= 5000000000) {
      recommendedMethods.push({
        id: 'two-envelope',
        name: 'दुई खाम प्रणाली खुला बोलपत्र (Two-Envelope NCB Works)',
        isPrimary: true,
        reason: 'रु २ करोड माथिका निर्माण कार्यमा अनिवार्य प्राविधिक र आर्थिक प्रस्ताव छुट्टै खाममा माग गर्नुपर्ने र रु ५ अर्ब सम्म स्वदेशी व्यवसायी बीच मात्र प्रतिस्पर्धा हुने।',
        legalClause: 'ऐन दफा ११(५), नियम ३१ज, ३१ङ',
      });
    }
    if (amount > 5000000000) {
      recommendedMethods.push({
        id: 'ncb-works',
        name: 'अन्तर्राष्ट्रिय स्तरको खुला बोलपत्र (ICB Works)',
        isPrimary: true,
        reason: 'रु ५ अर्ब भन्दा माथिको निर्माण कार्यमा विदेशी निर्माण व्यवसायी समेत सहभागी हुन पाउने गरी ३० दिनको सूचनामा अन्तर्राष्ट्रिय खुला बोलपत्र आह्वान गर्नुपर्ने।',
        legalClause: 'ऐन दफा १५, नियम ३१ङ',
      });
    }
  } else if (type === 'goods') {
    if (amount <= 1500000) {
      recommendedMethods.push({
        id: 'direct-procurement',
        name: 'सोझै खरिद (Direct Purchase)',
        isPrimary: true,
        reason: 'रु १५ लाख सम्मको मालसामान मौजुदा सूचीका ३ आपूर्तिकर्ताबाट दरभाउ माग गरी सोझै खरिद गर्न सकिन्छ।',
        legalClause: 'ऐन दफा ४१(१)(क), नियम ८५(१)(क)',
      });
    }
    if (amount <= 2000000) {
      recommendedMethods.push({
        id: 'sealed-quotation',
        name: 'सिलबन्दी दरभाउपत्र (Sealed Quotation)',
        isPrimary: amount > 1500000,
        reason: 'रु २० लाख सम्मको मालसामानमा ७ दिनको सूचना दिई सिलबन्दी दरभाउपत्र गर्न सकिन्छ।',
        legalClause: 'ऐन दफा ४०, नियम ८४',
      });
    }
    if (amount <= 5000000) {
      recommendedMethods.push({
        id: 'gem-marketplace',
        name: 'सरकारी ई-मार्केटप्लेस (GeM Portal) / रिभर्स अक्सन',
        isPrimary: false,
        reason: 'PPMO को ई-मार्केटप्लेसमा सूचीकृत मालसामान भए ५० लाख सम्म रिभर्स अक्सन वा २० लाख सम्म ३ दरभाउबाट खरिद सम्भव।',
        legalClause: 'ऐन दफा ४१क, नियम ८६क',
      });
    }
    if (amount > 2000000) {
      recommendedMethods.push({
        id: 'ncb-goods',
        name: 'राष्ट्रिय स्तरको खुला बोलपत्र (NCB Goods)',
        isPrimary: true,
        reason: 'रु २० लाख भन्दा माथिको मालसामान खरिदमा २१ दिनको राष्ट्रिय सूचना दिई खुला बोलपत्र आह्वान गर्नुपर्छ। योग्यता चाहिने भए दुई खाम।',
        legalClause: 'ऐन दफा ११, नियम ३१, ३१ज',
      });
      recommendedMethods.push({
        id: 'catalog-shopping',
        name: 'क्याटलग सपिङ (हेभी गाडी/उपकरण भएमा)',
        isPrimary: false,
        reason: 'सवारी साधन, हेभी इक्विपमेन्ट, एक्स-रे वा स्वास्थ्य मेसिनरी भए उत्पादकको ब्रोसर दरमा ७ देखि १५ दिनको सूचना दिई खरिद गर्न सकिन्छ।',
        legalClause: 'ऐन दफा ८(१)(८), नियम ३१ख',
      });
    }
  } else if (type === 'consulting') {
    if (amount <= 500000) {
      recommendedMethods.push({
        id: 'direct-procurement',
        name: 'सोझै परामर्श सेवा खरिद',
        isPrimary: true,
        reason: 'रु ५ लाख सम्मको तालिम, गोष्ठी वा परामर्श सेवा कार्यालय प्रमुखले सोझै वार्ता गरी खरिद गर्न सक्ने।',
        legalClause: 'ऐन दफा ४१, नियम ८२(१)',
      });
    }
    if (amount <= 2000000) {
      recommendedMethods.push({
        id: 'direct-procurement',
        name: 'मौजुदा सूचीबाट लिखित प्रस्ताव माग (RFP)',
        isPrimary: amount > 500000,
        reason: 'रु २० लाख भन्दा कमको परामर्श सेवा मौजुदा सूचीका ३ देखि ६ परामर्शदाताबाट १५ दिनको म्याद दिई सोझै माग गर्न सकिने।',
        legalClause: 'ऐन दफा ३०(६), नियम ७२',
      });
    }
    if (amount > 2000000) {
      recommendedMethods.push({
        id: 'consulting-qcbs',
        name: 'खुला आशयपत्र (EOI) र प्रस्ताव माग (RFP - QCBS)',
        isPrimary: true,
        reason: 'रु २० लाख भन्दा माथिको परामर्श सेवामा खुला EOI (१५ दिन) मार्फत ३-६ वटा संक्षिप्त सूची बनाई RFP (३० दिन) बाट गुणस्तर र लागत विधि (QCBS) अपनाउनुपर्छ।',
        legalClause: 'ऐन दफा ३०, ३१, नियम ७०, ७१',
      });
    }
  } else {
    // Non-consulting services
    if (amount <= 500000) {
      recommendedMethods.push({
        id: 'direct-procurement',
        name: 'सोझै सेवा खरिद / मर्मत',
        isPrimary: true,
        reason: 'रु ५ लाख सम्मको सेवा वा मर्मत सम्भार सोझै लिन सकिन्छ।',
        legalClause: 'ऐन दफा ४१, नियम ८५(१क१/२/३)',
      });
    } else if (amount <= 2000000) {
      recommendedMethods.push({
        id: 'sealed-quotation',
        name: 'सिलबन्दी दरभाउपत्र / सेवा करार',
        isPrimary: true,
        reason: 'रु २० लाख सम्म सिलबन्दी दरभाउपत्र वा १० लाख सम्म सेवा करार वार्ता गर्न सकिन्छ।',
        legalClause: 'ऐन दफा ४०, नियम ८४, ९५',
      });
    } else {
      recommendedMethods.push({
        id: 'ncb-goods',
        name: 'खुला बोलपत्र (सेवा खरिद)',
        isPrimary: true,
        reason: 'रु २० लाख भन्दा माथि खुला प्रतिस्पर्धा गराउनुपर्छ।',
        legalClause: 'ऐन दफा ११, नियम ३१',
      });
    }
  }

  return {
    type,
    amount,
    recommendedMethods,
    approvingAuthorityCostEstimate,
    approvingAuthorityBidAcceptance,
    requiredBidSecurityRange: {
      minPercent: 2,
      maxPercent: 3,
      minAmount: minSec,
      maxAmount: maxSec,
    },
    minimumPerformanceSecurity,
    bidValidityDays,
    bidSecurityValidityDays,
    minimumNoticeDays,
    isTwoEnvelopeRequired,
    masterPlanRequired,
    annualPlanRequired,
    canUseUserCommittee,
    domesticPreferenceApplies,
  };
}
