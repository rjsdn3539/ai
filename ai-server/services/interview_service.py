import os
import json
from openai import OpenAI
from schemas.interview_schema import ConversationTurn, FeedbackResponse

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o")

# 면접관 시스템 프롬프트
INTERVIEWER_SYSTEM_PROMPT = """당신은 10년 경력의 전문 기술 면접관입니다.
주어진 이력서, 자기소개서, 채용공고를 바탕으로 맞춤형 면접 질문을 합니다.

규칙:
- 한 번에 하나의 질문만 합니다
- 이전 답변이 모호하거나 구체성이 부족하면 꼬리 질문을 합니다
- 친절하지만 날카롭고 핵심을 파고드는 어조로 질문합니다
- 지원자의 실제 경험과 문제 해결 능력을 파악하는 질문을 합니다
- 반드시 JSON 형식으로만 응답합니다: {"question": "질문 내용", "questionType": "INITIAL 또는 FOLLOWUP"}"""

# 피드백 시스템 프롬프트
FEEDBACK_SYSTEM_PROMPT = """당신은 전문 면접 코치입니다.
면접 대화 기록을 분석하여 상세한 피드백을 제공합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "logicScore": 0~100 정수,
  "relevanceScore": 0~100 정수,
  "specificityScore": 0~100 정수,
  "overallScore": 0~100 정수,
  "weakPoints": "부족한 점 설명",
  "improvements": "개선 방향 설명",
  "recommendedAnswer": "추천 답변 예시"
}"""


def generate_question(
    resume: str,
    cover_letter: str,
    job_description: str,
    history: list[ConversationTurn],
) -> dict:
    """AI 면접관이 다음 질문 생성"""

    # 대화 기록을 메시지 형식으로 변환
    messages = [{"role": "system", "content": INTERVIEWER_SYSTEM_PROMPT}]

    # 면접 컨텍스트 추가
    context = f"""[이력서]\n{resume}\n\n[자기소개서]\n{cover_letter}\n\n[채용공고]\n{job_description}"""
    messages.append({"role": "user", "content": context})

    # 이전 대화 기록 추가
    for turn in history:
        messages.append({"role": "assistant", "content": json.dumps({"question": turn.question, "questionType": "INITIAL"}, ensure_ascii=False)})
        messages.append({"role": "user", "content": f"답변: {turn.answer}"})

    messages.append({"role": "user", "content": "다음 질문을 해주세요."})

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)


def generate_batch_questions(position_title: str, resume_summary: str, job_description: str, question_count: int) -> list:
    """Java 백엔드용: 면접 질문 N개 한 번에 생성"""
    prompt = f"""[직무] {position_title}
[이력서 요약] {resume_summary}
[채용공고] {job_description}

위 정보를 바탕으로 실전 면접 질문 {question_count}개를 생성해주세요.
반드시 아래 JSON 형식으로만 응답하세요:
{{
  "questions": [
    {{"sequenceNumber": 1, "questionText": "질문 내용"}},
    ...
  ]
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "당신은 10년 경력의 전문 기술 면접관입니다. 지원자의 역량을 정확히 평가할 수 있는 날카로운 면접 질문을 생성합니다. 반드시 JSON 형식으로만 응답합니다."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content).get("questions", [])


def analyze_answer(question_text: str, answer_text: str, job_description: str) -> dict:
    """Java 백엔드용: 단일 답변 분석 및 점수 반환"""
    prompt = f"""[질문] {question_text}
[답변] {answer_text}
[채용공고] {job_description}

위 면접 답변을 분석하여 아래 JSON 형식으로만 응답하세요:
{{
  "relevanceScore": 0~100,
  "logicScore": 0~100,
  "specificityScore": 0~100,
  "overallScore": 0~100,
  "feedbackSummary": "답변에 대한 구체적인 피드백"
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "당신은 전문 면접 코치입니다. 면접 답변을 객관적으로 평가하고 구체적인 피드백을 제공합니다. 반드시 JSON 형식으로만 응답합니다."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


def generate_report_summary(session_title: str, position_title: str, answer_feedback: list) -> dict:
    """Java 백엔드용: 면접 세션 전체 리포트 요약 생성"""
    feedback_text = "\n".join([
        f"- 관련성: {f.get('relevanceScore', 0)}점, 논리: {f.get('logicScore', 0)}점, 구체성: {f.get('specificityScore', 0)}점 / {f.get('feedbackSummary', '')}"
        for f in answer_feedback
    ])
    prompt = f"""면접 세션: {session_title} ({position_title})

답변별 피드백:
{feedback_text}

위 면접 결과를 종합하여 아래 JSON 형식으로만 응답하세요:
{{
  "weakPoints": "전반적으로 부족했던 점을 2~3문장으로 설명",
  "improvements": "구체적인 개선 방향을 2~3문장으로 설명",
  "recommendedAnswer": "가장 인상적인 질문에 대한 모범 답변 예시를 1~2문장으로"
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "당신은 전문 면접 코치입니다. 면접 결과를 분석하여 지원자가 성장할 수 있는 건설적인 피드백을 제공합니다. 반드시 JSON 형식으로만 응답합니다."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


def generate_feedback(history: list[ConversationTurn]) -> FeedbackResponse:
    """면접 전체 대화를 분석하여 피드백 생성"""

    conversation_text = "\n".join(
        [f"Q: {turn.question}\nA: {turn.answer}" for turn in history]
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": FEEDBACK_SYSTEM_PROMPT},
            {"role": "user", "content": f"다음 면접 대화를 분석해주세요:\n\n{conversation_text}"},
        ],
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    return FeedbackResponse(**data)
