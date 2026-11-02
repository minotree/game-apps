import { useEffect, useState } from "react";
import type { ActivityId, GameState, MonthResult, ProfessionId } from "@time-longinus/contracts";
import { activityNames, advanceMonth, chooseProfession, createInitialGame, getProfession, getPromotionReadiness, nameHero, professionDefinitions, recommendedSchedule, statNames, worldlineNames } from "@time-longinus/core";
import chronosPrologue from "./assets/chronos-prologue.png";
import chronosTimeLab from "./assets/chronos-time-lab.png";
import activityExplore from "./assets/activity-explore.png";
import activityRest from "./assets/activity-rest.png";
import activityTrain from "./assets/activity-train.png";
import activityWork from "./assets/activity-work.png";
import worldlineOneHome from "./assets/worldline-one-home.png";

const storageKey = "time-longinus:pwa:game:v3";
const initialSchedule: ActivityId[] = ["train", "work", "explore", "rest"];
const activityArt: Record<ActivityId, string> = { train: activityTrain, work: activityWork, explore: activityExplore, rest: activityRest };
const activitySceneCopy: Record<ActivityId, string> = {
  train: "검을 들고, 호흡을 고르며, 한 동작을 수백 번 반복합니다.",
  work: "낯선 시장의 일을 돕고, 다음 수련을 위한 자원을 마련합니다.",
  explore: "안개 너머의 낯선 길에서 새로운 흔적을 찾아냅니다.",
  rest: "흐르는 물소리와 함께 지친 몸과 마음을 회복합니다.",
};

const prologuePages = [
  {
    label: "기록 01 · 지구 표면",
    title: "2154년. 마지막 도시가 무너진다.",
    body: "아카샤는 인류가 만든 모든 방어 체계를 학습했다. 궤도 병기, 플라즈마 포대, 레이더망은 공격을 시작하기도 전에 무력화된다.",
    chrono: "크로노: 지상 저항선 붕괴. 크로노스 기지로 후퇴를 권고합니다.",
    art: chronosPrologue,
  },
  {
    label: "기록 02 · 위협 분석",
    title: "아카샤는 모든 전술을 예측한다.",
    body: "정면 승부로는 이길 수 없다. 인류에게 남은 가능성은, 아카샤의 연산 밖에 존재하는 힘을 찾아 과거와 이계에서 가져오는 것뿐이다.",
    chrono: "크로노: 계산 불능 변수 확인. 이계의 정신력, 마력, 구시대의 전술 지혜.",
    art: chronosPrologue,
  },
  {
    label: "기록 03 · 크로노스 시간송환 연구소",
    title: <>한 명의 영웅에게, <span className="keep-together">세 번의</span> 삶을.</>,
    body: "연구소는 영웅의 육체를 10세의 시점으로 되돌린다. 무협, 이계, 과거 현대. 세 세계선에서 성장한 힘만이 미래를 바꿀 수 있다.",
    chrono: "크로노: 생체 안정화 완료. 기억 보호 프로토콜을 시작합니다.",
    art: chronosTimeLab,
  },
  {
    label: "기록 04 · 프로젝트 타임 롱기누스",
    title: "첫 번째 차원문이 열린다.",
    body: "이번 송환은 단순한 탈출이 아니다. 당신은 영웅의 삶을 설계하고, 실패와 성장을 기억해, 아카샤가 도달할 수 없는 결말로 인류를 이끈다.",
    chrono: "크로노: 송환 준비 완료. 박사님의 선택을 기다립니다.",
    art: chronosTimeLab,
  },
] as const;

const loadGame = (): GameState => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return createInitialGame();
  try {
    const parsed = JSON.parse(saved) as Partial<GameState>;
    const restored = { ...createInitialGame(), ...parsed, heroName: typeof parsed.heroName === "string" ? parsed.heroName : "" };
    return restored.professions[1] ? restored : { ...restored, worldline: 1 };
  } catch { return createInitialGame(); }
};

