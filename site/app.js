'use strict';
const $ = id => document.getElementById(id);
const form = $('settings');
let presets = [], timer, muted = false, audioContext, lastView;
const message = text => { $('message').textContent = text; };
function readForm() {
  const value = { name: $('name').value };
  for (const key of ['inhale', 'hold', 'exhale', 'cycles']) value[key] = $(''+key).value === '' ? NaN : Number($(key).value);
  return PresetStorage.validate(value);
}
function beep() {
  if (muted || !audioContext || audioContext.state !== 'running') return;
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
  oscillator.connect(gain); gain.connect(audioContext.destination);
  oscillator.frequency.value = 660;
  gain.gain.setValueAtTime(0.06, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.22);
  oscillator.start(); oscillator.stop(audioContext.currentTime + 0.23);
}
function unlockAudio() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!muted && Audio) { audioContext ||= new Audio(); audioContext.resume().catch(() => {}); }
  } catch { /* 音が使えなくてもタイマーは動作する */ }
}
function render(view) {
  if (lastView?.phase !== view.phase) $('phase').textContent = view.phase;
  $('seconds').textContent = view.remainingSeconds ?? '—';
  $('cycle').textContent = view.cycle ? `${view.cycle} / ${view.totalCycles} 回` : '準備ができたら、スタート';
  $('orb').style.transform = `scale(${view.scale})`;
  $('orb').style.backgroundColor = view.color;
  $('start').textContent = { ready: 'スタート', running: '実行中', paused: '再開', completed: 'もう一度' }[view.state];
  $('start').disabled = view.state === 'running';
  $('pause').disabled = view.state !== 'running';
  const locked = ['running', 'paused'].includes(view.state);
  $('fields').disabled = locked;
  document.querySelectorAll('[data-use]').forEach(button => { button.disabled = locked; });
  lastView = view;
}
function configure() {
  const config = readForm();
  timer?.reset();
  $('chosen').textContent = config.name;
  timer = new BreathingTimer({ cycleCount: config.cycles,
    steps: [
      { name: '吸う', durationMs: config.inhale * 1000, fromScale: 1, toScale: 1.5, color: '#9ab9a7' },
      { name: '止める', durationMs: config.hold * 1000, fromScale: 1.5, toScale: 1.5, color: '#d8be8b' },
      { name: '吐く', durationMs: config.exhale * 1000, fromScale: 1.5, toScale: 1, color: '#abc3c0' }
    ], onRender: render, onTransition: beep });
}
function writePresets(next) {
  if (next.length > 100) throw new Error('保存できる設定は100件までです。');
  try { localStorage.setItem(PresetStorage.KEY, PresetStorage.encode(next)); }
  catch { throw new Error('端末への保存ができません。ブラウザの保存設定・空き容量を確認してください。'); }
  presets = next;
  renderPresets();
}
function renderPresets() {
  $('presets').replaceChildren();
  if (!presets.length) { $('presets').textContent = 'まだ設定がありません。好きなリズムを保存しましょう。'; return; }
  presets.forEach((preset, index) => {
    const row = document.createElement('div'); row.className = 'preset';
    const description = document.createElement('div'), title = document.createElement('strong'), detail = document.createElement('small');
    title.textContent = preset.name;
    detail.textContent = `吸う ${preset.inhale} · 止める ${preset.hold} · 吐く ${preset.exhale} 秒 / ${preset.cycles}回`;
    description.append(title, detail);
    const actions = document.createElement('div'); actions.className = 'preset-actions';
    const use = document.createElement('button'); use.type = 'button'; use.textContent = '使う'; use.dataset.use = '';
    use.disabled = ['running', 'paused'].includes(timer?.state);
    use.addEventListener('click', () => {
      for (const key of Object.keys(preset)) $(key).value = preset[key];
      configure(); updateDuration(); message(`「${preset.name}」を選びました。`);
      $('start').focus();
    });
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete'; remove.textContent = '削除';
    remove.setAttribute('aria-label', `${preset.name}を削除`);
    remove.addEventListener('click', () => {
      if (!confirm(`「${preset.name}」を削除しますか？`)) return;
      try { writePresets(presets.filter((_, i) => i !== index)); message('設定を削除しました。'); } catch (error) { message(error.message); }
    });
    actions.append(use, remove); row.append(description, actions); $('presets').append(row);
  });
}
function updateDuration() {
  try { const p = readForm(), seconds = (p.inhale + p.hold + p.exhale) * p.cycles; $('duration').textContent = `合計 ${Math.floor(seconds / 60)}分${seconds % 60}秒`; }
  catch { $('duration').textContent = '秒数と回数を確認してください。'; }
}
form.addEventListener('input', updateDuration);
form.addEventListener('submit', event => {
  event.preventDefault();
  try { const preset = readForm(); writePresets([preset, ...presets]); configure(); message('この端末に保存しました。'); }
  catch (error) { message(error.message); }
});
$('start').addEventListener('click', () => {
  try {
    if (timer?.state !== 'paused') { if (!form.reportValidity()) return; configure(); }
    unlockAudio(); timer.start();
  } catch (error) { message(error.message); }
});
$('pause').addEventListener('click', () => timer.pause());
$('reset').addEventListener('click', () => timer.reset());
$('sound').addEventListener('click', () => {
  muted = !muted; $('sound').textContent = muted ? '音：オフ' : '音：オン'; $('sound').setAttribute('aria-pressed', String(muted)); unlockAudio();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) timer.pause(); });
window.addEventListener('pagehide', () => timer.pause());
$('export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([PresetStorage.encode(presets)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'breathing-backup.json'; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('import').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 100000) throw new Error('バックアップは100KB以下にしてください。');
    const imported = PresetStorage.parse(await file.text());
    writePresets([...imported, ...presets]); message(`${imported.length}件を追加しました。`);
  } catch (error) { message(`読み込めませんでした。${error.message}`); }
  event.target.value = '';
});
try { const saved = localStorage.getItem(PresetStorage.KEY); if (saved) presets = PresetStorage.parse(saved); }
catch { message('保存済みの設定を読み込めません。バックアップを読み込むか、設定を入力して使用してください。'); }
renderPresets(); configure(); updateDuration();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready)
    .then(() => { $('offline').textContent = 'オフライン利用の準備ができました。この端末では通信なしでも開けます（保存データ・キャッシュが残っている間）。'; })
    .catch(() => { $('offline').textContent = 'オフラインの準備ができませんでした。オンラインで再読み込みしてください。'; });
} else { $('offline').textContent = 'このブラウザではオンラインでご利用ください。'; }
