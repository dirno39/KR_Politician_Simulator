// 이번 생은 정치다 — MVP 콘텐츠 확장
// 기회 행동, 추가 이벤트, 속보, 대통령 전용 선택(개헌·계엄), 선거 결과 공표 화면, 칭호 도감.
// game.js 뒤에 로드한다.

const AVATAR = { youth: '🎒', influencer: '🤳', aide: '🗂️', ceo: '💼', local: '🏘️', lawyer: '⚖️', prosecutor: '🔍', anchor: '🎙️', union: '✊', bureaucrat: '📊', professor: '🎓', general: '🎖️' };
const ICONS = {
  ground: '🥾', partywork: '🏛️', panel: '📺', study: '📚', book: '📖', sns: '📱', rest: '🛌', bill: '📝', question: '🎤', petition: '🏠',
  attack: '⚔️', audit: '🔦', budget: '💰', fund: '🎟️', pledge: '🏗️', invest: '🏭', field: '🚧', promo: '📢',
  ag_econ: '📈', ag_sec: '🛡️', ag_wel: '🤲', ag_ref: '🔧', talk: '🗞️', variety: '🎭', channel: '▶️', comeback: '🚪',
  speech: '📣', commute: '🚇', market: '🧺', policy: '📑', show: '🎬', snsc: '📱', org: '🚌', nega: '🗡️',
};

/* ───────── 기회 행동 (매 턴 2장씩 무작위 등장) ───────── */
const sp = (o) => Object.assign({ special: true }, o);
ACTIONS.push(
  sp({ id: 'podcast', icon: '🎧', roles: ['none'], name: '팟캐스트 출연', desc: '인지도 +, 지지층 결집',
    run() { mod('fame', 4); grow('spk', 1); mod('ideology', ownSign() * 2); return '구독자 50만 시사 팟캐스트에 나가 두 시간을 떠들었다.'; } }),
  sp({ id: 'campjoin', icon: '🤝', roles: ['none'], need: () => !!S.party, name: '유력 주자 캠프 합류', desc: '당내 입지 ++, 계파색이 묻는다',
    run() { gainStanding(8); S.mainstream = true; mod('favor', -1); return '당내 유력 주자의 캠프에 이름을 올렸다. 이제 그 사람과 한 배를 탔다.'; } }),
  sp({ id: 'volunteer', icon: '🧹', roles: ['none'], name: '지역 봉사단 조직', desc: '지역 기반 +, 호감도 +',
    run() { modBase(S.home, 5); mod('favor', 3); mod('sta', -6); return '주말마다 연탄을 나르고 도시락을 돌렸다.'; } }),
  sp({ id: 'thinktank', icon: '🏢', roles: ['none', 'tv'], need: () => S.funds >= 20, name: '정책 연구소 설립', desc: '자금 −20, 지력 ++',
    run() { mod('funds', -20); grow('int', 3); mod('fame', 2); return '사무실을 얻고 작은 연구소 간판을 걸었다.'; } }),
  sp({ id: 'protest', icon: '🪧', roles: ['none'], name: '1인 시위', desc: '인지도 +, 성향 강화, 호불호',
    run() { mod('fame', 5); mod('ideology', ownSign() * 5); mod('favor', chance(0.5) ? 2 : -2); return '피켓을 들고 광장에 섰다. 지나가던 사람들이 사진을 찍었다.'; } }),
  sp({ id: 'lecture', icon: '🚌', roles: ['none', 'tv'], name: '전국 순회 강연', desc: '인지도·자금 +, 체력 −',
    run() { mod('fame', 3); mod('funds', 6); mod('sta', -8); modBase(pick(Object.keys(REGIONS)), 3); return '한 달에 열두 도시를 돌았다.'; } }),
  sp({ id: 'school', icon: '🏫', roles: ['none'], name: '청년 정치학교 강사', desc: '매력 성장, 호감도 +',
    run() { grow('cha', 1.5); mod('favor', 2); gainStanding(3); return '당 청년 정치학교에서 강의를 맡았다. 수강생들이 번호를 물어 왔다.'; } }),

  sp({ id: 'filibuster', icon: '🗣️', roles: ['mp'], name: '필리버스터', desc: '화술 60 판정 · 체력 −−',
    run() { mod('sta', -15); if (judge('spk', 60)) { mod('fame', 9); mod('favor', 2); return '여덟 시간 넘게 단상을 지켰다. 새벽 생중계 시청자가 10만을 넘겼다.'; } mod('fame', 3); return '세 시간 만에 목이 잠겨 내려왔다.'; } }),
  sp({ id: 'diplomacy', icon: '✈️', roles: ['mp'], name: '해외 의원외교', desc: '지력 성장 · 외유 논란 위험',
    run() { grow('int', 1.5); mod('fame', 1); if (chance(0.15)) { mod('favor', -4); return '출장 일정표에 관광지가 섞여 있었다는 보도가 나왔다.'; } return '의원 외교 사절단으로 다녀왔다.'; } }),
  sp({ id: 'sniper', icon: '🎯', roles: ['mp'], name: '청문회 저격수', desc: '지력 62 판정',
    run() { if (judge('int', 62)) { mod('fame', 7); gainStanding(4); return '후보자의 답변을 자료로 조목조목 무너뜨렸다. 후보자는 사흘 뒤 사퇴했다.'; } mod('favor', -3); return '의혹을 제기했지만 사실관계가 틀려 망신만 당했다.'; } }),
  sp({ id: 'special_pros', icon: '📜', roles: ['mp'], need: () => S.party && S.party !== S.w.ruling, name: '특검법 대표 발의', desc: '인지도·입지 +, 성향 강화',
    run() { mod('fame', 6); mod('ideology', ownSign() * 5); gainStanding(5); if (!S.w.playerPres) mod('approval', -1.5); return '정권 핵심을 겨냥한 특검법을 대표 발의했다.'; } }),
  sp({ id: 'report', icon: '📣', roles: ['mp'], name: '의정보고회', desc: '지역 기반 ++, 자금 −',
    run() { modBase(S.seat.region, 6); mod('funds', -5); mod('favor', 1); return '체육관을 빌려 의정보고회를 열었다. 준비한 의자가 모자랐다.'; } }),
  sp({ id: 'caucus', icon: '🕊️', roles: ['mp'], name: '초당적 의원 모임', desc: '호감도 +, 중도 이동, 당내 입지 −',
    run() { mod('favor', 3); mod('ideology', -Math.sign(S.ideology) * 4); gainStanding(-3); grow('int', 1); return '여야 의원 열두 명과 공부 모임을 만들었다.'; } }),
  sp({ id: 'floor', icon: '🪑', roles: ['mp'], need: () => S.party && S.standing >= 55 && !S.rec.floor, name: '원내대표 도전', desc: '정치력·입지 판정',
    run() { if (S.st.pol * 0.6 + S.standing * 0.4 + ri(-15, 15) >= 58) { S.rec.floor = true; mod('fame', 8); gainStanding(10); log('원내대표로 선출됐다.'); return '의원총회 결선에서 이겼다. 오늘부터 원내대표다.'; } gainStanding(-6); return '의원총회 표 계산이 빗나갔다. 낙선했다.'; } }),

  sp({ id: 'freebus', icon: '🚌', roles: ['city', 'metro', 'gov'], name: '대중교통 무료화 시범', desc: '호감도·공약 +, 자금 −',
    run() { mod('favor', 4); S.term.pledge += 6; mod('funds', -8); return '어르신과 청소년 버스 요금을 없앴다.'; } }),
  sp({ id: 'expo', icon: '🏟️', roles: ['city', 'metro', 'gov'], name: '국제행사 유치전', desc: '정치력 판정 · 크게 걸고 크게 딴다',
    run() { if (S.st.pol + ri(-25, 25) > 58) { mod('fame', 7); modBase(S.seat.region, 6); S.term.pledge += 10; return '국제행사 유치에 성공했다. 시청 앞 광장에서 환호가 터졌다.'; } mod('favor', -4); mod('funds', -5); return '최종 투표에서 탈락했다. 유치 비용만 남았다.'; } }),
  sp({ id: 'townhall', icon: '📺', roles: ['city', 'metro', 'gov'], name: '시민과의 대화 생중계', desc: '화술 55 판정',
    run() { if (judge('spk', 55)) { mod('favor', 4); mod('fame', 2); return '각본 없는 질문에 막힘 없이 답했다.'; } mod('favor', -3); return '날 선 질문에 짜증을 낸 장면이 그대로 나갔다.'; } }),
  sp({ id: 'austerity', icon: '✂️', roles: ['city', 'metro', 'gov'], name: '재정 구조조정', desc: '공약 +, 호감도 −',
    run() { S.term.pledge += 8; mod('favor', -3); grow('int', 1); return '산하기관 통폐합을 밀어붙였다. 노조가 청사 앞에 천막을 쳤다.'; } }),
  sp({ id: 'landmark', icon: '🗼', roles: ['city', 'metro', 'gov'], name: '랜드마크 건설', desc: '공약 ++ · 혈세 논란 위험',
    run() { S.term.pledge += 12; mod('fame', 3); if (chance(0.35)) { mod('favor', -6); return '착공식을 열었지만 "혈세 낭비"라는 감사 청구가 들어왔다.'; } return '착공식을 열었다. 조감도가 지역 신문 1면을 장식했다.'; } }),
  sp({ id: 'ambition', icon: '🦅', roles: ['metro', 'gov'], name: '대권 행보', desc: '인지도 ++, 지역 기반 −',
    run() { mod('fame', 7); mod('favor', -2); modBase(S.seat.region, -4); gainStanding(3); return '전국 현안에 연일 목소리를 냈다. "마음이 콩밭에 가 있다"는 말이 나왔다.'; } }),

  sp({ id: 'mc', icon: '🎬', roles: ['tv'], name: '시사 토론 MC', desc: '화술 ++, 인지도 +, 중도 이동',
    run() { grow('spk', 2); mod('fame', 5); mod('funds', 6); mod('ideology', -Math.sign(S.ideology) * 3); return '토론 프로그램 진행을 맡았다. 양쪽 모두에게 욕을 먹었다.'; } }),
  sp({ id: 'ad', icon: '🧴', roles: ['tv'], name: '광고 모델', desc: '자금 +++, 호감도 −',
    run() { mod('funds', 20); mod('favor', -4); return '건강식품 광고를 찍었다. 통장은 두둑해졌다.'; } }),
  sp({ id: 'docu', icon: '🎥', roles: ['tv'], name: '휴먼 다큐 출연', desc: '호감도 ++',
    run() { mod('favor', 5); mod('fame', 3); return '어머니와 고향집에서 찍은 장면이 화제가 됐다.'; } }),

  sp({ id: 'veto', icon: '🚫', roles: ['president'], need: () => S.w.majority !== S.party, name: '거부권 행사', desc: '지지층 결집이냐 불통 논란이냐',
    run() { mod('ideology', ownSign() * 3); if (chance(0.5)) { mod('approval', 3); return '야당 주도 법안에 재의를 요구했다. 지지층이 결집했다.'; } mod('approval', -4); return '또 거부권이다. "불통 대통령"이라는 제목이 걸렸다.'; } }),
  sp({ id: 'reshuffle', icon: '🔄', roles: ['president'], name: '개각 단행', desc: '지지율 −2 ~ +6',
    run() { const v = ri(-2, 6); mod('approval', v); return v > 2 ? '참신한 인선이라는 평이 나왔다.' : '회전문 인사라는 비판이 따라붙었다.'; } }),
  sp({ id: 'summit', icon: '🌐', roles: ['president'], name: '정상 외교 순방', desc: '정치력 60 판정',
    run() { mod('sta', -6); if (judge('pol', 60)) { mod('approval', 5); mod('fame', 2); return '정상회담에서 대규모 투자 약속을 받아 왔다.'; } mod('approval', -2); return '빈손 외교라는 평가를 받았다.'; } }),
  sp({ id: 'pardon', icon: '🕊️', roles: ['president'], name: '특별사면', desc: '지지율 −6 ~ +3',
    run() { const v = ri(-6, 3); mod('approval', v); return v >= 0 ? '국민 통합 차원의 사면이라는 설명이 먹혔다.' : '사면 명단에 오른 이름들이 여론을 뒤집어 놓았다.'; } }),
  sp({ id: 'meet', icon: '☕', roles: ['president'], need: () => S.w.majority !== S.party, name: '영수회담', desc: '정치력 55 판정 · 성공 시 의제 통과율 상승',
    run() { if (judge('pol', 55)) { S.coop = 2; mod('approval', 2); return '야당 대표와 두 시간 독대했다. 몇 가지 법안에 합의했다.'; } mod('approval', -1); return '회담은 서로의 입장만 확인하고 끝났다.'; } }),
  sp({ id: 'apology', icon: '🙇', roles: ['president'], need: () => S.w.approval < 35, name: '대국민 사과와 국정 쇄신', desc: '지지율 +',
    run() { mod('approval', 6); mod('favor', 2); return '고개를 숙이고 국정 쇄신을 약속했다.'; } })
);

