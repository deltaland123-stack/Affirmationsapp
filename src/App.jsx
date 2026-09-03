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
  Share2,
  CreditCard,
} from "lucide-react";

const ACCENT = "#E8532A";
const INK = "#14181F";
const MUTED = "#8A8F98";

// ElevenLabs premade voices offered in Setup — 4 male, 4 female. The `id` is the
// ElevenLabs voice_id sent to /api/text-to-speech. All verified available on the
// project's plan.
const ELEVENLABS_VOICES = [
  { id: "nPczCjzI2devNBz1zQrb", label: "Brian — deep, calm (male)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", label: "George — warm, mature (male)" },
  { id: "onwK4e9ZLuTAKqWW03F9", label: "Daniel — British, measured (male)" },
  { id: "bIHbv24MWmeRgasZH58o", label: "Will — friendly, easy (male)" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Sarah — soft, warm (female)" },
  { id: "FGY2WhTYpPnrIDTdsKH5", label: "Laura — bright, smooth (female)" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", label: "Alice — clear, British (female)" },
  { id: "XrExE9yKIg1WjnnlVkGX", label: "Matilda — warm, friendly (female)" },
];

// Rewrite a first-person "I AM" affirmation as a second-person "You are" whisper,
// opened with the reader's name. Used by the Universe Whispers page — same rules
// as a normal affirmation, just addressed to "you".
function toUniverseWhisper(text, name) {
  let t = text
    .replace(/\bI [Aa][Mm]\b/g, "you are")
    .replace(/\bI['’]m\b/gi, "you're")
    .replace(/\bI['’]ve\b/gi, "you've")
    .replace(/\bI['’]ll\b/gi, "you'll")
    .replace(/\bmyself\b/gi, "yourself")
    .replace(/\bI\b/g, "you")
    .replace(/\bmine\b/gi, "yours")
    .replace(/\bmy\b/gi, "your")
    .replace(/\bme\b/gi, "you");
  // Recapitalise the start of each sentence.
  t = t.replace(/(^|[.!?]\s+)([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());
  // Open the affirmation with the user's name.
  const who = (name || "").trim();
  if (who) {
    t = t.replace(/^today,\s*/i, "");
    t = t.charAt(0).toLowerCase() + t.slice(1);
    t = `${who}, ${t}`;
  }
  return t;
}

function GoogleIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function AppleIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function FacebookIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

const SUPABASE_URL = "https://krtixudkoojbhypypjqv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydGl4dWRrb29qYmh5cHlwanF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NzY4NDUsImV4cCI6MjEwMzQ1Mjg0NX0.3-Bx-JlBjuYDduSyBoXtUvVTfJEyGU1a4dRlOretEWA";

export default function SayAndItBecomes() {
  const [step, setStep] = useState("landing"); // landing | signup | signin | whisperName | input | whispers | loading | declaration | gallery | setup | loggedOut | lessons
  const [belief, setBelief] = useState("");
  const [declaration, setDeclaration] = useState("");
  const [error, setError] = useState("");
  const [whisperName, setWhisperName] = useState("");
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
  const elevenAudioRef = useRef(null);

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
  const [isPaidMember, setIsPaidMember] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallPlan, setPaywallPlan] = useState("trial"); // trial | annual
  const [payCard, setPayCard] = useState("");
  const [payExp, setPayExp] = useState("");
  const [payCvc, setPayCvc] = useState("");

  // Setup / profile
  const [voicePref, setVoicePref] = useState("coach");
  const [reminderOn, setReminderOn] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [profileName, setProfileName] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [focusAreas, setFocusAreas] = useState(new Set());
  const [aboutText, setAboutText] = useState("");
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
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupAgreed, setSignupAgreed] = useState(false);
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
        "It usually starts with a simple thought: \"I would love to have this in my life.\"",
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
        "One part of you knows what you want and says, \"I can do this.\"",
        "It is your conscious mind, the part that makes decisions, sets goals and chooses where to focus your attention.",
        "But there is another part carrying years of experiences, habits, assumptions and beliefs about who you are.",
        "Sometimes it quietly says, \"That isn't for someone like me.\"",
        "You may consciously want a new life while an old belief keeps pulling you toward what feels familiar and safe.",
        "The challenge is not only creating a new desire. It is teaching your mind to accept a new possibility.",
      ],
    },
    {
      title: "Your Old Beliefs Shape What You See",
      paragraphs: [
        "You don't experience the world exactly as it is; you experience it through the beliefs and expectations you carry.",
        "An opportunity can look exciting to one person and frightening to another.",
        "One person sees a challenge and thinks, \"I can learn this.\" Another sees the same challenge and thinks, \"I'm not good enough.\"",
        "The difference may not be the opportunity itself, but the meaning each person gives to it.",
        "Your old beliefs can quietly influence what you notice, what you expect, and how you respond.",
        "Your perception becomes the lens through which you experience your world.",
      ],
    },
    {
      title: "\"I AM\" Creates the New Direction",
      paragraphs: [
        "This is where the power of affirmation begins.",
        "\"I AM\" is more than a statement about who you are; it puts your attention on who you are choosing to be right now.",
        "When you say, \"I AM confident,\" \"I AM capable,\" or \"I AM persistent,\" you are not talking about yesterday or waiting for tomorrow.",
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
        "Every time you say \"I AM,\" visualize it, feel it and act on it, you give yourself another opportunity to practice the new way of being.",
        "Every new action can create a new experience, and every new experience can become evidence that supports your new belief.",
        "The old belief may remain in the background, but it does not have to control your direction.",
        "Dream it. Desire it. Say \"I AM.\" Feel it. Visualize it. Live it. Repeat it.",
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
        const raw = localStorage.getItem("supabase-session");
        if (raw) {
          const sess = JSON.parse(raw);
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
      if (newSession) localStorage.setItem("supabase-session", JSON.stringify(newSession));
      else localStorage.removeItem("supabase-session");
    } catch (e) {
      console.error("Could not persist session", e);
    }
  }

  // ---- Guest mode (no Supabase session): persist locally on-device ----
  async function loadLocalGuestData() {
    try {
      const raw = localStorage.getItem("streak-data");
      if (raw) {
        const d = JSON.parse(raw);
        setStreak(d.count || 0);
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem("gallery-data");
      if (raw) setGallery(JSON.parse(raw));
    } catch (e) {}
    try {
      const raw = localStorage.getItem("profile-data");
      if (raw) {
        const p = JSON.parse(raw);
        setProfileName(p.name || "");
        setProfileGender(p.gender || "");
        setProfileEmail(p.email || "");
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
      localStorage.setItem("gallery-data", JSON.stringify(items));
    } catch (e) {
      console.error("Could not save gallery locally", e);
    }
  }

  async function persistLocalStreak(count) {
    try {
      localStorage.setItem("streak-data", JSON.stringify({ count }));
    } catch (e) {
      console.error("Could not save streak locally", e);
    }
  }

  async function persistLocalProfile() {
    try {
      localStorage.setItem(
        "profile-data",
        JSON.stringify({
          name: profileName,
          gender: profileGender,
          email: profileEmail,
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
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword || !signupConfirmPassword) {
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
    if (!signupAgreed) {
      setSignupError("Please agree to the Terms & Conditions to continue.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: sbAuthHeaders(),
        body: JSON.stringify({
        email: signupEmail.trim(),
        password: signupPassword,
        data: { name: signupName.trim() },
      }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignupError(data?.msg || data?.error_description || data?.message || "Couldn't create account.");
        setAuthLoading(false);
        return;
      }
      setProfileName(signupName.trim());
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

  function signUpWithProvider(provider) {
    // Supabase OAuth. Each provider must be enabled in the Supabase dashboard
    // (Authentication → Providers) for this to complete instead of erroring.
    const redirectTo = encodeURIComponent(window.location.origin + window.location.pathname);
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`;
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
        // Credentials don't match anything on record — carry the email over and
        // send them to Setup to finish creating their account.
        setProfileEmail(signinEmail.trim());
        setSigninError("");
        setAuthLoading(false);
        setCameFrom("landing");
        setStep("setup");
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
    setMenuOpen(false);
    stopLessonAudio();
    setStep("loggedOut");
    // Revoke the session on Supabase too, not just locally.
    if (session?.accessToken) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
      } catch (e) {
        console.error("Could not revoke Supabase session", e);
      }
    }
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
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ belief: beliefText }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Generate API error:", data);
      throw new Error(data?.error || "API error");
    }
    const text = data?.content?.find((b) => b.type === "text")?.text?.trim();
    if (!text) throw new Error("empty response");
    return text;
  }

  async function handleSubmit() {
    if (!belief.trim()) return;
    const asWhisper = step === "whispers";
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

    let finalText = text.replace(/^["']|["']$/g, "");
    if (asWhisper) finalText = toUniverseWhisper(finalText, whisperName.trim() || firstName);
    setDeclaration(finalText);
    setStep("declaration");
  }

  // Stop any in-progress ElevenLabs audio playback.
  function stopAffirmationAudio() {
    if (elevenAudioRef.current) elevenAudioRef.current.stop();
  }

  // Ask the secure server endpoint (which talks to ElevenLabs with the secret
  // API key) to voice `text`, then play the returned MP3. Resolves when playback
  // finishes or is stopped; rejects if the endpoint is unavailable or playback
  // fails, so callers can fall back to browser speech synthesis.
  async function playAffirmationAudio(text) {
    // Only forward a voice id the server/ElevenLabs will accept — a stale value
    // (e.g. an old browser voiceURI saved to the profile) would make the request
    // fail and needlessly drop us to browser speech.
    const voiceId = ELEVENLABS_VOICES.some((v) => v.id === selectedVoiceURI) ? selectedVoiceURI : "";
    const res = await fetch("/api/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(voiceId ? { text, voiceId } : { text }),
    });
    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.json())?.error || "";
      } catch (e) {}
      throw new Error(detail || `Text-to-speech request failed (${res.status})`);
    }
    const blob = await res.blob();
    if (!blob.size) throw new Error("Empty audio response from server");

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    return new Promise((resolve, reject) => {
      const finish = (cb, arg) => {
        audio.onended = null;
        audio.onerror = null;
        URL.revokeObjectURL(url);
        if (elevenAudioRef.current === entry) elevenAudioRef.current = null;
        cb(arg);
      };
      const entry = {
        stop: () => {
          audio.pause();
          finish(resolve, "stopped");
        },
      };
      elevenAudioRef.current = entry;
      audio.onended = () => finish(resolve, "ended");
      audio.onerror = () => finish(reject, new Error("Audio playback failed"));
      audio.play().catch((e) => finish(reject, e));
    });
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

  async function playDeclaration() {
    if (speaking) {
      speechCancelRef.current = true;
      stopAffirmationAudio();
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    speechCancelRef.current = false;
    stopAffirmationAudio();
    window.speechSynthesis.cancel();
    setSpeaking(true);

    // Prefer natural ElevenLabs audio from the server; fall back to the
    // browser's built-in speech synthesis if it's unavailable.
    try {
      await playAffirmationAudio(declaration);
      setSpeaking(false);
      return;
    } catch (e) {
      console.warn("ElevenLabs audio unavailable, using browser speech:", e);
      if (speechCancelRef.current) {
        setSpeaking(false);
        return;
      }
    }

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
    setSignupAgreed(false);
    setSignupName("");
    setCameFrom("landing");
    stopLessonAudio();
    setStep("signup");
  }
  function goToLessons() {
    setLessonPage(0);
    setCameFrom("landing");
    setStep("lessons");
  }

  function goToWhisperName() {
    setWhisperName("");
    setBelief("");
    setDeclaration("");
    setError("");
    setMicError("");
    setIsEditing(false);
    setCameFrom("landing");
    setStep("whisperName");
  }

  function goToWhispers() {
    setBelief("");
    setDeclaration("");
    setError("");
    setMicError("");
    setIsEditing(false);
    setStep("whispers");
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
    if (session) {
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
      } catch (e) {
        console.error("Could not save profile", e);
      }
    } else {
      await persistLocalProfile();
    }

    // Head to the affirmation page and clear the entered details from the screen.
    setShowPasswordFields(false);
    setProfileName("");
    setProfileGender("");
    setProfileEmail("");
    setFocusAreas(new Set());
    setAboutText("");
    setStep("input");
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

  function handleShareClick() {
    if (!isPaidMember) {
      setShowPaywall(true);
      return;
    }
    setShareOpen((s) => !s);
  }

  function subscribeMembership() {
    // No payment processor is connected yet. In the full app this is where a
    // subscription would be created (e.g. Stripe) before Share is unlocked.
    setIsPaidMember(true);
    setShowPaywall(false);
    setShareOpen(true);
    setPayCard("");
    setPayExp("");
    setPayCvc("");
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
  const isWhisper = step === "whispers";

  return (
    <div
      style={{
        backgroundColor: isWhisper ? "#E4DCCC" : "#FFFFFF",
        minHeight: "100%",
        color: INK,
      }}
      className="w-full min-h-screen flex flex-col items-center px-6 py-10 font-sans"
      onClick={() => menuOpen && setMenuOpen(false)}
    >
      {/* Header — hidden on the landing / name / logged-out screens */}
      {step !== "loggedOut" && step !== "landing" && step !== "whisperName" && (
      <div className="w-full max-w-md flex items-center justify-between mb-10 relative">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: ACCENT }}>
          Say &amp; It Becomes
        </p>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5">
              <Flame size={18} style={{ color: ACCENT }} fill={ACCENT} />
              <span className="text-sm font-semibold" style={{ color: INK }}>
                {streak}
              </span>
            </div>
          )}
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
              onClick={performLogout}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5"
              style={{ color: "#D64545" }}
            >
              <LogOut size={16} style={{ color: "#D64545" }} />
              Logout
            </button>
          </div>
        )}
      </div>
      )}

      {/* LANDING */}
      {step === "landing" && (
        <div
          className="fixed inset-0 overflow-y-auto flex flex-col items-center"
          style={{ backgroundColor: "#C8B998" }}
        >
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Parisienne&family=Caveat:wght@600;700&family=Poppins:wght@500;600;800&display=swap');`}</style>

          {/* decorative corners */}
          <svg className="absolute top-0 left-0 pointer-events-none" width="210" height="250" viewBox="0 0 210 250" fill="none" aria-hidden="true">
            <path d="M-30 235 C 30 120 90 40 205 -10" stroke="#5B5238" strokeOpacity="0.35" strokeWidth="1.4" fill="none" />
            <path d="M64 66 C 66 79 74 87 87 89 C 74 91 66 99 64 112 C 62 99 54 91 41 89 C 54 87 62 79 64 66 Z" fill="#5B5238" fillOpacity="0.55" />
            <path d="M128 34 C 129 42 134 47 142 48 C 134 49 129 54 128 62 C 127 54 122 49 114 48 C 122 47 127 42 128 34 Z" fill="#5B5238" fillOpacity="0.4" />
          </svg>
          <svg className="absolute bottom-0 right-0 pointer-events-none" width="220" height="250" viewBox="0 0 220 250" fill="none" aria-hidden="true">
            <path d="M245 20 C 190 130 130 210 15 255" stroke="#5B5238" strokeOpacity="0.3" strokeWidth="1.4" fill="none" />
            <path d="M158 168 C 160 181 168 189 181 191 C 168 193 160 201 158 214 C 156 201 148 193 135 191 C 148 189 156 181 158 168 Z" fill="#5B5238" fillOpacity="0.55" />
          </svg>

          <div className="relative w-full max-w-sm px-7 pt-10 pb-12 flex flex-col items-center text-center min-h-full">
            <h1
              className="leading-none"
              style={{ fontFamily: "'Parisienne', cursive", color: "#544B33", fontSize: "3.15rem" }}
            >
              Say it, &amp; it becomes
            </h1>
            <p
              className="mt-2 mb-5"
              style={{ fontFamily: "'Caveat', cursive", color: "#544B33", fontSize: "1.7rem", fontWeight: 600 }}
            >
              The power of audio affirmation
            </p>

            <div className="grid grid-cols-2 gap-4 w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <div className="rounded-[1.75rem] px-4 py-8 flex flex-col items-center justify-center" style={{ backgroundColor: "#F6F0E6" }}>
                <p className="text-xl leading-tight" style={{ color: "#544B33", fontWeight: 800 }}>
                  Daily<br />Affirmation
                </p>
                <p className="text-base mt-3" style={{ color: "#7C6F55" }}>Today, I Am</p>
              </div>
              <button
                type="button"
                onClick={goToWhisperName}
                className="rounded-[1.75rem] px-4 py-8 flex flex-col items-center justify-center"
                style={{ backgroundColor: "#F6F0E6" }}
              >
                <p className="text-xl leading-tight" style={{ color: "#544B33", fontWeight: 800 }}>
                  Universe<br />Whispers
                </p>
                <p className="text-base mt-3" style={{ color: "#7C6F55" }}>&ldquo;You Are&hellip;&rdquo;</p>
              </button>
              <button
                onClick={goToLessons}
                className="rounded-[1.75rem] px-4 py-6 text-base leading-snug"
                style={{ backgroundColor: "#F6F0E6", color: "#7C6F55", fontWeight: 500 }}
              >
                How you can transform your live
              </button>
              <div
                className="rounded-[1.75rem] px-4 py-6 flex items-center justify-center text-base"
                style={{ backgroundColor: "#F6F0E6", color: "#7C6F55", fontWeight: 500 }}
              >
                Powerful quotes
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full mt-12 items-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <button
                onClick={goToSignIn}
                className="rounded-2xl py-2.5 px-3 text-lg w-full whitespace-nowrap"
                style={{ backgroundColor: "#F6F0E6", color: "#544B33", fontWeight: 500, maxWidth: "9rem" }}
              >
                Log in
              </button>
              <button
                onClick={openSetup}
                className="rounded-2xl py-2.5 px-3 text-lg w-full whitespace-nowrap"
                style={{ backgroundColor: "#F6F0E6", color: "#544B33", fontWeight: 500, maxWidth: "9rem" }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSE WHISPERS — name prompt */}
      {step === "whisperName" && (
        <div
          className="fixed inset-0 overflow-y-auto flex flex-col items-center"
          style={{ backgroundColor: "#C8B998" }}
        >
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Parisienne&family=Caveat:wght@600;700&family=Poppins:wght@500;600;800&display=swap');`}</style>

          <svg className="absolute top-0 left-0 pointer-events-none" width="210" height="250" viewBox="0 0 210 250" fill="none" aria-hidden="true">
            <path d="M-30 235 C 30 120 90 40 205 -10" stroke="#5B5238" strokeOpacity="0.35" strokeWidth="1.4" fill="none" />
            <path d="M64 66 C 66 79 74 87 87 89 C 74 91 66 99 64 112 C 62 99 54 91 41 89 C 54 87 62 79 64 66 Z" fill="#5B5238" fillOpacity="0.55" />
            <path d="M128 34 C 129 42 134 47 142 48 C 134 49 129 54 128 62 C 127 54 122 49 114 48 C 122 47 127 42 128 34 Z" fill="#5B5238" fillOpacity="0.4" />
          </svg>
          <svg className="absolute bottom-0 right-0 pointer-events-none" width="220" height="250" viewBox="0 0 220 250" fill="none" aria-hidden="true">
            <path d="M245 20 C 190 130 130 210 15 255" stroke="#5B5238" strokeOpacity="0.3" strokeWidth="1.4" fill="none" />
            <path d="M158 168 C 160 181 168 189 181 191 C 168 193 160 201 158 214 C 156 201 148 193 135 191 C 148 189 156 181 158 168 Z" fill="#5B5238" fillOpacity="0.55" />
          </svg>

          <div className="relative w-full max-w-sm px-7 flex flex-col items-center justify-center text-center min-h-full">
            <h1
              className="leading-tight mb-8"
              style={{ fontFamily: "'Parisienne', cursive", color: "#544B33", fontSize: "2.6rem" }}
            >
              What should I call you?
            </h1>
            <input
              type="text"
              value={whisperName}
              onChange={(e) => setWhisperName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && whisperName.trim()) goToWhispers();
              }}
              placeholder="Your name"
              autoFocus
              className="w-full rounded-2xl py-3 px-4 text-lg text-center outline-none"
              style={{ backgroundColor: "#F6F0E6", color: "#544B33", fontFamily: "'Poppins', sans-serif", maxWidth: "16rem" }}
            />
            <button
              onClick={goToWhispers}
              disabled={!whisperName.trim()}
              className="rounded-2xl py-2.5 px-3 text-lg w-full whitespace-nowrap mt-6 disabled:opacity-40"
              style={{ backgroundColor: "#F6F0E6", color: "#544B33", fontFamily: "'Poppins', sans-serif", fontWeight: 500, maxWidth: "9rem" }}
            >
              Next
            </button>
          </div>
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
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setSignupError("");
                setSigninError("");
                setStep("signin");
              }}
              className="underline font-semibold"
              style={{ color: ACCENT }}
            >
              Log in
            </button>
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: INK }}>
                <User size={14} style={{ color: MUTED }} />
                Name
              </label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                style={{ borderColor: "#EAEAEA", color: INK }}
              />
            </div>
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
            <label className="flex items-start gap-2.5 mt-1 text-sm" style={{ color: MUTED }}>
              <input
                type="checkbox"
                checked={signupAgreed}
                onChange={(e) => setSignupAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ accentColor: ACCENT }}
              />
              <span>
                I agree to Say &amp; it Becomes&apos;s{" "}
                <a href="#terms" className="underline font-semibold" style={{ color: ACCENT }}>
                  Terms &amp; Conditions
                </a>{" "}
                and{" "}
                <a href="#privacy" className="underline font-semibold" style={{ color: ACCENT }}>
                  acknowledge the Privacy Policy
                </a>
                .
              </span>
            </label>
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
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px" style={{ backgroundColor: "#EAEAEA" }} />
              <span className="text-xs" style={{ color: MUTED }}>
                or continue with
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#EAEAEA" }} />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => signUpWithProvider("google")}
                className="flex-1 rounded-2xl py-3.5 flex items-center justify-center border-2"
                style={{ borderColor: "#EAEAEA" }}
                aria-label="Continue with Google"
              >
                <GoogleIcon size={22} />
              </button>
              <button
                type="button"
                onClick={() => signUpWithProvider("apple")}
                className="flex-1 rounded-2xl py-3.5 flex items-center justify-center border-2"
                style={{ borderColor: "#EAEAEA", color: INK }}
                aria-label="Continue with Apple"
              >
                <AppleIcon size={22} />
              </button>
              <button
                type="button"
                onClick={() => signUpWithProvider("facebook")}
                className="flex-1 rounded-2xl py-3.5 flex items-center justify-center border-2"
                style={{ borderColor: "#EAEAEA" }}
                aria-label="Continue with Facebook"
              >
                <FacebookIcon size={22} />
              </button>
            </div>
          </div>

          <footer className="w-full mt-12 rounded-2xl px-6 py-8" style={{ backgroundColor: "#E9E9E7" }}>
            <p className="text-center text-sm mb-6" style={{ color: "#000000" }}>
              © {new Date().getFullYear()} Say&amp;itbecomes Inc.
            </p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <a href="#terms" className="hover:underline" style={{ color: "#000000" }}>
                Terms &amp; conditions
              </a>
              <a href="#privacy" className="hover:underline" style={{ color: "#000000" }}>
                Privacy policy
              </a>
              <a href="#cookies" className="hover:underline" style={{ color: "#000000" }}>
                Cookie policy
              </a>
            </div>
          </footer>
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

      {/* INPUT / UNIVERSE WHISPERS */}
      {(step === "input" || step === "whispers") && (
        <div className={`w-full max-w-md flex-1 flex flex-col justify-center ${isWhisper ? "-mt-16" : ""}`}>
          <h1
            className={`text-3xl leading-tight font-semibold mb-3 ${isWhisper ? "text-center" : ""}`}
            style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {isWhisper ? "Universe Whispers" : "What's on your mind?"}
          </h1>
          <p className={`text-sm mb-6 ${isWhisper ? "text-center" : ""}`} style={{ color: MUTED }}>
            {isWhisper
              ? "Universe whats to energize you. How do you want others to see you, call you or remember you."
              : "A worry, a doubt, a goal — say it or type it. We'll turn it into a powerful affirmation."}
          </p>

          {!isWhisper && (
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
          )}

          {isWhisper || inputMode === "type" ? (
            <textarea
              ref={textareaRef}
              value={belief}
              onChange={(e) => setBelief(e.target.value)}
              placeholder={isWhisper ? "Who do you like the world to see you? " : "I'm never going to be financially secure..."}
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
                    {belief || (isWhisper ? "Who do you like the world to see you? " : "Tap the mic and say what's on your mind...")}
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
            {isWhisper ? "Let the universe whisper" : "Turn it into an affirmation"}
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
                className="w-full text-base leading-relaxed p-4 rounded-2xl border-2 outline-none resize-none"
                style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", borderColor: ACCENT }}
              />
            ) : (
              <p
                className="text-base leading-relaxed"
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
                    <button onClick={handleShareClick} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: INK }}>
                      <Share2 size={14} />
                      Share
                      {!isPaidMember && <Lock size={12} style={{ color: MUTED }} />}
                    </button>
                    <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: "#D64545" }}>
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                  {isPaidMember && shareOpen && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={downloadSelectedText} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: INK }}>
                        <FileText size={14} />
                        Download Text
                      </button>
                      <button onClick={downloadSelectedMp3} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold" style={{ backgroundColor: "#FFFFFF", color: INK }}>
                        <FileAudio size={14} />
                        Download MP3
                      </button>
                    </div>
                  )}
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
              <div className="flex flex-wrap gap-2">
                {["Male", "Female", "Other"].map((g) => {
                  const active = profileGender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setProfileGender(g)}
                      className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                      style={{ backgroundColor: active ? ACCENT : "#F7F7F7", color: active ? "#FFFFFF" : INK }}
                    >
                      {g}
                    </button>
                  );
                })}
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
                onChange={(e) => setProfileEmail(e.target.value)}
                disabled={!!session}
                placeholder="you@example.com"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2 transition-colors"
                style={
                  session
                    ? { borderColor: "#EAEAEA", color: MUTED, backgroundColor: "#FAFAFA" }
                    : { borderColor: profileEmail ? ACCENT : "#EAEAEA", color: INK }
                }
              />
              <p className="text-xs mt-1.5" style={{ color: MUTED }}>
                {session ? "This is your sign-in email." : "We'll use this to set up your account."}
              </p>
            </div>

            <div>
              <button onClick={() => setShowPasswordFields((s) => !s)} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: INK }}>
                <Lock size={14} style={{ color: MUTED }} />
                Password
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
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedVoiceURI}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                    className="flex-1 rounded-2xl p-3.5 text-sm outline-none border-2"
                    style={{ borderColor: "#EAEAEA", color: INK, backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">Default voice</option>
                    {ELEVENLABS_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      playAffirmationAudio("This is what your affirmations will sound like.").catch(() =>
                        speak("This is what your affirmations will sound like.")
                      )
                    }
                    className="rounded-full w-11 h-11 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F7F7F7" }}
                    aria-label="Preview voice"
                  >
                    <Volume2 size={16} style={{ color: ACCENT }} />
                  </button>
                </div>
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

            <div className="pt-4 border-t" style={{ borderColor: "#F0F0F0" }}>
              <button
                onClick={saveProfile}
                className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
              >
                Save profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGGED OUT */}
      {step === "loggedOut" && (
        <div className="w-full max-w-md flex-1 flex flex-col justify-center items-center text-center">
          <LogOut size={28} style={{ color: "#D8D8D8" }} />
          <h1 className="text-xl font-semibold mt-4 mb-6" style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            You just logged out
          </h1>
          <button
            onClick={goHome}
            className="rounded-2xl px-6 py-3.5 flex items-center gap-2 font-semibold text-sm"
            style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
          >
            <LogIn size={16} />
            Login
          </button>
        </div>
      )}

      {/* MEMBERSHIP PAYWALL */}
      {showPaywall && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowPaywall(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: ACCENT }} />
                <h2 className="text-lg font-semibold" style={{ color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Say &amp; It Becomes Membership
                </h2>
              </div>
              <button onClick={() => setShowPaywall(false)} className="p-1" style={{ color: MUTED }}>
                <X size={18} />
              </button>
            </div>
            <p className="text-sm mb-5" style={{ color: MUTED }}>
              Sharing your affirmations is a members-only feature.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <button
                type="button"
                onClick={() => setPaywallPlan("trial")}
                className="w-full rounded-2xl p-4 text-left border-2 flex items-start gap-3"
                style={{ borderColor: paywallPlan === "trial" ? ACCENT : "#EAEAEA" }}
              >
                {paywallPlan === "trial" ? (
                  <CheckCircle2 size={20} style={{ color: ACCENT }} />
                ) : (
                  <Circle size={20} style={{ color: MUTED }} />
                )}
                <span className="text-sm font-semibold" style={{ color: INK }}>
                  Starting your 3 days free trial
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPaywallPlan("annual")}
                className="w-full rounded-2xl p-4 text-left border-2 flex items-start gap-3"
                style={{ borderColor: paywallPlan === "annual" ? ACCENT : "#EAEAEA" }}
              >
                {paywallPlan === "annual" ? (
                  <CheckCircle2 size={20} style={{ color: ACCENT }} />
                ) : (
                  <Circle size={20} style={{ color: MUTED }} />
                )}
                <span className="text-sm font-semibold" style={{ color: INK }}>
                  Start today at $75.70/year (includes tax of $81.71)
                </span>
              </button>
            </div>

            <p className="text-sm mb-5" style={{ color: MUTED }}>
              Cancel anytime
            </p>

            <div className="flex flex-col gap-3 mb-5">
              <label className="text-sm font-semibold flex items-center gap-1.5" style={{ color: INK }}>
                <CreditCard size={14} style={{ color: MUTED }} />
                Visa
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={payCard}
                onChange={(e) => setPayCard(e.target.value)}
                placeholder="Card number"
                className="w-full rounded-2xl p-3.5 text-base outline-none border-2"
                style={{ borderColor: "#EAEAEA", color: INK }}
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  value={payExp}
                  onChange={(e) => setPayExp(e.target.value)}
                  placeholder="MM / YY"
                  className="flex-1 rounded-2xl p-3.5 text-base outline-none border-2"
                  style={{ borderColor: "#EAEAEA", color: INK }}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={payCvc}
                  onChange={(e) => setPayCvc(e.target.value)}
                  placeholder="CVC"
                  className="flex-1 rounded-2xl p-3.5 text-base outline-none border-2"
                  style={{ borderColor: "#EAEAEA", color: INK }}
                />
              </div>
            </div>

            <button
              onClick={subscribeMembership}
              className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-base"
              style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
            >
              Subscribe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
