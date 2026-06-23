import json
from urllib import request

BASE = "http://localhost:5000"

def load_json(url):
    with request.urlopen(url, timeout=10) as res:
        return json.loads(res.read().decode("utf-8"))

definitions = load_json(f"{BASE}/api/application-metric-definitions")
count = 0

for month_idx in range(1, 13):
    month = f"2025-{month_idx:02d}"
    for def_idx, d in enumerate(definitions):
        target = 10 + ((month_idx * 3 + def_idx * 5) % 31)
        ratio = 0.85 + ((month_idx + def_idx) % 6) * 0.05
        actual_total = max(0, round(target * ratio))

        if d.get("supports_breakdown"):
            actual_new = round(actual_total * 0.55)
            actual_mid = actual_total - actual_new
        else:
            actual_new = actual_total
            actual_mid = 0

        payload = {
            "month": month,
            "metric_definition_id": int(d["id"]),
            "target_total": int(target),
            "actual_new_graduate": int(actual_new),
            "actual_mid_career": int(actual_mid),
            "memo": "seed_2025_sample",
        }

        req = request.Request(
            f"{BASE}/api/application-metrics",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with request.urlopen(req, timeout=10):
            count += 1

jan_rows = load_json(f"{BASE}/api/application-metrics?month=2025-01").get("rows", [])
print(f"upserted_records={count}")
print(f"definitions={len(definitions)}")
print(f"rows_for_2025_01={len(jan_rows)}")
