import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowUpLeft,
  Bookmark,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  CircleHelp,
  Compass,
  Languages,
  LoaderCircle,
  LockKeyhole,
  MessageCircleMore,
  Mic2,
  Plane,
  Plus,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Stethoscope,
  UsersRound,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

type FieldId = 'technology' | 'health' | 'travel' | 'diplomacy'
type Mode = 'write' | 'terms' | 'practice'
type Language = 'ar' | 'en'
type ChatMessage = { role: 'user' | 'assistant'; content: string }
type Phrase = { arabic: string; meaning: string; field: FieldId }

const fields: { id: FieldId; ar: string; en: string; subAr: string; subEn: string; icon: typeof BriefcaseBusiness }[] = [
  { id: 'technology', ar: 'التقنية', en: 'Technology', subAr: 'برمجيات وسحابة', subEn: 'Software & cloud', icon: BriefcaseBusiness },
  { id: 'health', ar: 'الصحة', en: 'Health', subAr: 'تواصل مهني', subEn: 'Professional communication', icon: Stethoscope },
  { id: 'travel', ar: 'السفر', en: 'Travel', subAr: 'مواقف يومية', subEn: 'Everyday situations', icon: Plane },
  { id: 'diplomacy', ar: 'العلاقات الدولية', en: 'International relations', subAr: 'حوار رسمي', subEn: 'Formal dialogue', icon: UsersRound },
]

const scenarios: Record<FieldId, { titleAr: string; titleEn: string; contextAr: string; contextEn: string; goalAr: string; goalEn: string; counterpartAr: string; counterpartEn: string }> = {
  technology: {
    titleAr: 'اشرح عملك لمهندسٍ عربي', titleEn: 'Explain your work to an Arabic-speaking engineer',
    contextAr: 'اجتماع تعارف في مؤتمر تقني', contextEn: 'Meeting someone at a tech conference',
    goalAr: 'عرّف بدورك في هندسة البرمجيات والبنية السحابية، ثم اشرح مشروعاً تعمل عليه.', goalEn: 'Introduce your software and cloud engineering work, then describe a project you are building.',
    counterpartAr: 'مهندس برمجيات', counterpartEn: 'a software engineer',
  },
  health: {
    titleAr: 'تواصل مهني في بيئة صحية', titleEn: 'Communicate in a healthcare workplace',
    contextAr: 'نقاش تعريفي مع فريق صحي', contextEn: 'An introductory conversation with a healthcare team',
    goalAr: 'تدرّب على تقديم نفسك وسؤال مختص صحي عن سير العمل. لا تقدّم تشخيصاً أو نصيحة علاجية.', goalEn: 'Practise introducing yourself and asking a health professional about their workflow. No diagnosis or treatment advice.',
    counterpartAr: 'مختص صحي', counterpartEn: 'a healthcare professional',
  },
  travel: {
    titleAr: 'اطلب المساعدة في المطار', titleEn: 'Ask for help at the airport',
    contextAr: 'الوصول إلى مطار في بلد عربي', contextEn: 'Arriving at an airport in an Arabic-speaking country',
    goalAr: 'اسأل عن بوابة الرحلة، ومكان استلام الأمتعة، وكيف تصل إلى وسيلة النقل.', goalEn: 'Ask about your gate, baggage claim, and how to find ground transport.',
    counterpartAr: 'موظف المطار', counterpartEn: 'an airport staff member',
  },
  diplomacy: {
    titleAr: 'قدّم مبادرة في لقاء رسمي', titleEn: 'Present an initiative in a formal meeting',
    contextAr: 'جلسة حوار شبابية متعددة الثقافات', contextEn: 'A multicultural youth dialogue session',
    goalAr: 'قدّم نفسك، واشرح مبادرة للتعاون بين الطلبة، واطلب رأي الطرف الآخر بأدب.', goalEn: 'Introduce yourself, describe a student collaboration initiative, and politely ask for feedback.',
    counterpartAr: 'مشارك في الحوار', counterpartEn: 'a dialogue participant',
  },
}

