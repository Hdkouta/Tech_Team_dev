import os
import re
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "kpi.db")

os.makedirs(DATA_DIR, exist_ok=True)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)
db = SQLAlchemy(app)

MONTH_PATTERN = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


class ApplicationMetricDefinition(db.Model):
    # 応募指標マスタ
    __tablename__ = "application_metric_definitions"

    id = db.Column(db.Integer, primary_key=True)  # 指標ID
    code = db.Column(db.String(100), nullable=False, unique=True)  # 指標コード（システム識別子）
    name = db.Column(db.String(200), nullable=False)  # 指標名（画面表示用）
    supports_breakdown = db.Column(db.Boolean, nullable=False, default=False)  # 新卒/中途の内訳入力有無
    display_order = db.Column(db.Integer, nullable=False, default=0)  # 表示順
    is_active = db.Column(db.Boolean, nullable=False, default=True)  # 有効フラグ
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # 作成日時
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )  # 更新日時


class ApplicationMetricMonthlyRecord(db.Model):
    # 応募指標の月次データ
    __tablename__ = "application_metric_monthly_records"

    id = db.Column(db.Integer, primary_key=True)  # レコードID
    metric_definition_id = db.Column(
        db.Integer,
        db.ForeignKey("application_metric_definitions.id"),
        nullable=False,
    )  # 指標ID（application_metric_definitions.id）
    target_month = db.Column(db.String(7), nullable=False)  # 対象月（YYYY-MM）

    # 仕様: 指標によって内訳入力の有無がある
    target_total = db.Column(db.Integer, nullable=False, default=0)  # 目標（合計）
    actual_total = db.Column(db.Integer, nullable=True)  # 実績（合計）
    actual_new_graduate = db.Column(db.Integer, nullable=True)  # 実績（新卒）
    actual_mid_career = db.Column(db.Integer, nullable=True)  # 実績（中途）

    source = db.Column(db.String(50), nullable=False, default="手入力")  # データ取得元
    memo = db.Column(db.String(300), nullable=True)  # メモ
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # 作成日時
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )  # 更新日時

    __table_args__ = (
        db.UniqueConstraint(
            "metric_definition_id",
            "target_month",
            name="uniq_application_metric_month",
        ),
    )


def validate_month(month_str):
    return isinstance(month_str, str) and MONTH_PATTERN.match(month_str)


def as_int(value, default_value=0):
    if value in (None, ""):
        return int(default_value)
    return int(value)


def ensure_seed_data():
    if ApplicationMetricDefinition.query.count() > 0:
        return

    seed_metrics = [
        ApplicationMetricDefinition(
            code="total_entries_with_scout",
            name="総エントリー数（スカウトも含む）",
            supports_breakdown=True,
            display_order=1,
        ),
        ApplicationMetricDefinition(
            code="own_entries_with_referral",
            name="自社エントリー数（社内紹介を含む）",
            supports_breakdown=True,
            display_order=2,
        ),
        ApplicationMetricDefinition(
            code="own_entries_first_interview",
            name="自社エントリー数 1次面接",
            supports_breakdown=False,
            display_order=3,
        ),
        ApplicationMetricDefinition(
            code="own_entries_second_interview",
            name="自社エントリー数 2次面接",
            supports_breakdown=False,
            display_order=4,
        ),
        ApplicationMetricDefinition(
            code="own_entries_final_interview",
            name="自社エントリー数 最終面接",
            supports_breakdown=False,
            display_order=5,
        ),
        ApplicationMetricDefinition(
            code="own_entries_offer_notice",
            name="自社エントリー数 内定通知",
            supports_breakdown=False,
            display_order=6,
        ),
        ApplicationMetricDefinition(
            code="own_entries_offer_acceptance",
            name="自社エントリー数 内定承諾",
            supports_breakdown=False,
            display_order=7,
        ),
    ]
    db.session.add_all(seed_metrics)
    db.session.commit()


def drop_legacy_tables():
    # 旧構成（KPI/採用工程/Web閲覧）のテーブルを削除して応募専用DBへ統一
    legacy_tables = [
        "metric_monthly_records",
        "metric_definitions",
        "recruitment_pipeline_records",
        "web_view_records",
    ]
    for table_name in legacy_tables:
        db.session.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
    db.session.commit()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/application-metric-definitions", methods=["GET"])
