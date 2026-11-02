# game-apps 작업 공간 지침

이 저장소는 여러 게임 프로젝트를 함께 관리하는 pnpm workspace다. 각 게임은 독립 제품이며, 공통 패키지·플랫폼 앱·배포 설정을 근거 없이 공유하지 않는다.

## 구조

- `games/<game-id>/`: 게임별 소스, 기획 문서 바로가기, 게임별 `AGENTS.md`, `README.md`, `progress.md`를 둔다.
- `docs/`: 여러 게임에 공통인 아키텍처·운영 문서만 둔다.
- `games/time-longinus/`: 현재 첫 번째 게임 프로젝트다. 작업 전 이 폴더의 `AGENTS.md`를 먼저 읽는다.

## 작업 원칙

- 새 게임은 `games/<game-id>/` 아래에 만들고 실제 이름·목적·우선 플랫폼·첫 구현 범위를 해당 게임의 `AGENTS.md`에 기록한다.
- pnpm workspace에는 각 게임의 실제 `apps/*`, `packages/*`만 등록한다. 빈 플랫폼 앱이나 미사용 공유 패키지를 만들지 않는다.
- 게임 간 소스 직접 import는 금지한다. 재사용이 실제로 확인되면 계약·라이선스·소유자를 정한 뒤에만 공통 패키지를 추가한다.
- 커밋·푸시·배포·외부 콘솔 업로드·운영 데이터 변경은 사용자의 별도 명시 승인 없이는 수행하지 않는다.
- `마무리하자`는 관련 문서 정리, 필요한 검증, `git diff --check`, 결과 보고 요청이며 Git·배포 작업의 승인이 아니다.

## 실행

- 설치: `pnpm.cmd install`
- 현재 기본 게임 실행: `pnpm.cmd dev:time-longinus`
- 전체 타입 검사: `pnpm.cmd typecheck`
- 현재 게임 규칙 테스트: `pnpm.cmd test`
- 현재 게임 빌드: `pnpm.cmd build:time-longinus`

## 문서

- 현재 작업 공간 진행 기록: `progress.md`
- 게임별 진행 기록: `games/<game-id>/progress.md`
