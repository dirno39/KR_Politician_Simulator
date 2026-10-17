// 이번 생은 정치다 — 프로토타입 게임 로직
// 화면은 전부 #app 안에 문자열로 그리고, 버튼은 data-a / data-v 로 핸들러(H)에 연결한다.

let S = null;          // 저장되는 게임 상태
let T = { d: {}, db: {} }; // 저장하지 않는 화면 상태
const SAVE_KEY = 'jc_sim_save_v1';
const TEST = typeof globalThis.__TEST !== 'undefined';

const STAT_NAME = { int: '지력', cha: '매력', spk: '화술', pol: '정치력', sta: '체력' };
const KEY_NAME = Object.assign({ fame: '인지도', favor: '호감도', funds: '정치자금', standing: '당내 입지', ideology: '성향', approval: '국정 지지율' }, STAT_NAME);
const ROLE_NAME = { none: '원외 정치인', mp: '국회의원', city: '시장', metro: '광역시장', gov: '도지사', president: '대통령', tv: '방송인', abroad: '유학 중' };
const TYPE_ROLE = { general: 'mp', city: 'city', metro: 'metro', gov: 'gov', pres: 'president' };
const TYPE_NAME = { general: '국회의원 선거', city: '시장 선거', metro: '광역시장 선거', gov: '도지사 선거', pres: '대통령 선거' };

