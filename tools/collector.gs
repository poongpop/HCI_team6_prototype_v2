/**
 * HCI 6조 사용성 평가 기록 수집 서버 (구글 Apps Script)
 *
 * 설치 방법
 * 1. 구글 시트를 새로 만들고, 메뉴에서 [확장 프로그램] → [Apps Script]를 엽니다.
 * 2. 기본 코드를 모두 지우고 이 파일 내용을 붙여 넣은 뒤 저장합니다.
 * 3. 아래 TOKEN을 팀만 아는 비밀번호로 바꿉니다. (대시보드에서 기록을 불러올 때 입력)
 * 4. [배포] → [새 배포] → 유형 '웹 앱' 선택
 *    - 실행 사용자: 나
 *    - 액세스 권한이 있는 사용자: 모든 사용자
 *    [배포]를 누르고 권한을 승인하면 '웹 앱 URL'이 나옵니다.
 * 5. 그 URL을 프로토타입의 assets/config.js 맨 위 COLLECT_URL에 붙여 넣고 GitHub에 올립니다.
 *
 * 저장되는 내용: 참가자 코드, 칸 번호, 시작 시각, 완료 여부, 소요 시간, 클릭 수,
 *   행동 기록과 접수 내용(참가자가 입력한 글 포함, JSON)
 * 연락처 번호는 프로토타입에서 보내지 않습니다.
 */
const TOKEN = 'hci6-change-me';
const SHEET = 'sessions';
const HEADER = ['id', 'participant', 'car', 'startedAt', 'success', 'durationSec', 'clicks', 'json'];

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(HEADER);
  return sh;
}

// 참가자 화면이 기록을 보낼 때
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const s = JSON.parse(e.postData.contents);
    if (!s || !s.id || !s.participant || !Array.isArray(s.events)) return out_({ ok: false });
    const sh = sheet_();
    const row = [
      s.id, s.participant, s.car || '', new Date(s.startedAt), !!s.success,
      Math.round((s.durationMs || 0) / 100) / 10,
      s.events.filter(x => x.type === 'click').length,
      JSON.stringify(s),
    ];
    const ids = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat() : [];
    const i = ids.indexOf(s.id);
    if (i >= 0) sh.getRange(i + 2, 1, 1, row.length).setValues([row]);  // 같은 세션은 최신 기록으로 덮어씀
    else sh.appendRow(row);
    return out_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// 연구자 대시보드가 기록을 불러올 때 (비밀번호 필요)
function doGet(e) {
  if ((e.parameter.token || '') !== TOKEN) return out_({ error: 'token' });
  const sh = sheet_();
  const rows = sh.getLastRow() > 1 ? sh.getRange(2, 8, sh.getLastRow() - 1, 1).getValues() : [];
  const sessions = [];
  rows.forEach(r => { try { sessions.push(JSON.parse(r[0])); } catch (err) {} });
  return out_({ sessions });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
