# AI Comment Moderation

## Meta

- Title: AI Comment Moderation
- Period: 2025.03 – 2026.02
- Category: Human-Centered AI / NLP / AI Product
- Type: Team Research Project
- Role: End-to-End
- Status: Featured
- Publication: ACM CHI Extended Abstracts 2026
- Paper Title: Helping or Hindering? User Experience Trade-offs in Refinement-Based AI Moderation for Online Comments
- GitHub: (backend) https://github.com/se00un/25-1-Capstone-Polite-Web (front) https://github.com/se00un/25-1-Capstone-PoliteWeb-Front
- Paper: https://doi.org/10.1145/3772363.3798335
---

## One-line Question

> 공격적인 댓글을 차단하는 것 말고, 더 나은 방법은 없을까?

---

## Summary

기존의 사후 차단 중심 댓글 중재에서 벗어나, 사용자가 댓글을 작성하는 단계에서 AI가 더 나은 표현을 제안하는 중재 방식을 설계하고 구현했습니다.

KoELECTRA 기반 공격성 탐지 모델과 KoBART 기반 순화 모델을 학습해 실제 웹 기반 댓글 작성 환경에 연동하고, 모델 성능 평가에서 그치지 않고 실제 사용자의 행동과 경험까지 검증했습니다.

실제 사용 흐름과 행동을 분석해 AI 개입 방식을 개선했으며, 최종적으로 50명의 사용자를 대상으로 Blocking과 Refinement가 댓글 표현과 사용자 경험에 미치는 차이를 검증했습니다.

---

# 1. Problem

## Existing Workflow

기존 온라인 댓글 중재는 대부분 공격적인 댓글이 게시된 이후 문제를 처리합니다.

### User

게시물/댓글 노출  
→ 감정적 반응  
→ 댓글 작성  
→ 게시  
→ 사후 신고·삭제·차단

### Platform

게시된 댓글 축적  
→ 공격성 탐지 또는 사용자 신고  
→ 삭제·차단  
→ 동일한 과정 반복

이 방식에서는 작성자가 자신의 표현을 게시 전에 다시 검토하고 개선할 기회가 부족합니다.

---

## Problem Discovery

프로젝트는 다음 질문에서 시작했습니다.

> **왜 문제가 발생한 뒤에야 차단해야 할까?**

공격적인 표현을 정확하게 탐지하는 것만이 아니라, 사용자가 댓글을 게시하기 전에 자신의 표현을 돌아보고 더 나은 표현을 선택할 수 있도록 지원할 수 있다고 생각했습니다.

따라서 문제를

**Detect → Block / Delete**

에서

**Detect → Suggest Better Expression → User Decision**

으로 확장했습니다.

---

# 2. What I Built

프로젝트는 크게 두 단계로 발전했습니다.

## Phase 1 — AI Model Development

> 공격적인 한국어 댓글의 의미를 유지하면서 더 나은 표현으로 바꿀 수 있을까?

### Toxicity Detection

AI Hub Text Ethics Verification Dataset을 기반으로 KoBERT와 KoELECTRA를 fine-tuning해 공격적인 표현을 분류했습니다.

| Model | Accuracy |
|---|---:|
| KoBERT | 88.11% |
| KoELECTRA | **89.34%** |

성능 비교 후 KoELECTRA를 최종 toxicity classifier로 선정했습니다.

### Training Data

- Polite sentences: 약 120K
- Toxic sentences: 약 90K
- Test holdout: 10%

KoELECTRA를 활용해 높은 confidence의 toxic sentence 약 60K개를 선별했습니다.

---

## Polite Rewriting

한국어 toxic–polite parallel data가 충분하지 않아 GPT few-shot prompting으로 synthetic data를 생성했습니다.

Toxic Korean Sentence  
→ GPT-based Polite Rewrite  
→ Manual Quality Review  
→ Toxic–Polite Parallel Dataset

