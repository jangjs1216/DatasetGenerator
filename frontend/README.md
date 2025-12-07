# Frontend Guide

React + TypeScript 기반 Vite 앱으로, CVAT 연동 데이터셋 관리 UI를 구현하기 위한 구체 지침입니다. 상태 관리, 라우팅, 컴포넌트 구조, API 계약을 정의해 바로 개발을 시작할 수 있도록 구성했습니다.

## 핵심 스택
- **Framework**: React 18, Vite, TypeScript, React Router v6.
- **UI**: Chakra UI 또는 Ant Design(둘 중 하나 선택 후 전역 테마 확정), react-grid-layout(인사이트 카드 배치), ECharts/echarts-for-react(차트).
- **상태**: Zustand(로컬 상태) + React Query(서버 상태), immer 미들웨어 사용.
- **유틸**: axios(API 클라이언트), zod(요청/응답 스키마 검증), dayjs(날짜), classnames.
- **테스트**: Vitest + React Testing Library + Playwright(e2e 선택).
- **품질**: ESLint(typescript-eslint, react-hooks), Prettier, Husky + lint-staged.

## 디렉터리 구조 제안
```
frontend/
├─ src/
│  ├─ pages/              # router 페이지 단위 (Projects, ProjectDetail, Assets, Insights, ExportJobs)
│  ├─ components/         # 공용 UI (AssetCard, TagEditor, MetadataTable, InsightChart, FilterBar)
│  ├─ features/           # 도메인 묶음 (projects, assets, insights, auth)
│  ├─ api/                # axios 인스턴스, React Query 훅, 타입 정의
│  ├─ store/              # Zustand 스토어 (session, filters, layout)
│  ├─ hooks/              # 공용 훅 (usePagination, useKeyboardShortcuts 등)
│  ├─ utils/              # 쿼리 파서, 수치 변환, form helpers
│  ├─ types/              # zod 스키마 및 타입
│  ├─ styles/             # 테마/글로벌 스타일
│  └─ main.tsx            # 엔트리
├─ public/                # 정적 자원
└─ tests/                 # Vitest/Playwright
```

## 주요 페이지 & 기능 요구사항
- **Projects**: 프로젝트 목록, 생성 모달(COCO 업로드 진입), 상태 배지(importing/ready/failed).
- **Project Detail**: 요약 카드(자산 수, 카테고리, 최근 Export), COCO 업로드 진행률 표시.
- **Assets**:
  - 테이블/그리드 전환, 썸네일, 태그/메타데이터 인라인 편집.
  - 필터 바: tag:, metadata.key:, category:, resolution 등 DSL 또는 폼 UI. 필터 상태를 URL 쿼리와 Zustand에 동기화.
  - 일괄 편집: 체크박스 선택 후 태그 추가/삭제, 메타데이터 병합.
- **Insights**:
  - 차트 카드(클래스 분포, 태그 분포, 해상도 히스토그램, 시간 추이) 생성/배치/리사이즈.
  - 뷰 저장/로드(InsightView), 공유 링크 복사.
- **Export Jobs**: CVAT 태스크 생성 내역 확인, 상태/로그 표시, 실패 시 재시도.
- **Auth**: 로그인/토큰 갱신, 프로젝트별 RBAC에 맞는 버튼 노출 제어.

## API 계약(요약)
- `POST /api/auth/login` → `{access, refresh, user}` 저장, axios 인터셉터로 갱신.
- `GET /api/projects` / `POST /api/projects` / `POST /api/projects/{id}/coco` 업로드 시작.
- `GET /api/projects/{id}/assets` 쿼리 파라미터: `page`, `page_size`, `sort`, `filter`(DSL 문자열).
- `PATCH /api/assets/{id}` / `POST /api/assets/bulk` 태그/메타데이터 업데이트.
- `GET|POST /api/projects/{id}/insights` 인사이트 목록/생성.
- `POST /api/projects/{id}/exports/cvat` / `GET /api/exports/{job_id}` 내보내기 상태.
- `GET /api/health` 헬스체크. 모든 엔드포인트는 `Authorization: Bearer` 필요.

## 상태 관리 지침
- **세션**: access/refresh 토큰, 사용자/프로젝트 권한을 store/session에 저장. 새로고침 시 localStorage와 동기화.
- **필터**: store/filters에 현재 DSL, 정렬, 페이지네이션을 저장하고 URL과 동기화. React Query 키에 포함해 서버 캐시 분리.
- **인사이트 레이아웃**: store/layout에 grid 레이아웃 및 카드 구성을 JSON으로 저장, 서버 저장 시 InsightView에 연계.

## 스타일/UX
- 라이트/다크 테마 지원, 반응형(≥320px), 키보드 단축키(검색 포커스, 선택 모두/해제).
- 에러/성공 토스트 규격화, 로딩 스켈레톤 적용.
- 접근성: 포커스 링, 적절한 aria-label, 대비 준수.

## 개발/실행
```bash
cd frontend
npm install
npm run dev -- --host --port 5173
npm run lint
npm run test
```
- `.env` 예시: `VITE_API_BASE=http://localhost:8000`, `VITE_S3_BASE=http://localhost:9000/dataset`.
- Mock 서버가 필요하면 MSW 핸들러를 `src/mocks/`에 추가 후 `npm run dev:mock` 스크립트 구성.

## 배포/빌드
- `npm run build` → `dist/` 산출, Nginx/Traefik 정적 호스팅.
- CI: lint/test/build를 GitHub Actions 매트릭스로 실행.

## TODO 체크리스트
- [ ] API 클라이언트/스키마 작성
- [ ] 라우터/페이지 골격 생성
- [ ] 필터 DSL 파서/직렬화 구현
- [ ] 인사이트 카드(그래프) 컴포넌트 구현
- [ ] 태그/메타데이터 인라인/일괄 편집 UX 완성
- [ ] MSW 기반 스토리북/목 데이터 추가(optional)