/* ───────── 선거운동 추가 행동 ───────── */
CAMP.push(
  { id: 'celeb', name: '유명 인사 지원 유세', desc: '당내 입지 기반', need: () => S.standing >= 30 || S.fame >= 50,
    run() { return [1.2 + S.standing / 60, '당 대표와 인기 연예인이 유세차에 함께 올랐다.']; } },
  { id: 'alley', name: '골목 자전거 유세', desc: '체력 기반 · 호감도 +',
    run() { mod('sta', -6); mod('favor', 1); return [1.2 + S.st.sta / 150, '자전거를 타고 골목마다 누볐다.']; } },
  { id: 'letter', name: '손편지 공보물', desc: '지력·매력 기반',
    run() { return [0.8 + S.st.int / 80 + S.st.cha / 160, '직접 쓴 편지를 집집마다 넣었다.']; } },
  { id: 'unify', name: '후보 단일화 협상', desc: '정치력 55 판정 · 성공 시 군소 후보 사퇴', need: () => !!unifyTarget(T.el),
    run(el) {
      const t = unifyTarget(el);
      if (S.st.pol + ri(-15, 15) >= 55) { const gain = baseVote(t.party, el.place.L) * 0.6; el.cands = el.cands.filter((c) => c !== t); el.my += gain; return [0, `${t.name} 후보가 사퇴하고 당신 지지를 선언했다.`]; }
      return [-1, `${t.name} 후보와의 단일화 협상이 결렬됐다. 지분 다툼만 보도됐다.`];
    } },
  { id: 'hunger', name: '삭발·단식 배수진', desc: '도박. 결집이냐 역풍이냐', need: () => T.el && T.el.round >= 2,
    run() { mod('sta', -15); if (chance(0.45)) return [4, '삭발한 채 광장에 앉았다. 지지층이 결집했다.']; return [-2.5, '"보여주기"라는 냉소가 돌았다.']; } },
  { id: 'youthtalk', name: '청년 토크콘서트', desc: '매력 55 판정',
    run() { return judge('cha', 55) ? [2.2, '대학가 토크콘서트가 만석이었다.'] : [0.2, '토크콘서트 객석이 절반도 차지 않았다.']; } }
);
Object.assign(ICONS, { celeb: '🎤', alley: '🚲', letter: '✉️', unify: '🤝', hunger: '🔥', youthtalk: '🎪' });
function unifyTarget(el) {
  if (!el || !el.cands) return null;
  const c = el.cands.filter((x) => !x.me && PARTIES[x.party].kind !== 'major' && Math.abs(PARTIES[x.party].ideo - S.ideology) <= 50);
  c.sort((a, b) => Math.abs(PARTIES[a.party].ideo - S.ideology) - Math.abs(PARTIES[b.party].ideo - S.ideology));
  return c[0] || null;
}
function rollCamp(el) {
  const pool = CAMP.filter((a) => a.id !== 'commute' && (!a.need || a.need()));
  const out = ['commute'];
  for (let i = 0; i < 4 && pool.length; i++) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0].id);
  return out;
}
function rollOffer() {
  // 반기마다 일정 구성이 바뀐다: 기본 일정 5개 + 기회 일정 3개 + 정국 화두
  const key = S.turn + ':' + S.role;
  if (S.offerKey === key) return;
  S.offerKey = key;
  const ok = (a) => a.roles.includes(S.role) && (!a.need || a.need());
  const spc = ACTIONS.filter((a) => a.special && ok(a));
  S.offer = [];
  for (let i = 0; i < 3 && spc.length; i++) S.offer.push(spc.splice(Math.floor(rnd() * spc.length), 1)[0].id);
  const core = ACTIONS.filter((a) => !a.special && !['rest', 'comeback', 'bill', 'pledge'].includes(a.id) && ok(a));
  S.coreOffer = ['rest', 'comeback', 'bill', 'pledge']; // 휴식과, 임기 과업을 진척시키는 일정은 항상 고를 수 있다
  for (let i = 0; i < 5 && core.length; i++) S.coreOffer.push(core.splice(Math.floor(rnd() * core.length), 1)[0].id);
  S.theme = pick(THEMES).id;
}