def list_application_metric_definitions():
    items = (
        ApplicationMetricDefinition.query.filter(ApplicationMetricDefinition.is_active.is_(True))
        .order_by(ApplicationMetricDefinition.display_order.asc())
        .all()
    )

    return jsonify(
        [
            {
                "id": item.id,
                "code": item.code,
                "name": item.name,
                "supports_breakdown": item.supports_breakdown,
                "display_order": item.display_order,
            }
            for item in items
        ]
    )


@app.route("/api/application-metrics", methods=["GET"])
def list_application_metrics():
    month = request.args.get("month")

    if month and not validate_month(month):
        return jsonify({"error": "month は YYYY-MM 形式で指定してください"}), 400

    query = db.session.query(ApplicationMetricMonthlyRecord, ApplicationMetricDefinition).join(
        ApplicationMetricDefinition,
        ApplicationMetricMonthlyRecord.metric_definition_id == ApplicationMetricDefinition.id,
    )

    if month:
        query = query.filter(ApplicationMetricMonthlyRecord.target_month == month)

    records = query.order_by(
        ApplicationMetricMonthlyRecord.target_month.asc(),
        ApplicationMetricDefinition.display_order.asc(),
    ).all()

    rows = []
    for monthly_record, definition in records:
        rows.append(
            {
                "id": monthly_record.id,
                "month": monthly_record.target_month,
                "target_month": monthly_record.target_month,
                "metric_definition_id": definition.id,
                "metric_code": definition.code,
                "metric_name": definition.name,
                "supports_breakdown": definition.supports_breakdown,
                "target_total": monthly_record.target_total,
                "actual_total": monthly_record.actual_total,
                "actual_new_graduate": monthly_record.actual_new_graduate,
                "actual_mid_career": monthly_record.actual_mid_career,
                "source": monthly_record.source,
                "memo": monthly_record.memo,
            }
        )

    return jsonify({"rows": rows})


@app.route("/api/application-metrics", methods=["POST"])
def upsert_application_metric():
    payload = request.get_json(silent=True) or {}

    month = payload.get("month") or payload.get("target_month")
    metric_definition_id = payload.get("metric_definition_id")
    source = payload.get("source") or "手入力"
    memo = payload.get("memo")

    if not validate_month(month):
        return jsonify({"error": "month は YYYY-MM 形式で指定してください"}), 400

    if not isinstance(metric_definition_id, int):
        return jsonify({"error": "metric_definition_id は整数で指定してください"}), 400

    definition = db.session.get(ApplicationMetricDefinition, metric_definition_id)
    if definition is None:
        return jsonify({"error": "指定された指標が存在しません"}), 404

    try:
        target_total = as_int(payload.get("target_total"), default_value=0)
        actual_total = as_int(payload.get("actual_total"), default_value=0)
        actual_new_graduate = as_int(payload.get("actual_new_graduate"), default_value=0)
        actual_mid_career = as_int(payload.get("actual_mid_career"), default_value=0)
    except (TypeError, ValueError):
        return jsonify({"error": "数値項目は整数で指定してください"}), 400

    record = ApplicationMetricMonthlyRecord.query.filter_by(
        metric_definition_id=metric_definition_id,
        target_month=month,
    ).first()

    if record is None:
        record = ApplicationMetricMonthlyRecord(
            metric_definition_id=metric_definition_id,
            target_month=month,
        )
        db.session.add(record)

    record.target_total = target_total
    if definition.supports_breakdown:
        record.actual_total = None
        record.actual_new_graduate = actual_new_graduate
        record.actual_mid_career = actual_mid_career
    else:
        record.actual_total = actual_total
        record.actual_new_graduate = None
        record.actual_mid_career = None
    record.source = source
    record.memo = memo

    db.session.commit()

    return jsonify({"message": "保存しました", "id": record.id})


with app.app_context():
    drop_legacy_tables()
    db.create_all()
    ensure_seed_data()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
