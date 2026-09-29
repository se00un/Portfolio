# 웹소설 흥행 요소 분석 — Web Novel Success Factor Analysis

## Meta

- **Project Title:** 웹소설 흥행 요소와 IP 분석
- **Category:** NLP / Data Analytics / Machine Learning
- Period: 2024.10 - 2024.12
- **Type:** Team Project
- **Domain:** Content / Web Novel
- **Role:** Data Preprocessing / NLP / Modeling / Evaluation
- **Dataset:** Naver Series Web Novels
- **Status:** Other Project
- **GitHub:** https://github.com/se00un/24-2-Webpredict

---

## Question

> **잘되는 웹소설에는 공통점이 있을까?**

---

## Summary

웹소설이 드라마·웹툰 등 다양한 콘텐츠의 원천 IP로 활용되는 것을 보며, **어떤 작품의 특성이 웹소설의 흥행과 연결되는지** 데이터로 확인한 프로젝트입니다.

네이버 시리즈 웹소설 데이터를 활용해 작품의 장르·연재 정보와 제목·소개글 같은 텍스트 특성을 함께 분석했습니다. 제목과 소개글은 KoBERT embedding으로 변환하고 PCA와 K-Means를 활용해 텍스트 유형을 구조화했습니다.

이후 평점 7.5 이상 여부를 target으로 Random Forest, Extra Trees, Gradient Boosting, XGBoost, LightGBM 등 여러 모델을 비교하고 약 **83% 수준의 분류 정확도**를 확인했습니다.

초기에는 흥행 작품의 IP 확장 가능성까지 분석하고자 했지만, 실제 웹툰·영상화 여부를 충분히 확보하지 못해 데이터가 뒷받침하는 범위인 **웹소설 자체의 흥행 특성 분석**에 집중했습니다.

---

# 1. Starting Point

웹소설은 더 이상 하나의 콘텐츠 형식으로만 소비되지 않습니다.

인기 웹소설이 웹툰, 드라마 등 다른 콘텐츠로 확장되는 사례를 보면서 궁금해졌습니다.

> **잘되는 웹소설에는 공통점이 있을까?**

작품의 장르나 연재량처럼 구조화된 정보뿐 아니라 제목과 소개글 같은 텍스트에도 흥행과 연결되는 특징이 있을 수 있다고 생각했습니다.

이에 실제 웹소설 데이터를 활용해 작품의 여러 특성과 평점의 관계를 분석했습니다.

---

# 2. Initial Goal

프로젝트의 초기 목표는 두 단계였습니다.

1. 웹소설의 흥행과 관련된 특성을 분석
2. 이를 바탕으로 다른 콘텐츠로 확장될 가능성이 높은 IP의 특성 탐색

하지만 분석 과정에서 두 번째 목표에는 중요한 데이터 제약이 있었습니다.

실제 웹툰화·드라마화 등 **IP 확장 여부를 충분한 규모의 label로 확보하지 못했습니다.**

따라서 확보하지 못한 target을 임의로 추정하지 않고 프로젝트의 범위를 조정했습니다.

> **실제로 확보한 데이터로 검증할 수 있는 웹소설 흥행 요소 분석에 집중했습니다.**

---

# 3. Data

네이버 시리즈의 인기 완결 웹소설 데이터를 기반으로 분석했습니다.

전체 수집 대상 약 **94,267개 작품** 중 약 **15,000개 작품 데이터**를 확보했고, 전처리 후 **13,079개 작품**을 분석에 활용했습니다.

작품별로 총 11개의 기본 정보를 수집했습니다.

이후 모델링에 필요한 파생 변수를 추가하고 텍스트 데이터를 별도로 처리했습니다.

---

# 4. Data Preprocessing

웹소설 데이터에는 구조화된 정보와 비정형 텍스트가 함께 존재했습니다.

따라서 두 종류의 정보를 각각 처리한 뒤 모델링 단계에서 함께 활용했습니다.

## Structured Features

작품의 기본 메타데이터를 정제하고 모델이 사용할 수 있는 변수로 변환했습니다.

추가적으로 다음과 같은 파생 특성을 구성했습니다.

- 성인 작품 여부
- 원작 여부
- 소개글 길이
- 회차 관련 변수

## Text Features

작품의

