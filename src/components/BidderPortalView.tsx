import React, { useMemo, useState } from 'react';
import publicAImage from '../../public-a.png';
import bidderDedicatedImage from '../../bidder-dedicated.png';
import goodsImage from '../../goods.png';
import catalogueImage from '../../catalogue.png';
import rationImage from '../../ration.png';
import icbImage from '../../icb.png';
import consultingImage from '../../consulting.png';
import nonConsultingImage from '../../non-consulting.png';
import riskImage from '../../risk.png';
import generatorImage from '../../generator.png';
import checklistImage from '../../checklist.png';
import egpImage from '../../egp.png';
import reviewImage from '../../review.png';
import sampleImage from '../../sample.png';
import bidNoBidImage from '../../bid-no-bid.png';
import {
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calculator,
  ShieldCheck,
  Scale,
  ArrowRight,
  HelpCircle,
  Clock,
  Download,
  ExternalLink,
  ChevronRight,
  CheckSquare,
  FileCheck2,
  Sparkles,
  Building2,
  Layers,
  Search,
  BookOpen,
  Printer,
  RotateCcw,
  Check,
  XCircle,
  TrendingUp,
  FileSpreadsheet,
  ShoppingBag,
  Award,
  Truck,
  Percent,
  Sliders,
  Users,
  GraduationCap,
  PackageCheck,
  ShieldAlert,
  FileWarning,
  Globe,
  Tag,
  Target,
  UtensilsCrossed,
} from 'lucide-react';
import { BiddingFormsGenerator } from './BiddingFormsGenerator';
import { RationProcurementHub } from './bidder/RationProcurementHub';
import { BidNoBidAnalyzer } from './bidder/BidNoBidAnalyzer';
import { IcbProcurementHub } from './IcbProcurementHub';
import {
  SBD_DOCUMENTS_LIST,
  BIDDER_PRECEDENT_CASES,
  SbdDocumentItem,
  BidderPrecedentCase,
} from '../data/sbdRepositoryData';
import {
  FATAL_BIDDER_MISTAKES,
  FATAL_MISTAKES_CATEGORIES,
  PRE_BID_RISK_AUDIT_ITEMS,
  FatalBidderMistake,
  RiskAuditItem,
} from '../data/bidderMistakesData';
import { GuideSourceNotice } from './GuideSourceNotice';

interface BidderPortalViewProps {
  onSwitchToEntityMode?: () => void;
  onNavigateToLaw?: () => void;
  onNavigateToEgpGuidelines?: () => void;
  initialSubTab?:
  | 'overview'
  | 'eligibility'
  | 'goods-procurement'
  | 'goods-guide'
  | 'catalogue-shopping'
  | 'consulting-services'
  | 'non-consulting-services'
  | 'services-guide'
  | 'ration-procurement'
  | 'bid-no-bid'
  | 'fatal-mistakes'
  | 'forms'
  | 'checklist'
  | 'egp-guide'
  | 'review'
  | 'sbd-hub'
  | 'icb-procurement';
}

