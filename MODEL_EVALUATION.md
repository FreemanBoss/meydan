# Local Arabic Model Check

## Environment

- Date: October 4, 2026 (local prototype check)
- Runtime: Ollama daemon 0.34.2, client 0.35.1
- Models checked: `yasserrmd/Fanar-1-9B-Instruct:latest` (5.1 GB), `qwen3:4b` (2.5 GB), `qwen3:4b-instruct` (2.5 GB), and `gemma3:4b` (3.3 GB)
- Hardware: 12 CPU cores, 32 GB RAM, Intel integrated graphics; no discrete GPU

## Fanar: baseline

Prompt sent to the local Ollama API:

> أعمل في هندسة البرمجيات والبنية السحابية. ساعدني أن أشرح لزميل عربي، بالعربية الفصحى المهنية، كيف أستخدم خطوط التكامل والنشر المستمر لأتمتة نشر التطبيقات. اكتب ثلاث جمل طبيعية، واشرح مصطلحاً واحداً بإيجاز. لا تقدّم ادعاءات تقنية غير مؤكدة.

Observed behavior:

- The response was in Arabic and used the requested topic and a professional register.
- It expanded CI/CD as «التكامل والنشر المستمر» and described automated integration/testing/deployment.
- The answer was truncated at the configured 150-token test limit before completing all requested sentences. This is a length-limit failure, not evidence that the request was fully satisfied.
- End-to-end API duration reported by Ollama: about 134 seconds; token evaluation took about 90 seconds for 150 tokens. It is too slow for rapid back-and-forth dialogue on this CPU.

## Qwen3 4B and 4B Instruct: speed candidate

Ollama reports packages of about 2.5 GB. A 204-token Qwen3 4B Instruct sample took about 106 seconds end-to-end (about 82 seconds token-evaluation time). It did not reveal internal reasoning, but Arabic phrasing and travel terminology in the sample were not reliable enough for an Arabic-learning product. The non-Instruct Qwen3 4B tag exposed internal reasoning despite a `think: false` request. Neither Qwen tag is used by default.

## Gemma 3 4B: current default

Ollama package size: about 3.3 GB. Hardware: CPU-only on 12 cores and 32 GB RAM.

Prompt: ask for exactly three realistic Arabic sentences about a long trip through China, an English translation, and five travel terms with meanings.

Observed response: 371 generated tokens in about 110 seconds end-to-end (Ollama reported 91.6 seconds token-evaluation time and 9.3 seconds load time). It returned Arabic and English without visible reasoning. The narrative was more ornate than requested; a glossary item was questionable (airline ticket was glossed as «تذكرة سفر», which is broader). This is a useful functional sample but not an Arabic quality pass or benchmark. A second in-app writing request is being checked against the revised prompt; do not claim it passed until its final response is reviewed. The app streams Markdown so users see progress and structured sections; generation remains CPU-limited.

### In-app China travel request

Request: a vivid but realistic three-sentence Arabic opening for a long trip through China, with English translation and five practical terms.

Observed result: the app streamed a three-sentence Arabic passage, an English translation, and five broadly relevant terms (`تذكرة القطار`, `المطار`, `العملة`, `المواصلات العامة`, `الفندق`). The structure worked. The opening included awkward diacritic/wording (`أقفُّ أمام نافذة قطاري`) and an over-general travel narrative, so it is not publication-ready Arabic. Have a fluent Arabic reviewer refine it and verify terms for the particular travel context. The response arrived progressively in the interface; full CPU generation still took long enough to require patience.

The app requests `num_ctx: 4096`, ten CPU threads, a ten-minute model keep-alive, and bounded output budgets (620 for writing, 520 for terminology, 260 for practice). These are pragmatic settings, not globally optimal values. Test with the device under expected thermal/power conditions.

## What this test does not establish

One fluent response does not establish Arabic correctness, terminology coverage, dialect coverage, or educational effectiveness. A fluent Arabic answer can still contain an incorrect grammatical correction or domain claim. The app therefore presents output as a practice aid and asks users to check specialized language with a knowledgeable speaker.

## Before describing the friend test publicly

Run a short session with one real friend who has agreed to try it. Ask them:

1. Did the scenario resemble a real conversation they need?
2. Was the Arabic phrasing understandable and useful?
3. Did the assistant correct something that was already acceptable, or introduce an error?
4. Would they use it again? What one change matters most?

Record only feedback they actually gave. Do not publish their name, image, messages, or identifying details without permission. State clearly that this is informal formative testing, not a linguistic benchmark.

## Small human-reviewed evaluation set to add

For each field, test the same behaviors rather than comparing unrelated examples:

- Correct Arabic answer: the tutor should not invent an error.
- One intentional grammar or word-choice error: offer one useful correction with a short reason.
- English/Arabic code-switching: preserve product names and standard technical terms when appropriate.
- Ambiguous input: ask a clarifying question instead of confidently guessing.
- Out-of-scope medical/legal request: redirect to communication practice and avoid professional advice.

Score each response with a human reviewer on relevance, Arabic naturalness, correction accuracy, and helpfulness. Save the exact model tag, prompt version, context, and run date with each result. Do not use an LLM judge as the sole source of truth.
