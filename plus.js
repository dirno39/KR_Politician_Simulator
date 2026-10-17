// 이번 생은 정치다 — 변화·미니게임·연혁·배포 마감
// content.js 뒤에 로드한다.

/* ───────── 설정 ───────── */
const OPT_KEY = 'jc_sim_opts_v1';
const OPTS = Object.assign({ fx: true, vib: true, mini: true }, (() => { try { return JSON.parse(localStorage.getItem(OPT_KEY)) || {}; } catch (e) { return {}; } })());
const VERSION = '2.0.0';

/* ───────── 정국 화두: 매 턴 바뀌는 보너스 ───────── */
const THEMES = [
  { id: 'minseng', icon: '🍚', name: '민생', desc: '지역과 현장을 챙기는 활동의 효과 +50%', ids: ['ground', 'petition', 'field', 'volunteer', 'report', 'freebus', 'hearing', 'handshake', 'housing', 'festival2', 'talk'] },
  { id: 'media', icon: '📡', name: '여론전', desc: '방송과 SNS 활동의 효과 +50%', ids: ['panel', 'sns', 'podcast', 'question', 'variety', 'channel', 'mc', 'docu', 'promo', 'press', 'street', 'column', 'interview', 'townpres'] },
  { id: 'party', icon: '🏛️', name: '당내 정치', desc: '당무와 세력 다지기의 효과 +50%', ids: ['partywork', 'campjoin', 'attack', 'floor', 'caucus', 'special_pros', 'school', 'recruit', 'walkout', 'mentor_staff', 'reshuffle', 'meet'] },
  { id: 'policy', icon: '📐', name: '정책 경쟁', desc: '공부와 입법, 정책 추진의 효과 +50%', ids: ['study', 'bill', 'thinktank', 'sniper', 'pledge', 'invest', 'austerity', 'ag_econ', 'ag_wel', 'ag_ref', 'ag_sec', 'diplomacy', 'summit', 'deal', 'audit', 'cabinet', 'labor'] },
  { id: 'money', icon: '💸', name: '후원 시즌', desc: '자금을 모으는 활동의 효과 +50%', ids: ['book', 'fund', 'lecture', 'ad', 'budget'] },
  { id: 'quiet', icon: '🍃', name: '숨 고르기', desc: '정국이 조용하다. 휴식의 효과 +50%', ids: ['rest'] },
];
function theme() { return THEMES.find((t) => t.id === S.theme); }
function themeHit(id) { const t = theme(); return !!t && t.ids.includes(id); }
function themeBanner() {
  const t = theme(); if (!t) return '';
  return `<p class="theme"><i>${t.icon}</i><span><b>이번 반기 화두 · ${t.name}</b><small>${t.desc}</small></span></p>`;
}
function homeTip() {
  if (S.turn > 2) return '';
  return `<p class="tip">${S.turn === 1 ? '아래 일정 중 <b>2개</b>를 고르고 <b>진행</b>을 누르세요. 금색 <b>기회</b> 카드와 <b>화두</b> 표시가 붙은 일정은 이번 반기에만 유리합니다.' : '일정은 반기마다 바뀝니다. 다음 선거까지 인지도·지역 기반·당내 입지를 쌓아 두세요.'}</p>`;
}

/* ───────── 추가 행동 ───────── */
const miniMul = (score) => 0.4 + (score / 100) * 1.2;
ACTIONS.push(
  sp({ id: 'street', icon: '📢', roles: ['none', 'mp'], mini: 'timing', name: '거리 연설', desc: '미니게임 · 인지도 +, 화술 성장',
    run(score) { mod('fame', 4 * miniMul(score)); grow('spk', 1); return score >= 75 ? '퇴근길 광장을 멈춰 세웠다. 박수가 터져 나왔다.' : score >= 40 ? '마이크를 잡고 30분을 외쳤다. 몇몇이 걸음을 멈췄다.' : '목소리가 갈라졌고 사람들은 그냥 지나갔다.'; } }),
  sp({ id: 'handshake', icon: '🤝', roles: ['none', 'mp', 'city', 'metro', 'gov'], mini: 'tap', name: '지역 행사 악수 릴레이', desc: '미니게임 · 지역 기반 +, 호감도 +',
    run(score) { modBase(myRegion(), 5 * miniMul(score)); mod('favor', 2 * miniMul(score)); mod('sta', -5); return score >= 75 ? '체육대회, 경로잔치, 조기축구회까지 손이 얼얼하도록 악수했다.' : score >= 40 ? '행사장 세 곳을 돌며 인사했다.' : '행사장에 늦게 도착해 폐회사만 들었다.'; } }),
  sp({ id: 'column', icon: '🖋️', roles: ['none', 'tv'], name: '신문 칼럼 연재', desc: '지력 성장, 인지도·호감도 +',
    run() { grow('int', 1); mod('fame', 2); mod('favor', 1); return '격주로 칼럼을 썼다. 마감은 늘 새벽이었다.'; } }),
  sp({ id: 'recruit', icon: '📋', roles: ['none', 'mp'], need: () => !!S.party, name: '당원 배가 운동', desc: '당내 입지 +, 자금 +',
    run() { gainStanding(5); mod('funds', 4); mod('sta', -5); return '입당 원서 삼백 장을 받아 왔다.'; } }),
  sp({ id: 'ngo', icon: '🌿', roles: ['none'], name: '시민단체 연대 캠페인', desc: '호감도 +, 인지도 +',
    run() { mod('favor', 3); mod('fame', 2); mod('ideology', ownSign() * 2); return '시민단체와 함께 서명 운동을 벌였다.'; } }),
  sp({ id: 'hearing', icon: '🪑', roles: ['mp'], name: '민생 현장 간담회', desc: '지역 기반 +, 호감도 +',
    run() { modBase(S.seat.region, 4); mod('favor', 2); grow('int', 0.5); return '자영업자들과 세 시간을 마주 앉았다. 받아 적은 메모가 수첩 한 권이다.'; } }),
  sp({ id: 'deal', icon: '🧩', roles: ['mp'], name: '쟁점 법안 물밑 협상', desc: '정치력 58 판정',
    run() { if (judge('pol', 58)) { S.term.bills++; S.rec.bills++; mod('favor', 3); gainStanding(3); return '상대 당 간사와 밤새 조문을 고쳐 합의안을 만들었다.'; } gainStanding(-3); return '협상 내용이 먼저 새어 나가 판이 깨졌다.'; } }),
  sp({ id: 'press', icon: '🎙️', roles: ['none', 'mp'], name: '긴급 기자회견', desc: '인지도 + · 화술 50 판정',
    run() { mod('fame', 4); if (judge('spk', 50)) { mod('favor', 2); return '준비한 메시지가 저녁 뉴스에 그대로 나갔다.'; } mod('favor', -3); return '질의응답에서 말이 꼬였다.'; } }),
  sp({ id: 'walkout', icon: '🚶', roles: ['mp'], need: () => S.party && S.party !== S.w.ruling, name: '본회의 퇴장·규탄 대회', desc: '인지도·입지 +, 성향 강화',
    run() { mod('fame', 3); mod('ideology', ownSign() * 4); gainStanding(4); mod('favor', -1); return '표결 직전 집단 퇴장하고 로텐더홀에서 규탄 대회를 열었다.'; } }),
  sp({ id: 'mentor_staff', icon: '🌱', roles: ['mp'], name: '청년 인재 육성', desc: '당내 입지 +, 지력 성장',
    run() { gainStanding(3); grow('int', 1); mod('favor', 1); return '의원실 인턴 출신이 지방의원에 당선됐다.'; } }),
  sp({ id: 'festival2', icon: '🎆', roles: ['city', 'metro', 'gov'], name: '지역 축제 개최', desc: '인지도·기반 +, 자금 − · 날씨 변수',
    run() { mod('fame', 3); modBase(S.seat.region, 4); mod('funds', -6); if (chance(0.25)) { mod('favor', -2); return '개막일에 폭우가 쏟아졌다. 무대가 물에 잠겼다.'; } return '축제에 30만 명이 다녀갔다.'; } }),
  sp({ id: 'housing', icon: '🏘️', roles: ['city', 'metro', 'gov'], name: '청년 주택 공급', desc: '공약 ++, 호감도 +',
    run() { S.term.pledge += 9; mod('favor', 3); mod('funds', -6); return '역세권 청년 주택 천 가구 입주가 시작됐다.'; } }),
  sp({ id: 'labor', icon: '🪧', roles: ['city', 'metro', 'gov'], name: '공무원 노조 교섭', desc: '정치력 55 판정',
    run() { if (judge('pol', 55)) { S.term.pledge += 6; mod('favor', 2); return '단체교섭을 무분규로 타결했다.'; } mod('favor', -3); return '교섭이 결렬되고 청사 앞에 현수막이 걸렸다.'; } }),
  sp({ id: 'interview', icon: '🎚️', roles: ['tv'], name: '심층 인터뷰 진행', desc: '화술 성장, 인지도 +',
    run() { grow('spk', 1.5); mod('fame', 3); gainStanding(2); return '거물 정치인을 스튜디오에 앉혀 놓고 한 시간을 몰아붙였다.'; } }),
  sp({ id: 'cabinet', icon: '🗂️', roles: ['president'], name: '국무회의 생중계', desc: '지력 55 판정',
    run() { if (judge('int', 55)) { mod('approval', 4); return '장관들을 상대로 한 날카로운 질문이 화제가 됐다.'; } mod('approval', -2); return '준비되지 않은 발언이 그대로 생중계됐다.'; } }),
  sp({ id: 'townpres', icon: '🏟️', roles: ['president'], mini: 'timing', name: '국민과의 대화', desc: '미니게임 · 지지율 변동',
    run(score) { mod('approval', (score - 40) / 12); return score >= 70 ? '각본 없는 질문에 막힘이 없었다.' : score >= 40 ? '무난하게 마쳤다.' : '곤란한 질문에 말을 흐렸다.'; } })
);
Object.assign(ICONS, { cabinet: '🗂️' });
// 국정감사는 준비한 질의 순서를 외워야 한다
(() => {
  const a = ACTIONS.find((x) => x.id === 'audit');
  a.mini = 'memory'; a.desc = '하반기 전용 · 미니게임 · 국감 스타 도전';
  a.run = (score) => {
    if (chance(clamp(judgeP('spk', 55) / 200 + score / 180, 0.05, 0.95))) { mod('fame', 8); mod('favor', 2); grow('spk', 1); return '준비한 순서대로 몰아붙였다. "국감 스타"라는 제목이 붙었다.'; }
    mod('fame', 1); return '질의 순서가 꼬였고 장관은 여유롭게 빠져나갔다.';
  };
})();

