/**
 * Canonical systems visualizations
 *
 * Bound states, scattering barriers, oscillator examples, perturbative systems,
 * hydrogen, and spherical harmonics are grouped here because they share the same
 * pattern: compute a compact analytic or qualitative model, map it into canvas
 * coordinates, then annotate the physical interpretation beside the plot.
 */

import { TAU, clear, drawArrow, drawText, gaussian, grid, palette, setupCanvas } from "../shared/canvas.js";

export function drawFreeParticle(t = 0) {
  const canvas = document.querySelector("#free-canvas");
  const widthSlider = document.querySelector("#free-width");
  const kSlider = document.querySelector("#free-k");
  const readout = document.querySelector("#free-readout");
  if (!canvas || !widthSlider || !kSlider || !readout) return;

  const sigma0 = Number(widthSlider.value) / 36;
  const k0 = Number(kSlider.value) / 45;
  const time = (t * 0.78) % 7.5;
  const mass = 1;
  const spread = sigma0 * Math.sqrt(1 + (time / (2 * mass * sigma0 * sigma0)) ** 2);
  const groupVelocity = k0 / mass;
  const center = -3.3 + groupVelocity * time;
  const wrappedCenter = ((((center + 4.2) % 8.4) + 8.4) % 8.4) - 4.2;
  const phaseVelocity = k0 === 0 ? 0 : k0 / (2 * mass);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 720;
  const plotLeft = compact ? width * 0.09 : width * 0.07;
  const plotRight = compact ? width * 0.91 : width * 0.61;
  const plotTop = compact ? height * 0.08 : height * 0.13;
  const plotBottom = compact ? height * 0.54 : height * 0.78;
  const midY = plotTop + (plotBottom - plotTop) * 0.47;
  const domain = 5;
  const xToPx = (x) => plotLeft + ((x + domain) / (2 * domain)) * (plotRight - plotLeft);
  const amp = (plotBottom - plotTop) * 0.18;
  const densityAmp = (plotBottom - plotTop) * 0.28;
  const envelope = (x, sigma = spread, c = wrappedCenter) => Math.exp(-((x - c) * (x - c)) / (2 * sigma * sigma));
  const density = (x) => Math.exp(-((x - wrappedCenter) * (x - wrappedCenter)) / (spread * spread));

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, midY);
  ctx.lineTo(plotRight, midY);
  ctx.moveTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.stroke();
  drawText(ctx, "Re Psi(x,t)", plotLeft, plotTop - 18, compact ? 12 : 14, palette.blue);
  drawText(ctx, "|Psi(x,t)|^2", plotLeft, plotBottom - densityAmp - 22, compact ? 12 : 14, palette.green);

  ctx.fillStyle = "rgba(82,127,60,0.15)";
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotBottom);
  for (let i = 0; i <= 320; i += 1) {
    const x = -domain + (2 * domain * i) / 320;
    const px = xToPx(x);
    const py = plotBottom - density(x) * densityAmp;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(plotRight, plotBottom);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.green;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 320; i += 1) {
    const x = -domain + (2 * domain * i) / 320;
    const px = xToPx(x);
    const py = plotBottom - density(x) * densityAmp;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 360; i += 1) {
    const x = -domain + (2 * domain * i) / 360;
    const carrier = Math.cos(k0 * 4.2 * x - 0.5 * k0 * k0 * time);
    const py = midY - envelope(x) * carrier * amp;
    const px = xToPx(x);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  const centerPx = xToPx(wrappedCenter);
  drawArrow(ctx, centerPx, plotBottom + 40, centerPx, plotBottom + 8, palette.gold, 2);
  drawText(ctx, "<x>", centerPx, plotBottom + 56, compact ? 11 : 13, palette.gold, "center");
  drawArrow(ctx, centerPx - Math.sign(groupVelocity || 1) * 42, midY + amp + 24, centerPx, midY + amp + 24, palette.red, 2.2);
  drawText(ctx, "group velocity", centerPx + 10, midY + amp + 44, compact ? 10 : 12, palette.red);

  const phaseStep = Math.max(0.55, Math.min(1.5, Math.PI / Math.max(0.35, Math.abs(k0) * 4.2)));
  for (let x = Math.ceil((-domain - phaseVelocity * time) / phaseStep) * phaseStep + phaseVelocity * time; x < domain; x += phaseStep) {
    const px = xToPx(x);
    if (px < plotLeft || px > plotRight) continue;
    ctx.strokeStyle = "rgba(178,59,75,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, midY - amp * 0.72);
    ctx.lineTo(px, midY + amp * 0.72);
    ctx.stroke();
  }

  const sideLeft = compact ? width * 0.1 : width * 0.67;
  const sideRight = compact ? width * 0.9 : width * 0.94;
  const phaseTop = compact ? height * 0.64 : height * 0.13;
  const phaseBottom = compact ? height * 0.9 : height * 0.46;
  ctx.strokeStyle = "rgba(23,32,42,0.34)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sideLeft, phaseBottom);
  ctx.lineTo(sideRight, phaseBottom);
  ctx.moveTo(sideLeft, phaseTop);
  ctx.lineTo(sideLeft, phaseBottom);
  ctx.stroke();
  drawText(ctx, "momentum components", sideLeft, phaseTop - 20, compact ? 12 : 14, palette.ink);
  const pSigma = 1 / (2 * sigma0);
  const kMin = -4;
  const kMax = 4;
  const kToPx = (k) => sideLeft + ((k - kMin) / (kMax - kMin)) * (sideRight - sideLeft);
  const pScale = phaseBottom - phaseTop;
  ctx.fillStyle = "rgba(19,138,134,0.14)";
  ctx.beginPath();
  ctx.moveTo(sideLeft, phaseBottom);
  for (let i = 0; i <= 220; i += 1) {
    const k = kMin + ((kMax - kMin) * i) / 220;
    const value = Math.exp(-((k - k0) * (k - k0)) / (2 * pSigma * pSigma));
    ctx.lineTo(kToPx(k), phaseBottom - value * pScale * 0.88);
  }
  ctx.lineTo(sideRight, phaseBottom);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = palette.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 220; i += 1) {
    const k = kMin + ((kMax - kMin) * i) / 220;
    const value = Math.exp(-((k - k0) * (k - k0)) / (2 * pSigma * pSigma));
    const px = kToPx(k);
    const py = phaseBottom - value * pScale * 0.88;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  const k0Px = kToPx(k0);
  ctx.strokeStyle = palette.gold;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(k0Px, phaseTop);
  ctx.lineTo(k0Px, phaseBottom);
  ctx.stroke();
  ctx.setLineDash([]);
  drawText(ctx, "k0", k0Px, phaseBottom + 18, 11, palette.gold, "center");

  const cardX = sideLeft;
  const cardY = compact ? height * 0.92 : height * 0.58;
  const cardW = sideRight - sideLeft;
  const cardH = compact ? height * 0.06 : height * 0.28;
  if (!compact) {
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.strokeStyle = palette.rule;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();
    drawText(ctx, "sigma_x(t) = sigma0 sqrt(1 + (t / 2 sigma0^2)^2)", cardX + 14, cardY + 30, 12, palette.muted);
    drawText(ctx, `sigma0 = ${sigma0.toFixed(2)}`, cardX + 14, cardY + 62, 12, palette.blue);
    drawText(ctx, `sigma_x(t) = ${spread.toFixed(2)}`, cardX + 14, cardY + 90, 12, palette.green);
    drawText(ctx, `v_g = ${groupVelocity.toFixed(2)}`, cardX + 14, cardY + 118, 12, palette.red);
  } else {
    drawText(ctx, `sigma_x(t) ${spread.toFixed(2)}   v_g ${groupVelocity.toFixed(2)}`, cardX, cardY, 11, palette.ink);
  }
  ctx.restore();

  readout.value = `sigma0 ${sigma0.toFixed(2)}, sigma_x(t) ${spread.toFixed(2)}, k0 ${k0.toFixed(2)}, group velocity ${groupVelocity.toFixed(2)}, phase velocity ${phaseVelocity.toFixed(2)}`;
}

