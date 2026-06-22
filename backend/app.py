import os
import re
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


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


class MetricDefinition(db.Model):
	# 指標マスタ（KPI/KGI の定義）
	__tablename__ = "metric_definitions"

	id = db.Column(db.Integer, primary_key=True)  # 指標ID
	code = db.Column(db.String(100), nullable=False, unique=True)  # 指標コード（システム用）
	name = db.Column(db.String(100), nullable=False)  # 指標名（表示用）
	kind = db.Column(db.String(10), nullable=False)  # 指標区分（KPI / KGI）
	unit = db.Column(db.String(20), nullable=False)  # 単位（PV, UU, 件 など）
	display_order = db.Column(db.Integer, nullable=False, default=0)  # 表示順
	is_active = db.Column(db.Boolean, nullable=False, default=True)  # 有効フラグ
	created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	updated_at = db.Column(
		db.DateTime,
		nullable=False,
		default=datetime.utcnow,
		onupdate=datetime.utcnow,
	)


class MetricMonthlyRecord(db.Model):
	# 指標の月次データ（実績値・目標値）
	__tablename__ = "metric_monthly_records"

	id = db.Column(db.Integer, primary_key=True)  # レコードID
	metric_definition_id = db.Column(
		db.Integer,
		db.ForeignKey("metric_definitions.id"),
		nullable=False,
	)  # 指標ID（metric_definitions.id）
	target_month = db.Column(db.String(7), nullable=False)  # 対象月（YYYY-MM）
	actual_value = db.Column(db.Float, nullable=False)  # 実績値
	target_value = db.Column(db.Float, nullable=False)  # 目標値
	source = db.Column(db.String(50), nullable=False, default="手入力")  # データ取得元
	memo = db.Column(db.String(300), nullable=True)  # メモ
	created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	updated_at = db.Column(
		db.DateTime,
		nullable=False,
		default=datetime.utcnow,
		onupdate=datetime.utcnow,
	)

	__table_args__ = (
		db.UniqueConstraint(
			"metric_definition_id",
			"target_month",
			name="uniq_metric_definition_month",
		),
	)


class RecruitmentPipelineRecord(db.Model):
	# 採用工程の月次データ
	__tablename__ = "recruitment_pipeline_records"

	id = db.Column(db.Integer, primary_key=True)  # レコードID
	target_month = db.Column(db.String(7), nullable=False)  # 対象月（YYYY-MM）
	department = db.Column(db.String(100), nullable=False)  # 部署
	position = db.Column(db.String(100), nullable=False)  # 職種
	planned_hires = db.Column(db.Integer, nullable=False, default=0)  # 採用計画人数
	applicants = db.Column(db.Integer, nullable=False, default=0)  # 応募者数
	document_pass = db.Column(db.Integer, nullable=False, default=0)  # 書類通過数
	first_interview_pass = db.Column(db.Integer, nullable=False, default=0)  # 一次面接通過数
	final_interview_pass = db.Column(db.Integer, nullable=False, default=0)  # 最終面接通過数
	offers = db.Column(db.Integer, nullable=False, default=0)  # 内定数
	hires = db.Column(db.Integer, nullable=False, default=0)  # 採用数
	source = db.Column(db.String(50), nullable=False, default="手入力")  # データ取得元
	memo = db.Column(db.String(300), nullable=True)  # メモ
	created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	updated_at = db.Column(
		db.DateTime,
		nullable=False,
		default=datetime.utcnow,
		onupdate=datetime.utcnow,
	)


class WebViewRecord(db.Model):
	# サイト閲覧の月次データ
	__tablename__ = "web_view_records"

	id = db.Column(db.Integer, primary_key=True)  # レコードID
	target_month = db.Column(db.String(7), nullable=False)  # 対象月（YYYY-MM）
	site_name = db.Column(db.String(100), nullable=False)  # サイト名
	site_category = db.Column(db.String(30), nullable=False)  # サイト区分（website / entry_site）
	page_views = db.Column(db.Integer, nullable=False, default=0)  # PV
	unique_users = db.Column(db.Integer, nullable=False, default=0)  # UU
	entry_page_views = db.Column(db.Integer, nullable=False, default=0)  # 応募ページ閲覧数
	source = db.Column(db.String(50), nullable=False, default="手入力")  # データ取得元
	memo = db.Column(db.String(300), nullable=True)  # メモ
	created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	updated_at = db.Column(
		db.DateTime,
		nullable=False,
		default=datetime.utcnow,
		onupdate=datetime.utcnow,
	)


