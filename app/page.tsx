"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";

type Task = {
  id: string;
  title: string;
  category: string;
  date: string;
  mins: number;
  priority: number;
  done: boolean;
};

type Story = {
  id: string;
  cat: string;
  score: number;
  h: string;
  summary: string;
  why: string;
  deep: string;
  source: string;
  link?: string;
  isTemplate?: boolean;
};

type GmatSession = {
  id: string;
  date: string;
  section: "Quant" | "Verbal" | "Data Insights";
  questions: number;
  correct: number;
  minutes: number;
};

type GmatMock = {
  id: string;
  date: string;
  score: number;
};

type ScheduleItem = [string, string, string, string];

const classes: Record<number, ScheduleItem[]> = {
  1: [
    ["08:00","09:00","Time Series","class"],
    ["09:00","10:00","Calculus 1","class"],
    ["11:00","12:00","Mathematical Economics","class"],
    ["15:00","16:00","Time Series","class"]
  ],
  2: [
    ["09:00","10:00","Calculus 1","class"],
    ["10:00","11:00","Mathematical Economics","class"]
  ],
  3: [
    ["10:00","11:00","Calculus 1","class"],
    ["11:00","12:00","Mathematical Economics","class"],
    ["12:00","13:00","Time Series","class"],
    ["14:00","15:00","Calculus 1","class"]
  ],
  4: [
    ["11:00","12:00","Calculus 1","class"],
    ["13:00","15:00","Algorithmic Trading","class"],
    ["15:00","16:00","Algorithmic Trading","class"]
  ],
  5: [],
  6: [],
  0: []
};

const assessments = [
  ["Calculus Online Quiz","Calculus","2026-08-17",5],
  ["Time Series Assignment 1","Time Series","2026-08-17",10],
  ["Calculus A2","Calculus","2026-08-24",2.5],
  ["Algorithmic Trading Task 1","Algorithmic Trading","2026-08-24",13],
  ["Mathematical Economics Assignment 1","Mathematical Economics","2026-08-26",15],
  ["Calculus A3","Calculus","2026-08-31",2.5],
  ["Calculus Mid-Semester Test","Calculus","2026-09-09",20],
  ["Time Series Assignment 2","Time Series","2026-09-14",15],
  ["Algorithmic Trading Task 2","Algorithmic Trading","2026-09-21",12],
  ["Calculus A4","Calculus","2026-09-21",2.5],
  ["Calculus A5","Calculus","2026-10-05",2.5],
  ["Mathematical Economics Assignment 2","Mathematical Economics","2026-10-07",15],
  ["Calculus A6","Calculus","2026-10-12",2.5],
  ["Time Series Assignment 3","Time Series","2026-10-12",15],
  ["Algorithmic Trading Group Assignment","Algorithmic Trading","2026-10-16",25]
] as const;

const starterStories: Story[] = [
  {
    id:"starter-macro",
    cat:"Australian Macro",
    score:10,
    h:"RBA / inflation / labour-market watch",
    summary:"The live version will insert the most important Australian macro development here each morning.",
    why:"Rates, inflation and employment affect discount rates, debt costs, valuation multiples and transaction appetite.",
    deep:"For a macro story, first identify what changed versus expectations: the cash-rate path, inflation trajectory, labour-market tightness or growth outlook. Then trace that change through risk-free rates and WACC, corporate borrowing costs, equity valuation multiples and sector earnings. Finally, ask what it means for transaction activity: higher funding costs can reduce leverage capacity and sponsor returns, while lower discount rates can support higher valuations and improve deal feasibility.",
    source:"Live feed pending",
    isTemplate:true
  },
  {
    id:"starter-ma",
    cat:"M&A",
    score:10,
    h:"Australian M&A watch",
    summary:"The live backend will surface the most relevant announced, rumoured or contested Australian transaction.",
    why:"A current deal gives you a concrete interview example: strategic rationale, valuation, financing, advisers and shareholder reaction.",
    deep:"A proper M&A deep dive should identify the buyer and target, transaction value, form of consideration, premium, funding mix and advisers. Then assess the strategic rationale: scale, market entry, synergies, vertical integration or portfolio reshaping. The valuation section should compare the implied transaction multiple with trading comps and precedents, while the financing section should consider leverage, cost of debt, equity issuance and likely accretion or dilution. Finish with execution risks such as shareholder approval, regulation, financing conditions and competing bids.",
    source:"Live feed pending",
    isTemplate:true
  },
  {
    id:"starter-capital",
    cat:"ECM / DCM",
    score:8,
    h:"Capital-markets watch",
    summary:"Track placements, rights issues, IPOs, block trades, bond issuance and refinancing.",
    why:"Issuance windows reveal investor risk appetite and the cost of capital facing Australian corporates.",
    deep:"For an ECM or DCM transaction, focus on why the issuer is raising capital now, how much is being raised and what the proceeds will fund. For equity, examine the structure, issue discount, dilution and investor demand. For debt, examine tenor, coupon or spread, refinancing purpose and the resulting maturity profile. The interview takeaway is the link between market conditions, investor risk appetite and the issuer's weighted average cost of capital.",
    source:"Live feed pending",
    isTemplate:true
  },
  {
    id:"starter-pe",
    cat:"Private Equity",
    score:8,
    h:"Sponsor activity",
    summary:"Track Australian PE acquisitions, exits and auction processes.",
    why:"Sponsor activity is highly sensitive to funding conditions and directly relevant to M&A and leveraged-finance interviews.",
    deep:"For private-equity activity, frame the story around the investment thesis and return mechanics. Estimate what supports the entry valuation, how much debt the business can sustain and where value creation could come from: EBITDA growth, margin expansion, bolt-ons, deleveraging or multiple expansion. Then consider plausible exits such as a trade sale, sponsor-to-sponsor sale or IPO and the key risks that could impair the expected IRR.",
    source:"Live feed pending",
    isTemplate:true
  }
];

