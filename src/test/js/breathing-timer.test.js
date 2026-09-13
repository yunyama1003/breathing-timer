const test = require("node:test");
const assert = require("node:assert/strict");

require("../../main/resources/static/js/breathing-timer.js");
const BreathingTimer = globalThis.BreathingTimer;

function fixture(holdMs = 0) {
    let now = 0;
    let callback = null;
    let latest = null;
    let transitions = 0;
    const timer = new BreathingTimer({
        cycleCount: 1,
        steps: [
            { name: "吸う", durationMs: 1000, fromScale: 1, toScale: 1.5, color: "blue" },
            { name: "止める", durationMs: holdMs, fromScale: 1.5, toScale: 1.5, color: "orange" },
            { name: "吐く", durationMs: 1000, fromScale: 1.5, toScale: 1, color: "green" }
        ],
        clock: () => now,
        schedule: next => { callback = next; return 1; },
        cancel: () => { callback = null; },
        onRender: view => { latest = view; },
        onTransition: () => { transitions += 1; }
    });
    return {
        timer,
        view: () => latest,
        transitions: () => transitions,
        elapse(ms) { now += ms; },
        advance(ms) { now += ms; const next = callback; callback = null; next(now); }
    };
}

test("skips a zero-second hold and completes in two seconds", () => {
    const f = fixture(0);
    f.timer.start();
    f.advance(1000);
    assert.equal(f.view().phase, "吐く");
    assert.equal(f.transitions(), 1);
    f.advance(1000);
    assert.equal(f.view().state, "completed");
});

test("uses actual elapsed time after a delayed update", () => {
    const f = fixture(1000);
    f.timer.start();
    f.advance(2500);
    assert.equal(f.view().phase, "吐く");
    assert.equal(f.view().remainingSeconds, 1);
});

test("pause excludes time spent paused and resume continues precisely", () => {
    const f = fixture(0);
    f.timer.start();
    f.advance(400);
    f.timer.pause();
    assert.equal(f.view().state, "paused");
    f.elapse(10000);
    f.timer.start();
    f.advance(599);
    assert.equal(f.view().phase, "吸う");
    f.advance(1);
    assert.equal(f.view().phase, "吐く");
});

test("pause at the end completes instead of wrapping to an extra cycle", () => {
    const f = fixture(0);
    f.timer.start();
    f.elapse(2500);
    f.timer.pause();
    assert.equal(f.view().state, "completed");
    assert.equal(f.view().cycle, 1);
});

test("reset and completed restart return to the first phase", () => {
    const f = fixture(0);
    f.timer.start();
    f.advance(2000);
    assert.equal(f.view().state, "completed");
    f.timer.start();
    assert.equal(f.view().phase, "吸う");
    f.timer.reset();
    assert.equal(f.view().state, "ready");
    assert.equal(f.view().cycle, 0);
});
