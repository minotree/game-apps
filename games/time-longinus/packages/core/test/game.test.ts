import { describe, expect, it } from "vitest";
import { advanceMonth, chooseProfession, createInitialGame, getPromotionReadiness, nameHero, recommendedSchedule } from "../src/index.js";

const namedGame = () => nameHero(createInitialGame(), "테스트");

describe("월간 스케줄", () => {
  it("새 게임은 언제나 제1세계선에서 시작한다", () => {
    expect(createInitialGame().worldline).toBe(1);
  });

  it("3+1 추천 루프는 스트레스를 관리하면서 수련 성과를 적용한다", () => {
    const result = advanceMonth(chooseProfession(namedGame(), "orthodoxSword"), recommendedSchedule());

    expect(result.state.month).toBe(2);
    expect(result.state.stress).toBe(21);
    expect(result.state.credits).toBe(1180);
    expect(result.state.stats[1].innerPower).toBe(6);
    expect(result.state.stats[1].swordArt).toBe(24);
  });

  it("각 세계선은 수련에서 고유한 스탯을 올린다", () => {
    const firstLife = chooseProfession(namedGame(), "orthodoxSword");
    const fantasy = advanceMonth(chooseProfession({ ...firstLife, worldline: 2 }, "arcMage"), ["train", "rest", "rest", "rest"]);
    const modern = advanceMonth(chooseProfession({ ...firstLife, worldline: 3 }, "quantumHacker"), ["train", "rest", "rest", "rest"]);

    expect(fantasy.state.stats[2].elementalAffinity).toBe(17);
    expect(modern.state.stats[3].itHacking).toBe(17);
  });

  it("직업 선택은 현재 세계선의 주력 스탯에 한 번만 보너스를 준다", () => {
    const selected = chooseProfession(namedGame(), "demonicMartial");

    expect(selected.professions[1]).toBe("demonicMartial");
    expect(selected.stats[1].innerPower).toBe(10);
    expect(() => chooseProfession(selected, "orthodoxSword")).toThrow("이미 선택");
    expect(() => advanceMonth(namedGame(), recommendedSchedule())).toThrow("최초 직업");
  });

  it("승급 준비도는 주력 스탯의 다음 기획 목표를 제공한다", () => {
    const selected = chooseProfession(namedGame(), "orthodoxSword");
    const readiness = getPromotionReadiness(selected);

    expect(readiness).toMatchObject({ currentStage: 1, nextStage: 2, primaryStat: "swordArt", currentValue: 10, targetValue: 100 });
  });

  it("영웅 이름은 저장 상태에 기록하며 비어 있거나 너무 길면 거부한다", () => {
    expect(nameHero(createInitialGame(), " 세라 ").heroName).toBe("세라");
    expect(() => nameHero(createInitialGame(), " ")).toThrow("이름을 입력");
    expect(() => nameHero(createInitialGame(), "가나다라마바사아자차카타파하")).toThrow("12자 이하");
  });

  it("영웅 이름 없이는 직업 선택과 스케줄 진행을 허용하지 않는다", () => {
    expect(() => chooseProfession(createInitialGame(), "orthodoxSword")).toThrow("이름을 먼저 등록");
    expect(() => advanceMonth({ ...createInitialGame(), professions: { 1: "orthodoxSword" } }, recommendedSchedule())).toThrow("이름을 먼저 등록");
  });

  it("첫 계열은 제1세계선에서만 선택할 수 있다", () => {
    expect(() => chooseProfession({ ...namedGame(), worldline: 2 }, "arcMage")).toThrow("첫 번째 삶은 제1세계선");
  });
});

