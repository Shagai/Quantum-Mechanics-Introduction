/**
 * Shared canvas primitives for every interactive figure.
 *
 * The site renders many independent Canvas 2D diagrams. Keeping the low-level
 * drawing helpers here makes each physics module focus on its own model:
 * querying controls, computing normalized coordinates, and drawing the result.
 * Coordinates throughout the visual modules are expressed in CSS pixels; the
 * setupCanvas function below maps those CSS pixels onto a device-pixel-ratio
 * backing store so text and thin curves stay sharp on high-density displays.
 */

/** One full turn in radians; using TAU avoids repeated Math.PI * 2 noise. */
export const TAU = Math.PI * 2;

/**
 * Device-pixel-ratio cap used for all canvases.
 *
 * A DPR higher than 2 rarely improves these educational diagrams, but it can
 * make animation expensive on large screens. This preserves crisp output while
 * keeping the continuous animation loop affordable.
 */
export const DPR = Math.min(window.devicePixelRatio || 1, 2);

/**
 * Shared color vocabulary for the course visuals.
 *
 * The palette names describe semantic roles rather than exact hues. Individual
 * modules can therefore use palette.blue for a primary state, palette.red for a
 * comparison state, palette.gold for phases/eigenvalues, and so on without
 * hard-coding unrelated colors in each drawing routine.
 */
export const palette = {
  ink: "#17202a",
  muted: "#60707d",
  rule: "#d7dedc",
  blue: "#1f6fb2",
  teal: "#138a86",
  red: "#b23b4b",
  gold: "#aa7b18",
  green: "#527f3c",
  paper: "#fbfaf7",
};

/**
 * Prepare a canvas for immediate drawing and return its 2D context plus size.
 *
 * The DOM gives us the layout size in CSS pixels. The canvas backing store must
 * be scaled separately, otherwise curves and text blur on retina displays. The
 * transform call lets the rest of the code continue drawing in CSS-pixel units.
 */
export function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width));
  const height = Math.max(240, Math.round(rect.height));
  const backingWidth = Math.round(width * DPR);
  const backingHeight = Math.round(height * DPR);
  if (canvas.width !== backingWidth) canvas.width = backingWidth;
  if (canvas.height !== backingHeight) canvas.height = backingHeight;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return { ctx, width, height };
}

/** Clear to the course paper color so every frame starts from a known surface. */
export function clear(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fcfefd";
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw a quiet Cartesian guide grid.
 *
 * The grid is intentionally low contrast: it gives motion and scale a reference
 * without competing with probability densities, state vectors, or spectra.
 */
export function grid(ctx, width, height, step = 44) {
  ctx.save();
  ctx.strokeStyle = "rgba(96,112,125,0.12)";
  ctx.lineWidth = 1;
  for (let x = step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Common label renderer.
 *
 * Most figure labels are diagram annotations rather than document text. Keeping
 * text baseline, family, fill color, and alignment behavior in one function
 * makes the dense canvas drawings visually consistent across pages.
 */
export function drawText(ctx, text, x, y, size = 13, color = palette.muted, align = "left") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = String(size) + "px Inter, system-ui, sans-serif";
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Draw a line segment with a filled arrow head sized for diagram annotations. */
export function drawArrow(ctx, x1, y1, x2, y2, color = palette.ink, width = 3) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10 * Math.cos(angle - 0.45), y2 - 10 * Math.sin(angle - 0.45));
  ctx.lineTo(x2 - 10 * Math.cos(angle + 0.45), y2 - 10 * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Gaussian envelope used by wave packets, densities, and qualitative orbitals. */
export function gaussian(x, sigma) {
  return Math.exp(-(x * x) / (2 * sigma * sigma));
}
