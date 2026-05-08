/**
 * Browser entrypoint for the quantum physics introduction site.
 *
 * The drawing code is split into topic modules; this file is intentionally only
 * responsible for orchestration. It wires DOM controls to the imported drawing
 * functions, runs the animation loop, refreshes static figures on resize, and
 * restores hash navigation after MathJax finishes changing document layout.
 */

import {
  addShot,
  drawBloch,
  drawDoubleSlit,
  drawHero,
  drawMeasurement,
  drawPacket,
  drawUncertainty,
  measurement,
} from "./figures/foundations.js";
import {
  drawBasisChange,
  drawCommutator,
  drawCompleteness,
  drawEhrenfest,
  drawHeisenbergPicture,
  drawMomentumSpace,
  drawProbabilityCurrent,
  drawProjectionMeasurement,
  drawRobertson,
  drawSpectralTheorem,
  drawTranslationGenerator,
  drawUnitaryEvolution,
} from "./figures/formalism.js";
import {
  drawBarrier,
  drawDegeneratePerturbation,
  drawDeltaPotential,
  drawFiniteWell,
  drawFreeParticle,
  drawHydrogen,
  drawOscillator,
  drawOrthogonality,
  drawParitySymmetry,
  drawPerturbation,
  drawSpectralExpansion,
  drawSphericalHarmonics,
  drawStarkEffect,
  drawWell,
} from "./figures/systems.js";
import {
  drawExchange,
  drawFineStructure,
  drawHyperfine,
  drawSpin,
  drawSpinCoupling,
  drawAdiabatic,
} from "./figures/spin-particles.js";
import {
  drawOpticalTheorem,
  drawPartialWaves,
  drawRutherford,
  drawScattering,
  drawSelectionRules,
  drawTransitions,
  drawVariational,
  drawWkb,
} from "./figures/methods.js";
import { prepareVideoCards } from "./video-cards.js";

/**
 * Figures that need continuous time.
 *
 * Every draw function still checks whether its canvas exists, so it is cheaper
 * and simpler to keep one page-agnostic list than to maintain separate entry
 * points for each HTML file. Static figures are omitted from this list and
 * redrawn by controls or resize events.
 */
const animatedDraws = [
  drawHero,
  drawPacket,
  drawMomentumSpace,
  drawTranslationGenerator,
  drawDoubleSlit,
  drawProjectionMeasurement,
  drawRobertson,
  drawProbabilityCurrent,
  drawSpectralTheorem,
  drawBasisChange,
  drawCompleteness,
  drawBarrier,
  drawCommutator,
  drawUnitaryEvolution,
  drawHeisenbergPicture,
  drawEhrenfest,
  drawFreeParticle,
  drawOrthogonality,
  drawFiniteWell,
  drawParitySymmetry,
  drawDeltaPotential,
  drawSpectralExpansion,
  drawStarkEffect,
  drawRutherford,
  drawTransitions,
  drawOpticalTheorem,
  drawSphericalHarmonics,
  drawFineStructure,
  drawHyperfine,
  drawAdiabatic,
];

/**
 * Figures that should be painted once at startup and after layout changes.
 *
 * Passing 0 to all functions is intentional: JavaScript ignores surplus
 * arguments for static functions, while time-aware functions receive a stable
 * resting phase.
 */
const restDraws = [
  drawMomentumSpace,
  drawTranslationGenerator,
  drawBloch,
  drawMeasurement,
  drawProjectionMeasurement,
  drawUncertainty,
  drawRobertson,
  drawProbabilityCurrent,
  drawSpectralTheorem,
  drawBasisChange,
  drawCompleteness,
  drawCommutator,
  drawUnitaryEvolution,
  drawHeisenbergPicture,
  drawEhrenfest,
  drawFreeParticle,
  drawOrthogonality,
  drawWell,
  drawFiniteWell,
  drawParitySymmetry,
  drawDeltaPotential,
  drawSpectralExpansion,
  drawBarrier,
  drawOscillator,
  drawPerturbation,
  drawDegeneratePerturbation,
  drawStarkEffect,
  drawHydrogen,
  drawSphericalHarmonics,
  drawSpin,
  drawSpinCoupling,
  drawExchange,
  drawVariational,
  drawWkb,
  drawScattering,
  drawRutherford,
  drawPartialWaves,
  drawOpticalTheorem,
  drawTransitions,
  drawSelectionRules,
  drawFineStructure,
  drawHyperfine,
  drawAdiabatic,
];

