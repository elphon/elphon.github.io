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

`npm run dev`는 테마/JavaScript/이미지를 준비한 뒤 Jekyll과 BrowserSync를 실행하고, 템플릿·포스트·사진 데이터 변경을 감시합니다.

## 사진 포스트 구조
사진이 많은 `post-photo`는 포스트 front matter에 전체 라이브러리를 넣지 않고 `_data/photo_posts/`에 분리할 수 있습니다.

```yaml
photo_data: "jeju-summer-2025"
```

위 값은 `_data/photo_posts/jeju-summer-2025.yml`의 `photos`, `photo_groups`, `photo_sections`를 사용합니다. 포스트에는 제목, SEO 정보, ImageKit 경로, Hero처럼 글 자체에 가까운 정보만 남깁니다.

레이아웃 DSL과 tone/grid 옵션은 [`docs/photo-post-layout.md`](docs/photo-post-layout.md)에 정리되어 있습니다.

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

## 관리자 페이지
`/admin`은 Netlify CMS/Identity를 사용하는 선택적 관리 화면입니다. 공개 페이지에서는 CMS 스크립트를 로드하지 않으며, 관리자 전용 color picker vendor 파일은 `assets/js/`에 직접 보관합니다.

## 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.
원작자: Thiago Rossener (원본 저장소)
