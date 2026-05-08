const TAU = Math.PI * 2;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

const palette = {
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

function setupCanvas(canvas) {
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

function clear(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fcfefd";
  ctx.fillRect(0, 0, width, height);
}

function grid(ctx, width, height, step = 44) {
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

function drawText(ctx, text, x, y, size = 13, color = palette.muted, align = "left") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color = palette.ink, width = 3) {
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

function gaussian(x, sigma) {
  return Math.exp(-(x * x) / (2 * sigma * sigma));
}

function drawHero(t) {
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

function drawPacket(t) {
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

function drawMomentumSpace(t = 0) {
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

function drawTranslationGenerator(t = 0) {
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

function drawDoubleSlit(t) {
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

function drawBloch() {
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

const measurement = {
  zero: 0,
  one: 0,
  dots: [],
};

function addShot() {
  const slider = document.querySelector("#prob-zero");
  const p0 = Number(slider.value) / 100;
  const value = Math.random() < p0 ? 0 : 1;
  if (value === 0) measurement.zero += 1;
  else measurement.one += 1;
  measurement.dots.push({ value, age: 0 });
  if (measurement.dots.length > 96) measurement.dots.shift();
}

function drawMeasurement() {
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

function drawProjectionMeasurement(t = 0) {
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

function drawUncertainty() {
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

function drawRobertson(t = 0) {
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

function drawProbabilityCurrent(t = 0) {
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

function drawSpectralTheorem(t = 0) {
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

function drawBasisChange(t = 0) {
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

function drawCompleteness(t = 0) {
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

function drawCommutator(t = 0) {
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

function drawUnitaryEvolution(t = 0) {
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

function drawHeisenbergPicture(t = 0) {
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

function drawEhrenfest(t = 0) {
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

function drawFreeParticle(t = 0) {
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

function drawSpectralExpansion(t = 0) {
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

function drawOrthogonality(t = 0) {
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

function drawWell() {
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

function drawFiniteWell() {
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

function drawParitySymmetry(t = 0) {
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

function drawDeltaPotential(t = 0) {
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

function drawBarrier(t) {
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

function factorial(n) {
  let value = 1;
  for (let i = 2; i <= n; i += 1) value *= i;
  return value;
}

function hermite(n, x) {
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

function oscillatorPsi(n, xi) {
  const normalization = 1 / Math.sqrt(Math.pow(2, n) * factorial(n) * Math.sqrt(Math.PI));
  return normalization * hermite(n, xi) * Math.exp(-(xi * xi) / 2);
}

function drawOscillator() {
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

function perturbationShift(level, lambda) {
  return (3 * lambda * (2 * level * level + 2 * level + 1)) / 4;
}

function perturbativeEnergy(level, lambda) {
  return level + 0.5 + perturbationShift(level, lambda);
}

function drawPerturbation() {
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

function degenerateEigen(detuning, coupling) {
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

function drawDegeneratePerturbation() {
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

function drawStarkEffect(t = 0) {
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

function hydrogenRadial(n, l, r) {
  if (n === 1 && l === 0) return 2 * Math.exp(-r);
  if (n === 2 && l === 0) return (2 - r) * Math.exp(-r / 2) / (2 * Math.sqrt(2));
  if (n === 2 && l === 1) return r * Math.exp(-r / 2) / (2 * Math.sqrt(6));
  if (n === 3 && l === 0) return (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3) / (81 * Math.sqrt(3) / 2);
  if (n === 3 && l === 1) return (1 - r / 6) * r * Math.exp(-r / 3) * (8 / (27 * Math.sqrt(6)));
  if (n === 3 && l === 2) return r * r * Math.exp(-r / 3) * (4 / (81 * Math.sqrt(30)));
  return 0;
}

function drawOrbitalCue(ctx, cx, cy, l, color) {
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

function drawHydrogen() {
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

function associatedLegendre(l, m, x) {
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

function sphericalNorm(l, m) {
  const absM = Math.abs(m);
  return Math.sqrt(((2 * l + 1) * factorial(l - absM)) / (4 * Math.PI * factorial(l + absM)));
}

function drawSphericalHarmonics(t = 0) {
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

function formatJ(value) {
  const rounded = Math.round(value * 2);
  if (rounded % 2 === 0) return `${rounded / 2}`;
  return `${rounded}/2`;
}

function drawSpin() {
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

function drawSpinCoupling() {
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

function heatColor(value, hue) {
  const clamped = Math.max(0, Math.min(1, value));
  const alpha = 0.08 + clamped * 0.82;
  if (hue === "red") return `rgba(178,59,75,${alpha})`;
  if (hue === "green") return `rgba(82,127,60,${alpha})`;
  return `rgba(31,111,178,${alpha})`;
}

function drawExchange() {
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

function variationalEnergy(alpha, lambda) {
  return alpha / 4 + 1 / (4 * alpha) + (3 * lambda) / (4 * alpha * alpha);
}

function drawVariational() {
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

function wkbPotential(x, beta) {
  return 0.5 * x * x + beta * Math.pow(x, 4);
}

function wkbTurningPoint(energy, beta) {
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

function wkbMomentum(x, energy, beta) {
  return Math.sqrt(Math.max(0, 2 * (energy - wkbPotential(x, beta))));
}

function wkbAction(energy, beta) {
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

function drawWkb() {
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

function normalizedScattering(theta, k, mu) {
  const q = 2 * k * Math.sin(theta / 2);
  const denom = q * q + mu * mu;
  return Math.pow(mu * mu / denom, 2);
}

function drawScattering() {
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

function rutherfordCrossSection(theta, strength, energy) {
  const sinHalf = Math.max(0.025, Math.sin(theta / 2));
  return Math.pow(strength / (4 * energy), 2) / Math.pow(sinHalf, 4);
}

function drawRutherford(t = 0) {
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

function legendreP(level, x) {
  if (level === 0) return 1;
  if (level === 1) return x;
  return (3 * x * x - 1) / 2;
}

function partialWaveAmplitude(theta, phases) {
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

function drawPartialWaves() {
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

function opticalAmplitude(theta, phases, eta, k = 1) {
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

function opticalCrossSections(phases, eta, k = 1) {
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

function drawOpticalTheorem(t = 0) {
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

function transitionProbability(time, omega, detuning) {
  const rabi = Math.sqrt(omega * omega + detuning * detuning);
  if (rabi < 0.001) return 0;
  return (omega * omega / (rabi * rabi)) * Math.pow(Math.sin((rabi * time) / 2), 2);
}

function drawTransitions(t = 0) {
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

function dipoleAngularStrength(l, m, q, finalL) {
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

function drawSelectionRules() {
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

function fineStructureShiftEv(n, j) {
  const alpha = 1 / 137.036;
  const bohrEnergy = -13.6057 / (n * n);
  return bohrEnergy * ((alpha * alpha) / (n * n)) * (n / (j + 0.5) - 0.75);
}

function landeG(l, j) {
  const s = 0.5;
  return 1 + (j * (j + 1) + s * (s + 1) - l * (l + 1)) / (2 * j * (j + 1));
}

function halfLabel(twoValue) {
  if (twoValue % 2 === 0) return String(twoValue / 2);
  return `${twoValue}/2`;
}

function drawFineStructure(t = 0) {
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

function hyperfineGF(I, J, F) {
  if (F === 0) return 0;
  const gJ = 2.0023;
  const nuclearTerm = 0.003;
  const f2 = F * (F + 1);
  const j2 = J * (J + 1);
  const i2 = I * (I + 1);
  return (gJ * (f2 + j2 - i2)) / (2 * f2) + (nuclearTerm * (f2 + i2 - j2)) / (2 * f2);
}

function buildHyperfineLevels(I, J, aMHz, bGauss) {
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

function drawHyperfine(t = 0) {
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

function drawAdiabatic(t = 0) {
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

function prepareVideoCards() {
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

function scrollToHash() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (target) target.scrollIntoView({ block: "start" });
}

function bindControls() {
  document.querySelector("#one-shot")?.addEventListener("click", () => {
    addShot();
    drawMeasurement();
  });
  document.querySelector("#many-shots")?.addEventListener("click", () => {
    for (let i = 0; i < 64; i += 1) addShot();
    drawMeasurement();
  });
  document.querySelector("#reset-shots")?.addEventListener("click", () => {
    measurement.zero = 0;
    measurement.one = 0;
    measurement.dots = [];
    drawMeasurement();
  });

  for (const id of ["theta", "phi"]) {
    document.querySelector(`#${id}`)?.addEventListener("input", drawBloch);
  }
  document.querySelector("#momentum-sigma")?.addEventListener("input", () => drawMomentumSpace(0));
  document.querySelector("#momentum-k0")?.addEventListener("input", () => drawMomentumSpace(0));
  document.querySelector("#translation-shift")?.addEventListener("input", () => drawTranslationGenerator(0));
  document.querySelector("#translation-k")?.addEventListener("input", () => drawTranslationGenerator(0));
  document.querySelector("#translation-width")?.addEventListener("input", () => drawTranslationGenerator(0));
  document.querySelector("#prob-zero")?.addEventListener("input", drawMeasurement);
  document.querySelector("#projection-weight")?.addEventListener("input", () => drawProjectionMeasurement(0));
  document.querySelector("#projection-mix")?.addEventListener("input", () => drawProjectionMeasurement(0));
  document.querySelector("#projection-phase")?.addEventListener("input", () => drawProjectionMeasurement(0));
  document.querySelector("#spread")?.addEventListener("input", drawUncertainty);
  document.querySelector("#robertson-angle")?.addEventListener("input", () => drawRobertson(0));
  document.querySelector("#robertson-theta")?.addEventListener("input", () => drawRobertson(0));
  document.querySelector("#robertson-phi")?.addEventListener("input", () => drawRobertson(0));
  document.querySelector("#current-k")?.addEventListener("input", () => drawProbabilityCurrent(0));
  document.querySelector("#current-width")?.addEventListener("input", () => drawProbabilityCurrent(0));
  document.querySelector("#spectral-theorem-axis")?.addEventListener("input", () => drawSpectralTheorem(0));
  document.querySelector("#spectral-theorem-gap")?.addEventListener("input", () => drawSpectralTheorem(0));
  document.querySelector("#spectral-theorem-state")?.addEventListener("input", () => drawSpectralTheorem(0));
  document.querySelector("#basis-state")?.addEventListener("input", () => drawBasisChange(0));
  document.querySelector("#basis-phase")?.addEventListener("input", () => drawBasisChange(0));
  document.querySelector("#basis-angle")?.addEventListener("input", () => drawBasisChange(0));
  document.querySelector("#completeness-angle")?.addEventListener("input", () => drawCompleteness(0));
  document.querySelector("#completeness-c2")?.addEventListener("input", () => drawCompleteness(0));
  document.querySelector("#completeness-c3")?.addEventListener("input", () => drawCompleteness(0));
  document.querySelector("#commutator-angle")?.addEventListener("input", () => drawCommutator(0));
  document.querySelector("#commutator-state")?.addEventListener("input", () => drawCommutator(0));
  document.querySelector("#unitary-gap")?.addEventListener("input", () => drawUnitaryEvolution(0));
  document.querySelector("#unitary-c2")?.addEventListener("input", () => drawUnitaryEvolution(0));
  document.querySelector("#unitary-c3")?.addEventListener("input", () => drawUnitaryEvolution(0));
  document.querySelector("#heisenberg-gap")?.addEventListener("input", () => drawHeisenbergPicture(0));
  document.querySelector("#heisenberg-state")?.addEventListener("input", () => drawHeisenbergPicture(0));
  document.querySelector("#heisenberg-observable")?.addEventListener("input", () => drawHeisenbergPicture(0));
  document.querySelector("#ehrenfest-omega")?.addEventListener("input", () => drawEhrenfest(0));
  document.querySelector("#ehrenfest-momentum")?.addEventListener("input", () => drawEhrenfest(0));
  document.querySelector("#free-width")?.addEventListener("input", () => drawFreeParticle(0));
  document.querySelector("#free-k")?.addEventListener("input", () => drawFreeParticle(0));
  document.querySelector("#orthogonality-n")?.addEventListener("input", () => drawOrthogonality(0));
  document.querySelector("#orthogonality-m")?.addEventListener("input", () => drawOrthogonality(0));
  document.querySelector("#orthogonality-phase")?.addEventListener("input", () => drawOrthogonality(0));
  document.querySelector("#well-level")?.addEventListener("input", drawWell);
  document.querySelector("#finite-well-depth")?.addEventListener("input", drawFiniteWell);
  document.querySelector("#finite-well-state")?.addEventListener("input", drawFiniteWell);
  document.querySelector("#parity-mix")?.addEventListener("input", () => drawParitySymmetry(0));
  document.querySelector("#parity-phase")?.addEventListener("input", () => drawParitySymmetry(0));
  document.querySelector("#parity-tilt")?.addEventListener("input", () => drawParitySymmetry(0));
  document.querySelector("#delta-strength")?.addEventListener("input", () => drawDeltaPotential(0));
  document.querySelector("#delta-k")?.addEventListener("input", () => drawDeltaPotential(0));
  document.querySelector("#spectral-c2")?.addEventListener("input", () => drawSpectralExpansion(0));
  document.querySelector("#spectral-c3")?.addEventListener("input", () => drawSpectralExpansion(0));
  document.querySelector("#barrier-energy")?.addEventListener("input", drawBarrier);
  document.querySelector("#barrier-width")?.addEventListener("input", drawBarrier);
  document.querySelector("#oscillator-level")?.addEventListener("input", drawOscillator);
  document.querySelector("#perturbation-lambda")?.addEventListener("input", drawPerturbation);
  document.querySelector("#perturbation-level")?.addEventListener("input", drawPerturbation);
  document.querySelector("#degenerate-detuning")?.addEventListener("input", drawDegeneratePerturbation);
  document.querySelector("#degenerate-coupling")?.addEventListener("input", drawDegeneratePerturbation);
  document.querySelector("#stark-field")?.addEventListener("input", () => drawStarkEffect(0));
  document.querySelector("#stark-detuning")?.addEventListener("input", () => drawStarkEffect(0));
  document.querySelector("#stark-dipole")?.addEventListener("input", () => drawStarkEffect(0));
  document.querySelector("#hydrogen-n")?.addEventListener("input", drawHydrogen);
  document.querySelector("#hydrogen-l")?.addEventListener("input", drawHydrogen);
  document.querySelector("#spherical-l")?.addEventListener("input", () => drawSphericalHarmonics(0));
  document.querySelector("#spherical-m")?.addEventListener("input", () => drawSphericalHarmonics(0));
  document.querySelector("#spin-angle")?.addEventListener("input", drawSpin);
  document.querySelector("#spin-j")?.addEventListener("input", drawSpin);
  document.querySelector("#coupling-mix")?.addEventListener("input", drawSpinCoupling);
  document.querySelector("#coupling-phase")?.addEventListener("input", drawSpinCoupling);
  document.querySelector("#exchange-type")?.addEventListener("change", drawExchange);
  document.querySelector("#exchange-separation")?.addEventListener("input", drawExchange);
  document.querySelector("#variational-alpha")?.addEventListener("input", drawVariational);
  document.querySelector("#variational-lambda")?.addEventListener("input", drawVariational);
  document.querySelector("#wkb-energy")?.addEventListener("input", drawWkb);
  document.querySelector("#wkb-beta")?.addEventListener("input", drawWkb);
  document.querySelector("#scattering-k")?.addEventListener("input", drawScattering);
  document.querySelector("#scattering-mu")?.addEventListener("input", drawScattering);
  document.querySelector("#rutherford-energy")?.addEventListener("input", () => drawRutherford(0));
  document.querySelector("#rutherford-strength")?.addEventListener("input", () => drawRutherford(0));
  document.querySelector("#rutherford-angle")?.addEventListener("input", () => drawRutherford(0));
  document.querySelector("#phase-s")?.addEventListener("input", drawPartialWaves);
  document.querySelector("#phase-p")?.addEventListener("input", drawPartialWaves);
  document.querySelector("#phase-d")?.addEventListener("input", drawPartialWaves);
  document.querySelector("#optical-s")?.addEventListener("input", () => drawOpticalTheorem(0));
  document.querySelector("#optical-p")?.addEventListener("input", () => drawOpticalTheorem(0));
  document.querySelector("#optical-d")?.addEventListener("input", () => drawOpticalTheorem(0));
  document.querySelector("#optical-eta")?.addEventListener("input", () => drawOpticalTheorem(0));
  document.querySelector("#transition-detuning")?.addEventListener("input", () => drawTransitions(0));
  document.querySelector("#transition-coupling")?.addEventListener("input", () => drawTransitions(0));
  document.querySelector("#selection-l")?.addEventListener("input", drawSelectionRules);
  document.querySelector("#selection-m")?.addEventListener("input", drawSelectionRules);
  document.querySelector("#selection-q")?.addEventListener("change", drawSelectionRules);
  document.querySelector("#fine-n")?.addEventListener("input", () => drawFineStructure(0));
  document.querySelector("#fine-l")?.addEventListener("input", () => drawFineStructure(0));
  document.querySelector("#fine-j")?.addEventListener("change", () => drawFineStructure(0));
  document.querySelector("#fine-mj")?.addEventListener("input", () => drawFineStructure(0));
  document.querySelector("#fine-b")?.addEventListener("input", () => drawFineStructure(0));
  document.querySelector("#hyperfine-i")?.addEventListener("input", () => drawHyperfine(0));
  document.querySelector("#hyperfine-j")?.addEventListener("input", () => drawHyperfine(0));
  document.querySelector("#hyperfine-a")?.addEventListener("input", () => drawHyperfine(0));
  document.querySelector("#hyperfine-f")?.addEventListener("input", () => drawHyperfine(0));
  document.querySelector("#hyperfine-mf")?.addEventListener("input", () => drawHyperfine(0));
  document.querySelector("#hyperfine-b")?.addEventListener("input", () => drawHyperfine(0));
  document.querySelector("#adiabatic-speed")?.addEventListener("input", () => drawAdiabatic(0));
  document.querySelector("#adiabatic-gap")?.addEventListener("input", () => drawAdiabatic(0));
  document.querySelector("#adiabatic-cone")?.addEventListener("input", () => drawAdiabatic(0));
}

function frame(now) {
  const t = now / 1000;
  drawHero(t);
  drawPacket(t);
  drawMomentumSpace(t);
  drawTranslationGenerator(t);
  drawDoubleSlit(t);
  drawProjectionMeasurement(t);
  drawRobertson(t);
  drawProbabilityCurrent(t);
  drawSpectralTheorem(t);
  drawBasisChange(t);
  drawCompleteness(t);
  drawBarrier(t);
  drawCommutator(t);
  drawUnitaryEvolution(t);
  drawHeisenbergPicture(t);
  drawEhrenfest(t);
  drawFreeParticle(t);
  drawOrthogonality(t);
  drawFiniteWell();
  drawParitySymmetry(t);
  drawDeltaPotential(t);
  drawSpectralExpansion(t);
  drawStarkEffect(t);
  drawRutherford(t);
  drawTransitions(t);
  drawOpticalTheorem(t);
  drawSphericalHarmonics(t);
  drawFineStructure(t);
  drawHyperfine(t);
  drawAdiabatic(t);
  requestAnimationFrame(frame);
}

function drawAllFiguresAtRest() {
  drawMomentumSpace(0);
  drawTranslationGenerator(0);
  drawBloch();
  drawMeasurement();
  drawProjectionMeasurement(0);
  drawUncertainty();
  drawRobertson(0);
  drawProbabilityCurrent(0);
  drawSpectralTheorem(0);
  drawBasisChange(0);
  drawCompleteness(0);
  drawCommutator(0);
  drawUnitaryEvolution(0);
  drawHeisenbergPicture(0);
  drawEhrenfest(0);
  drawFreeParticle(0);
  drawOrthogonality(0);
  drawWell();
  drawFiniteWell();
  drawParitySymmetry(0);
  drawDeltaPotential(0);
  drawSpectralExpansion(0);
  drawBarrier(0);
  drawOscillator();
  drawPerturbation();
  drawDegeneratePerturbation();
  drawStarkEffect(0);
  drawHydrogen();
  drawSphericalHarmonics(0);
  drawSpin();
  drawSpinCoupling();
  drawExchange();
  drawVariational();
  drawWkb();
  drawScattering();
  drawRutherford(0);
  drawPartialWaves();
  drawOpticalTheorem(0);
  drawTransitions(0);
  drawSelectionRules();
  drawFineStructure(0);
  drawHyperfine(0);
  drawAdiabatic(0);
}

bindControls();
prepareVideoCards();
drawAllFiguresAtRest();
window.MathJax?.startup?.promise?.then(() => window.setTimeout(scrollToHash, 0));
window.addEventListener("load", () => {
  window.setTimeout(scrollToHash, 160);
  window.setTimeout(scrollToHash, 900);
});
window.addEventListener("hashchange", () => window.setTimeout(scrollToHash, 80));
requestAnimationFrame(frame);

window.addEventListener("resize", drawAllFiguresAtRest);