이를 활용해 KoBART를 **Text Style Transfer** task로 fine-tuning했습니다.

목표는 단순히 공격성을 제거하는 것이 아니라,

> **원래 의미는 유지하면서 표현 방식만 개선하는 것**

이었습니다.

---

## Real-world Model Evaluation

학습 데이터 내부 성능만 확인하지 않고 실제 YouTube의 공격적인 한국어 댓글 1,000개를 별도로 수집해 모델을 평가했습니다.

Fine-tuned KoBART와 GPT-4.1-nano를 동일한 댓글에 적용해 비교했습니다.

### Semantic Preservation

| Model | SBERT Cosine Similarity |
|---|---:|
| GPT-4.1-nano | 0.720 |
| KoBART | **0.751** |

### Toxicity after Rewrite

| Text | Toxic |
|---|---:|
| Original | 224 |
| GPT-4.1-nano | **13** |
| KoBART | 30 |

GPT는 공격성을 더 강하게 낮췄지만 일부 입력에서 지나치게 일반적인 조언을 생성하거나 원래 의미를 회피하는 패턴이 나타났습니다.

KoBART는 상대적으로 원문의 의미를 더 유지하면서 표현을 완화했습니다.


---

# 3. From AI Model to Product

모델 개발 이후 새로운 질문이 생겼습니다.

> **AI가 더 좋은 표현을 만들어준다면, 사용자는 실제로 이 방식을 더 좋아할까?**

이를 확인하기 위해 KoELECTRA와 KoBART를 실제 댓글 작성 과정에 연결한 웹 서비스를 직접 구축했습니다.

### System Flow

User writes comment  
↓  
Fine-tuned KoELECTRA  
↓  
Continuous Toxicity Score  
↓  
Threshold Check  
↓  
Moderation Intervention  
├── Blocking  
└── Refinement  
↓  
User Action  
↓  
Final Comment  
↓  
Behavior & Text Logging

KoELECTRA와 KoBART의 역할을 분리했습니다.

- **KoELECTRA — When should AI intervene?**
- **KoBART — How should the expression be improved?**

---

# 4. Unexpected Failure

## The AI Worked. Users Still Did Not Use It.

파일럿에서 예상하지 못한 문제가 발생했습니다.

기존 Blocking 방식의 한계를 해결하기 위해 만든 AI Refinement 기능을 정작 사용자들이 기대만큼 선택하지 않았습니다.

처음에는 모델 성능의 문제라고 판단해 모델을 개선했습니다.

하지만 모델을 개선한 뒤 다시 테스트해도 결과는 크게 달라지지 않았습니다.

> **문제는 AI가 생성하는 문장의 품질만이 아니었습니다.**

---

# 5. Finding the Real Problem

실제 사용 과정과 행동을 다시 확인했습니다.

초기 설계에서는 사용자의 표현과 선택을 최대한 보장하기 위해 AI가 순화문을 제안한 뒤 사용자가 직접 수용 여부와 수정 여부를 선택하도록 했습니다.

그러나 이 과정에서 수정한 댓글이 다시 toxicity threshold를 넘으면 AI 개입이 반복될 수 있었습니다.

### Initial Interaction

Comment 작성  
→ Toxicity Detection  
→ Refinement 제안  
→ Accept / Reject  
→ User Edit  
→ 다시 Detection  
→ Threshold 초과 시 다시 Intervention  
→ ...

사용자에게 더 많은 선택권을 주는 것이 좋은 경험이라고 생각했지만, 실제로는 댓글 하나를 게시하기 위해 여러 차례의 확인과 수정이 필요했습니다.

### Root Cause

> **Model Performance가 아니라 Interaction Cost가 문제였습니다.**

AI가 더 나은 결과를 생성하더라도 사용자가 반복적으로 AI의 제안을 확인하고 판단해야 한다면 댓글 작성 흐름 자체가 방해받을 수 있었습니다.

---

