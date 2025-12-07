# Frontend 구현 가이드 (React + Vite)

CVAT COCO 기반 데이터셋 브라우저를 빠르게 구현하기 위한 프론트엔드 지침입니다. 화면 책임, 상태 관리, API 연동 규칙, 품질 체크리스트를 포함합니다.

## 기술 스택
- **React 18 + TypeScript + Vite**
- **UI**: Chakra UI(또는 Ant Design) + react-grid-layout(인사이트 배치)
- **상태**: Zustand(로컬 UI 상태) + React Query(서버 상태, 캐싱/동기화)
- **차트**: ECharts(히스토그램/히트맵/파이)
- **라우팅**: React Router 6
- **형상/품질**: ESLint + Prettier + Vitest + Playwright(선택) + i18n(next step)

## 로컬 개발 빠른 시작
1. 의존성 설치: `cd frontend && npm install`
2. API 베이스 URL 설정: `.env.example`를 `.env`로 복사 후 `VITE_API_BASE_URL`을 로컬 FastAPI(기본 8000) 또는 목 서버 주소로 지정
3. 개발 서버: `npm run dev -- --host --port 5173`
4. 기본 확인: 사이드바/헤더 렌더링, 프로젝트/에셋/인사이트/Export 라우트 이동, 네트워크 요청이 설정한 베이스 URL로 전달되는지 확인

## 라우트 & 페이지 책임
- `/projects`: 프로젝트 목록/생성 모달, COCO 업로드 진입점
- `/projects/:id/assets`: 썸네일/테이블 뷰, 태그·메타데이터 인라인 편집, 일괄 편집 모달
- `/projects/:id/insights`: 필터 패널 + 차트/그리드 배치, InsightView 저장/불러오기
- `/projects/:id/exports`: CVAT ExportJob 리스트/상세, 재시도/다운로드 링크
- 공통 레이아웃: 사이드바(프로젝트 전환), 상단 사용자 메뉴, 알림 토스트/Drawer

## 상태 관리 규칙
- **Zustand store**
  - `useSessionStore`: 사용자/토큰, 프로젝트 권한, API 베이스 URL
  - `useFilterStore`: 태그/메타데이터/카테고리/크기 필터 DSL 상태 + 직렬화 헬퍼
  - `useLayoutStore`: 인사이트 카드 배치, 열 숨김, 뷰 모드(갤러리/테이블)
- **React Query**
  - 키 규칙: `['projects']`, `['project', id]`, `['assets', {id, filters, page, sort}]`, `['insights', id]`, `['exports', id]`
  - 뮤테이션 후 invalidate 범위 최소화(해당 프로젝트 키만)
  - 진행률 폴링: COCO 업로드/ExportJob 상태를 `refetchInterval`로 관리

## API 연동 규약
- Axios 인스턴스에 `Authorization: Bearer {token}` + `X-Project-Id`(선택) 헤더 적용
- 에러 표준화: `{message, detail?, fieldErrors?}` 형태를 토스트 + FormError에 사용
- 업로드: COCO JSON / 이미지 ZIP은 `multipart/form-data`; 대용량은 업로드 후 잡 ID 반환
- 필터 직렬화: `tag:car width>1024 metadata.color:red` DSL을 쿼리스트링 `q`로 전달

## 주요 컴포넌트/훅 설계
- `components/filters/FilterBar.tsx`: 태그/메타데이터 DSL 에디터 + 저장된 필터 호출
- `components/assets/AssetGrid.tsx` & `AssetTable.tsx`: 다중 선택, 인라인 편집, 가상 스크롤
- `components/insights/InsightBoard.tsx`: react-grid-layout으로 카드 배치, 카드 타입(파이/바/히트맵/테이블)
- `components/exports/JobList.tsx`: ExportJob 진행률, CVAT 링크, 재시도 버튼
- `api/hooks.ts`: React Query 훅 모음(`useProjects`, `useAssets`, `useInsightViews`, `useExportJobs` 등)
- `store/filters.ts`: DSL <-> 구조화 필터 변환 로직, 서버와 동일 규칙을 유지

## UX/로딩 전략
- 목록/차트 skeleton, 업로드/Export 진행률 토스트, 실패 시 재시도 CTA
- 썸네일 지연 로딩 + 실패 시 플레이스홀더; 테이블에서는 지연 로딩 열을 최소화
- 필터 적용 시 URL 동기화(`?q=...&page=...`), InsightView 저장 시 필터 스냅샷 포함

## 품질 체크리스트
- `npm run lint && npm run test` 최소 실행
- 주요 사용자 플로우에 대해 Vitest + React Testing Library로 스모크 테스트
- API 계약 변화 시 `api/types.ts` 갱신 및 훅 테스트 동반
- 접근성: 키보드 포커스, aria-label, 대비 검증

## 예시 개발 흐름
1) `npm create vite@latest frontend -- --template react-ts` 로 초기화 후 Chakra/React Query/Zustand 설정
2) `Layout` + 라우팅 뼈대 구성 → 프로젝트 목록 → 에셋 뷰 → 인사이트/Export 뷰 순으로 페이지 확장
3) API 스텁(`msw`)으로 UI 구축 후, 실제 백엔드와 연결해 데이터 교차 검증