def calc_achievement_rate(actual, target):
	# 達成率(%) = 実績値 / 目標値 * 100
	if target in (None, 0):
		return None
	return round((actual / target) * 100, 1)


def validate_month(month_str):
	return isinstance(month_str, str) and MONTH_PATTERN.match(month_str)


def as_int(value, default_value=0):
	if value in (None, ""):
		return int(default_value)
	return int(value)


def as_float(value):
	return float(value)


def get_payload_value(payload, *keys, default=None):
	for key in keys:
		if key in payload and payload.get(key) is not None:
			return payload.get(key)
	return default


def ensure_metric_seed_data():
	if MetricDefinition.query.count() > 0:
		return

	seed_metrics = [
		MetricDefinition(code="page_views", name="公式サイト閲覧数", kind="KPI", unit="PV", display_order=1),
		MetricDefinition(code="unique_users", name="UU数", kind="KPI", unit="UU", display_order=2),
		MetricDefinition(code="entries", name="エントリー数", kind="KPI", unit="件", display_order=3),
		MetricDefinition(code="hiring_goal", name="採用目標達成数", kind="KGI", unit="人", display_order=4),
	]
	db.session.add_all(seed_metrics)
	db.session.commit()


@app.route("/api/health", methods=["GET"])
def health():
	return jsonify({"status": "ok"})


@app.route("/api/metric-definitions", methods=["GET"])
def list_metric_definitions():
	kind = request.args.get("kind")
	query = MetricDefinition.query.filter(MetricDefinition.is_active.is_(True))
	if kind:
		query = query.filter(MetricDefinition.kind == kind)

	items = query.order_by(MetricDefinition.display_order.asc()).all()
	return jsonify(
		[
			{
				"id": item.id,
				"code": item.code,
				"name": item.name,
				"kind": item.kind,
				"unit": item.unit,
				"display_order": item.display_order,
			}
			for item in items
		]
	)


@app.route("/api/metric-definitions", methods=["POST"])
def create_metric_definition():
	payload = request.get_json(silent=True) or {}
	code = get_payload_value(payload, "code")
	name = get_payload_value(payload, "name")
	kind = get_payload_value(payload, "kind", "metric_type")
	unit = get_payload_value(payload, "unit")
	display_order = get_payload_value(payload, "display_order", "sort_order", default=0)

	if not code or not name or not unit:
		return jsonify({"error": "code, name, unit は必須です"}), 400

	if kind not in ("KPI", "KGI"):
		return jsonify({"error": "kind は KPI または KGI を指定してください"}), 400

	if MetricDefinition.query.filter_by(code=code).first() is not None:
		return jsonify({"error": "code が重複しています"}), 400

	record = MetricDefinition(
		code=code,
		name=name,
		kind=kind,
		unit=unit,
		display_order=as_int(display_order),
	)

	db.session.add(record)
	db.session.commit()

	return jsonify({"message": "保存しました", "id": record.id}), 201


@app.route("/api/metrics", methods=["GET"])
def list_metrics():
	month = request.args.get("month")
	kind = request.args.get("kind")

	if month and not validate_month(month):
		return jsonify({"error": "month は YYYY-MM 形式で指定してください"}), 400

	query = db.session.query(MetricMonthlyRecord, MetricDefinition).join(
		MetricDefinition,
		MetricMonthlyRecord.metric_definition_id == MetricDefinition.id,
	)

	if month:
		query = query.filter(MetricMonthlyRecord.target_month == month)
	if kind:
		query = query.filter(MetricDefinition.kind == kind)

	records = query.order_by(
		MetricMonthlyRecord.target_month.desc(),
		MetricDefinition.display_order.asc(),
	).all()

	rows = []
	for metric_record, metric_definition in records:
		rows.append(
			{
				"id": metric_record.id,  # レコードID
				"month": metric_record.target_month,  # 対象月（legacy key）
				"target_month": metric_record.target_month,  # 対象月
				"metric_definition_id": metric_definition.id,  # 指標ID
				"metric_id": metric_definition.id,  # 指標ID（読みやすいキー）
				"metric_code": metric_definition.code,  # 指標コード
				"metric_name": metric_definition.name,  # 指標名
				"kind": metric_definition.kind,  # 指標区分（KPI/KGI, legacy key）
				"metric_type": metric_definition.kind,  # 指標区分（KPI/KGI）
				"unit": metric_definition.unit,  # 単位
				"actual_value": metric_record.actual_value,  # 実績値
				"actual_amount": metric_record.actual_value,  # 実績値（読みやすいキー）
				"target_value": metric_record.target_value,  # 目標値
				"target_amount": metric_record.target_value,  # 目標値（読みやすいキー）
				"achievement_rate": calc_achievement_rate(metric_record.actual_value, metric_record.target_value),  # 達成率
				"source": metric_record.source,  # データ取得元（legacy key）
				"data_source": metric_record.source,  # データ取得元
				"memo": metric_record.memo,  # メモ（legacy key）
				"note": metric_record.memo,  # メモ
			}
		)

	return jsonify({"rows": rows})