- 제목
- 소개글

에는 작품의 소재와 분위기 등 구조화된 변수만으로 표현하기 어려운 정보가 포함되어 있다고 판단했습니다.

단순한 단어 빈도만 사용하지 않고 문맥 정보를 반영하기 위해 KoBERT embedding을 활용했습니다.

---

# 5. Text Preprocessing

텍스트 분석 전 기본적인 한국어 전처리를 수행했습니다.

## Morphological Analysis

`Okt`를 활용해 명사를 중심으로 텍스트를 처리했습니다.

## Stopword Removal

분석에 의미가 적은 단어를 제거했습니다.

## Derived Text Features

소개글의 길이 등 텍스트 자체에서 얻을 수 있는 추가적인 특성도 변수로 활용했습니다.

---

# 6. KoBERT Embedding

제목과 소개글을 단순한 categorical variable로 처리하는 대신 **KoBERT embedding**을 활용했습니다.

각 텍스트를 **768-dimensional embedding vector**로 변환했습니다.

Text  
→ KoBERT  
→ 768-dimensional Embedding

하지만 768차원의 embedding을 그대로 모델에 사용하는 것은 차원이 크고 계산 측면에서도 부담이 있었습니다.

따라서 PCA를 적용했습니다.

---

# 7. PCA — Reducing the Embedding Space

KoBERT embedding에 PCA를 적용해 주요 정보를 유지하면서 차원을 축소했습니다.

누적 설명분산 **90% 이상**을 유지하는 것을 기준으로 최종 **228개 principal components**를 사용했습니다.

768-dimensional Embedding  
→ PCA  
→ 228 Components  
→ ≥ 90% Explained Variance

이를 통해 텍스트의 의미 정보를 최대한 유지하면서 모델링에 사용할 수 있는 형태로 변환했습니다.

---

# 8. Text Pattern Clustering

Embedding을 단순히 모델의 입력값으로 사용하는 것뿐 아니라 작품의 텍스트가 어떤 유형으로 나뉘는지도 확인했습니다.

K-Means clustering을 적용해 제목과 소개글의 패턴을 구분했습니다.

## Synopsis

- **10 clusters**

## Title

- **8 clusters**

KoBERT Embedding  
→ PCA  
→ K-Means  
→ Text Pattern Cluster

이를 통해 제목과 소개글을 개별 문장이 아닌 **유사한 의미적 특성을 가진 그룹**으로 구조화했습니다.

---

# 9. Defining Success

웹소설의 흥행을 분석하기 위해 모델이 예측할 target을 정의해야 했습니다.

프로젝트에서는 작품 평점을 기준으로

> **Rating ≥ 7.5**

를 높은 평점을 받은 작품으로 정의하고 binary classification 문제로 구성했습니다.

Rating ≥ 7.5  
→ Success Class

Rating < 7.5  
→ Other Class

이 target은 웹소설의 모든 형태의 상업적 성공을 의미하는 것이 아니라,

**확보한 데이터에서 작품의 높은 평점 여부를 분석하기 위한 operational definition**으로 사용했습니다.

---

# 10. Modeling

여러 머신러닝 모델을 비교해 높은 평점을 받은 작품을 구분할 수 있는지 확인했습니다.

사용한 모델은 다음과 같습니다.

- Random Forest
- Extra Trees
- Gradient Boosting
- XGBoost
- LightGBM

단일 모델 결과만 확인하지 않고 여러 tree-based model의 성능을 비교했습니다.

---

# 11. Model Evaluation

모델 평가 과정에서는 class distribution을 고려해 **Stratified K-Fold**를 활용했습니다.

또한 GridSearch를 통해 주요 hyperparameter를 조정했습니다.

Feature Engineering  
→ Train / Validation  
→ Stratified K-Fold  
→ GridSearch  
→ Model Comparison

실험 결과 여러 모델이 약 **83% 수준의 accuracy**를 기록했습니다.

결과표 기준 Random Forest의 accuracy는 **83.41%**였습니다.

---


# 12. My Contribution

팀 프로젝트에서 **데이터 수집과 최종 인사이트 분석을 제외한 데이터 처리·NLP·모델링 과정을 중심으로 담당**했습니다.

## Data Preprocessing

