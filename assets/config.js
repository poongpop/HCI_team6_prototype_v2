// HCI 6조 프로토타입 설정 파일
// ─────────────────────────────────────────────
// 1) 수집 서버 주소: 구글 Apps Script 웹 앱 배포 후 받은 주소를 따옴표 안에 붙여 넣으세요.
//    비워 두면 기록은 각 기기 브라우저에만 저장되고, 접수 완료 화면의 'JSON 저장'으로 모읍니다.
const COLLECT_URL = 'https://script.google.com/macros/s/AKfycbynAzsL4BpiQJbPaEZMUs_IdPAh9gE557uwHKd9Q4H_j9RrlrLuAeLsdVzbmQy1Awrc/exec';

// 2) 시연용 칸 데이터 (QR 키는 QR 주소 안에만 들어감)
//    line: 호선, key: QR 키, temp: 현재 온도(시연용), pos: 몇 번째 칸, cars: 열차 전체 칸 수
//    ※ 칸 번호와 key를 바꾸면 이미 인쇄한 QR이 작동하지 않습니다.
const CARS = {
  // 2호선 한 열차(10칸)의 1~5번째 칸 — 스티커 5장
  '2046':   { line: '2', key: 'R4M8TZ', temp: 17.5, pos: 1, cars: 10 },
  '2047':   { line: '2', key: 'TMP3PP', temp: 18.2, pos: 2, cars: 10 },
  '2048':   { line: '2', key: 'ZVRCHE', temp: 18.3, pos: 3, cars: 10 },
  '2049':   { line: '2', key: '3N6JAQ', temp: 20.4, pos: 4, cars: 10 },
  '2050':   { line: '2', key: 'ZC6H5A', temp: 21.9, pos: 5, cars: 10 },
  // 4호선, 7호선 각 1장
  '4106':   { line: '4', key: 'H2D6VN', temp: 21.5, pos: 6, cars: 10 },
  '7123':   { line: '7', key: 'B9X3LW', temp: 20.2, pos: 3, cars: 8 },
  // 예전에 만든 QR용(스티커 목록에서는 빠짐)
  '2045':   { line: '2', key: 'K7P2QX', temp: 24.5, pos: 4, cars: 10, legacy: true },
  '341106': { line: '4', key: 'H2D6VN', temp: 21.5, pos: 6, cars: 10, legacy: true },
};
// 열차 전체 칸 온도(시연용, ℃). 위 CARS에 있는 칸은 CARS의 temp가 우선이에요
const TRAIN_TEMPS = {
  '2': [17.5, 18.2, 18.3, 20.4, 21.9, 22.6, 21.2, 19.8, 18.9, 20.7],
  '4': [19.6, 20.3, 18.8, 19.1, 20.9, 21.5, 22.4, 20.0, 18.6, 19.4],
  '7': [21.8, 20.9, 20.2, 19.0, 18.4, 19.7, 22.3, 21.1],
};

// 권장 온도 범위(℃). 5~9월은 여름철, 나머지는 겨울철 기준으로 현재 온도를 판단해요
const RECOMMENDED = {
  winter: { min: 18, max: 21, label: '겨울철 권장 난방온도' },
  summer: { min: 24, max: 27, label: '여름철 권장 냉방온도' },
};

function verifyQr(car, key) {
  const c = CARS[car];
  return !!(c && key && c.key === key);
}
function qs(car) {
  return `?car=${encodeURIComponent(car)}&key=${encodeURIComponent(CARS[car].key)}`;
}
