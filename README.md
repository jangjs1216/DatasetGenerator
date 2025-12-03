# DatasetGenerator

DatasetGenerator는 이미지 데이터셋을 관리하고 분석하는 웹 애플리케이션을 구축하기 위한 설계 안내서입니다. CVAT로부터 내보낸 COCO 주석을 그대로 등록하고, 이미지별 Tag/메타데이터를 관리하며, 메타데이터 기반 인사이트를 도출하고, 다시 CVAT 태스크를 생성하는 워크플로우를 지원합니다. FiftyOne과 유사한 인터랙션을 목표로 하지만 CVAT와의 왕복 연동을 핵심으로 합니다.

## 핵심 요구사항
- **Tag/메타데이터 관리**: 이미지 단위로 다중 태그와 Key-Value 형태의 메타데이터를 부여/수정/검색.
- **COCO 입력 지원**: CVAT Export의 COCO Dataset(JSON + 이미지 폴더) 구조를 그대로 업로드하여 프로젝트 생성.
- **인사이트 도출 탭**: 메타데이터와 주석을 교차 분석해 필터링·집계·시각화를 제공.
- **CVAT 태스크 재생성**: 필터링된 이미지/주석 집합을 다시 CVAT 태스크로 내보내어 재라벨링 또는 후속 작업에 사용.

## 권장 스택 & 아키텍처
- **프론트엔드**: React 18 + TypeScript + Vite. UI는 **Chakra UI** 또는 **Ant Design** 선택, 상태는 **Zustand**(간단) + **React Query**(서버 상태) 조합. 그래프는 **ECharts**(히트맵/히스토그램) + **react-grid-layout**(인사이트 대시보드 배치) 사용.
- **백엔드**: Python 3.11 **FastAPI** + **SQLModel**(또는 SQLAlchemy 2.x) + **Pydantic v2**. 비동기 작업 큐는 **Celery** + **Redis**(브로커/결과), 파일 I/O는 **aiofiles**. 인증/인가: **JWT**(access/refresh) + 프로젝트 단위 RBAC.
- **데이터·파일 스토리지**: **PostgreSQL**(JSONB 필드 포함), **MinIO(S3 호환)** 또는 로컬 FS(개발). 업로드/Export 산출물은 버킷에 보관, 썸네일/파생물도 동일 스토리지에 정리 정책을 둠.
- **배포/컨테이너**: Docker Compose(개발) / Kubernetes(운영). 서비스는 `frontend`, `api`, `worker`, `scheduler`(주기 작업), `db`, `redis`, `minio`, `proxy`(Traefik/Nginx)로 분리.
- **데이터 처리 유틸**: COCO 파서 + 이미지 유효성 검사, **Pillow/pyheif**(썸네일·EXIF), **OpenCV**(선택: 영상/시각화), **fastapi-pagination**(자산 목록), **orjson**(고속 직렬화), **httpx**(CVAT API 클라이언트).

## 디렉터리 제안 (상세)
```
DatasetGenerator/
├─ frontend/                 # React/Vite 앱
│  ├─ src/components/        # 공용 UI, 필터 패널, 인사이트 카드
│  ├─ src/pages/             # 프로젝트, 에셋, 인사이트, Export 화면
│  ├─ src/store/             # Zustand 스토어 (필터 상태, 세션)
│  ├─ src/api/               # React Query 훅, API 클라이언트
│  ├─ src/utils/             # 쿼리 파서(tag:car width>1024) 등
│  └─ src/styles/            # 테마/레이아웃
├─ backend/
│  ├─ app/
│  │  ├─ main.py             # FastAPI 엔트리, 라우팅
│  │  ├─ deps.py             # 공통 의존성, 인증
│  │  ├─ config.py           # 설정 로딩 (pydantic Settings)
│  │  ├─ models/             # SQLModel/SQLAlchemy 모델
│  │  ├─ schemas/            # Pydantic 스키마
│  │  ├─ api/                # 라우터(projects, assets, insights, exports)
│  │  ├─ services/           # 비즈니스 로직(CVAT 클라이언트, COCO 파서)
│  │  ├─ workers/            # Celery 태스크(def thumbnails, import/export)
│  │  └─ utils/              # 파일 I/O, 이미지 검사
│  └─ tests/                 # Pytest 기반 API/서비스 테스트
├─ storage/                  # 로컬 개발용 업로드 경로(이미지/주석)
├─ docs/                     # API 명세, 예제 COCO, ERD
└─ scripts/                  # 초기화 스크립트, 데이터 변환/마이그레이션
```

