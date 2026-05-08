/**
 * Approximation and scattering method visualizations
 *
 * This module owns the later-methods page: variational estimates, WKB, partial
 * waves, optical theorem, driven transitions, and selection rules. The helpers are
 * small analytic approximations used only for visualization, so they stay beside
 * their drawings instead of becoming a shared physics library.
 */

import { TAU, clear, drawArrow, drawText, gaussian, grid, palette, setupCanvas } from "../shared/canvas.js";

export function variationalEnergy(alpha, lambda) {
  return alpha / 4 + 1 / (4 * alpha) + (3 * lambda) / (4 * alpha * alpha);
}

export function drawVariational() {
  const canvas = document.querySelector("#variational-canvas");
  const alphaSlider = document.querySelector("#variational-alpha");
  const lambdaSlider = document.querySelector("#variational-lambda");
  const readout = document.querySelector("#variational-readout");
  if (!canvas || !alphaSlider || !lambdaSlider || !readout) return;

  const alpha = Number(alphaSlider.value) / 100;
  const lambda = Number(lambdaSlider.value) / 100;
  const energy = variationalEnergy(alpha, lambda);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const left = width * 0.08;
  const right = width * 0.62;
  const top = height * 0.14;
  const bottom = height * 0.78;
  const xMin = -3.2;
  const xMax = 3.2;
  const maxY = 4.5;
  const xToPx = (x) => left + ((x - xMin) / (xMax - xMin)) * (right - left);
  const yToPx = (y) => bottom - (Math.min(maxY, Math.max(0, y)) / maxY) * (bottom - top);
  const potential = (x) => 0.5 * x * x + lambda * Math.pow(x, 4);
  const density = (x) => Math.sqrt(alpha / Math.PI) * Math.exp(-alpha * x * x);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.stroke();

  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 280; i += 1) {
    const x = xMin + (i / 280) * (xMax - xMin);
    const px = xToPx(x);
    const py = yToPx(potential(x));
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(31,111,178,0.14)";
  ctx.beginPath();
  ctx.moveTo(xToPx(xMin), bottom);
  for (let i = 0; i <= 280; i += 1) {
    const x = xMin + (i / 280) * (xMax - xMin);
    const px = xToPx(x);
    const py = yToPx(density(x) * 3.1);
    ctx.lineTo(px, py);
  }
  ctx.lineTo(xToPx(xMax), bottom);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 280; i += 1) {
    const x = xMin + (i / 280) * (xMax - xMin);
    const px = xToPx(x);
    const py = yToPx(density(x) * 3.1);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.strokeStyle = palette.red;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(left, yToPx(energy));
  ctx.lineTo(right, yToPx(energy));
  ctx.stroke();
  ctx.setLineDash([]);

  drawText(ctx, "V(x) = x^2 / 2 + lambda x^4", left + 10, top + 10, 13, palette.ink);
  drawText(ctx, "trial |phi_alpha|^2", left + 10, yToPx(density(0) * 3.1) - 16, 13, palette.blue);
  drawText(ctx, "E(alpha)", right - 8, yToPx(energy) - 14, 13, palette.red, "right");
  drawText(ctx, "x", (left + right) / 2, bottom + 28, 13, palette.ink, "center");

  const curveLeft = width * 0.7;
  const curveRight = width * 0.94;
  const curveTop = height * 0.2;
  const curveBottom = height * 0.78;
  const alphaMin = 0.35;
  const alphaMax = 2.2;
  let minEnergy = Infinity;
  let minAlpha = alphaMin;
  let maxEnergyCurve = 0;
  const energySamples = [];
  for (let i = 0; i <= 180; i += 1) {
    const a = alphaMin + (i / 180) * (alphaMax - alphaMin);
    const e = variationalEnergy(a, lambda);
    energySamples.push({ a, e });
    if (e < minEnergy) {
      minEnergy = e;
      minAlpha = a;
    }
    maxEnergyCurve = Math.max(maxEnergyCurve, e);
  }
  const curveMax = Math.max(maxEnergyCurve, energy) * 1.08;
  const alphaToPx = (a) => curveLeft + ((a - alphaMin) / (alphaMax - alphaMin)) * (curveRight - curveLeft);
  const eToPy = (e) => curveBottom - (e / curveMax) * (curveBottom - curveTop);

  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(curveLeft, curveBottom);
  ctx.lineTo(curveRight, curveBottom);
  ctx.moveTo(curveLeft, curveTop);
  ctx.lineTo(curveLeft, curveBottom);
  ctx.stroke();

  ctx.strokeStyle = palette.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  energySamples.forEach((point, index) => {
    const px = alphaToPx(point.a);
    const py = eToPy(point.e);
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(alphaToPx(alpha), eToPy(energy), 7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = palette.green;
  ctx.beginPath();
  ctx.arc(alphaToPx(minAlpha), eToPy(minEnergy), 6, 0, TAU);
  ctx.fill();

  drawText(ctx, "E(alpha)", curveLeft, curveTop - 24, 14, palette.green);
  drawText(ctx, "alpha", (curveLeft + curveRight) / 2, curveBottom + 28, 13, palette.ink, "center");
  drawText(ctx, "best", alphaToPx(minAlpha), eToPy(minEnergy) - 18, 12, palette.green, "center");
  ctx.restore();

  readout.value = `alpha = ${alpha.toFixed(2)}, lambda = ${lambda.toFixed(2)}, E(alpha) = ${energy.toFixed(3)}, best bound ${minEnergy.toFixed(3)} at alpha ${minAlpha.toFixed(2)}`;
}

export function wkbPotential(x, beta) {
  return 0.5 * x * x + beta * Math.pow(x, 4);
}

export function wkbTurningPoint(energy, beta) {
  let low = 0;
  let high = 1;
  while (wkbPotential(high, beta) < energy && high < 8) high *= 1.25;
  for (let i = 0; i < 50; i += 1) {
    const mid = (low + high) / 2;
    if (wkbPotential(mid, beta) < energy) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export function wkbMomentum(x, energy, beta) {
  return Math.sqrt(Math.max(0, 2 * (energy - wkbPotential(x, beta))));
}

export function wkbAction(energy, beta) {
  const turning = wkbTurningPoint(energy, beta);
  const steps = 900;
  const dx = (2 * turning) / steps;
  let area = 0;
  for (let i = 0; i < steps; i += 1) {
    const x = -turning + (i + 0.5) * dx;
    area += wkbMomentum(x, energy, beta) * dx;
  }
  return area;
}

export function drawWkb() {
  const canvas = document.querySelector("#wkb-canvas");
  const energySlider = document.querySelector("#wkb-energy");
  const betaSlider = document.querySelector("#wkb-beta");
  const readout = document.querySelector("#wkb-readout");
  if (!canvas || !energySlider || !betaSlider || !readout) return;

  const energy = Number(energySlider.value) / 100;
  const beta = Number(betaSlider.value) / 100;
  const turning = wkbTurningPoint(energy, beta);
  const action = wkbAction(energy, beta);
  const actionOverPi = action / Math.PI;
  const nearestN = Math.max(0, Math.round(actionOverPi - 0.5));
  const quantizedTarget = nearestN + 0.5;
  const mismatch = actionOverPi - quantizedTarget;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const left = width * 0.08;
  const right = width * 0.64;
  const top = height * 0.12;
  const bottom = height * 0.78;
  const xMax = Math.max(3.4, turning * 1.32);
  const xMin = -xMax;
  const yMax = Math.max(6.1, energy * 1.22);
  const xToPx = (x) => left + ((x - xMin) / (xMax - xMin)) * (right - left);
  const yToPx = (y) => bottom - (Math.min(yMax, Math.max(0, y)) / yMax) * (bottom - top);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.stroke();

  ctx.fillStyle = "rgba(19,138,134,0.13)";
  ctx.beginPath();
  ctx.moveTo(xToPx(-turning), yToPx(energy));
  for (let i = 0; i <= 240; i += 1) {
    const x = -turning + (i / 240) * 2 * turning;
    ctx.lineTo(xToPx(x), yToPx(wkbPotential(x, beta)));
  }
  ctx.lineTo(xToPx(turning), yToPx(energy));
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(23,32,42,0.3)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 360; i += 1) {
    const x = xMin + (i / 360) * (xMax - xMin);
    const y = yToPx(wkbPotential(x, beta));
    if (i === 0) ctx.moveTo(xToPx(x), y);
    else ctx.lineTo(xToPx(x), y);
  }
  ctx.stroke();

  const energyY = yToPx(energy);
  ctx.strokeStyle = palette.red;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(left, energyY);
  ctx.lineTo(right, energyY);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const point of [-turning, turning]) {
    const x = xToPx(point);
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, yToPx(wkbPotential(point, beta)));
    ctx.lineTo(x, top);
    ctx.stroke();
    ctx.fillStyle = palette.gold;
    ctx.beginPath();
    ctx.arc(x, energyY, 5, 0, TAU);
    ctx.fill();
  }

  let phase = Math.PI / 4;
  let previousX = -turning;
  let previousP = wkbMomentum(previousX + 0.001, energy, beta);
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  for (let i = 0; i <= 340; i += 1) {
    const x = -turning + (i / 340) * 2 * turning;
    const p = Math.max(wkbMomentum(x, energy, beta), 0.08);
    if (i > 0) {
      const dx = x - previousX;
      phase += ((previousP + p) / 2) * dx;
    }
    const amp = Math.min(42, 16 / Math.sqrt(p));
    const y = energyY - Math.sin(phase) * amp;
    if (i === 0) ctx.moveTo(xToPx(x), y);
    else ctx.lineTo(xToPx(x), y);
    previousX = x;
    previousP = p;
  }
  ctx.stroke();

  ctx.strokeStyle = palette.teal;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 80; i += 1) {
    const x = xMin + (i / 80) * (xMax + turning);
    const decay = Math.exp(-1.8 * Math.max(0, -turning - x));
    const y = energyY - 26 * decay;
    if (i === 0) ctx.moveTo(xToPx(x), y);
    else ctx.lineTo(xToPx(x), y);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= 80; i += 1) {
    const x = turning + (i / 80) * (xMax - turning);
    const decay = Math.exp(-1.8 * Math.max(0, x - turning));
    const y = energyY - 26 * decay;
    if (i === 0) ctx.moveTo(xToPx(x), y);
    else ctx.lineTo(xToPx(x), y);
  }
  ctx.stroke();

  drawText(ctx, "V(x) = x^2 / 2 + beta x^4", left + 10, top + 14, 13, palette.ink);
  drawText(ctx, "E", right - 8, energyY - 12, 13, palette.red, "right");
  drawText(ctx, "allowed region", (xToPx(-turning) + xToPx(turning)) / 2, bottom - 18, 12, palette.teal, "center");
  drawText(ctx, "turning points", xToPx(turning), top + 24, 12, palette.gold, "center");
  drawText(ctx, "WKB oscillation", left + 12, energyY - 42, 13, palette.blue);
  drawText(ctx, "decay", xToPx(xMax) - 10, energyY - 32, 12, palette.teal, "right");

  const curveLeft = width * 0.72;
  const curveRight = width * 0.94;
  const curveTop = height * 0.18;
  const curveBottom = height * 0.78;
  const minEnergy = 0.8;
  const maxEnergySlider = 5.6;
  const maxAction = wkbAction(maxEnergySlider, beta) / Math.PI;
  const eToX = (e) => curveLeft + ((e - minEnergy) / (maxEnergySlider - minEnergy)) * (curveRight - curveLeft);
  const actionToY = (value) => curveBottom - (value / Math.max(5.8, maxAction * 1.08)) * (curveBottom - curveTop);

  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(curveLeft, curveBottom);
  ctx.lineTo(curveRight, curveBottom);
  ctx.moveTo(curveLeft, curveTop);
  ctx.lineTo(curveLeft, curveBottom);
  ctx.stroke();

  ctx.strokeStyle = palette.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 120; i += 1) {
    const e = minEnergy + (i / 120) * (maxEnergySlider - minEnergy);
    const x = eToX(e);
    const y = actionToY(wkbAction(e, beta) / Math.PI);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(178,59,75,0.35)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([5, 5]);
  for (let n = 0; n <= 5; n += 1) {
    const y = actionToY(n + 0.5);
    ctx.beginPath();
    ctx.moveTo(curveLeft, y);
    ctx.lineTo(curveRight, y);
    ctx.stroke();
    drawText(ctx, `${n}+1/2`, curveRight + 6, y, 11, palette.red);
  }
  ctx.setLineDash([]);
  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.arc(eToX(energy), actionToY(actionOverPi), 7, 0, TAU);
  ctx.fill();

  drawText(ctx, "S(E) / pi", curveLeft, curveTop - 24, 14, palette.green);
  drawText(ctx, "E", (curveLeft + curveRight) / 2, curveBottom + 28, 13, palette.ink, "center");
  drawText(ctx, "quantization lines", curveRight, actionToY(5.5) - 16, 12, palette.red, "right");
  ctx.restore();

  readout.value = `E = ${energy.toFixed(2)}, beta = ${beta.toFixed(2)}, turning points = +/-${turning.toFixed(2)}, S/pi = ${actionOverPi.toFixed(3)}, nearest n = ${nearestN}, mismatch = ${mismatch.toFixed(3)}`;
}

export function normalizedScattering(theta, k, mu) {
  const q = 2 * k * Math.sin(theta / 2);
  const denom = q * q + mu * mu;
  return Math.pow(mu * mu / denom, 2);
}

export function drawScattering() {
  const canvas = document.querySelector("#scattering-canvas");
  const kSlider = document.querySelector("#scattering-k");
  const muSlider = document.querySelector("#scattering-mu");
  const readout = document.querySelector("#scattering-readout");
  if (!canvas || !kSlider || !muSlider || !readout) return;

  const k = Number(kSlider.value) / 100;
  const mu = Number(muSlider.value) / 100;
  const backwardRatio = normalizedScattering(Math.PI, k, mu);
  const rightAngleRatio = normalizedScattering(Math.PI / 2, k, mu);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const cx = width * 0.28;
  const cy = height * 0.5;
  const maxR = Math.min(width, height) * 0.24;
  const baseR = 20;

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.22)";
  ctx.lineWidth = 1.5;
  for (let r = maxR * 0.33; r <= maxR; r += maxR * 0.33) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx - maxR - 22, cy);
  ctx.lineTo(cx + maxR + 22, cy);
  ctx.moveTo(cx, cy - maxR - 22);
  ctx.lineTo(cx, cy + maxR + 22);
  ctx.stroke();

  ctx.fillStyle = "rgba(31,111,178,0.15)";
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 360; i += 1) {
    const angle = (i / 360) * TAU;
    const theta = Math.acos(Math.cos(angle));
    const strength = normalizedScattering(theta, k, mu);
    const r = baseR + Math.sqrt(strength) * maxR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 3;
  for (let offset = -34; offset <= 34; offset += 17) {
    drawArrow(ctx, cx - maxR - 88, cy + offset, cx - 18, cy + offset * 0.25, palette.gold, 2);
  }

  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, TAU);
  ctx.fill();
  drawText(ctx, "incoming beam", cx - maxR - 82, cy - 58, 13, palette.gold);
  drawText(ctx, "target", cx, cy + 28, 13, palette.red, "center");
  drawText(ctx, "forward peak", cx + maxR * 0.74, cy - 28, 13, palette.blue);

  const plotLeft = width * 0.58;
  const plotRight = width * 0.94;
  const plotTop = height * 0.18;
  const plotBottom = height * 0.78;
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();

  ctx.strokeStyle = palette.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 220; i += 1) {
    const theta = (i / 220) * Math.PI;
    const value = normalizedScattering(theta, k, mu);
    const x = plotLeft + (theta / Math.PI) * (plotRight - plotLeft);
    const y = plotBottom - Math.sqrt(value) * (plotBottom - plotTop);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const rightAngleX = plotLeft + 0.5 * (plotRight - plotLeft);
  const rightAngleY = plotBottom - Math.sqrt(rightAngleRatio) * (plotBottom - plotTop);
  const backX = plotRight;
  const backY = plotBottom - Math.sqrt(backwardRatio) * (plotBottom - plotTop);
  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(rightAngleX, rightAngleY, 5, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(backX, backY, 5, 0, TAU);
  ctx.fill();

  drawText(ctx, "sqrt(d sigma / d Omega)", plotLeft, plotTop - 26, 13, palette.green);
  drawText(ctx, "0", plotLeft, plotBottom + 24, 12, palette.ink, "center");
  drawText(ctx, "pi/2", rightAngleX, plotBottom + 24, 12, palette.ink, "center");
  drawText(ctx, "pi", plotRight, plotBottom + 24, 12, palette.ink, "center");
  drawText(ctx, "scattering angle theta", (plotLeft + plotRight) / 2, plotBottom + 46, 13, palette.ink, "center");
  ctx.restore();

  readout.value = `k = ${k.toFixed(2)}, mu = ${mu.toFixed(2)}, dσ(π/2)/dσ(0) = ${rightAngleRatio.toFixed(3)}, dσ(π)/dσ(0) = ${backwardRatio.toFixed(3)}`;
}

export function rutherfordCrossSection(theta, strength, energy) {
  const sinHalf = Math.max(0.025, Math.sin(theta / 2));
  return Math.pow(strength / (4 * energy), 2) / Math.pow(sinHalf, 4);
}

export function drawRutherford(t = 0) {
  const canvas = document.querySelector("#rutherford-canvas");
  const energySlider = document.querySelector("#rutherford-energy");
  const strengthSlider = document.querySelector("#rutherford-strength");
  const angleSlider = document.querySelector("#rutherford-angle");
  const readout = document.querySelector("#rutherford-readout");
  if (!canvas || !energySlider || !strengthSlider || !angleSlider || !readout) return;

  const energy = Number(energySlider.value) / 100;
  const strength = Number(strengthSlider.value) / 100;
  const thetaDeg = Number(angleSlider.value);
  const theta = (thetaDeg / 180) * Math.PI;
  const selectedCross = rutherfordCrossSection(theta, strength, energy);
  const rightAngleCross = rutherfordCrossSection(Math.PI / 2, strength, energy);
  const backCross = rutherfordCrossSection(Math.PI, strength, energy);
  const impact = (strength / (2 * energy)) * Math.max(0.05, 1 / Math.tan(theta / 2));

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 700;
  const cx = compact ? width * 0.5 : width * 0.3;
  const cy = compact ? height * 0.25 : height * 0.47;
  const maxR = Math.min(width, height) * (compact ? 0.18 : 0.24);
  const minTheta = (8 / 180) * Math.PI;
  const maxCross = rutherfordCrossSection(minTheta, strength, energy);
  const selectedRadius = Math.sqrt(selectedCross / maxCross) * maxR;

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 1.5;
  for (const scale of [0.3, 0.6, 0.9]) {
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * scale, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx - maxR - 16, cy);
  ctx.lineTo(cx + maxR + 16, cy);
  ctx.moveTo(cx, cy - maxR - 16);
  ctx.lineTo(cx, cy + maxR + 16);
  ctx.stroke();

  const samples = [];
  for (let i = 0; i <= 360; i += 1) {
    const angle = (i / 360) * TAU;
    const scatteringTheta = Math.max(minTheta, Math.acos(Math.cos(angle)));
    const value = rutherfordCrossSection(scatteringTheta, strength, energy);
    samples.push({ angle, value });
  }
  ctx.fillStyle = "rgba(31,111,178,0.14)";
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  samples.forEach((sample, index) => {
    const radius = 16 + Math.sqrt(sample.value / maxCross) * (maxR - 16);
    const x = cx + Math.cos(sample.angle) * radius;
    const y = cy + Math.sin(sample.angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, TAU);
  ctx.fill();
  drawText(ctx, "Coulomb center", cx, cy + 30, compact ? 11 : 13, palette.red, "center");
  drawText(ctx, "forward divergence", cx + maxR - 4, cy - 28, compact ? 11 : 13, palette.blue, "right");

  const beamStart = cx - maxR - (compact ? 74 : 96);
  const beamEnd = cx - 18;
  for (const offset of [-36, -18, 0, 18, 36]) {
    drawArrow(ctx, beamStart, cy + offset, beamEnd, cy + offset * 0.22, palette.gold, 2);
  }
  drawText(ctx, "incoming alpha", beamStart, cy - 62, compact ? 11 : 13, palette.gold);

  const selectedX = cx + Math.cos(theta) * (18 + selectedRadius);
  const selectedY = cy - Math.sin(theta) * (18 + selectedRadius);
  drawArrow(ctx, cx, cy, selectedX, selectedY, palette.red, 2.5);
  drawText(ctx, `θ=${thetaDeg}°`, selectedX + 8, selectedY, compact ? 11 : 13, palette.red);

  const trajScale = compact ? 28 : 36;
  const trajY = cy + Math.min(maxR * 0.9, impact * trajScale);
  ctx.strokeStyle = palette.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(beamStart, trajY);
  ctx.bezierCurveTo(cx - maxR * 0.28, trajY, cx - maxR * 0.16, cy + Math.sign(trajY - cy) * 28, cx + maxR * 0.2, cy + Math.sign(trajY - cy) * 26);
  ctx.stroke();
  drawArrow(ctx, cx + maxR * 0.2, cy + Math.sign(trajY - cy) * 26, cx + maxR * 0.86, cy + Math.sign(trajY - cy) * (26 - 0.45 * maxR), palette.teal, 2.5);
  drawText(ctx, `impact b≈${impact.toFixed(2)}`, cx - maxR * 0.2, trajY + 18, compact ? 10 : 12, palette.teal);

  const plotLeft = compact ? width * 0.1 : width * 0.58;
  const plotRight = compact ? width * 0.9 : width * 0.94;
  const plotTop = compact ? height * 0.48 : height * 0.16;
  const plotBottom = compact ? height * 0.72 : height * 0.56;
  const logMin = -3.5;
  const logMax = Math.log10(maxCross);
  const thetaToX = (value) => plotLeft + ((value - minTheta) / (Math.PI - minTheta)) * (plotRight - plotLeft);
  const logToY = (value) => plotBottom - ((value - logMin) / (logMax - logMin)) * (plotBottom - plotTop);
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();

  ctx.strokeStyle = palette.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 240; i += 1) {
    const valueTheta = minTheta + (i / 240) * (Math.PI - minTheta);
    const cross = rutherfordCrossSection(valueTheta, strength, energy);
    const x = thetaToX(valueTheta);
    const y = logToY(Math.log10(cross));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const selectedPlotX = thetaToX(theta);
  const selectedPlotY = logToY(Math.log10(selectedCross));
  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(selectedPlotX, selectedPlotY, 5, 0, TAU);
  ctx.fill();
  drawText(ctx, "log10(dσ/dΩ)", plotLeft, plotTop - 24, compact ? 11 : 13, palette.green);
  drawText(ctx, "θ", (plotLeft + plotRight) / 2, plotBottom + 36, compact ? 11 : 12, palette.ink, "center");
  drawText(ctx, "8°", plotLeft, plotBottom + 18, 10, palette.ink, "center");
  drawText(ctx, "180°", plotRight, plotBottom + 18, 10, palette.ink, "center");

  const cardX = compact ? width * 0.1 : width * 0.59;
  const cardY = compact ? height * 0.79 : height * 0.66;
  const cardW = compact ? width * 0.78 : width * 0.33;
  const cardH = compact ? height * 0.18 : height * 0.21;
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  const lineGap = compact ? 17 : 23;
  drawText(ctx, `κ=${strength.toFixed(2)}, E=${energy.toFixed(2)}`, cardX + 14, cardY + 24, compact ? 11 : 13, palette.ink);
  drawText(ctx, `dσ(θ)/dΩ = ${selectedCross.toExponential(2)}`, cardX + 14, cardY + 24 + lineGap, compact ? 10 : 12, palette.red);
  drawText(ctx, `dσ(90°)/dΩ = ${rightAngleCross.toExponential(2)}`, cardX + 14, cardY + 24 + 2 * lineGap, compact ? 10 : 12, palette.green);
  drawText(ctx, `dσ(180°)/dΩ = ${backCross.toExponential(2)}`, cardX + 14, cardY + 24 + 3 * lineGap, compact ? 10 : 12, palette.blue);
  ctx.restore();

  readout.value = `E=${energy.toFixed(2)}, kappa=${strength.toFixed(2)}, theta=${thetaDeg}°, impact b≈${impact.toFixed(2)}, dσ/dΩ=${selectedCross.toExponential(3)}, dσ(90°)=${rightAngleCross.toExponential(3)}`;
}

export function legendreP(level, x) {
  if (level === 0) return 1;
  if (level === 1) return x;
  return (3 * x * x - 1) / 2;
}

export function partialWaveAmplitude(theta, phases) {
  const x = Math.cos(theta);
  let real = 0;
  let imag = 0;
  phases.forEach((delta, level) => {
    const weight = (2 * level + 1) * legendreP(level, x);
    real += weight * Math.sin(delta) * Math.cos(delta);
    imag += weight * Math.sin(delta) * Math.sin(delta);
  });
  return { real, imag, magnitudeSquared: real * real + imag * imag };
}

export function drawPartialWaves() {
  const canvas = document.querySelector("#partial-waves-canvas");
  const sSlider = document.querySelector("#phase-s");
  const pSlider = document.querySelector("#phase-p");
  const dSlider = document.querySelector("#phase-d");
  const readout = document.querySelector("#partial-waves-readout");
  if (!canvas || !sSlider || !pSlider || !dSlider || !readout) return;

  const phases = [Number(sSlider.value), Number(pSlider.value), Number(dSlider.value)].map((degrees) => (degrees / 180) * Math.PI);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 680;
  const maxR = compact ? Math.min(width * 0.28, height * 0.17) : Math.min(width, height) * 0.31;
  const cx = compact ? width * 0.5 : Math.max(width * 0.32, maxR + 112);
  const cy = compact ? height * 0.22 : height * 0.48;
  const samples = [];
  let maxValue = 0;
  for (let i = 0; i <= 360; i += 1) {
    const theta = (i / 360) * TAU;
    const scatteringTheta = Math.acos(Math.cos(theta));
    const value = partialWaveAmplitude(scatteringTheta, phases).magnitudeSquared;
    samples.push({ theta, value });
    maxValue = Math.max(maxValue, value);
  }
  maxValue = Math.max(maxValue, 0.001);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.25)";
  ctx.lineWidth = 1.5;
  for (const radius of [0.25, 0.5, 0.75, 1]) {
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * radius, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx - maxR - 12, cy);
  ctx.lineTo(cx + maxR + 12, cy);
  ctx.moveTo(cx, cy - maxR - 12);
  ctx.lineTo(cx, cy + maxR + 12);
  ctx.stroke();

  ctx.fillStyle = "rgba(31,111,178,0.13)";
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  samples.forEach((point, index) => {
    const radius = 18 + Math.sqrt(point.value / maxValue) * (maxR - 18);
    const x = cx + Math.cos(point.theta) * radius;
    const y = cy - Math.sin(point.theta) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const beamStart = Math.max(16, cx - maxR - (compact ? 72 : 88));
  const beamEnd = Math.max(beamStart + 42, cx - maxR - 18);
  drawArrow(ctx, beamStart, cy, beamEnd, cy, palette.gold, 2);
  drawText(ctx, "incoming k", beamStart, cy - 24, 13, palette.gold);
  drawText(ctx, "forward", cx + maxR + 12, cy + 4, 12, palette.ink);
  drawText(ctx, "backward", cx - maxR - 16, cy + 22, 12, palette.ink, "right");
  drawText(ctx, "differential pattern", cx, cy + maxR + 32, 13, palette.blue, "center");

  const plotLeft = compact ? 42 : width * 0.62;
  const plotRight = compact ? width - 24 : width * 0.93;
  const plotTop = compact ? height * 0.45 : height * 0.16;
  const plotBottom = compact ? height * 0.64 : height * 0.52;
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();

  ctx.strokeStyle = palette.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 220; i += 1) {
    const theta = (i / 220) * Math.PI;
    const value = partialWaveAmplitude(theta, phases).magnitudeSquared;
    const x = plotLeft + (theta / Math.PI) * (plotRight - plotLeft);
    const y = plotBottom - (value / maxValue) * (plotBottom - plotTop);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  drawText(ctx, "dσ/dΩ", plotLeft, plotTop - 22, 13, palette.green);
  drawText(ctx, "0", plotLeft, plotBottom + 22, 12, palette.ink, "center");
  drawText(ctx, "π/2", (plotLeft + plotRight) / 2, plotBottom + 22, 12, palette.ink, "center");
  drawText(ctx, "π", plotRight, plotBottom + 22, 12, palette.ink, "center");
  drawText(ctx, "scattering angle θ", (plotLeft + plotRight) / 2, plotBottom + 44, 12, palette.ink, "center");

  const channelLeft = compact ? 18 : width * 0.62;
  const channelTop = compact ? height * 0.79 : height * 0.67;
  const channelWidth = compact ? Math.max(130, width - 126) : width * 0.24;
  const channelGap = compact ? 38 : 42;
  const channels = [
    { label: "s wave ℓ=0", color: palette.blue, phase: phases[0] },
    { label: "p wave ℓ=1", color: palette.red, phase: phases[1] },
    { label: "d wave ℓ=2", color: palette.teal, phase: phases[2] },
  ];
  channels.forEach((channel, index) => {
    const y = channelTop + index * channelGap;
    const contribution = (2 * index + 1) * Math.sin(channel.phase) * Math.sin(channel.phase);
    ctx.fillStyle = `${channel.color}33`;
    ctx.fillRect(channelLeft, y, channelWidth * Math.min(1, contribution / 5), 18);
    ctx.strokeStyle = channel.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(channelLeft, y, channelWidth, 18);
    drawText(ctx, channel.label, channelLeft, y - 8, 12, channel.color);
    drawText(ctx, `sin²δ=${Math.pow(Math.sin(channel.phase), 2).toFixed(2)}`, channelLeft + channelWidth + 8, y + 13, 12, palette.ink);
  });

  const totalCrossSection = 4 * Math.PI * phases.reduce((sum, phase, level) => sum + (2 * level + 1) * Math.sin(phase) * Math.sin(phase), 0);
  const forward = partialWaveAmplitude(0, phases).magnitudeSquared;
  const rightAngle = partialWaveAmplitude(Math.PI / 2, phases).magnitudeSquared;
  const backward = partialWaveAmplitude(Math.PI, phases).magnitudeSquared;
  ctx.restore();

  readout.value = `δ0 = ${sSlider.value}°, δ1 = ${pSlider.value}°, δ2 = ${dSlider.value}°, σ_tot/k^-2 = ${totalCrossSection.toFixed(2)}, forward = ${forward.toFixed(2)}, side = ${rightAngle.toFixed(2)}, back = ${backward.toFixed(2)}`;
}

export function opticalAmplitude(theta, phases, eta, k = 1) {
  const x = Math.cos(theta);
  let real = 0;
  let imag = 0;
  phases.forEach((delta, level) => {
    const weight = (2 * level + 1) * legendreP(level, x);
    const sRealMinusOne = eta * Math.cos(2 * delta) - 1;
    const sImag = eta * Math.sin(2 * delta);
    real += (weight * sImag) / (2 * k);
    imag += (-weight * sRealMinusOne) / (2 * k);
  });
  return { real, imag, magnitudeSquared: real * real + imag * imag };
}

export function opticalCrossSections(phases, eta, k = 1) {
  let total = 0;
  let elastic = 0;
  let absorption = 0;
  phases.forEach((delta, level) => {
    const weight = 2 * level + 1;
    total += (2 * Math.PI * weight * (1 - eta * Math.cos(2 * delta))) / (k * k);
    elastic += (Math.PI * weight * (1 - 2 * eta * Math.cos(2 * delta) + eta * eta)) / (k * k);
    absorption += (Math.PI * weight * (1 - eta * eta)) / (k * k);
  });
  const forward = opticalAmplitude(0, phases, eta, k);
  return { total, elastic, absorption, forward, opticalTotal: (4 * Math.PI * forward.imag) / k };
}

export function drawOpticalTheorem(t = 0) {
  const canvas = document.querySelector("#optical-canvas");
  const sSlider = document.querySelector("#optical-s");
  const pSlider = document.querySelector("#optical-p");
  const dSlider = document.querySelector("#optical-d");
  const etaSlider = document.querySelector("#optical-eta");
  const readout = document.querySelector("#optical-readout");
  if (!canvas || !sSlider || !pSlider || !dSlider || !etaSlider || !readout) return;

  const phases = [Number(sSlider.value), Number(pSlider.value), Number(dSlider.value)].map((degrees) => (degrees / 180) * Math.PI);
  const eta = Number(etaSlider.value) / 100;
  const cross = opticalCrossSections(phases, eta, 1);
  const balanceError = cross.opticalTotal - (cross.elastic + cross.absorption);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 700;
  const argandX = compact ? width * 0.5 : width * 0.23;
  const argandY = compact ? height * 0.22 : height * 0.42;
  const argandR = Math.min(width, height) * (compact ? 0.16 : 0.19);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(argandX, argandY, argandR, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(argandX - argandR - 14, argandY);
  ctx.lineTo(argandX + argandR + 14, argandY);
  ctx.moveTo(argandX, argandY + argandR + 14);
  ctx.lineTo(argandX, argandY - argandR - 14);
  ctx.stroke();

  const channelColors = [palette.blue, palette.red, palette.teal];
  phases.forEach((delta, level) => {
    const sx = argandX + eta * Math.cos(2 * delta) * argandR;
    const sy = argandY - eta * Math.sin(2 * delta) * argandR;
    ctx.strokeStyle = channelColors[level];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(argandX, argandY);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.fillStyle = channelColors[level];
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, TAU);
    ctx.fill();
    drawText(ctx, `S_${level}`, sx + 8, sy - 8, compact ? 11 : 12, channelColors[level]);
  });
  drawText(ctx, "partial-wave S_l plane", argandX, argandY + argandR + 34, compact ? 12 : 13, palette.ink, "center");
  drawText(ctx, "unitarity circle", argandX, argandY - argandR - 24, compact ? 11 : 12, palette.muted, "center");

  const plotLeft = compact ? width * 0.1 : width * 0.48;
  const plotRight = compact ? width * 0.9 : width * 0.94;
  const plotTop = compact ? height * 0.44 : height * 0.16;
  const plotBottom = compact ? height * 0.62 : height * 0.48;
  let maxPattern = 0.001;
  const pattern = [];
  for (let i = 0; i <= 220; i += 1) {
    const theta = (i / 220) * Math.PI;
    const value = opticalAmplitude(theta, phases, eta).magnitudeSquared;
    pattern.push({ theta, value });
    maxPattern = Math.max(maxPattern, value);
  }
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();
  ctx.strokeStyle = palette.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  pattern.forEach((point, index) => {
    const x = plotLeft + (point.theta / Math.PI) * (plotRight - plotLeft);
    const y = plotBottom - (point.value / maxPattern) * (plotBottom - plotTop);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  drawText(ctx, "elastic dσ/dΩ", plotLeft, plotTop - 24, compact ? 12 : 13, palette.green);
  drawText(ctx, "0", plotLeft, plotBottom + 22, 11, palette.ink, "center");
  drawText(ctx, "π", plotRight, plotBottom + 22, 11, palette.ink, "center");
  drawText(ctx, "θ", (plotLeft + plotRight) / 2, plotBottom + 42, 12, palette.ink, "center");

  const barLeft = compact ? width * 0.1 : width * 0.48;
  const barTop = compact ? height * 0.64 : height * 0.64;
  const barWidth = compact ? width * 0.58 : width * 0.3;
  const barGap = compact ? 30 : 42;
  const maxCross = Math.max(cross.total, cross.elastic + cross.absorption, 0.001);
  const bars = [
    ["4π Im f(0)/k", cross.opticalTotal, palette.gold],
    ["σ_elastic", cross.elastic, palette.blue],
    ["σ_absorbed", cross.absorption, palette.red],
  ];
  bars.forEach((bar, index) => {
    const y = barTop + index * barGap;
    ctx.fillStyle = `${bar[2]}33`;
    ctx.fillRect(barLeft, y, barWidth * (bar[1] / maxCross), 18);
    ctx.strokeStyle = bar[2];
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barLeft, y, barWidth, 18);
    drawText(ctx, bar[0], barLeft, y - 10, compact ? 11 : 12, bar[2]);
    drawText(ctx, bar[1].toFixed(2), barLeft + barWidth + 10, y + 10, compact ? 11 : 12, palette.ink);
  });

  const cardX = compact ? width * 0.1 : width * 0.12;
  const cardY = compact ? height * 0.8 : height * 0.68;
  const cardW = compact ? width * 0.78 : width * 0.28;
  const cardH = compact ? height * 0.19 : height * 0.22;
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, `η = ${eta.toFixed(2)} (${eta < 0.995 ? "open channels" : "elastic"})`, cardX + 14, cardY + 26, compact ? 11 : 13, palette.ink);
  drawText(ctx, `Im f(0) = ${cross.forward.imag.toFixed(3)}`, cardX + 14, cardY + 52, compact ? 11 : 13, palette.gold);
  drawText(ctx, `σ_tot = ${cross.total.toFixed(2)}`, cardX + 14, cardY + 78, compact ? 11 : 13, palette.green);
  drawText(ctx, `balance error = ${balanceError.toExponential(1)}`, cardX + 14, cardY + 104, compact ? 10 : 12, Math.abs(balanceError) < 1e-9 ? palette.green : palette.red);
  ctx.restore();

  readout.value = `δ0=${sSlider.value}°, δ1=${pSlider.value}°, δ2=${dSlider.value}°, η=${eta.toFixed(2)}, 4π Im f(0)/k=${cross.opticalTotal.toFixed(3)}, σ_el+σ_abs=${(cross.elastic + cross.absorption).toFixed(3)}`;
}

export function transitionProbability(time, omega, detuning) {
  const rabi = Math.sqrt(omega * omega + detuning * detuning);
  if (rabi < 0.001) return 0;
  return (omega * omega / (rabi * rabi)) * Math.pow(Math.sin((rabi * time) / 2), 2);
}

export function drawTransitions(t = 0) {
  const canvas = document.querySelector("#transitions-canvas");
  const detuningSlider = document.querySelector("#transition-detuning");
  const couplingSlider = document.querySelector("#transition-coupling");
  const readout = document.querySelector("#transition-readout");
  if (!canvas || !detuningSlider || !couplingSlider || !readout) return;

  const detuning = Number(detuningSlider.value) / 100;
  const omega = Number(couplingSlider.value) / 100;
  const rabi = Math.sqrt(omega * omega + detuning * detuning);
  const maxProbability = rabi > 0 ? (omega * omega) / (rabi * rabi) : 0;
  const currentTime = (t * 0.9) % 18;
  const currentProbability = transitionProbability(currentTime, omega, detuning);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const levelX = width * 0.2;
  const levelTop = height * 0.25;
  const levelBottom = height * 0.72;
  const levelWidth = width * 0.22;

  ctx.save();
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(levelX - levelWidth / 2, levelBottom);
  ctx.lineTo(levelX + levelWidth / 2, levelBottom);
  ctx.moveTo(levelX - levelWidth / 2, levelTop);
  ctx.lineTo(levelX + levelWidth / 2, levelTop);
  ctx.stroke();

  const arrowColor = Math.abs(detuning) < 0.18 ? palette.teal : palette.gold;
  drawArrow(ctx, levelX, levelBottom - 12, levelX, levelTop + 12, arrowColor, 4);
  ctx.strokeStyle = "rgba(178,59,75,0.6)";
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 7]);
  const detunedTop = levelTop + detuning * 46;
  ctx.beginPath();
  ctx.moveTo(levelX - levelWidth / 2 - 18, detunedTop);
  ctx.lineTo(levelX + levelWidth / 2 + 18, detunedTop);
  ctx.stroke();
  ctx.setLineDash([]);

  const popG = 1 - currentProbability;
  const popE = currentProbability;
  ctx.fillStyle = "rgba(31,111,178,0.18)";
  ctx.fillRect(levelX + levelWidth / 2 + 24, levelBottom - popG * 70, 42, popG * 70);
  ctx.strokeStyle = palette.blue;
  ctx.strokeRect(levelX + levelWidth / 2 + 24, levelBottom - popG * 70, 42, popG * 70);
  ctx.fillStyle = "rgba(178,59,75,0.2)";
  ctx.fillRect(levelX + levelWidth / 2 + 78, levelTop + (1 - popE) * 70, 42, popE * 70);
  ctx.strokeStyle = palette.red;
  ctx.strokeRect(levelX + levelWidth / 2 + 78, levelTop + (1 - popE) * 70, 42, popE * 70);

  drawText(ctx, "|g>", levelX - levelWidth / 2 - 28, levelBottom, 15, palette.blue, "right");
  drawText(ctx, "|e>", levelX - levelWidth / 2 - 28, levelTop, 15, palette.red, "right");
  drawText(ctx, "drive", levelX + 16, (levelTop + levelBottom) / 2, 13, arrowColor);
  drawText(ctx, "detuning", levelX + levelWidth / 2 + 24, detunedTop - 14, 12, palette.red);
  drawText(ctx, "Pg", levelX + levelWidth / 2 + 45, levelBottom + 22, 12, palette.blue, "center");
  drawText(ctx, "Pe", levelX + levelWidth / 2 + 99, levelTop - 22, 12, palette.red, "center");

  const plotLeft = width * 0.48;
  const plotRight = width * 0.94;
  const plotTop = height * 0.18;
  const plotBottom = height * 0.78;
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();

  ctx.strokeStyle = "rgba(178,59,75,0.45)";
  ctx.lineWidth = 1.8;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom - maxProbability * (plotBottom - plotTop));
  ctx.lineTo(plotRight, plotBottom - maxProbability * (plotBottom - plotTop));
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = palette.red;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 300; i += 1) {
    const time = (i / 300) * 18;
    const probability = transitionProbability(time, omega, detuning);
    const x = plotLeft + (time / 18) * (plotRight - plotLeft);
    const y = plotBottom - probability * (plotBottom - plotTop);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const cursorX = plotLeft + (currentTime / 18) * (plotRight - plotLeft);
  const cursorY = plotBottom - currentProbability * (plotBottom - plotTop);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cursorX, plotTop);
  ctx.lineTo(cursorX, plotBottom);
  ctx.stroke();
  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.arc(cursorX, cursorY, 6, 0, TAU);
  ctx.fill();

  drawText(ctx, "P_e(t)", plotLeft, plotTop - 26, 14, palette.red);
  drawText(ctx, "time", (plotLeft + plotRight) / 2, plotBottom + 30, 13, palette.ink, "center");
  drawText(ctx, "max on this detuning", plotRight, plotBottom - maxProbability * (plotBottom - plotTop) - 14, 12, palette.red, "right");
  ctx.restore();

  readout.value = `Delta = ${detuning.toFixed(2)}, Omega = ${omega.toFixed(2)}, Omega_R = ${rabi.toFixed(2)}, max Pe = ${maxProbability.toFixed(3)}, current Pe = ${currentProbability.toFixed(3)}`;
}

