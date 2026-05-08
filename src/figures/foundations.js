/**
 * Foundational visualizations
 *
 * Introductory figures used by the landing and foundations pages live here.
 * These routines intentionally read their sliders/readouts from the DOM on every
 * draw, then return immediately when the current page does not contain their
 * canvas. That guard lets one global animation loop drive every page without
 * page-specific entrypoints.
 */

import { TAU, clear, drawArrow, drawText, gaussian, grid, palette, setupCanvas } from "../shared/canvas.js";

export function drawHero(t) {
  const canvas = document.querySelector("#hero-wave");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 54);

  const mid = height * 0.52;
  const amp = height * 0.18;
  const sigma = width * 0.2;
  const center = width * (0.52 + 0.12 * Math.sin(t * 0.28));

  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = palette.blue;
  ctx.beginPath();
  for (let px = 0; px <= width; px += 4) {
    const x = px - center;
    const envelope = gaussian(x, sigma);
    const phase = px * 0.035 - t * 2.2;
    const y = mid - Math.sin(phase) * amp * envelope;
    if (px === 0) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, mid, 0, height);
  gradient.addColorStop(0, "rgba(31,111,178,0.18)");
  gradient.addColorStop(1, "rgba(31,111,178,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, mid);
  for (let px = 0; px <= width; px += 4) {
    const x = px - center;
    const envelope = gaussian(x, sigma);
    const y = mid + envelope * envelope * amp * 1.4;
    ctx.lineTo(px, y);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 9; i += 1) {
    const px = width * (0.13 + i * 0.09);
    const x = px - center;
    const envelope = gaussian(x, sigma);
    const phase = px * 0.035 - t * 2.2;
    const r = 10 + envelope * 14;
    const py = mid - Math.sin(phase) * amp * envelope;
    ctx.strokeStyle = `rgba(19,138,134,${0.25 + envelope * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, TAU);
    ctx.stroke();
    drawArrow(ctx, px, py, px + Math.cos(phase) * r, py + Math.sin(phase) * r, palette.teal, 2);
  }

  drawText(ctx, "amplitude", 32, 34, 14, palette.ink);
  drawText(ctx, "probability density", width - 34, height - 30, 14, palette.muted, "right");
  ctx.restore();
}

export function drawPacket(t) {
  const canvas = document.querySelector("#packet-canvas");
  const slider = document.querySelector("#packet-width");
  const output = document.querySelector("#packet-width-value");
  if (!canvas || !slider || !output) return;
  const widthSetting = Number(slider.value);
  output.value = `${widthSetting}`;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const mid = height * 0.5;
  const sigma = width * (widthSetting / 450);
  const center = width * 0.5;
  const amp = height * 0.22;

  ctx.strokeStyle = "rgba(23,32,42,0.38)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, mid);
  ctx.lineTo(width - 30, mid);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = palette.blue;
  ctx.beginPath();
  for (let px = 24; px <= width - 24; px += 3) {
    const x = px - center;
    const env = gaussian(x, sigma);
    const y = mid - Math.sin(px * 0.05 - t * 2.6) * amp * env;
    if (px === 24) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(178,59,75,0.18)";
  ctx.beginPath();
  ctx.moveTo(24, mid);
  for (let px = 24; px <= width - 24; px += 3) {
    const x = px - center;
    const env = gaussian(x, sigma);
    ctx.lineTo(px, mid - env * env * amp * 0.95);
  }
  ctx.lineTo(width - 24, mid);
  ctx.closePath();
  ctx.fill();

  drawText(ctx, "Re(psi)", 34, 34, 14, palette.blue);
  drawText(ctx, "|psi|^2", 34, 58, 14, palette.red);
}

export function drawDoubleSlit(t) {
  const canvas = document.querySelector("#slit-canvas");
  const lambdaSlider = document.querySelector("#wavelength");
  const spacingSlider = document.querySelector("#slit-spacing");
  if (!canvas || !lambdaSlider || !spacingSlider) return;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const lambda = Number(lambdaSlider.value);
  const slitSpacing = Number(spacingSlider.value);
  const barrierX = width * 0.34;
  const screenX = width * 0.88;
  const centerY = height * 0.5;
  const sourceX = width * 0.13;
  const slitA = { x: barrierX, y: centerY - slitSpacing / 2 };
  const slitB = { x: barrierX, y: centerY + slitSpacing / 2 };

  ctx.strokeStyle = "rgba(23,32,42,0.65)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(barrierX, 22);
  ctx.lineTo(barrierX, slitA.y - 18);
  ctx.moveTo(barrierX, slitA.y + 18);
  ctx.lineTo(barrierX, slitB.y - 18);
  ctx.moveTo(barrierX, slitB.y + 18);
  ctx.lineTo(barrierX, height - 22);
  ctx.stroke();

  ctx.strokeStyle = "rgba(19,138,134,0.28)";
  ctx.lineWidth = 1.3;
  for (const slit of [slitA, slitB]) {
    for (let r = ((t * 54) % lambda) + lambda; r < width; r += lambda) {
      ctx.beginPath();
      ctx.arc(slit.x, slit.y, r, -0.9, 0.9);
      ctx.stroke();
    }
  }

  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.arc(sourceX, centerY, 9, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(170,123,24,0.36)";
  for (let r = ((t * 54) % lambda) + lambda; r < width * 0.25; r += lambda) {
    ctx.beginPath();
    ctx.arc(sourceX, centerY, r, -0.55, 0.55);
    ctx.stroke();
  }

  const screenTop = 34;
  const screenBottom = height - 34;
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(screenX, screenTop);
  ctx.lineTo(screenX, screenBottom);
  ctx.stroke();

  for (let y = screenTop; y <= screenBottom; y += 3) {
    const d1 = Math.hypot(screenX - slitA.x, y - slitA.y);
    const d2 = Math.hypot(screenX - slitB.x, y - slitB.y);
    const phase = (TAU * (d1 - d2)) / lambda;
    const envelope = gaussian(y - centerY, height * 0.33);
    const intensity = Math.pow(Math.cos(phase / 2), 2) * envelope;
    const bar = 8 + intensity * width * 0.12;
    ctx.strokeStyle = `rgba(31,111,178,${0.2 + intensity * 0.78})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(screenX, y);
    ctx.lineTo(screenX + bar, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(178,59,75,0.55)";
  ctx.lineWidth = 1.5;
  for (const slit of [slitA, slitB]) {
    ctx.beginPath();
    ctx.moveTo(sourceX, centerY);
    ctx.lineTo(slit.x, slit.y);
    ctx.lineTo(screenX, centerY);
    ctx.stroke();
  }

  for (const slit of [slitA, slitB]) {
    ctx.fillStyle = "#fcfefd";
    ctx.strokeStyle = palette.teal;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(slit.x, slit.y, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  drawText(ctx, "source", sourceX, centerY + 28, 13, palette.gold, "center");
  drawText(ctx, "barrier", barrierX, 24, 13, palette.ink, "center");
  drawText(ctx, "screen", screenX + 28, 24, 13, palette.ink, "center");
}

export function drawBloch() {
  const canvas = document.querySelector("#bloch-canvas");
  const thetaSlider = document.querySelector("#theta");
  const phiSlider = document.querySelector("#phi");
  const readout = document.querySelector("#state-readout");
  if (!canvas || !thetaSlider || !phiSlider || !readout) return;
  const thetaDeg = Number(thetaSlider.value);
  const phiDeg = Number(phiSlider.value);
  const theta = (thetaDeg / 180) * Math.PI;
  const phi = (phiDeg / 180) * Math.PI;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const cx = width * 0.5;
  const cy = height * 0.52;
  const r = Math.min(width, height) * 0.32;
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.cos(theta);
  const z = Math.sin(theta) * Math.sin(phi);
  const px = cx + x * r + z * r * 0.34;
  const py = cy - y * r - z * r * 0.12;
  const p0 = Math.pow(Math.cos(theta / 2), 2);
  const p1 = 1 - p0;

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.32, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();

  drawArrow(ctx, cx, cy, px, py, palette.red, 4);
  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(px, py, 7, 0, TAU);
  ctx.fill();

  drawText(ctx, "|0>", cx, cy - r - 20, 15, palette.ink, "center");
  drawText(ctx, "|1>", cx, cy + r + 22, 15, palette.ink, "center");
  drawText(ctx, "phase phi", cx + r * 0.85, cy + r * 0.28, 13, palette.teal, "center");
  drawText(ctx, `P(0) ${(p0 * 100).toFixed(1)}%`, 28, height - 54, 14, palette.blue);
  drawText(ctx, `P(1) ${(p1 * 100).toFixed(1)}%`, 28, height - 30, 14, palette.red);
  ctx.restore();

  readout.value = `theta ${thetaDeg} deg, phi ${phiDeg} deg, P(0) ${p0.toFixed(3)}, P(1) ${p1.toFixed(3)}`;
}

export const measurement = {
  zero: 0,
  one: 0,
  dots: [],
};

export function addShot() {
  const slider = document.querySelector("#prob-zero");
  const p0 = Number(slider.value) / 100;
  const value = Math.random() < p0 ? 0 : 1;
  if (value === 0) measurement.zero += 1;
  else measurement.one += 1;
  measurement.dots.push({ value, age: 0 });
  if (measurement.dots.length > 96) measurement.dots.shift();
}

export function drawMeasurement() {
  const canvas = document.querySelector("#measurement-canvas");
  const slider = document.querySelector("#prob-zero");
  const readout = document.querySelector("#shot-readout");
  if (!canvas || !slider || !readout) return;
  const p0 = Number(slider.value) / 100;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 46);

  const total = measurement.zero + measurement.one;
  const plotLeft = 60;
  const plotBottom = height - 64;
  const barWidth = Math.min(120, width * 0.18);
  const maxBar = height * 0.5;
  const observed0 = total ? measurement.zero / total : 0;
  const observed1 = total ? measurement.one / total : 0;

  drawText(ctx, "Born rule target", plotLeft, 36, 13, palette.muted);
  ctx.strokeStyle = "rgba(31,111,178,0.5)";
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom - p0 * maxBar);
  ctx.lineTo(width - 44, plotBottom - p0 * maxBar);
  ctx.stroke();
  ctx.strokeStyle = "rgba(178,59,75,0.5)";
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom - (1 - p0) * maxBar);
  ctx.lineTo(width - 44, plotBottom - (1 - p0) * maxBar);
  ctx.stroke();
  ctx.setLineDash([]);

  const bars = [
    { label: "0", value: observed0, x: width * 0.33, color: palette.blue },
    { label: "1", value: observed1, x: width * 0.62, color: palette.red },
  ];
  for (const bar of bars) {
    const h = Math.max(2, bar.value * maxBar);
    ctx.fillStyle = `${bar.color}33`;
    ctx.fillRect(bar.x - barWidth / 2, plotBottom - h, barWidth, h);
    ctx.strokeStyle = bar.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(bar.x - barWidth / 2, plotBottom - h, barWidth, h);
    drawText(ctx, bar.label, bar.x, plotBottom + 22, 15, palette.ink, "center");
    drawText(ctx, `${Math.round(bar.value * 100)}%`, bar.x, plotBottom - h - 16, 13, bar.color, "center");
  }

  measurement.dots.forEach((dot, i) => {
    dot.age += 1;
    const row = Math.floor(i / 16);
    const col = i % 16;
    const x = 44 + col * 14;
    const y = 72 + row * 14;
    ctx.fillStyle = dot.value === 0 ? palette.blue : palette.red;
    ctx.globalAlpha = Math.max(0.22, 1 - dot.age / 180);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  readout.value = `${total} trials, ${measurement.zero} zero, ${measurement.one} one`;
}

export function drawUncertainty() {
  const canvas = document.querySelector("#uncertainty-canvas");
  const slider = document.querySelector("#spread");
  const readout = document.querySelector("#uncertainty-readout");
  if (!canvas || !slider || !readout) return;
  const spread = Number(slider.value);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const xMid = width * 0.5;
  const topMid = height * 0.31;
  const bottomMid = height * 0.72;
  const posSigma = width * (spread / 520);
  const momSigma = width * (0.34 - spread / 620);
  const amp = height * 0.16;

  ctx.strokeStyle = "rgba(23,32,42,0.35)";
  ctx.lineWidth = 1.5;
  for (const y of [topMid, bottomMid]) {
    ctx.beginPath();
    ctx.moveTo(34, y);
    ctx.lineTo(width - 34, y);
    ctx.stroke();
  }

  function curve(midY, sigma, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 34; px <= width - 34; px += 3) {
      const env = gaussian(px - xMid, sigma);
      const y = midY - env * amp;
      if (px === 34) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
  }

  curve(topMid, posSigma, palette.blue);
  curve(bottomMid, Math.max(width * 0.035, momSigma), palette.green);

  drawText(ctx, "position distribution", 42, topMid - amp - 22, 14, palette.blue);
  drawText(ctx, "momentum distribution", 42, bottomMid - amp - 22, 14, palette.green);
  readout.value = `Delta x ${(posSigma / width).toFixed(3)}, Delta p ${(1 / (posSigma / width * 36)).toFixed(3)}`;
}
