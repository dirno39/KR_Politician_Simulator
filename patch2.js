// 이번 생은 정치다 — 2.0 패치
// 약점 게이지와 수사·재판, 악마의 유혹, 직책별 과업(상임위·대표 법안 / 시정 프로젝트 / 내각·국정과제),
// 큰 무대 전용 미니게임, 컨셉 뒤 성향 선택. more.js 뒤에 로드한다.

/* ───────── 미니게임은 큰 무대에서만 ─────────
   대선 본선(유세·돌발·마지막 유세)과 모든 선거의 TV 토론 마무리 발언에서만 직접 플레이한다.
   그 밖의 자리는 관련 능력치로 결과가 정해진다. */
const MINI_STAT = { timing: 'spk', tap: 'sta', memory: 'int' };
function miniLive() { return !TEST && OPTS.mini && (T.mgForce || (T.el && T.el.type === 'pres')); }
const _miniPlay = mini;
mini = function (kind, title, cb) {
  if (miniLive()) { T.mgForce = false; return _miniPlay(kind, title, cb); }
  T.mgForce = false;
  cb(Math.round(clamp(S.st[MINI_STAT[kind]] + ri(-22, 22), 5, 100)));
};
const _hint = hint;
hint = function (text) { return _hint(miniLive() ? text : text.replace('미니게임 · ', '')); };
miniTag = function (score) { return miniLive() || T.mgShown ? `<span class="tw ${score >= 60 ? 'up' : score >= 35 ? 'mid' : 'down'}">${miniLabel(score)} ${score}점</span> ` : ''; };

/* ───────── 약점 게이지 ───────── */
KEY_NAME.dirt = '약점';
ROLE_NAME.jail = '수감 중'; ROLE_COL.jail = '#5a2a2a';
function dirt(n, tag) {
  S.dirt = r1(clamp((S.dirt || 0) + n, 0, 100));
  if (n > 0) { (S.dirtLog = S.dirtLog || []).push(tag); if (S.dirtLog.length > 8) S.dirtLog.shift(); T.d.dirt = r1((T.d.dirt || 0) + n); S.rec.dirtMax = Math.max(S.rec.dirtMax || 0, S.dirt); }
}
function dirtWord() { const d = S.dirt || 0; return d < 8 ? '깨끗함' : d < 25 ? '뒷말이 도는 정도' : d < 45 ? '위험 수위' : d < 70 ? '시한폭탄' : '언제 터져도 이상하지 않다'; }
function dirtGauge() { return `<div class="gauge dirtg"><span>약점</span><div class="track"><div class="fill" style="${fillStyle('g:dirt', clamp(S.dirt || 0, 0, 100), '#8e241d')}"></div></div><b>${Math.round(S.dirt || 0)}</b></div><p class="muted small">${dirtWord()}${S.favorCap < 100 ? ` · 전과로 호감도 상한 ${Math.round(S.favorCap)}` : ''}${S.banUntil > S.turn ? ` · 피선거권 제한 ${S.banUntil - S.turn}턴 남음` : ''}</p>`; }
const banned = () => S.banUntil > S.turn;

