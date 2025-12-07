# Backend Guide

FastAPI 기반 API와 Celery 워커를 사용해 COCO 업로드, 인사이트 계산, CVAT 태스크 재생성을 수행하기 위한 상세 지침입니다. 스키마/엔드포인트/비동기 작업/환경 변수 요구사항을 포함합니다.

## 핵심 스택
- **Framework**: FastAPI, Uvicorn(ASGI), Pydantic v2, SQLModel 또는 SQLAlchemy 2.x + asyncpg.
- **비동기 작업**: Celery + Redis(브로커/결과), Beat 또는 전용 scheduler 프로세스.
- **스토리지**: PostgreSQL, MinIO(S3 호환) 또는 로컬 파일 시스템(개발), 이미지 썸네일 저장 포함.
- **인증/인가**: JWT(access/refresh), 프로젝트 단위 RBAC(viewer/editor/admin), OAuth2 Password Grant.
- **유틸**: orjson(직렬화), httpx(CVAT API 클라이언트), Pillow/pyheif/OpenCV(이미지/썸네일), fastapi-pagination, structlog(JSON 로그).
- **품질**: Ruff/black/isort + mypy(선택), Pytest.

## 디렉터리 구조 제안
```
backend/
├─ app/
│  ├─ main.py           # FastAPI 앱/라우터 등록
│  ├─ config.py         # pydantic Settings, env 로딩
│  ├─ deps.py           # 공통 Depends (DB 세션, 인증)
│  ├─ models/           # SQLModel/SQLAlchemy ORM 모델
│  ├─ schemas/          # Pydantic 스키마
│  ├─ api/              # 라우터 모듈 (auth, projects, assets, insights, exports, health)
│  ├─ services/         # 비즈니스 로직 (COCO 파서, CVAT 클라이언트, 썸네일)
│  ├─ workers/          # Celery 태스크(def import_coco, generate_thumbnails, export_cvat)
│  ├─ utils/            # 파일 I/O, 해시, 검증
│  ├─ db.py             # 세션/엔진/마이그레이션 헬퍼
│  └─ __init__.py
├─ migrations/          # Alembic 스크립트
├─ tests/               # Pytest (API/서비스/태스크)
└─ requirements.txt
```

## 데이터 모델 요구사항(요약)
- User(id, email, hashed_password, roles[], last_login)
- Project(id, name, description, source, status: importing|ready|failed, owner_id, created_at)
- ImageAsset(id, project_id, uri, width, height, checksum, tags[], metadata JSONB, thumbnail_uri, status)
- Annotation(id, image_id, category_id, bbox/segmentation/keypoints, attributes JSONB, source, is_machine)
- Category(id, project_id, name, supercategory, meta JSONB)
- InsightView(id, project_id, name, query JSON, visualization JSON, created_by)
- ExportJob(id, project_id, filter_snapshot JSON, target: cvat, status, payload_uri, log)
- AuditLog(id, user_id, project_id, action, detail JSONB, created_at)

## 주요 엔드포인트 요구사항
- `POST /api/auth/login`: JWT 발급. refresh 토큰 재발급(`POST /api/auth/refresh`).
- `GET/POST /api/projects`: 생성 시 COCO 업로드 토큰 반환.
- `POST /api/projects/{id}/coco`: COCO JSON + 이미지 업로드(직접 업로드 또는 presigned URL). Celery 태스크로 파싱/검증/삽입.
- `GET /api/projects/{id}/assets`: 태그/메타데이터/클래스/해상도 필터 + 페이지네이션 + 정렬.
- `PATCH /api/assets/{id}` / `POST /api/assets/bulk`: 태그/메타데이터 일괄 수정.
- `GET|POST /api/projects/{id}/insights`: 인사이트 조회/저장, 저장 시 InsightView 레코드 생성.
- `POST /api/projects/{id}/exports/cvat`: 필터 스냅샷을 COCO로 Export 후 CVAT API(Task 생성) 호출. ExportJob 상태/로그 업데이트.
- `GET /api/exports/{job_id}`: ExportJob 상태 조회.
- `GET /api/health`: DB, Redis, S3, CVAT API 헬스 체크.

## 비동기 플로우
1. **COCO 업로드(import_coco)**
   - 입력: COCO JSON 경로, 이미지 디렉터리, 프로젝트 ID.
   - 검증: 이미지 누락/중복 체크, 형식 검증, 실패 시 로그 기록.
   - DB 삽입 후 썸네일 생성 태스크(trigger generate_thumbnails).
2. **썸네일 생성(generate_thumbnails)**
   - Pillow/OpenCV로 리사이즈(기본 512px), MinIO/로컬에 저장 후 ImageAsset.thumbnail_uri 업데이트.
3. **CVAT Export(export_cvat)**
   - 필터 스냅샷으로 COCO JSON 생성 → 이미지 번들 → CVAT Task 생성(httpx) → ExportJob.payload_uri/log 업데이트.

## 설정/환경 변수 예시
```env
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/dataset
REDIS_URL=redis://redis:6379/0
S3_ENDPOINT=http://minio:9000
S3_BUCKET=dataset
JWT_SECRET=localdevsecret
JWT_EXPIRES_IN=3600
ALLOWED_ORIGINS=http://localhost:5173
CVAT_API_URL=https://cvat.example.com/api
CVAT_API_TOKEN=changeme
LOG_LEVEL=INFO
THUMBNAIL_SIZE=512
```

## 로컬 개발/실행
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head  # 마이그레이션 적용
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# 워커
celery -A app.workers.app worker -l info
# 스케줄러(선택)
celery -A app.workers.app beat -l info
```

## 테스트/품질
- `pytest` : API/서비스 단위 테스트.
- `ruff check` + `ruff format` 또는 `black`/`isort` : 스타일.
- `mypy` : 선택적 정적 타입 검사.
- GitHub Actions 워크플로우: lint → test → docker build.

## 구현 체크리스트
- [ ] DB 모델/마이그레이션 작성 및 관계/인덱스 정의(tags GIN, metadata JSONB path)
- [ ] JWT 인증/refresh, RBAC 미들웨어 구현
- [ ] COCO 파서 + 이미지 검증/해시 + 실패 보고서 저장
- [ ] Celery 태스크(import_coco, generate_thumbnails, export_cvat)와 상태 업데이트
- [ ] 필터 DSL → SQL 변환기 + 페이지네이션 API
- [ ] InsightView 저장/조회 API + 기본 차트용 집계 쿼리
- [ ] CVAT API 클라이언트(httpx)와 태스크 생성/에셋 업로드 처리
- [ ] 헬스체크/메트릭/구조화 로그 추가
