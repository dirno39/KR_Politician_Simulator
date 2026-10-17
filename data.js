// 이번 생은 정치다 — 프로토타입 데이터 테이블
// 밸런스 조정은 이 파일의 숫자만 바꾸면 된다.

const PARTIES = {
  simin:   { name: '더불어시민당', ideo: -35, color: '#2f6fd0', seats: 150, kind: 'major', desc: '진보 · 집권 여당 · 호남 강세' },
  bosu:    { name: '보수의힘',     ideo: 35,  color: '#d0402f', seats: 120, kind: 'major', desc: '보수 · 제1야당 · 영남 강세' },
  hyuk:    { name: '우리혁신당',   ideo: 0,   color: '#e08a1e', seats: 20,  kind: 'center', desc: '중도 · 공천은 쉽고 당선은 어렵다' },
  nodong:  { name: '민주노동당',   ideo: -80, color: '#b8860b', seats: 5,   kind: 'hard', desc: '강경 진보 · 노동 지역 기반' },
  gonghwa: { name: '한국공화당',   ideo: 80,  color: '#5b3c9a', seats: 5,   kind: 'hard', desc: '강경 보수 · 영남 일부 기반' },
};

const PARTY_BY_LEAN = {
  '진보': ['simin', 'nodong'],
  '중도': ['simin', 'bosu', 'hyuk'],
  '보수': ['bosu', 'gonghwa'],
};

const REGIONS = {
  seoul: '서울', ggN: '경기북부', ggS: '경기남부', incheon: '인천', gangwon: '강원',
  chungbuk: '충북', chungnam: '충남', daejeon: '대전', sejong: '세종',
  jeonbuk: '전북', jeonnam: '전남', gwangju: '광주',
  gyeongbuk: '경북', daegu: '대구', gyeongnam: '경남', busan: '부산', ulsan: '울산', jeju: '제주',
};

// L: 지형. -2 진보 텃밭 ~ +2 보수 텃밭 (게임용 단순화 값)
const GENERAL_DISTRICTS = [
  { name: '서울 종로', region: 'seoul', L: 0 },
  { name: '서울 강남갑', region: 'seoul', L: 2 },
  { name: '서울 마포을', region: 'seoul', L: -1 },
  { name: '서울 노원병', region: 'seoul', L: -1 },
  { name: '고양갑', region: 'ggN', L: -1 },
  { name: '포천·가평', region: 'ggN', L: 1 },
  { name: '수원정', region: 'ggS', L: -1 },
  { name: '성남 분당갑', region: 'ggS', L: 0 },
  { name: '화성을', region: 'ggS', L: 0 },
  { name: '인천 계양을', region: 'incheon', L: -2 },
  { name: '인천 중구·강화·옹진', region: 'incheon', L: 1 },
  { name: '춘천갑', region: 'gangwon', L: 0 },
  { name: '강릉', region: 'gangwon', L: 2 },
  { name: '청주 상당', region: 'chungbuk', L: 0 },
  { name: '천안갑', region: 'chungnam', L: -1 },
  { name: '홍성·예산', region: 'chungnam', L: 2 },
  { name: '대전 유성갑', region: 'daejeon', L: -1 },
  { name: '세종갑', region: 'sejong', L: -1 },
  { name: '전주을', region: 'jeonbuk', L: -2 },
  { name: '순천갑', region: 'jeonnam', L: -2 },
  { name: '광주 광산을', region: 'gwangju', L: -2 },
  { name: '안동·예천', region: 'gyeongbuk', L: 2 },
  { name: '대구 수성갑', region: 'daegu', L: 1 },
  { name: '창원 성산', region: 'gyeongnam', L: 0 },
  { name: '김해을', region: 'gyeongnam', L: -1 },
  { name: '부산 해운대갑', region: 'busan', L: 2 },
  { name: '부산 북구갑', region: 'busan', L: 0 },
  { name: '울산 동구', region: 'ulsan', L: 0 },
  { name: '제주갑', region: 'jeju', L: -1 },
];

