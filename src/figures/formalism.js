/**
 * Formalism visualizations
 *
 * These diagrams cover the operator and representation machinery: Fourier
 * pairs, translations, projectors, commutators, unitary evolution, and expectation
 * value dynamics. The numerical models are deliberately lightweight; each one is
 * chosen to make the algebra visible rather than to be a full physics solver.
 */

import { TAU, clear, drawArrow, drawText, gaussian, grid, palette, setupCanvas } from "../shared/canvas.js";

export function drawMomentumSpace(t = 0) {
  const canvas = document.querySelector("#momentum-canvas");
  const sigmaSlider = document.querySelector("#momentum-sigma");
  const kSlider = document.querySelector("#momentum-k0");
  const readout = document.querySelector("#momentum-readout");
  if (!canvas || !sigmaSlider || !kSlider || !readout) return;

  const sigmaSetting = Number(sigmaSlider.value);
  const k0 = Number(kSlider.value) / 30;
  const sigmaX = sigmaSetting / 42;
  const sigmaP = 1 / (2 * sigmaX);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const leftA = compact ? width * 0.09 : width * 0.07;
  const rightA = compact ? width * 0.91 : width * 0.47;
  const leftB = compact ? width * 0.09 : width * 0.56;
  const rightB = compact ? width * 0.91 : width * 0.94;
  const topA = compact ? height * 0.08 : height * 0.16;
  const bottomA = compact ? height * 0.43 : height * 0.78;
  const topB = compact ? height * 0.57 : topA;
  const bottomB = compact ? height * 0.91 : bottomA;
  const xRange = 5;
  const pRange = 4;
  const mapX = (x) => leftA + ((x + xRange) / (2 * xRange)) * (rightA - leftA);
  const mapP = (p) => leftB + ((p + pRange) / (2 * pRange)) * (rightB - leftB);
  const baseX = topA + (bottomA - topA) * 0.6;
  const baseP = topB + (bottomB - topB) * 0.68;
  const ampX = (bottomA - topA) * 0.26;
  const ampP = (bottomB - topB) * 0.58;

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.38)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftA, baseX);
  ctx.lineTo(rightA, baseX);
  ctx.moveTo(leftB, baseP);
  ctx.lineTo(rightB, baseP);
  ctx.stroke();

  ctx.fillStyle = "rgba(178,59,75,0.16)";
  ctx.beginPath();
  ctx.moveTo(leftA, baseX);
  for (let i = 0; i <= 260; i += 1) {
    const x = -xRange + (2 * xRange * i) / 260;
    const density = Math.exp(-(x * x) / (sigmaX * sigmaX));
    ctx.lineTo(mapX(x), baseX - density * ampX * 0.95);
  }
  ctx.lineTo(rightA, baseX);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  for (let i = 0; i <= 260; i += 1) {
    const x = -xRange + (2 * xRange * i) / 260;
    const envelope = Math.exp(-(x * x) / (2 * sigmaX * sigmaX));
    const phase = k0 * x - t * 1.8;
    const y = baseX - Math.cos(phase) * envelope * ampX;
    if (i === 0) ctx.moveTo(mapX(x), y);
    else ctx.lineTo(mapX(x), y);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(19,138,134,0.18)";
  ctx.beginPath();
  ctx.moveTo(leftB, baseP);
  for (let i = 0; i <= 260; i += 1) {
    const p = -pRange + (2 * pRange * i) / 260;
    const density = Math.exp(-((p - k0) * (p - k0)) / (2 * sigmaP * sigmaP));
    ctx.lineTo(mapP(p), baseP - density * ampP);
  }
  ctx.lineTo(rightB, baseP);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.teal;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 260; i += 1) {
    const p = -pRange + (2 * pRange * i) / 260;
    const density = Math.exp(-((p - k0) * (p - k0)) / (2 * sigmaP * sigmaP));
    const y = baseP - density * ampP;
    if (i === 0) ctx.moveTo(mapP(p), y);
    else ctx.lineTo(mapP(p), y);
  }
  ctx.stroke();

  const meanPX = mapP(k0);
  drawArrow(ctx, meanPX, baseP + 34, meanPX, baseP + 4, palette.gold, 2);
  drawText(ctx, "<p>", meanPX, baseP + 50, 13, palette.gold, "center");

  drawText(ctx, "position amplitude psi(x)", leftA, topA - 24, compact ? 12 : 14, palette.blue);
  drawText(ctx, "momentum density |phi(p)|^2", leftB, topB - 24, compact ? 12 : 14, palette.teal);
  drawText(ctx, "|psi(x)|^2", leftA + 8, baseX - ampX - 18, compact ? 11 : 13, palette.red);
  drawText(ctx, `Delta x = ${sigmaX.toFixed(2)}`, rightA, bottomA + 22, compact ? 11 : 13, palette.ink, "right");
  drawText(ctx, `Delta p = ${sigmaP.toFixed(2)}`, rightB, bottomB + 22, compact ? 11 : 13, palette.ink, "right");
  drawText(ctx, "Fourier transform", compact ? width * 0.5 : width * 0.515, compact ? height * 0.5 : height * 0.48, compact ? 12 : 14, palette.gold, "center");
  if (!compact) {
    drawArrow(ctx, rightA + 12, (topA + bottomA) / 2, leftB - 12, (topB + bottomB) / 2, palette.gold, 2);
  }
  ctx.restore();

  readout.value = `sigma_x = ${sigmaX.toFixed(2)}, k0 = ${k0.toFixed(2)}, Delta p = ${sigmaP.toFixed(2)}, product Delta x Delta p = ${(sigmaX * sigmaP).toFixed(2)} hbar`;
}

