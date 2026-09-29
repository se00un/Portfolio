# 아동 미디어 이용 유형 분석 — Child Media Usage Analytics

## Meta

- **Project Title:** 쪼꼬미디어
- **Category:** Data Analytics / XAI / AI Service
- Period: 2025.05 - 2025.07
- **Type:** Team Project / Public Data Competition
- **Domain:** Child Media Usage
- **Role:** Data Analysis / Modeling / XAI / LLM Explanation
- **Status:** Featured Candidate
- **Award:** 제1회 방송통신위원회 공공데이터 분석·활용 공모전 최우수상
- **GitHub:** https://github.com/se00un/25-1-URP-KCC
- **Demo:** TBD

---

## Question

> 우리 아이의 미디어 이용, 많고 적다는 걸 무엇과 비교해야 할까?

---

## Summary

아이의 스마트폰·태블릿 이용시간을 확인할 수는 있지만, 그 수치만으로 이용 습관이 적절한지 판단하기 어렵다는 문제에서 시작했습니다.

아동의 미디어 이용을 단순한 총 사용시간이 아니라 **이용시간·빈도·시작시기·콘텐츠 편중도**를 함께 고려해 분석하고, 비슷한 연령대의 이용 패턴과 비교할 수 있는 보호자용 서비스를 설계했습니다.

연령대별 이용 패턴을 군집화하고, Random Forest surrogate model과 Permutation Importance·SHAP을 활용해 각 아동이 특정 이용 유형에 속하는 이유를 분석했습니다. 분석 결과는 LLM을 통해 보호자가 이해하기 쉬운 자연어 설명으로 변환하고 Streamlit 기반 웹서비스로 구현했습니다.

---

# 1. Problem

아이의 미디어 이용시간이 늘어나면서 보호자는 자연스럽게 질문하게 됩니다.

> 우리 아이가 미디어를 너무 많이 사용하는 건 아닐까?

하지만 단순히 하루에 몇 시간을 사용하는지만으로 이를 판단하기는 어렵습니다.

같은 이용시간이라도

- 하루에 얼마나 자주 사용하는지
- 언제부터 미디어를 사용하기 시작했는지
- 특정 콘텐츠에 이용이 집중되어 있는지
- 비슷한 연령대의 아이들은 어떻게 사용하는지

에 따라 이용 패턴은 달라질 수 있습니다.

보호자는 인터넷 검색이나 커뮤니티의 경험담을 참고할 수 있지만, **우리 아이와 비슷한 또래의 실제 미디어 이용 데이터를 기준으로 비교할 수 있는 정보는 부족했습니다.**

그래서 단순히 사용시간을 보여주는 것이 아니라,

> **우리 아이의 미디어 이용, 많고 적다는 걸 무엇과 비교해야 할까?**

라는 질문에서 분석을 시작했습니다.

---

# 2. Product Goal

쪼꼬미디어는 아동의 미디어 이용을 하나의 숫자로 평가하는 서비스가 아니라,

**아이의 이용 패턴을 비슷한 연령대의 데이터와 비교하고, 그 결과를 보호자가 이해할 수 있도록 설명하는 서비스**

를 목표로 했습니다.

전체 흐름은 다음과 같습니다.

Public Media Data  
→ Usage Feature Engineering  
→ Age-specific Clustering  
→ Usage Pattern  
→ Explainable AI  
→ LLM Explanation  
→ Parent-facing Web Service

분석 결과를 만드는 것에서 끝내지 않고 실제 보호자가 자신의 아이 정보를 입력하고 결과를 확인할 수 있는 웹서비스까지 구현했습니다.

---

# 3. Data

아동 미디어 이용과 관련된 여러 공공데이터를 결합했습니다.

주요 데이터는 다음과 같습니다.

- 방송통신위원회 아동 미디어 관련 데이터
- 아동·청소년 미디어 이용 관련 조사 데이터
- 지역별 미디어 관련 활동 데이터