/* 악마의 유혹 */
const tempt = (o) => Object.assign({ devil: true, weight: () => 2 }, o);
EVENTS.push(
  tempt({ id: 't_cash', cond: () => !['abroad', 'jail'].includes(S.role), title: '검은 가방',
    text: () => '지하 주차장. 건설업자가 트렁크를 연다. 5만 원권이 가득 든 가방이다. "영수증 필요 없는 돈입니다. 아무도 모릅니다."',
    ch: [
      ['가방을 받는다', '정치자금 +40 · 약점 +20', () => { mod('funds', 40); dirt(20, '뇌물 수수'); return '트렁크가 닫혔다. 돌아오는 길, 백미러를 자꾸 보게 됐다.'; }],
      ['거절한다', '호감도 +', () => { mod('favor', 2); return '"못 본 걸로 하겠습니다." 차 문을 닫았다.'; }],
      ['수사기관에 신고한다', '호감도·인지도 +, 업계의 원한', () => { mod('favor', 4); mod('fame', 3); mod('funds', -5); return '뇌물 공여 시도를 신고했다. 업자는 구속됐고, 한동안 후원이 끊겼다.'; }],
    ] }),
  tempt({ id: 't_treat', cond: () => S.party && ['mp', 'city', 'metro', 'gov', 'none'].includes(S.role), title: '강남의 밤',
    text: () => '대기업 대관 담당이 저녁을 산다고 했는데, 도착한 곳은 간판 없는 건물 지하다. 당 실세들이 이미 와 있다.',
    ch: [
      ['자리에 앉는다', '당내 입지 +8 · 약점 +9', () => { gainStanding(8); dirt(9, '향응 접대'); return '술잔이 돌았고 명함이 오갔다. 계산은 누가 했는지 모른다.'; }],
      ['인사만 하고 나온다', '당내 입지 소폭 −', () => { gainStanding(-2); mod('favor', 1); return '"선약이 있어서요." 10분 만에 나왔다.'; }],
    ] }),
  tempt({ id: 't_split', cond: () => S.funds < 50 && S.role !== 'president', title: '쪼개기 후원',
    text: () => '후원회장이 묘안을 낸다. "법인 돈을 직원 스무 명 이름으로 나눠 넣으면 됩니다. 다들 그렇게 해요."',
    ch: [
      ['그렇게 하라고 한다', '정치자금 +25 · 약점 +13', () => { mod('funds', 25); dirt(13, '정치자금법 위반'); return '후원 계좌에 같은 날 같은 금액이 스무 건 찍혔다.'; }],
      ['안 된다고 한다', '변화 없음', () => '"그건 불법입니다." 후원회장이 입맛을 다셨다.'],
    ] }),
  tempt({ id: 't_poll', cond: () => S.half === 2 && electionsAt(S.year + 1, 1).length && !banned() && S.role !== 'president', title: '여론조사 마사지',
    text: () => '선거 컨설턴트가 귓속말을 한다. "표본을 조금만 만지면 3%p는 올라갑니다. 대세론은 만들어지는 겁니다."',
    ch: [
      ['맡긴다', '다음 선거 지지율 +3%p · 약점 +16', () => { flag('pollRig', S.turn); dirt(16, '여론조사 조작'); return '다음 주, 당신이 1위로 나온 여론조사가 지역 신문에 실렸다.'; }],
      ['내보낸다', '호감도 +', () => { mod('favor', 1); return '컨설턴트와의 계약을 그 자리에서 해지했다.'; }],
    ] }),
  tempt({ id: 't_job', cond: () => ['mp', 'city', 'metro', 'gov'].includes(S.role), title: '조카의 이력서',
    text: () => '지역 유지가 봉투가 아니라 이력서를 내민다. "우리 조카가 산하 공기업에 지원했는데, 전화 한 통만 넣어 주시면."',
    ch: [
      ['전화를 넣는다', '지역 기반 +8 · 약점 +11', () => { modBase(S.seat.region, 8); dirt(11, '채용 청탁'); return '조카는 합격했다. 유지의 조직이 통째로 당신 편이 됐다.'; }],
      ['절차대로 하라고 한다', '지역 기반 −', () => { modBase(S.seat.region, -3); mod('favor', 2); return '거절했다. 다음 행사에 유지는 나타나지 않았다.'; }],
    ] }),
  tempt({ id: 't_land', cond: () => ['mp', 'city', 'metro', 'gov'].includes(S.role), title: '도면 한 장',
    text: () => '아직 발표되지 않은 신도시 개발 도면이 책상 위에 있다. 친척 명의로 땅을 사 두면 다섯 배는 뛴다.',
    ch: [
      ['친척에게 귀띔한다', '정치자금 +45 · 약점 +22', () => { mod('funds', 45); dirt(22, '내부정보 이용 투기'); return '석 달 뒤 개발 계획이 발표됐다. 통장에 낯선 숫자가 찍혔다.'; }],
      ['도면을 덮는다', '호감도 +', () => { mod('favor', 1); return '도면을 금고에 넣고 잠갔다.'; }],
    ] }),
  tempt({ id: 't_troll', cond: () => S.fame >= 20 && S.role !== 'jail', title: '댓글 부대',
    text: () => '온라인 마케팅 업체가 제안한다. "아이디 3천 개로 여론을 만들어 드립니다. 추적은 불가능합니다."',
    ch: [
      ['계약한다', '인지도 +8, 호감도 +2 · 약점 +14', () => { mod('fame', 8); mod('favor', 2); mod('funds', -8); dirt(14, '여론 조작'); return '기사마다 당신을 칭찬하는 댓글이 베스트에 올랐다.'; }],
      ['거절한다', '변화 없음', () => '제안서를 파쇄했다.'],
    ] }),
  tempt({ id: 't_cv', cond: () => S.age < 55 && S.fame < 60 && S.role !== 'president', title: '부풀린 이력',
    text: () => '선거 공보물 초안에 "○○대 겸임교수"라고 적혀 있다. 사실은 특강을 두 번 한 게 전부다. 참모가 말한다. "다들 이 정도는 씁니다."',
    ch: [
      ['그대로 낸다', '인지도 +5 · 약점 +8', () => { mod('fame', 5); dirt(8, '허위 경력 기재'); return '공보물이 인쇄소로 넘어갔다.'; }],
      ['고친다', '호감도 +', () => { mod('favor', 1); return '"특강 2회"로 고쳐 적었다. 참모가 한숨을 쉬었다.'; }],
    ] }),
  tempt({ id: 't_nom', cond: () => S.leader, title: '공천 헌금',
    text: () => '비례대표 순번을 원하는 재력가가 당 계좌가 아닌 다른 계좌 번호를 묻는다. "특별 당비라고 생각하시죠."',
    ch: [
      ['계좌를 알려 준다', '정치자금 +45 · 약점 +24', () => { mod('funds', 45); dirt(24, '공천 헌금 수수'); return '재력가의 이름이 비례 순번 앞쪽에 올랐다.'; }],
      ['당에서 내보낸다', '호감도 +', () => { mod('favor', 3); return '"우리 당은 자리를 팔지 않습니다."'; }],
    ] }),
  tempt({ id: 't_contract', cond: () => ['city', 'metro', 'gov'].includes(S.role), title: '수의계약',
    text: () => '선거 때 캠프를 도운 업체가 관급 공사를 원한다. 수의계약으로 돌리면 공약 사업도 빨라진다.',
    ch: [
      ['수의계약으로 준다', '공약 진척, 정치자금 +15 · 약점 +17', () => { S.term.pledge += 12; mandateAdd(15); mod('funds', 15); dirt(17, '직권남용·일감 몰아주기'); return '공사는 일사천리였다. 감사관실에서 서류를 요청해 왔다.'; }],
      ['공개 입찰에 부친다', '공약 지연', () => { S.term.pledge -= 3; mod('favor', 2); return '입찰 공고를 냈다. 업체 대표의 전화는 받지 않았다.'; }],
    ] }),
  tempt({ id: 't_slush', cond: () => S.role === 'president', title: '특수활동비',
    text: () => '총무비서관이 보고한다. "영수증이 필요 없는 예산이 남았습니다. 관행대로 처리할까요?"',
    ch: [
      ['관행대로 하라고 한다', '정치자금 +40 · 약점 +22', () => { mod('funds', 40); dirt(22, '특수활동비 유용'); return '봉투가 몇 군데로 나뉘어 나갔다. 기록은 남지 않았다.'; }],
      ['국고에 반납한다', '국정 지지율 +', () => { mod('approval', 2); mod('favor', 2); return '전액 반납하고 내역을 공개했다.'; }],
    ] }),
  { id: 'pardon', cond: () => banned() && S.role === 'none' && (S.exParties || []).concat(S.party ? [S.party] : []).includes(S.w.ruling), title: '특별사면',
    text: () => '광복절 특별사면 명단에 당신의 이름이 오르내린다. 정권이 손을 내밀고 있다.',
    ch: [
      ['사면·복권을 받아들인다', '피선거권 회복 · 호감도 −', () => { S.banUntil = 0; mod('favor', -4); log('특별사면으로 복권됐다.'); return '사면장을 받았다. "면죄부"라는 사설이 실렸지만, 다시 출마할 수 있게 됐다.'; }],
      ['형기를 다 채우겠다고 한다', '호감도 +', () => { mod('favor', 4); return '"죗값은 다 치르겠습니다." 뜻밖의 말에 여론이 조금 누그러졌다.'; }],
    ] },
  { id: 'cleanup', cond: () => (S.dirt || 0) >= 20 && S.funds >= 20 && S.role !== 'jail', title: '정리할 시간',
    text: () => '오랜 법률 참모가 조용히 말한다. "지금이라도 정리할 건 정리하시죠. 돌려줄 건 돌려주고, 끊을 건 끊고."',
    ch: [
      ['비용을 들여 정리한다', '정치자금 −20 · 약점 −12', () => { mod('funds', -20); S.dirt = r1(Math.max(0, S.dirt - 12)); T.d.dirt = -12; return '받은 것을 돌려주고 관계를 끊었다. 밤잠이 조금 편해졌다.'; }],
      ['괜한 걱정이라고 한다', '변화 없음', () => '"아무 일 없을 겁니다." 참모는 대답하지 않았다.'],
    ] }
);
Object.assign(EV_KIND, { t_cash: 'devil', t_treat: 'devil', t_split: 'devil', t_poll: 'devil', t_job: 'devil', t_land: 'devil', t_troll: 'devil', t_cv: 'devil', t_nom: 'devil', t_contract: 'devil', t_slush: 'devil', pardon: 'phone', cleanup: 'phone' });
EV_KINDS.devil = { label: '유혹', glyph: 'fire' };
const BAN_EVENTS = ['minister', 'pm_offer', 'prop_offer', 'convention', 'poach', 'recruit1'];

