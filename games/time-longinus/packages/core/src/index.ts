import type { ActivityId, GameState, MonthResult, ProfessionId, StatChanges, StatId, WeekResult, WorldlineId } from "@time-longinus/contracts";

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

export interface ProfessionDefinition {
  id: ProfessionId;
  worldline: WorldlineId;
  name: string;
  primaryStat: StatId;
  description: string;
}

export interface PromotionReadiness {
  currentStage: 1;
  nextStage: 2 | 3 | 4 | null;
  primaryStat: StatId;
  currentValue: number;
  targetValue: number | null;
  isStatRequirementMet: boolean;
}

export const professionDefinitions: readonly ProfessionDefinition[] = [
  { id: "orthodoxSword", worldline: 1, name: "정파 검선", primaryStat: "swordArt", description: "검법을 중심으로 정파의 검도를 익힙니다." },
  { id: "demonicMartial", worldline: 1, name: "마교 천마", primaryStat: "innerPower", description: "내공을 극한까지 단련하는 마공 계열입니다." },
  { id: "artificerPhysician", worldline: 1, name: "기관 / 의술", primaryStat: "health", description: "생존력과 기관·의술을 결합하는 계열입니다." },
  { id: "titanMaster", worldline: 2, name: "타이탄 마스터", primaryStat: "titanSynchronization", description: "마도 갑주와 타이탄의 동기화를 높입니다." },
  { id: "arcMage", worldline: 2, name: "시공간 아크메이지", primaryStat: "elementalAffinity", description: "원소 감응과 시공간 마법을 다룹니다." },
  { id: "arcaneAlchemist", worldline: 2, name: "마도연금술사", primaryStat: "magicEngineering", description: "마도공학과 연금술을 연구합니다." },
  { id: "cyberRanger", worldline: 3, name: "사이버 랭커", primaryStat: "weaponProficiency", description: "첨단병기와 실전 전술을 연마합니다." },
  { id: "quantumHacker", worldline: 3, name: "양자 해커", primaryStat: "itHacking", description: "IT/해킹 지식으로 양자망을 공략합니다." },
  { id: "publicCommander", worldline: 3, name: "대중 총지휘관", primaryStat: "fame", description: "대중 명성과 지휘력으로 저항군을 이끕니다." },
];

const professionById = new Map(professionDefinitions.map((profession) => [profession.id, profession]));

export const createInitialGame = (): GameState => ({
  heroName: "",
  month: 1,
  worldline: 1,
  stress: 18,
  credits: 1000,
  professions: {},
  stats: {
    1: { health: 100, strength: 50, innerPower: 0, swordArt: 0, agility: 0 },
    2: { health: 100, manaBase: 50, magicEngineering: 0, titanSynchronization: 0, elementalAffinity: 0 },
    3: { health: 100, baseIntelligence: 50, itHacking: 0, weaponProficiency: 0, fame: 0 },
  },
});

export const nameHero = (state: GameState, heroName: string): GameState => {
  const normalizedName = heroName.trim();
  if (!normalizedName) throw new Error("영웅 이름을 입력하세요.");
  if (normalizedName.length > 12) throw new Error("영웅 이름은 12자 이하로 입력하세요.");
  return { ...state, heroName: normalizedName };
};

export const getProfession = (professionId: ProfessionId): ProfessionDefinition => {
  const profession = professionById.get(professionId);
  if (!profession) throw new Error("알 수 없는 직업입니다.");
  return profession;
};

export const getPromotionReadiness = (state: GameState): PromotionReadiness | undefined => {
  const professionId = state.professions[state.worldline];
  if (!professionId) return undefined;

  const profession = getProfession(professionId);
  const currentValue = state.stats[state.worldline][profession.primaryStat] ?? 0;
  const targetValue = currentValue < 100 ? 100 : currentValue < 250 ? 250 : currentValue < 500 ? 500 : null;

  return {
    currentStage: 1,
    nextStage: targetValue === 100 ? 2 : targetValue === 250 ? 3 : targetValue === 500 ? 4 : null,
    primaryStat: profession.primaryStat,
    currentValue,
    targetValue,
    isStatRequirementMet: targetValue === null,
  };
};

export const chooseProfession = (state: GameState, professionId: ProfessionId): GameState => {
  if (!state.heroName.trim()) throw new Error("영웅 이름을 먼저 등록하세요.");
  if (!state.professions[1] && state.worldline !== 1) throw new Error("첫 번째 삶은 제1세계선에서 시작해야 합니다.");
  if (state.professions[state.worldline]) throw new Error("이 세계선의 최초 직업은 이미 선택했습니다.");
  const profession = getProfession(professionId);
  if (profession.worldline !== state.worldline) throw new Error("현재 세계선에서 선택할 수 없는 직업입니다.");

  return {
    ...state,
    professions: { ...state.professions, [state.worldline]: professionId },
    stats: {
      ...state.stats,
      [state.worldline]: {
        ...state.stats[state.worldline],
        [profession.primaryStat]: (state.stats[state.worldline][profession.primaryStat] ?? 0) + 10,
      },
    },
  };
};

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
  if (!state.heroName.trim()) throw new Error("영웅 이름을 먼저 등록하세요.");
  if (schedule.length !== 4) throw new Error("한 달의 스케줄은 4주로 구성해야 합니다.");
  const professionId = state.professions[state.worldline];
  if (!professionId) throw new Error("먼저 이 세계선의 최초 직업을 선택해야 합니다.");
  const profession = getProfession(professionId);

  const weeks = schedule.map((activity) => ({
    activity,
    ...outcomeBase[activity],
    statChanges: activity === "rest"
      ? {}
      : mergeStatChanges(activityChanges[state.worldline][activity], activity === "train" ? { [profession.primaryStat]: 2 } : {}),
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

