// 이번 생은 정치다 — 추가 이벤트와 퇴임 후 정치
// 버티기(계속할수록 보상과 위험이 함께 커진다), 연쇄 이벤트, 내기, 비례대표, 전직 대통령. design.js 뒤에 로드한다.

/* ───────── 버티기: 계속할수록 얻는 것도, 쓰러질 확률도 커진다 ───────── */
function startPush(cfg) { resetD(); T.jit = false; T.push = Object.assign({ n: 0 }, cfg); show(scrPush); return null; }
function pushRisk(p) { return Math.min(92, p.risk0 + p.n * p.riskStep); }
function scrPush() {
  const p = T.push, risk = pushRisk(p);
  return `${bar()}<div class="pad"><section class="ev ev-field camp"><div class="ev-kind">${ic(p.glyph || 'fire')}버티기</div>
    <div class="ev-pin">${ic('clock')}<span>${p.unit(p.n)}</span></div><h2>${p.title}</h2><p>${p.lines[Math.min(p.n, p.lines.length - 1)]}</p>
    <div class="pushbar">${Array.from({ length: p.max }, (_, i) => `<i class="${i < p.n ? 'on' : ''}"></i>`).join('')}</div>${deltas()}</section>
    <p class="ask">계속하시겠습니까?</p>
    <button class="row ch" data-a="pushGo" data-v=""><em>A</em><div><b>${p.goLabel}</b><span>${p.gainText} · 무너질 확률 <b class="${risk >= 40 ? 'hot' : ''}">${risk}%</b></span></div></button>
    <button class="row ch" data-a="pushStop" data-v=""><em>B</em><div><b>${p.stopLabel}</b><span>지금까지 얻은 것을 챙긴다</span></div></button></div>`;
}
Object.assign(H, {
  pushGo() {
    const p = T.push; if (!p) return;
    if (chance(pushRisk(p) / 100)) { const text = p.bust(p); T.push = null; T.lines = [`<span class="tw down">무너졌다</span> ${text}`]; show(() => scrResult(p.title, T.lines, 'endTurn')); return fx('shake'); }
    p.step(p); p.n++;
    if (p.n >= p.max) { const text = p.done(p); T.push = null; T.lines = [`<span class="tw up">끝까지 버텼다</span> ${text}`]; show(() => scrResult(p.title, T.lines, 'endTurn')); return fx('confetti'); }
    show(scrPush);
  },
  pushStop() { const p = T.push; if (!p) return; T.push = null; T.lines = [p.n ? p.stopText : '시작도 하기 전에 물러섰다.']; show(() => scrResult(p.title, T.lines, 'endTurn')); },
});