아동의 미디어 이용을 단순 사용시간만으로 정의하지 않고 다양한 행동 특성을 반영할 수 있도록 변수를 구성했습니다.

---

# 4. Feature Engineering

아동의 미디어 이용 패턴을 설명하기 위해 다음과 같은 핵심 특성을 활용했습니다.

## Total Usage Time

평일과 주말의 전체 미디어 이용시간을 반영했습니다.

단순히 특정 매체의 사용량만 보는 것이 아니라 아이가 하루 동안 미디어에 얼마나 많은 시간을 사용하는지 확인했습니다.

---

## Usage Frequency

미디어를 얼마나 자주 이용하는지를 반영했습니다.

같은 총 사용시간이라도 한 번에 길게 사용하는 경우와 하루 동안 반복적으로 사용하는 경우는 다른 이용 패턴으로 볼 수 있습니다.

---

## Starting Age / Timing

미디어 이용을 시작한 시점과 이용 경험을 반영했습니다.

현재 사용량뿐 아니라 아이가 미디어를 접해온 과정도 이용 유형을 구분하는 특성으로 활용했습니다.

---

## Media Concentration — HHI

아이의 미디어 이용이 특정 콘텐츠나 매체에 얼마나 집중되어 있는지를 나타내기 위해 **HHI(Herfindahl-Hirschman Index)**를 활용했습니다.

HHI가 높을수록 특정 미디어에 이용이 집중되어 있고, 낮을수록 여러 미디어에 이용이 분산되어 있음을 의미합니다.

이를 통해 단순한 이용시간뿐 아니라

> **얼마나 다양한 방식으로 미디어를 이용하는가**

까지 패턴에 반영했습니다.

---

# 5. Age-specific Clustering

아동의 미디어 이용 특성은 연령에 따라 크게 달라질 수 있기 때문에 모든 아동을 하나의 기준으로 비교하지 않았습니다.

연령대를 다음과 같이 나누었습니다.

- 3–5세
- 6–8세
- 9–11세

각 연령대에서 별도로 이용 패턴을 분석하고 **3개의 이용 유형(cluster)**으로 구분했습니다.

Age Group  
→ Usage Features  
→ Clustering  
→ 3 Usage Patterns

이를 통해 어린 연령대의 아이를 고연령 아동과 동일한 기준으로 비교하는 문제를 줄이고,

> **비슷한 발달 단계의 또래 안에서 어떤 이용 패턴을 보이는지**

확인할 수 있도록 했습니다.

---

# 6. From Cluster to Explanation

군집화만으로는 보호자에게 충분한 정보를 제공하기 어렵습니다.

예를 들어,

> “우리 아이는 Cluster 2입니다.”

라는 결과만 보여줘서는 왜 해당 유형으로 분류되었는지 알 수 없습니다.

따라서 다음 질문으로 넘어갔습니다.

> **왜 우리 아이가 이 유형에 속했는지 설명할 수 있을까?**

이를 위해 clustering 결과를 다시 학습하는 **Random Forest surrogate model**을 구축했습니다.

Clustering Result  
→ Random Forest Surrogate  
→ Feature Importance  
→ SHAP  
→ Individual Explanation

---

# 7. Why a Surrogate Model?

Clustering은 이용 유형을 발견하는 데는 유용하지만 개별 사용자가 왜 특정 cluster에 배정되었는지를 직관적으로 설명하기 어렵습니다.

따라서 cluster label을 target으로 하는 Random Forest classifier를 별도로 학습했습니다.

이 모델의 목적은 새로운 분류 문제를 만드는 것이 아니라,

> **군집화 결과를 얼마나 잘 재현하면서 그 판단 구조를 설명할 수 있는지**

확인하는 것이었습니다.

Surrogate model의 검증 결과는 다음과 같습니다.

- **Accuracy: 97.46%**
- **F1 Macro: 0.9822**
- **F1 Weighted: 0.9746**

