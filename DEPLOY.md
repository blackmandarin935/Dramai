# 🎬 AI 드라마 스튜디오 — Cloudflare Workers 배포 가이드

## 아키텍처

```
[브라우저] → [Cloudflare Workers] → [Hugging Face API]
                    ↓
               [KV Cache]
```

**장점:**
- HF 토큰 서버에 저장 → 노출 방지
- KV 캐싱 → 같은 요청 재사용 (요청 절약)
- CORS 문제 해결

**비용: $0**

---

## 배포 방법

### 1. KV 네임스페이스 생성

```bash
wrangler kv:namespace create CACHE
```

출력된 ID를 `wrangler.toml`의 `id`에 입력:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 2. HF 토큰 설정 (선택, 무료)

```bash
# https://huggingface.co/settings/tokens 에서 토큰 발급
wrangler secret put HF_TOKEN
# 프롬프트에 토큰 입력
```

토큰 없이도 작동하지만, 있으면 요청 한도 증가

### 3. 배포

```bash
wrangler deploy
```

---

## 파일 구조

```
ai-drama-studio/
├── src/
│   └── index.js       ← Worker 진입점 (프록시 + 캐싱)
├── frontend/
│   └── index.html     ← 프론트엔드
├── wrangler.toml      ← Workers 설정
└── DEPLOY.md
```

---

## 무료 제한

| 서비스 | 무료 한도 |
|--------|----------|
| Cloudflare Workers | 100,000 요청/일 |
| KV 읽기 | 100,000/일 |
| KV 쓰기 | 1,000/일 |
| HF API (토큰 없음) | ~1,000 요청/일 |
| HF API (토큰 있음) | 더 많음 |

---

## 로컬 개발

```bash
wrangler dev
```
