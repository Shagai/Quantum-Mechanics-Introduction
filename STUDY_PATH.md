# Study Path

This path turns the interactive article into a deep self-study sequence. Each pass should include three actions:
read the section, manipulate the figure until the limiting cases make sense, then reproduce one derivation without
looking.

## Pass 1: Amplitudes Before Formalism

1. Read `#amplitudes`, `#interference`, `#qubit`, and `#measurement`.
2. Use the wave packet, Fourier pair, double-slit, Bloch sphere, repeated-measurement, and projection figures.
3. Derive the Born rule consequences for a two-path state:
   \[
   |\psi\rangle = a|1\rangle+b|2\rangle,\qquad P(k)=|\langle k|\psi\rangle|^2.
   \]
4. Watch the matching Manim clips for wave packets, momentum space, double-slit interference, and measurement.

## Pass 2: The Postulates as Working Rules

1. Read `#uncertainty`, `#course-map`, and `#postulates`.
2. Focus on normalization, expectation values, Hermitian observables, projectors, commutators, and time evolution.
3. Reproduce these derivations:
   \[
   \langle A\rangle=\langle\psi|\hat A|\psi\rangle,\qquad
   \Delta A\,\Delta B\ge\frac12|\langle[\hat A,\hat B]\rangle|.
   \]
4. Use the spectral theorem, basis-change, completeness, commutator, unitary-evolution, Heisenberg-picture, and
   Ehrenfest figures as sanity checks.

## Pass 3: Exact Systems

1. Read `#systems`, `#oscillator`, and `#hydrogen`.
2. Compare free packets, wells, tunneling, oscillator modes, hydrogen radial probability, and spherical harmonics.
3. Reproduce:
   \[
   \hat H\psi_n=E_n\psi_n,\qquad
   \Psi_{n\ell m}(r,\theta,\phi)=R_{n\ell}(r)Y_\ell^m(\theta,\phi).
   \]
4. Use the Manim clips to connect spectra, boundary conditions, parity, tunneling, ladder operators, and angular nodes.

## Pass 4: Spin, Symmetry, and Many-Particle Structure

1. Read `#spin` and `#identical-particles`.
2. Use Stern-Gerlach, angular momentum ladders, spin coupling, and exchange-symmetry figures.
3. Reproduce:
   \[
   [\hat J_i,\hat J_j]=i\hbar\epsilon_{ijk}\hat J_k,\qquad
   \hat P_{12}\Psi=\pm\Psi.
   \]
4. Explain in your own words why Pauli exclusion is a statement about the full state, not only about position.

## Pass 5: Approximation Methods

1. Read `#methods`.
2. Use the perturbation, degenerate perturbation, Stark, variational, and WKB figures.
3. Reproduce the first-order energy correction and variational bound:
   \[
   E_n^{(1)}=\langle n^{(0)}|\hat H'|n^{(0)}\rangle,\qquad
   E_0\le\frac{\langle\phi|\hat H|\phi\rangle}{\langle\phi|\phi\rangle}.
   \]
4. Explain when each approximation fails.

## Pass 6: Scattering and Transitions

1. Read `#scattering` and `#transitions`.
2. Use Born scattering, Rutherford scattering, partial waves, optical theorem, Rabi transitions, selection rules,
   fine/Zeeman splitting, hyperfine coupling, and Berry phase figures.
3. Reproduce:
   \[
   \frac{d\sigma}{d\Omega}=|f(\theta)|^2,\qquad
   \Gamma_{i\to f}=\frac{2\pi}{\hbar}|\langle f|\hat H'|i\rangle|^2\rho(E_f).
   \]
4. Connect resonance, conservation laws, and symmetry selection rules to what a detector actually measures.

## Final Check

- Use `SYLLABUS_MAP.md` to confirm that every major topic has a concrete article section and Manim scene.
- Run `npm run audit` to validate the local artifact.
- Open `http://localhost:5173` in the Codex in-app Browser and run `npm run verify:browser` for the final gate.