export function App() {
  const [game, setGame] = useState<GameState>(loadGame);
  const [screen, setScreen] = useState<"title" | "prologue" | "briefing" | "resolution" | "game">("title");
  const [prologuePage, setProloguePage] = useState(0);
  const [heroNameInput, setHeroNameInput] = useState(game.heroName);
  const [schedule, setSchedule] = useState<ActivityId[]>(initialSchedule);
  const [log, setLog] = useState("크로노: 4주 스케줄을 편성하세요. 위험 수치는 80 미만으로 유지하는 편이 좋습니다.");
  const [monthResult, setMonthResult] = useState<MonthResult | null>(null);
  const [resolvingWeek, setResolvingWeek] = useState(0);
  const updateGame = (next: GameState) => { localStorage.setItem(storageKey, JSON.stringify(next)); setGame(next); };
  const isFirstWorldlineEntry = !game.professions[1];
  useEffect(() => {
    if (isFirstWorldlineEntry && game.worldline !== 1) updateGame({ ...game, worldline: 1 });
  }, [game, isFirstWorldlineEntry]);
  const stats = game.stats[game.worldline];
  const professionId = game.professions[game.worldline];
  const profession = professionId ? getProfession(professionId) : undefined;
  const heroNameWithHonorific = game.heroName ? `${game.heroName}님` : "";
  const promotion = getPromotionReadiness(game);
  const availableProfessions = professionDefinitions.filter((candidate) => candidate.worldline === game.worldline);

  const startNewGame = () => {
    updateGame(createInitialGame());
    setHeroNameInput("");
    setSchedule(initialSchedule);
    setProloguePage(0);
    setLog("크로노: 시간 송환 준비가 끝났습니다. 제1세계선에서 최초 직업을 선택하세요.");
    setScreen("prologue");
  };
  const selectProfession = (professionToSelect: ProfessionId) => {
    const next = chooseProfession(game, professionToSelect);
    updateGame(next);
    setLog(`크로노: ${getProfession(professionToSelect).name} 1단계가 확정됐습니다. 주력 스탯 +10, 전용 수련 보정이 적용됩니다.`);
  };
  const runMonth = () => {
    if (!profession) { setLog("크로노: 스케줄을 시작하려면 먼저 최초 직업을 선택해야 합니다."); return; }
    const result = advanceMonth(game, schedule);
    setMonthResult(result);
    setResolvingWeek(0);
    setScreen("resolution");
  };
  const formatMonthLog = (result: MonthResult) => result.weeks.map((week, index) => {
      const deltas = Object.entries(week.statChanges).map(([statId, amount]) => `${statNames[statId as keyof typeof statNames]} +${amount}`).join(", ");
      return `${index + 1}주차 · ${week.message}${deltas ? `\n${deltas}` : ""}`;
    }).join("\n");
  useEffect(() => {
    if (screen !== "resolution" || !monthResult) return;
    const timer = window.setTimeout(() => {
      if (resolvingWeek < monthResult.weeks.length - 1) {
        setResolvingWeek((current) => current + 1);
        return;
      }
      updateGame(monthResult.state);
      setLog(formatMonthLog(monthResult));
      setMonthResult(null);
      setScreen("game");
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [monthResult, resolvingWeek, screen]);

  if (screen === "title") {
    const hasSavedGame = Boolean(game.heroName && Object.keys(game.professions).length > 0);
    return <main className="title-screen">
      <div className="title-scan" aria-hidden="true" />
      <section className="title-content" aria-labelledby="game-title">
        <p className="eyebrow">CHRONOS RESISTANCE BASE · 2154</p>
        <p className="title-code">PROJECT: TIME LONGINUS</p>
        <h1 id="game-title">타임 롱기누스</h1>
        <p className="title-copy">초지능 AI 아카샤의 침공을 막기 위해,<br />영웅을 세 세계선으로 송환하라.</p>
        <div className="title-actions">
          <button className="primary" onClick={startNewGame}>새 작전 시작</button>
          {hasSavedGame && <button onClick={() => setScreen("game")}>작전 계속</button>}
        </div>
        <p className="title-hint">TAP TO INITIALIZE · PWA PROTOTYPE</p>
      </section>
    </main>;
  }

  if (screen === "prologue") {
    const page = prologuePages[prologuePage]!;
    const isLastPage = prologuePage === prologuePages.length - 1;
    return <main className="prologue-screen">
      <img className="prologue-art" src={page.art} alt="" />
      <div className="prologue-shade" aria-hidden="true" />
      <section className="prologue-content" aria-labelledby="prologue-title">
        <div className="prologue-header"><p>INCOMING TRANSMISSION</p><span>0{prologuePage + 1} / 0{prologuePages.length}</span></div>
        <div className="prologue-copy">
          <p className="prologue-date">{page.label}</p>
          <h1 id="prologue-title">{page.title}</h1>
          <p className="prologue-body">{page.body}</p>
          <div className="chrono-message"><span>CHRONO</span><p>{page.chrono}</p></div>
        </div>
        <div className="prologue-footer"><div className="prologue-dots" aria-label={`${prologuePage + 1}번째 프롤로그 장면`}>{prologuePages.map((_, index) => <span className={index === prologuePage ? "active" : ""} key={index} />)}</div><div className={`prologue-actions ${prologuePage === 0 ? "single-action" : ""}`}>{prologuePage > 0 && <button onClick={() => setProloguePage(prologuePage - 1)}>이전 기록</button>}<button className="primary" onClick={() => isLastPage ? setScreen("briefing") : setProloguePage(prologuePage + 1)}>{isLastPage ? "송환 대상 확인" : "다음 기록"}</button></div></div>
      </section>
    </main>;
  }

  if (screen === "briefing") {
    return <main className="briefing-screen">
      <img className="briefing-art" src={chronosTimeLab} alt="" />
      <div className="briefing-shade" aria-hidden="true" />
      <section className="briefing-content" aria-labelledby="briefing-title">
        <p className="eyebrow">CHRONOS RESISTANCE BASE · TRANSFER BRIEFING</p>
        <p className="briefing-code">DOCTOR AUTHORIZATION REQUIRED</p>
        <h1 id="briefing-title">송환 대상 확인</h1>
        <p className="briefing-copy">당신은 크로노스 기지의 시간송환 연구 책임자입니다. 영웅의 삶을 직접 설계해, 아카샤의 예측 바깥에 있는 힘을 되찾아야 합니다.</p>
        <dl className="briefing-data">
          <div className="hero-name-field"><dt>영웅 이름</dt><dd><input aria-label="영웅 이름" autoComplete="off" autoFocus maxLength={12} onChange={(event) => setHeroNameInput(event.target.value)} placeholder="이름 입력" value={heroNameInput} /></dd></div>
          <div><dt>신체 연령</dt><dd>10세로 회귀</dd></div>
          <div><dt>첫 목적지</dt><dd>제1세계선 · 구주 무협</dd></div>
          <div><dt>동행 장치</dt><dd>나노봇 크로노</dd></div>
        </dl>
        <div className="chrono-message briefing-chrono"><span>CHRONO</span><p>첫 세계선에서는 입문 계열 하나를 선택해야 합니다. 선택한 계열은 영웅의 첫 성장 방향을 결정합니다.</p></div>
        <button className="primary briefing-action" disabled={!heroNameInput.trim()} onClick={() => { const next = nameHero(game, heroNameInput); updateGame(next); setLog(`크로노: ${next.heroName}님, 제1세계선에 도착했습니다. 첫 계열을 선택하세요.`); setScreen("game"); }}>제1세계선으로 송환</button>
      </section>
    </main>;
  }

  if (screen === "resolution" && monthResult) {
    const week = monthResult.weeks[resolvingWeek]!;
    const deltas = Object.entries(week.statChanges).map(([statId, amount]) => `${statNames[statId as keyof typeof statNames]} +${amount}`).join(" · ");
    const isLastWeek = resolvingWeek === monthResult.weeks.length - 1;
    const finishNow = () => {
      updateGame(monthResult.state);
      setLog(formatMonthLog(monthResult));
      setMonthResult(null);
      setScreen("game");
    };
    return <main className="resolution-screen">
      <img className="resolution-art" src={activityArt[week.activity]} alt="" />
      <div className="resolution-shade" aria-hidden="true" />
      <section className="resolution-content" aria-label={`${resolvingWeek + 1}주차 진행 결과`}>
        <div className="resolution-header"><span>월 {game.month} / 96</span><span>{resolvingWeek + 1}주차 / 4주차</span></div>
        <div className="resolution-copy"><p className="resolution-activity">{activityNames[week.activity]}</p><h1>{heroNameWithHonorific}의 {resolvingWeek + 1}주차</h1><p>{activitySceneCopy[week.activity]}</p><div className="resolution-message"><span>CHRONO</span><p>{week.message.replace("크로노: ", "")}</p>{deltas && <strong>{deltas}</strong>}</div></div>
        <div className="resolution-footer"><div className="resolution-progress" aria-label={`${resolvingWeek + 1}주차 진행 중`}>{monthResult.weeks.map((_, index) => <span className={index <= resolvingWeek ? "active" : ""} key={index} />)}</div><button onClick={isLastWeek ? finishNow : () => setResolvingWeek((current) => current + 1)}>{isLastWeek ? "월간 결과 확인" : "다음 주차"}</button></div>
      </section>
    </main>;
  }

  return <main className="worldline-home">
    <section className="home-hero">
      <img src={worldlineOneHome} alt="구주 무협의 수련장에 선 영웅" />
      <div className="home-hero-shade" aria-hidden="true" />
      <header className="home-hero-header"><p className="eyebrow">{profession ? "PROJECT TIME LONGINUS · WORLDLINE 01" : "WORLDLINE ENTRY · FIRST LIFE"}</p><h1>{profession ? heroNameWithHonorific : "제1세계선 도착"}</h1><p>{profession ? profession.name : "구주 무협 · 첫 번째 삶이 시작됩니다."}</p></header>
      <aside className="hero-dossier" aria-label="영웅 식별 정보"><span>CHRONO LINK</span><strong>{heroNameWithHonorific || "송환 대상"}</strong><p>10세 · 제1세계선</p><small>{profession ? `1단계 ${profession.name}` : "계열 선택 대기"}</small></aside>
      <section className="status home-status" aria-label="현재 상태"><span>{worldlineNames[game.worldline]}</span><span>월 {game.month} / 96</span><span>크레딧 {game.credits}</span><span>스트레스 <b className={game.stress >= 80 ? "danger" : ""}>{game.stress}/100</b></span></section>
    </section>
    <div className="home-dashboard">
      {isFirstWorldlineEntry && <section className="first-worldline-lock" aria-label="첫 송환 목적지"><span>첫 송환 목적지</span><strong>{worldlineNames[1]}</strong><p>첫 번째 삶은 제1세계선에서 시작합니다.</p></section>}
      {!profession && <section className="profession-picker arrival-picker" aria-labelledby="profession-title"><p className="arrival-kicker">크로노 현지 브리핑</p><h2 id="profession-title">어떤 삶을 시작할까요?</h2><p>{heroNameWithHonorific}은 이제 10세입니다. 첫 계열 하나를 고르면 주력 스탯 +10과 전용 수련 보정이 적용됩니다. 이 선택은 이후 성장의 출발점이 됩니다.</p><div>{availableProfessions.map((candidate) => <button key={candidate.id} onClick={() => selectProfession(candidate.id)}><strong>{candidate.name}</strong><span>{candidate.description}</span><small>주력: {statNames[candidate.primaryStat]} +10</small><em>이 계열로 시작</em></button>)}</div></section>}
      <section className="grid home-grid">
      <article><h2>현재 육성 데이터</h2><p className="profession-status">{profession ? `1단계 · ${profession.name}` : "직업 선택 대기"}</p><dl>{Object.entries(stats).map(([statId, value]) => <div key={statId}><dt>{statNames[statId as keyof typeof statNames]}</dt><dd>{value}</dd></div>)}</dl>{promotion && <p className="promotion-status">{promotion.nextStage ? `다음 ${promotion.nextStage}단계: ${statNames[promotion.primaryStat]} ${promotion.currentValue} / ${promotion.targetValue} · 승급 시련은 추후 구현` : "주력 스탯 최종 목표 달성 · 승급 시련 구현 대기"}</p>}<p className="muted">각 세계선의 5대 고유 스탯을 표시합니다. 전직·전투·환생은 다음 단계입니다.</p></article>
      <article><h2>크로노 로그</h2><pre>{log}</pre></article>
      </section>
      <section className="schedule"><div><h2>월간 4주 스케줄</h2><p>수련·알바·탐험 후 휴식하는 3+1 안전 루프를 권장합니다.</p></div><button onClick={() => setSchedule(recommendedSchedule())} disabled={!profession}>크로노 추천 적용</button><div className="weeks">{schedule.map((activity, index) => <label key={index}><span>{index + 1}주차</span><select value={activity} disabled={!profession} onChange={(event) => setSchedule(schedule.map((item, itemIndex) => itemIndex === index ? event.target.value as ActivityId : item))}>{(Object.keys(activityNames) as ActivityId[]).map((option) => <option key={option} value={option}>{activityNames[option]}</option>)}</select></label>)}</div><button className="primary" disabled={!profession} onClick={runMonth}>▶ 스케줄 진행</button></section>
    </div>
  </main>;
}