const subjectData: Record<string, string[]> = {
  "Calculus 1":[
    "Assignments 1–6 — 2.5% each",
    "Online quiz — 5%",
    "Mid-semester test — 20%",
    "Final examination — 60%"
  ],
  "Mathematical Economics":[
    "Assignment 1 — 15% — 26 Aug",
    "Mid-semester exam — 20% — 9 Sep",
    "Assignment 2 — 15% — 7 Oct",
    "Final exam — 50% (hurdle)"
  ],
  "Time Series":[
    "Tutorial/homework — 10%",
    "Assignment 1 — 10%",
    "Assignment 2 — 15%",
    "Assignment 3 — 15%",
    "Final exam — 50% (hurdle)"
  ],
  "Algorithmic Trading":[
    "Task 1 — 13%",
    "Task 2 — 12%",
    "Group assignment — 25%",
    "Final exam — 50%"
  ]
};

function localDate(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(d);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function melbourneDayOfWeek(d = new Date()) {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "Australia/Melbourne",
    weekday: "short"
  }).format(d);

  const lookup: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
  };

  return lookup[name];
}

function melbourneHour(d = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Melbourne",
      hour: "2-digit",
      hourCycle: "h23"
    }).format(d)
  );
}

function daysUntil(date: string) {
  const today = localDate();
  const targetUtc = Date.parse(`${date}T00:00:00Z`);
  const todayUtc = Date.parse(`${today}T00:00:00Z`);
  return Math.ceil((targetUtc - todayUtc) / 86400000);
}

function tagClass(cat: string) {
  if (cat === "Australian Macro") return "macro";
  if (cat === "M&A") return "ma";
  if (cat === "ECM / DCM") return "ecm";
  if (cat === "Private Equity") return "pe";
  return "global";
}

function dbTaskToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.task_date,
    mins: row.minutes,
    priority: row.priority,
    done: row.completed
  };
}

function dbStoryToStory(row: any): Story {
  return {
    id: row.id,
    cat: row.category,
    score: row.relevance,
    h: row.headline,
    summary: row.summary ?? "",
    why: row.why_it_matters ?? "",
    deep: row.deep_dive ?? "",
    source: row.source_label ?? "",
    link: row.source_url ?? "",
    isTemplate: false
  };
}