export function drawTranslationGenerator(t = 0) {
  const canvas = document.querySelector("#translation-canvas");
  const shiftSlider = document.querySelector("#translation-shift");
  const kSlider = document.querySelector("#translation-k");
  const widthSlider = document.querySelector("#translation-width");
  const readout = document.querySelector("#translation-readout");
  if (!canvas || !shiftSlider || !kSlider || !widthSlider || !readout) return;

  const shift = Number(shiftSlider.value) / 38;
  const k = Number(kSlider.value) / 28;
  const sigma = Number(widthSlider.value) / 40;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const plotLeft = compact ? width * 0.08 : width * 0.07;
  const plotRight = compact ? width * 0.92 : width * 0.54;
  const plotTop = compact ? height * 0.08 : height * 0.14;
  const plotBottom = compact ? height * 0.45 : height * 0.78;
  const baseline = plotTop + (plotBottom - plotTop) * 0.58;
  const amp = (plotBottom - plotTop) * 0.3;
  const xMin = -6;
  const xMax = 6;
  const mapX = (x) => plotLeft + ((x - xMin) / (xMax - xMin)) * (plotRight - plotLeft);

  function envelope(x, center = 0) {
    return Math.exp(-((x - center) * (x - center)) / (2 * sigma * sigma));
  }

  function realPsi(x, center = 0) {
    return envelope(x, center) * Math.cos(k * (x - center) - t * 1.6);
  }

  function density(x, center = 0) {
    const e = envelope(x, center);
    return e * e;
  }

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, baseline);
  ctx.lineTo(plotRight, baseline);
  ctx.stroke();

  function drawDensity(center, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(plotLeft, baseline);
    for (let i = 0; i <= 320; i += 1) {
      const x = xMin + ((xMax - xMin) * i) / 320;
      ctx.lineTo(mapX(x), baseline - density(x, center) * amp * 0.72);
    }
    ctx.lineTo(plotRight, baseline);
    ctx.closePath();
    ctx.fill();
  }

  function drawWave(center, color, lineWidth = 2.8) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i <= 320; i += 1) {
      const x = xMin + ((xMax - xMin) * i) / 320;
      const y = baseline - realPsi(x, center) * amp;
      if (i === 0) ctx.moveTo(mapX(x), y);
      else ctx.lineTo(mapX(x), y);
    }
    ctx.stroke();
  }

  drawDensity(0, "rgba(31,111,178,0.12)");
  drawDensity(shift, "rgba(178,59,75,0.14)");
  drawWave(0, "rgba(31,111,178,0.78)", 2.2);
  drawWave(shift, palette.red, 3);
  ctx.restore();

  const center0 = mapX(0);
  const centerShift = mapX(shift);
  drawArrow(ctx, center0, plotBottom + 30, centerShift, plotBottom + 30, palette.gold, 2.5);
  drawText(ctx, `a = ${shift.toFixed(2)}`, (center0 + centerShift) / 2, plotBottom + 52, compact ? 11 : 13, palette.gold, "center");
  drawText(ctx, "psi(x)", plotLeft, plotTop - 24, compact ? 12 : 14, palette.blue);
  drawText(ctx, "translated psi(x-a)", plotRight, plotTop - 24, compact ? 12 : 14, palette.red, "right");

  for (let x = -4.2; x <= 4.3; x += 1.4) {
    const e = envelope(x, shift);
    const phase = k * (x - shift) - t * 1.6;
    const px = mapX(x);
    const py = baseline - density(x, shift) * amp * 0.74 - 20;
    const r = 7 + 13 * e;
    ctx.save();
    ctx.strokeStyle = `rgba(19,138,134,${0.18 + 0.55 * e})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, TAU);
    ctx.stroke();
    ctx.restore();
    drawArrow(ctx, px, py, px + Math.cos(phase) * r, py + Math.sin(phase) * r, palette.teal, 1.8);
  }

  const cardLeft = compact ? width * 0.08 : width * 0.6;
  const cardTop = compact ? height * 0.56 : height * 0.15;
  const cardW = compact ? width * 0.84 : width * 0.33;
  const cardH = compact ? height * 0.34 : height * 0.68;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardLeft, cardTop, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "translation operator", cardLeft + 18, cardTop + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "T(a) = exp(-i a p / hbar)", cardLeft + 18, cardTop + 58, compact ? 11 : 13, palette.teal);
  drawText(ctx, "(T(a)psi)(x) = psi(x-a)", cardLeft + 18, cardTop + 84, compact ? 11 : 13, palette.red);
  drawText(ctx, "p = -i hbar d/dx", cardLeft + 18, cardTop + 110, compact ? 11 : 13, palette.gold);

  const miniLeft = cardLeft + 24;
  const miniRight = cardLeft + cardW - 24;
  const miniY = cardTop + (compact ? 172 : 205);
  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(miniLeft, miniY);
  ctx.lineTo(miniRight, miniY);
  ctx.stroke();
  const kX = miniLeft + ((Math.max(-3.2, Math.min(3.2, k)) + 3.2) / 6.4) * (miniRight - miniLeft);
  drawArrow(ctx, (miniLeft + miniRight) / 2, miniY + 28, kX, miniY + 28, palette.gold, 2);
  ctx.restore();
  drawText(ctx, `phase gradient k = ${k.toFixed(2)}`, miniLeft, miniY - 28, compact ? 11 : 13, palette.ink);
  drawText(ctx, "<p> = hbar k", kX, miniY + 48, compact ? 10 : 12, palette.gold, "center");

  const commY = cardTop + cardH - 62;
  drawText(ctx, "[x,p] psi = i hbar psi", cardLeft + 18, commY, compact ? 12 : 14, palette.green);
  drawText(ctx, "commutator measures response to a tiny shift", cardLeft + 18, commY + 28, compact ? 10 : 12, palette.muted);

  readout.value = `translation a ${shift.toFixed(2)}, k ${k.toFixed(2)}, sigma ${sigma.toFixed(2)}, <p> = ${k.toFixed(2)} hbar`;
}

export function drawProjectionMeasurement(t = 0) {
  const canvas = document.querySelector("#projection-canvas");
  const weightSlider = document.querySelector("#projection-weight");
  const mixSlider = document.querySelector("#projection-mix");
  const phaseSlider = document.querySelector("#projection-phase");
  const readout = document.querySelector("#projection-readout");
  if (!canvas || !weightSlider || !mixSlider || !phaseSlider || !readout) return;

  const pDegenerate = Number(weightSlider.value) / 100;
  const mix = Number(mixSlider.value) / 100;
  const phase = (Number(phaseSlider.value) / 180) * Math.PI;
  const pSingle = 1 - pDegenerate;
  const c1 = Math.sqrt(pDegenerate * (1 - mix));
  const c2Abs = Math.sqrt(pDegenerate * mix);
  const c2 = { re: c2Abs * Math.cos(phase), im: c2Abs * Math.sin(phase) };
  const c3 = Math.sqrt(pSingle);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 720;
  const originX = compact ? width * 0.5 : width * 0.28;
  const originY = compact ? height * 0.45 : height * 0.55;
  const scale = compact ? Math.min(width * 0.18, height * 0.16) : Math.min(width * 0.15, height * 0.26);
  const e1 = { x: scale, y: 0 };
  const e2 = { x: scale * 0.58, y: -scale * 0.5 };
  const e3 = { x: 0, y: -scale * 1.1 };
  const project2d = (a, b, c = 0) => ({
    x: originX + a * e1.x + b * e2.x + c * e3.x,
    y: originY + a * e1.y + b * e2.y + c * e3.y,
  });
  const planeCorners = [
    project2d(0, 0),
    project2d(1.25, 0),
    project2d(1.25, 1.25),
    project2d(0, 1.25),
  ];
  const before = project2d(c1, c2Abs, c3);
  const projected = project2d(c1 / Math.sqrt(pDegenerate), c2Abs / Math.sqrt(pDegenerate), 0);
  const rawProjection = project2d(c1, c2Abs, 0);

  ctx.save();
  ctx.fillStyle = "rgba(19,138,134,0.12)";
  ctx.strokeStyle = "rgba(19,138,134,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(planeCorners[0].x, planeCorners[0].y);
  for (const point of planeCorners.slice(1)) ctx.lineTo(point.x, point.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawArrow(ctx, originX, originY, originX + e1.x * 1.35, originY + e1.y * 1.35, palette.blue, 2.4);
  drawArrow(ctx, originX, originY, originX + e2.x * 1.35, originY + e2.y * 1.35, palette.teal, 2.4);
  drawArrow(ctx, originX, originY, originX + e3.x * 1.25, originY + e3.y * 1.25, palette.red, 2.4);
  drawText(ctx, "|a,1>", originX + e1.x * 1.43, originY + e1.y * 1.43, compact ? 10 : 12, palette.blue, "center");
  drawText(ctx, "|a,2>", originX + e2.x * 1.42, originY + e2.y * 1.42, compact ? 10 : 12, palette.teal, "center");
  drawText(ctx, "|b>", originX + e3.x * 1.28, originY + e3.y * 1.28 - 12, compact ? 10 : 12, palette.red, "center");
  drawText(ctx, "degenerate eigenspace P_a", originX + scale * 0.92, originY + scale * 0.26, compact ? 11 : 13, palette.teal, "center");

  ctx.strokeStyle = "rgba(23,32,42,0.22)";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(before.x, before.y);
  ctx.lineTo(rawProjection.x, rawProjection.y);
  ctx.stroke();
  ctx.setLineDash([]);

  drawArrow(ctx, originX, originY, before.x, before.y, palette.red, 4);
  drawArrow(ctx, originX, originY, rawProjection.x, rawProjection.y, palette.gold, 3);
  drawArrow(ctx, rawProjection.x, rawProjection.y, projected.x, projected.y, palette.green, 2.5);
  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(before.x, before.y, 5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = palette.green;
  ctx.beginPath();
  ctx.arc(projected.x, projected.y, 5, 0, TAU);
  ctx.fill();
  drawText(ctx, "|psi>", before.x + 18, before.y - 14, compact ? 11 : 13, palette.red);
  drawText(ctx, "P_a|psi>", rawProjection.x + 16, rawProjection.y + 14, compact ? 10 : 12, palette.gold);
  drawText(ctx, "normalized after outcome a", projected.x + 24, projected.y - 14, compact ? 10 : 12, palette.green);
  ctx.restore();

  const sideX = compact ? width * 0.1 : width * 0.58;
  const sideY = compact ? height * 0.66 : height * 0.14;
  const sideW = compact ? width * 0.82 : width * 0.34;
  const sideH = compact ? height * 0.28 : height * 0.7;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(sideX, sideY, sideW, sideH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "measurement projectors", sideX + 18, sideY + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "P_a = |a,1><a,1| + |a,2><a,2|", sideX + 18, sideY + 56, compact ? 10 : 12, palette.teal);
  drawText(ctx, "P_b = |b><b|", sideX + 18, sideY + 80, compact ? 10 : 12, palette.red);

  function bar(y, label, value, color) {
    const left = sideX + 18;
    const right = sideX + sideW - 22;
    drawText(ctx, label, left, y, compact ? 11 : 13, color);
    ctx.strokeStyle = "rgba(23,32,42,0.2)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(left, y + 14, right - left, 12);
    ctx.fillStyle = `${color}55`;
    ctx.fillRect(left, y + 14, value * (right - left), 12);
    ctx.strokeStyle = color;
    ctx.strokeRect(left, y + 14, value * (right - left), 12);
    drawText(ctx, value.toFixed(3), right, y, compact ? 11 : 13, color, "right");
  }

  bar(sideY + 122, "p(a) = <psi|P_a|psi>", pDegenerate, palette.teal);
  bar(sideY + 172, "p(b) = <psi|P_b|psi>", pSingle, palette.red);

  const coeffY = sideY + (compact ? 226 : 244);
  drawText(ctx, "amplitudes before measurement", sideX + 18, coeffY - 20, compact ? 11 : 13, palette.ink);
  const coeffs = [
    { label: "c1", value: c1, color: palette.blue },
    { label: "c2", value: c2Abs, color: palette.teal },
    { label: "c3", value: c3, color: palette.red },
  ];
  coeffs.forEach((coeff, index) => {
    const x = sideX + 48 + index * (compact ? 74 : 86);
    const maxH = compact ? 52 : 84;
    const h = coeff.value * maxH;
    ctx.fillStyle = `${coeff.color}44`;
    ctx.fillRect(x, coeffY + maxH - h, 34, h);
    ctx.strokeStyle = coeff.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, coeffY + maxH - h, 34, h);
    drawText(ctx, coeff.label, x + 17, coeffY + maxH + 16, compact ? 10 : 12, palette.muted, "center");
  });

  if (!compact) {
    const clockX = sideX + sideW - 70;
    const clockY = sideY + sideH - 64;
    const clockR = 28;
    ctx.strokeStyle = "rgba(23,32,42,0.24)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(clockX, clockY, clockR, 0, TAU);
    ctx.stroke();
    drawArrow(ctx, clockX, clockY, clockX + Math.cos(phase + t * 0.2) * clockR, clockY + Math.sin(phase + t * 0.2) * clockR, palette.gold, 2);
    drawText(ctx, "relative phase in P_a survives", clockX, clockY + 46, 11, palette.gold, "center");
  }

  readout.value = `p(a) ${pDegenerate.toFixed(3)}, p(b) ${pSingle.toFixed(3)}, c1 ${c1.toFixed(3)}, |c2| ${c2Abs.toFixed(3)}, phase ${(phase * 180 / Math.PI).toFixed(0)} deg`;
}

export function drawRobertson(t = 0) {
  const canvas = document.querySelector("#robertson-canvas");
  const angleSlider = document.querySelector("#robertson-angle");
  const thetaSlider = document.querySelector("#robertson-theta");
  const phiSlider = document.querySelector("#robertson-phi");
  const readout = document.querySelector("#robertson-readout");
  if (!canvas || !angleSlider || !thetaSlider || !phiSlider || !readout) return;

  const alphaDeg = Number(angleSlider.value);
  const thetaDeg = Number(thetaSlider.value);
  const phiDeg = Number(phiSlider.value);
  const alpha = (alphaDeg / 180) * Math.PI;
  const theta = (thetaDeg / 180) * Math.PI;
  const phi = (phiDeg / 180) * Math.PI;
  const state = {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta),
  };
  const axisA = { x: 0, z: 1 };
  const axisB = { x: Math.sin(alpha), z: Math.cos(alpha) };
  const expA = state.z;
  const expB = state.x * axisB.x + state.z * axisB.z;
  const deltaA = Math.sqrt(Math.max(0, 1 - expA * expA));
  const deltaB = Math.sqrt(Math.max(0, 1 - expB * expB));
  const product = deltaA * deltaB;
  const commutatorBound = Math.abs(Math.sin(alpha) * state.y);
  const covariance = Math.cos(alpha) - expA * expB;
  const schrodingerBound = Math.sqrt(commutatorBound * commutatorBound + covariance * covariance);

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 720;
  const diskX = compact ? width * 0.5 : width * 0.25;
  const diskY = compact ? height * 0.27 : height * 0.47;
  const radius = compact ? Math.min(width * 0.24, height * 0.18) : Math.min(width * 0.18, height * 0.3);

  function point(vector, scale = 1) {
    return {
      x: diskX + vector.x * radius * scale,
      y: diskY - vector.z * radius * scale,
    };
  }

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(diskX, diskY, radius, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(23,32,42,0.16)";
  ctx.beginPath();
  ctx.moveTo(diskX - radius, diskY);
  ctx.lineTo(diskX + radius, diskY);
  ctx.moveTo(diskX, diskY - radius);
  ctx.lineTo(diskX, diskY + radius);
  ctx.stroke();
  ctx.restore();

  function axisLine(axis, color, label) {
    const top = point(axis, 0.96);
    const bottom = point({ x: -axis.x, z: -axis.z }, 0.96);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bottom.x, bottom.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.restore();
    drawText(ctx, label, top.x + 12, top.y - 12, compact ? 11 : 13, color, "center");
  }

  axisLine(axisA, palette.blue, "A");
  axisLine(axisB, palette.teal, "B");
  const stateEnd = point({ x: state.x, z: state.z }, 0.9);
  drawArrow(ctx, diskX, diskY, stateEnd.x, stateEnd.y, palette.red, 4);
  drawText(ctx, "|psi>", stateEnd.x + 16, stateEnd.y - 14, compact ? 12 : 14, palette.red);
  drawText(ctx, `alpha ${alphaDeg} deg`, diskX, diskY + radius + 28, compact ? 11 : 13, palette.teal, "center");

  const yBarX = diskX + radius + (compact ? 42 : 64);
  const yTop = diskY - radius;
  const yBottom = diskY + radius;
  const yZero = diskY;
  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(yBarX, yTop);
  ctx.lineTo(yBarX, yBottom);
  ctx.moveTo(yBarX - 18, yZero);
  ctx.lineTo(yBarX + 18, yZero);
  ctx.stroke();
  const yHeight = state.y * radius;
  ctx.fillStyle = state.y >= 0 ? "rgba(170,123,24,0.28)" : "rgba(178,59,75,0.28)";
  ctx.strokeStyle = state.y >= 0 ? palette.gold : palette.red;
  ctx.lineWidth = 2;
  ctx.fillRect(yBarX - 10, yZero - yHeight, 20, yHeight);
  ctx.strokeRect(yBarX - 10, yZero - yHeight, 20, yHeight);
  ctx.restore();
  drawText(ctx, "<sigma_y>", yBarX, yTop - 18, compact ? 10 : 12, palette.gold, "center");
  drawText(ctx, state.y.toFixed(2), yBarX, yBottom + 18, compact ? 10 : 12, palette.muted, "center");

  const cardX = compact ? width * 0.08 : width * 0.52;
  const cardY = compact ? height * 0.54 : height * 0.14;
  const cardW = compact ? width * 0.84 : width * 0.4;
  const cardH = compact ? height * 0.4 : height * 0.7;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "Robertson bound", cardX + 18, cardY + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "Delta A Delta B >= 1/2 |<[A,B]>|", cardX + 18, cardY + 56, compact ? 11 : 13, palette.muted);

  function meter(y, label, value, color, max = 1) {
    const left = cardX + 18;
    const right = cardX + cardW - 24;
    const barY = y + 12;
    drawText(ctx, label, left, y, compact ? 11 : 13, color);
    ctx.save();
    ctx.strokeStyle = "rgba(23,32,42,0.2)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(left, barY, right - left, 12);
    ctx.fillStyle = `${color}55`;
    ctx.fillRect(left, barY, Math.min(1, value / max) * (right - left), 12);
    ctx.strokeStyle = color;
    ctx.strokeRect(left, barY, Math.min(1, value / max) * (right - left), 12);
    ctx.restore();
    drawText(ctx, value.toFixed(3), right, y, compact ? 11 : 13, color, "right");
  }

  meter(cardY + 94, "Delta A", deltaA, palette.blue);
  meter(cardY + 140, "Delta B", deltaB, palette.teal);
  meter(cardY + 190, "Delta A Delta B", product, palette.green);
  meter(cardY + 236, "commutator lower bound", commutatorBound, palette.red);
  if (!compact) {
    meter(cardY + 282, "Schrodinger bound incl. covariance", schrodingerBound, palette.gold);
  }

  const gap = Math.max(0, product - commutatorBound);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  ctx.save();
  ctx.strokeStyle = `rgba(178,59,75,${0.2 + 0.18 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(diskX, diskY, radius * (0.62 + 0.04 * pulse), Math.PI / 2 - alpha, Math.PI / 2);
  ctx.stroke();
  ctx.restore();

  drawText(ctx, gap < 0.015 ? "near equality for Robertson" : `gap ${gap.toFixed(3)}: covariance can tighten the theorem`, cardX + 18, cardY + cardH - 28, compact ? 10 : 12, gap < 0.015 ? palette.green : palette.gold);
  readout.value = `alpha ${alphaDeg} deg, theta ${thetaDeg} deg, phi ${phiDeg} deg, DeltaA ${deltaA.toFixed(3)}, DeltaB ${deltaB.toFixed(3)}, product ${product.toFixed(3)}, bound ${commutatorBound.toFixed(3)}`;
}

export function drawProbabilityCurrent(t = 0) {
  const canvas = document.querySelector("#current-canvas");
  const kSlider = document.querySelector("#current-k");
  const widthSlider = document.querySelector("#current-width");
  const readout = document.querySelector("#current-readout");
  if (!canvas || !kSlider || !widthSlider || !readout) return;

  const k = Number(kSlider.value) / 42;
  const sigma = Number(widthSlider.value) / 42;
  const velocity = 0.45 * k;
  const minX = -5.6;
  const maxX = 5.6;
  const span = maxX - minX;
  const wrappedCenter = ((((velocity * t - 2.2 - minX) % span) + span) % span) + minX;
  const center = wrappedCenter;
  const intervalA = -0.9;
  const intervalB = 1.45;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 720;
  const plotLeft = compact ? 44 : 58;
  const plotRight = width - (compact ? 34 : 50);
  const densityBase = height * (compact ? 0.35 : 0.34);
  const currentBase = height * (compact ? 0.72 : 0.7);
  const densityAmp = height * 0.22;
  const currentAmp = height * 0.17;
  const xToPx = (x) => plotLeft + ((x - minX) / (maxX - minX)) * (plotRight - plotLeft);
  const rho = (x) => Math.exp(-((x - center) * (x - center)) / (sigma * sigma));
  const current = (x) => velocity * rho(x);
  const maxCurrent = Math.max(0.18, Math.abs(velocity));

  function axis(y, label, color) {
    ctx.save();
    ctx.strokeStyle = "rgba(23,32,42,0.32)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotLeft, y);
    ctx.lineTo(plotRight, y);
    ctx.stroke();
    drawText(ctx, label, plotLeft, y - (compact ? 86 : 104), compact ? 12 : 14, color);
    ctx.restore();
  }

  const intervalLeft = xToPx(intervalA);
  const intervalRight = xToPx(intervalB);
  ctx.save();
  ctx.fillStyle = "rgba(19,138,134,0.1)";
  ctx.fillRect(intervalLeft, densityBase - densityAmp - 18, intervalRight - intervalLeft, densityAmp + 34);
  ctx.fillRect(intervalLeft, currentBase - currentAmp - 22, intervalRight - intervalLeft, currentAmp * 2 + 44);
  ctx.strokeStyle = "rgba(19,138,134,0.52)";
  ctx.setLineDash([6, 5]);
  for (const x of [intervalLeft, intervalRight]) {
    ctx.beginPath();
    ctx.moveTo(x, densityBase - densityAmp - 22);
    ctx.lineTo(x, currentBase + currentAmp + 30);
    ctx.stroke();
  }
  ctx.restore();

  axis(densityBase, "density rho(x,t) = |psi|^2", palette.blue);
  axis(currentBase, "current j(x,t)", palette.red);

  ctx.save();
  ctx.fillStyle = "rgba(31,111,178,0.16)";
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(plotLeft, densityBase);
  for (let px = plotLeft; px <= plotRight; px += 3) {
    const x = minX + ((px - plotLeft) / (plotRight - plotLeft)) * (maxX - minX);
    const y = densityBase - rho(x) * densityAmp;
    ctx.lineTo(px, y);
  }
  ctx.lineTo(plotRight, densityBase);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = velocity >= 0 ? palette.red : palette.teal;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let px = plotLeft; px <= plotRight; px += 3) {
    const x = minX + ((px - plotLeft) / (plotRight - plotLeft)) * (maxX - minX);
    const y = currentBase - (current(x) / maxCurrent) * currentAmp;
    if (px === plotLeft) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();
  ctx.restore();

  const direction = Math.sign(velocity || 1);
  const arrowColor = velocity >= 0 ? palette.red : palette.teal;
  for (let x = -4.6; x <= 4.6; x += 1.15) {
    const amount = Math.abs(current(x)) / maxCurrent;
    const y = densityBase - rho(x) * densityAmp - 18;
    const len = 18 + 28 * amount;
    drawArrow(ctx, xToPx(x) - direction * len * 0.5, y, xToPx(x) + direction * len * 0.5, y, arrowColor, 1.6 + 2 * amount);
  }

  const fluxA = current(intervalA);
  const fluxB = current(intervalB);
  const dpdt = fluxA - fluxB;
  let total = 0;
  let inside = 0;
  const dx = 0.035;
  for (let x = minX; x <= maxX; x += dx) {
    const value = rho(x);
    total += value * dx;
    if (x >= intervalA && x <= intervalB) inside += value * dx;
  }
  const probabilityInside = inside / total;

  const cardW = compact ? width * 0.84 : width * 0.34;
  const cardX = compact ? width * 0.08 : width * 0.6;
  const cardY = compact ? height * 0.72 : height * 0.14;
  const cardH = compact ? height * 0.24 : height * 0.23;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, "continuity equation", cardX + 18, cardY + 25, compact ? 12 : 14, palette.ink);
  drawText(ctx, "partial_t rho + partial_x j = 0", cardX + 18, cardY + 52, compact ? 11 : 13, palette.muted);
  drawText(ctx, `P[a,b] = ${probabilityInside.toFixed(3)}`, cardX + 18, cardY + 79, compact ? 11 : 13, palette.teal);
  drawText(ctx, `j(a)-j(b) = ${dpdt.toFixed(3)}`, cardX + 18, cardY + 106, compact ? 11 : 13, dpdt >= 0 ? palette.green : palette.red);
  ctx.restore();

  drawText(ctx, "a", intervalLeft, currentBase + currentAmp + 44, 13, palette.teal, "center");
  drawText(ctx, "b", intervalRight, currentBase + currentAmp + 44, 13, palette.teal, "center");
  drawText(ctx, velocity >= 0 ? "flow to the right" : "flow to the left", plotLeft, height - 32, compact ? 12 : 13, arrowColor);
  readout.value = `k ${k.toFixed(2)}, sigma ${sigma.toFixed(2)}, P[a,b] ${probabilityInside.toFixed(3)}, dP/dt ${dpdt.toFixed(3)}`;
}

export function drawSpectralTheorem(t = 0) {
  const canvas = document.querySelector("#spectral-theorem-canvas");
  const axisSlider = document.querySelector("#spectral-theorem-axis");
  const gapSlider = document.querySelector("#spectral-theorem-gap");
  const stateSlider = document.querySelector("#spectral-theorem-state");
  const readout = document.querySelector("#spectral-theorem-readout");
  if (!canvas || !axisSlider || !gapSlider || !stateSlider || !readout) return;

  const axisDeg = Number(axisSlider.value);
  const stateDeg = Number(stateSlider.value);
  const gap = Number(gapSlider.value) / 35;
  const aPlus = gap / 2;
  const aMinus = -gap / 2;
  const axis = (axisDeg / 180) * Math.PI;
  const stateAngle = (stateDeg / 180) * Math.PI;
  const observableAxis = { x: Math.sin(axis), z: Math.cos(axis) };
  const state = { x: Math.sin(stateAngle), z: Math.cos(stateAngle) };
  const dot = observableAxis.x * state.x + observableAxis.z * state.z;
  const pPlus = (1 + dot) / 2;
  const pMinus = 1 - pPlus;
  const expectation = aPlus * pPlus + aMinus * pMinus;
  const variance = aPlus * aPlus * pPlus + aMinus * aMinus * pMinus - expectation * expectation;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const centerX = compact ? width * 0.5 : width * 0.27;
  const centerY = compact ? height * 0.28 : height * 0.48;
  const radius = compact ? Math.min(width * 0.24, height * 0.18) : Math.min(width * 0.19, height * 0.31);

  function point(vector, scale = 1) {
    return {
      x: centerX + vector.x * radius * scale,
      y: centerY - vector.z * radius * scale,
    };
  }

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.74)";
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(23,32,42,0.16)";
  ctx.beginPath();
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY + radius);
  ctx.stroke();
  ctx.restore();

  const plus = point(observableAxis, 0.96);
  const minus = point({ x: -observableAxis.x, z: -observableAxis.z }, 0.96);
  ctx.save();
  ctx.strokeStyle = palette.teal;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(minus.x, minus.y);
  ctx.lineTo(plus.x, plus.y);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, "|a+>", plus.x + 16, plus.y - 10, compact ? 11 : 13, palette.teal, "center");
  drawText(ctx, "|a->", minus.x - 18, minus.y + 12, compact ? 11 : 13, palette.teal, "center");

  const stateEnd = point(state, 0.9);
  drawArrow(ctx, centerX, centerY, stateEnd.x, stateEnd.y, palette.red, 4);
  drawText(ctx, "|psi>", stateEnd.x + 14, stateEnd.y - 12, compact ? 12 : 14, palette.red);

  const projectionScale = dot;
  const projected = point(observableAxis, projectionScale * 0.9);
  ctx.save();
  ctx.strokeStyle = `rgba(19,138,134,${0.25 + pulse * 0.22})`;
  ctx.setLineDash([5, 6]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(stateEnd.x, stateEnd.y);
  ctx.lineTo(projected.x, projected.y);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, `axis ${axisDeg} deg`, centerX, centerY + radius + 28, compact ? 11 : 13, palette.muted, "center");

  const cardLeft = compact ? width * 0.08 : width * 0.51;
  const cardTop = compact ? height * 0.53 : height * 0.14;
  const cardW = compact ? width * 0.84 : width * 0.4;
  const cardH = compact ? height * 0.39 : height * 0.72;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardLeft, cardTop, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "spectral decomposition", cardLeft + 18, cardTop + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "A = a+ P+ + a- P-", cardLeft + 18, cardTop + 58, compact ? 12 : 14, palette.teal);
  drawText(ctx, "P_n = |a_n><a_n|", cardLeft + 18, cardTop + 84, compact ? 12 : 14, palette.gold);
  drawText(ctx, "P+ + P- = I", cardLeft + 18, cardTop + 110, compact ? 12 : 14, palette.muted);

  const barBase = cardTop + (compact ? 230 : 275);
  const maxH = compact ? 88 : 132;
  const barW = compact ? Math.max(44, cardW * 0.15) : Math.max(56, cardW * 0.14);
  const gapX = compact ? 70 : 92;
  const bars = [
    { label: "p+", value: pPlus, color: palette.teal, eigenvalue: aPlus },
    { label: "p-", value: pMinus, color: palette.blue, eigenvalue: aMinus },
  ];
  bars.forEach((bar, i) => {
    const x = cardLeft + 34 + i * gapX;
    const h = Math.max(4, bar.value * maxH);
    ctx.save();
    ctx.fillStyle = `${bar.color}33`;
    ctx.strokeStyle = bar.color;
    ctx.lineWidth = 2;
    ctx.fillRect(x, barBase - h, barW, h);
    ctx.strokeRect(x, barBase - h, barW, h);
    ctx.restore();
    drawText(ctx, bar.label, x + barW / 2, barBase + 18, compact ? 10 : 12, palette.muted, "center");
    drawText(ctx, bar.value.toFixed(2), x + barW / 2, barBase - h - 12, compact ? 10 : 12, bar.color, "center");
    drawText(ctx, `a=${bar.eigenvalue.toFixed(2)}`, x + barW / 2, barBase + 38, compact ? 9 : 11, bar.color, "center");
  });

  const meterLeft = cardLeft + cardW * (compact ? 0.55 : 0.52);
  const meterRight = cardLeft + cardW - 26;
  const meterY = cardTop + (compact ? 180 : 205);
  const meterMid = (meterLeft + meterRight) / 2;
  const meterScale = (meterRight - meterLeft) / gap;
  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(meterLeft, meterY);
  ctx.lineTo(meterRight, meterY);
  ctx.stroke();
  [aMinus, 0, aPlus, expectation].forEach((value, i) => {
    const x = meterMid + value * meterScale;
    ctx.beginPath();
    ctx.moveTo(x, meterY - (i === 3 ? 16 : 8));
    ctx.lineTo(x, meterY + (i === 3 ? 16 : 8));
    ctx.strokeStyle = i === 3 ? palette.red : "rgba(23,32,42,0.34)";
    ctx.stroke();
  });
  ctx.restore();
  drawText(ctx, "<A>", meterMid + expectation * meterScale, meterY - 28, compact ? 11 : 13, palette.red, "center");
  drawText(ctx, `variance ${Math.max(0, variance).toFixed(2)}`, meterLeft, meterY + 34, compact ? 11 : 13, palette.green);
  drawText(ctx, "real eigenvalues, orthogonal projectors", cardLeft + 18, cardTop + cardH - 36, compact ? 11 : 13, palette.ink);

  readout.value = `axis ${axisDeg} deg, gap ${gap.toFixed(2)}, P+ ${pPlus.toFixed(3)}, P- ${pMinus.toFixed(3)}, <A> ${expectation.toFixed(3)}`;
}

