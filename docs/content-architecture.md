# Content architecture

The blog separates **topic**, **content type**, and **presentation** so new content does not require page-specific HTML/CSS/JS.

## Front matter responsibilities

- `category`: what the post is about (`Security`, `Travel`, `Photography`, ...)
- `type`: how the content is consumed (`article`, `lab`, `research`, `photo`, `journal`)
- `layout`: how the page is rendered (`post`, `post-tech`, `post-photo`, `post-canvas`)
- `tags`: detailed searchable keywords

Category must not select the layout automatically. For example, a Security essay may use `post`, while a Security lab may use `post-tech`.

## Layout rules

### `post`

Default article layout. Use for normal reading-oriented posts.

### `post-tech`

Reusable technical documentation layout for labs, environment metadata, terminal/code-heavy guides, and research notes. It shares the common post footer/chrome through `_includes/post/end.html` and requests `TechArticle` structured data from that include.

### `post-photo`

Photography and visual-story layout. It owns the immersive hero, 3:4 portrait gallery, lightbox/fullscreen viewer, and photo-specific CSS/JavaScript.

### `post-canvas`

Escape hatch for genuinely unique pages that cannot be expressed with the reusable layouts above. Do not use it only because a post needs a different color, card, table, or code block.

`postcustum` remains only as a temporary deprecated compatibility alias for `post-canvas`. New posts must not use `postcustum`; migrate legacy posts before deleting the alias.

## Shared UI

Common post chrome belongs in `_includes/post/` rather than being copied between layouts.

Current shared include:

- `_includes/post/end.html`: time bar, recommendation/modals, subscription, share, author, comments, site footer, MathJax, and structured data. `schema_type` can override the default `BlogPosting` type when a layout needs a more specific schema such as `TechArticle`.

## Asset rules

Reusable CSS and JavaScript must live under `assets/` or `_sass/`.

Do not embed large `<style>` or `<script>` blocks inside `_posts/*.md`. If a feature appears in more than one post, promote it to a reusable component/include and shared asset.

Current layout-specific assets include:

```text
assets/css/photo-post.css
assets/js/photo-post.js
```

Recommended direction for future reusable components:

```text
_layouts/
  post.html
  post-tech.html
  post-photo.html
  post-canvas.html

_includes/
  post/
  tech/
  photo/

_sass/
  components/
  layouts/

assets/js/
  tech/
  photo/
```

## Migration policy

Refactors should preserve existing URLs and rendered content first. Migrate legacy layout references before deleting compatibility aliases. Remove temporary test/debug posts once their purpose is finished.
