# TripLog — All-in-One Travel Companion

## Meta

- Project Title: TripLog: All-in-One Travel Companion
- Period: 2026.03 - 2026.06
- Category: Full-Stack / AI Application / Travel
- Type: Team Project
- Course: Capstone Design, Sungkyunkwan University
- Role: Business Logic / Database / AI Features / Real-time Collaboration
- Status: Featured
- Backend: https://github.com/se00un/26-1-Capstone-Backend
- Frontend: https://github.com/se00un/26-1-Capstone

---

## Question

> 여행할 때 필요한 서비스들, 왜 다 따로 써야 하지?

---

## Summary

친구들과 여행할 때 일정은 지도에서, 지출은 가계부에서, 변경 사항은 메신저에서 따로 관리해야 하는 불편에서 시작한 통합 여행 관리 웹서비스입니다.

여행 전 예산 설정부터 일정·경로 관리, 개인·공동 지출, 영수증 OCR, 실시간 협업, 여행 후 AI 리포트까지 하나의 서비스 안에서 이어지도록 설계했습니다.

프로젝트에서 PostgreSQL 기반 데이터 구조와 프론트엔드·백엔드의 주요 비즈니스 로직을 구현하고, OCR 결과를 바로 저장하지 않고 사용자가 검토한 뒤 지출로 확정하는 구조를 설계했습니다. 또한 여행 중 생성된 지출·경로 데이터를 여행 종료 후 LLM 기반 리포트와 다음 여행지 추천에 다시 활용했습니다.

---

# 1. Problem

친구들과 여행을 준비하고 진행하면서 하나의 여행을 관리하기 위해 여러 서비스를 오가야 했습니다.

- 일정과 경로는 지도 서비스
- 지출은 별도의 가계부
- 변경 사항은 메신저
- 공동 지출은 다시 별도로 정산

각 서비스는 개별 기능은 제공하지만 서로 연결되지 않았습니다.

한 곳에서 입력한 정보를 다른 곳에 다시 옮겨야 했고, 한 사람이 변경한 일정이나 지출도 다른 여행자에게 별도로 알려야 했습니다.

여행이 끝난 뒤에는 여행 중 쌓인 경로와 지출 데이터도 대부분 다시 활용되지 않았습니다.

그래서 질문했습니다.

> 여행 하나를 관리하기 위해 왜 여러 서비스를 오가야 할까?

각 기능을 따로 자동화하기보다 여행의 시작부터 종료까지 하나의 흐름으로 연결하는 서비스를 만들기로 했습니다.

---

# 2. Product Goal

TripLog의 목표는 여행을 여러 개의 독립된 작업이 아니라 **하나의 연속된 경험**으로 다루는 것이었습니다.

Before Trip  
→ 예산 설정 / 여행 생성 / 멤버 초대  
→ During Trip  
→ 일정·경로 / 지출 / OCR / 공동 관리  
→ After Trip  
→ 정산 / 여행 데이터 분석 / AI 리포트 / 다음 여행지 추천

한 번 입력한 정보가 서비스 안에서 계속 활용되도록 설계했습니다.


- 영수증 사진 → OCR → 지출 데이터
- 지출 데이터 → 예산 사용 현황
- 공동 지출 → 여행 멤버 정산
- 여행 경로 + 지출 → AI 여행 리포트

로 이어집니다.

---

# 3. What I Built

TripLog는 크게 네 가지 기능을 하나의 서비스로 통합했습니다.

## Budget & Expense Management

여행 전에 전체 예산과 카테고리별 예산을 설정하고 여행 중 지출을 기록합니다.

지출은 개인 지출과 공동 지출로 구분하며, 공동 지출은 여행 멤버 간 정산에 활용됩니다.

카테고리별 지출을 예산과 비교해 사용 현황을 확인할 수 있도록 구현했습니다.

---

## Route & Schedule

여행 일자별 방문 장소와 순서를 관리하고 Google Maps 기반 2D 지도에서 이동 경로를 확인할 수 있도록 구성했습니다.

여행 목록은 CesiumJS 기반 3D Globe에서도 확인할 수 있습니다.

---

## Real-time Collaboration

여러 사용자가 하나의 여행에 참여할 수 있도록 초대 코드와 멤버 구조를 설계했습니다.

여행 중 발생하는 주요 변경 사항을 WebSocket 기반으로 다른 사용자에게 전달할 수 있도록 실시간 협업 로직을 구현했습니다.

---

## AI-powered Travel Experience

두 가지 AI 기능을 서비스 흐름에 연결했습니다.

### Receipt OCR

영수증 사진에서 지출 정보를 추출해 반복적인 수기 입력을 줄였습니다.


