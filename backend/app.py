import os
import re

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "kpi.db")

os.makedirs(DATA_DIR, exist_ok=True)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# React/Vite から Flask API へアクセスするための CORS 設定
CORS(
    app,
    resources={
        r"/api/.*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

db = SQLAlchemy(app)

MONTH_PATTERN = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


class ApplicationMetricDefinition(db.Model):
    # 応募指標マスタ
    __tablename__ = "application_metric_definitions"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(100), nullable=False, unique=True)
    name = db.Column(db.String(200), nullable=False)
    supports_breakdown = db.Column(db.Boolean, nullable=False, default=False)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)


class ApplicationMetricMonthlyRecord(db.Model):
    # 応募指標の月次データ
    __tablename__ = "application_metric_monthly_records"

    id = db.Column(db.Integer, primary_key=True)
    metric_definition_id = db.Column(
        db.Integer,
        db.ForeignKey("application_metric_definitions.id"),
        nullable=False,
    )
    target_month = db.Column(db.String(7), nullable=False)
    target_total = db.Column(db.Integer, nullable=False, default=0)
    actual_new_graduate = db.Column(db.Integer, nullable=True)
    actual_mid_career = db.Column(db.Integer, nullable=True)
    memo = db.Column(db.String(300), nullable=True)

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
    # 旧構成（KPI/採用工程/Web閲覧）のテーブルを削除
    legacy_tables = [
        "metric_monthly_records",
        "metric_definitions",
        "recruitment_pipeline_records",
        "web_view_records",
    ]

    for table_name in legacy_tables:
        db.session.execute(text(f"DROP TABLE IF EXISTS {table_name}"))

    db.session.commit()


def migrate_application_metric_definitions_table():
    """
    application_metric_definitions から created_at / updated_at を削除する。
    SQLiteでは列削除が難しいため、再作成して差し替える。
    """
    table_name = "application_metric_definitions"

    table_exists = db.session.execute(
        text("SELECT name FROM sqlite_master WHERE type='table' AND name=:table_name"),
        {"table_name": table_name},
    ).first()

    if not table_exists:
        return

    existing_columns = {
        row[1]
        for row in db.session.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
    }

    if "created_at" not in existing_columns and "updated_at" not in existing_columns:
        return

    db.session.execute(text("DROP TABLE IF EXISTS application_metric_definitions_new"))

    db.session.execute(
        text(
            """
            CREATE TABLE application_metric_definitions_new (
                id INTEGER PRIMARY KEY,
                code VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(200) NOT NULL,
                supports_breakdown BOOLEAN NOT NULL DEFAULT 0,
                display_order INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT 1
            )
            """
        )
    )

    db.session.execute(
        text(
            """
            INSERT INTO application_metric_definitions_new (
                id,
                code,
                name,
                supports_breakdown,
                display_order,
                is_active
            )
            SELECT
                id,
                code,
                name,
                supports_breakdown,
                display_order,
                is_active
            FROM application_metric_definitions
            """
        )
    )

    db.session.execute(text("DROP TABLE application_metric_definitions"))
    db.session.execute(
        text(
            "ALTER TABLE application_metric_definitions_new "
            "RENAME TO application_metric_definitions"
        )
    )

    db.session.commit()


def migrate_application_metric_monthly_records_table():
    """
    application_metric_monthly_records から以下を削除する：
    - created_at
    - updated_at
    - actual_total
    - source
    """
    table_name = "application_metric_monthly_records"

    table_exists = db.session.execute(
        text("SELECT name FROM sqlite_master WHERE type='table' AND name=:table_name"),
        {"table_name": table_name},
    ).first()

    if not table_exists:
        return

    existing_columns = {
        row[1]
        for row in db.session.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
    }

    removable_columns = {"created_at", "updated_at", "actual_total", "source"}

    if existing_columns.isdisjoint(removable_columns):
        return

    db.session.execute(text("DROP TABLE IF EXISTS application_metric_monthly_records_new"))

    db.session.execute(
        text(
            """
            CREATE TABLE application_metric_monthly_records_new (
                id INTEGER PRIMARY KEY,
                metric_definition_id INTEGER NOT NULL,
                target_month VARCHAR(7) NOT NULL,
                target_total INTEGER NOT NULL DEFAULT 0,
                actual_new_graduate INTEGER,
                actual_mid_career INTEGER,
                memo VARCHAR(300),
                CONSTRAINT uniq_application_metric_month
                    UNIQUE (metric_definition_id, target_month),
                FOREIGN KEY(metric_definition_id)
                    REFERENCES application_metric_definitions (id)
            )
            """
        )
    )

    select_target_total = "target_total" if "target_total" in existing_columns else "0"

    select_actual_new_graduate = (
        "actual_new_graduate" if "actual_new_graduate" in existing_columns else "NULL"
    )

    select_actual_mid_career = (
        "actual_mid_career" if "actual_mid_career" in existing_columns else "NULL"
    )

    select_memo = "memo" if "memo" in existing_columns else "NULL"

    db.session.execute(
        text(
            f"""
            INSERT INTO application_metric_monthly_records_new (
                id,
                metric_definition_id,
                target_month,
                target_total,
                actual_new_graduate,
                actual_mid_career,
                memo
            )
            SELECT
                id,
                metric_definition_id,
                target_month,
                {select_target_total},
                {select_actual_new_graduate},
                {select_actual_mid_career},
                {select_memo}
            FROM application_metric_monthly_records
            """
        )
    )

    db.session.execute(text("DROP TABLE application_metric_monthly_records"))
    db.session.execute(
        text(
            "ALTER TABLE application_metric_monthly_records_new "
            "RENAME TO application_metric_monthly_records"
        )
    )

    db.session.commit()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/application-metric-definitions", methods=["GET"])