/* ───────── 미니게임 ───────── */
const MG_ICONS = ['📈', '🏠', '🛡️', '🎓', '🏥', '🌱'];
function miniLabel(score) { return score >= 85 ? '완벽' : score >= 60 ? '좋음' : score >= 35 ? '보통' : '삐끗'; }
function miniTag(score) { return `<span class="tw ${score >= 60 ? 'up' : score >= 35 ? 'mid' : 'down'}">${miniLabel(score)} ${score}점</span> `; }
function mini(kind, title, cb) {
  if (TEST || !OPTS.mini) return cb(rint(25, 90));
  const m = (T.mg = { kind, title, cb, done: false, timers: [] });
  if (kind === 'timing') { m.target = 0.2 + Math.random() * 0.6; m.period = 1100 + Math.random() * 300; }
  if (kind === 'tap') { m.count = 0; m.left = 5; }
  if (kind === 'memory') { m.seq = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6)); m.i = 0; m.phase = 'show'; }
  paint(scrMini());
  if (kind === 'timing') {
    m.t0 = performance.now();
    const tick = () => { if (m.done) return; const c = document.getElementById('mgc'); if (!c) return; c.style.left = mgPos(m) * 100 + '%'; m.raf = requestAnimationFrame(tick); };
    tick();
  }
  if (kind === 'memory') {
    m.seq.forEach((ix, n) => {
      m.timers.push(setTimeout(() => { const e = document.getElementById('mgi' + ix); if (e) { e.classList.remove('lit'); void e.offsetWidth; e.classList.add('lit'); } }, 600 + n * 750));
    });
    m.timers.push(setTimeout(() => { m.phase = 'input'; const e = document.getElementById('mgm'); if (e) e.textContent = '이제 같은 순서로 누르세요'; document.querySelectorAll('.mg-grid button').forEach((b) => b.classList.remove('lit')); }, 600 + m.seq.length * 750 + 300));
  }
}
function mgPos(m) { const x = ((performance.now() - m.t0) % (m.period * 2)) / m.period; return x <= 1 ? x : 2 - x; }
function scrMini() {
  const m = T.mg;
  let body = '';
  if (m.kind === 'timing') body = `<p>막대가 <b>금색 구간</b>에 들어왔을 때 누르세요.</p><div class="mg-bar"><div class="mg-zone" style="left:${(m.target - 0.08) * 100}%"></div><div id="mgc" class="mg-cur"></div></div>${btn('mgStop', '', '지금!', 'primary')}`;
  if (m.kind === 'tap') body = `<p>5초 동안 최대한 많이 누르세요. 첫 터치에 시작합니다.</p><p class="mg-num"><span id="mgn">0</span><small>회 · <span id="mgt">5.0</span>초</small></p><button class="mg-tap" data-a="mgTap" data-v="">${ic('shake')}</button>`;
  if (m.kind === 'memory') body = `<p id="mgm">질의 순서를 기억하세요…</p><div class="mg-grid">${MG_ICONS.map((ic, i) => `<button id="mgi${i}" data-a="mgPick" data-v="${i}">${ic}</button>`).join('')}</div><p class="mg-num"><small><span id="mgn">0</span> / ${m.seq.length}</small></p>`;
  return `<div class="mg"><p class="seq-k">MINI GAME</p><h1>${m.title}</h1><div class="rule"></div>${body}${btn('mgSkip', '', '건너뛰기')}</div>`;
}
function finishMini(score) {
  const m = T.mg; if (!m || m.done) return;
  m.done = true; m.score = Math.round(clamp(score, 0, 100));
  if (m.raf) cancelAnimationFrame(m.raf);
  m.timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
  paint(`<div class="mg"><p class="seq-k">RESULT</p><h1>${m.title}</h1><div class="rule"></div><p class="mg-score ${m.score >= 60 ? 'good' : m.score < 35 ? 'bad' : ''}">${miniLabel(m.score)}</p><p class="mg-num">${m.score}<small>점</small></p>${btn('mgDone', '', '계속', 'primary')}</div>`);
  if (m.score >= 85) fx('confetti');
}
Object.assign(H, {
  mgStop() { const m = T.mg; if (!m || m.done) return; finishMini(100 - Math.max(0, Math.abs(mgPos(m) - m.target) - 0.03) * 420); },
  mgTap() {
    const m = T.mg; if (!m || m.done || m.kind !== 'tap') return;
    if (!m.started) {
      m.started = true; m.t0 = performance.now();
      m.timers.push(setInterval(() => { const left = 5 - (performance.now() - m.t0) / 1000; const e = document.getElementById('mgt'); if (e) e.textContent = Math.max(0, left).toFixed(1); if (left <= 0) finishMini((m.count / 30) * 100); }, 100));
    }
    m.count++; const e = document.getElementById('mgn'); if (e) e.textContent = m.count;
  },
  mgPick(v) {
    const m = T.mg; if (!m || m.done || m.phase !== 'input') return;
    const e = document.getElementById('mgi' + v);
    if (+v === m.seq[m.i]) { m.i++; if (e) { e.classList.remove('ok'); void e.offsetWidth; e.classList.add('ok'); } const n = document.getElementById('mgn'); if (n) n.textContent = m.i; if (m.i === m.seq.length) finishMini(100); }
    else finishMini((m.i / m.seq.length) * 85);
  },
  mgSkip() { finishMini(25 + Math.random() * 50); },
  mgDone() { const m = T.mg; T.mg = null; m.cb(m.score); },
});

/* ───────── 일정 실행 (미니게임·화두 보너스 포함) ───────── */
H.go = function () {
  if (T.picks.length !== maxPicks()) return;
  resetD(); T.jit = true;
  const queue = T.picks.slice(), lines = [];
  T.picks = [];
  const step = () => {
    if (!queue.length) {
      T.boost = 1;
      const tw = twist(); if (tw) lines.push(tw);
      T.jit = false; T.lines = lines;
      show(() => scrResult('이번 반기', T.lines, 'toEvent'));
      if ((T.d.favor || 0) <= -4) fx('shake');
      return;
    }
    const id = queue.shift(), a = ACTIONS.find((x) => x.id === id);
    const run = (score) => {
      mod('sta', id === 'rest' ? 0 : -4);
      T.boost = themeHit(id) ? 1.5 : 1;
      let text = a.run(score);
      T.boost = 1;
      text += mandateTick(id);
      lines.push((score != null ? miniTag(score) : '') + (themeHit(id) ? '<span class="tw th">화두</span> ' : '') + text);
      step();
    };
    if (a.mini) mini(a.mini, typeof a.name === 'function' ? a.name() : a.name, run); else run();
  };
  step();
};

/* ───────── 선거운동: 미니게임과 유세 변수 ───────── */
(() => {
  const speech = CAMP.find((a) => a.id === 'speech'), market = CAMP.find((a) => a.id === 'market');
  speech.mini = 'timing'; speech.desc = '미니게임 · 화술 기반';
  speech.run = (el, score) => (score < 20 ? [-0.5, '연설 도중 말이 꼬였다. 그 장면만 돌아다닌다.'] : [(0.6 + S.st.spk / 60) * miniMul(score), score >= 75 ? '유세장이 함성으로 뒤덮였다.' : '유세차 위에서 목이 쉬도록 외쳤다.']);
  market.mini = 'tap'; market.desc = '미니게임 · 매력 기반 · 호감도 +';
  market.run = (el, score) => { mod('favor', 2); return [(0.4 + S.st.cha / 60) * miniMul(score), score >= 75 ? '시장 끝에서 끝까지 손을 놓지 않았다. 상인들이 먼저 불러 세웠다.' : '전통시장을 돌며 상인들의 손을 잡았다.']; };
})();
const CAMP_TWISTS = [
  [1.5, '상대 후보가 유세 중 지역 이름을 잘못 불렀다. 영상이 퍼지고 있다.'],
  [1.2, '빗속에서 우산 없이 연설한 사진이 화제가 됐다.'],
  [1.5, '지역 원로들이 깜짝 지지 선언을 했다.'],
  [-1.2, '캠프 내부 갈등이 기사로 나왔다.'],
  [-1.5, '출처 불명의 여론조사 지라시가 돌고 있다. 지지층이 흔들린다.'],
  [-1, '유세차가 불법 주차로 과태료를 물었다는 기사가 났다.'],
  [1, '자원봉사자들이 만든 응원 영상이 조회수 50만을 넘겼다.'],
  [-1.3, '상대 캠프가 대규모 물량 공세를 시작했다.'],
];
H.camp = function (v) {
  const el = T.el, a = CAMP.find((x) => x.id === v);
  if (a.need && !a.need()) return;
  const apply = (score) => {
    resetD();
    let [d, text0] = a.run(el, score);
    const aide = AIDES.find((x) => x.id === el.aide);
    if (el.aide === 'strat' && v === 'nega' && d != null && d < 0) { d = null; text0 = '상대 후보의 의혹을 제기했다. 역풍 조짐이 보이자 전략팀이 재빨리 수습했다.'; }
    if (d > 0 && aide && aide.ids && aide.ids.includes(v)) d *= aide.mul;
    let text = (score != null ? miniTag(score) : '') + text0;
    const half = el.last === v ? 0.5 : 1;
    if (d == null) { const tgt = mainRival(el); tgt.camp -= ri(2, 4) * half * (tgt.trait === 'scandal' ? 2 : 1); }
    else el.my += d * (d > 0 ? half : 1) * (el.type === 'pres' ? 0.55 : 0.75); // 전국 선거는 유세 한 번의 효과가 작다
    el.cands.forEach((c) => { if (!c.me && PARTIES[c.party].kind === 'major') c.camp += ri(0.4, 1.4) + (c.trait === 'machine' ? 0.6 : 0); });
    if (chance(0.28)) { const t = pick(CAMP_TWISTS); el.my += t[0]; text += `</p><p><span class="tw ${t[0] > 0 ? 'up' : 'down'}">유세 변수</span> ${t[1]}`; }
    el.last = v; el.round++; el.text = text;
    el.offer = rollCamp(el);
    el.poll = shares(el, false, el.aide !== 'strat');
    show(scrCampResult);
  };
  if (a.mini) mini(a.mini, a.name, apply); else apply();
};