@app.route("/api/metrics", methods=["POST"])
def upsert_metric():
	payload = request.get_json(silent=True) or {}

	month = get_payload_value(payload, "month", "target_month")
	metric_definition_id = get_payload_value(payload, "metric_definition_id", "metric_id")
	actual_value = get_payload_value(payload, "actual_value", "actual_amount")
	target_value = get_payload_value(payload, "target_value", "target_amount")
	source = get_payload_value(payload, "source", "data_source", default="手入力")
	memo = get_payload_value(payload, "memo", "note")

	if not validate_month(month):
		return jsonify({"error": "month は YYYY-MM 形式で指定してください"}), 400

	if not isinstance(metric_definition_id, int):
		return jsonify({"error": "metric_definition_id は整数で指定してください"}), 400

	try:
		actual_value = as_float(actual_value)
		target_value = as_float(target_value)
	except (TypeError, ValueError):
		return jsonify({"error": "actual_value と target_value は数値で指定してください"}), 400

	metric_definition = db.session.get(MetricDefinition, metric_definition_id)
	if metric_definition is None:
		return jsonify({"error": "指定された指標が存在しません"}), 404

	record = MetricMonthlyRecord.query.filter_by(
		metric_definition_id=metric_definition_id,
		target_month=month,
	).first()

	if record is None:
		record = MetricMonthlyRecord(
			metric_definition_id=metric_definition_id,
			target_month=month,
			actual_value=actual_value,
			target_value=target_value,
			source=source,
			memo=memo,
		)
		db.session.add(record)
	else:
		record.actual_value = actual_value
		record.target_value = target_value
		record.source = source
		record.memo = memo

	db.session.commit()

	return jsonify({"message": "保存しました"})


@app.route("/api/recruitment-pipeline", methods=["GET"])
def list_recruitment_pipeline():
	month = request.args.get("month")

	query = RecruitmentPipelineRecord.query
	if month:
		if not validate_month(month):
			return jsonify({"error": "month は YYYY-MM 形式で指定してください"}), 400
		query = query.filter(RecruitmentPipelineRecord.target_month == month)

	records = query.order_by(
		RecruitmentPipelineRecord.target_month.desc(),
		RecruitmentPipelineRecord.id.desc(),
	).all()

	return jsonify(
		{
			"rows": [
				{
					"id": record.id,
					"month": record.target_month,  # legacy key
					"target_month": record.target_month,
					"department": record.department,
					"position": record.position,
					"planned_hires": record.planned_hires,  # legacy key
					"planned_hire_count": record.planned_hires,
					"applicants": record.applicants,  # legacy key
					"applicants_count": record.applicants,
					"document_pass": record.document_pass,  # legacy key
					"document_passed_count": record.document_pass,
					"first_interview_pass": record.first_interview_pass,  # legacy key
					"first_interview_passed_count": record.first_interview_pass,
					"final_interview_pass": record.final_interview_pass,  # legacy key
					"final_interview_passed_count": record.final_interview_pass,
					"offers": record.offers,  # legacy key
					"offers_count": record.offers,
					"hires": record.hires,  # legacy key
					"hired_count": record.hires,
					"source": record.source,  # legacy key
					"data_source": record.source,
					"memo": record.memo,  # legacy key
					"note": record.memo,
				}
				for record in records
			]
		}
	)


