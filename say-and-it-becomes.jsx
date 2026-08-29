import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Flame,
  ArrowRight,
  RotateCcw,
  Loader2,
  Mic,
  Keyboard,
  Square,
  Pencil,
  BookOpen,
  ArrowLeft,
  Check,
  X,
  Play,
  Trash2,
  Download,
  CheckCircle2,
  Circle,
  Sparkles,
  Menu,
  Settings,
  LogOut,
  AlertCircle,
  User,
  Mail,
  Lock,
  Home,
  LogIn,
  UserPlus,
  GraduationCap,
  Shuffle,
  FileText,
  FileAudio,
} from "lucide-react";

const ACCENT = "#E8532A";
const INK = "#14181F";
const MUTED = "#8A8F98";

const SUPABASE_URL = "https://krtixudkoojbhypypjqv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydGl4dWRrb29qYmh5cHlwanF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NzY4NDUsImV4cCI6MjEwMzQ1Mjg0NX0.3-Bx-JlBjuYDduSyBoXtUvVTfJEyGU1a4dRlOretEWA";

export default function SayAndItBecomes() {
  const [step, setStep] = useState("landing"); // landing | signup | signin | input | loading | declaration | gallery | setup | logout | lessons
  const [belief, setBelief] = useState("");
  const [declaration, setDeclaration] = useState("");
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [saidToday, setSaidToday] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [inputMode, setInputMode] = useState("type");
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [gallery, setGallery] = useState([]);
  const [cameFrom, setCameFrom] = useState("landing");
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechCancelRef = useRef(false);

  // Gallery
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [galleryEditText, setGalleryEditText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [downloadNotice, setDownloadNotice] = useState("");

  // Setup / profile
  const [voicePref, setVoicePref] = useState("coach");
  const [reminderOn, setReminderOn] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [profileName, setProfileName] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [focusAreas, setFocusAreas] = useState(new Set());
  const [aboutText, setAboutText] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");

  // Auth
  const [session, setSession] = useState(null); // { accessToken, refreshToken, userId, email }
  const [authLoading, setAuthLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinError, setSigninError] = useState("");
  const [lessonPage, setLessonPage] = useState(0);

  const LESSON_PAGES = [
    {
      title: "Why Audio Affirmations?",
      paragraphs: [
        "Your dreams create desires, and strong desires create emotions and excitement.",
        "But before a new desire can become part of your life, it must pass through your existing beliefs.",
        "Your subconscious mind carries many old beliefs formed by your experiences and environment.",
        "These old beliefs can influence how you see, feel and respond to new possibilities.",
        "Understanding this process helps explain why simply wanting something is often not enough.",
        "Audio affirmations use words, emotion, repetition and visualization to help create a new internal pattern.",
      ],
    },
    {
      title: "Your Dream Creates Desire",
      paragraphs: [
        "It usually starts with a simple thought: \u201cI would love to have this in my life.\u201d",
        "You picture yourself living it, experiencing it, and enjoying what it could mean for you.",
        "The more you think about it, the more you want it, and that desire begins to create excitement inside you.",
        "You start to imagine what could happen, how your life could change, and what it would feel like when you finally achieve it.",
        "That excitement gives your dream emotional energy and makes it feel more real to you.",
        "A dream gives you the picture; desire gives you the energy to move toward it.",
      ],
    },
    {
      title: "Your Mind Has Two Voices",
      paragraphs: [
        "One part of you knows what you want and says, \u201cI can do this.\u201d",
        "It is your conscious mind, the part that makes decisions, sets goals and chooses where to focus your attention.",
        "But there is another part carrying years of experiences, habits, assumptions and beliefs about who you are.",
        "Sometimes it quietly says, \u201cThat isn't for someone like me.\u201d",
        "You may consciously want a new life while an old belief keeps pulling you toward what feels familiar and safe.",
        "The challenge is not only creating a new desire. It is teaching your mind to accept a new possibility.",
      ],
    },
    {
      title: "Your Old Beliefs Shape What You See",
      paragraphs: [
        "You don't experience the world exactly as it is; you experience it through the beliefs and expectations you carry.",
        "An opportunity can look exciting to one person and frightening to another.",
        "One person sees a challenge and thinks, \u201cI can learn this.\u201d Another sees the same challenge and thinks, \u201cI'm not good enough.\u201d",
        "The difference may not be the opportunity itself, but the meaning each person gives to it.",
        "Your old beliefs can quietly influence what you notice, what you expect, and how you respond.",
        "Your perception becomes the lens through which you experience your world.",
      ],
    },
    {
      title: "\u201cI AM\u201d Creates the New Direction",
      paragraphs: [
        "This is where the power of affirmation begins.",
        "\u201cI AM\u201d is more than a statement about who you are; it puts your attention on who you are choosing to be right now.",
        "When you say, \u201cI AM confident,\u201d \u201cI AM capable,\u201d or \u201cI AM persistent,\u201d you are not talking about yesterday or waiting for tomorrow.",
        "You are placing the new identity in the present moment: NOW.",
        "The words become more meaningful when you repeat them with emotion, visualize yourself living them, and begin acting in ways that support them.",
        "Three simple words can become a powerful direction for your mind: TODAY. I. AM.",
      ],
    },
    {
      title: "Build the Life You Desire",
      paragraphs: [
        "Changing an old pattern does not happen because you said an affirmation once.",
        "Old beliefs may have been reinforced for years, so the new pattern needs repetition, emotion, visualization and real-life evidence.",
        "Every time you say \u201cI AM,\u201d visualize it, feel it and act on it, you give yourself another opportunity to practice the new way of being.",
        "Every new action can create a new experience, and every new experience can become evidence that supports your new belief.",
        "The old belief may remain in the background, but it does not have to control your direction.",
        "Dream it. Desire it. Say \u201cI AM.\u201d Feel it. Visualize it. Live it. Repeat it.",
      ],
    },
  ];

  const [lessonSpeaking, setLessonSpeaking] = useState(false);

  function stopLessonAudio() {
    speechCancelRef.current = true;
    window.speechSynthesis.cancel();
    setLessonSpeaking(false);
  }

  function playLessonAudio() {
    if (lessonSpeaking) {
      stopLessonAudio();
      return;
    }
    window.speechSynthesis.cancel();
    const page = LESSON_PAGES[lessonPage];
    const fullText = `${page.title}. ${page.paragraphs.join(" ")}`;
    setLessonSpeaking(true);
    speak(fullText, () => setLessonSpeaking(false));
  }

  function lessonNext() {
    stopLessonAudio();
    setLessonPage((p) => Math.min(p + 1, LESSON_PAGES.length - 1));
  }
  function lessonBack() {
    stopLessonAudio();
    if (lessonPage === 0) {
      backFromSubpage();
    } else {
      setLessonPage((p) => p - 1);
    }
  }
  function lessonHome() {
    stopLessonAudio();
    setLessonPage(0);
    goHome();
  }

  const FOCUS_OPTIONS = [
    "Confidence",
    "Career & Money",
    "Relationships",
    "Health & Body",
    "Purpose & Mindset",
  ];

  function sbAuthHeaders() {
    return { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" };
  }
  function sbDataHeaders(sess) {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${sess.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  useEffect(() => {
    function loadVoices() {
      const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      if (voices.length) setAvailableVoices(voices);
    }
    loadVoices();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setBelief(transcript);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone access is blocked for this page. Allow microphone access in your browser's site settings, then try again.");
      } else if (event.error === "no-speech") {
        setMicError("Didn't catch anything — tap the mic and try again.");
      } else if (event.error === "aborted") {
        // user-initiated stop
      } else {
        setMicError("The mic ran into a problem. You can type instead.");
      }
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) {
      setMicError("Speech recognition isn't supported in this browser. Try typing instead.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    setMicError("");
    setBelief("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      setMicError("Couldn't start the mic. Try again, or switch to Type.");
      setIsListening(false);
    }
  }

  // ---- Session bootstrap ----
  useEffect(() => {
    async function bootstrap() {
      try {
        const result = await window.storage.get("supabase-session");
        if (result) {
          const sess = JSON.parse(result.value);
          setSession(sess);
          await loadUserData(sess);
          return;
        }
      } catch (e) {
        // no saved session
      }
      await loadLocalGuestData();
    }
    bootstrap();
  }, []);

  async function persistSession(newSession) {
    setSession(newSession);
    try {
      if (newSession) await window.storage.set("supabase-session", JSON.stringify(newSession));
      else await window.storage.delete("supabase-session");
    } catch (e) {
      console.error("Could not persist session", e);
    }
  }

  // ---- Guest mode (no Supabase session): persist locally on-device ----
  async function loadLocalGuestData() {
    try {
      const r = await window.storage.get("streak-data");
      if (r) {
        const d = JSON.parse(r.value);
        setStreak(d.count || 0);
      }
    } catch (e) {}
    try {
      const r = await window.storage.get("gallery-data");
      if (r) setGallery(JSON.parse(r.value));
    } catch (e) {}
    try {
      const r = await window.storage.get("profile-data");
      if (r) {
        const p = JSON.parse(r.value);
        setProfileName(p.name || "");
        setProfileGender(p.gender || "");
        setFocusAreas(new Set(p.focusAreas || []));
        setAboutText(p.about || "");
        setSelectedVoiceURI(p.voiceURI || "");
        setReminderOn(p.reminderOn !== undefined ? p.reminderOn : true);
        setReminderTime(p.reminderTime || "08:00");
      }
    } catch (e) {}
  }

  async function persistLocalGallery(items) {
    try {
      await window.storage.set("gallery-data", JSON.stringify(items));
    } catch (e) {
      console.error("Could not save gallery locally", e);
    }
  }

  async function persistLocalStreak(count) {
    try {
      await window.storage.set("streak-data", JSON.stringify({ count }));
    } catch (e) {
      console.error("Could not save streak locally", e);
    }
  }

  async function persistLocalProfile() {
    try {
      await window.storage.set(
        "profile-data",
        JSON.stringify({
          name: profileName,
          gender: profileGender,
          focusAreas: Array.from(focusAreas),
          about: aboutText,
          voiceURI: selectedVoiceURI,
          reminderOn,
          reminderTime,
        })
      );
    } catch (e) {
      console.error("Could not save profile locally", e);
    }
  }

  function continueAsGuest() {
    setStep("input");
  }

  async function loadUserData(sess) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${sess.userId}&select=*`, {
        headers: sbDataHeaders(sess),
      });
      const rows = await res.json();
      if (Array.isArray(rows) && rows[0]) {
        const p = rows[0];
        setProfileName(p.name || "");
        setProfileGender(p.gender || "");
        setFocusAreas(new Set(p.focus_areas || []));
        setAboutText(p.about || "");
        setSelectedVoiceURI(p.voice_uri || "");
        setReminderOn(p.reminder_on !== undefined && p.reminder_on !== null ? p.reminder_on : true);
        setReminderTime(p.reminder_time || "08:00");
      }
      setProfileEmail(sess.email || "");
    } catch (e) {
      console.error("Could not load profile", e);
    }

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/affirmations?user_id=eq.${sess.userId}&order=created_at.desc`,
        { headers: sbDataHeaders(sess) }
      );
      const rows = await res.json();
      if (Array.isArray(rows)) {
        setGallery(
          rows.map((r) => ({ id: r.id, text: r.text, createdAt: r.created_at, playCount: r.play_count || 0 }))
        );
      }
    } catch (e) {
      console.error("Could not load gallery", e);
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/streaks?user_id=eq.${sess.userId}&select=*`, {
        headers: sbDataHeaders(sess),
      });
      const rows = await res.json();
      if (Array.isArray(rows) && rows[0]) {
        setStreak(rows[0].count || 0);
        const today = new Date().toDateString();
        setSaidToday(!!rows[0].last_date && new Date(rows[0].last_date).toDateString() === today);
      }
    } catch (e) {
      console.error("Could not load streak", e);
    }
  }

  // ---- Auth actions ----
  async function signUp() {
    setSignupError("");
    if (!signupEmail.trim() || !signupPassword || !signupConfirmPassword) {
      setSignupError("Fill in all fields.");
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError("Password should be at least 6 characters.");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords don't match.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: sbAuthHeaders(),
        body: JSON.stringify({ email: signupEmail.trim(), password: signupPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignupError(data?.msg || data?.error_description || data?.message || "Couldn't create account.");
        setAuthLoading(false);
        return;
      }
      if (data.access_token) {
        const newSession = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          userId: data.user?.id,
          email: data.user?.email,
        };
        await persistSession(newSession);
        setProfileEmail(newSession.email || "");
        setStep("setup");
      } else {
        setSignupError("Account created — check your email to confirm, then sign in.");
        setStep("signin");
      }
    } catch (e) {
      setSignupError("Something went wrong creating your account.");
    }
    setAuthLoading(false);
  }

  async function signIn() {
    setSigninError("");
    if (!signinEmail.trim() || !signinPassword) {
      setSigninError("Enter both your email and password.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: sbAuthHeaders(),
        body: JSON.stringify({ email: signinEmail.trim(), password: signinPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSigninError(data?.error_description || data?.msg || "Incorrect email or password.");
        setAuthLoading(false);
        return;
      }
      const newSession = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        userId: data.user?.id,
        email: data.user?.email,
      };
      await persistSession(newSession);
      await loadUserData(newSession);
      setStep("input");
    } catch (e) {
      setSigninError("Something went wrong signing in.");
    }
    setAuthLoading(false);
  }

  async function performLogout() {
    await persistSession(null);
    setProfileName("");
    setProfileGender("");
    setProfileEmail("");
    setFocusAreas(new Set());
    setAboutText("");
    setGallery([]);
    setStreak(0);
    setSaidToday(false);
    setSelectedIds(new Set());
    setStep("landing");
  }

  async function saveStreakRemote(newCount, lastDate) {
    if (!session) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/streaks`, {
        method: "POST",
        headers: { ...sbDataHeaders(session), Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify([{ user_id: session.userId, count: newCount, last_date: lastDate }]),
      });
    } catch (e) {
      console.error("Could not save streak", e);
    }
  }

  const FALLBACK_AFFIRMATIONS = [
    "Today, I AM capable, calm and moving forward with confidence. I AM letting go of what no longer serves me, and I AM choosing to see this moment as a fresh starting point rather than a repeat of the past. I picture myself handling what's ahead with a steady mind and an open heart. I AM taking one clear step today, and I AM trusting that this single step is enough to begin. Today, I AM becoming the version of myself I've been reaching toward.",
    "Today, I AM strong, focused and open to new possibilities. I AM trusting myself to handle whatever comes my way, even the parts I can't fully plan for. I see myself moving through today's challenges with a quiet, grounded confidence, learning as I go rather than waiting to feel ready. I AM taking one honest action today, and I AM letting that action speak louder than any doubt. Today, I AM building the life I want, one deliberate choice at a time.",
    "Today, I AM confident, resourceful and grounded in the present moment. I AM choosing growth over fear, and I AM allowing myself to be a beginner at the things I care about. I picture myself staying steady when things feel uncertain, trusting that capability grows through practice, not permission. I AM taking one small action today that reflects who I'm choosing to become. Today, I AM becoming more capable with every experience I create.",
    "Today, I AM steady, capable and willing to try. I AM seeing challenges as evidence that I am growing, not proof that I can't, and I AM releasing the need to have everything figured out before I begin. I see myself moving forward with patience toward myself, one honest step at a time. I AM taking that step today, trusting that consistency matters more than perfection. Today, I AM.",
  ];

  function localFallbackAffirmation() {
    return FALLBACK_AFFIRMATIONS[Math.floor(Math.random() * FALLBACK_AFFIRMATIONS.length)];
  }

  async function requestAffirmation(beliefText) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system:
          "Before writing anything, work out silently: (1) the underlying desire behind what the person shared \u2014 not just the surface complaint, (2) the identity they'd need to become to live that desire, (3) one or two emotions that fit this specific goal (don't force every emotion into every affirmation), and (4) whether the person named an old pattern or belief \u2014 if they didn't, don't invent one. Then write ONE elaborate, present-tense affirmation of 5-7 sentences built on \u2018I AM\u2019 or \u2018Today, I AM\u2019, flowing as a single spoken declaration a person would say to themselves \u2014 not a list, not sections, not a lecture. It should: open by naming the desired identity directly; include emotionally meaningful language; include a visualizable moment of the person living this identity (something they can picture themselves doing); connect the identity to one grounded next action; and close by returning to \u2018Today, I AM\u2019. Never negate the old pattern (avoid \u2018I AM not afraid\u2019 or \u2018I AM no longer limited\u2019) \u2014 state the desired identity directly instead (\u2018I AM calm and courageous\u2019, \u2018I AM discovering possibilities beyond what I once believed\u2019). Never just restate the input positively \u2014 elaborate past it into who they're becoming. Keep it believable: no exaggerated or guaranteed-outcome claims (never \u2018I AM the best in the world\u2019 or \u2018guaranteed to succeed\u2019); if the desire is a big leap from where they are, build a believable bridge (\u2018Today, I AM becoming more confident every time I take action\u2019) rather than an instant absolute. Present tense, first person, no hedging (try/hope/want/will be). It should sound personal and spoken, not like an instruction manual or a therapist talking about the person. Output only the affirmation itself as plain sentences \u2014 no quotes, no headings, no lists, no explanation.",
        messages: [{ role: "user", content: beliefText }],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Anthropic API error:", data);
      throw new Error(data?.error?.message || "API error");
    }
    const text = data?.content?.find((b) => b.type === "text")?.text?.trim();
    if (!text) throw new Error("empty response");
    return text;
  }

  async function handleSubmit() {
    if (!belief.trim()) return;
    setError("");
    setStep("loading");

    let text = null;
    for (let attempt = 0; attempt < 2 && !text; attempt++) {
      try {
        text = await requestAffirmation(belief.trim());
      } catch (e) {
        console.error(`Affirmation generation attempt ${attempt + 1} failed:`, e);
        if (attempt === 0) await new Promise((r) => setTimeout(r, 700));
      }
    }

    if (!text) {
      console.warn("Both attempts failed — using local fallback affirmation.");
      text = localFallbackAffirmation();
    }

    setDeclaration(text.replace(/^["']|["']$/g, ""));
    setStep("declaration");
  }

  function speak(text, onEnd) {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.8;
    utter.pitch = 1.0;
    if (selectedVoiceURI) {
      const match = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
      if (match) utter.voice = match;
    }
    utter.onend = () => onEnd && onEnd();
    window.speechSynthesis.speak(utter);
  }

  function splitIntoSentences(text) {
    const matches = text.match(/[^.!?]+[.!?]+(\s|$)/g);
    if (matches && matches.length) return matches.map((s) => s.trim()).filter(Boolean);
    return [text.trim()];
  }

  function speakSentenceQueue(sentences, onAllDone, pauseMs = 600) {
    let idx = 0;
    function next() {
      if (speechCancelRef.current) return;
      if (idx >= sentences.length) {
        onAllDone && onAllDone();
        return;
      }
      const utter = new SpeechSynthesisUtterance(sentences[idx]);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      if (selectedVoiceURI) {
        const match = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
        if (match) utter.voice = match;
      }
      utter.onend = () => {
        idx += 1;
        if (speechCancelRef.current) return;
        setTimeout(() => {
          if (!speechCancelRef.current) next();
        }, pauseMs);
      };
      window.speechSynthesis.speak(utter);
    }
    next();
  }

  function playDeclaration() {
    if (speaking) {
      speechCancelRef.current = true;
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    speechCancelRef.current = false;
    window.speechSynthesis.cancel();
    setSpeaking(true);
    speakSentenceQueue(splitIntoSentences(declaration), () => setSpeaking(false));
  }

  async function resetStreak() {
    setStreak(0);
    setSaidToday(false);
    if (session) {
      await saveStreakRemote(0, null);
    } else {
      await persistLocalStreak(0);
    }
  }

  function startEdit() {
    setEditText(declaration);
    setIsEditing(true);
  }
  function confirmEdit() {
    if (editText.trim()) setDeclaration(editText.trim());
    setIsEditing(false);
  }
  function cancelEdit() {
    setIsEditing(false);
    setEditText("");
  }

  async function saveToGallery(text) {
    const newItem = {
      id: session ? null : `local-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      playCount: 0,
    };
    if (!session) {
      const updated = [newItem, ...gallery];
      setGallery(updated);
      await persistLocalGallery(updated);
      return newItem.id;
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/affirmations`, {
        method: "POST",
        headers: { ...sbDataHeaders(session), Prefer: "return=representation" },
        body: JSON.stringify([{ user_id: session.userId, text, play_count: 0 }]),
      });
      const rows = await res.json();
      const row = rows[0];
      const savedItem = { id: row.id, text: row.text, createdAt: row.created_at, playCount: row.play_count || 0 };
      setGallery((g) => [savedItem, ...g]);
      return savedItem.id;
    } catch (e) {
      console.error("Could not save to gallery, saving locally instead", e);
      const updated = [{ ...newItem, id: `local-${Date.now()}` }, ...gallery];
      setGallery(updated);
      await persistLocalGallery(updated);
      return updated[0].id;
    }
  }

  async function goToGallery() {
    await saveToGallery(declaration);
    setCameFrom("declaration");
    setStep("gallery");
  }

  function openGallery() {
    setMenuOpen(false);
    setCameFrom(step === "gallery" ? "input" : step);
    stopSequence();
    stopLessonAudio();
    setStep("gallery");
  }
  function openSetup() {
    setMenuOpen(false);
    setCameFrom(step === "setup" ? "input" : step);
    stopLessonAudio();
    setStep("setup");
  }
  function openLogout() {
    setMenuOpen(false);
    setCameFrom(step === "logout" ? "input" : step);
    stopLessonAudio();
    setStep("logout");
  }
  function goHome() {
    setMenuOpen(false);
    stopLessonAudio();
    setStep("landing");
  }
  function goToSignIn() {
    setSigninError("");
    setCameFrom("landing");
    stopLessonAudio();
    setStep("signin");
  }
  function goToSignUp() {
    setSignupError("");
    setCameFrom("landing");
    stopLessonAudio();
    setStep("signup");
  }
  function goToLessons() {
    setLessonPage(0);
    setCameFrom("landing");
    setStep("lessons");
  }

  function backFromSubpage() {
    stopSequence();
    setSelectedIds(new Set());
    setEditingId(null);
    setStep(cameFrom);
  }

  function startOver() {
    stopLessonAudio();
    setStep("input");
    setBelief("");
    setDeclaration("");
    setError("");
    setIsEditing(false);
    setMicError("");
  }

  function toggleFocusArea(area) {
    setFocusAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  }

  async function saveProfile() {
    if (!session) {
      await persistLocalProfile();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
      return;
    }
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: { ...sbDataHeaders(session), Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify([
          {
            id: session.userId,
            name: profileName,
            gender: profileGender,
            focus_areas: Array.from(focusAreas),
            about: aboutText,
            voice_uri: selectedVoiceURI,
            reminder_on: reminderOn,
            reminder_time: reminderTime,
          },
        ]),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (e) {
      console.error("Could not save profile", e);
    }
  }

  async function submitPasswordChange() {
    setPwMessage("");
    if (!newPw || !confirmPw) {
      setPwMessage("Enter and confirm your new password.");
      return;
    }
    if (newPw.length < 6) {
      setPwMessage("New password should be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwMessage("New password and confirmation don't match.");
      return;
    }
    if (!session) {
      setPwMessage("Sign in to change your password.");
      return;
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: sbDataHeaders(session),
        body: JSON.stringify({ password: newPw }),
      });
      if (!res.ok) {
        const d = await res.json();
        setPwMessage(d?.msg || "Couldn't update password.");
        return;
      }
      setPwMessage("Password updated.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e) {
      setPwMessage("Something went wrong updating your password.");
    }
  }

  // ---- Gallery helpers ----
  function toggleSelect(id) {
    if (editingId) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function orderedSelectedItems() {
    return gallery.filter((g) => selectedIds.has(g.id));
  }
  function stopSequence() {
    speechCancelRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlayingSequence(false);
    setCurrentPlayingId(null);
  }

  async function playSelected() {
    const items = orderedSelectedItems();
    if (items.length === 0) return;
    if (isPlayingSequence) {
      stopSequence();
      return;
    }

    const updated = gallery.map((g) =>
      selectedIds.has(g.id) ? { ...g, playCount: (g.playCount || 0) + repeatCount } : g
    );
    setGallery(updated);
    if (session) {
      updated
        .filter((g) => selectedIds.has(g.id))
        .forEach((g) => {
          fetch(`${SUPABASE_URL}/rest/v1/affirmations?id=eq.${g.id}`, {
            method: "PATCH",
            headers: sbDataHeaders(session),
            body: JSON.stringify({ play_count: g.playCount }),
          }).catch(() => {});
        });
    } else {
      await persistLocalGallery(updated);
    }

    let base = [...items];
    if (shuffleOn) {
      for (let i = base.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [base[i], base[j]] = [base[j], base[i]];
      }
    }
    let queue = [];
    for (let r = 0; r < repeatCount; r++) queue = queue.concat(base);

    speechCancelRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlayingSequence(true);
    let idx = 0;
    function playNextItem() {
      if (speechCancelRef.current) {
        setIsPlayingSequence(false);
        setCurrentPlayingId(null);
        return;
      }
      if (idx >= queue.length) {
        setIsPlayingSequence(false);
        setCurrentPlayingId(null);
        return;
      }
      const item = queue[idx];
      setCurrentPlayingId(item.id);
      speakSentenceQueue(
        splitIntoSentences(item.text),
        () => {
          idx += 1;
          if (speechCancelRef.current) return;
          setTimeout(() => {
            if (!speechCancelRef.current) playNextItem();
          }, 750);
        },
        600
      );
    }
    playNextItem();
  }

  function startEditItem(item) {
    stopSequence();
    setEditingId(item.id);
    setGalleryEditText(item.text);
  }
  async function saveEditItem() {
    if (!galleryEditText.trim()) return;
    if (session) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/affirmations?id=eq.${editingId}`, {
          method: "PATCH",
          headers: sbDataHeaders(session),
          body: JSON.stringify({ text: galleryEditText.trim() }),
        });
      } catch (e) {
        console.error("Could not update affirmation", e);
      }
    }
    const updated = gallery.map((it) => (it.id === editingId ? { ...it, text: galleryEditText.trim() } : it));
    setGallery(updated);
    if (!session) await persistLocalGallery(updated);
    setEditingId(null);
    setGalleryEditText("");
  }
  function cancelEditItem() {
    setEditingId(null);
    setGalleryEditText("");
  }

  async function deleteSelected() {
    const ids = Array.from(selectedIds);
    if (session && ids.length) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/affirmations?id=in.(${ids.join(",")})`, {
          method: "DELETE",
          headers: sbDataHeaders(session),
        });
      } catch (e) {
        console.error("Could not delete affirmations", e);
      }
    }
    const updated = gallery.filter((it) => !selectedIds.has(it.id));
    setGallery(updated);
    if (!session) await persistLocalGallery(updated);
    setSelectedIds(new Set());
    setConfirmDelete(false);
  }

  function downloadSelectedText() {
    const items = orderedSelectedItems();
    if (items.length === 0) return;
    const content = items
      .map((it, i) => `${i + 1}. ${new Date(it.createdAt).toLocaleDateString()}\n${it.text}`)
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = items.length === 1 ? "affirmation.txt" : "affirmations.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadSelectedMp3() {
    const items = orderedSelectedItems();
    if (items.length === 0) return;
    setDownloadNotice(
      "MP3 download needs ElevenLabs, which isn't connected in this preview. In the full app, this button will save real audio files."
    );
    setTimeout(() => setDownloadNotice(""), 4000);
  }

  function dateLabel(iso) {
    const d = new Date(iso);
    const today = new Date();
    const yest = new Date();
    yest.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
  function dateTimeLabel(iso) {
    const d = new Date(iso);
    const datePart = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const timePart = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${datePart} · ${timePart}`;
  }
  function groupedGallery() {
    const groups = [];
    gallery.forEach((item) => {
      const label = dateLabel(item.createdAt);
      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });
    return groups;
  }

  const selectedCount = selectedIds.size;
  const firstName = profileName.trim().split(" ")[0] || "";

  return (
    <div
      style={{ backgroundColor: "#FFFFFF", minHeight: "100%", color: INK }}
      className="w-full min-h-screen flex flex-col items-center px-6 py-10 font-sans"
      onClick={() => menuOpen && setMenuOpen(false)}
    >
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-10 relative">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: ACCENT }}>
          Say &amp; It Becomes
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Flame size={18} style={{ color: streak > 0 ? ACCENT : "#D8D8D8" }} fill={streak > 0 ? ACCENT : "none"} />
            <span className="text-sm font-semibold" style={{ color: INK }}>
              {streak}
            </span>
          </div>
          {firstName && (
            <span className="text-sm font-semibold" style={{ color: INK }}>
              Hi, {firstName}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            aria-label="Menu"
            className="p-1"
          >
            <Menu size={22} style={{ color: INK }} />
          </button>
        </div>

        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-9 w-48 rounded-2xl py-2 z-20"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #F0F0F0" }}
          >
            <button
              onClick={goHome}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5"
              style={{ color: INK }}
            >
              <Home size={16} style={{ color: MUTED }} />
              Home
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                startOver();
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5"
              style={{ color: INK }}
            >
              <Sparkles size={16} style={{ color: MUTED }} />
              Affirmation
            </button>
            <button
              onClick={openGallery}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5"
              style={{ color: INK }}
            >
              <BookOpen size={16} style={{ color: MUTED }} />
              Gallery
            </button>
            <button
              onClick={openSetup}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5"
              style={{ color: INK }}
            >
              <Settings size={16} style={{ color: MUTED }} />
              Setup
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                setLessonPage(0);
                setCameFrom(step === "lessons" ? "input" : step);
                setStep("lessons");
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5"
              style={{ color: INK }}
            >
              <GraduationCap size={16} style={{ color: MUTED }} />
              Free Lessons
            </button>
            <button
              onClick={openLogout}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5"
              style={{ color: "#D64545" }}
            >
              <LogOut size={16} style={{ color: "#D64545" }} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* LANDING */}
      {step === "landing" && (
        <div className="w-full max-w-md flex-1 flex flex-col justify-center items-center text-center">
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');`}</style>
          <h1
            className="text-5xl leading-tight mb-4"
            style={{ color: ACCENT, fontFamily: "'Alex Brush', cursive", fontWeight: 400 }}
          >
            Welcome to<br />
            Say &amp; It Becomes
          </h1>
          <p className="text-sm mb-6 max-w-xs" style={{ color: MUTED }}>
            Speak it, and let it become. Turn your thoughts into powerful, spoken affirmations.
          </p>

          <button onClick={goToLessons} className="text-sm font-semibold underline mb-10" style={{ color: INK }}>
            Free Lessons
          </button>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={goToSignIn}
              className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base"
              style={{ backgroundColor: "#F7F7F7", color: INK }}
            >
              <LogIn size={18} />
              Sign In
            </button>
            <button
              onClick={goToSignUp}
              className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base"
              style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
            >
              <UserPlus size={18} />
              Join New
            </button>
          </div>

          <button onClick={continueAsGuest} className="text-xs mt-6" style={{ color: MUTED }}>
            Just testing? Continue without an account
          </button>
        </div>
      )}

      {/* SIGN UP (create account) */}
      {step === "signup" && (
        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          <button onClick={backFromSubpage} className="flex items-center gap-1.5 mb-8 text-sm font-semibold" style={{ color: MUTED }}>
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-3xl leading-tight font-semibold mb-2" style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Create your account
          </h1>
          <p className="text-sm mb-6" style={{ color: MUTED }}>
            Just needs an email and password — you'll fill in the rest next.
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: INK }}>
                <Mail size={14} style={{ color: MUTED }} />
                Email
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                style={{ borderColor: "#EAEAEA", color: INK }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: INK }}>
                <Lock size={14} style={{ color: MUTED }} />
                Password
              </label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                style={{ borderColor: "#EAEAEA", color: INK }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: INK }}>
                <Lock size={14} style={{ color: MUTED }} />
                Confirm password
              </label>
              <input
                type="password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                placeholder="Type it again"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                style={{ borderColor: "#EAEAEA", color: INK }}
              />
            </div>
            {signupError && (
              <p className="text-sm" style={{ color: "#D64545" }}>
                {signupError}
              </p>
            )}
            <button
              onClick={signUp}
              disabled={authLoading}
              className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base mt-2 disabled:opacity-60"
              style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
            >
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {authLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </div>
      )}

      {/* SIGN IN */}
      {step === "signin" && (
        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          <button onClick={backFromSubpage} className="flex items-center gap-1.5 mb-8 text-sm font-semibold" style={{ color: MUTED }}>
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-3xl leading-tight font-semibold mb-2" style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Sign in
          </h1>
          <p className="text-sm mb-6" style={{ color: MUTED }}>
            Welcome back — pick up your affirmation practice where you left off.
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: INK }}>
                <Mail size={14} style={{ color: MUTED }} />
                Email
              </label>
              <input
                type="email"
                value={signinEmail}
                onChange={(e) => setSigninEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                style={{ borderColor: "#EAEAEA", color: INK }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: INK }}>
                <Lock size={14} style={{ color: MUTED }} />
                Password
              </label>
              <input
                type="password"
                value={signinPassword}
                onChange={(e) => setSigninPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                style={{ borderColor: "#EAEAEA", color: INK }}
              />
            </div>
            {signinError && (
              <p className="text-sm" style={{ color: "#D64545" }}>
                {signinError}
              </p>
            )}
            <button
              onClick={signIn}
              disabled={authLoading}
              className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base mt-2 disabled:opacity-60"
              style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
            >
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {authLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      )}

      {/* LESSONS */}
      {step === "lessons" && (
        <div className="w-full max-w-md flex-1 flex flex-col">
          <div
            className="rounded-3xl px-8 py-12 mb-6 flex flex-col items-center text-center"
            style={{
              background: "linear-gradient(160deg, #EDE3D4 0%, #DCC9AE 55%, #C9B393 100%)",
            }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "#000000", opacity: 0.55 }}>
              Free Lesson · {lessonPage + 1}/{LESSON_PAGES.length}
            </p>
            <h1
              className="text-3xl leading-snug mb-6"
              style={{ color: "#000000", fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontWeight: 700 }}
            >
              {LESSON_PAGES[lessonPage].title}
            </h1>
            <div className="flex flex-col gap-3 text-base leading-relaxed" style={{ color: "#000000", fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {LESSON_PAGES[lessonPage].paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <button
              onClick={playLessonAudio}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold mt-8"
              style={{ backgroundColor: lessonSpeaking ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.5)", color: "#000000" }}
            >
              {lessonSpeaking ? (
                <Square size={12} style={{ color: "#000000" }} fill="#000000" />
              ) : (
                <Volume2 size={14} style={{ color: "#000000" }} />
              )}
              {lessonSpeaking ? "Pause" : "Audio"}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 pt-4 border-t" style={{ borderColor: "#F0F0F0" }}>
            <button onClick={lessonHome} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: MUTED }}>
              <Home size={15} />
              Home
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={lessonBack}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: "#F7F7F7", color: INK }}
              >
                <ArrowLeft size={15} />
                Back
              </button>
              {lessonPage < LESSON_PAGES.length - 1 && (
                <button
                  onClick={lessonNext}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
                >
                  Next
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>

          {lessonPage === LESSON_PAGES.length - 1 && (
            <button
              onClick={goToSignUp}
              className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base mt-6"
              style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
            >
              <UserPlus size={18} />
              Get Started
            </button>
          )}
        </div>
      )}

      {/* INPUT */}
      {step === "input" && (
        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          <h1 className="text-3xl leading-tight font-semibold mb-3" style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            What's on your mind?
          </h1>
          <p className="text-sm mb-6" style={{ color: MUTED }}>
            A worry, a doubt, a goal — say it or type it. We'll turn it into a powerful affirmation.
          </p>

          <div className="flex rounded-full p-1 mb-5 w-fit" style={{ backgroundColor: "#F7F7F7" }}>
            <button
              onClick={() => {
                if (isListening) toggleListening();
                setMicError("");
                setInputMode("type");
              }}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: inputMode === "type" ? "#FFFFFF" : "transparent",
                color: inputMode === "type" ? INK : MUTED,
                boxShadow: inputMode === "type" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <Keyboard size={15} />
              Type
            </button>
            <button
              onClick={() => {
                setMicError("");
                setInputMode("mic");
              }}
              disabled={!micSupported}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
              style={{
                backgroundColor: inputMode === "mic" ? "#FFFFFF" : "transparent",
                color: inputMode === "mic" ? INK : MUTED,
                boxShadow: inputMode === "mic" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <Mic size={15} />
              Speak
            </button>
          </div>

          {inputMode === "type" ? (
            <textarea
              ref={textareaRef}
              value={belief}
              onChange={(e) => setBelief(e.target.value)}
              placeholder="I'm never going to be financially secure..."
              rows={4}
              className="w-full rounded-2xl p-4 text-base resize-none outline-none border-2 transition-colors"
              style={{ borderColor: belief ? ACCENT : "#EAEAEA", color: INK }}
            />
          ) : (
            <div className="w-full flex flex-col items-center">
              {!micSupported ? (
                <div className="w-full rounded-2xl p-4 mb-2 text-sm flex items-start gap-2" style={{ backgroundColor: "#FDF3ED", color: "#9A5230" }}>
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  This browser doesn't support speech recognition. Try Chrome or Edge, or switch to Type.
                </div>
              ) : (
                <>
                  <div
                    className="w-full rounded-2xl p-4 mb-4 text-base border-2 min-h-[104px]"
                    style={{ borderColor: isListening ? ACCENT : "#EAEAEA", color: belief ? INK : MUTED }}
                  >
                    {belief || "Tap the mic and say what's on your mind..."}
                  </div>
                  <button
                    onClick={toggleListening}
                    className="rounded-full w-16 h-16 flex items-center justify-center transition-transform"
                    style={{
                      backgroundColor: isListening ? "#FFFFFF" : ACCENT,
                      border: isListening ? `2px solid ${ACCENT}` : "none",
                      transform: isListening ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {isListening ? <Square size={20} style={{ color: ACCENT }} fill={ACCENT} /> : <Mic size={22} color="#FFFFFF" />}
                  </button>
                  <p className="text-xs mt-2" style={{ color: MUTED }}>
                    {isListening ? "Listening — tap to stop" : "Tap to speak"}
                  </p>
                  {micError && (
                    <p className="text-xs mt-3 text-center px-2" style={{ color: "#D64545" }}>
                      {micError}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm mt-3" style={{ color: "#D64545" }}>
              {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!belief.trim()}
            className="w-full mt-5 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base transition-opacity disabled:opacity-30"
            style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
          >
            Turn it into an affirmation
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* LOADING */}
      {step === "loading" && (
        <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
          <p className="text-sm" style={{ color: MUTED }}>
            Finding the words...
          </p>
        </div>
      )}

      {/* DECLARATION */}
      {step === "declaration" && (
        <div className="w-full max-w-md flex-1 flex flex-col">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: MUTED }}>
            Today's affirmation
          </p>
          <div className="flex-1 flex items-center py-4">
            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={5}
                autoFocus
                className="w-full text-xl leading-relaxed p-4 rounded-2xl border-2 outline-none resize-none"
                style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", borderColor: ACCENT }}
              />
            ) : (
              <p
                className="text-2xl leading-relaxed"
                style={{
                  color: INK,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  borderLeft: `3px solid ${ACCENT}`,
                  paddingLeft: "16px",
                }}
              >
                {declaration}
              </p>
            )}
          </div>

          {isEditing ? (
            <div className="flex gap-3 mb-3">
              <button onClick={cancelEdit} className="flex-1 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base" style={{ backgroundColor: "#F7F7F7", color: INK }}>
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                disabled={!editText.trim()}
                className="flex-1 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base disabled:opacity-30"
                style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
              >
                <Check size={18} />
                Save
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={playDeclaration}
                className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base mb-3"
                style={{ backgroundColor: speaking ? "#F5E4DD" : "#F7F7F7", color: INK }}
              >
                {speaking ? <Square size={16} style={{ color: ACCENT }} fill={ACCENT} /> : <Volume2 size={18} style={{ color: ACCENT }} />}
                {speaking ? "Pause" : "Hear it, then say it out loud"}
              </button>

              <div className="flex gap-3 mb-3">
                <button onClick={startEdit} className="flex-1 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base" style={{ backgroundColor: "#F7F7F7", color: INK }}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button onClick={goToGallery} className="flex-1 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base" style={{ backgroundColor: "#F7F7F7", color: INK }}>
                  <BookOpen size={16} />
                  Save it to Gallery
                </button>
              </div>

              <button onClick={startOver} className="w-full py-4 flex items-center justify-center gap-2 text-sm font-medium" style={{ color: MUTED }}>
                <RotateCcw size={14} />
                New affirmation
              </button>
            </>
          )}
        </div>
      )}

      {/* GALLERY */}
      {step === "gallery" && (
        <div className="w-full max-w-md flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <button onClick={backFromSubpage} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: MUTED }}>
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={startOver}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
              style={{ backgroundColor: "#F7F7F7", color: INK }}
            >
              <Sparkles size={14} style={{ color: ACCENT }} />
              Affirmation page
            </button>
          </div>

          <h1 className="text-2xl font-semibold mb-1" style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Your gallery
          </h1>
          <p className="text-sm mb-4" style={{ color: MUTED }}>
            {gallery.length === 0 ? "Nothing archived yet." : "Tap one or more to select, then play, shuffle, download, or delete."}
          </p>

          {selectedCount > 0 && (
            <div className="w-full rounded-2xl p-3 mb-5 flex items-center gap-2 flex-wrap" style={{ backgroundColor: "#F7F7F7" }}>
              {confirmDelete ? (
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="text-sm font-medium" style={{ color: INK }}>
                    Delete {selectedCount} affirmation{selectedCount === 1 ? "" : "s"}?
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: INK }}>
                      Cancel
                    </button>
                    <button onClick={deleteSelected} className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: "#D64545", color: "#FFFFFF" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={playSelected}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold"
                      style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
                    >
                      {isPlayingSequence ? <Square size={14} fill="#FFFFFF" /> : <Play size={14} fill="#FFFFFF" />}
                      {isPlayingSequence ? "Stop" : `Play (${selectedCount})`}
                    </button>
                    <button
                      onClick={() => setShuffleOn((s) => !s)}
                      className="flex items-center justify-center rounded-full w-9 h-9 flex-shrink-0"
                      style={{ backgroundColor: shuffleOn ? ACCENT : "#FFFFFF", color: shuffleOn ? "#FFFFFF" : INK }}
                      title="Shuffle order"
                    >
                      <Shuffle size={15} />
                    </button>
                    <select
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(Number(e.target.value))}
                      className="rounded-full px-2.5 py-2 text-sm font-semibold outline-none flex-shrink-0"
                      style={{ backgroundColor: "#FFFFFF", color: INK }}
                      title="Repeat how many times"
                    >
                      {[1, 2, 3, 5, 10].map((n) => (
                        <option key={n} value={n}>
                          ×{n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={downloadSelectedText} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: INK }}>
                      <FileText size={14} />
                      Download Text
                    </button>
                    <button onClick={downloadSelectedMp3} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: INK }}>
                      <FileAudio size={14} />
                      Download MP3
                    </button>
                    <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: "#D64545" }}>
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                  {downloadNotice && (
                    <p className="text-xs px-1" style={{ color: MUTED }}>
                      {downloadNotice}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {gallery.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <BookOpen size={32} style={{ color: "#D8D8D8" }} />
              <p className="text-sm mt-3" style={{ color: MUTED }}>
                Affirmations you save will show up here so you can hear them again anytime.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 overflow-y-auto pb-6">
              {groupedGallery().map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: MUTED }}>
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-3">
                    {group.items.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const isPlaying = currentPlayingId === item.id;
                      const isEditingThis = editingId === item.id;

                      if (isEditingThis) {
                        return (
                          <div key={item.id} className="w-full rounded-2xl p-4" style={{ backgroundColor: "#FDEDE7", border: `2px solid ${ACCENT}` }}>
                            <textarea
                              value={galleryEditText}
                              onChange={(e) => setGalleryEditText(e.target.value)}
                              rows={3}
                              autoFocus
                              className="w-full text-sm leading-relaxed p-2 rounded-xl outline-none resize-none mb-3"
                              style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", backgroundColor: "#FFFFFF" }}
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={cancelEditItem} className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: INK }}>
                                Cancel
                              </button>
                              <button
                                onClick={saveEditItem}
                                disabled={!galleryEditText.trim()}
                                className="rounded-full px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
                                style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelect(item.id)}
                          className="w-full rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-colors"
                          style={{
                            backgroundColor: isPlaying ? "#FDEDE7" : isSelected ? "#FBEAE3" : "#F7F7F7",
                            border: isSelected ? `1.5px solid ${ACCENT}` : "1.5px solid transparent",
                          }}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isSelected ? (
                              <CheckCircle2 size={20} style={{ color: ACCENT }} fill={ACCENT} stroke="#FFFFFF" />
                            ) : (
                              <Circle size={20} style={{ color: "#D8D8D8" }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm leading-snug"
                              style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                            >
                              {item.text}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-xs" style={{ color: MUTED }}>
                                {dateTimeLabel(item.createdAt)}
                              </span>
                              {isPlaying && (
                                <span className="text-xs font-medium" style={{ color: ACCENT }}>
                                  Playing now
                                </span>
                              )}
                              <span className="text-xs flex items-center gap-1" style={{ color: MUTED }}>
                                <Volume2 size={11} />
                                {item.playCount || 0} listen{item.playCount === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditItem(item);
                            }}
                            className="flex-shrink-0 p-1.5 rounded-full"
                            style={{ color: MUTED }}
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SETUP */}
      {step === "setup" && (
        <div className="w-full max-w-md flex-1 flex flex-col pb-10">
          <button onClick={backFromSubpage} className="flex items-center gap-1.5 mb-6 text-sm font-semibold" style={{ color: MUTED }}>
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Setup
          </h1>
          <p className="text-sm mb-8" style={{ color: MUTED }}>
            The more we know, the more personal your affirmations become.
          </p>

          <div className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: INK }}>
                <User size={14} style={{ color: MUTED }} />
                Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2 transition-colors"
                style={{ borderColor: profileName ? ACCENT : "#EAEAEA", color: INK }}
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: INK }}>
                Gender
              </p>
              <div className="flex rounded-full p-1 w-fit" style={{ backgroundColor: "#F7F7F7" }}>
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setProfileGender(g)}
                    className="rounded-full px-4 py-2 text-sm font-semibold"
                    style={{
                      backgroundColor: profileGender === g ? "#FFFFFF" : "transparent",
                      color: profileGender === g ? INK : MUTED,
                      boxShadow: profileGender === g ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: INK }}>
                <Mail size={14} style={{ color: MUTED }} />
                Email
              </label>
              <input
                type="email"
                value={profileEmail}
                disabled
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                style={{ borderColor: "#EAEAEA", color: MUTED, backgroundColor: "#FAFAFA" }}
              />
              <p className="text-xs mt-1.5" style={{ color: MUTED }}>
                This is your sign-in email.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: INK }}>
                What are you working on?
              </p>
              <p className="text-xs mb-2" style={{ color: MUTED }}>
                Pick as many as apply — this shapes the affirmations you get.
              </p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map((area) => {
                  const active = focusAreas.has(area);
                  return (
                    <button
                      key={area}
                      onClick={() => toggleFocusArea(area)}
                      className="rounded-full px-3.5 py-2 text-sm font-semibold transition-colors"
                      style={{ backgroundColor: active ? ACCENT : "#F7F7F7", color: active ? "#FFFFFF" : INK }}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: INK }}>
                Describe yourself
              </p>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Your fears, doubts, concerns, strengths, weaknesses..."
                rows={4}
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2 resize-none transition-colors"
                style={{ borderColor: aboutText ? ACCENT : "#EAEAEA", color: INK }}
              />
            </div>

            <button
              onClick={saveProfile}
              className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
              style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
            >
              {profileSaved ? (
                <>
                  <Check size={16} />
                  Saved
                </>
              ) : (
                "Save profile"
              )}
            </button>

            <div className="pt-2 border-t" style={{ borderColor: "#F0F0F0" }}>
              <button onClick={() => setShowPasswordFields((s) => !s)} className="flex items-center gap-1.5 text-sm font-semibold mt-4" style={{ color: INK }}>
                <Lock size={14} style={{ color: MUTED }} />
                Change password
              </button>
              {showPasswordFields && (
                <div className="flex flex-col gap-3 mt-3">
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="New password"
                    className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                    style={{ borderColor: "#EAEAEA", color: INK }}
                  />
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                    style={{ borderColor: "#EAEAEA", color: INK }}
                  />
                  {pwMessage && (
                    <p className="text-xs" style={{ color: pwMessage === "Password updated." ? ACCENT : "#D64545" }}>
                      {pwMessage}
                    </p>
                  )}
                  <button onClick={submitPasswordChange} className="rounded-2xl py-3 text-sm font-semibold" style={{ backgroundColor: "#F7F7F7", color: INK }}>
                    Update password
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t" style={{ borderColor: "#F0F0F0" }}>
              <p className="text-sm font-semibold mb-2 mt-4" style={{ color: INK }}>
                Voice
              </p>
              <div className="flex rounded-full p-1 w-fit mb-3" style={{ backgroundColor: "#F7F7F7" }}>
                <button
                  onClick={() => setVoicePref("coach")}
                  className="rounded-full px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: voicePref === "coach" ? "#FFFFFF" : "transparent",
                    color: voicePref === "coach" ? INK : MUTED,
                    boxShadow: voicePref === "coach" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  Preset voice
                </button>
                <button
                  onClick={() => setVoicePref("mine")}
                  className="rounded-full px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: voicePref === "mine" ? "#FFFFFF" : "transparent",
                    color: voicePref === "mine" ? INK : MUTED,
                    boxShadow: voicePref === "mine" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  My voice
                </button>
              </div>

              {voicePref === "coach" ? (
                availableVoices.length > 0 ? (
                  <div className="flex gap-2 items-center">
                    <select
                      value={selectedVoiceURI}
                      onChange={(e) => setSelectedVoiceURI(e.target.value)}
                      className="flex-1 rounded-2xl p-3.5 text-sm outline-none border-2"
                      style={{ borderColor: "#EAEAEA", color: INK, backgroundColor: "#FFFFFF" }}
                    >
                      <option value="">Default voice</option>
                      {availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => speak("This is what your affirmations will sound like.")}
                      className="rounded-full w-11 h-11 flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#F7F7F7" }}
                      aria-label="Preview voice"
                    >
                      <Volume2 size={16} style={{ color: ACCENT }} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: MUTED }}>
                    Loading available voices...
                  </p>
                )
              ) : (
                <div className="rounded-2xl p-3.5 text-sm flex items-start gap-2" style={{ backgroundColor: "#FDF3ED", color: "#9A5230" }}>
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  Voice cloning uses ElevenLabs and isn't connected in this preview. In the full app, you'll record a
                  short sample once and every affirmation will play back in your own voice.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: INK }}>
                  Daily reminder
                </p>
                <p className="text-xs" style={{ color: MUTED }}>
                  A nudge to say your affirmation
                </p>
              </div>
              <button
                onClick={() => setReminderOn((r) => !r)}
                className="w-12 h-7 rounded-full flex items-center px-0.5 transition-colors"
                style={{ backgroundColor: reminderOn ? ACCENT : "#E0E0E0" }}
              >
                <div className="w-6 h-6 rounded-full bg-white transition-transform" style={{ transform: reminderOn ? "translateX(20px)" : "translateX(0)" }} />
              </button>
            </div>

            {reminderOn && (
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: INK }}>
                  Reminder time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="rounded-2xl p-3.5 text-base outline-none border-2"
                  style={{ borderColor: "#EAEAEA", color: INK }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOGOUT */}
      {step === "logout" && (
        <div className="w-full max-w-md flex-1 flex flex-col">
          <button onClick={backFromSubpage} className="flex items-center gap-1.5 mb-6 text-sm font-semibold" style={{ color: MUTED }}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <LogOut size={28} style={{ color: "#D8D8D8" }} />
            <h1 className="text-xl font-semibold mt-4 mb-2" style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Logout
            </h1>
            {session ? (
              <>
                <p className="text-sm max-w-xs mb-6" style={{ color: MUTED }}>
                  You're signed in as <strong style={{ color: INK }}>{session.email}</strong>.
                </p>
                <button
                  onClick={performLogout}
                  className="rounded-2xl px-6 py-3.5 flex items-center gap-2 font-semibold text-sm"
                  style={{ backgroundColor: "#D64545", color: "#FFFFFF" }}
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <p className="text-sm max-w-xs" style={{ color: MUTED }}>
                You're not signed in.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
