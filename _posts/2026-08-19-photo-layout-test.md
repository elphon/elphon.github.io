---
date: 2026-08-19 18:34:00 +0900
layout: post-photo
title: "Photo Layout Test"
subtitle: "여행·사진 포스트 레이아웃 테스트"
description: "post-photo 레이아웃, 이미지 배치, 캡션, 추천 카드 동작을 확인하기 위한 테스트 포스트"
category: Travel
type: photo
location: "Seoul, Korea"
tags:
  - travel
  - photography
  - layout-test
author: Elphon

# 현재 post-photo 레이아웃에서 대표 이미지로 바로 사용됩니다.
image: "https://ik.imagekit.io/7gsxpuecqj/%EC%A0%9C%EC%A3%BC%EB%8F%84%202025%2007%2012%202025%2008%2001/20250712_172755_HDR.jpeg"
image_alt: "Photo layout test cover"
image_caption: "대표 이미지 테스트 — 실제 운영에서는 이 URL만 교체하면 됩니다."

# 향후 Hero Slider에서 사용할 데이터 틀입니다.
hero:
  - src: "https://ik.imagekit.io/7gsxpuecqj/%EC%A0%9C%EC%A3%BC%EB%8F%84%202025%2007%2012%202025%2008%2001/20250712_172755_HDR.jpeg"
    alt: "Hero image 01"
    caption: "Hero 01"
  - src: ""
    alt: "Hero image 02"
    caption: "두 번째 Hero 이미지 URL"
  - src: ""
    alt: "Hero image 03"
    caption: "세 번째 Hero 이미지 URL"

# 향후 Gallery / Lightbox에서 사용할 데이터 틀입니다.
photos:
  - src: "https://ik.imagekit.io/7gsxpuecqj/%EC%A0%9C%EC%A3%BC%EB%8F%84%202025%2007%2012%202025%2008%2001/20250712_172755_HDR.jpeg"
    alt: "Gallery image 01"
    caption: "첫 번째 사진"
    meta: "35mm · f/2.8 · ISO 200"
  - src: ""
    alt: "Gallery image 02"
    caption: "두 번째 사진"
    meta: "50mm · f/2 · ISO 400"
  - src: ""
    alt: "Gallery image 03"
    caption: "세 번째 사진"
  - src: ""
    alt: "Featured wide photo"
    caption: "전체 폭으로 보여줄 사진"
    featured: true
---

<section class="photo-story-intro">
  <p>
    이 포스트는 사진 콘텐츠 UI를 테스트하기 위한 샘플입니다. 대표 이미지, 본문 이미지,
    캡션, 긴 텍스트, 그리고 글 끝의 추천 카드가 서로 겹치지 않는지 확인할 수 있습니다.
  </p>
</section>

<section class="photo-story-section">
  <div class="photo-story-meta">
    <span class="photo-index">01</span>
    <span class="photo-location">Jeju · Afternoon</span>
  </div>

  <figure class="photo-story-frame">
    <img
      src="https://ik.imagekit.io/7gsxpuecqj/%EC%A0%9C%EC%A3%BC%EB%8F%84%202025%2007%2012%202025%2008%2001/20250712_172755_HDR.jpeg"
      alt="Photo layout sample image"
      loading="lazy">
    <figcaption>실제 URL이 연결된 첫 번째 테스트 이미지입니다.</figcaption>
  </figure>

  <p>
    여행 중 기억하고 싶은 순간을 사진과 함께 기록하는 영역입니다. 실제 글에서는 이 문단을
    촬영 당시의 상황이나 장소에 대한 짧은 기록으로 교체하면 됩니다.
  </p>
</section>

<section class="photo-story-section">
  <div class="photo-story-meta">
    <span class="photo-index">02</span>
    <span class="photo-location">Street · Evening</span>
  </div>

  <figure class="photo-story-frame">
    <!--
      실제 이미지를 넣을 때 아래 주석을 풀고 URL만 교체하면 됩니다.

      <img
        src="https://example.com/photo/photo-02.jpg"
        alt="두 번째 사진 설명"
        loading="lazy">
    -->
    <figcaption>두 번째 이미지 URL을 넣을 자리입니다.</figcaption>
  </figure>

  <p>
    이미지 URL이 아직 없어도 섹션 구조와 캡션 위치를 먼저 만들어 둘 수 있습니다.
  </p>
</section>

<section class="photo-story-section">
  <div class="photo-story-meta">
    <span class="photo-index">03</span>
    <span class="photo-location">Night · 23:42</span>
  </div>

  <figure class="photo-story-frame">
    <!--
      <img
        src="https://example.com/photo/photo-03.jpg"
        alt="세 번째 사진 설명"
        loading="lazy">
    -->
    <figcaption>세 번째 사진에 대한 캡션 영역입니다.</figcaption>
  </figure>

  <p>
    사진을 외부 스토리지나 CDN에 올린 뒤에는 문서 구조를 바꿀 필요 없이 URL만 연결하면 됩니다.
  </p>
</section>

## 새 사진 추가용 템플릿

아래 블록을 복사해서 사진 섹션을 추가하면 됩니다.

```html
<section class="photo-story-section">
  <div class="photo-story-meta">
    <span class="photo-index">04</span>
    <span class="photo-location">Location · Time</span>
  </div>

  <figure class="photo-story-frame">
    <img
      src="https://example.com/photo/photo-04.jpg"
      alt="사진 설명"
      loading="lazy">
    <figcaption>사진 캡션</figcaption>
  </figure>

  <p>사진에 대한 짧은 글</p>
</section>
```

## Front Matter 이미지 데이터 틀

```yaml
image: "https://example.com/photo/cover.jpg"

hero:
  - src: "https://example.com/photo/hero-01.jpg"
    alt: "사진 설명"
    caption: "장소 또는 짧은 캡션"

photos:
  - src: "https://example.com/photo/photo-01.jpg"
    alt: "사진 설명"
    caption: "사진 캡션"
    meta: "35mm · f/2.8 · ISO 200"
  - src: "https://example.com/photo/photo-02.jpg"
    alt: "사진 설명"
    featured: true
```

마지막 구간입니다. 여기까지 스크롤했을 때 오른쪽 아래에 나타나는 추천 카드가 중앙 본문이나
하단의 다른 클릭 가능한 콘텐츠를 가리지 않는지도 같이 확인하면 됩니다.