/* ───────── 추가 이벤트 ───────── */
EVENTS.push(
  { id: 'deepfake', cond: () => S.fame >= 25, title: '딥페이크 영상',
    text: () => '당신이 하지도 않은 말을 하는 영상이 메신저로 퍼지고 있다. 꽤 그럴듯하다.',
    ch: [
      ['즉시 법적 대응', '자금 −, 호감도 +', () => { mod('funds', -5); mod('favor', 1); return '유포자를 고소하고 원본 삭제를 요청했다.'; }],
      ['유머로 받아친다', '매력 60 판정', () => { if (judge('cha', 60)) { mod('fame', 5); mod('favor', 3); return '"저보다 말을 잘하네요"라는 한마디가 더 크게 퍼졌다.'; } mod('favor', -4); return '농담이 해명을 덮어 버렸다. 진짜라고 믿는 사람이 늘었다.'; }],
      ['무시한다', '호감도 −', () => { mod('favor', -3); return '대응하지 않았다. 영상은 계속 돌았다.'; }],
    ] },
  { id: 'egg', cond: () => S.fame >= 20, title: '계란 세례',
    text: () => '행사장에서 누군가 던진 계란이 어깨에 맞았다. 카메라가 일제히 돌아간다.',
    ch: [
      ['닦고 연설을 이어간다', '호감도 +', () => { mod('favor', 4); mod('fame', 2); return '손수건으로 닦고 하던 말을 마저 했다.'; }],
      ['던진 사람과 대화한다', '매력 55 판정', () => { if (judge('cha', 55)) { mod('favor', 6); mod('fame', 3); return '10분간의 대화 영상이 조회수 300만을 넘겼다.'; } mod('fame', 2); return '대화는 고성으로 끝났다.'; }],
      ['경호 강화를 요구한다', '호감도 −', () => { mod('favor', -2); mod('sta', 3); return '주최 측에 강하게 항의했다. 과민 반응이라는 말이 나왔다.'; }],
    ] },
  { id: 'aide_scandal', cond: () => ['mp', 'city', 'metro', 'gov'].includes(S.role), title: '보좌진 갑질 폭로',
    text: () => '당신 사무실 직원이 후배에게 폭언을 했다는 폭로가 익명 게시판에 올라왔다.',
    ch: [
      ['즉시 면직하고 사과한다', '호감도 소폭 −', () => { mod('favor', -2); return '당일 면직 처리하고 사과문을 냈다.'; }],
      ['조사 후 결정한다', '도박', () => { if (chance(0.5)) { mod('favor', -7); return '조사하는 사이 추가 폭로가 터졌다.'; } return '사실과 다른 부분이 확인됐고 논란은 가라앉았다.'; }],
      ['감싼다', '호감도 −−', () => { mod('favor', -8); gainStanding(2); return '"열심히 하다 생긴 일"이라고 감쌌다. 여론이 싸늘해졌다.'; }],
    ] },
  { id: 'rival', cond: () => S.party && S.role !== 'president', title: '당내 라이벌의 저격',
    text: () => '같은 당 동료가 라디오에서 당신을 공개 저격했다. "그분은 자기 정치만 합니다."',
    ch: [
      ['맞받아친다', '인지도 +, 당내 입지 −', () => { mod('fame', 4); gainStanding(-3); mod('favor', -1); return '"자기 정치도 못 하는 분"이라고 받아쳤다. 집안싸움이 기사화됐다.'; }],
      ['대응하지 않는다', '호감도 +', () => { mod('favor', 2); gainStanding(-2); return '웃으며 넘겼다.'; }],
      ['막후에서 화해한다', '정치력 55 판정', () => { if (judge('pol', 55)) { gainStanding(6); return '소주 세 병으로 오해를 풀었다. 아군이 하나 늘었다.'; } gainStanding(-4); return '만남 자체가 언론에 새어 나갔다.'; }],
    ] },
  { id: 'strike', cond: () => S.role !== 'abroad', title: '총파업',
    text: () => '대규모 파업이 3주째 이어지고 있다. 물류가 멈췄다.',
    ch: [
      ['노조를 지지한다', '진보 쪽 이동', () => { mod('ideology', -7); if (S.concept === 'union') mod('favor', 3); mod('fame', 2); return '파업 현장을 찾아 연대 발언을 했다.'; }],
      ['법과 원칙을 강조한다', '보수 쪽 이동', () => { mod('ideology', 7); mod('fame', 2); return '"불법에는 타협이 없다"고 말했다.'; }],
      ['중재를 자청한다', '정치력 60 판정', () => { if (judge('pol', 60)) { mod('favor', 5); mod('fame', 3); return '밤샘 협상 끝에 잠정 합의를 끌어냈다.'; } mod('favor', -2); return '양쪽 모두에게 문전박대를 당했다.'; }],
    ] },
  { id: 'offrecord', cond: () => S.fame >= 20, title: '오프 더 레코드',
    text: () => '기자들과의 저녁 자리에서 한 농담이 그대로 기사로 나왔다.',
    ch: [
      ['깨끗이 인정한다', '호감도 소폭 −', () => { mod('favor', -1); return '"제 불찰"이라고 인정했다. 하루 만에 묻혔다.'; }],
      ['보도에 강하게 항의한다', '인지도 +, 호감도 −', () => { mod('favor', -3); mod('fame', 2); return '언론중재위에 제소했다. 기사가 두 배로 늘었다.'; }],
    ] },
  { id: 'fandom', cond: () => S.fame >= 45, title: '팬덤의 폭주',
    text: () => '당신의 열성 지지자들이 비판 기사를 쓴 기자의 신상을 털고 있다.',
    ch: [
      ['자제를 촉구한다', '호감도 +, 인지도 −', () => { mod('favor', 3); mod('fame', -2); gainStanding(-2); return '"그런 지지는 사양한다"고 썼다. 팬카페 회원이 줄었다.'; }],
      ['침묵한다', '호감도 −', () => { mod('favor', -3); return '아무 말도 하지 않았다.'; }],
      ['고맙다고 한다', '인지도 +, 호감도 −−', () => { mod('fame', 3); mod('favor', -5); mod('ideology', ownSign() * 4); return '"든든하다"고 썼다. 팬덤 정치라는 사설이 실렸다.'; }],
    ] },
  { id: 'mentor', cond: () => S.party && S.age < 45 && !S.leader, title: '원로의 제안',
    text: () => '당의 원로가 조용히 불렀다. "내 사람들을 자네한테 넘겨줄까 하네."',
    ch: [
      ['감사히 받는다', '당내 입지 ++', () => { gainStanding(10); S.mainstream = true; mod('favor', -1); return '원로의 조직을 물려받았다. 계파의 막내가 됐다.'; }],
      ['홀로 서겠다고 한다', '호감도 +', () => { mod('favor', 2); gainStanding(-3); return '"제 힘으로 해 보겠습니다." 원로는 웃기만 했다.'; }],
    ] },
  { id: 'assets', cond: () => S.role !== 'none' || S.funds >= 30, title: '재산 공개',
    text: () => '공직자 재산 공개에서 당신 명의의 상가 건물이 도마에 올랐다.',
    ch: [
      ['매각하고 차익을 기부한다', '자금 −, 호감도 ++', () => { mod('funds', -15); mod('favor', 5); return '건물을 팔고 차익을 기부했다.'; }],
      ['취득 경위를 해명한다', '지력 58 판정', () => { if (judge('int', 58)) return '계약서와 세금 납부 내역을 공개했다. 논란이 정리됐다.'; mod('favor', -6); return '해명이 오히려 새 의혹을 낳았다.'; }],
      ['합법이라고 강조한다', '호감도 −', () => { mod('favor', -4); return '"법적으로 문제없다"고 했다. 그 문장만 제목이 됐다.'; }],
    ] },
  { id: 'variety_call', cond: () => S.fame >= 40 && S.role !== 'tv', title: '예능 섭외',
    text: () => '인기 관찰 예능에서 섭외가 왔다. 일상을 다 보여줘야 한다.',
    ch: [
      ['출연한다', '매력 55 판정', () => { if (judge('cha', 55)) { mod('fame', 6); mod('favor', 3); return '의외의 허당 매력이 통했다.'; } mod('favor', -3); mod('fame', 3); return '연출 티가 난다는 반응이 많았다.'; }],
      ['거절한다', '호감도 소폭 +', () => { mod('favor', 1); return '"본업에 집중하겠다"고 답했다.'; }],
    ] },
  { id: 'pension', cond: () => ['mp', 'president'].includes(S.role), title: '연금 개혁',
    text: () => '더 내고 덜 받는 연금 개혁안이 테이블에 올랐다. 필요하다는 건 모두가 알지만 누구도 총대를 메려 하지 않는다.',
    ch: [
      ['개혁에 앞장선다', '호감도 −, 인지도 +', () => { mod('favor', -4); mod('fame', 3); grow('int', 1); S.rec.bills++; return '욕을 먹을 각오로 개혁안에 이름을 올렸다.'; }],
      ['미래 세대에 호소한다', '화술 62 판정', () => { if (judge('spk', 62)) { mod('favor', 4); mod('fame', 3); return '본회의 연설이 화제가 됐다. 여론이 움직였다.'; } mod('favor', -3); return '연설은 공허하다는 평을 받았다.'; }],
      ['다음 정부로 미룬다', '호감도 소폭 +', () => { mod('favor', 1); return '"사회적 합의가 먼저"라고 말했다.'; }],
    ] },
  { id: 'blue_call', cond: () => S.party === S.w.ruling && S.role !== 'president' && !S.w.playerPres, title: '대통령의 독대',
    text: () => '대통령이 당신을 따로 불렀다. "요즘 민심이 어떻습니까. 솔직하게 말해 보세요."',
    ch: [
      ['쓴소리를 한다', '호감도 +, 당내 입지 −', () => { mod('favor', 4); gainStanding(-5); mod('fame', 2); return '있는 그대로 말했다. 대통령의 표정이 굳었다.'; }],
      ['듣기 좋은 말을 한다', '당내 입지 +', () => { gainStanding(5); mod('favor', -2); return '"잘하고 계십니다." 대통령이 흡족해했다.'; }],
    ] },
  { id: 'ai_forum', cond: () => true, title: 'AI와 일자리 토론회',
    text: () => 'AI가 일자리를 얼마나 대체할지를 두고 대형 토론회가 열린다. 발제를 맡아 달라는 요청이 왔다.',
    ch: [
      ['발제를 맡는다', '지력 60 판정', () => { if (judge('int', 60)) { mod('fame', 4); mod('favor', 2); grow('int', 1); return '구체적 대안을 내놨다는 평가를 받았다.'; } mod('favor', -2); return '원론만 되풀이했다는 평가를 받았다.'; }],
      ['사양한다', '변화 없음', () => '일정을 이유로 사양했다.'],
    ] },
  { id: 'marathon', cond: () => S.age < 70, title: '지역 마라톤 대회',
    text: () => '지역 마라톤 대회에서 10km 코스 참가를 권유받았다.',
    ch: [
      ['완주에 도전한다', '체력 60 판정', () => { mod('sta', -6); if (judge('sta', 60)) { mod('favor', 3); mod('fame', 2); modBase(myRegion(), 3); return '끝까지 뛰었다. 결승선 사진이 지역 신문에 실렸다.'; } mod('fame', 2); mod('favor', -1); return '6km 지점에서 주저앉은 사진이 퍼졌다.'; }],
      ['출발 신호만 쏜다', '변화 없음', () => '출발 총성을 울리고 돌아왔다.'],
    ] },
  { id: 'old_friend', cond: () => S.role !== 'none' && S.role !== 'tv', title: '동창의 부탁',
    text: () => '고등학교 동창이 찾아왔다. "우리 애 좀 봐줘. 서류는 냈대."',
    ch: [
      ['거절한다', '지역 기반 소폭 −', () => { mod('favor', 1); modBase(myRegion(), -2); return '거절했다. 동창회에서 야박하다는 말이 돌았다.'; }],
      ['들어준다', '지역 기반 + · 폭로 위험 · 약점 +', () => { modBase(myRegion(), 4); dirt(10, '채용 청탁'); if (chance(0.35)) { mod('favor', -10); mod('fame', 3); return '채용 청탁이 내부 고발로 드러났다.'; } return '전화 한 통을 넣었다. 아무도 모르고 지나갔다.'; }],
      ['공식 절차를 안내한다', '변화 없음', () => { grow('int', 0.5); return '채용 일정과 절차를 안내해 주고 돌려보냈다.'; }],
    ] },
  { id: 'lame_duck', cond: () => S.role === 'president' && S.w.presTurn >= 6, title: '레임덕',
    text: () => '임기 후반, 여당 대표가 공개적으로 당신과 선을 긋기 시작했다. 차기 주자들도 눈치를 본다.',
    ch: [
      ['당과 거리를 둔다', '지지율 소폭 +', () => { mod('approval', 2); return '"국정에만 전념하겠다"고 선언했다.'; }],
      ['당 장악을 시도한다', '정치력 65 판정', () => { if (judge('pol', 65)) { mod('approval', 3); return '측근을 지도부에 앉히는 데 성공했다.'; } mod('approval', -5); return '당무 개입 논란이 터졌다.'; }],
      ['무대응', '지지율 −', () => { mod('approval', -2); return '아무 말도 하지 않았다. 힘이 빠졌다는 기사가 이어졌다.'; }],
    ] },
  { id: 'pres_aide', cond: () => S.role === 'president', title: '측근 비리 의혹',
    text: () => '오랜 측근이 이권에 개입했다는 보도가 나왔다. 검찰이 수사에 착수했다.',
    ch: [
      ['읍참마속', '호감도 +', () => { mod('approval', 1); mod('favor', 3); return '즉시 직에서 물러나게 하고 성역 없는 수사를 지시했다.'; }],
      ['수사를 지켜본다', '지지율 −', () => { mod('approval', -5); return '"수사 결과를 지켜보자"고 했다. 감싸기라는 비판이 나왔다.'; }],
      ['정치 공작이라고 반박한다', '도박', () => { mod('ideology', ownSign() * 3); if (chance(0.3)) { mod('approval', 3); return '의혹의 일부가 허위로 드러나 역공에 성공했다.'; } mod('approval', -8); return '추가 증거가 나왔다. 대통령의 말이 거짓이 됐다.'; }],
    ] },
  { id: 'pres_disaster', cond: () => S.role === 'president', title: '국가적 재난',
    text: () => '대형 재난이 발생했다. 온 나라가 대통령이 어디 있는지 묻는다.',
    ch: [
      ['현장으로 간다', '매력 55 판정', () => { if (judge('cha', 55)) { mod('approval', 6); return '유가족의 손을 잡고 오래 서 있었다.'; } mod('approval', -3); return '현장 방문이 의전 논란으로 번졌다.'; }],
      ['상황실에서 지휘한다', '지력 60 판정', () => { if (judge('int', 60)) { mod('approval', 5); return '초기 대응이 빨랐다는 평가를 받았다.'; } mod('approval', -6); return '컨트롤타워가 보이지 않았다는 비판이 쏟아졌다.'; }],
    ] }
);