**Gemini 2.5 Flash**를 활용해 영수증 이미지에서 필요한 정보를 구조화된 형태로 추출했습니다.

특히

> **AI가 추출한 결과를 사용자가 확인하고 수정한 뒤에만 실제 지출로 저장**

하도록 흐름을 설계했습니다.

OCR 결과 화면에서 추출된 값을 editable field로 보여주고, 사용자가 확인한 값만 최종 expense로 저장했습니다.

AI가 반복 입력을 줄이되 최종 판단까지 대신하지 않도록 설계했습니다.


### AI Trip Report

여행이 끝난 뒤 축적된 지출과 경로 데이터를 활용해 여행을 요약하고 다음 여행지를 추천하는 LLM 기반 리포트를 생성했습니다.

---


# 4. Database Design

여행의 여러 기능이 하나의 데이터 흐름으로 연결될 수 있도록 PostgreSQL 기반 관계형 데이터 구조를 설계하고 구현했습니다.

핵심 entity는 다음과 같습니다.

- USERS
- TRIPS
- TRIP_MEMBERS
- BUDGETS
- EXPENSES
- EXPENSE_SPLITS
- RECEIPTS
- ROUTES
- ROUTE_PLACES
- TRIP_REPORTS
- INVITATIONS

관계의 중심에는 `TRIPS`를 두었습니다.

User  
→ Trip  
→ Members  
→ Budget  
→ Expenses  
→ Receipt / Expense Splits  
→ Routes / Route Places  
→ Trip Report

여행 중 생성되는 정보가 하나의 Trip을 중심으로 연결되도록 설계했습니다.

---

# 5. Personal & Shared Expense Logic

여행 지출은 개인 지출과 공동 지출을 구분했습니다.

## Personal Expense

개인에게 귀속되는 지출로 관리합니다.

## Shared Expense

여행 멤버가 함께 부담하는 지출로 관리합니다.

공동 지출은 `EXPENSE_SPLITS`를 통해 여행 멤버별 정산 금액과 연결했습니다.

사용자는 정산할 공동 지출을 선택하고, 선택된 지출의 총액과 멤버별 부담 금액을 확인할 수 있도록 구현했습니다.

---

# 6. Budget Logic

여행 전에 전체 예산을 설정하고 다음 여섯 개 카테고리로 나누어 관리할 수 있도록 구현했습니다.

- Transportation
- Lodging
- Food
- Sightseeing
- Shopping
- Other

각 카테고리의 지출을 독립적으로 예산과 비교해 현재 사용 수준을 보여주도록 했습니다.

이를 통해 단순히 전체 여행비만 확인하는 것이 아니라,

> **어떤 항목에서 예산을 많이 사용하고 있는지**

여행 중 바로 확인할 수 있도록 했습니다.

---

# 7. Real-time Collaboration

여러 명이 함께 사용하는 여행 서비스에서는 한 사용자의 변경 사항이 다른 사용자에게 즉시 반영되어야 했습니다.

이를 위해 WebSocket 기반의 실시간 동기화 구조를 구현했습니다.

User Action  
→ Backend Business Logic  
→ State Change  
→ WebSocket Broadcast  
→ Other Trip Members

여행별 active connection을 관리하고, 변경 사항을 해당 여행에 참여한 사용자에게 전달하도록 구성했습니다.

WebSocket 기능 자체와 API 연결 전 단계까지 구현했으며, REST API endpoint 구현 자체는 담당하지 않았습니다.

---

# 8. AI Trip Report

여행이 끝난 뒤 지출과 경로 데이터가 단순 기록으로 남는 대신 다음 여행에도 활용되도록 했습니다.

**gpt-4o-mini**를 활용해 여행 데이터를 기반으로 리포트를 생성했습니다.

리포트에는 다음 정보가 포함됩니다.

- Trip Summary
- Spending Analysis
- Trip Vibe
- Highlight Places
- Next Travel Style
- Destination Recommendations

Trip Data  
→ Expenses + Budget + Routes  
→ Aggregate  
→ LLM  
→ Trip Report  
→ Next Destination Recommendations

하나의 여행에서 생성된 데이터를 여행 종료 후에도 다시 활용할 수 있도록 설계했습니다.

---

# 9. System Architecture

전체 시스템은 다음 기술을 중심으로 구성했습니다.

Frontend  
→ React + Vite  
→ CesiumJS  
→ Google Maps  

Backend  
→ FastAPI  
→ Business Logic  
→ WebSocket  

Database  
→ PostgreSQL  

AI / External Services  
→ Gemini 2.5 Flash — Receipt OCR  
→ gpt-4o-mini — Trip Report  
→ Google OAuth  
→ Google Maps API  
→ Exchange Rate API

---

