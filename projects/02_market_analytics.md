# Market Analytics Service

## Meta

- Title: Market Analytics Service
- Period: 2026.06 - 2026.08
- Category: Data Product / Data Engineering / Cloud
- Type: Individual Project
- Role: End-to-End
- Status: Featured
- GitHub: https://github.com/se00un/26-2-AWS
- Demo: TBD

---

## One-line Question

> 한 번의 분석 결과를 계속 활용할 수는 없을까?

---

## Summary

한류 콘텐츠에 대한 관심이 실제 소비재 수출과 어떤 관계가 있는지 분석한 개인 연구에서 출발해, 새로운 데이터가 들어올 때마다 수집·검증·분석·발행할 수 있는 AWS 기반 Market Analytics Service로 확장했습니다.

서로 갱신 주기가 다른 검색 관심도와 무역 데이터를 안정적으로 결합하기 위해 데이터의 최신성·완전성·유효성을 검증하고, 분석 가능한 데이터만 결과로 발행하는 Publish Gate를 설계했습니다.

일회성 분석을 반복 가능한 데이터 활용 구조로 발전시키며 데이터 수집부터 검증, 분석, 서비스 제공, 운영까지 전체 흐름을 구현했습니다.

---

# 1. Problem

## Starting Point

프로젝트의 출발점은 개인적인 궁금증이었습니다.

> 한류 콘텐츠에 대한 관심이 실제 한국 상품의 소비에도 영향을 줄까?

한국 드라마와 K-pop 등 한국 콘텐츠가 해외에서 큰 관심을 받는 것을 보면서, 이러한 관심이 실제 화장품·패션·식품 등의 소비로도 이어지는지 궁금했습니다.

이를 확인하기 위해 Google Trends와 수출 데이터를 직접 수집해 5개국의 콘텐츠 관심도와 소비재 수출 간의 관계를 분석했습니다.

---

## From Analysis to Product

분석을 완료한 뒤 새로운 문제가 보였습니다.

분석 결과를 다시 활용하려면 새로운 데이터가 공개될 때마다

데이터 수집  
→ 전처리  
→ 기준 기간 정렬  
→ 분석  
→ 결과 확인

과정을 다시 수행해야 했습니다.

여기서 두 번째 질문이 생겼습니다.

> **이 분석을 계속 활용하려면 새로운 데이터가 나올 때마다 매번 다시 수집하고 분석해야 할까?**

한 번의 분석 결과를 만드는 것보다, 새로운 데이터가 들어와도 같은 분석을 반복해서 사용할 수 있는 구조를 만드는 것이 필요하다고 판단했습니다.

이를 계기로 기존 분석을 AWS 기반 Market Analytics Service로 확장했습니다.

---

# 2. The Hidden Data Problem

서비스화를 진행하면서 단순 자동 수집만으로는 해결되지 않는 문제가 발생했습니다.

사용한 두 데이터는 서로 다른 주기로 갱신되었습니다.

### Search Interest
- 상대적으로 빠른 주기로 업데이트
- 콘텐츠에 대한 시장 관심도 파악

### Trade Statistics
- 월 단위 업데이트
- 실제 소비재 수출 변화 파악

따라서 같은 시점에 데이터를 요청해도 두 데이터가 가리키는 최신 기준 기간이 달라질 수 있었습니다.

---

## API Success ≠ Data Readiness

더 큰 문제는 API 요청 자체가 성공했다고 해서 데이터가 분석 가능한 상태라는 보장이 없다는 점이었습니다.

일부 무역 데이터 API에서는 아직 해당 월의 데이터가 공개되지 않았더라도

`HTTP 200`
`resultCode = 00`

과 같이 정상 응답을 반환하면서 실제 데이터는 비어 있는 경우가 있었습니다.

API 성공 여부만 확인한다면,

> **아직 완성되지 않은 데이터를 최신 데이터로 판단해 분석 결과를 발행할 수 있었습니다.**

따라서 문제를 단순한 API 수집 성공 여부가 아니라

> **“이 데이터를 지금 분석 결과로 사용해도 되는가?”**

를 판단하는 문제로 다시 정의했습니다.

---

# 3. What I Built

새로운 데이터가 들어왔을 때 자동으로

**수집 → 검증 → 분석 가능 여부 판단 → 분석 → 발행 → 시각화**

까지 이어지는 Market Analytics Service를 구축했습니다.

### Pipeline

External Data Sources  
↓  
Scheduled Collection  
↓  
Raw Data Storage  
↓  
Data Validation  
↓  
Cross-source Readiness Check  
↓  
Publish Gate  
↓  
Market Analytics  
↓  
Result History  
↓  
Dashboard

---

# 4. Data Validation

데이터를 수집했다는 사실과 실제 분석에 사용할 수 있다는 사실을 분리했습니다.

