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

Reserved for reusable technical documentation UI such as lab steps, terminal blocks, architecture diagrams, warnings, and environment metadata.

### `post-photo`

Reserved for photography and visual-story content. It should own the hero slider, responsive gallery, lightbox, and fullscreen behavior.

### `post-canvas`

Escape hatch for genuinely unique pages that cannot be expressed with the reusable layouts above. Do not use it only because a post needs a different color, card, table, or code block.

`postcustum` is a deprecated compatibility alias for `post-canvas`. New posts must not use `postcustum`.

## Shared UI

Common post chrome belongs in `_includes/post/` rather than being copied between layouts.

Current shared include:

- `_includes/post/end.html`: time bar, recommendation/modals, subscription, share, author, comments, site footer, MathJax, and BlogPosting structured data.

## Asset rules

Reusable CSS and JavaScript must live under `assets/` or `_sass/`.

Do not embed large `<style>` or `<script>` blocks inside `_posts/*.md`. If a feature appears in more than one post, promote it to a reusable component/include and shared asset.

Recommended direction:

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

Refactors should preserve existing URLs and rendered content first. Rename/migrate legacy layouts through compatibility aliases before deleting them.