# 10. My Contribution

팀 프로젝트에서 **프론트엔드와 백엔드의 주요 비즈니스 로직, 데이터베이스, AI 기능을 중심으로 구현**했습니다.

REST API endpoint 구현 자체는 담당하지 않았으며, 서비스 기능이 실제로 동작하기 위한 데이터 구조와 비즈니스 로직을 담당했습니다.

## Database

- PostgreSQL 기반 ERD 설계 및 구현
- 여행·멤버·예산·지출·영수증·경로·리포트 데이터 구조 설계
- 테이블 관계 및 데이터 흐름 구현

## Business Logic

- 프론트엔드 주요 비즈니스 로직 구현
- 백엔드 주요 비즈니스 로직 구현
- 개인 / 공동 지출 처리 로직
- 공동 지출 정산 구조
- 카테고리별 예산 관리
- 지출과 예산 연결 로직

## OCR

- Gemini 2.5 Flash 기반 영수증 OCR 기능 구현
- OCR 결과 구조화
- OCR 결과 → 사용자 검토 → 지출 확정 흐름 구현
- 잘못된 AI 출력이 바로 지출 데이터로 저장되지 않도록 검수 구조 설계
- Expense category 수동 선택 구조 구현

## AI Report

- 여행 데이터 aggregation
- gpt-4o-mini 기반 여행 리포트 생성 로직
- 지출·경로 데이터를 활용한 여행 요약
- 다음 여행지 추천 흐름 구현

## Real-time Collaboration

- WebSocket 기반 실시간 동기화 로직 구현
- 여행 단위 connection 관리
- 사용자 변경 사항 broadcast 구조 구현



---



# 11. Result

여행의 준비부터 진행, 종료 후 회고까지 하나의 서비스에서 이어지는 End-to-End 여행 관리 서비스를 구현했습니다.

## Implemented Features

- 여행 생성 및 멤버 초대
- 개인 / 공동 지출 관리
- 예산 및 카테고리별 지출 관리
- 영수증 OCR
- 여행 경로 관리
- 실시간 협업
- AI 여행 리포트
- 다음 여행지 추천
- 2D / 3D 여행 시각화



---

# 12. What I Learned

처음에는 여러 여행 서비스를 하나로 합치면 사용자의 불편을 줄일 수 있다고 생각했습니다.

하지만 실제로 서비스를 구현하면서 중요한 것은 기능의 개수가 아니라 **각 기능에서 만들어진 데이터가 다음 기능으로 자연스럽게 이어지는 구조**라는 것을 배웠습니다.

특히 OCR을 구현하면서 AI가 결과를 생성할 수 있다고 해서 그 결과를 바로 시스템의 데이터로 사용해야 하는 것은 아니라는 점을 경험했습니다.

> **AI가 잘하는 반복 작업은 줄이되, 신뢰하기 어려운 판단은 사용자가 확인할 수 있도록 남겨두었습니다.**

이를 통해 AI 기능을 추가하는 것보다 서비스 전체 흐름 안에서 AI가 어디까지 자동화하고 어디에서 사용자 판단을 남겨야 하는지를 함께 설계하는 것이 중요하다는 것을 배웠습니다.

---

# 13. Tech Stack

## Frontend

`React` `Vite` `CesiumJS` `Google Maps`

## Backend

`Python` `FastAPI` `WebSocket`

## Database

`PostgreSQL` `SQLAlchemy`

## AI

`Gemini 2.5 Flash` `gpt-4o-mini`

## External Services

`Google OAuth` `Google Maps API` `Exchange Rate API`

---

# 17. Portfolio Card

## Question

> 여행할 때 쓰는 기능들, 그냥 하나로 합치면 안 되나?

## Description

일정·경로·예산·지출을 하나로 연결하고, 영수증 OCR과 AI 여행 리포트를 결합한 통합 여행 관리 웹서비스를 구현했습니다. PostgreSQL 기반 데이터 구조와 frontend/backend 비즈니스 로직을 담당하고, AI 결과를 사용자가 검토한 뒤 실제 데이터로 확정하는 구조를 설계했습니다.

## Highlights

- 여행 전·중·후를 연결한 End-to-End 서비스
- PostgreSQL 기반 데이터 구조 및 비즈니스 로직 구현
- Gemini 기반 Receipt OCR + Human Verification
- 개인·공동 지출 및 예산 관리
- WebSocket 기반 실시간 협업
- 여행 데이터 기반 LLM Report

## Metrics

- **End-to-End Web Service**
- **Receipt OCR + Human Verification**
- **Real-time Collaboration**
- **Capstone Design A+**

## Tags

`Full-Stack` `PostgreSQL` `OCR` `LLM` `WebSocket` `React`