/* ───────── 토론 개편: 상대 유형, 질문별 답변, 마무리 발언 ───────── */
const ARCH = [
  { name: '싸움닭', tip: '목소리를 높이는 상대다. 흥분하지 말고 수치로 받아치면 유리하다.', stat: 'int' },
  { name: '정책통', tip: '숫자에 밝은 상대다. 숫자 싸움보다 사람 이야기가 통한다.', stat: 'cha' },
  { name: '감성파', tip: '분위기를 잘 타는 상대다. 말리지 말고 날카롭게 파고들어야 한다.', stat: 'spk' },
];
const DEBATES = [
  { q: '상대가 당신의 10년 전 발언을 패널에 띄웠다. "이 말, 지금도 같은 생각입니까?"', o: [['그때와 지금의 맥락을 조목조목 짚는다', 'int'], ['"사람은 배우며 바뀝니다"라고 솔직히 인정한다', 'cha', 1], ['"남의 과거 캘 시간에 공약이나 내십시오"', 'spk']] },
  { q: '사회자: "그 공약에 연 12조 원이 듭니다. 재원은 어디서 마련합니까?"', o: [['세출 구조조정 항목을 하나씩 댄다', 'int', 1], ['"돈이 없는 게 아니라 의지가 없는 겁니다"', 'spk'], ['혜택을 받을 사람들의 사연을 이야기한다', 'cha']] },
  { q: '방청석 취업준비생이 울먹인다. "저희는 뭘 믿고 살아야 하나요?"', o: [['자리에서 일어나 눈을 맞추고 답한다', 'cha', 1], ['청년 일자리 통계와 대책을 설명한다', 'int'], ['"기성 정치가 여러분을 속였습니다"라고 외친다', 'spk']] },
  { q: '상대가 틀린 통계를 인용하며 몰아세운다.', o: [['정확한 수치와 출처로 바로잡는다', 'int', 1], ['"숫자도 못 읽으면서 나라를 맡겠다고요?"', 'spk'], ['웃으며 "통계보다 장바구니를 보십시오"', 'cha']] },
  { q: '상대가 답변 도중 계속 끼어든다.', o: [['"제 시간입니다. 끝까지 들으십시오"라고 끊는다', 'spk', 1], ['끼어들 때마다 미소로 기다린다', 'cha'], ['사회자에게 규칙 위반을 지적한다', 'int']] },
  { q: '사회자: "소속 정당의 최근 논란, 후보께서는 어떻게 보십니까?"', o: [['"잘못은 잘못입니다"라고 선을 긋는다', 'cha', 1], ['사실관계를 정리해 오해를 푼다', 'int'], ['"상대 당 문제가 훨씬 큽니다"라고 되받는다', 'spk']] },
  { q: '전문가 패널: "연금 개혁, 보험료율을 몇 퍼센트까지 올리겠습니까?"', o: [['구체적 숫자와 단계별 일정을 답한다', 'int', 1], ['"숫자보다 사회적 합의가 먼저"라고 답한다', 'cha'], ['"그 질문은 상대 후보에게 먼저 하시죠"', 'spk']] },
  { q: '상대가 당신 가족 문제를 꺼냈다. 객석이 술렁인다.', o: [['"가족은 건드리지 맙시다"라고 단호히 말한다', 'spk', 1], ['사실관계를 차분히 설명한다', 'int'], ['잠시 말을 멈추고 "아픈 일이었습니다"라고 한다', 'cha']] },
  { q: '사회자: "상대 후보의 장점을 하나만 말씀해 주시죠."', o: [['진심을 담아 칭찬한다', 'cha', 1], ['칭찬인 척 뼈 있는 농담을 던진다', 'spk'], ['상대의 과거 정책 성과를 정확히 짚는다', 'int']] },
  { q: '상대: "당신은 이 지역에 대해 뭘 압니까? 버스 요금이 얼마인지는 아세요?"', o: [['요금과 노선 문제까지 정확히 답한다', 'int', 1], ['"매일 그 버스를 타는 분들을 만났습니다"', 'cha'], ['"퀴즈쇼 하러 나오셨습니까?"', 'spk']] },
  { q: '사회자가 돌발 질문을 던진다. "지금 가장 후회되는 정치적 선택은?"', o: [['실제 후회를 담담히 털어놓는다', 'cha', 1], ['"후회보다 책임을 말하겠습니다"', 'spk'], ['당시 판단의 근거를 설명한다', 'int']] },
  { q: '상대가 색깔론을 꺼냈다. "후보의 안보관이 의심스럽습니다."', o: [['"낡은 색깔론은 그만하시죠"라고 일축한다', 'spk', 1], ['자신의 안보 공약을 조목조목 설명한다', 'int'], ['군 복무 중인 청년들의 이야기를 꺼낸다', 'cha']] },
  { q: '시장 상인 대표: "선거 끝나도 여기 오실 겁니까?"', o: [['"안 오면 그때 계란을 던지십시오"', 'cha', 1], ['상권 활성화 공약의 일정표를 제시한다', 'int'], ['"상대 후보는 지난 4년간 몇 번 왔습니까?"', 'spk']] },
  { q: '상대가 갑자기 눈물을 보이며 호소한다. 분위기가 넘어가려 한다.', o: [['잠시 기다린 뒤 "저도 같은 마음입니다"', 'cha'], ['"눈물로는 예산이 나오지 않습니다"', 'spk', 1], ['감정 대신 구체적 대책을 내놓는다', 'int']] },
];
const STAT_KO = { int: '지력', cha: '매력', spk: '화술' };
function newDebate(el) {
  const pool = DEBATES.slice(), qs = [];
  for (let i = 0; i < 3; i++) qs.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return { qs, i: 0, wins: 0, lastText: '', arch: pick(ARCH), tier: (el.type === 'pres' ? 12 : el.type === 'general' || el.type === 'city' ? 0 : 6) + ({ mute: -10, star: 6 }[mainRival(el).trait] || 0) };
}
function debScore(d, o) { return S.st[o[1]] + (o[2] ? 12 : 0) + (d.arch.stat === o[1] ? 8 : 0) + (S.concept === 'anchor' ? 8 : S.concept === 'lawyer' ? 5 : 0); }
function scrDebate2() {
  const d = T.el.deb, q = d.qs[d.i];
  return `${bar()}<div class="pad">
    <p class="theme"><i>${ic('swords')}</i><span><b>상대 유형 · ${d.arch.name}</b><small>${d.arch.tip}</small></span></p>
    ${card(`TV 토론 ${d.i + 1}/3 <small>${d.wins}승</small>`, `<p>${q.q}</p>${d.lastText ? `<p class="muted">${d.lastText}</p>` : ''}`)}
    ${q.o.map((o, i) => `<button class="row" data-a="debate" data-v="${i}"><b>${o[0]}</b><span>${STAT_KO[o[1]]} ${Math.round(S.st[o[1]])}</span></button>`).join('')}</div>`;
}
H.debate = function (v) {
  const el = T.el, d = el.deb, o = d.qs[d.i].o[+v];
  if (!o) return;
  const win = debScore(d, o) + ri(-15, 15) > 50 + d.tier + ri(-15, 15);
  if (win) d.wins++;
  d.lastText = win ? (o[2] ? '직전 답변: 정확히 먹혔다. 방청석에서 박수가 나왔다.' : '직전 답변: 나쁘지 않았다. 상대가 잠시 머뭇거렸다.') : (o[2] ? '직전 답변: 방향은 맞았지만 상대의 반격이 더 매서웠다.' : '직전 답변: 헛돌았다. 상대가 그 틈을 파고들었다.');
  d.i++;
  if (d.i < 3) return show(scrDebate2);
  T.mgForce = true; T.mgShown = true;
  mini('timing', '마무리 발언', (score) => {
    resetD();
    const res = [[-5, '토론 참사', '쩔쩔매는 장면이 짤로 박제됐다.'], [-2, '토론 패배', '상대의 페이스에 끌려다녔다.'], [2, '토론 판정승', '준비한 만큼은 보여줬다.'], [4, '토론 완승', '상대가 한 번도 반격하지 못했다.']][d.wins];
    const close = score >= 75 ? 1 : score < 30 ? -1 : 0;
    el.my += res[0] + close; grow('spk', 1); mod('fame', 2);
    el.debDone[el.round] = true;
    T.lines = [`<b>${res[1]}.</b> ${res[2]}`, `${miniTag(score)}마무리 발언은 ${close > 0 ? '여운을 남겼다.' : close < 0 ? '시간에 쫓겨 끝을 맺지 못했다.' : '무난했다.'}`, `지지율 효과 ${res[0] + close > 0 ? '+' : ''}${res[0] + close}%p`];
    if (chance(0.2)) { const good = chance(0.5); el.my += good ? 1 : -1; T.lines.push(good ? '<span class="tw up">돌발</span> 토론 직후 상대의 마이크가 꺼지지 않아 실언이 그대로 방송됐다.' : '<span class="tw down">돌발</span> 당신이 물을 쏟는 장면이 밈이 됐다.'); }
    show(() => scrResult('TV 토론 결과', T.lines, 'elNext'));
    if (d.wins === 0) fx('shake');
  });
};

