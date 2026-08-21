# Elphon's Blog

Thiago Rossener의 Jekflix 테마를 기반으로 직접 확장한 Jekyll 블로그입니다. 일반 글과 기술 글 외에 ImageKit 기반의 사진 아카이브형 `post-photo` 레이아웃을 별도로 운영합니다.

## Configuration

사이트 설정의 source of truth는 루트 `_config.yml` 하나입니다. `gulp build`는 더 이상 `src/yml` 조각을 합쳐 `_config.yml`을 덮어쓰지 않습니다.

`src/yml/theme.yml`만 테마 색상을 `_sass/_theme.scss`로 컴파일하기 위한 전용 소스로 남아 있습니다.

## Photo post structure

사진 포스트 레이아웃은 `_layouts/post-photo.html`이 조립만 담당하고 각 영역을 `_includes/photo/` 아래에 나눠 둡니다.

- `hero.html` — Hero 슬라이드, 제목, footer
- `intro.html` — 포스트 소개와 location/date/camera
- `gallery.html` — `photo_groups` / `photo_sections` 렌더링
- `blend-background.html` — pair / statement 공용 blend 배경
- `gallery-item.html` — 개별 사진과 wide renderer markup
- `feature.html` — 선택적 feature frame
- `story-end.html` — 사진 이야기 마무리
- `lightbox.html` — fullscreen viewer

사진 전용 CSS는 `_includes/extra-css.html` 한 곳에서 순서대로 로드합니다. 사진 전용 JavaScript는 `post-photo.html` 하단에서 로드합니다.

## Photo layout validation

`_plugins/photo_post_validator.rb`가 `post-photo` front matter를 검사합니다.

검사 항목은 grid별 사진 장수, 지원 variant/tone/order, 존재하지 않는 photo/group id, 중복 photo id 등입니다. 현재 `_config.yml`의 `photo_validation_strict: false` 설정으로 경고만 출력합니다. 모든 기존 포스트를 정리한 뒤 `true`로 바꾸면 경고가 있는 빌드를 실패시킬 수 있습니다.

## Local build

```bash
bundle install
bundle exec jekyll build
```

기존 Gulp 개발 환경을 사용할 경우:

```bash
npm install
gulp build
```

`gulp build`도 루트 `_config.yml`을 그대로 사용합니다.

## CMS

`admin/config.yml`은 콘텐츠 편집 전용입니다. Categories, Posts, Pages, Authors를 관리하며 사이트/build 설정은 CMS에서 수정하지 않습니다. Author에는 일반 연락용 이메일과 비즈니스 이메일 필드가 별도로 있습니다.

## CI

`.github/workflows/verify.yml`에서 `edit-header`, `refactor2`, `agent/**` push 및 pull request마다 Jekyll 빌드를 실행합니다. 이 과정에서 photo layout validator도 함께 실행됩니다.

## License

MIT License. 원본 Jekflix 테마 저작권은 Thiago Rossener에게 있습니다.