def list_application_metric_definitions():
    items = (
        ApplicationMetricDefinition.query.filter(
            ApplicationMetricDefinition.is_active.is_(True)
        )
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

    query = db.session.query(
        ApplicationMetricMonthlyRecord,
        ApplicationMetricDefinition,
    ).join(
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
                "actual_new_graduate": monthly_record.actual_new_graduate,
                "actual_mid_career": monthly_record.actual_mid_career,
                "memo": monthly_record.memo,
            }
        )

    return jsonify({"rows": rows})


@app.route("/api/application-metrics", methods=["POST"])
def upsert_application_metric():
    """
    既存仕様を維持して upsert のままにする。
    """
    payload = request.get_json(silent=True) or {}

    month = payload.get("month") or payload.get("target_month")
    metric_definition_id = payload.get("metric_definition_id")
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
        actual_new_graduate = as_int(payload.get("actual_new_graduate"), default_value=0)
        actual_mid_career = as_int(payload.get("actual_mid_career"), default_value=0)

        # 旧クライアント互換
        if (
            not definition.supports_breakdown
            and payload.get("actual_total") is not None
            and payload.get("actual_new_graduate") in (None, "")
            and payload.get("actual_mid_career") in (None, "")
        ):
            actual_new_graduate = as_int(payload.get("actual_total"), default_value=0)
            actual_mid_career = 0

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
    record.actual_new_graduate = actual_new_graduate
    record.actual_mid_career = actual_mid_career
    record.memo = memo

    db.session.commit()

    return jsonify({"message": "保存しました", "id": record.id})


@app.route("/api/application-metrics/<int:record_id>", methods=["PUT"])
def update_application_metric(record_id):
    """
    月次データレコードを更新する。

    更新対象:
    - target_month
    - target_total
    - actual_new_graduate
    - actual_mid_career
    - memo
    """
    record = db.session.get(ApplicationMetricMonthlyRecord, record_id)

    if record is None:
        return jsonify({"error": "指定された月次データが存在しません"}), 404

    payload = request.get_json(silent=True) or {}

    new_target_month = payload.get("target_month", record.target_month)
    new_memo = payload.get("memo", record.memo)

    if not validate_month(new_target_month):
        return jsonify({"error": "target_month は YYYY-MM 形式で指定してください"}), 400

    duplicate = ApplicationMetricMonthlyRecord.query.filter(
        ApplicationMetricMonthlyRecord.metric_definition_id == record.metric_definition_id,
        ApplicationMetricMonthlyRecord.target_month == new_target_month,
        ApplicationMetricMonthlyRecord.id != record.id,
    ).first()

    if duplicate is not None:
        return jsonify(
            {
                "error": "同じ月のデータが既に存在します。同じ月のデータを削除してください"
            }
        ), 409

    definition = db.session.get(ApplicationMetricDefinition, record.metric_definition_id)

    if definition is None:
        return jsonify({"error": "紐づく指標定義が存在しません"}), 404

    try:
        new_target_total = as_int(
            payload.get("target_total", record.target_total),
            default_value=0,
        )

        new_actual_new_graduate = as_int(
            payload.get("actual_new_graduate", record.actual_new_graduate),
            default_value=0,
        )

        new_actual_mid_career = as_int(
            payload.get("actual_mid_career", record.actual_mid_career),
            default_value=0,
        )

        # 旧クライアント互換
        if (
            not definition.supports_breakdown
            and payload.get("actual_total") is not None
            and payload.get("actual_new_graduate") in (None, "")
            and payload.get("actual_mid_career") in (None, "")
        ):
            new_actual_new_graduate = as_int(payload.get("actual_total"), default_value=0)
            new_actual_mid_career = 0

    except (TypeError, ValueError):
        return jsonify({"error": "数値項目は整数で指定してください"}), 400

    record.target_month = new_target_month
    record.target_total = new_target_total
    record.actual_new_graduate = new_actual_new_graduate
    record.actual_mid_career = new_actual_mid_career
    record.memo = new_memo

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()

        return jsonify(
            {
                "error": "同じ月のデータが既に存在します。同じ月のデータを削除してください"
            }
        ), 409

    return jsonify({"message": "更新しました", "id": record.id})


@app.route("/api/application-metrics/<int:record_id>", methods=["DELETE"])
def delete_application_metric(record_id):
    """
    月次データレコードを削除する。
    """
    record = db.session.get(ApplicationMetricMonthlyRecord, record_id)

    if record is None:
        return jsonify({"error": "指定された月次データが存在しません"}), 404

    db.session.delete(record)
    db.session.commit()

    return jsonify({"message": "削除しました", "id": record_id})


@app.route("/api/application-metrics/<int:record_id>", methods=["OPTIONS"])
def application_metric_item_options(record_id):
    # ブラウザのDELETE前プリフライトを明示的に許可
    return ("", 204)


with app.app_context():
    drop_legacy_tables()
    db.create_all()
    migrate_application_metric_definitions_table()
    migrate_application_metric_monthly_records_table()
    ensure_seed_data()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