export function drawBasisChange(t = 0) {
  const canvas = document.querySelector("#basis-canvas");
  const stateSlider = document.querySelector("#basis-state");
  const phaseSlider = document.querySelector("#basis-phase");
  const angleSlider = document.querySelector("#basis-angle");
  const readout = document.querySelector("#basis-readout");
  if (!canvas || !stateSlider || !phaseSlider || !angleSlider || !readout) return;

  const thetaDeg = Number(stateSlider.value);
  const phiDeg = Number(phaseSlider.value);
  const alphaDeg = Number(angleSlider.value);
  const theta = (thetaDeg / 180) * Math.PI;
  const phi = (phiDeg / 180) * Math.PI;
  const alpha = (alphaDeg / 180) * Math.PI;
  const c0 = { re: Math.cos(theta / 2), im: 0 };
  const c1 = { re: Math.sin(theta / 2) * Math.cos(phi), im: Math.sin(theta / 2) * Math.sin(phi) };
  const basisC = Math.cos(alpha / 2);
  const basisS = Math.sin(alpha / 2);
  const cp = { re: basisC * c0.re + basisS * c1.re, im: basisC * c0.im + basisS * c1.im };
  const cm = { re: -basisS * c0.re + basisC * c1.re, im: -basisS * c0.im + basisC * c1.im };
  const abs2 = (z) => z.re * z.re + z.im * z.im;
  const p0 = abs2(c0);
  const p1 = abs2(c1);
  const pp = abs2(cp);
  const pm = abs2(cm);
  const bloch = {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta),
  };
  const basisAxis = { x: Math.sin(alpha), z: Math.cos(alpha) };
  const expectationZ = p0 - p1;
  const expectationFromRotated =
    Math.cos(alpha) * (pp - pm) - 2 * Math.sin(alpha) * (cp.re * cm.re + cp.im * cm.im);

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 720;
  const diskX = compact ? width * 0.5 : width * 0.25;
  const diskY = compact ? height * 0.28 : height * 0.48;
  const radius = compact ? Math.min(width * 0.23, height * 0.18) : Math.min(width * 0.18, height * 0.3);

  function point(vector, scale = 1) {
    return {
      x: diskX + vector.x * radius * scale,
      y: diskY - vector.z * radius * scale,
    };
  }

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(diskX, diskY, radius, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(23,32,42,0.18)";
  ctx.beginPath();
  ctx.moveTo(diskX - radius, diskY);
  ctx.lineTo(diskX + radius, diskY);
  ctx.moveTo(diskX, diskY - radius);
  ctx.lineTo(diskX, diskY + radius);
  ctx.stroke();
  ctx.restore();

  const zTop = point({ x: 0, z: 1 }, 0.96);
  const zBottom = point({ x: 0, z: -1 }, 0.96);
  const bTop = point(basisAxis, 0.96);
  const bBottom = point({ x: -basisAxis.x, z: -basisAxis.z }, 0.96);
  ctx.save();
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(zBottom.x, zBottom.y);
  ctx.lineTo(zTop.x, zTop.y);
  ctx.stroke();
  ctx.strokeStyle = palette.teal;
  ctx.beginPath();
  ctx.moveTo(bBottom.x, bBottom.y);
  ctx.lineTo(bTop.x, bTop.y);
  ctx.stroke();
  ctx.restore();
  const state2d = { x: bloch.x, z: bloch.z };
  const stateEnd = point(state2d, 0.9);
  drawArrow(ctx, diskX, diskY, stateEnd.x, stateEnd.y, palette.red, 4);
  const phaseShadow = point({ x: bloch.x, z: 0 }, 0.9);
  ctx.save();
  ctx.strokeStyle = "rgba(178,59,75,0.22)";
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(stateEnd.x, stateEnd.y);
  ctx.lineTo(phaseShadow.x, phaseShadow.y);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, "|psi>", stateEnd.x + 18, stateEnd.y - 14, compact ? 12 : 14, palette.red);
  drawText(ctx, "old basis", zTop.x - 6, zTop.y - 22, compact ? 11 : 13, palette.blue, "center");
  drawText(ctx, "new basis", bTop.x + 18, bTop.y - 8, compact ? 11 : 13, palette.teal, "center");
  drawText(ctx, `theta ${thetaDeg} deg, phi ${phiDeg} deg`, diskX, diskY + radius + 28, compact ? 11 : 13, palette.muted, "center");

  const cardTop = compact ? height * 0.54 : height * 0.16;
  const cardLeft = compact ? width * 0.08 : width * 0.48;
  const cardW = compact ? width * 0.84 : width * 0.44;
  const cardH = compact ? height * 0.38 : height * 0.68;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardLeft, cardTop, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "coordinates in two bases", cardLeft + 18, cardTop + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "c' = U dagger c", cardLeft + 18, cardTop + 56, compact ? 12 : 14, palette.teal);
  drawText(ctx, "A' = U dagger A U", cardLeft + 18, cardTop + 80, compact ? 12 : 14, palette.gold);

  function drawProbabilityBars(x, y, title, values, colors) {
    const barW = compact ? 46 : 58;
    const maxH = compact ? 86 : 120;
    drawText(ctx, title, x, y - 18, compact ? 12 : 14, palette.ink, "center");
    values.forEach((value, i) => {
      const bx = x - barW - 10 + i * (barW + 20);
      const h = Math.max(3, value.p * maxH);
      ctx.fillStyle = `${colors[i]}33`;
      ctx.fillRect(bx, y + maxH - h, barW, h);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, y + maxH - h, barW, h);
      drawText(ctx, value.label, bx + barW / 2, y + maxH + 18, compact ? 10 : 12, palette.muted, "center");
      drawText(ctx, value.p.toFixed(2), bx + barW / 2, y + maxH - h - 12, compact ? 10 : 12, colors[i], "center");
    });
  }

  const barsY = compact ? cardTop + 112 : cardTop + 140;
  const oldX = cardLeft + cardW * 0.28;
  const newX = cardLeft + cardW * 0.72;
  drawProbabilityBars(oldX, barsY, "old basis", [{ label: "|e1>", p: p0 }, { label: "|e2>", p: p1 }], [palette.blue, palette.red]);
  drawProbabilityBars(newX, barsY, "new basis", [{ label: "|e1'>", p: pp }, { label: "|e2'>", p: pm }], [palette.teal, palette.gold]);

  const matrixY = cardTop + cardH - (compact ? 78 : 110);
  const matrixX = cardLeft + 18;
  drawText(ctx, `U(alpha/2) = [[${basisC.toFixed(2)}, ${basisS.toFixed(2)}], [${(-basisS).toFixed(2)}, ${basisC.toFixed(2)}]]`, matrixX, matrixY, compact ? 10 : 12, palette.muted);
  drawText(ctx, `<sigma_z> = ${expectationZ.toFixed(3)} = ${expectationFromRotated.toFixed(3)}`, matrixX, matrixY + 28, compact ? 11 : 13, palette.green);
  drawText(ctx, "same ket, different coordinate lists", matrixX, matrixY + 54, compact ? 11 : 13, palette.ink);

  const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
  ctx.save();
  ctx.strokeStyle = `rgba(19,138,134,${0.18 + pulse * 0.18})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(diskX, diskY, radius * (0.62 + 0.03 * pulse), -alpha / 2, alpha / 2);
  ctx.stroke();
  ctx.restore();

  readout.value = `theta ${thetaDeg} deg, phi ${phiDeg} deg, alpha ${alphaDeg} deg, P(e1') ${pp.toFixed(3)}, invariant <sigma_z> ${expectationZ.toFixed(3)}`;
}

