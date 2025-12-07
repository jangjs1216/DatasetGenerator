# Backend 구현 가이드 (FastAPI + Celery)

CVAT COCO 업로드·인사이트·재내보내기 기능을 중심으로 한 백엔드 구현 지침입니다. API 계약, 모델, 서비스, 비동기 잡, 설정/배포 요구사항을 포함합니다.

## 기술 스택
- **FastAPI** + **SQLModel/SQLAlchemy 2.x** + **Pydantic v2**
- **DB**: PostgreSQL(JSONB), 마이그레이션은 Alembic
- **스토리지**: MinIO(S3 호환) 또는 로컬 FS(개발)
- **비동기 작업**: Celery + Redis(브로커/결과) / Beat(주기 작업)
- **이미지/COCO**: Pillow/pyheif, OpenCV(선택), orjson, fastapi-pagination
- **인증/인가**: JWT(access/refresh) + 프로젝트 단위 RBAC

## API 레이어 설계
- `api/v1/auth`: 로그인/토큰 갱신, 비밀번호 변경
- `api/v1/projects`: 생성/조회/업데이트, 프로젝트 상태(importing|ready|failed)
- `api/v1/projects/{id}/coco`: COCO JSON + 이미지 업로드 시작, 검증 리포트, 진행률 조회
- `api/v1/projects/{id}/assets`: 필터링/페이지네이션/정렬, 태그·메타데이터 업데이트, 일괄 편집
- `api/v1/projects/{id}/insights`: InsightView CRUD, 사전 계산된 메트릭 조회
- `api/v1/projects/{id}/exports/cvat`: 필터 스냅샷 기반 ExportJob 생성, CVAT 태스크 생성/링크 반환
- `api/v1/health`: DB/Redis/S3/CVAT API 핑

### 요청/응답 규칙
- 모든 요청은 `Authorization: Bearer {token}` 사용, 프로젝트 자원 접근 시 `project_id` 소유 검증
- 에러 형태는 `{message, detail?, fieldErrors?}`로 통일, Celery 잡 실패 시 `log` 필드에 경로 저장
- 필터 DSL(`q`): 서버에서 SQL 변환(`tag:car width>1024 metadata.color:red category:person`), GIN/JSONB 인덱스 활용

## 데이터 모델 핵심(예시 필드)
- `User`: id, email, hashed_password, roles, last_login
- `Project`: id, name, description, source, status, owner_id, created_at
- `ImageAsset`: id, project_id, uri, width, height, checksum, tags[], metadata(JSONB), thumbnail_uri, status
- `Category`: id, project_id, name, supercategory, meta(JSONB)
- `Annotation`: id, image_id, category_id, bbox/segmentation/keypoints, attributes(JSONB), source, is_machine
- `InsightView`: id, project_id, name, query(JSON), visualization(JSON), saved_by
- `ExportJob`: id, project_id, filter_snapshot(JSON), target, status, payload_uri, log
- `AuditLog`: id, user_id, project_id, action, detail(JSON), created_at

## 서비스 계층 책임
- **COCO Import Service**
  - JSON 파싱 → DB upsert → 누락 이미지 검증, 실패 내역 리포트
  - Celery 태스크에서 진행률 emit, 썸네일 생성 파이프라인 호출
- **Query Parser**
  - DSL → SQL where clause 변환, 안전한 필드 화이트리스트, Postgres 함수/jsonb_path_query 활용
- **Insight Engine**
  - 사전 계산 메트릭(클래스 분포, 해상도 히스토그램, 태그 카운트) 캐싱
  - 필요 시 Materialized View 또는 Redis 캐시 사용
- **CVAT Client**
  - API 토큰 기반 Tasks/Projects 호출, COCO 내보내기 산출물 업로드, 실패 시 재시도 정책
- **Export Pipeline**
  - 필터 스냅샷 → COCO 생성 → S3 업로드 → CVAT 태스크 생성 → 링크 저장

## 비동기 파이프라인
- Celery 워커 역할: COCO Import, 썸네일 생성, Insight 사전 계산, CVAT Export
- 진행률 추적: Redis나 DB에 `tasks:{id}` 상태 저장, API가 폴링/스트리밍으로 제공
- 실패 리포트: S3/logs/{task_id}.json 저장 후 API 응답에 링크 제공

## 설정/배포 가이드
- `.env` 예시: DATABASE_URL, S3_ENDPOINT/Bucket, REDIS_URL, CVAT_API_URL/TOKEN, JWT_SECRET/EXPIRES, ALLOWED_ORIGINS
- Dockerfile 분리: `api`(uvicorn) / `worker`(celery -A app.workers) / `beat`
- 헬스체크: DB/Redis/S3/CVAT API 각각 ping, 준비되기 전 readiness fail
- Observability: Prometheus FastAPI 인스트루먼트, 구조화 로그(JSON), OpenTelemetry 트레이스(옵션)

## 개발 워크플로우 제안
1) 모델/스키마 정의 → Alembic 마이그레이션 작성 → 기본 시드 데이터
2) 인증/인가 미들웨어 구현 → 프로젝트/자산/필터/인사이트/Export 엔드포인트 추가
3) Celery 파이프라인(Import/썸네일/Export) 작성 후 API 폴링/웹훅과 연결
4) CVAT API 클라이언트/설정 분리, 환경 변수/비밀 관리(Secret Manager 또는 .env)
5) Pytest로 서비스/라우터 단위 테스트, httpx.AsyncClient로 통합 테스트, `docker-compose`로 로컬 의존성 기동
