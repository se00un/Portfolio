# 한류 콘텐츠 관심도와 소비재 수출 분석 — Hallyu Spillover Analysis

## Meta

- **Project Title:** 한류 콘텐츠 관심도와 소비재 수출의 관계 분석
- **Category:** Data Analytics / Econometrics / Time Series
- **Type:** Individual Project
- **Domain:** Content / Global Market
- **Role:** End-to-End
- **Data:** Google Trends / 수출 데이터
- **Scope:** 5 Countries × 3 Product Categories × 48 Months
- **Status:** Other Project
- **GitHub:** TBD

---

## Question

> **한국 콘텐츠를 보고 사고 싶어진 제품, 실제 소비에도 영향을 줄까?**

---

## Summary

한국 드라마를 보다가 등장인물의 옷이나 제품을 보고 직접 구매하고 싶다는 생각이 들면서 시작한 개인 프로젝트입니다.

> 콘텐츠에 대한 관심이 실제 한국 상품 소비에도 영향을 줄까?

이를 확인하기 위해 5개 국가의 Google Trends 콘텐츠 관심도와 소비재 수출 데이터를 수집해 **48개월의 시계열 데이터**를 구성했습니다.

단순 상관관계만 확인하지 않고 Fixed Effects와 lag variable을 활용해 콘텐츠 관심도의 변화가 이후 수출 변화와 연결되는지 분석했습니다. 추가로 VAR·Impulse Response Function·Granger Causality를 활용해 시간적 관계를 확인하고, 주요 콘텐츠 공개 시점을 기준으로 Event Study / Difference-in-Differences 분석도 진행했습니다.

일부 콘텐츠 공개 전후 특정 국가·품목에서 수출 패턴의 변화가 나타났지만, **콘텐츠 관심이 지속적인 수출 증가로 이어진다는 일관된 관계는 확인되지 않았습니다.**

---

# 1. Starting Point

한국 드라마를 보다가 등장인물이 입고 있는 옷을 보며 생각했습니다.

> “저 옷 예쁘다. 사고 싶다.”

그리고 바로 다음 질문이 생겼습니다.

> **“어? 이런 관심이 실제 소비에도 차이를 만들까?”**

K-콘텐츠의 글로벌 인기가 높아지면서 콘텐츠가 한국 제품의 소비로도 이어진다는 이야기는 자주 등장합니다.

하지만 콘텐츠에 대한 관심이 높아지는 것과 실제 상품의 소비가 증가하는 것은 다른 문제입니다.

그래서 이 관계를 실제 데이터로 확인해보기로 했습니다.

---

# 2. Research Question

프로젝트에서는 크게 다음 관계를 확인했습니다.

Content Interest  
→ Consumer Interest  
→ Export Change

콘텐츠에 대한 관심이 증가한 뒤 한국 소비재의 수출에도 변화가 나타나는지를 국가와 품목별로 분석했습니다.

단순히

> 콘텐츠 관심도가 높은 국가에서 수출도 높은가?

를 확인하는 것이 아니라,

> **콘텐츠 관심도의 변화 이후 수출이 어떻게 움직이는가?**

에 초점을 맞췄습니다.

---

# 3. Data

분석을 위해 콘텐츠 관심도와 실제 수출 데이터를 결합했습니다.

## Content Interest

Google Trends 데이터를 활용해 국가별 한국 콘텐츠 관심도의 변화를 구성했습니다.

## Export

소비재 수출 데이터를 활용해 국가·품목별 수출 변화를 확인했습니다.

## Analysis Scope

- **5 Countries**
- **3 Product Categories**
- **48 Months**

국가 × 품목 × 월 단위로 데이터를 구성해 콘텐츠 관심도와 수출의 시간적 관계를 분석했습니다.

---

# 4. Why Correlation Was Not Enough

처음 확인할 수 있는 가장 간단한 방법은 콘텐츠 관심도와 수출액의 상관관계를 계산하는 것입니다.

하지만 두 값이 함께 증가한다고 해서

> 콘텐츠 관심이 증가했기 때문에 수출이 증가했다

고 말할 수는 없습니다.

국가마다 기본적인 시장 규모가 다르고, 환율·경기·계절성 등 시간에 따라 변하는 요인도 존재합니다.

또한 콘텐츠에 관심을 가진 시점과 실제 상품을 구매하는 시점 사이에는 시간차가 있을 수 있습니다.

따라서 단순 상관분석을 넘어 여러 방법을 단계적으로 적용했습니다.

---

# 5. Fixed Effects + Lag Analysis

먼저 국가와 시점에 따른 차이를 고려하면서 콘텐츠 관심도와 수출의 관계를 확인하기 위해 Fixed Effects 기반 분석을 진행했습니다.