export function drawCompleteness(t = 0) {
  const canvas = document.querySelector("#completeness-canvas");
  const angleSlider = document.querySelector("#completeness-angle");
  const c2Slider = document.querySelector("#completeness-c2");
  const c3Slider = document.querySelector("#completeness-c3");
  const readout = document.querySelector("#completeness-readout");
  if (!canvas || !angleSlider || !c2Slider || !c3Slider || !readout) return;

  const alphaDeg = Number(angleSlider.value);
  const alpha = (alphaDeg / 180) * Math.PI;
  const raw = [1, Number(c2Slider.value) / 100, Number(c3Slider.value) / 100];
  const norm = Math.hypot(...raw);
  const psi = raw.map((value) => value / norm);
  const basis = [
    { v: [Math.cos(alpha), Math.sin(alpha), 0], color: palette.blue, label: "e1'" },
    { v: [-Math.sin(alpha), Math.cos(alpha), 0], color: palette.teal, label: "e2'" },
    { v: [0, 0, 1], color: palette.gold, label: "e3" },
  ];
  const coeffs = basis.map((entry) => psi[0] * entry.v[0] + psi[1] * entry.v[1] + psi[2] * entry.v[2]);
  const weights = coeffs.map((value) => value * value);
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const origin = {
    x: compact ? width * 0.5 : width * 0.28,
    y: compact ? height * 0.3 : height * 0.56,
  };
  const scale = compact ? Math.min(width * 0.28, height * 0.22) : Math.min(width * 0.2, height * 0.34);

  function add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  function mul(a, s) {
    return [a[0] * s, a[1] * s, a[2] * s];
  }

  function project(v) {
    return {
      x: origin.x + (v[0] - 0.55 * v[1]) * scale,
      y: origin.y - (0.76 * v[2] + 0.36 * v[1] + 0.06 * v[0]) * scale,
    };
  }

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.16)";
  ctx.lineWidth = 1.5;
  for (const edge of [
    [[0, 0, 0], [1, 0, 0]],
    [[0, 0, 0], [0, 1, 0]],
    [[0, 0, 0], [0, 0, 1]],
    [[1, 0, 0], [1, 1, 0]],
    [[0, 1, 0], [1, 1, 0]],
    [[1, 0, 0], [1, 0, 1]],
    [[0, 1, 0], [0, 1, 1]],
    [[0, 0, 1], [1, 0, 1]],
    [[0, 0, 1], [0, 1, 1]],
    [[1, 1, 0], [1, 1, 1]],
    [[1, 0, 1], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 1]],
  ]) {
    const a = project(mul(edge[0], 0.78));
    const b = project(mul(edge[1], 0.78));
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();

  const zero = project([0, 0, 0]);
  basis.forEach((entry, i) => {
    const end = project(mul(entry.v, 0.92));
    drawArrow(ctx, zero.x, zero.y, end.x, end.y, entry.color, 2.5);
    drawText(ctx, entry.label, end.x + 10, end.y - 8, compact ? 11 : 13, entry.color);
    const reverse = project(mul(entry.v, -0.32));
    ctx.save();
    ctx.strokeStyle = `${entry.color}44`;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(zero.x, zero.y);
    ctx.lineTo(reverse.x, reverse.y);
    ctx.stroke();
    ctx.restore();
    drawText(ctx, `P${i + 1}`, reverse.x - 6, reverse.y + 14, compact ? 10 : 11, entry.color, "right");
  });

  let current = [0, 0, 0];
  coeffs.forEach((coefficient, i) => {
    const component = mul(basis[i].v, coefficient);
    const next = add(current, component);
    const a = project(current);
    const b = project(next);
    drawArrow(ctx, a.x, a.y, b.x, b.y, basis[i].color, 4);
    const mid = project(mul(add(current, next), 0.5));
    drawText(ctx, `c${i + 1}${basis[i].label}`, mid.x + 8, mid.y - 12, compact ? 10 : 12, basis[i].color);
    current = next;
  });

  const psiEnd = project(psi);
  ctx.save();
  ctx.strokeStyle = `rgba(178,59,75,${0.22 + pulse * 0.22})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 7]);
  ctx.beginPath();
  ctx.moveTo(project(current).x, project(current).y);
  ctx.lineTo(psiEnd.x, psiEnd.y);
  ctx.stroke();
  ctx.restore();
  drawArrow(ctx, zero.x, zero.y, psiEnd.x, psiEnd.y, palette.red, 4);
  drawText(ctx, "|psi>", psiEnd.x + 12, psiEnd.y - 14, compact ? 12 : 14, palette.red);
  drawText(ctx, "component arrows add head-to-tail", origin.x, origin.y + scale * 0.78, compact ? 11 : 13, palette.muted, "center");

  const cardLeft = compact ? width * 0.08 : width * 0.5;
  const cardTop = compact ? height * 0.53 : height * 0.14;
  const cardW = compact ? width * 0.84 : width * 0.42;
  const cardH = compact ? height * 0.39 : height * 0.72;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardLeft, cardTop, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "resolution of identity", cardLeft + 18, cardTop + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "I = sum_n |e_n><e_n|", cardLeft + 18, cardTop + 58, compact ? 12 : 14, palette.teal);
  drawText(ctx, "psi = sum_n c_n e_n", cardLeft + 18, cardTop + 84, compact ? 12 : 14, palette.red);
  drawText(ctx, "c_n = <e_n|psi>", cardLeft + 18, cardTop + 110, compact ? 12 : 14, palette.gold);

  const barsTop = cardTop + (compact ? 144 : 168);
  const barW = compact ? Math.max(36, cardW * 0.14) : Math.max(48, cardW * 0.13);
  const barGap = compact ? 18 : 26;
  const maxH = compact ? 88 : 128;
  const barsLeft = cardLeft + 28;
  weights.forEach((weight, i) => {
    const x = barsLeft + i * (barW + barGap);
    const h = Math.max(3, weight * maxH);
    ctx.save();
    ctx.fillStyle = `${basis[i].color}33`;
    ctx.strokeStyle = basis[i].color;
    ctx.lineWidth = 2;
    ctx.fillRect(x, barsTop + maxH - h, barW, h);
    ctx.strokeRect(x, barsTop + maxH - h, barW, h);
    ctx.restore();
    drawText(ctx, `|c${i + 1}|2`, x + barW / 2, barsTop + maxH + 18, compact ? 10 : 12, palette.muted, "center");
    drawText(ctx, weight.toFixed(2), x + barW / 2, barsTop + maxH - h - 12, compact ? 10 : 12, basis[i].color, "center");
  });
  drawText(ctx, `sum |c_n|2 = ${weightSum.toFixed(3)}`, cardLeft + cardW - 20, barsTop + maxH + 18, compact ? 11 : 13, palette.green, "right");

  const stepsY = cardTop + cardH - (compact ? 64 : 76);
  const reassembled = coeffs.map((value) => value.toFixed(2)).join(", ");
  drawText(ctx, `coordinates: [${reassembled}]`, cardLeft + 18, stepsY, compact ? 10 : 12, palette.ink);
  drawText(ctx, "same state after summing all projectors", cardLeft + 18, stepsY + 26, compact ? 11 : 13, palette.muted);

  readout.value = `alpha ${alphaDeg} deg, coefficients [${reassembled}], sum |c_n|^2 ${weightSum.toFixed(3)}`;
}

export function drawCommutator(t = 0) {
  const canvas = document.querySelector("#commutator-canvas");
  const angleSlider = document.querySelector("#commutator-angle");
  const stateSlider = document.querySelector("#commutator-state");
  const readout = document.querySelector("#commutator-readout");
  if (!canvas || !angleSlider || !stateSlider || !readout) return;

  const alphaDeg = Number(angleSlider.value);
  const betaDeg = Number(stateSlider.value);
  const alpha = (alphaDeg / 180) * Math.PI;
  const beta = (betaDeg / 180) * Math.PI;
  const axisA = { x: 0, z: 1 };
  const axisB = { x: Math.sin(alpha), z: Math.cos(alpha) };
  const state = { x: Math.sin(beta), z: Math.cos(beta) };
  const axisDot = Math.cos(alpha);
  const stateDotA = state.z;
  const stateDotB = state.x * axisB.x + state.z * axisB.z;
  const afterAB = {
    x: stateDotA * axisDot * axisB.x,
    z: stateDotA * axisDot * axisB.z,
  };
  const afterBA = {
    x: 0,
    z: stateDotB * axisDot,
  };
  const commutatorStrength = 2 * Math.abs(Math.sin(alpha));
  const mismatch = Math.hypot(afterAB.x - afterBA.x, afterAB.z - afterBA.z);
  const pBafterA = (1 + stateDotA * axisDot) / 2;
  const pAafterB = (1 + stateDotB * axisDot) / 2;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const mainX = compact ? width * 0.5 : width * 0.28;
  const mainY = compact ? height * 0.27 : height * 0.48;
  const mainRadius = compact ? Math.min(width * 0.25, height * 0.18) : Math.min(width * 0.21, height * 0.32);

  function point(centerX, centerY, radius, vector) {
    return {
      x: centerX + vector.x * radius,
      y: centerY - vector.z * radius,
    };
  }

  function lineForAxis(centerX, centerY, radius, axis, color, label, labelScale = 1) {
    const plus = point(centerX, centerY, radius, axis);
    const minus = point(centerX, centerY, radius, { x: -axis.x, z: -axis.z });
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(minus.x, minus.y);
    ctx.lineTo(plus.x, plus.y);
    ctx.stroke();
    ctx.restore();
    drawText(ctx, label, plus.x + 12 * labelScale, plus.y - 12 * labelScale, compact ? 12 : 13, color, "center");
  }

  function drawDisk(centerX, centerY, radius, label, vector, color, options = {}) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.strokeStyle = "rgba(23,32,42,0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(23,32,42,0.14)";
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();
    ctx.restore();

    if (options.axes) {
      lineForAxis(centerX, centerY, radius * 0.93, axisA, palette.blue, "A", 1);
      lineForAxis(centerX, centerY, radius * 0.93, axisB, palette.teal, "B", 1);
    }

    const end = point(centerX, centerY, radius, vector);
    drawArrow(ctx, centerX, centerY, end.x, end.y, color, options.thin ? 2 : 4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(end.x, end.y, options.thin ? 4 : 6, 0, TAU);
    ctx.fill();
    drawText(ctx, label, centerX, centerY + radius + (compact ? 18 : 22), compact ? 12 : 13, palette.ink, "center");
  }

  drawDisk(mainX, mainY, mainRadius, "initial Bloch vector", state, palette.red, { axes: true });
  const pulse = 0.2 + 0.18 * Math.sin(t * 2.4);
  ctx.save();
  ctx.strokeStyle = `rgba(178,59,75,${0.22 + pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mainX, mainY, mainRadius * (0.8 + 0.08 * Math.sin(t * 2)), 0, TAU);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, "x", mainX + mainRadius + 18, mainY + 2, 13, palette.muted, "center");
  drawText(ctx, "z", mainX, mainY - mainRadius - 18, 13, palette.muted, "center");
  drawText(ctx, `alpha ${alphaDeg} deg`, mainX, mainY - mainRadius - 42, compact ? 12 : 14, palette.teal, "center");

  const miniRadius = compact ? Math.min(width * 0.14, 56) : Math.min(width * 0.09, 72);
  const miniY = compact ? height * 0.57 : height * 0.36;
  const abX = compact ? width * 0.31 : width * 0.64;
  const baX = compact ? width * 0.69 : width * 0.83;
  drawDisk(abX, miniY, miniRadius, "A then B", afterAB, palette.teal, { thin: true });
  drawDisk(baX, miniY, miniRadius, "B then A", afterBA, palette.blue, { thin: true });

  const cardX = compact ? width * 0.08 : width * 0.53;
  const cardY = compact ? height * 0.72 : height * 0.58;
  const cardW = compact ? width * 0.84 : width * 0.39;
  const cardH = compact ? height * 0.2 : height * 0.28;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, `|[A,B]| = ${commutatorStrength.toFixed(2)}`, cardX + 18, cardY + 28, compact ? 12 : 14, palette.red);
  drawText(ctx, `order mismatch = ${mismatch.toFixed(2)}`, cardX + 18, cardY + 52, compact ? 12 : 14, palette.ink);
  drawText(ctx, commutatorStrength < 0.08 ? "common eigenbasis" : "sequential experiments differ", cardX + 18, cardY + 76, compact ? 11 : 13, commutatorStrength < 0.08 ? palette.green : palette.gold);

  const barBaseY = cardY + cardH - 22;
  const barMax = Math.max(26, cardH - 118);
  const barGap = compact ? 64 : 78;
  const barX = cardX + cardW - (compact ? 124 : 150);
  const bars = [
    { label: "P(+B|A)", value: pBafterA, color: palette.teal },
    { label: "P(+A|B)", value: pAafterB, color: palette.blue },
  ];
  bars.forEach((bar, i) => {
    const x = barX + i * barGap;
    const h = Math.max(2, bar.value * barMax);
    ctx.fillStyle = `${bar.color}33`;
    ctx.fillRect(x, barBaseY - h, 30, h);
    ctx.strokeStyle = bar.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, barBaseY - h, 30, h);
    drawText(ctx, bar.label, x + 15, barBaseY + 14, compact ? 9 : 10, palette.muted, "center");
    drawText(ctx, bar.value.toFixed(2), x + 15, barBaseY - h - 12, compact ? 10 : 11, bar.color, "center");
  });
  ctx.restore();

  readout.value = `alpha ${alphaDeg} deg, beta ${betaDeg} deg, |[A,B]| ${commutatorStrength.toFixed(2)}, order mismatch ${mismatch.toFixed(2)}`;
}

