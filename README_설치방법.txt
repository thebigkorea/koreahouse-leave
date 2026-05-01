한국의집 연월차관리 PWA 설치 방법

1. Google Spreadsheet 새로 만들기
   - 파일명 예: 한국의집_연월차관리
   - 시트는 Apps Script가 자동 생성합니다.

2. Google Apps Script 만들기
   - 스프레드시트 > 확장 프로그램 > Apps Script
   - Code.gs에 아래 CODE_GS.txt 내용을 붙여넣기
   - SPREADSHEET_ID를 본인 구글시트 ID로 변경
   - 배포 > 새 배포 > 웹 앱
     실행 사용자: 나
     액세스 권한: 모든 사용자
   - 배포 후 /exec 로 끝나는 웹앱 URL 복사

3. VS Code 파일 수정
   - script.js 안의 SCRIPT_URL을 복사한 Apps Script 웹앱 URL로 변경

4. GitHub Pages에 업로드
   - index.html
   - admin.html
   - style.css
   - script.js
   - manifest.json
   - service-worker.js
   - icon.svg

5. 휴대폰 설치
   - 아이폰: Safari 접속 > 공유 > 홈 화면에 추가
   - 갤럭시: Chrome 접속 > 홈 화면에 추가 또는 앱 설치

관리자 비밀번호 기본값: 1234
Apps Script의 ADMIN_PASSWORD 값을 반드시 변경하세요.