- 수집된 웹소설 데이터 전처리
- 결측치 및 분석 대상 정리
- 모델링용 변수 구성
- 파생 변수 생성

## NLP

- 한국어 텍스트 전처리
- Okt 기반 형태소 분석
- 불용어 처리
- 제목·소개글 KoBERT embedding 생성

## Dimensionality Reduction & Clustering

- KoBERT 768-dimensional embedding 처리
- PCA 기반 차원 축소
- 누적 설명분산 기준 component 선택
- K-Means 기반 제목·소개글 clustering

## Modeling

- 평점 7.5 기준 binary target 구성
- Random Forest
- Extra Trees
- Gradient Boosting
- XGBoost
- LightGBM
- 모델별 성능 비교

## Evaluation

- Stratified K-Fold 적용
- GridSearch 기반 hyperparameter tuning
- 모델별 classification performance 비교

## Scope Clarification

- Data crawling: 담당하지 않음
- Final insight analysis: 담당하지 않음
- Data preprocessing: 담당
- NLP / KoBERT: 담당
- PCA / Clustering: 담당
- Machine Learning Modeling: 담당
- Model Evaluation & Tuning: 담당

---

# 13. Result

구조화된 작품 정보와 KoBERT 기반 텍스트 정보를 함께 활용해 웹소설의 높은 평점 여부를 분석했습니다.

## Data

- 약 **94,267개 작품** 중 약 **15,000개 작품 수집**
- 전처리 후 **13,079개 작품 분석**

## NLP

- KoBERT **768-dimensional embedding**
- PCA → **228 dimensions**
- ≥ **90% cumulative explained variance**

## Clustering

- Synopsis: **10 clusters**
- Title: **8 clusters**

## Classification

- Rating ≥ 7.5 binary classification
- 여러 tree-based model 비교
- 약 **83% accuracy**
- 결과표 기준 Random Forest: **83.41%**

---

# 14. What I Learned

처음에는 흥행 작품의 특징을 찾고 이를 IP 확장 가능성까지 연결해보고 싶었습니다.

하지만 실제 데이터를 확인하면서 **분석하고 싶은 질문과 현재 데이터로 검증할 수 있는 질문은 다를 수 있다**는 것을 경험했습니다.

IP 확장 여부를 충분히 확보하지 못한 상태에서 모델의 결과를 확장 가능성으로 해석하기보다, 실제로 확보한 평점 데이터를 기준으로 문제를 다시 정의했습니다.

또한 제목과 소개글처럼 바로 수치화하기 어려운 콘텐츠 정보도 KoBERT embedding, PCA, clustering을 거치면 구조화된 변수와 함께 분석할 수 있음을 경험했습니다.

> **분석의 범위는 만들고 싶은 결론이 아니라, 실제 데이터가 어디까지 뒷받침하는지에 맞춰야 한다고 배웠습니다.**

---

# 15. Tech Stack

## Language

`Python`

## Data Analysis

`Pandas` `NumPy`

## NLP

`KoBERT` `Okt`

## Machine Learning

`Random Forest` `Extra Trees` `Gradient Boosting` `XGBoost` `LightGBM`

## Methods

`PCA` `K-Means` `GridSearch` `Stratified K-Fold`

---

# 16. Portfolio Card

## Question

> **잘되는 웹소설에는 공통점이 있을까?**

## Description

네이버 시리즈 웹소설의 작품 정보와 제목·소개글을 함께 분석해 높은 평점의 작품과 연결되는 특성을 탐색했습니다. KoBERT로 텍스트를 embedding하고 PCA·K-Means로 의미적 특성을 구조화한 뒤 여러 머신러닝 모델을 비교해 약 83% 수준의 평점 분류 정확도를 확인했습니다.

## Highlights

- 13,079개 웹소설 데이터 분석
- KoBERT 기반 제목·소개글 embedding
- PCA 768 → 228 dimensions
- K-Means 기반 text pattern clustering
- 5개 tree-based model 비교
- 데이터 한계에 맞춘 문제 범위 재정의

## Metrics

- **13,079 Works**
- **768 → 228 Dimensions**
- **≥ 90% Explained Variance**
- **83.41% Classification Accuracy**

## Tags

`NLP` `KoBERT` `PCA` `Clustering` `Machine Learning` `Content Analytics`