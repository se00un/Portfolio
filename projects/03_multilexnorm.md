# MultiLexNorm 2026 — Rule-Augmented MFR for Multilingual Lexical Normalization

## Meta

- Project Title: MultiLexNorm 2026
- Period: 2026.03 - 2026.06
- Category: NLP / Multilingual AI / LLM
- Type: Team Project / MultiLexNorm 2026 Shared Task
- Course: Introduction to Artificial Intelligence, Sungkyunkwan University
- Role: Multilingual Normalization Pipeline Development & Experiment
- Primary Metric: Error Reduction Rate (ERR)
- LLM: GPT-4o-mini
- Status: Featured
- GitHub: https://github.com/se00un/26-1-MultiNorm

---

## Challenge

> LLM은 많이 사용할수록 정규화 성능이 좋아질까?

---

## Summary

17개 언어의 비표준 텍스트를 표준 형태로 변환하는 multilingual lexical normalization pipeline을 구축했습니다.

Most Frequent Replacement(MFR)을 baseline으로 두고, 언어별 EDA에서 발견한 패턴을 반영한 **Pre-MFR Rule → MFR → Post-MFR Rule → Selective LLM** 구조를 설계했습니다. Rule과 MFR로 처리되지 않은 표현에 GPT-4o-mini를 선택적으로 적용하고, LLM의 과도한 개입으로 정상 표현까지 수정되는 over-normalization 문제를 분석했습니다.

초기 LLM 전략은 weighted ERR **36.46**으로 MFR baseline **39.96**보다 오히려 낮았습니다. 이에 `is_nonstandard()` filtering을 추가해 LLM 호출 조건을 제한했고, weighted ERR을 **44.63**까지 높여 기존 LLM 전략 대비 **+8.17 points**, MFR baseline 대비 **+4.67 points** 개선했습니다.

---

# 1. Problem

소셜미디어의 텍스트에는 축약어, 철자 변형, 반복 문자, 비표준 표기 등 정형화되지 않은 표현이 빈번하게 등장합니다.

Lexical Normalization은 이러한 non-canonical token을 canonical form으로 변환해 이후 NLP 시스템이 텍스트를 안정적으로 처리할 수 있도록 만드는 작업입니다.

하지만 17개 언어를 동일한 방식으로 정규화하기는 어렵습니다.

- 언어마다 비표준 표현의 패턴이 다름
- 자주 등장한 표현은 학습 데이터 기반 치환으로 해결 가능
- 일부 표현은 언어별 규칙이 더 효과적
- unseen token이나 문맥 의존 표현은 단순 lookup으로 처리하기 어려움
- LLM을 무조건 적용하면 정상 표현까지 수정하는 false positive 발생 가능

따라서 프로젝트의 핵심은 하나의 모델을 모든 표현에 적용하는 것이 아니라,

> **각 표현을 어떤 방법으로 처리하고, 언제 LLM을 호출할 것인가**

를 설계하는 것이었습니다.

---

# 2. Baseline — Most Frequent Replacement

기본 baseline으로 **Most Frequent Replacement(MFR)**를 사용했습니다.

MFR은 training data에서 특정 non-standard token에 대응하는 canonical form 중 가장 빈번한 표현을 선택합니다.

Input Token  
→ Training Data Lookup  
→ Most Frequent Canonical Form

자주 관찰된 비표준 표현에는 효과적이지만, training data에 존재하지 않는 unknown token은 변경할 수 없다는 한계가 있습니다.

MultiLexNorm 2026 test set에서 MFR baseline의 weighted ERR은 **39.96**이었습니다.

---

# 3. EDA-Based Rule Design

MFR이 놓치는 표현을 분석해 언어별 rule을 설계했습니다.

단순히 사람이 보기 좋은 규칙을 추가하는 대신, 17개 언어의 EDA 결과를 바탕으로 각 pattern이 실제로 rule 적용에 적합한지 판단했습니다.

## Rule Selection Metrics

### NeedRule

MFR이 해당 pattern을 정규화하지 못한 token 수

### FalseSig

이미 standard form인데 동일한 pattern에 해당해 rule 적용 시 false positive가 발생할 수 있는 token 수

### Signal-to-Noise Ratio

`S:N = NeedRule / (NeedRule + FalseSig)`

S:N이 높을수록 해당 pattern이 반복적으로 나타나며 rule로 처리할 가치가 있다고 판단했습니다.

반대로 repetition, all_caps처럼 S:N이 낮은 pattern은 무리하게 rule로 처리하지 않고 다른 방법에 맡겼습니다.

---