const starterPhrases: Phrase[] = [
  { arabic: 'البنية التحتية السحابية', meaning: 'Cloud infrastructure', field: 'technology' },
  { arabic: 'أتمتة عمليات النشر', meaning: 'Deployment automation', field: 'technology' },
  { arabic: 'خطّ التكامل المستمر', meaning: 'Continuous integration pipeline', field: 'technology' },
  { arabic: 'خطّ سير الرحلة', meaning: 'Travel itinerary', field: 'travel' },
  { arabic: 'وسائل النقل العام', meaning: 'Public transportation', field: 'travel' },
  { arabic: 'مكان الإقامة', meaning: 'Accommodation', field: 'travel' },
  { arabic: 'حجز موعد', meaning: 'Book an appointment', field: 'health' },
  { arabic: 'السجلّ الصحي', meaning: 'Health record', field: 'health' },
  { arabic: 'الفريق المعالج', meaning: 'Care team', field: 'health' },
  { arabic: 'مبادرة مشتركة', meaning: 'Joint initiative', field: 'diplomacy' },
  { arabic: 'مذكرة تفاهم', meaning: 'Memorandum of understanding', field: 'diplomacy' },
  { arabic: 'تعزيز التعاون', meaning: 'Strengthen cooperation', field: 'diplomacy' },
]

const modelName = 'gemma3:4b'

