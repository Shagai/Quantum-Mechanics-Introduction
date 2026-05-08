/**
 * Spin and identical-particle visualizations
 *
 * Spin ladders, coupling, exchange symmetry, fine structure, hyperfine splitting,
 * and adiabatic following are kept together because they all draw finite-level
 * state spaces. Helper functions such as formatJ, halfLabel, and buildHyperfineLevels
 * stay close to the figures that use them so the quantum-number conventions remain
 * local and easy to audit.
 */

import { TAU, clear, drawArrow, drawText, gaussian, grid, palette, setupCanvas } from "../shared/canvas.js";

export function formatJ(value) {
  const rounded = Math.round(value * 2);
  if (rounded % 2 === 0) return `${rounded / 2}`;
  return `${rounded}/2`;
}

export function drawSpin() {
  const canvas = document.querySelector("#spin-canvas");
  const angleSlider = document.querySelector("#spin-angle");
  const jSlider = document.querySelector("#spin-j");
  const readout = document.querySelector("#spin-readout");
  if (!canvas || !angleSlider || !jSlider || !readout) return;

  const betaDeg = Number(angleSlider.value);
  const beta = (betaDeg / 180) * Math.PI;
  const j = Number(jSlider.value) / 2;
  const pUp = Math.pow(Math.cos(beta / 2), 2);
  const pDown = 1 - pUp;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const sourceX = width * 0.1;
  const centerY = height * 0.52;
  const magnetX = width * 0.31;
  const screenX = width * 0.58;
  const upY = height * 0.25;
  const downY = height * 0.78;

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.34)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sourceX, centerY);
  ctx.lineTo(magnetX - 42, centerY);
  ctx.stroke();

  ctx.fillStyle = "rgba(31,111,178,0.1)";
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(magnetX - 40, centerY - 72, 80, 58, 8);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(magnetX - 40, centerY + 14, 80, 58, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, "N", magnetX, centerY - 43, 16, palette.blue, "center");
  drawText(ctx, "S", magnetX, centerY + 43, 16, palette.red, "center");

  function beam(targetY, probability, color, label) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.24 + probability * 0.76;
    ctx.lineWidth = 3 + probability * 7;
    ctx.beginPath();
    ctx.moveTo(magnetX + 42, centerY);
    ctx.bezierCurveTo(magnetX + 115, centerY, screenX - 80, targetY, screenX, targetY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = `${color}33`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const barWidth = 28 + probability * 118;
    ctx.fillRect(screenX + 18, targetY - 13, barWidth, 26);
    ctx.strokeRect(screenX + 18, targetY - 13, barWidth, 26);
    drawText(ctx, `${label} ${(probability * 100).toFixed(1)}%`, screenX + 24, targetY - 32, 13, color);
  }

  beam(upY, pUp, palette.blue, "+z");
  beam(downY, pDown, palette.red, "-z");

  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.arc(sourceX, centerY, 9, 0, TAU);
  ctx.fill();

  const blochX = width * 0.18;
  const blochY = height * 0.26;
  const r = Math.min(width, height) * 0.075;
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(blochX, blochY, r, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(blochX, blochY - r);
  ctx.lineTo(blochX, blochY + r);
  ctx.stroke();
  drawArrow(ctx, blochX, blochY, blochX + Math.sin(beta) * r, blochY - Math.cos(beta) * r, palette.gold, 2);
  drawText(ctx, "prepared spin", blochX, blochY + r + 24, 13, palette.ink, "center");
  drawText(ctx, "Stern-Gerlach z", magnetX, centerY + 92, 13, palette.ink, "center");

  const ladderX = width * 0.79;
  const ladderTop = height * 0.16;
  const ladderBottom = height * 0.84;
  const mValues = [];
  for (let raw = -Math.round(j * 2); raw <= Math.round(j * 2); raw += 2) {
    mValues.push(raw / 2);
  }

  ctx.strokeStyle = "rgba(23,32,42,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ladderX, ladderTop);
  ctx.lineTo(ladderX, ladderBottom);
  ctx.stroke();

  const maxCoeff = Math.max(1, Math.sqrt(j * (j + 1)));
  mValues.forEach((m, index) => {
    const y = ladderBottom - (index / Math.max(1, mValues.length - 1)) * (ladderBottom - ladderTop);
    const isEdge = Math.abs(Math.abs(m) - j) < 0.001;
    ctx.fillStyle = isEdge ? "rgba(178,59,75,0.2)" : "rgba(19,138,134,0.16)";
    ctx.strokeStyle = isEdge ? palette.red : palette.teal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ladderX, y, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();
    drawText(ctx, `m=${formatJ(m)}`, ladderX + 26, y, 13, palette.ink);

    if (index < mValues.length - 1) {
      const next = mValues[index + 1];
      const yNext = ladderBottom - ((index + 1) / Math.max(1, mValues.length - 1)) * (ladderBottom - ladderTop);
      const coeff = Math.sqrt(Math.max(0, j * (j + 1) - m * next));
      ctx.strokeStyle = `rgba(31,111,178,${0.18 + 0.52 * (coeff / maxCoeff)})`;
      ctx.lineWidth = 2 + 3 * (coeff / maxCoeff);
      ctx.beginPath();
      ctx.moveTo(ladderX - 18, y - 2);
      ctx.lineTo(ladderX - 18, yNext + 2);
      ctx.stroke();
      drawText(ctx, coeff.toFixed(2), ladderX - 34, (y + yNext) / 2, 11, palette.blue, "right");
    }
  });

  drawText(ctx, `j = ${formatJ(j)}`, ladderX, ladderTop - 28, 15, palette.ink, "center");
  drawText(ctx, "J+ coefficients", ladderX - 38, ladderBottom + 28, 12, palette.blue, "center");
  ctx.restore();

  readout.value = `beta = ${betaDeg} deg, P(+z) = ${pUp.toFixed(3)}, P(-z) = ${pDown.toFixed(3)}, j = ${formatJ(j)}, ${mValues.length} m-values`;
}