/* 수사와 재판 */
const VERDICTS = [
  null,
  { title: '벌금<br>80만 원', line: '당선무효 기준인 100만 원에 못 미쳐 직은 유지한다.', fav: -6, cap: 5 },
  { title: '벌금<br>300만 원', line: '당선무효형이다. 직을 잃고 5년간 선거에 나설 수 없다.', fav: -12, cap: 10, ban: 10, seat: true },
  { title: '징역 1년<br>집행유예 2년', line: '직을 잃고 10년간 선거에 나설 수 없다. 당은 제명을 의결했다.', fav: -20, cap: 20, ban: 20, seat: true, expel: true },
  { title: '징역 실형', line: '법정 구속됐다. 방청석에서 탄식이 나왔다.', fav: -30, cap: 30, ban: 20, seat: true, expel: true, jail: true },
];
function showCase() {
  const tags = [...new Set(S.dirtLog || [])].slice(-4);
  S.pendingCase.tags = tags;
  fx('shake');
  show(() => `<div class="seq bad"><p class="seq-k">${S.year}년 · 검찰 수사</p><h1>압수수색</h1><div class="rule"></div>
    <p>새벽 여섯 시, 수사관들이 사무실 문을 두드렸다. 상자가 줄지어 실려 나간다.</p>
    <p class="case-tags">${tags.map((t) => `<span>${t}</span>`).join('') || '<span>정치자금법 위반</span>'}</p>
    <button class="btn opt" data-a="caseGo" data-v="fight"><b>무죄를 주장하며 정면 돌파한다</b><small>화술이 높을수록 유리 · 지면 "반성 없음"으로 형이 무거워진다</small></button>
    <button class="btn opt" data-a="caseGo" data-v="plead"><b>혐의를 인정하고 선처를 구한다</b><small>형이 확실히 가벼워지지만 유죄는 피하기 어렵다</small></button>
    <button class="btn opt" data-a="caseGo" data-v="frame"${S.party ? '' : ' disabled'}><b>정치 탄압이라고 맞선다</b><small>${S.party ? '당내 입지가 높을수록 유리 · 성향이 강해진다' : '소속 정당이 있어야 한다'}</small></button>
    <button class="btn opt" data-a="caseGo" data-v="lawyer"${S.funds >= 30 ? '' : ' disabled'}><b>전관 변호인단을 꾸린다</b><small>${S.funds >= 30 ? '정치자금 −30 · 형이 가벼워진다' : '정치자금 30 필요'}</small></button></div>`);
}
function applyVerdict(tier, years) {
  const v = VERDICTS[tier];
  mod('favor', v.fav);
  S.favorCap = Math.max(40, (S.favorCap == null ? 100 : S.favorCap) - v.cap);
  if (S.favor > S.favorCap) S.favor = S.favorCap;
  S.rec.crime = Math.max(S.rec.crime || 0, tier); S.rec.convictions = (S.rec.convictions || 0) + 1;
  if (v.seat && S.seat) leaveSeat('형이 확정돼 직을 잃었다.');
  if (v.ban) S.banUntil = S.turn + v.ban + (v.jail ? years * 2 : 0);
  if (v.expel && S.party && S.party !== 'mine') { (S.exParties = S.exParties || []).push(S.party); S.party = null; S.standing = 0; S.leader = false; S.mainstream = false; }
  if (v.jail) { S.role = 'jail'; S.seat = null; S.jail = years * 2; S.mand = null; S.needSetup = false; }
  if (v.seat) { S.mand = null; S.needSetup = false; }
}
Object.assign(H, {
  caseGo(v) {
    const c = S.pendingCase; if (!c) return;
    resetD();
    let sev = c.dirt * 1.2 + ri(-12, 12), note = '';
    if (v === 'fight') { if (judge('spk', 62)) { sev -= 16; note = '법정 최후진술이 방청석을 숙연하게 만들었다.'; } else { sev += 8; note = '재판부는 "반성의 기미가 없다"고 적었다.'; } }
    if (v === 'plead') { sev -= 14; mod('favor', -3); note = '혐의를 대부분 인정했다. 재판부는 이를 양형에 참작했다.'; if (c.dirt >= 30) sev = Math.max(sev, 30); }
    if (v === 'frame') { sev -= S.standing / 7; mod('ideology', ownSign() * 5); mod('fame', 5); note = S.party === S.w.ruling ? '여당 소속이 "탄압"을 말하자 여론은 냉담했다.' : '지지자들이 법원 앞을 메웠다.'; if (S.party === S.w.ruling) sev += 6; }
    if (v === 'lawyer') { mod('funds', -30); sev -= 11; note = '전직 대법관이 이끄는 변호인단이 증거 능력을 하나씩 무너뜨렸다.'; }
    const tier = sev < 28 ? 0 : sev < 45 ? 1 : sev < 62 ? 2 : sev < 80 ? 3 : 4, years = tier === 4 ? clamp(1 + Math.floor((sev - 80) / 7), 1, 3) : 0;
    const steps = [{ k: '기소', title: '법정에<br>서다', tone: 'bad', lines: ['검찰이 공소장을 냈다.', note] }];
    if (tier === 0) {
      mod('favor', 2); mod('fame', 3);
      steps.push({ k: '선고', title: '무죄', tone: 'good', lines: ['"범죄의 증명이 없다." 재판장이 주문을 읽었다.', '털어서 나온 것이 없다는 사실이 오히려 훈장이 됐다.'] });
      log('검찰 수사를 받았지만 무죄를 선고받았다.');
    } else {
      const vd = VERDICTS[tier];
      applyVerdict(tier, years);
      steps.push({ k: '선고', title: tier === 4 ? `징역 ${years}년` : vd.title, tone: 'bad', fx: 'shake', lines: [vd.line, `국민의 기억은 오래간다. 호감도 상한이 ${Math.round(S.favorCap)}으로 내려갔다.`] });
      log(`${c.tags[0] || '정치자금법 위반'} 등으로 ${tier === 4 ? `징역 ${years}년을` : vd.title.replace('<br>', ' ') + '을'} 선고받았다.`);
    }
    S.dirt = r1(S.dirt * (tier === 0 ? 0.6 : 0.3)); S.dirtLog = []; S.lastCase = S.turn; S.pendingCase = null;
    runSeq(steps, startTurn);
  },
  jail(v) {
    resetD();
    if (v === 'letter') { mod('fame', 2); mod('favor', chance(0.5) ? 2 : -1); } else mod('sta', 6);
    S.jail--;
    T.lines = [v === 'letter' ? '옥중 서신이 지지자 카페에 올라왔다.' : '책을 읽고, 운동장을 돌고, 잠을 잤다.'];
    if (S.jail <= 0) { S.role = 'none'; log('형기를 마치고 출소했다.'); T.lines.push('<b>출소.</b> 교도소 정문 앞에 지지자 몇이 두부를 들고 서 있었다.'); }
    show(() => scrResult('수감 생활', T.lines, 'endTurn'));
  },
});
function scrJail() {
  return `${bar()}<div class="pad"><section class="ev ev-phone"><div class="ev-kind">${ic('ban')}수감</div><h2>독방의 시간</h2><p>세 평 남짓한 방. 남은 형기는 ${S.jail}턴(${S.jail / 2}년)이다. 바깥의 정치는 당신 없이도 돌아간다.</p></section>
    <button class="row ch" data-a="jail" data-v="letter"><em>A</em><div><b>옥중 서신을 쓴다</b><span>인지도 +, 호감도 변동</span></div></button>
    <button class="row ch" data-a="jail" data-v="quiet"><em>B</em><div><b>조용히 형기를 채운다</b><span>체력 +</span></div></button></div>`;
}

