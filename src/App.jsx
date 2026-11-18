import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-service-hours-v1';

// Fictional volunteering programs for the self-contained UI/UX exercise.
// Staff names, partners and descriptions are examples, not real university records.
const PROGRAMS = {
  ENV110: {
    name: 'Campus Green Team',
    partner: 'University Sustainability Office',
    description:
      'Weekly tree planting, recycling audits and awareness stands that help the campus reduce its waste and energy use.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Heba Lotfy'], coordinators: ['Malak Ashraf', 'Ziad Hamdy'] },
      { year: '2024/25', supervisors: ['Dr. Sherif Galal'], coordinators: ['Jana Wael', 'Seif Mostafa'] },
    ],
  },
  EDU210: {
    name: 'Peer Tutoring Circle',
    partner: 'Student Learning Center',
    description:
      'Senior students run small study groups for first-year courses, preparing worked examples and answering questions.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Nermine Aly'], coordinators: ['Hana Kamal', 'Marwan Essam'] },
      { year: '2024/25', supervisors: ['Dr. Waleed Fouad'], coordinators: ['Laila Samy', 'Kareem Ayman'] },
    ],
  },
  HLT150: {
    name: 'Blood Drive Crew',
    partner: 'Regional Blood Bank',
    description:
      'Volunteers organise campus donation days, register donors and support the medical team on site.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Amr Zaki'], coordinators: ['Salma Reda', 'Omar Hesham'] },
      { year: '2024/25', supervisors: ['Dr. Mona Sabry', 'Dr. Amr Zaki'], coordinators: ['Nadia Fikry', 'Tarek Adel'] },
    ],
  },
  COM305: {
    name: 'Community Kitchen',
    partner: 'Neighbourhood Food Network',
    description:
      'Preparing and packing meals for local families, managing donations and keeping the kitchen inventory up to date.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Yasmin Talaat', 'Hazem Farid'] },
      { year: '2024/25', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Rania Saleh', 'Mostafa Emad'] },
    ],
  },
  TEC220: {
    name: 'Digital Skills for Seniors',
    partner: 'City Community Library',
    description:
      'One-to-one sessions that help older adults use smartphones, video calls, online banking and e-government services safely.',
    history: [
      { year: '2025/26', supervisors: ['Dr. Khaled Mourad'], coordinators: ['Reem Atef', 'Ahmed Nabil'] },
      { year: '2024/25', supervisors: ['Dr. Inas Farag'], coordinators: ['Mai Yehia', 'Bassem Hany'] },
    ],
  },
};

const getProgram = (code) =>
  PROGRAMS[code?.toUpperCase()] || {
    name: 'Program details not yet added',
    partner: '—',
    description: 'This program does not have a profile in the example directory.',
    history: [],
  };

const readRoute = () => {
  const match = window.location.hash.match(/^#\/programs\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};

const seed = [
  { id: 'e1', programCode: 'ENV110', hours: 3, reflection: 'Planting day was well organised and the team lead explained every step.', owner: 'you', name: 'You', date: '2026-10-11' },
  { id: 'e2', programCode: 'EDU210', hours: 2, reflection: 'If you prepare examples in advance the sessions run smoothly.', owner: 'other', name: 'Habiba', date: '2026-10-08' },
  { id: 'e3', programCode: 'HLT150', hours: 6, reflection: 'Long shift but very rewarding. Bring water and snacks.', owner: 'other', name: 'Omar', date: '2026-10-03' },
  { id: 'e4', programCode: 'COM305', hours: 4, reflection: 'Packing went quickly once roles were clear.', owner: 'you', name: 'You', date: '2026-09-29' },
  { id: 'e5', programCode: 'TEC220', hours: 2, reflection: 'Patience matters more than technical knowledge here.', owner: 'other', name: 'Lina', date: '2026-09-25' },
  { id: 'e6', programCode: 'ENV110', hours: 5, reflection: 'Recycling audit took longer than planned.', owner: 'other', name: 'Youssef', date: '2026-09-19' },
  { id: 'e7', programCode: 'EDU210', hours: 3, reflection: 'Students asked great questions about recursion.', owner: 'other', name: 'Mariam', date: '2026-09-12' },
  { id: 'e8', programCode: 'HLT150', hours: 8, reflection: '', owner: 'other', name: 'Ali', date: '2026-09-05' },
  { id: 'e9', programCode: 'COM305', hours: 1, reflection: 'Short orientation session only.', owner: 'other', name: 'Nour', date: '2026-08-28' },
  { id: 'e10', programCode: 'ENV110', hours: 2, reflection: 'Good for a first volunteering experience.', owner: 'other', name: 'Farah', date: '2026-08-20' },
];

function loadEntries() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(s) ? s : seed;
  } catch {
    return seed;
  }
}