/* ───────── 이벤트 ───────── */
EVENTS.push(
  { id: 'hunger_strike', cond: () => S.party && S.party !== S.w.ruling && ['mp', 'none'].includes(S.role), title: '단식 농성',
    text: () => '정부가 쟁점 법안을 강행 처리하려 한다. 당 안팎에서 "누군가는 몸을 던져야 한다"는 말이 나온다. 국회 본청 앞에 천막을 칠 것인가.',
    ch: [
      ['천막을 친다', '버티기 · 날이 갈수록 인지도와 입지 상승, 쓰러질 위험', () => startPush({ title: '단식 농성', glyph: 'tent', max: 5, risk0: 6, riskStep: 13,
        unit: (n) => `단식 ${n * 4}일째`, goLabel: '나흘 더 버틴다', stopLabel: '단식을 푼다', gainText: '인지도 +3, 당내 입지 +3, 체력 −9',
        lines: ['천막 안에 물과 소금만 놓였다. 기자 몇 명이 다녀갔다.', '얼굴이 눈에 띄게 수척해졌다. 지지자들의 응원 방문이 줄을 잇는다.', '의료진이 중단을 권했다. 여당에서도 "대화하자"는 말이 나온다.', '휠체어에 앉아 버티고 있다. 전국 뉴스가 매일 천막을 비춘다.', '의식이 흐려진다. 그러나 정부가 흔들리고 있다.'],
        step() { mod('fame', 3); gainStanding(3); mod('sta', -9); },
        bust() { mod('sta', -22); mod('favor', 2); return '의식을 잃고 병원으로 실려 갔다. 농성은 끝났지만, 그 장면은 오래 남았다.'; },
        done() { mod('favor', 6); mod('fame', 5); return '스무 날. 정부가 법안 처리를 미루겠다고 발표했다. 부축을 받으며 천막을 나섰다.'; },
        stopText: '주치의의 권고를 받아들여 단식을 풀었다. 미음 한 숟갈이 그렇게 달 수 없었다.' })],
      ['다른 방식으로 싸운다', '인지도 소폭 +', () => { mod('fame', 2); return '장외 집회 연단에 서는 것으로 대신했다.'; }],
    ] },
  { id: 'budget_night', cond: () => S.role === 'mp' && S.half === 2, title: '밤샘 예산 협상',
    text: () => '예산안 처리 시한 전날 밤. 소소위 문이 닫혔고, 당신은 지역 예산 증액안을 들고 그 안에 있다.',
    ch: [
      ['증액을 요구한다', '버티기 · 한 건씩 따낼수록 판이 깨질 위험', () => startPush({ title: '밤샘 예산 협상', glyph: 'coin', max: 4, risk0: 10, riskStep: 16, acc: 0,
        unit: (n) => `새벽 ${n + 1}시 · ${n}건 반영`, goLabel: '한 건 더 밀어 넣는다', stopLabel: '이쯤에서 합의한다', gainText: '지역 기반 +4',
        lines: ['기재부 차관이 한숨을 쉰다. "의원님, 하나만 하시죠."', '도로 확장 예산이 들어갔다. 간사의 표정이 굳어 간다.', '복지관 신축까지 반영됐다. 다른 의원들이 눈총을 준다.', '"이 이상은 못 합니다." 테이블 분위기가 험악하다.'],
        step(p) { modBase(S.seat.region, 4); p.acc += 4; },
        bust(p) { modBase(S.seat.region, -p.acc); gainStanding(-5); mod('favor', -3); return '"쪽지 예산" 명단이 통째로 언론에 넘어갔다. 반영됐던 예산은 전부 삭감됐다.'; },
        done() { mod('fame', 3); return '네 건 전부 반영됐다. 지역 신문 1면에 "예산 폭탄"이라는 제목이 걸렸다.'; },
        stopText: '확보한 것만 챙겨 회의장을 나왔다. 새벽 공기가 차가웠다.' })],
      ['당 지도부에 맡긴다', '당내 입지 +', () => { gainStanding(3); return '지도부 방침에 따랐다. 지역 예산은 평년 수준이었다.'; }],
    ] },
  { id: 'endless_debate', cond: () => S.fame >= 40 && S.role !== 'president', title: '끝장 토론',
    text: () => '시사 채널이 "끝날 때까지 끝나지 않는" 무제한 생방송 토론을 제안했다. 상대는 말로 먹고사는 논객 셋이다.',
    ch: [
      ['나간다', '버티기 · 라운드마다 인지도 상승, 실언 위험', () => startPush({ title: '끝장 토론', glyph: 'mic', max: 5, risk0: Math.max(4, 30 - Math.round(S.st.spk / 4)), riskStep: 11,
        unit: (n) => `${n}라운드 종료 · 생방송 ${n * 50}분째`, goLabel: '다음 라운드를 받는다', stopLabel: '"오늘은 여기까지"', gainText: '인지도 +3, 호감도 +1',
        lines: ['조명이 뜨겁다. 첫 질문부터 날이 서 있다.', '채팅창이 당신 편으로 기울고 있다.', '동시 접속자가 30만을 넘겼다. 목이 탄다.', '상대가 과거 발언을 하나씩 꺼내기 시작했다.', '자정이 넘었다. 집중력이 흐려진다.'],
        step() { mod('fame', 3); mod('favor', 1); grow('spk', 0.5); },
        bust() { mod('favor', -8); mod('fame', 2); return '지친 끝에 나온 한마디가 실언이 됐다. 그 10초만 잘려 퍼졌다.'; },
        done() { mod('favor', 4); mod('fame', 4); return '다섯 라운드를 버텼다. 상대 논객이 먼저 악수를 청했다.'; },
        stopText: '적당한 선에서 마이크를 내려놓았다. 손해 본 장사는 아니었다.' })],
      ['사양한다', '변화 없음', () => '"토론은 국회에서 하겠다"고 답했다.'],
    ] },
  { id: 'town_tour', cond: () => S.role === 'president' && S.w.approval < 50, title: '전국 순회 타운홀',
    text: () => '지지율 반등을 위해 참모들이 각본 없는 전국 순회 타운홀을 제안했다. 도시마다 생중계된다.',
    ch: [
      ['순회에 나선다', '버티기 · 도시마다 지지율 상승, 돌발 사고 위험', () => startPush({ title: '전국 순회 타운홀', glyph: 'crowd', max: 5, risk0: 10, riskStep: 12,
        unit: (n) => `${['출발 전', '대전', '광주', '부산', '대구', '서울'][n]} · ${n}곳 완료`, goLabel: '다음 도시로 간다', stopLabel: '순회를 마무리한다', gainText: '국정 지지율 +2.5',
        lines: ['전용 열차가 서울역을 떠난다.', '첫 도시의 분위기는 나쁘지 않았다.', '날 선 질문이 늘고 있다. 경호처가 불안해한다.', '체력이 떨어지고 있다. 답변이 짧아진다.', '마지막 한 곳. 가장 까다로운 청중이 기다린다.'],
        step() { mod('approval', 2.5); mod('sta', -5); },
        bust() { mod('approval', -9); return '한 시민의 절규에 "그건 제 소관이 아닙니다"라고 답하고 말았다. 그 한마디가 모든 것을 덮었다.'; },
        done() { mod('approval', 4); mod('favor', 3); return '다섯 도시를 모두 돌았다. "듣는 대통령"이라는 제목이 걸렸다.'; },
        stopText: '무리하지 않고 일정을 마쳤다.' })],
      ['기자회견으로 대신한다', '지지율 소폭 +', () => { mod('approval', 1); return '준비된 원고로 기자회견을 했다.'; }],
    ] },

  { id: 'usb', cond: () => S.fame >= 25 && !flag('usb') && S.role !== 'president', title: '익명의 USB',
    text: () => '퀵서비스로 봉투 하나가 왔다. 안에는 USB 하나와 쪽지. "쓰시든 버리시든 알아서 하십시오."',
    ch: [
      ['열어 본다', '무엇이 들었는지 안다 · 뒷일이 있다', () => { flag('usb', S.turn); return '상대 진영 거물의 비위를 담은 문건이었다. 진짜인지는 알 수 없다. 일단 금고에 넣었다.'; }],
      ['수사기관에 넘긴다', '호감도 +', () => { flag('usb', -1); mod('favor', 3); return '열어 보지 않고 경찰에 넘겼다.'; }],
      ['파쇄한다', '변화 없음', () => { flag('usb', -1); return '파쇄기에 넣었다. 무엇이 들었는지는 영영 모른다.'; }],
    ] },
  { id: 'usb_use', cond: () => flag('usb') > 0 && S.turn - flag('usb') >= 1, title: '금고 속 문건',
    text: () => '그 USB 속 문건이 계속 머릿속을 맴돈다. 마침 상대 진영이 당신을 공격하기 시작했다.',
    ch: [
      ['기자회견에서 터뜨린다', '도박 · 진짜면 대박, 가짜면 치명타', () => { flag('usb', -1); if (chance(0.55)) { mod('fame', 10); gainStanding(6); mod('favor', 2); return '문건은 진짜였다. 정국이 뒤집혔고 당신은 그 중심에 섰다.'; } mod('favor', -11); mod('fame', 4); return '문건은 조작이었다. 함정이었다는 걸 깨달았을 때는 이미 늦었다.'; }],
      ['당사자를 조용히 만난다', '정치력 60 판정', () => { flag('usb', -1); if (judge('pol', 60)) { gainStanding(8); dirt(10, '뒷거래'); return '문건을 돌려주는 대신 공격을 멈추겠다는 약속을 받았다. 아무도 모르는 거래였다.'; } mod('favor', -6); return '만남 자체가 "협박"으로 보도됐다.'; }],
      ['끝내 쓰지 않는다', '호감도 +', () => { flag('usb', -1); mod('favor', 2); return '문건을 폐기했다. 이기는 방법은 그것 말고도 있다.'; }],
    ] },
  { id: 'donor', cond: () => S.funds < 40 && !flag('donor') && S.role !== 'president', title: '통 큰 후원자',
    text: () => '처음 보는 사업가가 찾아와 봉투를 내민다. "조건 같은 건 없습니다. 그냥 팬입니다."',
    ch: [
      ['감사히 받는다', '정치자금 +35 · 뒷일이 있다', () => { flag('donor', S.turn); mod('funds', 35); dirt(6, '불투명한 후원금'); return '후원회 계좌로 정식 처리했다. 숨통이 트였다.'; }],
      ['정중히 거절한다', '호감도 +', () => { flag('donor', -1); mod('favor', 2); return '"마음만 받겠습니다." 사업가는 아쉬운 표정으로 돌아갔다.'; }],
    ] },
  { id: 'donor_due', cond: () => flag('donor') > 0 && S.turn - flag('donor') >= 3, title: '후원자의 청탁',
    text: () => '그때의 사업가가 다시 찾아왔다. "의원님, 제 사업 인허가 건이 하나 걸려 있는데요."',
    ch: [
      ['들어준다', '도박 · 폭로 위험', () => { flag('donor', -1); dirt(18, '인허가 청탁'); if (chance(0.4)) { mod('favor', -12); mod('fame', 4); return '인허가 개입이 감사에서 드러났다. "후원금의 대가"라는 제목이 붙었다.'; } mod('funds', 10); return '전화 한 통으로 해결됐다. 아무도 모른다. 아직은.'; }],
      ['거절하고 후원금을 돌려준다', '정치자금 −, 호감도 ++', () => { flag('donor', -1); mod('funds', -30); mod('favor', 5); return '받은 돈을 전액 반환했다. 사업가는 문을 쾅 닫고 나갔다.'; }],
      ['거절만 한다', '보복 위험', () => { flag('donor', -1); if (chance(0.3)) { mod('favor', -6); return '앙심을 품은 사업가가 "돈만 받고 입 닦았다"고 폭로했다.'; } return '거절했다. 그 뒤로 연락은 없다.'; }],
    ] },
  { id: 'bet', cond: () => !flag('bet') && S.turn >= 2, title: '기자들과의 내기',
    text: () => '정치부 기자들과의 저녁 자리. 누군가 내기를 제안한다. "다음 총선, 여당이 단독 과반(151석)을 넘깁니까?"',
    ch: [
      ['"넘긴다"에 건다', '다음 총선 뒤에 결과가 나온다', () => { flag('bet', { t: S.turn, over: true }); return '"넘깁니다." 기자들이 수첩에 받아 적었다.'; }],
      ['"못 넘긴다"에 건다', '다음 총선 뒤에 결과가 나온다', () => { flag('bet', { t: S.turn, over: false }); return '"못 넘깁니다." 기자들이 수첩에 받아 적었다.'; }],
      ['내기는 사양한다', '변화 없음', () => { flag('bet', { t: -1 }); return '웃으며 잔만 채웠다.'; }],
    ] },
  { id: 'bet_due', cond: () => flag('bet') && flag('bet').t > 0 && S.w.genTurn > flag('bet').t, title: '내기의 결과',
    text: () => `총선이 끝났다. 여당은 ${S.w.genRulingOver ? '단독 과반을 넘겼다' : '단독 과반에 실패했다'}. 그날 저녁 자리의 기자들이 다시 모였다.`,
    ch: [
      ['결과를 확인한다', '맞히면 인지도·호감도 +', () => { const ok = flag('bet').over === !!S.w.genRulingOver; flag('bet', { t: -1 }); if (ok) { mod('fame', 5); mod('favor', 2); return '"판세 읽는 눈이 있다"는 기사가 나왔다. 저녁은 기자들이 샀다.'; } mod('funds', -4); return '보기 좋게 틀렸다. 저녁값을 냈다.'; }],
    ] },
  { id: 'prop_offer', cond: () => S.party && S.party !== 'mine' && ['none', 'tv'].includes(S.role) && S.standing >= 45 && S.half === 2 && electionsAt(S.year + 1, 1).includes('general') && S.propOffer !== S.year + 1, title: '비례대표 제안',
    text: () => '당 사무총장이 조용히 말을 건넨다. "내년 총선, 비례대표 앞 순번을 드릴 수 있습니다. 지역구에서 고생하실 필요 없이요."',
    ch: [
      ['받는다', '내년 총선에 비례대표 출마 선택지가 생긴다', () => { S.propOffer = S.year + 1; gainStanding(-5); return '약속을 받았다. 다만 지도부에 빚을 진 셈이다.'; }],
      ['지역구로 승부하겠다고 한다', '호감도 +', () => { mod('favor', 2); return '"배지는 유권자에게 직접 받겠습니다."'; }],
    ] },
  { id: 'pm_offer', cond: () => S.party === S.w.ruling && !S.w.playerPres && S.fame >= 55 && S.rec.minister && !S.rec.pm && S.role !== 'president', title: '국무총리 지명',
    text: () => '대통령이 직접 전화를 걸어 왔다. "총리를 맡아 주시오. 국회 인준은 내가 책임지겠소."',
    ch: [
      ['수락한다', '인지도·입지 ++, 정권과 운명 공유', () => { S.rec.pm = true; mod('fame', 10); gainStanding(8); mod('favor', (S.w.approval - 45) / 4); log('국무총리에 임명됐다.'); return '인준 표결을 통과했다. 일인지하 만인지상의 자리에 올랐다.'; }],
      ['고사한다', '호감도 소폭 +', () => { mod('favor', 1); gainStanding(-3); return '"제 자리는 아직 아닙니다."'; }],
    ] },
  { id: 'dance', cond: () => S.age < 60 && S.fame >= 20 && S.role !== 'president', title: '대학 축제 무대',
    text: () => '대학 축제에 초대받았다. 사회자가 갑자기 외친다. "의원님, 요즘 유행하는 챌린지 한번 보여 주시죠!"',
    ch: [
      ['무대에 오른다', '미니게임 · 인지도 변동', (score) => { mod('fame', 2 + score / 14); if (score >= 60) { mod('favor', 4); return '의외로 박자를 탔다. 떼창이 터지고 영상이 300만 뷰를 넘겼다.'; } if (score >= 35) return '어색했지만 박수는 받았다.'; mod('favor', -2); return '삐걱대는 몸짓이 짤이 됐다. 그래도 이름은 알렸다.'; }, 'tap'],
      ['손만 흔든다', '호감도 소폭 +', () => { mod('favor', 1); return '"저는 박수 담당입니다." 무난하게 넘어갔다.'; }],
    ] },
  { id: 'brawl', cond: () => S.role === 'mp' && S.party, title: '본회의장 몸싸움',
    text: () => '의장석을 둘러싸고 여야 의원들이 뒤엉켰다. 넥타이가 날아다닌다.',
    ch: [
      ['맨 앞에서 버틴다', '당내 입지 +, 호감도 −', () => { gainStanding(6); mod('favor', -4); mod('fame', 4); mod('sta', -6); return '의장석을 몸으로 막았다. 당에서는 영웅, 뉴스에서는 "동물 국회"의 얼굴이 됐다.'; }],
      ['뜯어말린다', '매력 55 판정', () => { if (judge('cha', 55)) { mod('favor', 5); mod('fame', 3); return '양쪽을 떼어 놓는 모습이 생중계됐다. "유일한 어른"이라는 댓글이 달렸다.'; } mod('sta', -10); return '말리다가 팔꿈치에 맞았다. 깁스를 했다.'; }],
      ['휴대전화로 생중계한다', '인지도 ++, 당내 입지 −', () => { mod('fame', 6); gainStanding(-5); return '당신의 라이브 방송이 그날 가장 많이 본 영상이 됐다. 동료들의 시선이 따갑다.'; }],
    ] },
  { id: 'undercover', cond: () => S.fame >= 30 && S.role !== 'none', title: '암행 민심',
    text: () => '보고서 속 민심과 진짜 민심이 다르다는 생각이 든다. 모자를 눌러쓰고 혼자 나가 볼까.',
    ch: [
      ['새벽 인력시장에 나간다', '매력 50 판정', () => { if (judge('cha', 50)) { mod('favor', 4); grow('int', 1); return '하루 일당을 벌며 들은 이야기가 다음 연설의 뼈대가 됐다.'; } mod('fame', 3); mod('favor', -2); return '10분 만에 알아본 사람이 사진을 찍어 올렸다. "보여주기"라는 말이 나왔다.'; }],
      ['택시를 몇 대 갈아탄다', '지력 성장', () => { grow('int', 1); mod('favor', 1); return '기사님 다섯 분의 이야기를 받아 적었다.'; }],
      ['보고서를 다시 읽는다', '변화 없음', () => '나가지 않았다. 보고서는 여전히 매끈했다.'],
    ] },
  { id: 'recruit1', cond: () => S.leader, title: '인재 영입 1호',
    text: () => '총선을 앞두고 당의 얼굴이 될 영입 인재 1호를 정해야 한다. 후보는 셋이다.',
    ch: [
      ['국민 MC 출신 방송인', '인지도 ++ · 검증 리스크', () => { mod('fame', 5); if (S.myParty) S.myParty.base = r1(Math.min(18, S.myParty.base + 1.5)); if (chance(0.3)) { mod('favor', -5); return '화제는 됐지만 과거 발언이 줄줄이 발굴됐다.'; } return '입당식 영상이 포털 메인에 걸렸다.'; }],
      ['재난 현장의 응급의학과 의사', '호감도 ++', () => { mod('favor', 5); if (S.myParty) S.myParty.base = r1(Math.min(18, S.myParty.base + 1)); return '"정치는 처음"이라는 말에 박수가 나왔다.'; }],
      ['스물아홉 살 지방의원', '성향 유지, 청년 지지', () => { mod('favor', 2); mod('fame', 2); grow('cha', 0.5); return '파격이라는 평가와 실험이라는 평가가 갈렸다.'; }],
    ] },
  { id: 'viral', cond: () => S.role === 'mp', title: '5분 발언',
    text: () => '본회의 5분 자유발언이 뜻밖에 터졌다. 원고 없이 한 말이 하루 만에 조회수 400만이다.',
    ch: [
      ['인터뷰 요청을 전부 받는다', '인지도 +++, 체력 −', () => { mod('fame', 10); mod('sta', -9); return '사흘 동안 방송국 여덟 곳을 돌았다.'; }],
      ['본업으로 답한다', '인지도 +, 호감도 +', () => { mod('fame', 5); mod('favor', 4); return '"말한 대로 법안으로 내겠다"고만 답했다. 그게 더 화제가 됐다.'; }],
    ] },
  { id: 'nk_summit', cond: () => S.role === 'president', title: '정상회담 제안',
    text: () => '북측에서 전격적으로 정상회담을 제안해 왔다. 준비 기간은 2주. 참모들의 의견이 반으로 갈린다.',
    ch: [
      ['전격 수용한다', '도박 · 역사적 성과 또는 빈손', () => { if (chance(0.5)) { mod('approval', 10); S.rec.agenda++; mod('fame', 5); return '공동 선언문에 서명했다. 전 세계 언론이 그 장면을 1면에 실었다.'; } mod('approval', -7); return '회담은 결렬됐다. "준비 없는 만남"이라는 비판이 쏟아졌다.'; }],
      ['실무 협상부터 하자고 한다', '지지율 소폭 +', () => { mod('approval', 2); return '실무 접촉을 먼저 제안했다. 무난한 선택이라는 평이다.'; }],
      ['거절한다', '보수 쪽 이동', () => { mod('ideology', 5); mod('approval', chance(0.5) ? 2 : -2); return '"진정성이 확인되지 않았다"며 거절했다.'; }],
    ] },
  { id: 'fin_crisis', cond: () => S.role === 'president' && !flag('crisis'), title: '금융 위기',
    text: () => '대형 금융사가 무너졌다. 환율이 치솟고 뱅크런 조짐이 보인다. 오늘 밤 안에 결단해야 한다.',
    ch: [
      ['공적 자금을 투입한다', '지력 60 판정', () => { flag('crisis', 1); if (judge('int', 60)) { mod('approval', 6); S.rec.agenda++; return '시장이 사흘 만에 안정을 찾았다. "위기에 강한 대통령"이라는 평이 나왔다.'; } mod('approval', -6); return '투입 시점을 놓쳤다. 돈은 돈대로 쓰고 불은 끄지 못했다.'; }],
      ['고통 분담을 호소한다', '지지율 −, 호감도 +', () => { flag('crisis', 1); mod('approval', -4); mod('favor', 4); return '대국민 담화에서 구조조정을 예고했다. 지금은 욕을 먹지만 훗날 재평가될 것이다.'; }],
      ['시장에 맡긴다', '도박', () => { flag('crisis', 1); if (chance(0.3)) { mod('approval', 4); return '시장이 스스로 바닥을 다졌다. 운이 좋았다.'; } mod('approval', -10); return '연쇄 부도가 시작됐다. "대통령은 어디 있었나"는 물음이 쏟아졌다.'; }],
    ] },
  { id: 'ex_envoy', cond: () => S.exPres && S.role === 'none', title: '후임 대통령의 부탁',
    text: () => '후임 대통령이 전화를 걸어 왔다. "선배님, 특사로 한 번만 다녀와 주십시오. 저쪽에서 선배님을 원합니다."',
    ch: [
      ['다녀온다', '정치력 55 판정', () => { mod('sta', -6); if (judge('pol', 55)) { mod('fame', 5); mod('favor', 5); return '꼬여 있던 협상이 풀렸다. 전직 대통령의 품격이라는 사설이 실렸다.'; } mod('favor', -2); return '빈손으로 돌아왔다. "옛날 사람"이라는 말이 나왔다.'; }],
      ['사양한다', '변화 없음', () => '"현직이 하셔야 할 일입니다"라고 답했다.'],
    ] },
  { id: 'ex_house', cond: () => S.exPres && S.role !== 'president', title: '사저 앞 집회',
    text: () => '사저 앞에서 재임 시절 정책에 항의하는 집회가 열흘째 이어지고 있다. 이웃들이 불편을 호소한다.',
    ch: [
      ['직접 나가 이야기를 듣는다', '매력 55 판정', () => { if (judge('cha', 55)) { mod('favor', 6); mod('fame', 3); return '두 시간 동안 서서 들었다. 집회는 그날로 끝났다.'; } mod('favor', -3); return '고성이 오갔고, 그 장면이 그대로 방송됐다.'; }],
      ['대응하지 않는다', '호감도 소폭 −', () => { mod('favor', -1); return '커튼을 닫았다.'; }],
    ] }
);
Object.assign(EV_KIND, { hunger_strike: 'field', budget_night: 'house', endless_debate: 'media', town_tour: 'field', usb: 'phone', usb_use: 'phone', donor: 'phone', donor_due: 'phone', bet: 'media', bet_due: 'media', prop_offer: 'phone', pm_offer: 'phone', dance: 'field', brawl: 'house', undercover: 'field', recruit1: 'house', viral: 'media', nk_summit: 'news', fin_crisis: 'news', ex_envoy: 'phone', ex_house: 'field' });

