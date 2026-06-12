# プロジェクト名

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
git clone xxx
cd project
```

## 開発フロー

### 1. ブランチ作成

```bash
git checkout -b feature/xxx
```

### 2. 作業
機能追加や修正を行います。

### 3. push

```bash
git push origin feature/xxx
```

### 4. PR作成
- 変更内容を記載して Pull Request を作成する
- レビューを依頼する