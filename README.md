# HeekTime Website

HeekTime 웹사이트

## Requirements

- Node.js
- [Yarn 1.x](https://classic.yarnpkg.com/)

## Setup

```bash
$ nvm use       # Use .nvmrc specified node version
$ yarn prepare  # Register git hooks
$ yarn install
```

### Use Emulator

```bash
$ cp .env.local.dist .env.local
```

## Development

### Run development server

```bash
$ yarn start
```

### Build

```bash
$ yarn build
```

### Lint/Formatting

```bash
$ yarn eslint .
$ yarn prettier -c .  # check
```

### Tools

#### Visual Studio Code Extensions

- https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

## Deploy

HeekTime 웹사이트는 Firebase Hosting으로 서빙하고 있습니다.

Firebase CLI를 사용해서 배포합니다.

### Configure

#### Install Firebase CLI

```bash
$ npm install -g firebase-tools
```

or https://firebase.google.com/docs/cli?hl=ko

#### Login

```bash
$ firebase login
```

### 🚀 Deploy

빌드 후 다음 명령을 실행하면 build/ 폴더에 있는 항목들이 배포됩니다.

```bash
$ firebase deploy
```