export function drawSpectralExpansion(t = 0) {
  const canvas = document.querySelector("#spectral-canvas");
  const c2Slider = document.querySelector("#spectral-c2");
  const c3Slider = document.querySelector("#spectral-c3");
  const readout = document.querySelector("#spectral-readout");
  if (!canvas || !c2Slider || !c3Slider || !readout) return;

  const raw = [1, Number(c2Slider.value) / 100, Number(c3Slider.value) / 100];
  const norm = Math.hypot(...raw);
  const coeffs = raw.map((value) => value / norm);
  const weights = coeffs.map((value) => value * value);
  const energy = weights.reduce((sum, weight, index) => sum + weight * (index + 1) ** 2, 0);
  const time = t * 0.72;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const left = compact ? width * 0.09 : width * 0.07;
  const right = compact ? width * 0.91 : width * 0.6;
  const top = compact ? height * 0.08 : height * 0.16;
  const bottom = compact ? height * 0.48 : height * 0.78;
  const mid = top + (bottom - top) * 0.48;
  const xToPx = (x) => left + x * (right - left);
  const waveScale = (bottom - top) * 0.13;
  const densityScale = (bottom - top) * 0.22;

  function componentAt(x, sampleTime = time) {
    let re = 0;
    let im = 0;
    for (let n = 1; n <= 3; n += 1) {
      const phase = n * n * sampleTime;
      const basis = Math.sqrt(2) * Math.sin(n * Math.PI * x);
      re += coeffs[n - 1] * basis * Math.cos(phase);
      im -= coeffs[n - 1] * basis * Math.sin(phase);
    }
    return { re, im, density: re * re + im * im };
  }

  function expectationX(sampleTime) {
    let total = 0;
    const samples = 180;
    for (let i = 0; i <= samples; i += 1) {
      const x = i / samples;
      const weight = i === 0 || i === samples ? 0.5 : 1;
      total += weight * x * componentAt(x, sampleTime).density;
    }
    return total / samples;
  }

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.38)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left, mid);
  ctx.lineTo(right, mid);
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.moveTo(right, top);
  ctx.lineTo(right, bottom);
  ctx.stroke();
  drawText(ctx, "0", left, bottom + 18, 12, palette.muted, "center");
  drawText(ctx, "a", right, bottom + 18, 12, palette.muted, "center");
  drawText(ctx, "Re Psi", left + 8, top + 16, compact ? 11 : 13, palette.blue);
  drawText(ctx, "Im Psi", left + 8, top + 36, compact ? 11 : 13, palette.red);
  drawText(ctx, "|Psi|^2", left + 8, bottom - 18, compact ? 11 : 13, palette.green);

  const curves = [
    { key: "re", color: palette.blue, y: (value) => mid - value * waveScale },
    { key: "im", color: palette.red, y: (value) => mid - value * waveScale },
    { key: "density", color: palette.green, y: (value) => bottom - value * densityScale },
  ];
  for (const curve of curves) {
    ctx.strokeStyle = curve.color;
    ctx.lineWidth = curve.key === "density" ? 3 : 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 260; i += 1) {
      const x = i / 260;
      const value = componentAt(x)[curve.key];
      const px = xToPx(x);
      const py = curve.y(value);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const xExp = expectationX(time);
  const xExpPx = xToPx(xExp);
  drawArrow(ctx, xExpPx, bottom + 38, xExpPx, bottom + 8, palette.gold, 2);
  drawText(ctx, "<x>", xExpPx, bottom + 52, 13, palette.gold, "center");
  drawText(ctx, "time-dependent density from rotating phases", (left + right) / 2, top - 26, compact ? 12 : 14, palette.ink, "center");

  const sideLeft = compact ? width * 0.1 : width * 0.67;
  const sideRight = compact ? width * 0.9 : width * 0.94;
  const energyTop = compact ? height * 0.58 : height * 0.14;
  const energyBottom = compact ? height * 0.78 : height * 0.46;
  const barColors = [palette.blue, palette.teal, palette.red];

  ctx.strokeStyle = "rgba(23,32,42,0.34)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sideLeft, energyBottom);
  ctx.lineTo(sideRight, energyBottom);
  ctx.moveTo(sideLeft, energyTop);
  ctx.lineTo(sideLeft, energyBottom);
  ctx.stroke();
  drawText(ctx, "energy-basis weights", sideLeft, energyTop - 22, compact ? 12 : 14, palette.ink);
  for (let i = 0; i < 3; i += 1) {
    const x = sideLeft + (i + 0.7) * ((sideRight - sideLeft) / 3.4);
    const h = weights[i] * (energyBottom - energyTop) * 0.95;
    ctx.fillStyle = `${barColors[i]}44`;
    ctx.fillRect(x - 20, energyBottom - h, 40, h);
    ctx.strokeStyle = barColors[i];
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 20, energyBottom - h, 40, h);
    drawText(ctx, `n=${i + 1}`, x, energyBottom + 18, 11, palette.muted, "center");

    const phase = ((-((i + 1) ** 2) * time) % TAU + TAU) % TAU;
    const r = compact ? 15 : 18;
    const phaseY = energyBottom + (compact ? 46 : 50);
    ctx.strokeStyle = "rgba(23,32,42,0.2)";
    ctx.beginPath();
    ctx.arc(x, phaseY, r, 0, TAU);
    ctx.stroke();
    drawArrow(ctx, x, phaseY, x + Math.cos(phase) * r, phaseY + Math.sin(phase) * r, barColors[i], 2);
  }

  const traceTop = compact ? height * 0.86 : height * 0.63;
  const traceBottom = compact ? height * 0.96 : height * 0.87;
  ctx.strokeStyle = "rgba(23,32,42,0.34)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sideLeft, (traceTop + traceBottom) / 2);
  ctx.lineTo(sideRight, (traceTop + traceBottom) / 2);
  ctx.moveTo(sideLeft, traceTop);
  ctx.lineTo(sideLeft, traceBottom);
  ctx.stroke();
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 180; i += 1) {
    const u = i / 180;
    const sample = time - (1 - u) * 5;
    const value = expectationX(sample);
    const px = sideLeft + u * (sideRight - sideLeft);
    const py = (traceTop + traceBottom) / 2 - (value - 0.5) * (traceBottom - traceTop) * 1.8;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  drawText(ctx, "<x>(t)", sideLeft + 8, traceTop + 14, compact ? 11 : 13, palette.gold);
  ctx.restore();

  readout.value = `|c1|^2 ${weights[0].toFixed(2)}, |c2|^2 ${weights[1].toFixed(2)}, |c3|^2 ${weights[2].toFixed(2)}, <H>/E1 ${energy.toFixed(2)}, <x>/a ${xExp.toFixed(2)}`;
}

export function drawOrthogonality(t = 0) {
  const canvas = document.querySelector("#orthogonality-canvas");
  const nSlider = document.querySelector("#orthogonality-n");
  const mSlider = document.querySelector("#orthogonality-m");
  const phaseSlider = document.querySelector("#orthogonality-phase");
  const readout = document.querySelector("#orthogonality-readout");
  if (!canvas || !nSlider || !mSlider || !phaseSlider || !readout) return;

  const n = Number(nSlider.value);
  const m = Number(mSlider.value);
  const phaseDeg = Number(phaseSlider.value);
  const phase = (phaseDeg / 180) * Math.PI;
  const exactOverlap = n === m ? 1 : 0;
  const overlapRe = exactOverlap * Math.cos(phase);
  const overlapIm = exactOverlap * Math.sin(phase);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const plotLeft = compact ? width * 0.08 : width * 0.07;
  const plotRight = compact ? width * 0.92 : width * 0.6;
  const plotTop = compact ? height * 0.08 : height * 0.13;
  const plotBottom = compact ? height * 0.52 : height * 0.8;
  const waveBase = plotTop + (plotBottom - plotTop) * 0.36;
  const productBase = plotTop + (plotBottom - plotTop) * 0.76;
  const waveAmp = (plotBottom - plotTop) * 0.22;
  const productAmp = (plotBottom - plotTop) * 0.18;
  const mapX = (u) => plotLeft + u * (plotRight - plotLeft);
  const psi = (level, u) => Math.sqrt(2) * Math.sin(level * Math.PI * u);
  const ketReal = (u) => Math.cos(phase) * psi(m, u);
  const product = (u) => psi(n, u) * ketReal(u);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, waveBase);
  ctx.lineTo(plotRight, waveBase);
  ctx.moveTo(plotLeft, productBase);
  ctx.lineTo(plotRight, productBase);
  ctx.stroke();

  function drawCurve(fn, base, amp, color, widthPx = 2.8) {
    ctx.strokeStyle = color;
    ctx.lineWidth = widthPx;
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 1) {
      const u = i / 360;
      const x = mapX(u);
      const y = base - fn(u) * amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawCurve((u) => psi(n, u), waveBase, waveAmp, palette.blue, 2.6);
  drawCurve(ketReal, waveBase, waveAmp, palette.red, 2.6);

  for (let i = 0; i < 160; i += 1) {
    const u0 = i / 160;
    const u1 = (i + 1) / 160;
    const mid = (u0 + u1) / 2;
    const value = product(mid);
    const x0 = mapX(u0);
    const x1 = mapX(u1);
    const y = productBase - value * productAmp * 0.42;
    ctx.fillStyle = value >= 0 ? "rgba(82,127,60,0.25)" : "rgba(178,59,75,0.22)";
    ctx.beginPath();
    ctx.moveTo(x0, productBase);
    ctx.lineTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.lineTo(x1, productBase);
    ctx.closePath();
    ctx.fill();
  }
  drawCurve(product, productBase, productAmp * 0.42, palette.green, 2.5);

  ctx.restore();
  drawText(ctx, `psi_${n}(x)`, plotLeft, plotTop - 24, compact ? 12 : 14, palette.blue);
  drawText(ctx, `Re[e^(i phi) psi_${m}(x)]`, plotRight, plotTop - 24, compact ? 12 : 14, palette.red, "right");
  drawText(ctx, "signed product psi_n* psi_m", plotLeft, productBase - productAmp - 22, compact ? 11 : 13, palette.green);
  drawText(ctx, "x=0", plotLeft, plotBottom + 20, compact ? 10 : 12, palette.muted, "center");
  drawText(ctx, "x=a", plotRight, plotBottom + 20, compact ? 10 : 12, palette.muted, "center");

  const cardLeft = compact ? width * 0.08 : width * 0.66;
  const cardTop = compact ? height * 0.58 : height * 0.13;
  const cardW = compact ? width * 0.84 : width * 0.28;
  const cardH = compact ? height * 0.34 : height * 0.72;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardLeft, cardTop, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "overlap matrix", cardLeft + 18, cardTop + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "<n|m> = delta_nm", cardLeft + 18, cardTop + 56, compact ? 12 : 14, palette.teal);

  const cell = compact ? 20 : 24;
  const gridLeft = cardLeft + 22;
  const gridTop = cardTop + 84;
  for (let row = 1; row <= 6; row += 1) {
    for (let col = 1; col <= 6; col += 1) {
      const x = gridLeft + (col - 1) * cell;
      const y = gridTop + (row - 1) * cell;
      const diag = row === col;
      const selected = row === n && col === m;
      ctx.fillStyle = selected ? "rgba(178,59,75,0.28)" : diag ? "rgba(19,138,134,0.18)" : "rgba(96,112,125,0.08)";
      ctx.strokeStyle = selected ? palette.red : "rgba(23,32,42,0.16)";
      ctx.lineWidth = selected ? 2 : 1;
      ctx.fillRect(x, y, cell - 2, cell - 2);
      ctx.strokeRect(x, y, cell - 2, cell - 2);
      if (diag || selected) drawText(ctx, diag ? "1" : "0", x + cell / 2 - 1, y + cell / 2 - 1, compact ? 9 : 10, selected ? palette.red : palette.teal, "center");
    }
  }
  drawText(ctx, "n", gridLeft - 10, gridTop + 3 * cell, compact ? 10 : 12, palette.muted, "center");
  drawText(ctx, "m", gridLeft + 3 * cell, gridTop + 6 * cell + 12, compact ? 10 : 12, palette.muted, "center");

  const phasorX = cardLeft + cardW - (compact ? 70 : 78);
  const phasorY = cardTop + (compact ? 158 : 172);
  const phasorR = compact ? 32 : 38;
  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(phasorX, phasorY, phasorR, 0, TAU);
  ctx.stroke();
  ctx.moveTo(phasorX - phasorR, phasorY);
  ctx.lineTo(phasorX + phasorR, phasorY);
  ctx.moveTo(phasorX, phasorY - phasorR);
  ctx.lineTo(phasorX, phasorY + phasorR);
  ctx.stroke();
  ctx.restore();
  drawArrow(ctx, phasorX, phasorY, phasorX + overlapRe * phasorR, phasorY - overlapIm * phasorR, palette.gold, 3);
  drawText(ctx, "overlap phase", phasorX, phasorY + phasorR + 18, compact ? 9 : 11, palette.muted, "center");

  const resultY = cardTop + cardH - 82;
  drawText(ctx, `<${n}|${m}> = ${exactOverlap}${exactOverlap ? ` * e^{i ${phaseDeg}deg}` : ""}`, cardLeft + 18, resultY, compact ? 11 : 13, palette.red);
  drawText(ctx, n === m ? "same mode survives projection" : "oscillations cancel exactly", cardLeft + 18, resultY + 28, compact ? 11 : 13, n === m ? palette.green : palette.gold);
  drawText(ctx, "coefficients are projections onto basis states", cardLeft + 18, resultY + 56, compact ? 10 : 12, palette.ink);

  readout.value = `n=${n}, m=${m}, phase=${phaseDeg} deg, overlap = ${overlapRe.toFixed(3)} ${overlapIm >= 0 ? "+" : "-"} ${Math.abs(overlapIm).toFixed(3)}i`;
}