const LOCAL_SEATS = [
  { name: '서울특별시장', region: 'seoul', L: 0, tier: 'metro' },
  { name: '부산광역시장', region: 'busan', L: 1, tier: 'metro' },
  { name: '대구광역시장', region: 'daegu', L: 2, tier: 'metro' },
  { name: '인천광역시장', region: 'incheon', L: 0, tier: 'metro' },
  { name: '대전광역시장', region: 'daejeon', L: 0, tier: 'metro' },
  { name: '울산광역시장', region: 'ulsan', L: 0, tier: 'metro' },
  { name: '세종특별자치시장', region: 'sejong', L: -1, tier: 'metro' },
  { name: '전남광주통합특별시장', region: 'gwangju', L: -2, tier: 'metro' },
  { name: '경기도지사', region: 'ggS', L: -1, tier: 'gov' },
  { name: '강원도지사', region: 'gangwon', L: 1, tier: 'gov' },
  { name: '충청북도지사', region: 'chungbuk', L: 0, tier: 'gov' },
  { name: '충청남도지사', region: 'chungnam', L: 0, tier: 'gov' },
  { name: '전북도지사', region: 'jeonbuk', L: -2, tier: 'gov' },
  { name: '경상북도지사', region: 'gyeongbuk', L: 2, tier: 'gov' },
  { name: '경상남도지사', region: 'gyeongnam', L: 1, tier: 'gov' },
  { name: '제주도지사', region: 'jeju', L: -1, tier: 'gov' },
  { name: '수원시장', region: 'ggS', L: -1, tier: 'city' },
  { name: '성남시장', region: 'ggS', L: 0, tier: 'city' },
  { name: '용인시장', region: 'ggS', L: 0, tier: 'city' },
  { name: '화성시장', region: 'ggS', L: -1, tier: 'city' },
  { name: '고양시장', region: 'ggN', L: -1, tier: 'city' },
  { name: '의정부시장', region: 'ggN', L: 0, tier: 'city' },
  { name: '춘천시장', region: 'gangwon', L: 0, tier: 'city' },
  { name: '원주시장', region: 'gangwon', L: 0, tier: 'city' },
  { name: '청주시장', region: 'chungbuk', L: 0, tier: 'city' },
  { name: '천안시장', region: 'chungnam', L: 0, tier: 'city' },
  { name: '전주시장', region: 'jeonbuk', L: -2, tier: 'city' },
  { name: '순천시장', region: 'jeonnam', L: -2, tier: 'city' },
  { name: '포항시장', region: 'gyeongbuk', L: 2, tier: 'city' },
  { name: '창원시장', region: 'gyeongnam', L: 1, tier: 'city' },
];