# 4. Hybrid Normalization Pipeline

최종 pipeline은 **three-step + LLM hybrid approach**로 구성했습니다.

Input Token  
→ Language-specific Pre-MFR Rules  
→ MFR Lookup  
→ Language-specific Post-MFR Rules  
→ Selective LLM Normalization  
→ Final Prediction

## Pre-MFR Rules

MFR dictionary가 token을 더 잘 인식할 수 있도록 surface form을 먼저 표준화했습니다.

## MFR

training data에서 가장 빈번하게 관찰된 canonical form으로 치환했습니다.

## Post-MFR Rules

MFR로 처리하기 어려운 언어별 패턴을 추가로 처리했습니다.

예시는 다음과 같습니다.

- German: missing diacritics / abbreviation
- English: apostrophe restoration / g-dropping
- Indonesian: abbreviation / reduplication
- Spanish: missing diacritics / abbreviation
- Italian: abbreviation
- Japanese: period insertion
- Korean: lexical override

## Selective LLM

앞선 단계에서 변경되지 않은 token 중 특정 조건을 만족하는 경우에만 LLM을 호출했습니다.

---

# 5. LLM Strategy

LLM backend로 **GPT-4o-mini**, `temperature=0.0`을 사용했습니다.

Rule과 MFR만으로 처리하기 어려운 표현을 위해 few-shot prompting을 적용했습니다.

## Few-shot Experiment

- Zero-shot ERR: 약 12–19%
- 4-shot ERR: 약 55–87%
- 4-shot stratified sampling은 8-shot random과 유사한 성능을 더 낮은 비용으로 달성

따라서 최종 실험에서는 error type distribution을 반영한 **4-shot stratified prompting**을 사용했습니다.

---

# 6. Unexpected Result — More LLM Made It Worse

초기 LLM v1에서는 Rule과 MFR 처리 이후 `raw == pred`, 즉 아직 변경되지 않은 token에 LLM을 적용했습니다.

LLM을 추가하면 MFR이 놓친 표현까지 처리할 수 있을 것으로 기대했지만 결과는 반대였습니다.

| Strategy | Weighted ERR |
|---|---:|
| MFR Baseline | 39.96 |
| Rule Only | 42.06 |
| **LLM v1 — Unfiltered** | **36.46** |

LLM v1은 MFR baseline보다 **3.50 points 낮은 성능**을 기록했습니다.

---

# 7. Error Analysis — Over-normalization

오류를 분석한 결과, 문제는 LLM의 정규화 능력 자체보다 **LLM을 호출하는 조건**에 있었습니다.

LLM v1은 아직 변경되지 않은 token을 폭넓게 입력받으면서 실제로는 이미 올바른 standard word까지 수정했습니다.

Broader LLM Calls  
→ Standard Tokens Included  
→ Unnecessary Modification  
→ False Positive 증가  
→ ERR 감소

ERR은 올바르게 정규화한 TP뿐 아니라, 정상 token을 잘못 수정한 FP에도 직접 영향을 받습니다.

따라서 더 많은 token을 정규화하는 것보다 **정규화가 필요한 token을 선별하는 것**이 중요했습니다.

---

# 8. Key Decision — Filter Before Calling the LLM

LLM 자체를 변경하는 대신 **LLM 호출 조건을 다시 설계**했습니다.

## LLM v1

`raw == pred`  
→ Call LLM

아직 변경되지 않았다는 이유만으로 LLM을 호출했습니다.

## LLM v3

`is_nonstandard()` filter를 추가해 LLM이 실제로 필요할 가능성이 높은 token만 선택했습니다.

다음 token은 LLM 호출 대상에서 제외했습니다.

- Standard words
- Capital-initial tokens
- Numbers / punctuation
- Very short tokens
- URL
- @mention
- hashtag

Rule + MFR Processing  
→ Token Unchanged  
→ `is_nonstandard()`  
→ Likely Non-standard?  
→ Yes: Call LLM  
→ No: Keep Original

핵심은 LLM을 더 많이 사용하는 것이 아니라 **LLM이 판단해야 하는 영역을 제한하는 것**이었습니다.

---

# 9. Results

MultiLexNorm 2026 leaderboard test set에서 17개 언어를 평가했습니다.

| Strategy | Weighted ERR | Comparison |
|---|---:|---|
| LLM v3 — Filtered | **44.63** | Best overall |
| Rule Only | 42.06 | +2.10 vs MFR |
| MFR Baseline | 39.96 | Baseline |
| LLM v1 — Unfiltered | 36.46 | -3.50 vs MFR |

## Main Improvement

