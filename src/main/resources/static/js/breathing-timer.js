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
            this.onComplete = options.onComplete || (() => {});
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
            if (this.elapsedMs >= this.totalDurationMs) this.complete();
            else { this.state = "paused"; this.render(); }
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
                this.complete();
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

        complete() {
            if (this.state === "completed") return;
            this.elapsedMs = this.totalDurationMs;
            this.state = "completed";
            this.stopFrame();
            this.render();
            this.onComplete();
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

    class ScreenWakeLock {
        constructor(onUnavailable = () => {}, wakeLock = global.navigator?.wakeLock,
                    isVisible = () => !global.document?.hidden) {
            this.onUnavailable = onUnavailable;
            this.wakeLock = wakeLock;
            this.isVisible = isVisible;
            this.wanted = false;
            this.sentinel = null;
            this.requesting = false;
            this.generation = 0;
            this.retries = 0;
        }

        setRunning(running) {
            if (this.wanted === running) return;
            this.wanted = running;
            this.generation++;
            if (running) {
                this.retries = 0;
                this.acquire(this.generation);
            } else if (this.sentinel) {
                const sentinel = this.sentinel;
                this.sentinel = null;
                sentinel.release().catch(() => {});
            }
        }

        async acquire(generation) {
            if (!this.wanted || !this.isVisible() || this.sentinel || this.requesting) return;
            if (!this.wakeLock?.request) { this.onUnavailable(); return; }
            this.requesting = true;
            let sentinel;
            try { sentinel = await this.wakeLock.request("screen"); }
            catch { if (this.wanted && generation === this.generation) this.onUnavailable(); }
            finally { this.requesting = false; }
            if (!sentinel) {
                if (this.wanted && generation !== this.generation) this.acquire(this.generation);
                return;
            }
            if (!this.wanted || generation !== this.generation || !this.isVisible()) {
                sentinel.release().catch(() => {});
                if (this.wanted && generation !== this.generation) this.acquire(this.generation);
                return;
            }
            this.sentinel = sentinel;
            sentinel.addEventListener("release", () => {
                if (this.sentinel !== sentinel) return;
                this.sentinel = null;
                if (this.wanted && this.isVisible() && this.retries++ < 1) this.acquire(this.generation);
                else if (this.wanted && this.isVisible()) this.onUnavailable();
            });
        }
    }

    function playCompletionTone(context) {
        if (!context || context.state !== "running") return;
        for (const [frequency, delay] of [[523, 0], [784, 0.2]]) {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, context.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.05, context.currentTime + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + delay + 0.32);
            oscillator.start(context.currentTime + delay);
            oscillator.stop(context.currentTime + delay + 0.33);
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
        let audioContext;
        const wakeLock = new ScreenWakeLock(() => {
            document.getElementById("wakeLockStatus").textContent = "画面の点灯維持を利用できません。画面を開いたままにしてください。";
        });
        function unlockCompletionAudio() {
            try {
                const AudioContext = global.AudioContext || global.webkitAudioContext;
                if (!muted && AudioContext) {
                    audioContext ||= new AudioContext();
                    audioContext.resume().catch(() => {});
                }
            } catch { /* 音が使えなくてもタイマーは動作する */ }
        }
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
            onComplete: () => {
                if (muted) return;
                try { playCompletionTone(audioContext); } catch { /* 音声失敗は完了を妨げない */ }
            },
            onRender: view => {
                wakeLock.setRunning(view.state === "running");
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
        start.addEventListener("click", () => {
            document.getElementById("wakeLockStatus").textContent = "";
            unlockCompletionAudio();
            timer.start();
        });
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
        global.addEventListener("pagehide", () => timer.pause());
    }

    global.BreathingTimer = BreathingTimer;
    global.ScreenWakeLock = ScreenWakeLock;
    global.playCompletionTone = playCompletionTone;
    if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", initialize);
})(typeof globalThis !== "undefined" ? globalThis : this);
