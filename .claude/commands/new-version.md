# New Version Release

버전을 올리고 vsix 빌드 파일을 생성합니다.

## Arguments

- `$ARGUMENTS`: 버전 타입 (patch, minor, major). 기본값: patch

## Process

1. `npm version <type>` 으로 package.json 버전 업데이트
2. `pnpm dlx @vscode/vsce package` 로 vsix 파일 생성
3. 생성된 vsix 파일 경로 출력