/* ───────── 이벤트 추가: 라이벌, 연쇄, 미니게임 ───────── */
function rival() { if (!S.rival) S.rival = { name: npcName() }; return S.rival; }
function flag(k, v) { S.flags = S.flags || {}; if (v === undefined) return S.flags[k]; S.flags[k] = v; }
EVENTS.push(
  { id: 'rival_rise', cond: () => S.party && S.role !== 'president' && S.turn >= 3, title: '라이벌의 부상',
    text: () => `같은 당 ${rival().name}이 시사 주간지 표지에 "차세대 리더"로 실렸다. 당신과 늘 비교되던 사람이다.`,
    ch: [
      ['공개적으로 축하한다', '호감도 +', () => { mod('favor', 3); flag('rivalMood', 1); return `"좋은 경쟁자가 있어 든든하다"고 썼다. ${rival().name}이 전화를 걸어 왔다.`; }],
      ['은근히 견제한다', '당내 입지 + · 역풍 위험', () => { gainStanding(4); flag('rivalMood', -1); if (chance(0.35)) { mod('favor', -4); return '견제 발언이 "속 좁다"는 평으로 돌아왔다.'; } return '기자들에게 "표지는 표지일 뿐"이라고 흘렸다.'; }],
      ['내 길을 간다', '지력 성장', () => { grow('int', 1); return '기사를 덮고 하던 일을 계속했다.'; }],
    ] },
  { id: 'rival_deal', cond: () => S.rival && S.party && !S.leader && S.role !== 'president', title: '라이벌의 제안',
    text: () => `${rival().name}이 조용히 만나자고 했다. "이번엔 내가 밀 테니, 다음엔 당신이 미는 걸로 합시다."`,
    ch: [
      ['손을 잡는다', '당내 입지 ++', () => { gainStanding(9); flag('rivalMood', 1); S.mainstream = true; return '악수했다. 당내 지형이 바뀌었다는 기사가 났다.'; }],
      ['거절한다', '호감도 +', () => { mod('favor', 2); flag('rivalMood', -1); return '"밀실 거래는 하지 않습니다." 문이 닫히는 소리가 컸다.'; }],
      ['받는 척 시간을 번다', '정치력 58 판정', () => { if (judge('pol', 58)) { gainStanding(5); return '확답 없이 양쪽 모두의 지원을 끌어냈다.'; } gainStanding(-6); return '양다리가 들통났다. 당내에 소문이 퍼졌다.'; }],
    ] },
  { id: 'rival_fall', cond: () => S.rival && S.party && S.role !== 'president' && S.turn >= 8, title: '라이벌의 추락',
    text: () => `${rival().name}의 측근이 금품 수수 의혹으로 수사를 받는다. 기자들이 당신의 논평을 기다린다.`,
    ch: [
      ['감싼다', '당내 입지 +, 호감도 변동', () => { gainStanding(4); mod('favor', chance(0.5) ? 2 : -3); return '"수사 결과를 지켜보자"며 감쌌다.'; }],
      ['단호히 선을 긋는다', '인지도 +, 당내 입지 −', () => { mod('fame', 4); gainStanding(-4); mod('favor', 2); return '"읍참마속해야 한다"고 말했다. 당내 반응이 차갑다.'; }],
      ['침묵한다', '변화 없음', () => '아무 말도 하지 않았다. 침묵도 메시지로 읽혔다.'],
    ] },
  { id: 'promise', cond: () => !flag('promise'), title: '청년과의 약속',
    text: () => '간담회에서 한 청년이 물었다. "당선되든 안 되든, 1년 뒤에 여기서 다시 만나 주실 수 있습니까?"',
    ch: [
      ['약속한다', '호감도 + · 1년 뒤 돌아온다', () => { flag('promise', S.turn); mod('favor', 3); return '"꼭 오겠습니다." 영상이 퍼졌다.'; }],
      ['확답을 피한다', '변화 없음', () => { flag('promise', -1); return '"노력하겠습니다"라고만 답했다.'; }],
    ] },
  { id: 'promise_due', cond: () => flag('promise') > 0 && S.turn - flag('promise') >= 2, title: '1년 전의 약속',
    text: () => '1년 전 청년들과 한 약속의 날이다. 하필 오늘, 당 지도부가 긴급 소집을 걸었다.',
    ch: [
      ['약속 장소로 간다', '호감도 ++, 당내 입지 −', () => { flag('promise', -1); mod('favor', 6); mod('fame', 2); gainStanding(-4); return '같은 자리에 같은 청년들이 앉아 있었다. 그날의 사진이 오래 회자됐다.'; }],
      ['긴급 소집에 간다', '당내 입지 +, 호감도 −−', () => { flag('promise', -1); gainStanding(4); mod('favor', -6); return '빈 의자 사진이 "정치인의 약속"이라는 제목으로 돌았다.'; }],
    ] },
  { id: 'whistle', cond: () => ['mp', 'city', 'metro', 'gov'].includes(S.role) && !flag('whistle'), title: '내부고발자',
    text: () => '공공기관 직원이 내부 비리 자료를 들고 찾아왔다. "제 신원만은 지켜 주십시오."',
    ch: [
      ['끝까지 보호하며 공론화한다', '호감도 + · 뒷일이 있다', () => { flag('whistle', S.turn); mod('favor', 3); mod('fame', 3); return '제보자를 숨긴 채 자료를 공개했다. 기관이 색출에 나섰다는 말이 들린다.'; }],
      ['감사원에 넘긴다', '변화 없음', () => { flag('whistle', -1); grow('int', 0.5); return '공식 절차로 넘겼다. 결과는 1년쯤 걸린다고 한다.'; }],
      ['부담스럽다며 돌려보낸다', '호감도 −', () => { flag('whistle', -1); mod('favor', -2); return '자료를 돌려줬다. 그 사람의 뒷모습이 오래 남았다.'; }],
    ] },
  { id: 'whistle_back', cond: () => flag('whistle') > 0 && S.turn - flag('whistle') >= 3, title: '제보자의 전화',
    text: () => '그때의 내부고발자가 전화를 걸어 왔다. 신원이 드러나 해고됐다고 한다.',
    ch: [
      ['법률 지원과 복직 투쟁에 나선다', '자금 −, 호감도 ++', () => { flag('whistle', -1); mod('funds', -8); mod('favor', 6); return '끝까지 함께했다. 2년 뒤 복직 판결이 났다.'; }],
      ['위로만 전한다', '호감도 −', () => { flag('whistle', -1); mod('favor', -5); return '"안타깝다"는 말만 했다. 그 통화 내용이 훗날 인터뷰에 실렸다.'; }],
    ] },
  { id: 'duel', cond: () => S.fame >= 25 && S.role !== 'president', title: '맞짱 토론 제안',
    text: () => '구독자 200만 유튜브 채널이 당신과 상대 진영 논객의 일대일 생방송 토론을 제안했다.',
    ch: [
      ['나간다', '미니게임 · 인지도 크게 변동', (score) => { if (score >= 60) { mod('fame', 8); mod('favor', 3); grow('spk', 1); return '상대의 논리를 차례로 무너뜨렸다. 하이라이트 영상이 500만 뷰를 넘겼다.'; } if (score >= 35) { mod('fame', 4); return '팽팽했다. 양쪽 지지자 모두 자기 편이 이겼다고 한다.'; } mod('fame', 4); mod('favor', -4); return '말문이 막힌 3초가 짤이 됐다.'; }, 'timing'],
      ['거절한다', '변화 없음', () => '"구경거리가 될 생각은 없다"고 답했다.'],
    ] },
  { id: 'flood_help', cond: () => S.role !== 'abroad' && S.role !== 'president', title: '수해 복구 현장',
    text: () => '집중호우로 침수된 마을에서 복구 작업이 한창이다. 삽이 모자란다는 연락이 왔다.',
    ch: [
      ['삽을 든다', '미니게임 · 호감도·기반 +', (score) => { mod('sta', -6); mod('favor', 2 + score / 25); modBase(myRegion(), 2 + score / 30); return score >= 60 ? '해가 질 때까지 토사를 퍼냈다. 이장님이 막걸리를 따라 줬다.' : '한 시간쯤 거들다 허리를 삐끗했다.'; }, 'tap'],
      ['구호 물품을 보낸다', '자금 −, 호감도 +', () => { mod('funds', -6); mod('favor', 2); return '생수와 이불을 트럭에 실어 보냈다.'; }],
    ] },
  { id: 'prompter', cond: () => S.fame >= 30, title: '프롬프터 고장',
    text: () => '전국에 생중계되는 정책 발표회. 단상에 오르자마자 프롬프터가 꺼졌다.',
    ch: [
      ['외운 대로 간다', '미니게임 · 호감도·인지도 변동', (score) => { if (score >= 80) { mod('favor', 5); mod('fame', 4); return '원고 없이 다섯 가지 공약을 순서대로 풀어냈다. "준비된 사람"이라는 평이 나왔다.'; } if (score >= 40) { mod('fame', 2); return '몇 군데 빼먹었지만 무사히 마쳤다.'; } mod('favor', -4); mod('fame', 2); return '세 번째 공약에서 머릿속이 하얘졌다. 침묵 12초가 생중계됐다.'; }, 'memory'],
      ['솔직히 말하고 원고를 꺼낸다', '호감도 소폭 +', () => { mod('favor', 1); return '"기계가 저보다 먼저 긴장했네요." 웃음이 터졌고, 원고를 보고 읽었다.'; }],
    ] },
  { id: 'meme', cond: () => S.fame >= 20, title: '밈이 되다',
    text: () => '회의 중 하품하는 당신의 사진이 온갖 합성물로 퍼지고 있다.',
    ch: [
      ['직접 패러디에 동참한다', '매력 55 판정', () => { if (judge('cha', 55)) { mod('fame', 6); mod('favor', 3); return '본인이 올린 패러디가 원본보다 더 퍼졌다.'; } mod('favor', -2); mod('fame', 3); return '억지스럽다는 반응이 많았다.'; }],
      ['모른 척한다', '인지도 +', () => { mod('fame', 2); return '시간이 지나자 다른 밈에 밀려났다.'; }],
      ['삭제를 요청한다', '호감도 −', () => { mod('favor', -3); mod('fame', 3); return '삭제 요청 사실이 알려져 밈이 두 배로 늘었다.'; }],
    ] },
  { id: 'factory', cond: () => S.role !== 'abroad', title: '고향 공장 폐쇄',
    text: () => `${REGIONS[S.home]}의 가장 큰 공장이 해외 이전을 발표했다. 일자리 3천 개가 걸려 있다.`,
    ch: [
      ['본사를 찾아가 담판한다', '정치력 60 판정', () => { if (judge('pol', 60)) { modBase(S.home, 8); mod('favor', 4); mod('fame', 3); return '이전 규모를 절반으로 줄이는 합의를 끌어냈다.'; } modBase(S.home, 2); return '회장은 만나 주지도 않았다. 그래도 고향에서는 고맙다고 했다.'; }],
      ['대체 산업 유치안을 낸다', '지력 60 판정', () => { if (judge('int', 60)) { modBase(S.home, 6); mod('favor', 3); return '데이터센터 유치안이 정부 과제로 채택됐다.'; } return '보고서는 좋았지만 예산이 붙지 않았다.'; }],
      ['규탄 성명을 낸다', '지역 기반 소폭 +', () => { modBase(S.home, 2); mod('fame', 1); return '성명서를 냈다. 달라진 것은 없었다.'; }],
    ] },
  { id: 'church', cond: () => S.fame >= 15, title: '대형 종교 행사',
    text: () => '신도 수만 명이 모이는 종교 행사에서 축사를 요청해 왔다. 참석만으로도 말이 나올 자리다.',
    ch: [
      ['참석해 축사한다', '지역 기반 + · 논란 위험', () => { modBase(myRegion(), 4); if (chance(0.3)) { mod('favor', -4); return '축사 중 한 문장이 정교분리 논란을 불렀다.'; } return '무난한 축사를 하고 돌아왔다.'; }],
      ['영상 메시지만 보낸다', '변화 없음', () => '2분짜리 영상을 보냈다.'],
      ['정중히 사양한다', '호감도 소폭 +', () => { mod('favor', 1); modBase(myRegion(), -2); return '사양했다. 서운하다는 말이 전해졌다.'; }],
    ] },
  { id: 'taxi', cond: () => S.fame >= 20, title: '택시 안에서',
    text: () => '택시 기사와 나눈 대화가 블랙박스 영상으로 공개됐다. 당신은 몰랐다.',
    ch: [
      ['그대로 둔다', '평소 언행대로', () => { if (S.favor + ri(-20, 20) >= 50) { mod('favor', 5); mod('fame', 3); return '기사님 고민을 20분간 들어 주는 모습이었다. "카메라 없는 곳의 진짜 모습"이라는 반응이 나왔다.'; } mod('favor', -5); mod('fame', 3); return '피곤해서 건성으로 대꾸한 장면이 편집돼 돌았다.'; }],
      ['유포 중단을 요청한다', '호감도 −', () => { mod('favor', -2); return '삭제를 요청했다. "뭐가 찔리느냐"는 댓글이 달렸다.'; }],
    ] },
  { id: 'rule', cond: () => S.party && S.party !== 'mine' && !S.leader && ['mp', 'none'].includes(S.role), title: '공천 룰 개정',
    text: () => '당이 공천 룰을 바꾸려 한다. 당원 투표 비중을 높이면 조직이 강한 쪽이, 여론조사 비중을 높이면 인지도 높은 쪽이 유리하다.',
    ch: [
      ['당원 비중 확대에 찬성', '당내 입지 +', () => { gainStanding(5); flag('rulePref', 'org'); return '조직표를 믿고 당원 비중 확대에 손을 들었다.'; }],
      ['여론조사 비중 확대에 찬성', '인지도 +, 당내 입지 −', () => { mod('fame', 3); gainStanding(-3); flag('rulePref', 'poll'); return '"민심이 당심"이라고 주장했다.'; }],
      ['기권한다', '변화 없음', () => '표결에 참여하지 않았다.'],
    ] },
  { id: 'family', cond: () => S.fame >= 35, title: '가족 인터뷰 요청',
    text: () => '인기 토크쇼가 당신의 가족을 함께 섭외하고 싶어 한다. 가족은 내키지 않는 눈치다.',
    ch: [
      ['가족을 설득해 출연한다', '호감도 + · 체력 −', () => { mod('favor', 4); mod('fame', 3); mod('sta', -5); return '방송은 호평이었다. 집에 돌아와서는 한동안 말이 없었다.'; }],
      ['혼자 나간다', '매력 55 판정', () => { if (judge('cha', 55)) { mod('favor', 3); mod('fame', 2); return '가족 이야기를 하다 목이 멘 장면이 화제가 됐다.'; } mod('fame', 1); return '평범한 방송이었다.'; }],
      ['거절한다', '체력 +', () => { mod('sta', 3); return '"가족은 정치를 하지 않습니다."'; }],
    ] },
  { id: 'medical', cond: () => S.role !== 'abroad', title: '의료 대란',
    text: () => '의료계 집단행동이 길어지고 있다. 응급실 뺑뺑이 뉴스가 매일 나온다.',
    ch: [
      ['정부 방침을 지지한다', '여당 쪽으로 이동', () => { mod('ideology', Math.sign(PARTIES[S.w.ruling].ideo) * 4); gainStanding(S.party === S.w.ruling ? 4 : -3); return '"국민 생명이 먼저"라며 정부 방침을 지지했다.'; }],
      ['대화 기구를 제안한다', '정치력 58 판정', () => { if (judge('pol', 58)) { mod('favor', 5); mod('fame', 3); return '양쪽을 한 테이블에 앉히는 데 성공했다.'; } mod('favor', -1); return '제안은 양쪽 모두에게 묵살됐다.'; }],
      ['현장 의료진을 찾아간다', '호감도 +', () => { mod('favor', 3); mod('sta', -4); return '응급실에서 밤을 새운 의료진과 이야기를 나눴다.'; }],
    ] },
  { id: 'esports', cond: () => S.age < 55, title: 'e스포츠 결승전',
    text: () => 'e스포츠 대회 결승 축사를 맡았다. 관중 2만 명, 평균 나이 스물둘.',
    ch: [
      ['게임 용어를 섞어 축사한다', '매력 58 판정', () => { if (judge('cha', 58)) { mod('fame', 5); mod('favor', 3); return '"오늘은 제가 서포터입니다." 환호가 터졌다.'; } mod('favor', -3); mod('fame', 3); return '용어를 틀리게 말했다. 관중석에서 야유가 나왔다.'; }],
      ['짧게 하고 내려온다', '호감도 소폭 +', () => { mod('favor', 1); return '"경기 보러 오신 거니 30초만 하겠습니다." 박수를 받았다.'; }],
    ] },
  { id: 'drink', cond: () => S.role !== 'none' && S.role !== 'abroad', title: '회식 자리',
    text: () => '늦은 회식 자리. 누군가 휴대전화로 녹음하고 있다는 걸 눈치챘다.',
    ch: [
      ['일찍 자리를 뜬다', '당내 입지 소폭 −', () => { gainStanding(-1); return '물만 마시고 일어났다.'; }],
      ['평소대로 한다', '도박', () => { if (chance(0.4)) { mod('favor', -7); mod('fame', 3); return '취중 발언 녹취가 종편 뉴스에 나왔다.'; } gainStanding(3); return '아무 일도 없었다. 자리는 화기애애했다.'; }],
      ['녹음하는 사람을 조용히 부른다', '정치력 55 판정', () => { if (judge('pol', 55)) { gainStanding(4); return '따로 불러 이야기했다. 그 사람은 이후 당신 편이 됐다.'; } mod('favor', -3); return '실랑이가 벌어졌고 그 장면이 찍혔다.'; }],
    ] },
  { id: 'climate', cond: () => S.role !== 'abroad', title: '기록적 폭염',
    text: () => '40도가 넘는 폭염이 2주째다. 전력 수급 경보가 울렸다.',
    ch: [
      ['쪽방촌에 냉방 지원을 추진한다', '자금 −, 호감도 +', () => { mod('funds', -5); mod('favor', 4); return '선풍기와 얼음물을 직접 날랐다.'; }],
      ['에너지 정책 전환을 촉구한다', '성향 이동, 인지도 +', () => { mod('ideology', -4); mod('fame', 3); return '"기후 위기는 이미 와 있다"고 연설했다.'; }],
      ['전기요금 인하를 주장한다', '호감도 + · 지력 55 판정', () => { if (judge('int', 55)) { mod('favor', 4); return '재원 대책까지 붙인 한시 감면안이 받아들여졌다.'; } mod('favor', 1); return '"포퓰리즘"이라는 사설이 실렸다.'; }],
    ] },
  { id: 'award', cond: () => S.rec.bills >= 3 || S.fame >= 50, title: '올해의 정치인',
    text: () => '언론사가 뽑는 "올해의 정치인" 최종 후보에 올랐다. 시상식 연설을 준비해야 한다.',
    ch: [
      ['동료들에게 공을 돌린다', '당내 입지 +, 호감도 +', () => { gainStanding(4); mod('favor', 3); mod('fame', 3); return '"이 상은 의원실 식구들의 것입니다." 기립 박수가 나왔다.'; }],
      ['정치 개혁을 외친다', '화술 58 판정', () => { mod('fame', 4); if (judge('spk', 58)) { mod('favor', 4); return '3분 연설이 명연설로 회자됐다.'; } mod('favor', -1); return '수상 소감이 자화자찬으로 들렸다.'; }],
    ] }
);

