import math

from manimlib import *


class WavePacketScene(Scene):
    def construct(self):
        title = Text("A quantum state is an amplitude wave", font_size=36)
        title.to_edge(UP)

        axes = Axes(
            x_range=(-6, 6, 1),
            y_range=(-1.6, 1.6, 0.5),
            width=10,
            height=3.4,
        )
        axes.shift(DOWN * 0.25)

        phase = ValueTracker(0)

        def wave_func(x):
            envelope = np.exp(-(x * x) / 5.5)
            return envelope * np.sin(5.2 * x - phase.get_value())

        wave = always_redraw(
            lambda: axes.get_graph(
                wave_func,
                x_range=(-6, 6, 0.16),
                color=BLUE,
            )
        )

        density = always_redraw(
            lambda: axes.get_graph(
                lambda x: 0.9 * np.exp(-2 * (x * x) / 5.5) - 1.1,
                x_range=(-6, 6, 0.16),
                color=RED,
            )
        )

        labels = VGroup(
            Text("Re(psi)", font_size=26, color=BLUE).next_to(axes, LEFT).shift(UP),
            Text("|psi|^2", font_size=26, color=RED).next_to(axes, LEFT).shift(DOWN),
        )

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(wave), ShowCreation(density), FadeIn(labels))
        self.play(phase.animate.set_value(2 * TAU), run_time=2, rate_func=linear)
        self.wait(0.25)


class MomentumSpaceScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Momentum space is the Fourier transform of position space", font_size=32, color=WHITE)
        title.to_edge(UP)

        x_axes = Axes(
            x_range=(-5, 5, 1),
            y_range=(-1.35, 1.35, 0.5),
            width=5.0,
            height=2.8,
        )
        x_axes.shift(LEFT * 3.0 + DOWN * 0.15)
        p_axes = Axes(
            x_range=(-4, 4, 1),
            y_range=(0, 1.15, 0.25),
            width=4.6,
            height=2.8,
        )
        p_axes.shift(RIGHT * 2.95 + DOWN * 0.15)

        sigma = ValueTracker(1.25)
        k0 = 1.25
        phase = ValueTracker(0)

        def psi_real(x):
            return np.exp(-(x * x) / (2 * sigma.get_value() ** 2)) * np.cos(k0 * x - phase.get_value())

        def density_x(x):
            return -0.95 + 0.8 * np.exp(-(x * x) / (sigma.get_value() ** 2))

        def density_p(p):
            sigma_p = 1 / (2 * sigma.get_value())
            return np.exp(-((p - k0) * (p - k0)) / (2 * sigma_p * sigma_p))

        x_wave = always_redraw(lambda: x_axes.get_graph(psi_real, x_range=(-5, 5, 0.03), color=BLUE))
        x_density = always_redraw(lambda: x_axes.get_graph(density_x, x_range=(-5, 5, 0.03), color=RED))
        p_density = always_redraw(lambda: p_axes.get_graph(density_p, x_range=(-4, 4, 0.03), color=TEAL))
        mean_line = always_redraw(lambda: DashedLine(p_axes.c2p(k0, 0), p_axes.c2p(k0, 1.0), dash_length=0.08).set_stroke(YELLOW, width=2))

        transform_arrow = Arrow(LEFT * 0.35, RIGHT * 0.35, buff=0, color=YELLOW).shift(UP * 0.1)
        transform_label = Text("Fourier transform", font_size=24, color=YELLOW).next_to(transform_arrow, UP, buff=0.18)
        labels = VGroup(
            Text("position space: psi(x)", font_size=24, color=BLUE).next_to(x_axes, UP),
            Text("momentum space: |phi(p)|^2", font_size=24, color=TEAL).next_to(p_axes, UP),
            Text("|psi(x)|^2", font_size=22, color=RED).next_to(x_axes, DOWN).shift(LEFT * 1.0),
            Text("<p> = hbar k0", font_size=22, color=YELLOW).next_to(mean_line, RIGHT),
        )

        formulas = VGroup(
            Text("phi(p) = (1/sqrt(2 pi hbar)) integral psi(x) exp(-i p x / hbar) dx", font_size=22, color=WHITE),
            Text("narrow in x  ->  broad in p", font_size=23, color=YELLOW),
            Text("Delta x Delta p = hbar / 2 for a Gaussian", font_size=23, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        formulas.to_edge(DOWN).shift(UP * 0.1)

        self.play(Write(title), ShowCreation(x_axes), ShowCreation(p_axes), run_time=1)
        self.play(ShowCreation(x_wave), ShowCreation(x_density), ShowCreation(p_density), ShowCreation(mean_line), FadeIn(labels))
        self.play(GrowArrow(transform_arrow), FadeIn(transform_label), FadeIn(formulas[0]))
        self.play(sigma.animate.set_value(0.65), phase.animate.set_value(TAU), run_time=2.2, rate_func=linear)
        self.play(FadeIn(formulas[1]), FadeIn(formulas[2]))
        self.wait(0.25)


class TranslationGeneratorScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Momentum is the generator of translations", font_size=34, color=WHITE)
        title.to_edge(UP)

        axes = Axes(
            x_range=(-5.5, 5.5, 1),
            y_range=(-1.3, 1.3, 0.5),
            width=7.1,
            height=3.1,
        )
        axes.shift(LEFT * 1.95 + DOWN * 0.05)

        shift = ValueTracker(0.0)
        phase = ValueTracker(0.0)
        sigma = 1.35
        k0 = 2.15

        def psi(x, center=0):
            return np.exp(-((x - center) * (x - center)) / (2 * sigma * sigma)) * np.cos(k0 * (x - center) - phase.get_value())

        def density(x, center=0):
            return -1.05 + 0.72 * np.exp(-((x - center) * (x - center)) / (sigma * sigma))

        original = axes.get_graph(lambda x: psi(x, 0), x_range=(-5.5, 5.5, 0.03), color=BLUE)
        original_density = axes.get_graph(lambda x: density(x, 0), x_range=(-5.5, 5.5, 0.03), color=BLUE)
        original_density.set_stroke(BLUE, width=2, opacity=0.45)

        translated = always_redraw(
            lambda: axes.get_graph(lambda x: psi(x, shift.get_value()), x_range=(-5.5, 5.5, 0.03), color=RED)
        )
        translated_density = always_redraw(
            lambda: axes.get_graph(lambda x: density(x, shift.get_value()), x_range=(-5.5, 5.5, 0.03), color=RED)
        )
        translated_density.set_stroke(RED, width=2, opacity=0.55)

        translation_arrow = always_redraw(
            lambda: Arrow(
                axes.c2p(0, -1.56),
                axes.c2p(shift.get_value(), -1.56),
                buff=0,
                color=YELLOW,
            )
        )
        shift_label = always_redraw(
            lambda: Text(f"a = {shift.get_value():.1f}", font_size=21, color=YELLOW).next_to(translation_arrow, DOWN, buff=0.08)
        )

        labels = VGroup(
            Text("original psi(x)", font_size=23, color=BLUE).next_to(axes, UP).shift(LEFT * 2.0),
            Text("translated psi(x-a)", font_size=23, color=RED).next_to(axes, UP).shift(RIGHT * 1.75),
            Text("phase gradient k gives <p> = hbar k", font_size=21, color=TEAL).next_to(axes, DOWN, buff=0.95).shift(LEFT * 1.15),
        )

        formulas = VGroup(
            Text("p = -i hbar d/dx", font_size=25, color=YELLOW),
            Text("T(a) = exp(-i a p / hbar)", font_size=25, color=TEAL),
            Text("(T(a) psi)(x) = psi(x-a)", font_size=24, color=RED),
            Text("[x,p] psi = i hbar psi", font_size=24, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        formulas.move_to(RIGHT * 3.25 + DOWN * 0.1)

        generator_card = RoundedRectangle(width=3.25, height=1.25, corner_radius=0.08)
        generator_card.set_fill(WHITE, opacity=0.06).set_stroke(YELLOW, width=2)
        generator_card.move_to(RIGHT * 3.25 + UP * 1.65)
        generator_text = VGroup(
            Text("infinitesimal shift", font_size=22, color=WHITE),
            Text("psi(x-a) = psi(x) - a dpsi/dx", font_size=20, color=GREY_A),
        ).arrange(DOWN, buff=0.12)
        generator_text.move_to(generator_card.get_center())

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(original), ShowCreation(original_density), FadeIn(labels[0]))
        self.play(FadeIn(generator_card), FadeIn(generator_text), FadeIn(formulas[0]))
        self.play(GrowArrow(translation_arrow), FadeIn(shift_label), ShowCreation(translated), ShowCreation(translated_density), FadeIn(labels[1]))
        self.play(shift.animate.set_value(1.65), phase.animate.set_value(TAU), run_time=2.2, rate_func=linear)
        self.play(FadeIn(formulas[1]), FadeIn(formulas[2]), FadeIn(labels[2]))
        self.play(FadeIn(formulas[3]))
        self.wait(0.25)


class ProbabilityCurrentScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Probability current is local conservation", font_size=34, color=WHITE)
        title.to_edge(UP)

        axes = Axes(
            x_range=(-5, 5, 1),
            y_range=(-1.35, 1.35, 0.5),
            width=10,
            height=3.7,
        )
        axes.shift(DOWN * 0.25)

        center = ValueTracker(-2.7)
        sigma = 1.2
        velocity = 0.72
        interval_a = -0.8
        interval_b = 1.35

        def rho(x):
            return np.exp(-((x - center.get_value()) ** 2) / (sigma * sigma))

        density = always_redraw(
            lambda: axes.get_graph(
                lambda x: 0.78 * rho(x),
                x_range=(-5, 5, 0.04),
                color=BLUE,
            )
        )
        current = always_redraw(
            lambda: axes.get_graph(
                lambda x: -0.85 + velocity * rho(x),
                x_range=(-5, 5, 0.04),
                color=RED,
            )
        )
        interval = Polygon(
            axes.c2p(interval_a, -1.18),
            axes.c2p(interval_b, -1.18),
            axes.c2p(interval_b, 1.05),
            axes.c2p(interval_a, 1.05),
        )
        interval.set_fill(TEAL, opacity=0.14)
        interval.set_stroke(TEAL, width=2, opacity=0.55)
        boundaries = VGroup(
            DashedLine(axes.c2p(interval_a, -1.18), axes.c2p(interval_a, 1.05), dash_length=0.08),
            DashedLine(axes.c2p(interval_b, -1.18), axes.c2p(interval_b, 1.05), dash_length=0.08),
        ).set_stroke(TEAL, width=2)

        arrows = always_redraw(
            lambda: VGroup(
                *[
                    Arrow(
                        axes.c2p(x - 0.22, 0.92),
                        axes.c2p(x + 0.22 + 0.22 * rho(x), 0.92),
                        buff=0,
                        color=YELLOW,
                    ).set_stroke(width=2 + 2 * rho(x))
                    for x in np.linspace(-4.2, 4.2, 8)
                ]
            )
        )

        labels = VGroup(
            Text("rho(x,t) = |psi|^2", font_size=24, color=BLUE).next_to(axes, LEFT).shift(UP * 0.9),
            Text("j(x,t)", font_size=24, color=RED).next_to(axes, LEFT).shift(DOWN * 0.92),
            Text("region [a,b]", font_size=22, color=TEAL).move_to(axes.c2p(0.27, 1.15)),
        )
        formulas = VGroup(
            Text("j = (hbar/m) Im(psi* partial_x psi)", font_size=22, color=WHITE),
            Text("partial_t rho + partial_x j = 0", font_size=24, color=YELLOW),
            Text("d/dt integral_a^b rho dx = j(a) - j(b)", font_size=22, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        formulas.to_edge(DOWN).shift(UP * 0.1)

        self.play(Write(title), ShowCreation(axes), FadeIn(interval), ShowCreation(boundaries), run_time=1)
        self.play(ShowCreation(density), ShowCreation(current), FadeIn(labels), FadeIn(arrows))
        self.play(FadeIn(formulas[0]), FadeIn(formulas[1]))
        self.play(center.animate.set_value(2.4), run_time=3, rate_func=linear)
        self.play(FadeIn(formulas[2]))
        self.wait(0.25)


class RobertsonUncertaintyScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Robertson uncertainty comes from the commutator", font_size=32, color=WHITE)
        title.to_edge(UP)

        center = LEFT * 3.35 + DOWN * 0.08
        radius = 1.55
        disk = Circle(radius=radius).move_to(center).set_stroke(GREY_B, width=2)
        x_axis = Line(center + LEFT * radius, center + RIGHT * radius).set_stroke(GREY_B, width=1.5)
        z_axis = Line(center + DOWN * radius, center + UP * radius).set_stroke(BLUE, width=4)

        alpha = 1.15
        theta = 1.18
        phi = 1.28
        state_vec = RIGHT * (math.sin(theta) * math.cos(phi)) + UP * math.cos(theta)
        b_vec = RIGHT * math.sin(alpha) + UP * math.cos(alpha)
        b_line = Line(center - b_vec * radius * 0.96, center + b_vec * radius * 0.96).set_stroke(TEAL, width=4)
        state_arrow = Arrow(center, center + state_vec * radius * 0.88, buff=0, color=RED)

        sy = math.sin(theta) * math.sin(phi)
        exp_a = math.cos(theta)
        exp_b = math.sin(alpha) * math.sin(theta) * math.cos(phi) + math.cos(alpha) * math.cos(theta)
        delta_a = math.sqrt(max(0, 1 - exp_a * exp_a))
        delta_b = math.sqrt(max(0, 1 - exp_b * exp_b))
        product = delta_a * delta_b
        bound = abs(math.sin(alpha) * sy)

        y_axis = Line(center + RIGHT * 2.35 + DOWN * 1.2, center + RIGHT * 2.35 + UP * 1.2).set_stroke(GREY_B, width=2)
        y_zero = Line(center + RIGHT * 2.12, center + RIGHT * 2.58).set_stroke(GREY_B, width=2)
        y_bar = Rectangle(width=0.23, height=abs(sy) * 1.2).set_fill(YELLOW, opacity=0.35).set_stroke(YELLOW, width=2)
        y_bar.move_to(center + RIGHT * 2.35 + UP * (sy * 0.6))

        labels = VGroup(
            Text("A = sigma_z", font_size=23, color=BLUE).next_to(z_axis, UP),
            Text("B(alpha)", font_size=23, color=TEAL).next_to(center + b_vec * radius, RIGHT, buff=0.12),
            Text("|psi>", font_size=24, color=RED).next_to(center + state_vec * radius * 0.88, UP, buff=0.08),
            Text("<sigma_y>", font_size=22, color=YELLOW).next_to(y_axis, UP, buff=0.12),
        )

        def meter(label, value, color, y):
            base = RIGHT * 1.5 + DOWN * y
            title_text = Text(label, font_size=23, color=color).move_to(base + LEFT * 0.2 + UP * 0.24)
            outline = Rectangle(width=3.2, height=0.22).move_to(base + RIGHT * 1.0)
            outline.set_stroke(GREY_B, width=1.5).set_fill(WHITE, opacity=0.03)
            fill = Rectangle(width=3.2 * value, height=0.22).set_fill(color, opacity=0.42).set_stroke(color, width=2)
            fill.move_to(outline.get_left() + RIGHT * (1.6 * value) + RIGHT * 0.0)
            number = Text(f"{value:.2f}", font_size=20, color=color).next_to(outline, RIGHT, buff=0.12)
            return VGroup(title_text, outline, fill, number)

        meters = VGroup(
            meter("Delta A", delta_a, BLUE, -0.35),
            meter("Delta B", delta_b, TEAL, 0.15),
            meter("Delta A Delta B", product, GREEN, 0.75),
            meter("commutator bound", bound, RED, 1.25),
        )
        meters.shift(RIGHT * 1.2 + UP * 1.15)

        formulas = VGroup(
            Text("Delta A Delta B >= commutator bound", font_size=25, color=YELLOW),
            Text("[sigma_z, B(alpha)] = 2 i sin(alpha) sigma_y", font_size=23, color=WHITE),
            Text("bound = |sin(alpha) <sigma_y>|", font_size=23, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        formulas.to_edge(DOWN).shift(UP * 0.12)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(VGroup(disk, x_axis, z_axis)), ShowCreation(b_line), GrowArrow(state_arrow), FadeIn(labels))
        self.play(ShowCreation(y_axis), ShowCreation(y_zero), FadeIn(y_bar))
        self.play(FadeIn(meters[0]), FadeIn(meters[1]))
        self.play(FadeIn(meters[2]), FadeIn(meters[3]), FadeIn(formulas[0]))
        self.play(FadeIn(formulas[1]), FadeIn(formulas[2]))
        self.play(b_line.animate.rotate(-0.5, about_point=center), run_time=1.4)
        self.wait(0.25)


class DoubleSlitScene(Scene):
    def construct(self):
        title = Text("Interference: amplitudes add before probabilities", font_size=34)
        title.to_edge(UP)

        source = Dot(LEFT * 5, color=YELLOW)
        barrier = VGroup(
            Line(LEFT * 1.6 + UP * 3, LEFT * 1.6 + UP * 0.55),
            Line(LEFT * 1.6 + UP * 0.15, LEFT * 1.6 + DOWN * 0.15),
            Line(LEFT * 1.6 + DOWN * 0.55, LEFT * 1.6 + DOWN * 3),
        )
        barrier.set_stroke(GREY_B, width=7)

        slit_top = Dot(LEFT * 1.6 + UP * 0.35, color=TEAL)
        slit_bottom = Dot(LEFT * 1.6 + DOWN * 0.35, color=TEAL)
        screen = Line(RIGHT * 4.5 + UP * 2.8, RIGHT * 4.5 + DOWN * 2.8)
        screen.set_stroke(WHITE, width=3)

        paths = VGroup(
            VMobject().set_points_as_corners([source.get_center(), slit_top.get_center(), RIGHT * 4.5 + UP * 0.65]),
            VMobject().set_points_as_corners([source.get_center(), slit_bottom.get_center(), RIGHT * 4.5 + UP * 0.65]),
            VMobject().set_points_as_corners([source.get_center(), slit_top.get_center(), RIGHT * 4.5 + DOWN * 0.65]),
            VMobject().set_points_as_corners([source.get_center(), slit_bottom.get_center(), RIGHT * 4.5 + DOWN * 0.65]),
        )
        paths.set_stroke(RED, width=3, opacity=0.65)

        bars = VGroup()
        for i in range(28):
            y = -2.55 + i * 0.19
            intensity = 0.2 + 0.8 * (np.cos(4.5 * y) ** 2) * np.exp(-0.12 * y * y)
            bar = Rectangle(width=0.14 + intensity * 0.85, height=0.09)
            bar.set_fill(BLUE, opacity=0.25 + 0.6 * intensity)
            bar.set_stroke(BLUE, width=0)
            bar.move_to(RIGHT * (4.65 + intensity * 0.42) + UP * y)
            bars.add(bar)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(source), ShowCreation(barrier), FadeIn(slit_top), FadeIn(slit_bottom), ShowCreation(screen))
        self.play(ShowCreation(paths), run_time=2)
        self.play(LaggedStartMap(FadeIn, bars, lag_ratio=0.04))
        self.wait(0.25)


class QubitMeasurementScene(Scene):
    def construct(self):
        title = Text("A qubit points before it is measured", font_size=36)
        title.to_edge(UP)

        circle = Circle(radius=2.1)
        circle.set_stroke(GREY_B, width=2)
        equator = Ellipse(width=4.2, height=1.1)
        equator.set_stroke(GREY_B, width=2)
        vertical = Line(DOWN * 2.1, UP * 2.1).set_stroke(GREY_B, width=2)
        horizontal = Line(LEFT * 2.1, RIGHT * 2.1).set_stroke(GREY_B, width=2)
        sphere = VGroup(circle, equator, vertical, horizontal).shift(LEFT * 2.4 + DOWN * 0.15)

        vector = Arrow(
            sphere.get_center(),
            sphere.get_center() + RIGHT * 1.25 + UP * 1.45,
            buff=0,
            color=RED,
        )
        ket0 = Text("|0>", font_size=28).next_to(sphere, UP)
        ket1 = Text("|1>", font_size=28).next_to(sphere, DOWN)

        p0_bar = Rectangle(width=0.72, height=2.5).set_fill(BLUE, opacity=0.4).set_stroke(BLUE, width=2)
        p1_bar = Rectangle(width=0.72, height=0.8).set_fill(RED, opacity=0.4).set_stroke(RED, width=2)
        p0_bar.move_to(RIGHT * 1.8 + DOWN * 0.25)
        p1_bar.move_to(RIGHT * 3.1 + DOWN * 1.1)
        baseline = Line(RIGHT * 1.25 + DOWN * 1.55, RIGHT * 3.65 + DOWN * 1.55)
        labels = VGroup(
            Text("P(0)", font_size=26, color=BLUE).next_to(p0_bar, DOWN),
            Text("P(1)", font_size=26, color=RED).next_to(p1_bar, DOWN),
            Text("measurement statistics", font_size=28).next_to(VGroup(p0_bar, p1_bar), UP),
        )

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(sphere), FadeIn(ket0), FadeIn(ket1))
        self.play(GrowArrow(vector))
        self.play(ShowCreation(baseline), FadeIn(p0_bar), FadeIn(p1_bar), FadeIn(labels))
        self.play(Rotate(vector, angle=TAU, about_point=sphere.get_center()), run_time=2)
        self.wait(0.25)


class ProjectionMeasurementScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Measurement update is projection and renormalization", font_size=32, color=WHITE)
        title.to_edge(UP)

        origin = LEFT * 3.85 + DOWN * 1.35
        e1 = RIGHT * 1.75
        e2 = RIGHT * 1.02 + UP * 0.82
        e3 = UP * 2.05
        plane = Polygon(origin, origin + e1, origin + e1 + e2, origin + e2)
        plane.set_fill(TEAL, opacity=0.14).set_stroke(TEAL, width=2)

        axes = VGroup(
            Arrow(origin, origin + e1 * 1.18, buff=0, color=BLUE),
            Arrow(origin, origin + e2 * 1.18, buff=0, color=TEAL),
            Arrow(origin, origin + e3 * 1.08, buff=0, color=RED),
        )
        axis_labels = VGroup(
            Text("|a,1>", font_size=21, color=BLUE).next_to(axes[0], RIGHT, buff=0.08),
            Text("|a,2>", font_size=21, color=TEAL).next_to(axes[1], RIGHT, buff=0.08),
            Text("|b>", font_size=21, color=RED).next_to(axes[2], UP, buff=0.08),
        )

        p_a = 0.68
        c1 = math.sqrt(p_a * 0.42)
        c2 = math.sqrt(p_a * 0.58)
        c3 = math.sqrt(1 - p_a)
        psi = origin + c1 * e1 + c2 * e2 + c3 * e3
        raw = origin + c1 * e1 + c2 * e2
        after = origin + (c1 / math.sqrt(p_a)) * e1 + (c2 / math.sqrt(p_a)) * e2
        psi_arrow = Arrow(origin, psi, buff=0, color=RED)
        raw_arrow = Arrow(origin, raw, buff=0, color=YELLOW)
        after_arrow = Arrow(origin, after, buff=0, color=GREEN)
        drop = DashedLine(psi, raw, dash_length=0.08).set_stroke(GREY_B, width=2)

        vector_labels = VGroup(
            Text("|psi>", font_size=23, color=RED).next_to(psi, UP, buff=0.08),
            Text("projected", font_size=20, color=YELLOW).next_to(raw, DOWN, buff=0.16).shift(LEFT * 0.15),
            Text("after", font_size=20, color=GREEN).next_to(after, UP, buff=0.16).shift(RIGHT * 0.55),
        )

        def bar(label, value, color, shift):
            base = RIGHT * 1.75 + UP * 1.15 + shift
            label_text = Text(label, font_size=22, color=color).move_to(base + LEFT * 0.55 + UP * 0.28)
            outline = Rectangle(width=3.05, height=0.24).move_to(base + RIGHT * 1.0)
            outline.set_stroke(GREY_B, width=1.4).set_fill(WHITE, opacity=0.04)
            fill = Rectangle(width=3.05 * value, height=0.24).set_fill(color, opacity=0.4).set_stroke(color, width=2)
            fill.move_to(outline.get_left() + RIGHT * (1.525 * value))
            number = Text(f"{value:.2f}", font_size=20, color=color).next_to(outline, RIGHT, buff=0.12)
            return VGroup(label_text, outline, fill, number)

        bars = VGroup(
            bar("p(a) = expectation of P_a", p_a, TEAL, UP * 0.15),
            bar("p(b) = expectation of P_b", 1 - p_a, RED, DOWN * 0.45),
        )

        formulas = VGroup(
            Text("P_a projects onto a whole degenerate eigenspace", font_size=23, color=TEAL),
            Text("after outcome a: normalized P_a psi", font_size=23, color=YELLOW),
            Text("relative amplitudes inside P_a survive", font_size=23, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        formulas.to_edge(DOWN).shift(UP * 0.12)

        self.play(Write(title), FadeIn(plane), ShowCreation(axes), FadeIn(axis_labels), run_time=1)
        self.play(GrowArrow(psi_arrow), FadeIn(vector_labels[0]))
        self.play(ShowCreation(drop), GrowArrow(raw_arrow), FadeIn(vector_labels[1]), FadeIn(bars[0]))
        self.play(GrowArrow(after_arrow), FadeIn(vector_labels[2]), FadeIn(bars[1]))
        self.play(FadeIn(formulas[0]), FadeIn(formulas[1]), FadeIn(formulas[2]))
        self.wait(0.25)


class SpectralTheoremScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Hermitian observables split into projectors and real values", font_size=31, color=WHITE)
        title.to_edge(UP)

        center = LEFT * 3.45 + DOWN * 0.05
        radius = 1.55
        disk = Circle(radius=radius).move_to(center).set_stroke(GREY_B, width=2)
        x_axis = Line(center + LEFT * radius, center + RIGHT * radius).set_stroke(GREY_B, width=1.5)
        z_axis = Line(center + DOWN * radius, center + UP * radius).set_stroke(GREY_B, width=1.5)

        axis_angle = 0.82
        state_angle = -0.38
        obs_vec = RIGHT * math.sin(axis_angle) + UP * math.cos(axis_angle)
        state_vec = RIGHT * math.sin(state_angle) + UP * math.cos(state_angle)
        obs_line = Line(center - obs_vec * radius * 0.98, center + obs_vec * radius * 0.98).set_stroke(TEAL, width=4)
        state_arrow = Arrow(center, center + state_vec * radius * 0.9, buff=0, color=RED)
        projection = DashedLine(center + state_vec * radius * 0.9, center + obs_vec * radius * 0.55, dash_length=0.08)
        projection.set_stroke(GREY_A, width=2)

        labels = VGroup(
            Text("a+", font_size=24, color=TEAL).next_to(center + obs_vec * radius, RIGHT, buff=0.12),
            Text("a-", font_size=24, color=TEAL).next_to(center - obs_vec * radius, LEFT, buff=0.12),
            Text("psi", font_size=24, color=RED).next_to(center + state_vec * radius * 0.9, RIGHT, buff=0.12),
        )

        def projector_card(name, value, color, shift):
            card = RoundedRectangle(width=1.45, height=1.05, corner_radius=0.08)
            card.set_fill(WHITE, opacity=0.06).set_stroke(color, width=2)
            card.shift(shift)
            title_text = Text(name, font_size=25, color=color).move_to(card.get_center() + UP * 0.18)
            value_text = Text(value, font_size=20, color=GREY_A).next_to(title_text, DOWN, buff=0.1)
            return VGroup(card, title_text, value_text)

        projectors = VGroup(
            projector_card("P+", "prob 0.78", TEAL, RIGHT * 1.05 + UP * 1.05),
            projector_card("P-", "prob 0.22", BLUE, RIGHT * 2.85 + UP * 1.05),
        )
        projector_title = Text("orthogonal eigenspace projectors", font_size=23, color=WHITE)
        projector_title.next_to(projectors, UP, buff=0.28)

        bars = VGroup()
        for i, (value, color, label) in enumerate([(0.78, TEAL, "p+"), (0.22, BLUE, "p-")]):
            bar = Rectangle(width=0.46, height=1.65 * value)
            bar.set_fill(color, opacity=0.35).set_stroke(color, width=2)
            bar.move_to(RIGHT * 1.42 + RIGHT * i * 0.85 + DOWN * (0.75 - 0.82 * value))
            name = Text(label, font_size=21, color=color).next_to(bar, DOWN, buff=0.08)
            number = Text(f"{value:.2f}", font_size=18, color=color).next_to(bar, UP, buff=0.08)
            bars.add(bar, name, number)

        expectation_line = NumberLine(x_range=(-1.5, 1.5, 0.75), width=3.15, include_numbers=False)
        expectation_line.set_stroke(GREY_B, width=2)
        expectation_line.move_to(RIGHT * 3.45 + DOWN * 1.05)
        pointer = Arrow(expectation_line.n2p(0.0) + UP * 0.55, expectation_line.n2p(0.56) + UP * 0.08, buff=0, color=RED)
        expectation_label = Text("average result", font_size=21, color=RED).next_to(pointer, UP, buff=0.08)
        end_labels = VGroup(
            Text("a-", font_size=18, color=BLUE).next_to(expectation_line, LEFT, buff=0.12),
            Text("a+", font_size=18, color=TEAL).next_to(expectation_line, RIGHT, buff=0.12),
        )

        formulas = VGroup(
            Text("A = a+ P+ + a- P-", font_size=25, color=TEAL),
            Text("p_n = expectation of P_n", font_size=24, color=YELLOW),
            Text("<A> = sum eigenvalue x probability", font_size=23, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.17)
        formulas.to_edge(DOWN).shift(LEFT * 2.2 + UP * 0.12)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(VGroup(disk, x_axis, z_axis)), ShowCreation(obs_line), FadeIn(labels[0]), FadeIn(labels[1]))
        self.play(GrowArrow(state_arrow), ShowCreation(projection), FadeIn(labels[2]))
        self.play(FadeIn(projector_title), FadeIn(projectors), FadeIn(bars))
        self.play(FadeIn(expectation_line), GrowArrow(pointer), FadeIn(expectation_label), FadeIn(end_labels))
        self.play(FadeIn(formulas[0]), FadeIn(formulas[1]), FadeIn(formulas[2]))
        self.wait(0.25)


class BasisChangeScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("A basis change changes coordinates, not the ket", font_size=32, color=WHITE)
        title.to_edge(UP)

        center = LEFT * 3.35 + DOWN * 0.15
        radius = 1.55
        disk = Circle(radius=radius).move_to(center).set_stroke(GREY_B, width=2)
        x_axis = Line(center + LEFT * radius, center + RIGHT * radius).set_stroke(GREY_B, width=1.5)
        z_axis = Line(center + DOWN * radius, center + UP * radius).set_stroke(BLUE, width=3)

        alpha = 0.95
        theta = 1.25
        basis_vec = RIGHT * math.sin(alpha) + UP * math.cos(alpha)
        state_vec = RIGHT * (math.sin(theta) * 0.85) + UP * (math.cos(theta) * 0.85)
        basis_line = Line(center - basis_vec * radius * 0.95, center + basis_vec * radius * 0.95).set_stroke(TEAL, width=4)
        state_arrow = Arrow(center, center + state_vec * radius, buff=0, color=RED)

        labels = VGroup(
            Text("old basis", font_size=22, color=BLUE).next_to(z_axis, UP, buff=0.18),
            Text("new basis", font_size=22, color=TEAL).next_to(center + basis_vec * radius, RIGHT, buff=0.12),
            Text("|psi>", font_size=24, color=RED).next_to(center + state_vec * radius, UP, buff=0.1),
        )

        left_coeffs = VGroup(
            Text("old coordinates", font_size=24, color=BLUE),
            Text("c = [c1, c2]^T", font_size=23, color=WHITE),
            Text("P_i = |c_i|^2", font_size=23, color=BLUE),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        left_coeffs.move_to(RIGHT * 0.35 + UP * 1.05)

        right_coeffs = VGroup(
            Text("new coordinates", font_size=24, color=TEAL),
            Text("c' = U^dagger c", font_size=23, color=WHITE),
            Text("P'_i = |c'_i|^2", font_size=23, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        right_coeffs.move_to(RIGHT * 3.95 + UP * 1.05)

        arrow = Arrow(RIGHT * 1.4 + UP * 0.95, RIGHT * 2.65 + UP * 0.95, buff=0, color=YELLOW)
        arrow_label = Text("unitary matrix", font_size=22, color=YELLOW).next_to(arrow, UP, buff=0.15)

        def bars(origin, values, colors, names):
            group = VGroup()
            for i, value in enumerate(values):
                bar = Rectangle(width=0.42, height=1.45 * value)
                bar.set_fill(colors[i], opacity=0.35).set_stroke(colors[i], width=2)
                bar.move_to(origin + RIGHT * i * 0.78 + UP * (0.72 * value - 0.72))
                label = Text(names[i], font_size=19, color=colors[i]).next_to(bar, DOWN, buff=0.08)
                number = Text(f"{value:.2f}", font_size=18, color=colors[i]).next_to(bar, UP, buff=0.08)
                group.add(bar, label, number)
            return group

        old_bars = bars(RIGHT * 0.15 + DOWN * 1.0, [0.65, 0.35], [BLUE, RED], ["|e1>", "|e2>"])
        new_bars = bars(RIGHT * 3.75 + DOWN * 1.0, [0.89, 0.11], [TEAL, YELLOW], ["|e1'>", "|e2'>"])

        formulas = VGroup(
            Text("A' = U^dagger A U", font_size=24, color=YELLOW),
            Text("<psi|A|psi> = c^dagger A c = c'^dagger A' c'", font_size=23, color=GREEN),
            Text("probabilities depend on the measurement basis", font_size=22, color=GREY_A),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        formulas.to_edge(DOWN).shift(UP * 0.08)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(VGroup(disk, x_axis, z_axis)), ShowCreation(basis_line), FadeIn(labels))
        self.play(GrowArrow(state_arrow))
        self.play(FadeIn(left_coeffs), FadeIn(old_bars))
        self.play(GrowArrow(arrow), FadeIn(arrow_label), FadeIn(right_coeffs), FadeIn(new_bars))
        self.play(FadeIn(formulas[0]), FadeIn(formulas[1]))
        self.play(basis_line.animate.rotate(-0.55, about_point=center), run_time=1.4)
        self.play(FadeIn(formulas[2]))
        self.wait(0.25)


class CompletenessRelationScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Completeness reconstructs the state from projections", font_size=32, color=WHITE)
        title.to_edge(UP)

        origin = LEFT * 3.8 + DOWN * 1.25
        e1 = RIGHT * 1.25 + DOWN * 0.06
        e2 = LEFT * 0.62 + UP * 0.68
        e3 = UP * 1.12
        colors = [BLUE, TEAL, YELLOW]
        names = ["e1", "e2", "e3"]
        coeffs = [1.42, 0.82, 0.92]

        basis_arrows = VGroup()
        basis_labels = VGroup()
        for vector, color, name in zip([e1, e2, e3], colors, names):
            arrow = Arrow(origin, origin + vector * 1.15, buff=0, color=color)
            label = Text(name, font_size=22, color=color).next_to(origin + vector * 1.15, vector, buff=0.08)
            guide = DashedLine(origin - vector * 0.32, origin, dash_length=0.08).set_stroke(color, width=1.5, opacity=0.5)
            basis_arrows.add(guide, arrow)
            basis_labels.add(label)

        components = VGroup()
        component_labels = VGroup()
        cursor = origin
        for i, (vector, coefficient, color) in enumerate(zip([e1, e2, e3], coeffs, colors)):
            endpoint = cursor + vector * coefficient
            arrow = Arrow(cursor, endpoint, buff=0, color=color)
            label = Text(f"c{i + 1} e{i + 1}", font_size=21, color=color)
            label.next_to(Line(cursor, endpoint), UP, buff=0.08)
            components.add(arrow)
            component_labels.add(label)
            cursor = endpoint

        final_point = cursor
        state_arrow = Arrow(origin, final_point, buff=0, color=RED)
        state_label = Text("psi", font_size=24, color=RED).next_to(final_point, RIGHT, buff=0.12)
        close_note = Text("add every projected piece", font_size=22, color=GREY_A)
        close_note.next_to(origin + RIGHT * 0.65 + UP * 2.55, DOWN, buff=0.12)

        def projector_card(label, value, color):
            card = RoundedRectangle(width=1.55, height=1.05, corner_radius=0.08)
            card.set_fill(WHITE, opacity=0.06).set_stroke(color, width=2)
            text = Text(label, font_size=25, color=color).move_to(card.get_center() + UP * 0.18)
            weight = Text(value, font_size=20, color=GREY_A).next_to(text, DOWN, buff=0.1)
            return VGroup(card, text, weight)

        projector_cards = VGroup(
            projector_card("P1", "prob p1", BLUE),
            projector_card("P2", "prob p2", TEAL),
            projector_card("P3", "prob p3", YELLOW),
        ).arrange(RIGHT, buff=0.22)
        projector_cards.move_to(RIGHT * 2.6 + UP * 1.25)

        cards_title = Text("projectors resolve the identity", font_size=24, color=WHITE)
        cards_title.next_to(projector_cards, UP, buff=0.28)

        formulas = VGroup(
            Text("I = P1 + P2 + P3", font_size=25, color=TEAL),
            Text("psi = P1 psi + P2 psi + P3 psi", font_size=25, color=RED),
            Text("p1 + p2 + p3 = 1", font_size=24, color=GREEN),
            Text("insert I to compute amplitudes and matrices", font_size=22, color=GREY_A),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        formulas.move_to(RIGHT * 2.55 + DOWN * 1.25)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(basis_arrows), FadeIn(basis_labels))
        self.play(GrowArrow(state_arrow), FadeIn(state_label))
        self.play(FadeIn(cards_title), FadeIn(projector_cards))
        self.play(FadeIn(formulas[0]), run_time=0.8)
        self.play(
            GrowArrow(components[0]),
            GrowArrow(components[1]),
            GrowArrow(components[2]),
            FadeIn(component_labels),
            FadeIn(formulas[1]),
            run_time=1.4,
        )
        self.play(FadeIn(formulas[2]), FadeIn(close_note))
        self.play(FadeIn(formulas[3]))
        self.wait(0.25)


class CommutatorCompatibilityScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Commutators: compatible measurements share a basis", font_size=32, color=WHITE)
        title.to_edge(UP)

        center = LEFT * 3.25 + DOWN * 0.05
        radius = 1.55
        disk = Circle(radius=radius).move_to(center).set_stroke(GREY_B, width=2)
        x_axis = Line(center + LEFT * radius, center + RIGHT * radius).set_stroke(GREY_B, width=1.5)
        z_axis = Line(center + DOWN * radius, center + UP * radius).set_stroke(GREY_B, width=1.5)

        alpha = 0.95
        b_vec = RIGHT * math.sin(alpha) + UP * math.cos(alpha)
        a_line = Line(center + DOWN * radius * 0.98, center + UP * radius * 0.98).set_stroke(BLUE, width=4)
        b_line = Line(center - b_vec * radius * 0.98, center + b_vec * radius * 0.98).set_stroke(TEAL, width=4)
        state_vec = RIGHT * 0.78 + UP * 1.05
        state_arrow = Arrow(center, center + state_vec, buff=0, color=RED)

        labels = VGroup(
            Text("A = sigma_z", font_size=24, color=BLUE).next_to(a_line, UP),
            Text("B(alpha)", font_size=24, color=TEAL).next_to(center + b_vec * radius, RIGHT).shift(DOWN * 0.2),
            Text("|psi>", font_size=24, color=RED).next_to(center + state_vec, UP, buff=0.12),
            Text("x", font_size=22, color=GREY_B).next_to(x_axis, RIGHT),
            Text("z", font_size=22, color=GREY_B).next_to(z_axis, UP),
        )

        formula = VGroup(
            Text("B(alpha) = cos(alpha) sigma_z + sin(alpha) sigma_x", font_size=24, color=WHITE),
            Text("[sigma_z, B(alpha)] = 2 i sin(alpha) sigma_y", font_size=24, color=YELLOW),
            Text("zero commutator  <=>  common eigenbasis", font_size=24, color=GREEN),
        )
        formula.arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        formula.to_edge(DOWN).shift(UP * 0.15)

        def order_card(label, color, shift, vector):
            card = RoundedRectangle(width=2.55, height=1.9, corner_radius=0.08)
            card.set_fill(WHITE, opacity=0.06).set_stroke(color, width=2)
            card.shift(shift)
            mini_center = card.get_center() + DOWN * 0.16
            mini = Circle(radius=0.5).move_to(mini_center).set_stroke(GREY_B, width=1.5)
            arrow = Arrow(mini_center, mini_center + vector, buff=0, color=color)
            text = Text(label, font_size=23, color=color).next_to(card, UP, buff=0.15)
            return VGroup(card, mini, arrow, text)

        ab_card = order_card("measure A then B", TEAL, RIGHT * 1.35 + UP * 0.35, b_vec * 0.44)
        ba_card = order_card("measure B then A", BLUE, RIGHT * 4.15 + UP * 0.35, UP * 0.44)
        mismatch = Text("same axes: same answer   tilted axes: order matters", font_size=24, color=GREY_A)
        mismatch.next_to(VGroup(ab_card, ba_card), DOWN, buff=0.35)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(VGroup(disk, x_axis, z_axis)))
        self.play(ShowCreation(a_line), ShowCreation(b_line), FadeIn(labels))
        self.play(GrowArrow(state_arrow))
        self.play(FadeIn(formula[0]), FadeIn(formula[1]), run_time=1.2)
        self.play(FadeIn(ab_card), FadeIn(ba_card), FadeIn(mismatch))
        self.play(b_line.animate.rotate(-0.48, about_point=center), run_time=1.3)
        self.play(FadeIn(formula[2]))
        self.wait(0.25)


class UnitaryEvolutionScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Unitary evolution changes phase while preserving probability", font_size=31, color=WHITE)
        title.to_edge(UP)

        centers = [LEFT * 4.0 + UP * 1.15, LEFT * 2.1 + UP * 1.15, LEFT * 0.2 + UP * 1.15]
        colors = [BLUE, TEAL, YELLOW]
        labels = ["E1", "E2", "E3"]
        radii = [0.78, 0.62, 0.46]
        speeds = [0.0, 1.15, 2.55]
        phase = ValueTracker(0)

        phasors = VGroup()
        for center, color, label, radius, speed in zip(centers, colors, labels, radii, speeds):
            circle = Circle(radius=0.72).move_to(center).set_stroke(GREY_B, width=1.5)
            hline = Line(center + LEFT * 0.72, center + RIGHT * 0.72).set_stroke(GREY_B, width=1)
            vline = Line(center + DOWN * 0.72, center + UP * 0.72).set_stroke(GREY_B, width=1)
            arrow = always_redraw(
                lambda c=center, col=color, r=radius, s=speed: Arrow(
                    c,
                    c + RIGHT * (r * math.cos(-s * phase.get_value())) + UP * (r * math.sin(-s * phase.get_value())),
                    buff=0,
                    color=col,
                )
            )
            text = Text(label, font_size=22, color=color).next_to(circle, DOWN, buff=0.16)
            phasors.add(circle, hline, vline, arrow, text)

        bars = VGroup()
        bar_values = [0.55, 0.27, 0.18]
        for i, (value, color, label) in enumerate(zip(bar_values, colors, labels)):
            bar = Rectangle(width=0.42, height=1.7 * value)
            bar.set_fill(color, opacity=0.35).set_stroke(color, width=2)
            bar.move_to(RIGHT * 2.55 + RIGHT * i * 0.78 + UP * (0.85 * value + 0.12))
            name = Text(label, font_size=20, color=color).next_to(bar, DOWN, buff=0.08)
            number = Text(f"{value:.2f}", font_size=18, color=color).next_to(bar, UP, buff=0.08)
            bars.add(bar, name, number)
        bars_title = Text("energy probabilities stay fixed", font_size=21, color=WHITE)
        bars_title.next_to(bars, UP, buff=0.3)

        axes = Axes(
            x_range=(0, 6, 1),
            y_range=(-1.2, 1.2, 0.5),
            width=4.8,
            height=1.85,
        )
        axes.shift(RIGHT * 2.6 + DOWN * 1.72)

        def signal(x):
            return 0.64 * math.cos(1.15 * x) + 0.32 * math.cos(2.55 * x + 0.4) + 0.22 * math.cos(1.4 * x - 0.2)

        curve = axes.get_graph(signal, x_range=(0, 6, 0.03), color=RED)
        cursor = always_redraw(
            lambda: Dot(
                axes.c2p((phase.get_value() % 6), signal(phase.get_value() % 6)),
                color=YELLOW,
                radius=0.07,
            )
        )
        signal_label = Text("off-diagonal expectations oscillate", font_size=20, color=RED)
        signal_label.next_to(axes, UP, buff=0.1)

        formulas = VGroup(
            Text("U(t) = exp(-i H t / hbar)", font_size=25, color=TEAL),
            Text("psi(t): each energy component gets its own phase", font_size=23, color=WHITE),
            Text("U dagger U = I, so norm is conserved", font_size=23, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        formulas.to_edge(DOWN).shift(LEFT * 2.4 + UP * 0.15)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(phasors), FadeIn(bars_title), FadeIn(bars))
        self.play(FadeIn(formulas[0]), FadeIn(formulas[1]))
        self.play(ShowCreation(axes), ShowCreation(curve), FadeIn(signal_label), FadeIn(cursor))
        self.play(phase.animate.set_value(6), run_time=2.3, rate_func=linear)
        self.play(FadeIn(formulas[2]))
        self.wait(0.25)


class HeisenbergPictureScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Schrodinger and Heisenberg pictures give the same expectation", font_size=30, color=WHITE)
        title.to_edge(UP)

        phase = ValueTracker(0)
        left_center = LEFT * 3.2 + UP * 0.45
        right_center = RIGHT * 1.1 + UP * 0.45
        radius = 1.15
        theta = 1.0
        alpha = 0.58

        def disk(center, label):
            circle = Circle(radius=radius).move_to(center).set_stroke(GREY_B, width=2)
            equator = Ellipse(width=2 * radius, height=0.46 * radius).move_to(center).set_stroke(GREY_B, width=1.3)
            z_axis = Line(center + DOWN * radius, center + UP * radius).set_stroke(GREY_B, width=1.3)
            text = Text(label, font_size=23, color=WHITE).next_to(circle, DOWN, buff=0.2)
            h_arrow = Arrow(center, center + UP * radius * 0.92, buff=0, color=YELLOW)
            h_label = Text("H", font_size=20, color=YELLOW).next_to(h_arrow, RIGHT, buff=0.08).shift(DOWN * 0.1)
            return VGroup(circle, equator, z_axis, text, h_arrow, h_label)

        left_disk = disk(left_center, "Schrodinger: state moves")
        right_disk = disk(right_center, "Heisenberg: operator moves")

        def point(center, x, y, z, scale=1):
            return center + RIGHT * ((x - 0.48 * y) * radius * scale) + UP * ((z + 0.28 * y) * radius * scale)

        sch_state = always_redraw(
            lambda: Arrow(
                left_center,
                point(left_center, math.sin(theta) * math.cos(phase.get_value()), math.sin(theta) * math.sin(phase.get_value()), math.cos(theta), 0.85),
                buff=0,
                color=RED,
            )
        )
        sch_obs = Arrow(
            left_center,
            point(left_center, math.cos(alpha), math.sin(alpha), 0, 0.9),
            buff=0,
            color=TEAL,
        )
        hei_state = Arrow(
            right_center,
            point(right_center, math.sin(theta), 0, math.cos(theta), 0.85),
            buff=0,
            color=RED,
        )
        hei_obs = always_redraw(
            lambda: Arrow(
                right_center,
                point(right_center, math.cos(alpha - phase.get_value()), math.sin(alpha - phase.get_value()), 0, 0.9),
                buff=0,
                color=TEAL,
            )
        )

        vector_labels = VGroup(
            Text("psi(t)", font_size=21, color=RED).next_to(left_center + UP * radius * 1.05, LEFT, buff=0.2).shift(UP * 0.08),
            Text("A fixed", font_size=21, color=TEAL).next_to(sch_obs, RIGHT, buff=0.1),
            Text("psi(0)", font_size=21, color=RED).next_to(right_center + UP * radius * 1.05, LEFT, buff=0.2).shift(UP * 0.08),
            Text("A_H(t)", font_size=21, color=TEAL).next_to(right_center + RIGHT * radius, RIGHT, buff=0.1),
        )

        bridge = Arrow(LEFT * 1.35 + UP * 0.45, LEFT * 0.2 + UP * 0.45, buff=0, color=YELLOW)
        bridge_label = Text("shift time dependence", font_size=21, color=YELLOW).next_to(bridge, UP, buff=0.12)

        formulas = VGroup(
            Text("A_H(t) = U dagger A_S U", font_size=25, color=TEAL),
            Text("<psi_S(t)|A_S|psi_S(t)> = <psi(0)|A_H(t)|psi(0)>", font_size=23, color=WHITE),
            Text("dA_H/dt = i [H,A_H] / hbar", font_size=24, color=YELLOW),
            Text("same physics, different bookkeeping", font_size=23, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        formulas.to_edge(DOWN).shift(UP * 0.12)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(left_disk), FadeIn(right_disk))
        self.play(GrowArrow(sch_state), GrowArrow(sch_obs), GrowArrow(hei_state), GrowArrow(hei_obs), FadeIn(vector_labels))
        self.play(GrowArrow(bridge), FadeIn(bridge_label), FadeIn(formulas[0]))
        self.play(phase.animate.set_value(TAU * 0.72), run_time=2.1, rate_func=linear)
        self.play(FadeIn(formulas[1]), FadeIn(formulas[2]), FadeIn(formulas[3]))
        self.wait(0.25)


class EhrenfestConservationScene(Scene):
    def construct(self):
        title = Text("Ehrenfest theorem: expectations obey motion laws", font_size=32)
        title.to_edge(UP)

        axes = Axes(
            x_range=(-3.2, 3.2, 1),
            y_range=(-0.4, 3.3, 1),
            width=5.7,
            height=3.35,
        )
        axes.shift(LEFT * 2.9 + DOWN * 0.28)

        omega = 1.15
        x0 = -1.35
        p0 = 1.05

        def x_at(time):
            return x0 * math.cos(omega * time) + (p0 / omega) * math.sin(omega * time)

        def p_at(time):
            return -x0 * omega * math.sin(omega * time) + p0 * math.cos(omega * time)

        def potential(x):
            return 0.28 * omega * omega * x * x + 0.25

        potential_curve = axes.get_graph(potential, x_range=(-3, 3, 0.05), color=YELLOW)
        baseline = axes.get_graph(lambda x: 0, x_range=(-3, 3, 0.1), color=GREY_B)
        time = ValueTracker(0)

        packet = always_redraw(
            lambda: Dot(
                axes.c2p(x_at(time.get_value()), potential(x_at(time.get_value()))),
                color=BLUE,
                radius=0.1,
            )
        )
        guide = always_redraw(
            lambda: Line(
                axes.c2p(x_at(time.get_value()), 0),
                axes.c2p(x_at(time.get_value()), potential(x_at(time.get_value()))),
                color=BLUE,
                stroke_width=2,
            )
        )
        momentum_arrow = always_redraw(
            lambda: Arrow(
                axes.c2p(x_at(time.get_value()), potential(x_at(time.get_value())) + 0.45),
                axes.c2p(x_at(time.get_value()) + 0.55 * p_at(time.get_value()), potential(x_at(time.get_value())) + 0.45),
                buff=0,
                color=RED,
            )
        )

        trace_axes = Axes(
            x_range=(0, 7, 1),
            y_range=(-2.4, 2.4, 1),
            width=4.3,
            height=2.35,
        )
        trace_axes.shift(RIGHT * 2.65 + UP * 0.6)
        x_trace = trace_axes.get_graph(lambda tau: x_at(tau), x_range=(0, 7, 0.05), color=BLUE)
        p_trace = trace_axes.get_graph(lambda tau: p_at(tau), x_range=(0, 7, 0.05), color=RED)
        cursor = always_redraw(
            lambda: Line(
                trace_axes.c2p(time.get_value() % 7, -2.25),
                trace_axes.c2p(time.get_value() % 7, 2.25),
                color=YELLOW,
                stroke_width=2,
            )
        )
        trace_labels = VGroup(
            Text("<x>(t)", font_size=22, color=BLUE).next_to(trace_axes, UP).shift(LEFT * 1.1),
            Text("<p>(t)", font_size=22, color=RED).next_to(trace_axes, UP).shift(RIGHT * 0.65),
        )

        laws = VGroup(
            Text("d<x>/dt = <p>/m", font_size=25, color=BLUE),
            Text("d<p>/dt = -<dV/dx>", font_size=25, color=RED),
            Text("[H,H]=0  ->  <H> is constant", font_size=25, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        laws.shift(RIGHT * 2.1 + DOWN * 1.45)

        caption = Text("Symmetry or a vanishing commutator gives a conservation law", font_size=25, color=TEAL)
        caption.to_edge(DOWN)

        self.play(Write(title), ShowCreation(axes), ShowCreation(baseline), ShowCreation(potential_curve), run_time=1)
        self.play(FadeIn(packet), ShowCreation(guide), GrowArrow(momentum_arrow))
        self.play(ShowCreation(trace_axes), ShowCreation(x_trace), ShowCreation(p_trace), FadeIn(trace_labels))
        self.play(FadeIn(laws), FadeIn(caption))
        self.play(time.animate.set_value(7), run_time=2.4, rate_func=linear)
        self.wait(0.35)


class FreeParticleDispersionScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("A free particle moves and disperses", font_size=34, color=WHITE)
        title.to_edge(UP)

        x_axes = Axes(
            x_range=(-5, 5, 1),
            y_range=(-1.25, 1.25, 0.5),
            width=6.5,
            height=3.1,
        )
        x_axes.shift(LEFT * 2.35 + DOWN * 0.25)
        k_axes = Axes(
            x_range=(-3.5, 3.5, 1),
            y_range=(0, 1.1, 0.25),
            width=3.6,
            height=2.4,
        )
        k_axes.shift(RIGHT * 3.55 + UP * 0.35)

        time = ValueTracker(0)
        sigma0 = 0.85
        k0 = 1.35

        def sigma(t):
            return sigma0 * math.sqrt(1 + (t / (2 * sigma0 * sigma0)) ** 2)

        def center(t):
            return -2.65 + k0 * t * 0.38

        def wave(x):
            current_time = time.get_value()
            spread = sigma(current_time)
            packet_center = center(current_time)
            envelope = np.exp(-((x - packet_center) ** 2) / (2 * spread * spread))
            return envelope * np.cos(3.1 * k0 * x - 0.55 * k0 * k0 * current_time)

        def density(x):
            current_time = time.get_value()
            spread = sigma(current_time)
            packet_center = center(current_time)
            return -0.9 + 0.82 * np.exp(-((x - packet_center) ** 2) / (spread * spread))

        wave_graph = always_redraw(lambda: x_axes.get_graph(wave, x_range=(-5, 5, 0.035), color=BLUE))
        density_graph = always_redraw(lambda: x_axes.get_graph(density, x_range=(-5, 5, 0.035), color=GREEN))
        center_dot = always_redraw(lambda: Dot(x_axes.c2p(center(time.get_value()), -0.9), color=YELLOW, radius=0.07))
        center_arrow = always_redraw(
            lambda: Arrow(
                x_axes.c2p(center(time.get_value()) - 0.52, -1.18),
                x_axes.c2p(center(time.get_value()), -1.18),
                buff=0,
                color=YELLOW,
            )
        )

        k_density = k_axes.get_graph(
            lambda k: np.exp(-((k - k0) ** 2) / (2 * (1 / (2 * sigma0)) ** 2)),
            x_range=(-3.5, 3.5, 0.04),
            color=TEAL,
        )
        k0_line = DashedLine(k_axes.c2p(k0, 0), k_axes.c2p(k0, 1.0), dash_length=0.08).set_stroke(YELLOW, width=2)

        labels = VGroup(
            Text("Re psi(x,t)", font_size=23, color=BLUE).next_to(x_axes, LEFT).shift(UP * 0.8),
            Text("|psi|^2", font_size=23, color=GREEN).next_to(x_axes, LEFT).shift(DOWN * 0.85),
            Text("phi(k) stays fixed", font_size=23, color=TEAL).next_to(k_axes, UP),
            Text("<x> = x0 + (hbar k0 / m)t", font_size=22, color=YELLOW).next_to(x_axes, DOWN, buff=0.35),
        )

        formulas = VGroup(
            Text("omega(k) = hbar k^2 / 2m", font_size=23, color=WHITE),
            Text("v_g = d omega / dk = hbar k0 / m", font_size=23, color=YELLOW),
            Text("sigma_x(t) = sigma0 sqrt(1 + (hbar t / 2m sigma0^2)^2)", font_size=21, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        formulas.move_to(RIGHT * 3.25 + DOWN * 1.42)

        self.play(Write(title), ShowCreation(x_axes), ShowCreation(k_axes), run_time=1)
        self.play(ShowCreation(wave_graph), ShowCreation(density_graph), FadeIn(center_dot), GrowArrow(center_arrow), FadeIn(labels))
        self.play(ShowCreation(k_density), ShowCreation(k0_line), FadeIn(formulas[0]), FadeIn(formulas[1]))
        self.play(time.animate.set_value(4.4), run_time=3.2, rate_func=linear)
        self.play(FadeIn(formulas[2]))
        self.wait(0.25)


class OrthogonalityScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Orthogonal eigenfunctions isolate expansion coefficients", font_size=32, color=WHITE)
        title.to_edge(UP)

        axes = Axes(
            x_range=(0, 1, 0.25),
            y_range=(-1.45, 1.45, 0.5),
            width=6.4,
            height=3.1,
        )
        axes.shift(LEFT * 2.55 + UP * 0.25)

        product_axes = Axes(
            x_range=(0, 1, 0.25),
            y_range=(-2.2, 2.2, 1),
            width=6.4,
            height=1.45,
        )
        product_axes.shift(LEFT * 2.55 + DOWN * 1.75)

        n = 2
        m = 4

        def psi(level, x):
            return math.sqrt(2) * math.sin(level * math.pi * x)

        psi_n = axes.get_graph(lambda x: psi(n, x), x_range=(0, 1, 0.002), color=BLUE)
        psi_m = axes.get_graph(lambda x: psi(m, x), x_range=(0, 1, 0.002), color=RED)
        product = product_axes.get_graph(lambda x: psi(n, x) * psi(m, x), x_range=(0, 1, 0.002), color=GREEN)
        zero_line = Line(product_axes.c2p(0, 0), product_axes.c2p(1, 0)).set_stroke(GREY_B, width=1.5)

        labels = VGroup(
            Text("psi_2(x)", font_size=23, color=BLUE).next_to(axes.c2p(0.12, psi(n, 0.12)), UP, buff=0.08),
            Text("psi_4(x)", font_size=23, color=RED).next_to(axes.c2p(0.62, psi(m, 0.62)), UP, buff=0.08),
            Text("product has equal positive and negative area", font_size=22, color=GREEN).next_to(product_axes, UP, buff=0.08),
            Text("integral = 0 when n != m", font_size=24, color=YELLOW).next_to(product_axes, DOWN, buff=0.22),
        )

        matrix_group = VGroup()
        cell = 0.34
        origin = RIGHT * 1.55 + UP * 1.15
        selected_square = None
        for row in range(5):
            for col in range(5):
                square = Square(side_length=cell)
                square.move_to(origin + RIGHT * col * cell + DOWN * row * cell)
                if row == 1 and col == 3:
                    selected_square = square
                if row == col:
                    square.set_fill(TEAL, opacity=0.28).set_stroke(TEAL, width=1.6)
                    number = Text("1", font_size=16, color=TEAL).move_to(square)
                    matrix_group.add(square, number)
                else:
                    square.set_fill(WHITE, opacity=0.05).set_stroke(GREY_B, width=1.0)
                    matrix_group.add(square)
        matrix_title = Text("overlap matrix <n|m>", font_size=23, color=WHITE).next_to(matrix_group, UP, buff=0.24)
        selected = SurroundingRectangle(selected_square, color=RED, buff=0.02)
        selected_label = Text("<2|4> = 0", font_size=23, color=RED).next_to(matrix_group, DOWN, buff=0.22)

        coefficient_card = RoundedRectangle(width=3.5, height=1.28, corner_radius=0.08)
        coefficient_card.set_fill(WHITE, opacity=0.06).set_stroke(YELLOW, width=2)
        coefficient_card.move_to(RIGHT * 3.0 + DOWN * 1.25)
        coefficient_text = VGroup(
            Text("c_n = integral psi_n^* Psi dx", font_size=22, color=YELLOW),
            Text("projection removes all other modes", font_size=21, color=GREY_A),
        ).arrange(DOWN, buff=0.12)
        coefficient_text.move_to(coefficient_card.get_center())

        formulas = VGroup(
            Text("integral psi_n^* psi_m dx = delta_nm", font_size=24, color=TEAL),
            Text("Psi(x,t) = sum c_n psi_n(x) exp(-i E_n t / hbar)", font_size=22, color=WHITE),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        formulas.to_edge(DOWN).shift(LEFT * 2.0 + UP * 0.1)

        self.play(Write(title), ShowCreation(axes), ShowCreation(product_axes), run_time=1)
        self.play(ShowCreation(psi_n), ShowCreation(psi_m), FadeIn(labels[0]), FadeIn(labels[1]))
        self.play(ShowCreation(zero_line), ShowCreation(product), FadeIn(labels[2]), FadeIn(labels[3]))
        self.play(FadeIn(matrix_title), FadeIn(matrix_group), ShowCreation(selected), FadeIn(selected_label))
        self.play(FadeIn(coefficient_card), FadeIn(coefficient_text), FadeIn(formulas))
        self.wait(0.35)


class FiniteSquareWellScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Finite square well: parity and tunneling tails", font_size=33, color=WHITE)
        title.to_edge(UP)

        z0 = 4.7

        def finite_states(depth):
            roots = []
            eps = 1e-4

            def bisect(fn, lo, hi):
                a = lo
                b = hi
                fa = fn(a)
                fb = fn(b)
                if not math.isfinite(fa) or not math.isfinite(fb) or fa * fb > 0:
                    return None
                for _ in range(60):
                    mid = 0.5 * (a + b)
                    fm = fn(mid)
                    if not math.isfinite(fm):
                        return None
                    if fa * fm <= 0:
                        b = mid
                        fb = fm
                    else:
                        a = mid
                        fa = fm
                return 0.5 * (a + b)

            def rhs(z):
                return math.sqrt(max(0, depth * depth - z * z))

            for n in range(8):
                even_lo = n * math.pi + eps
                even_hi = min(n * math.pi + math.pi / 2 - eps, depth - eps)
                if even_lo < even_hi:
                    root = bisect(lambda z: z * math.tan(z) - rhs(z), even_lo, even_hi)
                    if root:
                        roots.append((root, "even"))
                odd_lo = n * math.pi + math.pi / 2 + eps
                odd_hi = min((n + 1) * math.pi - eps, depth - eps)
                if odd_lo < odd_hi:
                    root = bisect(lambda z: -z / math.tan(z) - rhs(z), odd_lo, odd_hi)
                    if root:
                        roots.append((root, "odd"))
            return sorted(roots, key=lambda item: item[0])

        states = finite_states(z0)
        selected_z, selected_parity = states[1]
        kappa = math.sqrt(max(0, z0 * z0 - selected_z * selected_z))
        energy = (selected_z / z0) ** 2

        axes = Axes(
            x_range=(-2.5, 2.5, 1),
            y_range=(-0.18, 1.25, 0.25),
            width=6.8,
            height=3.7,
        )
        axes.shift(LEFT * 2.25 + DOWN * 0.15)

        well = VMobject()
        well.set_points_as_corners(
            [
                axes.c2p(-2.35, 1.0),
                axes.c2p(-1.0, 1.0),
                axes.c2p(-1.0, 0),
                axes.c2p(1.0, 0),
                axes.c2p(1.0, 1.0),
                axes.c2p(2.35, 1.0),
            ]
        )
        well.set_stroke(WHITE, width=4)
        barrier_fill = VGroup(
            Rectangle(width=1.85, height=2.55).move_to(axes.c2p(-1.75, 0.5)).set_fill(RED, opacity=0.09).set_stroke(width=0),
            Rectangle(width=1.85, height=2.55).move_to(axes.c2p(1.75, 0.5)).set_fill(RED, opacity=0.09).set_stroke(width=0),
        )
        energy_line = DashedLine(axes.c2p(-2.35, energy), axes.c2p(2.35, energy), dash_length=0.08).set_stroke(YELLOW, width=2)

        def psi(q):
            abs_q = abs(q)
            if selected_parity == "even":
                boundary = math.cos(selected_z)
                if abs_q <= 1:
                    return math.cos(selected_z * q)
                return boundary * math.exp(-kappa * (abs_q - 1))
            sign = -1 if q < 0 else 1
            boundary = math.sin(selected_z)
            if abs_q <= 1:
                return math.sin(selected_z * q)
            return sign * boundary * math.exp(-kappa * (abs_q - 1))

        samples = [-2.35 + 4.7 * i / 220 for i in range(221)]
        max_abs = max(abs(psi(q)) for q in samples)
        wave = VMobject()
        wave.set_points_as_corners([axes.c2p(q, energy + 0.18 * psi(q) / max_abs) for q in samples])
        wave.set_stroke(TEAL if selected_parity == "even" else BLUE, width=3)
        density = VMobject()
        density.set_points_as_corners([axes.c2p(q, energy + 0.12 * (psi(q) / max_abs) ** 2) for q in samples])
        density.set_stroke(GREEN, width=3)

        labels = VGroup(
            Text("V0 outside", font_size=23, color=RED).next_to(axes.c2p(-2.25, 1.0), UP),
            Text("continuous psi and dpsi/dx", font_size=23, color=GREY_A).next_to(axes, DOWN),
            Text(f"selected state: {selected_parity}", font_size=24, color=YELLOW).next_to(axes, UP).shift(RIGHT * 0.2),
        )

        ladder = VGroup()
        ladder_x0 = RIGHT * 2.15 + DOWN * 1.2
        for index, (z, parity) in enumerate(states):
            y = -1.2 + 2.55 * (z / z0) ** 2
            color = TEAL if parity == "even" else BLUE
            line = Line(ladder_x0 + UP * y, ladder_x0 + RIGHT * 1.75 + UP * y).set_stroke(RED if index == 1 else color, width=4 if index == 1 else 2.5)
            label = Text(f"{index + 1} {parity}", font_size=21, color=RED if index == 1 else color).next_to(line, RIGHT, buff=0.18)
            ladder.add(line, label)
        v0_line = Line(ladder_x0 + UP * 1.35, ladder_x0 + RIGHT * 1.75 + UP * 1.35).set_stroke(WHITE, width=2)
        v0_label = Text("V0", font_size=22, color=WHITE).next_to(v0_line, RIGHT, buff=0.18)
        ladder.add(v0_line, v0_label)

        equations = VGroup(
            Text("even: z tan z = sqrt(z0^2 - z^2)", font_size=22, color=TEAL),
            Text("odd: -z cot z = sqrt(z0^2 - z^2)", font_size=22, color=BLUE),
            Text("outside: psi ~ exp(-kappa |x|)", font_size=22, color=YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        equations.to_edge(DOWN).shift(RIGHT * 1.15 + UP * 0.1)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(barrier_fill), ShowCreation(axes), ShowCreation(well), ShowCreation(energy_line))
        self.play(ShowCreation(wave), ShowCreation(density), FadeIn(labels))
        self.play(FadeIn(ladder), FadeIn(equations[0]), FadeIn(equations[1]))
        self.play(FadeIn(equations[2]))
        self.wait(0.35)


class ParitySymmetryScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Parity symmetry separates even and odd states", font_size=34, color=WHITE)
        title.to_edge(UP)

        axes = Axes(
            x_range=(-3.4, 3.4, 1),
            y_range=(-1.25, 1.25, 0.5),
            width=6.8,
            height=3.4,
        )
        axes.shift(LEFT * 2.55 + DOWN * 0.08)

        def even(x):
            return math.exp(-x * x / 1.45)

        def odd(x):
            return 1.35 * x * math.exp(-x * x / 1.45)

        even_curve = axes.get_graph(even, x_range=(-3.2, 3.2, 0.035), color=TEAL)
        odd_curve = axes.get_graph(odd, x_range=(-3.2, 3.2, 0.035), color=BLUE)
        mix_curve = axes.get_graph(lambda x: 0.78 * even(x) + 0.62 * odd(x), x_range=(-3.2, 3.2, 0.035), color=RED)
        density_curve = axes.get_graph(lambda x: -0.95 + 0.52 * (0.78 * even(x) + 0.62 * odd(x)) ** 2, x_range=(-3.2, 3.2, 0.035), color=GREEN)
        mirror_line = DashedLine(axes.c2p(0, -1.18), axes.c2p(0, 1.12), dash_length=0.08).set_stroke(GREY_A, width=2)
        potential = axes.get_graph(lambda x: -1.12 + 0.08 * x * x, x_range=(-3.2, 3.2, 0.04), color=YELLOW)

        labels = VGroup(
            Text("even", font_size=22, color=TEAL).next_to(axes.c2p(-2.5, even(-2.5)), UP, buff=0.08),
            Text("odd", font_size=22, color=BLUE).next_to(axes.c2p(1.4, odd(1.4)), UP, buff=0.08),
            Text("mixed state", font_size=22, color=RED).next_to(axes.c2p(1.15, 0.78 * even(1.15) + 0.62 * odd(1.15)), UP, buff=0.08),
            Text("mirror x -> -x", font_size=20, color=GREY_A).next_to(mirror_line, DOWN, buff=0.28).shift(RIGHT * 0.58),
            Text("symmetric V(x)", font_size=21, color=YELLOW).next_to(axes, DOWN, buff=0.58).shift(LEFT * 1.15),
        )

        projectors = VGroup(
            RoundedRectangle(width=1.35, height=0.9, corner_radius=0.08).set_fill(WHITE, opacity=0.06).set_stroke(TEAL, width=2),
            RoundedRectangle(width=1.35, height=0.9, corner_radius=0.08).set_fill(WHITE, opacity=0.06).set_stroke(BLUE, width=2),
        ).arrange(RIGHT, buff=0.25)
        projectors.move_to(RIGHT * 2.65 + UP * 1.35)
        projector_text = VGroup(
            Text("P=+1", font_size=22, color=TEAL).move_to(projectors[0]),
            Text("P=-1", font_size=22, color=BLUE).move_to(projectors[1]),
        )
        projector_title = Text("parity eigenvalues", font_size=23, color=WHITE).next_to(projectors, UP, buff=0.22)

        selection_box = RoundedRectangle(width=3.6, height=1.45, corner_radius=0.08)
        selection_box.set_fill(WHITE, opacity=0.06).set_stroke(YELLOW, width=2)
        selection_box.move_to(RIGHT * 2.65 + DOWN * 0.2)
        selection_text = VGroup(
            Text("odd operator x", font_size=22, color=YELLOW),
            Text("<e|x|e> = <o|x|o> = 0", font_size=21, color=GREY_A),
            Text("<e|x|o> can survive", font_size=21, color=GREEN),
        ).arrange(DOWN, buff=0.12)
        selection_text.move_to(selection_box.get_center())

        formulas = VGroup(
            Text("(P psi)(x) = psi(-x)", font_size=24, color=TEAL),
            Text("[H,P] = 0 when V(x)=V(-x)", font_size=24, color=YELLOW),
            Text("odd integrands vanish by symmetry", font_size=23, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        formulas.to_edge(DOWN).shift(RIGHT * 1.4 + UP * 0.12)

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(potential), ShowCreation(mirror_line), FadeIn(labels[3]), FadeIn(labels[4]))
        self.play(ShowCreation(even_curve), FadeIn(labels[0]), ShowCreation(odd_curve), FadeIn(labels[1]))
        self.play(ShowCreation(mix_curve), ShowCreation(density_curve), FadeIn(labels[2]))
        self.play(FadeIn(projector_title), FadeIn(projectors), FadeIn(projector_text))
        self.play(FadeIn(selection_box), FadeIn(selection_text), FadeIn(formulas))
        self.wait(0.35)


class DeltaPotentialScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Delta-function well: singular boundary condition, exact solution", font_size=30, color=WHITE)
        title.to_edge(UP)

        alpha = 1.25
        k = 1.6
        transmission = k * k / (k * k + alpha * alpha)
        reflection = 1 - transmission

        axes = Axes(
            x_range=(-4, 4, 1),
            y_range=(-1.3, 1.35, 0.5),
            width=6.6,
            height=3.5,
        )
        axes.shift(LEFT * 2.35 + DOWN * 0.1)
        zero = Line(axes.c2p(-4, 0), axes.c2p(4, 0)).set_stroke(GREY_B, width=2)
        spike = Arrow(axes.c2p(0, 0.72), axes.c2p(0, -1.05), buff=0, color=RED)
        spike_label = Text("area = -alpha", font_size=23, color=RED).next_to(spike, RIGHT, buff=0.15).shift(DOWN * 0.35)
        energy = DashedLine(axes.c2p(-4, -0.65), axes.c2p(4, -0.65), dash_length=0.08).set_stroke(YELLOW, width=2)

        bound = axes.get_graph(lambda x: -0.65 + 0.82 * math.exp(-alpha * abs(x)), x_range=(-4, 4, 0.02), color=GREEN)
        density = axes.get_graph(lambda x: -0.65 + 0.5 * math.exp(-2 * alpha * abs(x)), x_range=(-4, 4, 0.02), color=TEAL)
        slope_left = Arrow(axes.c2p(-1.2, -0.2), axes.c2p(-0.18, 0.1), buff=0, color=BLUE)
        slope_right = Arrow(axes.c2p(1.2, -0.2), axes.c2p(0.18, 0.1), buff=0, color=BLUE)

        bound_labels = VGroup(
            Text("bound state: psi ~ exp(-kappa |x|)", font_size=23, color=GREEN).next_to(axes, DOWN),
            Text("psi'(0+) - psi'(0-) = -2 kappa psi(0)", font_size=23, color=BLUE).next_to(axes, UP).shift(RIGHT * 0.1),
        )

        scatter_axes = Axes(
            x_range=(-4, 4, 1),
            y_range=(-1.1, 1.1, 0.5),
            width=3.7,
            height=2.0,
        )
        scatter_axes.shift(RIGHT * 3.25 + UP * 0.62)
        scatter_zero = Line(scatter_axes.c2p(-4, 0), scatter_axes.c2p(4, 0)).set_stroke(GREY_B, width=1.5)
        scatter_spike = Arrow(scatter_axes.c2p(0, 0.55), scatter_axes.c2p(0, -0.55), buff=0, color=RED)
        incoming = scatter_axes.get_graph(lambda x: 0.42 + 0.25 * math.sin(k * x), x_range=(-4, 0, 0.04), color=BLUE)
        reflected = scatter_axes.get_graph(lambda x: -0.42 + 0.25 * math.sqrt(reflection) * math.sin(-k * x), x_range=(-4, 0, 0.04), color=RED)
        transmitted = scatter_axes.get_graph(lambda x: 0.25 * math.sqrt(transmission) * math.sin(k * x), x_range=(0, 4, 0.04), color=TEAL)
        wave_labels = VGroup(
            Text("incoming", font_size=19, color=BLUE).next_to(scatter_axes.c2p(-3.4, 0.42), UP, buff=0.05),
            Text("reflected", font_size=19, color=RED).next_to(scatter_axes.c2p(-3.4, -0.42), DOWN, buff=0.05),
            Text("transmitted", font_size=19, color=TEAL).next_to(scatter_axes.c2p(1.0, 0.1), UP, buff=0.05),
        )

        bar_width = 3.2
        bar_center = RIGHT * 3.25 + DOWN * 0.85
        bar = Rectangle(width=bar_width, height=0.28).set_stroke(WHITE, width=1.5).move_to(bar_center)
        t_bar = Rectangle(width=bar_width * transmission, height=0.28).set_fill(TEAL, opacity=0.55).set_stroke(width=0)
        t_bar.move_to(bar_center + LEFT * (bar_width * (1 - transmission) / 2))
        r_bar = Rectangle(width=bar_width * reflection, height=0.28).set_fill(RED, opacity=0.45).set_stroke(width=0)
        r_bar.move_to(bar_center + RIGHT * (bar_width * (1 - reflection) / 2))
        probabilities = VGroup(
            bar,
            t_bar,
            r_bar,
            Text(f"T = {transmission:.2f}", font_size=22, color=TEAL).next_to(bar, DOWN).shift(LEFT * 0.85),
            Text(f"R = {reflection:.2f}", font_size=22, color=RED).next_to(bar, DOWN).shift(RIGHT * 0.85),
        )

        equations = VGroup(
            Text("V(x) = -alpha delta(x)", font_size=23, color=WHITE),
            Text("E_b = - hbar^2 kappa^2 / 2m", font_size=23, color=YELLOW),
            Text("T = k^2 / (k^2 + kappa^2)", font_size=23, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        equations.to_edge(DOWN).shift(RIGHT * 1.15)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(axes), ShowCreation(zero), GrowArrow(spike), FadeIn(spike_label), ShowCreation(energy))
        self.play(ShowCreation(bound), ShowCreation(density), GrowArrow(slope_left), GrowArrow(slope_right), FadeIn(bound_labels))
        self.play(ShowCreation(scatter_axes), ShowCreation(scatter_zero), GrowArrow(scatter_spike))
        self.play(ShowCreation(incoming), ShowCreation(reflected), ShowCreation(transmitted), FadeIn(wave_labels))
        self.play(FadeIn(probabilities), FadeIn(equations))
        self.wait(0.35)


class SpectralExpansionScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Spectral expansion: stationary phases make moving densities", font_size=31, color=WHITE)
        title.to_edge(UP)

        axes = Axes(
            x_range=(0, 1, 0.25),
            y_range=(-1.8, 1.8, 0.9),
            width=6.0,
            height=3.2,
        )
        axes.shift(LEFT * 2.65 + DOWN * 0.15)

        coeffs = [0.78, 0.53, 0.33]
        norm = math.sqrt(sum(c * c for c in coeffs))
        coeffs = [c / norm for c in coeffs]
        time = ValueTracker(0)

        def component(x, sample_time):
            re = 0
            im = 0
            for index, coeff in enumerate(coeffs):
                n = index + 1
                basis = math.sqrt(2) * math.sin(n * math.pi * x)
                phase = n * n * sample_time
                re += coeff * basis * math.cos(phase)
                im -= coeff * basis * math.sin(phase)
            return re, im

        def real_part(x):
            return component(x, time.get_value())[0]

        def density(x):
            re, im = component(x, time.get_value())
            return -1.45 + 0.45 * (re * re + im * im)

        real_curve = always_redraw(lambda: axes.get_graph(real_part, x_range=(0, 1, 0.005), color=BLUE))
        density_curve = always_redraw(lambda: axes.get_graph(density, x_range=(0, 1, 0.005), color=GREEN))
        baseline = Line(axes.c2p(0, 0), axes.c2p(1, 0)).set_stroke(GREY_B, width=2)
        density_base = Line(axes.c2p(0, -1.45), axes.c2p(1, -1.45)).set_stroke(GREY_B, width=1.5)
        walls = VGroup(
            Line(axes.c2p(0, -1.65), axes.c2p(0, 1.65)).set_stroke(WHITE, width=3),
            Line(axes.c2p(1, -1.65), axes.c2p(1, 1.65)).set_stroke(WHITE, width=3),
        )
        curve_labels = VGroup(
            Text("Re Psi(x,t)", font_size=23, color=BLUE).next_to(axes, UP).shift(LEFT * 1.5),
            Text("|Psi(x,t)|^2", font_size=23, color=GREEN).next_to(axes, DOWN).shift(LEFT * 1.45),
        )

        formula = VGroup(
            Text("Psi(x,t) = sum c_n psi_n(x) exp(-i E_n t / hbar)", font_size=23, color=WHITE),
            Text("E_n = n^2 E_1,     P(E_n) = |c_n|^2", font_size=23, color=YELLOW),
            Text("relative phases exp[-i(E_m-E_n)t/hbar] create beats", font_size=23, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        formula.to_edge(DOWN).shift(UP * 0.08)

        colors = [BLUE, TEAL, RED]
        clock_group = VGroup()
        for index, coeff in enumerate(coeffs):
            n = index + 1
            center = RIGHT * 2.15 + UP * (1.25 - index * 0.78)
            circle = Circle(radius=0.28).move_to(center).set_stroke(GREY_B, width=1.5)
            arrow = always_redraw(
                lambda n=n, center=center, color=colors[n - 1]: Arrow(
                    center,
                    center + 0.25 * (RIGHT * math.cos(-(n * n) * time.get_value()) + UP * math.sin(-(n * n) * time.get_value())),
                    buff=0,
                    color=color,
                    stroke_width=4,
                )
            )
            label = Text(f"n={n}", font_size=22, color=colors[index]).next_to(circle, LEFT, buff=0.25)
            weight = Rectangle(width=1.35 * coeff * coeff, height=0.18).set_fill(colors[index], opacity=0.45).set_stroke(colors[index], width=1)
            weight.next_to(circle, RIGHT, buff=0.28).align_to(circle, DOWN)
            clock_group.add(circle, arrow, label, weight)

        side_title = Text("energy components keep weights,\nphases rotate at E_n / hbar", font_size=23, color=GREY_A)
        side_title.next_to(clock_group, DOWN, buff=0.35)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(axes), ShowCreation(baseline), ShowCreation(density_base), ShowCreation(walls))
        self.play(ShowCreation(real_curve), ShowCreation(density_curve), FadeIn(curve_labels))
        self.play(FadeIn(clock_group), FadeIn(side_title), FadeIn(formula[0]), FadeIn(formula[1]))
        self.play(time.animate.set_value(5.2), run_time=2.6, rate_func=linear)
        self.play(FadeIn(formula[2]))
        self.wait(0.3)


class HarmonicOscillatorScene(Scene):
    def construct(self):
        title = Text("Harmonic oscillator: ladder operators build the spectrum", font_size=32)
        title.to_edge(UP)

        axes = Axes(
            x_range=(-4, 4, 1),
            y_range=(0, 7.2, 1),
            width=7.4,
            height=4.2,
        )
        axes.shift(LEFT * 1.7 + DOWN * 0.45)

        def hermite(n, x):
            if n == 0:
                return 1
            if n == 1:
                return 2 * x
            previous = 1
            current = 2 * x
            for k in range(2, n + 1):
                previous, current = current, 2 * x * current - 2 * (k - 1) * previous
            return current

        def psi(n, x):
            norm = 1 / math.sqrt((2**n) * math.factorial(n) * math.sqrt(math.pi))
            return norm * hermite(n, x) * np.exp(-x * x / 2)

        potential = axes.get_graph(lambda x: 0.5 * x * x, x_range=(-3.7, 3.7, 0.05), color=GREY_B)
        colors = [BLUE, TEAL, RED, YELLOW]

        levels = VGroup()
        curves = VGroup()
        labels = VGroup()
        for n in range(4):
            energy = n + 0.5
            line = Line(axes.c2p(-3.2, energy), axes.c2p(3.2, energy))
            line.set_stroke(colors[n], width=2, opacity=0.45)
            levels.add(line)

            curve = axes.get_graph(
                lambda x, n=n, energy=energy: energy + 0.6 * psi(n, x),
                x_range=(-3.6, 3.6, 0.04),
                color=colors[n],
            )
            curves.add(curve)

            label = Text(f"n={n}", font_size=20, color=colors[n])
            label.next_to(line, RIGHT, buff=0.12)
            labels.add(label)

        ladder = VGroup()
        ladder_x = RIGHT * 4.0 + DOWN * 1.2
        ladder.add(Line(ladder_x + DOWN * 1.2, ladder_x + UP * 1.7).set_stroke(GREY_B, width=2))
        dots = VGroup()
        for n in range(4):
            dot = Dot(ladder_x + DOWN * 1.05 + UP * n * 0.82, color=colors[n])
            dots.add(dot)
        ladder.add(dots)
        raise_arrow = Arrow(dots[1].get_center() + LEFT * 0.52, dots[2].get_center() + LEFT * 0.52, buff=0, color=TEAL)
        lower_arrow = Arrow(dots[2].get_center() + LEFT * 0.9, dots[1].get_center() + LEFT * 0.9, buff=0, color=YELLOW)
        ladder.add(raise_arrow, lower_arrow)
        ladder_labels = VGroup(
            Text("a+", font_size=24, color=TEAL).next_to(raise_arrow, LEFT),
            Text("a", font_size=24, color=YELLOW).next_to(lower_arrow, LEFT),
            Text("E_n = hbar omega (n + 1/2)", font_size=23).next_to(dots, UP, buff=0.35),
        )

        commutator = Text("[a, a+] = 1 gives zero-point energy", font_size=25, color=BLUE)
        commutator.next_to(axes, DOWN, buff=0.35)

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(potential), LaggedStartMap(ShowCreation, levels, lag_ratio=0.08))
        self.play(LaggedStartMap(ShowCreation, curves, lag_ratio=0.16), FadeIn(labels), run_time=2)
        self.play(FadeIn(ladder), FadeIn(ladder_labels), FadeIn(commutator), run_time=1)
        self.wait(0.5)


class HydrogenRadialScene(Scene):
    def construct(self):
        title = Text("Hydrogen: radial probability and angular families", font_size=34)
        title.to_edge(UP)

        axes = Axes(
            x_range=(0, 18, 3),
            y_range=(0, 1.1, 0.25),
            width=7.2,
            height=3.7,
        )
        axes.shift(LEFT * 2.0 + DOWN * 0.35)

        def radial_probability(n, ell, r):
            if n == 1 and ell == 0:
                radial = 2 * np.exp(-r)
            elif n == 2 and ell == 0:
                radial = (2 - r) * np.exp(-r / 2) / (2 * np.sqrt(2))
            elif n == 2 and ell == 1:
                radial = r * np.exp(-r / 2) / (2 * np.sqrt(6))
            elif n == 3 and ell == 0:
                radial = (27 - 18 * r + 2 * r * r) * np.exp(-r / 3) / (81 * np.sqrt(3) / 2)
            elif n == 3 and ell == 1:
                radial = (1 - r / 6) * r * np.exp(-r / 3) * (8 / (27 * np.sqrt(6)))
            else:
                radial = r * r * np.exp(-r / 3) * (4 / (81 * np.sqrt(30)))
            return r * r * radial * radial

        states = [(1, 0, BLUE), (2, 0, TEAL), (2, 1, RED), (3, 2, YELLOW)]
        curves = VGroup()
        labels = VGroup()
        for index, (n, ell, color) in enumerate(states):
            values = [radial_probability(n, ell, r) for r in np.linspace(0, 18, 200)]
            scale = max(values) or 1
            curve = axes.get_graph(
                lambda r, n=n, ell=ell, scale=scale: radial_probability(n, ell, r) / scale,
                x_range=(0, 18, 0.12),
                color=color,
            )
            curves.add(curve)
            label = Text(f"{n}{['s', 'p', 'd'][ell]}", font_size=22, color=color)
            label.next_to(axes, RIGHT).shift(UP * (1.1 - index * 0.35))
            labels.add(label)

        s_orbital = Circle(radius=0.45).set_fill(BLUE, opacity=0.22).set_stroke(BLUE, width=2)
        p_orbital = VGroup(
            Ellipse(width=0.55, height=1.05).shift(UP * 0.42),
            Ellipse(width=0.55, height=1.05).shift(DOWN * 0.42),
        ).set_fill(TEAL, opacity=0.22).set_stroke(TEAL, width=2)
        d_orbital = VGroup()
        for angle in [PI / 4, 3 * PI / 4, 5 * PI / 4, 7 * PI / 4]:
            d_orbital.add(Ellipse(width=0.45, height=0.85).rotate(angle).shift(np.array([np.cos(angle), np.sin(angle), 0]) * 0.38))
        d_orbital.set_fill(RED, opacity=0.2).set_stroke(RED, width=2)
        orbital_group = VGroup(
            VGroup(s_orbital, Text("s", font_size=24).next_to(s_orbital, DOWN)),
            VGroup(p_orbital, Text("p", font_size=24).next_to(p_orbital, DOWN)),
            VGroup(d_orbital, Text("d", font_size=24).next_to(d_orbital, DOWN)),
        ).arrange(RIGHT, buff=0.6)
        orbital_group.to_edge(RIGHT).shift(DOWN * 0.7)

        caption = Text("P(r)=r^2 |R_nl(r)|^2", font_size=28, color=BLUE)
        caption.next_to(axes, DOWN)

        self.play(Write(title), ShowCreation(axes), FadeIn(caption), run_time=1)
        self.play(LaggedStartMap(ShowCreation, curves, lag_ratio=0.18), FadeIn(labels), run_time=2)
        self.play(FadeIn(orbital_group), run_time=1)
        self.wait(0.5)


class SphericalHarmonicsScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Spherical harmonics: angular nodes and phase winding", font_size=32, color=WHITE)
        title.to_edge(UP)

        ell = 3
        m = 1
        abs_m = abs(m)

        def associated_legendre(l_value, m_value, x):
            pmm = 1.0
            if m_value > 0:
                somx2 = math.sqrt(max(0, (1 - x) * (1 + x)))
                factor = 1.0
                for _ in range(m_value):
                    pmm *= -factor * somx2
                    factor += 2.0
            if l_value == m_value:
                return pmm
            pmmp1 = x * (2 * m_value + 1) * pmm
            if l_value == m_value + 1:
                return pmmp1
            previous = pmm
            current = pmmp1
            for ll in range(m_value + 2, l_value + 1):
                nxt = ((2 * ll - 1) * x * current - (ll + m_value - 1) * previous) / (ll - m_value)
                previous = current
                current = nxt
            return current

        center = LEFT * 3.15 + DOWN * 0.08
        radius = 1.65
        samples = []
        max_abs = 0
        for i in range(361):
            theta = TAU * i / 360
            value = associated_legendre(ell, abs_m, math.cos(theta))
            samples.append((theta, value))
            max_abs = max(max_abs, abs(value))
        max_abs = max(max_abs, 0.001)

        def point(theta, value):
            r = radius * (0.12 + 0.88 * abs(value / max_abs))
            return center + RIGHT * (r * math.sin(theta)) + UP * (r * math.cos(theta))

        sphere = Circle(radius=radius).move_to(center).set_stroke(GREY_B, width=2)
        axes = VGroup(
            Line(center + LEFT * (radius + 0.25), center + RIGHT * (radius + 0.25)).set_stroke(GREY_B, width=1.5),
            Line(center + DOWN * (radius + 0.25), center + UP * (radius + 0.25)).set_stroke(GREY_B, width=1.5),
            Text("z", font_size=22, color=GREY_A).next_to(center + UP * radius, UP),
            Text("x", font_size=22, color=GREY_A).next_to(center + RIGHT * radius, RIGHT),
        )

        positive_segments = VGroup()
        negative_segments = VGroup()
        for index in range(1, len(samples)):
            theta_a, value_a = samples[index - 1]
            theta_b, value_b = samples[index]
            segment = Line(point(theta_a, value_a), point(theta_b, value_b))
            if value_a + value_b >= 0:
                segment.set_stroke(TEAL, width=4)
                positive_segments.add(segment)
            else:
                segment.set_stroke(RED, width=4)
                negative_segments.add(segment)

        nodal_lines = VGroup()
        previous_theta, previous_value = samples[0]
        for theta, value in samples[1:181]:
            if previous_value * value < 0:
                node = 0.5 * (previous_theta + theta)
                direction = RIGHT * math.sin(node) + UP * math.cos(node)
                nodal_lines.add(DashedLine(center - direction * radius * 1.05, center + direction * radius * 1.05, dash_length=0.08).set_stroke(YELLOW, width=1.5))
            previous_theta, previous_value = theta, value

        phase_center = RIGHT * 2.15 + UP * 0.72
        phase_ring = Circle(radius=0.8).move_to(phase_center).set_stroke(GREY_B, width=2)
        phase_dots = VGroup()
        for i in range(72):
            phi = TAU * i / 72
            color = TEAL if math.sin(m * phi) >= 0 else RED
            dot = Dot(phase_center + RIGHT * (0.8 * math.cos(phi)) + UP * (0.8 * math.sin(phi)), radius=0.035, color=color)
            phase_dots.add(dot)
        phase_arrow = Arrow(phase_center, phase_center + RIGHT * 0.62, buff=0, color=BLUE)
        phase_label = Text("e^{i m phi}: one full phase winding", font_size=23, color=BLUE).next_to(phase_ring, UP, buff=0.25)

        ladder = VGroup()
        ladder_x = RIGHT * 4.4 + DOWN * 1.35
        ladder.add(Line(ladder_x + DOWN * 1.2, ladder_x + UP * 1.6).set_stroke(GREY_B, width=2))
        for mm in range(-ell, ell + 1):
            y = -1.2 + ((mm + ell) / (2 * ell)) * 2.8
            active = mm == m
            dot = Dot(ladder_x + UP * y, radius=0.08 if active else 0.05, color=YELLOW if active else GREY_B)
            label = Text(f"m={mm}", font_size=19, color=YELLOW if active else GREY_A).next_to(dot, RIGHT, buff=0.15)
            ladder.add(dot, label)
        ladder_title = Text("L_z ladder", font_size=22, color=WHITE).next_to(ladder, UP, buff=0.25)

        formulas = VGroup(
            Text("L^2 Y_l^m = hbar^2 l(l+1) Y_l^m", font_size=23, color=WHITE),
            Text("L_z Y_l^m = hbar m Y_l^m", font_size=23, color=YELLOW),
            Text("Y_l^m = N_lm P_l^|m|(cos theta) exp(i m phi)", font_size=23, color=TEAL),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        formulas.to_edge(DOWN).shift(RIGHT * 0.6)

        caption = Text("example shown: l=3, m=1; yellow lines mark polar angular nodes", font_size=23, color=GREY_A)
        caption.next_to(center + DOWN * radius, DOWN, buff=0.32)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(sphere), FadeIn(axes))
        self.play(ShowCreation(positive_segments), ShowCreation(negative_segments), ShowCreation(nodal_lines), FadeIn(caption))
        self.play(ShowCreation(phase_ring), FadeIn(phase_dots), GrowArrow(phase_arrow), FadeIn(phase_label))
        self.play(FadeIn(ladder), FadeIn(ladder_title), FadeIn(formulas))
        self.wait(0.35)


class SpinAngularMomentumScene(Scene):
    def construct(self):
        title = Text("Spin and angular momentum: projections are discrete", font_size=32)
        title.to_edge(UP)

        source = Dot(LEFT * 5.1 + DOWN * 0.1, color=YELLOW)
        incoming = Arrow(LEFT * 4.75 + DOWN * 0.1, LEFT * 2.4 + DOWN * 0.1, buff=0, color=YELLOW)

        magnet = VGroup(
            RoundedRectangle(width=1.0, height=0.62, corner_radius=0.08).shift(LEFT * 1.55 + UP * 0.4),
            RoundedRectangle(width=1.0, height=0.62, corner_radius=0.08).shift(LEFT * 1.55 + DOWN * 0.6),
        )
        magnet.set_fill(BLUE, opacity=0.12).set_stroke(BLUE, width=2)
        magnet_labels = VGroup(
            Text("N", font_size=26, color=BLUE).move_to(magnet[0]),
            Text("S", font_size=26, color=RED).move_to(magnet[1]),
        )

        up_path = VMobject().set_points_smoothly([LEFT * 1.05 + DOWN * 0.1, LEFT * 0.2 + UP * 0.25, RIGHT * 1.45 + UP * 1.45])
        down_path = VMobject().set_points_smoothly([LEFT * 1.05 + DOWN * 0.1, LEFT * 0.2 + DOWN * 0.45, RIGHT * 1.45 + DOWN * 1.65])
        up_path.set_stroke(BLUE, width=8, opacity=0.76)
        down_path.set_stroke(RED, width=4, opacity=0.46)
        screen = Line(RIGHT * 1.65 + UP * 2.0, RIGHT * 1.65 + DOWN * 2.1).set_stroke(WHITE, width=3)
        bars = VGroup(
            Rectangle(width=1.15, height=0.28).set_fill(BLUE, opacity=0.42).set_stroke(BLUE, width=2).next_to(screen, RIGHT).shift(UP * 1.45),
            Rectangle(width=0.55, height=0.28).set_fill(RED, opacity=0.32).set_stroke(RED, width=2).next_to(screen, RIGHT).shift(DOWN * 1.65),
        )
        probability_labels = VGroup(
            Text("P(+z)=cos^2(beta/2)", font_size=21, color=BLUE).next_to(bars[0], RIGHT),
            Text("P(-z)=sin^2(beta/2)", font_size=21, color=RED).next_to(bars[1], RIGHT),
        )

        bloch = Circle(radius=0.55).set_stroke(GREY_B, width=2).shift(LEFT * 4.6 + UP * 1.45)
        z_axis = Line(bloch.get_center() + DOWN * 0.55, bloch.get_center() + UP * 0.55).set_stroke(GREY_B, width=2)
        spin_arrow = Arrow(bloch.get_center(), bloch.get_center() + RIGHT * 0.35 + UP * 0.43, buff=0, color=YELLOW)
        bloch_label = Text("prepared spin", font_size=21).next_to(bloch, DOWN)

        ladder_x = RIGHT * 4.4 + DOWN * 0.15
        ladder_line = Line(ladder_x + DOWN * 1.65, ladder_x + UP * 1.65).set_stroke(GREY_B, width=2)
        m_values = [-1.5, -0.5, 0.5, 1.5]
        dots = VGroup()
        dot_labels = VGroup()
        coeffs = VGroup()
        for index, m in enumerate(m_values):
            y = -1.5 + index
            dot = Dot(ladder_x + UP * y, color=TEAL if abs(m) < 1.5 else RED)
            dots.add(dot)
            dot_labels.add(Text(f"m={m:+.1f}", font_size=20).next_to(dot, RIGHT))
            if index < len(m_values) - 1:
                coeff = math.sqrt(1.5 * 2.5 - m * (m + 1))
                arrow = Arrow(ladder_x + LEFT * 0.45 + UP * y, ladder_x + LEFT * 0.45 + UP * (y + 1), buff=0.04, color=BLUE)
                label = Text(f"{coeff:.1f}", font_size=18, color=BLUE).next_to(arrow, LEFT)
                coeffs.add(VGroup(arrow, label))
        ladder_title = Text("j=3/2 ladder", font_size=24).next_to(ladder_line, UP)
        ladder_caption = Text("J+ moves between m-values", font_size=21, color=BLUE).next_to(ladder_line, DOWN)

        algebra = Text("[J_i,J_j]=i hbar epsilon_ijk J_k", font_size=24, color=TEAL)
        algebra.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(source), GrowArrow(incoming), FadeIn(bloch), ShowCreation(z_axis), GrowArrow(spin_arrow), FadeIn(bloch_label))
        self.play(FadeIn(magnet), FadeIn(magnet_labels), ShowCreation(screen), ShowCreation(up_path), ShowCreation(down_path), run_time=1.4)
        self.play(FadeIn(bars), FadeIn(probability_labels))
        self.play(ShowCreation(ladder_line), FadeIn(dots), FadeIn(dot_labels), FadeIn(ladder_title))
        self.play(LaggedStartMap(FadeIn, coeffs, lag_ratio=0.18), FadeIn(ladder_caption), FadeIn(algebra), run_time=1.4)
        self.wait(0.5)


class SpinCouplingScene(Scene):
    def construct(self):
        title = Text("Adding spins: product states reorganize into total spin", font_size=31)
        title.to_edge(UP)

        product_title = Text("uncoupled basis", font_size=25, color=BLUE)
        product_states = VGroup(
            Text("|+->", font_size=30),
            Text("|-+>", font_size=30),
        ).arrange(DOWN, buff=0.45)
        product_group = VGroup(product_title, product_states).arrange(DOWN, buff=0.35)
        product_group.shift(LEFT * 4.1 + UP * 0.2)

        triplet_title = Text("triplet j=1", font_size=25, color=GREEN)
        triplet_states = VGroup(
            Text("|1,1> = |++>", font_size=23),
            Text("|1,0> = (|+-> + |-+>)/sqrt(2)", font_size=22),
            Text("|1,-1> = |-->", font_size=23),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        triplet_group = VGroup(triplet_title, triplet_states).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        triplet_group.shift(RIGHT * 2.25 + UP * 0.9)

        singlet_title = Text("singlet j=0", font_size=25, color=RED)
        singlet_state = Text("|0,0> = (|+-> - |-+>)/sqrt(2)", font_size=22)
        singlet_group = VGroup(singlet_title, singlet_state).arrange(DOWN, aligned_edge=LEFT, buff=0.26)
        singlet_group.shift(RIGHT * 2.25 + DOWN * 1.35)

        cg_box = RoundedRectangle(width=1.95, height=1.1, corner_radius=0.08)
        cg_box.set_fill(WHITE, opacity=0.06).set_stroke(TEAL, width=2)
        cg_text = VGroup(
            Text("CG", font_size=27, color=TEAL),
            Text("1/sqrt(2)", font_size=20),
        ).arrange(DOWN, buff=0.12).move_to(cg_box)
        cg_group = VGroup(cg_box, cg_text)

        to_cg_1 = Arrow(product_states[0].get_right() + RIGHT * 0.15, cg_box.get_left() + LEFT * 0.05, buff=0, color=YELLOW)
        to_cg_2 = Arrow(product_states[1].get_right() + RIGHT * 0.15, cg_box.get_left() + LEFT * 0.05 + DOWN * 0.18, buff=0, color=YELLOW)
        to_triplet = Arrow(cg_box.get_right() + RIGHT * 0.05, triplet_states[1].get_left() + LEFT * 0.18, buff=0, color=GREEN)
        to_singlet = Arrow(cg_box.get_right() + RIGHT * 0.05 + DOWN * 0.16, singlet_state.get_left() + LEFT * 0.18, buff=0, color=RED)

        phase = ValueTracker(0)
        origin = LEFT * 3.55 + DOWN * 2.05
        circle = Circle(radius=0.58).set_stroke(GREY_B, width=2).move_to(origin)
        real_axis = Line(origin + LEFT * 0.7, origin + RIGHT * 0.7).set_stroke(GREY_B, width=1.5)
        imag_axis = Line(origin + DOWN * 0.7, origin + UP * 0.7).set_stroke(GREY_B, width=1.5)
        blue_phasor = Arrow(origin, origin + RIGHT * 0.56, buff=0, color=BLUE)
        red_phasor = always_redraw(
            lambda: Arrow(
                origin,
                origin + np.array([0.56 * math.cos(phase.get_value()), 0.56 * math.sin(phase.get_value()), 0]),
                buff=0,
                color=RED,
            )
        )
        phasor_label = Text("relative phase decides + or - interference", font_size=21, color=YELLOW)
        phasor_label.next_to(circle, DOWN)

        caption = Text("Clebsch-Gordan coefficients are basis-change amplitudes", font_size=25, color=TEAL)
        caption.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(product_group), FadeIn(cg_group), GrowArrow(to_cg_1), GrowArrow(to_cg_2))
        self.play(GrowArrow(to_triplet), FadeIn(triplet_group), run_time=1.1)
        self.play(GrowArrow(to_singlet), FadeIn(singlet_group), run_time=1.1)
        self.play(ShowCreation(circle), ShowCreation(real_axis), ShowCreation(imag_axis), GrowArrow(blue_phasor), GrowArrow(red_phasor), FadeIn(phasor_label))
        self.play(phase.animate.set_value(PI), run_time=1.4, rate_func=linear)
        self.play(FadeIn(caption))
        self.wait(0.5)


class IdenticalParticlesScene(Scene):
    def construct(self):
        title = Text("Identical particles: amplitudes interfere under exchange", font_size=32)
        title.to_edge(UP)

        axes = Axes(
            x_range=(-4, 4, 1),
            y_range=(-0.2, 1.25, 0.5),
            width=5.4,
            height=2.45,
        )
        axes.shift(LEFT * 3.05 + DOWN * 0.15)

        separation = 1.65
        sigma = 0.82

        def orbital(x, center):
            return np.exp(-((x - center) ** 2) / (2 * sigma * sigma))

        psi_a = axes.get_graph(lambda x: orbital(x, -separation / 2), x_range=(-4, 4, 0.05), color=BLUE)
        psi_b = axes.get_graph(lambda x: orbital(x, separation / 2), x_range=(-4, 4, 0.05), color=RED)
        labels = VGroup(
            Text("psi_a", font_size=22, color=BLUE).next_to(psi_a, UP).shift(LEFT * 1.4),
            Text("psi_b", font_size=22, color=RED).next_to(psi_b, UP).shift(RIGHT * 1.4),
        )

        formula_boson = Text("Bosons:  psi_a(1)psi_b(2) + psi_b(1)psi_a(2)", font_size=23, color=BLUE)
        formula_fermion = Text("Fermions: psi_a(1)psi_b(2) - psi_b(1)psi_a(2)", font_size=23, color=RED)
        formulas = VGroup(formula_boson, formula_fermion).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        formulas.to_edge(RIGHT).shift(UP * 1.35)

        def heat_panel(sign, center, color, title_text):
            panel = VGroup()
            size = 2.4
            cells = 18
            x_min = -3.0
            x_max = 3.0
            overlap = np.exp(-(separation * separation) / (4 * sigma * sigma))
            norm = np.sqrt(max(0.04, 2 * (1 + sign * overlap * overlap)))
            values = []
            max_value = 0
            for row in range(cells):
                x2 = x_min + (row + 0.5) * (x_max - x_min) / cells
                for col in range(cells):
                    x1 = x_min + (col + 0.5) * (x_max - x_min) / cells
                    amp = (orbital(x1, -separation / 2) * orbital(x2, separation / 2) + sign * orbital(x1, separation / 2) * orbital(x2, -separation / 2)) / norm
                    value = amp * amp
                    values.append(value)
                    max_value = max(max_value, value)

            for row in range(cells):
                for col in range(cells):
                    intensity = values[row * cells + col] / max_value
                    square = Square(side_length=size / cells)
                    square.set_stroke(width=0)
                    square.set_fill(color, opacity=0.08 + 0.74 * intensity)
                    square.move_to(center + LEFT * size / 2 + DOWN * size / 2 + RIGHT * (col + 0.5) * size / cells + UP * (row + 0.5) * size / cells)
                    panel.add(square)
            border = Square(side_length=size).move_to(center).set_stroke(WHITE, width=1.5).set_fill(opacity=0)
            diagonal = Line(center + LEFT * size / 2 + DOWN * size / 2, center + RIGHT * size / 2 + UP * size / 2)
            diagonal.set_stroke(WHITE if sign > 0 else RED, width=3)
            label = Text(title_text, font_size=22, color=color).next_to(border, DOWN)
            panel.add(border, diagonal, label)
            return panel

        boson_panel = heat_panel(1, RIGHT * 1.75 + DOWN * 0.8, BLUE, "symmetric: bunching")
        fermion_panel = heat_panel(-1, RIGHT * 4.65 + DOWN * 0.8, RED, "antisymmetric: node")
        diagonal_label = Text("x1 = x2", font_size=20).next_to(VGroup(boson_panel, fermion_panel), UP)

        exchange = Text("P12 Psi = +/- Psi", font_size=28, color=TEAL)
        exchange.to_edge(DOWN)

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(psi_a), ShowCreation(psi_b), FadeIn(labels))
        self.play(FadeIn(formulas), run_time=1)
        self.play(FadeIn(boson_panel), FadeIn(fermion_panel), FadeIn(diagonal_label), run_time=1.4)
        self.play(FadeIn(exchange))
        self.wait(0.5)


class TimeIndependentPerturbationScene(Scene):
    def construct(self):
        title = Text("Time-independent perturbation: energy shifts", font_size=34)
        title.to_edge(UP)

        lambda_value = 0.08
        axes = Axes(
            x_range=(-3.0, 3.0, 1),
            y_range=(0, 6.8, 1),
            width=5.6,
            height=3.6,
        )
        axes.shift(LEFT * 2.9 + DOWN * 0.25)

        def harmonic(x):
            return 0.5 * x * x

        def perturbed(x):
            return 0.5 * x * x + lambda_value * x**4

        def shift(n):
            return 3 * lambda_value * (2 * n * n + 2 * n + 1) / 4

        harmonic_curve = axes.get_graph(harmonic, x_range=(-3.0, 3.0, 0.04), color=GREY_B)
        perturbed_curve = axes.get_graph(perturbed, x_range=(-3.0, 3.0, 0.04), color=RED)
        potential_labels = VGroup(
            Text("H0", font_size=22, color=GREY_B).next_to(harmonic_curve, LEFT),
            Text("H0 + lambda x^4", font_size=22, color=RED).next_to(perturbed_curve, RIGHT),
        )

        shifted_levels = VGroup()
        old_levels = VGroup()
        connectors = VGroup()
        for n in range(5):
            old_energy = n + 0.5
            new_energy = old_energy + shift(n)
            old_line = DashedLine(
                axes.c2p(-2.45, old_energy),
                axes.c2p(2.45, old_energy),
                dash_length=0.08,
            ).set_stroke(BLUE, width=1.5, opacity=0.45)
            new_line = Line(
                axes.c2p(-2.45, new_energy),
                axes.c2p(2.45, new_energy),
            ).set_stroke(RED if n == 3 else TEAL, width=3 if n == 3 else 1.8, opacity=0.9)
            connector = Arrow(
                axes.c2p(2.65, old_energy),
                axes.c2p(2.65, new_energy),
                buff=0.03,
                color=YELLOW,
            )
            old_levels.add(old_line)
            shifted_levels.add(new_line)
            connectors.add(connector)

        selected_label = Text("Delta E_n^(1)=<n|H'|n>", font_size=23, color=YELLOW)
        selected_label.next_to(connectors[3], RIGHT)

        ladder_axes = Axes(
            x_range=(0, 1, 1),
            y_range=(0, 6.8, 1),
            width=3.1,
            height=3.6,
        )
        ladder_axes.shift(RIGHT * 3.2 + DOWN * 0.25)
        ladder_old = VGroup()
        ladder_new = VGroup()
        for n in range(5):
            old_energy = n + 0.5
            new_energy = old_energy + shift(n)
            ladder_old.add(Line(ladder_axes.c2p(0.14, old_energy), ladder_axes.c2p(0.42, old_energy)).set_stroke(BLUE, width=2))
            ladder_new.add(Line(ladder_axes.c2p(0.58, new_energy), ladder_axes.c2p(0.86, new_energy)).set_stroke(RED, width=2))
        ladder_labels = VGroup(
            Text("E_n^(0)", font_size=22, color=BLUE).next_to(ladder_old, UP),
            Text("E_n", font_size=22, color=RED).next_to(ladder_new, UP),
            Text("higher levels shift more", font_size=21, color=YELLOW).next_to(ladder_axes, DOWN),
        )

        formula = VGroup(
            Text("H = H0 + lambda x^4", font_size=25, color=TEAL),
            Text("E_n ~= n + 1/2 + 3lambda/4 (2n^2 + 2n + 1)", font_size=23, color=GREEN),
            Text("|n> mixes with other unperturbed states at first order", font_size=22, color=WHITE),
        ).arrange(DOWN, buff=0.12)
        formula.to_edge(DOWN)

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(harmonic_curve), FadeIn(potential_labels[0]))
        self.play(ShowCreation(perturbed_curve), FadeIn(potential_labels[1]))
        self.play(LaggedStartMap(ShowCreation, old_levels, lag_ratio=0.08), run_time=1)
        self.play(LaggedStartMap(ShowCreation, shifted_levels, lag_ratio=0.08), LaggedStartMap(GrowArrow, connectors, lag_ratio=0.08), FadeIn(selected_label), run_time=1.4)
        self.play(ShowCreation(ladder_axes), FadeIn(ladder_old), FadeIn(ladder_new), FadeIn(ladder_labels))
        self.play(FadeIn(formula))
        self.wait(0.5)


class DegeneratePerturbationScene(Scene):
    def construct(self):
        title = Text("Degenerate perturbation: diagonalize the subspace", font_size=34)
        title.to_edge(UP)

        coupling = 0.55
        detuning = 0.45
        gap = np.sqrt(detuning * detuning + 4 * coupling * coupling)
        lower = -gap / 2
        upper = gap / 2

        axes = Axes(
            x_range=(-2.1, 2.1, 1),
            y_range=(-1.8, 1.8, 0.5),
            width=6.0,
            height=3.7,
        )
        axes.shift(LEFT * 2.45 + DOWN * 0.25)

        bare_a = DashedLine(axes.c2p(-2.0, -1.0), axes.c2p(2.0, 1.0), dash_length=0.08).set_stroke(GREY_B, width=2)
        bare_b = DashedLine(axes.c2p(-2.0, 1.0), axes.c2p(2.0, -1.0), dash_length=0.08).set_stroke(GREY_B, width=2)

        def upper_energy(delta):
            return np.sqrt(delta * delta + 4 * coupling * coupling) / 2

        def lower_energy(delta):
            return -np.sqrt(delta * delta + 4 * coupling * coupling) / 2

        upper_curve = axes.get_graph(upper_energy, x_range=(-2.0, 2.0, 0.04), color=RED)
        lower_curve = axes.get_graph(lower_energy, x_range=(-2.0, 2.0, 0.04), color=BLUE)
        current_line = DashedLine(axes.c2p(detuning, -1.65), axes.c2p(detuning, 1.65), dash_length=0.08).set_stroke(YELLOW, width=2)
        dots = VGroup(
            Dot(axes.c2p(detuning, upper), color=RED),
            Dot(axes.c2p(detuning, lower), color=BLUE),
        )
        gap_arrow = Arrow(axes.c2p(detuning + 0.18, lower), axes.c2p(detuning + 0.18, upper), buff=0.02, color=YELLOW)
        labels = VGroup(
            Text("bare levels cross", font_size=21, color=GREY_B).next_to(bare_a, UP),
            Text("coupling V opens an avoided crossing", font_size=21, color=RED).next_to(upper_curve, UP),
            Text("gap = 2|V| at exact degeneracy", font_size=20, color=YELLOW).next_to(gap_arrow, RIGHT),
        )

        matrix = VGroup(
            Text("Effective 2 x 2 Hamiltonian", font_size=24, color=TEAL),
            Text("[ -Delta/2    V ]", font_size=23, color=BLUE),
            Text("[    V    Delta/2 ]", font_size=23, color=RED),
            Text("Solve det(H_eff - E I)=0", font_size=22, color=GREEN),
        ).arrange(DOWN, buff=0.16)
        matrix.to_edge(RIGHT).shift(UP * 0.65)

        mix_angle = 0.5 * np.arctan2(2 * coupling, detuning)
        lower_a = np.cos(mix_angle) ** 2
        lower_b = np.sin(mix_angle) ** 2
        upper_a = np.sin(mix_angle) ** 2
        upper_b = np.cos(mix_angle) ** 2

        def composition_bar(weights, y, title_text, color):
            x0 = 3.6
            width = 2.5
            left_bar = Rectangle(width=width * weights[0], height=0.24).set_fill(BLUE, opacity=0.45).set_stroke(width=0)
            right_bar = Rectangle(width=width * weights[1], height=0.24).set_fill(RED, opacity=0.45).set_stroke(width=0)
            left_bar.move_to(RIGHT * (x0 - width / 2 + width * weights[0] / 2) + UP * y)
            right_bar.move_to(RIGHT * (x0 - width / 2 + width * weights[0] + width * weights[1] / 2) + UP * y)
            border = Rectangle(width=width, height=0.24).move_to(RIGHT * x0 + UP * y).set_fill(opacity=0).set_stroke(color, width=1.5)
            label = Text(title_text, font_size=20, color=color).next_to(border, LEFT)
            return VGroup(left_bar, right_bar, border, label)

        bars = VGroup(
            composition_bar((lower_a, lower_b), -0.55, "lower", BLUE),
            composition_bar((upper_a, upper_b), -1.05, "upper", RED),
            Text("eigenstates are mixtures of |a> and |b>", font_size=20, color=WHITE).shift(RIGHT * 3.55 + DOWN * 1.45),
        )

        formula = VGroup(
            Text("E+/- = +/- sqrt((Delta/2)^2 + V^2)", font_size=25, color=GREEN),
            Text("Ordinary denominators fail when levels are degenerate", font_size=22, color=YELLOW),
        ).arrange(DOWN, buff=0.12)
        formula.to_edge(DOWN)

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(bare_a), ShowCreation(bare_b), FadeIn(labels[0]))
        self.play(ShowCreation(upper_curve), ShowCreation(lower_curve), FadeIn(labels[1]), run_time=1.3)
        self.play(ShowCreation(current_line), FadeIn(dots), GrowArrow(gap_arrow), FadeIn(labels[2]))
        self.play(FadeIn(matrix), FadeIn(bars), run_time=1)
        self.play(FadeIn(formula))
        self.wait(0.5)


class StarkEffectScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Stark effect: electric fields mix opposite parity", font_size=32, color=WHITE)
        title.to_edge(UP)

        detuning = 0.25
        dipole = 0.85

        axes = Axes(
            x_range=(-2.0, 2.0, 1),
            y_range=(-1.8, 1.8, 0.6),
            width=5.8,
            height=3.45,
        )
        axes.shift(LEFT * 2.75 + DOWN * 0.15)

        def upper_energy(field):
            return np.sqrt((detuning / 2) ** 2 + (dipole * field) ** 2)

        def lower_energy(field):
            return -np.sqrt((detuning / 2) ** 2 + (dipole * field) ** 2)

        bare_low = DashedLine(axes.c2p(-1.95, -detuning / 2), axes.c2p(1.95, -detuning / 2), dash_length=0.08).set_stroke(GREY_B, width=2)
        bare_high = DashedLine(axes.c2p(-1.95, detuning / 2), axes.c2p(1.95, detuning / 2), dash_length=0.08).set_stroke(GREY_B, width=2)
        upper_curve = axes.get_graph(upper_energy, x_range=(-1.9, 1.9, 0.035), color=RED)
        lower_curve = axes.get_graph(lower_energy, x_range=(-1.9, 1.9, 0.035), color=BLUE)

        field_value = 0.95
        current = DashedLine(axes.c2p(field_value, -1.65), axes.c2p(field_value, 1.65), dash_length=0.08).set_stroke(YELLOW, width=2)
        dots = VGroup(
            Dot(axes.c2p(field_value, upper_energy(field_value)), color=RED),
            Dot(axes.c2p(field_value, lower_energy(field_value)), color=BLUE),
        )
        labels = VGroup(
            Text("opposite-parity states", font_size=21, color=GREY_B).next_to(bare_high, UP),
            Text("linear Stark fan when Delta -> 0", font_size=21, color=YELLOW).next_to(upper_curve, UP),
            Text("electric field E", font_size=20, color=WHITE).next_to(axes, DOWN),
        )

        atom_center = RIGHT * 3.25 + UP * 0.7
        even = Circle(radius=0.55).move_to(atom_center + LEFT * 0.35).set_fill(BLUE, opacity=0.24).set_stroke(BLUE, width=2)
        odd = VGroup(
            Ellipse(width=0.48, height=1.05).move_to(atom_center + RIGHT * 0.28 + UP * 0.2).set_fill(RED, opacity=0.22).set_stroke(RED, width=2),
            Ellipse(width=0.48, height=1.05).move_to(atom_center + RIGHT * 0.28 + DOWN * 0.2).set_fill(RED, opacity=0.22).set_stroke(RED, width=2),
        )
        field_arrow = Arrow(atom_center + RIGHT * 1.35 + DOWN * 0.95, atom_center + RIGHT * 1.35 + UP * 0.95, buff=0, color=YELLOW)
        atom_labels = VGroup(
            Text("|2s>", font_size=22, color=BLUE).next_to(even, DOWN),
            Text("|2p0>", font_size=22, color=RED).next_to(odd, DOWN),
            Text("E", font_size=23, color=YELLOW).next_to(field_arrow, UP),
        )
        atom = VGroup(even, odd, field_arrow, atom_labels)

        bars = VGroup()
        lower_mix = VGroup(
            Text("lower Stark state", font_size=20, color=BLUE),
            Rectangle(width=1.35, height=0.18).set_fill(BLUE, opacity=0.42).set_stroke(BLUE, width=1.4),
            Rectangle(width=0.85, height=0.18).set_fill(RED, opacity=0.42).set_stroke(RED, width=1.4),
        ).arrange(RIGHT, buff=0.12)
        upper_mix = VGroup(
            Text("upper Stark state", font_size=20, color=RED),
            Rectangle(width=0.85, height=0.18).set_fill(BLUE, opacity=0.42).set_stroke(BLUE, width=1.4),
            Rectangle(width=1.35, height=0.18).set_fill(RED, opacity=0.42).set_stroke(RED, width=1.4),
        ).arrange(RIGHT, buff=0.12)
        bars.add(lower_mix, upper_mix).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        bars.to_edge(RIGHT).shift(DOWN * 0.9)

        formulas = VGroup(
            Text("H' = -d dot E,   <parity eigenstate|z|same> = 0", font_size=22, color=WHITE),
            Text("H_eff = [[-Delta/2, -dE],[-dE, Delta/2]]", font_size=23, color=WHITE),
            Text("Delta=0 gives E_+/- = +/- |dE|; nondegenerate states shift quadratically.", font_size=22, color=GREEN),
        ).arrange(DOWN, buff=0.14)
        formulas.to_edge(DOWN)

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(bare_low), ShowCreation(bare_high), FadeIn(labels[0]))
        self.play(ShowCreation(upper_curve), ShowCreation(lower_curve), ShowCreation(current), FadeIn(dots), FadeIn(labels[1]), FadeIn(labels[2]))
        self.play(FadeIn(atom))
        self.play(FadeIn(bars))
        self.play(FadeIn(formulas))
        self.wait(0.5)


class VariationalMethodScene(Scene):
    def construct(self):
        title = Text("Variational method: optimize a trial family", font_size=34)
        title.to_edge(UP)

        lambda_value = 0.2
        axes = Axes(
            x_range=(-3.2, 3.2, 1),
            y_range=(0, 4.5, 1),
            width=6.4,
            height=3.8,
        )
        axes.shift(LEFT * 2.25 + DOWN * 0.35)

        def potential(x):
            return 0.5 * x * x + lambda_value * x**4

        def density(alpha, x):
            return np.sqrt(alpha / np.pi) * np.exp(-alpha * x * x)

        def trial_energy(alpha):
            return alpha / 4 + 1 / (4 * alpha) + 3 * lambda_value / (4 * alpha * alpha)

        potential_curve = axes.get_graph(potential, x_range=(-2.6, 2.6, 0.04), color=GREY_B)
        density_wide = axes.get_graph(lambda x: 3.0 * density(0.55, x), x_range=(-3.2, 3.2, 0.04), color=BLUE)
        density_tight = axes.get_graph(lambda x: 3.0 * density(1.55, x), x_range=(-3.2, 3.2, 0.04), color=RED)
        energy_wide = Line(axes.c2p(-3.0, trial_energy(0.55)), axes.c2p(3.0, trial_energy(0.55))).set_stroke(BLUE, width=2)
        energy_tight = Line(axes.c2p(-3.0, trial_energy(1.55)), axes.c2p(3.0, trial_energy(1.55))).set_stroke(RED, width=2)

        labels = VGroup(
            Text("wide trial", font_size=22, color=BLUE).next_to(energy_wide, RIGHT),
            Text("tight trial", font_size=22, color=RED).next_to(energy_tight, RIGHT),
            Text("V=x^2/2+lambda x^4", font_size=22).next_to(axes, DOWN),
        )

        energy_axes = Axes(
            x_range=(0.35, 2.2, 0.5),
            y_range=(0, 1.6, 0.4),
            width=3.5,
            height=2.6,
        )
        energy_axes.to_edge(RIGHT).shift(DOWN * 0.2)
        energy_curve = energy_axes.get_graph(trial_energy, x_range=(0.35, 2.2, 0.03), color=GREEN)
        samples = np.linspace(0.35, 2.2, 160)
        best_alpha = min(samples, key=trial_energy)
        best_dot = Dot(energy_axes.c2p(best_alpha, trial_energy(best_alpha)), color=GREEN)
        current_dot = Dot(energy_axes.c2p(1.55, trial_energy(1.55)), color=RED)
        energy_label = Text("E(alpha) is an upper bound", font_size=24, color=GREEN).next_to(energy_axes, UP)
        best_label = Text("best trial", font_size=20, color=GREEN).next_to(best_dot, DOWN)

        formula = Text("E0 <= <phi_alpha|H|phi_alpha>", font_size=28, color=TEAL)
        formula.to_edge(DOWN)

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(potential_curve), FadeIn(labels[2]))
        self.play(ShowCreation(density_wide), ShowCreation(energy_wide), FadeIn(labels[0]))
        self.play(Transform(density_wide.copy(), density_tight), Transform(energy_wide.copy(), energy_tight), FadeIn(labels[1]), run_time=1.2)
        self.play(ShowCreation(energy_axes), ShowCreation(energy_curve), FadeIn(energy_label), FadeIn(best_dot), FadeIn(current_dot), FadeIn(best_label))
        self.play(FadeIn(formula))
        self.wait(0.5)


class WKBActionScene(Scene):
    def construct(self):
        title = Text("WKB: phases accumulate between turning points", font_size=34)
        title.to_edge(UP)

        beta = 0.12
        energy = 2.7

        def potential(x):
            return 0.5 * x * x + beta * x**4

        def momentum(x):
            return np.sqrt(max(0, 2 * (energy - potential(x))))

        turning = 1.0
        while potential(turning) < energy:
            turning *= 1.08
        low = 0
        high = turning
        for _ in range(45):
            mid = 0.5 * (low + high)
            if potential(mid) < energy:
                low = mid
            else:
                high = mid
        turning = 0.5 * (low + high)

        xs = np.linspace(-turning, turning, 360)
        phase = PI / 4
        wave_points = []
        previous_x = xs[0]
        previous_p = max(momentum(previous_x + 0.001), 0.08)
        for x in xs:
            p = max(momentum(x), 0.08)
            phase += 0.5 * (previous_p + p) * (x - previous_x)
            amplitude = min(0.45, 0.18 / np.sqrt(p))
            wave_points.append((x, energy + amplitude * np.sin(phase)))
            previous_x = x
            previous_p = p

        action = 0
        for left, right in zip(xs[:-1], xs[1:]):
            mid = 0.5 * (left + right)
            action += momentum(mid) * (right - left)
        action_label_value = action / PI

        axes = Axes(
            x_range=(-3.4, 3.4, 1),
            y_range=(0, 5.8, 1),
            width=6.1,
            height=3.7,
        )
        axes.shift(LEFT * 2.35 + DOWN * 0.25)
        potential_curve = axes.get_graph(potential, x_range=(-3.15, 3.15, 0.04), color=GREY_B)
        energy_line = DashedLine(axes.c2p(-3.15, energy), axes.c2p(3.15, energy), dash_length=0.08).set_stroke(RED, width=2.5)
        turn_lines = VGroup(
            DashedLine(axes.c2p(-turning, 0), axes.c2p(-turning, energy), dash_length=0.08).set_stroke(YELLOW, width=2),
            DashedLine(axes.c2p(turning, 0), axes.c2p(turning, energy), dash_length=0.08).set_stroke(YELLOW, width=2),
        )
        allowed = Polygon(
            axes.c2p(-turning, energy),
            *[axes.c2p(x, potential(x)) for x in np.linspace(-turning, turning, 48)],
            axes.c2p(turning, energy),
        ).set_fill(TEAL, opacity=0.16).set_stroke(width=0)
        wave = VMobject()
        wave.set_points_smoothly([axes.c2p(x, y) for x, y in wave_points])
        wave.set_stroke(BLUE, width=3)

        decay_left = VMobject()
        decay_left.set_points_smoothly([
            axes.c2p(x, energy + 0.24 * np.exp(-1.8 * (-turning - x)))
            for x in np.linspace(-3.1, -turning, 70)
        ])
        decay_left.set_stroke(TEAL, width=2.5)
        decay_right = VMobject()
        decay_right.set_points_smoothly([
            axes.c2p(x, energy + 0.24 * np.exp(-1.8 * (x - turning)))
            for x in np.linspace(turning, 3.1, 70)
        ])
        decay_right.set_stroke(TEAL, width=2.5)

        labels = VGroup(
            Text("E", font_size=22, color=RED).next_to(energy_line, RIGHT),
            Text("turning points", font_size=21, color=YELLOW).next_to(turn_lines, UP),
            Text("oscillatory", font_size=22, color=BLUE).next_to(wave, UP),
            Text("evanescent tails", font_size=20, color=TEAL).next_to(decay_right, RIGHT),
        )

        action_axes = Axes(
            x_range=(0.8, 5.6, 1),
            y_range=(0, 5.8, 1),
            width=3.5,
            height=3.1,
        )
        action_axes.to_edge(RIGHT).shift(DOWN * 0.25)

        def action_over_pi(e):
            tp = 1.0
            while potential(tp) < e:
                tp *= 1.08
            lo = 0
            hi = tp
            for _ in range(30):
                md = 0.5 * (lo + hi)
                if potential(md) < e:
                    lo = md
                else:
                    hi = md
            tp = 0.5 * (lo + hi)
            grid = np.linspace(-tp, tp, 220)
            total = 0
            for a, b in zip(grid[:-1], grid[1:]):
                mid = 0.5 * (a + b)
                total += np.sqrt(max(0, 2 * (e - potential(mid)))) * (b - a)
            return total / PI

        action_curve = action_axes.get_graph(action_over_pi, x_range=(0.8, 5.6, 0.05), color=GREEN)
        quant_lines = VGroup()
        for n in range(5):
            quant_lines.add(
                DashedLine(action_axes.c2p(0.8, n + 0.5), action_axes.c2p(5.6, n + 0.5), dash_length=0.07).set_stroke(RED, width=1.3, opacity=0.45)
            )
        action_dot = Dot(action_axes.c2p(energy, action_label_value), color=YELLOW)
        action_labels = VGroup(
            Text("S(E)/pi", font_size=22, color=GREEN).next_to(action_axes, UP),
            Text("n + 1/2", font_size=20, color=RED).next_to(quant_lines, RIGHT),
            Text(f"current S/pi = {action_label_value:.2f}", font_size=20, color=YELLOW).next_to(action_dot, DOWN),
        )

        formula = VGroup(
            Text("psi ~ 1/sqrt(p) exp(+/- i integral p dx / hbar)", font_size=23, color=TEAL),
            Text("bound states: integral p dx = (n + 1/2) pi hbar", font_size=24, color=GREEN),
        ).arrange(DOWN, buff=0.12)
        formula.to_edge(DOWN)

        self.play(Write(title), ShowCreation(axes), run_time=1)
        self.play(ShowCreation(potential_curve), ShowCreation(energy_line), FadeIn(labels[0]))
        self.play(FadeIn(allowed), ShowCreation(turn_lines), FadeIn(labels[1]))
        self.play(ShowCreation(wave), ShowCreation(decay_left), ShowCreation(decay_right), FadeIn(labels[2]), FadeIn(labels[3]), run_time=1.5)
        self.play(ShowCreation(action_axes), ShowCreation(action_curve), FadeIn(quant_lines), FadeIn(action_dot), FadeIn(action_labels), run_time=1.5)
        self.play(FadeIn(formula))
        self.wait(0.5)


class ScatteringBornScene(Scene):
    def construct(self):
        title = Text("Scattering: angular probability from an amplitude", font_size=34)
        title.to_edge(UP)

        target = Dot(LEFT * 2.7 + DOWN * 0.1, color=RED)
        incoming = VGroup()
        for y in [-0.5, -0.25, 0, 0.25, 0.5]:
            incoming.add(Arrow(LEFT * 5.8 + UP * y + DOWN * 0.1, LEFT * 3.0 + UP * (0.28 * y) + DOWN * 0.1, buff=0, color=YELLOW))

        arcs = VGroup()
        for radius, opacity in [(0.9, 0.25), (1.4, 0.35), (1.9, 0.45), (2.4, 0.55)]:
            arc = Arc(radius=radius, start_angle=-0.72, angle=1.44)
            arc.move_arc_center_to(target.get_center())
            arc.set_stroke(BLUE, width=4, opacity=opacity)
            arcs.add(arc)
        forward = Arrow(target.get_center(), target.get_center() + RIGHT * 2.85, buff=0.05, color=BLUE)
        side = Arrow(target.get_center(), target.get_center() + RIGHT * 1.6 + UP * 1.2, buff=0.05, color=TEAL)
        back = Arrow(target.get_center(), target.get_center() + LEFT * 0.95 + UP * 0.8, buff=0.05, color=RED)
        labels = VGroup(
            Text("incoming plane wave", font_size=22, color=YELLOW).next_to(incoming, UP),
            Text("target", font_size=22, color=RED).next_to(target, DOWN),
            Text("forward peak", font_size=22, color=BLUE).next_to(forward, RIGHT),
        )

        axes = Axes(
            x_range=(0, PI, PI / 2),
            y_range=(0, 1.1, 0.5),
            width=4.2,
            height=2.7,
        )
        axes.to_edge(RIGHT).shift(DOWN * 0.35)
        k = 1.0
        mu = 0.65

        def cross_section(theta):
            q = 2 * k * np.sin(theta / 2)
            return (mu * mu / (q * q + mu * mu)) ** 2

        curve = axes.get_graph(cross_section, x_range=(0, PI, 0.03), color=GREEN)
        plot_label = Text("d sigma / d Omega = |f(theta)|^2", font_size=22, color=GREEN).next_to(axes, UP)
        angle_label = Text("theta", font_size=20).next_to(axes, DOWN)

        formula = Text("Born: f(theta) is the Fourier transform of V(r)", font_size=26, color=TEAL)
        formula.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(target), LaggedStartMap(GrowArrow, incoming, lag_ratio=0.08), FadeIn(labels[0]), FadeIn(labels[1]))
        self.play(LaggedStartMap(ShowCreation, arcs, lag_ratio=0.12), GrowArrow(forward), GrowArrow(side), GrowArrow(back), FadeIn(labels[2]), run_time=1.6)
        self.play(ShowCreation(axes), ShowCreation(curve), FadeIn(plot_label), FadeIn(angle_label))
        self.play(FadeIn(formula))
        self.wait(0.5)


class RutherfordScatteringScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Rutherford scattering: Coulomb fields make a forward singularity", font_size=31, color=WHITE)
        title.to_edge(UP)

        center = LEFT * 3.55 + DOWN * 0.15
        max_radius = 1.65
        rings = VGroup(*[
            Circle(radius=max_radius * scale).move_to(center).set_stroke(GREY_B, width=1.2, opacity=0.38)
            for scale in [0.3, 0.6, 0.9]
        ])
        axes = VGroup(
            Line(center + LEFT * (max_radius + 0.18), center + RIGHT * (max_radius + 0.18)).set_stroke(GREY_B, width=1.4),
            Line(center + DOWN * (max_radius + 0.18), center + UP * (max_radius + 0.18)).set_stroke(GREY_B, width=1.4),
        )
        nucleus = Dot(center, color=RED, radius=0.09)

        strength = 0.85
        energy = 1.15

        def rutherford(theta):
            return (strength / (4 * energy)) ** 2 / max(np.sin(theta / 2), 0.035) ** 4

        min_theta = 0.14
        max_cross = rutherford(min_theta)
        angles = np.linspace(0, TAU, 300)
        polar = VMobject()
        polar.set_points_smoothly([
            center + RIGHT * (np.cos(angle) * (0.18 + max_radius * np.sqrt(rutherford(max(min_theta, np.arccos(np.cos(angle)))) / max_cross))) +
            UP * (np.sin(angle) * (0.18 + max_radius * np.sqrt(rutherford(max(min_theta, np.arccos(np.cos(angle)))) / max_cross)))
            for angle in angles
        ])
        polar.set_stroke(BLUE, width=3)
        polar.set_fill(BLUE, opacity=0.15)

        incoming = VGroup(*[
            Arrow(LEFT * 6.0 + UP * y + DOWN * 0.15, LEFT * 4.0 + UP * (0.28 * y) + DOWN * 0.15, buff=0, color=YELLOW)
            for y in [-0.55, -0.28, 0, 0.28, 0.55]
        ])
        selected = Arrow(center, center + RIGHT * 1.35 + UP * 1.0, buff=0.05, color=RED)
        traj = VMobject()
        traj.set_points_smoothly([
            LEFT * 5.5 + DOWN * 0.85,
            LEFT * 4.35 + DOWN * 0.78,
            LEFT * 3.45 + DOWN * 0.48,
            LEFT * 2.55 + UP * 0.55,
            LEFT * 2.0 + UP * 1.15,
        ])
        traj.set_stroke(TEAL, width=3)
        labels = VGroup(
            Text("incoming alpha beam", font_size=21, color=YELLOW).next_to(incoming, UP),
            Text("Coulomb center", font_size=21, color=RED).next_to(nucleus, DOWN),
            Text("forward peak", font_size=22, color=BLUE).next_to(center + RIGHT * max_radius, RIGHT),
            Text("impact parameter b sets theta", font_size=20, color=TEAL).next_to(traj, DOWN),
        )

        plot_axes = Axes(
            x_range=(0.14, PI, 0.8),
            y_range=(-3.5, np.log10(max_cross), 1),
            width=4.25,
            height=2.55,
        )
        plot_axes.to_edge(RIGHT).shift(UP * 0.45)

        def log_cross(theta):
            return np.log10(rutherford(theta))

        curve = plot_axes.get_graph(log_cross, x_range=(0.14, PI, 0.02), color=GREEN)
        plot_label = Text("log10(d sigma / d Omega)", font_size=21, color=GREEN).next_to(plot_axes, UP)

        formulas = VGroup(
            Text("V(r)=kappa/r,    eta = m kappa/(hbar^2 k)", font_size=22, color=WHITE),
            Text("d sigma/d Omega = (kappa/4E)^2 csc^4(theta/2)", font_size=24, color=YELLOW),
            Text("The Coulomb phase changes f(theta), not the Rutherford angular law.", font_size=22, color=GREEN),
        ).arrange(DOWN, buff=0.14)
        formulas.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(rings), ShowCreation(axes), FadeIn(nucleus))
        self.play(LaggedStartMap(GrowArrow, incoming, lag_ratio=0.08), FadeIn(labels[0]), FadeIn(labels[1]))
        self.play(ShowCreation(polar), GrowArrow(selected), ShowCreation(traj), FadeIn(labels[2]), FadeIn(labels[3]), run_time=1.4)
        self.play(ShowCreation(plot_axes), ShowCreation(curve), FadeIn(plot_label))
        self.play(FadeIn(formulas))
        self.wait(0.5)


class PartialWaveScatteringScene(Scene):
    def construct(self):
        title = Text("Partial waves: phase shifts set the cross section", font_size=34)
        title.to_edge(UP)

        phases = [1.25, 0.55, 0.24]

        def legendre(level, x):
            if level == 0:
                return 1
            if level == 1:
                return x
            return 0.5 * (3 * x * x - 1)

        def amplitude(theta):
            x = np.cos(theta)
            real = 0
            imag = 0
            for level, phase in enumerate(phases):
                weight = (2 * level + 1) * legendre(level, x)
                real += weight * np.sin(phase) * np.cos(phase)
                imag += weight * np.sin(phase) ** 2
            return real * real + imag * imag

        angles = np.linspace(0, TAU, 240)
        values = [amplitude(np.arccos(np.cos(angle))) for angle in angles]
        max_value = max(values)
        center = LEFT * 3.55 + DOWN * 0.25
        max_radius = 1.65
        polar = VMobject()
        polar.set_points_smoothly([
            center + RIGHT * (np.cos(angle) * (0.18 + max_radius * np.sqrt(value / max_value))) +
            UP * (np.sin(angle) * (0.18 + max_radius * np.sqrt(value / max_value)))
            for angle, value in zip(angles, values)
        ])
        polar.set_stroke(BLUE, width=3)
        polar.set_fill(BLUE, opacity=0.16)

        circles = VGroup(*[
            Circle(radius=max_radius * scale).move_to(center).set_stroke(GREY_B, width=1, opacity=0.35)
            for scale in [0.25, 0.5, 0.75, 1.0]
        ])
        incoming = Arrow(center + LEFT * 3.0, center + LEFT * 1.85, buff=0.05, color=YELLOW)
        forward = Text("forward", font_size=20).next_to(center + RIGHT * max_radius, RIGHT)
        pattern_label = Text("differential pattern", font_size=22, color=BLUE).next_to(polar, DOWN)

        axes = Axes(
            x_range=(0, PI, PI / 2),
            y_range=(0, max_value * 1.08, max_value / 3),
            width=4.25,
            height=2.65,
        )
        axes.to_edge(RIGHT).shift(UP * 0.45)
        curve = axes.get_graph(amplitude, x_range=(0, PI, 0.03), color=GREEN)
        curve_label = Text("d sigma / d Omega = |f(theta)|^2", font_size=21, color=GREEN).next_to(axes, UP)

        channels = VGroup()
        for level, phase in enumerate(phases):
            contribution = (2 * level + 1) * np.sin(phase) ** 2
            bar = Rectangle(width=0.36 + 0.42 * contribution, height=0.18)
            bar.set_fill([BLUE, RED, TEAL][level], opacity=0.45).set_stroke([BLUE, RED, TEAL][level], width=1.4)
            label = Text(f"ell={level}: sin^2(delta)={np.sin(phase) ** 2:.2f}", font_size=20, color=[BLUE, RED, TEAL][level])
            row = VGroup(label, bar).arrange(RIGHT, buff=0.2)
            channels.add(row)
        channels.arrange(DOWN, buff=0.18).to_edge(RIGHT).shift(DOWN * 1.45)

        sigma_total = 4 * PI * sum((2 * level + 1) * np.sin(phase) ** 2 for level, phase in enumerate(phases))
        formula = VGroup(
            Text("f(theta)=1/k sum (2ell+1)e^{i delta_l} sin(delta_l) P_l(cos theta)", font_size=22, color=TEAL),
            Text(f"sigma_tot = 4pi/k^2 sum (2ell+1)sin^2(delta_l) = {sigma_total:.1f}/k^2", font_size=22, color=GREEN),
        ).arrange(DOWN, buff=0.12)
        formula.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(circles), GrowArrow(incoming), FadeIn(forward))
        self.play(ShowCreation(polar), FadeIn(pattern_label), run_time=1.2)
        self.play(ShowCreation(axes), ShowCreation(curve), FadeIn(curve_label))
        self.play(FadeIn(channels))
        self.play(FadeIn(formula))
        self.wait(0.5)


class OpticalTheoremScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Optical theorem: forward scattering counts all loss", font_size=32, color=WHITE)
        title.to_edge(UP)

        phases = [1.18, 0.63, 0.18]
        eta = 0.86
        colors = [BLUE, RED, TEAL]

        def legendre(level, x):
            if level == 0:
                return 1
            if level == 1:
                return x
            return 0.5 * (3 * x * x - 1)

        def amplitude(theta):
            x = np.cos(theta)
            real = 0
            imag = 0
            for level, phase in enumerate(phases):
                weight = (2 * level + 1) * legendre(level, x)
                s_real_minus_one = eta * np.cos(2 * phase) - 1
                s_imag = eta * np.sin(2 * phase)
                real += 0.5 * weight * s_imag
                imag += -0.5 * weight * s_real_minus_one
            return real, imag

        sigma_total = 2 * PI * sum((2 * level + 1) * (1 - eta * np.cos(2 * phase)) for level, phase in enumerate(phases))
        sigma_elastic = PI * sum((2 * level + 1) * (1 - 2 * eta * np.cos(2 * phase) + eta ** 2) for level, phase in enumerate(phases))
        sigma_abs = PI * sum((2 * level + 1) * (1 - eta ** 2) for level in range(len(phases)))
        forward_imag = amplitude(0)[1]

        center = LEFT * 3.8 + DOWN * 0.1
        radius = 1.45
        argand = VGroup(
            Circle(radius=radius).move_to(center).set_stroke(GREY_B, width=2),
            Line(center + LEFT * (radius + 0.18), center + RIGHT * (radius + 0.18)).set_stroke(GREY_B, width=1.5),
            Line(center + DOWN * (radius + 0.18), center + UP * (radius + 0.18)).set_stroke(GREY_B, width=1.5),
        )
        s_vectors = VGroup()
        for level, phase in enumerate(phases):
            endpoint = center + RIGHT * (eta * np.cos(2 * phase) * radius) + UP * (eta * np.sin(2 * phase) * radius)
            vector = Arrow(center, endpoint, buff=0, color=colors[level])
            label = Text(f"S_{level}", font_size=22, color=WHITE).next_to(endpoint, RIGHT)
            s_vectors.add(vector, Dot(endpoint, color=colors[level], radius=0.055), label)
        argand_label = Text("partial-wave S_l plane", font_size=22, color=WHITE).next_to(argand, DOWN)

        axes = Axes(
            x_range=(0, PI, PI / 2),
            y_range=(0, 13, 4),
            width=4.2,
            height=2.25,
        )
        axes.to_edge(RIGHT).shift(UP * 0.72)

        def elastic_pattern(theta):
            real, imag = amplitude(theta)
            return real * real + imag * imag

        curve = axes.get_graph(elastic_pattern, x_range=(0, PI, 0.03), color=GREEN)
        curve_label = Text("elastic d sigma / d Omega", font_size=21, color=GREEN).next_to(axes, UP)

        bars = VGroup()
        bar_data = [
            ("4pi Im f(0)", 4 * PI * forward_imag, YELLOW),
            ("sigma elastic", sigma_elastic, BLUE),
            ("sigma absorbed", sigma_abs, RED),
        ]
        max_bar = max(value for _, value, _ in bar_data)
        for label_text, value, color in bar_data:
            bar = Rectangle(width=3.1 * value / max_bar, height=0.22)
            bar.set_fill(color, opacity=0.42).set_stroke(color, width=1.5)
            label = Text(f"{label_text}: {value:.1f}", font_size=20, color=WHITE)
            row = VGroup(label, bar).arrange(RIGHT, buff=0.22)
            bars.add(row)
        bars.arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        bars.to_edge(RIGHT).shift(DOWN * 1.35)

        formulas = VGroup(
            Text("f(theta)=1/(2ik) sum (2l+1)(S_l-1)P_l(cos theta)", font_size=21, color=WHITE),
            Text("sigma_tot = (4pi/k) Im f(0)", font_size=24, color=YELLOW),
            Text(f"sigma_el + sigma_abs = {sigma_elastic + sigma_abs:.1f},  optical total = {sigma_total:.1f}", font_size=22, color=GREEN),
        ).arrange(DOWN, buff=0.14)
        formulas.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(argand), FadeIn(argand_label))
        self.play(LaggedStartMap(GrowArrow, VGroup(*[s_vectors[i] for i in range(0, len(s_vectors), 3)]), lag_ratio=0.1))
        self.play(FadeIn(VGroup(*[s_vectors[i] for i in range(len(s_vectors)) if i % 3 != 0])))
        self.play(ShowCreation(axes), ShowCreation(curve), FadeIn(curve_label))
        self.play(FadeIn(bars))
        self.play(FadeIn(formulas))
        self.wait(0.5)


class RabiTransitionsScene(Scene):
    def construct(self):
        title = Text("Time-dependent perturbations drive transitions", font_size=34)
        title.to_edge(UP)

        level_x = LEFT * 4.1
        ground = Line(level_x + LEFT * 0.8 + DOWN * 1.45, level_x + RIGHT * 0.8 + DOWN * 1.45).set_stroke(BLUE, width=4)
        excited = Line(level_x + LEFT * 0.8 + UP * 1.35, level_x + RIGHT * 0.8 + UP * 1.35).set_stroke(RED, width=4)
        detuned = DashedLine(
            level_x + LEFT * 1.05 + UP * 1.0,
            level_x + RIGHT * 1.05 + UP * 1.0,
            dash_length=0.08,
        ).set_stroke(YELLOW, width=2)
        drive = Arrow(level_x + DOWN * 1.2, level_x + UP * 1.08, buff=0.05, color=TEAL)
        level_labels = VGroup(
            Text("|g>", font_size=26, color=BLUE).next_to(ground, LEFT),
            Text("|e>", font_size=26, color=RED).next_to(excited, LEFT),
            Text("drive", font_size=22, color=TEAL).next_to(drive, RIGHT),
            Text("detuning", font_size=20, color=YELLOW).next_to(detuned, RIGHT),
        )

        axes = Axes(
            x_range=(0, 18, 3),
            y_range=(0, 1.05, 0.25),
            width=6.2,
            height=3.3,
        )
        axes.shift(RIGHT * 1.75 + DOWN * 0.25)
        omega = 0.72
        detuning = 0.35
        rabi = np.sqrt(omega * omega + detuning * detuning)

        def probability(time):
            return (omega * omega / (rabi * rabi)) * np.sin(rabi * time / 2) ** 2

        curve = axes.get_graph(probability, x_range=(0, 18, 0.05), color=RED)
        max_line = DashedLine(
            axes.c2p(0, omega * omega / (rabi * rabi)),
            axes.c2p(18, omega * omega / (rabi * rabi)),
            dash_length=0.08,
        ).set_stroke(RED, width=2, opacity=0.45)
        plot_labels = VGroup(
            Text("P_e(t)", font_size=24, color=RED).next_to(axes, UP),
            Text("off resonance caps the amplitude", font_size=21, color=YELLOW).next_to(max_line, UP),
        )

        formula = Text("Pe(t) = Omega^2/Omega_R^2 sin^2(Omega_R t/2)", font_size=26, color=TEAL)
        golden = Text("Fermi golden rule: Gamma = 2pi/hbar |<f|H'|i>|^2 rho(Ef)", font_size=22, color=GREEN)
        VGroup(formula, golden).arrange(DOWN, buff=0.18).to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(ground), ShowCreation(excited), FadeIn(level_labels[0]), FadeIn(level_labels[1]))
        self.play(GrowArrow(drive), ShowCreation(detuned), FadeIn(level_labels[2]), FadeIn(level_labels[3]))
        self.play(ShowCreation(axes), ShowCreation(curve), ShowCreation(max_line), FadeIn(plot_labels), run_time=1.5)
        self.play(FadeIn(formula), FadeIn(golden))
        self.wait(0.5)


class SelectionRulesScene(Scene):
    def construct(self):
        title = Text("Selection rules: symmetry can make a transition dark", font_size=32)
        title.to_edge(UP)

        initial = VGroup(
            Text("initial", font_size=24, color=BLUE),
            Text("|n, ell=1, m=0>", font_size=28),
            Text("parity = -1", font_size=22),
        ).arrange(DOWN, buff=0.18)
        initial.shift(LEFT * 4.2 + UP * 0.8)

        dipole = VGroup(
            RoundedRectangle(width=2.0, height=1.12, corner_radius=0.08).set_fill(WHITE, opacity=0.06).set_stroke(YELLOW, width=2),
            Text("dipole", font_size=25, color=YELLOW).shift(UP * 0.22),
            Text("rank 1, q=0", font_size=21, color=TEAL).shift(DOWN * 0.15),
            Text("odd parity", font_size=19, color=RED).shift(DOWN * 0.43),
        )
        dipole.move_to(ORIGIN + UP * 0.65)

        final_allowed = VGroup(
            Text("allowed", font_size=24, color=GREEN),
            Text("|n', ell'=0, m'=0>", font_size=24),
            Text("Delta ell=-1, Delta m=0", font_size=20),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        final_allowed.shift(RIGHT * 3.35 + UP * 1.25)

        final_allowed_2 = VGroup(
            Text("allowed", font_size=24, color=GREEN),
            Text("|n', ell'=2, m'=0>", font_size=24),
            Text("Delta ell=+1, Delta m=0", font_size=20),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        final_allowed_2.shift(RIGHT * 3.35 + DOWN * 0.25)

        forbidden = VGroup(
            Text("forbidden", font_size=24, color=RED),
            Text("|n', ell'=1, m'=0>", font_size=24),
            Text("same parity: angular integral vanishes", font_size=19),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        forbidden.shift(RIGHT * 2.9 + DOWN * 1.65)

        arrows = VGroup(
            Arrow(initial.get_right() + RIGHT * 0.1, dipole.get_left() + LEFT * 0.1, buff=0, color=YELLOW),
            Arrow(dipole.get_right() + RIGHT * 0.1, final_allowed.get_left() + LEFT * 0.1, buff=0, color=GREEN),
            Arrow(dipole.get_right() + RIGHT * 0.1, final_allowed_2.get_left() + LEFT * 0.1, buff=0, color=GREEN),
            Arrow(dipole.get_bottom() + DOWN * 0.1, forbidden.get_left() + LEFT * 0.1, buff=0, color=RED),
        )

        matrix = VGroup(
            Text("<f|d_q|i> ~ integral Y*_{ell'm'} Y^q_1 Y_{ell m} dOmega", font_size=22, color=TEAL),
            Text("nonzero only if Delta ell=+-1, Delta m=q, parity flips", font_size=24, color=GREEN),
            Text("A resonant drive still gives no transition when the matrix element is zero.", font_size=22, color=YELLOW),
        ).arrange(DOWN, buff=0.14)
        matrix.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(FadeIn(initial), FadeIn(dipole), GrowArrow(arrows[0]))
        self.play(GrowArrow(arrows[1]), FadeIn(final_allowed))
        self.play(GrowArrow(arrows[2]), FadeIn(final_allowed_2))
        self.play(GrowArrow(arrows[3]), FadeIn(forbidden))
        self.play(FadeIn(matrix))
        self.wait(0.5)


class FineStructureZeemanScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Fine structure and Zeeman splitting lift degeneracy", font_size=32, color=WHITE)
        title.to_edge(UP)

        n = 3
        ell = 1
        b_field = 5.5
        alpha = 1 / 137.036
        mu_b = 5.7883818e-5

        def fs_shift(j):
            bohr = -13.6057 / (n * n)
            return bohr * ((alpha * alpha) / (n * n)) * (n / (j + 0.5) - 0.75) * 1e6

        def lande_g(j):
            s = 0.5
            return 1 + (j * (j + 1) + s * (s + 1) - ell * (ell + 1)) / (2 * j * (j + 1))

        levels = []
        for j in [0.5, 1.5]:
            two_j = int(round(2 * j))
            for two_m in range(-two_j, two_j + 1, 2):
                m_j = two_m / 2
                levels.append((j, two_m, fs_shift(j) + mu_b * lande_g(j) * m_j * b_field * 1e6))

        shifts = [shift for _, _, shift in levels] + [fs_shift(0.5), fs_shift(1.5), 0]
        min_shift = min(shifts) - 90
        max_shift = max(shifts) + 90

        def y_for_shift(shift):
            return -2.0 + 3.7 * (shift - min_shift) / (max_shift - min_shift)

        bohr_line = Line(LEFT * 5.35 + UP * y_for_shift(0), LEFT * 0.7 + UP * y_for_shift(0))
        bohr_line.set_stroke(GREY_B, width=2)
        bohr_label = Text("Bohr n=3 energy", font_size=20, color=WHITE)
        bohr_label.move_to(LEFT * 4.85 + UP * (y_for_shift(0) + 0.42))

        fine_group = VGroup()
        for j, color in [(0.5, TEAL), (1.5, YELLOW)]:
            y = y_for_shift(fs_shift(j))
            line = Line(LEFT * 5.1 + UP * y, LEFT * 2.75 + UP * y).set_stroke(color, width=4)
            fine_group.add(line)

        fan_group = VGroup()
        selected = None
        for j, two_m, total_shift in levels:
            color = RED if j == 1.5 and two_m == 1 else BLUE
            width = 4 if color == RED else 2
            start = LEFT * 2.6 + UP * y_for_shift(fs_shift(j))
            kink = LEFT * 1.55 + UP * y_for_shift(total_shift)
            end = RIGHT * 0.7 + UP * y_for_shift(total_shift)
            line = VMobject().set_points_as_corners([start, kink, end]).set_stroke(color, width=width)
            fan_group.add(line)
            if color == RED:
                selected = VGroup(
                    Dot(end, color=RED, radius=0.07),
                    Text("selected m_j=1/2", font_size=21, color=WHITE).next_to(end, RIGHT),
                )

        captions = VGroup(
            Text("spin-orbit coupling", font_size=20, color=WHITE).shift(LEFT * 4.15 + UP * 2.1),
            Text("weak magnetic field", font_size=20, color=WHITE).shift(LEFT * 1.55 + UP * 2.1),
            Text("Zeeman sublevels", font_size=20, color=WHITE).shift(RIGHT * 1.0 + UP * 2.1),
        )

        center = RIGHT * 3.4 + DOWN * 0.35
        axis = Arrow(center + DOWN * 1.2, center + UP * 1.35, buff=0, color=YELLOW)
        vector_l = Arrow(center, center + LEFT * 0.85 + UP * 0.85, buff=0, color=BLUE)
        vector_s = Arrow(center, center + RIGHT * 0.68 + UP * 0.25, buff=0, color=RED)
        vector_j = Arrow(center, center + RIGHT * 0.25 + UP * 1.2, buff=0, color=GREEN)
        vector_labels = VGroup(
            Text("B", font_size=22, color=WHITE).next_to(axis, UP),
            Text("L", font_size=22, color=WHITE).next_to(vector_l, LEFT),
            Text("S", font_size=22, color=WHITE).next_to(vector_s, RIGHT),
            Text("J", font_size=22, color=WHITE).next_to(vector_j, RIGHT),
        )
        vectors = VGroup(axis, vector_l, vector_s, vector_j, vector_labels)

        formulas = VGroup(
            Text("E_nj = E_n^0 [1 + alpha^2/n^2 (n/(j+1/2) - 3/4)]", font_size=22, color=WHITE),
            Text("Delta E_Z = mu_B g_j m_j B,    m_j = -j,...,j", font_size=23, color=WHITE),
            Text("Fine structure splits j; the Zeeman effect resolves m_j.", font_size=23, color=WHITE),
        ).arrange(DOWN, buff=0.15)
        formulas.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(bohr_line), FadeIn(bohr_label))
        self.play(FadeIn(captions[0]), FadeIn(fine_group))
        self.play(FadeIn(captions[1]), ShowCreation(fan_group), FadeIn(captions[2]), FadeIn(selected))
        self.play(GrowArrow(axis), GrowArrow(vector_l), GrowArrow(vector_s), GrowArrow(vector_j), FadeIn(vector_labels))
        self.play(FadeIn(formulas))
        self.wait(0.5)


class HyperfineCouplingScene(Scene):
    def construct(self):
        background = Rectangle(width=20, height=12).set_fill(GREY_E, opacity=1).set_stroke(GREY_E, opacity=0)
        self.add(background)

        title = Text("Hyperfine coupling splits total F multiplets", font_size=32, color=WHITE)
        title.to_edge(UP)

        i_spin = 0.5
        j_spin = 0.5
        a_mhz = 1420.0
        b_gauss = 8.0
        mu_b_over_h = 1.3996246

        def hyperfine_energy(f_value):
            return (a_mhz / 2) * (f_value * (f_value + 1) - i_spin * (i_spin + 1) - j_spin * (j_spin + 1))

        def g_f(f_value):
            if f_value == 0:
                return 0
            f2 = f_value * (f_value + 1)
            j2 = j_spin * (j_spin + 1)
            i2 = i_spin * (i_spin + 1)
            return 2.0023 * (f2 + j2 - i2) / (2 * f2)

        levels = []
        for f_value in [0, 1]:
            two_f = int(round(2 * f_value))
            for two_m in range(-two_f, two_f + 1, 2):
                m_f = two_m / 2
                levels.append((f_value, two_m, hyperfine_energy(f_value) + mu_b_over_h * g_f(f_value) * m_f * b_gauss))

        shifts = [shift for _, _, shift in levels] + [hyperfine_energy(0), hyperfine_energy(1), 0]
        min_shift = min(shifts) - 170
        max_shift = max(shifts) + 170

        def y_for_shift(shift):
            return -2.05 + 3.85 * (shift - min_shift) / (max_shift - min_shift)

        unsplit = Line(LEFT * 5.2 + UP * y_for_shift(0), LEFT * 0.8 + UP * y_for_shift(0))
        unsplit.set_stroke(GREY_B, width=2)
        unsplit_label = Text("unperturbed J=1/2 level", font_size=20, color=WHITE).move_to(LEFT * 4.45 + UP * (y_for_shift(0) + 0.36))

        split_group = VGroup()
        for f_value, color in [(0, TEAL), (1, YELLOW)]:
            y = y_for_shift(hyperfine_energy(f_value))
            line = Line(LEFT * 5.0 + UP * y, LEFT * 2.7 + UP * y).set_stroke(color, width=4)
            label = Text(f"F={f_value:g}", font_size=22, color=WHITE).next_to(line, LEFT)
            split_group.add(line, label)

        fan_group = VGroup()
        selected = None
        for f_value, two_m, total_shift in levels:
            color = RED if f_value == 1 and two_m == 0 else BLUE
            width = 4 if color == RED else 2
            start = LEFT * 2.52 + UP * y_for_shift(hyperfine_energy(f_value))
            kink = LEFT * 1.45 + UP * y_for_shift(total_shift)
            end = RIGHT * 0.95 + UP * y_for_shift(total_shift)
            line = VMobject().set_points_as_corners([start, kink, end]).set_stroke(color, width=width)
            fan_group.add(line)
            if color == RED:
                selected = VGroup(
                    Dot(end, color=RED, radius=0.07),
                    Text("selected m_F=0", font_size=21, color=WHITE).next_to(end, RIGHT),
                )

        captions = VGroup(
            Text("I couples to J", font_size=20, color=WHITE).shift(LEFT * 4.1 + UP * 2.1),
            Text("F multiplets", font_size=20, color=WHITE).shift(LEFT * 1.4 + UP * 2.1),
            Text("weak-field m_F fan", font_size=20, color=WHITE).shift(RIGHT * 1.0 + UP * 2.1),
        )

        center = RIGHT * 3.55 + DOWN * 0.28
        vector_i = Arrow(center, center + LEFT * 0.82 + UP * 0.78, buff=0, color=BLUE)
        vector_j = Arrow(center, center + RIGHT * 0.72 + UP * 0.18, buff=0, color=RED)
        vector_f = Arrow(center, center + RIGHT * 0.18 + UP * 1.18, buff=0, color=GREEN)
        vector_labels = VGroup(
            Text("I", font_size=22, color=WHITE).next_to(vector_i, LEFT),
            Text("J", font_size=22, color=WHITE).next_to(vector_j, RIGHT),
            Text("F", font_size=22, color=WHITE).next_to(vector_f, RIGHT),
            Text("F = I + J", font_size=22, color=WHITE).next_to(vector_f, UP),
        )
        vectors = VGroup(vector_i, vector_j, vector_f, vector_labels)

        formulas = VGroup(
            Text("H_hf = A I dot J = A/2 (F^2 - I^2 - J^2)", font_size=23, color=WHITE),
            Text("E_F/h = A/2 [F(F+1)-I(I+1)-J(J+1)]", font_size=23, color=WHITE),
            Text("Hydrogen ground state: F=1 to F=0 gives the 1420 MHz, 21 cm line.", font_size=22, color=WHITE),
        ).arrange(DOWN, buff=0.15)
        formulas.to_edge(DOWN)

        self.play(Write(title), run_time=1)
        self.play(ShowCreation(unsplit), FadeIn(unsplit_label))
        self.play(FadeIn(captions[0]), FadeIn(split_group))
        self.play(FadeIn(captions[1]), ShowCreation(fan_group), FadeIn(captions[2]), FadeIn(selected))
        self.play(GrowArrow(vector_i), GrowArrow(vector_j), GrowArrow(vector_f), FadeIn(vector_labels))
        self.play(FadeIn(formulas))
        self.wait(0.5)


class AdiabaticBerryScene(Scene):
    def construct(self):
        title = Text("Adiabatic following adds a geometric phase", font_size=32)
        title.to_edge(UP)

        center = LEFT * 3.35 + DOWN * 0.05
        radius = 1.65
        sphere = VGroup(
            Circle(radius=radius).move_to(center).set_stroke(GREY_B, width=2),
            Ellipse(width=2 * radius, height=0.62 * radius).move_to(center).set_stroke(GREY_B, width=1.5),
            Line(center + DOWN * radius, center + UP * radius).set_stroke(GREY_B, width=1.5),
        )

        cone_angle = 0.86
        path_y = center[1] - math.cos(cone_angle) * radius * 0.72
        path = Ellipse(width=2 * radius * math.sin(cone_angle), height=0.58 * radius * math.sin(cone_angle))
        path.move_to(np.array([center[0], path_y, 0]))
        path.set_stroke(YELLOW, width=3)

        phase = ValueTracker(0)

        def endpoint(offset=0):
            phi = phase.get_value() - offset
            return center + RIGHT * (math.sin(cone_angle) * math.cos(phi) * radius) + UP * (
                math.cos(cone_angle) * radius + math.sin(cone_angle) * math.sin(phi) * radius * 0.29
            )

        field_arrow = always_redraw(lambda: Arrow(center, endpoint(0), buff=0, color=YELLOW))
        state_arrow = always_redraw(lambda: Arrow(center, endpoint(0.34) * 0.95 + center * 0.05, buff=0, color=BLUE))
        labels = VGroup(
            Text("B(t)", font_size=22, color=YELLOW).next_to(path, RIGHT),
            Text("state follows instantaneous eigenvector", font_size=22, color=BLUE).next_to(sphere, DOWN),
        )

        axes = Axes(
            x_range=(0, 1, 0.5),
            y_range=(0, 1.05, 0.25),
            width=4.7,
            height=2.65,
        )
        axes.shift(RIGHT * 2.55 + UP * 0.6)
        good_bar = Rectangle(width=3.6, height=0.24).set_fill(GREEN, opacity=0.35).set_stroke(GREEN, width=2)
        bad_bar = Rectangle(width=0.55, height=0.24).set_fill(RED, opacity=0.35).set_stroke(RED, width=2)
        good_bar.move_to(axes.c2p(0.42, 0.75))
        bad_bar.move_to(axes.c2p(0.1, 0.28))
        bar_labels = VGroup(
            Text("adiabatic following", font_size=22, color=GREEN).next_to(good_bar, LEFT),
            Text("jump probability", font_size=22, color=RED).next_to(bad_bar, LEFT),
        )

        solid_angle = 2 * PI * (1 - math.cos(cone_angle))
        formulas = VGroup(
            Text("|psi(t)> approx exp(i theta_n) exp(i gamma_n) |n(t)>", font_size=22, color=TEAL),
            Text("|<m|Hdot|n>| / (E_m-E_n)^2 << 1", font_size=23, color=GREEN),
            Text(f"spin-1/2 Berry phase: gamma_- = -Omega_s/2 = {-solid_angle / 2:.2f} rad", font_size=22, color=YELLOW),
        ).arrange(DOWN, buff=0.16)
        formulas.to_edge(DOWN)

        self.play(Write(title), ShowCreation(sphere), ShowCreation(path), run_time=1)
        self.play(GrowArrow(field_arrow), GrowArrow(state_arrow), FadeIn(labels))
        self.play(ShowCreation(axes), FadeIn(good_bar), FadeIn(bad_bar), FadeIn(bar_labels))
        self.play(phase.animate.set_value(TAU), run_time=2.2, rate_func=linear)
        self.play(FadeIn(formulas))
        self.wait(0.5)