/* ───────── 속보 (턴 시작 시 무작위 발생) ───────── */
const BREAKING = [
  { id: 'gate', cond: () => !S.w.playerPres, title: '대통령 측근 게이트',
    text: () => '대통령 최측근이 수백억대 이권에 개입했다는 녹취가 공개됐다. 정국이 요동친다.',
    run() { mod('approval', -9); } },
  { id: 'fx', cond: () => true, title: '환율 급등, 증시 폭락',
    text: () => '환율이 하루 만에 40원 올랐고 증시에 사이드카가 발동됐다.',
    run() { mod('approval', -6); if (S.term && ['city', 'metro', 'gov'].includes(S.role)) S.term.pledge -= 4; } },
  { id: 'summit', cond: () => !S.w.playerPres, title: '깜짝 정상회담 성사',
    text: () => '예고에 없던 정상회담이 전격 발표됐다. 외신이 일제히 톱으로 다룬다.',
    run() { mod('approval', 7); } },
  { id: 'tragedy', cond: () => true, title: '대형 참사',
    text: () => '도심에서 대형 사고가 발생해 많은 사상자가 나왔다. 온 나라가 침통하다.',
    run() { mod('approval', -6); },
    ch: [
      ['조문하고 말을 아낀다', '호감도 +', () => { mod('favor', 2); return '분향소를 찾아 묵념만 하고 돌아왔다.'; }],
      ['정부 책임을 따진다', '인지도 +', () => { mod('fame', 3); mod('ideology', -Math.sign(PARTIES[S.w.ruling].ideo) * 4); return '"막을 수 있었던 참사"라고 말했다.'; }],
      ['정쟁 중단을 호소한다', '호감도 +, 당내 입지 −', () => { mod('favor', 3); gainStanding(-2); return '"지금은 수습이 먼저"라고 호소했다.'; }],
    ] },
  { id: 'opp_leader', cond: () => !!mainOpp(S.w.ruling), title: '제1야당 대표 사법 리스크',
    text: () => `${PARTIES[mainOpp(S.w.ruling)].name} 대표에게 구속영장이 청구됐다. 야당이 발칵 뒤집혔다.`,
    run() { mod('approval', 4); },
    ch: [
      ['원칙대로 하라고 말한다', '중도 이동', () => { mod('ideology', -Math.sign(S.ideology) * 3); mod('favor', 1); return '"법 앞에 예외는 없다"고 말했다.'; }],
      ['정치 탄압이라고 한다', '야당 쪽으로 성향 이동', () => { mod('ideology', -Math.sign(PARTIES[S.w.ruling].ideo) * 5); if (S.party === mainOpp(S.w.ruling)) gainStanding(6); mod('favor', -2); return '"정치 검찰의 야당 탄압"이라고 규정했다.'; }],
      ['말을 아낀다', '변화 없음', () => '"지켜보겠다"는 말만 남겼다.'],
    ] },
  { id: 'feud', cond: () => S.party && S.role !== 'president', title: '소속 정당 내분',
    text: () => `${PARTIES[S.party].name} 최고위원회의가 고성 끝에 파행됐다. 주류와 비주류가 정면충돌했다.`,
    run() {},
    ch: [
      ['주류 편에 선다', '당내 입지 +', () => { gainStanding(6); S.mainstream = true; return '지도부 지지 성명에 이름을 올렸다.'; }],
      ['비주류 편에 선다', '호감도 +, 당내 입지 −', () => { gainStanding(-4); mod('favor', 3); S.mainstream = false; return '쇄신을 요구하는 연판장에 서명했다.'; }],
      ['중재에 나선다', '정치력 60 판정', () => { if (judge('pol', 60)) { gainStanding(8); mod('fame', 3); return '양쪽을 한 테이블에 앉혔다. "해결사"라는 별명이 붙었다.'; } gainStanding(-5); return '양쪽 모두에게 박쥐라는 말을 들었다.'; }],
    ] },
  { id: 'fanclub', cond: () => S.fame >= 20 && S.fame < 70, title: '팬클럽 결성',
    text: () => `온라인에 "${S.name}을 사랑하는 사람들" 모임이 생겼다. 회원이 일주일 만에 만 명을 넘겼다.`,
    run() { mod('fame', 5); mod('favor', 2); } },
  { id: 'fake', cond: () => S.fame >= 30, title: '가짜뉴스 확산',
    text: () => '당신에 대한 근거 없는 소문이 유튜브 채널 여러 곳에서 동시에 퍼지고 있다.',
    run() {},
    ch: [
      ['고소한다', '자금 −', () => { mod('funds', -5); mod('favor', 1); return '채널 운영자들을 고소했다.'; }],
      ['팩트체크 영상을 낸다', '지력 55 판정', () => { if (judge('int', 55)) { mod('favor', 3); mod('fame', 2); return '조목조목 반박한 영상이 원본보다 많이 조회됐다.'; } mod('favor', -3); return '해명 영상이 오히려 소문을 키웠다.'; }],
      ['무시한다', '호감도 −', () => { mod('favor', -4); return '대응하지 않았다. 소문은 사실처럼 굳어졌다.'; }],
    ] },
  { id: 'poll_star', cond: () => S.fame >= 60 && S.role !== 'president', title: '차기 주자 여론조사',
    text: () => `차기 대선 주자 적합도 조사에 ${S.name}의 이름이 처음 올랐다. 단숨에 3위다.`,
    run() { mod('fame', 6); gainStanding(4); } },
  { id: 'sports', cond: () => true, title: '월드컵 8강 진출',
    text: () => '축구 대표팀이 월드컵 8강에 올랐다. 광화문에 30만 명이 모였다. 정치 뉴스가 사라졌다.',
    run() { mod('approval', 3); } },
  { id: 'pandemic', cond: () => !S.flagPandemic, title: '신종 감염병 확산',
    text: () => '신종 감염병이 지역사회로 번지고 있다. 정부가 위기 경보를 최고 단계로 올렸다.',
    run() { S.flagPandemic = true; mod('approval', -4); if (['city', 'metro', 'gov'].includes(S.role)) { if (judge('int', 58)) { mod('favor', 6); mod('fame', 4); T.brkExtra = '선제적 방역 조치가 모범 사례로 보도됐다.'; } else { mod('favor', -5); T.brkExtra = '초기 대응이 늦었다는 비판을 받았다.'; } } } },
  { id: 'flood', cond: () => S.role !== 'abroad', title: `연고지 수해`,
    text: () => `${REGIONS[S.home]} 지역에 기록적 폭우가 쏟아져 수백 가구가 침수됐다.`,
    run() {},
    ch: [
      ['복구 현장으로 간다', '지역 기반 +, 체력 −', () => { modBase(S.home, 6); mod('sta', -8); mod('favor', 2); return '장화를 신고 사흘간 흙탕물을 퍼냈다.'; }],
      ['성금을 낸다', '자금 −, 호감도 +', () => { mod('funds', -8); mod('favor', 3); return '성금을 전달했다.'; }],
      ['예정된 일정을 소화한다', '호감도 −', () => { mod('favor', -2); modBase(S.home, -3); return '일정을 바꾸지 않았다. 고향에서 서운하다는 말이 나왔다.'; }],
    ] },
  { id: 'housing', cond: () => true, title: '집값 폭등',
    text: () => '수도권 아파트값이 석 달 만에 12% 올랐다. 2030 세대의 분노가 끓는다.',
    run() { mod('approval', -5); } },
  { id: 'scoop', cond: () => S.role === 'mp', title: '익명의 제보',
    text: () => '의원실로 대형 비리를 뒷받침하는 문건이 도착했다. 진짜라면 정국이 뒤집힌다.',
    run() {},
    ch: [
      ['즉시 폭로한다', '인지도 ++ · 오보 위험', () => { mod('fame', 9); if (chance(0.3)) { mod('favor', -8); return '문건 일부가 조작으로 드러났다. 사과 기자회견을 열어야 했다.'; } mod('favor', 2); return '기자회견장이 발칵 뒤집혔다. 당신의 이름이 실시간 검색어를 휩쓸었다.'; }],
      ['검증한 뒤 공개한다', '지력 58 판정', () => { if (judge('int', 58)) { mod('fame', 6); mod('favor', 4); return '2주간 교차 검증한 끝에 공개했다. 누구도 반박하지 못했다.'; } return '검증하는 사이 다른 의원이 먼저 터뜨렸다.'; }],
      ['당 지도부에 넘긴다', '당내 입지 ++', () => { gainStanding(7); return '문건을 지도부에 전달했다. 공은 대표가 가져갔다.'; }],
    ] },
  { id: 'third', cond: () => S.party && PARTIES[S.party].kind === 'major' && S.standing < 45 && S.role !== 'president', title: '제3지대 빅텐트',
    text: () => '양당 비주류가 우리혁신당과 손잡고 빅텐트를 친다는 소식이다. 당신에게도 연락이 왔다.',
    run() {},
    ch: [
      ['합류한다', '우리혁신당으로 이적', () => { log(`${PARTIES[S.party].name}을 떠나 우리혁신당에 합류했다.`); S.party = 'hyuk'; S.standing = 35; S.mainstream = false; S.leader = false; S.rec.switches++; mod('favor', -5); mod('fame', 4); return '탈당 기자회견을 열고 제3지대 합류를 선언했다.'; }],
      ['남는다', '당내 입지 +', () => { gainStanding(3); return '"당을 지키겠다"고 밝혔다.'; }],
    ] },
];
function rollBreaking() {
  if (S.turn <= 1 || !chance(0.22)) return null;
  S.brkUsed = S.brkUsed || [];
  const pool = BREAKING.filter((b) => !S.brkUsed.includes(b.id) && b.cond());
  if (!pool.length) return null;
  const b = pick(pool);
  S.brkUsed.push(b.id); if (S.brkUsed.length > 7) S.brkUsed.shift();
  return b;
}
function showBreaking(b) {
  resetD(); T.brk = b; T.brkExtra = '';
  b.run();
  fx('flash');
  show(scrBreaking);
}
function scrBreaking() {
  const b = T.brk;
  return `${bar()}<div class="pad brk"><div class="brk-tag">속보</div>
    ${card(b.title, `<p>${b.text()}</p>${T.brkExtra ? `<p>${T.brkExtra}</p>` : ''}${deltas()}`)}
    ${b.ch ? b.ch.map((c, i) => `<button class="row" data-a="brkChoose" data-v="${i}"><b>${c[0]}</b><span>${hint(c[1])}</span></button>`).join('') : btn('brkOk', '', '확인', 'primary')}</div>`;
}