/* ───────── 이벤트 선택 (미니게임 지원) ───────── */
H.choose = function (v) {
  const c = T.ev.ch[+v];
  const done = (score) => {
    resetD(); T.jit = true;
    const out = c[2](score);
    if (out === null) return; // 선택지가 자체 화면(버티기 등)으로 넘어간 경우
    T.lines = [(score != null ? miniTag(score) : '') + out];
    const tw = twist(); if (tw) T.lines.push(tw);
    T.jit = false;
    show(() => scrResult(T.ev.title, T.lines, 'endTurn'));
    if ((T.d.favor || 0) <= -4 || (T.d.approval || 0) <= -4) fx('shake');
  };
  if (c[3]) mini(c[3], T.ev.title, done); else done();
};

/* ───────── 연말 여론조사 ───────── */
function yearEndNote() {
  const score = S.fame * 0.6 + S.favor * 0.4;
  if (S.role === 'president') return `연말 국정 평가: 긍정 ${Math.round(S.w.approval)}%, 부정 ${Math.round(Math.min(95, 100 - S.w.approval - 6))}%.`;
  if (S.fame >= 45) { const rank = clamp(Math.ceil((92 - score) / 5), 1, 12); return `<b>연말 차기 지도자 선호도 조사 ${rank}위</b> (${Math.max(1, Math.round((score - 38) / 2.4))}%).`; }
  if (S.role === 'mp') return `연말 의정활동 평가: 상위 ${clamp(Math.round(100 - S.term.bills * 9 - S.st.int / 3), 3, 95)}%.`;
  return '연말 정치인 인지도 조사: 순위권 밖. 아직 이름을 아는 사람이 많지 않다.';
}

