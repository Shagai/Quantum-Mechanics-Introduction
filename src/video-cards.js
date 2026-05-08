/**
 * Lazy loading for optional rendered videos.
 *
 * Manim videos are expensive generated assets. Cards advertise a data-src, and
 * this helper waits until a card is near the viewport or explicitly interacted
 * with before probing the file. Missing videos are replaced with an actionable
 * placeholder instead of leaving a broken media control in the lesson.
 */

export function prepareVideoCards() {
  const cards = [...document.querySelectorAll("[data-video-card]")];
  const loadVideo = (card) => {
    const video = card.querySelector("video");
    if (!video || video.dataset.loaded === "true") return;
    const src = video.dataset.src;
    if (!src) return;
    video.dataset.loaded = "true";
    fetch(src, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) throw new Error("missing");
        video.preload = "metadata";
        video.src = src;
        video.load();
      })
      .catch(() => {
        const missing = document.createElement("div");
        missing.className = "video-missing";
        missing.textContent = "Video asset not rendered yet. Run npm run render:manim after installing ManimGL.";
        video.replaceWith(missing);
      });
  };

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadVideo(entry.target);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "700px 0px" })
    : null;

  cards.forEach((card) => {
    const video = card.querySelector("video");
    if (video) video.preload = "none";
    observer?.observe(card);
    card.addEventListener("pointerenter", () => loadVideo(card), { once: true });
    card.addEventListener("focusin", () => loadVideo(card), { once: true });
    card.addEventListener("touchstart", () => loadVideo(card), { once: true, passive: true });
    if (!observer) loadVideo(card);
  });
}
