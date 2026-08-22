# Photo Post Layout DSL

`post-photo` 레이아웃에서 사용하는 `photo_groups` / `photo_sections` 작성 규칙을 정리한 문서다.

사진 배치는 기본적으로 직접 지정(`manual`)하며, `photo_sections`에 적은 순서가 실제 페이지 순서가 된다. 같은 photo id는 한 포스트 안에서 한 번만 사용하는 것을 기본 규칙으로 한다.

## 공통 section 키

- `group`: 선택. `photo_groups[].id`와 연결한다. 같은 group이 연속되면 하나의 챕터 박스 안에 묶인다.
- `type`: 선택. `interlude`를 사용하면 사진 대신 중간 전환 블록을 렌더링한다.
- `grid`: 사진 레이아웃 종류. 생략 시 `lead-two-wide`지만 장수 실수를 막기 위해 명시를 권장한다.
- `tone`: 개별 사진 section의 배경/분위기. 기본값은 `paper`.
- `variant`: `trio`, `statement`, `lead-four`, `four-lead`에서 사용하는 세부 배치 옵션.
- `order`: 기본값 `manual`. `auto`는 `lead-two-wide` / `wide-two-lead`에서만 지원한다.
- `label`: section 상단 메타에 표시하는 짧은 텍스트. 예: `JUL 13`, `MORNING`.
- `photos`: section에 들어가는 photo id 목록. grid가 요구하는 장수와 맞춰야 한다.

## photo_groups

`photo_groups`는 여러 section을 하나의 챕터로 묶는 정보다.

- `id`: 연결용 고유 id.
- `tone`: 챕터 박스 배경. 개별 section tone과 별개다.
- `eyebrow`: 챕터 제목 위 작은 텍스트.
- `title`: 챕터 큰 제목.
- `subtitle`: 챕터 오른쪽 보조 설명.

그룹 tone:

| tone | 용도 |
| --- | --- |
| `paper` | 기본 밝은 종이색 |
| `sand` | 따뜻한 베이지/모래색 |
| `sage` | 잔잔한 세이지 그린 |
| `sea` | 차분한 블루/그레이 |
| `dusk` | 옅은 보라/회색 |

```yaml
photo_groups:
  - id: "d0713"
    tone: "sand"
    eyebrow: "2025 · 07"
    title: "JUL 13"
    subtitle: "15:53–19:41 · 21 frames"
```

## interlude

사진 사이의 큰 전환 문구가 필요할 때 사용한다. `photos`와 `grid`는 쓰지 않는다.

```yaml
- type: "interlude"
  group: "d0725"
  tone: "dark"
  eyebrow: "JEJU · SUMMER"
  title: "A slow afternoon"
  subtitle: "2025.07.25 · Jeju"
```

`group`을 주면 해당 챕터 내부에 들어간다. `eyebrow` 생략 시 `page.kicker` → `PHOTO STORY`, `title` 생략 시 `page.location` → `page.title`, `subtitle` 생략 시 포스트 날짜를 사용한다.

현재 interlude의 tone은 class로는 전달되지만 CSS에서는 사실상 동일한 dark 스타일을 사용한다.

## section tone

개별 사진 section tone:

| tone | 용도 |
| --- | --- |
| `paper` | 기본 밝은 배경 |
| `mist` | 옅은 녹색/회색 패널 |
| `soft` | 옅은 핑크/회색 패널 |
| `dark` | 짙은 어두운 패널 |
| `blend` | `pair` / `statement` 전용 blur 배경 |

`photo_groups`의 `sand / sage / sea / dusk`와 section의 `paper / mist / soft / dark / blend`는 서로 다른 레벨의 tone이다.

## 1장

### statement

- 장수: 1장
- `variant: normal`: 세로 중심 단독 프레임. 기본값.
- `variant: wide`: wide renderer 사용.
- `tone: blend`: normal / wide 모두 지원. 같은 사진을 좌우 blur 배경으로 복제하고 원본을 중앙에 둔다.

```yaml
- grid: "statement"
  tone: "blend"
  variant: "normal"
  photos: [p01]
```

### wide

- 장수: 1장
- 별도 variant 없음.
- landscape는 실제 원본 비율을 유지한다.
- portrait는 넓은 blur 배경 안에 세로 원본을 중앙 배치한다.

## 2장

### pair

- 장수: 2장
- 두 사진을 나란히 배치하고 두 번째 사진이 약간 아래로 내려간다.
- `paper / mist / soft / dark` 사용 가능.
- `tone: blend`는 두 사진을 좌우 blur 배경으로 섞는다.

```yaml
- grid: "pair"
  tone: "blend"
  photos: [p01, p02]
```

