# DatasetGenerator

DatasetGenerator는 CVAT에서 Export한 COCO 주석을 그대로 업로드하고, 이미지별 Tag/메타데이터 관리와 인사이트 시각화를 제공한 뒤 다시 CVAT 태스크로 내보내는 웹 애플리케이션입니다. 본 문서는 개요와 실행 안내를 제공하고, 세부 구현 지침은 프론트엔드/백엔드 전용 문서로 분리했습니다.

## 핵심 기능 개요
- **COCO 업로드**: CVAT Export(COCO JSON + 이미지)를 받아 프로젝트 생성 후 검증/파싱/썸네일 생성.
- **Tag/메타데이터 편집**: 이미지별 태그/Key-Value 메타데이터 CRUD 및 일괄 편집, 고급 필터.
- **인사이트 탭**: 필터링된 서브셋을 기반으로 클래스 분포, 태그 카운트, 해상도 히스토그램 등 시각화와 공유 가능한 뷰.
- **CVAT 재내보내기**: 필터 스냅샷을 COCO로 Export하고 CVAT API를 호출해 태스크를 생성.

## 실행 빠른 가이드
1. **필수 도구**: Node 20+, Python 3.11+, Docker 24+ (Compose 포함).
2. **개발 서비스 기동**
   ```bash
   docker compose up -d db redis minio
   ```
3. **백엔드**: [backend/README.md](backend/README.md)에 따라 가상환경 구성 후 `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` 실행.
4. **프론트엔드**: [frontend/README.md](frontend/README.md)에 따라 의존성 설치 후 `npm run dev -- --host --port 5173` 실행.
5. **샘플 데이터**: `scripts/load_coco_sample.py`(작성 예정)를 사용해 COCO 예제 로드 후 UI에서 확인.

## 아키텍처 스케치
- **프론트엔드**: React 18 + TypeScript + Vite, Zustand + React Query, Chakra UI/Ant Design, ECharts + react-grid-layout 기반 인사이트 대시보드.
- **백엔드**: FastAPI + SQLModel/Pydantic v2, Celery + Redis, PostgreSQL + MinIO(S3 호환), JWT 인증과 프로젝트 단위 RBAC.
- **배포 단위**: `frontend`, `api`, `worker`, `scheduler`, `db`, `redis`, `minio`, `proxy(Traefik/Nginx)` 컨테이너.
- **공통 유틸**: COCO 파서, 이미지 유효성 검사(Pillow/pyheif/OpenCV), 구조화 로그 + Prometheus 메트릭.

## 설계 문서
- 프론트엔드 구현 지침: [frontend/README.md](frontend/README.md)
- 백엔드 구현 지침: [backend/README.md](backend/README.md)
- 추가 자료(ERD, API 예제, 샘플 데이터)는 `docs/` 아래에 위치 예정.

## 라이선스
프로젝트 필요에 따라 추가하세요.
