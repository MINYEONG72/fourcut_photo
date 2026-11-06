# 크리스마스 인생네컷 — GitHub Pages 버전

Python이나 별도 서버가 필요하지 않습니다.

## GitHub에 올리는 방법
1. GitHub에서 새 공개 저장소(예: `christmas-photobooth`)를 만듭니다.
2. ZIP 압축을 해제한 다음 `index.html`, `style.css`, `app.js`, `frames` 폴더를 **저장소 최상위**에 업로드합니다. ZIP 파일 자체를 업로드하면 웹사이트가 실행되지 않습니다.
3. 저장소의 **Settings → Pages → Build and deployment → Deploy from a branch**를 선택합니다.
4. Branch `main`, Folder `/(root)`를 선택하고 Save를 누릅니다.
5. 표시되는 `https://사용자명.github.io/christmas-photobooth/` 주소로 접속합니다.

## 기능
- 제공된 3종 크리스마스 프레임 선택
- 노트북 웹캠으로 3초 카운트다운, 사진 8장 촬영
- 8장 중 4장을 선택한 순서대로 배치
- 프레임 합성 및 PNG 저장
- 지원 브라우저에서는 공유 메뉴를 통해 이메일 앱에 파일 전달 가능

## 주의사항
- 웹캠은 HTTPS(GitHub Pages) 또는 localhost에서만 정상적으로 작동합니다.
- GitHub Pages 자체는 이메일 서버가 없으므로 **이메일 자동 발송**은 지원하지 않습니다. 공유 기능이 지원되지 않으면 PNG 저장 후 메일에 직접 첨부해야 합니다. 자동 이메일 발송에는 EmailJS 등의 별도 서비스 설정이 필요합니다.
- 산타 프레임은 사진 2장과 얼굴 영역 2장에 합성합니다. 얼굴 영역의 위치는 촬영 결과에 따라 조정이 필요할 수 있습니다.
- 사진은 브라우저 안에서만 처리되며 이 코드에서는 서버로 업로드하지 않습니다.