또한 콘텐츠 관심이 즉시 소비로 연결되지 않을 가능성을 고려해 **lag variable**을 추가했습니다.

Content Interest at t  
→ Export at t

Content Interest at t-1  
→ Export at t

Content Interest at t-2  
→ Export at t

이를 통해 콘텐츠 관심도의 변화가 일정 시간이 지난 뒤 수출과 연결되는지도 확인했습니다.

---

# 6. Time-Series Analysis

콘텐츠 관심도와 수출은 모두 시간에 따라 변화하는 데이터이기 때문에 두 변수 사이의 동적인 관계도 분석했습니다.

## VAR

Vector Autoregression을 활용해 콘텐츠 관심도와 수출이 서로의 과거 값과 어떤 관계를 가지는지 확인했습니다.

## Impulse Response Function

콘텐츠 관심도에 변화가 발생했을 때 이후 수출이 시간에 따라 어떻게 반응하는지 확인했습니다.

Content Interest Shock  
→ Export Response over Time

이를 통해 특정 시점의 변화만 보는 것이 아니라 **충격 이후 반응의 방향과 지속기간**을 살펴봤습니다.

---

# 7. Granger Causality

단순히 두 시계열이 함께 움직이는지를 넘어,

> 콘텐츠 관심도의 과거 값이 수출의 미래 값을 설명하는 데 추가적인 정보를 제공하는가?

를 확인하기 위해 Granger Causality Test를 적용했습니다.

이는 인과관계를 직접 증명하는 분석은 아니지만, 두 시계열 사이의 **선행 관계를 탐색하는 방법**으로 활용했습니다.

따라서 결과 역시 실제 인과관계라고 확대 해석하지 않고 시간적 예측 관계의 근거로 해석했습니다.

---

# 8. From Continuous Trends to Content Events

월별 관심도와 수출의 관계를 분석한 뒤 다른 관점에서도 질문을 확인했습니다.

> **특정 콘텐츠가 공개된 시점 전후에는 수출 패턴이 달라질까?**

이를 확인하기 위해 주요 콘텐츠 공개 시점을 event로 설정하고 공개 전후의 수출 변화를 분석했습니다.

---

# 9. Event Study / Difference-in-Differences

콘텐츠 공개 시점을 기준으로 전후 변화를 비교했습니다.

Before Content Release  
→ Content Release  
→ After Content Release

Event Study와 Difference-in-Differences 접근을 활용해 콘텐츠 공개 전후 특정 국가·품목에서 수출 패턴에 변화가 나타나는지 확인했습니다.

일부 조건에서는 콘텐츠 공개 이후 변화가 관찰됐습니다.

하지만 국가와 품목에 따라 결과가 달랐고, 모든 콘텐츠와 시장에서 동일한 방향의 효과가 나타나지는 않았습니다.

---

# 10. Result

분석 결과 일부 콘텐츠 공개 전후 특정 국가와 품목에서는 수출 패턴의 변화가 나타났습니다.

하지만 전체 분석에서

> **콘텐츠에 대한 관심 증가가 지속적인 소비재 수출 증가로 이어진다는 일관된 관계**

는 확인하지 못했습니다.

즉,

Content Popularity ≠ Guaranteed Export Growth

였습니다.

콘텐츠 관심이 상품 소비로 연결될 가능성은 존재하지만 그 관계는 국가, 품목, 시점에 따라 달랐습니다.

따라서 한류 콘텐츠의 인기가 높아졌다는 사실만으로 특정 소비재의 지속적인 수출 증가를 설명하기는 어려웠습니다.



---

# 11. My Contribution

개인 프로젝트로 **문제 정의부터 데이터 구성, 분석 설계, 모델링, 결과 해석까지 전 과정을 직접 수행**했습니다.

## Problem Definition

- 한류 콘텐츠 관심과 소비재 수출의 관계를 research question으로 구체화
- 국가·품목·시간 단위 분석 구조 설계

## Data

- Google Trends 데이터 수집 및 정제
- 소비재 수출 데이터 수집 및 정제
- 국가 × 품목 × 월 단위 데이터 결합
- 5개국 × 3개 품목 × 48개월 분석 데이터 구성

## Econometric Analysis

- Fixed Effects 분석
- Lag variable 기반 시차 효과 분석
- 국가·품목별 결과 비교

## Time-Series Analysis

- VAR
- Impulse Response Function
- Granger Causality

## Event Analysis

- 주요 콘텐츠 공개 시점 정의
- 공개 전후 수출 변화 분석
- Event Study
- Difference-in-Differences