## 데이터 모델 스케치
- **User**: id, email, hashed_password, roles(RBAC), last_login.
- **Project**: id, name, description, created_at, source(`cvat-coco`), status(`importing|ready|failed`), owner_id.
- **ImageAsset**: id, project_id, uri(s3/key), width, height, checksum, tags[](text[]), metadata(JSONB), thumbnail_uri, status.
- **Annotation**: id, image_id, category_id, bbox/segmentation/keypoints, attributes(JSONB), source(`cvat`), is_machine.
- **Category**: id, project_id, name, supercategory, meta(JSONB).
- **InsightView**: id, project_id, name, query(filters, aggregations), visualization(type, config), saved_by.
- **ExportJob**: id, project_id, filter_snapshot, target(`cvat`), status(`queued|running|done|failed`), payload_uri, log.
- **AuditLog**: id, user_id, project_id, action, detail(JSONB), created_at.

## 주요 기능별 설계
### 1) Tag/메타데이터 관리
- 이미지 카드/테이블에서 Tag 추가·삭제, 메타데이터 Key-Value 인라인 편집.
- 고급 검색: `tag:car color:red width>1024` 형태의 쿼리 파서 또는 UI 필터.
- 일괄 편집: 선택된 다수 이미지에 Tag/메타데이터 일괄 적용.
- 썸네일 생성 및 캐싱으로 목록 로딩 최적화.

### 2) CVAT COCO 업로드
- 업로드 흐름: (1) 프로젝트 생성 → (2) COCO JSON 업로드 → (3) 이미지 ZIP/폴더 업로드.
- 백엔드에서 COCO JSON 파싱 후 DB에 이미지/주석 삽입, 누락 이미지 검증.
- 비동기 잡(Celery)으로 대용량 업로드 처리 및 진행률 API 제공.
- 업로드 완료 후 썸네일 생성, 기본 인사이트(클래스 분포 등) 사전 계산.

### 3) 인사이트 도출 탭
- 필터 기반 서브셋(태그, 메타데이터, 클래스, 바운딩 박스 속성) 정의.
- 차트/테이블: 클래스 분포, 태그별 카운트, 해상도 히스토그램, 속성 별 상관 그래프.
- 결과를 **InsightView**로 저장하고 공유. 필터 상태와 시각화 구성을 JSON으로 보관.
- 샘플 그리드/갤러리에서 필터된 이미지를 즉시 확인.

### 4) CVAT 태스크 재생성
- 필터링된 이미지와 주석을 다시 COCO 포맷으로 Export.
- CVAT API(Tasks/Projects endpoint)를 호출하여 새 태스크 생성 후 이미지/주석 업로드.
- ExportJob을 통해 상태/로그를 추적하고, 완료 후 CVAT 링크를 UI에 제공.

### 공통 서비스/기술 포인트
- **쿼리 파서**: `tag:car color:red width>1024` 형태의 DSL → Postgres SQL 변환. 인덱스: tags GIN, metadata JSONB path.
- **파일 검증**: 이미지 해시/용량/EXIF 체크, 누락/중복 검증, 실패 시 상세 리포트 저장.
- **썸네일 파이프라인**: Celery 워커가 이미지 → 512px 썸네일 생성, 실패 건 재시도. 썸네일 URI를 자산 레코드에 업데이트.
- **메트릭/로그**: Prometheus Exporter + 구조화 로그(JSON). 주요 잡 상태는 ExportJob.log에 스냅샷.

