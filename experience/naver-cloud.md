# NAVER Cloud — AI Agent Data Engineering Internship

## Overview
- NAVER Cloud
- Speech Team
- 2026.06.29 – Present
- AI Data Engineering

## What I Worked On

CareCall AI Agent 학습을 위한 멀티턴 대화 데이터 생성·평가 파이프라인을 구축했습니다.

실제 서비스에서 발생할 수 있는 다양한 사용자 상황을 학습 데이터에 반영하기 위해 페르소나와 대화 흐름, 종료 조건을 설계하고, AI Agent와 사용자 Simulator가 대화하는 Multi-Agent 구조를 구성했습니다.

## Data Generation

- Persona 및 conversation scenario 설계
- Multi-Agent 기반 대화 데이터 생성
- Python controller를 통한 turn / state 제어
- 실제 통화 상황을 반영한 종료 조건 설계

## Quality Evaluation

생성 데이터가 증가하면서 반복적으로 발생하는 오류를 유형화했습니다.

- Persona contradiction
- Factual error
- Unnatural conversation flow
- Context inconsistency

명확하게 판별 가능한 오류는 rule-based validation으로 처리하고, 의미와 맥락을 함께 판단해야 하는 오류는 LLM Judge를 활용했습니다.

## Error Handling

오류의 영향 범위에 따라 처리 방식을 구분했습니다.

Local Error
→ Rewrite Current Turn

Conversation-level Error
→ Regenerate Conversation

단순히 오류를 탐지하는 것에서 끝내지 않고 이후 대화에 미치는 영향까지 고려해 재생성 범위를 결정했습니다.

## Experiment Management

모델·프롬프트·생성 조건을 config로 분리하고 실행 결과를 기록해 반복 실험을 비교·추적할 수 있도록 구성했습니다.

이를 통해 조건 변경 이후 결과를 재현하고 이전 실험과 비교할 수 있도록 했습니다.

## What I Learned

AI 서비스에서 좋은 학습 데이터는 단순히 자연스러운 문장을 많이 만드는 것으로 정의되지 않았습니다.

실제 서비스에서 발생할 수 있는 상황인지, Agent가 어떤 행동을 해야 하는지, 어떤 오류를 허용하거나 차단해야 하는지에 따라 데이터와 평가 기준도 달라져야 했습니다.

이를 통해 데이터 생성 자체보다 먼저 **서비스 목적에 맞는 데이터와 품질의 기준을 정의하는 과정**이 중요하다는 것을 경험했습니다.

## Tech / Keywords

`Python` `LLM` `Multi-Agent Simulation` `LLM Judge`
`Synthetic Data` `Data QA` `Evaluation` `SFT`