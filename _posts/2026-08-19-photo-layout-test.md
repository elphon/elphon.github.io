---
date: 2026-08-19 14:18:00 +0900
layout: post-photo
title: "Photo Layout Test"
subtitle: "사진 없이 먼저 확인하는 여행·사진 포스트 레이아웃"
description: "post-photo 레이아웃의 구조와 타이포그래피를 확인하기 위한 테스트 포스트"
category: Travel
type: photo
location: "Seoul, Korea"
tags:
  - travel
  - photography
  - layout-test
author: Elphon
---

<section class="photo-story-intro">
  <p>
    이 포스트는 사진 콘텐츠를 실제로 연결하기 전에 제목, 위치 정보, 본문 간격,
    캡션과 텍스트 흐름을 먼저 확인하기 위한 레이아웃 테스트입니다.
  </p>
</section>

<section class="photo-story-section">
  <div class="photo-story-meta">
    <span class="photo-index">01</span>
    <span class="photo-location">Seoul · Afternoon</span>
  </div>

  <figure class="photo-story-frame">
    <!-- 사진이 들어갈 자리. 실제 운영 시 여기에 img 요소를 추가합니다. -->
    <figcaption>첫 번째 장면의 짧은 캡션이 들어가는 자리입니다.</figcaption>
  </figure>

  <p>
    여행 중 기억하고 싶은 순간을 길게 설명하기보다는 사진의 분위기를 해치지 않을 정도의
    짧은 기록을 남기는 영역입니다.
  </p>
</section>

<section class="photo-story-section">
  <div class="photo-story-meta">
    <span class="photo-index">02</span>
    <span class="photo-location">Street · Evening</span>
  </div>

  <figure class="photo-story-frame">
    <!-- 사진이 들어갈 자리. -->
    <figcaption>장소나 시간, 촬영 당시의 짧은 메모를 넣을 수 있습니다.</figcaption>
  </figure>

  <p>
    각 사진 사이에는 필요한 경우에만 짧은 글을 배치하고, 사진이 중심이 되는 리듬을 유지합니다.
  </p>
</section>

<section class="photo-story-section">
  <div class="photo-story-meta">
    <span class="photo-index">03</span>
    <span class="photo-location">Night · 23:42</span>
  </div>

  <figure class="photo-story-frame">
    <!-- 사진이 들어갈 자리. -->
    <figcaption>마지막 사진에 대한 캡션 영역입니다.</figcaption>
  </figure>

  <p>
    사진을 나중에 외부 스토리지나 CDN에 올리더라도 이 문서의 구조는 그대로 두고
    이미지 URL만 연결할 수 있도록 구성합니다.
  </p>
</section>