export function drawSpinCoupling() {
  const canvas = document.querySelector("#coupling-canvas");
  const mixSlider = document.querySelector("#coupling-mix");
  const phaseSlider = document.querySelector("#coupling-phase");
  const readout = document.querySelector("#coupling-readout");
  if (!canvas || !mixSlider || !phaseSlider || !readout) return;

  const gammaDeg = Number(mixSlider.value);
  const phiDeg = Number(phaseSlider.value);
  const gamma = (gammaDeg / 180) * Math.PI;
  const phi = (phiDeg / 180) * Math.PI;
  const c = Math.cos(gamma);
  const s = Math.sin(gamma);
  const productUpDown = c * c;
  const productDownUp = s * s;
  const interference = Math.sin(2 * gamma) * Math.cos(phi);
  const triplet = Math.max(0, Math.min(1, (1 + interference) / 2));
  const singlet = Math.max(0, Math.min(1, (1 - interference) / 2));
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 680;
  const leftX = compact ? width * 0.09 : width * 0.11;
  const centerX = compact ? width * 0.5 : width * 0.47;
  const rightX = compact ? width * 0.09 : width * 0.71;
  const productTop = compact ? height * 0.08 : height * 0.2;
  const resultTop = compact ? height * 0.61 : height * 0.2;
  const barWidth = compact ? width * 0.66 : width * 0.2;
  const barHeight = 22;

  function probabilityBar(x, y, widthValue, label, value, color) {
    ctx.fillStyle = `${color}30`;
    ctx.fillRect(x, y, widthValue * value, barHeight);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, widthValue, barHeight);
    drawText(ctx, label, x, y - 13, compact ? 11 : 13, color);
    drawText(ctx, value.toFixed(3), x + widthValue + 10, y + barHeight / 2, compact ? 11 : 12, palette.ink);
  }

  ctx.save();
  drawText(ctx, "uncoupled product basis", leftX, productTop - 34, compact ? 13 : 15, palette.ink);
  probabilityBar(leftX, productTop, barWidth, "|+->", productUpDown, palette.blue);
  probabilityBar(leftX, productTop + 64, barWidth, "|-+>", productDownUp, palette.red);
  if (!compact) {
    drawText(ctx, "amplitudes", leftX, productTop + 124, 12, palette.muted);
    drawText(ctx, "cos gamma and e^(i phi) sin gamma", leftX, productTop + 144, 12, palette.muted);
  }

  const matrixTop = compact ? height * 0.4 : height * 0.3;
  const matrixW = compact ? width * 0.58 : width * 0.18;
  const matrixH = compact ? 66 : 82;
  const matrixX = centerX - matrixW / 2;
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(matrixX, matrixTop, matrixW, matrixH, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, "Clebsch-Gordan", centerX, matrixTop + 18, compact ? 12 : 13, palette.ink, "center");
  drawText(ctx, "1/sqrt(2) [ 1   1 ]", centerX, matrixTop + 42, compact ? 11 : 12, palette.teal, "center");
  drawText(ctx, "           [ 1  -1 ]", centerX, matrixTop + 62, compact ? 11 : 12, palette.teal, "center");

  if (!compact) {
    drawArrow(ctx, leftX + barWidth + 48, productTop + 42, matrixX - 18, matrixTop + matrixH / 2, palette.gold, 2);
    drawArrow(ctx, matrixX + matrixW + 18, matrixTop + matrixH / 2, rightX - 42, resultTop + 42, palette.gold, 2);
  } else {
    drawArrow(ctx, centerX, productTop + 154, centerX, matrixTop - 14, palette.gold, 2);
    drawArrow(ctx, centerX, matrixTop + matrixH + 12, centerX, resultTop - 16, palette.gold, 2);
  }

  drawText(ctx, "definite total spin", rightX, resultTop - 34, compact ? 13 : 15, palette.ink);
  probabilityBar(rightX, resultTop, barWidth, "triplet |1,0>", triplet, palette.green);
  probabilityBar(rightX, resultTop + 64, barWidth, "singlet |0,0>", singlet, palette.red);

  if (!compact) {
    const levelX = width * 0.91;
    const levelTop = height * 0.19;
    drawText(ctx, "multiplets", levelX, levelTop - 28, 13, palette.ink, "center");
    for (let i = 0; i < 3; i += 1) {
      const y = levelTop + i * 34;
      ctx.beginPath();
      ctx.arc(levelX, y, i === 1 ? 8 : 6, 0, TAU);
      ctx.fillStyle = i === 1 ? "rgba(82,127,60,0.32)" : "rgba(31,111,178,0.18)";
      ctx.strokeStyle = i === 1 ? palette.green : palette.blue;
      ctx.fill();
      ctx.stroke();
      drawText(ctx, `m=${1 - i}`, levelX + 18, y, 12, palette.ink);
    }
    const singletY = levelTop + 132;
    ctx.beginPath();
    ctx.arc(levelX, singletY, 8, 0, TAU);
    ctx.fillStyle = "rgba(178,59,75,0.26)";
    ctx.strokeStyle = palette.red;
    ctx.fill();
    ctx.stroke();
    drawText(ctx, "j=0", levelX + 18, singletY, 12, palette.ink);
  }

  const phasorX = compact ? width * 0.5 : width * 0.49;
  const phasorY = compact ? height * 0.86 : height * 0.74;
  const phasorR = Math.min(width, height) * (compact ? 0.12 : 0.1);
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(phasorX, phasorY, phasorR, 0, TAU);
  ctx.moveTo(phasorX - phasorR - 10, phasorY);
  ctx.lineTo(phasorX + phasorR + 10, phasorY);
  ctx.moveTo(phasorX, phasorY - phasorR - 10);
  ctx.lineTo(phasorX, phasorY + phasorR + 10);
  ctx.stroke();
  drawArrow(ctx, phasorX, phasorY, phasorX + c * phasorR, phasorY, palette.blue, 2);
  drawArrow(ctx, phasorX, phasorY, phasorX + s * Math.cos(phi) * phasorR, phasorY - s * Math.sin(phi) * phasorR, palette.red, 2);
  drawText(ctx, "relative phase controls symmetric/antisymmetric interference", phasorX, phasorY + phasorR + 28, compact ? 11 : 12, palette.muted, "center");
  ctx.restore();

  readout.value = `gamma = ${gammaDeg} deg, phi = ${phiDeg} deg, P(triplet m=0) = ${triplet.toFixed(3)}, P(singlet) = ${singlet.toFixed(3)}`;
}

