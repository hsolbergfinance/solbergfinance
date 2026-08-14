"use client";

import { useEffect, useState } from "react";

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
    id:"m1",
    cat:"Australian Macro",
    score:10,
    h:"RBA / inflation / labour-market watch",
    summary:"The live version will insert the most important Australian macro development here each morning.",
    why:"Rates, inflation and employment affect discount rates, debt costs, valuation multiples and transaction appetite.",
    deep:"Use primary RBA and ABS data, then translate the release into a valuation and transaction-market implication.",
    source:"RBA / ABS"
  },
  {
    id:"d1",
    cat:"M&A",
    score:10,
    h:"Australian M&A watch",
    summary:"The live backend will surface the most relevant announced, rumoured or contested Australian transaction.",
    why:"A current deal gives you a concrete interview example: strategic rationale, valuation, financing, advisers and shareholder reaction.",
    deep:"Capture buyer, target, value, consideration, premium, advisers, sector, funding and comparable deals.",
    source:"ASX / company release"
  },
  {
    id:"c1",
    cat:"ECM / DCM",
    score:8,
    h:"Capital-markets watch",
    summary:"Track placements, rights issues, IPOs, block trades, bond issuance and refinancing.",
    why:"Issuance windows reveal investor risk appetite and the cost of capital facing Australian corporates.",
    deep:"Explain why the issuer chose that financing route and what the market conditions imply.",
    source:"ASX / issuer release"
  },
  {
    id:"p1",
    cat:"Private Equity",
    score:8,
    h:"Sponsor activity",
    summary:"Track Australian PE acquisitions, exits and auction processes.",
    why:"Sponsor activity is highly sensitive to funding conditions and directly relevant to M&A and leveraged-finance interviews.",
    deep:"Focus on entry multiple, leverage capacity, operational value creation and exit options.",
    source:"Company / press"
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
    "Assignment 1 — 15%",
    "Mid-semester exam — 20%",
    "Assignment 2 — 15%",
    "Final exam — 50%"
  ],
  "Time Series":[
    "Tutorial/homework — 10%",
    "Assignment 1 — 10%",
    "Assignment 2 — 15%",
    "Assignment 3 — 15%",
    "Final exam — 50%"
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
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
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

export default function Home() {
  const [tab, setTab] = useState("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stories, setStories] = useState<Story[]>(starterStories);
  const [ibMode, setIbMode] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [storyModal, setStoryModal] = useState(false);
  const [timeline, setTimeline] = useState<ScheduleItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem("financeos.tasks");
    const savedStories = localStorage.getItem("financeos.stories");
    const savedIb = localStorage.getItem("financeos.ib");
    const savedTimeline = localStorage.getItem(`financeos.timeline.${localDate()}`);

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedStories) setStories(JSON.parse(savedStories));
    if (savedIb) setIbMode(JSON.parse(savedIb));
    if (savedTimeline) setTimeline(JSON.parse(savedTimeline));

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("financeos.tasks", JSON.stringify(tasks));
  }, [tasks, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("financeos.stories", JSON.stringify(stories));
  }, [stories, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("financeos.ib", JSON.stringify(ibMode));
  }, [ibMode, mounted]);

  const todayTasks = tasks
    .filter((t) => t.date === localDate())
    .sort((a, b) => b.priority - a.priority);

  const completed = todayTasks.filter((t) => t.done).length;
  const completion = todayTasks.length
    ? Math.round((completed / todayTasks.length) * 100)
    : 0;

  const upcoming = assessments
    .map((a) => ({
      name: a[0],
      sub: a[1],
      date: a[2],
      weight: a[3],
      days: daysUntil(a[2])
    }))
    .filter((a) => a.days >= 0)
    .sort((a, b) => a.days - b.days);

  const sortedStories = [...stories].sort((a, b) => b.score - a.score);

  function ensureTask(
    title: string,
    category: string,
    mins: number,
    priority: number
  ) {
    const date = localDate();

    setTasks((prev) => {
      if (prev.some((t) => t.date === date && t.title === title)) return prev;

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          title,
          category,
          date,
          mins,
          priority,
          done: false
        }
      ];
    });
  }

  function planMyDay() {
    const dow = melbourneDayOfWeek();
    const schedule: ScheduleItem[] = [];

    if ([3, 5, 0].includes(dow)) {
      schedule.push(["06:15", "07:15", "Gym", "gym"]);
    }

    if ((classes[dow] || []).length) {
      schedule.push(["—", "—", "35 min commute to Uni", ""]);
    }

    if (ibMode) {
      schedule.push(["08:00", "09:30", "IB technical + behavioural prep", "ib"]);
      ensureTask("IB technical interview prep", "IB Prep", 90, 5);
    }

    (classes[dow] || []).forEach((item) => schedule.push(item));

    if (dow === 1) {
      schedule.push(
        ["16:15","18:00","Review Monday lectures / problems","study"],
        ["19:00","20:00","GMAT","gmat"]
      );
    }

    if (dow === 2) {
      schedule.push(
        ["11:30","13:30","Mathematical Economics deep work","study"],
        ["14:15","16:15","Calculus deep work","study"],
        ["18:00","19:00","GMAT","gmat"]
      );
    }

    if (dow === 3) {
      schedule.push(
        ["15:15","17:15","Time Series / coding","study"],
        ["17:30","18:30","IB prep","ib"],
        ["19:00","20:00","GMAT Verbal","gmat"]
      );
    }

    if (dow === 4) {
      schedule.push(
        ["09:00","10:15","IB prep","ib"],
        ["16:15","18:15","Algorithmic Trading","study"],
        ["18:30","19:30","GMAT Data Insights","gmat"]
      );
    }

    if (dow === 5) {
      schedule.push(
        ["08:30","11:00","Deep work — highest-weight assessment","study"],
        ["11:30","13:00","IB interview prep","ib"],
        ["14:00","16:00","GMAT timed set + error review","gmat"]
      );
    }

    if (dow === 6) {
      schedule.push(
        ["09:00","12:00","Weakest university subject","study"],
        ["13:30","15:00","IB prep","ib"],
        ["15:30","17:30","GMAT / mock","gmat"]
      );
    }

    if (dow === 0) {
      schedule.push(
        ["08:30","09:30","Gym","gym"],
        ["10:00","12:00","Weekly review","study"],
        ["13:00","15:00","Preview next week","study"],
        ["15:30","16:30","GMAT","gmat"]
      );
    }

    ensureTask("GMAT focused practice", "GMAT", 60, 4);

    setTimeline(schedule);
    localStorage.setItem(
      `financeos.timeline.${localDate()}`,
      JSON.stringify(schedule)
    );
    setTab("dashboard");
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
            onClick={() => setIbMode((value) => !value)}
          >
            {ibMode ? "Interview not completed" : "Interview completed"}
          </button>
        </div>
      </aside>

      <main className="main">
        {tab === "dashboard" && (
          <section>
            <div className="installNote">
              PWA-ready: once deployed on Vercel, open it in Safari on iPhone,
              tap Share, then Add to Home Screen.
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
                        onClick={() =>
                          setTasks(
                            tasks.map((item) =>
                              item.id === task.id
                                ? { ...item, done: !item.done }
                                : item
                            )
                          )
                        }
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
                      <div key={`${item[0]}-${item[2]}-${index}`} style={{ display: "contents" }}>
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
                    <StoryCard key={story.id} story={story} />
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
              <Metric title="Target" value="750+" />
              <Metric
                title="Countdown"
                value={`${Math.max(0, daysUntil("2026-11-15"))} days`}
              />
              <Metric title="Sync status" value="Local" sub="Supabase next" />
            </div>

            <div className="card section">
              <div className="metric-sm">Cloud GMAT tracking is next.</div>
              <div className="small" style={{ marginTop: 8 }}>
                We will move practice sessions, mocks and error logs into
                Supabase so they sync between Mac and iPhone.
              </div>
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
              <div className="kicker">Live-feed status</div>
              <div className="metric-sm" style={{ marginTop: 7 }}>
                Frontend ready. Backend next.
              </div>
              <div className="small" style={{ marginTop: 7 }}>
                After deployment, we will add a server-side briefing route that
                pulls current RBA, ABS, ASX and reputable financial reporting,
                deduplicates it and ranks the best 5–8 stories for Australian IB.
              </div>
            </div>

            <div className="grid grid2 section">
              <div>
                <Header title="Top stories" />
                <div className="list">
                  {sortedStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
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
                <div className="muted">Current local metrics</div>
              </div>
            </div>

            <div className="grid grid4">
              <Metric
                title="Tasks completed"
                value={`${tasks.filter((task) => task.done).length}`}
              />
              <Metric title="IB mode" value={ibMode ? "Active" : "Done"} />
              <Metric
                title="Saved finance stories"
                value={`${stories.length}`}
              />
              <Metric title="Data sync" value="Local" sub="Supabase next" />
            </div>
          </section>
        )}
      </main>

      {taskModal && (
        <TaskModal
          onClose={() => setTaskModal(false)}
          onSave={(task) => {
            setTasks([...tasks, task]);
            setTaskModal(false);
          }}
        />
      )}

      {storyModal && (
        <StoryModal
          onClose={() => setStoryModal(false)}
          onSave={(story) => {
            setStories([...stories, story]);
            setStoryModal(false);
          }}
        />
      )}
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

function StoryCard({ story }: { story: Story }) {
  return (
    <div className="item news-card">
      <div className="story-meta">
        <span className={`tag ${tagClass(story.cat)}`}>{story.cat}</span>
        <span className="small">
          IB relevance {story.score}/10 · {story.source}
        </span>
      </div>

      <h3>{story.h}</h3>
      <p>{story.summary}</p>

      <div className="why">
        <strong>Why it matters:</strong> {story.why}
      </div>

      <details style={{ marginTop: 9 }}>
        <summary className="small" style={{ cursor: "pointer" }}>
          Deep dive
        </summary>
        <div className="small" style={{ marginTop: 8 }}>
          {story.deep}
        </div>
      </details>
    </div>
  );
}

function TaskModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (task: Task) => void;
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
                id: crypto.randomUUID(),
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
  onSave: (story: Story) => void;
}) {
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState("M&A");
  const [score, setScore] = useState(8);
  const [summary, setSummary] = useState("");
  const [why, setWhy] = useState("");
  const [deep, setDeep] = useState("");
  const [source, setSource] = useState("ASX");

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
                id: crypto.randomUUID(),
                cat: category,
                score,
                h: headline.trim(),
                summary,
                why,
                deep,
                source
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
