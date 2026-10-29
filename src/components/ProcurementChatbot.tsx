import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bot, BookOpen, FileText, Mic, MicOff, RotateCcw, Search, Send, Sparkles, Volume2, VolumeX } from 'lucide-react';
import {
  PROCUREMENT_OFFICIAL_LINKS,
  ProcurementEvidence,
  searchProcurementKnowledge,
} from '../lib/procurementKnowledge';
import { supabase } from '../lib/supabase';

interface ProcurementChatbotProps {
  onNavigate: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: ProcurementEvidence[];
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const suggestedQuestions = [
  'भेरिएसन आदेशमा के प्रक्रिया र सीमा उल्लेख छन्?',
  'एक मात्र बोलपत्र परेपछि कुन स्रोत हेर्ने?',
  'कुन SBD/DBD कागजात कुन खरिद विधिका लागि छ?',
  'बोलपत्र मूल्याङ्कनका लागि एपमा रहेका कानुनी आधार देखाउनुहोस्।',
];

function relatedQuestionContext(question: string, previousQuestion: string) {
  const isShortFollowUp = question.trim().length < 42 || /^(त्यो|यसमा|त्यसमा|उक्त|त्यसको|यसको|त्यसपछि|किन|कसरी|how|why|what about)\b/i.test(question.trim());
  return isShortFollowUp && previousQuestion ? `${previousQuestion} ${question}` : question;
}

function localFallbackAnswer(question: string, sources: ProcurementEvidence[]) {
  if (!sources.length) {
    return 'Gemini सेवा अहिले 503 त्रुटिका कारण उपलब्ध छैन, र यस प्रश्नको प्रत्यक्ष आधार स्थानीय स्रोतमा पनि भेटिएन। अनुमान गरेर कानुनी उत्तर दिनुभन्दा आधिकारिक पछिल्लो ऐन/नियम र सम्बन्धित बोलपत्र कागजात जाँच्नुहोस्।';
  }
  const terms = Array.from(new Set(question.toLocaleLowerCase('ne-NP').split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 2)));
  const sentences = sources.flatMap((source, sourceIndex) => source.excerpt
    .split(/(?<=[।.!?])\s+/u)
    .map((sentence) => {
      const text = sentence.trim();
      const normalized = text.toLocaleLowerCase('ne-NP');
      const matches = terms.filter((term) => normalized.includes(term)).length;
      return { text, sourceIndex, score: matches * 2 - sourceIndex * 0.15 };
    })
    .filter((item) => item.text.length > 24 && item.score > 0));
  sentences.sort((left, right) => right.score - left.score);
  const seen = new Set<string>();
  const excerpts = sentences.filter(({ text }) => {
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  }).slice(0, 3).map(({ text }) => text);
  const lead = sources[0];
  const answer = excerpts.length ? excerpts.join('\n\n') : lead.excerpt.slice(0, 700);
  return `Gemini सेवा अहिले 503 त्रुटिका कारण उपलब्ध छैन। तत्कालका लागि स्थानीय स्रोत **${lead.title} (${lead.reference})** मा भेटिएको सान्दर्भिक अंश:\n\n${answer}\n\nयो स्थानीय स्रोतबाट निकालिएको अंश हो, Gemini ले तयार गरेको संश्लेषित राय होइन। लागू हुने पछिल्लो ऐन/नियम र जारी कागजातसँग रुजु गर्नुहोस्।`;
}