/* ───────── 직책별 과업 ───────── */
const COMMITTEES = [
  { id: 'law', glyph: 'scale', name: '법제사법위원회', desc: '정쟁의 한복판. 매 턴 인지도 +1.5, 질의·국감 때 인지도 추가' },
  { id: 'fin', glyph: 'coin', name: '기획재정위원회', desc: '예산의 길목. 매 턴 정치자금 +3, 지역 예산 확보 때 기반 추가' },
  { id: 'land', glyph: 'bridge', name: '국토교통위원회', desc: '지역구의 꽃. 매 턴 지역 기반 +1.5' },
  { id: 'wel', glyph: 'care', name: '보건복지위원회', desc: '민생 이미지. 매 턴 호감도 +0.7, 대표 법안 진척 +25%' },
];
const BILLS = ['청년 주거 안정법', '돌봄 인력 지원법', '플랫폼 노동자 보호법', '지방소멸 대응 특별법', 'AI 기본법', '전세사기 방지법', '국회의원 특권 폐지법', '소상공인 임대료 안정법', '기후위기 대응 기본법', '간병비 국가책임법'];
const PROJECTS = ['도시철도 트램 건설', '첨단 산업단지 조성', '공공의료원 설립', '원도심 재생 사업', '청년 창업 특구', '버스 완전 공영제', '국제 컨벤션 지구', '수변 생태공원'];
const TASKS = [
  { name: 'AI 3대 강국 도약', dom: '경제' }, { name: '부동산 시장 안정', dom: '경제' },
  { name: '저출생 반전', dom: '복지' }, { name: '연금 개혁', dom: '복지' },
  { name: '검찰·사법 개혁', dom: '개혁' }, { name: '행정수도 완성', dom: '개혁' },
  { name: '한반도 평화 체제', dom: '외교·안보' }, { name: '방위산업 4강', dom: '외교·안보' },
];
const CAB_POSTS = [{ id: '개혁', name: '국무총리' }, { id: '경제', name: '경제부총리' }, { id: '외교·안보', name: '국가안보실장' }, { id: '복지', name: '사회부총리' }];
const CAB_TYPES = [
  { id: 'pro', glyph: 'cap', name: '실력형 전문가', desc: '해당 분야 의제 성공률 +12, 과제 진척 +12' },
  { id: 'loyal', glyph: 'shake', name: '오랜 측근', desc: '매 턴 국정 지지율 +0.4. 다만 측근 비리가 터질 수 있다' },
  { id: 'unity', glyph: 'leaf', name: '야권 출신 탕평 인사', desc: '여소야대 페널티가 그 분야에서 절반. 당내 입지 −5' },
];
const MAND_GAIN = {
  bill: { bill: 22, deal: 30, question: 6, hearing: 10, caucus: 10, audit: 8, sniper: 4, press: 3 },
  project: { pledge: 20, invest: 15, housing: 12, freebus: 12, landmark: 14, expo: 12, festival2: 6, austerity: 8, field: 5, labor: 8 },
};
function pick3(arr) { const p = arr.slice(), o = []; for (let i = 0; i < 3 && p.length; i++) o.push(p.splice(Math.floor(rnd() * p.length), 1)[0]); return o; }
function showSetup() {
  if (S.role === 'mp') { T.setupOpts = pick3(BILLS); return show(scrCommittee); }
  if (S.role === 'president') { T.cabI = 0; S.cab = {}; T.cabNames = CAB_POSTS.map(() => CAB_TYPES.map(() => npcName())); return show(scrCabinet); }
  T.setupOpts = pick3(PROJECTS); show(scrProject);
}
function scrCommittee() {
  return `${bar()}<div class="pad">${card('상임위원회 배정', `<p>${S.rec.wins.mp}선 의원 ${esc(S.name)}. 4년 동안 일할 상임위를 고른다.</p>`)}
    ${COMMITTEES.map((c) => `<button class="row act" data-a="committee" data-v="${c.id}"><i>${ic(c.glyph)}</i><div><b>${c.name}</b><span>${c.desc}</span></div></button>`).join('')}</div>`;
}
function scrBill() {
  return `${bar()}<div class="pad">${card('대표 법안', '<p>이번 임기에 내 이름을 걸고 통과시킬 법안을 하나 정한다. 법안 발의와 물밑 협상으로 진척시키고, 임기 안에 통과시키면 업적으로 남는다.</p>')}
    ${T.setupOpts.map((b, i) => `<button class="row act" data-a="billPick" data-v="${i}"><i>${ic('bill')}</i><div><b>${b}</b><span>임기 4년 안에 본회의 통과가 목표</span></div></button>`).join('')}</div>`;
}
function scrProject() {
  return `${bar()}<div class="pad">${card('시정 핵심 사업', `<p>${S.seat.name} 취임. 임기 4년을 걸 대표 사업을 하나 정한다. 공약 사업 추진과 기업 유치로 진척시킨다.</p>`)}
    ${T.setupOpts.map((b, i) => `<button class="row act" data-a="projectPick" data-v="${i}"><i>${ic('crane')}</i><div><b>${b}</b><span>완공하면 지역 기반과 업적으로 남는다</span></div></button>`).join('')}</div>`;
}
function scrCabinet() {
  const p = CAB_POSTS[T.cabI];
  return `${bar()}<div class="pad">${card(`내각 인선 ${T.cabI + 1}/${CAB_POSTS.length}`, `<p><b>${p.name}</b> 후보 세 명이 책상 위에 올라왔다. ${p.id} 분야 국정의 성패가 이 사람에게 달렸다.</p>`)}
    ${CAB_TYPES.map((t, i) => `<button class="row act" data-a="cabPick" data-v="${t.id}"><i>${ic(t.glyph)}</i><div><b>${T.cabNames[T.cabI][i]} <small>${t.name}</small></b><span>${t.desc}</span></div></button>`).join('')}</div>`;
}
function scrTasks() {
  const sel = T.taskSel;
  return `${bar()}<div class="pad">${card('국정과제', '<p>5년 동안 정권의 이름으로 남길 과제 <b>세 가지</b>를 고른다. 같은 분야 의제를 성공시킬 때마다 진척되고, 완수한 과제는 업적이 된다.</p>')}
    <div class="acts">${TASKS.map((t, i) => `<button class="ac ${sel.includes(i) ? 'on' : ''}" data-a="taskToggle" data-v="${i}"><span class="ac-top"><i>${ic({ '경제': 'trend', '복지': 'care', '개혁': 'gear', '외교·안보': 'shield' }[t.dom])}</i><em>${t.dom}</em></span><b>${t.name}</b><span>${t.dom} 의제로 진척</span></button>`).join('')}</div>
    <div class="sticky">${btn('tasksDone', '', sel.length === 3 ? '국정과제 확정' : `과제 ${3 - sel.length}개를 더 고르세요`, 'primary', sel.length !== 3)}</div></div>`;
}
function setupDone(msg) { S.needSetup = false; log(msg); startTurn(); }
Object.assign(H, {
  committee(v) { S.committee = v; show(scrBill); },
  billPick(v) { const name = T.setupOpts[+v]; S.mand = { kind: 'bill', items: [{ name, prog: 0 }] }; setupDone(`${(COMMITTEES.find((c) => c.id === S.committee) || COMMITTEES[0]).name}에 배정됐고, 「${name}」을 대표 법안으로 내걸었다.`); },
  projectPick(v) { const name = T.setupOpts[+v]; S.mand = { kind: 'project', items: [{ name, prog: 0 }] }; setupDone(`${name}을 임기 핵심 사업으로 내걸었다.`); },
  cabPick(v) {
    S.cab[CAB_POSTS[T.cabI].id] = v; if (v === 'unity') gainStanding(-5);
    T.cabI++;
    if (T.cabI < CAB_POSTS.length) return show(scrCabinet);
    T.taskSel = []; show(scrTasks, 'tasks');
  },
  taskToggle(v) { const i = T.taskSel.indexOf(+v); if (i >= 0) T.taskSel.splice(i, 1); else if (T.taskSel.length < 3) T.taskSel.push(+v); show(scrTasks, 'tasks'); },
  tasksDone() {
    if (T.taskSel.length !== 3) return;
    S.mand = { kind: 'tasks', items: T.taskSel.map((i) => ({ name: TASKS[i].name, dom: TASKS[i].dom, prog: 0 })) };
    setupDone(`내각을 꾸리고 국정과제로 ${S.mand.items.map((t) => t.name).join(', ')}을 내걸었다.`);
  },
});
function mandateAdd(n, dom) {
  const m = S.mand; if (!m) return '';
  const it = m.items.find((x) => x.prog < 100 && (!dom || x.dom === dom)); if (!it) return '';
  it.prog = Math.min(100, Math.round(it.prog + n));
  if (it.prog < 100) return '';
  if (m.kind === 'bill') { S.rec.billsPassed = (S.rec.billsPassed || 0) + 1; mod('favor', 5); mod('fame', 5); log(`대표 발의한 「${it.name}」이 본회의를 통과했다.`); return ` <span class="tw up">업적</span> 「${it.name}」이 본회의를 통과했다. 법안에 당신의 이름이 붙어 불린다.`; }
  if (m.kind === 'project') { S.rec.projects = (S.rec.projects || 0) + 1; modBase(S.seat.region, 12); mod('fame', 6); mod('favor', 4); log(`${it.name}을 완수했다.`); return ` <span class="tw up">업적</span> ${it.name} 준공식. 테이프를 자르는 사진이 지역 신문 1면에 실렸다.`; }
  S.rec.tasksDone = (S.rec.tasksDone || 0) + 1; mod('approval', 3); log(`국정과제 '${it.name}'을 완수했다.`);
  return ` <span class="tw up">업적</span> 국정과제 '${it.name}' 완수.`;
}
function mandateTick(id) {
  const m = S.mand; if (!m || m.kind === 'tasks') return '';
  let g = (MAND_GAIN[m.kind] || {})[id]; if (!g) return '';
  if (m.kind === 'bill' && S.committee === 'wel') g *= 1.25;
  if (S.role === 'mp') { if (S.committee === 'law' && (id === 'question' || id === 'audit')) mod('fame', 2); if (S.committee === 'fin' && id === 'budget') modBase(S.seat.region, 3); }
  return mandateAdd(g);
}
function taskProgress(label) { return S.mand && S.mand.kind === 'tasks' ? mandateAdd(40 + (S.cab && S.cab[label] === 'pro' ? 12 : 0), label) : ''; }
function cabBonus(label, minority) { const t = S.cab && S.cab[label]; return t === 'pro' ? 12 : t === 'unity' && minority ? 10 : 0; }
function mandateClose() {
  const m = S.mand; if (!m) return;
  const done = m.items.filter((x) => x.prog >= 100).length;
  if (m.kind !== 'tasks' && !done) { mod('favor', -3); log(`${m.kind === 'bill' ? '대표 법안은 끝내 통과되지 못했다' : '핵심 사업은 완수하지 못한 채 임기가 끝났다'}.`); }
  S.mand = null;
}
function mandBanner() {
  let h = '';
  if (banned() && S.role !== 'jail') h += `<p class="tip">${ic('ban')} 피선거권 제한 중. 앞으로 <b>${S.banUntil - S.turn}턴</b> 동안 선거에 나설 수 없다.</p>`;
  const m = S.mand; if (!m) return h;
  const label = { bill: '대표 법안', project: '핵심 사업', tasks: '국정과제' }[m.kind];
  return h + `<section class="mand"><b>${label}</b>${m.items.map((it) => `<div class="mand-i ${it.prog >= 100 ? 'done' : ''}"><span>${it.name}</span><div class="track"><div class="fill" style="${fillStyle('m:' + it.name, it.prog, it.prog >= 100 ? '#1f8a5b' : '#c8372d')}"></div></div><em>${it.prog >= 100 ? '완수' : it.prog + '%'}</em></div>`).join('')}</section>`;
}
// 매 턴: 약점 소멸, 상임위·내각 효과, 수사 개시 여부
function officeTick(notes) {
  if (S.dirt > 0) S.dirt = r1(Math.max(0, S.dirt - 0.4));
  if (S.favorCap != null && S.favorCap < 100 && S.turn % 4 === 0) S.favorCap++;
  if (S.role === 'mp' && S.committee) { const c = S.committee; if (c === 'law') mod('fame', 1.5); if (c === 'fin') mod('funds', 3); if (c === 'land') modBase(S.seat.region, 1.5); if (c === 'wel') mod('favor', 0.7); }
  if (S.role === 'president' && S.cab) {
    const loyal = Object.values(S.cab).filter((v) => v === 'loyal').length;
    if (loyal) { mod('approval', 0.4 * loyal); if (chance(0.05 * loyal)) { mod('approval', -5); dirt(4, '측근 비리 연루'); notes.push('측근 장관의 비리 의혹이 터졌다. 임명권자의 책임론이 인다.'); } }
  }
  if (!S.pendingCase && !['president', 'jail', 'abroad'].includes(S.role) && (S.dirt || 0) >= 30 && S.turn - (S.lastCase || -99) >= 6) {
    // 약점이 쌓일수록 수사 확률이 가파르게 오른다 (40이면 턴당 5%, 60이면 12%, 80이면 18%)
    const p = ((S.dirt - 25) / 300) * (S.party && S.party === S.w.ruling ? 0.7 : 1.3) * (S.exPres ? 1.6 : 1);
    if (chance(p)) { S.pendingCase = { dirt: S.dirt }; notes.push('<b>검찰이 움직인다는 소문이 돈다.</b>'); }
  }
}
// 유세 시작: 조작한 여론조사의 효과와, 상대가 쥔 내 약점
const _campIntro = campIntro;
campIntro = function () {
  const el = T.el;
  if (flag('pollRig') && S.turn - flag('pollRig') <= 2) { el.my += 3; flag('pollRig', 0); }
  if ((S.dirt || 0) >= 30) { el.dirtHit = r1(S.dirt / 20); el.my -= el.dirtHit; }
  _campIntro();
};

