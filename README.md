# Tech_Team_dev

## 概要
チーム開発研修用のプロジェクト

## 開発ルール

### ブランチ
- `main`：本番
- `feature/xxx`：作業用

### コミット
- `feat:`
- `fix:`
- `docs:`

### PRルール
- レビュー必須
- 内容記載必須

## セットアップ

```bash
git clone https://github.com/Hdkouta/Tech_Team_dev.git
cd Tech_Team_dev
```

## 開発フロー

### 1. ブランチ作成

```bash
git checkout -b feature/update-readme
```

### 2. 作業
機能追加や修正を行います。

### 3. コミット

```bash
git add .
git commit -m "docs: update README"
```

### 4. Push

```bash
git push origin feature/update-readme
```

### 5. PR作成
- 変更内容を記載して Pull Request を作成する
- レビューを依頼する