const copy = {
  ar: {
    navPractice: 'ساحة التدريب', navPhrases: 'دفتر العبارات', modelChecking: 'يفحص النموذج', modelReady: 'النموذج يعمل محلياً', modelMissing: 'النموذج غير متصل',
    language: 'English', eyebrow: 'العربيةُ ميدانُك', headlineA: 'لا تتعلّم العربية فقط.', headlineB: 'عِشْ بها ما تُتقنه.', intro: 'اكتب فكرتك، تعلّم مصطلحاتها، وتدرّب على قولها بالعربية.', stampTop: 'لغةٌ تتّسعُ لحياتك', stampBottom: 'تعلّمٌ بالممارسة · منذ اليوم',
    startFrom: 'ابدأ من خبرتك', chooseField: 'في أيّ ميدان تريد أن تتحدّث؟', saved: 'عباراتي المحفوظة', taskWrite: 'اكتب فكرتك', taskTerms: 'تعلّم المصطلحات', taskPractice: 'تدرّب على حوار', today: 'جلسة اليوم', newSession: 'جلسة جديدة', situation: 'الموقف', yourTurn: 'اكتب طلبك بلغتك', inputHint: 'مثال: أريد أن أكتب عن رحلة طويلة في الصين…', termsHint: 'ما المجال أو الموضوع الذي تريد مصطلحاته؟', practiceHint: 'اكتب ردّك بالعربية أو بما تعرفه…', coachHint: 'ما الفكرة التي تريد التعبير عنها بالعربية؟', promptWrite: 'سأكتب لك نصاً عربياً متكاملاً، مع الترجمة والمفردات الأساسية.', promptTerms: 'سأعطيك قائمة مصطلحات ثنائية اللغة مع أمثلة طبيعية.', promptPractice: 'سأحاكي حواراً واقعياً وأساعدك على التعبير خطوةً خطوة.', writePlaceholder: 'اكتب الموضوع والجمهور والطول المطلوب إن عرفت…', termsPlaceholder: 'مثال: مصطلحات السفر الطويل في الصين', send: 'إرسال', privacy: 'تبقى محادثتك على جهازك', thinking: 'يكتب الإجابة…', errorModel: 'النموذج المحلي غير متصل. شغّل Ollama وتأكد من تثبيت Qwen3 4B.', errorRequest: 'تعذّر الحصول على إجابة. تحقّق من تشغيل Ollama وحاول مجدداً.', errorEmpty: 'عاد النموذج بإجابة فارغة. أعد المحاولة.',
    goal: 'هدف الجلسة', path: 'مسار التدريب', startCoach: 'ساعدني في التعبير', dictionary: 'قاموسك المهني', usefulPhrases: 'مصطلحات وعبارات', allPhrases: 'فتح دفتر العبارات', privacyTitle: 'خصوصيتك أولاً', privacyBody: 'النموذج يعمل محلياً. لا نرسل رسائلك إلى خدمة سحابية.', closing: 'من النحو والصرف إلى', closingStrong: 'لغةٍ تُنجز بها.', browse: 'تصفّح قاموسي', footer: 'مساحة عربية للممارسة المهنية', about: 'حول ميدان',
    phrasebook: 'عباراتي المحفوظة', phrasebookIntro: 'مصطلحات وتعبيرات ثنائية اللغة تحفظها على جهازك.', done: 'تمّ', close: 'إغلاق', aboutKicker: 'ميدان · النسخة التجريبية', aboutTitle: 'العربية لغةُ ممارستك', aboutBody: 'صُمّم ميدان لمساعدتك على نقل خبرتك وأفكارك إلى عربية طبيعية في ميادين الحياة والعمل.', modelLocal: 'Qwen3 4B يعمل محلياً', modelOffline: 'النموذج المحلي غير متصل', modelCheckingAbout: 'جارٍ التحقق من النموذج المحلي', caveat: 'النموذج أداة تدريب وقد يخطئ في المصطلحات أو التصحيح. راجع اللغة التخصصية مع أهل الخبرة. ليس أداةً للتشخيص أو الاستشارة المهنية الحساسة.', modelLink: 'عن النموذج وترخيصه', savedExpression: 'حفظ التعبير', home: 'ميدان، الصفحة الرئيسية', navLabel: 'التنقل الرئيسي', fieldLabel: 'اختر مجال التدريب', modeLabel: 'طريقة التدريب', inputLabel: 'اكتب طلبك أو فكرتك', account: 'حساب المتعلم',
  },
  en: {
    navPractice: 'Practice studio', navPhrases: 'My phrasebook', modelChecking: 'Checking model', modelReady: 'Model running locally', modelMissing: 'Model offline',
    language: 'العربية', eyebrow: 'Arabic, in your field', headlineA: 'Don’t just study Arabic.', headlineB: 'Use it for what you know.', intro: 'Write an idea, learn its terms, and practise expressing it in Arabic.', stampTop: 'A language for real life', stampBottom: 'Learn by doing · start today',
    startFrom: 'Start with what you know', chooseField: 'What field would you like to talk about?', saved: 'Saved phrases', taskWrite: 'Write an idea', taskTerms: 'Learn terminology', taskPractice: 'Practise a dialogue', today: 'Today’s session', newSession: 'New session', situation: 'Scenario', yourTurn: 'Write your request in your own language', inputHint: 'Example: I want to write about a long trip through China…', termsHint: 'What field or subject do you need terminology for?', practiceHint: 'Reply in Arabic or start with the words you know…', coachHint: 'What idea would you like to express in Arabic?', promptWrite: 'I’ll create a complete Arabic text with an English translation and key vocabulary.', promptTerms: 'I’ll give you bilingual terminology with natural usage examples.', promptPractice: 'I’ll simulate a realistic exchange and help you express yourself step by step.', writePlaceholder: 'Add the topic, audience, and desired length if you know them…', termsPlaceholder: 'Example: key terms for long-term travel in China', send: 'Send', privacy: 'Your conversation stays on this device', thinking: 'Writing your answer…', errorModel: 'The local model is offline. Start Ollama and make sure Qwen3 4B is installed.', errorRequest: 'Could not get a reply. Check Ollama and try again.', errorEmpty: 'The model returned an empty reply. Please try again.',
    goal: 'Session goal', path: 'Practice path', startCoach: 'Help me phrase this', dictionary: 'Your field vocabulary', usefulPhrases: 'Terms and useful phrases', allPhrases: 'Open phrasebook', privacyTitle: 'Privacy first', privacyBody: 'The model runs locally. Your messages are not sent to a cloud service.', closing: 'Beyond grammar, toward', closingStrong: 'Arabic you can use.', browse: 'Browse my terms', footer: 'Arabic practice for work and life', about: 'About Meydan',
    phrasebook: 'My saved phrases', phrasebookIntro: 'Bilingual terms and expressions saved on this device.', done: 'Done', close: 'Close', aboutKicker: 'Meydan · Prototype', aboutTitle: 'Arabic you can use', aboutBody: 'Meydan helps you turn your knowledge and ideas into natural Arabic for real fields and situations.', modelLocal: 'Qwen3 4B running locally', modelOffline: 'Local model offline', modelCheckingAbout: 'Checking local model', caveat: 'This model is a practice aid and can make mistakes. Verify specialist language with an expert. It is not for diagnosis or high-stakes professional advice.', modelLink: 'Model and licence details', savedExpression: 'Save expression', home: 'Meydan home', navLabel: 'Main navigation', fieldLabel: 'Choose a practice field', modeLabel: 'Practice task', inputLabel: 'Write your request or idea', account: 'Learner account',
  },
} as const