/* ───────── 전직 대통령 전용 일정 ───────── */
ACTIONS.push(
  sp({ id: 'memoir', roles: ['none'], need: () => S.exPres, name: '회고록 집필', desc: '정치자금 ++, 인지도 + · 논란 위험',
    run() { mod('funds', 15); mod('fame', 3); if (chance(0.2)) { mod('favor', -4); return '회고록의 한 대목이 "자화자찬"이라는 비판을 받았다.'; } return '재임 시절의 뒷이야기를 담은 회고록이 서점가를 휩쓸었다.'; } }),
  sp({ id: 'elder', roles: ['none'], need: () => S.exPres && !!S.party, name: '원로 자문', desc: '당내 입지 ++, 호감도 +',
    run() { gainStanding(6); mod('favor', 2); return '당 지도부가 사저로 찾아와 조언을 구했다.'; } }),
  sp({ id: 'envoy', roles: ['none'], need: () => S.exPres, name: '민간 외교 순방', desc: '정치력 55 판정',
    run() { mod('sta', -6); if (judge('pol', 55)) { mod('fame', 4); mod('favor', 4); return '해외 정상들과의 옛 인연이 빛을 발했다.'; } mod('fame', 1); return '의전 논란만 남긴 순방이었다.'; } })
);
['memoir', 'elder', 'envoy'].forEach((id, i) => { ICONS[id] = ic(['pen', 'crown', 'globe'][i]); });
THEMES.find((t) => t.id === 'money').ids.push('memoir'); THEMES.find((t) => t.id === 'party').ids.push('elder'); THEMES.find((t) => t.id === 'policy').ids.push('envoy');
ALL_TITLES.push('국무총리', '물러나지 않는 전직');