export function heatColor(value, hue) {
  const clamped = Math.max(0, Math.min(1, value));
  const alpha = 0.08 + clamped * 0.82;
  if (hue === "red") return `rgba(178,59,75,${alpha})`;
  if (hue === "green") return `rgba(82,127,60,${alpha})`;
  return `rgba(31,111,178,${alpha})`;
}

export function drawExchange() {
  const canvas = document.querySelector("#exchange-canvas");
  const typeSelect = document.querySelector("#exchange-type");
  const separationSlider = document.querySelector("#exchange-separation");
  const readout = document.querySelector("#exchange-readout");
  if (!canvas || !typeSelect || !separationSlider || !readout) return;

  const type = typeSelect.value;
  const separation = Number(separationSlider.value) / 50;
  const sigma = 0.82;
  const overlap = Math.exp(-(separation * separation) / (4 * sigma * sigma));
  const sign = type === "fermion" ? -1 : 1;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const left = width * 0.08;
  const top = height * 0.12;
  const size = Math.min(width * 0.58, height * 0.72);
  const right = left + size;
  const bottom = top + size;
  const xMin = -4;
  const xMax = 4;
  const cells = 74;
  const cell = size / cells;
  const aCenter = -separation / 2;
  const bCenter = separation / 2;

  function orbital(x, center) {
    return Math.exp(-((x - center) * (x - center)) / (2 * sigma * sigma));
  }

  function probability(x1, x2) {
    const a1 = orbital(x1, aCenter);
    const b1 = orbital(x1, bCenter);
    const a2 = orbital(x2, aCenter);
    const b2 = orbital(x2, bCenter);
    if (type === "distinguishable") return Math.pow(a1 * b2, 2);
    const normalization = Math.sqrt(Math.max(0.02, 2 * (1 + sign * overlap * overlap)));
    return Math.pow((a1 * b2 + sign * b1 * a2) / normalization, 2);
  }

  let maxProbability = 0;
  const probabilities = [];
  for (let row = 0; row < cells; row += 1) {
    const x2 = xMin + ((row + 0.5) / cells) * (xMax - xMin);
    for (let col = 0; col < cells; col += 1) {
      const x1 = xMin + ((col + 0.5) / cells) * (xMax - xMin);
      const value = probability(x1, x2);
      probabilities.push(value);
      maxProbability = Math.max(maxProbability, value);
    }
  }

  ctx.save();
  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      const value = probabilities[row * cells + col] / maxProbability;
      ctx.fillStyle = heatColor(value, type === "fermion" ? "red" : type === "boson" ? "blue" : "green");
      ctx.fillRect(left + col * cell, top + (cells - 1 - row) * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }

  ctx.strokeStyle = "rgba(23,32,42,0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(left, top, size, size);
  ctx.strokeStyle = type === "fermion" ? palette.red : palette.teal;
  ctx.lineWidth = 3;
  ctx.setLineDash(type === "distinguishable" ? [6, 8] : []);
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, top);
  ctx.stroke();
  ctx.setLineDash([]);

  drawText(ctx, "x1", (left + right) / 2, bottom + 28, 13, palette.ink, "center");
  drawText(ctx, "x2", left - 24, (top + bottom) / 2, 13, palette.ink, "center");
  drawText(ctx, "exchange diagonal x1 = x2", left + size * 0.58, top + size * 0.1, 13, type === "fermion" ? palette.red : palette.teal);

  const sideX = width * 0.78;
  const sideTop = height * 0.16;
  const sideBottom = height * 0.78;
  const sideMid = (sideTop + sideBottom) / 2;
  const sideWidth = width * 0.18;

  ctx.strokeStyle = "rgba(23,32,42,0.34)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sideX - sideWidth / 2, sideMid);
  ctx.lineTo(sideX + sideWidth / 2, sideMid);
  ctx.stroke();

  function smallOrbital(center, color, label, offsetY) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 160; i += 1) {
      const x = xMin + (i / 160) * (xMax - xMin);
      const px = sideX - sideWidth / 2 + ((x - xMin) / (xMax - xMin)) * sideWidth;
      const y = sideMid + offsetY - orbital(x, center) * 48;
      if (i === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
    drawText(ctx, label, sideX + sideWidth / 2 + 10, sideMid + offsetY - 28, 13, color);
  }

  smallOrbital(aCenter, palette.blue, "psi_a", -72);
  smallOrbital(bCenter, palette.red, "psi_b", 40);

  const exchangeLabel = type === "boson" ? "+1 symmetric" : type === "fermion" ? "-1 antisymmetric" : "labels observable";
  const diagonalProbability = probability(0, 0) / maxProbability;
  drawText(ctx, `exchange: ${exchangeLabel}`, sideX, sideTop - 28, 14, palette.ink, "center");
  drawText(ctx, `overlap S approx ${overlap.toFixed(2)}`, sideX, sideBottom + 26, 13, palette.muted, "center");
  ctx.restore();

  readout.value = `${type}, separation = ${separation.toFixed(2)}, overlap = ${overlap.toFixed(3)}, diagonal probability = ${diagonalProbability.toFixed(3)}`;
}