/* ───────── 홈 화면 부속 ───────── */
function headline() {
  if (S.w.news) return S.w.news;
  const a = S.w.approval, r = PARTIES[S.w.ruling].name;
  const pool = a >= 55 ? [`${r}, 지지율 고공행진에 표정 관리`, '야권 "반등 계기 안 보인다" 한숨', '대통령 지지율 과반 유지']
    : a >= 40 ? ['여야, 민생 법안 두고 줄다리기', '정치권, 다음 선거 앞두고 물밑 움직임', '국회 대정부질문 고성 끝 정회', '여야 원내대표 회동 빈손 종료']
    : [`${r} 내부서 "이대로는 선거 못 치른다"`, '대통령 지지율 취임 후 최저', '야권 "정권 심판" 총공세', '여당 비주류, 쇄신 요구 연판장'];
  return pool[(S.turn * 7 + S.name.length) % pool.length];
}
function seatBar() {
  const seats = S.w.seats; if (!seats) return '';
  const order = ['nodong', 'simin', 'hyuk', 'mine', 'bosu', 'gonghwa'].filter((p) => PARTIES[p]);
  return `<div class="seats"><div class="seats-bar">${order.map((p) => `<i style="flex:${seats[p] || 0};background:${PARTIES[p].color}"></i>`).join('')}</div>
    <p class="muted small">국회 ${order.filter((p) => seats[p]).map((p) => `${PARTIES[p].name.replace('더불어', '').replace('우리', '')} ${seats[p]}`).join(' · ')}</p></div>`;
}
function canAmend() { return S.role === 'president' && S.w.approval >= 65 && !S.rec.amend && S.amendTerm !== S.rec.wins.pres; }
function canFound() { return S.fame >= FOUND_FAME && !S.myParty && !['president', 'abroad'].includes(S.role); }
function homeExtras() {
  let h = '';
  if (!S.party && S.role !== 'president') h += `<button class="row act hot" data-a="joinMenu" data-v=""><i>${ic('door')}</i><div><b>정당 입당 타진</b><span>무소속 생활을 끝내고 당적을 갖는다</span></div></button>`;
  if (canFound()) h += `<button class="row act hot gold" data-a="found" data-v=""><i>${ic('flag')}</i><div><b>신당 창당</b><span>인지도 ${FOUND_FAME} 이상 · 내 이름으로 당을 세운다</span></div></button>`;
  if (S.role !== 'president') return h;
  if (canAmend()) h += `<button class="row act hot gold" data-a="amend" data-v=""><i>${ic('hall')}</i><div><b>개헌 추진</b><span>지지율 65% 이상일 때만 · 임기 중 한 번</span></div></button>`;
  if (S.w.approval <= 25) h += `<button class="row act hot red" data-a="martial" data-v=""><i>${ic('alert')}</i><div><b>비상계엄 선포</b><span>되돌릴 수 없는 선택</span></div></button>`;
  return h;
}

