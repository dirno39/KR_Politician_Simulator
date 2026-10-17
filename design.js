// 이번 생은 정치다 — 디자인 레이어
// 전용 아이콘, 도장·투표용지 효과, 개표방송, 이벤트 연출. plus.js 뒤에 로드한다.

/* ───────── 아이콘: 24×24 선화, 굵기 하나 ───────── */
const GLYPH = {
  stamp: '<circle cx="12" cy="12" r="8.5"/><path d="M11 7v10M11 11.2l4.2 2.6"/>',
  steps: '<path d="M8 5c1.7 0 2.5 1.6 2.5 3.5S10 12 8.5 12 6 10.5 6 8.5 6.3 5 8 5zM7 14.5h3M15.5 9c1.7 0 2.5 1.6 2.5 3.5S17.5 16 16 16s-2.5-1.5-2.5-3.5S13.8 9 15.5 9zM14.5 18.5h3"/>',
  hall: '<path d="M3 20h18M5 20v-7M9 20v-7M15 20v-7M19 20v-7M4 13h16M6 13a6 6 0 0 1 12 0M12 7V4"/>',
  tv: '<path d="M4 7h16v10H4zM9 20h6M9 4l3 3 3-3"/>',
  book: '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>',
  pen: '<path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3"/>',
  phone: '<path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5 7.5 7.5 0 1 0 19 14.5z"/>',
  bill: '<path d="M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6"/>',
  mic: '<path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>',
  house: '<path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-6h4v6"/>',
  swords: '<path d="M5 4l10 10M4 4h3M4 4v3M19 4L9 14M20 4h-3M20 4v3M7 15l-3 3 2 2 3-3M17 15l3 3-2 2-3-3"/>',
  lens: '<path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM16 16l5 5"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M8 9l2 7 2-5 2 5 2-7M7 12h10"/>',
  ticket: '<path d="M3 8h18v3a1.5 1.5 0 0 0 0 3v3H3v-3a1.5 1.5 0 0 0 0-3zM14 8v9"/>',
  crane: '<path d="M8 21V4M5 4h4l9 4H8M17 8v5M15.5 13h3v3h-3zM4 21h9"/>',
  factory: '<path d="M3 21V11l5 3v-3l5 3V5h4v16zM16 5V3"/>',
  cone: '<path d="M10 4h4l4 14H6zM4 20h16M8.5 10h7M7.5 14h9"/>',
  horn: '<path d="M4 10v4h3l8 4V6L7 10zM18 9a4 4 0 0 1 0 6"/>',
  trend: '<path d="M4 18l5-5 4 3 7-8M15 8h5v5"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
  care: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  gear: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  paper: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 12.5h7M7 16h4"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/>',
  play: '<path d="M4 5h16v14H4zM10 9l5 3-5 3z"/>',
  door: '<path d="M6 21V3h10v18M4 21h16M13 12h.01"/>',
  podium: '<path d="M12 3v5M9 5h6M6 9h12l-1.5 5h-9zM9 14v7M15 14v7M7 21h10"/>',
  subway: '<path d="M7 3h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 10h14M8.5 14.5h.01M15.5 14.5h.01M8 18l-2 3M16 18l2 3"/>',
  basket: '<path d="M3 10h18l-2 10H5zM8 10l4-6 4 6M9 14v3M12 14v3M15 14v3"/>',
  clip: '<path d="M8 4h8v3H8zM6 5.5H5v15h14v-15h-1M9 11h6M9 15h6"/>',
  film: '<path d="M4 8h16v12H4zM4 8l2-4 3 4 3-4 3 4 3-4 2 4"/>',
  bus: '<path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12H5zM5 11h14M8 17v3M16 17v3M8.5 14h.01M15.5 14h.01"/>',
  bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  headset: '<path d="M5 14v-2a7 7 0 0 1 14 0v2M5 14h3v5H6a1 1 0 0 1-1-1zM19 14h-3v5h2a1 1 0 0 0 1-1z"/>',
  shake: '<path d="M2 12l4-4 4 1 2 2M22 12l-4-4-4 1-5 5a1.5 1.5 0 0 0 2 2l3-3 4 4 2-2M6 16l2 2M9 17.5l1.5 1.5"/>',
  flag: '<path d="M5 21V4M5 5h11l-2 3.5 2 3.5H5"/>',
  sign: '<path d="M5 4h14v8H5zM12 12v9M8 8h8"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6"/>',
  bubble: '<path d="M4 5h16v11H10l-4 4v-4H4z"/>',
  plane: '<path d="M3 11l18-7-7 18-3-8z"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  scroll: '<path d="M8 4h10v13a3 3 0 0 1-3 3H6a2 2 0 0 0 2-2zM6 20a2 2 0 0 1-2-2v-1h4M11 8h4M11 12h4"/>',
  leaf: '<path d="M12 21V9M12 9c0-3 2-5 6-5 0 4-2 6-6 5zM12 13c0-3-2-5-6-5 0 4 2 6 6 5z"/>',
  chair: '<path d="M7 3v10h10V3M5 13h14v3H5zM7 16v5M17 16v5"/>',
  stadium: '<path d="M3 10c0-2.5 4-4 9-4s9 1.5 9 4v6c0 2.5-4 4-9 4s-9-1.5-9-4zM3 10c0 2.5 4 4 9 4s9-1.5 9-4"/>',
  scissors: '<circle cx="6" cy="8.5" r="2.5"/><circle cx="6" cy="15.5" r="2.5"/><path d="M8 9.5L20 17M8 14.5L20 7"/>',
  tower: '<path d="M12 2v4M9 6h6l2 15H7zM8 12h8M7.5 17h9"/>',
  wing: '<path d="M3 14c5 0 8-2 10-6 0 0 1 3-1 5 3 0 6-2 8-5-1 7-6 11-12 11-2 0-4-1-5-5z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8zM7.5 8h.01"/>',
  camera: '<path d="M4 7h4l1.5-2h5L16 7h4v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  ban: '<circle cx="12" cy="12" r="8"/><path d="M6.5 6.5l11 11"/>',
  cycle: '<path d="M4 12a8 8 0 0 1 14-5l2 2M20 5v4h-4M20 12a8 8 0 0 1-14 5l-2-2M4 19v-4h4"/>',
  globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>',
  cup: '<path d="M5 8h11v6a5 5 0 0 1-10 0zM16 9h2a2 2 0 0 1 0 5h-2M5 21h12"/>',
  bow: '<circle cx="14" cy="6" r="2.5"/><path d="M6 12c3-2 6-2 9 0l2 4M9 12v9M13 21v-5"/>',
  bike: '<circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><path d="M6 17l4-8h5l3 8M10 9l4 8M9 6h3"/>',
  mail: '<path d="M3 6h18v12H3zM3 7l9 6 9-6"/>',
  fire: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
  tent: '<path d="M3 20L12 4l9 16zM12 4v16M9 20l3-6 3 6"/>',
  radio: '<path d="M4 9h16v11H4zM7 9l9-5M14 13h3M14 16h3"/><circle cx="8.5" cy="14.5" r="2"/>',
  bridge: '<path d="M2 17h20M5 17V8M19 17V8M5 9c3 5 11 5 14 0M9 17v-4.5M15 17v-4.5M12 17v-4"/>',
  crowd: '<circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="8" r="2.5"/><path d="M3 19c0-3 2-5 5-5s5 2 5 5M13 15c.8-.6 1.8-1 3-1 3 0 5 2 5 5"/>',
  alert: '<path d="M12 4l9 16H3zM12 10v4M12 17h.01"/>',
  crown: '<path d="M4 18h16M4 18L3 8l5 4 4-7 4 7 5-4-1 10"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9 17h6"/>',
  drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
  sun: '<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 7v3M5 11l2 2M19 11l-2 2"/>',
  medal: '<path d="M8 3l4 6 4-6"/><circle cx="12" cy="14.5" r="5.5"/><path d="M12 12l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/>',
  scale: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
  brief: '<path d="M4 8h16v11H4zM9 8V5h6v3M4 13h16"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  fist: '<path d="M7 11V7a1.5 1.5 0 0 1 3 0V6a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0v6c0 4-2 7-5 7s-6-2-6-6l-1-3 2-1zM10 7v4M13 7v4"/>',
  bars: '<path d="M4 20V10M9 20V4M14 20v-8M19 20V7M3 20h18"/>',
  bag: '<path d="M8 7V5a4 4 0 0 1 8 0v2M6 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM9 13h6v4H9z"/>',
  spark: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5L9 9M15 15l2.5 2.5M6.5 17.5L9 15M15 9l2.5-2.5"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  person: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>',
  wave: '<path d="M3 9c3-3 6-3 9 0s6 3 9 0M3 15c3-3 6-3 9 0s6 3 9 0"/>',
  web: '<path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13M12 7.5l4.5 4.5-4.5 4.5L7.5 12z"/>',
  cross: '<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
  pin: '<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
};
function ic(name) { return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${GLYPH[name] || GLYPH.spark}</svg>`; }

// 행동·유세 아이콘 배정
const ICON_OF = {
  ground: 'steps', partywork: 'hall', panel: 'tv', study: 'book', book: 'pen', sns: 'phone', rest: 'moon', bill: 'bill', question: 'mic', petition: 'house',
  attack: 'swords', audit: 'lens', budget: 'coin', fund: 'ticket', pledge: 'crane', invest: 'factory', field: 'cone', promo: 'horn',
  ag_econ: 'trend', ag_sec: 'shield', ag_wel: 'care', ag_ref: 'gear', talk: 'paper', variety: 'star', channel: 'play', comeback: 'door',
  speech: 'podium', commute: 'subway', market: 'basket', policy: 'clip', show: 'film', snsc: 'phone', org: 'crowd', nega: 'bolt',
  celeb: 'star', alley: 'bike', letter: 'mail', unify: 'shake', hunger: 'fire', youthtalk: 'tent', ad: 'tag', door: 'house', radio: 'radio',
  pledge_local: 'bridge', factcheck: 'lens', rally: 'stadium', cabinet: 'folder',
  podcast: 'headset', campjoin: 'shake', volunteer: 'care', thinktank: 'bars', protest: 'sign', lecture: 'bus', school: 'cap', filibuster: 'bubble',
  diplomacy: 'plane', sniper: 'target', special_pros: 'scroll', report: 'horn', caucus: 'leaf', floor: 'chair', freebus: 'bus', expo: 'stadium',
  townhall: 'tv', austerity: 'scissors', landmark: 'tower', ambition: 'wing', mc: 'film', docu: 'camera', veto: 'ban', reshuffle: 'cycle',
  summit: 'globe', pardon: 'leaf', meet: 'cup', apology: 'bow', street: 'horn', handshake: 'shake', column: 'pen', recruit: 'clip', ngo: 'leaf',
  hearing: 'chair', deal: 'shake', press: 'mic', walkout: 'door', mentor_staff: 'leaf', festival2: 'star', housing: 'house', labor: 'sign',
  interview: 'mic', townpres: 'crowd',
};
ACTIONS.concat(CAMP).forEach((a) => { ICONS[a.id] = ic(ICON_OF[a.id] || 'spark'); });
Object.assign(AVATAR, { youth: ic('bag'), influencer: ic('phone'), aide: ic('folder'), ceo: ic('brief'), local: ic('house'), lawyer: ic('scale'), prosecutor: ic('lens'), anchor: ic('mic'), union: ic('fist'), bureaucrat: ic('bars'), professor: ic('cap'), general: ic('medal') });
[['minseng', 'basket'], ['media', 'tv'], ['party', 'hall'], ['policy', 'clip'], ['money', 'coin'], ['quiet', 'moon']].forEach(([id, g]) => { THEMES.find((t) => t.id === id).icon = ic(g); });
[['person', 'person'], ['wave', 'wave'], ['local', 'pin'], ['org', 'web'], ['money', 'coin']].forEach(([id, g]) => { STRATS.find((t) => t.id === id).icon = ic(g); });
[['org', 'crowd'], ['strat', 'target'], ['pr', 'film']].forEach(([id, g]) => { AIDES.find((t) => t.id === id).icon = ic(g); });
['trend', 'house', 'shield', 'cap', 'cross', 'leaf'].forEach((g, i) => { MG_ICONS[i] = ic(g); });
['alert', 'trophy', 'drop', 'flag', 'scroll', 'crown', 'scroll', 'door', 'shake', 'hall', 'sun', 'plane', 'tv', 'star', 'horn'].forEach((g, i) => { if (TL_ICON[i]) TL_ICON[i][1] = ic(g); });
const STAMP_SVG = (color) => `<svg viewBox="0 0 48 48" class="stampmark" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="none" stroke="${color}" stroke-width="4.5"/><path d="M21 12v24M21 21.5l10 6.5" fill="none" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/></svg>`;

/* ───────── 효과: 투표용지와 도장 ───────── */
function fx(kind) {
  if (TEST || typeof document === 'undefined' || !OPTS.fx) return;
  const app = document.getElementById('app'), layer = document.getElementById('fx');
  if (!app || !layer) return;
  const vib = (p) => { try { if (OPTS.vib && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* 진동 미지원 */ } };
  const clearLater = (ms) => setTimeout(() => { layer.innerHTML = ''; }, ms);
  const cls = (c, ms) => { app.classList.remove(c); void app.offsetWidth; app.classList.add(c); setTimeout(() => app.classList.remove(c), ms); };
  if (kind === 'confetti' || kind === 'win') {
    let h = '';
    for (let i = 0; i < 34; i++) { const t = i % 5; h += `<i class="bl ${t === 3 ? 'gold' : t === 4 ? 'navy' : ''}" style="left:${Math.random() * 100}%;--r:${Math.round(Math.random() * 360)}deg;animation-delay:${(Math.random() * 0.9).toFixed(2)}s;animation-duration:${(2 + Math.random() * 1.6).toFixed(2)}s"></i>`; }
    if (kind === 'win') h += '<div class="slam red">당선</div>';
    layer.innerHTML = h; clearLater(4000); vib([60, 40, 140]);
  } else if (kind === 'lose') { layer.innerHTML = '<div class="slam gray">낙선</div>'; clearLater(2200); cls('fx-gloom', 1200); vib(120); }
  else if (kind === 'gloom') cls('fx-gloom', 1200);
  else if (kind === 'flash') vib(80); // 속보·유세 돌발: 화면 효과 없이 진동만
  else { cls('fx-' + kind, 900); vib(80); }
}
function judgeStamp() { return T.judge == null ? '' : `<div class="jst ${T.judge ? 'ok' : 'no'}">판정<b>${T.judge ? '성공' : '실패'}</b></div>`; }

/* ───────── 타이틀 ───────── */
function scrTitle() {
  let has = false;
  try { has = !!localStorage.getItem(SAVE_KEY); } catch (e) { /* 저장소 없음 */ }
  return `<div class="title"><div class="logo">${STAMP_SVG('#c8372d')}</div><p class="kicker">정치인 인생 시뮬레이션</p><h1>이번 생은<br><em>정치다</em></h1>
    <p class="title-sub">2027년 1월, 정계에 입문한다.<br>은퇴하는 날 당신은 어떤 정치인으로 기억될까.</p>
    ${btn('new', '', '새 인생 시작', 'primary')}${has ? btn('load', '', '이어하기') : ''}${btn('dex', '', `칭호 도감 ${dexLoad().length}/${ALL_TITLES.length}`)}<div class="two">${btn('help', '', '게임 방법')}${btn('opts', '', '설정')}</div>
    <p class="fine">이 게임의 정당과 인물은 모두 가상이며 실제와 무관합니다. 선거 제도와 일정만 현실을 참고했습니다.</p></div>`;
}

/* ───────── 이벤트: 종류별 연출 ───────── */
const EV_KINDS = {
  news: { label: '정국', glyph: 'paper' }, phone: { label: '밀담', glyph: 'call' }, media: { label: '미디어', glyph: 'tv' },
  field: { label: '현장', glyph: 'pin' }, house: { label: '여의도', glyph: 'hall' },
};
const EV_KIND = {};
'extra_budget strike security medical climate pension ai_forum factory'.split(' ').forEach((k) => { EV_KIND[k] = 'news'; });
'lineup minister poach mentor blue_call rival_deal old_friend whistle whistle_back donation rule'.split(' ').forEach((k) => { EV_KIND[k] = 'phone'; });
'live old_clip talkshow deepfake offrecord fandom variety_call meme taxi duel prompter family esports publish award'.split(' ').forEach((k) => { EV_KIND[k] = 'media'; });
'landfill typhoon disaster festival egg marathon flood_help church promise promise_due drink health'.split(' ').forEach((k) => { EV_KIND[k] = 'field'; });
function choiceRows(list, act) {
  return list.map((c, i) => `<button class="row ch" data-a="${act}" data-v="${i}"><em>${'ABC'[i] || i + 1}</em><div><b>${c[0]}</b><span>${hint(c[1])}${c[3] && miniLive() ? ' <i class="mgtag">미니게임</i>' : ''}</span></div></button>`).join('');
}
function scrEvent() {
  const e = T.ev, kind = EV_KIND[e.id] || 'house', k = EV_KINDS[kind];
  const when = `${S.year}년 ${S.half === 1 ? '상반기' : '하반기'}`;
  const text = e.text();
  const body = kind === 'news' ? `<div class="ev-mast"><b>정치일보</b><span>${when}</span></div><h2>${e.title}</h2><p class="ev-lede">${text}</p>`
    : kind === 'phone' ? `<div class="ev-ring">${ic('call')}<span>비공개 통화 · 녹음 금지</span></div><h2>${e.title}</h2><p>${text}</p>`
    : kind === 'media' ? `<div class="ev-screen"><i></i><span>ON AIR</span><em>${when}</em></div><h2>${e.title}</h2><p>${text}</p>`
    : kind === 'devil' ? `<div class="ev-ring devil">${ic('fire')}<span>아무도 보지 않는다</span></div><h2>${e.title}</h2><p>${text}</p>`
    : kind === 'field' ? `<div class="ev-pin">${ic('pin')}<span>${REGIONS[myRegion()] || '현장'} · 현장</span></div><h2>${e.title}</h2><p>${text}</p>`
    : `<div class="ev-doc">${ic('hall')}<span>여의도 · ${when}</span><em>대외비</em></div><h2>${e.title}</h2><p>${text}</p>`;
  return `${bar()}<div class="pad"><section class="ev ev-${kind}"><div class="ev-kind">${ic(k.glyph)}${k.label}</div>${body}</section>
    <p class="ask">어떻게 하시겠습니까?</p>${choiceRows(e.ch, 'choose')}</div>`;
}
function scrBreaking() {
  const b = T.brk;
  return `${bar()}<div class="pad"><section class="brk2"><div class="brk2-top"><b>속보</b><span>BREAKING NEWS</span><em>${S.year}.${S.half === 1 ? '03' : '09'}</em></div>
    <h2>${b.title}</h2><p>${b.text()}</p>${T.brkExtra ? `<p>${T.brkExtra}</p>` : ''}${deltas()}
    <div class="brk2-tick"><span>${b.title} · 정치권 긴급 대응 · 여야 지도부 비상 회의 소집 · ${b.title} · 시민 반응 엇갈려 · </span></div></section>
    ${b.ch ? `<p class="ask">어떻게 하시겠습니까?</p>${choiceRows(b.ch, 'brkChoose')}` : btn('brkOk', '', '확인', 'primary')}</div>`;
}
function scrCampEvent() {
  const el = T.el, e = el.ev;
  return `${bar()}<div class="pad"><section class="ev ev-field camp"><div class="ev-kind">${ic('horn')}유세 돌발</div>
    <div class="ev-pin">${ic('pin')}<span>${el.place.name} · 선거운동 ${el.round}/${el.rounds}</span></div><h2>${e.title}</h2><p>${e.text(el)}</p></section>
    <p class="ask">어떻게 하시겠습니까?</p>${choiceRows(e.ch(el), 'campEv')}</div>`;
}
function scrNom() {
  const el = T.el, n = el.nom;
  const map = { direct: ['단수공천', 'ok', `공천관리위원회는 ${el.place.name} 선거구 후보로 귀하를 단수 추천하기로 의결하였습니다.`], primaryWin: ['경선 승리', 'ok', '경선에 부쳐졌고, 당원 투표와 여론조사를 합산한 결과 귀하가 근소하게 승리하였습니다.'], primaryLose: ['경선 패배', 'no', '경선 결과 귀하는 후보로 선출되지 못하였습니다. 경선에 참여한 사람은 같은 선거구에 출마할 수 없습니다.'], cutoff: ['컷오프', 'no', '공천 심사 결과 귀하는 경선 대상에서 제외되었음을 알려 드립니다.'] }[n];
  const foot = n === 'direct' || n === 'primaryWin' ? btn('elStart', '', '선거운동 시작', 'primary')
    : n === 'primaryLose' ? btn('elConcede', '', '결과에 승복한다', 'primary')
    : `${btn('elConcede', '', '승복한다 (당내 입지 +5)', 'primary')}${btn('elIndep', '', '탈당 후 무소속 출마 (호감도 −5)')}`;
  return `${bar()}<div class="pad"><section class="cert"><p class="cert-k">${PARTIES[S.party].name} 공천관리위원회</p><h2>공천 심사 결과 통지</h2><div class="rule"></div>
    <p class="cert-to">${esc(S.name)} 귀하</p><p>${map[2]}</p><p class="muted small">사전 공천 가능성 ${el.np}%</p><div class="seal ${map[1]}">${map[0]}</div></section>${foot}</div>`;
}

/* ───────── 개표방송 ───────── */
const BALLOT_NO = { simin: 1, bosu: 2, hyuk: 3, nodong: 4, gonghwa: 5, mine: 6 };
const VOTERS = { general: 118000, city: 262000, metro: 2300000, gov: 2300000, pres: 33800000 };
function castTicker(el) {
  const nm = () => SURNAMES[Math.floor(Math.random() * SURNAMES.length)] + GIVEN[Math.floor(Math.random() * GIVEN.length)];
  const st = ['당선 확실', '유력', '경합', '당선', '초접전'];
  const pool = (el.type === 'general' ? GENERAL_DISTRICTS : LOCAL_SEATS).filter((d) => d.name !== el.place.name);
  const items = [];
  for (let i = 0; i < 7; i++) { const d = pool[Math.floor(Math.random() * pool.length)], p = Math.random() < 0.5 ? 'simin' : 'bosu'; items.push(el.type === 'pres' ? `${Object.values(REGIONS)[i * 2]} 개표율 ${Math.round(20 + Math.random() * 70)}%` : `${d.name} ${nm()}(${PARTIES[p].name}) ${st[Math.floor(Math.random() * st.length)]}`); }
  return items.join('  ·  ');
}
function castShell(el, live) {
  const rows = el.final.map((r, i) => `<div class="crow ${r.c.me ? 'me' : ''}" id="cr${i}" style="--pc:${r.c.party ? PARTIES[r.c.party].color : '#8a8f9c'};transform:translateY(${i * 76}px)">
      <em>${r.c.party ? BALLOT_NO[r.c.party] || 7 : 8}</em><div class="crow-main"><b>${esc(r.c.name)}</b><small>${r.c.party ? PARTIES[r.c.party].name : '무소속'}</small><div class="track"><div class="cfill" id="cf${i}" style="width:${live ? 0 : Math.min(100, r.pct * 1.6)}%"></div></div></div>
      <div class="crow-num"><b id="cp${i}">${live ? '0.0' : r.pct.toFixed(1)}%</b><small id="cv${i}">${live ? '0' : Math.round((el.totalVotes || VOTERS[el.type]) * r.pct / 100).toLocaleString()}표</small></div><span class="crow-tag" id="ct${i}">${!live && i === 0 ? '당선' : ''}</span></div>`).join('');
  const won = el.final[0].c.me;
  return `<div class="cast"><header class="cast-top"><span class="cast-ch">${STAMP_SVG('#fff')}선택 ${S.year}</span><span class="cast-live">LIVE</span><span class="cast-clock" id="cclock">22:00</span></header>
    <div class="cast-title"><small>${el.by ? '보궐선거' : TYPE_NAME[el.type]} 개표방송</small><h2>${el.place.name}</h2></div>
    <div class="cast-prog"><div class="cast-rate"><span>개표율</span><b id="crate">${live ? '0.0' : '100.0'}</b><i>%</i></div><div class="track"><div class="cbar" id="cbar" style="width:${live ? 0 : 100}%"></div></div><p class="cast-stat" id="cstat">${live ? '투표함이 개표소에 도착하고 있습니다' : `${esc(el.final[0].c.name)} 후보 당선`}</p></div>
    <div class="cast-rows" id="crows" style="height:${el.final.length * 76}px">${rows}</div>
    <p class="cast-gap" id="cgap">${live ? '' : `1·2위 표차 ${Math.round((el.totalVotes || VOTERS[el.type]) * (el.final[0].pct - el.final[1].pct) / 100).toLocaleString()}표`}</p>
    <div id="cend">${live ? btn('castSkip', '', '결과 바로 보기') : `<div class="verdict ${won ? 'win' : 'lose'}">${won ? '당선 확정' : '낙선'}</div>${btn('elResult', '', '다음', 'primary')}`}</div>
    <div class="cast-ticker"><b>개표 속보</b><div><span>${live ? castTicker(el) + '  ·  ' + castTicker(el) : '개표가 모두 끝났습니다'}</span></div></div>
    ${live ? `<div class="cast-exit" id="cexit"><p>방송 3사 공동</p><h3>출구조사</h3><div id="cexitb"></div><small>표본오차 ±2.5%p · 실제 결과와 다를 수 있습니다</small></div>` : ''}</div>`;
}
function scrCount() { return castShell(T.el, false); }
function startCount() {
  const el = T.el;
  el.final = shares(el, true, false);
  el.totalVotes = Math.round(VOTERS[el.type] * (0.85 + Math.random() * 0.3));
  T.cur = scrCount; T.curName = '';
  if (TEST) return paint(scrCount());
  const fin = el.final, n = fin.length;
  // 초반 개표 지역 편차: 음수면 1위가 뒤지다가 역전한다
  const D = (2 + Math.random() * 7) * (Math.random() < 0.5 ? -1 : 1);
  const off = fin.map((r, i) => (i === 0 ? D : i === 1 ? -D : (Math.random() - 0.5) * 3)), ph = fin.map(() => Math.random() * 6);
  const at = (t) => { const v = fin.map((r, i) => Math.max(0.3, r.pct + off[i] * Math.pow(1 - t, 1.6) + Math.sin(t * 18 + ph[i]) * 0.7 * (1 - t))); const s = v.reduce((a, b) => a + b, 0); return v.map((x) => (x / s) * 100); };
  paint(castShell(el, true));
  const ex = at(0.12), order0 = ex.map((v, i) => i).sort((a, b) => ex[b] - ex[a]);
  document.getElementById('cexitb').innerHTML = order0.slice(0, 3).map((i, k) => `<div class="${k === 0 ? 'top' : ''}"><i style="background:${fin[i].c.party ? PARTIES[fin[i].c.party].color : '#888'}"></i><b>${esc(fin[i].c.name)}</b><span>${ex[i].toFixed(1)}%</span></div>`).join('') + `<p>${ex[order0[0]] - ex[order0[1]] < 3 ? '오차범위 내 초접전' : esc(fin[order0[0]].c.name) + ' 후보 우세 예측'}</p>`;
  const EXIT = 3200, DUR = el.type === 'pres' ? 17000 : 12500, t0 = performance.now();
  const cast = (T.cast = { skip: false });
  const $ = (id) => document.getElementById(id);
  let lastLead = -1, ended = false;
  const tick = () => {
    if (!$('crate') || T.cast !== cast) return;
    const e = performance.now() - t0;
    if (e > EXIT || cast.skip) { const x = $('cexit'); if (x && !x.classList.contains('hide')) x.classList.add('hide'); }
    const t = cast.skip ? 1 : clamp((e - EXIT) / DUR, 0, 1);
    const sh = t >= 1 ? fin.map((r) => r.pct) : at(t), counted = el.totalVotes * t;
    const order = sh.map((v, i) => i).sort((a, b) => sh[b] - sh[a]);
    const now = new Date(Date.UTC(2000, 0, 1, 20, 0, 0) + t * 5.5 * 3600e3);
    $('cclock').textContent = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
    $('crate').textContent = (t * 100).toFixed(1); $('cbar').style.width = t * 100 + '%';
    order.forEach((i, rank) => { $('cr' + i).style.transform = `translateY(${rank * 76}px)`; $('cr' + i).classList.toggle('lead', rank === 0 && t > 0.02); });
    fin.forEach((r, i) => { $('cp' + i).textContent = (t > 0 ? sh[i] : 0).toFixed(1) + '%'; $('cv' + i).textContent = Math.round((counted * sh[i]) / 100).toLocaleString() + '표'; $('cf' + i).style.width = (t > 0 ? Math.min(100, sh[i] * 1.6) : 0) + '%'; $('ct' + i).textContent = ''; });
    const a = order[0], b = order[1], gap = sh[a] - sh[b], leadAll = gap * t, remain = (1 - t) * 100;
    let tag = '경합', line = '초접전이 이어지고 있습니다';
    if (t <= 0.01) { tag = ''; line = '투표함이 개표소에 도착하고 있습니다'; }
    else if (a === 0 && (t >= 1 || leadAll > remain)) { tag = t >= 1 ? '당선' : '확정'; line = `${fin[a].c.name} 후보 당선${t >= 1 ? '' : ' 확정'}`; }
    else if (a === 0 && leadAll > remain * 0.45 && t > 0.4) { tag = '확실'; line = `${fin[a].c.name} 후보 당선 확실`; }
    else if (gap > 4 && t > 0.2) { tag = '유력'; line = `${fin[a].c.name} 후보 유력`; }
    else if (gap > 1.5) { tag = '우세'; line = `${fin[a].c.name} 후보가 앞서고 있습니다`; }
    const nowMs = performance.now();
    if (lastLead >= 0 && lastLead !== a && t > 0.05 && t < 1) { cast.flipUntil = nowMs + 1900; $('cstat').textContent = `역전! ${fin[a].c.name} 후보가 선두로 올라섰습니다`; $('cstat').classList.remove('flip'); void $('cstat').offsetWidth; $('cstat').classList.add('flip'); }
    lastLead = a;
    if (!(cast.flipUntil > nowMs)) { $('cstat').classList.remove('flip'); $('cstat').textContent = line; }
    if (tag) $('ct' + a).textContent = tag;
    $('ct' + a).className = 'crow-tag ' + (tag === '당선' || tag === '확정' ? 'done' : tag === '확실' ? 'sure' : '');
    $('cgap').textContent = t > 0.02 ? `1·2위 표차 ${Math.round((counted * gap) / 100).toLocaleString()}표 · 남은 표 ${Math.round(el.totalVotes - counted).toLocaleString()}표` : '';
    if (t >= 1) {
      if (ended) return; ended = true;
      const won = fin[0].c.me;
      $('cstat').classList.remove('flip'); $('cstat').textContent = `${fin[0].c.name} 후보 당선`;
      $('cend').innerHTML = `<div class="verdict ${won ? 'win' : 'lose'}">${won ? '당선 확정' : '낙선'}</div>${btn('elResult', '', '다음', 'primary')}`;
      fx(won ? 'win' : 'lose');
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
H.castSkip = function () { if (T.cast) T.cast.skip = true; };

/* ───────── 미니게임 2.0 ─────────
   연설: 뒤섞인 연설문 조각을 순서대로 눌러 문장을 완성한다 (3문장, 갈수록 시간이 줄어든다)
   악수: 12초 동안 시민의 손만 골라 잡는다 (항의 시위대는 감점)
   질의: 3라운드에 걸쳐 길어지는 순서를 외운다 */
const SPEECH = [
  ['존경하는', '시민 여러분,', '저는 오늘', '약속하러', '왔습니다'],
  ['말이 아니라', '결과로', '평가받는', '정치를', '하겠습니다'],
  ['낡은 정치를', '끝내고', '새로운 내일을', '열겠습니다'],
  ['아이 키우기', '좋은 도시를', '반드시', '만들겠습니다'],
  ['청년이', '떠나지 않는', '지역을', '만들어', '내겠습니다'],
  ['여러분의', '한 표가', '세상을', '바꿉니다'],
  ['일자리가', '넘치는', '경제를', '다시', '세우겠습니다'],
  ['어르신이', '존중받는', '나라를', '만들겠습니다'],
  ['끝까지', '여러분 곁을', '지키는', '일꾼이', '되겠습니다'],
  ['특권은', '내려놓고', '책임은', '더 무겁게', '지겠습니다'],
  ['골목 상권이', '살아나는', '동네를', '약속드립니다'],
  ['싸우는 정치', '말고', '일하는 정치로', '보답하겠습니다'],
];
const MG_LABEL = ['경제', '주거', '안보', '교육', '의료', '환경'];
const JUDGE_KO = ['삐끗', '아쉬움', '좋아요', '완벽'];
function mgEl(id) { return document.getElementById(id); }
function mgBuzz(p) { try { if (OPTS.vib && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* 진동 미지원 */ } }
function mini(kind, title, cb) {
  if (TEST || !OPTS.mini) return cb(rint(25, 90));
  const m = (T.mg = { kind, title, cb, done: false, timers: [] });
  paint(scrMini());
  if (kind === 'timing') { m.pool = SPEECH.slice().sort(() => Math.random() - 0.5).slice(0, 3).sort((x, y) => x.length - y.length); m.results = []; m.timers.push(setTimeout(() => wordsRound(m, 0), 400)); }
  if (kind === 'tap') whackStart(m);
  if (kind === 'memory') m.timers.push(setTimeout(() => memRound(m, 0), 400));
}
function scrMini() {
  const m = T.mg;
  let body = '';
  if (m.kind === 'timing') body = `<p class="mg-how">뒤섞인 조각을 <b>순서대로</b> 눌러 연설문을 완성하세요. 세 문장, 갈수록 시간이 줄어듭니다.</p>
    <div class="mg-stage"><div class="mg-pod">${ic('podium')}</div><div class="mg-bubble"><span id="mgph"><i class="ghost">…</i></span></div></div>
    <div class="mg-judge" id="mgj"></div>
    <div class="mg-chips" id="mgchips"></div>
    <div class="mg-meter"><span>남은 시간</span><div class="track"><div id="mgtime" style="width:100%"></div></div><b id="mgr">1 / 3</b></div>`;
  if (m.kind === 'tap') body = `<p class="mg-how">${ic('shake')} <b>시민의 손</b>만 잡으세요. ${ic('bolt')} <b>항의 시위대</b>를 누르면 감점입니다.</p>
    <div class="mg-meter"><span>남은 시간</span><div class="track"><div id="mgtime" style="width:100%"></div></div><b><span id="mgn">0</span>명</b></div>
    <div class="mg-wh" id="mgwh">${Array.from({ length: 9 }, (_, i) => `<button id="mgw${i}" data-a="mgHit" data-v="${i}"></button>`).join('')}</div>`;
  if (m.kind === 'memory') body = `<p class="mg-how" id="mgm">준비한 질의 순서를 기억하세요</p>
    <div class="mg-pips" id="mgpips"></div>
    <div class="mg-grid lab">${MG_ICONS.map((icn, i) => `<button id="mgi${i}" data-a="mgPick" data-v="${i}">${icn}<small>${MG_LABEL[i]}</small></button>`).join('')}</div>
    <div class="mg-meter"><span>라운드</span><div class="track"><div id="mground" style="width:0%"></div></div><b id="mgr">1 / 3</b></div>`;
  return `<div class="mg"><p class="seq-k">MINI GAME</p><h1>${m.title}</h1><div class="rule"></div>${body}${btn('mgSkip', '', '건너뛰기')}</div>`;
}
function finishMini(score) {
  const m = T.mg; if (!m || m.done) return;
  m.done = true; m.score = Math.round(clamp(score, 0, 100));
  if (m.raf) cancelAnimationFrame(m.raf);
  m.timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
  const g = m.score >= 85 ? 3 : m.score >= 60 ? 2 : m.score >= 35 ? 1 : 0;
  paint(`<div class="mg"><p class="seq-k">RESULT</p><h1>${m.title}</h1><div class="rule"></div>
    <div class="mg-grade g${g}">${JUDGE_KO[g]}</div><p class="mg-num">${m.score}<small>점</small></p>
    <p class="mg-how">효과 배율 <b>×${miniMul(m.score).toFixed(1)}</b></p>${btn('mgDone', '', '계속', 'primary')}</div>`);
  if (g === 3) fx('confetti');
}
// 연설: 문장 완성
function wordsLeft(m) { return clamp(1 - (performance.now() - m.t0 + m.miss * 1500) / m.limit, 0, 1); }
function wordsRound(m, r) {
  if (m.done || !mgEl('mgchips')) return;
  m.r = r; m.line = m.pool[r]; m.i = 0; m.miss = 0; m.limit = 10000 - r * 1300; m.locked = false;
  let order = m.line.map((_, i) => i);
  do { order.sort(() => Math.random() - 0.5); } while (order.every((v, i) => v === i));
  mgEl('mgph').innerHTML = '<i class="ghost">…</i>'; mgEl('mgph').className = '';
  mgEl('mgr').textContent = `${r + 1} / 3`;
  mgEl('mgchips').innerHTML = order.map((ix) => `<button data-a="mgWord" data-v="${ix}" id="mgk${ix}">${m.line[ix]}</button>`).join('');
  m.t0 = performance.now();
  const tick = () => {
    if (m.done || m.locked) return;
    const bar = mgEl('mgtime'); if (!bar) return;
    const left = wordsLeft(m); bar.style.width = left * 100 + '%';
    if (left <= 0) return wordsEnd(m, false);
    m.raf = requestAnimationFrame(tick);
  };
  tick();
}
function wordsEnd(m, ok) {
  if (m.done || m.locked) return;
  m.locked = true; if (m.raf) cancelAnimationFrame(m.raf);
  const left = wordsLeft(m), g = !ok ? 0 : left > 0.5 ? 3 : left > 0.25 ? 2 : 1;
  m.results.push(ok ? 60 + 40 * Math.min(1, left * 1.6) : (m.i / m.line.length) * 40);
  const ph = mgEl('mgph'); ph.className = 'j' + g; if (!ok) ph.innerHTML += ' <i class="ghost">…어, 그러니까…</i>';
  const j = mgEl('mgj'); j.textContent = ok ? JUDGE_KO[g] : '시간 초과'; j.className = 'mg-judge show j' + g;
  mgEl('mgchips').querySelectorAll('button').forEach((b) => { b.disabled = true; });
  mgBuzz(ok ? 30 : 120);
  const avg = m.results.reduce((a, b) => a + b, 0) / m.results.length;
  m.timers.push(setTimeout(() => { if (m.done) return; j.className = 'mg-judge'; if (m.r < 2) wordsRound(m, m.r + 1); else finishMini(avg); }, 1000));
}
// 악수
function whackStart(m) {
  m.hits = 0; m.bad = 0; m.cells = Array(9).fill(null); m.dur = 12000;
  m.timers.push(setTimeout(() => {
    m.t0 = performance.now(); m.next = m.t0;
    const loop = () => {
      if (m.done || !mgEl('mgwh')) return;
      const now = performance.now(), e = now - m.t0, k = e / m.dur;
      if (e >= m.dur) return finishMini(((m.hits - m.bad * 2) / 14) * 100);
      mgEl('mgtime').style.width = (1 - k) * 100 + '%';
      m.cells.forEach((c, i) => { if (c && now > c.until) { m.cells[i] = null; mgEl('mgw' + i).className = ''; mgEl('mgw' + i).innerHTML = ''; } });
      if (now >= m.next) {
        const empty = m.cells.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
        if (empty.length) {
          const i = empty[Math.floor(Math.random() * empty.length)], bad = Math.random() < 0.2;
          m.cells[i] = { bad, until: now + 1000 - k * 320 };
          const b = mgEl('mgw' + i); b.innerHTML = ic(bad ? 'bolt' : 'shake'); b.className = 'up ' + (bad ? 'bad' : 'good');
        }
        m.next = now + 640 - k * 280;
      }
      m.raf = requestAnimationFrame(loop);
    };
    loop();
  }, 600));
}
// 질의 순서
function memRound(m, r) {
  if (m.done || !mgEl('mgm')) return;
  m.r = r; m.len = 3 + r; m.i = 0; m.phase = 'show';
  m.seq = Array.from({ length: m.len }, () => Math.floor(Math.random() * 6));
  mgEl('mgm').textContent = `${r + 1}라운드 · 질의 순서를 기억하세요`;
  mgEl('mgr').textContent = `${r + 1} / 3`; mgEl('mground').style.width = (r / 3) * 100 + '%';
  mgEl('mgpips').innerHTML = '<i></i>'.repeat(m.len);
  const gap = 680 - r * 70;
  m.seq.forEach((ix, n) => m.timers.push(setTimeout(() => { const e = mgEl('mgi' + ix); if (e) { e.classList.remove('lit'); void e.offsetWidth; e.classList.add('lit'); } }, 500 + n * gap)));
  m.timers.push(setTimeout(() => { if (m.done) return; m.phase = 'input'; const e = mgEl('mgm'); if (e) e.textContent = '같은 순서로 누르세요'; }, 500 + m.len * gap + 200));
}
Object.assign(H, {
  mgWord(v) {
    const m = T.mg; if (!m || m.done || m.kind !== 'timing' || m.locked || !m.line) return;
    const b = mgEl('mgk' + v); if (!b || b.disabled) return;
    if (m.line[+v] !== m.line[m.i]) { m.miss++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); mgBuzz(80); return; }
    b.disabled = true; b.classList.add('used');
    const ph = mgEl('mgph'); ph.textContent = m.line.slice(0, m.i + 1).join(' ');
    m.i++; mgBuzz(15);
    if (m.i === m.line.length) wordsEnd(m, true);
  },
  mgStop() {},
  mgHit(v) {
    const m = T.mg; if (!m || m.done || m.kind !== 'tap' || !m.cells) return;
    const c = m.cells[+v], b = mgEl('mgw' + v); if (!c) return;
    m.cells[+v] = null;
    if (c.bad) { m.bad++; b.className = 'boo'; mgBuzz(120); const w = mgEl('mgwh'); w.classList.remove('jolt'); void w.offsetWidth; w.classList.add('jolt'); }
    else { m.hits++; b.className = 'hit'; mgBuzz(20); }
    mgEl('mgn').textContent = Math.max(0, m.hits - m.bad * 2);
    m.timers.push(setTimeout(() => { if (!m.cells[+v] && mgEl('mgw' + v)) { mgEl('mgw' + v).className = ''; mgEl('mgw' + v).innerHTML = ''; } }, 220));
  },
  mgPick(v) {
    const m = T.mg; if (!m || m.done || m.kind !== 'memory' || m.phase !== 'input') return;
    const e = mgEl('mgi' + v);
    if (+v !== m.seq[m.i]) { if (e) e.classList.add('no'); const right = mgEl('mgi' + m.seq[m.i]); if (right) right.classList.add('lit'); m.phase = 'end'; mgBuzz(120); m.timers.push(setTimeout(() => finishMini([0, 45, 75][m.r] + (m.i / m.len) * 25), 700)); return; }
    if (e) { e.classList.remove('ok'); void e.offsetWidth; e.classList.add('ok'); }
    const pip = mgEl('mgpips').children[m.i]; if (pip) pip.className = 'on';
    m.i++; mgBuzz(15);
    if (m.i < m.len) return;
    m.phase = 'wait';
    if (m.r >= 2) { mgEl('mground').style.width = '100%'; return m.timers.push(setTimeout(() => finishMini(100), 500)); }
    mgEl('mgm').textContent = '정확합니다. 다음 질의로';
    m.timers.push(setTimeout(() => memRound(m, m.r + 1), 800));
  },
  mgTap() {},
  mgSkip() { finishMini(25 + Math.random() * 45); },
});

/* ───────── 출마 지역 선택: 권역 탭 ───────── */
const DGROUPS = [
  { id: 'sudo', name: '수도권', regions: ['seoul', 'ggN', 'ggS', 'incheon'] },
  { id: 'chung', name: '충청', regions: ['daejeon', 'sejong', 'chungbuk', 'chungnam'] },
  { id: 'honam', name: '호남', regions: ['gwangju', 'jeonbuk', 'jeonnam'] },
  { id: 'yeong', name: '영남', regions: ['busan', 'daegu', 'ulsan', 'gyeongbuk', 'gyeongnam'] },
  { id: 'etc', name: '강원·제주', regions: ['gangwon', 'jeju'] },
];
function scrDistricts() {
  const list = districtList(T.kind).map((d, i) => Object.assign({ i }, d));
  const key = T.kind + ':' + S.turn;
  if (T.dgFor !== key) { T.dgFor = key; const mine = S.seat ? S.seat.region : S.home; T.dg = (DGROUPS.find((g) => g.regions.includes(mine) && list.some((d) => g.regions.includes(d.region))) || DGROUPS.find((g) => list.some((d) => g.regions.includes(d.region)))).id; }
  const grp = DGROUPS.find((g) => g.id === T.dg);
  const leanCls = (L) => ['l-2', 'l-1', 'l0', 'l1', 'l2'][L + 2];
  const item = (d) => {
    const lim = S.streak && S.streak.name === d.name && S.streak.count >= 3 && d.type !== 'general';
    const np = nomProb(d), cur = S.seat && S.seat.name === d.name;
    return `<button class="dcard" data-a="district" data-v="${d.i}"${lim ? ' disabled' : ''}>
      <span class="dtop"><b>${d.name}</b>${cur ? '<em>현직</em>' : ''}<i class="lean ${leanCls(d.L)}">${leanLabel(d.L)}</i></span>
      <span class="dmeta">${lim ? '3연임 제한으로 출마할 수 없다' : `<span>${np == null ? '무소속 출마' : `공천 <b>${np}%</b>`}</span><span>본선 ${stars(d)}</span><span>기반 <b>${Math.round(baseOf(d.region))}</b></span>`}</span></button>`;
  };
  const body = grp.regions.map((r) => { const ds = list.filter((d) => d.region === r); return ds.length ? `<h3 class="dreg">${REGIONS[r]}${r === S.home ? ' <small>연고지</small>' : ''}</h3>${ds.map(item).join('')}` : ''; }).join('');
  return `${bar()}<div class="pad"><h2 class="h">출마 지역 선택</h2>
    <p class="muted small">유리한 곳일수록 공천 경쟁이 치열하다. 붉은 눈금이 많을수록 본선이 어렵다.</p>
    <div class="dtabs">${DGROUPS.map((g) => { const n = list.filter((d) => g.regions.includes(d.region)).length; return n ? `<button class="${g.id === T.dg ? 'on' : ''}" data-a="dgroup" data-v="${g.id}">${g.name}<small>${n}</small></button>` : ''; }).join('')}</div>
    ${body}${btn('elBack', '', '뒤로')}</div>`;
}
H.dgroup = function (v) { T.dg = v; show(scrDistricts, 'dist'); };