export function fineStructureShiftEv(n, j) {
  const alpha = 1 / 137.036;
  const bohrEnergy = -13.6057 / (n * n);
  return bohrEnergy * ((alpha * alpha) / (n * n)) * (n / (j + 0.5) - 0.75);
}

export function landeG(l, j) {
  const s = 0.5;
  return 1 + (j * (j + 1) + s * (s + 1) - l * (l + 1)) / (2 * j * (j + 1));
}

export function halfLabel(twoValue) {
  if (twoValue % 2 === 0) return String(twoValue / 2);
  return `${twoValue}/2`;
}

export function drawFineStructure(t = 0) {
  const canvas = document.querySelector("#fine-structure-canvas");
  const nSlider = document.querySelector("#fine-n");
  const lSlider = document.querySelector("#fine-l");
  const jSelect = document.querySelector("#fine-j");
  const mSlider = document.querySelector("#fine-mj");
  const bSlider = document.querySelector("#fine-b");
  const readout = document.querySelector("#fine-readout");
  if (!canvas || !nSlider || !lSlider || !jSelect || !mSlider || !bSlider || !readout) return;

  const n = Number(nSlider.value);
  lSlider.max = String(n - 1);
  let l = Math.max(0, Math.min(n - 1, Number(lSlider.value)));
  lSlider.value = String(l);

  if (jSelect.options[1]) jSelect.options[1].disabled = l === 0;
  let branch = Number(jSelect.value);
  if (l === 0 || l + branch * 0.5 <= 0) {
    branch = 1;
    jSelect.value = "1";
  }
  const j = l + branch * 0.5;
  const twoJ = Math.round(2 * j);
  mSlider.min = String(-twoJ);
  mSlider.max = String(twoJ);
  mSlider.step = "2";
  let twoM = Number(mSlider.value);
  twoM = -twoJ + 2 * Math.round((twoM + twoJ) / 2);
  twoM = Math.max(-twoJ, Math.min(twoJ, twoM));
  mSlider.value = String(twoM);
  const mJ = twoM / 2;

  const bField = Number(bSlider.value) / 10;
  const bohrEnergy = -13.6057 / (n * n);
  const fsShift = fineStructureShiftEv(n, j);
  const gJ = landeG(l, j);
  const muB = 5.7883818e-5;
  const zeemanShift = muB * gJ * mJ * bField;
  const totalShiftMicroEv = (fsShift + zeemanShift) * 1e6;
  const fsMicroEv = fsShift * 1e6;
  const zeemanMicroEv = zeemanShift * 1e6;

  const candidateJs = l === 0 ? [0.5] : [l - 0.5, l + 0.5];
  const levels = [];
  candidateJs.forEach((candidateJ) => {
    const candidateTwoJ = Math.round(candidateJ * 2);
    const candidateG = landeG(l, candidateJ);
    const candidateFs = fineStructureShiftEv(n, candidateJ) * 1e6;
    for (let candidateTwoM = -candidateTwoJ; candidateTwoM <= candidateTwoJ; candidateTwoM += 2) {
      const candidateM = candidateTwoM / 2;
      const candidateZeeman = muB * candidateG * candidateM * bField * 1e6;
      levels.push({
        j: candidateJ,
        twoJ: candidateTwoJ,
        twoM: candidateTwoM,
        fs: candidateFs,
        total: candidateFs + candidateZeeman,
      });
    }
  });

  let minShift = Math.min(...levels.map((level) => level.total), ...levels.map((level) => level.fs), totalShiftMicroEv, 0);
  let maxShift = Math.max(...levels.map((level) => level.total), ...levels.map((level) => level.fs), totalShiftMicroEv, 0);
  if (Math.abs(maxShift - minShift) < 1) {
    minShift -= 1;
    maxShift += 1;
  }
  const pad = (maxShift - minShift) * 0.16;
  minShift -= pad;
  maxShift += pad;

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 700;
  const plotLeft = compact ? width * 0.1 : width * 0.08;
  const plotRight = compact ? width * 0.9 : width * 0.54;
  const plotTop = compact ? height * 0.44 : height * 0.16;
  const plotBottom = compact ? height * 0.76 : height * 0.84;
  const fsX = plotLeft + (plotRight - plotLeft) * 0.42;
  const fanX = plotRight - 24;
  const yForShift = (shift) => plotBottom - ((shift - minShift) / (maxShift - minShift)) * (plotBottom - plotTop);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();

  const bohrY = yForShift(0);
  ctx.setLineDash([7, 6]);
  ctx.strokeStyle = "rgba(96,112,125,0.65)";
  ctx.beginPath();
  ctx.moveTo(plotLeft, bohrY);
  ctx.lineTo(plotRight, bohrY);
  ctx.stroke();
  ctx.setLineDash([]);
  drawText(ctx, "Bohr level", plotLeft + 8, bohrY - 15, compact ? 11 : 12, palette.muted);

  const branchColors = [palette.teal, palette.gold];
  candidateJs.forEach((candidateJ, index) => {
    const candidateTwoJ = Math.round(candidateJ * 2);
    const candidateFs = fineStructureShiftEv(n, candidateJ) * 1e6;
    const y = yForShift(candidateFs);
    const color = branchColors[index % branchColors.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = candidateTwoJ === twoJ ? 3.2 : 2.2;
    ctx.beginPath();
    ctx.moveTo(plotLeft + 16, y);
    ctx.lineTo(fsX, y);
    ctx.stroke();
    drawText(ctx, `j=${halfLabel(candidateTwoJ)}`, plotLeft + 18, y - 16, compact ? 11 : 12, color);
  });

  levels.forEach((level) => {
    const fromY = yForShift(level.fs);
    const toY = yForShift(level.total);
    const isSelected = level.twoJ === twoJ && level.twoM === twoM;
    ctx.strokeStyle = isSelected ? palette.red : "rgba(31,111,178,0.48)";
    ctx.lineWidth = isSelected ? 3.4 : 1.7;
    ctx.beginPath();
    ctx.moveTo(fsX + 10, fromY);
    ctx.lineTo(fanX - 86, toY);
    ctx.lineTo(fanX, toY);
    ctx.stroke();
    if (isSelected) {
      const pulse = 4 + 2 * Math.sin(t * 3);
      ctx.fillStyle = palette.red;
      ctx.beginPath();
      ctx.arc(fanX, toY, pulse, 0, TAU);
      ctx.fill();
      drawText(ctx, `m_j=${halfLabel(level.twoM)}`, fanX - 6, toY - 16, compact ? 11 : 12, palette.red, "right");
    }
  });

  drawText(ctx, "fine structure", plotLeft + 20, plotTop - 25, compact ? 12 : 14, palette.ink);
  drawText(ctx, "Zeeman fan", fsX + 54, plotTop - 25, compact ? 12 : 14, palette.ink);
  drawText(ctx, "relative energy shift (micro-eV)", plotLeft, plotBottom + 30, compact ? 11 : 12, palette.ink);

  const diagramX = compact ? width * 0.5 : width * 0.75;
  const diagramY = compact ? height * 0.2 : height * 0.32;
  const axisTop = diagramY - 95;
  const axisBottom = diagramY + 98;
  ctx.strokeStyle = "rgba(23,32,42,0.25)";
  ctx.lineWidth = 1.6;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(diagramX, axisBottom);
  ctx.lineTo(diagramX, axisTop);
  ctx.stroke();
  ctx.setLineDash([]);
  drawArrow(ctx, diagramX, axisBottom, diagramX, axisTop, palette.gold, 2.4);
  drawText(ctx, "B", diagramX + 12, axisTop + 8, 13, palette.gold);

  const lAngle = -0.95;
  const sAngle = -0.22 + branch * 0.28;
  const jAngle = -0.58 + branch * 0.12;
  const vectorScale = compact ? 62 : 78;
  drawArrow(ctx, diagramX, diagramY, diagramX + Math.cos(lAngle) * vectorScale, diagramY + Math.sin(lAngle) * vectorScale, palette.blue, 3);
  drawArrow(ctx, diagramX, diagramY, diagramX + Math.cos(sAngle) * vectorScale * 0.62, diagramY + Math.sin(sAngle) * vectorScale * 0.62, palette.red, 3);
  drawArrow(ctx, diagramX, diagramY, diagramX + Math.cos(jAngle) * vectorScale * 1.08, diagramY + Math.sin(jAngle) * vectorScale * 1.08, palette.green, 3.5);
  drawText(ctx, "L", diagramX + Math.cos(lAngle) * vectorScale + 8, diagramY + Math.sin(lAngle) * vectorScale, 13, palette.blue);
  drawText(ctx, "S", diagramX + Math.cos(sAngle) * vectorScale * 0.62 + 8, diagramY + Math.sin(sAngle) * vectorScale * 0.62, 13, palette.red);
  drawText(ctx, "J", diagramX + Math.cos(jAngle) * vectorScale * 1.08 + 8, diagramY + Math.sin(jAngle) * vectorScale * 1.08, 13, palette.green);

  const cardX = compact ? width * 0.1 : width * 0.61;
  const cardY = compact ? height * 0.78 : height * 0.59;
  const cardW = compact ? width * 0.8 : width * 0.33;
  const cardH = compact ? height * 0.21 : height * 0.28;
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  const lineGap = compact ? 18 : 24;
  const lineSize = compact ? 11 : 13;
  drawText(ctx, `E_n^0 = ${bohrEnergy.toFixed(4)} eV`, cardX + 14, cardY + 24, lineSize, palette.ink);
  drawText(ctx, `Delta E_fs = ${fsMicroEv.toFixed(2)} micro-eV`, cardX + 14, cardY + 24 + lineGap, lineSize, palette.teal);
  drawText(ctx, `g_j = ${gJ.toFixed(3)}, B = ${bField.toFixed(1)} T`, cardX + 14, cardY + 24 + 2 * lineGap, lineSize, palette.gold);
  drawText(ctx, `Delta E_Z = ${zeemanMicroEv.toFixed(2)} micro-eV`, cardX + 14, cardY + 24 + 3 * lineGap, lineSize, palette.red);
  drawText(ctx, `total shift = ${totalShiftMicroEv.toFixed(2)} micro-eV`, cardX + 14, cardY + 24 + 4 * lineGap, lineSize, palette.green);
  ctx.restore();

  readout.value = `n=${n}, ell=${l}, j=${halfLabel(twoJ)}, m_j=${halfLabel(twoM)}, B=${bField.toFixed(1)} T, fine=${fsMicroEv.toFixed(2)} micro-eV, Zeeman=${zeemanMicroEv.toFixed(2)} micro-eV`;
}

export function hyperfineGF(I, J, F) {
  if (F === 0) return 0;
  const gJ = 2.0023;
  const nuclearTerm = 0.003;
  const f2 = F * (F + 1);
  const j2 = J * (J + 1);
  const i2 = I * (I + 1);
  return (gJ * (f2 + j2 - i2)) / (2 * f2) + (nuclearTerm * (f2 + i2 - j2)) / (2 * f2);
}

export function buildHyperfineLevels(I, J, aMHz, bGauss) {
  const twoI = Math.round(2 * I);
  const twoJ = Math.round(2 * J);
  const minTwoF = Math.abs(twoI - twoJ);
  const maxTwoF = twoI + twoJ;
  const muBOverH = 1.3996246;
  const levels = [];

  for (let twoF = minTwoF; twoF <= maxTwoF; twoF += 2) {
    const F = twoF / 2;
    const base = (aMHz / 2) * (F * (F + 1) - I * (I + 1) - J * (J + 1));
    const gF = hyperfineGF(I, J, F);
    for (let twoM = -twoF; twoM <= twoF; twoM += 2) {
      const mF = twoM / 2;
      levels.push({
        twoF,
        twoM,
        base,
        gF,
        total: base + muBOverH * gF * mF * bGauss,
      });
    }
  }

  return levels;
}

export function drawHyperfine(t = 0) {
  const canvas = document.querySelector("#hyperfine-canvas");
  const iSlider = document.querySelector("#hyperfine-i");
  const jSlider = document.querySelector("#hyperfine-j");
  const aSlider = document.querySelector("#hyperfine-a");
  const fSlider = document.querySelector("#hyperfine-f");
  const mSlider = document.querySelector("#hyperfine-mf");
  const bSlider = document.querySelector("#hyperfine-b");
  const readout = document.querySelector("#hyperfine-readout");
  if (!canvas || !iSlider || !jSlider || !aSlider || !fSlider || !mSlider || !bSlider || !readout) return;

  const twoI = Number(iSlider.value);
  const twoJ = Number(jSlider.value);
  const I = twoI / 2;
  const J = twoJ / 2;
  const aMHz = Number(aSlider.value);
  const bGauss = Number(bSlider.value) / 2;
  const minTwoF = Math.abs(twoI - twoJ);
  const maxTwoF = twoI + twoJ;

  fSlider.min = String(minTwoF);
  fSlider.max = String(maxTwoF);
  fSlider.step = "2";
  let twoF = Number(fSlider.value);
  twoF = minTwoF + 2 * Math.round((twoF - minTwoF) / 2);
  twoF = Math.max(minTwoF, Math.min(maxTwoF, twoF));
  fSlider.value = String(twoF);
  const F = twoF / 2;

  mSlider.min = String(-twoF);
  mSlider.max = String(twoF);
  mSlider.step = "2";
  let twoM = Number(mSlider.value);
  twoM = -twoF + 2 * Math.round((twoM + twoF) / 2);
  twoM = Math.max(-twoF, Math.min(twoF, twoM));
  mSlider.value = String(twoM);
  const mF = twoM / 2;

  const levels = buildHyperfineLevels(I, J, aMHz, bGauss);
  const selected = levels.find((level) => level.twoF === twoF && level.twoM === twoM) ?? levels[0];
  let minShift = Math.min(...levels.map((level) => level.total), ...levels.map((level) => level.base), 0);
  let maxShift = Math.max(...levels.map((level) => level.total), ...levels.map((level) => level.base), 0);
  if (Math.abs(maxShift - minShift) < 1) {
    minShift -= 1;
    maxShift += 1;
  }
  const pad = (maxShift - minShift) * 0.14;
  minShift -= pad;
  maxShift += pad;

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 700;
  const plotLeft = compact ? width * 0.1 : width * 0.08;
  const plotRight = compact ? width * 0.9 : width * 0.58;
  const plotTop = compact ? height * 0.42 : height * 0.14;
  const plotBottom = compact ? height * 0.74 : height * 0.83;
  const splitX = plotLeft + (plotRight - plotLeft) * 0.42;
  const fanX = plotRight - 18;
  const yForShift = (shift) => plotBottom - ((shift - minShift) / (maxShift - minShift)) * (plotBottom - plotTop);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();

  const unsplitY = yForShift(0);
  ctx.strokeStyle = "rgba(96,112,125,0.65)";
  ctx.setLineDash([7, 6]);
  ctx.beginPath();
  ctx.moveTo(plotLeft, unsplitY);
  ctx.lineTo(plotRight, unsplitY);
  ctx.stroke();
  ctx.setLineDash([]);
  drawText(ctx, "unperturbed J level", plotLeft + 8, unsplitY - 16, compact ? 11 : 12, palette.muted);

  const uniqueF = [...new Set(levels.map((level) => level.twoF))];
  uniqueF.forEach((levelTwoF, index) => {
    const sample = levels.find((level) => level.twoF === levelTwoF);
    const y = yForShift(sample.base);
    const color = levelTwoF === twoF ? palette.gold : palette.teal;
    ctx.strokeStyle = color;
    ctx.lineWidth = levelTwoF === twoF ? 3.2 : 2.2;
    ctx.beginPath();
    ctx.moveTo(plotLeft + 14, y);
    ctx.lineTo(splitX, y);
    ctx.stroke();
    drawText(ctx, `F=${halfLabel(levelTwoF)}`, plotLeft + 18, y - 16 + (index % 2) * 8, compact ? 11 : 12, color);
  });

  levels.forEach((level) => {
    const fromY = yForShift(level.base);
    const toY = yForShift(level.total);
    const isSelected = level.twoF === twoF && level.twoM === twoM;
    ctx.strokeStyle = isSelected ? palette.red : "rgba(31,111,178,0.44)";
    ctx.lineWidth = isSelected ? 3.4 : 1.6;
    ctx.beginPath();
    ctx.moveTo(splitX + 10, fromY);
    ctx.lineTo(fanX - 72, toY);
    ctx.lineTo(fanX, toY);
    ctx.stroke();
    if (isSelected) {
      ctx.fillStyle = palette.red;
      ctx.beginPath();
      ctx.arc(fanX, toY, 5 + Math.sin(t * 3) * 1.5, 0, TAU);
      ctx.fill();
      drawText(ctx, `m_F=${halfLabel(level.twoM)}`, fanX - 8, toY - 16, compact ? 11 : 12, palette.red, "right");
    }
  });

  drawText(ctx, "hyperfine split", plotLeft + 18, plotTop - 24, compact ? 12 : 14, palette.ink);
  drawText(ctx, "weak-field fan", splitX + 54, plotTop - 24, compact ? 12 : 14, palette.ink);
  drawText(ctx, "frequency shift E/h (MHz)", plotLeft, plotBottom + 30, compact ? 11 : 12, palette.ink);

  const diagramX = compact ? width * 0.5 : width * 0.75;
  const diagramY = compact ? height * 0.2 : height * 0.27;
  const iAngle = -1.05;
  const jAngle = -0.18;
  const fAngle = -0.62 + 0.12 * Math.sin(t * 0.8);
  const scale = compact ? 58 : 74;
  drawArrow(ctx, diagramX, diagramY, diagramX + Math.cos(iAngle) * scale * Math.sqrt(I + 0.5), diagramY + Math.sin(iAngle) * scale * Math.sqrt(I + 0.5), palette.blue, 3);
  drawArrow(ctx, diagramX, diagramY, diagramX + Math.cos(jAngle) * scale * Math.sqrt(J + 0.5), diagramY + Math.sin(jAngle) * scale * Math.sqrt(J + 0.5), palette.red, 3);
  drawArrow(ctx, diagramX, diagramY, diagramX + Math.cos(fAngle) * scale * Math.sqrt(F + 0.5), diagramY + Math.sin(fAngle) * scale * Math.sqrt(F + 0.5), palette.green, 3.6);
  drawText(ctx, "I", diagramX + Math.cos(iAngle) * scale * Math.sqrt(I + 0.5) - 12, diagramY + Math.sin(iAngle) * scale * Math.sqrt(I + 0.5), 13, palette.blue);
  drawText(ctx, "J", diagramX + Math.cos(jAngle) * scale * Math.sqrt(J + 0.5) + 12, diagramY + Math.sin(jAngle) * scale * Math.sqrt(J + 0.5), 13, palette.red);
  drawText(ctx, "F", diagramX + Math.cos(fAngle) * scale * Math.sqrt(F + 0.5) + 12, diagramY + Math.sin(fAngle) * scale * Math.sqrt(F + 0.5), 13, palette.green);
  drawText(ctx, "F = I + J", diagramX, diagramY + (compact ? 82 : 110), compact ? 12 : 14, palette.ink, "center");

  const cardX = compact ? width * 0.1 : width * 0.62;
  const cardY = compact ? height * 0.78 : height * 0.55;
  const cardW = compact ? width * 0.8 : width * 0.32;
  const cardH = compact ? height * 0.2 : height * 0.31;
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  const lineGap = compact ? 18 : 24;
  const lineSize = compact ? 11 : 13;
  drawText(ctx, `I=${halfLabel(twoI)}, J=${halfLabel(twoJ)}, F=${halfLabel(twoF)}`, cardX + 14, cardY + 24, lineSize, palette.ink);
  drawText(ctx, `A/h = ${aMHz.toFixed(0)} MHz`, cardX + 14, cardY + 24 + lineGap, lineSize, palette.teal);
  drawText(ctx, `E_F/h = ${selected.base.toFixed(1)} MHz`, cardX + 14, cardY + 24 + 2 * lineGap, lineSize, palette.gold);
  drawText(ctx, `B = ${bGauss.toFixed(1)} G, g_F = ${selected.gF.toFixed(3)}`, cardX + 14, cardY + 24 + 3 * lineGap, lineSize, palette.red);
  drawText(ctx, `total = ${selected.total.toFixed(1)} MHz`, cardX + 14, cardY + 24 + 4 * lineGap, lineSize, palette.green);
  ctx.restore();

  readout.value = `I=${halfLabel(twoI)}, J=${halfLabel(twoJ)}, F=${halfLabel(twoF)}, m_F=${halfLabel(twoM)}, A/h=${aMHz.toFixed(0)} MHz, B=${bGauss.toFixed(1)} G, E/h=${selected.total.toFixed(1)} MHz`;
}

export function drawAdiabatic(t = 0) {
  const canvas = document.querySelector("#adiabatic-canvas");
  const speedSlider = document.querySelector("#adiabatic-speed");
  const gapSlider = document.querySelector("#adiabatic-gap");
  const coneSlider = document.querySelector("#adiabatic-cone");
  const readout = document.querySelector("#adiabatic-readout");
  if (!canvas || !speedSlider || !gapSlider || !coneSlider || !readout) return;

  const speed = Number(speedSlider.value) / 100;
  const gap = Number(gapSlider.value) / 100;
  const coneDeg = Number(coneSlider.value);
  const cone = (coneDeg / 180) * Math.PI;
  const solidAngle = 2 * Math.PI * (1 - Math.cos(cone));
  const berryPhase = -0.5 * solidAngle;
  const adiabaticParameter = (speed * Math.sin(cone)) / Math.max(0.08, gap * gap);
  const jumpProbability = Math.min(0.98, (adiabaticParameter * adiabaticParameter) / (1 + adiabaticParameter * adiabaticParameter));
  const phase = t * (0.7 + speed);
  const lag = Math.atan(adiabaticParameter) * 0.75;

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 680;
  const sphereX = compact ? width * 0.5 : width * 0.28;
  const sphereY = compact ? height * 0.26 : height * 0.48;
  const radius = Math.min(width, height) * (compact ? 0.2 : 0.23);
  const pathRy = radius * Math.sin(cone) * 0.34;
  const pathY = sphereY - Math.cos(cone) * radius * 0.72;
  const pathRx = radius * Math.sin(cone);
  const field = {
    x: sphereX + Math.sin(cone) * Math.cos(phase) * radius,
    y: sphereY - Math.cos(cone) * radius - Math.sin(cone) * Math.sin(phase) * radius * 0.34,
  };
  const state = {
    x: sphereX + Math.sin(cone) * Math.cos(phase - lag) * radius * (1 - jumpProbability * 0.28),
    y: sphereY - Math.cos(cone) * radius - Math.sin(cone) * Math.sin(phase - lag) * radius * 0.34,
  };

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.26)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sphereX, sphereY, radius, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(sphereX, sphereY, radius, radius * 0.32, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sphereX, sphereY - radius);
  ctx.lineTo(sphereX, sphereY + radius);
  ctx.stroke();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.ellipse(sphereX, pathY, pathRx, pathRy, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);

  drawArrow(ctx, sphereX, sphereY, field.x, field.y, palette.gold, 3);
  drawArrow(ctx, sphereX, sphereY, state.x, state.y, jumpProbability > 0.25 ? palette.red : palette.blue, 2.5);
  drawText(ctx, "B(t)", field.x + 8, field.y - 10, 13, palette.gold);
  drawText(ctx, "state", state.x + 8, state.y + 14, 13, jumpProbability > 0.25 ? palette.red : palette.blue);
  drawText(ctx, "closed path in parameter space", sphereX, sphereY + radius + 30, 13, palette.ink, "center");

  const plotLeft = compact ? width * 0.1 : width * 0.56;
  const plotRight = compact ? width * 0.9 : width * 0.94;
  const plotTop = compact ? height * 0.55 : height * 0.16;
  const plotBottom = compact ? height * 0.78 : height * 0.58;
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(plotLeft, plotBottom);
  ctx.stroke();

  const followProbability = 1 - jumpProbability;
  const bars = [
    ["adiabatic following", followProbability, palette.green],
    ["nonadiabatic jump", jumpProbability, palette.red],
  ];
  bars.forEach((bar, index) => {
    const y = plotTop + 44 + index * 58;
    ctx.fillStyle = `${bar[2]}2f`;
    ctx.fillRect(plotLeft + 8, y, (plotRight - plotLeft - 78) * bar[1], 22);
    ctx.strokeStyle = bar[2];
    ctx.lineWidth = 1.8;
    ctx.strokeRect(plotLeft + 8, y, plotRight - plotLeft - 78, 22);
    drawText(ctx, bar[0], plotLeft + 8, y - 14, compact ? 11 : 12, bar[2]);
    drawText(ctx, bar[1].toFixed(3), plotRight - 8, y + 11, compact ? 11 : 12, palette.ink, "right");
  });

  drawText(ctx, "adiabatic condition", plotLeft, plotTop - 24, 14, palette.ink);
  drawText(ctx, `η = |<m|Hdot|n>|/gap² ≈ ${adiabaticParameter.toFixed(2)}`, plotLeft + 4, plotBottom + 28, compact ? 11 : 12, palette.teal);

  const phaseX = compact ? width * 0.12 : width * 0.56;
  const phaseY = compact ? height * 0.88 : height * 0.72;
  const phaseW = compact ? width * 0.74 : width * 0.35;
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(phaseX, phaseY - 28, phaseW, 58, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, `solid angle Ωs = ${solidAngle.toFixed(2)} sr`, phaseX + 12, phaseY - 8, compact ? 12 : 13, palette.ink);
  drawText(ctx, `Berry phase γ- = ${berryPhase.toFixed(2)} rad = ${(berryPhase / Math.PI).toFixed(2)}π`, phaseX + 12, phaseY + 14, compact ? 12 : 13, palette.blue);
  ctx.restore();

  readout.value = `speed = ${speed.toFixed(2)}, gap = ${gap.toFixed(2)}, cone = ${coneDeg}°, η = ${adiabaticParameter.toFixed(2)}, jump ≈ ${jumpProbability.toFixed(3)}, Berry phase = ${(berryPhase / Math.PI).toFixed(2)}π`;
}