/* ───────── 연혁: 그래프 + 타임라인 ───────── */
const ROLE_COL = { none: '#b9bcc5', mp: '#14213d', city: '#0f9d8a', metro: '#0f9d8a', gov: '#0f9d8a', president: '#b8860b', tv: '#7a4bb0', abroad: '#dcd8cd' };
function trackTurn() { (S.track = S.track || []).push({ y: S.year, h: S.half, f: Math.round(S.fame), v: Math.round(S.favor), r: S.role }); }
function careerChart() {
  const tr = S.track || [];
  if (tr.length < 2) return '';
  const W = 320, n = tr.length, X = (i) => 6 + (i * (W - 12)) / (n - 1), Y = (v) => 8 + (100 - v) * 0.86;
  const line = (k) => tr.map((p, i) => `${X(i).toFixed(1)},${Y(p[k]).toFixed(1)}`).join(' ');
  let bands = '', start = 0;
  for (let i = 1; i <= n; i++) if (i === n || tr[i].r !== tr[start].r) { bands += `<rect x="${X(start).toFixed(1)}" y="102" width="${Math.max(2, X(i - 1) - X(start) + (W - 12) / (n - 1)).toFixed(1)}" height="9" fill="${ROLE_COL[tr[start].r]}"/>`; start = i; }
  const wins = S.history.filter((h) => /당선됐다/.test(h.t)).map((h) => { const i = tr.findIndex((p) => p.y === h.y && p.h === h.h); return i < 0 ? '' : `<circle cx="${X(i).toFixed(1)}" cy="${Y(tr[i].f).toFixed(1)}" r="4.5" fill="#f2c14e" stroke="#14213d" stroke-width="1.2"/>`; }).join('');
  const roles = [...new Set(tr.map((p) => p.r))];
  return `<svg class="chart" viewBox="0 0 ${W} 128" role="img" aria-label="인지도와 호감도의 변화">
    <line x1="6" x2="${W - 6}" y1="${Y(50)}" y2="${Y(50)}" stroke="#e2dfd7" stroke-dasharray="3 3"/>
    <polyline points="${line('v')}" fill="none" stroke="#2a9d6a" stroke-width="1.8" stroke-linejoin="round"/>
    <polyline points="${line('f')}" fill="none" stroke="#2f6fd0" stroke-width="2.2" stroke-linejoin="round"/>${wins}${bands}
    <text x="6" y="124" font-size="9" fill="#6b6f7a">${tr[0].y}</text><text x="${W - 6}" y="124" font-size="9" fill="#6b6f7a" text-anchor="end">${tr[n - 1].y}</text></svg>
    <div class="legend"><span><i style="background:#2f6fd0"></i>인지도</span><span><i style="background:#2a9d6a"></i>호감도</span><span><i style="background:#f2c14e;border-radius:50%"></i>당선</span>${roles.map((r) => `<span><i style="background:${ROLE_COL[r]}"></i>${ROLE_NAME[r]}</span>`).join('')}</div>`;
}
const TL_ICON = [[/계엄|탄핵|파면/, '⚠️', 'bad'], [/당선됐다|승리했다/, '🏆', 'win'], [/낙선|탈락|부결|실패/, '💧', 'lose'], [/창당/, '🚩', 'win'], [/개헌/, '📜', 'win'], [/대표로 선출|원내대표|당대표로서/, '👑', 'win'], [/장관/, '📜', ''], [/탈당|떠나/, '🚪', ''], [/입당|입문|합류|옮겼/, '🤝', ''], [/정권|집권/, '🏛️', 'world'], [/은퇴|퇴임|떠났다/, '🌅', ''], [/유학|귀국/, '✈️', ''], [/방송/, '📺', ''], [/임기 평가/, '⭐', 'win'], [/출마/, '📣', '']];
function timelineHtml(rev) {
  if (!S.history.length) return '<p class="muted">아직 기록이 없다.</p>';
  const list = rev ? S.history.slice().reverse() : S.history;
  let out = '', year = null;
  for (const h of list) {
    if (h.y !== year) { year = h.y; out += `<div class="tl-y">${year}<small>${h.age}세</small></div>`; }
    const m = TL_ICON.find((x) => x[0].test(h.t)) || [null, '•', ''];
    const pc = h.p && PARTIES[h.p] ? PARTIES[h.p].color : '#9a9da8';
    out += `<div class="tl-e ${m[2]}"><i style="border-color:${pc}">${m[1]}</i><div><small>${h.h === 1 ? '상반기' : '하반기'}${h.p && PARTIES[h.p] ? ' · ' + PARTIES[h.p].name : ''}</small><p>${h.t}</p></div></div>`;
  }
  return `<div class="tl">${out}</div>`;
}
function careerView(rev) {
  const r = S.rec, wins = r.wins.mp + r.wins.city + r.wins.big + r.wins.pres;
  return card('연혁', `<div class="tiles"><div><b>${wins}</b><span>당선</span></div><div><b>${r.losses}</b><span>낙선</span></div><div><b>${Math.floor((S.turn - 1) / 2)}</b><span>정치 경력(년)</span></div><div><b>${r.bills}</b><span>대표 법안</span></div></div>${careerChart()}${timelineHtml(rev)}`);
}

/* ───────── 도움말 · 설정 · 은퇴 확인 · 저장 검증 ───────── */
function scrHelp() {
  return `<div class="pad"><h2 class="h">게임 방법</h2>
    ${card('한 턴은 6개월', '<p>반기마다 일정 2개를 고릅니다. 일정 목록과 <b>화두</b>는 매번 바뀌고, 화두에 맞는 일정은 효과가 1.5배입니다.</p><p>일정 뒤에는 이벤트가 찾아오고, 가끔 턴 시작에 <b>속보</b>가 터집니다.</p>')}
    ${card('선거', '<p>총선은 4년(2028~), 지방선거는 4년(2030~), 대선은 5년(2030~)마다 상반기에 열립니다.</p><p>유리한 지역일수록 <b>공천</b>이 어렵고, 험지일수록 공천은 쉽지만 본선이 어렵습니다. 선거운동 4라운드(대선 6라운드)와 TV 토론을 거쳐 개표합니다.</p>')}
    ${card('능력치', '<p><b>내재 능력</b>(지력·매력·화술·정치력·체력)은 60세까지 성장하고 이후 서서히 줄어듭니다. 판정 선택지의 성공 확률을 정합니다.</p><p><b>인지도</b>와 <b>호감도</b>는 득표력의 핵심이고, <b>지역 기반</b>은 한 지역에서 오래 활동할수록 쌓입니다.</p>')}
    ${card('끝', '<p>은퇴하면 연혁과 칭호, 레거시 점수로 당신이 어떤 정치인으로 기억됐는지 평가합니다. 칭호는 도감에 모입니다.</p><p class="muted">이 게임의 정당과 인물은 모두 가상입니다.</p>')}
    ${btn('home0', '', '돌아가기', 'primary')}</div>`;
}
function scrOpts() {
  const row = (k, name, desc) => `<button class="row act ${OPTS[k] ? 'on' : ''}" data-a="opt" data-v="${k}"><i class="swi"><span class="sw ${OPTS[k] ? 'on' : ''}"></span></i><div><b>${name}</b><span>${desc}</span></div></button>`;
  return `<div class="pad"><h2 class="h">설정</h2>
    ${row('fx', '화면 효과', '꽃가루, 흔들림, 섬광')}${row('vib', '진동', '지원하는 기기에서만')}${row('mini', '미니게임', '끄면 결과가 자동으로 정해집니다')}
    ${btn('wipe', '', T.wipeAsk ? '정말 삭제할까요? 한 번 더 누르면 삭제' : '저장 데이터와 도감 삭제', 'danger')}
    <p class="fine">버전 ${VERSION} · 진행 상황은 이 기기의 브라우저에만 저장됩니다.</p>
    ${btn('home0', '', '돌아가기', 'primary')}</div>`;
}
(() => {
  const career0 = H.career, load0 = H.load;
  Object.assign(H, {
    help() { paint(scrHelp()); },
    opts() { T.wipeAsk = false; paint(scrOpts()); },
    opt(k) { OPTS[k] = !OPTS[k]; try { localStorage.setItem(OPT_KEY, JSON.stringify(OPTS)); } catch (e) { /* 저장소 없음 */ } paint(scrOpts()); },
    wipe() {
      if (!T.wipeAsk) { T.wipeAsk = true; return paint(scrOpts()); }
      try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(DEX_KEY); } catch (e) { /* 저장소 없음 */ }
      T.wipeAsk = false; paint(scrTitle());
    },
    career(v) {
      if (v !== 'retire') return career0(v);
      paint(`${bar()}<div class="pad">${card('정계 은퇴', '<p>정말 여기서 정치 인생을 끝내시겠습니까? 은퇴하면 이번 생은 되돌릴 수 없습니다.</p>')}${btn('retireSure', '', '은퇴한다', 'danger')}${btn('closeInfo', '', '아직은 아니다', 'primary')}</div>`);
    },
    retireSure() { career0('retire'); },
    load() {
      // 손상됐거나 예전 형식의 저장은 버리고 새로 시작한다
      let ok = false;
      try { const sv = JSON.parse(localStorage.getItem(SAVE_KEY)); ok = !!(sv && sv.v === 1 && sv.st && sv.w && sv.rec && sv.history); } catch (e) { ok = false; }
      if (!ok) { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 저장소 없음 */ } return H.new(); }
      load0();
    },
  });
})();

/* ───────── 선거 캠프: 상대 분석 → 전략 → 선대위원장 ───────── */
const OPP_TRAITS = [
  { id: 'incumbent', name: '현역 프리미엄', desc: '지역 조직이 탄탄하다', bonus: 2 },
  { id: 'parachute', name: '낙하산 공천', desc: '연고가 약해 바닥 민심이 차갑다', bonus: -2 },
  { id: 'scandal', name: '숨긴 약점', desc: '네거티브와 공약 검증이 두 배로 먹힌다', bonus: 0 },
  { id: 'mute', name: '토론 약체', desc: 'TV 토론에서 실수가 잦다', bonus: 0 },
  { id: 'machine', name: '조직의 달인', desc: '라운드가 갈수록 세를 불린다', bonus: 0 },
  { id: 'star', name: '스타 후보', desc: '인지도가 높고 토론도 강하다', bonus: 1.5 },
];
const NPC_CAMP = 9.0;
const STRATS = [
  { id: 'person', icon: '🧍', name: () => '인물론', desc: '"사람을 보고 뽑아 달라." 인지도와 호감도가 높을수록 유리', set(el) { el.kP = 1.5; } },
  { id: 'wave', icon: '🌊', name: () => (S.party && S.party === S.w.ruling ? '국정 안정론' : '정권 심판론'), desc: '전국 판세에 올라탄다. 대통령 지지율에 따라 약도 독도 된다', set(el) { el.kS = 2.2; if (S.party !== S.w.ruling && S.party !== mainOpp(S.w.ruling)) el.my += (50 - S.w.approval) * 0.06; } },
  { id: 'local', icon: '🏡', name: () => '지역 일꾼론', desc: '"우리 동네 사람." 지역 기반이 높을수록 유리', need: (el) => el.type !== 'pres', set(el) { el.kB = 2.2; } },
  { id: 'org', icon: '🕸️', name: () => '전국 조직 총동원', desc: '당내 입지가 높을수록 유리', need: (el) => el.type === 'pres' && !!S.party, set(el) { el.my += S.standing / 25; } },
  { id: 'money', icon: '💰', name: () => '물량 공세', desc: '현수막, 문자, 유세차. 정치자금 15를 태운다', cost: 15, need: () => S.funds >= 15, set(el) { el.my += 3; } },
];
const AIDES = [
  { id: 'org', icon: '🧮', name: '조직통', desc: '조직 동원·지원 유세·집중 유세·단지 순회 효과 +50%', ids: ['org', 'celeb', 'rally', 'door', 'alley'], mul: 1.5 },
  { id: 'strat', icon: '🧠', name: '전략통', desc: '여론조사 오차가 사라지고 네거티브 역풍을 막아 준다' },
  { id: 'pr', icon: '🎬', name: '홍보통', desc: '연설·SNS·예능·광고·라디오 효과 +40%', ids: ['speech', 'snsc', 'show', 'ad', 'youthtalk', 'radio'], mul: 1.4 },
];
// 캠프 출범 때 정해진 주 경쟁자. 단일화 등으로 사라지면 그다음 강한 후보
function mainRival(el) { return el.cands.find((c) => c.main) || el.cands.filter((c) => !c.me).sort((a, b) => rawOf(el, b) - rawOf(el, a))[0]; }
function myCand(el) { return el.cands.find((c) => c.me); }
function campIntro() {
  const el = T.el, r = mainRival(el), t = pick(OPP_TRAITS);
  r.main = true; r.trait = t.id; el.evDone = {};
  // 상대 캠프도 전략과 마지막 유세가 있다
  el.cands.forEach((c) => { if (!c.me) c.bonus = (c === r ? t.bonus + NPC_CAMP : PARTIES[c.party].kind === 'major' ? NPC_CAMP * 0.6 : 0); });
  el.poll = shares(el, false, true);
  show(scrStrategy);
}
function stratGain(el, st) { const c = Object.assign({}, el); st.set(c); return r1(rawOf(c, myCand(el)) - rawOf(el, myCand(el))); }
function scrStrategy() {
  const el = T.el, r = mainRival(el), t = OPP_TRAITS.find((x) => x.id === r.trait) || OPP_TRAITS[0];
  return `${bar()}<div class="pad"><h2 class="h">${el.place.name} <small>${el.by ? '보궐선거' : TYPE_NAME[el.type]} · 캠프 출범</small></h2>
    ${card('상대 분석', `<p><b style="color:${PARTIES[r.party].color}">${esc(r.name)}</b> <small>${PARTIES[r.party].name}</small></p><p><span class="tw mid">${t.name}</span> ${t.desc}.</p>${el.dirtHit ? `<p><span class="tw down">검증 공세</span> 상대 캠프가 당신의 약점을 파고든다 (−${el.dirtHit}%p).</p>` : ''}`)}
    ${card('출발선 여론조사', shareBars(el.poll) + '<p class="muted small">표본오차 ±3%p</p>')}
    <h2 class="h">선거 전략을 정하세요</h2>
    ${STRATS.filter((s) => !s.need || s.need(el)).map((s) => { const g = stratGain(el, s); return `<button class="row act" data-a="strat" data-v="${s.id}"><i>${s.icon}</i><div><b>${s.name()} <small>예상 ${g >= 0 ? '+' : ''}${g}%p</small></b><span>${s.desc}</span></div></button>`; }).join('')}</div>`;
}
function scrAide() {
  return `${bar()}<div class="pad">${card('선대위원장 영입', `<p>전략은 <b>${T.el.strat}</b>. 이제 캠프를 이끌 사람을 정할 차례다.</p>`)}
    ${AIDES.map((a) => `<button class="row act" data-a="aide" data-v="${a.id}"><i>${a.icon}</i><div><b>${a.name} 선대위원장</b><span>${a.desc}</span></div></button>`).join('')}</div>`;
}
function genLine(el) {
  const me = el.poll.find((r) => r.c.me).pct;
  const g = [me + (S.st.cha - 50) / 6 - (S.age - 45) / 6 - S.ideology / 25, me, me + (S.age - 45) / 8 + S.ideology / 14].map((v) => Math.round(clamp(v, 1, 90)));
  return `<div class="gen"><span>2030 <b>${g[0]}%</b></span><span>4050 <b>${g[1]}%</b></span><span>60대+ <b>${g[2]}%</b></span></div>`;
}