export const BidderPortalView: React.FC<BidderPortalViewProps> = ({
  onSwitchToEntityMode,
  onNavigateToLaw,
  onNavigateToEgpGuidelines,
  initialSubTab = 'overview',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    if (initialSubTab === 'goods-guide') return 'goods-procurement';
    if (initialSubTab === 'services-guide') return 'consulting-services';
    return initialSubTab;
  });

  // -------------------------------------------------------------
  // 1. Eligibility & Capacity Self-Assessment Calculator State
  // -------------------------------------------------------------
  const [calcEstimateAmount, setCalcEstimateAmount] = useState<number>(30000000); // रु ३ करोड
  const [calcBidAmount, setCalcBidAmount] = useState<number>(24500000); // रु २ करोड ४५ लाख
  const [calcAactRequired, setCalcAactRequired] = useState<number>(24000000); // रु २ करोड ४० लाख (८०%)
  const [turnoverCount, setTurnoverCount] = useState<number>(5);
  const [turnoverYears, setTurnoverYears] = useState<number[]>([
    26000000, 29000000, 22000000, 18000000, 15000000, 12000000, 10000000,
  ]);
  const [similarWorkRequired, setSimilarWorkRequired] = useState<number>(24000000);
  const [maxCompletedSimilarWork, setMaxCompletedSimilarWork] = useState<number>(26000000);
  const [ongoingContractsCount, setOngoingContractsCount] = useState<number>(3); // Max 5 limit
  const [remainingLiabilityB, setRemainingLiabilityB] = useState<number>(15000000); // Remaining work in ongoing contracts
  const [contractDurationN, setContractDurationN] = useState<number>(1.5); // Years
  const [showFiveContractRules, setShowFiveContractRules] = useState<boolean>(false);

  // AACT Calculation: Best 3 years out of entered turnovers
  const activeTurnovers = useMemo(() => {
    return turnoverYears.slice(0, turnoverCount);
  }, [turnoverYears, turnoverCount]);

  const { avgBest3Turnover, best3Indices, isAactEligible } = useMemo(() => {
    const indexed = activeTurnovers.map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => b.val - a.val);
    const top3 = indexed.slice(0, 3);
    const top3Indices = new Set(top3.map((item) => item.idx));
    const avg = top3.reduce((sum, item) => sum + item.val, 0) / Math.max(top3.length, 1);
    return {
      avgBest3Turnover: avg,
      best3Indices: top3Indices,
      isAactEligible: avg >= calcAactRequired,
    };
  }, [activeTurnovers, calcAactRequired]);

  // Similar work eligibility
  const isSimilarWorkEligible = maxCompletedSimilarWork >= similarWorkRequired;

  // 5 Ongoing contracts limit check (16th Amendment)
  const isOngoingContractsEligible = ongoingContractsCount < 5;

  // Bid Capacity Formula: (A * N * 3) - B
  const maxA = useMemo(() => Math.max(...activeTurnovers, 0), [activeTurnovers]);
  const bidCapacity = useMemo(() => {
    const capacity = maxA * contractDurationN * 3 - remainingLiabilityB;
    return Math.max(capacity, 0);
  }, [maxA, contractDurationN, remainingLiabilityB]);

  const isBidCapacityEligible = bidCapacity >= calcEstimateAmount;

  // Additional Performance Security check (if bid is below 85% of estimate)
  const percentBelowEstimate = useMemo(() => {
    if (calcEstimateAmount <= 0) return 0;
    return ((calcEstimateAmount - calcBidAmount) / calcEstimateAmount) * 100;
  }, [calcEstimateAmount, calcBidAmount]);

  const additionalSecurityCalculation = useMemo(() => {
    const normalSecurity = calcBidAmount * 0.05;
    if (percentBelowEstimate <= 15) {
      return {
        isBelow15: false,
        normalSecurity,
        additionalSecurity: 0,
        totalSecurity: normalSecurity,
        note: 'लागत अनुमान भन्दा १५% सम्म मात्र घटेको हुनाले सामान्य ५% कार्यसम्पादन जमानत मात्र लाग्नेछ।',
      };
    } else {
      const eightyFivePercentOfEstimate = calcEstimateAmount * 0.85;
      const difference = eightyFivePercentOfEstimate - calcBidAmount;
      const additionalSecurity = difference * 0.5;
      return {
        isBelow15: true,
        normalSecurity,
        additionalSecurity,
        totalSecurity: normalSecurity + additionalSecurity,
        note: `लागत अनुमानको ८५% (रु ${eightyFivePercentOfEstimate.toLocaleString('ne-NP')}) भन्दा रु ${difference.toLocaleString('ne-NP')} ले घटेको हुनाले नियम ६५(४) बमोजिम ५०% थप धरौटी (रु ${additionalSecurity.toLocaleString('ne-NP')}) लाग्नेछ।`,
      };
    }
  }, [percentBelowEstimate, calcEstimateAmount, calcBidAmount]);

  const overallEligibility =
    isAactEligible &&
    isSimilarWorkEligible &&
    isOngoingContractsEligible &&
    isBidCapacityEligible;

  // -------------------------------------------------------------
  // 1B. Goods Procurement Simulator State
  // -------------------------------------------------------------
  const [goodsEstAmount, setGoodsEstAmount] = useState<number>(8000000); // रु ८० लाख
  const [goodsTurnoverReq, setGoodsTurnoverReq] = useState<number>(6400000); // ८०%
  const [goodsSupplierTurnover, setGoodsSupplierTurnover] = useState<number>(7500000);
  const [goodsExpReq, setGoodsExpReq] = useState<number>(5000000);
  const [goodsSupplierExp, setGoodsSupplierExp] = useState<number>(6200000);
  const [goodsLiquidReq, setGoodsLiquidReq] = useState<number>(2500000);
  const [goodsSupplierLiquid, setGoodsSupplierLiquid] = useState<number>(3000000);
  const [goodsMafRequired, setGoodsMafRequired] = useState<boolean>(true);
  const [goodsHasValidMaf, setGoodsHasValidMaf] = useState<boolean>(true);

  const isGoodsTurnoverOk = goodsSupplierTurnover >= goodsTurnoverReq;
  const isGoodsExpOk = goodsSupplierExp >= goodsExpReq;
  const isGoodsLiquidOk = goodsSupplierLiquid >= goodsLiquidReq;
  const isGoodsMafOk = !goodsMafRequired || goodsHasValidMaf;
  const isGoodsOverallEligible = isGoodsTurnoverOk && isGoodsExpOk && isGoodsLiquidOk && isGoodsMafOk;

  // Domestic Preference Simulator (PPA Sec 52 & PPR Rule 97: 15% margin)
  const [dpDomesticQuote, setDpDomesticQuote] = useState<number>(1120000);
  const [dpForeignQuote, setDpForeignQuote] = useState<number>(1000000);
  const [dpMarginPercent, setDpMarginPercent] = useState<number>(15);

  const dpEvaluatedForeign = useMemo(() => {
    return dpForeignQuote * (1 + dpMarginPercent / 100);
  }, [dpForeignQuote, dpMarginPercent]);

  const isDomesticWinning = useMemo(() => {
    return dpDomesticQuote <= dpEvaluatedForeign;
  }, [dpDomesticQuote, dpEvaluatedForeign]);

  const dpPriceDifference = useMemo(() => {
    return Math.abs(dpEvaluatedForeign - dpDomesticQuote);
  }, [dpEvaluatedForeign, dpDomesticQuote]);

  // Technical Spec Deviation Filter
  const [specDeviationFilter, setSpecDeviationFilter] = useState<'all' | 'minor' | 'major'>('all');

  // Goods Liquidated Damages (LD) Calculator
  const [goodsContractAmount, setGoodsContractAmount] = useState<number>(5000000); // रु ५० लाख
  const [goodsDelayDays, setGoodsDelayDays] = useState<number>(20); // २० दिन

  // LD Calculations (0.05% per day, max 10%)
  const goodsLdDaily = useMemo(() => {
    return goodsContractAmount * 0.0005;
  }, [goodsContractAmount]);

  const goodsLdTotalRaw = useMemo(() => {
    return goodsLdDaily * goodsDelayDays;
  }, [goodsLdDaily, goodsDelayDays]);

  const goodsLdMaxCap = useMemo(() => {
    return goodsContractAmount * 0.10;
  }, [goodsContractAmount]);

  const goodsLdEffective = useMemo(() => {
    return Math.min(goodsLdTotalRaw, goodsLdMaxCap);
  }, [goodsLdTotalRaw, goodsLdMaxCap]);

  const goodsLdPercent = useMemo(() => {
    return goodsContractAmount > 0 ? (goodsLdEffective / goodsContractAmount) * 100 : 0;
  }, [goodsLdEffective, goodsContractAmount]);

  // -------------------------------------------------------------
  // 1B-2. Catalogue Shopping State (PPA Sec 41A, PPR Rule 85A)
  // -------------------------------------------------------------
  const [catOriginalPrice, setCatOriginalPrice] = useState<number>(3500000); // रु ३५ लाख
  const [catDiscountPercent, setCatDiscountPercent] = useState<number>(8.5); // ८.५%
  const [catQuantity, setCatQuantity] = useState<number>(2); // २ थान
  const [catDeliveryCost, setCatDeliveryCost] = useState<number>(45000); // ढुवानी
  const [catApplyVat, setCatApplyVat] = useState<boolean>(true);
  const [catItemName, setCatItemName] = useState<string>('');

  const catDiscountAmountPerUnit = useMemo(() => {
    return (catOriginalPrice * catDiscountPercent) / 100;
  }, [catOriginalPrice, catDiscountPercent]);

  const catNetUnitPrice = useMemo(() => {
    return catOriginalPrice - catDiscountAmountPerUnit;
  }, [catOriginalPrice, catDiscountAmountPerUnit]);

  const catTotalTaxable = useMemo(() => {
    return catNetUnitPrice * catQuantity + catDeliveryCost;
  }, [catNetUnitPrice, catQuantity, catDeliveryCost]);

  const catVatAmount = useMemo(() => {
    return catApplyVat ? catTotalTaxable * 0.13 : 0;
  }, [catApplyVat, catTotalTaxable]);

  const catGrandTotal = useMemo(() => {
    return catTotalTaxable + catVatAmount;
  }, [catTotalTaxable, catVatAmount]);

  const catTotalSavings = useMemo(() => {
    return catDiscountAmountPerUnit * catQuantity;
  }, [catDiscountAmountPerUnit, catQuantity]);

  // -------------------------------------------------------------
  // 1C. Consulting Services State & Calculations
  // -------------------------------------------------------------
  // EOI Shortlisting Self-Assessment
  const [eoiStandingYears, setEoiStandingYears] = useState<number>(7); // फर्म दर्ता वर्ष
  const [eoiTurnover, setEoiTurnover] = useState<number>(18000000); // रु १ करोड ८० लाख
  const [eoiCompletedProjects, setEoiCompletedProjects] = useState<number>(5); // सम्पन्न समान परामर्श कार्य
  const [eoiKeyExpertsCount, setEoiKeyExpertsCount] = useState<number>(6); // उपलब्ध स्नातकोत्तर/PhD विज्ञ
  const [eoiHasValidTax, setEoiHasValidTax] = useState<boolean>(true);

  const eoiCalculations = useMemo(() => {
    // Scoring out of 100 (PPR Rule 70)
    // 1. Institutional Standing & Financial Capacity (20 marks)
    const standingScore = Math.min(eoiStandingYears * 2, 10);
    const finScore = Math.min((eoiTurnover / 20000000) * 10, 10);
    const instTotal = standingScore + finScore;

    // 2. Specific Experience (45 marks)
    const expScore = Math.min(eoiCompletedProjects * 9, 45);

    // 3. Key Personnel Capacity (35 marks)
    const expertScore = Math.min(eoiKeyExpertsCount * 6, 35);

    const totalScore = Math.round(instTotal + expScore + expertScore);
    const isShortlistReady = totalScore >= 70 && eoiHasValidTax;

    return {
      instTotal,
      expScore,
      expertScore,
      totalScore,
      isShortlistReady,
    };
  }, [eoiStandingYears, eoiTurnover, eoiCompletedProjects, eoiKeyExpertsCount, eoiHasValidTax]);

  // Consulting Selection Method (QCBS, LCS, FBS)
  const [consultingMethod, setConsultingMethod] = useState<'qcbs' | 'lcs' | 'fbs'>('qcbs');
  const [qcbsTechScore, setQcbsTechScore] = useState<number>(82); // ८२ अंक (०-१००)
  const [qcbsBidderFinancial, setQcbsBidderFinancial] = useState<number>(2500000); // रु २५ लाख
  const [qcbsLowestFinancial, setQcbsLowestFinancial] = useState<number>(2100000); // रु २१ लाख
  const [qcbsRatio, setQcbsRatio] = useState<'80-20' | '70-30' | '90-10'>('80-20');
  const [lcsQualifyingMark, setLcsQualifyingMark] = useState<number>(75);
  const [fbsBudgetCap, setFbsBudgetCap] = useState<number>(3000000);

  const qcbsCalculations = useMemo(() => {
    let techWeight = 80;
    let finWeight = 20;
    if (qcbsRatio === '70-30') {
      techWeight = 70;
      finWeight = 30;
    } else if (qcbsRatio === '90-10') {
      techWeight = 90;
      finWeight = 10;
    }

    const techWeighted = (qcbsTechScore * techWeight) / 100;
    const finScore =
      qcbsBidderFinancial > 0 && qcbsLowestFinancial > 0
        ? (qcbsLowestFinancial / qcbsBidderFinancial) * 100
        : 0;
    const finWeighted = (finScore * finWeight) / 100;
    const combinedScore = techWeighted + finWeighted;

    return {
      techWeight,
      finWeight,
      techWeighted,
      finScore,
      finWeighted,
      combinedScore,
    };
  }, [qcbsTechScore, qcbsBidderFinancial, qcbsLowestFinancial, qcbsRatio]);

  // -------------------------------------------------------------
  // 1D. Non-Consulting Services (Labor Law, SSF & Qualification)
  // -------------------------------------------------------------
  const [serviceStaffCount, setServiceStaffCount] = useState<number>(5);
  const [serviceBaseSalary, setServiceBaseSalary] = useState<number>(17300); // नेपाल सरकार न्यूनतम पारिश्रमिक
  const [serviceAllowance, setServiceAllowance] = useState<number>(2000);
  const [serviceUniformPpe, setServiceUniformPpe] = useState<number>(1000); // युनिफर्म तथा PPE
  const [serviceMarginPercent, setServiceMarginPercent] = useState<number>(8); // व्यवस्थापकीय सेवा शुल्क %
  const [serviceIncludeBonus, setServiceIncludeBonus] = useState<boolean>(true);
  const [serviceIncludeSsf, setServiceIncludeSsf] = useState<boolean>(true);
  const [serviceApplyVat, setServiceApplyVat] = useState<boolean>(true);

  // Non-Consulting Experience & Qualification
  const [ncEstAmount, setNcEstAmount] = useState<number>(6000000); // रु ६० लाख
  const [ncTurnoverReq, setNcTurnoverReq] = useState<number>(4800000); // ८०%
  const [ncSupplierTurnover, setNcSupplierTurnover] = useState<number>(5500000);
  const [ncExpReq, setNcExpReq] = useState<number>(3000000); // ५०%
  const [ncSupplierExp, setNcSupplierExp] = useState<number>(3800000);
  const [ncLiquidReq, setNcLiquidReq] = useState<number>(1500000);
  const [ncSupplierLiquid, setNcSupplierLiquid] = useState<number>(2000000);
  const [ncHasLicense, setNcHasLicense] = useState<boolean>(true);
  const [ncHasSsfRegistered, setNcHasSsfRegistered] = useState<boolean>(true);

  const serviceCalculations = useMemo(() => {
    const basicPlusAllowance = serviceBaseSalary + serviceAllowance;
    const ssfEmployerCost = serviceIncludeSsf ? serviceBaseSalary * 0.20 : 0;
    const festivalCost = serviceIncludeBonus ? serviceBaseSalary / 12 : 0;
    const monthlyCostPerPerson = basicPlusAllowance + ssfEmployerCost + festivalCost + serviceUniformPpe;
    const totalStaffMonthlyBase = monthlyCostPerPerson * serviceStaffCount;
    const overheadMargin = (totalStaffMonthlyBase * serviceMarginPercent) / 100;
    const monthlyTaxable = totalStaffMonthlyBase + overheadMargin;
    const monthlyVat = serviceApplyVat ? monthlyTaxable * 0.13 : 0;
    const monthlyGrandTotal = monthlyTaxable + monthlyVat;
    const annualGrandTotal = monthlyGrandTotal * 12;

    const isBelowStatutoryMinimum = serviceBaseSalary < 17300;
    const isZeroMargin = serviceMarginPercent <= 0;

    return {
      basicPlusAllowance,
      ssfEmployerCost,
      festivalCost,
      monthlyCostPerPerson,
      totalStaffMonthlyBase,
      overheadMargin,
      monthlyTaxable,
      monthlyVat,
      monthlyGrandTotal,
      annualGrandTotal,
      isBelowStatutoryMinimum,
      isZeroMargin,
    };
  }, [
    serviceStaffCount,
    serviceBaseSalary,
    serviceAllowance,
    serviceUniformPpe,
    serviceMarginPercent,
    serviceIncludeBonus,
    serviceIncludeSsf,
    serviceApplyVat,
  ]);

  const isNcEligible = useMemo(() => {
    return (
      ncSupplierTurnover >= ncTurnoverReq &&
      ncSupplierExp >= ncExpReq &&
      ncSupplierLiquid >= ncLiquidReq &&
      ncHasLicense &&
      ncHasSsfRegistered
    );
  }, [
    ncSupplierTurnover,
    ncTurnoverReq,
    ncSupplierExp,
    ncExpReq,
    ncSupplierLiquid,
    ncLiquidReq,
    ncHasLicense,
    ncHasSsfRegistered,
  ]);

  // -------------------------------------------------------------
  // 2. Pre-Bid 30-Point Checklist State
  // -------------------------------------------------------------
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bidder_prebid_checklist_30');
      if (saved) return JSON.parse(saved);
    } catch { }
    return {
      'check-1': true,
      'check-2': true,
      'check-3': true,
      'check-6': true,
      'check-7': true,
      'check-13': true,
      'check-19': true,
      'check-25': true,
    };
  });

  const checklistSections = useMemo(
    () => [
      {
        id: 'sec-legal',
        title: '१. योग्यता तथा कानूनी कागजात रुजु (Legal & Statutory)',
        items: [
          { id: 'check-1', text: 'कम्पनी/फर्म दर्ता प्रमाणपत्र तथा चालू आर्थिक वर्षसम्मको अद्यावधिक नवीकरण पत्र संलग्न छ।', required: true },
          { id: 'check-2', text: 'मूल्य अभिवृद्धि कर (VAT) वा स्थायी लेखा नम्बर (PAN) दर्ता प्रमाणपत्र संलग्न छ।', required: true },
          { id: 'check-3', text: 'पछिल्लो आर्थिक वर्ष (२०८०/८१ वा पछिल्लो) को कर चुक्ता प्रमाणपत्र (Tax Clearance) संलग्न छ।', required: true },
          { id: 'check-4', text: 'सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) को कालोसूचीमा नपरेको लिखित स्वघोषणा पत्र संलग्न छ।', required: true },
          { id: 'check-5', text: 'खरिद प्रक्रियामा स्वार्थ नबाझिएको (No Conflict of Interest) सम्बन्धी स्वघोषणा पत्र संलग्न छ।', required: true },
          { id: 'check-6', text: 'खरिद नियमावली नियम ६५(४घ) बमोजिम नेपालभर ५ वटा भन्दा बढी चालू खरिद सम्झौता नरहेको स्वघोषणा छ।', required: true },
        ],
      },
      {
        id: 'sec-financial',
        title: '२. बैंक जमानत तथा वित्तीय स्रोत (Bank Guarantee & Credit Line)',
        items: [
          { id: 'check-7', text: 'बोलपत्र जमानत (Bid Security) तोकिएको हुबहु ढाँचामा वाणिज्य बैंकबाट जारी भएको छ।', required: true },
          { id: 'check-8', text: 'बैंक ग्यारेन्टीको म्याद बोलपत्रको मान्य अवधिभन्दा कम्तीमा ३० दिन बढी (९० दिन भए १२० दिन) छ।', required: true },
          { id: 'check-9', text: 'ग्यारेन्टीमा हितग्राही कार्यालयको नाम, ठेक्का नं. र रकम अङ्क र अक्षर दुवैमा स्पष्ट मिलेको छ।', required: true },
          { id: 'check-10', text: 'नगद धरौटी जम्मा गरिएको भए कार्यालयको आधिकारिक धरौटी खातामा दाखिला भएको सक्कल बैंक भौचर छ।', required: true },
          { id: 'check-11', text: 'ऋण सुविधा प्रतिबद्धता पत्र (Line of Credit - Form FIN-5) वाणिज्य बैंकबाट बिना सर्त जारी छ।', required: false },
          { id: 'check-12', text: 'विदेशी बैंकको जमानत भएमा नेपालको क वर्गको वाणिज्य बैंकबाट जारी काउन्टर ग्यारेन्टी संलग्न छ।', required: false },
        ],
      },
      {
        id: 'sec-jv-poa',
        title: '३. संयुक्त उपक्रम (JV) र अख्तियारी (Power of Attorney)',
        items: [
          { id: 'check-13', text: 'कम्पनीको सञ्चालक समिति वा साझेदारहरूबाट अधिकृत प्रतिनिधिलाई दिइएको वारिसनामा (Power of Attorney) छ।', required: true },
          { id: 'check-14', text: 'वारिसनामा पत्रमा सम्बन्धित ठेक्काको स्पष्ट नाम, ठेक्का नं. र हस्ताक्षरकर्ताको दस्तखत प्रमाणित छ।', required: true },
          { id: 'check-15', text: 'JV भएमा मूल साझेदार (Lead Partner) को शेयर कम्तीमा ४०% र अन्य साझेदारको कम्तीमा २५% छ (नियम ३१ख)।', required: false },
          { id: 'check-16', text: 'JV सम्झौतामा साझेदारहरू संयुक्त तथा व्यक्तिगत रूपमा (Jointly & Severally) पूर्ण जिम्मेवार रहने सर्त छ।', required: false },
          { id: 'check-17', text: 'JV का सबै साझेदारहरूको कम्पनी दर्ता, कर चुक्ता, र कालोसूची नपरेको स्वघोषणा छुट्टाछुट्टै संलग्न छ।', required: false },
          { id: 'check-18', text: 'संयुक्त उपक्रमको नाम (JV Name) र आधिकारिक लेटरप्याड/छाप बोलपत्र फारामहरूमा स्पष्ट प्रयोग भएको छ।', required: false },
        ],
      },
      {
        id: 'sec-technical-price',
        title: '४. प्राविधिक तथा आर्थिक प्रस्ताव (Technical & BOQ)',
        items: [
          { id: 'check-19', text: 'प्राविधिक बोलपत्र पत्र (Letter of Technical Bid) मा अधिकृत व्यक्तिको हस्ताक्षर र कम्पनीको छाप छ।', required: true },
          { id: 'check-20', text: 'आर्थिक बोलपत्र पत्र (Letter of Price Bid) मा कबुल अङ्क अङ्क र अक्षर दुवैमा मिलेको छ।', required: true },
          { id: 'check-21', text: 'BOQ का कुनै पनि आइटम खाली नराखी सबै आइटममा दररेट स्पष्ट भरिएको छ (दर ० वा खाली छैन)।', required: true },
          { id: 'check-22', text: 'यदि कुनै छुट (Discount) प्रस्ताव गरिएको भए बोलपत्र पत्रमै प्रतिशत र रकम स्पष्ट खुलाइएको छ।', required: false },
          { id: 'check-23', text: 'माग गरिएका मुख्य जनशक्ति (Key Personnel) र निर्माण उपकरणहरूको विवरण तालिका रितपूर्वक भरिएको छ।', required: true },
          { id: 'check-24', text: 'मालसामानको हकमा उत्पादकको आधिकारिकता पत्र (Manufacturer Authorization) र क्याटलग छ।', required: false },
        ],
      },
      {
        id: 'sec-egp-upload',
        title: '५. e-GP पोर्टल सबमिसन तथा डिजिटल हस्ताक्षर (e-GP & Token)',
        items: [
          { id: 'check-25', text: 'अपलोड गरिने सबै फाइलहरू PDF फर्म्याटमा र पढ्न सकिने गरी स्पष्ट स्क्यान गरिएका छन् (साइज लिमिटभित्र)।', required: true },
          { id: 'check-26', text: 'डिजिटल हस्ताक्षर (Token / DSC) को म्याद बाँकी रहेको र कम्प्युटरमा PKI कम्पोनेन्ट परीक्षण गरिएको छ।', required: true },
          { id: 'check-27', text: 'दुई खाम (1S2E) बोलपत्रमा प्राविधिक खाममा मूल्य (Price) को कुनै अंश नपरेको यकिन गरिएको छ।', required: true },
          { id: 'check-28', text: 'e-GP बाट प्राप्त मूल BOQ एक्सल फाइलको फर्म्याट र नाम नफेरी दररेट सेभ गरी अपलोड गरिएको छ।', required: true },
          { id: 'check-29', text: 'अन्तिम बिड सबमिट गरी बिड सबमिसन ह्यास (Submission Hash Slip) र कन्फर्मेसन डाउनलोड गरिएको छ।', required: true },
          { id: 'check-30', text: 'बोलपत्र संशोधन वा फिर्ता गर्नुपर्ने भए बोलपत्र पेश गर्ने अन्तिम समय अगावै e-GP बाट गरिएको छ।', required: false },
        ],
      },
    ],
    []
  );

  const totalCheckItems = useMemo(
    () => checklistSections.reduce((sum, sec) => sum + sec.items.length, 0),
    [checklistSections]
  );

  const checkedCount = useMemo(
    () => Object.values(checkedItems).filter(Boolean).length,
    [checkedItems]
  );

  const checklistProgressPercent = Math.round(
    (checkedCount / Math.max(totalCheckItems, 1)) * 100
  );

  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('bidder_prebid_checklist_30', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const handleResetChecklist = () => {
    if (window.confirm('के तपाईं चेकलिस्टका सम्पूर्ण टिकहरू हटाएर रिसेट गर्न चाहनुहुन्छ?')) {
      setCheckedItems({});
      try {
        localStorage.removeItem('bidder_prebid_checklist_30');
      } catch { }
    }
  };

  // -------------------------------------------------------------
  // 3. SBD Repository Browser State
  // -------------------------------------------------------------
  const [sbdCategoryFilter, setSbdCategoryFilter] = useState<string>('all');
  const [sbdSearchQuery, setSbdSearchQuery] = useState<string>('');
  const [selectedSbdForModal, setSelectedSbdForModal] = useState<SbdDocumentItem | null>(null);

  const filteredSbds = useMemo(() => {
    return SBD_DOCUMENTS_LIST.filter((doc) => {
      const matchesCat = sbdCategoryFilter === 'all' || doc.category === sbdCategoryFilter;
      const q = sbdSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        doc.titleNepali.toLowerCase().includes(q) ||
        doc.titleEnglish.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        doc.biddingMethod.toLowerCase().includes(q) ||
        doc.thresholdNepali.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [sbdCategoryFilter, sbdSearchQuery]);

  // Precedent Cases state
  const [precedentSearch, setPrecedentSearch] = useState<string>('');
  const filteredPrecedents = useMemo(() => {
    const q = precedentSearch.trim().toLowerCase();
    if (!q) return BIDDER_PRECEDENT_CASES;
    return BIDDER_PRECEDENT_CASES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.applicant.toLowerCase().includes(q) ||
        c.respondent.toLowerCase().includes(q) ||
        c.keyLegalIssue.toLowerCase().includes(q) ||
        c.lessonForBidders.toLowerCase().includes(q)
    );
  }, [precedentSearch]);

  // -------------------------------------------------------------
  // 4. Fatal Bidder Mistakes & Risk Auditor State
  // -------------------------------------------------------------
  const [mistakeCategoryFilter, setMistakeCategoryFilter] = useState<string>('all');
  const [mistakeSearchQuery, setMistakeSearchQuery] = useState<string>('');
  const [expandedMistakeId, setExpandedMistakeId] = useState<string | null>('mistake-bg-1day-short');

  // Bid Security Validity Calculator State
  const [bgSubmissionDays, setBgSubmissionDays] = useState<number>(90); // बोलपत्र मान्य अवधि: ९० वा १२० दिन
  const [bgEstimateAmt, setBgEstimateAmt] = useState<number>(25000000); // रु २ करोड ५० लाख
  const [bgSecurityRate, setBgSecurityRate] = useState<number>(2.5); // २.५%

  // Calculated values for Bid Security
  const bgCalculations = useMemo(() => {
    const requiredSecurityDays = bgSubmissionDays + 30; // नियम ५० अनुसार +३० दिन
    const safeRecommendedDays = bgSubmissionDays + 35; // १ दिनको पासोबाट जोगिन +५ दिन थप
    const minSecurityAmount = (bgEstimateAmt * bgSecurityRate) / 100;
    return {
      requiredSecurityDays,
      safeRecommendedDays,
      minSecurityAmount,
    };
  }, [bgSubmissionDays, bgEstimateAmt, bgSecurityRate]);

  // Risk Audit Checklist State
  const [auditCheckedItems, setAuditCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bidder_prebid_risk_audit');
      if (saved) return JSON.parse(saved);
    } catch { }
    return {
      'audit-1': true,
      'audit-2': true,
      'audit-3': true,
      'audit-4': true,
    };
  });

  const handleToggleAudit = (id: string) => {
    setAuditCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('bidder_prebid_risk_audit', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const handleResetAudit = () => {
    if (window.confirm('के तपाईं जोखिम अडिटका सबै चेकहरू रिसेट गर्न चाहनुहुन्छ?')) {
      setAuditCheckedItems({});
      try {
        localStorage.removeItem('bidder_prebid_risk_audit');
      } catch { }
    }
  };

  const auditCompletedCount = useMemo(() => {
    return PRE_BID_RISK_AUDIT_ITEMS.filter((item) => auditCheckedItems[item.id]).length;
  }, [auditCheckedItems]);

  const auditPercent = useMemo(() => {
    return Math.round((auditCompletedCount / PRE_BID_RISK_AUDIT_ITEMS.length) * 100);
  }, [auditCompletedCount]);

  const auditRiskLevel = useMemo(() => {
    if (auditCompletedCount === PRE_BID_RISK_AUDIT_ITEMS.length) return 'safe';
    if (auditCompletedCount >= 7) return 'medium';
    return 'high';
  }, [auditCompletedCount]);

  const filteredFatalMistakes = useMemo(() => {
    return FATAL_BIDDER_MISTAKES.filter((m) => {
      const matchesCat = mistakeCategoryFilter === 'all' || m.category === mistakeCategoryFilter;
      const q = mistakeSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.subtleMistake.toLowerCase().includes(q) ||
        m.legalConsequence.toLowerCase().includes(q) ||
        m.legalReference.toLowerCase().includes(q) ||
        m.safePreventionProtocol.toLowerCase().includes(q) ||
        m.precedentReference.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [mistakeCategoryFilter, mistakeSearchQuery]);

  // Dynamic top banner replacing main banner based on activeSubTab
  const renderTopBanner = () => {
    const renderSwitchBtn = () => {
      if (!onSwitchToEntityMode) return null;
      return (
        <button
          type="button"
          onClick={onSwitchToEntityMode}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          title="सार्वजनिक निकाय मोडमा फर्कनुहोस्"
        >
          <Building2 className="w-4 h-4 text-emerald-300" />
          <span>सार्वजनिक निकाय मोडमा जानुहोस्</span>
        </button>
      );
    };

    if (activeSubTab === 'goods-procurement' || activeSubTab === 'goods-guide') {
      return (
        <div className="bg-gradient-to-r from-blue-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1.5 truncate">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="truncate">मालसामान खरिद तथा आपूर्ति सहयोगी • Goods Procurement & Supply Hub</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">
                मालसामान खरिद (खुला बोलपत्र, शिलबन्दी दरभाउ र सोझै खरिद)
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/90 mt-1 leading-relaxed line-clamp-2">
                सार्वजनिक खरिद ऐन २०६३, नियमावली २०६४ (१६औँ संशोधन) र PPMO SBDs अनुसार आपूर्तिकर्ताको योग्यता स्व-मूल्याङ्कन, MAF नियम, स्पेसिफिकेसन कम्प्लायन्स, स्वदेशी उत्पादनलाई प्राथमिकता (१५%), र डेलिभरी/LD क्याल्कुलेटर।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('forms')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>मालसामान SBD फारामहरू (Sec IV)</span>
              </button>
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={goodsImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/35 via-teal-900/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-teal-900 via-teal-900/40 to-transparent" />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'catalogue-shopping') {
      return (
        <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1.5 truncate">
                <PackageCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">क्याटलग सपिङ विशेष कर्नर • Catalogue Shopping Hub (PPA दफा ४१क र PPR नियम ८५क)</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">
                क्याटलग सपिङ विधिबाट मालसामान खरिद तथा आपूर्ति
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed line-clamp-2">
                उत्पादक तथा अधिकृत बिक्रेताहरूका लागि क्याटलग सूचीकरण प्रक्रिया, अधिकतम छुट रणनीति क्याल्कुलेटर, खरिद आदेश कार्यान्वयन, आपूर्ति समयसीमा, र निरीक्षण तथा दाखिला प्रक्रिया।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('forms')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>क्याटलग सूचीकरण फाराम (SBD Sec IV)</span>
              </button>
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={catalogueImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/35 via-emerald-900/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-emerald-900 via-emerald-900/40 to-transparent" />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'icb-procurement') {
      return (
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1.5 truncate">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">अन्तर्राष्ट्रिय खुला बोलपत्र • International Competitive Bidding (ICB Guide)</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">
                अन्तर्राष्ट्रिय बोलपत्र (ICB Goods/Works), Incoterms 2020 र Local Agent पोर्टल
              </h1>
              <p className="text-xs sm:text-sm text-cyan-100/90 mt-1 leading-relaxed line-clamp-2">
                सार्वजनिक खरिद ऐन २०६३ दफा १४, १५, नियमावली नियम ३१ङ, ३९ र PPMO ICB SBD अनुसार ७-चरणको खरिद चक्र, ११ वटा Incoterms, स्थानीय एजेन्टका दायित्व, १५-चरणको मूल्याङ्कन र अन्तरक्रियात्मक क्विज।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={icbImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/35 via-indigo-900/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-indigo-900 via-indigo-900/40 to-transparent" />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'consulting-services' || activeSubTab === 'services-guide') {
      return (
        <div className="bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300 mb-1.5 truncate">
                <Award className="w-4 h-4 text-purple-300 shrink-0" />
                <span className="truncate">परामर्श सेवा विशेष कर्नर • Consulting Services Hub (PPA दफा २९-३८ र PPR नियम ६९-८०)</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">
                परामर्श सेवा खरिद (EOI सर्टलिस्टिङ, RFP, QCBS, QBS, LCS & मुख्य विज्ञ CV)
              </h1>
              <p className="text-xs sm:text-sm text-purple-100/90 mt-1 leading-relaxed line-clamp-2">
                सार्वजनिक निकायहरूमा बौद्धिक तथा व्यावसायिक सेवा प्रदान गर्ने परामर्शदाताहरूका लागि EOI योग्यता परीक्षण, QCBS/LCS/FBS छनौट विधि क्याल्कुलेटर, TECH-4 कार्यविधि, र TECH-6 विज्ञ CV प्रमाणीकरण नियमहरू।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('forms')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>RFP फारामहरू (TECH-4, TECH-6)</span>
              </button>
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={consultingImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/35 via-purple-900/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-purple-900 via-purple-900/40 to-transparent" />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'non-consulting-services') {
      return (
        <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1.5 truncate">
                <Users className="w-4 h-4 text-rose-300 shrink-0" />
                <span className="truncate">गैर-परामर्श सेवा सहयोगी • Non-Consulting Services Hub (सुरक्षा, सरसफाइ, हाउसकिपिङ, लजिस्टिक)</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">
                गैर-परामर्श सेवा खरिद (श्रम ऐन २०७४, २०% SSF, न्यूनतम पारिश्रमिक र सेवा शुल्क)
              </h1>
              <p className="text-xs sm:text-sm text-rose-100/90 mt-1 leading-relaxed line-clamp-2">
                सुरक्षा गार्ड, सरसफाइ, कार्यालय सहयोग, चालक तथा लजिस्टिक सेवा प्रदायकहरूका लागि नेपाल सरकारको न्यूनतम पारिश्रमिक (रु. १७,३००), रोजगारदाता २०% SSF लागत, सेवा शुल्क (Overhead) क्याल्कुलेटर, र योग्यता स्व-मूल्याङ्कन।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('checklist')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>सेवा सम्झौता चेकलिस्ट</span>
              </button>
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={nonConsultingImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/35 via-rose-950/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-rose-950 via-rose-950/40 to-transparent" />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'fatal-mistakes') {
      return (
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1.5 truncate">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="truncate">बोलपत्रदाता सचेतना केन्द्र • Fatal Bid Disqualification Pitfalls & Risk Auditor</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">
                बोलपत्र बदर (Non-Responsive) हुनसक्ने १६ घातक गल्तीहरू र पूर्व-पेश जोखिम अडिट
              </h1>
              <p className="text-xs sm:text-sm text-rose-100/90 mt-1 leading-relaxed line-clamp-2">
                हेर्दा सामान्य लाग्ने तर बोलपत्रलाई सिधै रद्द गराउने कानूनी, प्राविधिक र प्रक्रियागत छिद्रहरूको विस्तृत विश्लेषण, बैंक ग्यारेन्टी म्याद क्याल्कुलेटर, र बिड सबमिट गर्नुअघिको अनिवार्य १०-बुँदे जोखिम अडिट।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 border border-white/20 text-rose-100 flex items-center gap-1.5 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>१५ स्थापित कानूनी पासोहरू</span>
              </span>
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={riskImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-950/35 via-red-900/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-red-900 via-red-900/40 to-transparent" />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'forms') {
      return (
        <div className="bg-gradient-to-r from-blue-900 via-[#173b63] to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1 truncate">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">PPMO Standard Bidding Documents (SBD) • Section IV</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">
                बोलपत्र फाराम तथा आधिकारिक ढाँचा जेनेरेटर
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1.5 leading-relaxed line-clamp-2">
                सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) का SBDs (Works, Goods, Services, SQ) अनुसार बोलपत्रदाताहरूले पेश गर्नुपर्ने फारामहरू आफ्ना विवरण भरी तुरुन्तै प्रिन्ट वा कपी गर्नुहोस्।
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="text-xs bg-white/10 border border-white/20 text-blue-100 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-300" />
                २५+ आधिकारिक फारामहरू उपलब्ध
              </span>
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={generatorImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/35 via-[#173b63]/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#173b63] via-[#173b63]/40 to-transparent" />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'ration-procurement') {
      return (
        <div className="bg-gradient-to-r from-amber-800 via-orange-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5 truncate">
                <UtensilsCrossed className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="truncate">विशेष खरिद मार्गदर्शन • Ration Procurement Guide</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
                <span className="truncate">राशन खरिद तथा सिदा आपूर्ति व्यवस्था</span>
                <span className="text-xs bg-amber-600/80 text-white px-2.5 py-0.5 rounded-full font-medium shrink-0">
                  ऐन दफा ४२ • नियम ८८–९३
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 mt-1 leading-relaxed line-clamp-2">
                नेपाली सेना, नेपाल प्रहरी, सशस्त्र प्रहरी बल, कारागारका कैदीबन्दी, अस्पतालका बिरामी र पशुपन्छीका लागि खाद्यान्न आपूर्ति सम्बन्धी विशेष कानुनी व्यवस्था, वार्षिक चक्र (माघ १ देखि लागू), २५% गोदाम पेश्की र नियम ८९(६) बमोजिम १००% बढी दररेटमा बोलपत्र रद्द हुने जोखिम सिमुलेटर।
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1.5 rounded-xl text-center">
                <span className="text-xs text-amber-200 block font-medium">वार्षिक खरिद चक्र (माघ १–पौष मसान्त)</span>
                <span className="text-[11px] text-amber-300 block mt-0.5 font-bold">मूल्यवृद्धि नदिइने (Fixed Price)</span>
              </div>
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={rationImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-800/35 via-orange-900/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-orange-900 via-orange-900/40 to-transparent" />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'bid-no-bid') {
      return (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden min-h-[162px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1.5 truncate">
                <Target className="w-4 h-4 shrink-0" />
                <span className="truncate">रणनीतिक निर्णय उपकरण • Bid/No-Bid Decision Matrix</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
                <span className="truncate">बोलपत्र हाल्ने कि नहाल्ने निर्णय विश्लेषक</span>
                <span className="text-xs bg-indigo-700 text-white px-2.5 py-0.5 rounded-full font-medium shrink-0">
                  PPA Sec 10, 25 & SBD Framework
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 leading-relaxed line-clamp-2">
                हरेक बोलपत्र हाल्नैपर्छ भन्ने छैन। योग्यता, बैंक सीमा, चालू ५ ठेक्का सीमा, लिक्विडेटेड ड्यामेज (LD), नगद प्रवाह र नाफा मार्जिनको वैज्ञानिक १०-सूचकांक विश्लेषण गरी आफ्नो स्रोत सुरक्षित राख्नुहोस्।
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1.5 rounded-xl text-center shrink-0 min-w-[120px]">
                <span className="text-xs text-indigo-200 block font-medium">१०-सूचकांक म्याट्रिक्स</span>
                <span className="text-[11px] text-indigo-300 block mt-0.5 font-bold">Go / No-Bid सिमुलेटर</span>
              </div>
              {renderSwitchBtn()}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            }}
          >
            <img
              src={bidNoBidImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/35 via-indigo-950/50 to-slate-900/65" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-indigo-950 via-indigo-950/40 to-transparent" />
          </div>
        </div>
      );
    }

    // Default Main Banner for 'overview' and all other tabs
    const getDefaultBannerImage = () => {
      switch (activeSubTab) {
        case 'eligibility':
          return bidderDedicatedImage;
        case 'checklist':
          return checklistImage;
        case 'egp-guide':
          return egpImage;
        case 'review':
          return reviewImage;
        case 'sbd-hub':
          return sampleImage;
        case 'overview':
        default:
          return publicAImage;
      }
    };

    return (
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden min-h-[162px] flex flex-col justify-center">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">बोलपत्रदाता विशेष कर्नर • Bidder's Dedicated Portal</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
              <span>सार्वजनिक खरिद बोलपत्रदाता सहयोगी</span>
              <span className="text-xs bg-emerald-700/80 text-white px-2.5 py-0.5 rounded-full font-medium shrink-0">
                Bidder Mode
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed line-clamp-2">
              निर्माण व्यवसायी, आपूर्तिकर्ता तथा परामर्शदाताहरूका लागि योग्यता स्व-मूल्याङ्कन, SBD का फाराम जेनेरेटर, e-GP बिडिङ गाइड, र पुनरावलोकन सम्बन्धी एकीकृत सहयोगी सुविधा।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {renderSwitchBtn()}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
          }}
        >
          <img
            src={getDefaultBannerImage()}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/35 via-teal-900/50 to-slate-900/65" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-teal-900 via-teal-900/40 to-transparent" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Dynamic Header Replacing Main Banner by Active Sub-Tab */}
      {renderTopBanner()}

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'overview', label: 'ड्यासबोर्ड मुख्य पृष्ठ', icon: Layers },
            { id: 'eligibility', label: 'के म योग्य छु? (निर्माण कार्य)', icon: Calculator },
            { id: 'bid-no-bid', label: 'बिड/नो-बिड विश्लेषक (Strategy)', icon: Target },
            { id: 'goods-procurement', label: 'मालसामान खरिद (Goods)', icon: ShoppingBag },
            { id: 'catalogue-shopping', label: 'क्याटलग सपिङ (Catalogue)', icon: PackageCheck },
            { id: 'ration-procurement', label: 'राशन खरिद विशेष गाइड (Ration)', icon: UtensilsCrossed },
            { id: 'icb-procurement', label: 'अन्तर्राष्ट्रिय बोलपत्र (ICB Guide)', icon: Globe },
            { id: 'consulting-services', label: 'परामर्श सेवा (Consulting)', icon: Award },
            { id: 'non-consulting-services', label: 'गैर-परामर्श सेवा (Non-Consulting)', icon: Users },
            { id: 'fatal-mistakes', label: 'घातक गल्तीहरू र जोखिम अडिट', icon: ShieldAlert },
            { id: 'forms', label: 'बोलपत्र फाराम जेनेरेटर (SBD Sec IV)', icon: FileText },
            { id: 'checklist', label: 'बिड पेश गर्नुपूर्वको ३०-बुँदे चेकलिस्ट', icon: CheckSquare },
            { id: 'egp-guide', label: 'e-GP बिडिङ गाइड (निर्देशिका)', icon: FileCheck2 },
            { id: 'review', label: 'पुनरावलोकन तथा उजुरी (दफा ४७/४९)', icon: Scale },
            { id: 'sbd-hub', label: 'SBD कागजात भण्डार (Download)', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats & Action Cards: Key Bidder Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Card 1: Works Eligibility */}
            <div
              onClick={() => setActiveSubTab('eligibility')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                योग्यता स्व-मूल्याङ्कन (निर्माण कार्य)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                AACT, समान प्रकृतिको काम, बिड क्षमता र ५ ठेक्काको सीमा जाँच्नुहोस्।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700">
                <span>हिसाब गर्नुहोस्</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card: Bid / No-Bid Analyzer */}
            <div
              onClick={() => setActiveSubTab('bid-no-bid')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">
                बिड / नो-बिड रणनीतिक विश्लेषक
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                १०-सूचकांक आधारमा बोलपत्र हाल्ने कि नहाल्ने वैज्ञानिक निर्णय र भाग १४.२ मूल्य निर्धारण सूत्र।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-indigo-700">
                <span>रणनीतिक मूल्याङ्कन</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Goods Procurement */}
            <div
              onClick={() => setActiveSubTab('goods-procurement')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                मालसामान खरिद (Goods)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                आपूर्तिकर्ता योग्यता स्व-मूल्याङ्कन, MAF नियम, स्पेसिफिकेसन कम्प्लायन्स, स्वदेशी प्राथमिकता र LD।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-teal-700">
                <span>योग्यता तथा नियमहरू</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Catalogue Shopping */}
            <div
              onClick={() => setActiveSubTab('catalogue-shopping')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                क्याटलग सपिङ (Catalogue)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                दफा ४१(क) क्याटलग सूचीकरण, अधिकतम छुट रणनीति, खरिद आदेश र दाखिला प्रतिवेदन।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700">
                <span>छुट क्याल्कुलेटर र गाइड</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card: Ration Procurement */}
            <div
              onClick={() => setActiveSubTab('ration-procurement')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                राशन खरिद विशेष गाइड (Ration)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                सुरक्षा निकाय र अस्पताल सिदा आपूर्ति, माघ १ चक्र, २५% गोदाम पेश्की र १००% बढी दर सिमुलेटर।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-amber-700">
                <span>दररेट तथा जोखिम परीक्षण</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card: ICB Procurement Hub */}
            <div
              onClick={() => setActiveSubTab('icb-procurement')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                अन्तर्राष्ट्रिय बोलपत्र (ICB Guide)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                विदेशी बोलपत्रदाता, Local Agent का दायित्व, Incoterms 2020 र १५-चरणको मूल्याङ्कन।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-cyan-700">
                <span>ICB गाइड तथा चेकलिस्ट</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Consulting Services */}
            <div
              onClick={() => setActiveSubTab('consulting-services')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition-colors">
                परामर्श सेवा (Consulting)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                EOI सर्टलिस्टिङ स्व-मूल्याङ्कन, RFP प्राविधिक प्रस्ताव, QCBS संयुक्त स्कोर र विज्ञ CV।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-purple-700">
                <span>QCBS स्कोर र EOI गाइड</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Non-Consulting Services */}
            <div
              onClick={() => setActiveSubTab('non-consulting-services')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-800 transition-colors">
                गैर-परामर्श सेवा (Non-Consulting)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                सुरक्षा, सरसफाइ, न्यूनतम पारिश्रमिक (रु. १७,३००), २०% SSF लागत र सेवा शुल्क क्याल्कुलेटर।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-rose-700">
                <span>SSF र पारिश्रमिक हिसाब</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Fatal Mistakes & Risk Audit */}
            <div
              onClick={() => setActiveSubTab('fatal-mistakes')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-800 transition-colors">
                घातक गल्तीहरू र जोखिम अडिट
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                १ दिन म्याद कम हुने, ससर्त FIN-5, e-GP पासवर्ड लगायत १६ घातक पासो र अडिट।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-rose-700">
                <span>जोखिम जाँच्नुहोस् (१५ पासोहरू)</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Forms Generator */}
            <div
              onClick={() => setActiveSubTab('forms')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                बोलपत्र फाराम जेनेरेटर (SBD)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Letter of Bid, MAF, JV, Bid Bond, FIN-5, क्याटलग प्रस्ताव लगायत १९ फारामहरू।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-blue-700">
                <span>ढाँचा भर्नुहोस् र छाप्नुहोस्</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Pre-Bid 30-Point Checklist */}
            <div
              onClick={() => setActiveSubTab('checklist')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                पूर्व-तयारी ३०-बुँदे चेकलिस्ट
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                बिड गैर-जिम्मेवार हुनबाट जोगिन ३० वटा अनिवार्य कानूनी बुँदाहरू र नजिरहरू।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-amber-700">
                <span>रुजु गर्नुहोस् ({checklistProgressPercent}%)</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: SBD Downloads */}
            <div
              onClick={() => setActiveSubTab('sbd-hub')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition-colors">
                PPMO SBD कागजात भण्डार
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Works, Goods, Services, SQ का १६ आधिकारिक Word/PDF कागजातहरू।
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-purple-700">
                <span>कागजात डाउनलोड गर्नुहोस्</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Bidder Essential Highlights: 16th Amendment & Rule 65 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>१६औँ संशोधन अनुसार बोलपत्रदाताले ध्यान दिनुपर्ने मुख्य कानूनी प्रावधानहरू</span>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    १
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">५ वटा चालू खरिद सम्झौताको सीमा (नियम ६५(४घ))</strong>
                    नेपालभर ५ वटा भन्दा बढी चालू ठेक्का भएका निर्माण व्यवसायीले नयाँ खरिद सम्झौता गर्न पाउने छैनन्। बोलपत्रसाथ ५ वटा भन्दा बढी चालू सम्झौता नरहेको स्वघोषणा पेश गर्नुपर्छ।
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    २
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">रु ५ करोडसम्म योग्यता बिना (नियम ६५(१))</strong>
                    रु ५ करोडसम्मको निर्माण कार्यमा योग्यताका आधार (AACT, समान काम) नतोकी योग्यता बिनाको खुला प्रतिस्पर्धा गर्न सकिने व्यवस्था।
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ३
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">१५% भन्दा बढी घटेमा अतिरिक्त कार्यसम्पादन जमानत (नियम ६५(४))</strong>
                    लागत अनुमान भन्दा १५% भन्दा बढी घटेको (८५% भन्दा कम) खण्डमा सो फरक रकमको ५०% बराबर थप कार्यसम्पादन जमानत बुझाउनु पर्नेछ।
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>बोलपत्र बदर (Non-Responsive) हुने मुख्य ५ वटा सामान्य गल्तीहरू</span>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/80 text-red-950">
                  <strong className="font-semibold block text-red-900">१. बैंक जमानतको म्याद १ दिन भए पनि कम हुनु</strong>
                  बोलपत्रको मान्य अवधि (Valid Period) भन्दा कम्तीमा ३० दिन बढी म्याद नभएको बैंक ग्यारेन्टी पेश भएमा बोलपत्र सिधै गैर-जिम्मेवार भई बदर हुन्छ।
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-950">
                  <strong className="font-semibold block text-amber-900">२. JV मा Lead Partner वा Member को शेयर नपुग्नु</strong>
                  नियम ३१ख अनुसार Lead Partner को न्यूनतम ४०% र अन्य साझेदारको कम्तीमा २५% शेयर हुनुपर्छ। सो भन्दा कम भएमा जे.भी. अयोग्य हुन्छ।
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800">
                  <strong className="font-semibold block text-slate-900">३. अद्यावधिक कर चुक्ता (Tax Clearance) पेश नहुनु</strong>
                  म्याद नाघेको वा अघिल्लो वर्षको कर चुक्ता पेश भएमा र म्यादभित्र पेश गरेको प्रमाण नभएमा बोलपत्र प्राविधिक रूपमै अनुत्तीर्ण हुन्छ।
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800">
                  <strong className="font-semibold block text-slate-900">४. BOQ मा दररेट खाली छोडिनु वा दररेट अक्षरमा नखुल्नु</strong>
                  BOQ को कुनै आइटममा दररेट नभरी छाड्दा वा अङ्क र अक्षरमा फरक परी गम्भीर द्विविधा सिर्जना हुँदा मूल्याङ्कनमा समस्या पर्छ।
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: ELIGIBILITY & CAPACITY SELF-ASSESSMENT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'eligibility' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  बोलपत्रदाता योग्यता तथा क्षमता स्व-मूल्याङ्कन क्याल्कुलेटर
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  SBD Section III (Evaluation & Qualification Criteria) र खरिद नियमावली नियम ६५ अनुसार आफ्नो योग्यता जाँच्नुहोस्
                </p>
              </div>

              <div
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${overallEligibility
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
              >
                {overallEligibility ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>तपाईं यस बोलपत्रमा योग्य देखिनुहुन्छ</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>केही शर्तहरूमा ध्यान दिनुपर्ने देखिन्छ</span>
                  </>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  लागत अनुमान रकम (भ्याट बाहेक रु.)
                </label>
                <input
                  type="number"
                  value={calcEstimateAmount}
                  onChange={(e) => setCalcEstimateAmount(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {calcEstimateAmount.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  तपाईंको प्रस्तावित कबुल रकम (भ्याट बाहेक रु.)
                </label>
                <input
                  type="number"
                  value={calcBidAmount}
                  onChange={(e) => setCalcBidAmount(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {calcBidAmount.toLocaleString('ne-NP')} (लागत अनुमान भन्दा{' '}
                  {percentBelowEstimate.toFixed(1)}% {percentBelowEstimate >= 0 ? 'घटेको' : 'बढेको'})
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">
                    हाल चलिरहेका (Ongoing) ठेक्काहरूको संख्या
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFiveContractRules(!showFiveContractRules)}
                    className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    नियम हेर्नुहोस्
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={ongoingContractsCount}
                  onChange={(e) => setOngoingContractsCount(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  अधिकतम सीमा: ५ वटा (१६औँ संशोधन नियम ६५(४घ))
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  माग गरिएको न्यूनतम वार्षिक कारोबार (AACT रु.)
                </label>
                <input
                  type="number"
                  value={calcAactRequired}
                  onChange={(e) => setCalcAactRequired(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {calcAactRequired.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  समान प्रकृतिको कामको आवश्यकता (रु.)
                </label>
                <input
                  type="number"
                  value={similarWorkRequired}
                  onChange={(e) => setSimilarWorkRequired(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {similarWorkRequired.toLocaleString('ne-NP')} (सामान्यतया ८०%)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  तपाईंले सम्पन्न गरेको १ ठूलो कामको रकम (रु.)
                </label>
                <input
                  type="number"
                  value={maxCompletedSimilarWork}
                  onChange={(e) => setMaxCompletedSimilarWork(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {maxCompletedSimilarWork.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>

            {/* 5 Ongoing Contracts Detailed Guide Drawer */}
            {showFiveContractRules && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs space-y-2">
                <div className="font-bold text-sm flex items-center gap-1.5 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>५ वटा चालू ठेक्काको सीमा सम्बन्धी १६औँ संशोधनका मुख्य व्यवस्थाहरू:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
                  <li><strong>गणना हुने ठेक्का:</strong> रु ५ करोडभन्दा माथिका सार्वजनिक निकायहरूसँग भएका सम्पूर्ण चालू सम्झौताहरू।</li>
                  <li><strong>गणना नहुने ठेक्का:</strong> रु ५ करोड मुनिका खरिद सम्झौताहरू यस ५ वटाको सीमाभित्र गणना हुँदैनन् (नियम ६५(४घ) को प्रतिबन्धात्मक वाक्यांश)।</li>
                  <li><strong>सम्पन्न भएका काम:</strong> कार्यसम्पन्न प्रतिवेदन (Work Completion Certificate) जारी भइसकेका र केवल डिफेक्ट लायबिलिटी (DLP) मा रहेका ठेक्का गणना हुँदैनन्।</li>
                  <li><strong>गलत स्वघोषणा गरेमा:</strong> बोलपत्र रद्द हुनुका साथै धरौटी जफत हुने र १ देखि ३ वर्षसम्म कालोसूचीमा सिफारिस गरिनेछ।</li>
                </ul>
              </div>
            )}

            {/* Turnovers for AACT (Past 5-7 Years) */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  विगतका आर्थिक वर्षहरूको कारोबार रकम (उत्कृष्ट ३ वर्ष स्वतः छनौट हुनेछ):
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">वर्ष संख्या:</span>
                  {[5, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTurnoverCount(num)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${turnoverCount === num
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      {num} वर्ष
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {activeTurnovers.map((amt, idx) => {
                  const isTop3 = best3Indices.has(idx);
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all ${isTop3
                        ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>वर्ष {idx + 1}</span>
                        {isTop3 && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-sm">
                            Best 3
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        value={amt}
                        onChange={(e) => {
                          const next = [...turnoverYears];
                          next[idx] = Number(e.target.value);
                          setTurnoverYears(next);
                        }}
                        className="w-full text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bid Capacity Sub-Inputs */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                <span>बोलपत्र क्षमता (Assessed Available Bid Capacity Formula: A * N * 3 - B)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">
                    विगत ५/१० वर्षको अधिकतम वार्षिक कारोबार (A):
                  </label>
                  <div className="text-xs font-bold text-slate-900 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    रु. {maxA.toLocaleString('ne-NP')}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">
                    ठेक्काको निर्माण अवधि वर्षमा (N):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={contractDurationN}
                    onChange={(e) => setContractDurationN(Number(e.target.value))}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">
                    चालू ठेक्काहरूमा बाँकी कामको दायित्व रकम (B रु.):
                  </label>
                  <input
                    type="number"
                    value={remainingLiabilityB}
                    onChange={(e) => setRemainingLiabilityB(Number(e.target.value))}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Results Grid Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. AACT Result */}
              <div
                className={`p-4 rounded-xl border ${isAactEligible
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-red-50/60 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>१. औसत वार्षिक कारोबार (AACT)</span>
                  {isAactEligible ? (
                    <span className="text-emerald-700 font-bold">योग्य ✓</span>
                  ) : (
                    <span className="text-red-700 font-bold">अयोग्य ✗</span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  रु. {Math.round(avgBest3Turnover).toLocaleString('ne-NP')}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  न्यूनतम आवश्यकता: रु. {calcAactRequired.toLocaleString('ne-NP')}
                </p>
              </div>

              {/* 2. Similar Work Result */}
              <div
                className={`p-4 rounded-xl border ${isSimilarWorkEligible
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-red-50/60 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>२. समान प्रकृतिको काम अनुभव</span>
                  {isSimilarWorkEligible ? (
                    <span className="text-emerald-700 font-bold">योग्य ✓</span>
                  ) : (
                    <span className="text-red-700 font-bold">अयोग्य ✗</span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  रु. {maxCompletedSimilarWork.toLocaleString('ne-NP')}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  न्यूनतम आवश्यकता: रु. {similarWorkRequired.toLocaleString('ne-NP')}
                </p>
              </div>

              {/* 3. Bid Capacity Result */}
              <div
                className={`p-4 rounded-xl border ${isBidCapacityEligible
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-red-50/60 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>३. बोलपत्र क्षमता (Bid Capacity)</span>
                  {isBidCapacityEligible ? (
                    <span className="text-emerald-700 font-bold">पर्याप्त ✓</span>
                  ) : (
                    <span className="text-red-700 font-bold">अपर्याप्त ✗</span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  रु. {Math.round(bidCapacity).toLocaleString('ne-NP')}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  लागत अनुमान रु. {calcEstimateAmount.toLocaleString('ne-NP')} भन्दा बढी हुनुपर्छ।
                </p>
              </div>

              {/* 4. 5 Ongoing Contracts Result */}
              <div
                className={`p-4 rounded-xl border ${isOngoingContractsEligible
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-red-50/60 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>४. चालू ठेक्काको संख्या (नियम ६५)</span>
                  {isOngoingContractsEligible ? (
                    <span className="text-emerald-700 font-bold">योग्य ({ongoingContractsCount}/५) ✓</span>
                  ) : (
                    <span className="text-red-700 font-bold">सीमा नाघेको ({ongoingContractsCount}) ✗</span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {ongoingContractsCount} वटा चालू ठेक्का
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  १६औँ संशोधन अनुसार ५ भन्दा बढी चालू सम्झौता भएमा नयाँ सम्झौता गर्न पाइँदैन।
                </p>
              </div>
            </div>

            {/* Additional Performance Security Notice */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  कार्यसम्पादन जमानत (Performance Security) हिसाब विवरण:
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {additionalSecurityCalculation.note}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 block">कुल बुझाउनुपर्ने जमानत:</span>
                <span className="text-sm font-bold text-slate-900">
                  रु. {Math.round(additionalSecurityCalculation.totalSecurity).toLocaleString('ne-NP')}
                </span>
                {additionalSecurityCalculation.isBelow15 && (
                  <span className="text-[10px] text-amber-700 block font-semibold">
                    (५% सामान्य: रु. {Math.round(additionalSecurityCalculation.normalSecurity).toLocaleString('ne-NP')} + ५०% थप: रु. {Math.round(additionalSecurityCalculation.additionalSecurity).toLocaleString('ne-NP')})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: GOODS & CATALOGUE SHOPPING HUB */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* TAB: GOODS PROCUREMENT HUB */}
      {/* ------------------------------------------------------------- */}
      {(activeSubTab === 'goods-procurement' || activeSubTab === 'goods-guide') && (
        <div className="space-y-8">
          {/* Section 1: Goods Qualification Self-Assessment Calculator */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span>खण्ड १: आपूर्तिकर्ता योग्यता तथा वित्तीय क्षमता स्व-मूल्याङ्कन</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  PPMO Goods SBD (Section III) बमोजिम योग्यता परीक्षण क्याल्कुलेटर
                </h3>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${isGoodsOverallEligible
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
              >
                {isGoodsOverallEligible ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>प्रारम्भिक रूपमा योग्य देखिनुहुन्छ</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>केही शर्तहरू सुधार गर्नुपर्ने देखिन्छ</span>
                  </>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  बोलपत्रको लागत अनुमान (रु.)
                </label>
                <input
                  type="number"
                  value={goodsEstAmount}
                  onChange={(e) => {
                    const est = Number(e.target.value);
                    setGoodsEstAmount(est);
                    setGoodsTurnoverReq(Math.round(est * 0.8));
                    setGoodsExpReq(Math.round(est * 0.5));
                    setGoodsLiquidReq(Math.round(est * 0.3));
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {goodsEstAmount.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  वार्षिक कारोबार आवश्यकता (८०% रु.)
                </label>
                <input
                  type="number"
                  value={goodsTurnoverReq}
                  onChange={(e) => setGoodsTurnoverReq(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  न्यूनतम रु. {goodsTurnoverReq.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  आपूर्तिकर्ताको औसत वार्षिक कारोबार (रु.)
                </label>
                <input
                  type="number"
                  value={goodsSupplierTurnover}
                  onChange={(e) => setGoodsSupplierTurnover(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  ३ आर्थिक वर्षको औसत: रु. {goodsSupplierTurnover.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  समान आपूर्ति अनुभव आवश्यकता (५०% रु.)
                </label>
                <input
                  type="number"
                  value={goodsExpReq}
                  onChange={(e) => setGoodsExpReq(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  एकल सम्झौता: रु. {goodsExpReq.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  सम्पन्न भएको समान सम्झौता रकम (रु.)
                </label>
                <input
                  type="number"
                  value={goodsSupplierExp}
                  onChange={(e) => setGoodsSupplierExp(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  सम्पन्न रकम: रु. {goodsSupplierExp.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  चालु पुँजी/लाइन अफ क्रेडिट आवश्यकता (रु.)
                </label>
                <input
                  type="number"
                  value={goodsLiquidReq}
                  onChange={(e) => setGoodsLiquidReq(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  न्यूनतम रु. {goodsLiquidReq.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  आपूर्तिकर्ताको उपलब्ध मौज्दात/क्रेडिट (रु.)
                </label>
                <input
                  type="number"
                  value={goodsSupplierLiquid}
                  onChange={(e) => setGoodsSupplierLiquid(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  उपलब्ध स्रोत: रु. {goodsSupplierLiquid.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-2 p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-center">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={goodsMafRequired}
                    onChange={(e) => setGoodsMafRequired(e.target.checked)}
                    className="rounded-sm text-blue-700"
                  />
                  <span>MAF पत्र यस खरिदमा अनिवार्य छ</span>
                </label>
                {goodsMafRequired && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={goodsHasValidMaf}
                      onChange={(e) => setGoodsHasValidMaf(e.target.checked)}
                      className="rounded-sm text-emerald-700"
                    />
                    <span>उत्पादकको आधिकारिक MAF प्राप्त छ</span>
                  </label>
                )}
              </div>
            </div>

            {/* Live Result Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`p-4 rounded-xl border ${isGoodsTurnoverOk
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-red-50/70 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>१. औसत वार्षिक कारोबार</span>
                  <span className={isGoodsTurnoverOk ? 'text-emerald-700' : 'text-red-700'}>
                    {isGoodsTurnoverOk ? 'योग्य ✓' : 'अपुग ✗'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  रु. {goodsSupplierTurnover.toLocaleString('ne-NP')}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  माग: रु. {goodsTurnoverReq.toLocaleString('ne-NP')}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border ${isGoodsExpOk
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-red-50/70 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>२. समान आपूर्ति अनुभव</span>
                  <span className={isGoodsExpOk ? 'text-emerald-700' : 'text-red-700'}>
                    {isGoodsExpOk ? 'योग्य ✓' : 'अपुग ✗'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  रु. {goodsSupplierExp.toLocaleString('ne-NP')}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  माग: रु. {goodsExpReq.toLocaleString('ne-NP')}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border ${isGoodsLiquidOk
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-red-50/70 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>३. वित्तीय स्रोत / क्रेडिट</span>
                  <span className={isGoodsLiquidOk ? 'text-emerald-700' : 'text-red-700'}>
                    {isGoodsLiquidOk ? 'योग्य ✓' : 'अपुग ✗'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  रु. {goodsSupplierLiquid.toLocaleString('ne-NP')}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  माग: रु. {goodsLiquidReq.toLocaleString('ne-NP')}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border ${isGoodsMafOk
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-red-50/70 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>४. उत्पादकको MAF</span>
                  <span className={isGoodsMafOk ? 'text-emerald-700' : 'text-red-700'}>
                    {isGoodsMafOk ? 'मान्य ✓' : 'अपुग ✗'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {goodsMafRequired ? (goodsHasValidMaf ? 'सक्कल संलग्न' : 'छुटेको छ') : 'आवश्यक छैन'}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {goodsMafRequired ? 'सवारी/उपकरणमा अनिवार्य' : 'सामान्य खरिदमा ऐच्छिक'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Domestic Preference Calculator */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>खण्ड २: स्वदेशी उत्पादनलाई प्राथमिकता क्याल्कुलेटर (Domestic Preference)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  सार्वजनिक खरिद ऐन दफा ५२ र नियमावली नियम ९७ अनुसार १५% सम्मको मूल्य लाभ
                </h3>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                १५% सम्म प्राथमिकता मार्जिन
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-slate-700 leading-relaxed">
              <strong>कानूनी व्यवस्था:</strong> राष्ट्रिय वा अन्तर्राष्ट्रिय खुला बोलपत्रमा नेपालमा उत्पादित मालसामानलाई विदेशी सामान भन्दा <strong>१५% सम्म बढी मूल्य परे पनि</strong> मूल्याङ्कनमा स्वदेशी उत्पादनलाई प्राथमिकता दिइनेछ। मूल्याङ्कन प्रयोजनका लागि विदेशी सामानको कबुल दरमा १५% थप गरी तुलनात्मक मूल्याङ्कन रकम निकालिन्छ।
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  स्वदेशी सामानको प्रस्तावित दर (रु.)
                </label>
                <input
                  type="number"
                  value={dpDomesticQuote}
                  onChange={(e) => setDpDomesticQuote(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  नेपाली उत्पादन: रु. {dpDomesticQuote.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  विदेशी सामानको प्रस्तावित दर (रु.)
                </label>
                <input
                  type="number"
                  value={dpForeignQuote}
                  onChange={(e) => setDpForeignQuote(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  आयातित सामान: रु. {dpForeignQuote.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  प्राथमिकता मार्जिन (%)
                </label>
                <input
                  type="number"
                  value={dpMarginPercent}
                  onChange={(e) => setDpMarginPercent(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  तोकिएको दर: {dpMarginPercent}% (नियम ९७)
                </span>
              </div>
            </div>

            {/* Domestic Preference Output Result */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  विदेशी सामानको मूल्याङ्कन मूल्य (Evaluated Price):
                </span>
                <span className="text-base font-bold text-slate-900 block">
                  रु. {Math.round(dpEvaluatedForeign).toLocaleString('ne-NP')}
                </span>
                <span className="text-[10px] text-slate-500">
                  (मूल दर रु. {dpForeignQuote.toLocaleString('ne-NP')} + {dpMarginPercent}% मार्जिन रु. {Math.round(dpForeignQuote * (dpMarginPercent / 100)).toLocaleString('ne-NP')})
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  स्वदेशी सामानको वास्तविक कबुल दर:
                </span>
                <span className="text-base font-bold text-slate-900 block">
                  रु. {dpDomesticQuote.toLocaleString('ne-NP')}
                </span>
                <span className="text-[10px] text-slate-500">
                  मूल्य फरक: रु. {Math.round(dpPriceDifference).toLocaleString('ne-NP')}
                </span>
              </div>

              <div
                className={`p-4 rounded-xl border flex flex-col justify-center ${isDomesticWinning
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
              >
                <span className="text-xs font-bold flex items-center gap-1.5 mb-1">
                  {isDomesticWinning ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>स्वदेशी उत्पादनले ठेक्का पाउनेछ ✓</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      <span>विदेशी उत्पादन मूल्याङ्कनमा अगाडि देखियो</span>
                    </>
                  )}
                </span>
                <p className="text-[11px] leading-relaxed">
                  {isDomesticWinning
                    ? `स्वदेशी दर प्रत्यक्ष हेर्दा महँगो देखिए पनि १५% प्राथमिकता जोड्दा विदेशी मूल्याङ्कन दरभन्दा रु ${Math.round(dpPriceDifference).toLocaleString('ne-NP')} ले सस्तो ठहरिएकाले नियम ९७ बमोजिम स्वदेशी बोलपत्रदाता स्वीकृत हुनेछ।`
                    : `१५% प्राथमिकता जोड्दा पनि स्वदेशी दर विदेशी मूल्याङ्कन मूल्यभन्दा रु ${Math.round(dpPriceDifference).toLocaleString('ne-NP')} ले बढी भएकाले प्राथमिकताको लाभ नपुगेको देखिन्छ।`}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Specifications Compliance & Deviation Analyzer */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>खण्ड ३: प्राविधिक स्पेसिफिकेसन कम्प्लायन्स र विचलन विश्लेषक</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  आपूर्तिकर्ता प्राविधिक मूल्याङ्कनमा असफल हुनबाट जोगिने सुनौला नियमहरू (PPR नियम ६५)
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'सबै विनिर्देश' },
                  { id: 'minor', label: 'नगण्य विचलन (स्वीकार्य)' },
                  { id: 'major', label: 'सारभूत विचलन (सोझै बदर)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSpecDeviationFilter(tab.id as any)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${specDeviationFilter === tab.id
                      ? 'bg-blue-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deviation Explorer Cards */}
            {(specDeviationFilter === 'all' || specDeviationFilter === 'minor') && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700 space-y-2">
                <span className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  <span>नगण्य विचलन (Minor Deviations) • नियमावली नियम ६५(१) बमोजिम मान्य हुने अवस्था</span>
                </span>
                <p className="leading-relaxed">
                  मालसामानको मुख्य कार्यक्षमता, गुणस्तर र प्रयोजनमा तात्त्विक भिन्नता नपर्ने सामान्य छुट वा फरकहरू (जस्तै: सामान्य रङको फरक, सानो सहायक उपकरणको ढाँचा, सामान्य प्याकेजिङ आदि) लाई मूल्याङ्कन समितिले नगण्य विचलन मानी आर्थिक मूल्याङ्कनमा लैजान सक्छ।
                </p>
              </div>
            )}

            {(specDeviationFilter === 'all' || specDeviationFilter === 'major') && (
              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 text-xs text-slate-700 space-y-2">
                <span className="font-bold text-red-900 flex items-center gap-1.5 text-sm">
                  <XCircle className="w-4 h-4 text-red-700" />
                  <span>सारभूत विचलन (Major/Critical Deviations) • सिधै Non-Responsive भई बदर हुने अवस्था</span>
                </span>
                <p className="leading-relaxed">
                  माग गरिएको क्षमता (Power/Rating/Capacity) भन्दा कम प्रस्ताव गर्नु, मान्यता प्राप्त प्रयोगशालाको परीक्षण प्रमाणपत्र नहुनु, डेलिभरी तालिका अस्वीकार गर्नु, वारेन्टी समय नपुग्नु, वा अनिवार्य आधिकारिकता पत्र (MAF) नराख्नु सारभूत विचलन हुन्, जसमा मूल्याङ्कन समितिले बोलपत्र सिधै बदर गर्दछ।
                </p>
              </div>
            )}

            {/* Do's and Don'ts comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>❌ आपूर्तिकर्ताका ५ घातक गल्तीहरू (Disqualification Pitfalls)</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>केवल "Comply" मात्र लेख्नु:</strong> स्पेसिफिकेसनका प्रत्येक बुँदामा केवल "Comply" लेखेर आफ्नो प्रस्तावित सामानको ब्रान्ड, मोडल र वास्तविक मान नखुलाउनु।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>क्याटलग/ब्रोसरको पृष्ठ नं. नखुलाउनु:</strong> प्राविधिक मूल्याङ्कन समितिले रुजु गर्न सक्ने गरी क्याटलगको Page No. र Clause No. उल्लेख नगर्नु।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>विचलन (Deviation) लुकाउनु:</strong> बोलपत्रमा माग गरिएको क्षमता भन्दा कम क्षमताको सामानलाई झुक्याएर Comply लेख्दा बदर हुनु।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>गुणस्तर प्रमाणपत्र (ISO/CE/NS) छुटाउनु:</strong> मान्यता प्राप्त प्रयोगशालाको टेस्ट रिपोर्ट वा स्ट्यान्डर्ड प्रमाणपत्र संलग्न नगर्नु।</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✓ सफल आपूर्तिकर्ताले पालना गर्नुपर्ने विधि (Best Practices)</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span><strong>ठ्याक्कै प्राविधिक मान लेख्नुहोस्:</strong> उदाहरणका लागि '100 kVA' माग भएकोमा 'Offered: 100 kVA, 11/0.4 kV, Copper Wound' स्पष्ट उल्लेख गर्नुहोस्।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span><strong>ब्रोसरको पृष्ठ नम्बर खुलाउनुहोस्:</strong> 'Brochure Page 4, Section 2.1' स्पष्ट किटान गरी हाइलाइट गर्नुहोस्।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span><strong>उत्पादकको आधिकारिक ब्रोसर मात्र प्रयोग गर्नुहोस्:</strong> थर्ड-पार्टी वा इन्टरनेटबाट साभार गरिएको अनधिकृत विवरण पत्र नराख्नुहोस्।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span><strong>वारेन्टी र स्पेयर पार्ट्स समय तालिका:</strong> कम्तीमा १ देखि ३ वर्ष वारेन्टी र ५ देखि ७ वर्ष स्पेयर पार्ट्स सहयोगको लिखित कागजात संलग्न गर्नुहोस्।</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Manufacturer's Authorization Form (MAF) Guide */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>खण्ड ४: उत्पादकको आधिकारिकता पत्र (Manufacturer's Authorization Form - MAF)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  सवारी साधन, कम्प्युटर तथा उपकरण खरिदमा MAF को कानूनी अनिवार्यता
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('forms')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-900 hover:bg-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>MAF ढाँचा तयार गर्नुहोस् (SBD Sec IV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-purple-700 font-bold block">१. कुन खरिदमा अनिवार्य?</span>
                <p className="text-slate-600 leading-relaxed">
                  सवारी साधन, कम्प्युटर/सर्भर, मेशिनरी, ल्याब उपकरण, हेभी इक्विपमेन्ट तथा ब्रान्डेड मालसामान खरिदमा MAF अनिवार्य हुन्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-purple-700 font-bold block">२. मूल उत्पादकको प्रत्यक्ष पत्र</span>
                <p className="text-slate-600 leading-relaxed">
                  स्थानीय खुद्रा बिक्रेताले दिएको पत्र मान्य हुँदैन। विदेशी वा स्वदेशी मूल उत्पादक कम्पनी वा आधिकारिक राष्ट्रिय वितरकबाट जारी भएको हुनुपर्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-purple-700 font-bold block">३. वारेन्टी र सेवा प्रतिबद्धता</span>
                <p className="text-slate-600 leading-relaxed">
                  यदि बोलपत्रदाताले सम्झौता पालना गर्न नसकेमा उत्पादक स्वयंले सम्झौताका सम्पूर्ण वारेन्टी र स्पेयर पार्ट्स दायित्व पूरा गर्ने प्रत्याभूति हुनुपर्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-purple-700 font-bold block">४. अस्वीकृत हुने जोखिम</span>
                <p className="text-slate-600 leading-relaxed">
                  त्रुटिपूर्ण, मिति नखुलेको वा सर्तसहितको MAF पेश भएमा खरिद ऐनको दफा २३ बमोजिम बोलपत्र तत्काल गैर-जिम्मेवार (Non-Responsive) ठहरिन्छ।
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Goods Delivery, Liquidated Damages (LD) & Incoterms */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>खण्ड ५: डेलिभरी अवधि, Incoterms र लिक्विडेटेड ड्यामेज (LD) क्याल्कुलेटर</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  आपूर्ति सर्तहरू (Incoterms 2020) र ढिलाइ हुँदा लाग्ने कानुनी हर्जाना (नियम १२१)
                </h3>
              </div>
              <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                प्रति दिन ०.०५% (बढीमा १०%)
              </span>
            </div>

            {/* Incoterms mini-guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-slate-700" />
                  <span>DDP (Delivered Duty Paid):</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  नेपालको सरकारी निकायमा सबैभन्दा बढी प्रयोग हुने सर्त। आपूर्तिकर्ताले तोकिएको कार्यालय परिसरमै ढुवानी, बीमा र स्थानीय कर तिरेर हस्तान्तरण गर्नुपर्छ।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-700" />
                  <span>EXW (Ex-Works):</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  उत्पादकको कारखाना वा गोदामको मूल्य। ढुवानी, लोड-अनलोड र बीमाको सम्पूर्ण जोखिम तथा खर्च खरिदकर्ता कार्यालयको दायित्वमा पर्छ।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-700" />
                  <span>CIP (Carriage and Insurance Paid):</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  अन्तर्राष्ट्रिय प्रतिस्पर्धा (ICB) मा प्रयोग हुने। नेपालको प्रवेश विन्दु वा भन्सारसम्म ढुवानी र बीमा आपूर्तिकर्ताले बेहोर्ने।
                </p>
              </div>
            </div>

            {/* LD Inputs & Outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-800">
                  हर्जाना (LD) हिसाब गर्न सम्झौता विवरण भर्नुहोस्:
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      कुल सम्झौता रकम (भ्याट सहित रु.)
                    </label>
                    <input
                      type="number"
                      value={goodsContractAmount}
                      onChange={(e) => setGoodsContractAmount(Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-amber-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">
                      रु. {goodsContractAmount.toLocaleString('ne-NP')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      सामान आपूर्तिमा भएको ढिलाइ (दिन)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={goodsDelayDays}
                      onChange={(e) => setGoodsDelayDays(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-amber-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">
                      ढिलाइ अवधि: {goodsDelayDays} दिन
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                  <span>हर्जाना (Liquidated Damages) नतिजा:</span>
                  <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-sm">
                    {goodsLdPercent.toFixed(2)}% कट्टा
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                    <span>दैनिक कट्टा हुने दर (०.०५%):</span>
                    <strong className="text-slate-900">रु. {Math.round(goodsLdDaily).toLocaleString('ne-NP')} / दिन</strong>
                  </div>
                  <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                    <span>कुल कट्टा हुने LD रकम ({goodsDelayDays} दिनको):</span>
                    <strong className="text-amber-950 text-sm">रु. {Math.round(goodsLdEffective).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                    <span>अधिकतम १०% सीमा रकम:</span>
                    <strong className="text-slate-900">रु. {Math.round(goodsLdMaxCap).toLocaleString('ne-NP')}</strong>
                  </div>
                </div>

                {goodsLdPercent >= 10 ? (
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-900 text-[11px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
                    <span>गम्भीर चेतावनी: १०% अधिकतम सीमा पुगेको छ। सार्वजनिक निकायले खरिद सम्झौता रद्द गरी धरौटी जफत गर्न र कालोसूचीमा सिफारिस गर्न सक्छ!</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    नोट: डेलिभरी अवधिभित्र सामान आपूर्ति गर्न नसके म्याद थपको औपचारिक निवेदन दिई LD मिनाहा वा वैधानिक म्याद थप गराउनु बुद्धिमानी हुन्छ।
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: CATALOGUE SHOPPING HUB (PPA Sec 41A, PPR Rule 85A) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'catalogue-shopping' && (
        <div className="space-y-8">
          {/* Section 1: Catalogue Shopping Legal Framework */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>खण्ड १: क्याटलग सपिङ कानूनी कार्यविधि (PPA दफा ४१क र PPR नियम ८५क)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  उत्पादक वा अधिकृत बिक्रेताको सूचीकरण र छुट प्रस्ताव रणनीति
                </h3>
              </div>
              <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-semibold">
                PPR नियम ८५ (क)
              </span>
            </div>

            {/* 3 Core pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">
                    १
                  </span>
                  <span>क्याटलग सपिङ के हो?</span>
                </div>
                <p className="text-slate-600">
                  सवारी साधन, हेभी इक्विपमेन्ट, कम्प्युटर/ल्यापटप, स्वास्थ्य उपकरण, फर्निचर, औजार आदि उत्पादकले बजारमा सार्वजनिक मूल्य सूची (MRP/Price List) कायम गरेका सामानहरूमा छुट लिएर गरिने विशेष खरिद विधि हो।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">
                    २
                  </span>
                  <span>सूचीकरण (Listing) प्रक्रिया</span>
                </div>
                <p className="text-slate-600">
                  सार्वजनिक निकायले राष्ट्रिय पत्रिका वा e-GP मा कम्तीमा १५/२१ दिनको म्याद दिई सूचीकरण आह्वान गर्दा आधिकारिक डिलरशिप, अद्यावधिक क्याटलग र उत्पादकद्वारा प्रमाणित आधिकारिक मूल्य सूचीसहित निवेदन पेश गर्नुपर्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">
                    ३
                  </span>
                  <span>छनौटको सिद्धान्त (Maximum Discount)</span>
                </div>
                <p className="text-slate-600">
                  नियम ८५क(४) बमोजिम सार्वजनिक निकायले क्याटलग मूल्यमा <strong className="text-slate-900">सबैभन्दा बढी प्रतिशत छुट (Maximum Discount)</strong> कबुल गर्ने सूचीकृत बिक्रेतासँग खरिद सम्झौता गर्नुपर्छ। मूल्य सूची आर्थिक वर्षभरि बढाउन पाइँदैन।
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Catalogue Shopping Simulator */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
                  <Calculator className="w-4 h-4 text-teal-600" />
                  <span>खण्ड २: क्याटलग सपिङ छुट, खुद लागत तथा कर क्याल्कुलेटर</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  आपूर्तिकर्ताको छुट प्रस्ताव र निकायको कुल खरिद लागत सिमुलेटर
                </h3>
              </div>

              <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>लागत सिमुलेटर</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  मालसामानको नाम / मोडल (ऐच्छिक)
                </label>
                <input
                  type="text"
                  placeholder="उदा. गाडी, यन्त्र, कम्प्युटर, आदि"
                  value={catItemName}
                  onChange={(e) => setCatItemName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 truncate block">
                  {catItemName ? `वस्तु: ${catItemName}` : 'सबै प्रकारका मालसामान'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  क्याटलग / MRP मूल्य प्रति इकाई (रु.)
                </label>
                <input
                  type="number"
                  value={catOriginalPrice}
                  onChange={(e) => setCatOriginalPrice(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {catOriginalPrice.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  प्रस्तावित छुट प्रतिशत (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={catDiscountPercent}
                  onChange={(e) => setCatDiscountPercent(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  छुट: {catDiscountPercent}% (प्रति इकाई रु. {Math.round(catDiscountAmountPerUnit).toLocaleString('ne-NP')})
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  माग संख्या / परिमाण (Quantity)
                </label>
                <input
                  type="number"
                  min="1"
                  value={catQuantity}
                  onChange={(e) => setCatQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  कुल परिमाण: {catQuantity} थान/सेट
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  ढुवानी/जडान लागत (रु.)
                </label>
                <input
                  type="number"
                  value={catDeliveryCost}
                  onChange={(e) => setCatDeliveryCost(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-hidden"
                />
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catApplyVat}
                    onChange={(e) => setCatApplyVat(e.target.checked)}
                    className="rounded-sm text-teal-700"
                  />
                  <span>१३% भ्याट लागू हुने</span>
                </label>
              </div>
            </div>

            {/* Simulator Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200">
                <span className="text-[11px] font-semibold text-teal-800 block">
                  प्रति इकाई खुद मूल्य (Net Unit Price)
                </span>
                <span className="text-base sm:text-lg font-bold text-teal-950 mt-0.5 block">
                  रु. {Math.round(catNetUnitPrice).toLocaleString('ne-NP')}
                </span>
                <span className="text-[10px] text-teal-700">
                  (क्याटलग मूल्यमा {catDiscountPercent}% छुट पश्चात)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800 block">
                  निकायलाई कुल छुट/बचत (Total Savings)
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-950 mt-0.5 block">
                  रु. {Math.round(catTotalSavings).toLocaleString('ne-NP')}
                </span>
                <span className="text-[10px] text-emerald-700">
                  (कुल {catQuantity} थानमा प्राप्त छुट रकम)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  करयोग्य रकम र १३% भ्याट
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                  रु. {Math.round(catVatAmount).toLocaleString('ne-NP')}
                </span>
                <span className="text-[10px] text-slate-500">
                  (करयोग्य रकम: रु. {Math.round(catTotalTaxable).toLocaleString('ne-NP')})
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white shadow-sm">
                <span className="text-[11px] font-medium text-teal-300 block">
                  अन्तिम भुक्तानी योग्य मूल्य (Grand Total)
                </span>
                <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">
                  रु. {Math.round(catGrandTotal).toLocaleString('ne-NP')}
                </span>
                <span className="text-[10px] text-slate-300">
                  (सामान, ढुवानी र १३% भ्याट सहित)
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: 6 Mandatory Documents for Listing Checklist */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                  <span>खण्ड ३: क्याटलग सूचीकरणका ६ अनिवार्य कागजातहरू</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  आपूर्तिकर्ताले सार्वजनिक निकायमा सूचीकरण निवेदन दिँदा पेश गर्नुपर्ने प्रमाणहरू
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('forms')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>सूचीकरण आवेदन फाराम ढाँचा भर्नुहोस्</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">१</span>
                  <span>उद्योग/कम्पनी दर्ता र अद्यावधिक नवीकरण</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  सम्बन्धित मालसामान उत्पादन वा अधिकृत बिक्री वितरण गर्न कानुन बमोजिम दर्ता भएको प्रमाणपत्र तथा चालू आ.व. सम्मको नवीकरण प्रतिलिपि।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">२</span>
                  <span>PAN/VAT दर्ता र कर चुक्ता प्रमाणपत्र</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  मूल्य अभिवृद्धि कर दर्ता प्रमाणपत्र र पछिल्लो आर्थिक वर्ष (२०८०/८१ वा चालू) सम्मको कर चुक्ता प्रमाणपत्र (Tax Clearance)।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">३</span>
                  <span>मूल उत्पादकको आधिकारिक वितरक सम्झौता</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  मूल उत्पादक कम्पनी वा आधिकारिक राष्ट्रिय एजेन्टबाट जारी आधिकारिक डिलरशिप वा डिस्ट्रिब्युटरशिप सम्झौता पत्र।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">४</span>
                  <span>उत्पादकको आधिकारिक क्याटलग र ब्रोसर</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  सामानको ब्रान्ड, मोडल, प्राविधिक विनिर्देश (Specifications), इन्जिन क्षमता, आयाम र फिचरहरू प्रमाणित हुने सक्कल विवरण पुस्तिका।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">५</span>
                  <span>उत्पादकद्वारा प्रकाशित सार्वजनिक मूल्यसूची (MRP)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  उत्पादकले बजारमा सार्वजनिक गरेको प्रमाणित मूल्यसूची (MRP) वा आधिकारिक वेबसाइटमा प्रकाशित सार्वजनिक मूल्य विवरण।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">६</span>
                  <span>गुणस्तर तथा सुरक्षा मानक प्रमाणपत्र</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  नेपाल गुणस्तर (NS), ISO, CE वा अन्तर्राष्ट्रिय मान्यता प्राप्त प्रयोगशालाबाट जारी गुणस्तर परीक्षण प्रमाणपत्र।
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Purchase Order, Delivery & Payment Workflow */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>खण्ड ४: खरिद आदेश, आपूर्ति समयसीमा, निरीक्षण र भुक्तानी कार्यविधि</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  क्याटलग सपिङ खरिद आदेश भएपछि आपूर्तिकर्ताले पालना गर्नुपर्ने ४-चरणबद्ध प्रक्रिया
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-sm inline-block">
                  चरण १: छुट माग र तुलना
                </span>
                <p className="text-slate-600 leading-relaxed">
                  निकायले सूचीकृत कम्तीमा ३ आपूर्तिकर्तासँग दर र छुट माग गर्छ। सबैभन्दा बढी प्रतिशत छुट दिने बिक्रेतालाई छनौट गरिन्छ (नियम ८५क(४))।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-sm inline-block">
                  चरण २: खरिद आदेश जारी
                </span>
                <p className="text-slate-600 leading-relaxed">
                  स्वीकृत आपूर्तिकर्तालाई तोकिएको परिमाण, छुटपछिको खुद मूल्य र आपूर्ति म्याद खुलाएर आधिकारिक खरिद आदेश (Purchase Order) दिइन्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-sm inline-block">
                  चरण ३: प्राविधिक निरीक्षण र दाखिला
                </span>
                <p className="text-slate-600 leading-relaxed">
                  सामान कार्यालय परिसरमा प्राप्त भएको मितिले नियम ११९ बमोजिम ७ दिनभित्र प्राविधिक समितिले स्पेसिफिकेसन जाँच गरी दाखिला प्रतिवेदन (Stock Entry) तयार गर्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-sm inline-block">
                  चरण ४: तत्काल भुक्तानी
                </span>
                <p className="text-slate-600 leading-relaxed">
                  दाखिला प्रतिवेदन, स्वीकृत बीजक (Invoice) र वारेन्टी पत्र पेश हुनासाथ सम्झौता सर्त बमोजिम आपूर्तिकर्ताको बैंक खातामा तुरुन्त भुक्तानी पठाइन्छ।
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Essential Supplier Cautions */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>खण्ड ५: आपूर्तिकर्ताले ध्यान दिनुपर्ने संवेदनशील कानुनी सचेतना बुँदाहरू</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <strong className="text-amber-950 block">१. आर्थिक वर्षभरि मूल्य बढाउन नपाइने:</strong>
                <p className="leading-relaxed">
                  नियम ८५क(५) बमोजिम सूचीकरण गर्दा पेश गरेको क्याटलग मूल्य आर्थिक वर्षभरि बढाउन पाइने छैन। तर आपूर्तिकर्ताले थप छुट दिन भने सक्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <strong className="text-amber-950 block">२. बजार मूल्यभन्दा बढी हुन नहुने:</strong>
                <p className="leading-relaxed">
                  नियम ८५क(६) अनुसार क्याटलगमा उल्लिखित मूल्य र छुट पछिको खुद दर प्रचलित खुला बजार मूल्यभन्दा कुनै पनि हालतमा बढी हुनुहुँदैन।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <strong className="text-amber-950 block">३. आपूर्ति नगरेमा कारबाही:</strong>
                <p className="leading-relaxed">
                  खरिद आदेश बुझेर तोकिएको म्यादमा सामान आपूर्ति नगरेमा कालोसूचीमा सिफारिस गरिनेछ र अन्य सूचीकृत बिक्रेताबाट खरिद गर्दा लाग्ने फरक रकम असुल गर्न सकिनेछ।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: CONSULTING SERVICES HUB (PPA Sec 29-38, PPR Rule 69-80) */}
      {/* ------------------------------------------------------------- */}
      {(activeSubTab === 'consulting-services' || activeSubTab === 'services-guide') && (
        <div className="space-y-8">
          {/* Section 1: EOI Shortlisting Self-Assessment Simulator */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
                  <Calculator className="w-4 h-4 text-purple-600" />
                  <span>खण्ड १: EOI (आशयपत्र) सर्टलिस्टिङ स्व-मूल्याङ्कन सिमुलेटर</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  सार्वजनिक खरिद ऐन दफा ३० र नियम ७० अनुसार उत्कृष्ट ३ देखि ६ फर्मभित्र पर्ने योग्यता परीक्षण
                </h3>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${eoiCalculations.isShortlistReady
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
              >
                {eoiCalculations.isShortlistReady ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-purple-700" />
                    <span>सर्टलिस्टिङमा अग्रस्थान सम्भावना (स्कोर: {eoiCalculations.totalScore}/१००)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>सर्टलिस्ट हुन क्षमता थप बढाउनुपर्ने (स्कोर: {eoiCalculations.totalScore}/१००)</span>
                  </>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  संस्था दर्ता तथा सञ्चालन अवधि (वर्ष)
                </label>
                <input
                  type="number"
                  min="1"
                  value={eoiStandingYears}
                  onChange={(e) => setEoiStandingYears(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-purple-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  स्थापना: {eoiStandingYears} वर्ष (अधिकतम १० अंक)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  औसत वार्षिक कारोबार (रु. ३ वर्षको औसत)
                </label>
                <input
                  type="number"
                  value={eoiTurnover}
                  onChange={(e) => setEoiTurnover(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-purple-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {eoiTurnover.toLocaleString('ne-NP')} (अधिकतम १० अंक)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  समान परामर्श कार्य सम्पन्न संख्या (७ वर्षभित्र)
                </label>
                <input
                  type="number"
                  min="0"
                  value={eoiCompletedProjects}
                  onChange={(e) => setEoiCompletedProjects(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-purple-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  सम्पन्न आयोजना: {eoiCompletedProjects} वटा (अधिकतम ४५ अंक)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  मुख्य विषय विज्ञ संख्या (स्नातकोत्तर/PhD रोस्टर)
                </label>
                <input
                  type="number"
                  min="1"
                  value={eoiKeyExpertsCount}
                  onChange={(e) => setEoiKeyExpertsCount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-purple-600 focus:outline-hidden"
                />
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eoiHasValidTax}
                    onChange={(e) => setEoiHasValidTax(e.target.checked)}
                    className="rounded-sm text-purple-700"
                  />
                  <span>अद्यावधिक कर चुक्ता संलग्न छ</span>
                </label>
              </div>
            </div>

            {/* Live Result Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>१. संस्थागत हैसियत र वित्तीय क्षमता</span>
                  <span className="text-purple-700 font-bold">{Math.round(eoiCalculations.instTotal)} / २०</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  स्थापना वर्ष अंक: {Math.min(eoiStandingYears * 2, 10)} | वित्तीय कारोबार अंक: {Math.round(Math.min((eoiTurnover / 20000000) * 10, 10))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>२. समान प्रकृतिका कार्य अनुभव</span>
                  <span className="text-purple-700 font-bold">{Math.round(eoiCalculations.expScore)} / ४५</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  सम्पन्न {eoiCompletedProjects} वटा समान कार्यको आधारमा (न्यूनतम ३ कार्य भए सुरक्षित)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>३. मुख्य जनशक्ति रोस्टर क्षमता</span>
                  <span className="text-purple-700 font-bold">{Math.round(eoiCalculations.expertScore)} / ३५</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  उपलब्ध {eoiKeyExpertsCount} विज्ञहरूको प्राविधिक क्षमता तथा काउन्सिल दर्ता
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Consulting Selection Methods (QCBS, LCS, FBS) */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>खण्ड २: परामर्श सेवा छनौट विधि विश्लेषक (Selection Methods)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  QCBS (गुणस्तर र लागत), LCS (न्यूनतम लागत), र FBS (निश्चित बजेट) मूल्याङ्कन सिमुलेटर
                </h3>
              </div>

              {/* Selection Method Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'qcbs', label: 'QCBS (गुणस्तर र लागत)' },
                  { id: 'lcs', label: 'LCS (न्यूनतम लागत)' },
                  { id: 'fbs', label: 'FBS (निश्चित बजेट)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConsultingMethod(item.id as any)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${consultingMethod === item.id
                      ? 'bg-indigo-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Method 1: QCBS Simulator */}
            {consultingMethod === 'qcbs' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block font-semibold mb-1">
                    QCBS मूल्याङ्कन सूत्र (PPR नियम ७९): S = (St × T/100) + [(Fm / F) × 100 × P/100]
                  </strong>
                  यहाँ <code className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-200 text-slate-900 font-semibold">St</code> = प्राविधिक अंक,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-200 text-slate-900 font-semibold">Fm</code> = सबैभन्दा न्यून आर्थिक प्रस्ताव रकम,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-200 text-slate-900 font-semibold">F</code> = तपाईंको कबुल रकम,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-200 text-slate-900 font-semibold">T</code> = प्राविधिक भार ({qcbsCalculations.techWeight}%),{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-200 text-slate-900 font-semibold">P</code> = आर्थिक भार ({qcbsCalculations.finWeight}%)।
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-indigo-50/40 p-4 sm:p-5 rounded-2xl border border-indigo-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      तपाईंको प्राविधिक अंक (St - १०० मा)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={qcbsTechScore}
                      onChange={(e) => setQcbsTechScore(Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-indigo-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">
                      प्राविधिक अंक: {qcbsTechScore} / १००
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      तपाईंको आर्थिक कबुल रकम (F - रु.)
                    </label>
                    <input
                      type="number"
                      value={qcbsBidderFinancial}
                      onChange={(e) => setQcbsBidderFinancial(Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-indigo-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">
                      रु. {qcbsBidderFinancial.toLocaleString('ne-NP')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      न्यूनतम आर्थिक कबुल रकम (Fm - रु.)
                    </label>
                    <input
                      type="number"
                      value={qcbsLowestFinancial}
                      onChange={(e) => setQcbsLowestFinancial(Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-indigo-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">
                      रु. {qcbsLowestFinancial.toLocaleString('ne-NP')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      अङ्कभार अनुपात (Ratio)
                    </label>
                    <select
                      value={qcbsRatio}
                      onChange={(e) => setQcbsRatio(e.target.value as any)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-indigo-600 focus:outline-hidden"
                    >
                      <option value="80-20">८०% प्राविधिक / २०% आर्थिक (मानक)</option>
                      <option value="70-30">७०% प्राविधिक / ३०% आर्थिक</option>
                      <option value="90-10">९०% प्राविधिक / १०% आर्थिक (विशिष्ट)</option>
                    </select>
                    <span className="text-[10px] text-slate-500">
                      SBD अनुसार निर्धारित भार
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      प्राविधिक भारित अंक ({qcbsCalculations.techWeight}%)
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                      {qcbsCalculations.techWeighted.toFixed(2)} अंक
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({qcbsTechScore} × {qcbsCalculations.techWeight} / १००)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      आर्थिक भारित अंक ({qcbsCalculations.finWeight}%)
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                      {qcbsCalculations.finWeighted.toFixed(2)} अंक
                    </span>
                    <span className="text-[10px] text-slate-500">
                      (आर्थिक अनुपात: {qcbsCalculations.finScore.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200">
                    <span className="text-[11px] font-semibold text-indigo-800 block">
                      कुल संयुक्त स्कोर (Combined Score)
                    </span>
                    <span className="text-base sm:text-xl font-extrabold text-indigo-950 mt-0.5 block">
                      {qcbsCalculations.combinedScore.toFixed(2)} / १००
                    </span>
                    <span className="text-[10px] text-indigo-700">
                      (उच्चतम संयुक्त स्कोर ल्याउनेले ठेक्का पाउँछ)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-indigo-300 block">
                        रणनीतिक सल्लाह (Bidder Strategy)
                      </span>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                        {qcbsCalculations.techWeighted > 65
                          ? 'तपाईंको प्राविधिक अंक निकै बलियो छ! आर्थिक प्रस्ताव प्रतिस्पर्धी भन्दा केही बढी भए पनि सम्झौता जित्ने प्रबल सम्भावना छ।'
                          : 'प्राविधिक अंक कमजोर हुँदा आर्थिक रकम धेरै घटाए पनि संयुक्त स्कोरमा जित्न कठिन हुन सक्छ। प्राविधिक गुणस्तरमा जोड दिनुहोस्।'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Method 2: LCS Simulator */}
            {consultingMethod === 'lcs' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs leading-relaxed">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <strong className="text-slate-900 text-sm block">LCS (Least Cost Selection - न्यूनतम लागत छनौट विधि)</strong>
                    <span className="text-slate-500">नियम ७८ बमोजिम अडिटिङ, साधारण सर्भे, वा मानक परामर्श सेवामा प्रयोग हुन्छ।</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">उत्तीर्णाङ्क थ्रेसहोल्ड (Qualifying Mark):</span>
                    <input
                      type="number"
                      value={lcsQualifyingMark}
                      onChange={(e) => setLcsQualifyingMark(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold"
                    />
                    <span>अंक</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block">१. प्राविधिक छनौट चरण:</strong>
                    <p className="text-slate-600">
                      पहिला प्राविधिक प्रस्ताव खोलिन्छ। कम्तीमा {lcsQualifyingMark} अंक प्राप्त गर्ने सबै परामर्शदाताहरू आर्थिक प्रतिस्पर्धाका लागि योग्य ठहरिन्छन्। {lcsQualifyingMark} भन्दा कम अंक ल्याउनेको आर्थिक खाम नखोली फिर्ता गरिन्छ।
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block">२. आर्थिक छनौट चरण (न्यूनतम मूल्य):</strong>
                    <p className="text-slate-600">
                      {lcsQualifyingMark} अंक पार गर्नेहरूमध्ये <strong>जसको आर्थिक प्रस्ताव सबैभन्दा सस्तो (Least Cost)</strong> हुन्छ, उसैसँग खरिद सम्झौता गरिन्छ। यस विधिमा प्राविधिक अंकको थप भार जोडिँदैन।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Method 3: FBS Simulator */}
            {consultingMethod === 'fbs' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs leading-relaxed">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <strong className="text-slate-900 text-sm block">FBS (Fixed Budget Selection - निश्चित बजेटमा आधारित छनौट)</strong>
                    <span className="text-slate-500">नियम ७७ बमोजिम बजेट सीमा पहिले नै सार्वजनिक निकायले तोकेको अवस्थामा लागू हुन्छ।</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">तोकिएको बजेट सीमा:</span>
                    <input
                      type="number"
                      value={fbsBudgetCap}
                      onChange={(e) => setFbsBudgetCap(Number(e.target.value))}
                      className="w-28 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                  <strong className="block font-bold">आपूर्तिकर्ताले ध्यान दिनुपर्ने संवेदनशील नियम:</strong>
                  <p>
                    यदि तपाईंको आर्थिक कबुल रकम तोकिएको अधिकतम बजेट सीमा रु. {fbsBudgetCap.toLocaleString('ne-NP')} भन्दा १ रुपैयाँ मात्र पनि बढी भएमा तपाईंको प्रस्ताव <strong>सोझै गैर-जिम्मेवार (Non-Responsive) भई बदर</strong> हुनेछ। तोकिएको बजेटभित्र रहेर सबैभन्दा उच्च प्राविधिक अंक प्राप्त गर्ने परामर्शदाता छानिनेछ।
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: RFP Technical Proposal (TECH-4 & Evaluation Criteria) */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  <span>खण्ड ३: RFP प्राविधिक प्रस्ताव मूल्याङ्कनका ४ मूल आधारहरू (PPR नियम ७४)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  परामर्शदाताले १०० पूर्णाङ्कमा अधिकतम प्राविधिक अंक हासिल गर्ने रणनीति
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('forms')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>TECH-4 र TECH-6 फाराम ढाँचा भर्नुहोस्</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>१. विशिष्ट अनुभव (Specific Exp)</span>
                  <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-sm">१० - २०%</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  विगत ५-७ वर्षभित्र सम्पन्न ठ्याक्कै उस्तै विषय र प्रकृतिका आयोजनाको संख्या र कार्यसम्पादन प्रमाणपत्र (Completion Certificate)।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>२. कार्यविधि र कार्यतालिका (TECH-4)</span>
                  <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-sm">२० - ४०%</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  TOR को बुझाइ, प्राविधिक दृष्टिकोण, नवीन पद्धति (GIS/सफ्टवेयर/ड्रोन), कार्यतालिका (Work Plan) र प्रतिवेदन बुझाउने माइलस्टोन्स।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>३. मुख्य विज्ञहरूको योग्यता (TECH-6)</span>
                  <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-sm">५० - ७०%</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  टोली नेता (Team Leader) र मुख्य विज्ञहरूको शैक्षिक योग्यता, समान कार्य अनुभव, पेशागत काउन्सिल दर्ता र हस्ताक्षरित बायोडाटा।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>४. ज्ञान तथा सीप हस्तान्तरण</span>
                  <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-sm">० - १०%</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  सार्वजनिक निकायका प्राविधिक कर्मचारीलाई तालिम, ज्ञान आदानप्रदान, र कार्यशाला सञ्चालन योजना।
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Key Expert CV (TECH-6) & Exclusivity Rules */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>खण्ड ४: मुख्य विज्ञको व्यक्तिगत विवरण (CV) र दोहोरो प्रतिबद्धता (Conflict) सम्बन्धी कडा कानुनी प्रावधान</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <strong className="text-amber-950 block font-bold">१. सक्कल हस्ताक्षर र मिति अनिवार्य:</strong>
                <p>
                  प्रत्येक मुख्य विज्ञको बायोडाटामा सम्बन्धित विज्ञको आफ्नै हातले गरेको सक्कल हस्ताक्षर र मिति अनिवार्य हुनुपर्छ। फोटोकपी हस्ताक्षर वा स्क्यान हस्ताक्षर अस्पष्ट भएमा अंक शून्य वा प्रस्ताव रद्द हुन सक्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <strong className="text-amber-950 block font-bold">२. दोहोरो CV पेश गर्न नपाइने (Exclusivity):</strong>
                <p>
                  यदि एउटै मुख्य विज्ञले दुई वा बढी प्रतिस्पर्धी परामर्शदाता फर्मलाई CV दिएको प्रमाणित भएमा, <strong>ती दुवै प्रतिस्पर्धी फर्महरूको प्राविधिक प्रस्ताव बदर</strong> हुन्छ वा उक्त विज्ञको अंक कट्टा गरिन्छ। विज्ञसँग 'Exclusivity Statement' अनिवार्य लिनुहोस्।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <strong className="text-amber-950 block font-bold">३. बहालवाला कर्मचारी संलग्न गर्न नपाइने:</strong>
                <p>
                  खरिद ऐनको दफा ६२ बमोजिम नेपाल सरकार वा सार्वजनिक निकायमा बहाल रहेका कर्मचारी वा शिक्षकलाई बिना अनुमति परामर्शदाताको विज्ञ बनाउन पाइँदैन। त्यस्तो फेला परेमा बोलपत्र सोझै बदर भई कालोसूचीमा सिफारिस हुन्छ।
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Contract Types & Payment Milestones */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>खण्ड ५: परामर्श सम्झौताका प्रकारहरू (Contract Types) र भुक्तानी माइलस्टोन्स</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>१. Lump-Sum (एकमुष्ट रकम सम्झौता - नियम ८१)</span>
                  <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-sm">माइलस्टोन भुक्तानी</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  DPR, सर्भे, डिजाइन, वा सफ्टवेयर विकास जस्ता स्पष्ट प्रतिवेदन निस्कने कार्यमा प्रयोग हुन्छ।
                </p>
                <div className="space-y-1.5 border-t border-slate-200 pt-2 text-[11px]">
                  <div className="flex justify-between"><span>• इनसेप्शन प्रतिवेदन (Inception Report):</span><strong>१० - १५%</strong></div>
                  <div className="flex justify-between"><span>• अन्तरिम/फिल्ड सर्भे प्रतिवेदन (Interim Report):</span><strong>३० - ३५%</strong></div>
                  <div className="flex justify-between"><span>• मस्यौदा प्रतिवेदन (Draft Report):</span><strong>३० - ३५%</strong></div>
                  <div className="flex justify-between"><span>• अन्तिम प्रतिवेदन स्वीकृति (Final Report):</span><strong>१५ - २०%</strong></div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>२. Time-Based (समयमा आधारित सम्झौता - नियम ८१)</span>
                  <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-sm">Person-Month Rate</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  निर्माण सुपरभिजन (Construction Supervision) वा आयोजना व्यवस्थापन जस्ता कार्यअवधि यकिन गर्न कठिन कार्यमा प्रयोग हुन्छ।
                </p>
                <div className="space-y-1.5 border-t border-slate-200 pt-2 text-[11px]">
                  <div className="flex justify-between"><span>• विज्ञ पारिश्रमिक (Remuneration):</span><span>Person-Month दर × फिल्ड समय</span></div>
                  <div className="flex justify-between"><span>• प्रतिपूर्ति खर्च (Reimbursable):</span><span>होटेल, यात्रा, सर्भे, ल्याब टेस्टिङ</span></div>
                  <div className="flex justify-between"><span>• आकस्मिक खर्च (Contingencies):</span><span>स्वीकृत सीमाभित्र वास्तविक बिल अनुसार</span></div>
                </div>
              </div>
            </div>

            {/* Implementation Rules Comparison Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="p-2.5">प्रावधान / सर्त</th>
                    <th className="p-2.5">Time-Based सम्झौता</th>
                    <th className="p-2.5">Lump-Sum सम्झौता</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-800">मूल्य समायोजन (Price Adjustment)</td>
                    <td className="p-2.5">१२ महिनाभन्दा बढी अवधिको सम्झौता भए लागू हुन सक्ने [ऐन दफा ५५]</td>
                    <td className="p-2.5 text-rose-700 font-medium">लागू हुँदैन (Fixed Price) [ऐन दफा ५५(२)]</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-800">खर्चको सीमा (Ceiling Alert)</td>
                    <td className="p-2.5">कुल सम्झौता रकमको ८०% खर्च पुगेपछि निकायलाई अनिवार्य जानकारी</td>
                    <td className="p-2.5">माइलस्टोन प्रतिवेदन स्वीकृति अनुसार किस्ताबन्दी भुक्तानी</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-800">मोबिलाइजेसन पेश्की (Advance)</td>
                    <td className="p-2.5" colSpan={2}>सम्झौता रकमको बढीमा २०% (ऐन दफा ५२क); अग्रिम बैंक जमानत लिई छुट्टै खाताबाट खर्च; ३० दिनभित्र काम सुरु</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-800">रिटेन्सन कट्टी र फिर्ता (Retention)</td>
                    <td className="p-2.5" colSpan={2}>प्रत्येक बिलबाट कट्टा हुने; आधा रकम अन्तिम बिलमा र बाँकी आधा आयकर चुक्ता प्रमाण पेश गरेको १५ दिनभित्र फिर्ता [नियम १२४]</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-800">ढिलाइ क्षतिपूर्ति (Liquidated Damages)</td>
                    <td className="p-2.5" colSpan={2}>प्रतिदिन सम्झौता रकमको ०.०५%, अधिकतम १०% सम्म [नियम १२१]; १०% पुगे सम्झौता अन्त्य र कालोसूची सिफारिस</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: Professional Liability Insurance (PPA Sec 38(6), PPR Rule 81(7)-(8)) */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>खण्ड ६: पेसागत दायित्व बिमा (Professional Liability Insurance) – नयाँ वैधानिक व्यवस्था</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  सार्वजनिक खरिद ऐन दफा ३८(६) र नियमावलीको नियम ८१(७)-(८) सम्बन्धी अनिवार्य मार्गनिर्देशन
                </h3>
              </div>
              <span className="text-xs bg-purple-100 text-purple-900 font-bold px-3 py-1.5 rounded-full border border-purple-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-700" />
                सम्झौता गरेको ३० दिनभित्र बुझाउनैपर्ने
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  १. बिमाको कभरेज तथा दायित्व क्षेत्र (नियम ८१(७क))
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                    <span><strong>कुल सम्झौता मूल्य बराबर:</strong> यो बिमा निःशर्त फुकुवा हुने प्रकृतिको हुनुपर्छ र यसले सम्झौताको कुल रकम समेट्नुपर्छ।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                    <span><strong>परामर्शदाता र मुख्य पेसाविद् दुवै कभर:</strong> परामर्शदाता संस्था र निजले परिचालन गरेका सबै जिम्मेवार मुख्य विज्ञहरू (Key Experts) लाई समेट्नुपर्छ।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                    <span><strong>लापरबाही वा त्रुटिबाट हुने क्षति:</strong> अध्ययन, सर्वेक्षण, अनुसन्धान, परीक्षण, डिजाइन, गणना, ड्रइङ, स्पेसिफिकेसन, सुपरिवेक्षण, प्रमाणीकरण वा सिफारिस गर्दा भएको भूल वा पेसागत दायित्व उल्लङ्घनबाट उत्पन्न जोखिम समेट्नुपर्छ।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                    <span><strong>आर्थिक प्रस्तावमै समावेश गर्नुपर्ने:</strong> बिमा शुल्क (प्रिमियम) लागत अनुमान र आर्थिक प्रस्तावमै समावेश गर्नुपर्छ (नियम ८१(७ख))।</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  २. वैधता अवधि र पेश नगरे हुने घातक सजाय (नियम ८१(८))
                </h4>
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-xs text-red-950 space-y-2">
                  <span className="font-bold text-red-900 block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    बिमा पेश नगरे सम्झौता अन्त्य र कालोसूची सिफारिस:
                  </span>
                  <p className="leading-relaxed">
                    सम्झौता गरेको ३० दिनभित्र तोकिएको पेसागत दायित्व बिमा दाखिला नगरेमा सार्वजनिक निकायले <strong>सम्झौता तत्काल अन्त्य गरी कालोसूचीमा राख्न सिफारिस गर्नुपर्ने</strong> बाध्यात्मक व्यवस्था छ (नियम ८१(८); SRFP GCC २०.१.१(f))।
                  </p>
                  <p className="leading-relaxed font-semibold">
                    बिमा परामर्श सेवा सुरु भएको मितिदेखि सम्झौतामा तोकिएको दायित्व अवधि (Defect Liability Period / Post-completion liability) समाप्त नहुन्जेलसम्म निरन्तर मान्य रहनुपर्छ (नियम ८१(७ग))।
                  </p>
                </div>
              </div>
            </div>

            {/* Statutory Protection Banner */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-950 leading-relaxed flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
              <span>
                <strong>ऐन दफा ५२घ को संरक्षण:</strong> सम्झौताका शर्त विपरीत सार्वजनिक निकायका पदाधिकारीले दबाब दिएर कुनै पनि अधिकार परित्याग गराउन पाउने छैनन्। जबर्जस्ती गराइएको अधिकार परित्याग कानुनतः शून्य र अमान्य हुन्छ।
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: NON-CONSULTING SERVICES HUB (Labor Law & SSF Compliance) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'non-consulting-services' && (
        <div className="space-y-8">
          {/* Section 1: Labor Act, SSF & Service Margin Mandatory Calculator */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                  <Calculator className="w-4 h-4 text-rose-600" />
                  <span>खण्ड १: वैधानिक न्यूनतम पारिश्रमिक, २०% SSF तथा सेवा शुल्क क्याल्कुलेटर</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  श्रम ऐन २०७४ र सामाजिक सुरक्षा ऐन २०७४ बमोजिम अनिवार्य सेवा लागत तथा बिलिङ सिमुलेटर
                </h3>
              </div>
              <span className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full font-semibold">
                PPR नियम ६५ र सर्वोच्च अदालत नजिर
              </span>
            </div>

            {/* Warning Alert if Below Minimum Wage or Zero Margin */}
            {serviceCalculations.isBelowStatutoryMinimum && (
              <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-950 text-xs font-semibold flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-700" />
                <span>गम्भीर चेतावनी: नेपाल सरकारले राजपत्रमा तोकेको न्यूनतम पारिश्रमिक रु. १७,३०० भन्दा कम कबुल गरेमा खरिद ऐनको दफा २३ तथा नियमावलीको नियम ६५ बमोजिम तपाईंको बोलपत्र सोझै सारभूत रूपमा अप्रभावकारी (Non-Responsive) भई रद्द हुनेछ!</span>
              </div>
            )}

            {serviceCalculations.isZeroMargin && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                <span>सचेतना: शून्य प्रतिशत (०%) वा १ पैसा सेवा शुल्क राख्दा सर्वोच्च अदालत र सार्वजनिक खरिद पुनरावलोकन समिति (PPRC) को नजिर अनुसार अस्वस्थ प्रतिस्पर्धा ठहर्‍याई बोलपत्र बदर हुने उच्च जोखिम हुन्छ।</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Labor & SSF Inputs */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  सेवा जनशक्ति तथा पारिश्रमिक दर विवरण:
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      जनशक्ति संख्या (सुरक्षा गार्ड/सरसफाइकर्मी/चालक)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={serviceStaffCount}
                      onChange={(e) => setServiceStaffCount(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">
                      कुल कार्यरत जनशक्ति: {serviceStaffCount} जना
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      आधारभूत न्यूनतम मासिक पारिश्रमिक (तोकिएको रु १७,३००)
                    </label>
                    <input
                      type="number"
                      value={serviceBaseSalary}
                      onChange={(e) => setServiceBaseSalary(Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        महँगी/स्थानीय भत्ता (रु.)
                      </label>
                      <input
                        type="number"
                        value={serviceAllowance}
                        onChange={(e) => setServiceAllowance(Number(e.target.value))}
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        युनिफर्म, PPE र बिमा (प्रति व्यक्ति रु.)
                      </label>
                      <input
                        type="number"
                        value={serviceUniformPpe}
                        onChange={(e) => setServiceUniformPpe(Number(e.target.value))}
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      सेवा प्रदायकको व्यवस्थापकीय सेवा शुल्क (Overhead Margin %)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={serviceMarginPercent}
                      onChange={(e) => setServiceMarginPercent(Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">
                      प्रस्तावित सेवा शुल्क: {serviceMarginPercent}% (मासिक रु. {Math.round(serviceCalculations.overheadMargin).toLocaleString('ne-NP')})
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={serviceIncludeSsf}
                        onChange={(e) => setServiceIncludeSsf(e.target.checked)}
                        className="rounded-sm text-rose-700"
                      />
                      <span>रोजगारदाताको २०% SSF योगदान जोड्ने (उपदान ८.३३% + सञ्चय १०% + स्वास्थ्य १.६७%)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={serviceIncludeBonus}
                        onChange={(e) => setServiceIncludeBonus(e.target.checked)}
                        className="rounded-sm text-rose-700"
                      />
                      <span>१ महिनाको चाडपर्व खर्च (वार्षिक १ तलबलाई १२ महिनामा विभाजन)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={serviceApplyVat}
                        onChange={(e) => setServiceApplyVat(e.target.checked)}
                        className="rounded-sm text-rose-700"
                      />
                      <span>१३% भ्याट लागू हुने</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Labor & SSF Outputs */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  न्यूनतम वैधानिक लागत र बिलिङ नतिजा:
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                    <span>प्रति व्यक्ति आधारभूत तलब + भत्ता:</span>
                    <strong className="text-slate-900">रु. {Math.round(serviceCalculations.basicPlusAllowance).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                    <span>नियोक्ताको २०% SSF योगदान:</span>
                    <strong className="text-slate-900">रु. {Math.round(serviceCalculations.ssfEmployerCost).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                    <span>प्रति व्यक्ति चाडपर्व खर्च + PPE:</span>
                    <strong className="text-slate-900">रु. {Math.round(serviceCalculations.festivalCost + serviceUniformPpe).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                    <span>प्रति व्यक्ति न्यूनतम मासिक लागत:</span>
                    <strong className="text-rose-950 font-bold">रु. {Math.round(serviceCalculations.monthlyCostPerPerson).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                    <span>कुल {serviceStaffCount} जनाको प्रत्यक्ष श्रमिक लागत:</span>
                    <strong className="text-slate-900">रु. {Math.round(serviceCalculations.totalStaffMonthlyBase).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                    <span>सेवा प्रदायकको व्यवस्थापकीय शुल्क ({serviceMarginPercent}%):</span>
                    <strong className="text-emerald-800 font-bold">रु. {Math.round(serviceCalculations.overheadMargin).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                    <span>१३% मूल्य अभिवृद्धि कर (VAT):</span>
                    <strong className="text-slate-900">रु. {Math.round(serviceCalculations.monthlyVat).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-bold text-slate-900">कुल मासिक बिल रकम (Grand Total):</span>
                    <strong className="text-rose-900 text-sm font-extrabold">रु. {Math.round(serviceCalculations.monthlyGrandTotal).toLocaleString('ne-NP')}</strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>वार्षिक अनुमानित सम्झौता रकम (१२ महिना):</span>
                    <span className="font-semibold text-slate-800">रु. {Math.round(serviceCalculations.annualGrandTotal).toLocaleString('ne-NP')}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-rose-200 text-[11px] text-slate-600 leading-relaxed">
                  नोट: सम्झौता पश्चात मासिक बिल भुक्तानी लिँदा प्रत्येक कामदारको बैंक खातामा तलब जम्मा भएको भौचर र अघिल्लो महिनाको SSF भुक्तानी निस्सा अनिवार्य संलग्न गर्नुपर्छ।
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Non-Consulting Qualification & Capacity Self-Assessment */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>खण्ड २: सेवा प्रदायकको योग्यता तथा वित्तीय स्व-मूल्याङ्कन (PPMO SBD Section III)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  गैर-परामर्श सेवा बोलपत्रमा कारोबार, अनुभव र नगद प्रवाह परीक्षण
                </h3>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${isNcEligible
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
              >
                {isNcEligible ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>सेवा बोलपत्रका लागि प्रारम्भिक रूपमा योग्य</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>केही मापदण्डहरू सुधार गर्नुपर्ने</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  बोलपत्रको लागत अनुमान (रु.)
                </label>
                <input
                  type="number"
                  value={ncEstAmount}
                  onChange={(e) => {
                    const est = Number(e.target.value);
                    setNcEstAmount(est);
                    setNcTurnoverReq(Math.round(est * 0.8));
                    setNcExpReq(Math.round(est * 0.5));
                    setNcLiquidReq(Math.round(est * 0.25));
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {ncEstAmount.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  औसत वार्षिक कारोबार माग (८०% रु.)
                </label>
                <input
                  type="number"
                  value={ncTurnoverReq}
                  onChange={(e) => setNcTurnoverReq(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  माग: रु. {ncTurnoverReq.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  सेवा प्रदायकको वार्षिक कारोबार (३ आ.व. को औसत)
                </label>
                <input
                  type="number"
                  value={ncSupplierTurnover}
                  onChange={(e) => setNcSupplierTurnover(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  तपाईंको कारोबार: रु. {ncSupplierTurnover.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  सम्पन्न समान सेवा सम्झौता रकम (५०%)
                </label>
                <input
                  type="number"
                  value={ncSupplierExp}
                  onChange={(e) => setNcSupplierExp(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  माग: रु. {ncExpReq.toLocaleString('ne-NP')} | सम्पन्न: रु. {ncSupplierExp.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${ncSupplierTurnover >= ncTurnoverReq ? 'bg-emerald-50/70 border-emerald-200' : 'bg-red-50/70 border-red-200'}`}>
                <div className="flex justify-between text-xs font-bold">
                  <span>१. वार्षिक कारोबार (Turnover)</span>
                  <span className={ncSupplierTurnover >= ncTurnoverReq ? 'text-emerald-700' : 'text-red-700'}>
                    {ncSupplierTurnover >= ncTurnoverReq ? 'योग्य ✓' : 'अपुग ✗'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">रु. {ncSupplierTurnover.toLocaleString('ne-NP')}</div>
              </div>

              <div className={`p-4 rounded-xl border ${ncSupplierExp >= ncExpReq ? 'bg-emerald-50/70 border-emerald-200' : 'bg-red-50/70 border-red-200'}`}>
                <div className="flex justify-between text-xs font-bold">
                  <span>२. समान सेवा अनुभव</span>
                  <span className={ncSupplierExp >= ncExpReq ? 'text-emerald-700' : 'text-red-700'}>
                    {ncSupplierExp >= ncExpReq ? 'योग्य ✓' : 'अपुग ✗'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">रु. {ncSupplierExp.toLocaleString('ne-NP')}</div>
              </div>

              <div className={`p-4 rounded-xl border ${ncSupplierLiquid >= ncLiquidReq ? 'bg-emerald-50/70 border-emerald-200' : 'bg-red-50/70 border-red-200'}`}>
                <div className="flex justify-between text-xs font-bold">
                  <span>३. वित्तीय स्रोत / क्रेडिट लाइन</span>
                  <span className={ncSupplierLiquid >= ncLiquidReq ? 'text-emerald-700' : 'text-red-700'}>
                    {ncSupplierLiquid >= ncLiquidReq ? 'योग्य ✓' : 'अपुग ✗'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">रु. {ncSupplierLiquid.toLocaleString('ne-NP')}</div>
              </div>
            </div>
          </div>

          {/* Section 3: 4 Mandatory Statutory Licenses & Compliance */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
              <CheckSquare className="w-4 h-4 text-rose-600" />
              <span>खण्ड ३: गैर-परामर्श सेवा बोलपत्रमा अनिवार्य हुने ४ वैधानिक इजाजतपत्र तथा सर्तहरू</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-[10px]">१</span>
                  <span>गृह मन्त्रालय अनुमति (सुरक्षा सेवा)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  सुरक्षा गार्ड सेवा प्रदान गर्न गृह मन्त्रालयबाट जारी भएको चालू इजाजतपत्र तथा जिल्ला प्रशासन कार्यालयमा दर्ता अभिलेख।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-[10px]">२</span>
                  <span>श्रम विभाग इजाजतपत्र</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  श्रम तथा व्यवसायजन्य सुरक्षा विभागबाट श्रमिक आपूर्तिकर्ता (Labor Supplier) को रूपमा दर्ता भई चालू नवीकरण प्रमाणपत्र।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-[10px]">३</span>
                  <span>SSF सूचीकरण प्रमाणपत्र</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  सामाजिक सुरक्षा कोष (SSF) मा रोजगारदाताको रूपमा दर्ता भई नियमित योगदान दाखिला गरिरहेको अद्यावधिक निस्सा।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-[10px]">४</span>
                  <span>बैंक खाता मार्फत तलब प्रतिबद्धता</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  सबै श्रमिकहरूको व्यक्तिगत 'क' वर्गको बैंक खाता खोली पारिश्रमिक सिधै बैंक दाखिला गर्ने लिखित वैधानिक प्रतिबद्धता पत्र।
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Daily Attendance & Monthly Payment Workflow */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>खण्ड ४: सेवा सञ्चालन, दैनिक हाजिरी र मासिक भुक्तानी कार्यविधि (PPR नियम ११९ र १२२)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-sm inline-block">
                  चरण १: दैनिक हाजिरी रुजु
                </span>
                <p className="text-slate-600 leading-relaxed">
                  कार्यस्थलमा खटिएका कर्मचारीहरूको दैनिक बायोमेट्रिक वा लगबुक हाजिरी सार्वजनिक निकायको प्रशासन शाखाबाट प्रमाणित गराउने।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-sm inline-block">
                  चरण २: बैंक दाखिला विवरण
                </span>
                <p className="text-slate-600 leading-relaxed">
                  श्रमिकहरूको बैंक खातामा अघिल्लो महिनाको तलब जम्मा भएको बैंक ट्रान्सफर भौचर तथा स्टेटमेन्ट संलग्न गर्ने।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-sm inline-block">
                  चरण ३: SSF दाखिला निस्सा
                </span>
                <p className="text-slate-600 leading-relaxed">
                  कामदारको ३१% (२०% रोजगारदाता + ११% श्रमिक) रकम सामाजिक सुरक्षा कोषमा जम्मा गरेको आधिकारिक अनलाइन रसिद पेश गर्ने।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-sm inline-block">
                  चरण ४: मासिक बीजक भुक्तानी
                </span>
                <p className="text-slate-600 leading-relaxed">
                  सबै प्रमाण रुजु भएपछि निकायले सेवा शुल्क र १३% भ्याट सहित सेवा प्रदायकको खातामा चालू महिनाको रकम भुक्तानी गर्छ।
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Absenteeism Penalty & Reliever Rules */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>खण्ड ५: कामदार अनुपस्थिति हर्जाना तथा प्रतिस्थापन जनशक्ति (Penalty & Reliever Rules)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <strong className="text-amber-950 block font-bold">१. अनुपस्थित भएमा तलब कट्टा:</strong>
                <p>
                  कुनै श्रमिक बिदा वा अनुपस्थित भएमा उक्त दिनको दैनिक दर अनुसार मासिक बिलबाट सोझै पारिश्रमिक कट्टा गरिनेछ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <strong className="text-amber-950 block font-bold">२. प्रतिस्थापन (Reliever) नखटाए जरिवाना:</strong>
                <p>
                  अनुपस्थित श्रमिकको सट्टा २ घण्टाभित्र वैकल्पिक प्रतिस्थापन (Reliever) नखटाए सम्झौता सर्त अनुसार प्रति व्यक्ति दैनिक रु. ५०० देखि १,००० सम्म जरिवाना काटिनेछ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <strong className="text-amber-950 block font-bold">३. अनिवार्य पोसाक र सुरक्षा सामग्री (PPE):</strong>
                <p>
                  नियम अनुसार तोकिएको युनिफर्म, नेमप्लेट, र सुरक्षा उपकरण (PPE) बिना ड्युटीमा खटाइएमा सेवा प्रदायकलाई कारबाही गरिनेछ।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: FATAL MISTAKES & RISK AUDITOR HUB */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'fatal-mistakes' && (
        <div className="space-y-8">
          <GuideSourceNotice />
          {/* Section 1: Bid Security Validity Calculator */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                  <Clock className="w-4 h-4" />
                  <span>औजार १: बैंक जमानत म्याद र रकम प्रमाणीकरण क्याल्कुलेटर (Bid Security Checker)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  नियम ५० अनुसार '१ दिनको म्याद कमी' पासोबाट जोगिने क्याल्कुलेटर
                </h3>
              </div>
              <span className="text-xs bg-rose-50 text-rose-900 border border-rose-200 px-3 py-1 rounded-full font-semibold">
                खरिद नियमावली नियम ५०
              </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  बोलपत्रको मान्य अवधि (दिन)
                </label>
                <select
                  value={bgSubmissionDays}
                  onChange={(e) => setBgSubmissionDays(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                >
                  <option value={90}>९० दिन (रु. १० करोडसम्मको खरिदमा)</option>
                  <option value={120}>१२० दिन (रु. १० करोडभन्दा माथिको खरिदमा)</option>
                  <option value={45}>४५ दिन (सिलबन्दी दरभाउपत्र - SQ)</option>
                  <option value={30}>३० दिन (विशेष संक्षिप्त खरिद)</option>
                </select>
                <span className="text-[10px] text-slate-500">
                  SBD Section I (ITB Clause 18.1) अनुसार
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  लागत अनुमान रकम (भ्याट बाहेक रु.)
                </label>
                <input
                  type="number"
                  value={bgEstimateAmt}
                  onChange={(e) => setBgEstimateAmt(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  रु. {bgEstimateAmt.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  जमानत प्रतिशत (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="5"
                  value={bgSecurityRate}
                  onChange={(e) => setBgSecurityRate(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">
                  सामान्यतया २% देखि ३% (मानक २.५%)
                </span>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  बोलपत्र मान्य अवधि (Bid Validity)
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                  {bgSubmissionDays} दिन
                </span>
                <span className="text-[10px] text-slate-500">
                  (बिड खोल्ने मितिबाट गणना)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200">
                <span className="text-[11px] font-semibold text-rose-800 block">
                  बैंक ग्यारेन्टीको अनिवार्य म्याद (नियम ५०)
                </span>
                <span className="text-base sm:text-lg font-extrabold text-rose-950 mt-0.5 block">
                  {bgCalculations.requiredSecurityDays} दिन अनिवार्य
                </span>
                <span className="text-[10px] text-rose-700">
                  (बोलपत्र मान्य अवधि + ३० दिन थप)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800 block">
                  सुरक्षित सिफारिस म्याद (Safe Buffer)
                </span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-950 mt-0.5 block">
                  {bgCalculations.safeRecommendedDays} दिन राख्नुहोस्
                </span>
                <span className="text-[10px] text-emerald-700">
                  (१ दिनको कमीले बिड खारेज हुनबाट बचाउने)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white shadow-sm">
                <span className="text-[11px] font-medium text-rose-300 block">
                  न्यूनतम बैंक धरौटी रकम
                </span>
                <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">
                  रु. {Math.round(bgCalculations.minSecurityAmount).toLocaleString('ne-NP')}
                </span>
                <span className="text-[10px] text-slate-300">
                  (लागत अनुमानको {bgSecurityRate}%)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">PPRC को सर्वसम्मत नजिर:</strong>
                यदि बोलपत्र कागजातमा १२० दिनको बैंक ग्यारेन्टी माग भएकोमा बैंकले ११९ दिन मात्र लेखिदियो भने मूल्याङ्कन समितिले कुनै पनि स्पष्टीकरण नमागी सिधै बोलपत्र गैर-जिम्मेवार (Non-Responsive) ठहर गर्दछ। त्यसैले बैंकबाट ग्यारेन्टी पत्र बुझ्दा अनिवार्य रूपमा मिति र दिन गणना गर्नुहोस्।
              </div>
            </div>
          </div>

          {/* Section 2: Pre-Bid Risk Auditor */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>औजार २: बोलपत्र पेश गर्नुपूर्वको जोखिम अडिटर (Pre-Bid Risk Auditor)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  बिड सबमिट गर्नुअघि १० संवेदनशील बुँदा जाँची आफ्नो रेडीनेस स्कोर निकाल्नुहोस्
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleResetAudit}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>रिसेट गर्नुहोस्</span>
                </button>
              </div>
            </div>

            {/* Score and Status Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>अडिट प्रगति:</span>
                  <span className="text-purple-700">{auditCompletedCount} / 10 बुँदा सुरक्षित</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${auditRiskLevel === 'safe'
                      ? 'bg-emerald-600'
                      : auditRiskLevel === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                      }`}
                    style={{ width: `${auditPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border sm:col-span-2 flex items-center gap-3.5 bg-slate-50 border-slate-200">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${auditRiskLevel === 'safe'
                    ? 'bg-emerald-100 text-emerald-800'
                    : auditRiskLevel === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                    }`}
                >
                  {auditRiskLevel === 'safe' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : auditRiskLevel === 'medium' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    जोखिम स्तर (Risk Level):
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {auditRiskLevel === 'safe' && '🟢 सुरक्षित बोलपत्र (Safe to Submit) - कुनै गम्भीर त्रुटि देखिएन'}
                    {auditRiskLevel === 'medium' && '🟡 मध्यम जोखिम (Review Required) - केही संवेदनशील शर्तहरू छुटेका छन्'}
                    {auditRiskLevel === 'high' && '🔴 उच्च जोखिम (High Disqualification Risk) - यी कैफियत नसच्याई बिड हाल्दा बदर हुने जोखिम उच्च छ'}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Checklist Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRE_BID_RISK_AUDIT_ITEMS.map((item) => {
                const isChecked = !!auditCheckedItems[item.id];
                return (
                  <div
                    key={item.id}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleToggleAudit(item.id);
                      }
                    }}
                    onClick={() => handleToggleAudit(item.id)}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all select-none ${isChecked
                      ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                  >
                    <div
                      className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center border transition-all shrink-0 ${isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                        : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                        }`}
                    >
                      <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform ${isChecked ? 'scale-100' : 'scale-50'}`} />
                    </div>
                    <div className="text-xs leading-relaxed flex-1 space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center justify-between gap-2">
                        <span>{item.question}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm shrink-0">
                          {item.ruleRef}
                        </span>
                      </div>
                      {!isChecked && (
                        <p className="text-[11px] text-rose-700 font-medium">
                          ⚠️ जोखिम: {item.riskIfNo}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: 15 Fatal Mistakes Database */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                  <FileWarning className="w-4 h-4" />
                  <span>खण्ड ३: हेर्दा साना तर बोलपत्र सिधै बदर गराउने १६ घातक गल्तीहरू (Detailed Case Database)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  कानूनी छिद्रहरू, स्थापित नजिरहरू, र बच्ने व्यावहारिक सुरक्षा उपायहरू
                </h3>
              </div>

              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="गल्ती वा नजिर खोज्नुहोस्..."
                    value={mistakeSearchQuery}
                    onChange={(e) => setMistakeSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {FATAL_MISTAKES_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setMistakeCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${mistakeCategoryFilter === cat.id
                    ? 'bg-rose-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Mistakes List */}
            <div className="space-y-4">
              {filteredFatalMistakes.map((mistake) => {
                const isExpanded = expandedMistakeId === mistake.id;
                return (
                  <div
                    key={mistake.id}
                    className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div
                      onClick={() => setExpandedMistakeId(isExpanded ? null : mistake.id)}
                      className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${mistake.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                              }`}
                          >
                            {mistake.severity === 'critical' ? 'अति संवेदनशील' : 'उच्च जोखिम'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {mistake.categoryNepali}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {mistake.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          <strong>हेर्दा सानो लाग्ने गल्ती:</strong> {mistake.subtleMistake}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-700 shrink-0 flex items-center gap-1 hover:text-rose-900 mt-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'विवरण बन्द गर्नुहोस्' : 'विस्तृत विवरण हेर्नुहोस्'}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/50 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 space-y-1 text-slate-800">
                            <span className="font-bold text-red-900 block flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-red-700" />
                              <span>कानूनी परिणाम (Legal Consequence):</span>
                            </span>
                            <p className="leading-relaxed">{mistake.legalConsequence}</p>
                            <span className="text-[11px] text-slate-600 block mt-1 font-semibold">
                              कानूनी आधार: {mistake.legalReference}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-1 text-slate-800">
                            <span className="font-bold text-purple-900 block flex items-center gap-1.5">
                              <Scale className="w-4 h-4 text-purple-700" />
                              <span>PPRC वा अदालतको वास्तविक नजिर:</span>
                            </span>
                            <p className="leading-relaxed">{mistake.precedentReference}</p>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-slate-800">
                          <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>बच्ने सुरक्षित उपाय (Safe Prevention Protocol):</span>
                          </span>
                          <p className="leading-relaxed">{mistake.safePreventionProtocol}</p>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-slate-700">
                          <span className="font-semibold text-slate-900">
                            🔍 तुरुन्तै रुजु गर्ने टिप्स:
                          </span>
                          <span className="text-slate-600">{mistake.checklistHint}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: BIDDING FORMS GENERATOR */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'forms' && <BiddingFormsGenerator hideHeader={true} />}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: PRE-BID SUBMISSION 30-POINT CHECKLIST & PPRC PRECEDENTS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  बोलपत्र पेश गर्नुपूर्वको अनिवार्य ३०-बुँदे चेकलिस्ट (Pre-Bid Check)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  बोलपत्र प्राविधिक वा कानूनी त्रुटिका कारण गैर-जिम्मेवार (Non-Responsive) हुनबाट जोगिन यी ३० वटा बुँदाहरू अनिवार्य रुजु गर्नुहोस्।
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिन्ट गर्नुहोस्</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>रिसेट</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>चेकलिस्ट प्रगति: {checkedCount} / {totalCheckItems} बुँदा रुजु गरियो</span>
                <span className="text-emerald-700">{checklistProgressPercent}% पूरा</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checklistProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist Sections */}
            <div className="space-y-6">
              {checklistSections.map((sec) => (
                <div key={sec.id} className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                    {sec.title}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {sec.items.map((item) => {
                      const isChecked = !!checkedItems[item.id];
                      return (
                        <div
                          key={item.id}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              handleToggleCheck(item.id);
                            }
                          }}
                          onClick={() => handleToggleCheck(item.id)}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all select-none ${isChecked
                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                          <div
                            className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center border transition-all shrink-0 ${isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                              : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                              }`}
                          >
                            <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform ${isChecked ? 'scale-100' : 'scale-50'}`} />
                          </div>
                          <div className="text-xs leading-relaxed flex-1">
                            <span className={isChecked ? 'line-through text-slate-400 font-normal' : 'font-medium text-slate-800'}>
                              {item.text}
                            </span>
                            {item.required && (
                              <span className="ml-2 text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-sm">
                                अनिवार्य
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* PPRC Precedents Section: Real Disqualification Cases */}
            <div className="mt-10 pt-6 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
                    <Scale className="w-4 h-4" />
                    <span>PPRC का स्थापित नजिरहरू (Precedents on Bid Disqualification)</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    बोलपत्रदाताका पक्ष र विपक्षमा भएका वास्तविक पुनरावलोकन निर्णयहरू
                  </h3>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="नजिर खोज्नुहोस्..."
                    value={precedentSearch}
                    onChange={(e) => setPrecedentSearch(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredPrecedents.map((precedent) => (
                  <div
                    key={precedent.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-2xs transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <div>
                        <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md mr-2">
                          {precedent.caseNo}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{precedent.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${precedent.pprcVerdict === 'favour-bidder'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {precedent.pprcVerdict === 'favour-bidder'
                          ? 'बोलपत्रदाताको पक्षमा निर्णय'
                          : 'सार्वजनिक निकायको पक्षमा (बोलपत्र बदर)'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <p>
                        <strong>निवेदक:</strong> {precedent.applicant} | <strong>विपक्षी:</strong>{' '}
                        {precedent.respondent}
                      </p>
                      <p>
                        <strong>विवादित प्रश्न:</strong> {precedent.keyLegalIssue}
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        <strong>PPRC को फैसला सार:</strong> {precedent.decisionSummary}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>बोलपत्रदाताले सिक्नुपर्ने मुख्य पाठ:</strong>{' '}
                        {precedent.lessonForBidders}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: E-GP BIDDER GUIDE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'egp-guide' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
                <FileCheck2 className="w-4 h-4" />
                <span>विद्युतीय खरिद प्रणाली सञ्चालन निर्देशिका, २०८० अनुसार</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                e-GP पोर्टलमा बोलपत्रदाताहरूको ६-चरणबद्ध बिडिङ प्रक्रिया
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                PPMO को e-GP पोर्टल (www.bolpatra.gov.np/egp) मा बिड तयार गर्दा, दस्तुर बुझाउँदा र सबमिट गर्दा पालना गर्नुपर्ने चरणहरू:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  step: '१',
                  title: 'दर्ता तथा डिजिटल हस्ताक्षर (Token/DSC)',
                  desc: 'कम्पनीको स्थायी लेखा नम्बर (PAN) र आधिकारिक विवरणसहित e-GP मा प्रोफाइल बनाउने र मान्यता प्राप्त संस्थाबाट डिजिटल हस्ताक्षर (Token) लिई इन्स्टल गर्ने।',
                  clause: 'निर्देशिका दफा ९-१२',
                  points: ['e-GP Signer वा PKI Component अनिवार्य इन्स्टल गर्नुहोस्', 'टोकनको वैधता कम्तीमा १ वर्ष हुनुपर्ने', 'कम्पनीको आधिकारिक इमेल दर्ता गर्नुपर्ने'],
                },
                {
                  step: '२',
                  title: 'बोलपत्र कागजात खोज तथा डाउनलोड',
                  desc: 'IFB No. वा कार्यालयको नामबाट बोलपत्र खोज्ने र सम्पूर्ण SBD कागजात, ड्रइङ, स्पेसिफिकेसन तथा संशोधन (Addenda) निःशुल्क डाउनलोड गर्ने।',
                  clause: 'निर्देशिका दफा २३-२४',
                  points: ['My Bids मा गएर टेन्डर My Saved Bids मा राख्नुहोस्', 'Addendum जारी भएको छ कि छैन अन्तिम समयसम्म रुजु गर्नुहोस्'],
                },
                {
                  step: '३',
                  title: 'दस्तुर तथा जमानत दाखिला (Payment)',
                  desc: 'बोलपत्र फाराम दस्तुर ConnectIPS/e-Payment बाट राजस्व खातामा र धरौटी बापतको रकम धरौटी खातामा जम्मा गरी भौचर वा बैंक ग्यारेन्टी स्क्यान गरी अपलोड गर्ने।',
                  clause: 'निर्देशिका दफा २१-२२',
                  points: ['राजस्व शीर्षक नं. र कार्यालय कोड स्पष्ट भर्नुहोस्', 'अनलाइन बैंक ग्यारेन्टी भेरिफिकेसन कोड जाँच गर्नुहोस्'],
                },
                {
                  step: '४',
                  title: '१ वा २ खाम प्रस्ताव तयारी तथा अपलोड',
                  desc: 'प्राविधिक प्रस्तावमा योग्यता सम्बन्धी सम्पूर्ण कागजात र आर्थिक प्रस्तावमा प्रणालीबाट प्राप्त BOQ एक्सल फाइलमा दररेट भरी सही ढाँचामा अपलोड गर्ने।',
                  clause: 'निर्देशिका दफा २६-२७',
                  points: ['BOQ को कुनै फर्मुला फेरबदल नगर्नुहोस्', 'प्राविधिक खाममा मूल्यको कुनै अंश नपरोस्'],
                },
                {
                  step: '५',
                  title: 'डिजिटल हस्ताक्षर, सबमिसन तथा ह्यास',
                  desc: 'डिजिटल सिग्नेचर टोकन मार्फत फाइल इन्क्रिप्ट गरी अन्तिम बिड सबमिट गर्ने र सबमिसन ह्यास (Hash Slip) प्रिन्ट/सुरक्षित राख्ने।',
                  clause: 'निर्देशिका दफा २८-२९',
                  points: ['सबमिसन कन्फर्मेसन स्लिप डाउनलोड गर्नुहोस्', 'म्याद सकिनुभन्दा कम्तीमा ४ घण्टा अगावै बिड सबमिट गर्नुहोस्'],
                },
                {
                  step: '६',
                  title: 'अनलाइन बिड खोल्ने र मूल्यांकन नतिजा',
                  desc: 'तोकिएको मिति र समयमा e-GP बाट स्वतः बिड खोल्ने सारांश (Bid Opening Record) हेर्ने र मूल्यांकन पश्चात प्रकाशित हुने LOI नतिजा अनुगमन गर्ने।',
                  clause: 'निर्देशिका दफा ३१-३४',
                  points: ['Bid Opening Summary बाट प्रतिस्पर्धीको दररेट हेर्नुहोस्', 'LOI जारी भएको ७ दिनभित्र दाबी/पुनरावलोकन गर्न सकिन्छ'],
                },
              ].map((stepItem) => (
                <div
                  key={stepItem.step}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {stepItem.step}
                    </span>
                    <span className="text-[10px] text-blue-900 bg-blue-100 font-semibold px-2 py-0.5 rounded-md">
                      {stepItem.clause}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {stepItem.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {stepItem.desc}
                  </p>
                  <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                    {stepItem.points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Common e-GP Technical Problems & Solutions */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-700" />
                <span>बोलपत्रदाताहरूले e-GP मा भोग्ने सामान्य प्राविधिक समस्या र समाधान (Troubleshooting):</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-semibold block">
                    Q: BOQ फाइल अपलोड गर्दा 'Calculation/Formula Mismatch' भन्छ, के गर्ने?
                  </strong>
                  <p className="text-slate-600 leading-relaxed">
                    A: e-GP बाट डाउनलोड भएको मूल एक्सल फाइलको फर्म्याट, कोलम वा फर्मुला परिमार्जन नगरी केवल 'Rate' कोलममा मात्र दर भर्नुपर्छ। दर भरेपछि फाइल सेभ गर्दा नाम नफेर्नुहोस्।
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-semibold block">
                    Q: डिजिटल हस्ताक्षर (Token) ले हस्ताक्षर गर्दा 'Token Not Found' भन्छ?
                  </strong>
                  <p className="text-slate-600 leading-relaxed">
                    A: ब्राउजरमा e-GP Signer वा PKI Component चालु (Active) छ कि छैन जाँच गर्नुहोस्। कम्प्युटर रिस्टार्ट गरी टोकनको ड्राइभर पुनः इन्स्टल गर्नुहोस्।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: ADMINISTRATIVE REVIEW & GRIEVANCE (दफा ४७ र ४९) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'review' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-800">
                <Scale className="w-4 h-4" />
                <span>सार्वजनिक खरिद ऐन, २०६३ • परिच्छेद ४ (पुनरावलोकन)</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                बोलपत्रदाताको पुनरावलोकन तथा उजुरी सम्बन्धी हक र प्रक्रिया
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                मूल्याङ्कनमा अन्याय भएको महसुस भएमा खरिद ऐनको दफा ४७ र ४९ बमोजिम अवलम्बन गर्नुपर्ने कानूनी चरणहरू:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Head of Procuring Entity (Section 47) */}
              <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold bg-blue-800 text-white px-2.5 py-1 rounded-lg">
                    पहिलो चरण: कार्यालय प्रमुख समक्ष निवेदन
                  </span>
                  <span className="text-xs font-bold text-blue-900">दफा ४७</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  आशयको सूचना (LOI) प्रकाशित भएको ७ दिनभित्र निवेदन
                </h3>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                  <li>सार्वजनिक निकायले बोलपत्र स्वीकृत गर्ने आशयको सूचना प्रकाशित गरेको ७ दिनभित्र निर्णयकर्ता कार्यालय प्रमुख समक्ष निवेदन दिनुपर्नेछ।</li>
                  <li>निवेदन दर्ता भएको मितिले ५ दिनभित्र कार्यालय प्रमुखले छानबिन गरी निर्णय दिनुपर्छ।</li>
                  <li>कार्यालय प्रमुखले निवेदन मनासिव देखेमा मूल्याङ्कन प्रक्रिया सच्याउन आदेश दिनेछ।</li>
                </ul>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('forms')}
                    className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>दफा ४७ को निवेदन ढाँचा हेर्नुहोस्</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step 2: Review Committee - PPRC (Section 49) */}
              <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold bg-purple-800 text-white px-2.5 py-1 rounded-lg">
                    दोस्रो चरण: पुनरावलोकन समिति (PPRC)
                  </span>
                  <span className="text-xs font-bold text-purple-900">दफा ४९</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  कार्यालय प्रमुखको निर्णय चित्त नबुझेमा ७ दिनभित्र PPRC मा
                </h3>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                  <li>कार्यालय प्रमुखले म्यादभित्र निर्णय नदिएमा वा निर्णय चित्त नबुझेमा सार्वजनिक खरिद पुनरावलोकन समिति (PPRC) मा निवेदन दिन सकिन्छ।</li>
                  <li>निवेदनसाथ बोलपत्र रकमको ०.१५% धरौटी (नगद भौचर वा बैंक ग्यारेन्टी) बुझाउनु अनिवार्य हुन्छ।</li>
                  <li>PPRC ले निवेदन परेको ३० दिनभित्र अन्तिम निर्णय दिन्छ र निर्णय नहुँदासम्म ठेक्का सम्झौता रोक्का (Stay) रहन सक्छ।</li>
                </ul>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('forms')}
                    className="text-xs font-bold text-purple-800 hover:text-purple-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>PPRC पुनरावलोकन निवेदन ढाँचा हेर्नुहोस्</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Deposit Calculator for PPRC */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  PPRC पुनरावलोकन धरौटी (०.१५%) द्रुत क्याल्कुलेटर:
                </span>
                <span className="text-xs text-slate-600">
                  कबुल रकम रु {calcBidAmount.toLocaleString('ne-NP')} को ०.१५% धरौटी रकम
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">आवश्यक धरौटी:</span>
                <span className="text-sm font-bold text-purple-900">
                  रु. {Math.round(calcBidAmount * 0.0015).toLocaleString('ne-NP')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: SBD REPOSITORY (FOR_BIDDERS FILES BROWSER & DOWNLOADS) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'sbd-hub' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-800">
                  <BookOpen className="w-4 h-4" />
                  <span>PPMO Standard Bidding Documents (SBDs) भण्डार</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  सार्वजनिक खरिद आधिकारिक नमूना बोलपत्र कागजातहरू
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  सार्वजनिक खरिद अनुगमन कार्यालयले स्वीकृत गरेका निर्माण कार्य, मालसामान, परामर्श सेवा र राशन खरिदका आधिकारिक Word/PDF कागजातहरू डाउनलोड गर्नुहोस्।
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold">
                  कुल कागजात: {filteredSbds.length}
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'सबै विधा' },
                  { id: 'works', label: 'निर्माण कार्य (Works)' },
                  { id: 'goods', label: 'मालसामान (Goods)' },
                  { id: 'services', label: 'परामर्श सेवा (Services)' },
                  { id: 'special', label: 'विशेष खरिद (राशन)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSbdCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${sbdCategoryFilter === cat.id
                      ? 'bg-purple-800 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px] sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="कागजात खोज्नुहोस्..."
                  value={sbdSearchQuery}
                  onChange={(e) => setSbdSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* SBD Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSbds.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md">
                        {doc.categoryNepali}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {doc.fileType.toUpperCase()} • {doc.fileSizeText}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {doc.titleNepali}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {doc.titleEnglish}
                    </p>

                    <div className="pt-2 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">खरिद विधि:</span>
                        <span className="font-semibold text-slate-800">{doc.biddingMethod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">सीमा/थ्रेसहोल्ड:</span>
                        <span className="font-semibold text-slate-800">{doc.thresholdNepali}</span>
                      </div>
                    </div>

                    {/* Critical advice snippet */}
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs">
                      <strong>बोलपत्रदाताले ख्याल गर्नुपर्ने:</strong> {doc.criticalBidderAdvice}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSbdForModal(doc)}
                      className="px-3 py-1.5 text-xs font-semibold text-purple-800 hover:text-purple-950 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    >
                      BDS मुख्य बुँदाहरू हेर्नुहोस्
                    </button>

                    <a
                      href={doc.fileUrl}
                      download={doc.fileName}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>डाउनलोड ({doc.fileType.toUpperCase()})</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* BDS Details Modal */}
            {selectedSbdForModal && (
              <div
                className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity"
                onClick={() => setSelectedSbdForModal(null)}
              >
                <div
                  className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-md">
                        {selectedSbdForModal.categoryNepali}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {selectedSbdForModal.titleNepali}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedSbdForModal.titleEnglish}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSbdForModal(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      BDS (Bid Data Sheet) का प्रमुख व्यवस्थाहरू:
                    </h4>
                    <div className="space-y-2">
                      {selectedSbdForModal.bdsHighlights.map((hl, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <strong className="text-slate-900 block font-semibold">{hl.label}</strong>
                          <span className="text-slate-600 mt-0.5 block leading-relaxed">{hl.description}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                      <strong>विशेष मार्गदर्शन:</strong> {selectedSbdForModal.criticalBidderAdvice}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      फाइल: {selectedSbdForModal.fileName}
                    </span>
                    <a
                      href={selectedSbdForModal.fileUrl}
                      download={selectedSbdForModal.fileName}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>आधिकारिक फाइल डाउनलोड गर्नुहोस्</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: RATION PROCUREMENT HUB (PPA Sec 42, PPR Rule 88-93) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'ration-procurement' && (
        <RationProcurementHub />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: BID / NO-BID STRATEGIC ANALYZER (PPA Sec 10, 25 & SBD) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'bid-no-bid' && (
        <BidNoBidAnalyzer />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: ICB PROCUREMENT HUB (BIDDER MODE) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'icb-procurement' && (
        <IcbProcurementHub initialUserMode="bidder" />
      )}
    </div>
  );
};