function SourceCard({ source, index, onNavigate }: { source: ProcurementEvidence; index: number; onNavigate: (tab: string) => void }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-800">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{source.kind}</span>
            <span className="text-xs text-slate-500">{source.reference}</span>
          </div>
          <h3 className="mt-2 text-sm font-bold leading-6 text-slate-900">{source.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{source.excerpt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {source.route && (
              <button type="button" onClick={() => onNavigate(source.route!)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <BookOpen className="h-3.5 w-3.5" /> एपमा खोल्नुहोस्
              </button>
            )}
            {source.href && (
              <a href={source.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100">
                <ArrowUpRight className="h-3.5 w-3.5" /> {source.kind === 'SBD/DBD कागजात' ? 'कागजात खोल्नुहोस्' : 'आधिकारिक स्रोत'}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProcurementChatbot({ onNavigate }: ProcurementChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceTranscriptRef = useRef('');
  const lastSpokenMessageIdRef = useRef<string | null>(null);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('यो ब्राउजरमा जवाफ बोल्ने सुविधा उपलब्ध छैन।');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*#_`]/g, '')
        .replace(/\n+/g, '. ')
        .trim(),
    );
    utterance.lang = 'ne-NP';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('जवाफ बोल्न सकिएन। लिखित जवाफ भने उपलब्ध छ।');
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSearching]);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role !== 'assistant' || latestMessage.id === lastSpokenMessageIdRef.current) return;
    lastSpokenMessageIdRef.current = latestMessage.id;
    speakText(latestMessage.text);
  }, [messages]);

  useEffect(() => () => {
    recognitionRef.current?.abort();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const startVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = (window as SpeechRecognitionWindow).SpeechRecognition
      || (window as SpeechRecognitionWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('यो ब्राउजरमा आवाजबाट प्रश्न लिने सुविधा उपलब्ध छैन। कृपया Chrome वा Edge प्रयोग गर्नुहोस् अथवा प्रश्न टाइप गर्नुहोस्।');
      return;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setError('');
    voiceTranscriptRef.current = '';
    const recognition = new SpeechRecognition();
    recognition.lang = 'ne-NP';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) voiceTranscriptRef.current += result[0].transcript;
        else interimTranscript += result[0].transcript;
      }
      setQuestion(`${voiceTranscriptRef.current} ${interimTranscript}`.trim());
    };
    recognition.onerror = (event) => {
      const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'माइक्रोफोन अनुमति दिइएन। ब्राउजर सेटिङमा माइक्रोफोन अनुमति दिएर फेरि प्रयास गर्नुहोस्।'
        : event.error === 'no-speech'
          ? 'आवाज सुनिएन। माइक्रोफोन नजिकबाट फेरि बोल्नुहोस्।'
          : `आवाज पहिचान गर्न सकिएन (${event.error})। फेरि प्रयास गर्नुहोस्।`;
      setError(message);
      voiceTranscriptRef.current = '';
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      const transcript = voiceTranscriptRef.current.trim();
      if (transcript) void sendQuestion(transcript);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setError('माइक्रोफोन सुरु हुन सकेन। ब्राउजरको माइक्रोफोन अनुमति जाँचेर फेरि प्रयास गर्नुहोस्।');
    }
  };

  const clearConversation = () => {
    voiceTranscriptRef.current = '';
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setMessages([]);
    setError('');
    setQuestion('');
    inputRef.current?.focus();
  };

  const sendQuestion = async (value = question) => {
    const prompt = value.trim();
    if (!prompt || isSearching) return;
    if (recognitionRef.current) {
      voiceTranscriptRef.current = '';
      recognitionRef.current.abort();
      recognitionRef.current = null;
      setIsListening(false);
    }
    setQuestion('');
    setError('');
    setIsSearching(true);
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: prompt };
    setMessages((current) => [...current, userMessage]);

    try {
      if (!supabase) throw new Error('Supabase सेटअप नभएकाले AI जवाफ सेवा उपलब्ध छैन।');
      const previousQuestion = [...messages].reverse().find((message) => message.role === 'user')?.text || '';
      const retrievalQuery = relatedQuestionContext(prompt, previousQuestion);
      const sources = searchProcurementKnowledge(retrievalQuery, 4);
      const history = messages.slice(-8).map(({ role, text }) => ({ role, text }));
      const { data, error: invokeError } = await supabase.functions.invoke<{ answer?: string; error?: string }>('procurement-chat', {
        body: {
          question: prompt,
          history,
          sources: sources.map(({ kind, title, reference, excerpt }) => ({ kind, title, reference, excerpt })),
        },
      });
      if (invokeError) {
        let serviceMessage = data?.error;
        const context = (invokeError as Error & { context?: Response }).context;
        if (!serviceMessage && context) {
          try {
            serviceMessage = (await context.clone().json())?.error;
          } catch {
            // Fall back to setup guidance when the function returned no JSON body.
          }
        }
        throw new Error(serviceMessage || 'AI सेवा उपलब्ध भएन। Edge Function deploy र GEMINI_API_KEY secret सेटअप जाँच्नुहोस्।');
      }
      if (!data?.answer) throw new Error(data?.error || 'AI बाट जवाफ प्राप्त भएन। फेरि प्रयास गर्नुहोस्।');
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.answer,
        sources,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : 'AI जवाफ प्राप्त भएन। फेरि प्रयास गर्नुहोस्।';
      if (message.includes('503')) {
        const previousQuestion = [...messages].reverse().find((item) => item.role === 'user')?.text || '';
        const sources = searchProcurementKnowledge(relatedQuestionContext(prompt, previousQuestion), 4);
        setMessages((current) => [...current, {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: localFallbackAnswer(prompt, sources),
          sources,
        }]);
        setError('');
      } else {
        setError(message);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#173b63] to-[#28669a] px-5 py-6 text-white sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Bot className="h-6 w-6" /></div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold sm:text-2xl">सार्वजनिक खरिद स्रोत सहायक</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-blue-50"><Sparkles className="h-3 w-3" /> स्रोत-आधारित खोज</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
                  ऐन/नियम, PPMO राय, PPRC निर्णय, SBD/DBD र एपका सामग्रीबाट सीधा उत्तर पाउनुहोस्; आवश्यक परे आधार स्रोत खोल्नुहोस्।
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <button type="button" onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15">
                    <VolumeX className="h-3.5 w-3.5" /> बोल्न रोक्नुहोस्
                  </button>
                )}
                <button type="button" onClick={clearConversation} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15">
                  <RotateCcw className="h-3.5 w-3.5" /> नयाँ संवाद
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-amber-200 bg-amber-50/80 px-5 py-3 text-xs leading-5 text-amber-950 sm:px-7">
          बोलेको प्रश्न ब्राउजरको speech service ले लिखितमा रूपान्तरण गर्छ; त्यसको अडियो प्रशोधन ब्राउजर प्रदायकको नीतिअनुसार हुन्छ। प्रश्न, पछिल्लो संवाद र मिल्दो स्रोत अंश सुरक्षित Supabase Edge Function मार्फत Google Gemini मा पठाइन्छ। एपका सामग्री पुराना हुन सक्छन्; अन्तिम निर्णयअघि आधिकारिक पछिल्लो पाठ र जारी बोलपत्रसँग रुजु गर्नुहोस्।
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-7 sm:py-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="py-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-800"><Search className="h-6 w-6" /></div>
              <h2 className="mt-4 text-center text-lg font-bold text-slate-900">खरिदसम्बन्धी प्रश्न लेख्नुहोस्</h2>
              <p className="mx-auto mt-1 max-w-2xl text-center text-sm leading-6 text-slate-600">दफा/नियम नम्बर, खरिद विधि, SBD/DBD, PPMO राय वा PPRC निर्णयको विषय उल्लेख गर्दा खोजी अझ सान्दर्भिक हुन्छ।</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {suggestedQuestions.map((item) => (
                  <button key={item} type="button" onClick={() => void sendQuestion(item)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium leading-5 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'ml-auto max-w-3xl' : 'max-w-4xl'}>
                <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${message.role === 'user' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {message.role === 'user' ? <span className="text-xs font-bold">तपाईं</span> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`min-w-0 flex-1 rounded-2xl p-4 ${message.role === 'user' ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-slate-50 text-slate-800'}`}>
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                    {message.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => speakText(message.text)}
                        aria-label="यो जवाफ फेरि सुनाउनुहोस्"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> जवाफ सुन्नुहोस्
                      </button>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <details className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-3">
                        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-bold text-slate-700"><FileText className="h-4 w-4" /> जवाफका आधार स्रोत ({message.sources.length})</summary>
                        <div className="mt-3 space-y-3">
                          {message.sources.map((source, index) => <SourceCard key={source.id} source={source} index={index} onNavigate={onNavigate} />)}
                        </div>
                      </details>
                    )}
                    {message.role === 'assistant' && message.sources?.length === 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {PROCUREMENT_OFFICIAL_LINKS.slice(0, 3).map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50">{link.label}<ArrowUpRight className="h-3 w-3" /></a>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isSearching && <p role="status" className="text-sm text-slate-500">स्रोत जाँचेर Gemini बाट सीधा जवाफ तयार हुँदैछ…</p>}
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={(event) => { event.preventDefault(); void sendQuestion(); }} className="border-t border-slate-200 bg-white p-4 sm:px-7">
          <label htmlFor="procurement-chat-question" className="sr-only">खरिदसम्बन्धी प्रश्न</label>
          <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15">
            <textarea
              ref={inputRef}
              id="procurement-chat-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendQuestion();
                }
              }}
              rows={2}
              maxLength={1600}
              placeholder="तपाईंको प्रश्न लेख्नुहोस्… (Enter पठाउन, Shift+Enter नयाँ लाइन)"
              className="max-h-40 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              disabled={isSearching}
            />
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={isSearching}
              aria-label={isListening ? 'आवाज रेकर्डिङ रोक्नुहोस्' : 'बोलेर प्रश्न सोध्नुहोस्'}
              title={isListening ? 'रेकर्डिङ रोक्नुहोस्' : 'बोलेर प्रश्न सोध्नुहोस्'}
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isListening
                  ? 'animate-pulse border-red-300 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button type="submit" disabled={!question.trim() || isSearching} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" /><span className="hidden sm:inline">जवाफ पाउनुहोस्</span>
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500">
              <span>{isListening ? 'सुन्दैछु… बोलिसकेपछि प्रश्न आफैं पठाइनेछ।' : `${question.length}/1,600 · माइक्रोफोनबाट बोल्नुहोस् वा प्रश्न लेख्नुहोस्। जवाफ बोलेर सुनाइन्छ।`}</span>
            <span>Google Gemini प्रयोग गरिन्छ</span>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-bold text-slate-900">पछिल्लो आधिकारिक स्रोत</h2>
        <p className="mt-1 text-xs leading-5 text-slate-600">एपमा भण्डारित सामग्री पुरानो हुन सक्छ। अद्यावधिक र मूल कागजातका लागि यी सरकारी पेज हेर्नुहोस्।</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROCUREMENT_OFFICIAL_LINKS.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-50">
              {link.label}<ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