이 수치는 clustering 자체의 정확도가 아니라 **Random Forest surrogate model이 기존 cluster label을 재현한 성능**입니다.

---

# 8. Explainable AI

Surrogate model을 기반으로 두 가지 방법을 사용해 이용 유형을 설명했습니다.

## Permutation Importance

전체적으로 어떤 변수가 cluster를 구분하는 데 중요한 역할을 하는지 확인했습니다.

이를 통해 각 연령대의 이용 유형을 나누는 주요 요인을 분석했습니다.

---

## SHAP

개별 아동의 결과를 설명하기 위해 SHAP을 활용했습니다.

단순히

> “사용시간이 중요합니다.”

라고 설명하는 것이 아니라,

특정 아동의

- 이용시간
- 이용빈도
- 시작시기
- 콘텐츠 편중도

중 어떤 특성이 해당 cluster에 속하는 데 영향을 주었는지 확인할 수 있도록 했습니다.

---

# 9. From XAI to Parent-friendly Explanation

SHAP 값이나 feature importance는 분석가에게는 유용하지만 일반 보호자가 그대로 이해하기에는 어렵습니다.

따라서 분석 결과를 그대로 노출하지 않고 **LLM을 활용해 자연어 설명으로 변환**했습니다.

Data  
→ Cluster  
→ Surrogate Model  
→ SHAP  
→ Structured Analysis Result  
→ LLM  
→ Parent-friendly Explanation

LLM이 임의로 아이의 이용 상태를 판단하도록 하는 것이 아니라,

**분석 모델에서 계산된 결과를 사용자가 이해하기 쉬운 언어로 설명하는 역할**을 맡도록 했습니다.

---

# 10. Key Decision — AI Explains the Analysis


아동의 이용 유형과 주요 영향 요인은 데이터 분석과 모델을 통해 먼저 계산했습니다.

LLM은 이 결과를 바탕으로 보호자가 읽을 수 있는 설명을 생성했습니다.

즉,

Analysis / Model  
→ Determine the Result

LLM  
→ Explain the Result

로 역할을 분리했습니다.

> **LLM이 분석 결과를 만드는 것이 아니라, 분석 결과를 이해할 수 있게 전달하도록 설계했습니다.**

이를 통해 분석 과정과 사용자에게 전달되는 설명을 분리했습니다.

---

# 11. Web Service

분석 결과를 보고서로 끝내지 않고 보호자가 직접 사용할 수 있는 **Streamlit 기반 웹서비스**로 구현했습니다.

사용자는 아이의 미디어 이용 정보를 입력하고 자신의 아이가 어떤 이용 유형에 가까운지 확인할 수 있습니다.

서비스에서는 다음 정보를 제공합니다.

## Self Assessment

아이의 미디어 이용 정보를 입력합니다.

## Usage Pattern

비슷한 연령대에서 아이가 어떤 미디어 이용 패턴에 해당하는지 확인합니다.

## Peer Comparison

또래 아동의 이용 데이터와 비교해 현재 이용 패턴을 확인합니다.

## Explainable Report

SHAP 기반 주요 요인을 LLM이 자연어로 설명합니다.

## Local Activities

미디어 이용 외에 활용할 수 있는 지역 활동 정보도 함께 제공합니다.

---


# 12. My Contribution

팀 프로젝트에서 **데이터 분석과 모델링을 중심으로 담당**했습니다.

수집된 데이터를 이용해 아동의 미디어 이용 패턴을 정의하고 분석 결과를 서비스에서 활용할 수 있는 형태로 만드는 과정을 담당했습니다.

## Data Analysis

- 아동 미디어 이용 데이터 EDA
- 미디어 이용 특성 정의
- 이용시간·빈도·시작시기 기반 feature 구성
- HHI 기반 미디어 이용 편중도 계산
- 연령대별 이용 특성 분석

