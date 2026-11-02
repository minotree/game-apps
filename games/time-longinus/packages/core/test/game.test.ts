import { describe, expect, it } from "vitest";
import { advanceMonth, createInitialGame, recommendedSchedule } from "../src/index.js";

describe("월간 스케줄", () => {
  it("3+1 추천 루프는 스트레스를 관리하면서 수련 성과를 적용한다", () => {
    const result = advanceMonth(createInitialGame(), recommendedSchedule());

    expect(result.state.month).toBe(2);
    expect(result.state.stress).toBe(21);
    expect(result.state.credits).toBe(1180);
    expect(result.state.stats[1].innerPower).toBe(6);
    expect(result.state.stats[1].swordArt).toBe(10);
  });

  it("각 세계선은 수련에서 고유한 스탯을 올린다", () => {
    const fantasy = advanceMonth({ ...createInitialGame(), worldline: 2 }, ["train", "rest", "rest", "rest"]);
    const modern = advanceMonth({ ...createInitialGame(), worldline: 3 }, ["train", "rest", "rest", "rest"]);

    expect(fantasy.state.stats[2].elementalAffinity).toBe(5);
    expect(modern.state.stats[3].itHacking).toBe(5);
  });
});

