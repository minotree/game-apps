export type WorldlineId = 1 | 2 | 3;

export type ActivityId = "train" | "work" | "explore" | "rest";

export type ProfessionId =
  | "orthodoxSword"
  | "demonicMartial"
  | "artificerPhysician"
  | "titanMaster"
  | "arcMage"
  | "arcaneAlchemist"
  | "cyberRanger"
  | "quantumHacker"
  | "publicCommander";

export type StatId =
  | "health"
  | "strength"
  | "innerPower"
  | "swordArt"
  | "agility"
  | "manaBase"
  | "magicEngineering"
  | "titanSynchronization"
  | "elementalAffinity"
  | "baseIntelligence"
  | "itHacking"
  | "weaponProficiency"
  | "fame";

export type WorldlineStats = Record<string, number>;

export type StatChanges = Partial<Record<StatId, number>>;

export interface GameState {
  heroName: string;
  month: number;
  worldline: WorldlineId;
  stress: number;
  credits: number;
  stats: Record<WorldlineId, WorldlineStats>;
  professions: Partial<Record<WorldlineId, ProfessionId>>;
}

export interface WeekResult {
  activity: ActivityId;
  message: string;
  stressDelta: number;
  creditsDelta: number;
  statChanges: StatChanges;
}

export interface MonthResult {
  state: GameState;
  weeks: WeekResult[];
}