## 3장

### lead-two

- 장수: 3장
- 1번째가 왼쪽 큰 lead.
- 2/3번째가 오른쪽 위/아래 보조 사진.

### two-lead

- 장수: 3장
- 1번째가 오른쪽 큰 lead.
- 2/3번째가 왼쪽 위/아래 보조 사진.
- mirrored layout이어도 큰 사진은 항상 `photos`의 1번째다.

### trio

- 장수: 3장
- `line`: 같은 높이. 기본값.
- `wave-up`: 01 높음 → 02 중간 → 03 낮음. 왼쪽에서 오른쪽으로 흘러내린다.
- `wave-down`: 01 낮음 → 02 중간 → 03 높음.

```yaml
- grid: "trio"
  tone: "paper"
  variant: "wave-up"
  photos: [p01, p02, p03]
```

## 4장

### lead-two-wide

- 1번째: 왼쪽 큰 lead
- 2/3번째: 오른쪽 위 보조 사진
- 4번째: 오른쪽 아래 wide

### wide-two-lead

- 1번째: 왼쪽 위 wide
- 2/3번째: 왼쪽 아래 보조 사진
- 4번째: 오른쪽 큰 lead

`order`:

- `manual`: 작성한 순서를 그대로 유지. 기본값.
- `auto`: 위 두 4장 grid에서만 지원. 현재 wide 슬롯이 portrait이고 같은 section 안에 landscape가 있으면 landscape 한 장과 wide 슬롯의 photo payload만 swap한다.

`auto`는 랜덤 재정렬이 아니라 wide 슬롯을 위한 최소 swap이다.

```yaml
- grid: "wide-two-lead"
  tone: "paper"
  order: "auto"
  photos: [p01, p02, p03, p04]
```

## 5장

### lead-four

- 1번째: 왼쪽 큰 프레임
- 2/3/4/5번째: 오른쪽 2×2 보조 프레임

### four-lead

- 1/2/3/4번째: 왼쪽 2×2 보조 프레임
- 5번째: 오른쪽 큰 프레임

variant:

- `normal`: 큰 슬롯을 일반 lead로 렌더링. 기본값.
- `wide`: 큰 슬롯을 wide renderer로 렌더링.

5장 grid에는 `order: auto`가 없다. landscape를 크게 쓰고 싶으면 큰 슬롯 위치로 photo id를 직접 옮기고 `variant: wide`를 지정한다.

## wide renderer

wide 역할을 받는 위치:

- `grid: wide`
- `statement + variant: wide`
- `lead-two-wide` 4번째 슬롯
- `wide-two-lead` 1번째 슬롯
- `lead-four + variant: wide` 1번째 슬롯
- `four-lead + variant: wide` 5번째 슬롯

실제 landscape는 `naturalWidth > naturalHeight`일 때 source ratio를 유지한다. portrait는 blurred backdrop + 중앙 세로 원본으로 렌더링되므로 portrait가 wide 슬롯에 들어가도 오류가 아니다.

## 장수별 빠른 선택

| 장수 | grid |
| ---: | --- |
| 1 | `statement(normal/wide)`, `wide` |
| 2 | `pair` |
| 3 | `lead-two`, `two-lead`, `trio` |
| 4 | `lead-two-wide`, `wide-two-lead` |
| 5 | `lead-four`, `four-lead` |

남는 장수는 6=3+3, 7=4+3, 8=5+3 또는 4+4, 9=5+4, 10=5+5처럼 나눈다. landscape가 연속으로 여러 장이면 5장에 억지로 넣기보다 `wide`, 4장 wide grid, `pair` 등으로 나눈다.

## 작성 체크리스트

- photos 개수와 grid 요구 장수가 맞는가?
- 같은 photo id를 두 번 사용하지 않았는가?
- 촬영 순서는 가능한 유지하고 wide 승격 때문에 필요한 최소 이동만 했는가?
- `variant`가 지원되는 grid에만 붙어 있는가?
- `order: auto`는 4장 `lead-two-wide / wide-two-lead`에만 붙였는가?
- 그룹 tone과 개별 section tone을 혼동하지 않았는가?
- 중간 글이 필요하면 `type: interlude`를 사용했는가?

## 검증

기본 검증:

```bash
ruby tools/validate_photo_posts.rb
```

경고까지 실패로 처리:

```bash
PHOTO_VALIDATE_STRICT=1 ruby tools/validate_photo_posts.rb
```

향후 `photo_data`를 사용하는 포스트는 `_data/photo_posts/<name>.yml`을 source of truth로 사용할 수 있도록 gallery renderer가 준비되어 있다.
