# Elphon's Security Blog
이 저장소는 Thiago Rossener의 Jekflix 테마를 기반으로 보안 블로그를 제작한 코드입니다.

---

# 수정 내용
블로그를 보안 주제에 맞게 디자인 및 기능 커스터마이징.
보안 관련 태그와 카테고리 추가.

## 사진 포스트 구조
사진이 많은 `post-photo`는 포스트 front matter에 전체 라이브러리를 넣지 않고 `_data/photo_posts/`에 분리할 수 있습니다.

```yaml
photo_data: "jeju-summer-2025"
```

위 값은 `_data/photo_posts/jeju-summer-2025.yml`의 `photos`, `photo_groups`, `photo_sections`를 사용합니다. 포스트에는 제목, SEO 정보, ImageKit 경로, Hero처럼 글 자체에 가까운 정보만 남깁니다.

레이아웃 DSL과 tone/grid 옵션은 [`docs/photo-post-layout.md`](docs/photo-post-layout.md)에 정리되어 있습니다.

## 사진 포스트 검증
사진 포스트의 `photos`, `photo_groups`, `photo_sections` 구조는 Ruby 검증기로 빠르게 확인할 수 있습니다. front matter와 `photo_data` 방식 모두 지원합니다.

```bash
ruby tools/validate_photo_posts.rb
```

기본 모드는 존재하지 않는 photo/group id, 중복 photo id처럼 렌더링을 깨뜨릴 수 있는 항목만 오류로 처리하고, grid 장수·variant·tone·`order: auto` 조합은 경고로 보여줍니다.

경고까지 실패로 처리하려면 strict 모드를 사용합니다.

```bash
PHOTO_VALIDATE_STRICT=1 ruby tools/validate_photo_posts.rb
```

---

# 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.
원작자: Thiago Rossener (원본 저장소)
