# Syllabus Map

This project is an interactive first course, not a replacement for a full textbook's worked examples and problem sets.
The table below maps a Griffiths-style undergraduate quantum mechanics sequence to the concrete article sections,
interactive figures, and Manim clips in this repository.

| Course topic | Web section | Interactive evidence | Manim evidence |
| --- | --- | --- | --- |
| State vectors, wavefunctions, normalization, Born rule | `#amplitudes`, `#course-map`, `#postulates` | Wave packet, position/momentum Fourier pair, translation generator | `WavePacketScene`, `MomentumSpaceScene`, `TranslationGeneratorScene` |
| Interference and phase | `#interference` | Double-slit path-phase simulator | `DoubleSlitScene` |
| Qubits and two-state systems | `#qubit`, `#measurement` | Bloch sphere, repeated measurement, projection update | `QubitMeasurementScene`, `ProjectionMeasurementScene` |
| Observables, expectation values, compatible measurements | `#postulates` | Spectral theorem, basis change, completeness, commutators | `SpectralTheoremScene`, `BasisChangeScene`, `CompletenessRelationScene`, `CommutatorCompatibilityScene` |
| Time evolution and pictures | `#postulates` | Unitary evolution, Schrodinger/Heisenberg comparison, Ehrenfest motion | `UnitaryEvolutionScene`, `HeisenbergPictureScene`, `EhrenfestConservationScene` |
| Uncertainty and probability current | `#uncertainty` | Robertson relation, current and continuity equation | `RobertsonUncertaintyScene`, `ProbabilityCurrentScene` |
| One-dimensional exact systems | `#systems` | Free packet dispersion, orthogonality, infinite/finite wells, parity, delta well, spectral beats, tunneling | `FreeParticleDispersionScene`, `OrthogonalityScene`, `FiniteSquareWellScene`, `ParitySymmetryScene`, `DeltaPotentialScene`, `SpectralExpansionScene` |
| Harmonic oscillator | `#oscillator` | Hermite modes and ladder-operator formulas | `HarmonicOscillatorScene` |
| Three dimensions and hydrogen | `#hydrogen` | Radial probability and spherical harmonics | `HydrogenRadialScene`, `SphericalHarmonicsScene` |
| Angular momentum and spin | `#spin` | Stern-Gerlach probabilities, angular momentum ladders, spin coupling | `SpinAngularMomentumScene`, `SpinCouplingScene` |
| Identical particles | `#identical-particles` | Exchange symmetry in the two-particle plane, Pauli exclusion formulas | `IdenticalParticlesScene` |
| Time-independent perturbation theory | `#methods` | Anharmonic oscillator shift, degenerate perturbation, Stark effect | `TimeIndependentPerturbationScene`, `DegeneratePerturbationScene`, `StarkEffectScene` |
| Variational method and WKB | `#methods` | Gaussian variational bound, WKB action and turning points | `VariationalMethodScene`, `WKBActionScene` |
| Scattering theory | `#scattering` | Born scattering, Rutherford/Coulomb scattering, partial waves, optical theorem | `ScatteringBornScene`, `RutherfordScatteringScene`, `PartialWaveScatteringScene`, `OpticalTheoremScene` |
| Time-dependent perturbations and selection rules | `#transitions` | Rabi oscillations, transition amplitudes, Fermi golden rule, dipole selection rules | `RabiTransitionsScene`, `SelectionRulesScene` |
| Fine, Zeeman, hyperfine, and adiabatic effects | `#transitions` | Fine/Zeeman splitting, hyperfine coupling, Berry phase | `FineStructureZeemanScene`, `HyperfineCouplingScene`, `AdiabaticBerryScene` |

## Deep Study Checkpoints

- Translate each physical question into a state, an observable, a basis, an evolution rule, and a Born-rule probability.
- Reproduce the derivation targets in the `#chapter-guide` section without looking at the article.
- Use the interactive figures to test limiting cases: wide versus narrow packets, weak versus strong perturbations,
  low versus high scattering momentum, resonant versus off-resonant drives.
- Treat the Manim scenes as reusable visual explanations; the source in `manim/quantum_scenes.py` can be extended into
  lecture clips as each written chapter becomes more detailed.