// st: [지력, 매력, 화술, 정치력, 체력]
const CONCEPTS = [
  { id: 'youth', name: '청년 활동가', age: 25, st: [45, 62, 60, 30, 85], fame: 22, favor: 55, funds: 10, standing: 15,
    blurb: '학생 운동과 SNS로 이름을 알렸다. 가진 건 시간과 패기뿐.', trait: 'SNS 효과 2배 · 성장 기간이 가장 길다' },
  { id: 'influencer', name: '유튜버·인플루언서', age: 30, st: [40, 68, 58, 25, 75], fame: 50, favor: 48, funds: 35, standing: 5,
    blurb: '구독자 150만. 정치 콘텐츠가 터지면서 영입 제안이 왔다.', trait: '인지도 50 시작 · 논란 확률 2배' },
  { id: 'aide', name: '국회 보좌관', age: 32, st: [55, 42, 48, 65, 70], fame: 5, favor: 50, funds: 15, standing: 40,
    blurb: '의원회관에서 8년. 판이 어떻게 굴러가는지 누구보다 잘 안다.', trait: '공천 확률 +10 · 무명' },
  { id: 'ceo', name: '스타트업 CEO', age: 35, st: [72, 50, 45, 30, 70], fame: 25, favor: 52, funds: 70, standing: 15,
    blurb: '이공계 출신 창업가. 회사를 매각하고 공천 제안을 받았다.', trait: '정치자금 70 시작' },
  { id: 'local', name: '풀뿌리 지방의원', age: 36, st: [48, 52, 50, 62, 72], fame: 12, favor: 55, funds: 20, standing: 30,
    blurb: '구의원 재선. 동네 경조사를 한 번도 거른 적이 없다.', trait: '연고지 기반 +30' },
  { id: 'lawyer', name: '인권·노동 변호사', age: 38, st: [68, 50, 68, 38, 65], fame: 20, favor: 60, funds: 20, standing: 15,
    blurb: '굵직한 공익 소송으로 이름을 알렸다.', trait: '토론 보너스 · 호감도 하락폭 20% 감소' },
  { id: 'prosecutor', name: '탄압받은 검사', age: 40, st: [70, 40, 58, 42, 65], fame: 35, favor: 50, funds: 25, standing: 20,
    blurb: '윗선과 충돌한 끝에 좌천됐고, 사표를 던지자 정치권이 손을 내밀었다.', trait: '야당 입당 시 인지도 +10' },
  { id: 'anchor', name: '방송 앵커', age: 42, st: [55, 62, 75, 28, 60], fame: 45, favor: 55, funds: 30, standing: 10,
    blurb: '메인 뉴스를 7년 진행했다. 클로징 멘트로 화제가 되곤 했다.', trait: '토론·방송 효과 +50%' },
  { id: 'union', name: '노조위원장·시민단체 대표', age: 45, st: [50, 48, 60, 65, 60], fame: 22, favor: 45, funds: 20, standing: 30,
    blurb: '현장에서 20년. 조직을 움직이는 법을 안다.', trait: '조직 동원 효과 +50% · 성향이 진보 쪽으로 출발' },
  { id: 'bureaucrat', name: '경제 관료', age: 48, st: [78, 35, 42, 50, 55], fame: 15, favor: 50, funds: 30, standing: 20,
    blurb: '예산실장 출신. 숫자는 누구보다 밝지만 악수는 어색하다.', trait: '입각 제안 확률 높음 · 지력 최상위' },
  { id: 'professor', name: '대학교수', age: 50, st: [80, 48, 55, 28, 50], fame: 20, favor: 60, funds: 25, standing: 10,
    blurb: '시사 프로그램 단골 패널. 이제 직접 해 보기로 했다.', trait: '지력 80 시작 · 논문 검증 리스크' },
  { id: 'general', name: '예비역 장성', age: 55, st: [58, 50, 48, 52, 55], fame: 30, favor: 55, funds: 30, standing: 20,
    blurb: '별 셋으로 전역했다. 남은 시간이 많지 않다.', trait: '안보 이벤트 강세 · 성향이 보수 쪽으로 출발' },
];

const GRADE_BONUS = { S: 8, A: 4, B: 0, C: -5 };

const FOCUS = [
  { id: 'policy', name: '정책통', desc: '지력 성장 +50%', stats: ['int'] },
  { id: 'star', name: '대중스타', desc: '매력·화술 성장 +50%', stats: ['cha', 'spk'] },
  { id: 'boss', name: '당내 실세', desc: '정치력 성장 +50%, 당내 입지 획득 +50%', stats: ['pol'] },
  { id: 'localist', name: '지역 일꾼', desc: '지역 기반 획득 +50%', stats: [] },
];

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송'];
const GIVEN = ['민석', '지현', '성호', '은정', '태윤', '수진', '동훈', '혜원', '재명', '경태', '상현', '미영', '준혁', '선영', '병철', '윤서', '기현', '소라'];

const DEBATE_QS = [
  { q: '상대 후보가 당신의 과거 발언을 꺼내 인신공격에 가까운 질문을 던졌다.', best: 'spk' },
  { q: '사회자가 묻는다. "그 공약, 재원은 어디서 마련합니까?"', best: 'int' },
  { q: '방청석의 취업준비생이 울먹이며 묻는다. "저희는 뭘 믿고 살아야 하나요?"', best: 'cha' },
  { q: '상대 후보가 통계 수치를 틀리게 인용하며 당신을 몰아세운다.', best: 'int' },
  { q: '상대 후보가 말을 끊으며 계속 끼어든다.', best: 'spk' },
  { q: '시장 상인 대표가 묻는다. "선거 끝나도 여기 오실 겁니까?"', best: 'cha' },
  { q: '사회자가 묻는다. "소속 정당의 최근 논란, 어떻게 보십니까?"', best: 'spk' },
  { q: '전문가 패널이 연금 개혁의 구체적 수치를 요구한다.', best: 'int' },
];

if (typeof module !== 'undefined') {
  module.exports = { PARTIES, PARTY_BY_LEAN, REGIONS, GENERAL_DISTRICTS, LOCAL_SEATS, CONCEPTS, GRADE_BONUS, FOCUS, SURNAMES, GIVEN, DEBATE_QS };
}