const meanHours = (a) => (a.length ? (a.reduce((s, e) => s + e.hours, 0) / a.length).toFixed(1) : '—');
const sumHours = (a) => a.reduce((s, e) => s + e.hours, 0);
const formatHours = (h) => `${h} ${h === 1 ? 'hr' : 'hrs'}`;

function formatDate(iso) {
  if (!iso) return 'This term';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function HoursMeter({ hours }) {
  return (
    <span className="hours-badge" title={`${hours} out of 8 hours`}>
      <strong>{formatHours(hours)}</strong>
      <span className="meter-dots" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <i key={n} className={n <= hours ? 'filled' : ''} />
        ))}
      </span>
    </span>
  );
}

function Kpi({ label, value, hint }) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <b>{value}</b>
      <i>{hint}</i>
    </div>
  );
}

export default function App() {
  const [entries, setEntries] = useState(loadEntries);
  const [query, setQuery] = useState('');
  const [effort, setEffort] = useState('all');
  const [onlyMine, setOnlyMine] = useState(false);
  const [lookup, setLookup] = useState('ENV110');
  const [drawer, setDrawer] = useState(null);
  const [problem, setProblem] = useState('');
  const [toast, setToast] = useState('');
  const [activeNav, setActiveNav] = useState('explore');
  const [programCode, setProgramCode] = useState(readRoute);

  useEffect(() => {
    const onHash = () => {
      setProgramCode(readRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const openProgram = (code) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    window.location.hash = `#/programs/${encodeURIComponent(normalized)}`;
    setProgramCode(normalized);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goHome = (section) => {
    window.location.hash = '#/';
    setProgramCode(null);
    if (section === 'entries') {
      requestAnimationFrame(() => document.getElementById('entries')?.scrollIntoView({ behavior: 'smooth' }));
    } else if (section === 'programs') {
      requestAnimationFrame(() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const myEntries = useMemo(() => entries.filter((e) => e.owner === 'you'), [entries]);
  const myByProgram = useMemo(() => {
    const map = {};
    myEntries.forEach((e) => {
      map[e.programCode.toUpperCase()] = e;
    });
    return map;
  }, [myEntries]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (onlyMine && e.owner !== 'you') return false;
      if (effort !== 'all' && e.hours !== Number(effort)) return false;
      if (!q) return true;
      const progName = getProgram(e.programCode).name.toLowerCase();
      return `${e.programCode} ${progName} ${e.reflection} ${e.name}`.toLowerCase().includes(q);
    });
  }, [entries, query, effort, onlyMine]);

  const lookupCode = lookup.trim().toUpperCase();
  const looked = useMemo(
    () => entries.filter((e) => e.programCode.toUpperCase() === lookupCode),
    [entries, lookupCode]
  );

  const programsLogged = useMemo(() => [...new Set(entries.map((e) => e.programCode.toUpperCase()))], [entries]);

  const allProgramCodes = useMemo(() => {
    const set = new Set([...Object.keys(PROGRAMS), ...programsLogged]);
    return [...set];
  }, [programsLogged]);

  const spread = useMemo(
    () => [1, 2, 3, 4, 5, 6, 7, 8].map((h) => ({ h, count: entries.filter((e) => e.hours === h).length })),
    [entries]
  );
  const peak = Math.max(...spread.map((s) => s.count), 1);

  const programEntries = useMemo(
    () => (programCode ? entries.filter((e) => e.programCode.toUpperCase() === programCode) : []),
    [entries, programCode]
  );

  function openNewDrawer(prefillCode = '') {
    const code = prefillCode ? prefillCode.toUpperCase() : '';
    const existing = code ? myByProgram[code] : null;
    if (existing) {
      openEditDrawer(existing);
      return;
    }
    setProblem('');
    setDrawer({ id: null, programCode: code, hours: '', reflection: '' });
  }

  function openEditDrawer(entry) {
    if (!entry || entry.owner !== 'you') return;
    setProblem('');
    setDrawer({
      id: entry.id,
      programCode: entry.programCode,
      hours: String(entry.hours),
      reflection: entry.reflection || '',
    });
  }

  function save(ev) {
    ev.preventDefault();
    const cleanCode = drawer.programCode.trim().toUpperCase();
    const cleanHours = drawer.hours.trim();

    if (!cleanCode) {
      setProblem('Please enter a program code (for example, EDU210).');
      return;
    }
    if (!/^[1-8]$/.test(cleanHours)) {
      setProblem('Hours must be a whole number from 1 to 8.');
      return;
    }
    const duplicate = entries.find(
      (e) => e.id !== drawer.id && e.owner === 'you' && e.programCode.toUpperCase() === cleanCode
    );
    if (duplicate) {
      setProblem(`You already logged ${formatHours(duplicate.hours)} for ${cleanCode}. Only one entry per program is allowed.`);
      return;
    }

    const data = {
      programCode: cleanCode,
      hours: Number(cleanHours),
      reflection: drawer.reflection.trim(),
      name: 'You',
      owner: 'you',
      date: new Date().toISOString().slice(0, 10),
    };

    if (drawer.id) {
      setEntries((prev) => prev.map((e) => (e.id === drawer.id ? { ...e, ...data } : e)));
      setToast(`Updated your ${cleanCode} entry (${formatHours(data.hours)}).`);
    } else {
      setEntries((prev) => [{ ...data, id: 'e-' + Date.now() }, ...prev]);
      setToast(`Logged ${formatHours(data.hours)} for ${cleanCode}.`);
    }
    setDrawer(null);
  }

  function resetAll() {
    setEntries(seed);
    setQuery('');
    setEffort('all');
    setOnlyMine(false);
    setLookup('ENV110');
    setDrawer(null);
    setActiveNav('explore');
    setToast('Example data restored.');
  }

  const hasActiveFilters = query.trim() !== '' || effort !== 'all' || onlyMine;
  const clearFilters = () => {
    setQuery('');
    setEffort('all');
    setOnlyMine(false);
    setActiveNav('entries');
  };

  const drawerCodeUpper = drawer?.programCode?.trim().toUpperCase() || '';
  const drawerDuplicate = drawer && !drawer.id && drawerCodeUpper ? myByProgram[drawerCodeUpper] : null;

  return (
    <div className="hub">
      <nav className="topbar">
        <a
          className="brand"
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            setOnlyMine(false);
            setActiveNav('explore');
            goHome('top');
          }}
        >
          <span className="brand-mark">◆</span>service<b>hub</b>
        </a>

        <div className="tabs">
          <button
            type="button"
            className={activeNav === 'explore' && !programCode ? 'on' : ''}
            onClick={() => {
              setOnlyMine(false);
              setActiveNav('explore');
              goHome('programs');
            }}
          >
            Programs
          </button>
          <button
            type="button"
            className={activeNav === 'entries' && !programCode ? 'on' : ''}
            onClick={() => {
              setOnlyMine(false);
              setActiveNav('entries');
              goHome('entries');
            }}
          >
            Activity feed
          </button>
          <button
            type="button"
            className={activeNav === 'mine' && !programCode ? 'on' : ''}
            onClick={() => {
              setOnlyMine(true);
              setActiveNav('mine');
              goHome('entries');
            }}
          >
            My log <span className="nav-count">{myEntries.length}</span>
          </button>
        </div>

        <div className="topbar-end">
          <button type="button" className="reset-link" onClick={resetAll} title="Restore default example entries">
            Reset data
          </button>
          <button type="button" className="primary sm" onClick={() => openNewDrawer('')}>
            + Log hours
          </button>
          <span className="avatar" title="Signed in as You">
            Y
          </span>
        </div>
      </nav>

      <main className="page">
        {toast && (
          <div className="toast" role="status">
            <span>{toast}</span>
            <button type="button" onClick={() => setToast('')} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        )}

        {programCode ? (
          <section className="program-page">
            <a
              className="crumb"
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                goHome('top');
              }}
            >
              ← Back to all programs
            </a>

            <header className="program-hero">
              <div className="program-hero-text">
                <span className="tag">{programCode}</span>
                <h1>{getProgram(programCode).name}</h1>
                <p>{getProgram(programCode).partner}</p>
              </div>
              <div className="hero-right">
                <div className="hero-stats">
                  <div>
                    <b>{meanHours(programEntries)}</b>
                    <span>avg hrs</span>
                  </div>
                  <div>
                    <b>{sumHours(programEntries)}</b>
                    <span>total hrs</span>
                  </div>
                  <div>
                    <b>{programEntries.length}</b>
                    <span>{programEntries.length === 1 ? 'entry' : 'entries'}</span>
                  </div>
                </div>
                {myByProgram[programCode] ? (
                  <button
                    type="button"
                    className="hero-cta"
                    onClick={() => openEditDrawer(myByProgram[programCode])}
                  >
                    ✎ Edit your entry ({formatHours(myByProgram[programCode].hours)})
                  </button>
                ) : (
                  <button type="button" className="hero-cta" onClick={() => openNewDrawer(programCode)}>
                    + Log hours for {programCode}
                  </button>
                )}
              </div>
            </header>

            <div className="program-layout">
              <div className="program-main">
                <section className="card about">
                  <h2>About this program</h2>
                  <p>{getProgram(programCode).description}</p>
                  <dl>
                    <dt>Partner organisation</dt>
                    <dd>{getProgram(programCode).partner}</dd>
                    <dt>Program code</dt>
                    <dd>{programCode}</dd>
                  </dl>
                </section>

                <section className="card program-entries">
                  <div className="card-head">
                    <div>
                      <h2>Volunteer hours & reflections</h2>
                      <p className="muted">See how much time previous volunteers spent and what they shared.</p>
                    </div>
                    {!myByProgram[programCode] && (
                      <button type="button" className="ghost" onClick={() => openNewDrawer(programCode)}>
                        + Log hours
                      </button>
                    )}
                  </div>

                  {programEntries.length ? (
                    <ul className="timeline">
                      {programEntries.map((e) => (
                        <li key={e.id}>
                          <div className="timeline-top">
                            <div className="who-line">
                              <b>{e.name}</b>
                              {e.owner === 'you' && <span className="you-badge">Your entry</span>}
                            </div>
                            <HoursMeter hours={e.hours} />
                          </div>
                          <p className={!e.reflection ? 'no-note' : ''}>
                            {e.reflection || 'No reflection added.'}
                          </p>
                          <div className="timeline-foot">
                            <small>{formatDate(e.date)}</small>
                            {e.owner === 'you' && (
                              <button type="button" className="edit-btn" onClick={() => openEditDrawer(e)}>
                                ✎ Edit
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-box">
                      <p>No hours logged for {programCode} yet.</p>
                      <button type="button" className="primary sm" onClick={() => openNewDrawer(programCode)}>
                        Be the first to log hours
                      </button>
                    </div>
                  )}
                </section>
              </div>

              <aside className="program-side">
                <section className="card team">
                  <h2>Program team</h2>
                  <p className="muted">Faculty supervisors and student coordinators for 2024/25 and 2025/26.</p>
                  {getProgram(programCode).history.length ? (
                    <div className="team-stack">
                      {getProgram(programCode).history.map((h) => (
                        <div className="team-year" key={h.year}>
                          <h3>{h.year}</h3>
                          <span className="label">Faculty supervisor{h.supervisors.length === 1 ? '' : 's'}</span>
                          <p>{h.supervisors.join(', ')}</p>
                          <span className="label">Student coordinators</span>
                          <p>{h.coordinators.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted" style={{ marginTop: 12 }}>
                      No example team records for this program.
                    </p>
                  )}
                  <p className="fine-print">Illustrative program and staff records; all names are fictional.</p>
                </section>
              </aside>
            </div>
          </section>
        ) : (
          <>
            <header className="welcome">
              <div>
                <h1>Community Service Hub</h1>
                <p>
                  Compare time commitment and volunteer reflections across programs, then log your own hours.
                </p>
              </div>
              <div className="welcome-actions">
                <button type="button" className="primary" onClick={() => openNewDrawer('')}>
                  + Log hours
                </button>
              </div>
            </header>

            <section className="kpis" aria-label="Overview statistics">
              <Kpi label="Total entries" value={entries.length} hint="all volunteers" />
              <Kpi label="Avg hours / entry" value={`${meanHours(entries)} hrs`} hint="across all logs" />
              <Kpi label="Programs with activity" value={programsLogged.length} hint="active programs" />
              <Kpi label="Your logged programs" value={myEntries.length} hint="1 entry max each" />
            </section>

            <section className="card programs-section" id="programs">
              <div className="card-head">
                <div>
                  <h2>Choose a service program</h2>
                  <p className="muted">
                    Compare average hours and volunteer feedback, or open a program for full team &amp; reflection details.
                  </p>
                </div>
              </div>

              <div className="program-grid">
                {allProgramCodes.map((code) => {
                  const info = getProgram(code);
                  const progLogs = entries.filter((e) => e.programCode.toUpperCase() === code);
                  const mine = myByProgram[code];
                  return (
                    <article className="program-card" key={code}>
                      <div className="program-card-top">
                        <a
                          className="code-pill"
                          href={`#/programs/${encodeURIComponent(code)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            openProgram(code);
                          }}
                        >
                          {code}
                        </a>
                        {mine ? (
                          <span className="status-pill done">✓ You logged {formatHours(mine.hours)}</span>
                        ) : (
                          <span className="status-pill open">Open to log</span>
                        )}
                      </div>

                      <h3>
                        <a
                          href={`#/programs/${encodeURIComponent(code)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            openProgram(code);
                          }}
                        >
                          {info.name}
                        </a>
                      </h3>
                      <p className="partner-line">{info.partner}</p>
                      <p className="program-desc">{info.description}</p>

                      <div className="program-stats">
                        <div>
                          <b>{meanHours(progLogs)}</b>
                          <span>avg hrs</span>
                        </div>
                        <div>
                          <b>{progLogs.length}</b>
                          <span>{progLogs.length === 1 ? 'entry' : 'entries'}</span>
                        </div>
                        <div>
                          <b>{sumHours(progLogs)}</b>
                          <span>total hrs</span>
                        </div>
                      </div>

                      <div className="program-actions">
                        <a
                          className="ghost-link"
                          href={`#/programs/${encodeURIComponent(code)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            openProgram(code);
                          }}
                        >
                          Details &amp; reflections →
                        </a>
                        {mine ? (
                          <button type="button" className="text-btn" onClick={() => openEditDrawer(mine)}>
                            Edit yours
                          </button>
                        ) : (
                          <button type="button" className="text-btn primary-text" onClick={() => openNewDrawer(code)}>
                            + Log hours
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="dash-grid">
              <section className="card chart">
                <div className="card-head">
                  <div>
                    <h2>Hours distribution (1–8 hrs)</h2>
                    <p className="muted">Number of volunteer entries at each hour length</p>
                  </div>
                  <span className="avg-pill">Avg: {meanHours(entries)} hrs</span>
                </div>
                <div className="columns" role="img" aria-label="Bar chart of entries from 1 to 8 hours">
                  {spread.map((s) => (
                    <div className="column" key={s.h} title={`${s.h}h: ${s.count} ${s.count === 1 ? 'entry' : 'entries'}`}>
                      <span className="col-count">{s.count}</span>
                      <div className="column-track">
                        <i style={{ height: `${(s.count / peak) * 100}%` }} />
                      </div>
                      <small>{s.h}h</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card lookup">
                <div className="card-head">
                  <div>
                    <h2>Program check</h2>
                    <p className="muted">Look up any program code</p>
                  </div>
                </div>
                <div className="lookup-row">
                  <input
                    className="lookup-input"
                    value={lookup}
                    onChange={(e) => setLookup(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. EDU210)"
                    aria-label="Program code lookup"
                    list="program-codes-list"
                  />
                  {lookupCode && (
                    <a
                      className="ghost-link"
                      href={`#/programs/${encodeURIComponent(lookupCode)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        openProgram(lookupCode);
                      }}
                    >
                      Open page →
                    </a>
                  )}
                </div>
                {lookupCode && (
                  <p className="lookup-name">{getProgram(lookupCode).name}</p>
                )}
                <div className="lookup-result">
                  <div>
                    <b>{meanHours(looked)}</b>
                    <span>avg hrs</span>
                  </div>
                  <div>
                    <b>{looked.length}</b>
                    <span>entries</span>
                  </div>
                  <div>
                    <b>{sumHours(looked)}</b>
                    <span>total hrs</span>
                  </div>
                </div>
              </section>
            </div>

            <section className="card entries" id="entries">
              <div className="card-head">
                <div>
                  <h2>{onlyMine ? 'My logged entries' : 'Volunteer activity feed'}</h2>
                  <p className="muted">
                    Showing {shown.length} of {entries.length} entries
                  </p>
                </div>
                <div className="scope-toggle" role="group" aria-label="Filter by owner">
                  <button
                    type="button"
                    className={!onlyMine ? 'on' : ''}
                    onClick={() => {
                      setOnlyMine(false);
                      setActiveNav('entries');
                    }}
                  >
                    All volunteers
                  </button>
                  <button
                    type="button"
                    className={onlyMine ? 'on' : ''}
                    onClick={() => {
                      setOnlyMine(true);
                      setActiveNav('mine');
                    }}
                  >
                    My entries ({myEntries.length})
                  </button>
                </div>
              </div>

              <div className="filters">
                <input
                  className="filter-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search entries"
                  placeholder="Search by program code, reflection, or volunteer name…"
                />
                <select value={effort} onChange={(e) => setEffort(e.target.value)} aria-label="Filter by hours">
                  <option value="all">All hours (1–8)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={h}>
                      {h} {h === 1 ? 'hour' : 'hours'}
                    </option>
                  ))}
                </select>
                {hasActiveFilters && (
                  <button type="button" className="ghost" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>

              <div className="entry-grid">
                {shown.map((e) => (
                  <article className={`entry-card ${e.owner === 'you' ? 'mine' : ''}`} key={e.id}>
                    <div className="entry-top">
                      <a
                        className="code-pill"
                        title={`Open ${e.programCode} (${getProgram(e.programCode).name})`}
                        href={`#/programs/${encodeURIComponent(e.programCode)}`}
                        onClick={(ev) => {
                          ev.preventDefault();
                          openProgram(e.programCode);
                        }}
                      >
                        {e.programCode} · {getProgram(e.programCode).name}
                      </a>
                      <HoursMeter hours={e.hours} />
                    </div>
                    <p className={`entry-note ${!e.reflection ? 'no-note' : ''}`}>
                      {e.reflection || 'No reflection added.'}
                    </p>
                    <footer>
                      <span className="entry-meta">
                        <b>{e.name}</b>
                        {e.owner === 'you' && <span className="you-badge">You</span>}
                        <span>· {formatDate(e.date)}</span>
                      </span>
                      {e.owner === 'you' && (
                        <button type="button" className="edit-btn" onClick={() => openEditDrawer(e)}>
                          ✎ Edit
                        </button>
                      )}
                    </footer>
                  </article>
                ))}
              </div>

              {shown.length === 0 && (
                <div className="empty-box">
                  <p>No matching entries found.</p>
                  {hasActiveFilters && (
                    <button type="button" className="ghost" onClick={clearFilters}>
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <datalist id="program-codes-list">
        {allProgramCodes.map((code) => (
          <option key={code} value={code}>
            {getProgram(code).name}
          </option>
        ))}
      </datalist>

      {drawer && (
        <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && setDrawer(null)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label={drawer.id ? 'Edit entry' : 'Log hours'}>
            <div className="drawer-head">
              <div>
                <h2>{drawer.id ? 'Edit your entry' : 'Log volunteering hours'}</h2>
                <p className="muted">
                  {drawer.id
                    ? 'Update your hours or reflection for this program.'
                    : 'You can log one entry per program (1–8 whole hours).'}
                </p>
              </div>
              <button type="button" onClick={() => setDrawer(null)} aria-label="Close">
                ×
              </button>
            </div>

            <form onSubmit={save} noValidate>
              {!drawer.id && (
                <div className="quick-programs">
                  <span className="field-label">Quick-pick a program</span>
                  <div className="chip-list">
                    {Object.keys(PROGRAMS).map((code) => {
                      const alreadyLogged = Boolean(myByProgram[code]);
                      const selected = drawerCodeUpper === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          className={`prog-chip ${selected ? 'selected' : ''} ${alreadyLogged ? 'logged' : ''}`}
                          onClick={() => {
                            setProblem('');
                            setDrawer((d) => ({ ...d, programCode: code }));
                          }}
                          title={alreadyLogged ? `${PROGRAMS[code].name} (already logged)` : PROGRAMS[code].name}
                        >
                          <b>{code}</b>
                          <span>{alreadyLogged ? '✓ Logged' : PROGRAMS[code].name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <label>
                <span className="field-label">Program code *</span>
                <input
                  value={drawer.programCode}
                  onChange={(e) => {
                    setProblem('');
                    setDrawer((d) => ({ ...d, programCode: e.target.value.toUpperCase() }));
                  }}
                  placeholder="e.g. EDU210"
                  list="program-codes-list"
                />
                {drawerCodeUpper && PROGRAMS[drawerCodeUpper] && (
                  <span className="field-hint">{PROGRAMS[drawerCodeUpper].name}</span>
                )}
              </label>

              {drawerDuplicate && (
                <div className="info-banner">
                  <span>
                    You already logged <b>{formatHours(drawerDuplicate.hours)}</b> for {drawerCodeUpper}.
                  </span>
                  <button
                    type="button"
                    className="text-btn primary-text"
                    onClick={() => openEditDrawer(drawerDuplicate)}
                  >
                    Edit that entry instead
                  </button>
                </div>
              )}

              <div className="field-block">
                <span className="field-label">Hours (whole number 1–8) *</span>
                <div className="hour-pills" role="group" aria-label="Quick select hours">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={drawer.hours === String(h) ? 'on' : ''}
                      onClick={() => {
                        setProblem('');
                        setDrawer((d) => ({ ...d, hours: String(h) }));
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <input
                  value={drawer.hours}
                  onChange={(e) => {
                    setProblem('');
                    setDrawer((d) => ({ ...d, hours: e.target.value }));
                  }}
                  placeholder="Enter 1 to 8"
                  aria-label="Hours"
                  inputMode="numeric"
                />
              </div>

              <label>
                <span className="field-label">Reflection (optional)</span>
                <textarea
                  value={drawer.reflection}
                  rows={4}
                  onChange={(e) => setDrawer((d) => ({ ...d, reflection: e.target.value }))}
                  placeholder="How much effort did it take? Any tips for future volunteers?"
                />
              </label>

              {problem && (
                <div className="problem" role="alert">
                  {problem}
                </div>
              )}

              <div className="drawer-actions">
                <button type="submit" className="primary">
                  {drawer.id ? 'Save changes' : 'Save entry'}
                </button>
                <button type="button" className="link-btn" onClick={() => setDrawer(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
