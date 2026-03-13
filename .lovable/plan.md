

# Plan: Background Video Hero + GLTF Upload Support

## 1. Background Video on Home Page

Copy the uploaded video to `public/videos/hero-bg.mp4`, then add a hero section with:
- Full-width video background (muted, autoplay, loop) behind the header area
- Semi-transparent overlay so text remains readable
- The existing header content (title, upload button, machine tabs) sits on top of the video
- Video covers just the header/hero area (not the full page), roughly 200px tall

## 2. GLTF Upload Support

The file input already accepts `.glb,.gltf` but the `GLTFLoader` handles both formats natively, so this already works. However, GLTF files often come as a folder with separate `.bin` and texture files. For single-file `.gltf` (embedded) it works as-is. No code change needed for the loader — just confirm the accept attribute includes both extensions (it already does).

## Files to Change

- **Copy**: `user-uploads://Interface_video.mp4` → `public/videos/hero-bg.mp4`
- **`src/pages/Index.tsx`**: Wrap header in a hero section with `<video>` background element, overlay styling, and adjusted text colors for contrast against the video