export function drawUnitaryEvolution(t = 0) {
  const canvas = document.querySelector("#unitary-canvas");
  const gapSlider = document.querySelector("#unitary-gap");
  const c2Slider = document.querySelector("#unitary-c2");
  const c3Slider = document.querySelector("#unitary-c3");
  const readout = document.querySelector("#unitary-readout");
  if (!canvas || !gapSlider || !c2Slider || !c3Slider || !readout) return;

  const gap = Number(gapSlider.value) / 50;
  const raw = [1, Number(c2Slider.value) / 100, Number(c3Slider.value) / 100];
  const norm = Math.hypot(...raw);
  const amplitudes = raw.map((value) => value / norm);
  const energies = [0, gap, 2.45 * gap];
  const colors = [palette.blue, palette.teal, palette.gold];
  const labels = ["E1", "E2", "E3"];
  const coeffs = amplitudes.map((amp, i) => {
    const phase = -energies[i] * t + (amp < 0 ? Math.PI : 0);
    return {
      abs: Math.abs(amp),
      p: amp * amp,
      phase,
      re: Math.abs(amp) * Math.cos(phase),
      im: Math.abs(amp) * Math.sin(phase),
    };
  });

  function expectationAt(time) {
    let total = 0;
    const couplings = [
      [0, 0.72, 0.28],
      [0.72, 0, 0.5],
      [0.28, 0.5, 0],
    ];
    for (let i = 0; i < 3; i += 1) {
      for (let j = i + 1; j < 3; j += 1) {
        const sign = Math.sign(amplitudes[i] * amplitudes[j]) || 1;
        total += 2 * Math.abs(amplitudes[i] * amplitudes[j]) * couplings[i][j] * sign * Math.cos((energies[j] - energies[i]) * time);
      }
    }
    return total;
  }

  const observable = expectationAt(t);
  const energyMean = coeffs.reduce((sum, coeff, i) => sum + coeff.p * energies[i], 0);

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const phasorY = compact ? height * 0.25 : height * 0.34;
  const phasorRadius = compact ? Math.min(width * 0.105, 54) : Math.min(width * 0.072, 70);
  const startX = compact ? width * 0.22 : width * 0.14;
  const stepX = compact ? width * 0.28 : width * 0.17;

  coeffs.forEach((coeff, i) => {
    const cx = startX + i * stepX;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.76)";
    ctx.strokeStyle = "rgba(23,32,42,0.2)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, phasorY, phasorRadius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(23,32,42,0.13)";
    ctx.beginPath();
    ctx.moveTo(cx - phasorRadius, phasorY);
    ctx.lineTo(cx + phasorRadius, phasorY);
    ctx.moveTo(cx, phasorY - phasorRadius);
    ctx.lineTo(cx, phasorY + phasorRadius);
    ctx.stroke();
    ctx.restore();

    const endX = cx + coeff.re * phasorRadius;
    const endY = phasorY - coeff.im * phasorRadius;
    drawArrow(ctx, cx, phasorY, endX, endY, colors[i], 4);
    drawText(ctx, labels[i], cx, phasorY + phasorRadius + 22, compact ? 11 : 13, colors[i], "center");
    drawText(ctx, `p=${coeff.p.toFixed(2)}`, cx, phasorY + phasorRadius + 42, compact ? 10 : 12, palette.muted, "center");
  });

  const plotLeft = compact ? width * 0.08 : width * 0.08;
  const plotRight = compact ? width * 0.92 : width * 0.47;
  const plotTop = compact ? height * 0.48 : height * 0.58;
  const plotBottom = compact ? height * 0.82 : height * 0.88;
  const plotMid = (plotTop + plotBottom) / 2;
  const plotAmp = (plotBottom - plotTop) * 0.38;
  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.34)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotMid);
  ctx.lineTo(plotRight, plotMid);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();
  ctx.strokeStyle = palette.red;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  for (let px = plotLeft; px <= plotRight; px += 3) {
    const tau = t - 3 + ((px - plotLeft) / (plotRight - plotLeft)) * 6;
    const y = plotMid - expectationAt(tau) * plotAmp * 0.85;
    if (px === plotLeft) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();
  const nowX = plotLeft + ((3 / 6) * (plotRight - plotLeft));
  ctx.strokeStyle = "rgba(178,59,75,0.35)";
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(nowX, plotTop);
  ctx.lineTo(nowX, plotBottom);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, "observable expectation", plotLeft, plotTop - 18, compact ? 12 : 14, palette.ink);
  drawText(ctx, `<A>(t)=${observable.toFixed(2)}`, plotRight, plotTop - 18, compact ? 12 : 14, palette.red, "right");

  const cardLeft = compact ? width * 0.08 : width * 0.54;
  const cardTop = compact ? height * 0.53 : height * 0.16;
  const cardW = compact ? width * 0.84 : width * 0.38;
  const cardH = compact ? height * 0.39 : height * 0.68;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardLeft, cardTop, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "unitary propagator", cardLeft + 18, cardTop + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "U(t) = exp(-iHt/hbar)", cardLeft + 18, cardTop + 58, compact ? 12 : 14, palette.teal);
  drawText(ctx, "energy-basis probabilities stay fixed", cardLeft + 18, cardTop + 84, compact ? 11 : 13, palette.muted);

  const barBase = cardTop + (compact ? 215 : 250);
  const maxH = compact ? 76 : 118;
  const barW = compact ? Math.max(34, cardW * 0.13) : Math.max(42, cardW * 0.12);
  const barGap = compact ? 22 : 30;
  const barsLeft = cardLeft + 22;
  coeffs.forEach((coeff, i) => {
    const x = barsLeft + i * (barW + barGap);
    const h = Math.max(3, coeff.p * maxH);
    ctx.save();
    ctx.fillStyle = `${colors[i]}33`;
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 2;
    ctx.fillRect(x, barBase - h, barW, h);
    ctx.strokeRect(x, barBase - h, barW, h);
    ctx.restore();
    drawText(ctx, labels[i], x + barW / 2, barBase + 18, compact ? 10 : 12, palette.muted, "center");
    drawText(ctx, coeff.p.toFixed(2), x + barW / 2, barBase - h - 12, compact ? 10 : 12, colors[i], "center");
  });

  const formulaY = compact ? cardTop + 116 : cardTop + 124;
  drawText(ctx, "psi(t) = sum c_n exp(-iE_n t/hbar) E_n", cardLeft + 18, formulaY, compact ? 10 : 12, palette.ink);
  drawText(ctx, "relative phases drive interference", cardLeft + 18, formulaY + 26, compact ? 11 : 13, palette.gold);
  drawText(ctx, `<H> = ${energyMean.toFixed(2)} constant`, cardLeft + 18, cardTop + cardH - 34, compact ? 11 : 13, palette.green);

  readout.value = `gap ${gap.toFixed(2)}, probabilities ${coeffs.map((c) => c.p.toFixed(2)).join(", ")}, <A>(t) ${observable.toFixed(3)}, <H> ${energyMean.toFixed(3)}`;
}