# 6. Product Iteration

AI 모델을 다시 개선하는 대신 **AI와 사용자가 상호작용하는 방식**을 변경했습니다.

### Before

작성  
→ AI 제안  
→ 수용 여부 판단  
→ 수정  
→ 다시 탐지  
→ 필요 시 다시 개입

### After

작성  
→ AI 순화문 즉시 확인  
→ 필요한 부분만 최소 수정  
→ 게시

### Changes

- AI 순화 제안을 댓글 작성 흐름 안에서 바로 확인하도록 UI 수정
- 사용자가 필요한 부분만 수정한 뒤 게시하도록 interaction 단순화
- AI intervention을 **1회로 제한**
- 반복적인 확인·선택 과정을 제거해 interaction cost 감소

### Key Decision

> **AI의 성능뿐 아니라 언제, 몇 번, 어떤 방식으로 개입할지도 제품 성능의 일부라고 판단했습니다.**

---

# 7. Final User Evaluation

개선한 시스템을 실제 사용자 **N=50**에게 적용했습니다.

## Experimental Design

Blocking과 Refinement를 각각 세 가지 toxicity threshold에서 비교하고 Baseline을 포함했습니다.

| Moderation Strategy | Threshold |
|---|---|
| Blocking | 0.3 |
| Blocking | 0.6 |
| Blocking | 0.9 |
| Refinement | 0.3 |
| Refinement | 0.6 |
| Refinement | 0.9 |
| Baseline | No Intervention |

총 **7 conditions**으로 구성했습니다.

### Participants

- Blocking: n=23
- Refinement: n=19
- Baseline: n=8

사용자는 사회적으로 논쟁적인 3개의 discussion task에서 총 9개의 댓글을 작성했습니다.

---

# 8. What I Measured

모델 성능만 평가하지 않고 **사용자 경험과 실제 작성 결과를 함께 측정**했습니다.

## User Experience

TAM 기반 post-task survey를 활용했습니다.

- Perceived Ease of Use
- Perceived Usefulness
- Overall Satisfaction
- Perceived Communication Quality
- Freedom of Expression
- Trust
- Fairness

## Comment Outcome

최종 제출된 댓글의 표현 변화도 분석했습니다.

- Negative / Positive Sentiment
- Continuous Sentiment Score

---

# 9. Results

AI Refinement와 Blocking은 서로 다른 장점을 보였습니다.

## User Experience

### Overall Satisfaction

| Strategy | Mean |
|---|---:|
| Blocking | **3.875** |
| Refinement | 3.378 |

p = .0368

### Perceived Communication Quality

| Strategy | Mean |
|---|---:|
| Blocking | **4.042** |
| Refinement | 3.417 |

p = .0416

Blocking이 두 사용자 경험 지표에서 더 높은 평가를 받았습니다.

---

## Comment Outcome

반대로 실제 댓글 결과에서는 Refinement의 효과가 나타났습니다.

- τ = 0.6 / 0.9에서 Refinement의 negative comment 비율 감소
- Negative sentiment: p = .027
- Positive sentiment: p = .033

### Core Finding

> **Better AI Output ≠ Better AI Experience**

Refinement는 실제 댓글의 부정적 표현을 줄였지만 추가적인 interaction을 요구했습니다.

Blocking은 표현 개선 효과는 상대적으로 제한적이었지만 단순하고 예측 가능한 interaction을 제공해 일부 사용자 경험 지표에서 더 높은 평가를 받았습니다.

---


# 10. My Contribution

**End-to-End Individual Project**

프로젝트의 전 과정을 수행했습니다.

### Problem & Research Design
- 문제 정의 및 연구 질문 설계
- AI moderation strategy 설계
- 파일럿 테스트 및 최종 사용자 평가 설계

### AI / NLP
- GPT 기반 synthetic data augmentation
- SBERT 기반 semantic preservation 평가
- 실제 inference 결과 error analysis