export function dipoleAngularStrength(l, m, q, finalL) {
  if (finalL < 0) return 0;
  const finalM = m + q;
  if (Math.abs(finalM) > finalL) return 0;
  if (Math.abs(finalL - l) !== 1) return 0;

  if (q === 0) {
    if (finalL === l + 1) return Math.max(0, ((l + 1) * (l + 1) - m * m) / ((2 * l + 1) * (2 * l + 3)));
    if (l === 0) return 0;
    return Math.max(0, (l * l - m * m) / ((2 * l - 1) * (2 * l + 1)));
  }

  if (q === 1) {
    if (finalL === l + 1) return Math.max(0, ((l + m + 1) * (l + m + 2)) / ((2 * l + 1) * (2 * l + 3)));
    return Math.max(0, ((l - m) * (l - m - 1)) / ((2 * l - 1) * (2 * l + 1)));
  }

  if (finalL === l + 1) return Math.max(0, ((l - m + 1) * (l - m + 2)) / ((2 * l + 1) * (2 * l + 3)));
  return Math.max(0, ((l + m) * (l + m - 1)) / ((2 * l - 1) * (2 * l + 1)));
}

export function drawSelectionRules() {
  const canvas = document.querySelector("#selection-canvas");
  const lSlider = document.querySelector("#selection-l");
  const mSlider = document.querySelector("#selection-m");
  const qSelect = document.querySelector("#selection-q");
  const readout = document.querySelector("#selection-readout");
  if (!canvas || !lSlider || !mSlider || !qSelect || !readout) return;

  const l = Number(lSlider.value);
  let m = Number(mSlider.value);
  if (Math.abs(m) > l) {
    m = Math.max(-l, Math.min(l, m));
    mSlider.value = String(m);
  }
  const q = Number(qSelect.value);
  const finalM = m + q;
  const candidates = [l - 1, l + 1].map((finalL) => ({
    finalL,
    finalM,
    strength: dipoleAngularStrength(l, m, q, finalL),
  }));
  const allowed = candidates.filter((candidate) => candidate.strength > 0);

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 680;
  const leftX = compact ? width * 0.08 : width * 0.1;
  const centerX = compact ? width * 0.5 : width * 0.48;
  const rightX = compact ? width * 0.08 : width * 0.68;
  const topY = compact ? height * 0.12 : height * 0.2;
  const rowGap = compact ? 72 : 86;
  const barWidth = compact ? width * 0.72 : width * 0.22;
  const maxStrength = Math.max(0.001, ...candidates.map((candidate) => candidate.strength));

  ctx.save();
  drawText(ctx, "initial state", leftX, topY - 48, compact ? 13 : 15, palette.ink);
  ctx.fillStyle = "rgba(31,111,178,0.16)";
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(leftX, topY - 28, compact ? width * 0.52 : width * 0.22, 76, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, `|n, ℓ=${l}, m=${m}⟩`, leftX + 14, topY, compact ? 14 : 16, palette.blue);
  drawText(ctx, `parity Π=${l % 2 === 0 ? "+1" : "-1"}`, leftX + 14, topY + 28, compact ? 12 : 13, palette.ink);

  const photonY = compact ? topY + 118 : topY + 10;
  const photonBoxW = compact ? width * 0.58 : width * 0.18;
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.strokeStyle = palette.gold;
  ctx.beginPath();
  ctx.roundRect(centerX - photonBoxW / 2, photonY - 42, photonBoxW, 84, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, "dipole operator", centerX, photonY - 18, compact ? 13 : 14, palette.ink, "center");
  drawText(ctx, `rank 1, q=${q > 0 ? "+1" : q}`, centerX, photonY + 7, compact ? 12 : 13, palette.gold, "center");
  drawText(ctx, "odd parity", centerX, photonY + 29, compact ? 11 : 12, palette.red, "center");

  if (compact) {
    drawArrow(ctx, centerX, topY + 54, centerX, photonY - 48, palette.gold, 2);
  } else {
    drawArrow(ctx, leftX + width * 0.25, topY + 10, centerX - photonBoxW / 2 - 24, photonY, palette.gold, 2);
  }

  drawText(ctx, "candidate final angular states", rightX, (compact ? photonY + 108 : topY - 48), compact ? 13 : 15, palette.ink);
  candidates.forEach((candidate, index) => {
    const y = (compact ? photonY + 132 : topY - 14) + index * rowGap;
    const validQuantumNumbers = candidate.finalL >= 0 && Math.abs(candidate.finalM) <= candidate.finalL;
    const color = candidate.strength > 0 ? palette.green : palette.red;
    const status = candidate.strength > 0 ? "allowed" : validQuantumNumbers ? "wrong Δℓ" : "no state";
    ctx.fillStyle = `${color}22`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rightX, y - 22, barWidth, 44, 7);
    ctx.fill();
    ctx.stroke();
    drawText(ctx, `ℓ'=${candidate.finalL}, m'=${candidate.finalM}`, rightX + 10, y - 5, compact ? 12 : 14, color);
    drawText(ctx, status, rightX + 10, y + 15, compact ? 11 : 12, palette.ink);
    ctx.fillStyle = `${palette.teal}55`;
    const strengthWidth = (barWidth - 20) * (candidate.strength / maxStrength);
    ctx.fillRect(rightX + 10, y + 25, strengthWidth, 8);
    if (candidate.strength > 0) {
      if (compact) {
        drawText(ctx, `relative |angular|² ${candidate.strength.toFixed(3)}`, rightX + 10, y + 42, 10, palette.teal);
      } else {
        drawText(ctx, `relative |angular|² ${candidate.strength.toFixed(3)}`, rightX + barWidth + 14, y + 2, 12, palette.teal);
      }
    }
    if (!compact) {
      drawArrow(ctx, centerX + photonBoxW / 2 + 22, photonY, rightX - 18, y, color, 2);
    }
  });

  const ruleY = compact ? height * 0.78 : height * 0.67;
  const rules = [
    ["Δℓ = ±1", allowed.length > 0],
    [`Δm = q = ${q > 0 ? "+1" : q}`, allowed.length > 0],
    ["parity flips", true],
  ];
  rules.forEach((rule, index) => {
    const x = compact ? width * 0.12 : width * (0.13 + index * 0.24);
    const y = compact ? ruleY + index * 32 : ruleY;
    ctx.fillStyle = rule[1] ? "rgba(82,127,60,0.15)" : "rgba(178,59,75,0.15)";
    ctx.strokeStyle = rule[1] ? palette.green : palette.red;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, compact ? width * 0.74 : width * 0.18, 26, 6);
    ctx.fill();
    ctx.stroke();
    drawText(ctx, rule[0], x + 12, y + 13, compact ? 12 : 13, palette.ink);
  });
  ctx.restore();

  if (allowed.length === 0) {
    readout.value = `ℓ=${l}, m=${m}, q=${q}: dark transition; no final state satisfies Δℓ=±1 and Δm=q`;
  } else {
    readout.value = `ℓ=${l}, m=${m}, q=${q}: allowed ${allowed.map((item) => `ℓ'=${item.finalL}, m'=${item.finalM}`).join("; ")}`;
  }
}