function App() {
  const [field, setField] = useState<FieldId>('technology')
  const [mode, setMode] = useState<Mode>('write')
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('meydan-language') === 'en' ? 'en' : 'ar')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('meydan-theme') === 'dark' ? 'dark' : 'light')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [phrases, setPhrases] = useState<Phrase[]>(() => {
    try {
      const stored = localStorage.getItem('meydan-saved-phrases-v3')
      return stored ? JSON.parse(stored) as Phrase[] : []
    } catch {
      return []
    }
  })
  const [modelReady, setModelReady] = useState(false)
  const [modelChecking, setModelChecking] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showPhrasebook, setShowPhrasebook] = useState(false)

  const scenario = scenarios[field]
  const selectedField = fields.find((item) => item.id === field)!
  const t = copy[language]
  const rtl = language === 'ar'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = language
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    localStorage.setItem('meydan-theme', theme)
    localStorage.setItem('meydan-language', language)
  }, [language, rtl, theme])

  useEffect(() => {
    let alive = true
    fetch('/ollama/api/tags')
      .then((response) => {
        if (!response.ok) throw new Error('تعذّر الاتصال')
        return response.json()
      })
      .then((data: { models?: { name: string }[] }) => {
        if (alive) setModelReady(Boolean(data.models?.some((model) => model.name.startsWith(modelName))))
      })
      .catch(() => alive && setModelReady(false))
      .finally(() => alive && setModelChecking(false))
    return () => { alive = false }
  }, [])

  useEffect(() => {
    localStorage.setItem('meydan-saved-phrases-v3', JSON.stringify(phrases))
  }, [phrases])

  function changeField(nextField: FieldId) {
    setField(nextField)
    setMessages([])
    setError('')
  }

  function systemPrompt(): string {
    const fieldName = rtl ? selectedField.ar : selectedField.en
    const goal = rtl ? scenarios[field].goalAr : scenarios[field].goalEn
    const task = mode === 'write'
      ? 'Write a useful, coherent Arabic text for the requested topic. Include a natural title, paragraphs suitable for the requested length, an English translation, and a short list of key Arabic terms with English meanings. If length is not specified, provide about 180-250 Arabic words.'
      : mode === 'terms'
        ? 'Create a focused bilingual glossary of 10-14 useful terms. Use a table with Arabic term, English meaning, and one natural Arabic example sentence plus its English translation. Distinguish formal Arabic from colloquial variants only when relevant; do not invent terms.'
        : `Simulate a realistic conversation in ${fieldName}. You are ${rtl ? scenarios[field].counterpartAr : scenarios[field].counterpartEn}. Start with a natural opening, then respond to the learner. Give one concise correction only when needed, preserve English specialist terms in parentheses if their Arabic equivalent is uncertain, and ask one follow-up question. Scenario goal: ${goal}`
    return `You are Meydan, a patient bilingual Arabic tutor for learners in Nigeria. Help the learner use Arabic in the field of ${fieldName}. The learner may write in English, Arabic, or both. ${task}\n\nOUTPUT CONTRACT: Answer directly; never reveal analysis, planning, or internal reasoning. Use clear Modern Standard Arabic first, then a faithful English translation. For writing requests, follow the exact requested form (for example, if asked for three opening sentences, write exactly three), then provide a complete translation and 8-10 accurate, relevant Arabic terms with English meanings. Default to about 120-160 Arabic words when the user does not specify length; do not turn an article/story request into a one-line summary. Make prose vivid only to the degree requested and avoid invented cultural details. For terminology requests, provide 10-12 useful terms with short natural examples and translations. For dialogue, keep turns concise and natural. Preserve intended meaning; never fabricate specialist translations. If unsure of a term, retain it in English and say it needs review. No medical/legal advice. Do not add a concluding offer or meta-commentary.`
  }

  async function submitMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const content = draft.trim()
    if (!content || sending) return
    if (!modelReady) {
      setError(t.errorModel)
      return
    }

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setDraft('')
    setSending(true)
    setError('')
    try {
      const response = await fetch('/ollama/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          stream: true,
          keep_alive: '10m',
          messages: [{ role: 'system', content: systemPrompt() }, ...nextMessages],
          think: false,
          options: { temperature: mode === 'write' ? 0.45 : 0.3, num_predict: mode === 'write' ? 620 : mode === 'terms' ? 520 : 260, num_ctx: 4096, num_thread: 10, num_batch: 128 },
        }),
      })
      if (!response.ok || !response.body) throw new Error(t.errorRequest)
      const assistantIndex = nextMessages.length
      setMessages([...nextMessages, { role: 'assistant', content: '' }])
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let answer = ''
      const appendChunk = (line: string) => {
        if (!line.trim()) return
        const chunk = JSON.parse(line) as { message?: { content?: string }; done?: boolean }
        answer += chunk.message?.content ?? ''
        if (answer) setMessages((current) => current.map((item, index) => index === assistantIndex ? { role: 'assistant', content: answer } : item))
      }
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) appendChunk(line)
      }
      appendChunk(buffer)
      if (!answer.trim()) throw new Error(t.errorEmpty)
    } catch (requestError) {
      setMessages(nextMessages)
      setError(requestError instanceof Error ? requestError.message : t.errorRequest)
    } finally {
      setSending(false)
    }
  }

  function savePhrase(content: string) {
    const lines = content.split('\n').map((line) => line.trim()).filter(Boolean)
    const arabic = lines.find((line) => /[\u0600-\u06FF]/.test(line))?.replace(/^#+\s*/, '').replace(/^.*?:\s*/, '').trim()
    if (!arabic || phrases.some((phrase) => phrase.arabic === arabic)) return
    const meaning = lines.find((line) => !/[\u0600-\u06FF]/.test(line) && line.length > 3) ?? 'Saved from a practice session'
    setPhrases((current) => [{ arabic, meaning, field }, ...current])
  }

  return (
    <div className="app-shell" dir={rtl ? 'rtl' : 'ltr'}>
      <header className="topbar">
        <a className="brand" href="#home" aria-label={t.home}>
          <span className="brand-mark"><Languages size={21} strokeWidth={2.1} /></span>
          <span className="brand-name">ميدان<span>{t.footer}</span></span>
        </a>
        <nav className="main-nav" aria-label={t.navLabel}>
          <a className="nav-item active" href="#practice"><MessageCircleMore size={16} /> {t.navPractice}</a>
          <button className="nav-item" onClick={() => setShowPhrasebook(true)}><BookOpenCheck size={16} /> {t.navPhrases} <span className="nav-count">{phrases.length}</span></button>
        </nav>
        <div className="top-actions">
          <span className={`model-pill ${modelReady ? 'ready' : ''}`}><span className="status-dot" />{modelChecking ? t.modelChecking : modelReady ? t.modelReady : t.modelMissing}</span>
          <button className="icon-action theme-toggle" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} title={theme === 'light' ? (rtl ? 'الوضع الداكن' : 'Dark mode') : (rtl ? 'الوضع الفاتح' : 'Light mode')} aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
          <button className="language-toggle" onClick={() => setLanguage((current) => current === 'ar' ? 'en' : 'ar')} aria-label={t.language}><Languages size={15} /><span>{t.language}</span></button>
          <button className="avatar" title={t.account} aria-label={t.account}>م</button>
        </div>
      </header>

      <main id="home">
        <section className="intro-band">
          <div className="intro-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> {t.eyebrow}</div>
            <h1>{t.headlineA}<br /><em>{t.headlineB}</em></h1>
            <p>{t.intro}</p>
          </div>
          <div className="intro-stamp" aria-hidden="true">
            <span className="stamp-top">{t.stampTop}</span>
            <span className="stamp-ar">ميدان</span>
            <span className="stamp-bottom">{t.stampBottom}</span>
          </div>
        </section>

        <section className="workspace" id="practice">
          <div className="workspace-heading">
            <div>
              <div className="section-kicker">{t.startFrom}</div>
              <h2>{t.chooseField}</h2>
            </div>
            <button className="text-action" onClick={() => setShowPhrasebook(true)}>{t.saved} <ArrowUpLeft size={15} /></button>
          </div>

          <div className="field-grid" role="group" aria-label={t.fieldLabel}>
            {fields.map(({ id, ar, en, subAr, subEn, icon: Icon }) => (
              <button key={id} className={`field-option ${field === id ? 'selected' : ''}`} onClick={() => changeField(id)} aria-pressed={field === id}>
                <span className="field-icon"><Icon size={19} strokeWidth={1.7} /></span>
                <span className="field-copy"><strong>{rtl ? ar : en}</strong><small>{rtl ? subAr : subEn}</small></span>
                {field === id && <Check className="field-check" size={16} />}
              </button>
            ))}
          </div>

          <div className="practice-grid">
            <section className="conversation-panel" aria-label="جلسة المحادثة">
              <div className="panel-topline">
                <div className="panel-title-group">
                  <span className="panel-icon"><Compass size={17} /></span>
                  <div><span className="panel-eyebrow">{t.today} · {rtl ? selectedField.ar : selectedField.en}</span><h3>{rtl ? scenario.titleAr : scenario.titleEn}</h3></div>
                </div>
                <button className="subtle-button" onClick={() => { setMessages([]); setError('') }} title={t.newSession} aria-label={t.newSession}><Plus size={17} /></button>
              </div>

              <div className="scenario-strip">
                <span className="scenario-label"><span className="tiny-sparkle"><Sparkles size={13} /></span> {t.situation}</span>
                <span>{rtl ? scenario.contextAr : scenario.contextEn}</span>
              </div>

              <div className="mode-switch" role="tablist" aria-label={t.modeLabel}>
                <button className={mode === 'write' ? 'mode-tab active' : 'mode-tab'} onClick={() => setMode('write')} role="tab" aria-selected={mode === 'write'}><BookOpenCheck size={15} /> {t.taskWrite}</button>
                <button className={mode === 'terms' ? 'mode-tab active' : 'mode-tab'} onClick={() => setMode('terms')} role="tab" aria-selected={mode === 'terms'}><Languages size={15} /> {t.taskTerms}</button>
                <button className={mode === 'practice' ? 'mode-tab active' : 'mode-tab'} onClick={() => setMode('practice')} role="tab" aria-selected={mode === 'practice'}><MessageCircleMore size={15} /> {t.taskPractice}</button>
              </div>

              <div className="chat-area" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="empty-conversation">
                    <div className="empty-icon"><Mic2 size={22} strokeWidth={1.6} /></div>
                    <span className="empty-label">{t.yourTurn}</span>
                    <p>{mode === 'write' ? t.promptWrite : mode === 'terms' ? t.promptTerms : t.promptPractice}</p>
                    <div className="starter-hint"><span className="hint-avatar"><CircleHelp size={15} /></span><span>{rtl ? 'اكتب بالعربية أو الإنجليزية، وسنجيب باللغتين.' : 'Write in English or Arabic; replies include both languages.'}</span></div>
                  </div>
                ) : (
                  <div className="message-list">
                    {messages.map((message, index) => (
                      <article className={`chat-message ${message.role}`} key={`${index}-${message.role}`}>
                        {message.role === 'assistant' && <span className="message-avatar"><Sparkles size={14} /></span>}
                        <div className="message-body">
                          {message.role === 'assistant' && <div className="message-meta">ميدان <span>· {rtl ? 'شريكك في التعلّم' : 'your learning partner'}</span></div>}
                          <div className="assistant-markdown" dir="auto"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div>
                          {message.role === 'assistant' && <button className="save-message" onClick={() => savePhrase(message.content)}><Bookmark size={13} /> {t.savedExpression}</button>}
                        </div>
                      </article>
                    ))}
                    {sending && <div className="thinking-row"><span className="message-avatar"><Sparkles size={14} /></span><span className="thinking-text"><LoaderCircle size={14} className="spin" /> {t.thinking}</span></div>}
                  </div>
                )}
              </div>

              {error && <p className="error-note" role="alert">{error}</p>}
              <form className="composer" onSubmit={submitMessage}>
                <label className="sr-only" htmlFor="message-input">{t.inputLabel}</label>
                <textarea id="message-input" rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submitMessage() } }} placeholder={mode === 'write' ? t.writePlaceholder : mode === 'terms' ? t.termsPlaceholder : t.practiceHint} disabled={sending} />
                <div className="composer-footer">
                  <span className="privacy-note"><LockKeyhole size={12} /> {t.privacy}</span>
                  <div className="composer-actions"><span className="key-hint">Enter ↵</span><button className="send-button" type="submit" disabled={sending || !draft.trim()} aria-label={t.send}><SendHorizontal size={17} /></button></div>
                </div>
              </form>
            </section>

            <aside className="side-rail">
              <section className="phrase-panel">
                <div className="phrase-heading"><div><span className="section-kicker">{t.dictionary}</span><h3>{t.usefulPhrases}</h3></div><button className="subtle-button" onClick={() => setShowPhrasebook(true)} title={t.allPhrases} aria-label={t.allPhrases}><ArrowUpLeft size={15} /></button></div>
                <div className="phrase-list">
                  {starterPhrases.filter((phrase) => phrase.field === field).map((phrase, index) => (
                    <article className="phrase-item" key={`${phrase.arabic}-${index}`}>
                      <span className="phrase-marker">{String(index + 1).padStart(2, '0')}</span>
                      <div><p>{phrase.arabic}</p><span>{phrase.meaning}</span></div>
                      <button className="term-save" onClick={() => savePhrase(`${phrase.arabic}\n${phrase.meaning}`)} aria-label={`${t.savedExpression}: ${phrase.arabic}`} title={t.savedExpression}><Bookmark size={13} /></button>
                    </article>
                  ))}
                </div>
                <button className="all-phrases" onClick={() => setShowPhrasebook(true)}>{t.allPhrases} <ArrowUpLeft size={14} /></button>
              </section>

              <div className="open-note"><span className="open-note-icon"><ShieldCheck size={17} /></span><p><strong>{t.privacyTitle}</strong><br />{t.privacyBody}</p></div>
            </aside>
          </div>
        </section>

        <section className="closing-strip">
          <div className="closing-mark">م</div>
          <p>{t.closing} <strong>{t.closingStrong}</strong></p>
          <button onClick={() => setShowPhrasebook(true)}>{t.browse} <ArrowUpLeft size={14} /></button>
        </section>
      </main>

      <footer className="footer"><span>ميدان <span className="footer-dot">·</span> {t.footer}</span><button className="about-button" onClick={() => { const dialog = document.getElementById('about-dialog'); if (dialog instanceof HTMLDialogElement) dialog.showModal() }}>{t.about} <ArrowUpLeft size={13} /></button></footer>

      {showPhrasebook && <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setShowPhrasebook(false) }}>
        <section className="phrase-modal" role="dialog" aria-modal="true" aria-labelledby="phrase-modal-title" dir={rtl ? 'rtl' : 'ltr'}>
          <div className="modal-heading"><div><span className="section-kicker">{rtl ? 'دفترٌ ينمو معك' : 'Your growing phrasebook'}</span><h2 id="phrase-modal-title">{t.phrasebook}</h2></div><button className="subtle-button" onClick={() => setShowPhrasebook(false)} aria-label={t.close}><X size={17} /></button></div>
          <p className="modal-intro">{t.phrasebookIntro}</p>
          <div className="modal-phrases">{phrases.map((phrase, index) => <article className="modal-phrase" key={`${phrase.arabic}-saved-${index}`}><div><p>{phrase.arabic}</p><span>{phrase.meaning}</span></div><span className="phrase-tag">{rtl ? fields.find((item) => item.id === phrase.field)?.ar : fields.find((item) => item.id === phrase.field)?.en}</span></article>)}</div>
          <button className="modal-done" onClick={() => setShowPhrasebook(false)}>{t.done} <Check size={15} /></button>
        </section>
      </div>}

      <dialog id="about-dialog" className="about-dialog" dir={rtl ? 'rtl' : 'ltr'}>
        <form method="dialog"><button className="subtle-button dialog-close" aria-label={t.close}><X size={16} /></button></form>
        <span className="about-icon"><Languages size={20} /></span><span className="section-kicker">{t.aboutKicker}</span><h2>{t.aboutTitle}</h2>
        <p>{t.aboutBody}</p>
        <div className="about-model"><span className={`status-dot ${modelReady ? 'on' : ''}`} /><span>{modelReady ? t.modelLocal : modelChecking ? t.modelCheckingAbout : t.modelOffline}</span></div>
        <p className="model-caveat">{t.caveat}</p>
        <a className="model-link" href="https://huggingface.co/Qwen/Qwen3-4B" target="_blank" rel="noreferrer">{t.modelLink} <ArrowUpLeft size={14} /></a>
      </dialog>
    </div>
  )
}

export default App
