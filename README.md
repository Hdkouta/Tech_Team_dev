# Tech_Team_dev

採用KPIを月次で管理し、ダッシュボードで可視化するWebアプリケーションです。
フロントエンドはReact + Vite、バックエンドはFlask + SQLiteで構成されています。

## アプリ概要

本システムは、採用活動に関する指標データ（目標値・実績値）を登録し、
月次推移・達成率・前年比較を確認できる社内向けKPI管理アプリです。

主な目的は以下です。

- Excel中心の運用から、Web入力 + DB一元管理へ移行する
- 指標データの入力ミスや重複を減らす
- 月次の進捗をダッシュボードで見える化する

## 主要機能

- 選考データ項目（マスタ）の取得
- 選考データ（月次）の登録（Upsert）
- 選考データ（月次）の更新
- 選考データ（月次）の削除
- ダッシュボード表示
	- 目標/実績グラフ（棒グラフ）
	- 達成率グラフ（折れ線グラフ）
	- 前年比較グラフ（折れ線グラフ）
	- 採用ファネル（横棒グラフ）
- データ一覧表示（年別・月別管理）
- 入力モーダルでのバリデーション
	- 年月形式チェック（YYYY-MM）
	- 必須項目チェック
	- 月重複チェック

## セットアップ手順

### 前提環境

- Node.js 20系以上（推奨）
- Python 3.11系以上（推奨）
- npm

### 1. リポジトリを取得

```bash
git clone https://github.com/Hdkouta/Tech_Team_dev.git
cd Tech_Team_dev
```

### 2. フロントエンド依存関係をインストール

```bash
npm --prefix frontend install
```

### 3. バックエンド依存関係をインストール

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
```

## 起動方法

### 1. バックエンド起動（Flask API）

```bash
cd backend
python app.py
```

起動後のAPIエンドポイント:

- http://localhost:5000/api/health

### 2. フロントエンド起動（Vite）

別ターミナルで実行:

```bash
npm --prefix frontend run dev -- --host
```

起動後の画面URL:

- http://localhost:5173

### 3. （任意）サンプルデータ投入

バックエンド起動中に以下を実行:

```bash
python backend/seed_2025_data.py
python backend/seed_2026_data.py
```

## 役割分担

| 役割 | 担当内容 |
|---|---|
| PM / 進行管理 | スケジュール管理、要件整理、レビュー調整 |
| フロントエンド担当 | React画面実装、UI改善、グラフ表示実装 |
| バックエンド担当 | Flask API実装、バリデーション、DBアクセス実装 |
| DB担当 | テーブル設計、制約定義、データ整合性確認 |
| QA担当 | 動作確認、回帰テスト、受け入れ確認 |

## 画面一覧

1. ダッシュボード画面
	 - 採用KPIのサマリ表示
	 - 目標/実績、達成率、前年比較、採用ファネルを表示
	 - 各グラフの種類
	   - 目標/実績: 棒グラフ
	   - エントリー数の前年比較: 折れ線グラフ
	   - 達成率: 折れ線グラフ
	   - 採用ファネル: 横棒グラフ

2. データ一覧画面
	 - 年単位で応募指標データを一覧表示
	 - 月単位で展開/折りたたみ

3. 応募データ入力モーダル
	 - 指標、対象年月、目標値、実績値、メモを入力
	 - 指標によって新卒/中途の内訳入力を切り替え

4. 応募データ編集モーダル
	 - 既存データの更新
	 - 既存データの削除

## DB設計

DBはSQLiteを使用しています（backend/data/kpi.db）。

### 1. application_metric_definitions（選考データ項目マスタ）

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | INTEGER | PK | 項目ID |
| code | VARCHAR(100) | UNIQUE, NOT NULL | 項目コード |
| name | VARCHAR(200) | NOT NULL | 項目名 |
| supports_breakdown | BOOLEAN | NOT NULL, DEFAULT 0 | 内訳入力対応フラグ |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 表示順 |
| is_active | BOOLEAN | NOT NULL, DEFAULT 1 | 有効フラグ |

### 2. application_metric_monthly_records（選考データ月次レコード）

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | INTEGER | PK | 月次データID |
| metric_definition_id | INTEGER | FK, NOT NULL | 選考データ項目マスタID |
| target_month | VARCHAR(7) | NOT NULL | 対象年月（YYYY-MM） |
| target_total | INTEGER | NOT NULL, DEFAULT 0 | 目標合計 |
| actual_new_graduate | INTEGER | NULL | 実績（新卒） |
| actual_mid_career | INTEGER | NULL | 実績（中途） |
| memo | VARCHAR(300) | NULL | メモ |

### 3. 制約・リレーション

- application_metric_monthly_records.metric_definition_id
	-> application_metric_definitions.id（多対1）
- UNIQUE制約: (metric_definition_id, target_month)
	- 同一指標・同一月の重複登録を防止