function bind(selector, eventName, handler) {
  document.querySelector(selector)?.addEventListener(eventName, handler);
}

function bindInput(selector, handler) {
  bind(selector, "input", handler);
}

function scrollToHash() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (target) target.scrollIntoView({ block: "start" });
}

function resetMeasurement() {
  measurement.zero = 0;
  measurement.one = 0;
  measurement.dots = [];
  drawMeasurement();
}

/**
 * Attach controls to their owning figures.
 *
 * The bindings are grouped by the module that owns the drawing function. A
 * slider handler usually redraws with t=0 so the user sees an immediate stable
 * response; animated figures will continue updating on the next frame.
 */
function bindControls() {
  bind("#one-shot", "click", () => {
    addShot();
    drawMeasurement();
  });
  bind("#many-shots", "click", () => {
    for (let i = 0; i < 64; i += 1) addShot();
    drawMeasurement();
  });
  bind("#reset-shots", "click", resetMeasurement);

  for (const id of ["theta", "phi"]) bindInput("#" + id, drawBloch);
  bindInput("#prob-zero", drawMeasurement);
  bindInput("#spread", drawUncertainty);

  const formalismInputs = [
    ["#momentum-sigma", () => drawMomentumSpace(0)],
    ["#momentum-k0", () => drawMomentumSpace(0)],
    ["#translation-shift", () => drawTranslationGenerator(0)],
    ["#translation-k", () => drawTranslationGenerator(0)],
    ["#translation-width", () => drawTranslationGenerator(0)],
    ["#projection-weight", () => drawProjectionMeasurement(0)],
    ["#projection-mix", () => drawProjectionMeasurement(0)],
    ["#projection-phase", () => drawProjectionMeasurement(0)],
    ["#robertson-angle", () => drawRobertson(0)],
    ["#robertson-theta", () => drawRobertson(0)],
    ["#robertson-phi", () => drawRobertson(0)],
    ["#current-k", () => drawProbabilityCurrent(0)],
    ["#current-width", () => drawProbabilityCurrent(0)],
    ["#spectral-theorem-axis", () => drawSpectralTheorem(0)],
    ["#spectral-theorem-gap", () => drawSpectralTheorem(0)],
    ["#spectral-theorem-state", () => drawSpectralTheorem(0)],
    ["#basis-state", () => drawBasisChange(0)],
    ["#basis-phase", () => drawBasisChange(0)],
    ["#basis-angle", () => drawBasisChange(0)],
    ["#completeness-angle", () => drawCompleteness(0)],
    ["#completeness-c2", () => drawCompleteness(0)],
    ["#completeness-c3", () => drawCompleteness(0)],
    ["#commutator-angle", () => drawCommutator(0)],
    ["#commutator-state", () => drawCommutator(0)],
    ["#unitary-gap", () => drawUnitaryEvolution(0)],
    ["#unitary-c2", () => drawUnitaryEvolution(0)],
    ["#unitary-c3", () => drawUnitaryEvolution(0)],
    ["#heisenberg-gap", () => drawHeisenbergPicture(0)],
    ["#heisenberg-state", () => drawHeisenbergPicture(0)],
    ["#heisenberg-observable", () => drawHeisenbergPicture(0)],
    ["#ehrenfest-omega", () => drawEhrenfest(0)],
    ["#ehrenfest-momentum", () => drawEhrenfest(0)],
  ];

  const systemsInputs = [
    ["#free-width", () => drawFreeParticle(0)],
    ["#free-k", () => drawFreeParticle(0)],
    ["#orthogonality-n", () => drawOrthogonality(0)],
    ["#orthogonality-m", () => drawOrthogonality(0)],
    ["#orthogonality-phase", () => drawOrthogonality(0)],
    ["#well-level", drawWell],
    ["#finite-well-depth", drawFiniteWell],
    ["#finite-well-state", drawFiniteWell],
    ["#parity-mix", () => drawParitySymmetry(0)],
    ["#parity-phase", () => drawParitySymmetry(0)],
    ["#parity-tilt", () => drawParitySymmetry(0)],
    ["#delta-strength", () => drawDeltaPotential(0)],
    ["#delta-k", () => drawDeltaPotential(0)],
    ["#spectral-c2", () => drawSpectralExpansion(0)],
    ["#spectral-c3", () => drawSpectralExpansion(0)],
    ["#barrier-energy", () => drawBarrier(0)],
    ["#barrier-width", () => drawBarrier(0)],
    ["#oscillator-level", drawOscillator],
    ["#perturbation-lambda", drawPerturbation],
    ["#perturbation-level", drawPerturbation],
    ["#degenerate-detuning", drawDegeneratePerturbation],
    ["#degenerate-coupling", drawDegeneratePerturbation],
    ["#stark-field", () => drawStarkEffect(0)],
    ["#stark-detuning", () => drawStarkEffect(0)],
    ["#stark-dipole", () => drawStarkEffect(0)],
    ["#hydrogen-n", drawHydrogen],
    ["#hydrogen-l", drawHydrogen],
    ["#spherical-l", () => drawSphericalHarmonics(0)],
    ["#spherical-m", () => drawSphericalHarmonics(0)],
  ];

  const spinInputs = [
    ["#spin-angle", drawSpin],
    ["#spin-j", drawSpin],
    ["#coupling-mix", drawSpinCoupling],
    ["#coupling-phase", drawSpinCoupling],
    ["#exchange-separation", drawExchange],
    ["#fine-n", () => drawFineStructure(0)],
    ["#fine-l", () => drawFineStructure(0)],
    ["#fine-mj", () => drawFineStructure(0)],
    ["#fine-b", () => drawFineStructure(0)],
    ["#hyperfine-i", () => drawHyperfine(0)],
    ["#hyperfine-j", () => drawHyperfine(0)],
    ["#hyperfine-a", () => drawHyperfine(0)],
    ["#hyperfine-f", () => drawHyperfine(0)],
    ["#hyperfine-mf", () => drawHyperfine(0)],
    ["#hyperfine-b", () => drawHyperfine(0)],
    ["#adiabatic-speed", () => drawAdiabatic(0)],
    ["#adiabatic-gap", () => drawAdiabatic(0)],
    ["#adiabatic-cone", () => drawAdiabatic(0)],
  ];

  const methodsInputs = [
    ["#variational-alpha", drawVariational],
    ["#variational-lambda", drawVariational],
    ["#wkb-energy", drawWkb],
    ["#wkb-beta", drawWkb],
    ["#scattering-k", drawScattering],
    ["#scattering-mu", drawScattering],
    ["#rutherford-energy", () => drawRutherford(0)],
    ["#rutherford-strength", () => drawRutherford(0)],
    ["#rutherford-angle", () => drawRutherford(0)],
    ["#phase-s", drawPartialWaves],
    ["#phase-p", drawPartialWaves],
    ["#phase-d", drawPartialWaves],
    ["#optical-s", () => drawOpticalTheorem(0)],
    ["#optical-p", () => drawOpticalTheorem(0)],
    ["#optical-d", () => drawOpticalTheorem(0)],
    ["#optical-eta", () => drawOpticalTheorem(0)],
    ["#transition-detuning", () => drawTransitions(0)],
    ["#transition-coupling", () => drawTransitions(0)],
    ["#selection-l", drawSelectionRules],
    ["#selection-m", drawSelectionRules],
  ];

  for (const [selector, handler] of [...formalismInputs, ...systemsInputs, ...spinInputs, ...methodsInputs]) {
    bindInput(selector, handler);
  }

  bind("#exchange-type", "change", drawExchange);
  bind("#fine-j", "change", () => drawFineStructure(0));
  bind("#selection-q", "change", drawSelectionRules);
}

function frame(now) {
  const t = now / 1000;
  for (const draw of animatedDraws) draw(t);
  requestAnimationFrame(frame);
}

function drawAllFiguresAtRest() {
  for (const draw of restDraws) draw(0);
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
