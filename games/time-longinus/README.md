# 타임 롱기누스

2154년 크로노스 기지의 시간송환 연구 책임자인 박사가 세 세계선을 오가며 영웅을 육성하는 레트로 텍스트 기반 차원 교차 육성 시뮬레이션입니다.

현재 실행 가능한 범위는 PWA 프로토타입의 월간 4주 스케줄, 세계선 전환, 스트레스·크레딧·육성 수치 갱신과 브라우저 로컬 저장입니다. 기획의 전직, 전투, 환생, 실제 PWA 설치·캐시, 토스, 모바일은 아직 구현하지 않았습니다.

## 시작

Node 20.19 이상과 pnpm 10.34.7을 사용합니다. 이 Windows 환경에서는 `pnpm.ps1` 대신 `pnpm.cmd`를 실행합니다.

```powershell
pnpm.cmd install
pnpm.cmd dev:time-longinus
```

PWA 개발 서버: `http://localhost:5173`

## 검사

```powershell
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build:time-longinus
```

## 구조

```text
apps/web/            React + Vite PWA 프로토타입 UI
packages/contracts/  게임 상태와 결과 계약
packages/core/       플랫폼 독립 게임 규칙과 테스트
docs/planning/       연결된 기획 Google Docs 바로가기
```

Supabase, Cloudflare, Vercel, 지도, 토스 SDK, Capacitor는 현재 범위에서 사용하지 않습니다. 필요가 확정되면 플랫폼별 책임과 배포 절차를 문서화한 뒤 추가합니다.

