import type { ActivityId, GameState, MonthResult, StatChanges, StatId, WeekResult, WorldlineId } from "@time-longinus/contracts";

export const worldlineNames: Record<WorldlineId, string> = {
  1: "제1세계선 · 구주 무협",
  2: "제2세계선 · 이계 판타지",
  3: "제3세계선 · 과거 현대",
};

export const activityNames: Record<ActivityId, string> = {
  train: "수련",
  work: "알바",
  explore: "탐험",
  rest: "휴식",
};

export const statNames: Record<StatId, string> = {
  health: "체력", strength: "근력", innerPower: "내공", swordArt: "검법", agility: "경공",
  manaBase: "마력 기초", magicEngineering: "마도공학", titanSynchronization: "타이탄 동기화", elementalAffinity: "속성 감응",
  baseIntelligence: "기초 지능", itHacking: "IT/해킹 지식", weaponProficiency: "첨단병기 숙련", fame: "대중 명성",
};

export const createInitialGame = (): GameState => ({
  month: 1,
  worldline: 1,
  stress: 18,
  credits: 1000,
  stats: {
    1: { health: 100, strength: 50, innerPower: 0, swordArt: 0, agility: 0 },
    2: { health: 100, manaBase: 50, magicEngineering: 0, titanSynchronization: 0, elementalAffinity: 0 },
    3: { health: 100, baseIntelligence: 50, itHacking: 0, weaponProficiency: 0, fame: 0 },
  },
});

const activityChanges: Record<WorldlineId, Record<Exclude<ActivityId, "rest">, StatChanges>> = {
  1: {
    train: { innerPower: 3, swordArt: 5 },
    work: { strength: 2, health: 1 },
    explore: { agility: 3, swordArt: 2 },
  },
  2: {
    train: { manaBase: 3, elementalAffinity: 5 },
    work: { magicEngineering: 2, health: 1 },
    explore: { titanSynchronization: 3, elementalAffinity: 2 },
  },
  3: {
    train: { baseIntelligence: 3, itHacking: 5 },
    work: { fame: 2, weaponProficiency: 1 },
    explore: { weaponProficiency: 3, itHacking: 2 },
  },
};

const outcomeBase: Record<ActivityId, Omit<WeekResult, "activity" | "statChanges">> = {
  train: { message: "크로노: 수련 데이터가 안정적으로 축적됐습니다.", stressDelta: 14, creditsDelta: 0 },
  work: { message: "크로노: 임무를 마쳐 크레딧을 확보했습니다.", stressDelta: 10, creditsDelta: 180 },
  explore: { message: "크로노: 미지의 구역에서 전술 기록을 찾았습니다.", stressDelta: 18, creditsDelta: 60 },
  rest: { message: "크로노: 휴식 완료. 신체 리듬이 회복됐습니다.", stressDelta: -35, creditsDelta: 0 },
};

export const recommendedSchedule = (): ActivityId[] => ["train", "train", "work", "rest"];

export const advanceMonth = (state: GameState, schedule: readonly ActivityId[]): MonthResult => {
  if (schedule.length !== 4) throw new Error("한 달의 스케줄은 4주로 구성해야 합니다.");

  const weeks = schedule.map((activity) => ({
    activity,
    ...outcomeBase[activity],
    statChanges: activity === "rest" ? {} : activityChanges[state.worldline][activity],
  }));
  const activeStats = state.stats[state.worldline];
  const totals = weeks.reduce(
    (total, week) => ({
      stress: total.stress + week.stressDelta,
      credits: total.credits + week.creditsDelta,
      statChanges: mergeStatChanges(total.statChanges, week.statChanges),
    }),
    { stress: 0, credits: 0, statChanges: {} as StatChanges },
  );

  return {
    weeks,
    state: {
      ...state,
      month: state.month + 1,
      stress: Math.max(0, Math.min(100, state.stress + totals.stress)),
      credits: state.credits + totals.credits,
      stats: {
        ...state.stats,
        [state.worldline]: {
          ...activeStats,
          ...applyStatChanges(activeStats, totals.statChanges),
        },
      },
    },
  };
};

const mergeStatChanges = (left: StatChanges, right: StatChanges): StatChanges => {
  const merged = { ...left };
  for (const [statId, amount] of Object.entries(right)) {
    const id = statId as StatId;
    merged[id] = (merged[id] ?? 0) + amount;
  }
  return merged;
};

const applyStatChanges = (stats: Record<string, number>, changes: StatChanges): Record<string, number> => {
  const next = { ...stats };
  for (const [statId, amount] of Object.entries(changes)) next[statId] = (next[statId] ?? 0) + amount;
  return next;
};