각 데이터에 대해 다음 품질 기준을 검증했습니다.

### Freshness
> 필요한 기준 기간의 데이터가 실제로 존재하는가?

### Completeness
> 분석에 필요한 데이터가 빠짐없이 들어왔는가?

### Validity
> 값과 형식이 정의된 조건을 만족하는가?

### Uniqueness
> 중복 데이터가 존재하지 않는가?

검증 결과와 수집 이력을 별도로 기록해 데이터가 어떤 상태로 들어왔고 어떤 검증을 통과했는지 추적할 수 있도록 설계했습니다.

---

# 5. Cross-source Readiness

개별 데이터의 품질이 정상이어도 두 데이터를 함께 분석할 수 있다는 의미는 아닙니다.

검색 관심도 데이터와 무역 데이터의 최신 기준 기간이 다르면 동일한 기간을 기준으로 분석할 수 없기 때문입니다.

따라서

**Country × Product × Period**

단위로 두 데이터가 함께 분석 가능한 상태인지 판정하는 Readiness Logic을 설계했습니다.

### READY

두 데이터가 필요한 기준 기간을 만족하고 품질 검증을 통과한 경우

→ 새로운 분석 실행  
→ 새로운 결과 발행

### NOT READY

한쪽 데이터가 아직 공개되지 않았거나 품질 기준을 충족하지 못한 경우

→ 새로운 분석 및 발행 중단  
→ 마지막으로 검증된 결과 유지

---

# 6. Key Decision — Publish Gate

이 프로젝트의 핵심 설계는 **Publish Gate**입니다.

처음에는 새로운 데이터가 들어오면 바로 분석을 실행하고 결과를 업데이트하는 구조를 생각했습니다.

하지만 자동화된 시스템에서는

> **새로운 데이터가 있다는 것보다 그 데이터를 믿고 사용할 수 있는지가 더 중요했습니다.**

따라서 새로운 결과를 만드는 조건을 명시적으로 분리했습니다.

### Without Publish Gate

API Response  
→ Data Collection  
→ Analysis  
→ Publish

### With Publish Gate

API Response  
→ Data Collection  
→ Validation  
→ Readiness Check  
→ **Publish Gate**  
→ Analysis  
→ Publish

검증을 통과하지 못하면 새로운 결과를 생성하지 않고 마지막으로 검증된 결과를 유지하도록 설계했습니다.

---

# 7. System Architecture

AWS 환경에서 데이터 수집부터 서비스 제공까지 전체 lifecycle을 구현했습니다.

### Data Collection

**AWS Lambda**
- 외부 API 데이터 수집
- 데이터 처리 pipeline 실행

**Amazon EventBridge**
- 정기적인 데이터 수집 scheduling

### Storage

**Amazon S3**
- Raw data 저장
- 원천 데이터 보존

**Amazon RDS**
- 정제된 데이터
- 수집 이력
- 검증 결과
- 분석 결과
- 발행 이력 관리

### Backend

**FastAPI**
- 분석 결과 조회 API
- Dashboard와 데이터 연결

### Serving

**Amazon EC2**
- Backend / service deployment

### Monitoring

**Amazon CloudWatch**
- 실행 상태 및 운영 확인

---

# 8. Two Dashboards

서비스를 사용하는 사람과 운영하는 사람의 목적을 분리해 두 종류의 Dashboard를 구성했습니다.

## Market Analytics Dashboard

### Primary User
시장 및 비즈니스 분석 담당자

### Purpose
국가·제품별 시장 관심도와 무역 변화를 지속적으로 확인

### Provides
- 최신 검증 완료 분석 결과
- 국가별/제품별 변화
- 검색 관심도와 무역 지표
- 기간별 분석 결과

---

## Operations Dashboard

### Primary User
데이터 분석가 / 서비스 운영자

### Purpose
데이터가 정상적으로 수집되고 분석 가능한 상태인지 확인

### Provides
- Collection status
- Validation results
- Data readiness
- Failed validation
- Publish status
- Reprocessing information

사용자가 보는 분석 결과와 운영자가 확인해야 하는 데이터 상태를 분리했습니다.

---

# 9. Implementation Result

실제 AWS 환경에서 다음 pipeline이 동작하도록 구현했습니다.

**Collection  
→ Validation  
→ Decision  
→ Analytics  
→ Publish  
→ Dashboard**

### Implemented Scale

- **15 Data Segments**
- **15 Collection Batches**
- **900 Validation Checks**
- **85 Published Results**
- **5 AWS Services**

단순 architecture 설계에서 끝내지 않고 실제 데이터를 수집하고 failure case를 발생시키며 전체 pipeline이 의도한 방식으로 동작하는지 검증했습니다.

---


# 10. My Contribution

**End-to-End Individual Project**

