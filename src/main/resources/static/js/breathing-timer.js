(function (global) {
    "use strict";

    class BreathingTimer {
        constructor(options) {
            this.steps = options.steps.filter(step => step.durationMs > 0);
            this.cycleCount = options.cycleCount;
            this.clock = options.clock || (() => performance.now());
            this.schedule = options.schedule || (callback => requestAnimationFrame(callback));
            this.cancel = options.cancel || (id => cancelAnimationFrame(id));
            this.onRender = options.onRender || (() => {});
            this.onTransition = options.onTransition || (() => {});
            this.cycleDurationMs = this.steps.reduce((sum, step) => sum + step.durationMs, 0);
            this.totalDurationMs = this.cycleDurationMs * this.cycleCount;
            this.state = "ready";
            this.elapsedMs = 0;
            this.startedAt = 0;
            this.frameId = null;
            this.lastPhaseKey = null;
            this.render();
        }

        start() {
            if (this.state === "running") return;
            if (this.state === "completed") this.reset();
            this.startedAt = this.clock();
            this.state = "running";
            this.update(this.startedAt);
        }

        pause() {
            if (this.state !== "running") return;
            this.updateElapsed(this.clock());
            this.stopFrame();
            this.state = "paused";
            this.render();
        }

        reset() {
            this.stopFrame();
            this.state = "ready";
            this.elapsedMs = 0;
            this.lastPhaseKey = null;
            this.render();
        }

        update(now) {
            if (this.state !== "running") return;
            this.updateElapsed(now);
            if (this.elapsedMs >= this.totalDurationMs) {
                this.elapsedMs = this.totalDurationMs;
                this.state = "completed";
                this.stopFrame();
                this.render();
                return;
            }
            this.render();
            this.frameId = this.schedule(timestamp => this.update(timestamp));
        }

        updateElapsed(now) {
            this.elapsedMs = Math.min(this.totalDurationMs,
                this.elapsedMs + Math.max(0, now - this.startedAt));
            this.startedAt = now;
        }

        position() {
            if (this.state === "completed") {
                return { cycle: this.cycleCount, step: this.steps[this.steps.length - 1], remainingMs: 0, progress: 1 };
            }
            const cycle = Math.floor(this.elapsedMs / this.cycleDurationMs) + 1;
            let withinCycle = this.elapsedMs % this.cycleDurationMs;
            for (const step of this.steps) {
                if (withinCycle < step.durationMs) {
                    return { cycle, step, remainingMs: step.durationMs - withinCycle, progress: withinCycle / step.durationMs };
                }
                withinCycle -= step.durationMs;
            }
            return { cycle, step: this.steps[0], remainingMs: this.steps[0].durationMs, progress: 0 };
        }

        render() {
            let view;
            if (this.state === "ready") {
                view = { state: this.state, phase: "準備", cycle: 0, totalCycles: this.cycleCount,
                    remainingSeconds: null, scale: 1, color: "#4a90e2" };
            } else if (this.state === "completed") {
                view = { state: this.state, phase: "完了 🎉", cycle: this.cycleCount, totalCycles: this.cycleCount,
                    remainingSeconds: null, scale: 1, color: "#4a90e2" };
            } else {
                const position = this.position();
                const phaseKey = `${position.cycle}:${position.step.name}`;
                if (this.lastPhaseKey !== null && this.lastPhaseKey !== phaseKey) this.onTransition();
                this.lastPhaseKey = phaseKey;
                const scale = position.step.fromScale +
                    (position.step.toScale - position.step.fromScale) * position.progress;
                view = { state: this.state,
                    phase: this.state === "paused" ? `一時停止中（${position.step.name}）` : position.step.name,
                    cycle: position.cycle, totalCycles: this.cycleCount,
                    remainingSeconds: Math.max(0, Math.ceil(position.remainingMs / 1000)),
                    scale, color: position.step.color };
            }
            this.onRender(view);
        }

        stopFrame() {
            if (this.frameId !== null) this.cancel(this.frameId);
            this.frameId = null;
        }
    }

    function initialize() {
        const root = document.getElementById("timerApp");
        if (!root) return;
        const circle = document.getElementById("breathingCircle");
        const phase = document.getElementById("phase");
        const time = document.getElementById("time");
        const cycle = document.getElementById("cycle");
        const start = document.getElementById("startBtn");
        const pause = document.getElementById("pauseBtn");
        const soundButton = document.getElementById("soundBtn");
        const sound = new Audio(root.dataset.soundUrl);
        let muted = false;
        const timer = new BreathingTimer({
            cycleCount: Number(root.dataset.cycleCount),
            steps: [
                { name: "吸う", durationMs: Number(root.dataset.inhaleSeconds) * 1000, fromScale: 1, toScale: 1.5, color: "#4a90e2" },
                { name: "止める", durationMs: Number(root.dataset.holdSeconds) * 1000, fromScale: 1.5, toScale: 1.5, color: "#f5a623" },
                { name: "吐く", durationMs: Number(root.dataset.exhaleSeconds) * 1000, fromScale: 1.5, toScale: 1, color: "#7ed321" }
            ],
            onTransition: () => {
                if (muted) return;
                sound.currentTime = 0;
                sound.play().catch(() => {});
            },
            onRender: view => {
                phase.textContent = view.phase;
                time.textContent = view.remainingSeconds === null ? "" : view.remainingSeconds;
                cycle.textContent = view.cycle === 0 ? "サイクル: 0" : `サイクル: ${view.cycle} / ${view.totalCycles}`;
                circle.style.transform = `scale(${view.scale})`;
                circle.style.backgroundColor = view.color;
                start.textContent = { ready: "スタート", running: "実行中", paused: "再開", completed: "もう一度" }[view.state];
                start.disabled = view.state === "running";
                pause.disabled = view.state !== "running";
            }
        });
        start.addEventListener("click", () => timer.start());
        pause.addEventListener("click", () => timer.pause());
        document.getElementById("resetBtn").addEventListener("click", () => timer.reset());
        soundButton.addEventListener("click", () => {
            muted = !muted;
            soundButton.textContent = muted ? "音: オフ" : "音: オン";
            soundButton.setAttribute("aria-pressed", String(muted));
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) timer.pause();
        });
    }

    global.BreathingTimer = BreathingTimer;
    if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", initialize);
})(typeof globalThis !== "undefined" ? globalThis : this);