/* ───────── 유틸 ───────── */
function rnd() {
  let t = (S.rng += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const ri = (a, b) => a + rnd() * (b - a);
const rint = (a, b) => Math.floor(ri(a, b + 1));
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const chance = (p) => rnd() < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = (v) => Math.round(v * 10) / 10;
const delay = (fn, ms) => (TEST ? fn() : setTimeout(fn, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function getK(k) { return k in STAT_NAME ? S.st[k] : k === 'approval' ? S.w.approval : S[k]; }
function setK(k, v) { if (k in STAT_NAME) S.st[k] = v; else if (k === 'approval') S.w.approval = v; else S[k] = v; }
function mod(k, v) {
  if (!v) return;
  if (k === 'favor' && v < 0 && S.concept === 'lawyer') v *= 0.8;
  if (k === 'standing' && !S.party) return;
  if (T.jit && Math.abs(v) >= 2 && k !== 'ideology' && k !== 'funds') v *= ri(0.8, 1.2);
  if (T.boost > 1 && v > 0 && k !== 'ideology') v *= T.boost;
  if (v > 0 && (k === 'fame' || k === 'favor' || k === 'standing')) { const c = getK(k); v *= c >= 80 ? 0.5 : c >= 60 ? 0.75 : 1; }
  const lim = k === 'ideology' ? [-100, 100] : k === 'favor' ? [0, S.favorCap == null ? 100 : S.favorCap] : [0, 100];
  const before = getK(k);
  setK(k, r1(clamp(before + v, lim[0], lim[1])));
  T.d[k] = r1((T.d[k] || 0) + getK(k) - before);
}
function baseOf(region) { return S.base[region] || 0; }
function modBase(region, v) {
  if (v > 0 && S.focus === 'localist') v *= 1.5;
  if (T.boost > 1 && v > 0) v *= T.boost;
  const before = baseOf(region);
  S.base[region] = r1(clamp(before + v, 0, 100));
  T.db[region] = r1((T.db[region] || 0) + S.base[region] - before);
}
function grow(stat, amt) {
  const a = S.age;
  let m = a < 30 ? 1.3 : a < 40 ? 1.15 : a < 50 ? 1.0 : a < 60 ? 0.6 : 0;
  const f = FOCUS.find((x) => x.id === S.focus);
  if (f && f.stats.includes(stat)) m *= 1.5;
  const cur = S.st[stat];
  m *= 0.85 * (cur >= 85 ? 0.3 : cur >= 75 ? 0.5 : cur >= 62 ? 0.75 : 1); // 높을수록 올리기 어렵다
  mod(stat, amt * m);
}
function gainStanding(v) { mod('standing', v > 0 && S.focus === 'boss' ? v * 1.5 : v); }
function ovr() { return Math.round((S.st.int + S.st.cha + S.st.spk + S.st.pol) / 4); }
function log(t) { S.history.push({ y: S.year, h: S.half, age: Math.floor(S.age), t, p: S.party, r: S.role }); }
function resetD() { T.d = {}; T.db = {}; T.judge = null; }
function ownSign() { return S.party ? Math.sign(PARTIES[S.party].ideo) : Math.sign(S.ideology); }
function mainOpp(p) { return p === 'simin' ? 'bosu' : p === 'bosu' ? 'simin' : null; }
function myRegion() { return S.seat ? S.seat.region : S.home; }
function leanWord() {
  const i = S.ideology;
  return i <= -60 ? '강경 진보' : i <= -20 ? '진보' : i < -5 ? '중도 진보' : i <= 5 ? '중도' : i < 20 ? '중도 보수' : i < 60 ? '보수' : '강경 보수';
}

/* ───────── 선거 일정 ───────── */
function electionsAt(y, h) {
  if (h !== 1) return [];
  const r = [];
  if ((y - 2030) % 5 === 0) r.push('pres');
  if ((y - 2028) % 4 === 0) r.push('general');
  if ((y - 2030) % 4 === 0) r.push('local');
  return r;
}
function nextElection() {
  let y = S.year, h = S.half;
  for (let i = 0; i < 12; i++) {
    const e = electionsAt(y, h);
    if (e.length && !(i === 0 && S.elDone)) {
      const nm = e.map((x) => ({ pres: '대선', general: '총선', local: '지선' }[x])).join('·');
      return i === 0 ? `이번 턴 ${nm}` : `${nm}까지 ${i}턴`;
    }
    if (h === 1) h = 2; else { h = 1; y++; }
  }
  return '';
}

/* ───────── 화면 공통 ───────── */
function show(fn, name) {
  const same = !!name && T.curName === name;
  T.cur = fn; T.curName = name || '';
  paint(fn(), same);
}
function paint(html, still) {
  T.html = html;
  const el = document.getElementById('app');
  if (el.classList) el.classList.toggle('still', !!still);
  el.innerHTML = html;
  if (!still && typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
}
// 화면 효과: confetti(당선), shake(악재), flash(속보), gloom(낙선)
function fx(kind) {
  if (TEST || typeof document === 'undefined' || !OPTS.fx) return;
  const app = document.getElementById('app'), layer = document.getElementById('fx');
  if (!app || !layer) return;
  if (kind === 'confetti') {
    const cols = ['#f2c14e', '#2f6fd0', '#d0402f', '#2a9d6a', '#ffffff'];
    let h = '';
    for (let i = 0; i < 46; i++) h += `<i class="cf" style="left:${Math.random() * 100}%;background:${cols[i % 5]};animation-delay:${Math.random() * 0.7}s;animation-duration:${1.8 + Math.random() * 1.4}s"></i>`;
    layer.innerHTML = h;
    setTimeout(() => { layer.innerHTML = ''; }, 3600);
  } else {
    app.classList.remove('fx-' + kind); void app.offsetWidth; app.classList.add('fx-' + kind);
    setTimeout(() => app.classList.remove('fx-' + kind), 1000);
  }
  try { if (OPTS.vib && navigator.vibrate) navigator.vibrate(kind === 'confetti' ? [60, 40, 140] : 80); } catch (e) { /* 진동 미지원 */ }
}
function fillStyle(key, pct, color) {
  T.pw = T.pw || {};
  const prev = key in T.pw ? T.pw[key] : 0;
  T.pw[key] = pct;
  return `--from:${prev}%;--to:${pct}%;background:${color}`;
}
function goHome() { rollOffer(); T.picks = []; show(scrHome, 'home'); }
function btn(a, v, label, cls, disabled) {
  return `<button class="btn ${cls || ''}" data-a="${a}" data-v="${v == null ? '' : esc(v)}"${disabled ? ' disabled' : ''}>${label}</button>`;
}
function partyChip(p) {
  if (!p) return `<span class="chip" style="background:#666">무소속</span>`;
  return `<span class="chip" style="background:${PARTIES[p].color}">${PARTIES[p].name}</span>`;
}
function bar() {
  const role = S.role === 'none' || S.role === 'tv' || S.role === 'abroad' || S.role === 'president'
    ? ROLE_NAME[S.role] : S.seat ? S.seat.name + (S.role === 'mp' ? ' 국회의원' : '') : ROLE_NAME[S.role];
  return `<header class="bar">
    <div class="bar-row"><b>${S.year}년 ${S.half === 1 ? '상반기' : '하반기'}</b><span>${esc(S.name)} · 만 ${Math.floor(S.age)}세</span>${btn('info', '', '내 정보', 'mini')}</div>
    <div class="bar-row sub">${partyChip(S.party)}<span>${role}${S.leader ? ' · 당대표' : ''}</span><span class="muted">${nextElection()}</span></div>
  </header>`;
}
function gauge(label, v, color) {
  return `<div class="gauge"><span>${label}</span><div class="track"><div class="fill" style="${fillStyle('g:' + label, clamp(v, 0, 100), color)}"></div></div><b>${Math.round(v)}</b></div>`;
}
function ideoBar() {
  const x = (S.ideology + 100) / 2;
  return `<div class="ideo"><span>진보</span><div class="track"><div class="pin" style="left:${x}%"></div></div><span>보수</span><b>${leanWord()}</b></div>`;
}
function deltas() {
  const out = [];
  for (const k in T.d) {
    const v = T.d[k]; if (Math.abs(v) < 0.05) continue;
    if (k === 'ideology') { out.push(`<span class="dl">성향 ${v < 0 ? '진보' : '보수'} 쪽 ${Math.abs(v)}</span>`); continue; }
    out.push(`<span class="dl ${(v > 0) !== (k === 'dirt') ? 'up' : 'down'}">${KEY_NAME[k]} ${v > 0 ? '+' : ''}${v}</span>`);
  }
  for (const k in T.db) {
    const v = T.db[k]; if (Math.abs(v) < 0.05) continue;
    out.push(`<span class="dl ${v > 0 ? 'up' : 'down'}">${REGIONS[k]} 기반 ${v > 0 ? '+' : ''}${v}</span>`);
  }
  return out.length ? `<div class="dls">${out.join('')}</div>` : '';
}
function card(title, body, foot) {
  return `<section class="card">${title ? `<h2>${title}</h2>` : ''}${body}${foot || ''}</section>`;
}

/* ───────── 시작 플로우 ───────── */
function scrTitle() {
  let has = false;
  try { has = !!localStorage.getItem(SAVE_KEY); } catch (e) { /* 저장소 없음 */ }
  return `<div class="title"><p class="kicker">정치인 인생 시뮬레이션</p><h1>이번 생은<br>정치다</h1>
    <p class="muted">2027년 1월, 정계에 입문한다.<br>은퇴하는 날 당신은 어떤 정치인으로 기억될까.</p>
    ${btn('new', '', '새 인생 시작', 'primary')}${has ? btn('load', '', '이어하기') : ''}${btn('dex', '', `칭호 도감 ${dexLoad().length}/${ALL_TITLES.length}`)}<div class="two">${btn('help', '', '게임 방법')}${btn('opts', '', '설정')}</div>
    <p class="fine">이 게임의 정당과 인물은 모두 가상이며 실제와 무관합니다. 선거 제도와 일정만 현실을 참고했습니다.</p></div>`;
}
function scrSetup() {
  const f = T.setup;
  const opt = (key, v, label) => `<button class="opt ${f[key] === v ? 'on' : ''}" data-a="setup" data-v="${key}:${v}">${label}</button>`;
  return `<div class="pad">${card('1. 기본 설정', `
    <label class="fld">이름<input id="nm" maxlength="8" value="${esc(f.name)}" placeholder="이름 (최대 8자)"></label>
    <div class="fld">성별<div class="opts">${opt('gender', '남자', '남자')}${opt('gender', '여자', '여자')}</div></div>
    <div class="fld">연고지 <span class="muted">(지역 기반 +15)</span><div class="opts wrap">${Object.keys(REGIONS).map((k) => opt('home', k, REGIONS[k])).join('')}</div></div>`)}
    ${btn('setupDone', '', '다음: 컨셉 카드 뽑기', 'primary')}</div>`;
}
function drawCards() {
  const pool = CONCEPTS.slice();
  const three = [];
  for (let i = 0; i < 3; i++) three.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  const hi = rint(0, 2);
  return three.map((c, i) => {
    const r = rnd();
    const grade = i === hi ? (r < 0.3 ? 'S' : 'A') : r < 0.1 ? 'S' : r < 0.4 ? 'A' : r < 0.7 ? 'B' : 'C';
    return { id: c.id, grade, hi: i === hi };
  });
}
function conceptOf(id) { return CONCEPTS.find((c) => c.id === id); }
function scrCards() {
  return `<div class="pad"><h2 class="h">2. 컨셉 카드</h2><p class="muted">정계 입문 당시의 당신입니다. 한 장을 고르세요.</p>
    ${T.cards.map((k, i) => {
      const c = conceptOf(k.id), b = GRADE_BONUS[k.grade];
      const st = c.st.map((v, j) => (j < 4 ? v + b : v));
      return `<button class="cc g${k.grade}" style="--i:${i}" data-a="card" data-v="${i}">
        <div class="cc-top"><span class="grade">${k.grade}</span><b>${AVATAR[c.id]} ${c.name}</b><span class="muted">${c.age}세 · ${k.hi ? '상급' : '중급'}</span></div>
        <p>${c.blurb}</p>
        <div class="cc-st"><span>지력 ${st[0]}</span><span>매력 ${st[1]}</span><span>화술 ${st[2]}</span><span>정치력 ${st[3]}</span><span>체력 ${st[4]}</span><span>인지도 ${c.fame + (k.grade === 'S' ? 5 : 0)}</span></div>
        <p class="trait">${c.trait}</p></button>`;
    }).join('')}</div>`;
}
function scrFocus() {
  return `<div class="pad"><h2 class="h">3. 성장 방향</h2><p class="muted">앞으로 어떤 정치인으로 크고 싶은가요?</p>
    ${FOCUS.map((f) => `<button class="row" data-a="focus" data-v="${f.id}"><b>${f.name}</b><span>${f.desc}</span></button>`).join('')}</div>`;
}
function scrParty() {
  const list = PARTY_BY_LEAN[S.lean];
  return `<div class="pad"><h2 class="h">5. 정당 선택</h2><p class="muted">${S.lean} 성향으로 입당할 수 있는 정당입니다.</p>
    ${list.map((p) => `<button class="row" data-a="party" data-v="${p}"><b style="color:${PARTIES[p].color}">${PARTIES[p].name} <small>${PARTIES[p].seats}석</small></b><span>${PARTIES[p].desc}</span></button>`).join('')}
    <button class="row" data-a="party" data-v=""><b>무소속</b><span>공천 걱정은 없지만 정당 기본표도 없다 (하드 모드)</span></button></div>`;
}
function scrBrief() {
  return `<div class="pad">${card('2027년 1월, 대한민국', `
    <p>더불어시민당 정권 3년 차. 대통령 국정 지지율은 <b>${Math.round(S.w.approval)}%</b>.</p>
    <p>국회 300석은 더불어시민당 150, 보수의힘 120, 우리혁신당 20, 민주노동당 5, 한국공화당 5석. 지난해 지방선거에서도 여당이 광역단체장 16곳 중 12곳을 가져갔다.</p>
    <p>첫 관문은 <b>2028년 4월 총선</b>, 2턴 뒤다. 2030년 상반기에는 대선과 지방선거가 함께 열린다.</p>
    <p class="muted">한 턴은 6개월. 매 턴 행동 2개를 고르고, 선거가 오면 출마 여부를 정한다.</p>`)}
    ${btn('begin', '', '정치 인생 시작', 'primary')}</div>`;
}

/* ───────── 일반 턴 ───────── */
const ACTIONS = [
  { id: 'ground', roles: ['none'], name: '지역 바닥 다지기', desc: '연고지 기반 +, 체력 −',
    run() { modBase(S.home, 6); mod('sta', -6); mod('fame', 1); return '새벽 인력시장부터 저녁 상가 모임까지 돌았다.'; } },
  { id: 'partywork', roles: ['none', 'mp'], need: () => !!S.party, name: '당무 활동', desc: '당내 입지 +, 정치력 성장',
    run() { gainStanding(6); grow('pol', 1.5); return '당 행사와 회의에 빠짐없이 얼굴을 비쳤다.'; } },
  { id: 'panel', roles: ['none', 'mp', 'tv'], name: '방송 패널 출연', desc: '인지도 +, 화술 성장. 말실수 위험',
    run() {
      mod('fame', S.concept === 'anchor' ? 7 : 5); grow('spk', 1.5); if (S.role === 'tv') mod('funds', 6);
      if (chance(S.st.spk < 50 ? 0.2 : 0.08)) { mod('favor', -4); return '시사 프로그램에 나갔다가 말실수가 클립으로 돌았다.'; }
      return '시사 프로그램 패널로 출연했다. 섭외 전화가 조금 늘었다.';
    } },
  { id: 'study', roles: ['none', 'mp', 'city', 'metro', 'gov'], name: '정책 공부', desc: '지력 성장',
    run() { grow('int', 2.2); return '전문가들과 세미나를 열고 보고서를 쌓아 두고 읽었다.'; } },
  { id: 'book', roles: ['none', 'mp', 'tv'], name: '출판기념회', desc: '정치자금 ++, 호감도 −',
    run() { mod('funds', 15); mod('favor', -2); dirt(2, '출판기념회 봉투'); return '출판기념회를 열었다. 책보다 봉투가 더 많이 오갔다는 뒷말이 나왔다.'; } },
  { id: 'sns', roles: ['none', 'mp', 'city', 'metro', 'gov', 'tv'], name: 'SNS 활동', desc: '인지도 +, 매력 성장. 논란 위험',
    run() {
      mod('fame', S.concept === 'youth' ? 6 : 3); grow('cha', 1);
      if (chance(S.concept === 'influencer' ? 0.3 : 0.15)) { mod('favor', -5); mod('fame', 2); return '올린 글이 논란이 됐다. 조회수는 역대 최고였다.'; }
      return '짧은 영상 몇 개가 알고리즘을 탔다.';
    } },
  { id: 'rest', roles: ['none', 'mp', 'city', 'metro', 'gov', 'president', 'tv'], name: '휴식', desc: '체력 ++',
    run() { mod('sta', 18); return '모처럼 일정을 비우고 쉬었다.'; } },
  { id: 'bill', roles: ['mp'], name: '법안 발의', desc: '의정 실적 +, 호감도 +',
    run() { S.term.bills++; S.rec.bills++; grow('int', 1); mod('favor', 2); mod('fame', 1); return '대표 발의한 법안이 상임위에 올라갔다.'; } },
  { id: 'question', roles: ['mp'], name: '상임위 질의', desc: '인지도 +, 화술 성장',
    run() { grow('spk', 1.5); mod('fame', 3); return '장관을 상대로 한 질의 장면이 뉴스에 나갔다.'; } },
  { id: 'petition', roles: ['mp'], name: '지역구 민원 해결', desc: '지역 기반 +',
    run() { modBase(S.seat.region, 5); mod('favor', 1); mod('sta', -4); return '주말마다 지역구에 내려가 민원을 들었다.'; } },
  { id: 'attack', roles: ['mp', 'none'], need: () => !!S.party && S.role !== 'president', name: () => (S.party === S.w.ruling ? '정부 엄호' : '대정부 공세'), desc: '인지도 +, 당내 입지 +, 성향 강화',
    run() { mod('fame', 4); gainStanding(3); mod('ideology', ownSign() * 4); return S.party === S.w.ruling ? '야당의 공세를 앞장서서 받아쳤다.' : '정부 실정을 앞장서서 비판했다.'; } },
  { id: 'audit', roles: ['mp'], need: () => S.half === 2, name: '국정감사', desc: '하반기 전용. 화술 판정으로 스타 탄생',
    run() {
      if (S.st.spk + S.st.int + ri(-30, 30) > 115) { mod('fame', 8); mod('favor', 2); grow('spk', 1); return '국감장에서 터뜨린 한 방으로 "국감 스타"가 됐다.'; }
      mod('fame', 1); return '국감을 준비했지만 다른 의원에게 주목이 쏠렸다.';
    } },
  { id: 'budget', roles: ['mp'], need: () => S.half === 2, name: '지역 예산 확보', desc: '하반기 전용. 지역 기반 ++',
    run() {
      if (S.st.pol + S.standing / 2 + ri(-20, 20) > 70) { modBase(S.seat.region, 9); return '예결위를 설득해 지역 숙원 사업 예산을 따냈다.'; }
      modBase(S.seat.region, 2); return '쪽지 예산을 밀어 넣었지만 대부분 삭감됐다.';
    } },
  { id: 'fund', roles: ['mp', 'city', 'metro', 'gov'], name: '후원회 행사', desc: '정치자금 +',
    run() { mod('funds', 12); return '후원회 밤을 열었다.'; } },
  { id: 'pledge', roles: ['city', 'metro', 'gov'], name: '공약 사업 추진', desc: '공약 이행률 +',
    run() { S.term.pledge += 8 + S.st.int / 10; mod('favor', 1); return '핵심 공약 사업의 첫 삽을 떴다.'; } },
  { id: 'invest', roles: ['city', 'metro', 'gov'], name: '기업 유치', desc: '지력·정치력 판정. 성공 시 기반·호감 +',
    run() {
      if ((S.st.int + S.st.pol) / 2 + ri(-25, 25) > 55) { modBase(S.seat.region, 6); mod('favor', 3); mod('fame', 2); S.term.pledge += 6; return '대기업 공장 유치 협약을 맺었다.'; }
      mod('favor', -2); return '유치전에서 다른 지자체에 밀렸다.';
    } },
  { id: 'field', roles: ['city', 'metro', 'gov'], name: '현장 행정', desc: '지역 기반 +, 체력 −',
    run() { modBase(S.seat.region, 5); mod('favor', 2); mod('sta', -8); return '민원 현장을 직접 돌며 즉석에서 해결책을 내놨다.'; } },
  { id: 'promo', roles: ['city', 'metro', 'gov'], name: '치적 홍보', desc: '인지도 +, 호감도 −',
    run() { mod('fame', 4); mod('favor', -1); return '성과를 알리는 광고를 내걸었다.'; } },
  { id: 'ag_econ', roles: ['president'], name: '경제 의제 추진', desc: '지력 판정. 성공 시 지지율 +', run() { return agenda('int', '경제'); } },
  { id: 'ag_sec', roles: ['president'], name: '외교·안보 의제 추진', desc: '정치력 판정', run() { return agenda('pol', '외교·안보'); } },
  { id: 'ag_wel', roles: ['president'], name: '복지 의제 추진', desc: '매력 판정', run() { return agenda('cha', '복지'); } },
  { id: 'ag_ref', roles: ['president'], name: '개혁 의제 추진', desc: '화술 판정. 성향 강화', run() { mod('ideology', ownSign() * 3); return agenda('spk', '개혁'); } },
  { id: 'talk', roles: ['president'], name: '대국민 소통', desc: '지지율 소폭 +',
    run() { mod('approval', 2.5); mod('favor', 1); return '기자회견을 열어 각본 없이 질문을 받았다.'; } },
  { id: 'variety', roles: ['tv'], name: '예능 고정 출연', desc: '인지도 ++, 자금 +, 당내 입지 −',
    run() { mod('fame', 7); mod('funds', 8); gainStanding(-4); grow('cha', 1); return '예능 고정 패널이 됐다. 정치인이라는 걸 잊은 시청자도 많다.'; } },
  { id: 'channel', roles: ['tv'], name: '유튜브 채널 운영', desc: '인지도 +, 자금 ++',
    run() { mod('fame', 4); mod('funds', 12); return '개인 채널 구독자가 꾸준히 늘었다.'; } },
  { id: 'comeback', roles: ['tv'], name: '정계 복귀 선언', desc: '방송을 접고 원외 정치인으로',
    run() { S.role = 'none'; log('방송을 접고 정계 복귀를 선언했다.'); return '방송을 정리하고 정계 복귀를 선언했다.'; } },
];
function agenda(stat, label) {
  const minority = S.w.majority !== S.party;
  const p = clamp(35 + (S.st[stat] - 50) * 0.6 + (minority ? -20 : 10) + (S.w.approval - 45) * 0.3 + (S.coop > 0 ? 20 : 0) + cabBonus(label, minority), 10, 90);
  if (S.coop > 0) S.coop--;
  if (chance(p / 100)) { mod('approval', 5); mod('favor', 2); S.rec.agenda++; return `${label} 분야 핵심 과제가 국회를 통과했다.` + taskProgress(label); }
  mod('approval', -4); return `${label} 분야 과제가 ${minority ? '여소야대 국회에 막혔다' : '여론의 반발로 좌초됐다'}.`;
}
function availActions() {
  return ACTIONS.filter((a) => a.roles.includes(S.role) && (!a.need || a.need()) && (a.special ? (S.offer || []).includes(a.id) : !S.coreOffer || S.coreOffer.includes(a.id)));
}
function maxPicks() { return S.st.sta < 40 ? 1 : 2; }
function scrHome() {
  const n = maxPicks();
  const acts = availActions();
  const pc = S.party ? PARTIES[S.party].color : '#666';
  const cell = (label, v, col) => `<div class="hs"><span>${label}</span><b>${Math.round(v)}</b><div class="track"><div class="fill" style="${fillStyle('h:' + label, clamp(v, 0, 100), col)}"></div></div></div>`;
  return `${bar()}<div class="pad home">
    <section class="hud" style="--pc:${pc}"><div class="ava">${AVATAR[S.concept]}</div>
      ${cell('인지도', S.fame, '#6ea0ff')}${cell('호감도', S.favor, '#5fd39a')}${cell(S.role === 'president' ? '국정 지지' : '정권 지지', S.w.approval, '#f0a36b')}${cell('체력', S.st.sta, '#c9ccd6')}</section>
    ${S.w.news ? `<p class="ticker"><b>NEWS</b><span>${S.w.news}</span></p>` : ''}
    ${homeTip()}${themeBanner()}${homeExtras()}${mandBanner()}
    <h2 class="h">이번 반기 일정 <small>${T.picks.length}/${n} 선택${n === 1 ? ' (체력 부족)' : ''}</small></h2>
    <div class="acts">${acts.map((a) => `<button class="ac ${a.special ? 'sp' : ''} ${T.picks.includes(a.id) ? 'on' : ''}" data-a="pick" data-v="${a.id}"><span class="ac-top"><i>${ICONS[a.id] || a.icon || ic('spark')}</i>${a.special ? '<em>기회</em>' : ''}${themeHit(a.id) ? '<em class="th">화두</em>' : ''}</span><b>${typeof a.name === 'function' ? a.name() : a.name}</b><span>${hint(a.desc)}</span></button>`).join('')}</div>
    <div class="sticky">${btn('go', '', T.picks.length === n ? '진행' : `일정 ${n}개를 고르세요`, 'primary', T.picks.length !== n)}</div></div>`;
}
function scrResult(title, lines, next, nextLabel) {
  return `${bar()}<div class="pad"><section class="card res"><h2>${title}</h2>${lines.map((l) => `<p>${l}</p>`).join('')}${deltas()}${judgeStamp()}</section>${btn(next, '', nextLabel || '다음', 'primary')}</div>`;
}

/* ───────── 이벤트 ───────── */
const STAT_KEY = { '지력': 'int', '매력': 'cha', '화술': 'spk', '정치력': 'pol', '체력': 'sta' };
const judgeP = (stat, need) => clamp(Math.round(50 + (S.st[stat] - need) * 2.5), 8, 92);
const judge = (stat, need) => { const ok = chance(judgeP(stat, need) / 100); T.judge = ok; return ok; };
// 선택지 설명의 "화술 60 판정"을 현재 능력치 기준 성공 확률로 바꿔 보여준다
function hint(text) { return text.replace(/(지력|매력|화술|정치력|체력) (\d+) 판정/, (m, n, v) => `${n} 판정 · 성공 ${judgeP(STAT_KEY[n], +v)}%`); }
// 어떤 선택이든 약간의 운이 따른다
function twist() {
  if (!chance(0.14)) return '';
  if (chance(0.5)) { mod('fame', 2); mod('favor', 2); return '<span class="tw up">뜻밖의 호재</span> 이 일이 예상보다 좋게 회자됐다.'; }
  mod('favor', -3); return '<span class="tw down">뜻밖의 변수</span> 엉뚱한 대목이 꼬투리를 잡혀 구설에 올랐다.';
}
const EVENTS = [
  { id: 'extra_budget', cond: () => S.role !== 'president', title: '논란의 추경안',
    text: () => `대통령이 대규모 추경안을 내놨다. 여야가 정면으로 부딪치고, 기자들이 당신에게 입장을 묻는다.`,
    ch: [
      ['적극 옹호한다', '여당 쪽으로 성향 이동', () => { const s = Math.sign(PARTIES[S.w.ruling].ideo); mod('ideology', s * 6); mod('fame', 2); gainStanding(S.party === S.w.ruling ? 6 : -6); return '"지금은 재정이 나설 때"라고 말했다.'; }],
      ['신중론을 편다', '중도 쪽으로 이동', () => { mod('ideology', -Math.sign(S.ideology) * 4); mod('favor', 1); return '"취지는 공감하나 규모는 따져 봐야 한다"고 답했다.'; }],
      ['공개 비판한다', '야당 쪽으로 성향 이동, 인지도 +', () => { const s = Math.sign(PARTIES[S.w.ruling].ideo); mod('ideology', -s * 6); mod('fame', 4); if (S.party === S.w.ruling) { gainStanding(-8); mod('favor', 2); } else gainStanding(5); return '"선거용 돈 풀기"라고 직격했다. 발언이 저녁 뉴스 첫머리에 올랐다.'; }],
    ] },
  { id: 'lineup', cond: () => S.party && !S.leader && S.role !== 'president', title: '줄 세우기',
    text: () => `당대표 측근이 저녁 자리를 청했다. "다음 공천, 대표님이 신경 쓰고 계십니다. 모임에 이름만 올려 주시죠."`,
    ch: [
      ['합류한다', '당내 입지 ++, 호감도 −', () => { gainStanding(10); mod('favor', -2); S.mainstream = true; return '주류 모임에 이름을 올렸다.'; }],
      ['정중히 거절한다', '당내 입지 −, 호감도 +', () => { gainStanding(-6); mod('favor', 4); S.mainstream = false; return '"계파 정치는 하지 않겠다"고 답했다. 소신파라는 평이 붙었다.'; }],
    ] },
  { id: 'vote_clash', cond: () => S.role === 'mp' && S.party, title: '당론과 지역구 사이',
    text: () => `당이 당론으로 정한 법안이 지역구 주민들에게는 손해다. 본회의 표결이 내일이다.`,
    ch: [
      ['당론을 따른다', '당내 입지 +, 지역 기반 −', () => { gainStanding(6); modBase(S.seat.region, -5); return '찬성 버튼을 눌렀다. 지역 사무실에 항의 전화가 이어졌다.'; }],
      ['소신 투표한다', '당내 입지 −−, 호감도·기반 +', () => { gainStanding(-8); mod('favor', 4); modBase(S.seat.region, 4); S.rec.rebel++; return '반대표를 던졌다. 원내대표의 호출이 왔다.'; }],
      ['기권한다', '모두 소폭 −', () => { gainStanding(-3); mod('favor', -2); return '표결 직전 자리를 비웠다.'; }],
    ] },
  { id: 'landfill', cond: () => ['mp', 'city', 'metro', 'gov'].includes(S.role), title: '폐기물 처리장 입지',
    text: () => `${REGIONS[S.seat.region]} 지역이 광역 폐기물 처리장 후보지로 올랐다. 주민 대책위가 꾸려졌다.`,
    ch: [
      ['반대 투쟁에 앞장선다', '지역 기반 ++, 전국 호감 −', () => { modBase(S.seat.region, 8); mod('favor', -3); mod('fame', 2); return '삭발까지 감행했다. 지역에서는 영웅, 전국에서는 지역 이기주의라는 말을 들었다.'; }],
      ['보상안을 협상한다', '지력 60 판정', () => { if (judge('int', 60)) { modBase(S.seat.region, 5); mod('favor', 4); return '주민 지원 기금과 편의시설을 묶은 합의안을 끌어냈다.'; } modBase(S.seat.region, -6); return '협상안이 주민 설명회에서 거부당했다.'; }],
    ] },
  { id: 'typhoon', cond: () => ['city', 'metro', 'gov', 'president'].includes(S.role), title: '태풍 전야',
    text: () => `대형 태풍이 북상 중이다. 내일은 석 달 전부터 잡아 둔 해외 투자 유치 출장일이다.`,
    ch: [
      ['출장을 취소한다', '호감도 +, 성과 −', () => { mod('favor', 5); if (S.term) S.term.pledge -= 5; return '상황실에서 밤을 새웠다. 투자 협약은 무기한 미뤄졌다.'; }],
      ['예정대로 떠난다', '도박', () => { if (chance(0.5)) { mod('fame', 3); if (S.term) S.term.pledge += 8; return '태풍은 비껴갔고, 협약서에 서명하고 돌아왔다.'; } mod('favor', -12); mod('fame', 5); return '태풍이 직격했다. 공항 귀국 사진이 모든 신문 1면에 실렸다.'; }],
    ] },
  { id: 'live', cond: () => S.fame >= 30, title: '생방송 돌발 질문',
    text: () => `생방송 인터뷰 도중 진행자가 대본에 없던 질문을 던졌다. 당신의 가장 아픈 곳이다.`,
    ch: [
      ['정면으로 답한다', '화술 60 판정', () => { if (judge('spk', 60)) { mod('fame', 5); mod('favor', 3); return '차분한 답변이 "사이다 답변" 클립으로 퍼졌다.'; } mod('favor', -5); mod('fame', 3); return '말이 꼬였고, 그 장면만 편집돼 돌아다녔다.'; }],
      ['화제를 돌린다', '호감도 −', () => { mod('favor', -2); return '"그 얘기는 다음에 하시죠." 진행자의 표정이 굳었다.'; }],
    ] },
  { id: 'old_clip', cond: () => S.fame >= 15, weight: () => (S.concept === 'influencer' || S.concept === 'youth' ? 2 : 1), title: '과거 발언 발굴',
    text: () => `10년 전 당신이 한 말이 담긴 영상이 커뮤니티에 올라왔다. 지금 들으면 문제가 될 만하다.`,
    ch: [
      ['즉시 사과한다', '호감도 −', () => { mod('favor', -4); return '당일 사과문을 냈다. 논란은 사흘 만에 가라앉았다.'; }],
      ['맥락을 해명한다', '화술 65 판정', () => { if (judge('spk', 65)) { mod('favor', 1); mod('fame', 2); return '전체 영상을 공개하며 해명했고, 여론이 돌아섰다.'; } mod('favor', -9); return '해명이 변명으로 들렸다. 논란이 2주를 갔다.'; }],
      ['대응하지 않는다', '호감도 −−, 인지도 +', () => { mod('favor', -6); mod('fame', 2); return '침묵했다. 기사는 계속 나왔다.'; }],
    ] },
  { id: 'minister', cond: () => S.party === S.w.ruling && S.st.int >= 62 && ['none', 'mp'].includes(S.role) && !S.rec.minister, weight: () => (S.concept === 'bureaucrat' ? 3 : 1), title: '입각 제안',
    text: () => `대통령실에서 전화가 왔다. "장관직을 맡아 주셨으면 합니다."`,
    ch: [
      ['수락한다', '인지도·입지 +, 정권과 운명 공유', () => { S.rec.minister = true; mod('fame', 8); gainStanding(6); grow('int', 2); mod('favor', (S.w.approval - 45) / 4); log('장관으로 입각했다.'); return '인사청문회를 통과하고 장관에 취임했다.'; }],
      ['고사한다', '당내 입지 −', () => { gainStanding(-3); mod('favor', 1); return '"아직 배울 것이 많다"며 고사했다.'; }],
    ] },
  { id: 'poach', cond: () => S.role === 'none' && S.fame >= 30 && S.party && S.party !== 'mine', title: '영입 제안',
    text: () => { const p = otherParty(); return `${PARTIES[p].name} 지도부가 은밀히 접촉해 왔다. "그 당에서는 기회가 없을 겁니다. 우리와 함께하시죠."`; },
    ch: [
      ['당을 옮긴다', '호감도 −−, 철새 기록', () => { const p = otherParty(); S.party = p; S.standing = 20; S.mainstream = false; S.leader = false; mod('favor', -8); S.rec.switches++; log(`${PARTIES[p].name}으로 당적을 옮겼다.`); return `${PARTIES[p].name} 입당 기자회견을 열었다. 옛 동료들의 비난이 쏟아졌다.`; }],
      ['거절한다', '당내 입지 +', () => { gainStanding(5); return '제안을 거절했고, 그 사실이 당에 알려졌다.'; }],
    ] },
  { id: 'health', cond: () => S.age >= 65, title: '건강 이상 신호',
    text: () => `일정 중 어지럼증으로 잠시 주저앉았다. 주치의는 당분간 쉬라고 한다.`,
    ch: [
      ['일정을 줄인다', '체력 +, 인지도 −', () => { mod('sta', 10); mod('fame', -2); return '두 달간 공개 일정을 절반으로 줄였다.'; }],
      ['강행한다', '체력 −, 악화 위험', () => { mod('sta', -12); if (chance(0.25)) { mod('sta', -20); return '결국 입원했다. 병상 사진이 보도됐다.'; } return '아무 일 없다는 듯 일정을 소화했다.'; }],
    ] },
  { id: 'donation', cond: () => S.funds >= 40, title: '후원금 논란',
    text: () => `고액 후원자 중 한 명이 이권 사업에 연루됐다는 보도가 나왔다.`,
    ch: [
      ['전액 반환한다', '자금 −, 호감도 +', () => { mod('funds', -20); mod('favor', 3); return '후원금을 돌려주고 내역을 공개했다.'; }],
      ['문제없다고 버틴다', '도박', () => { if (chance(0.5)) { mod('favor', -8); return '후속 보도가 이어졌고 해명은 뒤늦었다.'; } return '보도는 단발로 끝났다.'; }],
    ] },
  { id: 'talkshow', cond: () => true, title: '청년 토크콘서트',
    text: () => `대학 총학생회가 토크콘서트에 초청했다. 질문은 사전 조율 없이 받는다고 한다.`,
    ch: [
      ['참석한다', '매력 55 판정', () => { if (judge('cha', 55)) { mod('favor', 4); mod('fame', 3); grow('cha', 1); return '꾸밈없는 답변에 박수가 나왔다.'; } mod('favor', -2); return '"요즘 젊은 사람들은"으로 시작한 답변이 화근이었다.'; }],
      ['일정을 이유로 사양한다', '체력 +', () => { mod('sta', 4); return '정중히 사양했다.'; }],
    ] },
  { id: 'disaster', cond: () => S.fame >= 15 && S.role !== 'abroad', title: '재난 현장',
    text: () => `대형 산불이 났다. 정치인들이 줄지어 현장으로 향하고 있다.`,
    ch: [
      ['조용히 봉사한다', '호감도 +', () => { mod('favor', 4); mod('sta', -4); return '카메라 없이 사흘간 급식 봉사를 했다. 뒤늦게 주민이 올린 글이 화제가 됐다.'; }],
      ['취재진과 함께 간다', '인지도 +, 역풍 위험', () => { mod('fame', 5); if (chance(0.4)) { mod('favor', -5); return '"사진 찍으러 왔냐"는 이재민의 항의가 그대로 방송됐다.'; } mod('favor', 2); return '현장 브리핑 장면이 주요 뉴스에 나갔다.'; }],
    ] },
  { id: 'gaffe', cond: () => S.party && !S.leader, title: '지도부 막말 파문',
    text: () => `당 지도부 인사의 막말이 파문을 일으켰다. 기자들이 당신의 입장을 묻는다.`,
    ch: [
      ['비판 성명을 낸다', '호감도 +, 당내 입지 −', () => { mod('favor', 3); gainStanding(-6); mod('ideology', -Math.sign(S.ideology) * 3); return '"국민 눈높이에 맞지 않는다"고 했다.'; }],
      ['침묵한다', '호감도 소폭 −', () => { mod('favor', -1); return '답하지 않고 차에 올랐다.'; }],
      ['옹호한다', '당내 입지 +, 호감도 −', () => { gainStanding(5); mod('favor', -5); mod('ideology', ownSign() * 4); return '"취지가 왜곡됐다"고 감쌌다.'; }],
    ] },
  { id: 'festival', cond: () => S.role === 'mp', title: '축제와 본회의',
    text: () => `지역 최대 축제 개막식과 국회 본회의가 같은 시간에 잡혔다.`,
    ch: [
      ['축제에 간다', '지역 기반 +, 호감도 −', () => { modBase(S.seat.region, 5); mod('favor', -2); return '개막식 축사를 했다. 본회의 불출석 명단에 이름이 올랐다.'; }],
      ['본회의에 간다', '호감도 +, 지역 기반 −', () => { mod('favor', 2); modBase(S.seat.region, -2); return '본회의장을 지켰다. 지역 신문은 빈 내빈석 사진을 실었다.'; }],
    ] },
  { id: 'convention', cond: () => S.party && !S.leader && ['mp', 'none'].includes(S.role) && S.standing >= 65, title: '전당대회',
    text: () => `전당대회가 열린다. 주변에서 당대표 출마를 권한다.`,
    ch: [
      ['출마한다', '정치력·입지 판정', () => { if (S.st.pol * 0.6 + S.standing * 0.4 + ri(-15, 15) >= 62) { S.leader = true; S.rec.leader = true; mod('fame', 10); S.standing = 90; log('전당대회에서 당대표로 선출됐다.'); return '결선 끝에 당대표로 선출됐다. 다음 총선 공천권이 당신 손에 있다.'; } gainStanding(-10); return '2위로 낙선했다. 새 지도부와 서먹해졌다.'; }],
      ['불출마한다', '당내 입지 소폭 +', () => { gainStanding(2); return '"때가 아니다"라며 불출마를 선언했다.'; }],
    ] },
  { id: 'publish', cond: () => S.st.int >= 55, title: '출간 제안',
    text: () => `출판사에서 책을 내자고 한다. 어떤 책을 쓸까.`,
    ch: [
      ['정책 제안서', '지력 성장, 호감도 +', () => { grow('int', 1); mod('favor', 2); mod('funds', 5); return '두꺼운 정책서를 냈다. 많이 팔리진 않았지만 평은 좋았다.'; }],
      ['자서전', '인지도·자금 +, 대필 논란 위험', () => { mod('fame', 4); mod('funds', 10); if (chance(0.2)) { mod('favor', -4); return '자서전이 베스트셀러에 올랐지만 대필 논란이 일었다.'; } return '자서전이 베스트셀러에 올랐다.'; }],
    ] },
  { id: 'coop', cond: () => ['mp', 'city', 'metro', 'gov'].includes(S.role), title: '협치 제안',
    text: () => `상대 진영 중진이 공동 법안을 제안해 왔다. 내용은 나쁘지 않다.`,
    ch: [
      ['손을 잡는다', '호감도 +, 중도 이동, 당내 입지 −', () => { mod('favor', 4); mod('ideology', -Math.sign(S.ideology) * 6); gainStanding(-4); return '공동 기자회견을 열었다. 지지층 일부가 등을 돌렸다.'; }],
      ['거절한다', '당내 입지 +, 성향 강화', () => { gainStanding(4); mod('ideology', ownSign() * 3); return '"들러리는 서지 않겠다"고 답했다.'; }],
    ] },
  { id: 'security', cond: () => true, title: '안보 위기',
    text: () => `접경 지역에서 군사적 긴장이 높아졌다. 방송사마다 정치권 반응을 모으고 있다.`,
    ch: [
      ['강경 대응을 촉구한다', '보수 쪽 이동', () => { mod('ideology', 6); mod('fame', 2); if (S.concept === 'general') { mod('favor', 4); mod('fame', 4); return '전직 장성의 분석이라며 모든 방송이 당신을 찾았다.'; } return '"단호한 대응"을 주문했다.'; }],
      ['대화 재개를 촉구한다', '진보 쪽 이동', () => { mod('ideology', -6); mod('fame', 2); return '"긴장 완화가 먼저"라고 말했다.'; }],
    ] },
];
function otherParty() {
  const cands = Object.keys(PARTIES).filter((p) => p !== S.party && Math.abs(PARTIES[p].ideo - S.ideology) <= 60);
  if (!cands.length) return S.party === 'hyuk' ? 'simin' : 'hyuk';
  cands.sort((a, b) => Math.abs(PARTIES[a].ideo - S.ideology) - Math.abs(PARTIES[b].ideo - S.ideology));
  return cands[0];
}
function pickEvent() {
  const pool = [];
  for (const e of EVENTS) {
    if (S.used.includes(e.id) || !e.cond() || (S.banUntil > S.turn && BAN_EVENTS.includes(e.id)) || (S.role === 'jail')) continue;
    const w = e.weight ? e.weight() : 1;
    for (let i = 0; i < w; i++) pool.push(e);
  }
  return pool.length ? pick(pool) : null;
}
function scrEvent() {
  const e = T.ev;
  return `${bar()}<div class="pad">${card(e.title, `<p>${e.text()}</p>`)}
    ${e.ch.map((c, i) => `<button class="row" data-a="choose" data-v="${i}"><b>${c[0]}</b><span>${hint(c[1])}</span></button>`).join('')}</div>`;
}

/* ───────── 선거: 계산 ───────── */
function advantage(p, L) {
  if (p === 'simin') return -L;
  if (p === 'bosu') return L;
  if (p === 'nodong') return L <= -1 ? -1 : -2;
  if (p === 'gonghwa') return L >= 1 ? -1 : -2;
  return -1;
}
const LEAN_STEP = 4.0, CENTER_BASE = 18.0; // 지형 한 단계당 양대 정당 기본표 차이, 중도 정당 기본표
function baseVote(p, L) {
  if (p === 'simin') return 44 - LEAN_STEP * L;
  if (p === 'bosu') return 44 + LEAN_STEP * L;
  if (p === 'hyuk') return CENTER_BASE;
  if (p === 'mine') return S.myParty.base;
  if (p === 'nodong') return L <= -1 ? 10 : 4;
  if (p === 'gonghwa') return L >= 1 ? 10 : 4;
  return 6;
}
function swing(p) {
  const d = 0.3 * (S.w.approval - 45);
  if (p === S.w.ruling) return d;
  if (p && p === mainOpp(S.w.ruling)) return -d;
  return 0;
}
function nomProb(place) {
  if (!S.party) return null;
  const P = PARTIES[S.party];
  if (S.leader) return 100;
  if (P.kind !== 'major') return 92;
  const adv = advantage(S.party, place.L);
  const inc = S.seat && S.seat.name === place.name ? 20 : 0;
  const fit = Math.max(0, (Math.abs(S.ideology - P.ideo) - 30) * 0.5);
  const p = 40 + 0.6 * (ovr() - 50) + 0.3 * S.standing + 0.3 * baseOf(place.region) + inc - 15 * adv - fit
    + (S.concept === 'aide' ? 10 : 0) + (S.mainstream ? 10 : 0);
  return Math.round(clamp(p, 5, 95));
}
function stars(place) {
  const n = clamp(3 - advantage(S.party, place.L), 1, 5);
  return `<span class="pips">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(5 - n)}</span>`;
}
function leanLabel(L) { return ['진보 텃밭', '진보 우세', '경합', '보수 우세', '보수 텃밭'][L + 2]; }
function npcName() { return pick(SURNAMES) + pick(GIVEN); }
function buildCands(el) {
  const pres = el.type === 'pres';
  const list = ['simin', 'bosu'];
  if (pres || chance(0.6)) list.push('hyuk');
  if (chance(pres ? 0.6 : 0.3)) list.push('nodong');
  if (chance(pres ? 0.6 : 0.3)) list.push('gonghwa');
  const range = { general: [-3, 5], city: [-3, 5], metro: [0, 7], gov: [0, 7], pres: [5, 11] }[el.type];
  const cands = [{ me: true, party: S.party, name: S.name }];
  for (const p of list) {
    if (p === S.party) continue;
    cands.push({ party: p, name: npcName(), pers: ri(range[0], range[1]), camp: 0 });
  }
  return cands;
}
function rawOf(el, c, final) {
  const L = el.place.L;
  let raw;
  if (c.me) {
    const minor = !S.party || PARTIES[S.party].kind !== 'major';
    const personal = 0.08 * S.fame + 0.12 * S.favor - 10;
    raw = baseVote(S.party, L) + swing(S.party) * (el.kS || 1) + personal * (minor ? (el.type === 'pres' ? 1.5 : 2) : 1) * (el.kP || 1)
      + (el.type === 'pres' ? 0 : baseOf(el.place.region) * (minor ? 0.22 : 0.1) * (el.kB || 1))
      + el.my + (L === 0 ? (40 - Math.abs(S.ideology)) / 20 : 0)
      + (S.party && PARTIES[S.party].kind === 'center' && Math.abs(L) <= 1 ? 4 - Math.abs(L) * 2 : 0); // 중도 정당은 경합지에서 확장성이 있다
  } else {
    raw = baseVote(c.party, L) + swing(c.party) + c.pers + c.camp + (c.bonus || 0) - (c.party === el.exParty ? 8 : 0);
  }
  if (final) raw += ri(-3, 3);
  return Math.max(1, raw);
}
function shares(el, final, pollErr) {
  let rows = el.cands.map((c) => ({ c, raw: rawOf(el, c, final) + (pollErr ? ri(-3, 3) : 0) }));
  rows.forEach((r) => { r.raw = Math.max(1, r.raw); });
  const sum = rows.reduce((a, r) => a + r.raw, 0);
  rows.forEach((r) => { r.pct = r1((r.raw / sum) * 100); });
  rows.sort((a, b) => b.pct - a.pct);
  return rows;
}
function shareBars(rows) {
  return `<div class="poll">${rows.map((r) => `<div class="pr ${r.c.me ? 'me' : ''}"><span class="pn">${esc(r.c.name)} <small>${r.c.party ? PARTIES[r.c.party].name : '무소속'}</small></span>
    <div class="track"><div class="fill" style="${fillStyle('c:' + r.c.name, Math.min(100, r.pct * 1.5), r.c.party ? PARTIES[r.c.party].color : '#666')}"></div></div><b>${r.pct.toFixed(1)}%</b></div>`).join('')}</div>`;
}

/* ───────── 선거: 화면 ───────── */
function scrElectionMenu() {
  const els = electionsAt(S.year, S.half);
  const rows = [];
  const seatUp = (S.role === 'mp' && els.includes('general')) || (['city', 'metro', 'gov'].includes(S.role) && els.includes('local'));
  if (els.includes('pres')) {
    const okAge = S.age >= 40, okFame = S.fame >= 80, okFund = S.funds >= 50, tried = S.elTried;
    const exBlock = S.exPres && !(S.rec.amend === 'self' && !S.rerun);
    rows.push(`<button class="row" data-a="elRun" data-v="pres"${okAge && okFame && okFund && !tried && !exBlock ? '' : ' disabled'}><b>대통령 선거 출마</b><span>${exBlock ? '대통령은 한 번만 할 수 있다 (5년 단임)' : tried ? '이미 경선에서 탈락했다' : !okAge ? '만 40세 이상만 출마 가능' : !okFame ? `인지도 80 필요 (현재 ${Math.round(S.fame)})` : !okFund ? `정치자금 50 필요 (현재 ${Math.round(S.funds)})` : S.party ? '당내 경선부터 치른다' : '무소속으로 본선 직행'}</span></button>`);
  }
  if (els.includes('general')) rows.push(`<button class="row" data-a="elRun" data-v="general"><b>국회의원 선거 출마</b><span>지역구 29곳 중 선택 · 선거운동 4라운드</span></button>`);
  if (els.includes('general') && S.propOffer === S.year && S.party) rows.push(`<button class="row" data-a="elRun" data-v="prop"><b>비례대표 출마</b><span>약속받은 앞 순번 · 유세 없이 당 득표로 결정된다</span></button>`);
  if (els.includes('local')) {
    rows.push(`<button class="row" data-a="elRun" data-v="big"${S.fame >= 50 && S.funds >= 30 ? '' : ' disabled'}><b>광역시장·도지사 출마</b><span>${S.fame < 50 ? `인지도 50 필요 (현재 ${Math.round(S.fame)})` : S.funds < 30 ? `정치자금 30 필요 (현재 ${Math.round(S.funds)})` : '16곳 중 선택'}</span></button>`);
    rows.push(`<button class="row" data-a="elRun" data-v="city"><b>시장 출마</b><span>일반 시 14곳 중 선택</span></button>`);
  }
  const names = els.map((e) => ({ pres: '제' + (22 + (S.year - 2030) / 5) + '대 대통령 선거', general: '국회의원 총선거', local: '전국동시지방선거' }[e])).join(' · ');
  return `${bar()}<div class="pad">${card('선거의 계절', `<p><b>${names}</b>가 다가왔다.</p>
    ${S.seat ? `<p class="muted">현직: ${S.seat.name}. ${seatUp ? '이번 선거에 나서지 않으면 임기가 끝난다.' : S.role === 'mp' && els.includes('pres') && !els.includes('local') ? '의원직을 유지한 채 대선에 나설 수 있다.' : '다른 선거에 출마하면 현직에서 물러나야 한다.'}</p>` : ''}`)}
    ${rows.join('')}
    <button class="row" data-a="elSkip" data-v=""><b>출마하지 않는다</b><span>${seatUp ? '임기를 마치고 원외로' : '이번 반기는 평소대로 활동한다'}</span></button></div>`;
}
function districtList(kind) {
  if (kind === 'general') return GENERAL_DISTRICTS.map((d) => Object.assign({ type: 'general' }, d));
  return LOCAL_SEATS.filter((d) => (kind === 'city' ? d.tier === 'city' : d.tier !== 'city')).map((d) => Object.assign({ type: d.tier }, d));
}
function scrDistricts() {
  const list = districtList(T.kind);
  return `${bar()}<div class="pad"><h2 class="h">출마 지역 선택</h2>
    <p class="muted">유리한 곳일수록 공천 경쟁이 치열하다. 붉은 눈금이 많을수록 본선이 어렵다.</p>
    ${list.map((d, i) => {
      const lim = S.streak && S.streak.name === d.name && S.streak.count >= 3 && d.type !== 'general';
      const np = nomProb(d);
      return `<button class="row dist" data-a="district" data-v="${i}"${lim ? ' disabled' : ''}>
        <b>${d.name}${S.seat && S.seat.name === d.name ? ' <small>현직</small>' : ''}</b>
        <span>${lim ? '3연임 제한' : `${leanLabel(d.L)} · 기반 ${Math.round(baseOf(d.region))} · ${np == null ? '무소속' : '공천 ' + np + '%'} · 본선 ${stars(d)}`}</span></button>`;
    }).join('')}
    ${btn('elBack', '', '뒤로')}</div>`;
}
function scrNom() {
  const el = T.el, n = el.nom;
  let body, foot;
  if (n === 'direct') { body = `<p><b>단수공천.</b> 공천관리위원회가 ${el.place.name} 후보로 당신을 확정했다.</p>`; foot = btn('elStart', '', '선거운동 시작', 'primary'); }
  else if (n === 'primaryWin') { body = `<p>경선에 부쳐졌고, 당원 투표와 여론조사를 합산한 결과 <b>근소하게 승리</b>했다.</p>`; foot = btn('elStart', '', '선거운동 시작', 'primary'); }
  else if (n === 'primaryLose') { body = `<p>경선에 부쳐졌지만 <b>패배</b>했다. 경선에 참여한 후보는 같은 선거구에 출마할 수 없다.</p>`; foot = btn('elConcede', '', '결과에 승복한다', 'primary'); }
  else { body = `<p><b>컷오프.</b> 공천 심사에서 배제됐다. 경선 기회조차 주어지지 않았다.</p>`;
    foot = `${btn('elConcede', '', '승복한다 (당내 입지 +5)', 'primary')}${btn('elIndep', '', '탈당 후 무소속 출마 (호감도 −5)')}`; }
  return `${bar()}<div class="pad">${card('공천 심사 결과', body + `<p class="muted">공천 확률 ${el.np}%</p>`)}${foot}</div>`;
}
function scrPrimary() {
  const el = T.el;
  return `${bar()}<div class="pad">${card(`당내 경선 ${el.pr + 1}/2`, `<p>${PARTIES[S.party].name} 대선 후보 경선. 당원과 국민 여론조사를 절반씩 반영한다.</p><p class="muted">현재 경선 점수 ${Math.round(el.pscore)} · 통과선 약 62</p>`)}
    <button class="row" data-a="primary" data-v="org"><b>당원 조직 다지기</b><span>정치력·당내 입지 기반</span></button>
    <button class="row" data-a="primary" data-v="tour"><b>전국 순회 경청 투어</b><span>매력·호감도 기반</span></button>
    <button class="row" data-a="primary" data-v="tv"><b>TV 토론 올인</b><span>화술 기반. 편차가 크다</span></button></div>`;
}
const CAMP = [
  { id: 'speech', name: '지역 연설', desc: '화술 기반 · 말실수 위험', run() { if (S.st.spk < 40 && chance(0.15)) { mod('favor', -3); return [-1, '연설 도중 말실수가 나왔다.']; } return [1 + S.st.spk / 50, '유세차 위에서 목이 쉬도록 외쳤다.']; } },
  { id: 'commute', name: '출근길 인사', desc: '안전한 +1', run() { mod('favor', 1); mod('sta', -3); return [1 + S.st.sta / 200, '새벽 여섯 시, 지하철역 입구에 섰다.']; } },
  { id: 'market', name: '시장 인사', desc: '매력 기반 · 호감도 +', run() { mod('favor', 2); if (chance(0.05)) { mod('favor', -4); return [-0.5, '어묵 먹는 사진이 "서민 코스프레"라는 조롱을 받았다.']; } return [0.5 + S.st.cha / 50, '전통시장을 돌며 상인들의 손을 잡았다.']; } },
  { id: 'policy', name: '정책 공약 발표', desc: '지력 기반', run() { return [1 + S.st.int / 50, '분야별 공약집을 발표했다.']; } },
  { id: 'show', name: '예능 출연', desc: '인지도 +5 · 편차 큼', run() { mod('fame', 5); return [ri(-1, 2) + S.st.cha / 50, '예능 프로그램에 나가 의외의 면을 보여줬다.']; } },
  { id: 'snsc', name: 'SNS 캠페인', desc: '매력·지력 기반 · 과거 글 발굴 위험', run() { if (chance(0.1)) { mod('favor', -3); return [-1, '과거에 쓴 글이 발굴돼 역풍을 맞았다.']; } const m = S.concept === 'youth' ? 2 : 1; return [(0.5 + (S.st.cha + S.st.int) / 130) * m, '숏폼 영상이 조회수 백만을 넘겼다.']; } },
  { id: 'org', name: '조직 동원', desc: '확실한 +2 · 정치자금 −10', need: () => S.funds >= 10, run() { mod('funds', -10); return [(2 + S.st.pol / 100) * (S.concept === 'union' ? 1.5 : 1), '조직을 풀가동해 지지자를 결집시켰다.']; } },
  { id: 'nega', name: '네거티브 공세', desc: '상대 −, 내 호감도 −3 · 역풍 위험', run() { mod('favor', -3); if (chance(0.2)) return [-1.5, '의혹 제기가 사실무근으로 드러나 역풍이 불었다.']; return [null, '상대 후보의 의혹을 집중 제기했다.']; } },
];
function scrCampaign() {
  const el = T.el;
  return `${bar()}<div class="pad"><h2 class="h">${el.place.name} <small>${el.by ? '보궐선거' : TYPE_NAME[el.type]} · 선거운동 ${el.round + 1}/${el.rounds}</small></h2>
    ${el.poll ? card('최근 여론조사', shareBars(el.poll) + '<p class="muted small">표본오차 ±3%p</p>') : ''}
    ${CAMP.filter((a) => el.offer.includes(a.id)).map((a) => `<button class="row act" data-a="camp" data-v="${a.id}"${a.need && !a.need() ? ' disabled' : ''}><i>${ICONS[a.id] || ic('spark')}</i><div><b>${a.name}${el.last === a.id ? ' <small>연속 시 효과 절반</small>' : ''}</b><span>${hint(a.desc)}</span></div></button>`).join('')}</div>`;
}
function scrCampResult() {
  const el = T.el, last = el.round >= el.rounds;
  return `${bar()}<div class="pad">${card(`선거운동 ${el.round}/${el.rounds}`, `<p>${el.text}</p>${deltas()}`)}
    ${last ? card('', '<p class="muted">선거일 전 6일간은 여론조사 결과를 공표할 수 없다. 이제 결과는 아무도 모른다.</p>') : card('여론조사', shareBars(el.poll) + genLine(el) + `<p class="muted small">${el.aide === 'strat' ? '전략팀 내부 조사 · 오차 없음' : '표본오차 ±3%p'}</p>`)}
    ${btn('elNext', '', '다음', 'primary')}</div>`;
}
function scrDebate() {
  const d = T.el.deb, q = d.qs[d.i];
  return `${bar()}<div class="pad">${card(`TV 토론 ${d.i + 1}/3`, `<p>${q.q}</p>${d.lastText ? `<p class="muted">${d.lastText}</p>` : ''}`)}
    <button class="row" data-a="debate" data-v="spk"><b>정면으로 반박한다</b><span>화술 ${Math.round(S.st.spk)}</span></button>
    <button class="row" data-a="debate" data-v="int"><b>정책과 수치로 답한다</b><span>지력 ${Math.round(S.st.int)}</span></button>
    <button class="row" data-a="debate" data-v="cha"><b>공감에 호소한다</b><span>매력 ${Math.round(S.st.cha)}</span></button></div>`;
}
function scrCount() {
  const el = T.el, st = T.stage;
  const label = ['출구조사 발표', '개표율 10%', '개표율 50%', '개표율 90%', '개표 완료'][st];
  const rows = el.final.map((r) => ({ c: r.c, pct: Math.max(0.5, r1(r.pct + (st < 4 ? el.wob[st][el.final.indexOf(r)] : 0))) })).sort((a, b) => b.pct - a.pct);
  const won = el.final[0].c.me;
  return `<div class="count"><p class="live">● LIVE ${el.place.name} ${el.by ? '보궐선거' : TYPE_NAME[el.type]}</p><h2>${label}</h2>${shareBars(rows)}
    ${st === 4 ? `<div class="verdict ${won ? 'win' : 'lose'}">${won ? '당선 확정' : '낙선'}</div>${btn('elResult', '', '다음', 'primary')}` : '<p class="muted center">개표가 진행 중입니다…</p>'}</div>`;
}
function scrAfterLoss() {
  return `${bar()}<div class="pad">${card('낙선 이후', '<p>캠프 사무실 불이 꺼졌다. 이제 어떻게 할 것인가.</p>')}
    <button class="row" data-a="after" data-v="none"><b>지역을 지킨다</b><span>원외 정치인으로 다음 선거를 준비한다</span></button>
    <button class="row" data-a="after" data-v="tv"><b>방송으로 간다</b><span>인지도와 자금을 쌓는다. 당내 입지는 줄어든다</span></button>
    <button class="row" data-a="after" data-v="abroad"><b>유학을 떠난다</b><span>2턴 · 지력 +, 호감도 회복, 인지도 −</span></button>
    <button class="row" data-a="after" data-v="retire"><b>정계를 은퇴한다</b><span>여기까지다</span></button></div>`;
}
function scrAbroad() {
  return `${bar()}<div class="pad">${card('유학 중', `<p>해외 대학 방문연구원으로 지내고 있다. 서울의 소식은 한 박자 늦게 들려온다.</p><p class="muted">남은 기간 ${S.abroad}턴</p>`)}
    ${btn('abroadNext', '', '반기를 보낸다', 'primary')}${btn('abroadHome', '', '조기 귀국한다')}</div>`;
}

/* ───────── 선거: 진행 ───────── */
function closeTerm() {
  if (!S.term || !S.seat) return;
  const good = S.role === 'mp' ? S.term.bills * 8 + baseOf(S.seat.region) / 2 >= 50 : S.term.pledge >= 50;
  if (good) { S.rec.goodTerms++; log(`${S.seat.name} 임기 평가: 우수.`); }
  mandateClose();
  S.term = null;
}
function leaveSeat(reason) {
  if (!S.seat) return;
  closeTerm();
  if (reason) log(reason);
  S.seat = null; S.role = 'none';
}
function winSeat(el) {
  const role = TYPE_ROLE[el.type];
  const same = S.seat && S.seat.name === el.place.name;
  if (S.seat) closeTerm();
  if (same && el.type !== 'general') S.streak.count++; else S.streak = { name: el.place.name, count: 1 };
  S.role = role; S.seat = el.type === 'pres' ? null : { name: el.place.name, region: el.place.region, type: el.type };
  S.term = { bills: 0, pledge: 0 };
  S.mand = null; S.needSetup = true;
  const k = el.type === 'general' ? 'mp' : el.type === 'city' ? 'city' : el.type === 'pres' ? 'pres' : 'big';
  S.rec.wins[k]++;
  if (el.type !== 'pres') {
    S.rec.sameSeat[el.place.name] = (S.rec.sameSeat[el.place.name] || 0) + 1;
    const adv = advantage(S.party, el.place.L);
    if (adv <= -1) S.rec.hardWin++;
    if (adv <= -2 && S.party && PARTIES[S.party].kind === 'major') S.rec.hardestWin = true;
    modBase(el.place.region, 10);
  }
  if (S.age < 30) S.rec.youngest = true;
  if (S.age >= 80) S.rec.oldest = true;
  mod('fame', { general: 8, city: 6, metro: 14, gov: 14, pres: 30 }[el.type]);
  if (el.type === 'pres') { S.w.ruling = S.party || 'hyuk'; S.w.approval = 55; S.w.presTurn = 0; S.w.playerPres = true; S.leader = false; }
}
function elNo(kind) { return kind === 'general' ? 23 + (S.year - 2028) / 4 : kind === 'pres' ? 22 + (S.year - 2030) / 5 : 10 + (S.year - 2030) / 4; }
// 전국 선거 결과를 계산하고, 공표 화면에 쓸 보고서 목록을 돌려준다
function worldElections(els, ran, won, el) {
  const reps = [];
  S.w.news = '';
  if (els.includes('pres') && S.w.presSim !== S.turn) {
    S.w.presSim = S.turn;
    let rows;
    if (ran === 'pres' && el && el.final) rows = el.final.map((r) => ({ name: r.c.name, party: r.c.party, pct: r.pct }));
    else {
      const old = S.w.ruling;
      const keep = S.w.approval + ri(-12, 12) > 47;
      const wp = keep && PARTIES[old].kind === 'major' ? old : mainOpp(old) || pick(['simin', 'bosu']);
      const a = ri(46, 53), b = a - ri(0.8, 8), c = Math.max(1, 100 - a - b - ri(1, 3));
      rows = [{ name: npcName(), party: wp, pct: r1(a) }, { name: npcName(), party: mainOpp(wp), pct: r1(b) }, { name: npcName(), party: 'hyuk', pct: r1(c) }];
    }
    const old = S.w.ruling, wp = rows[0].party || 'hyuk';
    if (!(ran === 'pres' && won)) {
      if (S.leader && S.party === wp) { S.rec.kingmaker = true; log('당대표로서 대선 승리를 이끌었다.'); }
      S.w.ruling = wp; S.w.approval = 55; S.w.presTurn = 0; S.w.playerPres = false;
      log(wp === old ? `${PARTIES[wp].name}이 정권을 재창출했다.` : `정권이 교체됐다. ${PARTIES[wp].name} 집권.`);
    }
    S.w.news = wp === old ? `${PARTIES[wp].name} 정권 재창출` : `정권 교체, ${PARTIES[wp].name} 집권`;
    reps.push({ kind: 'pres', no: elNo('pres'), rows, change: wp !== old });
  }
  if (els.includes('general')) {
    const r = S.w.ruling, rMajor = PARTIES[r].kind === 'major' ? r : null;
    const seats = { hyuk: rint(8, 26) + (r === 'hyuk' ? 25 : 0), nodong: rint(1, 8), gonghwa: rint(0, 7) };
    if (S.myParty) {
      // 내가 만든 정당: 당세(기본표)와 내 인지도에 따라 의석이 정해진다
      seats.mine = clamp(Math.round(S.myParty.base * ri(0.3, 0.9)) + (r === 'mine' ? 25 : 0), S.role === 'mp' && S.party === 'mine' ? 1 : 0, 70);
      S.myParty.base = r1(clamp(3 + S.fame * 0.06 + seats.mine * 0.4, 5, 18));
    }
    const rest = 300 - seats.hyuk - seats.nodong - seats.gonghwa - (seats.mine || 0);
    if (rMajor) {
      const rs = clamp(Math.round(rest * (0.5 + (S.w.approval - 45) * 0.008 + ri(-0.05, 0.05))), 80, 200);
      seats[rMajor] = rs; seats[mainOpp(rMajor)] = rest - rs;
    } else { seats.simin = Math.round(rest * ri(0.42, 0.58)); seats.bosu = rest - seats.simin; }
    const top = Object.keys(seats).sort((a, b) => seats[b] - seats[a])[0];
    S.w.seats = seats; S.w.majority = top; S.w.over = seats[top] >= 151;
    S.w.genTurn = S.turn; S.w.genRulingOver = top === S.w.ruling && S.w.over;
    S.w.news = `총선: ${PARTIES[top].name} ${seats[top]}석, 원내 1당`;
    if (S.leader && S.party !== 'mine') {
      if (top !== S.party) { S.leader = false; mod('favor', -6); log('총선 패배의 책임을 지고 당대표에서 물러났다.'); }
      else log('당대표로서 총선 승리를 이끌었다.');
    }
    reps.push({ kind: 'general', no: elNo('general'), seats, top, over: S.w.over });
  }
  if (els.includes('local')) {
    const heads = LOCAL_SEATS.filter((d) => d.tier !== 'city').map((d) => {
      if (S.seat && S.seat.name === d.name && ran && won) return { name: d.name, party: S.party, me: true };
      const a = baseVote('simin', d.L) + swing('simin') + ri(-5, 5), b = baseVote('bosu', d.L) + swing('bosu') + ri(-5, 5);
      return { name: d.name, party: a >= b ? 'simin' : 'bosu' };
    });
    const n = heads.filter((h) => h.party === S.w.ruling).length;
    if (!els.includes('pres')) S.w.news = `지방선거: 여당 ${n}곳, 야권 ${16 - n}곳`;
    reps.push({ kind: 'local', no: elNo('local'), heads });
  }
  S.w.newsTurn = S.turn;
  return reps;
}
function finishElections(ran, won) {
  const el = T.el;
  if (el && el.by) { T.el = null; return endTurn(); }
  const els = electionsAt(S.year, S.half);
  if (!won) {
    if (ran) { if (!(S.role === 'mp' && ran === 'pres' && !els.includes('general'))) leaveSeat(); }
    else if ((S.role === 'mp' && els.includes('general')) || (['city', 'metro', 'gov'].includes(S.role) && els.includes('local'))) leaveSeat('불출마로 임기를 마쳤다.');
  }
  const reps = worldElections(els, ran, won, el);
  S.elDone = true; T.el = null;
  showReports(reps, () => {
    if (S.role === 'president' && ran === 'pres' && !won) { S.rec.finalApproval = 30; log('재선에 실패했다.'); T.termLost = true; return show(scrTermEnd); }
    if (ran && !won && S.role === 'none') return show(scrAfterLoss);
    if (ran) return endTurn();
    goHome();
  });
}
function startCampaign() {
  const el = T.el;
  el.cost = { general: 15, city: 15, metro: 30, gov: 30, pres: 50 }[el.type];
  mod('funds', -el.cost);
  el.cands = buildCands(el);
  el.rounds = el.type === 'pres' ? 6 : 4;
  el.round = 0; el.my = 0; el.last = null; el.debDone = {};
  el.offer = rollCamp(el);
  el.poll = shares(el, false, true);
  campIntro();
}
function elNext() {
  const el = T.el;
  const due = el.type === 'pres' ? el.round === 3 || el.round === 6 : el.round === 2;
  if (due && !el.debDone[el.round]) {
    el.deb = newDebate(el);
    return show(scrDebate2);
  }
  if (el.round >= el.rounds) return startCount();
  show(scrCampaign);
}
function startCount() {
  const el = T.el;
  el.final = shares(el, true, false);
  el.wob = [0, 1, 2, 3].map((st) => el.final.map(() => (Math.random() - 0.5) * (4 - st) * 2.2));
  T.stage = 0;
  const step = () => { paint(scrCount()); if (T.stage < 4) { T.stage++; delay(step, 1300); } };
  T.cur = scrCount;
  step();
}

/* ───────── 턴 진행 ───────── */
function startTurn() {
  save();
  resetD();
  if (S.pendingRetire) return show(scrRetireAsk);
  if (S.pendingCase) return showCase();
  if (S.needSetup && ['mp', 'city', 'metro', 'gov', 'president'].includes(S.role)) return showSetup();
  const els = electionsAt(S.year, S.half);
  // 수감·유학 중에도 세상의 선거는 치러진다
  if (['jail', 'abroad'].includes(S.role) && els.length && !S.elDone) { const reps = worldElections(els, null, false, null); S.elDone = true; return showReports(reps, startTurn); }
  if (S.role === 'president' && els.length && !S.elDone) {
    if (els.includes('pres')) {
      T.termLost = false;
      return show(scrTermEnd);
    }
    const reps = worldElections(els, null, false, null); S.elDone = true;
    return showReports(reps, startTurn);
  }
  if (S.brkTurn !== S.turn) { S.brkTurn = S.turn; const b = rollBreaking(); if (b) return showBreaking(b); }
  if (S.role === 'jail') return show(scrJail);
  if (S.role === 'abroad') return show(scrAbroad);
  if (els.length && !S.elDone) {
    if (S.banUntil > S.turn) { T.el = null; return finishElections(null, false); }
    if (S.age >= 85 && S.party && S.party !== 'mine' && !S.asked85) { S.asked85 = true; S.pendingRetire = '선거를 앞두고 당 지도부가 찾아왔다. "이제 후배들에게 길을 터 주실 때가 됐습니다."'; return show(scrRetireAsk); }
    return show(scrElectionMenu);
  }
  goHome();
}
function scrRetireAsk() {
  return `${bar()}<div class="pad">${card('은퇴 권유', `<p>${S.pendingRetire}</p>`)}
    ${btn('retireYes', '', '은퇴를 받아들인다', 'primary')}${btn('retireNo', '', S.party ? '거부한다 (탈당하고 무소속으로 남는다)' : '거부한다')}</div>`;
}
function endTurn() {
  resetD();
  const notes = [];
  officeTick(notes);
  S.age += 0.5;
  if (S.age >= 60) {
    const m = S.age >= 75 ? 2 : 1;
    const k = pick(['int', 'spk', 'cha']);
    mod(k, -ri(0, 1) * m);
    if (S.age >= 70) mod('pol', -ri(0, 0.8) * m);
  }
  const maxSta = S.age < 50 ? 100 : Math.max(30, 100 - (S.age - 50) * 1.5);
  mod('sta', 5);
  if (S.st.sta > maxSta) S.st.sta = r1(maxSta);
  if (S.role === 'none') mod('fame', -2);
  // 높은 인지도는 유지하기 어렵다
  if (S.fame > 80) mod('fame', -2); else if (S.fame > 60) mod('fame', -1);
  mod('funds', { none: 2, mp: 5, city: 5, metro: 6, gov: 6, president: 0, tv: 8, abroad: 0 }[S.role]);
  if (S.role === 'tv') { S.rec.tvTurns++; gainStanding(-2); }
  // 세계
  S.w.presTurn++;
  if (S.w.playerPres) mod('approval', -1 + ri(-2, 2));
  else {
    let d = -1.5 + ri(-4, 4);
    if (chance(0.1)) { d += chance(0.5) ? 8 : -8; }
    S.w.approval = r1(clamp(S.w.approval + d, 15, 75));
  }
  if (S.role === 'president') {
    S.lowAppr = S.w.approval <= 15 ? (S.lowAppr || 0) + 1 : 0;
    if (S.lowAppr >= 3) { S.rec.impeached = true; S.rec.finalApproval = S.w.approval; log('국회가 탄핵소추안을 가결했고, 헌법재판소가 인용했다.'); T.endNote = notes; advance(); return ending('탄핵'); }
    if (S.lowAppr === 2) notes.push('국회에서 탄핵 이야기가 공공연히 나온다.');
  } else {
    S.lowTurns = S.fame <= 10 || S.favor <= 15 ? (S.lowTurns || 0) + 1 : 0;
    if (S.turn >= 16 && S.party && S.party !== 'mine' && S.lowTurns >= 4 && (!S.askedLow || S.turn - S.askedLow >= 12)) { S.askedLow = S.turn; S.pendingRetire = S.fame <= 10 ? '당 사무총장이 조심스럽게 말을 꺼냈다. "요즘 의원님을 기억하는 분이 많지 않습니다. 명예롭게 정리하시는 건 어떻습니까."' : '당 사무총장이 조심스럽게 말을 꺼냈다. "여론이 너무 좋지 않습니다. 당에도 부담입니다."'; }
  }
  // 고령: 80세부터 매 턴 건강 문제로 물러날 확률이 생기고, 92세가 한계다
  if ((S.st.sta <= 5 && S.age >= 70) || (S.age >= 80 && chance((S.age - 78) * 0.03)) || S.age >= 92) {
    if (S.role === 'president') S.rec.finalApproval = S.w.approval;
    log('건강 악화로 정계를 떠났다.'); advance(); return ending('건강 악화');
  }
  if (S.half === 2) notes.push(yearEndNote());
  T.endNote = notes;
  advance();
  show(scrTurnEnd);
}
function advance() {
  trackTurn();
  if (S.half === 1) S.half = 2; else { S.half = 1; S.year++; }
  S.turn++; S.elDone = false; S.elTried = false;
  if (S.w.news && S.turn - (S.w.newsTurn || 0) > 1) S.w.news = ''; // 선거 소식은 다음 반기까지만 걸어 둔다
}
function scrTurnEnd() {
  return `${bar()}<div class="pad">${card('반기 결산', `<p>여섯 달이 지났다. 대통령 국정 지지율은 ${Math.round(S.w.approval)}%.</p>${T.endNote.map((n) => `<p>${n}</p>`).join('')}${deltas()}`)}
    ${btn('next', '', '다음 반기로', 'primary')}</div>`;
}

/* ───────── 내 정보 ───────── */
function scrInfo() {
  const st = Object.keys(STAT_NAME).map((k) => gauge(STAT_NAME[k], S.st[k], '#444')).join('');
  const bases = Object.keys(S.base).filter((k) => S.base[k] >= 1).sort((a, b) => S.base[b] - S.base[a]).map((k) => `<span class="dl">${REGIONS[k]} ${Math.round(S.base[k])}</span>`).join('') || '<span class="muted">없음</span>';
  const canCareer = T.curName === 'home';
  return `${bar()}<div class="pad">
    ${card(`${esc(S.name)} <small>${conceptOf(S.concept).name} ${S.grade}등급 · 종합 ${ovr()}</small>`, st + gauge('인지도', S.fame, '#2f6fd0') + gauge('호감도', S.favor, '#2a9d6a') + gauge('정치자금', S.funds, '#b8860b') + (S.party ? gauge('당내 입지', S.standing, '#7a4bb0') : '') + ideoBar() + seatBar() + dirtGauge())}
    ${card('지역 기반', `<div class="dls">${bases}</div>`)}
    ${careerView(true)}
    ${canCareer ? card('진로', `${S.role === 'none' ? btn('career', 'tv', '방송인으로 전업') + btn('career', 'abroad', '유학 떠나기 (2턴)') : ''}${btn('career', 'retire', '정계 은퇴', 'danger')}`) : ''}
    ${btn('closeInfo', '', '닫기', 'primary')}</div>`;
}

/* ───────── 엔딩 ───────── */
function legacy() {
  const r = S.rec;
  let s = r.wins.mp * 100 + r.wins.city * 80 + r.wins.big * 200 + r.wins.pres * 1000;
  s += (r.minister ? 80 : 0) + (r.leader ? 150 : 0) + (r.floor ? 80 : 0) + (r.pm ? 150 : 0) + ((r.billsPassed || 0) + (r.projects || 0)) * 80 + (r.tasksDone || 0) * 150 + r.goodTerms * 50 + r.hardWin * 100 + r.agenda * 30 + (r.amend ? 400 : 0);
  s = Math.round(s * (0.7 + S.favor / 200));
  if (r.crime >= 3) s = Math.round(s * 0.7);
  return r.martial ? Math.round(s * 0.05) : s;
}
function titles() {
  const r = S.rec, t = [];
  const totalWins = r.wins.mp + r.wins.city + r.wins.big + r.wins.pres;
  if (r.martial) t.push('헌정 파괴자');
  else if (r.impeached) t.push('불명예 퇴진');
  else if (r.wins.pres && r.finalApproval != null) t.push(r.finalApproval >= 45 ? '존경받는 전직 대통령' : r.finalApproval <= 20 ? '실패한 대통령' : '전직 대통령');
  if (r.amend) t.push(r.amend === 'self' ? '장기집권 논란' : '개헌 대통령');
  if (r.floor) t.push('원내 사령탑');
  if (r.pm) t.push('국무총리');
  if (r.crime >= 2) t.push(S.history.some((h, i) => /선고받았다/.test(h.t) && S.history.slice(i + 1).some((x) => /당선됐다/.test(x.t))) ? '오뚝이' : '전과자 정치인');
  if (!r.crime && (r.dirtMax || 0) < 10 && totalWins >= 3) t.push('청백리');
  if ((r.billsPassed || 0) >= 2) t.push('입법의 달인');
  if (S.exPres && S.turn - (S.exTurn || S.turn) >= 6) t.push('물러나지 않는 전직');
  if (r.founder) t.push('창당의 아이콘');
  if (r.presTries >= 3 && !r.wins.pres) t.push('만년 잠룡');
  if (Object.values(r.sameSeat).some((n) => n >= 5)) t.push('지역의 터줏대감');
  if (r.hardestWin) t.push('험지의 개척자');
  if (r.kingmaker && !r.wins.pres) t.push('킹메이커');
  if (r.rebel >= 5 && S.favor >= 70) t.push('소신파');
  if (r.switches >= 3) t.push('철새');
  if (r.tvTurns >= 8) t.push('폴리테이너');
  if (S.turn <= 4 && totalWins === 0) t.push('불꽃');
  if (r.youngest) t.push('최연소 당선 기록');
  if (r.oldest) t.push('최고령 당선 기록');
  if (!t.length) t.push(totalWins === 0 ? '끝내 배지를 달지 못한 사람' : totalWins >= 4 ? '다선 중진' : '평범한 정치인');
  return t;
}
function verdict() {
  const r = S.rec;
  const top = r.wins.pres ? '대통령을 지낸' : r.wins.big ? '광역단체장을 지낸' : r.wins.mp ? `${r.wins.mp}선 의원을 지낸` : r.wins.city ? '시장을 지낸' : '원외에서 맴돈';
  const fav = S.favor >= 70 ? '떠난 뒤에도 그를 그리워하는 사람이 많다.' : S.favor >= 45 ? '호불호는 갈렸지만 제 몫은 했다는 평가를 받는다.' : S.favor >= 25 ? '공보다 과가 먼저 떠오른다는 사람이 많다.' : '이름이 나오면 사람들은 대개 고개를 젓는다.';
  const tail = r.switches >= 2 ? ' 당적을 여러 번 바꾼 이력은 끝까지 꼬리표로 남았다.' : r.rebel >= 3 ? ' 당론보다 소신을 앞세운 표결이 여러 번 회자된다.' : r.bills >= 8 ? ' 대표 발의한 법안 여럿이 지금도 시행 중이다.' : '';
  if (r.martial) return '헌정 질서를 무너뜨리려다 파면된 대통령. 그 밤의 일은 교과서에 실렸고, 이름은 반면교사의 대명사가 됐다.';
  const am = r.amend === 'clean' ? ' 1987년 체제를 끝낸 개헌은 그의 이름과 함께 기억된다.' : r.amend === 'self' ? ' 자신에게도 적용한 개헌은 지금도 평가가 엇갈린다.' : '';
  return `${top} ${leanWord()} 정치인. ${fav}${tail}${am}`;
}
function ending(reason) {
  S.over = reason;
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 저장소 없음 */ }
  dexAdd(titles());
  T.shared = false;
  show(scrEnding);
}
function scrEnding() {
  const r = S.rec;
  return `<div class="pad end"><p class="kicker">${S.history.length ? S.history[0].y : 2027}–${S.year} · 만 ${Math.floor(S.age)}세 · ${S.over}</p>
    <h1>${AVATAR[S.concept]} ${esc(S.name)}</h1><div class="dls">${titles().map((t) => `<span class="dl title">${t}</span>`).join('')}</div>
    ${card('세상의 기억', `<p>${verdict()}</p>`)}
    ${card('레거시 점수', `<p class="score">${legacy().toLocaleString()}</p>
      <p class="muted">국회의원 ${r.wins.mp}선 · 시장 ${r.wins.city}회 · 광역단체장 ${r.wins.big}회 · 대통령 ${r.wins.pres}회 · 낙선 ${r.losses}회<br>최종 인지도 ${Math.round(S.fame)} · 호감도 ${Math.round(S.favor)} · ${partyName()}</p>`)}
    ${careerView(false)}
    ${btn('share', '', T.shared ? '복사했습니다' : '결과 복사하기')}${btn('new', '', '다음 생으로', 'primary')}</div>`;
}
function partyName() { return S.party ? PARTIES[S.party].name : '무소속'; }

/* ───────── 저장 ───────── */
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 저장소 없음 */ } }

/* ───────── 핸들러 ───────── */
const H = {
  new() { T = { d: {}, db: {}, setup: { name: '', gender: '남자', lean: '중도', home: 'seoul' } }; S = null; show(scrSetup, 'setup'); },
  load() {
    try { S = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { S = null; }
    if (!S) return H.new();
    T = { d: {}, db: {}, picks: [] }; startTurn();
  },
  setup(v) {
    const inp = document.getElementById('nm'); if (inp && inp.value != null) T.setup.name = inp.value;
    const [k, val] = v.split(':'); T.setup[k] = val; show(scrSetup, 'setup');
  },
  setupDone() {
    const inp = document.getElementById('nm');
    const f = T.setup; if (inp && inp.value) f.name = inp.value;
    S = { v: 1, rng: (Date.now() ^ (Math.random() * 1e9)) >>> 0, name: (f.name || '').trim() || '김정치', gender: f.gender, lean: f.lean, home: f.home };
    T.cards = drawCards(); show(scrCards);
  },
  card(v) {
    const k = T.cards[+v], c = conceptOf(k.id), b = GRADE_BONUS[k.grade];
    Object.assign(S, {
      concept: c.id, grade: k.grade, age: c.age, year: 2027, half: 1, turn: 1,
      st: { int: c.st[0] + b, cha: c.st[1] + b, spk: c.st[2] + b, pol: c.st[3] + b, sta: c.st[4] },
      fame: c.fame + (k.grade === 'S' ? 5 : 0), favor: c.favor, funds: c.funds, standing: c.standing,
      ideology: { '진보': -40, '중도': 0, '보수': 40 }[S.lean] + (c.id === 'union' ? -20 : c.id === 'general' ? 20 : 0),
      base: { [S.home]: 15 + (c.id === 'local' ? 30 : 0) }, party: null, role: 'none', seat: null, term: null, streak: null,
      leader: false, mainstream: false, used: [], history: [], elDone: false, elTried: false, abroad: 0,
      w: { approval: 50, ruling: 'simin', majority: 'simin', over: false, presTurn: 4, news: '', playerPres: false, seats: { simin: 150, bosu: 120, hyuk: 20, nodong: 5, gonghwa: 5 } },
      rec: { wins: { mp: 0, city: 0, big: 0, pres: 0 }, losses: 0, presTries: 0, bills: 0, rebel: 0, switches: 0, tvTurns: 0, minister: false, leader: false, kingmaker: false, hardWin: 0, hardestWin: false, youngest: false, oldest: false, goodTerms: 0, agenda: 0, sameSeat: {}, impeached: false, finalApproval: null },
    });
    show(scrFocus);
  },
  focus(v) { S.focus = v; show(scrParty); },
  party(v) {
    S.party = v || null; if (!v) S.standing = 0;
    if (S.concept === 'prosecutor' && v && v !== S.w.ruling) S.fame += 10;
    log(`${conceptOf(S.concept).name} 출신으로 ${v ? PARTIES[v].name + '에 입당하며' : '무소속으로'} 정계에 입문했다.`);
    show(scrBrief);
  },
  begin() { startTurn(); },
  info() { paint(scrInfo()); },
  closeInfo() { paint(T.cur()); },
  career(v) {
    if (v === 'retire') { log('정계 은퇴를 선언했다.'); return ending('자진 은퇴'); }
    if (v === 'tv') { S.role = 'tv'; log('방송인으로 전업했다.'); }
    if (v === 'abroad') { S.role = 'abroad'; S.abroad = 2; log('유학길에 올랐다.'); return show(scrAbroad); }
    goHome();
  },
  pick(v) {
    const i = T.picks.indexOf(v);
    if (i >= 0) T.picks.splice(i, 1); else if (T.picks.length < maxPicks()) T.picks.push(v);
    show(scrHome, 'home');
  },
  go() {
    if (T.picks.length !== maxPicks()) return;
    resetD();
    T.jit = true;
    T.jit = true;
    const lines = T.picks.map((id) => { const a = ACTIONS.find((x) => x.id === id); mod('sta', id === 'rest' ? 0 : -4); return a.run(); });
    const tw = twist(); if (tw) lines.push(tw);
    T.jit = false;
    T.picks = []; T.lines = lines;
    show(() => scrResult('이번 반기', T.lines, 'toEvent'));
    if ((T.d.favor || 0) <= -4) fx('shake');
  },
  toEvent() {
    // 보궐선거 기회
    if (S.role === 'none' && !(S.banUntil > S.turn) && S.half === 1 && !electionsAt(S.year, 1).length && chance(0.25) && S.turn - (S.lastBy || 0) >= 4) {
      S.lastBy = S.turn;
      const near = GENERAL_DISTRICTS.filter((d) => d.region === S.home);
      const d = near.length && chance(0.6) ? pick(near) : pick(GENERAL_DISTRICTS);
      T.byPlace = Object.assign({ type: 'general' }, d);
      return show(() => `${bar()}<div class="pad">${card('보궐선거', `<p>${T.byPlace.name} 의원이 당선무효형을 받아 4월 보궐선거가 열린다. ${leanLabel(T.byPlace.L)} 지역이다.</p><p class="muted">${S.party ? '공천 확률 ' + nomProb(T.byPlace) + '%' : '무소속 출마'} · 본선 ${stars(T.byPlace)}</p>`)}
        ${btn('byRun', '', '출마한다', 'primary')}${btn('bySkip', '', '지켜본다')}</div>`);
    }
    if (S.role === 'abroad' || !chance(0.8)) return endTurn();
    const e = pickEvent();
    if (!e) return endTurn();
    S.used.push(e.id); if (S.used.length > 26) S.used.shift();
    T.ev = e; show(scrEvent);
  },
  byRun() { T.kind = 'by'; T.el = { type: 'general', place: T.byPlace, by: true }; nominate(); },
  bySkip() { endTurn(); },
  choose(v) {
    resetD();
    T.jit = true;
    const text = T.ev.ch[+v][2]();
    T.lines = [text];
    const tw = twist(); if (tw) T.lines.push(tw);
    T.jit = false;
    show(() => scrResult(T.ev.title, T.lines, 'endTurn'));
    if ((T.d.favor || 0) <= -4 || (T.d.approval || 0) <= -4) fx('shake');
  },
  endTurn() { endTurn(); },
  next() { startTurn(); },
  retireYes() { log('은퇴 권유를 받아들였다.'); ending('은퇴 권유 수락'); },
  retireNo() {
    S.pendingRetire = null;
    if (S.party) { log(`은퇴 권유를 거부하고 ${PARTIES[S.party].name}을 탈당했다.`); (S.exParties = S.exParties || []).push(S.party); S.party = null; S.standing = 0; S.leader = false; S.rec.switches++; }
    startTurn();
  },
  abroadNext() {
    resetD();
    if (S.age < 60) mod('int', 2);
    if (S.favor < 55) mod('favor', 4);
    mod('fame', -4); S.abroad--;
    if (S.abroad <= 0) { S.role = 'none'; log('유학을 마치고 귀국했다.'); }
    endTurn();
  },
  abroadHome() { S.role = 'none'; S.abroad = 0; log('유학을 접고 조기 귀국했다.'); startTurn(); },

  elRun(v) {
    if (v === 'pres') {
      S.rec.presTries++;
      T.el = { type: 'pres', place: { name: '대한민국', region: null, L: 0 } };
      if (S.party && PARTIES[S.party].kind === 'major' && !S.leader) {
        T.el.pr = 0; T.el.pscore = 0.4 * S.fame + 0.3 * S.standing + 0.3 * S.st.pol + ri(-6, 6);
        return show(scrPrimary);
      }
      log(`${partyName()} 후보로 대통령 선거에 출마했다.`);
      return startCampaign();
    }
    T.kind = v; show(scrDistricts);
  },
  elBack() { show(scrElectionMenu); },
  elSkip() { T.el = null; finishElections(null, false); },
  district(v) {
    const d = districtList(T.kind)[+v];
    T.el = { type: d.type, place: d };
    nominate();
  },
  elStart() { log(`${T.el.place.name} ${T.el.by ? '보궐선거' : TYPE_NAME[T.el.type]}에 ${partyName()} 후보로 출마했다.`); startCampaign(); },
  elConcede() {
    const el = T.el;
    if (el.nom === 'cutoff') gainStanding(5);
    log(`${el.place.name} 공천에서 탈락했다.`);
    if (el.by) { T.el = null; return endTurn(); }
    T.el = null; finishElections(null, false);
  },
  elIndep() {
    const el = T.el;
    el.exParty = S.party;
    log(`공천 탈락에 불복해 ${PARTIES[S.party].name}을 탈당했다.`);
    (S.exParties = S.exParties || []).push(S.party); S.party = null; S.standing = 0; S.leader = false; S.mainstream = false; S.rec.switches++;
    resetD(); mod('favor', -5);
    H.elStart();
  },
  primary(v) {
    const el = T.el;
    const add = v === 'org' ? (S.st.pol + S.standing) / 20 + ri(-2, 2) : v === 'tour' ? (S.st.cha + S.favor) / 20 + ri(-2, 2) : S.st.spk / 10 + ri(-6, 6);
    el.pscore += add - 4; el.pr++;
    if (el.pr < 2) return show(scrPrimary);
    if (el.pscore >= 62) { log(`${PARTIES[S.party].name} 대선 후보 경선에서 승리했다.`); mod('fame', 5); return startCampaign(); }
    log(`${PARTIES[S.party].name} 대선 후보 경선에서 탈락했다.`);
    S.elTried = true; T.el = null;
    const els = electionsAt(S.year, S.half);
    if (els.includes('local') || els.includes('general')) {
      return show(() => `${bar()}<div class="pad">${card('경선 탈락', '<p>대선 후보 경선에서 2위에 그쳤다. 아직 다른 선거에 나설 시간은 있다.</p>')}${btn('elBack', '', '선거 메뉴로', 'primary')}</div>`);
    }
    show(() => `${bar()}<div class="pad">${card('경선 탈락', '<p>대선 후보 경선에서 2위에 그쳤다. 본선 무대는 다른 사람의 몫이 됐다.</p>')}${btn('elSkip', '', '다음', 'primary')}</div>`);
  },
  camp(v) {
    const el = T.el, a = CAMP.find((x) => x.id === v);
    if (a.need && !a.need()) return;
    resetD();
    const [d, text] = a.run(el);
    const half = el.last === v ? 0.5 : 1;
    if (d == null) { const tgt = el.cands.filter((c) => !c.me).sort((x, y) => rawOf(el, y) - rawOf(el, x))[0]; tgt.camp -= ri(2, 4) * half; }
    else el.my += d * (d > 0 ? half : 1) * 0.75;
    el.cands.forEach((c) => { if (!c.me && PARTIES[c.party].kind === 'major') c.camp += ri(0.4, 1.4); });
    el.last = v; el.round++; el.text = text;
    el.offer = rollCamp(el);
    el.poll = shares(el, false, true);
    show(scrCampResult);
  },
  elNext() { elNext(); },
  debate(v) {
    const el = T.el, d = el.deb, q = d.qs[d.i];
    const bonus = (v === q.best ? 15 : 0) + (S.concept === 'anchor' ? 8 : S.concept === 'lawyer' ? 5 : 0);
    const mine = S.st[v] + bonus + ri(-15, 15);
    const opp = 50 + (el.type === 'pres' ? 12 : el.type === 'general' || el.type === 'city' ? 0 : 6) + ri(-15, 15);
    const win = mine > opp;
    if (win) d.wins++;
    d.lastText = win ? '직전 답변: 방청석에서 박수가 나왔다.' : '직전 답변: 상대의 반격에 말문이 막혔다.';
    d.i++;
    if (d.i < 3) return show(scrDebate);
    resetD();
    const res = [[-5, '토론 참사', '쩔쩔매는 장면이 짤로 박제됐다.'], [-2, '토론 패배', '상대의 페이스에 끌려다녔다.'], [2, '토론 판정승', '준비한 만큼은 보여줬다.'], [4, '토론 완승', '상대가 한 번도 반격하지 못했다.']][d.wins];
    el.my += res[0]; grow('spk', 1); mod('fame', 2);
    el.debDone[el.round] = true;
    T.lines = [`<b>${res[1]}.</b> ${res[2]}`, `지지율 효과 ${res[0] > 0 ? '+' : ''}${res[0]}%p`];
    show(() => scrResult('TV 토론 결과', T.lines, 'elNext'));
  },
  elResult() {
    const el = T.el, me = el.final.find((r) => r.c.me), won = el.final[0].c.me;
    resetD();
    const refund = me.pct >= 15 ? el.cost : me.pct >= 10 ? el.cost / 2 : 0;
    mod('funds', refund);
    const nm = `${el.place.name} ${el.by ? '보궐선거' : TYPE_NAME[el.type]}`;
    if (won) { winSeat(el); log(`${nm}에서 ${me.pct.toFixed(1)}%로 당선됐다.`); }
    else { S.rec.losses++; mod('fame', 2); log(`${nm}에서 ${me.pct.toFixed(1)}%로 낙선했다.`); }
    T.lines = [won ? `<b>${me.pct.toFixed(1)}%</b>를 얻어 당선됐다. ${el.type === 'pres' ? '제' + (22 + Math.round((S.year - 2030) / 5)) + '대 대통령에 취임한다.' : '꽃다발이 목에 걸렸다.'}` : `<b>${me.pct.toFixed(1)}%</b>. ${r1(el.final[0].pct - me.pct)}%p 차이로 졌다.`,
      refund === el.cost ? '득표율 15% 이상으로 선거비용을 전액 보전받았다.' : refund ? '득표율 10~15%로 선거비용 절반을 보전받았다.' : '득표율 10% 미만이라 선거비용을 한 푼도 돌려받지 못했다.'];
    T.elWon = won; T.elType = el.type;
    if (!el.by) T.myLine = { kind: el.type === 'general' ? 'general' : el.type === 'pres' ? 'pres' : 'local', text: `${esc(S.name)} · ${el.place.name} ${won ? '당선' : '낙선'} (${me.pct.toFixed(1)}%)` };
    show(() => scrResult(won ? '당선' : '낙선', T.lines, 'elDone'));
  },
  elDone() { finishElections(T.elType, T.elWon); },
  after(v) {
    if (v === 'retire') { log('낙선 후 정계 은퇴를 선언했다.'); return ending('낙선 후 은퇴'); }
    if (v === 'tv') { S.role = 'tv'; log('방송인으로 전업했다.'); }
    if (v === 'abroad') { S.role = 'abroad'; S.abroad = 2; log('유학길에 올랐다.'); }
    endTurn();
  },
};
function nominate() {
  const el = T.el;
  if (!S.party) return H.elStart();
  const p = nomProb(el.place); el.np = p;
  const r = rnd() * 100;
  if (r < p) el.nom = 'direct';
  else if (r < p + 20) el.nom = clamp(25 + 0.35 * S.fame + 0.35 * S.standing, 10, 85) > rnd() * 100 ? 'primaryWin' : 'primaryLose';
  else el.nom = 'cutoff';
  show(scrNom);
}
function act(a, v) { if (H[a]) H[a](v); }

if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-a]');
    if (b && !b.disabled) act(b.dataset.a, b.dataset.v);
  });
}