### Problem Definition
- 기존 Hallyu Spillover 분석을 반복 가능한 서비스로 확장할 문제 정의
- 분석 사용자의 workflow와 데이터 갱신 문제 구체화

### Data Engineering
- 외부 데이터 수집 pipeline 설계
- Raw / processed data 구조 설계
- 데이터 수집 이력 관리
- Data Quality validation 설계

### Data Quality
- Freshness
- Completeness
- Validity
- Uniqueness
- Cross-source Readiness
- Publish Gate

### Backend
- FastAPI 기반 API 구현
- 분석 결과 제공 구조 구현

### Cloud / Infrastructure
- AWS S3
- AWS Lambda
- Amazon EventBridge
- Amazon RDS
- Amazon EC2
- Amazon CloudWatch

### Analytics / Product
- 기존 시장 분석 로직 서비스화
- Market Analytics Dashboard
- Operations Dashboard
- 결과 이력 및 발행 구조 설계

### Operation & Validation
- 실제 AWS 환경 배포
- 데이터 수집 및 검증 pipeline 실행
- 데이터 미공개 / validation failure case 검증
- 마지막 검증 결과 유지 logic 확인

---

# 11. Results

### System

- 15 Data Segments
- 15 Collection Batches
- 900 Validation Checks
- 85 Published Results
- End-to-End AWS Pipeline 구현

### Product

일회성 시장 분석을 새로운 데이터가 들어올 때마다 반복해서 사용할 수 있는 Market Analytics Service로 확장했습니다.

데이터가 새롭다는 이유만으로 결과를 업데이트하지 않고, 분석 가능한 상태인지 검증한 뒤 신뢰할 수 있는 결과만 사용자에게 제공하도록 설계했습니다.

---

# 12. What I Learned

처음에는 분석을 자동화하면 기존 결과를 지속적으로 활용할 수 있을 것이라고 생각했습니다.

하지만 실제 서비스를 구축하면서 중요한 것은 단순히 **자동으로 새로운 데이터를 가져오는 것**이 아니라,

> **새로운 데이터를 언제 믿고 사용할 수 있는지를 시스템이 판단하는 것**

이라는 점을 배웠습니다.

이를 통해 데이터 분석 결과를 실제 의사결정에 지속적으로 활용하려면 분석 로직뿐 아니라 데이터 수집, 품질 검증, 상태 판단, 발행과 운영까지 함께 설계해야 한다는 것을 경험했습니다.

---

# 13. Tech Stack

### Language / Backend
`Python` `FastAPI`

### Cloud
`AWS S3` `AWS Lambda` `Amazon EventBridge` `Amazon RDS` `Amazon EC2` `Amazon CloudWatch`

### Data
`Pandas` `External APIs` `Data Quality Validation`

### Analytics
`Google Trends` `Trade Statistics`

---

# 14. Portfolio Card

## Question

> **한 번의 분석 결과를 계속 활용할 수는 없을까?**

## Description

한류 콘텐츠 관심도와 소비재 수출의 관계를 분석한 개인 연구를, 새로운 데이터가 들어올 때마다 자동으로 수집·검증·분석·발행하는 AWS 기반 Market Analytics Service로 확장했습니다.

서로 다른 주기로 갱신되는 데이터를 검증하고, 분석 가능한 데이터만 결과로 발행하는 Publish Gate를 설계했습니다.

## Highlights

- 일회성 데이터 분석 → 지속 가능한 Data Product로 확장
- 데이터 품질 기반 Cross-source Readiness 판단
- Publish Gate를 통한 신뢰 가능한 결과 발행
- AWS 기반 End-to-End pipeline 구현

## Metrics

- **15 Data Segments**
- **900 Validation Checks**
- **85 Published Results**
- **5 AWS Services**

## Tags

`Data Product` `AWS` `Data Engineering` `FastAPI` `Data Quality`

---

# 15. Assets for Portfolio

## Hero

**1순위:** Market Analytics Dashboard 화면

메인 카드에서는 AWS architecture보다 실제 사용자가 보는 제품 화면을 먼저 보여주는 것을 추천.

---

## Architecture

전체 pipeline architecture:

External APIs  
→ EventBridge  
→ Lambda  
→ S3 Raw Zone  
→ Validation / Readiness  
→ RDS  
→ Analytics  
→ Publish Gate  
→ FastAPI  
→ Dashboard

---

## Key Decision Visual

Publish Gate Before / After

**Before**

API Success → Analyze → Publish

**After**

API Success  
→ Validate  
→ Readiness Check  
→ Publish Gate  
→ Analyze  
→ Publish

---

## Supporting Visuals

- Market Analytics Dashboard
- Operations Dashboard
- Data Validation 결과
- AWS Architecture Diagram

---

## External Links

- `View Source on GitHub`