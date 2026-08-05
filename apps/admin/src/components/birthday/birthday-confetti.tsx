"use client";

import { cn } from "@workspace/config";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { CONFETTI_COLORS } from "./birthday-config";

const MAX_PARTICLES = 700;
const FRAME_MS = 1000 / 60;
const GRAVITY = 0.14;
const DRAG = 0.99;

export interface BirthdayConfettiHandle {
    /** Fire a small radial pop at viewport coordinates (px). */
    burst: (x: number, y: number) => void;
    /** Fire the full celebration: a center pop plus two side cannons. */
    volley: () => void;
}

interface BirthdayConfettiProps {
    ref?: Ref<BirthdayConfettiHandle>;
    /** Fires a volley shortly after mount. Defaults to true. */
    autoFire?: boolean;
    className?: string;
}

export function BirthdayConfetti({
    ref,
    autoFire = true,
    className,
}: BirthdayConfettiProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<ConfettiEngine | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = createConfettiEngine(canvas);
        engineRef.current = engine;

        let timeoutId: number | undefined;
        if (autoFire) timeoutId = window.setTimeout(() => engine.volley(), 450);

        return () => {
            if (timeoutId !== undefined) window.clearTimeout(timeoutId);
            engine.destroy();
            engineRef.current = null;
        };
    }, [autoFire]);

    useImperativeHandle(
        ref,
        () => ({
            burst: (x: number, y: number) => engineRef.current?.burst(x, y),
            volley: () => engineRef.current?.volley(),
        }),
        []
    );

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-0 size-full",
                className
            )}
        />
    );
}

interface ConfettiParticle {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    size: number;
    color: string;
    shape: "rect" | "circle" | "ribbon";
    rotation: number;
    rotationSpeed: number;
    wobble: number;
    wobbleSpeed: number;
}

interface SpawnOptions {
    x: number;
    y: number;
    count: number;
    /** Launch direction in radians (canvas coordinates, y grows downward). */
    angle: number;
    /** Spread around the launch direction, in radians. */
    spread: number;
    power: number;
}

type ConfettiEngine = ReturnType<typeof createConfettiEngine>;

function createConfettiEngine(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    const particles: ConfettiParticle[] = [];
    const timeouts: number[] = [];
    let frame: number | null = null;
    let lastTick = 0;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const tick = (time: number) => {
        if (!context) return;

        const delta = Math.min((time - lastTick) / FRAME_MS, 3);
        lastTick = time;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        context.clearRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            if (!particle) continue;

            particle.velocityY += GRAVITY * delta;
            particle.velocityX *= DRAG;
            particle.wobble += particle.wobbleSpeed * delta;
            particle.rotation += particle.rotationSpeed * delta;
            particle.x +=
                particle.velocityX * delta + Math.sin(particle.wobble) * 0.6;
            particle.y += particle.velocityY * delta;

            if (particle.y > height + 40) {
                particles.splice(i, 1);
                continue;
            }

            context.save();
            context.translate(particle.x, particle.y);
            context.rotate(particle.rotation);
            context.fillStyle = particle.color;

            if (particle.shape === "circle") {
                context.beginPath();
                context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                context.fill();
            } else if (particle.shape === "ribbon") {
                context.fillRect(
                    -particle.size * 0.15,
                    -particle.size,
                    particle.size * 0.3,
                    particle.size * 2
                );
            } else {
                // Flat strips flutter by squashing along one axis
                context.scale(1, Math.sin(particle.wobble));
                context.fillRect(
                    -particle.size / 2,
                    -particle.size * 0.35,
                    particle.size,
                    particle.size * 0.7
                );
            }

            context.restore();
        }

        if (particles.length > 0) {
            frame = requestAnimationFrame(tick);
        } else {
            frame = null;
        }
    };

    const ensureLoop = () => {
        if (frame !== null) return;
        lastTick = performance.now();
        frame = requestAnimationFrame(tick);
    };

    const spawn = ({ x, y, count, angle, spread, power }: SpawnOptions) => {
        if (prefersReducedMotion.matches) return;

        for (let i = 0; i < count; i++) {
            if (particles.length >= MAX_PARTICLES) particles.shift();

            const direction = angle + (Math.random() - 0.5) * spread;
            const speed = power * (0.4 + Math.random() * 0.6);
            const shapeRoll = Math.random();

            particles.push({
                x,
                y,
                velocityX: Math.cos(direction) * speed,
                velocityY: Math.sin(direction) * speed,
                size: 5 + Math.random() * 6,
                color:
                    CONFETTI_COLORS[
                        Math.floor(Math.random() * CONFETTI_COLORS.length)
                    ] ?? "#fbbf24",
                shape:
                    shapeRoll < 0.55
                        ? "rect"
                        : shapeRoll < 0.85
                          ? "circle"
                          : "ribbon",
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.25,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.08 + Math.random() * 0.12,
            });
        }

        ensureLoop();
    };

    const burst = (x: number, y: number) => {
        spawn({
            x,
            y,
            count: 45,
            angle: -Math.PI / 2,
            spread: Math.PI * 2,
            power: 6,
        });
    };

    const volley = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        spawn({
            x: width * 0.5,
            y: height * 0.4,
            count: 90,
            angle: -Math.PI / 2,
            spread: Math.PI * 2,
            power: 8,
        });
        timeouts.push(
            window.setTimeout(() => {
                spawn({
                    x: 0,
                    y: height * 0.9,
                    count: 70,
                    angle: (-70 * Math.PI) / 180,
                    spread: Math.PI / 5,
                    power: 16,
                });
            }, 180)
        );
        timeouts.push(
            window.setTimeout(() => {
                spawn({
                    x: width,
                    y: height * 0.9,
                    count: 70,
                    angle: (-110 * Math.PI) / 180,
                    spread: Math.PI / 5,
                    power: 16,
                });
            }, 320)
        );
    };

    const destroy = () => {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        timeouts.forEach((id) => window.clearTimeout(id));
        particles.length = 0;
        window.removeEventListener("resize", resize);
    };

    resize();
    window.addEventListener("resize", resize);

    return { burst, volley, destroy };
}
