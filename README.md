# Elphon's Blog
이 저장소는 Thiago Rossener의 Jekflix 테마를 기반으로 커스터마이징한 Jekyll 블로그입니다.

## 로컬 개발
Node.js 20과 Ruby/Bundler 환경을 기준으로 합니다.

```bash
npm install
bundle install
npm run dev
```

정적 사이트만 빌드하려면 다음 명령을 사용합니다.

```bash
npm run build
```

`npm run dev`는 JavaScript와 이미지를 준비한 뒤 Jekyll과 BrowserSync를 실행하고, 설정·템플릿·포스트·사진 데이터 변경을 감시합니다.

## 설정 원본
CMS와 설정 생성 파이프라인을 사용하지 않습니다. Jekyll이 실제로 읽는 파일을 직접 수정합니다.

- `_config.yml` — 사이트/빌드 설정
- `_sass/_theme.scss` — 테마 색상
- `_data/translations.yml` — 번역/문구
- `_data/photo_posts/` — 사진 포스트의 사진 라이브러리와 배치 데이터

예전 `src/yml/` → `_config.yml` 생성 과정은 제거되어 설정이 두 곳에 중복되지 않습니다.

## 로컬 검사와 CI
JavaScript 문법과 사진 포스트 구성을 한 번에 검사하려면 다음 명령을 사용합니다.

```bash
npm run check
```

개별 명령은 다음과 같습니다.

```bash
npm run check:js
npm run validate:photos
```

GitHub Actions의 `.github/workflows/ci.yml`은 push와 pull request마다 같은 정적 검사를 실행한 뒤, Node.js 20과 Ruby 3.2 환경에서 실제 `npm run build`까지 수행합니다.

현재 이전 Jekflix 의존성이 남아 있던 `package-lock.json`은 제거한 상태입니다. 인터넷 접근이 가능한 개발 환경에서 의존성을 확정할 때 `npm install`로 새 lockfile을 생성하고, Ruby도 같은 시점에 `bundle lock` 또는 `bundle install`로 `Gemfile.lock`을 생성하는 것이 좋습니다.

## 사진 포스트 구조
사진이 많은 `post-photo`는 포스트 front matter에 전체 라이브러리를 넣지 않고 `_data/photo_posts/`에 분리할 수 있습니다.

```yaml
photo_data: "jeju-summer-2025"
```

위 값은 `_data/photo_posts/jeju-summer-2025.yml`의 `photos`, `photo_groups`, `photo_sections`를 사용합니다. 포스트에는 제목, SEO 정보, ImageKit 경로, Hero처럼 글 자체에 가까운 정보만 남깁니다.

레이아웃 DSL과 tone/grid 옵션은 [`docs/photo-post-layout.md`](docs/photo-post-layout.md)에 정리되어 있습니다.

## 사진 포스트 자산
사진 포스트 CSS는 역할별 소스 파일을 유지하되 페이지에서는 `assets/css/photo-post-bundle.css` 하나만 로드합니다. 이 파일이 Jekyll `include_relative`로 기존 스타일 순서를 그대로 결합하므로 cascade 순서를 바꾸지 않고 네트워크 요청만 단순화합니다.

사진 포스트 JavaScript는 역할을 이름에 맞게 분리합니다.

- `photo-post.js` — 공통 photo-post 동작
- `photo-post-gallery.js` — editorial gallery 동작
- `photo-post-hero-exif.js` — Hero EXIF/촬영 시각 표시

실제 `<script>` 로딩은 `_includes/photo/scripts.html` 한 곳에서 관리합니다.

## 사진 포스트 검증
사진 포스트 구조는 Ruby 검증기로 빠르게 확인할 수 있습니다. front matter와 `photo_data` 방식 모두 지원합니다.

```bash
npm run validate:photos
```

기본 모드는 존재하지 않는 photo/group id, 중복 photo id처럼 렌더링을 깨뜨릴 수 있는 항목만 오류로 처리하고, grid 장수·variant·tone·`order: auto` 조합은 경고로 보여줍니다.

경고까지 실패로 처리하려면 Ruby 스크립트를 strict 모드로 직접 실행합니다.

```bash
PHOTO_VALIDATE_STRICT=1 ruby tools/validate_photo_posts.rb
```

## 콘텐츠 관리
별도 `/admin` CMS는 사용하지 않습니다. 포스트와 설정은 저장소에서 직접 관리합니다. 사진 포스트처럼 커스텀 데이터 구조가 많은 현재 블로그에서는 CMS 스키마를 별도로 유지하는 것보다 이 방식이 단순합니다.

## 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.
원작자: Thiago Rossener (원본 저장소)