export default function Home() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stories, setStories] = useState<Story[]>(starterStories);
  const [gmatSessions, setGmatSessions] = useState<GmatSession[]>([]);
  const [gmatMocks, setGmatMocks] = useState<GmatMock[]>([]);
  const [ibMode, setIbMode] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [storyModal, setStoryModal] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [timeline, setTimeline] = useState<ScheduleItem[]>([]);
  const [syncing, setSyncing] = useState(false);

  const [gmatSection, setGmatSection] =
    useState<"Quant" | "Verbal" | "Data Insights">("Quant");
  const [gmatQuestions, setGmatQuestions] = useState(20);
  const [gmatCorrect, setGmatCorrect] = useState(15);
  const [gmatMinutes, setGmatMinutes] = useState(45);
  const [mockScore, setMockScore] = useState(705);
  const [mockDate, setMockDate] = useState(localDate());

  useEffect(() => {
    const savedIb = localStorage.getItem("financeos.ib");
    const savedTimeline = localStorage.getItem(
      `financeos.timeline.${localDate()}`
    );

    if (savedIb) setIbMode(JSON.parse(savedIb));
    if (savedTimeline) setTimeline(JSON.parse(savedTimeline));

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("financeos.ib", JSON.stringify(ibMode));
  }, [ibMode]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setGmatSessions([]);
      setGmatMocks([]);
      setStories(starterStories);
      return;
    }

    const cloudIbSetting = user.user_metadata?.ib_interview_active;
    if (typeof cloudIbSetting === "boolean") {
      setIbMode(cloudIbSetting);
    }

    loadCloudData(user);
  }, [user]);

  async function loadCloudData(activeUser: User) {
    setSyncing(true);

    try {
      await migrateLocalDataOnce(activeUser);

      const [tasksResult, storiesResult, gmatResult, mocksResult] =
        await Promise.all([
          supabase
            .from("tasks")
            .select("*")
            .eq("user_id", activeUser.id)
            .order("task_date", { ascending: true })
            .order("created_at", { ascending: true }),

          supabase
            .from("finance_stories")
            .select("*")
            .eq("user_id", activeUser.id)
            .order("story_date", { ascending: false })
            .order("created_at", { ascending: false }),

          supabase
            .from("gmat_sessions")
            .select("*")
            .eq("user_id", activeUser.id)
            .order("session_date", { ascending: false })
            .order("created_at", { ascending: false }),

          supabase
            .from("gmat_mocks")
            .select("*")
            .eq("user_id", activeUser.id)
            .order("mock_date", { ascending: false })
        ]);

      const firstError =
        tasksResult.error ||
        storiesResult.error ||
        gmatResult.error ||
        mocksResult.error;

      if (firstError) throw firstError;

      setTasks((tasksResult.data ?? []).map(dbTaskToTask));

      const cloudStories = (storiesResult.data ?? []).map(dbStoryToStory);
      setStories(cloudStories.length ? cloudStories : starterStories);

      setGmatSessions(
        (gmatResult.data ?? []).map((row: any) => ({
          id: row.id,
          date: row.session_date,
          section: row.section,
          questions: row.questions,
          correct: row.correct,
          minutes: row.minutes
        }))
      );

      setGmatMocks(
        (mocksResult.data ?? []).map((row: any) => ({
          id: row.id,
          date: row.mock_date,
          score: row.total_score
        }))
      );
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message ?? "Could not load cloud data.");
    } finally {
      setSyncing(false);
    }
  }

  async function migrateLocalDataOnce(activeUser: User) {
    const key = `financeos.cloudMigrated.${activeUser.id}`;
    if (localStorage.getItem(key)) return;

    const localTasksRaw = localStorage.getItem("financeos.tasks");
    const localStoriesRaw = localStorage.getItem("financeos.stories");

    const localTasks: Task[] = localTasksRaw ? JSON.parse(localTasksRaw) : [];
    const localStories: Story[] = localStoriesRaw ? JSON.parse(localStoriesRaw) : [];

    if (localTasks.length) {
      const rows = localTasks.map((task) => ({
        user_id: activeUser.id,
        title: task.title,
        category: task.category,
        task_date: task.date,
        minutes: task.mins,
        priority: task.priority,
        completed: task.done
      }));

      const { error } = await supabase.from("tasks").insert(rows);
      if (error) throw error;
    }

    const starterIds = new Set([
      ...starterStories.map((story) => story.id),
      "m1",
      "d1",
      "c1",
      "p1"
    ]);
    const userStories = localStories.filter((story) => !starterIds.has(story.id));

    if (userStories.length) {
      const rows = userStories.map((story) => ({
        user_id: activeUser.id,
        category: story.cat,
        relevance: story.score,
        headline: story.h,
        summary: story.summary,
        why_it_matters: story.why,
        deep_dive: story.deep,
        source_label: story.source,
        source_url: story.link || null,
        story_date: localDate()
      }));

      const { error } = await supabase.from("finance_stories").insert(rows);
      if (error) throw error;
    }

    localStorage.setItem(key, "true");
  }

  async function handleAuth(
    event: FormEvent<HTMLFormElement>,
    email: string,
    password: string
  ) {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (!data.session) {
        setAuthMessage(
          "Account created. Check your email for the Supabase confirmation link, then come back and sign in."
        );
      } else {
        setAuthMessage("Account created and signed in.");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) setAuthError(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setTab("dashboard");
  }

  const todayTasks = tasks
    .filter((task) => task.date === localDate())
    .sort((a, b) => b.priority - a.priority);

  const completed = todayTasks.filter((task) => task.done).length;
  const completion = todayTasks.length
    ? Math.round((completed / todayTasks.length) * 100)
    : 0;

  const upcoming = assessments
    .map((assessment) => ({
      name: assessment[0],
      sub: assessment[1],
      date: assessment[2],
      weight: assessment[3],
      days: daysUntil(assessment[2])
    }))
    .filter((assessment) => assessment.days >= 0)
    .sort((a, b) => a.days - b.days);

  const sortedStories = [...stories].sort((a, b) => b.score - a.score);

  const gmatStats = useMemo(() => {
    const stats: Record<string, { questions: number; correct: number }> = {
      Quant: { questions: 0, correct: 0 },
      Verbal: { questions: 0, correct: 0 },
      "Data Insights": { questions: 0, correct: 0 }
    };

    for (const session of gmatSessions) {
      stats[session.section].questions += session.questions;
      stats[session.section].correct += session.correct;
    }

    return stats;
  }, [gmatSessions]);

  function accuracy(section: string) {
    const stat = gmatStats[section];
    if (!stat.questions) return "—";
    return `${Math.round((stat.correct / stat.questions) * 100)}%`;
  }

  async function addTask(task: Omit<Task, "id">) {
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: task.title,
        category: task.category,
        task_date: task.date,
        minutes: task.mins,
        priority: task.priority,
        completed: task.done
      })
      .select()
      .single();

    if (error) {
      setAuthError(error.message);
      return;
    }

    setTasks((prev) => [...prev, dbTaskToTask(data)]);
  }

  async function toggleTask(task: Task) {
    if (!user) return;

    const nextDone = !task.done;
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, done: nextDone } : item
      )
    );

    const { error } = await supabase
      .from("tasks")
      .update({ completed: nextDone })
      .eq("id", task.id)
      .eq("user_id", user.id);

    if (error) {
      setAuthError(error.message);
      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id ? { ...item, done: task.done } : item
        )
      );
    }
  }

  async function ensureTask(
    title: string,
    category: string,
    mins: number,
    priority: number
  ) {
    const exists = tasks.some(
      (task) => task.date === localDate() && task.title === title
    );

    if (exists) return;

    await addTask({
      title,
      category,
      date: localDate(),
      mins,
      priority,
      done: false
    });
  }

  async function addStory(story: Omit<Story, "id">) {
    if (!user) return;

    const { data, error } = await supabase
      .from("finance_stories")
      .insert({
        user_id: user.id,
        category: story.cat,
        relevance: story.score,
        headline: story.h,
        summary: story.summary,
        why_it_matters: story.why,
        deep_dive: story.deep,
        source_label: story.source,
        source_url: story.link || null,
        story_date: localDate()
      })
      .select()
      .single();

    if (error) {
      setAuthError(error.message);
      return;
    }

    const saved = dbStoryToStory(data);
    setStories((prev) => {
      const realStories = prev.filter(
        (item) => !item.id.startsWith("starter-")
      );
      return [saved, ...realStories];
    });
  }

  async function logGmatSession() {
    if (!user) return;

    const { data, error } = await supabase
      .from("gmat_sessions")
      .insert({
        user_id: user.id,
        session_date: localDate(),
        section: gmatSection,
        questions: gmatQuestions,
        correct: gmatCorrect,
        minutes: gmatMinutes
      })
      .select()
      .single();

    if (error) {
      setAuthError(error.message);
      return;
    }

    setGmatSessions((prev) => [
      {
        id: data.id,
        date: data.session_date,
        section: data.section,
        questions: data.questions,
        correct: data.correct,
        minutes: data.minutes
      },
      ...prev
    ]);
  }

  async function addMock() {
    if (!user) return;

    const { data, error } = await supabase
      .from("gmat_mocks")
      .insert({
        user_id: user.id,
        mock_date: mockDate,
        total_score: mockScore
      })
      .select()
      .single();

    if (error) {
      setAuthError(error.message);
      return;
    }

    setGmatMocks((prev) => [
      { id: data.id, date: data.mock_date, score: data.total_score },
      ...prev
    ]);
  }

  async function handleIbModeChange() {
    if (!user) return;

    const nextActive = !ibMode;
    setAuthError("");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        ib_interview_active: nextActive
      }
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    setUser(data.user);
    setIbMode(nextActive);

    if (!nextActive) {
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", user.id)
        .eq("category", "IB Prep")
        .eq("title", "IB technical interview prep")
        .gte("task_date", localDate());

      if (deleteError) {
        setAuthError(deleteError.message);
      } else {
        setTasks((prev) =>
          prev.filter(
            (task) =>
              !(
                task.category === "IB Prep" &&
                task.title === "IB technical interview prep" &&
                task.date >= localDate()
              )
          )
        );
      }

      const cleanedTimeline = timeline.filter((item) => item[3] !== "ib");
      setTimeline(cleanedTimeline);
      localStorage.setItem(
        `financeos.timeline.${localDate()}`,
        JSON.stringify(cleanedTimeline)
      );
    }
  }

  async function planMyDay() {
    const dow = melbourneDayOfWeek();
    const schedule: ScheduleItem[] = [];

    if ([3, 5, 0].includes(dow)) {
      schedule.push(["06:15", "07:15", "Gym", "gym"]);
    }

    if ((classes[dow] || []).length) {
      schedule.push(["—", "—", "35 min commute to Uni", ""]);
    }

    (classes[dow] || []).forEach((item) => schedule.push(item));

    if (dow === 1) {
      if (ibMode) {
        schedule.push(["12:30","14:00","IB technical + behavioural prep","ib"]);
      }
      schedule.push(
        ["16:15","18:00","Review Monday lectures / problems","study"],
        ["19:00","20:00","GMAT","gmat"]
      );
    }

    if (dow === 2) {
      if (ibMode) {
        schedule.push(["11:30","13:00","IB technical + behavioural prep","ib"]);
      }
      schedule.push(
        ["13:15","15:15","Mathematical Economics deep work","study"],
        ["15:30","17:30","Calculus deep work","study"],
        ["18:00","19:00","GMAT","gmat"]
      );
    }

    if (dow === 3) {
      if (ibMode) {
        schedule.push(["15:15","16:45","IB technical + behavioural prep","ib"]);
      }
      schedule.push(
        ["17:00","18:30","Time Series / coding","study"],
        ["19:00","20:00","GMAT Verbal","gmat"]
      );
    }

    if (dow === 4) {
      if (ibMode) {
        schedule.push(["09:00","10:15","IB technical + behavioural prep","ib"]);
      }
      schedule.push(
        ["16:15","18:15","Algorithmic Trading","study"],
        ["18:30","19:30","GMAT Data Insights","gmat"]
      );
    }

    if (dow === 5) {
      schedule.push(["08:30","11:00","Deep work — highest-weight assessment","study"]);
      if (ibMode) {
        schedule.push(["11:30","13:00","IB technical + behavioural prep","ib"]);
      }
      schedule.push(
        ["14:00","16:00","GMAT timed set + error review","gmat"],
        ["16:15","17:30","Weekly catch-up","study"]
      );
    }

    if (dow === 6) {
      if (ibMode) {
        schedule.push(["09:00","10:30","IB technical + behavioural prep","ib"]);
      }
      schedule.push(
        ["10:45","13:15","Weakest university subject","study"],
        ["14:15","16:15","GMAT / mock","gmat"]
      );
    }

    if (dow === 0) {
      schedule.push(
        ["08:30","09:30","Gym","gym"],
        ["10:00","12:00","Weekly review","study"]
      );
      if (ibMode) {
        schedule.push(["12:30","14:00","IB technical + behavioural prep","ib"]);
      }
      schedule.push(
        ["14:15","16:00","Preview next week","study"],
        ["16:15","17:15","GMAT","gmat"]
      );
    }

    if (ibMode) {
      await ensureTask("IB technical interview prep", "IB Prep", 90, 5);
    }
    await ensureTask("GMAT focused practice", "GMAT", 60, 4);

    schedule.sort((a, b) => {
      if (a[0] === "—") return -1;
      if (b[0] === "—") return 1;
      return a[0].localeCompare(b[0]);
    });

    setTimeline(schedule);
    localStorage.setItem(
      `financeos.timeline.${localDate()}`,
      JSON.stringify(schedule)
    );
    setTab("dashboard");
  }

  if (!authReady) {
    return (
      <div className="authShell">
        <div className="authCard">
          <div className="brand">Henrik <span>Finance OS</span></div>
          <div className="sub">Connecting securely to Supabase…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        message={authMessage}
        error={authError}
        onSubmit={handleAuth}
      />
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          Henrik <span>Finance OS</span>
        </div>
        <div className="sub">Academic + GMAT + Investment Banking</div>

        <nav className="nav">
          {["dashboard","planner","university","gmat","briefing","performance"].map((item) => (
            <button
              key={item}
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
            >
              {item === "briefing"
                ? "Finance Briefing"
                : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>

        <div className="userChip">
          <div className="syncBadge">
            <span className="syncDot" />
            {syncing ? "Syncing…" : "Cloud synced"}
          </div>
          <div className="small" style={{ marginTop: 5 }}>
            {user.email}
          </div>
          <button
            className="btn"
            style={{ width: "100%", marginTop: 9 }}
            onClick={signOut}
          >
            Sign out
          </button>
        </div>

        <div className="mode">
          <div className="k">Priority 0</div>
          <div className="title" style={{ marginTop: 5 }}>
            IB Interview Mode
          </div>
          <div className="small" style={{ margin: "6px 0 10px" }}>
            Interview prep stays above optional study until completed.
          </div>
          <button
            className="btn red"
            style={{ width: "100%" }}
            onClick={handleIbModeChange}
          >
            {ibMode ? "Mark interview complete" : "Resume IB prep"}
          </button>
        </div>
      </aside>

      <main className="main">
        {authError && (
          <div className="errorBox">
            {authError}
            <button
              className="btn"
              style={{ marginLeft: 10, padding: "5px 8px" }}
              onClick={() => setAuthError("")}
            >
              Dismiss
            </button>
          </div>
        )}

        {tab === "dashboard" && (
          <section>
            <div className="installNote">
              Cloud sync is active. Sign into the same account on your Mac and
              iPhone and your tasks, GMAT data and saved finance stories will
              follow you.
            </div>

            <div className="top">
              <div>
                <h1>
                  Good{" "}
                  {melbourneHour() < 12
                    ? "morning"
                    : melbourneHour() < 18
                    ? "afternoon"
                    : "evening"}
                  , Henrik.
                </h1>
                <div className="muted">
                  {new Intl.DateTimeFormat("en-AU", {
                    timeZone: "Australia/Melbourne",
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  }).format(new Date())}
                </div>
              </div>

              <div className="actions">
                <button className="btn" onClick={() => setTaskModal(true)}>
                  + Task
                </button>
                <button className="btn primary" onClick={planMyDay}>
                  Plan My Day
                </button>
              </div>
            </div>

            <div className="grid grid4">
              <Metric
                title="Daily completion"
                value={`${completion}%`}
                progress={completion}
              />
              <Metric
                title="GMAT target"
                value="750+"
                sub="Mid-November target"
              />
              <Metric
                title="GMAT countdown"
                value={`${Math.max(0, daysUntil("2026-11-15"))} days`}
                sub="to 15 November"
              />
              <Metric
                title="Next assessment"
                value={upcoming[0]?.name || "—"}
                sub={
                  upcoming[0]
                    ? `${upcoming[0].days} days · ${upcoming[0].weight}%`
                    : ""
                }
              />
            </div>

            <div className="grid grid2 section">
              <div>
                <Header title="Today's tasks" />
                <div className="list">
                  {todayTasks.length === 0 && (
                    <div className="item small">
                      No tasks yet. Use Plan My Day.
                    </div>
                  )}

                  {todayTasks.map((task) => (
                    <div
                      className={`item task ${task.done ? "done" : ""}`}
                      key={task.id}
                    >
                      <button
                        className="check"
                        onClick={() => toggleTask(task)}
                      >
                        {task.done ? "✓" : ""}
                      </button>

                      <div>
                        <div className="title">{task.title}</div>
                        <div className="small">
                          {task.category} · {task.mins} min
                        </div>
                      </div>

                      <div className="small">P{task.priority}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Header title="Today's timeline" />
                <div className="card">
                  <div className="timeline">
                    {timeline.length === 0 && (
                      <div className="small">
                        Click Plan My Day to build today around classes,
                        commute, IB prep and GMAT.
                      </div>
                    )}

                    {timeline.map((item, index) => (
                      <div
                        key={`${item[0]}-${item[2]}-${index}`}
                        style={{ display: "contents" }}
                      >
                        <div className="time">{item[0]}</div>
                        <div className={`slot ${item[3]}`}>
                          <strong>{item[2]}</strong>
                          {item[1] !== "—" && (
                            <div className="small">
                              {item[0]}–{item[1]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid2 section">
              <div>
                <Header title="Upcoming assessments" />
                <div className="list">
                  {upcoming.slice(0, 6).map((assessment) => (
                    <div className="item deadline" key={assessment.name}>
                      <div>
                        <div className="title">{assessment.name}</div>
                        <div className="small">
                          {assessment.sub} · {assessment.weight}%
                        </div>
                      </div>
                      <div className="days">{assessment.days}d</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Header title="5-minute finance brief" />
                <div className="list">
                  {sortedStories.slice(0, 2).map((story) => (
                    <StoryCard key={story.id} story={story} onDeepDive={setActiveStory} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "planner" && (
          <section>
            <div className="top">
              <div>
                <h1>Planner</h1>
                <div className="muted">
                  Your fixed class timetable plus planned study blocks
                </div>
              </div>
              <button className="btn primary" onClick={planMyDay}>
                Rebuild today
              </button>
            </div>

            <div className="week">
              {[1,2,3,4,5,6,0].map((day) => (
                <div className="day" key={day}>
                  <h3>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][day]}</h3>
                  {(classes[day] || []).map((item, index) => (
                    <div className="mini" key={`${item[0]}-${index}`}>
                      {item[0]} {item[2]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "university" && (
          <section>
            <div className="top">
              <div>
                <h1>University</h1>
                <div className="muted">Assessment structure</div>
              </div>
            </div>

            <div className="grid grid2">
              {Object.entries(subjectData).map(([subject, items]) => (
                <div className="card subject-card" key={subject}>
                  <h3>{subject}</h3>
                  {items.map((item) => (
                    <div className="assessment" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "gmat" && (
          <section>
            <div className="top">
              <div>
                <h1>GMAT</h1>
                <div className="muted">Target 750+ • mid-November</div>
              </div>
            </div>

            <div className="grid grid3">
              <Metric title="Quant accuracy" value={accuracy("Quant")} />
              <Metric title="Verbal accuracy" value={accuracy("Verbal")} />
              <Metric
                title="Data Insights accuracy"
                value={accuracy("Data Insights")}
              />
            </div>

            <div className="grid grid2 section">
              <div className="card">
                <div className="section-head">
                  <h2>Log practice</h2>
                </div>

                <div className="gmatForm">
                  <div>
                    <label className="small">Section</label>
                    <select
                      value={gmatSection}
                      onChange={(event) =>
                        setGmatSection(
                          event.target.value as
                            | "Quant"
                            | "Verbal"
                            | "Data Insights"
                        )
                      }
                    >
                      <option>Quant</option>
                      <option>Verbal</option>
                      <option>Data Insights</option>
                    </select>
                  </div>

                  <div>
                    <label className="small">Questions</label>
                    <input
                      type="number"
                      value={gmatQuestions}
                      onChange={(event) =>
                        setGmatQuestions(Number(event.target.value))
                      }
                    />
                  </div>

                  <div>
                    <label className="small">Correct</label>
                    <input
                      type="number"
                      value={gmatCorrect}
                      onChange={(event) =>
                        setGmatCorrect(Number(event.target.value))
                      }
                    />
                  </div>

                  <div>
                    <label className="small">Minutes</label>
                    <input
                      type="number"
                      value={gmatMinutes}
                      onChange={(event) =>
                        setGmatMinutes(Number(event.target.value))
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn primary"
                  style={{ marginTop: 10 }}
                  onClick={logGmatSession}
                >
                  Save session
                </button>
              </div>

              <div className="card">
                <div className="section-head">
                  <h2>Mock score</h2>
                </div>

                <div className="formGrid">
                  <div>
                    <label className="small">Score</label>
                    <input
                      type="number"
                      value={mockScore}
                      onChange={(event) =>
                        setMockScore(Number(event.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="small">Date</label>
                    <input
                      type="date"
                      value={mockDate}
                      onChange={(event) => setMockDate(event.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn"
                  style={{ marginTop: 10 }}
                  onClick={addMock}
                >
                  Save mock
                </button>

                <div style={{ marginTop: 12 }}>
                  {gmatMocks.slice(0, 5).map((mock) => (
                    <div className="assessment row" key={mock.id}>
                      <span>{mock.date}</span>
                      <strong>{mock.score}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card section">
              <div className="section-head">
                <h2>Recent practice</h2>
              </div>

              {gmatSessions.slice(0, 10).map((session) => (
                <div className="assessment row" key={session.id}>
                  <div>
                    <strong>{session.section}</strong>
                    <div className="small">
                      {session.date} · {session.minutes} min
                    </div>
                  </div>
                  <div>
                    {session.correct}/{session.questions}
                  </div>
                </div>
              ))}

              {!gmatSessions.length && (
                <div className="small">No sessions logged yet.</div>
              )}
            </div>
          </section>
        )}

        {tab === "briefing" && (
          <section>
            <div className="top">
              <div>
                <h1>Finance Briefing</h1>
                <div className="muted">
                  Australian macro, M&A, capital markets and interview relevance
                </div>
              </div>
              <button className="btn" onClick={() => setStoryModal(true)}>
                + Add story
              </button>
            </div>

            <div className="card">
              <div className="kicker">Cloud status</div>
              <div className="metric-sm" style={{ marginTop: 7 }}>
                Saved briefing stories now sync across devices.
              </div>
              <div className="small" style={{ marginTop: 7 }}>
                Live automated news ingestion is the next backend step.
              </div>
            </div>

            <div className="grid grid2 section">
              <div>
                <Header title="Top stories" />
                <div className="list">
                  {sortedStories.map((story) => (
                    <StoryCard key={story.id} story={story} onDeepDive={setActiveStory} />
                  ))}
                </div>
              </div>

              <div>
                <Header title="Interview use" />
                <div className="card">
                  <div className="kicker">Question of the day</div>
                  <div className="metric-sm" style={{ marginTop: 7 }}>
                    Walk me through a DCF.
                  </div>
                  <div className="small" style={{ marginTop: 8 }}>
                    Project UFCF, discount at WACC, estimate terminal value,
                    discount it, sum to enterprise value and bridge to equity value.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "performance" && (
          <section>
            <div className="top">
              <div>
                <h1>Performance</h1>
                <div className="muted">Cloud-synced metrics</div>
              </div>
            </div>

            <div className="grid grid4">
              <Metric
                title="Tasks completed"
                value={`${tasks.filter((task) => task.done).length}`}
              />
              <Metric title="IB mode" value={ibMode ? "Active" : "Done"} />
              <Metric
                title="GMAT questions"
                value={`${gmatSessions.reduce(
                  (sum, session) => sum + session.questions,
                  0
                )}`}
              />
              <Metric title="Data sync" value="Supabase" sub="Mac ↔ iPhone" />
            </div>
          </section>
        )}
      </main>

      {activeStory && (
        <DeepDiveModal
          story={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}

      {taskModal && (
        <TaskModal
          onClose={() => setTaskModal(false)}
          onSave={async (task) => {
            await addTask(task);
            setTaskModal(false);
          }}
        />
      )}

      {storyModal && (
        <StoryModal
          onClose={() => setStoryModal(false)}
          onSave={async (story) => {
            await addStory(story);
            setStoryModal(false);
          }}
        />
      )}
    </div>
  );
}

function AuthScreen({
  mode,
  setMode,
  message,
  error,
  onSubmit
}: {
  mode: "signin" | "signup";
  setMode: (mode: "signin" | "signup") => void;
  message: string;
  error: string;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    email: string,
    password: string
  ) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="brandLine">
          <div className="brand">
            Henrik <span>Finance OS</span>
          </div>
          <div className="sub">
            Sign in once. Use the same account on Mac and iPhone.
          </div>
        </div>

        <h1>{mode === "signin" ? "Sign in" : "Create account"}</h1>

        {message && <div className="statusBox">{message}</div>}
        {error && <div className="errorBox">{error}</div>}

        <form
          onSubmit={(event) => onSubmit(event, email.trim(), password)}
          style={{ marginTop: 18 }}
        >
          <div>
            <label className="small">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="small">Password</label>
            <input
              type="password"
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button className="btn primary" type="submit">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="authSwitch">
          <button
            className="btn"
            onClick={() =>
              setMode(mode === "signin" ? "signup" : "signin")
            }
          >
            {mode === "signin"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
    </div>
  );
}

function Metric({
  title,
  value,
  sub,
  progress
}: {
  title: string;
  value: string;
  sub?: string;
  progress?: number;
}) {
  return (
    <div className="card">
      <div className="kicker">{title}</div>
      <div className={value.length > 15 ? "metric-sm" : "metric"}>
        {value}
      </div>
      {sub && <div className="small">{sub}</div>}
      {progress !== undefined && (
        <div className="progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function StoryCard({
  story,
  onDeepDive
}: {
  story: Story;
  onDeepDive: (story: Story) => void;
}) {
  return (
    <div className="item news-card">
      <div className="story-meta">
        <span className={`tag ${tagClass(story.cat)}`}>{story.cat}</span>
        {story.isTemplate && <span className="tag templateTag">Template</span>}
        <span className="small">
          IB relevance {story.score}/10 · {story.source}
        </span>
      </div>

      <h3>{story.h}</h3>
      <p>{story.summary}</p>

      <div className="why">
        <strong>Why it matters:</strong> {story.why}
      </div>

      <button
        className="btn deepDiveButton"
        onClick={() => onDeepDive(story)}
      >
        Open deep dive →
      </button>
    </div>
  );
}

function DeepDiveModal({
  story,
  onClose
}: {
  story: Story;
  onClose: () => void;
}) {
  const lenses = deepDiveLenses(story.cat);

  return (
    <div className="modalWrap deepDiveWrap" onClick={onClose}>
      <div
        className="modal deepDiveModal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="deepDiveHeader">
          <div>
            <div className="story-meta">
              <span className={`tag ${tagClass(story.cat)}`}>{story.cat}</span>
              <span className="small">IB relevance {story.score}/10</span>
            </div>
            <h2>{story.h}</h2>
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        {story.isTemplate && (
          <div className="templateNotice">
            <strong>This card is an analysis template, not a live article.</strong>
            <div className="small" style={{ marginTop: 4 }}>
              Live news ingestion is not connected yet. When it is, this same
              deep-dive view will open the actual story analysis rather than the framework.
            </div>
          </div>
        )}

        <DeepDiveSection title="What happened">
          {story.summary || "No summary has been saved for this story yet."}
        </DeepDiveSection>

        <DeepDiveSection title="Why an investment banker should care">
          {story.why || "No IB relevance note has been saved yet."}
        </DeepDiveSection>

        <DeepDiveSection title="Transaction / valuation / market mechanics">
          {story.deep || "No detailed analysis has been saved yet."}
        </DeepDiveSection>

        <div className="deepDiveSection">
          <div className="kicker">Interview lens</div>
          <ul className="deepDiveList">
            {lenses.map((lens) => <li key={lens}>{lens}</li>)}
          </ul>
        </div>

        <div className="deepDiveFooter">
          <div className="small">Source: {story.source || "Not supplied"}</div>
          {story.link && (
            <a
              className="btn primary sourceButton"
              href={story.link}
              target="_blank"
              rel="noreferrer"
            >
              Open original source ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DeepDiveSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="deepDiveSection">
      <div className="kicker">{title}</div>
      <div className="deepDiveBody">{children}</div>
    </div>
  );
}

function deepDiveLenses(category: string) {
  if (category === "M&A") {
    return [
      "What is the buyer's strategic rationale and why transact now?",
      "What valuation multiple and takeover premium are implied, and how do they compare with precedents?",
      "How is the acquisition funded and what does that imply for leverage and accretion / dilution?",
      "Which regulatory, shareholder, financing or competing-bid risks could stop the transaction?"
    ];
  }

  if (category === "Australian Macro") {
    return [
      "How does the development change the expected RBA path and the risk-free rate?",
      "What is the likely effect on WACC, valuation multiples and debt capacity?",
      "Which Australian sectors are most exposed and why?",
      "Would this make sponsors or strategic buyers more or less willing to transact?"
    ];
  }

  if (category === "ECM / DCM") {
    return [
      "Why is the issuer raising capital now and what will the proceeds fund?",
      "How does pricing compare with the prevailing share price or secondary-market debt?",
      "What does investor demand say about the current issuance window?",
      "How does the transaction change dilution, leverage, liquidity and cost of capital?"
    ];
  }

  if (category === "Private Equity") {
    return [
      "What is the sponsor's investment thesis and likely entry valuation?",
      "How much leverage can the asset support and how sensitive are returns to rates?",
      "What are the main EBITDA-growth, margin, bolt-on and deleveraging levers?",
      "What exit routes are realistic and what could impair the sponsor's IRR?"
    ];
  }

  return [
    "What is the direct read-through for Australian companies or financing markets?",
    "Which sectors, valuations or transaction types are most affected?",
    "Is the effect primarily on earnings, discount rates, funding conditions or risk appetite?",
    "What concise interview-ready view would you give if asked why this story matters?"
  ];
}

function TaskModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (task: Omit<Task, "id">) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("IB Prep");
  const [date, setDate] = useState(localDate());
  const [mins, setMins] = useState(60);
  const [priority, setPriority] = useState(3);

  return (
    <div className="modalWrap">
      <div className="modal">
        <h2>Add task</h2>

        <div className="formGrid">
          <div className="full">
            <label className="small">Task</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div>
            <label className="small">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>IB Prep</option>
              <option>Calculus</option>
              <option>Mathematical Economics</option>
              <option>Time Series</option>
              <option>Algorithmic Trading</option>
              <option>GMAT</option>
              <option>Personal</option>
            </select>
          </div>

          <div>
            <label className="small">Date</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div>
            <label className="small">Minutes</label>
            <input
              type="number"
              value={mins}
              onChange={(event) => setMins(Number(event.target.value))}
            />
          </div>

          <div>
            <label className="small">Priority</label>
            <select
              value={priority}
              onChange={(event) => setPriority(Number(event.target.value))}
            >
              <option value={5}>Critical</option>
              <option value={4}>High</option>
              <option value={3}>Medium</option>
              <option value={2}>Low</option>
            </select>
          </div>
        </div>

        <div
          className="actions"
          style={{ justifyContent: "flex-end", marginTop: 14 }}
        >
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => {
              if (!title.trim()) return;
              onSave({
                title: title.trim(),
                category,
                date,
                mins,
                priority,
                done: false
              });
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function StoryModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (story: Omit<Story, "id">) => Promise<void>;
}) {
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState("M&A");
  const [score, setScore] = useState(8);
  const [summary, setSummary] = useState("");
  const [why, setWhy] = useState("");
  const [deep, setDeep] = useState("");
  const [source, setSource] = useState("ASX");
  const [link, setLink] = useState("");

  return (
    <div className="modalWrap">
      <div className="modal">
        <h2>Add finance story</h2>

        <div className="formGrid">
          <div className="full">
            <label className="small">Headline</label>
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>

          <div>
            <label className="small">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Australian Macro</option>
              <option>M&A</option>
              <option>ECM / DCM</option>
              <option>Private Equity</option>
              <option>Global → Australia</option>
            </select>
          </div>

          <div>
            <label className="small">IB relevance</label>
            <input
              type="number"
              min={1}
              max={10}
              value={score}
              onChange={(event) => setScore(Number(event.target.value))}
            />
          </div>

          <div className="full">
            <label className="small">Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>

          <div className="full">
            <label className="small">Why it matters</label>
            <textarea
              rows={2}
              value={why}
              onChange={(event) => setWhy(event.target.value)}
            />
          </div>

          <div className="full">
            <label className="small">Deep dive</label>
            <textarea
              rows={3}
              value={deep}
              onChange={(event) => setDeep(event.target.value)}
            />
          </div>

          <div>
            <label className="small">Source</label>
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </div>

          <div>
            <label className="small">Source link</label>
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
            />
          </div>
        </div>

        <div
          className="actions"
          style={{ justifyContent: "flex-end", marginTop: 14 }}
        >
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => {
              if (!headline.trim()) return;
              onSave({
                cat: category,
                score,
                h: headline.trim(),
                summary,
                why,
                deep,
                source,
                link
              });
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
