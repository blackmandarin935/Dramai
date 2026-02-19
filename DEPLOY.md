# 🎬 AI 드라마 스튜디오 — 완전 무료 배포 가이드

## 아키텍처

```
[브라우저] → [Cloudflare Pages] → [Hugging Face API (무료)]
                                        ├─ Llama 3.1 (대본)
                                        ├─ Kokoro TTS (음성)
                                        ├─ SDXL (이미지)
                                        └─ MusicGen (BGM)
```

**비용: $0** — 모든 서비스 무료 티어 사용

---

## 배포 방법 (3가지)

### 방법 1: GitHub + Cloudflare Pages 연동 (추천 ⭐)

```bash
# 1. GitHub 레포 만들기
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/YOUR_ID/ai-drama-studio.git
git push -u origin main

# 2. Cloudflare Pages 연결
# https://pages.cloudflare.com → "새 프로젝트" → GitHub 레포 선택
# Build 설정:
#   Framework: None
#   Build 명령어: (없음)
#   Build 출력 디렉토리: frontend
```

### 방법 2: Wrangler CLI 직접 배포

```bash
# Wrangler 설치
npm install -g wrangler

# 로그인
wrangler login

# 배포
wrangler pages deploy frontend --project-name ai-drama-studio
```

### 방법 3: 드래그 앤 드롭 (가장 간단)

1. https://pages.cloudflare.com 접속
2. "프로젝트 만들기" → "직접 업로드"
3. `frontend/` 폴더를 드래그

---

## 무료 제한 사항

| 서비스 | 무료 한도 | 제한 초과시 |
|--------|---------|-----------|
| Cloudflare Pages | 무제한 요청, 500 빌드/월 | 없음 (너무 관대) |
| HF Inference API | ~1000 req/일 (토큰 없이) | 429 에러 → 대기 |
| HF (토큰 있을 때) | 더 많은 요청 | - |

### HF 토큰으로 제한 늘리기 (선택, 무료)

```
1. https://huggingface.co/settings/tokens 에서 토큰 발급 (무료)
2. index.html 상단에 추가:
   const HF_TOKEN = 'hf_YOUR_TOKEN_HERE';
3. callHF 함수의 headers에 추가:
   'Authorization': `Bearer ${HF_TOKEN}`
```

---

## 성능 최적화 팁

- **대본 생성**: Llama 3.1 8B 대신 Mistral 7B가 더 빠름
- **TTS**: Kokoro-82M은 작고 빠른 모델 (품질도 좋음)
- **이미지**: SDXL 대신 `stabilityai/sdxl-turbo` 사용 시 4배 빠름
- **BGM**: `facebook/musicgen-small` → `facebook/musicgen-medium` 으로 품질 업

---

## 고도화 아이디어

1. **Cloudflare Workers + KV** 로 생성 결과 캐싱
2. **R2 Storage** 로 생성된 미디어 파일 저장 (무료 10GB)
3. **HF Spaces Gradio** 에 백엔드 올려서 더 안정적인 API로 사용
4. **ffmpeg.wasm** 으로 브라우저에서 진짜 영상 합성

---

## 파일 구조

```
ai-drama-studio/
├── frontend/
│   └── index.html      ← 전체 앱 (단일 파일)
├── wrangler.toml        ← CF 배포 설정
└── DEPLOY.md            ← 이 문서
```