@app.route("/api/recruitment-pipeline", methods=["POST"])
def create_recruitment_pipeline():
	payload = request.get_json(silent=True) or {}

	month = get_payload_value(payload, "month", "target_month")
	department = get_payload_value(payload, "department")
	position = get_payload_value(payload, "position")
	source = get_payload_value(payload, "source", "data_source", default="手入力")
	memo = get_payload_value(payload, "memo", "note")

	if not validate_month(month):
		return jsonify({"error": "month は YYYY-MM 形式で指定してください"}), 400

	if not department or not position:
		return jsonify({"error": "department と position は必須です"}), 400

	try:
		record = RecruitmentPipelineRecord(
			target_month=month,
			department=department,
			position=position,
			planned_hires=as_int(get_payload_value(payload, "planned_hires", "planned_hire_count", default=0)),
			applicants=as_int(get_payload_value(payload, "applicants", "applicants_count", default=0)),
			document_pass=as_int(get_payload_value(payload, "document_pass", "document_passed_count", default=0)),
			first_interview_pass=as_int(get_payload_value(payload, "first_interview_pass", "first_interview_passed_count", default=0)),
			final_interview_pass=as_int(get_payload_value(payload, "final_interview_pass", "final_interview_passed_count", default=0)),
			offers=as_int(get_payload_value(payload, "offers", "offers_count", default=0)),
			hires=as_int(get_payload_value(payload, "hires", "hired_count", default=0)),
			source=source,
			memo=memo,
		)
	except (TypeError, ValueError):
		return jsonify({"error": "人数項目は整数で指定してください"}), 400

	db.session.add(record)
	db.session.commit()

	return jsonify({"message": "保存しました", "id": record.id}), 201


@app.route("/api/web-views", methods=["GET"])
def list_web_views():
	month = request.args.get("month")

	query = WebViewRecord.query
	if month:
		if not validate_month(month):
			return jsonify({"error": "month は YYYY-MM 形式で指定してください"}), 400
		query = query.filter(WebViewRecord.target_month == month)

	records = query.order_by(
		WebViewRecord.target_month.desc(),
		WebViewRecord.id.desc(),
	).all()

	return jsonify(
		{
			"rows": [
				{
					"id": record.id,
					"month": record.target_month,  # legacy key
					"target_month": record.target_month,
					"site_name": record.site_name,
					"site_category": record.site_category,  # legacy key
					"site_type": record.site_category,
					"page_views": record.page_views,  # legacy key
					"page_view_count": record.page_views,
					"unique_users": record.unique_users,  # legacy key
					"unique_user_count": record.unique_users,
					"entry_page_views": record.entry_page_views,  # legacy key
					"entry_page_view_count": record.entry_page_views,
					"source": record.source,  # legacy key
					"data_source": record.source,
					"memo": record.memo,  # legacy key
					"note": record.memo,
				}
				for record in records
			]
		}
	)


@app.route("/api/web-views", methods=["POST"])
def create_web_view():
	payload = request.get_json(silent=True) or {}

	month = get_payload_value(payload, "month", "target_month")
	site_name = get_payload_value(payload, "site_name")
	site_category = get_payload_value(payload, "site_category", "site_type")
	source = get_payload_value(payload, "source", "data_source", default="手入力")
	memo = get_payload_value(payload, "memo", "note")

	if not validate_month(month):
		return jsonify({"error": "month は YYYY-MM 形式で指定してください"}), 400

	if not site_name:
		return jsonify({"error": "site_name は必須です"}), 400

	if site_category not in ("website", "entry_site"):
		return jsonify({"error": "site_category は website または entry_site を指定してください"}), 400

	try:
		record = WebViewRecord(
			target_month=month,
			site_name=site_name,
			site_category=site_category,
			page_views=as_int(get_payload_value(payload, "page_views", "page_view_count", default=0)),
			unique_users=as_int(get_payload_value(payload, "unique_users", "unique_user_count", default=0)),
			entry_page_views=as_int(get_payload_value(payload, "entry_page_views", "entry_page_view_count", default=0)),
			source=source,
			memo=memo,
		)
	except (TypeError, ValueError):
		return jsonify({"error": "閲覧数項目は整数で指定してください"}), 400

	db.session.add(record)
	db.session.commit()

	return jsonify({"message": "保存しました", "id": record.id}), 201


with app.app_context():
	db.create_all()
	ensure_metric_seed_data()


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=5000, debug=True)