export function drawHeisenbergPicture(t = 0) {
  const canvas = document.querySelector("#heisenberg-canvas");
  const gapSlider = document.querySelector("#heisenberg-gap");
  const stateSlider = document.querySelector("#heisenberg-state");
  const observableSlider = document.querySelector("#heisenberg-observable");
  const readout = document.querySelector("#heisenberg-readout");
  if (!canvas || !gapSlider || !stateSlider || !observableSlider || !readout) return;

  const gap = Number(gapSlider.value) / 48;
  const theta = (Number(stateSlider.value) / 180) * Math.PI;
  const alpha = (Number(observableSlider.value) / 180) * Math.PI;
  const phase = gap * t;
  const state0 = { x: Math.sin(theta), y: 0, z: Math.cos(theta) };
  const stateS = { x: Math.sin(theta) * Math.cos(phase), y: Math.sin(theta) * Math.sin(phase), z: Math.cos(theta) };
  const observableS = { x: Math.cos(alpha), y: Math.sin(alpha), z: 0 };
  const observableH = { x: Math.cos(alpha - phase), y: Math.sin(alpha - phase), z: 0 };
  const expectationS = stateS.x * observableS.x + stateS.y * observableS.y + stateS.z * observableS.z;
  const expectationH = state0.x * observableH.x + state0.y * observableH.y + state0.z * observableH.z;

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const radius = compact ? Math.min(width * 0.16, height * 0.13) : Math.min(width * 0.13, height * 0.23);
  const y = compact ? height * 0.26 : height * 0.44;
  const leftX = compact ? width * 0.28 : width * 0.24;
  const rightX = compact ? width * 0.72 : width * 0.58;

  function project(centerX, centerY, vector, scale = 1) {
    return {
      x: centerX + (vector.x - 0.48 * vector.y) * radius * scale,
      y: centerY - (vector.z + 0.28 * vector.y) * radius * scale,
    };
  }

  function drawBlochDisk(centerX, centerY, title, stateVector, observableVector, movingState) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.strokeStyle = "rgba(23,32,42,0.24)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(23,32,42,0.15)";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.28, 0, 0, TAU);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();
    ctx.restore();

    const zTop = project(centerX, centerY, { x: 0, y: 0, z: 1 }, 0.96);
    drawArrow(ctx, centerX, centerY, zTop.x, zTop.y, palette.gold, 2);
    drawText(ctx, "H", zTop.x + 10, zTop.y + 8, compact ? 11 : 12, palette.gold);

    const obsEnd = project(centerX, centerY, observableVector, 0.88);
    drawArrow(ctx, centerX, centerY, obsEnd.x, obsEnd.y, palette.teal, 3);
    drawText(ctx, "A", obsEnd.x + 10, obsEnd.y - 8, compact ? 11 : 13, palette.teal);

    const stateEnd = project(centerX, centerY, stateVector, 0.82);
    drawArrow(ctx, centerX, centerY, stateEnd.x, stateEnd.y, palette.red, 4);
    drawText(ctx, movingState ? "psi(t)" : "psi(0)", stateEnd.x + 10, stateEnd.y - 10, compact ? 11 : 13, palette.red);
    drawText(ctx, title, centerX, centerY + radius + 32, compact ? 12 : 14, palette.ink, "center");
  }

  drawBlochDisk(leftX, y, "Schrodinger picture", stateS, observableS, true);
  drawBlochDisk(rightX, y, "Heisenberg picture", state0, observableH, false);

  if (!compact) {
    drawArrow(ctx, leftX + radius + 46, y, rightX - radius - 46, y, palette.gold, 2);
    drawText(ctx, "move time dependence", (leftX + rightX) / 2, y - 26, 12, palette.gold, "center");
  }

  const cardX = compact ? width * 0.08 : width * 0.73;
  const cardY = compact ? height * 0.54 : height * 0.15;
  const cardW = compact ? width * 0.84 : width * 0.22;
  const cardH = compact ? height * 0.36 : height * 0.64;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "same expectation", cardX + 16, cardY + 26, compact ? 13 : 15, palette.ink);
  drawText(ctx, "A_H = U dagger A U", cardX + 16, cardY + 56, compact ? 11 : 13, palette.teal);
  drawText(ctx, "dA_H/dt = i[H,A_H]/hbar", cardX + 16, cardY + 82, compact ? 10 : 12, palette.gold);
  drawText(ctx, `<A>_S = ${expectationS.toFixed(3)}`, cardX + 16, cardY + 120, compact ? 12 : 14, palette.red);
  drawText(ctx, `<A>_H = ${expectationH.toFixed(3)}`, cardX + 16, cardY + 148, compact ? 12 : 14, palette.red);

  const meterLeft = cardX + 18;
  const meterRight = cardX + cardW - 18;
  const meterY = cardY + (compact ? 205 : 210);
  const meterMid = (meterLeft + meterRight) / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(meterLeft, meterY);
  ctx.lineTo(meterRight, meterY);
  ctx.stroke();
  const tick = meterMid + expectationS * (meterRight - meterLeft) * 0.45;
  ctx.strokeStyle = palette.red;
  ctx.beginPath();
  ctx.moveTo(tick, meterY - 15);
  ctx.lineTo(tick, meterY + 15);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, "-1", meterLeft, meterY + 24, 10, palette.muted, "center");
  drawText(ctx, "+1", meterRight, meterY + 24, 10, palette.muted, "center");
  drawText(ctx, "predictions are invariant", cardX + 16, cardY + cardH - 30, compact ? 11 : 12, palette.green);

  readout.value = `gap ${gap.toFixed(2)}, theta ${(theta * 180 / Math.PI).toFixed(0)} deg, observable ${(alpha * 180 / Math.PI).toFixed(0)} deg, <A> ${expectationS.toFixed(3)}`;
}

