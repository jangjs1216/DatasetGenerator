# DatasetGenerator

DatasetGenerator는 CVAT COCO 내보내기와 태그/메타데이터 기반 분석을 연결한 웹 애플리케이션 청사진입니다. FiftyOne과 유사한 인터랙션을 목표로 하되, CVAT와의 왕복 연동과 메타데이터 인사이트를 핵심으로 합니다. README에서는 전체 요구사항과 문서 구조를 요약하고, 프론트엔드/백엔드 구현 세부 가이드는 각각의 전용 문서로 분리해 개발 시 바로 활용할 수 있게 했습니다.

## 핵심 요구사항 요약
- **Tag/메타데이터 관리**: 이미지 단위 다중 태그 + Key/Value 메타데이터 CRUD, 일괄 편집, 고급 필터 DSL 지원.
- **COCO 입력**: CVAT Export COCO(JSON + 이미지) 그대로 업로드해 프로젝트 생성 및 검증.
- **인사이트 탭**: 메타데이터/주석 교차 필터링, 차트/그리드, 저장형 InsightView.
- **CVAT 태스크 재생성**: 필터 스냅샷 기반 COCO Export → CVAT API 호출로 새 태스크 생성.

## 문서 구성
- [`docs/frontend.md`](docs/frontend.md): React/Vite 앱 구현 가이드(라우팅, 상태, UI, API 연동, 품질 체크). 실제 화면/스토어 구조와 주요 컴포넌트 책임을 정의합니다.
- [`docs/backend.md`](docs/backend.md): FastAPI 기반 API·워커 구현 가이드(모델, 서비스, 엔드포인트, 비동기 잡, 설정/배포). 데이터 흐름과 CVAT/스토리지 통합을 단계별로 설명합니다.

## 로컬 실행 가이드 (프론트엔드 우선)
백엔드가 아직 없는 상태라도 UI 흐름을 검토할 수 있도록 프론트엔드를 먼저 구동할 수 있습니다.

1. Node 20+ 설치 후 의존성 설치
   ```bash
   cd frontend
   npm install
   ```
2. API 베이스 URL 설정 (백엔드 또는 목 서버)
   ```bash
   cp .env.example .env
   # FastAPI dev 서버를 8000 포트에서 띄웠다면 기본값을 그대로 사용
   # 목 서버를 쓴다면 예: VITE_API_BASE_URL=http://localhost:3001
   ```
3. 개발 서버 실행
   ```bash
   npm run dev -- --host --port 5173
   ```
   - 브라우저에서 http://localhost:5173 로 접속합니다.
   - `/api` 경로가 `VITE_API_BASE_URL` 로 프록시되므로, 로컬 FastAPI나 목 서버가 동작해야 데이터가 표시됩니다.
4. 기본 확인 포인트
   - 좌측 사이드바/헤더가 렌더링되는지 확인
   - Projects/Assets/Insights/Exports 라우트 이동이 정상인지 확인
   - 네트워크 탭에서 `/api/...` 호출이 설정한 베이스 URL로 나가는지 확인

백엔드가 준비되면 `docs/backend.md`의 FastAPI 지침에 따라 API를 띄우고 동일한 `VITE_API_BASE_URL`을 사용하면 됩니다.

## 빠른 시작
1. **의존성 준비**: Node 20+, Python 3.11+, Docker & Compose.
2. **서비스 기동(개발용)**:
   - `docker compose up -d db redis minio`
   - 백엔드: `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
   - 프론트엔드: `cd frontend && npm run dev -- --host --port 5173`
3. **환경 변수**: `.env`에 DB/S3/Redis/CVAT/JWT/프론트엔드 API 베이스 URL을 설정합니다.
4. **더 자세한 작업 플로우**는 각 문서를 참고하세요.

## 권장 리포지토리 형태
```
DatasetGenerator/
├─ frontend/       # React/Vite 앱
├─ backend/        # FastAPI + Celery 워커
├─ storage/        # 로컬 개발용 업로드 경로
├─ docs/           # 구현 가이드(프론트/백엔드)
└─ scripts/        # 초기화/데이터 변환 스크립트
```

## 개발/운영 체크포인트
- 업로드 파일 검증·썸네일 파이프라인·InsightView 저장/공유·ExportJob 상태 추적 포함.
- Prometheus/Grafana 모니터링, 구조화 로그, RBAC 및 감사 로그, CI/CD(프론트/백엔드 lint+test, 도커 빌드) 권장.
- 추후 로드맵: 사용자 정의 스키마 필드, 플러그인형 인사이트, 웹훅/Slack 알림, 온디맨드 모델 추론.
