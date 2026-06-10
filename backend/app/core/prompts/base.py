import json


def _severity_marker(severity: str) -> str:
    return {"red": "🔴 CRITICAL", "orange": "🟠 IMPORTANT", "yellow": "🟡 NOTE"}.get(severity, "🟢")


def _field_type_hints(fields: list[str]) -> list[str]:
    hints = []
    date_fields = [f for f in fields if any(w in f.lower() for w in ["date", "expiry", "expire", "deployment", "payment"])]
    amount_fields = [f for f in fields if any(w in f.lower() for w in ["amount", "salary", "income", "fee", "wage"])]
    name_fields = [f for f in fields if "name" in f.lower()]

    if date_fields:
        hints.append(f"- Date fields ({', '.join(date_fields)}): extract as YYYY-MM-DD. If the document shows DD/MM/YYYY convert it.")
    if amount_fields:
        hints.append(f"- Amount fields ({', '.join(amount_fields)}): numeric string only, strip currency symbols (Rs, NPR, $).")
    if name_fields:
        hints.append(f"- Name fields ({', '.join(name_fields)}): preserve exact spelling and capitalisation as printed.")
    return hints


def build_extraction_prompt(criteria_data: dict) -> str:
    """
    Build a dynamic extraction prompt driven entirely by the criteria object.
    Works for any criteria shape — bank, manpower, insurance, custom.
    """
    name: str = criteria_data.get("name", "Document")
    category: str = criteria_data.get("category", "document")
    fields: list[str] = criteria_data.get("fields", [])
    rules: list[dict] = criteria_data.get("rules", [])

    # Map each field to its worst severity and relevant rule descriptions
    field_meta: dict[str, dict] = {}
    severity_rank = {"red": 0, "orange": 1, "yellow": 2, "green": 3}

    for rule in rules:
        affected = []
        if "field" in rule:
            affected = [rule["field"]]
        elif "fields" in rule:
            affected = rule.get("fields", [])

        for f in affected:
            if f not in field_meta:
                field_meta[f] = {"severity": "green", "hints": []}
            rule_sev = rule.get("severity", "green")
            current_sev = field_meta[f]["severity"]
            if severity_rank.get(rule_sev, 3) < severity_rank.get(current_sev, 3):
                field_meta[f]["severity"] = rule_sev
            desc = rule.get("description", "")
            if desc:
                field_meta[f]["hints"].append(desc)

    # Build annotated field list
    field_lines: list[str] = []
    for field in fields:
        meta = field_meta.get(field, {})
        sev = meta.get("severity", "green")
        hints = meta.get("hints", [])
        marker = _severity_marker(sev)
        hint_str = f"  ← {hints[0]}" if hints else ""
        field_lines.append(f"  {marker} | {field}{hint_str}")

    type_hints = _field_type_hints(fields)
    example = {f: "extracted value or null" for f in fields}

    return f"""You are a precision document OCR and verification engine for **{name}** ({category} verification) in Nepal.

Examine the document image carefully and extract every field listed below.

=== FIELDS TO EXTRACT ===
{chr(10).join(field_lines)}

=== EXTRACTION RULES ===
- Extract the EXACT text as printed. Do not interpret, infer, or guess.
- If a field is not visible, missing, or illegible: use null.
{chr(10).join(type_hints)}
- 🔴 CRITICAL fields require maximum precision — they are used for fraud detection.
- 🟠 IMPORTANT fields affect the verification score.

Return ONLY a valid JSON object with exactly these keys (no extra keys, no explanation):
{json.dumps(example, indent=2)}"""
