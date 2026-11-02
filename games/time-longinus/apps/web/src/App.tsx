import { useState } from "react";
import type { ActivityId, GameState, WorldlineId } from "@time-longinus/contracts";
import { activityNames, advanceMonth, createInitialGame, recommendedSchedule, statNames, worldlineNames } from "@time-longinus/core";

const storageKey = "time-longinus:pwa:game:v2";
const initialSchedule: ActivityId[] = ["train", "work", "explore", "rest"];

const loadGame = (): GameState => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return createInitialGame();
  try { return JSON.parse(saved) as GameState; } catch { return createInitialGame(); }
};

export function App() {
  const [game, setGame] = useState<GameState>(loadGame);
  const [schedule, setSchedule] = useState<ActivityId[]>(initialSchedule);
  const [log, setLog] = useState("크로노: 4주 스케줄을 편성하세요. 위험 수치는 80 미만으로 유지하는 편이 좋습니다.");
  const stats = game.stats[game.worldline];

  const updateGame = (next: GameState) => { localStorage.setItem(storageKey, JSON.stringify(next)); setGame(next); };
  const changeWorldline = (worldline: WorldlineId) => updateGame({ ...game, worldline });
  const runMonth = () => {
    const result = advanceMonth(game, schedule);
    updateGame(result.state);
    setLog(result.weeks.map((week, index) => `${index + 1}주차 · ${week.message}`).join("\n"));
  };

  return <main className="terminal">
    <header><p className="eyebrow">PROJECT TIME LONGINUS · PWA PROTOTYPE</p><h1>타임 롱기누스</h1><p>2154년, 영웅을 세 세계선으로 송환하라.</p></header>
    <section className="status" aria-label="현재 상태"><span>{worldlineNames[game.worldline]}</span><span>월 {game.month} / 96</span><span>크레딧 {game.credits}</span><span>스트레스 <b className={game.stress >= 80 ? "danger" : ""}>{game.stress}/100</b></span></section>
    <section className="worldlines" aria-label="세계선 선택">{([1, 2, 3] as WorldlineId[]).map((worldline) => <button key={worldline} className={worldline === game.worldline ? "selected" : ""} onClick={() => changeWorldline(worldline)}>{worldlineNames[worldline]}</button>)}</section>
    <section className="grid">
      <article><h2>현재 육성 데이터</h2><dl>{Object.entries(stats).map(([statId, value]) => <div key={statId}><dt>{statNames[statId as keyof typeof statNames]}</dt><dd>{value}</dd></div>)}</dl><p className="muted">각 세계선의 5대 고유 스탯을 표시합니다. 전직·전투·환생은 다음 단계입니다.</p></article>
      <article><h2>크로노 로그</h2><pre>{log}</pre></article>
    </section>
    <section className="schedule"><div><h2>월간 4주 스케줄</h2><p>수련·알바·탐험 후 휴식하는 3+1 안전 루프를 권장합니다.</p></div><button onClick={() => setSchedule(recommendedSchedule())}>크로노 추천 적용</button><div className="weeks">{schedule.map((activity, index) => <label key={index}><span>{index + 1}주차</span><select value={activity} onChange={(event) => setSchedule(schedule.map((item, itemIndex) => itemIndex === index ? event.target.value as ActivityId : item))}>{(Object.keys(activityNames) as ActivityId[]).map((option) => <option key={option} value={option}>{activityNames[option]}</option>)}</select></label>)}</div><button className="primary" onClick={runMonth}>▶ 스케줄 진행</button></section>
  </main>;
}

