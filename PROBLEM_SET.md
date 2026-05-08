# Problem Set

These problems are meant to be solved with pencil, paper, and the interactive figures open. They are intentionally
derivation-heavy: the goal is to rebuild the machinery, not to memorize conclusions.

## Pass 1: Amplitudes and Measurement

1. Two-path interference. Read `#amplitudes` and `#interference`. Let
   \[
   |\psi\rangle=\frac{1}{\sqrt2}|a\rangle+\frac{e^{i\phi}}{\sqrt2}|b\rangle,
   \]
   and let a screen mode be \( |x\rangle \) with amplitudes \(A_a(x)\) and \(A_b(x)\). Derive
   \(P(x)=|A_a(x)+e^{i\phi}A_b(x)|^2/2\), then identify the interference term.
2. Born-rule sampling. Read `#measurement`. For a qubit
   \[
   |\psi\rangle=\cos(\theta/2)|0\rangle+e^{i\phi}\sin(\theta/2)|1\rangle,
   \]
   compute the expected number of zeros in \(N\) independent measurements and the standard deviation.
3. Projection update. Use the projection-measurement figure. Given orthogonal projectors \(P_a,P_b\) with
   \(P_a+P_b=I\), show that a measurement outcome \(a\) changes
   \( |\psi\rangle \) to \(P_a|\psi\rangle/\sqrt{\langle\psi|P_a|\psi\rangle}\).

## Pass 2: Operators and Uncertainty

4. Expectation values. Read `#postulates`. Show that if
   \(\hat A=\sum_n a_n|a_n\rangle\langle a_n|\), then
   \[
   \langle A\rangle=\sum_n a_n|\langle a_n|\psi\rangle|^2.
   \]
5. Robertson inequality. Read `#uncertainty`. Starting from
   \(\Delta A|\psi\rangle=(\hat A-\langle A\rangle)|\psi\rangle\), use Cauchy-Schwarz to derive
   \[
   \Delta A\,\Delta B\ge \frac12|\langle[\hat A,\hat B]\rangle|.
   \]
6. Pictures of motion. Read `#postulates`. For time-independent \(\hat H\), show that
   \[
   \langle\psi(t)|\hat A|\psi(t)\rangle
   =
   \langle\psi(0)|\hat A_H(t)|\psi(0)\rangle.
   \]

## Pass 3: Exact Systems

7. Infinite well. Read `#systems`. Derive the normalized eigenfunctions and energies for an infinite square well
   on \(0<x<L\), then prove orthogonality for two different quantum numbers.
8. Tunneling estimate. Use the barrier figure. For \(E<V_0\), derive the exponential dependence of transmission on
   barrier width in the thick-barrier limit.
9. Harmonic oscillator ladder. Read `#oscillator`. Use
   \([\hat a,\hat a^\dagger]=1\) to derive
   \[
   \hat H|n\rangle=\hbar\omega(n+\tfrac12)|n\rangle.
   \]
10. Hydrogen quantum numbers. Read `#hydrogen`. Explain why a central potential permits simultaneous labels
    \(n,\ell,m\), and identify what degeneracy remains for a pure Coulomb potential.

## Pass 4: Spin, Addition, and Identical Particles

11. Spin probabilities. Read `#spin`. Prepare a spin-\(\tfrac12\) state at polar angle \(\theta\) from \(z\).
    Derive the probabilities for measuring \(m_z=\pm\tfrac12\).
12. Angular momentum ladder. Starting from
    \[
    \hat J_\pm|j,m\rangle=\hbar\sqrt{j(j+1)-m(m\pm1)}|j,m\pm1\rangle,
    \]
    show why \(m\) must range from \(-j\) to \(j\) in integer steps.
13. Exchange symmetry. Read `#identical-particles`. Build the normalized symmetric and antisymmetric states from
    \(\phi_a(x_1)\phi_b(x_2)\) and \(\phi_b(x_1)\phi_a(x_2)\), then evaluate what happens when \(a=b\).

## Pass 5: Approximation Methods

14. First-order perturbation. Read `#methods`. Starting with
    \(\hat H=\hat H_0+\lambda \hat H'\), derive
    \(E_n^{(1)}=\langle n^{(0)}|\hat H'|n^{(0)}\rangle\) for a nondegenerate level.
15. Degenerate perturbation. In a two-state degenerate subspace, diagonalize
    \[
    W=\begin{pmatrix}0&v\\v&0\end{pmatrix}
    \]
    and interpret the new eigenstates.
16. Variational bound. Prove that for any normalized trial state \(|\phi\rangle\),
    \[
    E_0\le \langle\phi|\hat H|\phi\rangle.
    \]
17. WKB quantization. Starting from \(p(x)=\sqrt{2m(E-V(x))}\), explain the origin of
    \[
    \int_{x_1}^{x_2}p(x)\,dx=(n+\tfrac12)\pi\hbar.
    \]

## Pass 6: Scattering and Transitions

18. Born amplitude. Read `#scattering`. For a weak potential, show why the first Born amplitude is proportional to
    the Fourier transform of \(V(\mathbf r)\).
19. Partial waves. Explain why low-energy scattering is often dominated by the \(\ell=0\) phase shift.
20. Fermi golden rule. Read `#transitions`. Starting from first-order time-dependent perturbation theory, explain
    why transition rates contain both a matrix element squared and a density of final states.
21. Selection rules. Use parity to show why an electric-dipole matrix element vanishes between two states with the
    same parity.
22. Berry phase. Read `#transitions`. For adiabatic transport of a spin-\(\tfrac12\) around a cone, explain why the
    geometric phase depends on solid angle rather than elapsed time.

## Check Your Work

- Every solution should identify the state, observable, basis, and Born-rule probability being used.
- After solving a problem, return to the matching interactive figure and predict what happens before changing a slider.
- Use `SYLLABUS_MAP.md` to find the matching Manim clip and explain what quantity the animation preserves.