## Modeling

- 연령대별 clustering
- 이용 패턴 유형 분석
- Random Forest surrogate model 구축
- Surrogate model 성능 검증

## Explainable AI

- Permutation Importance 분석
- SHAP 기반 개별 결과 해석
- 이용 유형별 주요 영향 요인 분석

## LLM Integration

- XAI 결과를 LLM 입력으로 구조화
- 분석 결과 기반 자연어 설명 생성
- LLM이 분석을 대체하지 않고 설명에 활용되도록 흐름 설계

---

# 13. Result

아동의 미디어 이용을 단순 사용시간이 아니라 여러 행동 특성을 결합한 패턴으로 분석하고, 이를 보호자가 이해할 수 있는 웹서비스로 구현했습니다.

## Model Validation

Random Forest surrogate model:

- **Accuracy: 97.46%**
- **F1 Macro: 0.9822**
- **F1 Weighted: 0.9746**

※ 해당 수치는 clustering accuracy가 아니라 surrogate model이 cluster label을 재현한 성능입니다.

## Service

- 연령대별 이용 패턴 분석
- 또래 비교
- XAI 기반 개인별 결과 설명
- LLM 기반 자연어 리포트
- Streamlit 웹서비스 구현

## Award

- **방송통신위원회 공공데이터 분석·활용 공모전 최우수상**

---

# 14. What I Learned

처음에는 아동의 미디어 이용을 분석하면 보호자가 판단에 활용할 수 있는 기준을 제공할 수 있다고 생각했습니다.

하지만 분석 결과가 정확하더라도 사용자가 그 결과를 이해하지 못하면 실제 판단에는 활용하기 어렵다는 것을 경험했습니다.

Cluster를 만드는 것에서 끝내지 않고 surrogate model과 SHAP을 활용해 결과의 근거를 찾고, 다시 LLM을 통해 보호자가 이해할 수 있는 설명으로 변환했습니다.

> **좋은 분석은 결과를 만드는 데서 끝나는 것이 아니라, 사용자가 그 결과를 이해하고 판단에 활용할 수 있어야 한다고 배웠습니다.**

이 경험을 통해 모델의 성능뿐 아니라 **분석 결과를 누구에게 어떤 형태로 전달할 것인지까지 설계하는 것**이 데이터 기반 서비스를 만드는 과정의 일부라는 것을 배웠습니다.

---

# 15. Tech Stack

## Data Analysis

`Python` `Pandas` `NumPy`

## Machine Learning

`Clustering` `Random Forest`

## Explainable AI

`Permutation Importance` `SHAP`

## AI

`LLM`

## Web

`Streamlit`

## Methods

`HHI` `Feature Engineering` `Peer Comparison`

---

# 16. Portfolio Card

## Question

> **우리 아이의 미디어 이용, 많고 적다는 걸 무엇과 비교해야 할까?**

## Description

아동의 미디어 이용을 시간 하나로 판단하는 대신 이용시간·빈도·시작시기·콘텐츠 편중도를 함께 분석해 연령대별 이용 패턴을 도출했습니다. Random Forest surrogate와 SHAP으로 개인별 결과의 근거를 분석하고, 이를 LLM이 보호자가 이해하기 쉬운 설명으로 변환하는 웹서비스로 구현했습니다.

## Highlights

- 연령대별 아동 미디어 이용 패턴 분석
- HHI 기반 콘텐츠 이용 편중도 정량화
- Random Forest surrogate + SHAP 기반 결과 설명
- 분석 결과와 LLM의 역할 분리
- 보호자용 Streamlit 웹서비스 구현

## Metrics

- **Surrogate Accuracy 97.46%**
- **F1 Macro 0.9822**
- **F1 Weighted 0.9746**
- **공공데이터 분석·활용 공모전 최우수상**

## Tags

`Data Analytics` `Clustering` `XAI` `SHAP` `LLM` `Streamlit`