### Data
- AI Hub 기반 학습 데이터 정의·전처리
- Synthetic parallel data 구축 및 검수
- 실제 YouTube 댓글 1,000건 evaluation dataset 구축

### Product / Engineering
- Web-based commenting platform 설계·개발
- AI inference pipeline 연동
- Threshold-based intervention logic 구현
- 사용자 행동 및 최종 댓글 logging 구조 설계
- UI 및 AI interaction flow 개선

### Evaluation
- N=50 controlled user evaluation
- 7-condition experiment
- TAM-based survey
- Cronbach's Alpha
- Welch's t-test
- ANOVA
- Comment sentiment analysis

---

# 12. Outcome

- ACM CHI Extended Abstracts 2026 게재
- 실제 사용자 N=50 대상 AI moderation evaluation 완료
- AI output quality와 user experience 사이의 trade-off 확인
- Offline NLP model에서 실제 사용자 제품까지 End-to-End 구현

---

# 13. What I Learned

> **의문에 대한 답을 직접 만드는 것에서 그치지 않고, 실제 사용자의 행동을 확인하며 계속 개선해야 비로소 쓰이는 결과물로 완성할 수 있다.**

처음에는 더 좋은 AI 모델을 만드는 것이 문제 해결의 중심이라고 생각했습니다.

하지만 실제 사용 환경에서는 모델이 생성하는 결과뿐 아니라 AI가 **언제 개입하는지, 얼마나 자주 개입하는지, 사용자가 어떤 판단을 추가로 해야 하는지**가 제품 경험을 결정했습니다.

이후 AI 시스템을 설계할 때는 모델 성능뿐 아니라 데이터, 개입 시점, 사용자 흐름, 실제 행동 변화까지 함께 고려하게 되었습니다.

---

# 14. Tech Stack

### AI / NLP
`Python` `PyTorch` `KoBERT` `KoELECTRA` `KoBART` `Sentence-BERT` `GPT`

### Backend / Data
`FastAPI` `PostgreSQL` `SQLAlchemy`

### Frontend
`React`

### Analysis
`Pandas` `SciPy` `Scikit-learn`

---

# 15. Portfolio Card

## Question

> **왜 문제가 발생한 뒤에야 차단해야 할까?**

## Description

댓글 작성 단계에서 공격적 표현을 탐지하고 더 나은 표현을 제안하는 AI 댓글 중재 서비스를 개발했습니다. 모델을 실제 사용자 환경에 적용하고, 파일럿에서 발견한 interaction cost를 바탕으로 AI 개입 방식을 개선했습니다.

## Highlights

- KoELECTRA + KoBART 기반 실시간 AI moderation
- 모델 학습부터 웹 서비스 구현까지 End-to-End 개발
- 실제 사용자 행동 기반 AI interaction 개선
- Blocking vs Refinement 사용자 평가

## Metrics

- **N=50 Users**
- **7 Experimental Conditions**
- **1,000 Real-world Comments Evaluation**
- **ACM CHI Extended Abstracts 2026**

## Tags

`Human-Centered AI` `NLP` `AI Product` `KoELECTRA` `KoBART`

---

# 16. Assets for Portfolio

## Hero

**추천:** 실제 댓글 작성 화면에서 AI refinement가 작동하는 장면

없다면:
- 웹서비스 전체 화면
- Blocking / Refinement 비교 화면

## Architecture

추천 다이어그램:

User Comment  
→ KoELECTRA  
→ Toxicity Threshold  
→ Blocking / KoBART Refinement  
→ User Action  
→ Final Comment  
→ Behavior Log

## Product Iteration

Before / After interaction flow를 나란히 보여주는 이미지 추천.

## Results

추천 시각화:
- Blocking vs Refinement Satisfaction
- Blocking vs Refinement Communication Quality
- Condition별 Negative Comment 비율

## External Links

- `View Source on GitHub`
- `Read Paper`