/* ───────── 시작 순서: 컨셉 → 성장 방향 → 정치 성향 → 정당 ───────── */
function scrLean() {
  const c = conceptOf(S.concept), tilt = c.id === 'union' ? '이 컨셉은 진보 쪽으로 기울어 출발한다.' : c.id === 'general' ? '이 컨셉은 보수 쪽으로 기울어 출발한다.' : '';
  const opt = (v, desc) => `<button class="row act" data-a="lean" data-v="${v}"><i>${ic(v === '진보' ? 'leaf' : v === '보수' ? 'shield' : 'scale')}</i><div><b>${v}</b><span>${desc}</span></div></button>`;
  return `<div class="pad"><h2 class="h">4. 정치 성향</h2><p class="muted">${c.name} 출신 ${esc(S.name)}. 어느 쪽 깃발 아래 설 것인가. ${tilt}</p>
    ${opt('진보', '더불어시민당(여당) 또는 민주노동당에 입당할 수 있다')}${opt('중도', '양대 정당과 우리혁신당 중에서 고를 수 있다')}${opt('보수', '보수의힘(제1야당) 또는 한국공화당에 입당할 수 있다')}</div>`;
}
H.focus = function (v) { S.focus = v; show(scrLean); };
H.lean = function (v) { S.lean = v; S.ideology = { '진보': -40, '중도': 0, '보수': 40 }[v] + (S.concept === 'union' ? -20 : S.concept === 'general' ? 20 : 0); show(scrParty); };
ALL_TITLES.push('전과자 정치인', '오뚝이', '청백리', '입법의 달인');
