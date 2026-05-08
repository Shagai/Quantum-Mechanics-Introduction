#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCENE_FILE="$ROOT/manim/quantum_scenes.py"
TARGET_DIR="$ROOT/public/media/manim"
MANIMGL="$(command -v manimgl || true)"

export MPLCONFIGDIR="$ROOT/.cache/matplotlib"
mkdir -p "$MPLCONFIGDIR" "$ROOT/.cache/manim"

if [[ -z "$MANIMGL" || ! -x "$MANIMGL" ]]; then
  MANIMGL="$ROOT/.venv/bin/manimgl"
fi

if [[ -z "$MANIMGL" || ! -x "$MANIMGL" ]]; then
  echo "manimgl is not installed. Install the 3Blue1Brown ManimGL package first:"
  echo "  python3 -m venv .venv"
  echo "  .venv/bin/python -m pip install manimgl"
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is not installed. ManimGL needs it to write video files."
  echo "  brew install ffmpeg"
  exit 1
fi

mkdir -p "$TARGET_DIR"

render_scene() {
  local scene="$1"
  local target="$2"

  "$MANIMGL" "$SCENE_FILE" "$scene" -w -l --config_file "$ROOT/custom_config.yml"

  local rendered
  rendered="$ROOT/manim_output/videos/$scene.mp4"

  if [[ ! -f "$rendered" ]]; then
    rendered="$(
      find "$ROOT/manim_output" -name "$scene.mp4" -print |
        grep -v '_temp[.]mp4$' |
        sort |
        tail -n 1
    )"
  fi

  if [[ -z "$rendered" || ! -f "$rendered" ]]; then
    echo "Could not find rendered mp4 for $scene"
    exit 1
  fi

  cp "$rendered" "$TARGET_DIR/$target"
  echo "Wrote $TARGET_DIR/$target"
}

render_scene "WavePacketScene" "wave_packet.mp4"
render_scene "MomentumSpaceScene" "momentum_space.mp4"
render_scene "TranslationGeneratorScene" "translation_generator.mp4"
render_scene "ProbabilityCurrentScene" "probability_current.mp4"
render_scene "RobertsonUncertaintyScene" "robertson_uncertainty.mp4"
render_scene "DoubleSlitScene" "double_slit.mp4"
render_scene "QubitMeasurementScene" "qubit_measurement.mp4"
render_scene "ProjectionMeasurementScene" "projection_measurement.mp4"
render_scene "SpectralTheoremScene" "spectral_theorem.mp4"
render_scene "BasisChangeScene" "basis_change.mp4"
render_scene "CompletenessRelationScene" "completeness_relation.mp4"
render_scene "CommutatorCompatibilityScene" "commutator_compatibility.mp4"
render_scene "UnitaryEvolutionScene" "unitary_evolution.mp4"
render_scene "HeisenbergPictureScene" "heisenberg_picture.mp4"
render_scene "EhrenfestConservationScene" "ehrenfest_conservation.mp4"
render_scene "FreeParticleDispersionScene" "free_particle_dispersion.mp4"
render_scene "OrthogonalityScene" "orthogonality.mp4"
render_scene "FiniteSquareWellScene" "finite_square_well.mp4"
render_scene "ParitySymmetryScene" "parity_symmetry.mp4"
render_scene "DeltaPotentialScene" "delta_potential.mp4"
render_scene "SpectralExpansionScene" "spectral_expansion.mp4"
render_scene "HarmonicOscillatorScene" "harmonic_oscillator.mp4"
render_scene "HydrogenRadialScene" "hydrogen_radial.mp4"
render_scene "SphericalHarmonicsScene" "spherical_harmonics.mp4"
render_scene "SpinAngularMomentumScene" "spin_angular_momentum.mp4"
render_scene "SpinCouplingScene" "spin_coupling.mp4"
render_scene "IdenticalParticlesScene" "identical_particles.mp4"
render_scene "TimeIndependentPerturbationScene" "time_independent_perturbation.mp4"
render_scene "DegeneratePerturbationScene" "degenerate_perturbation.mp4"
render_scene "StarkEffectScene" "stark_effect.mp4"
render_scene "VariationalMethodScene" "variational_method.mp4"
render_scene "WKBActionScene" "wkb_action.mp4"
render_scene "ScatteringBornScene" "scattering_born.mp4"
render_scene "RutherfordScatteringScene" "rutherford_scattering.mp4"
render_scene "PartialWaveScatteringScene" "partial_wave_scattering.mp4"
render_scene "OpticalTheoremScene" "optical_theorem.mp4"
render_scene "RabiTransitionsScene" "rabi_transitions.mp4"
render_scene "SelectionRulesScene" "selection_rules.mp4"
render_scene "FineStructureZeemanScene" "fine_structure_zeeman.mp4"
render_scene "HyperfineCouplingScene" "hyperfine_coupling.mp4"
render_scene "AdiabaticBerryScene" "adiabatic_berry.mp4"
