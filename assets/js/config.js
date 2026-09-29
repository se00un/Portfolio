/*
 * Site configuration.
 * 콘텐츠는 모두 Markdown(projects/, experience/, data/)에 있고,
 * 이 파일은 "무엇을 어떤 순서로 보여줄지"만 정한다.
 */
window.SITE = {
  // Hero 사진. 파일을 넣은 뒤 경로를 적으면 된다. 예: "images/profile.jpg"
  photo: "images/profile.png",

  // 전체 프로젝트 순서 (More Projects, 이전/다음 프로젝트 순서에 사용)
  // 파일이 비어 있거나 없으면 자동으로 건너뛴다.
  projects: [
    "01_ai_comment_moderation",
    "02_market_analytics",
    "03_multilexnorm",
    "04_triplog",
    "05_child_media_analytics",
    "08_school_accesibility",
    "06_web_novel_predict",
    "07_hallyu_spillover_analysis",
    "09_popup",
  ],

  // Home의 Selected Works (순서대로 노출)
  featured: [
    "01_ai_comment_moderation",
    "02_market_analytics",
    "03_multilexnorm",
    "04_triplog",
  ],

  // 프로젝트 대표 이미지 (없는 프로젝트는 Question 타이포그래피로 대체)
  images: {
    "01_ai_comment_moderation": {
      src: "images/projects/01-ai-comment-moderation/hero.png",
      alt: "댓글 작성 단계에서 AI가 더 나은 표현을 제안하는 흐름",
      position: "center",
    },
    "03_multilexnorm": {
      src: "images/projects/03_multilexnorm/hero.png",
      alt: "Rule-based → MFR → Selective LLM 정규화 파이프라인",
      position: "center",
    },
    "02_market_analytics": {
      src: "images/projects/02-market-analytics/hero-2.png",
      alt: "데이터 검증 후 발행 여부를 판단하는 Publish Gate 흐름",
      position: "center",
    },
    "04_triplog": {
      src: "images/projects/04_triplog/hero2.png",
      alt: "TripLog 일정·경로·지출 기록 화면",
      position: "center",
    },
    "05_child_media_analytics": {
      src: "images/projects/05_child_media_analytics/hero.png",
      alt: "쪼꼬미디어 보호자용 결과 화면",
      position: "top",
    },
    "08_school_accesibility": {
      src: "images/projects/08_school_accesibility/tab1.png",
      alt: "성남시 학교 인프라 현황 대시보드",
      position: "center",
    },
  },

  // 상세 페이지 본문 이미지.
  // section: 섹션 제목(번호 제외), heading: 그 섹션 안의 소제목(선택).
  // 이미지는 해당 섹션/소제목 내용이 끝나는 위치에 들어간다.
  figures: {
    "02_market_analytics": [
      {
        src: "images/projects/02-market-analytics/ops_publish.png",
        section: "Key Decision — Publish Gate",
        caption: "Ops Dashboard 발행 시도 로그 — NOT READY 세그먼트는 BLOCKED 처리되고 이전 결과가 유지된다",
      },
      {
        src: "images/projects/02-market-analytics/market_ready.png",
        section: "Two Dashboards",
        heading: "Market Analytics Dashboard",
        caption: "Market Analytics Dashboard — READY 세그먼트와 업데이트 보류(NOT READY) 세그먼트",
      },
      {
        src: "images/projects/02-market-analytics/ops_ready.png",
        section: "Two Dashboards",
        heading: "Operations Dashboard",
        caption: "Ops Dashboard — 국가 × 품목별 세그먼트 Readiness",
      },
    ],
    "04_triplog": [
      {
        src: "images/projects/04_triplog/ocr.png",
        section: "What I Built",
        heading: "Receipt OCR",
        caption: "영수증 인식 → 추출 값 확인·수정 → 일자별 지출 반영",
      },
      {
        src: "images/projects/04_triplog/budget.png",
        section: "Budget Logic",
        caption: "일자별 지출 관리와 지출 추가 화면",
      },
      {
        src: "images/projects/04_triplog/report.png",
        section: "AI Trip Report",
        caption: "AI 여행 리포트 — 하이라이트 장소, 다음 여행 스타일, 추천 여행지",
      },
    ],
    "05_child_media_analytics": [
      {
        src: "images/projects/05_child_media_analytics/explain.png",
        section: "From XAI to Parent-friendly Explanation",
        caption: "유형 결과 화면과 LLM이 생성한 유형 안내 문구",
      },
      {
        src: "images/projects/05_child_media_analytics/pic.png",
        section: "Web Service",
        heading: "Peer Comparison",
        caption: "또래 대비 매체 이용 시간·빈도·편중도 비교",
      },
    ],
    "08_school_accesibility": [
      {
        src: "images/projects/08_school_accesibility/tab1.png",
        section: "From Analysis to Dashboard",
        heading: "01. 현황 진단",
        caption: "현황 진단 — 행정동별 교육 시설 포화 지수",
      },
      {
        src: "images/projects/08_school_accesibility/tab2.png",
        section: "From Analysis to Dashboard",
        heading: "02. 통학 실태",
        caption: "통학 실태 — 외부 통학 유출 흐름",
      },
      {
        src: "images/projects/08_school_accesibility/tab3.png",
        section: "From Analysis to Dashboard",
        heading: "04. 정책 제안",
        caption: "정책 제안 — 통학 버스 증편 우선 구간",
      },
    ],
  },

  // 서로 이어지는 프로젝트 링크. figures와 같은 방식으로 위치를 지정한다.
  related: {
    "07_hallyu_spillover_analysis": [
      {
        project: "02_market_analytics",
        section: "Connection to Market Analytics Service",
        label: "이어진 프로젝트",
      },
    ],
    "02_market_analytics": [
      {
        project: "07_hallyu_spillover_analysis",
        section: "Problem",
        heading: "Starting Point",
        label: "출발점이 된 분석",
      },
    ],
  },

  experience: ["naver-cloud"],

  // Skills 아이콘. skills.md의 항목 이름 → 아이콘.
  // 여기에 없는 항목(SQL, NLP / LLM 등 개념)은 텍스트로 표시된다.
  skillIcons: {
    "Python": { si: "python", color: "#3776AB" },
    "Pandas": { si: "pandas", color: "#150458" },
    "scikit-learn": { si: "scikitlearn", color: "#F7931E" },
    "pytorch": { si: "pytorch", color: "#EE4C2C", label: "PyTorch" },
    "FastAPI": { si: "fastapi", color: "#009688" },
    "PostgreSQL": { si: "postgresql", color: "#4169E1" },
    "MySQL": { si: "mysql", color: "#4479A1" },
    "React": { si: "react", color: "#58C4DC" },
    "AWS": {
      url: "https://cdn.jsdelivr.net/npm/devicon@2.17.0/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg",
      color: "#FF9900",
    },
    "Git / GitHub": { si: "github", color: "#181717" },
    "Docker": { si: "docker", color: "#2496ED" },
  },
};