export function drawWell() {
  const canvas = document.querySelector("#well-canvas");
  const slider = document.querySelector("#well-level");
  const readout = document.querySelector("#well-readout");
  if (!canvas || !slider || !readout) return;
  const n = Number(slider.value);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const left = width * 0.16;
  const right = width * 0.84;
  const bottom = height * 0.78;
  const top = height * 0.16;
  const wellWidth = right - left;
  const maxEnergy = 36;
  const energy = n * n;
  const energyY = bottom - (energy / maxEnergy) * (bottom - top);
  const amp = Math.min(42, (bottom - top) / 8);

  ctx.save();
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(left, top - 18);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, top - 18);
  ctx.stroke();

  for (let level = 1; level <= 6; level += 1) {
    const e = level * level;
    const y = bottom - (e / maxEnergy) * (bottom - top);
    ctx.strokeStyle = level === n ? "rgba(178,59,75,0.85)" : "rgba(31,111,178,0.18)";
    ctx.lineWidth = level === n ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    drawText(ctx, `n=${level}`, right + 14, y, 12, level === n ? palette.red : palette.muted);
  }

  ctx.strokeStyle = palette.teal;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 360; i += 1) {
    const u = i / 360;
    const x = left + u * wellWidth;
    const psi = Math.sin(n * Math.PI * u);
    const y = energyY - psi * amp;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(19,138,134,0.16)";
  ctx.beginPath();
  ctx.moveTo(left, energyY);
  for (let i = 0; i <= 360; i += 1) {
    const u = i / 360;
    const x = left + u * wellWidth;
    const psi = Math.sin(n * Math.PI * u);
    const y = energyY - psi * psi * amp * 0.86;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(right, energyY);
  ctx.closePath();
  ctx.fill();

  drawText(ctx, "V = infinity", left + 8, top - 34, 13, palette.ink, "left");
  drawText(ctx, "V = 0", (left + right) / 2, bottom + 28, 13, palette.ink, "center");
  drawText(ctx, "psi_n(x)", left + 8, energyY - amp - 18, 13, palette.teal);
  drawText(ctx, "|psi_n(x)|^2", left + 8, Math.min(energyY + 20, bottom - 34), 13, palette.green);
  ctx.restore();

  readout.value = `n = ${n}, E_n proportional to ${n * n}, nodes = ${Math.max(0, n - 1)}`;
}

export function drawFiniteWell() {
  const canvas = document.querySelector("#finite-well-canvas");
  const depthSlider = document.querySelector("#finite-well-depth");
  const stateSlider = document.querySelector("#finite-well-state");
  const readout = document.querySelector("#finite-well-readout");
  if (!canvas || !depthSlider || !stateSlider || !readout) return;

  const z0 = Number(depthSlider.value) / 100;
  const epsilon = 0.0008;

  function finiteWellStates(depth) {
    const roots = [];
    const bisection = (fn, lo, hi) => {
      let a = lo;
      let b = hi;
      let fa = fn(a);
      let fb = fn(b);
      if (!Number.isFinite(fa) || !Number.isFinite(fb) || fa * fb > 0) return null;
      for (let i = 0; i < 64; i += 1) {
        const mid = (a + b) / 2;
        const fm = fn(mid);
        if (!Number.isFinite(fm)) return null;
        if (fa * fm <= 0) {
          b = mid;
          fb = fm;
        } else {
          a = mid;
          fa = fm;
        }
      }
      return (a + b) / 2;
    };
    const rhs = (z) => Math.sqrt(Math.max(0, depth * depth - z * z));
    for (let n = 0; n < 8; n += 1) {
      const evenLo = n * Math.PI + epsilon;
      const evenHi = Math.min(n * Math.PI + Math.PI / 2 - epsilon, depth - epsilon);
      if (evenLo < evenHi) {
        const root = bisection((z) => z * Math.tan(z) - rhs(z), evenLo, evenHi);
        if (root) roots.push({ z: root, parity: "even" });
      }
      const oddLo = n * Math.PI + Math.PI / 2 + epsilon;
      const oddHi = Math.min((n + 1) * Math.PI - epsilon, depth - epsilon);
      if (oddLo < oddHi) {
        const root = bisection((z) => -z / Math.tan(z) - rhs(z), oddLo, oddHi);
        if (root) roots.push({ z: root, parity: "odd" });
      }
    }
    return roots.sort((a, b) => a.z - b.z);
  }

  const states = finiteWellStates(z0);
  stateSlider.max = String(Math.max(1, states.length));
  const selectedIndex = Math.min(Number(stateSlider.value), states.length) - 1;
  const selected = states[Math.max(0, selectedIndex)];
  if (!selected) return;

  const kappa = Math.sqrt(Math.max(0, z0 * z0 - selected.z * selected.z));
  const energyFraction = (selected.z / z0) ** 2;
  const tailLength = 1 / Math.max(0.04, kappa);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const plotLeft = compact ? width * 0.09 : width * 0.07;
  const plotRight = compact ? width * 0.91 : width * 0.62;
  const plotTop = compact ? height * 0.1 : height * 0.16;
  const plotBottom = compact ? height * 0.56 : height * 0.78;
  const wellLeftQ = -1;
  const wellRightQ = 1;
  const domain = 2.5;
  const mapX = (q) => plotLeft + ((q + domain) / (2 * domain)) * (plotRight - plotLeft);
  const mapV = (fraction) => plotBottom - fraction * (plotBottom - plotTop);
  const energyY = mapV(energyFraction);
  const amp = (plotBottom - plotTop) * 0.14;

  function psi(q) {
    const absQ = Math.abs(q);
    if (selected.parity === "even") {
      const boundary = Math.cos(selected.z);
      if (absQ <= 1) return Math.cos(selected.z * q);
      return boundary * Math.exp(-kappa * (absQ - 1));
    }
    const sign = q < 0 ? -1 : 1;
    const boundary = Math.sin(selected.z);
    if (absQ <= 1) return Math.sin(selected.z * q);
    return sign * boundary * Math.exp(-kappa * (absQ - 1));
  }

  let maxAbs = 0;
  for (let i = 0; i <= 280; i += 1) {
    const q = -domain + (2 * domain * i) / 280;
    maxAbs = Math.max(maxAbs, Math.abs(psi(q)));
  }
  const scalePsi = (q) => psi(q) / Math.max(0.1, maxAbs);

  ctx.save();
  ctx.fillStyle = "rgba(178,59,75,0.09)";
  ctx.fillRect(plotLeft, plotTop, mapX(wellLeftQ) - plotLeft, plotBottom - plotTop);
  ctx.fillRect(mapX(wellRightQ), plotTop, plotRight - mapX(wellRightQ), plotBottom - plotTop);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotTop);
  ctx.lineTo(mapX(wellLeftQ), plotTop);
  ctx.lineTo(mapX(wellLeftQ), plotBottom);
  ctx.lineTo(mapX(wellRightQ), plotBottom);
  ctx.lineTo(mapX(wellRightQ), plotTop);
  ctx.lineTo(plotRight, plotTop);
  ctx.stroke();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(plotLeft, energyY);
  ctx.lineTo(plotRight, energyY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(82,127,60,0.16)";
  ctx.beginPath();
  ctx.moveTo(plotLeft, energyY);
  for (let i = 0; i <= 340; i += 1) {
    const q = -domain + (2 * domain * i) / 340;
    const x = mapX(q);
    const y = energyY - scalePsi(q) * scalePsi(q) * amp * 0.9;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(plotRight, energyY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = selected.parity === "even" ? palette.teal : palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 340; i += 1) {
    const q = -domain + (2 * domain * i) / 340;
    const x = mapX(q);
    const y = energyY - scalePsi(q) * amp;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  drawText(ctx, "V0", plotLeft + 8, plotTop - 18, 13, palette.red);
  drawText(ctx, "V = 0 inside", (mapX(wellLeftQ) + mapX(wellRightQ)) / 2, plotBottom + 22, 13, palette.ink, "center");
  drawText(ctx, "exponential tails", mapX(wellRightQ) + 18, energyY - amp - 18, compact ? 11 : 13, palette.red);
  drawText(ctx, `state ${selectedIndex + 1}: ${selected.parity}`, plotLeft, plotTop - 40, compact ? 12 : 14, palette.ink);

  const sideLeft = compact ? width * 0.1 : width * 0.68;
  const sideRight = compact ? width * 0.9 : width * 0.94;
  const ladderTop = compact ? height * 0.68 : height * 0.16;
  const ladderBottom = compact ? height * 0.93 : height * 0.58;
  ctx.strokeStyle = "rgba(23,32,42,0.34)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sideLeft, ladderBottom);
  ctx.lineTo(sideRight, ladderBottom);
  ctx.moveTo(sideLeft, ladderTop);
  ctx.lineTo(sideLeft, ladderBottom);
  ctx.stroke();
  drawText(ctx, "roots below V0", sideLeft, ladderTop - 20, compact ? 12 : 14, palette.ink);

  states.forEach((state, index) => {
    const y = ladderBottom - ((state.z / z0) ** 2) * (ladderBottom - ladderTop);
    const color = state.parity === "even" ? palette.teal : palette.blue;
    ctx.strokeStyle = index === selectedIndex ? palette.red : color;
    ctx.lineWidth = index === selectedIndex ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(sideLeft + 6, y);
    ctx.lineTo(sideRight - 8, y);
    ctx.stroke();
    drawText(ctx, `${index + 1}`, sideRight + 2, y, 11, index === selectedIndex ? palette.red : palette.muted);
  });

  const equationY = compact ? height * 0.61 : height * 0.68;
  const equationLines = [
    "even: z tan z = sqrt(z0^2 - z^2)",
    "odd: -z cot z = sqrt(z0^2 - z^2)",
    "tail length ~ 1 / kappa",
  ];
  equationLines.forEach((line, index) => {
    drawText(ctx, line, sideLeft, equationY + index * 24, compact ? 11 : 13, index === 2 ? palette.gold : palette.muted);
  });
  ctx.restore();

  readout.value = `z0 = ${z0.toFixed(2)}, states = ${states.length}, selected ${selectedIndex + 1} ${selected.parity}, E/V0 = ${energyFraction.toFixed(3)}, kappa a/2 = ${kappa.toFixed(2)}, tail = ${tailLength.toFixed(2)}`;
}

export function drawParitySymmetry(t = 0) {
  const canvas = document.querySelector("#parity-canvas");
  const mixSlider = document.querySelector("#parity-mix");
  const phaseSlider = document.querySelector("#parity-phase");
  const tiltSlider = document.querySelector("#parity-tilt");
  const readout = document.querySelector("#parity-readout");
  if (!canvas || !mixSlider || !phaseSlider || !tiltSlider || !readout) return;

  const oddWeight = Number(mixSlider.value) / 100;
  const phaseDeg = Number(phaseSlider.value);
  const phase = (phaseDeg / 180) * Math.PI;
  const tilt = Number(tiltSlider.value) / 100;
  const cOdd = Math.sqrt(oddWeight);
  const cEven = Math.sqrt(1 - oddWeight);
  const parityExpectation = cEven * cEven - cOdd * cOdd;
  const dipole = 1.08 * cEven * cOdd * Math.cos(phase) + 0.28 * tilt;
  const commute = Math.max(0, 1 - Math.abs(tilt));

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const plotLeft = compact ? width * 0.08 : width * 0.07;
  const plotRight = compact ? width * 0.92 : width * 0.58;
  const plotTop = compact ? height * 0.08 : height * 0.14;
  const plotBottom = compact ? height * 0.5 : height * 0.78;
  const baseline = plotTop + (plotBottom - plotTop) * 0.62;
  const amp = (plotBottom - plotTop) * 0.27;
  const xMin = -3.5;
  const xMax = 3.5;
  const mapX = (x) => plotLeft + ((x - xMin) / (xMax - xMin)) * (plotRight - plotLeft);

  function even(x) {
    return Math.exp(-x * x / 1.55);
  }

  function odd(x) {
    return 1.42 * x * Math.exp(-x * x / 1.55);
  }

  function realPsi(x) {
    const shifted = x - 0.28 * tilt;
    return cEven * even(shifted) + cOdd * Math.cos(phase) * odd(shifted);
  }

  function density(x) {
    const shifted = x - 0.28 * tilt;
    const e = even(shifted);
    const o = odd(shifted);
    return cEven * cEven * e * e + cOdd * cOdd * o * o + 2 * cEven * cOdd * Math.cos(phase) * e * o;
  }

  let maxPsi = 0;
  let maxDensity = 0;
  for (let i = 0; i <= 300; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / 300;
    maxPsi = Math.max(maxPsi, Math.abs(realPsi(x)));
    maxDensity = Math.max(maxDensity, Math.max(0, density(x)));
  }
  maxPsi = Math.max(0.1, maxPsi);
  maxDensity = Math.max(0.1, maxDensity);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, baseline);
  ctx.lineTo(plotRight, baseline);
  ctx.moveTo(mapX(0), plotTop);
  ctx.lineTo(mapX(0), plotBottom);
  ctx.stroke();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 300; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / 300;
    const potential = 0.08 * x * x + 0.12 * tilt * x;
    const y = plotBottom - (potential / 1.25) * (plotBottom - plotTop);
    if (i === 0) ctx.moveTo(mapX(x), y);
    else ctx.lineTo(mapX(x), y);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(82,127,60,0.16)";
  ctx.beginPath();
  ctx.moveTo(plotLeft, baseline);
  for (let i = 0; i <= 320; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / 320;
    ctx.lineTo(mapX(x), baseline - (Math.max(0, density(x)) / maxDensity) * amp * 0.85);
  }
  ctx.lineTo(plotRight, baseline);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.red;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 320; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / 320;
    const y = baseline - (realPsi(x) / maxPsi) * amp;
    if (i === 0) ctx.moveTo(mapX(x), y);
    else ctx.lineTo(mapX(x), y);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(19,138,134,0.55)";
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  for (let i = 0; i <= 220; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / 220;
    const y = baseline - (cEven * even(x) / Math.max(0.1, cEven)) * amp * 0.72;
    if (i === 0) ctx.moveTo(mapX(x), y);
    else ctx.lineTo(mapX(x), y);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(31,111,178,0.55)";
  ctx.beginPath();
  for (let i = 0; i <= 220; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / 220;
    const y = baseline - (cOdd * odd(x) / Math.max(0.1, cOdd)) * amp * 0.72;
    if (i === 0) ctx.moveTo(mapX(x), y);
    else ctx.lineTo(mapX(x), y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  drawText(ctx, "symmetric potential plus optional tilt", plotLeft, plotTop - 24, compact ? 12 : 14, palette.gold);
  drawText(ctx, "Re psi", plotLeft + 8, baseline - amp - 18, compact ? 11 : 13, palette.red);
  drawText(ctx, "|psi|^2", plotLeft + 8, baseline + 22, compact ? 11 : 13, palette.green);
  drawText(ctx, "x=0 mirror", mapX(0) + 8, plotBottom + 20, compact ? 10 : 12, palette.muted);

  const cardLeft = compact ? width * 0.08 : width * 0.64;
  const cardTop = compact ? height * 0.56 : height * 0.14;
  const cardW = compact ? width * 0.84 : width * 0.3;
  const cardH = compact ? height * 0.36 : height * 0.68;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardLeft, cardTop, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "parity operator", cardLeft + 18, cardTop + 28, compact ? 13 : 15, palette.ink);
  drawText(ctx, "(P psi)(x) = psi(-x)", cardLeft + 18, cardTop + 58, compact ? 11 : 13, palette.teal);
  drawText(ctx, "even: P=+1, odd: P=-1", cardLeft + 18, cardTop + 84, compact ? 11 : 13, palette.blue);
  drawText(ctx, `[H,P] strength ${(1 - commute).toFixed(2)}`, cardLeft + 18, cardTop + 112, compact ? 11 : 13, Math.abs(tilt) < 0.04 ? palette.green : palette.red);

  const barBase = cardTop + (compact ? 210 : 235);
  const maxH = compact ? 72 : 105;
  const barW = compact ? 40 : 48;
  [
    { label: "even", value: cEven * cEven, color: palette.teal },
    { label: "odd", value: cOdd * cOdd, color: palette.blue },
    { label: "<P>", value: (parityExpectation + 1) / 2, color: palette.gold },
  ].forEach((bar, i) => {
    const x = cardLeft + 24 + i * (barW + 25);
    const h = Math.max(4, bar.value * maxH);
    ctx.fillStyle = `${bar.color}33`;
    ctx.strokeStyle = bar.color;
    ctx.lineWidth = 2;
    ctx.fillRect(x, barBase - h, barW, h);
    ctx.strokeRect(x, barBase - h, barW, h);
    drawText(ctx, bar.label, x + barW / 2, barBase + 17, compact ? 9 : 11, palette.muted, "center");
    drawText(ctx, i === 2 ? parityExpectation.toFixed(2) : bar.value.toFixed(2), x + barW / 2, barBase - h - 12, compact ? 9 : 11, bar.color, "center");
  });

  const ruleY = cardTop + cardH - 64;
  drawText(ctx, "odd operator x:", cardLeft + 18, ruleY, compact ? 11 : 13, palette.ink);
  drawText(ctx, "<e|x|e>=0, <o|x|o>=0", cardLeft + 18, ruleY + 24, compact ? 10 : 12, palette.muted);
  drawText(ctx, `<x> ~ ${dipole.toFixed(2)}`, cardLeft + 18, ruleY + 48, compact ? 11 : 13, palette.red);

  readout.value = `odd weight ${oddWeight.toFixed(2)}, phase ${phaseDeg} deg, tilt ${tilt.toFixed(2)}, <P> ${parityExpectation.toFixed(3)}, <x> ${dipole.toFixed(3)}`;
}

export function drawDeltaPotential(t = 0) {
  const canvas = document.querySelector("#delta-canvas");
  const strengthSlider = document.querySelector("#delta-strength");
  const kSlider = document.querySelector("#delta-k");
  const readout = document.querySelector("#delta-readout");
  if (!canvas || !strengthSlider || !kSlider || !readout) return;

  const alpha = Number(strengthSlider.value) / 50;
  const k = Number(kSlider.value) / 45;
  const kappa = alpha;
  const boundEnergy = -0.5 * kappa * kappa;
  const transmission = (k * k) / (k * k + kappa * kappa);
  const reflection = 1 - transmission;
  const phase = t * 2.2;
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const leftA = compact ? width * 0.09 : width * 0.07;
  const rightA = compact ? width * 0.91 : width * 0.59;
  const topA = compact ? height * 0.08 : height * 0.14;
  const bottomA = compact ? height * 0.45 : height * 0.82;
  const domain = 4;
  const mapXA = (x) => leftA + ((x + domain) / (2 * domain)) * (rightA - leftA);
  const zeroY = topA + (bottomA - topA) * 0.38;
  const energyY = topA + (bottomA - topA) * 0.72;
  const boundAmp = (bottomA - topA) * 0.24;

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.38)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftA, zeroY);
  ctx.lineTo(rightA, zeroY);
  ctx.moveTo(mapXA(0), topA);
  ctx.lineTo(mapXA(0), bottomA);
  ctx.stroke();
  drawText(ctx, "V(x) = -alpha delta(x)", leftA, topA - 24, compact ? 12 : 14, palette.ink);

  const spikeX = mapXA(0);
  drawArrow(ctx, spikeX, zeroY - 44, spikeX, zeroY + 92, palette.red, 4);
  drawText(ctx, "area = -alpha", spikeX + 12, zeroY + 74, compact ? 11 : 13, palette.red);

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(leftA, energyY);
  ctx.lineTo(rightA, energyY);
  ctx.stroke();
  ctx.setLineDash([]);
  drawText(ctx, "bound energy", rightA - 6, energyY - 16, compact ? 11 : 12, palette.gold, "right");

  ctx.fillStyle = "rgba(82,127,60,0.16)";
  ctx.beginPath();
  ctx.moveTo(leftA, energyY);
  for (let i = 0; i <= 260; i += 1) {
    const x = -domain + (2 * domain * i) / 260;
    const psi2 = Math.exp(-2 * kappa * Math.abs(x));
    const y = energyY - psi2 * boundAmp;
    ctx.lineTo(mapXA(x), y);
  }
  ctx.lineTo(rightA, energyY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 260; i += 1) {
    const x = -domain + (2 * domain * i) / 260;
    const psi = Math.exp(-kappa * Math.abs(x));
    const y = energyY - psi * boundAmp;
    if (i === 0) ctx.moveTo(mapXA(x), y);
    else ctx.lineTo(mapXA(x), y);
  }
  ctx.stroke();
  drawText(ctx, "psi_b ~ exp(-kappa |x|)", leftA + 12, energyY - boundAmp - 18, compact ? 11 : 13, palette.green);

  const slopeY = energyY - boundAmp;
  drawArrow(ctx, spikeX - 74, slopeY + 42, spikeX - 12, slopeY + 6, palette.blue, 2);
  drawArrow(ctx, spikeX + 74, slopeY + 42, spikeX + 12, slopeY + 6, palette.blue, 2);
  drawText(ctx, "slope jumps at x=0", spikeX, slopeY - 20, compact ? 11 : 13, palette.blue, "center");

  const leftB = compact ? width * 0.09 : width * 0.66;
  const rightB = compact ? width * 0.91 : width * 0.94;
  const topB = compact ? height * 0.55 : height * 0.16;
  const bottomB = compact ? height * 0.93 : height * 0.82;
  const baseY = topB + (bottomB - topB) * 0.46;
  const mapXB = (x) => leftB + ((x + domain) / (2 * domain)) * (rightB - leftB);
  const amp = (bottomB - topB) * 0.13;

  ctx.strokeStyle = "rgba(23,32,42,0.38)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftB, baseY);
  ctx.lineTo(rightB, baseY);
  ctx.moveTo(mapXB(0), topB + 6);
  ctx.lineTo(mapXB(0), bottomB - 64);
  ctx.stroke();
  drawText(ctx, "scattering from the same spike", leftB, topB - 18, compact ? 12 : 14, palette.ink);

  function wave(x0, x1, amplitude, direction, color, yOffset = 0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 140; i += 1) {
      const u = i / 140;
      const x = x0 + (x1 - x0) * u;
      const y = baseY + yOffset - Math.sin(direction * k * x - phase) * amp * amplitude;
      if (i === 0) ctx.moveTo(mapXB(x), y);
      else ctx.lineTo(mapXB(x), y);
    }
    ctx.stroke();
  }
  wave(-domain, 0, 1, 1, palette.blue, -amp * 0.75);
  wave(-domain, 0, Math.sqrt(reflection), -1, palette.red, amp * 0.75);
  wave(0, domain, Math.sqrt(transmission), 1, palette.teal, 0);
  drawText(ctx, "incoming", leftB + 8, baseY - amp * 2.2, compact ? 10 : 11, palette.blue);
  drawText(ctx, "reflected", leftB + 8, baseY + amp * 2.0, compact ? 10 : 11, palette.red);
  drawText(ctx, "transmitted", mapXB(0.6), baseY - amp * 1.35, compact ? 10 : 11, palette.teal);

  const barTop = bottomB - 46;
  const barHeight = 34;
  const barWidth = Math.max(120, (rightB - leftB) * 0.44);
  const barX = leftB;
  ctx.strokeStyle = palette.rule;
  ctx.strokeRect(barX, barTop, barWidth, barHeight);
  ctx.fillStyle = `${palette.teal}55`;
  ctx.fillRect(barX, barTop, barWidth * transmission, barHeight);
  ctx.fillStyle = `${palette.red}44`;
  ctx.fillRect(barX + barWidth * transmission, barTop, barWidth * reflection, barHeight);
  drawText(ctx, `T ${transmission.toFixed(2)}`, barX + 8, barTop + barHeight / 2, compact ? 11 : 13, palette.teal);
  drawText(ctx, `R ${reflection.toFixed(2)}`, barX + barWidth + 8, barTop + barHeight / 2, compact ? 11 : 13, palette.red);
  ctx.restore();

  readout.value = `alpha ${alpha.toFixed(2)}, k ${k.toFixed(2)}, kappa ${kappa.toFixed(2)}, E_b ${boundEnergy.toFixed(2)}, T ${transmission.toFixed(3)}, R ${reflection.toFixed(3)}`;
}

export function drawBarrier(t) {
  const canvas = document.querySelector("#barrier-canvas");
  const energySlider = document.querySelector("#barrier-energy");
  const widthSlider = document.querySelector("#barrier-width");
  const readout = document.querySelector("#barrier-readout");
  if (!canvas || !energySlider || !widthSlider || !readout) return;

  const energyFraction = Number(energySlider.value) / 100;
  const barrierWidthSetting = Number(widthSlider.value);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const plotLeft = width * 0.08;
  const plotRight = width * 0.92;
  const baseline = height * 0.66;
  const top = height * 0.18;
  const barrierHeight = baseline - top;
  const center = width * 0.52;
  const barrierWidth = width * (barrierWidthSetting / 360);
  const barrierLeft = center - barrierWidth / 2;
  const barrierRight = center + barrierWidth / 2;
  const energyY = baseline - energyFraction * barrierHeight;
  const kappa = Math.sqrt(Math.max(0.001, 1 - energyFraction)) * (barrierWidthSetting / 45);
  const transmission = Math.exp(-2 * kappa);
  const reflectedAmp = Math.sqrt(Math.max(0, 1 - transmission));
  const transmittedAmp = Math.sqrt(transmission);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, baseline);
  ctx.lineTo(plotRight, baseline);
  ctx.stroke();

  ctx.fillStyle = "rgba(178,59,75,0.12)";
  ctx.fillRect(barrierLeft, top, barrierWidth, barrierHeight);
  ctx.strokeStyle = palette.red;
  ctx.lineWidth = 2;
  ctx.strokeRect(barrierLeft, top, barrierWidth, barrierHeight);

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(plotLeft, energyY);
  ctx.lineTo(plotRight, energyY);
  ctx.stroke();
  ctx.setLineDash([]);

  function waveSegment(x0, x1, amp, phase, color, decay = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = x0; px <= x1; px += 2) {
      const local = (px - x0) / Math.max(1, x1 - x0);
      const envelope = decay ? Math.exp(-kappa * local) : 1;
      const y = energyY - Math.sin(px * 0.05 - t * 2.3 + phase) * 28 * amp * envelope;
      if (px === x0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
  }

  waveSegment(plotLeft, barrierLeft, 1, 0, palette.blue);
  waveSegment(plotLeft, barrierLeft, reflectedAmp, Math.PI + t * 1.2, "rgba(178,59,75,0.72)");
  waveSegment(barrierLeft, barrierRight, 1, 0, palette.teal, true);
  waveSegment(barrierRight, plotRight, transmittedAmp, 0, palette.green);

  drawArrow(ctx, plotLeft + 20, energyY - 62, barrierLeft - 10, energyY - 62, palette.blue, 2);
  drawArrow(ctx, barrierLeft - 10, energyY + 58, plotLeft + 20, energyY + 58, palette.red, 2);
  drawArrow(ctx, barrierRight + 10, energyY - 62, plotRight - 20, energyY - 62, palette.green, 2);

  drawText(ctx, "V0", barrierRight + 12, top + 4, 13, palette.red);
  drawText(ctx, "E", plotLeft + 12, energyY - 12, 13, palette.gold);
  drawText(ctx, "incident", plotLeft + 26, energyY - 84, 13, palette.blue);
  drawText(ctx, "reflected", plotLeft + 26, energyY + 82, 13, palette.red);
  drawText(ctx, "transmitted", barrierRight + 20, energyY - 84, 13, palette.green);
  ctx.restore();

  readout.value = `E/V0 = ${energyFraction.toFixed(2)}, width = ${barrierWidthSetting}, T approx ${transmission.toFixed(4)}`;
}

export function factorial(n) {
  let value = 1;
  for (let i = 2; i <= n; i += 1) value *= i;
  return value;
}

export function hermite(n, x) {
  if (n === 0) return 1;
  if (n === 1) return 2 * x;
  let previous = 1;
  let current = 2 * x;
  for (let k = 2; k <= n; k += 1) {
    const next = 2 * x * current - 2 * (k - 1) * previous;
    previous = current;
    current = next;
  }
  return current;
}

export function oscillatorPsi(n, xi) {
  const normalization = 1 / Math.sqrt(Math.pow(2, n) * factorial(n) * Math.sqrt(Math.PI));
  return normalization * hermite(n, xi) * Math.exp(-(xi * xi) / 2);
}

export function drawOscillator() {
  const canvas = document.querySelector("#oscillator-canvas");
  const slider = document.querySelector("#oscillator-level");
  const readout = document.querySelector("#oscillator-readout");
  if (!canvas || !slider || !readout) return;

  const n = Number(slider.value);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const plotLeft = width * 0.08;
  const plotRight = width * 0.68;
  const top = height * 0.12;
  const bottom = height * 0.8;
  const xMin = -4;
  const xMax = 4;
  const selectedEnergy = n + 0.5;
  const maxEnergy = 7.2;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = bottom - top;
  const samples = [];
  let maxPsi = 0;
  let maxDensity = 0;

  for (let i = 0; i <= 420; i += 1) {
    const xi = xMin + (i / 420) * (xMax - xMin);
    const psi = oscillatorPsi(n, xi);
    const density = psi * psi;
    samples.push({ xi, psi, density });
    maxPsi = Math.max(maxPsi, Math.abs(psi));
    maxDensity = Math.max(maxDensity, density);
  }

  const xToPx = (xi) => plotLeft + ((xi - xMin) / (xMax - xMin)) * plotWidth;
  const energyToY = (energy) => bottom - (energy / maxEnergy) * plotHeight;
  const energyY = energyToY(selectedEnergy);
  const waveAmp = Math.min(34, plotHeight / 12);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.38)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, bottom);
  ctx.lineTo(plotRight, bottom);
  ctx.moveTo(plotLeft, top);
  ctx.lineTo(plotLeft, bottom);
  ctx.stroke();

  ctx.strokeStyle = "rgba(23,32,42,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 240; i += 1) {
    const xi = xMin + (i / 240) * (xMax - xMin);
    const potential = 0.5 * xi * xi;
    const x = xToPx(xi);
    const y = energyToY(Math.min(maxEnergy, potential));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  for (let level = 0; level <= 6; level += 1) {
    const energy = level + 0.5;
    const y = energyToY(energy);
    ctx.strokeStyle = level === n ? "rgba(178,59,75,0.85)" : "rgba(31,111,178,0.18)";
    ctx.lineWidth = level === n ? 3 : 1.4;
    ctx.beginPath();
    ctx.moveTo(plotLeft, y);
    ctx.lineTo(plotRight, y);
    ctx.stroke();
    drawText(ctx, `n=${level}`, plotRight + 12, y, 12, level === n ? palette.red : palette.muted);
  }

  ctx.fillStyle = "rgba(19,138,134,0.16)";
  ctx.beginPath();
  ctx.moveTo(xToPx(xMin), energyY);
  samples.forEach((point) => {
    const x = xToPx(point.xi);
    const y = energyY - (point.density / maxDensity) * waveAmp * 1.55;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(xToPx(xMax), energyY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  samples.forEach((point, index) => {
    const x = xToPx(point.xi);
    const y = energyY - (point.psi / maxPsi) * waveAmp;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const ladderX = width * 0.84;
  const ladderTop = top + 22;
  const ladderBottom = bottom - 10;
  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ladderX, ladderTop);
  ctx.lineTo(ladderX, ladderBottom);
  ctx.stroke();

  for (let level = 0; level <= 6; level += 1) {
    const y = ladderBottom - (level / 6) * (ladderBottom - ladderTop);
    const active = level === n;
    ctx.fillStyle = active ? palette.red : palette.paper;
    ctx.strokeStyle = active ? palette.red : "rgba(23,32,42,0.36)";
    ctx.lineWidth = active ? 3 : 1.5;
    ctx.beginPath();
    ctx.arc(ladderX, y, active ? 8 : 5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    drawText(ctx, `${level}`, ladderX + 24, y, 13, active ? palette.red : palette.muted);
  }

  if (n < 6) {
    const y0 = ladderBottom - (n / 6) * (ladderBottom - ladderTop);
    const y1 = ladderBottom - ((n + 1) / 6) * (ladderBottom - ladderTop);
    drawArrow(ctx, ladderX - 36, y0 - 4, ladderX - 36, y1 + 4, palette.teal, 2);
    drawText(ctx, "a+", ladderX - 58, (y0 + y1) / 2, 13, palette.teal, "center");
  }
  if (n > 0) {
    const y0 = ladderBottom - (n / 6) * (ladderBottom - ladderTop);
    const y1 = ladderBottom - ((n - 1) / 6) * (ladderBottom - ladderTop);
    drawArrow(ctx, ladderX - 76, y0 + 4, ladderX - 76, y1 - 4, palette.gold, 2);
    drawText(ctx, "a", ladderX - 96, (y0 + y1) / 2, 13, palette.gold, "center");
  }

  drawText(ctx, "dimensionless position xi", (plotLeft + plotRight) / 2, bottom + 28, 13, palette.ink, "center");
  drawText(ctx, "V(xi) = xi^2 / 2", plotLeft + 10, top + 10, 13, palette.muted);
  drawText(ctx, "psi_n", plotLeft + 10, energyY - waveAmp - 18, 13, palette.blue);
  drawText(ctx, "|psi_n|^2", plotLeft + 10, Math.min(energyY + 22, bottom - 22), 13, palette.teal);
  drawText(ctx, "ladder", ladderX, ladderTop - 22, 14, palette.ink, "center");
  ctx.restore();

  const raising = Math.sqrt(n + 1).toFixed(3);
  const lowering = n === 0 ? "0" : Math.sqrt(n).toFixed(3);
  readout.value = `n = ${n}, E_n = ${selectedEnergy.toFixed(1)} hbar omega, nodes = ${n}, a+ amplitude = ${raising}, a amplitude = ${lowering}`;
}

export function perturbationShift(level, lambda) {
  return (3 * lambda * (2 * level * level + 2 * level + 1)) / 4;
}

export function perturbativeEnergy(level, lambda) {
  return level + 0.5 + perturbationShift(level, lambda);
}

export function drawPerturbation() {
  const canvas = document.querySelector("#perturbation-canvas");
  const lambdaSlider = document.querySelector("#perturbation-lambda");
  const levelSlider = document.querySelector("#perturbation-level");
  const readout = document.querySelector("#perturbation-readout");
  if (!canvas || !lambdaSlider || !levelSlider || !readout) return;

  const lambda = Number(lambdaSlider.value) / 100;
  const level = Number(levelSlider.value);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const plotLeft = width * 0.08;
  const plotRight = width * 0.58;
  const top = height * 0.13;
  const bottom = height * 0.79;
  const xMin = -3.1;
  const xMax = 3.1;
  const maxLevel = 5;
  const selectedUnperturbed = level + 0.5;
  const selectedShift = perturbationShift(level, lambda);
  const selectedPerturbed = selectedUnperturbed + selectedShift;
  const maxEnergy = Math.max(7.1, perturbativeEnergy(maxLevel, lambda) * 1.08);
  const xToPx = (x) => plotLeft + ((x - xMin) / (xMax - xMin)) * (plotRight - plotLeft);
  const energyToY = (energy) => bottom - (energy / maxEnergy) * (bottom - top);
  const harmonic = (x) => 0.5 * x * x;
  const perturbedPotential = (x) => 0.5 * x * x + lambda * Math.pow(x, 4);

  const samples = [];
  let maxPsi = 0;
  for (let i = 0; i <= 360; i += 1) {
    const x = xMin + (i / 360) * (xMax - xMin);
    const psi = oscillatorPsi(level, x);
    samples.push({ x, psi });
    maxPsi = Math.max(maxPsi, Math.abs(psi));
  }
  const waveAmp = Math.min(28, (bottom - top) / 13);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, bottom);
  ctx.lineTo(plotRight, bottom);
  ctx.moveTo(plotLeft, top);
  ctx.lineTo(plotLeft, bottom);
  ctx.stroke();

  function plotCurve(fn, color, widthPx) {
    ctx.strokeStyle = color;
    ctx.lineWidth = widthPx;
    ctx.beginPath();
    for (let i = 0; i <= 280; i += 1) {
      const x = xMin + (i / 280) * (xMax - xMin);
      const px = xToPx(x);
      const py = energyToY(Math.min(maxEnergy, fn(x)));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  plotCurve(harmonic, "rgba(23,32,42,0.28)", 2.3);
  plotCurve(perturbedPotential, palette.red, 2.8);

  for (let n = 0; n <= maxLevel; n += 1) {
    const y0 = energyToY(n + 0.5);
    const y1 = energyToY(perturbativeEnergy(n, lambda));
    ctx.strokeStyle = n === level ? "rgba(23,32,42,0.42)" : "rgba(23,32,42,0.16)";
    ctx.lineWidth = n === level ? 2 : 1.2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(plotLeft + 14, y0);
    ctx.lineTo(plotRight - 16, y0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = n === level ? palette.red : "rgba(31,111,178,0.2)";
    ctx.lineWidth = n === level ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(plotLeft + 14, y1);
    ctx.lineTo(plotRight - 16, y1);
    ctx.stroke();
  }

  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  samples.forEach((point, index) => {
    const x = xToPx(point.x);
    const y = energyToY(selectedPerturbed) - (point.psi / maxPsi) * waveAmp;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  drawText(ctx, "H0 potential", plotLeft + 12, top + 12, 13, palette.muted);
  drawText(ctx, "H0 + lambda x^4", plotLeft + 12, top + 34, 13, palette.red);
  drawText(ctx, "dashed: E_n^(0)", plotLeft + 12, bottom - 34, 12, palette.muted);
  drawText(ctx, "solid: first-order shifted level", plotLeft + 12, bottom - 14, 12, palette.red);
  drawText(ctx, `psi_${level} drawn on shifted energy`, plotRight - 12, energyToY(selectedPerturbed) - waveAmp - 12, 12, palette.blue, "right");

  const ladderLeft = width * 0.68;
  const ladderRight = width * 0.93;
  const ladderTop = top + 12;
  const ladderBottom = bottom - 4;
  const oldX = ladderLeft + (ladderRight - ladderLeft) * 0.28;
  const newX = ladderLeft + (ladderRight - ladderLeft) * 0.72;
  ctx.strokeStyle = "rgba(23,32,42,0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(oldX, ladderTop);
  ctx.lineTo(oldX, ladderBottom);
  ctx.moveTo(newX, ladderTop);
  ctx.lineTo(newX, ladderBottom);
  ctx.stroke();

  const ladderY = (energy) => ladderBottom - (energy / maxEnergy) * (ladderBottom - ladderTop);
  for (let n = 0; n <= maxLevel; n += 1) {
    const y0 = ladderY(n + 0.5);
    const y1 = ladderY(perturbativeEnergy(n, lambda));
    const active = n === level;
    ctx.strokeStyle = active ? palette.blue : "rgba(23,32,42,0.34)";
    ctx.lineWidth = active ? 3 : 1.6;
    ctx.beginPath();
    ctx.moveTo(oldX - 34, y0);
    ctx.lineTo(oldX + 34, y0);
    ctx.stroke();
    ctx.strokeStyle = active ? palette.red : "rgba(178,59,75,0.32)";
    ctx.beginPath();
    ctx.moveTo(newX - 34, y1);
    ctx.lineTo(newX + 34, y1);
    ctx.stroke();
    if (active) {
      drawArrow(ctx, oldX + 40, y0, newX - 40, y1, palette.gold, 2);
      drawText(ctx, `Delta E_${n}`, (oldX + newX) / 2, (y0 + y1) / 2 - 14, 12, palette.gold, "center");
    }
    drawText(ctx, `n=${n}`, newX + 42, y1, 12, active ? palette.red : palette.muted);
  }

  drawText(ctx, "unperturbed", oldX, ladderTop - 22, 13, palette.blue, "center");
  drawText(ctx, "perturbed", newX, ladderTop - 22, 13, palette.red, "center");
  drawText(ctx, "energy ladder", (oldX + newX) / 2, ladderBottom + 28, 13, palette.ink, "center");
  ctx.restore();

  readout.value = `lambda = ${lambda.toFixed(2)}, n = ${level}, E_n^(0) = ${selectedUnperturbed.toFixed(2)}, Delta E_n^(1) = ${selectedShift.toFixed(3)}, E_n approx ${selectedPerturbed.toFixed(3)}`;
}

export function degenerateEigen(detuning, coupling) {
  const gap = Math.sqrt(detuning * detuning + 4 * coupling * coupling);
  const lower = -gap / 2;
  const upper = gap / 2;
  const mixingAngle = 0.5 * Math.atan2(2 * coupling, detuning);
  const lowerA = Math.cos(mixingAngle);
  const lowerB = -Math.sin(mixingAngle);
  const upperA = Math.sin(mixingAngle);
  const upperB = Math.cos(mixingAngle);
  return { gap, lower, upper, mixingAngle, lowerA, lowerB, upperA, upperB };
}

export function drawDegeneratePerturbation() {
  const canvas = document.querySelector("#degenerate-canvas");
  const detuningSlider = document.querySelector("#degenerate-detuning");
  const couplingSlider = document.querySelector("#degenerate-coupling");
  const readout = document.querySelector("#degenerate-readout");
  if (!canvas || !detuningSlider || !couplingSlider || !readout) return;

  const detuning = Number(detuningSlider.value) / 100;
  const coupling = Number(couplingSlider.value) / 100;
  const eigen = degenerateEigen(detuning, coupling);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const left = width * 0.08;
  const right = width * 0.62;
  const top = height * 0.14;
  const bottom = height * 0.78;
  const detuningMin = -2.05;
  const detuningMax = 2.05;
  const energyMax = Math.max(2.35, Math.sqrt(4 + 4 * coupling * coupling) / 2 + 0.35);
  const xToPx = (value) => left + ((value - detuningMin) / (detuningMax - detuningMin)) * (right - left);
  const yToPx = (energy) => bottom - ((energy + energyMax) / (2 * energyMax)) * (bottom - top);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left, yToPx(0));
  ctx.lineTo(right, yToPx(0));
  ctx.moveTo(xToPx(0), top);
  ctx.lineTo(xToPx(0), bottom);
  ctx.stroke();

  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  for (let i = 0; i <= 200; i += 1) {
    const d = detuningMin + (i / 200) * (detuningMax - detuningMin);
    const x = xToPx(d);
    const y = yToPx(d / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.moveTo(xToPx(detuningMin), yToPx(-detuningMin / 2));
  for (let i = 0; i <= 200; i += 1) {
    const d = detuningMin + (i / 200) * (detuningMax - detuningMin);
    ctx.lineTo(xToPx(d), yToPx(-d / 2));
  }
  ctx.stroke();
  ctx.setLineDash([]);

  function coupledEnergy(d, sign) {
    return sign * Math.sqrt(d * d + 4 * coupling * coupling) / 2;
  }

  ctx.strokeStyle = palette.red;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 240; i += 1) {
    const d = detuningMin + (i / 240) * (detuningMax - detuningMin);
    const x = xToPx(d);
    const y = yToPx(coupledEnergy(d, 1));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = palette.blue;
  ctx.beginPath();
  for (let i = 0; i <= 240; i += 1) {
    const d = detuningMin + (i / 240) * (detuningMax - detuningMin);
    const x = xToPx(d);
    const y = yToPx(coupledEnergy(d, -1));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const currentX = xToPx(detuning);
  const upperY = yToPx(eigen.upper);
  const lowerY = yToPx(eigen.lower);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(currentX, top);
  ctx.lineTo(currentX, bottom);
  ctx.stroke();
  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(currentX, upperY, 6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = palette.blue;
  ctx.beginPath();
  ctx.arc(currentX, lowerY, 6, 0, TAU);
  ctx.fill();
  drawArrow(ctx, currentX + 20, lowerY, currentX + 20, upperY, palette.gold, 2);

  drawText(ctx, "bare states cross", left + 12, top + 18, 13, palette.muted);
  drawText(ctx, "coupled eigenstates avoid crossing", left + 12, top + 40, 13, palette.red);
  drawText(ctx, "detuning Delta", (left + right) / 2, bottom + 30, 13, palette.ink, "center");
  drawText(ctx, "energy shift", left + 10, top + 8, 13, palette.ink);
  drawText(ctx, `gap = ${eigen.gap.toFixed(2)}`, currentX + 28, (upperY + lowerY) / 2, 12, palette.gold);

  const matrixX = width * 0.78;
  const matrixY = height * 0.22;
  const boxW = width * 0.24;
  const boxH = height * 0.2;
  ctx.beginPath();
  ctx.roundRect(matrixX - boxW / 2, matrixY - boxH / 2, boxW, boxH, 10);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fill();
  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.stroke();
  drawText(ctx, "H_eff in {|a>, |b>}", matrixX, matrixY - 38, 14, palette.ink, "center");
  drawText(ctx, "-Delta/2       V", matrixX, matrixY - 8, 14, palette.blue, "center");
  drawText(ctx, "V          Delta/2", matrixX, matrixY + 20, 14, palette.red, "center");

  const barsX = width * 0.7;
  const barsY = height * 0.5;
  const barW = width * 0.21;
  const barH = 18;
  const lowerAWeight = eigen.lowerA * eigen.lowerA;
  const lowerBWeight = eigen.lowerB * eigen.lowerB;
  const upperAWeight = eigen.upperA * eigen.upperA;
  const upperBWeight = eigen.upperB * eigen.upperB;

  function compositionBar(y, label, aWeight, bWeight, color) {
    drawText(ctx, label, barsX, y - 12, 13, color);
    ctx.fillStyle = "rgba(31,111,178,0.24)";
    ctx.fillRect(barsX, y, barW * aWeight, barH);
    ctx.fillStyle = "rgba(178,59,75,0.24)";
    ctx.fillRect(barsX + barW * aWeight, y, barW * bWeight, barH);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barsX, y, barW, barH);
    drawText(ctx, `|a|^2 ${aWeight.toFixed(2)}`, barsX, y + barH + 20, 11, palette.blue);
    drawText(ctx, `|b|^2 ${bWeight.toFixed(2)}`, barsX + barW, y + barH + 20, 11, palette.red, "right");
  }

  compositionBar(barsY, "lower eigenstate", lowerAWeight, lowerBWeight, palette.blue);
  compositionBar(barsY + 92, "upper eigenstate", upperAWeight, upperBWeight, palette.red);
  drawText(ctx, "At exact degeneracy, any nonzero V", width * 0.78, height * 0.81, 12, palette.ink, "center");
  drawText(ctx, "selects the correct linear combinations.", width * 0.78, height * 0.85, 12, palette.ink, "center");
  ctx.restore();

  readout.value = `Delta = ${detuning.toFixed(2)}, V = ${coupling.toFixed(2)}, E- = ${eigen.lower.toFixed(3)}, E+ = ${eigen.upper.toFixed(3)}, avoided gap = ${eigen.gap.toFixed(3)}, mixing angle = ${((eigen.mixingAngle * 180) / Math.PI).toFixed(1)} deg`;
}

export function drawStarkEffect(t = 0) {
  const canvas = document.querySelector("#stark-canvas");
  const fieldSlider = document.querySelector("#stark-field");
  const detuningSlider = document.querySelector("#stark-detuning");
  const dipoleSlider = document.querySelector("#stark-dipole");
  const readout = document.querySelector("#stark-readout");
  if (!canvas || !fieldSlider || !detuningSlider || !dipoleSlider || !readout) return;

  const field = Number(fieldSlider.value) / 100;
  const detuning = Number(detuningSlider.value) / 100;
  const dipole = Number(dipoleSlider.value) / 100;
  const coupling = dipole * field;
  const eigen = degenerateEigen(detuning, coupling);
  const quadraticLower = detuning > 0.02 ? -detuning / 2 - (coupling * coupling) / detuning : eigen.lower;
  const quadraticUpper = detuning > 0.02 ? detuning / 2 + (coupling * coupling) / detuning : eigen.upper;
  const inducedDipole = detuning > 0.02 ? (2 * dipole * dipole * field) / detuning : Math.sign(field) * dipole;

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const compact = width < 700;
  const plotLeft = compact ? width * 0.1 : width * 0.08;
  const plotRight = compact ? width * 0.9 : width * 0.58;
  const plotTop = compact ? height * 0.42 : height * 0.14;
  const plotBottom = compact ? height * 0.72 : height * 0.82;
  const fieldMin = -2.0;
  const fieldMax = 2.0;
  const maxEnergy = Math.max(1.2, Math.sqrt((detuning / 2) ** 2 + (dipole * 2) ** 2) * 1.18);
  const xToPx = (value) => plotLeft + ((value - fieldMin) / (fieldMax - fieldMin)) * (plotRight - plotLeft);
  const yToPx = (energy) => plotBottom - ((energy + maxEnergy) / (2 * maxEnergy)) * (plotBottom - plotTop);

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, yToPx(0));
  ctx.lineTo(plotRight, yToPx(0));
  ctx.moveTo(xToPx(0), plotTop);
  ctx.lineTo(xToPx(0), plotBottom);
  ctx.stroke();

  ctx.strokeStyle = "rgba(96,112,125,0.45)";
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 6]);
  ctx.beginPath();
  for (let i = 0; i <= 220; i += 1) {
    const f = fieldMin + (i / 220) * (fieldMax - fieldMin);
    const y = yToPx(-detuning / 2);
    const x = xToPx(f);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.moveTo(xToPx(fieldMin), yToPx(detuning / 2));
  for (let i = 0; i <= 220; i += 1) {
    const f = fieldMin + (i / 220) * (fieldMax - fieldMin);
    ctx.lineTo(xToPx(f), yToPx(detuning / 2));
  }
  ctx.stroke();
  ctx.setLineDash([]);

  function starkEnergy(f, sign) {
    const v = dipole * f;
    return sign * Math.sqrt((detuning / 2) ** 2 + v * v);
  }

  ctx.strokeStyle = palette.red;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 260; i += 1) {
    const f = fieldMin + (i / 260) * (fieldMax - fieldMin);
    const x = xToPx(f);
    const y = yToPx(starkEnergy(f, 1));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = palette.blue;
  ctx.beginPath();
  for (let i = 0; i <= 260; i += 1) {
    const f = fieldMin + (i / 260) * (fieldMax - fieldMin);
    const x = xToPx(f);
    const y = yToPx(starkEnergy(f, -1));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (detuning > 0.08) {
    ctx.strokeStyle = "rgba(170,123,24,0.72)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    for (let i = 0; i <= 260; i += 1) {
      const f = fieldMin + (i / 260) * (fieldMax - fieldMin);
      const shift = (dipole * dipole * f * f) / detuning;
      const x = xToPx(f);
      const y = yToPx(-detuning / 2 - shift);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const currentX = xToPx(field);
  const upperY = yToPx(eigen.upper);
  const lowerY = yToPx(eigen.lower);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(currentX, plotTop);
  ctx.lineTo(currentX, plotBottom);
  ctx.stroke();
  ctx.fillStyle = palette.red;
  ctx.beginPath();
  ctx.arc(currentX, upperY, 6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = palette.blue;
  ctx.beginPath();
  ctx.arc(currentX, lowerY, 6, 0, TAU);
  ctx.fill();

  drawText(ctx, "electric field E", (plotLeft + plotRight) / 2, plotBottom + 30, compact ? 12 : 13, palette.ink, "center");
  drawText(ctx, "energy shift", plotLeft + 8, plotTop - 24, compact ? 12 : 13, palette.ink);
  drawText(ctx, "dashed: unperturbed parity states", plotLeft + 10, plotBottom - 20, compact ? 10 : 12, palette.muted);
  drawText(ctx, detuning < 0.08 ? "linear Stark fan" : "quadratic limit bends from avoided crossing", plotRight - 8, plotTop + 18, compact ? 11 : 12, palette.gold, "right");

  const atomX = compact ? width * 0.5 : width * 0.76;
  const atomY = compact ? height * 0.2 : height * 0.27;
  const fieldHeight = compact ? 74 : 96;
  drawArrow(ctx, atomX + 84, atomY + fieldHeight / 2, atomX + 84, atomY - fieldHeight / 2, field >= 0 ? palette.gold : palette.red, 3);
  drawText(ctx, "E", atomX + 102, atomY - fieldHeight / 2 + 8, 14, field >= 0 ? palette.gold : palette.red);
  ctx.strokeStyle = palette.blue;
  ctx.fillStyle = "rgba(31,111,178,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(atomX - 24, atomY, 48, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = palette.red;
  ctx.fillStyle = "rgba(178,59,75,0.14)";
  ctx.beginPath();
  ctx.ellipse(atomX + 22, atomY - 20 * Math.sign(field || 1), 26, 58, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(atomX + 22, atomY + 20 * Math.sign(field || 1), 26, 58, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, "even |2s>", atomX - 74, atomY + 70, compact ? 11 : 12, palette.blue);
  drawText(ctx, "odd |2p0>", atomX + 14, atomY + 70, compact ? 11 : 12, palette.red);

  const barsX = compact ? width * 0.1 : width * 0.64;
  const barsY = compact ? height * 0.76 : height * 0.55;
  const barW = compact ? width * 0.54 : width * 0.24;
  const barH = 18;
  const lowerEven = eigen.lowerA * eigen.lowerA;
  const lowerOdd = eigen.lowerB * eigen.lowerB;
  const upperEven = eigen.upperA * eigen.upperA;
  const upperOdd = eigen.upperB * eigen.upperB;

  function starkBar(y, label, evenWeight, oddWeight, color) {
    drawText(ctx, label, barsX, y - 12, compact ? 11 : 13, color);
    ctx.fillStyle = "rgba(31,111,178,0.24)";
    ctx.fillRect(barsX, y, barW * evenWeight, barH);
    ctx.fillStyle = "rgba(178,59,75,0.25)";
    ctx.fillRect(barsX + barW * evenWeight, y, barW * oddWeight, barH);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barsX, y, barW, barH);
    drawText(ctx, `even ${evenWeight.toFixed(2)}`, barsX, y + barH + 18, 10, palette.blue);
    drawText(ctx, `odd ${oddWeight.toFixed(2)}`, barsX + barW, y + barH + 18, 10, palette.red, "right");
  }

  starkBar(barsY, "lower Stark state", lowerEven, lowerOdd, palette.blue);
  starkBar(barsY + (compact ? 72 : 86), "upper Stark state", upperEven, upperOdd, palette.red);

  const cardX = compact ? width * 0.1 : width * 0.64;
  const cardY = compact ? height * 0.91 : height * 0.83;
  const cardW = compact ? width * 0.78 : width * 0.29;
  const cardH = compact ? 50 : 54;
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY - 28, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, `V=-dE=${(-coupling).toFixed(2)}, gap=${eigen.gap.toFixed(2)}`, cardX + 12, cardY - 7, compact ? 11 : 12, palette.ink);
  drawText(ctx, `quadratic lower approx ${quadraticLower.toFixed(2)}, induced dipole ${inducedDipole.toFixed(2)}`, cardX + 12, cardY + 15, compact ? 10 : 12, palette.teal);
  ctx.restore();

  readout.value = `E=${field.toFixed(2)}, d=${dipole.toFixed(2)}, Delta=${detuning.toFixed(2)}, V=${coupling.toFixed(2)}, E-=${eigen.lower.toFixed(3)}, E+=${eigen.upper.toFixed(3)}, quadratic lower=${quadraticLower.toFixed(3)}`;
}

export function hydrogenRadial(n, l, r) {
  if (n === 1 && l === 0) return 2 * Math.exp(-r);
  if (n === 2 && l === 0) return (2 - r) * Math.exp(-r / 2) / (2 * Math.sqrt(2));
  if (n === 2 && l === 1) return r * Math.exp(-r / 2) / (2 * Math.sqrt(6));
  if (n === 3 && l === 0) return (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3) / (81 * Math.sqrt(3) / 2);
  if (n === 3 && l === 1) return (1 - r / 6) * r * Math.exp(-r / 3) * (8 / (27 * Math.sqrt(6)));
  if (n === 3 && l === 2) return r * r * Math.exp(-r / 3) * (4 / (81 * Math.sqrt(30)));
  return 0;
}

export function drawOrbitalCue(ctx, cx, cy, l, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = `${color}33`;
  ctx.lineWidth = 2;
  if (l === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, TAU);
    ctx.fill();
    ctx.stroke();
  } else if (l === 1) {
    for (const direction of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy + direction * 32, 24, 44, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  } else {
    for (let i = 0; i < 4; i += 1) {
      const angle = Math.PI / 4 + i * Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(angle) * 32, cy + Math.sin(angle) * 32, 20, 36, angle, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.beginPath();
  ctx.moveTo(cx - 58, cy);
  ctx.lineTo(cx + 58, cy);
  ctx.moveTo(cx, cy - 58);
  ctx.lineTo(cx, cy + 58);
  ctx.stroke();
  ctx.restore();
}

export function drawHydrogen() {
  const canvas = document.querySelector("#hydrogen-canvas");
  const nSlider = document.querySelector("#hydrogen-n");
  const lSlider = document.querySelector("#hydrogen-l");
  const readout = document.querySelector("#hydrogen-readout");
  if (!canvas || !nSlider || !lSlider || !readout) return;

  const n = Number(nSlider.value);
  const l = Math.min(Number(lSlider.value), n - 1);
  if (Number(lSlider.value) !== l) lSlider.value = String(l);

  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 50);

  const left = width * 0.08;
  const right = width * 0.68;
  const top = height * 0.16;
  const bottom = height * 0.78;
  const rMax = 22;
  const samples = [];
  let maxP = 0;
  for (let i = 0; i <= 360; i += 1) {
    const r = (i / 360) * rMax;
    const radial = hydrogenRadial(n, l, r);
    const probability = r * r * radial * radial;
    samples.push({ r, probability });
    maxP = Math.max(maxP, probability);
  }

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.38)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.stroke();

  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  samples.forEach((point, index) => {
    const x = left + (point.r / rMax) * (right - left);
    const y = bottom - (point.probability / maxP) * (bottom - top) * 0.9;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "rgba(31,111,178,0.12)";
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  samples.forEach((point) => {
    const x = left + (point.r / rMax) * (right - left);
    const y = bottom - (point.probability / maxP) * (bottom - top) * 0.9;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(right, bottom);
  ctx.closePath();
  ctx.fill();

  const orbitalX = width * 0.84;
  const orbitalY = height * 0.47;
  drawOrbitalCue(ctx, orbitalX, orbitalY, l, l === 0 ? palette.blue : l === 1 ? palette.teal : palette.red);
  drawText(ctx, `orbital family: ${["s", "p", "d"][l]}`, orbitalX, orbitalY + 82, 14, palette.ink, "center");
  drawText(ctx, "radial probability P(r)", left, top - 24, 14, palette.blue);
  drawText(ctx, "radius r / a0", (left + right) / 2, bottom + 28, 13, palette.ink, "center");
  drawText(ctx, `E_n = -13.6 eV / ${n * n}`, orbitalX, top + 6, 13, palette.gold, "center");
  ctx.restore();

  readout.value = `n = ${n}, l = ${l}, radial nodes = ${n - l - 1}, angular nodes = ${l}`;
}

export function associatedLegendre(l, m, x) {
  const absM = Math.abs(m);
  let pmm = 1;
  if (absM > 0) {
    const somx2 = Math.sqrt(Math.max(0, (1 - x) * (1 + x)));
    let factor = 1;
    for (let i = 1; i <= absM; i += 1) {
      pmm *= -factor * somx2;
      factor += 2;
    }
  }
  if (l === absM) return pmm;
  let pmmp1 = x * (2 * absM + 1) * pmm;
  if (l === absM + 1) return pmmp1;
  let previous = pmm;
  let current = pmmp1;
  for (let ll = absM + 2; ll <= l; ll += 1) {
    const next = ((2 * ll - 1) * x * current - (ll + absM - 1) * previous) / (ll - absM);
    previous = current;
    current = next;
  }
  return current;
}

export function sphericalNorm(l, m) {
  const absM = Math.abs(m);
  return Math.sqrt(((2 * l + 1) * factorial(l - absM)) / (4 * Math.PI * factorial(l + absM)));
}

export function drawSphericalHarmonics(t = 0) {
  const canvas = document.querySelector("#spherical-canvas");
  const lSlider = document.querySelector("#spherical-l");
  const mSlider = document.querySelector("#spherical-m");
  const readout = document.querySelector("#spherical-readout");
  if (!canvas || !lSlider || !mSlider || !readout) return;

  const l = Number(lSlider.value);
  mSlider.min = String(-l);
  mSlider.max = String(l);
  let m = Number(mSlider.value);
  m = Math.max(-l, Math.min(l, Math.round(m)));
  if (Number(mSlider.value) !== m) mSlider.value = String(m);

  const absM = Math.abs(m);
  const norm = sphericalNorm(l, m);
  const { ctx, width, height } = setupCanvas(canvas);
  clear(ctx, width, height);
  grid(ctx, width, height, 48);

  const compact = width < 720;
  const cx = compact ? width * 0.5 : width * 0.28;
  const cy = compact ? height * 0.28 : height * 0.5;
  const radius = compact ? Math.min(width * 0.26, height * 0.2) : Math.min(width * 0.23, height * 0.34);

  const samples = [];
  let maxAbs = 0;
  for (let i = 0; i <= 360; i += 1) {
    const theta = (i / 360) * TAU;
    const value = norm * associatedLegendre(l, absM, Math.cos(theta));
    samples.push({ theta, value });
    maxAbs = Math.max(maxAbs, Math.abs(value));
  }
  maxAbs = Math.max(0.0001, maxAbs);

  function point(theta, value) {
    const scaled = (0.12 + 0.88 * Math.abs(value / maxAbs)) * radius;
    return {
      x: cx + scaled * Math.sin(theta),
      y: cy - scaled * Math.cos(theta),
    };
  }

  ctx.save();
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.moveTo(cx - radius - 16, cy);
  ctx.lineTo(cx + radius + 16, cy);
  ctx.moveTo(cx, cy - radius - 16);
  ctx.lineTo(cx, cy + radius + 16);
  ctx.stroke();
  drawText(ctx, "z", cx, cy - radius - 30, compact ? 11 : 13, palette.muted, "center");
  drawText(ctx, "x", cx + radius + 30, cy, compact ? 11 : 13, palette.muted, "center");

  const nodalThetas = [];
  let previous = samples[0];
  for (let i = 1; i <= 180; i += 1) {
    const current = samples[i];
    if (Math.abs(current.value) < 0.005 * maxAbs) nodalThetas.push(current.theta);
    if (previous.value * current.value < 0) nodalThetas.push((previous.theta + current.theta) / 2);
    previous = current;
  }
  const uniqueNodes = [];
  nodalThetas.forEach((theta) => {
    if (!uniqueNodes.some((node) => Math.abs(node - theta) < 0.08)) uniqueNodes.push(theta);
  });
  ctx.setLineDash([5, 6]);
  uniqueNodes.forEach((theta) => {
    const dx = Math.sin(theta);
    const dz = -Math.cos(theta);
    ctx.strokeStyle = "rgba(178,59,75,0.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - dx * radius * 1.05, cy - dz * radius * 1.05);
    ctx.lineTo(cx + dx * radius * 1.05, cy + dz * radius * 1.05);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  for (let i = 1; i < samples.length; i += 1) {
    const a = samples[i - 1];
    const b = samples[i];
    const pa = point(a.theta, a.value);
    const pb = point(b.theta, b.value);
    ctx.strokeStyle = (a.value + b.value) / 2 >= 0 ? palette.teal : palette.red;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  const phaseCx = compact ? width * 0.28 : width * 0.67;
  const phaseCy = compact ? height * 0.62 : height * 0.36;
  const phaseR = compact ? 58 : 72;
  ctx.strokeStyle = "rgba(23,32,42,0.24)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(phaseCx, phaseCy, phaseR, 0, TAU);
  ctx.stroke();
  const wind = Math.max(1, absM);
  for (let i = 0; i < 96; i += 1) {
    const phi = (i / 96) * TAU;
    const phase = m * phi + t * 0.8;
    const hue = 190 + 130 * (0.5 + 0.5 * Math.sin(phase));
    ctx.fillStyle = absM === 0 ? "rgba(96,112,125,0.45)" : `hsl(${hue}, 55%, 48%)`;
    ctx.beginPath();
    ctx.arc(phaseCx + Math.cos(phi) * phaseR, phaseCy + Math.sin(phi) * phaseR, 3.2, 0, TAU);
    ctx.fill();
  }
  drawText(ctx, absM === 0 ? "no azimuthal phase winding" : `phase winds ${absM} time${absM === 1 ? "" : "s"}`, phaseCx, phaseCy + phaseR + 26, compact ? 11 : 13, palette.ink, "center");
  drawText(ctx, "e^{i m phi}", phaseCx, phaseCy - phaseR - 22, compact ? 12 : 14, palette.blue, "center");

  const ladderX = compact ? width * 0.72 : width * 0.84;
  const ladderTop = compact ? height * 0.52 : height * 0.18;
  const ladderBottom = compact ? height * 0.9 : height * 0.78;
  ctx.strokeStyle = "rgba(23,32,42,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ladderX, ladderTop);
  ctx.lineTo(ladderX, ladderBottom);
  ctx.stroke();
  const count = 2 * l + 1;
  for (let mm = -l; mm <= l; mm += 1) {
    const y = count === 1 ? (ladderTop + ladderBottom) / 2 : ladderBottom - ((mm + l) / (2 * l || 1)) * (ladderBottom - ladderTop);
    const active = mm === m;
    ctx.fillStyle = active ? palette.gold : palette.paper;
    ctx.strokeStyle = active ? palette.gold : "rgba(23,32,42,0.38)";
    ctx.lineWidth = active ? 3 : 1.5;
    ctx.beginPath();
    ctx.arc(ladderX, y, active ? 8 : 5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    drawText(ctx, `m=${mm}`, ladderX + 22, y, compact ? 10 : 12, active ? palette.gold : palette.muted);
  }
  drawText(ctx, "L_z ladder", ladderX, ladderTop - 24, compact ? 12 : 14, palette.ink, "center");

  drawText(ctx, `Y_${l}^${m}`, cx, cy + radius + 34, compact ? 13 : 16, palette.ink, "center");
  drawText(ctx, `${l - absM} polar node${l - absM === 1 ? "" : "s"}, ${absM === 0 ? "no" : absM} meridian node${absM === 1 ? "" : "s"}`, cx, cy + radius + 58, compact ? 11 : 13, palette.muted, "center");
  ctx.restore();

  readout.value = `ell = ${l}, m = ${m}, L^2 = ${l * (l + 1)} hbar^2, Lz = ${m} hbar, polar nodes = ${l - absM}, meridian nodes = ${absM}`;
}
