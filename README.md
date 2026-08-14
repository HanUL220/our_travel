# 💖 Our Travel Log (너와 나의 여행 기록 블로그)

여자친구와 함께 다녀온 아름다운 장소와 추억 사진, 일기를 기록하는 **React 기반 커플 여행 블로그** 웹사이트입니다.  
PC 및 모바일 디바이스 완벽 반응형 UI와 GitHub Pages 무료 호스팅 배포를 지원합니다.

---

## ✨ 주요 기능

1. **감성 커플 헤더 & D-Day 타이머**
   - 사귄 날짜 / 만난 지 며칠째인지 알려주는 `D+DAY` 실시간 카운터
   - 세련된 **라이트/다크 모드** 변경 기능
2. **반응형 블로그 메인 포스트 그리드**
   - **PC & 모바일 반응형 디자인**: 모바일에서는 하단 터치 네비게이션 탭바 제공
   - **카테고리 필터링**: 바다 🌊, 카페 ☕, 야경/도시 🌃, 휴양/자연 🌿, 맛집 🍽️
   - **실시간 검색**: 지역명, 키워드, 장소 검색 지원
3. **블로그 스타일 포스트 상세 모달 (페이지 뷰어)**
   - 카드 클릭 시 들어갈 수 있는 고화질 사진 갤러리 슬라이더
   - 방문 후기 및 여행 일기 스토리
   - 현지 꿀팁 및 장소 팁
   - **로컬스토리지 연동 방명록/댓글 작성**
4. **새 추억 직접 추가하기**
   - 웹사이트상에서 새로운 여행 장소, 사진, 일기를 즉시 입력 및 저장

---

## 🚀 GitHub Pages에 배포하는 방법 (GitHub으로 사이트 만들기)

### 1단계: GitHub 레포지토리(저장소) 생성
1. [GitHub](https://github.com)에 로그인 후, 우측 상단 `+` -> **New repository** 클릭
2. Repository name에 `our_travel` 입력 후 **Create repository** 클릭

### 2단계: 내 컴퓨터 코드 GitHub에 올리기
터미널에서 아래 명령어들을 차례대로 실행해 주세요:

```bash
# 1. 원격 저장소 연결 (YOUR_GITHUB_USERNAME을 본인 깃허브 아이디로 변경)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/our_travel.git

# 2. 코드 커밋 및 푸시
git add .
git commit -m "feat: 커플 여행 블로그 완성 💕"
git branch -M main
git push -u origin main
```

### 3단계: GitHub Pages 한 번에 배포하기
명령어 한 줄로 배포를 실행합니다:

```bash
npm run deploy
```

> **성공 후 깃허브 설정:**
> 1. 깃허브 레포지토리 페이지 -> **Settings** -> **Pages** 탭으로 이동합니다.
> 2. Source가 **Deploy from a branch** 로 설정되어 있고, Branch가 **`gh-pages`** / `(root)`로 지정되어 있는지 확인합니다.
> 3. 약 1~3분 뒤 **`https://YOUR_GITHUB_USERNAME.github.io/our_travel/`** 주소로 접속하면 본인의 여행 블로그 웹사이트를 어디서나 보실 수 있습니다!

---

## 🛠️ 개발 및 테스트 (로컬 실행)

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드 테스트
npm run build
```