export function drawEhrenfest(t = 0) {
  const canvas = document.querySelector("#ehrenfest-canvas");
  const omegaSlider = document.querySelector("#ehrenfest-omega");
  const momentumSlider = document.querySelector("#ehrenfest-momentum");
  const readout = document.querySelector("#ehrenfest-readout");
  if (!canvas || !omegaSlider || !momentumSlider || !readout) return;

  const omega = Number(omegaSlider.value) / 50;
  const p0 = Number(momentumSlider.value) / 55;
  const x0 = -0.85;
  const time = t * 0.75;
  const freeTime = ((time + 2) % 4) - 2;
  let xExpectation;
  let pExpectation;
  if (omega < 0.04) {
    const rawX = x0 + p0 * freeTime;
    xExpectation = ((((rawX + 3) % 6) + 6) % 6) - 3;
    pExpectation = p0;
  } else {
    xExpectation = x0 * Math.cos(omega * time) + (p0 / omega) * Math.sin(omega * time);
    pExpectation = -x0 * omega * Math.sin(omega * time) + p0 * Math.cos(omega * time);
  }
  const energy = 0.5 * p0 * p0 + 0.5 * omega * omega * x0 * x0;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 680;
  const left = compact ? width * 0.1 : width * 0.08;
  const right = compact ? width * 0.9 : width * 0.52;
  const top = compact ? height * 0.1 : height * 0.17;
  const bottom = compact ? height * 0.45 : height * 0.74;
  const midY = bottom - 54;
  const domain = 3;
  const mapX = (value) => left + ((value + domain) / (2 * domain)) * (right - left);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left, midY);
  ctx.lineTo(right, midY);
  ctx.moveTo(mapX(0), top);
  ctx.lineTo(mapX(0), bottom);
  ctx.stroke();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 240; i += 1) {
    const x = -domain + (2 * domain * i) / 240;
    const v = omega < 0.04 ? 0 : 0.5 * omega * omega * x * x;
    const y = midY - Math.min(1.55, v) * (bottom - top) * 0.34;
    if (i === 0) ctx.moveTo(mapX(x), y);
    else ctx.lineTo(mapX(x), y);
  }
  ctx.stroke();

  const packetX = mapX(Math.max(-domain, Math.min(domain, xExpectation)));
  const packetSigma = (right - left) * 0.055;
  const packetAmp = (bottom - top) * 0.18;
  ctx.fillStyle = "rgba(31,111,178,0.18)";
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let px = left; px <= right; px += 3) {
    const env = gaussian(px - packetX, packetSigma);
    const y = midY - env * packetAmp;
    if (px === left) ctx.moveTo(px, midY);
    ctx.lineTo(px, y);
  }
  ctx.lineTo(right, midY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawArrow(ctx, packetX, midY - packetAmp - 18, packetX + pExpectation * 34, midY - packetAmp - 18, palette.red, 2);
  drawText(ctx, "<x>", packetX, midY + 24, 13, palette.blue, "center");
  drawText(ctx, "<p>", packetX + pExpectation * 34, midY - packetAmp - 38, 13, palette.red, "center");
  drawText(ctx, omega < 0.04 ? "free particle" : "harmonic V(x)", left, top - 26, 14, palette.gold);
  drawText(ctx, "packet center follows Ehrenfest equations", (left + right) / 2, bottom + 24, 13, palette.ink, "center");

  const plotLeft = compact ? width * 0.12 : width * 0.61;
  const plotRight = compact ? width * 0.9 : width * 0.94;
  const plotTop = compact ? height * 0.6 : height * 0.18;
  const plotBottom = compact ? height * 0.84 : height * 0.62;
  ctx.strokeStyle = "rgba(23,32,42,0.34)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, (plotTop + plotBottom) / 2);
  ctx.lineTo(plotRight, (plotTop + plotBottom) / 2);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();

  function historyCurve(color, valueAt, label, offset) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 220; i += 1) {
      const u = i / 220;
      const sampleTime = time - (1 - u) * 8;
      const value = valueAt(sampleTime);
      const x = plotLeft + u * (plotRight - plotLeft);
      const y = (plotTop + plotBottom) / 2 - Math.max(-2.8, Math.min(2.8, value)) * (plotBottom - plotTop) * 0.16;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    drawText(ctx, label, plotLeft + 8, plotTop + offset, compact ? 11 : 12, color);
  }

  const xAt = (sampleTime) => {
    if (omega < 0.04) {
      const local = ((sampleTime + 2) % 4) - 2;
      const rawX = x0 + p0 * local;
      return ((((rawX + 3) % 6) + 6) % 6) - 3;
    }
    return x0 * Math.cos(omega * sampleTime) + (p0 / omega) * Math.sin(omega * sampleTime);
  };
  const pAt = (sampleTime) => {
    if (omega < 0.04) return p0;
    return -x0 * omega * Math.sin(omega * sampleTime) + p0 * Math.cos(omega * sampleTime);
  };
  historyCurve(palette.blue, xAt, "<x>(t)", 16);
  historyCurve(palette.red, pAt, "<p>(t)", 34);
  drawText(ctx, "<H> constant", plotRight, plotBottom + 24, compact ? 11 : 12, palette.green, "right");

  if (!compact) {
    const lawX = width * 0.61;
    const lawY = height * 0.72;
    const laws = [
      ["d<x>/dt", "= <p>/m", palette.blue],
      ["d<p>/dt", "= -<dV/dx>", palette.red],
      ["[H,H]=0", "=> d<H>/dt=0", palette.green],
    ];
    laws.forEach((law, index) => {
      const y = lawY + index * 32;
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.strokeStyle = law[2];
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(lawX, y - 14, width * 0.31, 24, 6);
      ctx.fill();
      ctx.stroke();
      drawText(ctx, law[0], lawX + 10, y - 2, 12, law[2]);
      drawText(ctx, law[1], lawX + width * 0.14, y - 2, 12, palette.ink);
    });
  }
  ctx.restore();

  readout.value = `omega = ${omega.toFixed(2)}, p0 = ${p0.toFixed(2)}, <x> = ${xExpectation.toFixed(2)}, <p> = ${pExpectation.toFixed(2)}, <H> = ${energy.toFixed(2)} constant`;
}