**LLM v1 36.46 → LLM v3 44.63**

**+8.17 ERR points**

Filtering을 추가한 LLM v3는 초기 LLM 전략 대비 **+8.17 points** 개선했습니다.

또한 MFR baseline보다 **+4.67 points** 높은 weighted ERR을 기록했습니다.

---

# 10. Language-specific Findings

하나의 전략이 모든 언어에서 가장 좋은 것은 아니었습니다.

## Rule이 특히 효과적이었던 언어

- English: MFR 대비 +20.70
- Italian: MFR 대비 +17.50
- German: MFR 대비 +13.08

영어의 apostrophe restoration과 g-dropping처럼 반복적이고 명확한 pattern은 rule이 효과적이었습니다.

## Selective LLM이 효과적이었던 사례

German, Danish, Indonesian 등에서는 filtered LLM 전략이 좋은 결과를 보였습니다.

## Limitations

한국어와 일본어처럼 non-Latin script를 사용하는 일부 언어에서는 heuristic filtering과 rule의 효과가 제한적이었습니다.

특히 Korean의 ERR은

- MFR: 15.38
- LLM v1: -63.46
- LLM v3: -1.92

로, filtering으로 큰 폭의 개선은 있었지만 MFR baseline을 넘지는 못했습니다.

이를 통해 LLM 호출 조건 역시 모든 언어에 동일하게 적용하기보다 **언어 특성을 반영해 설계할 필요가 있음**을 확인했습니다.

---


# 11. My Contribution

팀 프로젝트에서 약 **10개 언어**의 normalization pipeline 개발과 실험을 중심으로 담당했습니다.

## Data & EDA

- 언어별 normalization pattern 분석
- MFR failure case 분석
- Rule 적용 가능 pattern 탐색

## Pipeline

- MFR 기반 normalization
- Language-specific rule 적용
- LLM normalization 결합
- Rule / MFR / LLM 조건별 pipeline 실험

## LLM Experiment

- LLM 적용 결과 분석
- Over-normalization failure case 확인
- LLM call condition 비교
- Selective LLM 전략 개선

## Evaluation

- 언어별 ERR 비교
- 전략별 성능 분석
- LLM filtering 전후 성능 검증

---

# 12. What I Learned

처음에는 문맥을 이해할 수 있는 LLM을 더 넓게 활용하면 기존 방법이 놓친 표현까지 처리해 성능이 좋아질 것이라고 생각했습니다.

하지만 실제 결과는 반대였습니다.

LLM을 무조건 적용하면 이미 올바른 표현까지 변경하면서 새로운 오류가 발생했고, 초기 LLM 전략은 단순한 MFR baseline보다도 낮은 성능을 보였습니다.

오류를 분석하고 LLM의 호출 조건을 제한한 뒤에야 전체 성능을 개선할 수 있었습니다.

> **AI를 더 많이 사용하는 것보다, 어떤 문제에 AI가 필요한지를 구분하는 것이 중요했습니다.**

이 경험을 통해 AI 모델 자체의 성능뿐 아니라 **어떤 입력을 AI에게 맡기고 어디까지 개입하도록 할 것인지** 역시 시스템 설계의 중요한 일부라는 것을 배웠습니다.

---

# 13. Tech Stack

## Language
`Python`

## NLP / AI
`GPT-4o-mini` `Few-shot Prompting` `Lexical Normalization`

## Methods
`MFR` `Rule-based Normalization` `Selective LLM` `EDA`

## Evaluation
`Error Reduction Rate (ERR)`

---

# 14. Portfolio Card

## Challenge

> **LLM은 많이 사용할수록 정규화 성능이 좋아질까?**

## Description

17개 언어의 lexical normalization을 위해 MFR·언어별 Rule·LLM을 결합한 hybrid pipeline을 구축했습니다. LLM을 폭넓게 적용했을 때 발생한 over-normalization을 분석하고 호출 조건을 다시 설계해 weighted ERR을 **36.46에서 44.63으로 +8.17 points 개선**했습니다.

## Highlights

- 17-language multilingual lexical normalization
- Pre-Rule → MFR → Post-Rule → Selective LLM pipeline
- EDA 기반 language-specific rule 설계
- LLM over-normalization error analysis
- `is_nonstandard()` 기반 LLM call filtering

## Metrics

- **17 Languages**
- **44.63 Weighted ERR**
- **+8.17 points vs. Unfiltered LLM**
- **+4.67 points vs. MFR Baseline**

## Tags

`NLP` `LLM` `Multilingual` `Error Analysis` `Hybrid Pipeline`