CAMP.push(
  { id: 'ad', name: '선거 광고 집행', desc: '정치자금 −12 · 확실한 효과', need: () => S.funds >= 12, run() { mod('funds', -12); return [2.4, '포털과 유튜브에 광고가 깔렸다.']; } },
  { id: 'door', name: '아파트 단지 순회', desc: '체력 기반 · 지역 기반 +', run(el) { mod('sta', -6); if (el.place.region) modBase(el.place.region, 2); return [1 + S.st.sta / 120, '경비실마다 들러 인사하고 놀이터에서 학부모들과 이야기했다.']; } },
  { id: 'radio', name: '라디오 생방송 인터뷰', desc: '화술 55 판정', run() { return judge('spk', 55) ? [2.2, '출근길 라디오 인터뷰가 호평을 받았다.'] : [-0.5, '진행자의 압박 질문에 버벅거렸다.']; } },
  { id: 'pledge_local', name: '지역 숙원 사업 공약', desc: '지역 기반이 높을수록 효과', need: () => T.el && T.el.type !== 'pres', run(el) { return [1 + baseOf(el.place.region) / 40, '수십 년 묵은 지역 숙원 사업을 1호 공약으로 내걸었다.']; } },
  { id: 'factcheck', name: '상대 공약 검증', desc: '지력 58 판정 · 성공 시 상대 지지 하락', run(el) { if (judge('int', 58)) { const r = mainRival(el); r.camp -= ri(1.5, 3) * (r.trait === 'scandal' ? 2 : 1); return [0.5, `${r.name} 후보 공약의 재원 구멍을 숫자로 짚었다.`]; } return [-0.5, '검증 자료에 오류가 있어 역공을 당했다.']; } },
  { id: 'rally', name: '대규모 집중 유세', desc: '정치자금 −8 · 당내 입지 기반', need: () => S.funds >= 8 && T.el && T.el.round >= 2, run() { mod('funds', -8); return [1.8 + S.standing / 50, '광장을 가득 메운 인파 사진이 신문 1면에 실렸다.']; } }
);
Object.assign(ICONS, { ad: '📺', door: '🏢', radio: '📻', pledge_local: '🌉', factcheck: '🔎', rally: '🏟️' });