/* ───────── 대통령 임기 종료: 은퇴 / 정치 계속 / 재선 도전 ───────── */
function scrTermEnd() {
  const lost = !!T.termLost, canRerun = !lost && S.rec.amend === 'self' && !S.rerun;
  return `<div class="seq"><p class="seq-k">${S.year}년 · ${lost ? '재선 실패' : '임기 만료'}</p><h1>청와대를<br>떠나는 날</h1><div class="rule"></div>
    <p>${lost ? '국민은 다른 선택을 했다. 이삿짐 트럭이 본관 앞에 섰다.' : `5년이 지났다. 퇴임 직전 국정 지지율은 ${Math.round(S.w.approval)}%.`}</p><p>이제 무엇을 할 것인가.</p>
    ${canRerun ? btn('reRun', '', '재선에 도전한다', 'primary') : ''}
    ${btn('termStay', '', '정치를 계속한다')}${btn('termRetire', '', '정계에서 물러난다', canRerun ? '' : 'primary')}</div>`;
}
(() => {
  const elRun0 = H.elRun;
  Object.assign(H, {
    termRetire() {
      if (!T.termLost) { S.rec.finalApproval = S.w.approval; log('5년 임기를 마치고 퇴임했다.'); }
      const why = T.termLost ? '재선 실패' : '대통령 임기 만료'; T.termLost = false; ending(why);
    },
    termStay() {
      const lost = !!T.termLost; T.termLost = false;
      if (!lost) S.rec.finalApproval = S.w.approval;
      S.role = 'none'; S.seat = null; S.term = null; S.exPres = true; S.exTurn = S.turn; S.w.playerPres = false; S.standing = Math.max(S.standing, 70); S.offerKey = '';
      log('퇴임 뒤에도 정치를 계속하기로 했다.');
      if (lost) return endTurn();
      const els = electionsAt(S.year, S.half);
      showReports(worldElections(['pres'], null, false, null), () => { if (!els.some((e) => e !== 'pres')) S.elDone = true; startTurn(); });
    },
    elRun(v) {
      if (v === 'prop') {
        // 비례대표: 유세 없이 당 득표와 순번으로 결정된다
        T.el = { type: 'general', place: { name: '비례대표', region: S.home, L: 0 }, prop: true };
        resetD(); S.propOffer = 0;
        const won = chance(0.85);
        log(`${PARTIES[S.party].name} 비례대표 후보로 총선에 나섰다.`);
        if (won) { winSeat(T.el); log('비례대표로 국회에 입성했다.'); } else { S.rec.losses++; log('비례대표 순번이 당선권에 들지 못했다.'); }
        T.elWon = won; T.elType = 'general'; T.el.spoke = true;
        T.myLine = { kind: 'general', text: `${esc(S.name)} · 비례대표 ${won ? '당선' : '낙선'}` };
        T.lines = [won ? '당 득표율이 넉넉했다. 개표 초반에 당선이 확정됐다.' : '당 득표율이 기대에 못 미쳤다. 한 순번 차이로 떨어졌다.'];
        show(() => scrResult(won ? '비례대표 당선' : '비례대표 낙선', T.lines, 'elDone'));
        return fx(won ? 'win' : 'lose');
      }
      if (v === 'pres' && S.exPres) S.rerun = true;
      elRun0(v);
    },
  });
})();
