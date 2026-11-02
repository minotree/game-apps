# game-apps

여러 게임 프로젝트를 관리하는 pnpm workspace입니다. 각 게임은 `games/<game-id>/`에서 독립적으로 기획, 구현, 검증, 배포합니다.

## 현재 게임

- [`games/time-longinus/`](games/time-longinus/): 3개 세계선을 오가며 영웅을 육성하는 레트로 텍스트 기반 시뮬레이션 게임

## 시작

```powershell
pnpm.cmd install
pnpm.cmd dev:time-longinus
```

전체 타입 검사는 `pnpm.cmd typecheck`, 타임 롱기누스 빌드는 `pnpm.cmd build:time-longinus`로 실행합니다.

## 구조

```text
games/
  time-longinus/   # 독립 게임 프로젝트
docs/              # 여러 게임에 공통인 문서
```