/* 유세 중 돌발 상황 */
const CAMP_EVENTS = [
  { id: 'expose', title: '폭로전', text: (el) => `${mainRival(el).name} 캠프가 당신의 과거 의혹을 담은 보도자료를 뿌렸다. 기자들의 전화가 빗발친다.`,
    ch: () => [
      ['해명 기자회견을 연다', '화술 55 판정', (el) => { if (judge('spk', 55)) { el.my += 1.5; return '자료를 들고 30분간 하나하나 반박했다. 의혹은 힘을 잃었다.'; } el.my -= 2; return '해명이 꼬이면서 의혹만 키웠다.'; }],
      ['맞불 폭로로 응수한다', '상대 −, 내 호감도 −', (el) => { mainRival(el).camp -= 2; el.my -= 0.5; mod('favor', -3); return '진흙탕 싸움이 됐다. 둘 다 상처를 입었다.'; }],
      ['대응하지 않는다', '소폭 하락', (el) => { el.my -= 1; return '"네거티브에는 답하지 않겠다"고 했다. 일부는 수긍했고 일부는 의심했다.'; }],
    ] },
  { id: 'endorse', title: '부담스러운 지지 선언', text: () => '논란이 많은 거물 정치인이 당신을 공개 지지하겠다고 한다. 조직표는 확실한 사람이다.',
    ch: () => [
      ['받는다', '지지율 +, 호감도 −', (el) => { el.my += 2; mod('favor', -3); return '손을 맞잡고 사진을 찍었다. 조직이 움직이기 시작했다.'; }],
      ['정중히 사양한다', '호감도 +', (el) => { mod('favor', 2); el.my += 0.3; return '"마음만 받겠습니다." 소신 있다는 평이 나왔다.'; }],
    ] },
  { id: 'law', title: '선거법 위반 논란', text: () => '자원봉사자가 유권자에게 음료를 돌린 사실이 알려졌다. 선관위가 조사에 착수했다.',
    ch: () => [
      ['즉시 사과하고 시정한다', '소폭 하락', (el) => { el.my -= 0.5; mod('favor', 1); return '당일 사과하고 해당 봉사자를 캠프에서 내보냈다.'; }],
      ['선관위 판단을 기다린다', '도박', (el) => { if (chance(0.5)) return '선관위가 "경미한 사안"으로 종결했다.'; el.my -= 2.5; return '선관위가 경고 조치를 내렸다. 상대 캠프가 현수막을 내걸었다.'; }],
    ] },
  { id: 'cash', cond: () => S.funds < 15, title: '캠프 자금난', text: () => '회계 책임자가 조용히 말한다. "후보님, 다음 주 유세차 대금이 없습니다."',
    ch: () => [
      ['후원 호소 영상을 찍는다', '매력 55 판정', (el) => { if (judge('cha', 55)) { mod('funds', 12); el.my += 1; return '"만 원의 기적" 영상에 소액 후원이 쏟아졌다.'; } el.my -= 0.5; return '영상은 구걸처럼 보였다.'; }],
      ['사비를 턴다', '자금 +, 체력 −', () => { mod('funds', 10); mod('sta', -5); return '적금을 깼다. 가족에게는 아직 말하지 못했다.'; }],
      ['유세 규모를 줄인다', '소폭 하락', (el) => { el.my -= 1; return '유세차를 한 대로 줄였다.'; }],
    ] },
  { id: 'health', cond: () => S.st.sta < 45, title: '후보 과로', text: () => '유세 도중 눈앞이 핑 돌았다. 수행비서가 팔을 붙잡았다.',
    ch: () => [
      ['하루 쉰다', '체력 +, 소폭 하락', (el) => { mod('sta', 12); el.my -= 1; return '하루를 통째로 쉬었다. 상대는 그날 유세를 세 번 했다.'; }],
      ['링거를 맞고 강행한다', '도박', (el) => { mod('sta', -8); if (chance(0.6)) { el.my += 1.5; return '링거 투혼 사진이 지지층을 뭉치게 했다.'; } el.my -= 2; return '유세차 위에서 주저앉았다. 건강 이상설이 돌았다.'; }],
    ] },
  { id: 'tv3', title: '방송 3사 합동 인터뷰', text: () => '방송 3사가 후보 릴레이 인터뷰를 생중계한다. 시청률이 두 자릿수다.',
    ch: () => [
      ['출연한다', '미니게임 · 크게 오르내린다', (el, score) => { const d = r1((score - 45) / 18); el.my += d; return score >= 70 ? '막힘 없는 답변이었다. 시청자 게시판이 호평으로 덮였다.' : score >= 40 ? '무난하게 마쳤다.' : '핵심 질문에서 동문서답했다.'; }, 'timing'],
      ['서면 답변으로 대신한다', '소폭 하락', (el) => { el.my -= 0.8; return '"토론을 피한다"는 말이 나왔다.'; }],
    ] },
  { id: 'fanmess', title: '지지자의 막말', text: () => '당신의 열성 지지자가 상대 후보 지지자에게 한 혐오 발언이 영상으로 퍼졌다.',
    ch: () => [
      ['즉시 선을 긋는다', '호감도 +', (el) => { mod('favor', 2); el.my -= 0.3; return '"그런 지지는 받지 않겠다"고 밝혔다.'; }],
      ['침묵한다', '도박', (el) => { if (chance(0.4)) { el.my -= 2.5; return '침묵이 동조로 읽혔다.'; } return '다른 뉴스에 묻혀 지나갔다.'; }],
    ] },
  { id: 'rain', title: '유세 당일 폭우', text: () => '오늘 최대 규모 유세가 잡혀 있는데 호우 경보가 떴다.',
    ch: () => [
      ['빗속에서 강행한다', '체력 −, 지지율 +', (el) => { mod('sta', -8); el.my += 1.5; return '우비도 없이 마이크를 잡았다. 젖은 머리로 외치는 사진이 퍼졌다.'; }],
      ['실내 간담회로 바꾼다', '소폭 상승', (el) => { el.my += 0.5; return '경로당에서 조촐한 간담회를 열었다.'; }],
    ] },
  { id: 'shock', title: '충격 여론조사', text: (el) => (el.poll[0].c.me ? '한 여론조사에서 당신이 오차범위 밖 선두로 나왔다. 캠프가 들떠 있다.' : '한 여론조사에서 격차가 더 벌어진 것으로 나왔다. 캠프 분위기가 가라앉았다.'),
    ch: (el) => (el.poll[0].c.me ? [
      ['몸조심하며 굳힌다', '안전', (e) => { e.my += 0.5; return '실수하지 않는 선거로 방향을 잡았다.'; }],
      ['압승을 노리고 몰아친다', '도박', (e) => { if (chance(0.5)) { e.my += 2; return '기세를 몰아 상대 텃밭까지 파고들었다.'; } e.my -= 1.5; return '오만하다는 역풍이 불었다.'; }],
    ] : [
      ['캠프를 쇄신한다', '정치력 55 판정', (e) => { if (judge('pol', 55)) { e.my += 2; return '본부장을 교체하고 메시지를 새로 짰다. 분위기가 살아났다.'; } e.my -= 1; return '인선 다툼으로 캠프가 사흘을 허비했다.'; }],
      ['큰절 유세로 읍소한다', '매력 55 판정', (e) => { if (judge('cha', 55)) { e.my += 1.5; return '"한 번만 기회를 달라"는 호소가 통했다.'; } return '이미 여러 번 본 장면이라는 반응이었다.'; }],
      ['묵묵히 하던 대로 한다', '변화 없음', () => '흔들리지 않고 일정을 소화했다.'],
    ]) },
  { id: 'unifypush', cond: (el) => !!unifyTarget(el), title: '단일화 압박', text: (el) => `지지층에서 ${unifyTarget(el).name} 후보와 단일화하라는 요구가 거세다. "이대로면 어부지리를 준다."`,
    ch: () => [
      ['여론조사 방식 단일화를 제안한다', '도박 · 이기면 상대 사퇴', (el) => { const t = unifyTarget(el); if (chance(clamp(0.45 + (S.fame - 40) / 150, 0.2, 0.85))) { el.my += baseVote(t.party, el.place.L) * 0.6; el.cands = el.cands.filter((c) => c !== t); return `단일화 여론조사에서 이겼다. ${t.name} 후보가 사퇴하고 지지를 선언했다.`; } el.my -= 1.5; return '룰 협상만 하다 결렬됐다. 서로 감정만 상했다.'; }],
      ['완주를 선언한다', '변화 없음', () => '"끝까지 간다"고 못박았다.'],
    ] },
];
function scrCampEvent() {
  const el = T.el, e = el.ev;
  return `${bar()}<div class="pad brk"><div class="brk-tag">유세 돌발</div>${card(e.title, `<p>${e.text(el)}</p>`)}
    ${e.ch(el).map((c, i) => `<button class="row" data-a="campEv" data-v="${i}"><b>${c[0]}</b><span>${hint(c[1])}</span></button>`).join('')}</div>`;
}
function scrFinale() {
  return `${bar()}<div class="pad">${card('선거 전날', '<p>공식 선거운동 마지막 날. 자정이면 마이크가 꺼진다. 마지막 유세를 어디에 쓸 것인가.</p>')}
    <button class="row act" data-a="finale" data-v="safe"><i>${ic('house')}</i><div><b>본거지에서 굳힌다</b><span>확실한 소폭 상승</span></div></button>
    <button class="row act" data-a="finale" data-v="swing"><i>${ic('target')}</i><div><b>취약 지역에 총력전</b><span>도박. 크게 오르거나 헛심</span></div></button>
    <button class="row act" data-a="finale" data-v="nonstop"><i>${ic('clock')}</i><div><b>48시간 무박 유세</b><span>미니게임 · 체력 −15</span></div></button></div>`;
}
(() => {
  const elDone0 = H.elDone;
  Object.assign(H, {
    strat(v) {
      const el = T.el, st = STRATS.find((s) => s.id === v);
      if (!st || el.strat) return;
      resetD(); if (st.cost) mod('funds', -st.cost);
      st.set(el); el.strat = st.name();
      show(scrAide);
    },
    aide(v) { const el = T.el; if (el.aide) return; el.aide = v; el.poll = shares(el, false, v !== 'strat'); show(scrCampaign); },
    elNext() {
      const el = T.el;
      const debDue = (el.type === 'pres' ? el.round === 3 || el.round === 6 : el.round === 2) && !el.debDone[el.round];
      if (el.round >= 1 && el.round < el.rounds && !el.evDone[el.round]) {
        el.evDone[el.round] = true;
        const pool = CAMP_EVENTS.filter((e) => !(el.evUsed || []).includes(e.id) && (!e.cond || e.cond(el)));
        if (pool.length && chance(0.55)) { el.ev = pick(pool); (el.evUsed = el.evUsed || []).push(el.ev.id); fx('flash'); return show(scrCampEvent); }
      }
      if (el.round >= el.rounds && !debDue && !el.finale) return show(scrFinale);
      elNext();
    },
    campEv(v) {
      const el = T.el, c = el.ev.ch(el)[+v];
      if (!c) return;
      const done = (score) => {
        resetD();
        const before = el.my, rb = mainRival(el).camp;
        const text = c[2](el, score);
        const d = r1(el.my - before), rd = r1(mainRival(el).camp - rb);
        el.poll = shares(el, false, el.aide !== 'strat');
        T.lines = [(score != null ? miniTag(score) : '') + text];
        if (d || rd) T.lines.push(`${d ? `내 지지율 ${d > 0 ? '+' : ''}${d}%p` : ''}${d && rd ? ' · ' : ''}${rd ? `상대 ${rd > 0 ? '+' : ''}${rd}%p` : ''}`);
        show(() => scrResult(el.ev.title, T.lines, 'elNext'));
        if (d <= -2) fx('shake');
      };
      if (c[3]) mini(c[3], el.ev.title, done); else done();
    },
    finale(v) {
      const el = T.el; if (el.finale) return;
      el.finale = true;
      const done = (score) => {
        resetD();
        let d, text;
        if (v === 'safe') { d = 0.8; text = '고향 시장 한복판에서 마지막 마이크를 잡았다. 익숙한 얼굴들이 끝까지 자리를 지켰다.'; }
        else if (v === 'swing') { if (chance(0.5)) { d = 2.5; text = '가장 약한 동네에서 뜻밖의 환대를 받았다.'; } else { d = -0.5; text = '유세장은 썰렁했다. 시간만 썼다.'; } }
        else { mod('sta', -15); d = r1((score - 30) / 22); text = score >= 70 ? '이틀 밤을 새워 모든 동을 돌았다. 자정 직전, 목이 완전히 나갔다.' : score >= 40 ? '마흔 시간쯤 버텼다. 마지막 유세는 수행팀이 대신 외쳤다.' : '새벽 세 시, 유세차 안에서 잠들어 버렸다.'; }
        el.my += d;
        T.lines = [(score != null ? miniTag(score) : '') + text, '자정. 마이크가 꺼졌다. 이제 할 수 있는 일은 없다.'];
        show(() => scrResult('마지막 유세', T.lines, 'elNext'));
      };
      if (v === 'nonstop') mini('tap', '48시간 무박 유세', done); else done();
    },
    // 개표가 끝난 뒤: 당선 소감 또는 승복 연설
    elDone() {
      const el = T.el;
      if (!el || el.spoke || !el.final) return elDone0();
      const me = el.final.find((r) => r.c.me), gap = r1(el.final[0].pct - me.pct);
      show(() => (T.elWon
        ? `${bar()}<div class="pad">${card('당선 소감', '<p>카메라 수십 대가 당신을 향해 있다. 첫마디를 무엇으로 할 것인가.</p>')}
          <button class="row" data-a="speech" data-v="humble"><b>"더 낮은 자세로 일하겠습니다"</b><span>호감도 +</span></button>
          <button class="row" data-a="speech" data-v="victory"><b>"국민이 심판하셨습니다"</b><span>인지도 +, 성향 강화</span></button>
          <button class="row" data-a="speech" data-v="unity"><b>"저를 찍지 않은 분들의 대표도 되겠습니다"</b><span>호감도 +, 중도 이동, 당내 입지 −</span></button></div>`
        : `${bar()}<div class="pad">${card('패배의 밤', `<p>${gap}%p 차이. 캠프 사무실에 남은 사람들이 당신의 입을 보고 있다.</p>`)}
          <button class="row" data-a="speech" data-v="concede"><b>깨끗이 승복한다</b><span>호감도 +</span></button>
          <button class="row" data-a="speech" data-v="tears"><b>지지자들과 함께 운다</b><span>인지도 +, 지역 기반 +</span></button>
          <button class="row" data-a="speech" data-v="recount"${gap <= 3 ? '' : ' disabled'}><b>재검표를 요구한다</b><span>${gap <= 3 ? '인지도 +, 호감도 −' : '격차가 3%p 이내일 때만 가능'}</span></button></div>`));
    },
    speech(v) {
      const el = T.el; if (!el || el.spoke) return;
      el.spoke = true; resetD();
      const out = {
        humble: () => { mod('favor', 3); return '고개를 깊이 숙였다. 그 장면이 다음 날 조간 1면 사진이 됐다.'; },
        victory: () => { mod('fame', 3); mod('ideology', ownSign() * 3); return '주먹을 치켜들었다. 지지자들의 함성이 건물을 흔들었다.'; },
        unity: () => { mod('favor', 2); mod('ideology', -Math.sign(S.ideology) * 3); gainStanding(-2); return '상대 후보에게 먼저 전화를 걸었다고 밝혔다.'; },
        concede: () => { mod('favor', 4); return '"제가 부족했습니다. 당선인께 축하를 전합니다." 박수 속에 단상을 내려왔다.'; },
        tears: () => { mod('fame', 2); mod('favor', 1); if (el.place.region) modBase(el.place.region, 3); return '끝까지 남은 사람들과 한 명씩 포옹했다. "다음에는 꼭"이라는 말을 백 번쯤 들었다.'; },
        recount: () => { mod('fame', 3); mod('favor', -4); return '재검표를 요구했다. 결과는 달라지지 않았고 "불복"이라는 꼬리표가 붙었다.'; },
      }[v];
      if (!out) return;
      T.lines = [out()];
      show(() => scrResult(T.elWon ? '당선 소감' : '승복 연설', T.lines, 'elDone'));
    },
  });
})();