/* ───────── 연속 장면 (개헌·계엄) ───────── */
function runSeq(steps, end) { T.seq = steps; T.seqEnd = end; T.seqI = 0; showSeq(); }
function showSeq() { const s = T.seq[T.seqI]; if (s.fx) fx(s.fx); show(scrSeq); }
function scrSeq() {
  const s = T.seq[T.seqI], last = T.seqI === T.seq.length - 1;
  return `<div class="seq ${s.tone || ''}"><p class="seq-k">${s.k || ''}</p><h1>${s.title}</h1><div class="rule"></div>${s.lines.map((l) => `<p>${l}</p>`).join('')}${last ? deltas() : ''}
    ${btn('seqNext', '', last ? '확인' : '다음', 'primary')}</div>`;
}

/* ───────── 선거 결과 공표 ───────── */
function shortHead(name) {
  const s = name.replace('특별자치시장', '').replace('통합특별시장', '').replace('특별시장', '').replace('광역시장', '').replace('도지사', '');
  return { 충청북: '충북', 충청남: '충남', 경상북: '경북', 경상남: '경남' }[s] || s;
}
function hemicycle(seats) {
  const order = ['nodong', 'simin', 'hyuk', 'mine', 'bosu', 'gonghwa'].filter((p) => PARTIES[p]);
  const rows = [[70, 22], [86, 27], [102, 31], [118, 34], [134, 36]];
  const pts = [];
  rows.forEach(([r, n]) => { for (let i = 0; i < n; i++) { const a = Math.PI - (Math.PI * i) / (n - 1); pts.push({ a, x: 150 + r * Math.cos(a), y: 146 - r * Math.sin(a) }); } });
  pts.sort((p, q) => q.a - p.a);
  const colors = [];
  order.forEach((p) => { const n = Math.round((seats[p] || 0) / 2); for (let i = 0; i < n; i++) colors.push(PARTIES[p].color); });
  return `<svg viewBox="0 0 300 156" class="hemi" role="img" aria-label="정당별 의석 분포">${pts.map((p, i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.2" fill="${colors[i] || '#555'}" style="animation-delay:${(i * 6)}ms"/>`).join('')}</svg>`;
}
function showReports(reps, cont) {
  if (!reps.length) { T.myLine = null; return cont(); }
  T.reps = reps; T.cont = cont;
  show(scrReport);
}
function scrReport() {
  const r = T.reps[0];
  const mine = T.myLine && T.myLine.kind === r.kind ? `<p class="rp-me">${T.myLine.text}</p>` : '';
  let body = '';
  if (r.kind === 'general') {
    const order = Object.keys(r.seats).sort((a, b) => r.seats[b] - r.seats[a]);
    body = `${hemicycle(r.seats)}<p class="rp-big">${PARTIES[r.top].name} <b>${r.seats[r.top]}</b>석</p>
      <p class="rp-sub">원내 제1당 · ${r.over ? '단독 과반 확보' : '과반 미달'} · ${r.top === S.w.ruling ? '여대야소' : '여소야대'}</p>
      <ul class="rp-list">${order.map((p) => `<li><i style="background:${PARTIES[p].color}"></i><span>${PARTIES[p].name}</span><b>${r.seats[p]}</b></li>`).join('')}</ul>`;
  } else if (r.kind === 'pres') {
    const w = r.rows[0];
    body = `<p class="rp-sub">대통령 당선인</p><p class="rp-name">${esc(w.name)}</p>
      <p class="rp-big"><span style="color:${w.party ? PARTIES[w.party].color : '#bbb'}">${w.party ? PARTIES[w.party].name : '무소속'}</span> · <b>${w.pct.toFixed(1)}</b>%</p>
      <ul class="rp-list">${r.rows.map((x) => `<li><i style="background:${x.party ? PARTIES[x.party].color : '#888'}"></i><span>${esc(x.name)} <small>${x.party ? PARTIES[x.party].name : '무소속'}</small></span><b>${x.pct.toFixed(1)}%</b></li>`).join('')}</ul>
      <p class="rp-sub">${r.change ? '정권 교체' : '정권 재창출'}</p>`;
  } else {
    const tally = {};
    r.heads.forEach((h) => { const k = h.party || 'none'; tally[k] = (tally[k] || 0) + 1; });
    const order = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);
    body = `<div class="rp-grid">${r.heads.map((h) => `<div class="${h.me ? 'me' : ''}" style="background:${h.party ? PARTIES[h.party].color : '#777'}">${shortHead(h.name)}</div>`).join('')}</div>
      <p class="rp-big">${order.map((p) => `${p === 'none' ? '무소속' : PARTIES[p].name} <b>${tally[p]}</b>`).join(' : ')}</p>
      <p class="rp-sub">광역단체장 16곳</p>`;
  }
  const names = { general: `제${r.no}대<br>국회의원 선거`, pres: `제${r.no}대<br>대통령 선거`, local: `제${r.no}회<br>전국동시지방선거` };
  return `<div class="report"><p class="seq-k">${S.year}년 · 개표 결과 확정</p><h1>${names[r.kind]}</h1><div class="rule"></div>${body}${mine}
    ${btn('reportNext', '', '확인', 'primary')}</div>`;
}

/* ───────── 재선 도전 (본인 적용 개헌 시) ───────── */
function scrReelect() {
  return `${bar()}<div class="pad">${card('임기 만료', `<p>5년 임기가 끝난다. 개정 헌법에 따라 당신은 한 번 더 출마할 수 있다.</p><p class="muted">현재 국정 지지율 ${Math.round(S.w.approval)}%</p>`)}
    <button class="row" data-a="reRun" data-v=""><b>재선에 도전한다</b><span>현직 대통령으로 본선 직행</span></button>
    <button class="row" data-a="reQuit" data-v=""><b>물러난다</b><span>임기를 마치고 퇴임한다</span></button></div>`;
}

/* ───────── 칭호 도감 ───────── */
const ALL_TITLES = ['존경받는 전직 대통령', '전직 대통령', '실패한 대통령', '불명예 퇴진', '헌정 파괴자', '개헌 대통령', '장기집권 논란', '만년 잠룡', '지역의 터줏대감', '험지의 개척자', '킹메이커', '소신파', '철새', '폴리테이너', '불꽃', '최연소 당선 기록', '최고령 당선 기록', '원내 사령탑', '다선 중진', '평범한 정치인', '끝내 배지를 달지 못한 사람'];
const DEX_KEY = 'jc_sim_titles_v1';
function dexLoad() { try { return JSON.parse(localStorage.getItem(DEX_KEY)) || []; } catch (e) { return []; } }
function dexAdd(list) { const d = dexLoad(); list.forEach((t) => { if (!d.includes(t)) d.push(t); }); try { localStorage.setItem(DEX_KEY, JSON.stringify(d)); } catch (e) { /* 저장소 없음 */ } }
function scrDex() {
  const d = dexLoad();
  return `<div class="pad"><h2 class="h">칭호 도감 <small>${d.length}/${ALL_TITLES.length}</small></h2><p class="muted">은퇴할 때 얻은 칭호가 여기에 모인다.</p>
    <div class="dex">${ALL_TITLES.map((t) => `<span class="${d.includes(t) ? 'got' : ''}">${d.includes(t) ? t : '???'}</span>`).join('')}</div>
    ${btn('home0', '', '돌아가기', 'primary')}</div>`;
}

/* ───────── 핸들러 추가 ───────── */
Object.assign(H, {
  brkChoose(v) { resetD(); T.jit = true; T.lines = [T.brk.ch[+v][2]()]; const tw = twist(); if (tw) T.lines.push(tw); T.jit = false; show(() => scrResult(T.brk.title, T.lines, 'brkOk')); },
  brkOk() { startTurn(); },
  backHome() { show(scrHome, 'home'); },
  seqNext() { if (T.seqI < T.seq.length - 1) { T.seqI++; return showSeq(); } const e = T.seqEnd; T.seq = null; T.seqEnd = null; e(); },
  reportNext() { T.reps.shift(); if (T.reps.length) return show(scrReport); const c = T.cont; T.cont = null; T.myLine = null; c(); },
  dex() { paint(scrDex()); },
  home0() { paint(scrTitle()); },
  share() {
    const text = `[이번 생은 정치다] ${S.name} (${S.history.length ? S.history[0].y : 2027}–${S.year})\n${titles().join(' · ')}\n레거시 ${legacy().toLocaleString()}점\n"${verdict()}"`;
    try { if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) { /* 복사 불가 */ }
    T.shared = true; paint(scrEnding());
  },

  amend() {
    show(() => `${bar()}<div class="pad">${card('개헌 추진', `<p>국정 지지율 ${Math.round(S.w.approval)}%. 지금이 아니면 기회는 다시 오지 않는다. 5년 단임제를 4년 중임제로 바꾸는 개헌안을 낸다.</p>
      <p class="muted">국회 재적 3분의 2 찬성 뒤 국민투표 과반 찬성이 필요하다. 임기 중 한 번만 시도할 수 있다.</p>`)}
      <button class="row" data-a="amendGo" data-v="clean"><b>차기 대통령부터 적용</b><span>사심 없는 개헌. 통과 가능성이 높다</span></button>
      <button class="row" data-a="amendGo" data-v="self"><b>현직 대통령에게도 적용하는 부칙을 넣는다</b><span>재선 길이 열린다. 통과가 훨씬 어렵고 장기집권 논란</span></button>
      ${btn('backHome', '', '아직은 아니다')}</div>`);
  },
  amendGo(v) {
    const self = v === 'self';
    S.amendTerm = S.rec.wins.pres;
    resetD(); mod('sta', -10);
    const p1 = clamp(30 + (S.w.majority === S.party ? (S.w.over ? 25 : 15) : 0) + (S.w.approval - 65) * 1.5 + S.st.pol / 5 - (self ? 25 : 0), 5, 92);
    const steps = [{ k: '헌법 개정안 발의', title: '개헌안,<br>국회로', lines: ['대통령이 헌법 개정안을 발의했다.', self ? '부칙에 "현직 대통령에게도 적용한다"는 문장이 들어 있다. 야당은 "장기집권 음모"라고 반발한다.' : '적용 시점은 차기 대통령부터다.'] }];
    if (!chance(p1 / 100)) {
      mod('approval', -8); log('개헌안이 국회에서 부결됐다.');
      steps.push({ k: '국회 본회의', title: '부결', tone: 'bad', fx: 'shake', lines: [`재적 3분의 2에 ${rint(3, 28)}표가 모자랐다.`, '개헌 동력은 사라졌다.'] });
    } else {
      steps.push({ k: '국회 본회의', title: '가결', lines: ['재적 3분의 2를 넘겼다.', '이제 국민투표만 남았다.'] });
      const p2 = clamp(S.w.approval + 8 - (self ? 22 : 0), 5, 95);
      if (chance(p2 / 100)) {
        S.rec.amend = self ? 'self' : 'clean'; mod('approval', self ? -6 : 6); mod('fame', 5);
        log(self ? '4년 중임제 개헌을 관철했다. 현직에게도 적용된다.' : '4년 중임제 개헌을 이뤄냈다.');
        steps.push({ k: '국민투표', title: `찬성 ${ri(51, 68).toFixed(1)}%`, tone: 'good', fx: 'confetti', lines: ['헌법이 바뀌었다. 1987년 이후 처음이다.', self ? '당신은 다음 대선에 한 번 더 나설 수 있다.' : '역사는 당신을 개헌 대통령으로 기록할 것이다.'] });
      } else {
        mod('approval', -14); log('개헌안이 국민투표에서 부결됐다.');
        steps.push({ k: '국민투표', title: `찬성 ${ri(35, 49).toFixed(1)}%`, tone: 'bad', fx: 'shake', lines: ['국민은 고개를 저었다.', '정권 심판 투표가 되고 말았다.'] });
      }
    }
    runSeq(steps, () => show(scrHome, 'home'));
  },
  martial() {
    show(() => `${bar()}<div class="pad">${card('비상계엄', `<p>국정 지지율 ${Math.round(S.w.approval)}%. 국회는 사사건건 발목을 잡고 탄핵 이야기가 공공연하다.</p>
      <p>집무실에 남은 참모는 셋. 둘은 고개를 젓고, 하나는 말이 없다. "각하, 이건 돌이킬 수 없습니다."</p>
      <p class="muted">헌법상 국회는 재적 과반 찬성으로 계엄 해제를 요구할 수 있고, 대통령은 따라야 한다.</p>`)}
      <button class="row hot red" data-a="martialGo" data-v=""><b>선포한다</b><span>이 선택은 되돌릴 수 없다</span></button>
      ${btn('backHome', '', '그만둔다', 'primary')}</div>`);
  },
  martialGo() {
    S.rec.martial = true; S.rec.impeached = true; S.favor = 2; S.w.approval = 5; S.rec.finalApproval = 5;
    log('비상계엄을 선포했다.'); log('국회가 계엄 해제 요구 결의안을 가결했다.'); log('탄핵소추안이 가결됐고, 헌법재판소가 전원일치로 파면을 결정했다.');
    runSeq([
      { k: '22:27', title: '비상계엄<br>선포', tone: 'bad', fx: 'flash', lines: ['대통령이 긴급 담화를 통해 비상계엄을 선포했다.', '도심에 군 병력이 이동하고, 시민들이 국회 앞으로 모여든다.'] },
      { k: '01:02', title: '해제 요구<br>결의', tone: 'bad', lines: ['의원들이 담장을 넘어 본회의장에 들어갔다.', '재석 의원 전원 찬성. 계엄은 150여 분 만에 효력을 잃었다.'] },
      { k: '열하루 뒤', title: '탄핵소추<br>가결', tone: 'bad', fx: 'shake', lines: ['여당에서도 이탈표가 쏟아졌다.', '대통령의 직무가 정지됐다.'] },
      { k: '선고', title: '파면', tone: 'bad', lines: ['"피청구인 대통령을 파면한다." 재판관 전원일치.', '수사가 시작됐다. 당신의 이름은 교과서에 남게 됐다.'] },
    ], () => ending('파면'));
  },
  reRun() {
    S.rerun = true; S.rec.presTries++;
    T.el = { type: 'pres', place: { name: '대한민국', region: null, L: 0 } };
    log('현직 대통령으로 재선에 도전했다.');
    startCampaign();
  },
  reQuit() { S.rec.finalApproval = S.w.approval; log('재선에 나서지 않고 퇴임했다.'); ending('대통령 임기 만료'); },
});

/* ───────── 입당 · 창당 ───────── */
const FOUND_FAME = 55;
const PARTY_NAMES = ['새로운미래연합', '국민통합당', '내일의힘', '개혁연대', '미래시민당', '다함께전진당'];
function joinChance(p) {
  // 인지도가 높을수록 환영받고, 철새 이력과 성향 차이는 감점. 탈당했던 당으로의 복당은 더 까다롭다
  const gap = Math.abs(PARTIES[p].ideo - S.ideology);
  return clamp(Math.round(55 + S.fame * 0.4 - S.rec.switches * 10 - Math.max(0, gap - 30) * 0.8 - ((S.exParties || []).includes(p) ? 15 : 0) + (PARTIES[p].kind === 'major' ? 0 : 15)), 10, 95);
}
function joinable() { return Object.keys(PARTIES).filter((p) => p !== 'mine' && Math.abs(PARTIES[p].ideo - S.ideology) <= 70); }
function foundFollowers() {
  // 당내 입지가 높을수록 함께 나서는 의원이 많다. 한 명 한 명은 각자 저울질한다
  const tries = S.party ? Math.floor(S.standing / 8) : 0;
  let n = 0;
  for (let i = 0; i < tries; i++) if (chance(0.35 + S.fame / 300)) n++;
  for (let i = 0; i < 3; i++) if (chance(S.fame / 250)) n++;
  return n;
}
function registerMyParty() { if (S && S.myParty) PARTIES.mine = S.myParty; else delete PARTIES.mine; }
const _load = H.load, _new = H.new;
Object.assign(H, {
  new() { delete PARTIES.mine; _new(); },
  load() {
    try { const sv = JSON.parse(localStorage.getItem(SAVE_KEY)); if (sv && sv.myParty) PARTIES.mine = sv.myParty; else delete PARTIES.mine; } catch (e) { delete PARTIES.mine; }
    _load();
  },
  joinMenu() {
    const used = S.joinTurn === S.turn;
    show(() => `${bar()}<div class="pad">${card('입당 타진', `<p>무소속으로는 정당 기본표도, 조직도 없다. 어느 당의 문을 두드릴 것인가.</p><p class="muted">입당 심사는 통과가 보장되지 않는다. 한 반기에 한 곳만 타진할 수 있다.${used ? ' 이번 반기에는 이미 타진했다.' : ''}</p>`)}
      ${joinable().map((p) => `<button class="row" data-a="join" data-v="${p}"${used ? ' disabled' : ''}><b style="color:${PARTIES[p].color}">${PARTIES[p].name}${(S.exParties || []).includes(p) ? ' <small>복당</small>' : ''}</b><span>${PARTIES[p].desc} · 승인 가능성 ${joinChance(p)}%</span></button>`).join('')}
      ${btn('backHome', '', '돌아가기')}</div>`);
  },
  join(p) {
    if (S.joinTurn === S.turn || S.party) return;
    S.joinTurn = S.turn; resetD();
    if (chance(joinChance(p) / 100)) {
      S.party = p; S.standing = r1(clamp(8 + S.fame / 5, 0, 40)); S.mainstream = false; S.offerKey = '';
      log(`${PARTIES[p].name}에 입당했다.`);
      T.lines = [`<b>입당 승인.</b> ${PARTIES[p].name} 최고위원회가 입당을 의결했다. 대표와 나란히 서서 당 점퍼를 입었다.`];
    } else {
      mod('favor', -1);
      T.lines = [`<b>입당 보류.</b> ${PARTIES[p].name} 지도부는 "당내 의견 수렴이 더 필요하다"며 결정을 미뤘다. 사실상 거절이다.`];
    }
    show(() => scrResult('입당 심사', T.lines, 'backHome'));
  },
  found() {
    T.pname = T.pname || pick(PARTY_NAMES);
    show(() => `${bar()}<div class="pad">${card('신당 창당', `<p>${S.party ? `${PARTIES[S.party].name}을 떠나 ` : ''}내 이름을 건 정당을 만든다. 공천권은 내 손에 있지만, 정당 기본표는 바닥에서 시작한다.</p>
      <p class="muted">정치자금 30 필요 (현재 ${Math.round(S.funds)}). ${S.party ? `당내 입지 ${Math.round(S.standing)} — 입지가 높을수록 동반 탈당하는 의원이 많지만, 몇 명이 따라올지는 해 봐야 안다.` : '무소속이라 함께할 현역 의원은 거의 없을 것이다.'} 창당은 한 번뿐이다.</p>
      <label class="fld">당명<input id="pn" maxlength="10" value="${esc(T.pname)}"></label>`)}
      ${btn('foundGo', '', '창당을 선언한다', 'primary', S.funds < 30)}${btn('backHome', '', '아직은 아니다')}</div>`);
  },
  foundGo() {
    if (!canFound() || S.funds < 30) return;
    const inp = document.getElementById('pn');
    const name = ((inp && inp.value) || T.pname || PARTY_NAMES[0]).replace(/[<>&"'`\\]/g, '').trim().slice(0, 10) || PARTY_NAMES[0];
    resetD();
    const old = S.party, n = foundFollowers();
    mod('funds', -30); mod('fame', 6);
    if (old) { mod('favor', -3); S.rec.switches++; (S.exParties = S.exParties || []).push(old); }
    if (old && S.w.seats[old] != null) S.w.seats[old] = Math.max(0, S.w.seats[old] - n);
    S.myParty = { name, ideo: Math.round(clamp(S.ideology, -70, 70)), color: '#0f9d8a', kind: 'center', seats: n, desc: `${S.name} 대표가 창당`, base: r1(clamp(3 + n * 0.8 + S.fame * 0.06, 5, 18)) };
    PARTIES.mine = S.myParty; S.w.seats.mine = n + (S.role === 'mp' ? 1 : 0);
    S.party = 'mine'; S.leader = true; S.rec.leader = true; S.rec.founder = true; S.standing = 100; S.mainstream = true; S.offerKey = '';
    log(`${name}을 창당하고 초대 대표가 됐다. 현역 의원 ${n}명이 합류했다.`);
    T.lines = [`<b>${name}</b> 창당대회. 당기를 넘겨받아 힘껏 흔들었다.`,
      n >= 8 ? `현역 의원 <b>${n}명</b>이 함께했다. 단숨에 원내 제3세력이다.` : n >= 1 ? `현역 의원 <b>${n}명</b>이 합류했다. 오겠다던 사람의 절반은 끝내 나타나지 않았다.` : '현역 의원은 한 명도 따라오지 않았다. 단상 뒤가 휑했다.',
      `정당 기본표 약 ${Math.round(S.myParty.base)}%에서 출발한다. 이제 공천은 당신이 준다.`];
    show(() => scrResult('창당', T.lines, 'backHome'));
    fx(n >= 1 ? 'confetti' : 'gloom');
  },
});
ALL_TITLES.push('창당의 아이콘');
