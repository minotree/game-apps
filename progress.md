# game-apps 진행표

## 멀티 게임 작업 공간 전환 (2026-11-02)

- 요청/문제: 현재 저장소에서 게임 관련 프로젝트를 함께 관리해야 한다.
- 변경: 타임 롱기누스를 `games/time-longinus/`으로 분리하고, 루트 workspace·문서·지침을 게임 모음 구조로 전환했다.
- 검증: `pnpm.cmd install --config.confirmModulesPurge=false`, `pnpm.cmd typecheck`, `pnpm.cmd test`, `pnpm.cmd build:time-longinus`를 통과했다. 설치 과정에서 `esbuild`의 build script는 pnpm 승인 대기 경고가 있었으나, 현재 PWA 빌드는 성공했다.
- 사용자 확인: 기획 문서의 엔딩 명칭·조건 간 차이는 후속 결정이 필요하다.
- 적용: 로컬 파일 이동과 문서·설정 변경만 수행했다.
- 남은 작업: 다음 게임 추가 시 `games/<game-id>/`에 독립 지침과 진행 기록을 만든다.
