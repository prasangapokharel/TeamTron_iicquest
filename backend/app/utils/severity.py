from datetime import date, datetime
from typing import Any

GREEN = "green"
YELLOW = "yellow"
ORANGE = "orange"
RED = "red"

WEIGHTS: dict[str, int] = {
    GREEN: 100,
    YELLOW: 75,
    ORANGE: 50,
    RED: 0,
}

CRITICAL_SEVERITIES = {RED, ORANGE}


def is_critical(severity: str) -> bool:
    return severity in CRITICAL_SEVERITIES


def weight(severity: str) -> int:
    return WEIGHTS.get(severity, 50)


def compute_risk_score(flags: list[dict]) -> int:
    if not flags:
        return 0
    total = sum(weight(f.get("severity", ORANGE)) for f in flags)
    return round(total / len(flags))


def get_verdict(score: int) -> str:
    if score >= 80:
        return GREEN
    if score >= 50:
        return ORANGE
    return RED


def _apply_rule(rule: dict, fields: dict[str, Any], conflicts: dict[str, list]) -> dict | None:
    check = rule.get("check")
    severity = rule.get("severity", ORANGE)

    if check == "cross_match":
        field = rule.get("field", "")
        if field in conflicts:
            return {
                "field": field,
                "severity": severity,
                "value": str(fields.get(field, "")),
                "issue": f"{field} mismatch across documents: {conflicts[field]}",
                "is_critical": is_critical(severity),
            }

    elif check == "not_expired":
        field = rule.get("field", "")
        val = fields.get(field)
        if val:
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
                try:
                    expiry = datetime.strptime(str(val), fmt).date()
                    if expiry < date.today():
                        return {
                            "field": field,
                            "severity": RED,
                            "value": str(val),
                            "issue": f"{field} is expired (expired: {val})",
                            "is_critical": True,
                        }
                    break
                except ValueError:
                    continue

    elif check == "min_threshold":
        field = rule.get("field", "")
        threshold = rule.get("threshold", 0)
        val = fields.get(field)
        if val is not None:
            try:
                numeric = float(str(val).replace(",", "").replace("Rs", "").strip())
                if numeric < threshold:
                    return {
                        "field": field,
                        "severity": severity,
                        "value": str(val),
                        "issue": f"{field} ({val}) is below minimum threshold ({threshold})",
                        "is_critical": is_critical(severity),
                    }
            except ValueError:
                pass

    elif check == "date_logic":
        field_pair = rule.get("fields", [])
        if len(field_pair) >= 2:
            d1_val = fields.get(field_pair[0])
            d2_val = fields.get(field_pair[1])
            if d1_val and d2_val:
                for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
                    try:
                        d1 = datetime.strptime(str(d1_val), fmt).date()
                        d2 = datetime.strptime(str(d2_val), fmt).date()
                        if d1 > d2:
                            return {
                                "field": " / ".join(field_pair),
                                "severity": severity,
                                "value": f"{d1_val} / {d2_val}",
                                "issue": f"{field_pair[0]} ({d1_val}) is after {field_pair[1]} ({d2_val}) — impossible dates",
                                "is_critical": is_critical(severity),
                            }
                        break
                    except ValueError:
                        continue

    return None


def build_flags(fields: dict[str, Any], conflicts: dict[str, list], rules: list[dict]) -> list[dict]:
    flagged: dict[str, dict] = {}

    for rule in rules:
        flag = _apply_rule(rule, fields, conflicts)
        if not flag:
            continue
        key = flag["field"]
        existing = flagged.get(key)
        if existing is None or weight(existing["severity"]) > weight(flag["severity"]):
            flagged[key] = flag

    flags = list(flagged.values())
    flagged_fields = {f["field"] for f in flags}

    for field, value in fields.items():
        if field not in flagged_fields and value is not None:
            flags.append({
                "field": field,
                "severity": GREEN,
                "value": str(value),
                "issue": None,
                "is_critical": False,
            })

    return flags