## Interpretation

- 분석 방법별 결과 비교
- 국가·품목별 차이 분석
- 통계적 결과의 해석 범위 검토
- 일관되지 않은 결과까지 포함해 최종 결론 도출

---

# 12. From Analysis to the Next Question

이 프로젝트에서는 48개월의 데이터를 수집해 한 번의 분석 결과를 만들었습니다.

하지만 프로젝트가 끝난 뒤 새로운 질문이 생겼습니다.

> **새로운 데이터가 계속 들어온다면, 이 분석도 계속 다시 사용할 수 있지 않을까?**

Google Trends와 수출 데이터는 서로 다른 주기로 계속 업데이트됩니다.

그렇다면 매번 데이터를 다시 내려받고 전처리하고 분석을 실행하는 대신,

Data Collection  
→ Validation  
→ Analysis  
→ Publication

과정을 자동화하면 하나의 지속적인 데이터 서비스로 만들 수 있다고 생각했습니다.

이 질문은 이후 **Market Analytics Service** 프로젝트로 이어졌습니다.

---

# 13. Connection to Market Analytics Service

Hallyu Spillover Analysis가

> **“콘텐츠 관심과 소비재 수출은 실제로 관계가 있을까?”**

를 확인한 분석 프로젝트였다면,

Market Analytics Service는

> **“이 분석을 새로운 데이터가 들어올 때마다 계속 사용할 수 있게 만들 수 없을까?”**

라는 다음 질문에서 시작했습니다.

즉, 동일한 외부 데이터를 대상으로

One-time Analysis  
→ Repeatable Data Pipeline  
→ Data Quality Validation  
→ Publication Gate  
→ Analytics Dashboard

로 확장했습니다.

이를 통해 한 번의 분석 결과를 만드는 것에서 나아가 **분석이 지속적으로 사용될 수 있는 데이터 제품의 구조**까지 구현했습니다.

---

# 14. What I Learned

처음에는 콘텐츠의 글로벌 인기가 실제 소비 증가로 이어지는지를 확인하고 싶었습니다.

하지만 분석을 진행하면서 관심도와 소비의 관계는 생각보다 단순하지 않았습니다.

일부 이벤트에서는 변화가 나타났지만 국가와 품목에 따라 결과가 달랐고, 지속적인 관계는 명확하지 않았습니다.

이를 통해 분석의 목적은 처음 세운 가설을 증명하는 것이 아니라 **여러 방법으로 가설을 검증하고 데이터가 실제로 말할 수 있는 범위까지 결론을 내리는 것**이라고 배웠습니다.

또 하나의 질문도 남았습니다.

분석을 한 번 수행하는 것과 그 분석을 실제로 반복해서 활용할 수 있게 만드는 것은 다른 문제였습니다.

> **한 번 답을 찾은 뒤, 그 답을 계속 사용할 수 있는 구조까지 만들 수 있을까?**

이 질문이 이후 Market Analytics Service를 구축하는 출발점이 되었습니다.

---

# 15. Tech Stack

## Language

`Python`

## Data Analysis

`Pandas` `NumPy`

## Statistical Analysis

`Fixed Effects` `Lag Analysis`

## Time Series

`VAR` `Impulse Response Function` `Granger Causality`

## Causal / Event Analysis

`Event Study` `Difference-in-Differences`

## Data Sources

`Google Trends` `Export Data`

---

# 16. Portfolio Card

## Question

> **한국 콘텐츠를 보고 사고 싶어진 제품, 실제 소비에도 영향을 줄까?**

## Description

한국 콘텐츠에 대한 관심이 실제 소비재 수출과 연결되는지 확인하기 위해 5개국 × 3개 품목 × 48개월 데이터를 분석했습니다. Fixed Effects·lag analysis부터 VAR·IRF·Granger Causality, Event Study·DiD까지 단계적으로 적용해 관계의 방향과 지속성을 검증했습니다.

## Highlights

- 5개국 × 3개 품목 × 48개월 분석
- Google Trends + 수출 데이터 결합
- Fixed Effects + lag analysis
- VAR / IRF / Granger Causality
- Event Study / Difference-in-Differences
- 가설과 다른 결과까지 포함한 분석 범위 설정
- 이후 Market Analytics Service로 확장

## Result

일부 콘텐츠 공개 전후 특정 국가·품목에서 수출 패턴의 변화가 나타났지만, **콘텐츠 관심 증가가 지속적인 수출 증가로 이어지는 일관된 관계는 확인되지 않았습니다.**

## Tags

`Data Analytics` `Econometrics` `Time Series` `Causal Analysis` `Content Analytics` `Global Market`