## API 예시 (백엔드)
- `POST /api/auth/login` : JWT 발급(액세스/리프레시), 프로젝트 권한 포함 클레임.
- `POST /api/projects` : 프로젝트 생성(COCO 소스 선택 시 업로드 토큰 반환).
- `POST /api/projects/{id}/coco` : COCO JSON 및 이미지 ZIP 업로드, 비동기 파싱 시작.
- `GET /api/projects/{id}/assets` : 태그/메타데이터/주석 필터링 + 페이지네이션 + 정렬.
- `PATCH /api/assets/{id}` : 태그/메타데이터 업데이트.
- `POST /api/assets/bulk` : 다중 자산 태그/메타데이터 일괄 업데이트.
- `GET /api/projects/{id}/insights` & `POST /api/projects/{id}/insights` : 인사이트 조회/저장.
- `POST /api/projects/{id}/exports/cvat` : 필터 스냅샷 기반 CVAT 태스크 생성.
- `GET /api/exports/{job_id}` : ExportJob 상태 조회.
- `GET /api/health` : 헬스체크(데이터베이스, Redis, S3, CVAT API 핑).

## 개발 환경 구성
1. **사전 준비**: Node 20+, Python 3.11+, Docker 24+, Docker Compose.
2. **의존성 설치**
   ```bash
   cd frontend && npm install
   cd ../backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
   ```
3. **환경 변수 예시** (`.env`)
   ```env
   # backend
   DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/dataset
   S3_ENDPOINT=http://minio:9000
   S3_BUCKET=dataset
   REDIS_URL=redis://redis:6379/0
   CVAT_API_URL=https://cvat.example.com/api
   CVAT_API_TOKEN=changeme
   JWT_SECRET=localdevsecret
   JWT_EXPIRES_IN=3600
   ALLOWED_ORIGINS=http://localhost:5173

   # frontend
   VITE_API_BASE=http://localhost:8000
   ```
4. **개발 서버 실행**
   ```bash
   # 루트에서
   docker compose up -d db redis minio
   # 백엔드 (FastAPI)
   cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   # 프론트엔드 (Vite)
   cd frontend && npm run dev -- --host --port 5173
   ```
5. **테스트 데이터 로딩**
   ```bash
   python scripts/load_coco_sample.py --project-name demo --coco-path ./docs/samples/cvat_export.json --images ./docs/samples/images/
   ```

## 운영·CI/CD 고려사항
- 업로드 파일 바이러스 스캔(ClamAV)과 파일 크기 제한.
- 대규모 COCO 처리 시 워커 자동 스케일링 및 백프레셔.
- 썸네일/파생 파일의 수명 관리(주기적 정리 작업), 만료/이전 정책.
- RBAC: 프로젝트별 권한(뷰어/에디터/어드민), 감사 로그.
- 모니터링: Prometheus + Grafana, 구조화된 로그(JSON). OpenTelemetry로 추적 연동.
- CI: GitHub Actions에서 `frontend lint/test`, `backend lint(test)`, `docker build` 매트릭스.
- CD: 메인 브랜치 머지 시 컨테이너 이미지 빌드 → 레지스트리 푸시 → Helm/Compose 배포 자동화.

## 개발 로드맵 제안
- MVP: COCO 업로드/조회, 태그 편집, 기본 인사이트(클래스/태그 분포), CVAT Export.
- 이후: 사용자 정의 스키마 필드, 플러그인 기반 인사이트, 웹훅/Slack 알림, 온디맨드 모델 추론(프리뷰용).

## 참고 링크
- [COCO format](https://cocodataset.org/#format-data)
- [CVAT REST API](https://docs.cvat.ai/docs/api_reference/)
- [FiftyOne](https://docs.voxel51.com/)
