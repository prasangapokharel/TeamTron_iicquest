import json


def build_extraction_prompt(fields: list[str], category: str) -> str:
    example = {f: "extracted value or null" for f in fields}
    return f"""You are an expert document analysis system for {category} verification in Nepal.

Carefully examine this document image and extract the following fields.

Fields to extract:
{chr(10).join(f"- {f}" for f in fields)}

Rules:
- Extract the exact text as written. Do not interpret, translate, or guess.
- For dates: use YYYY-MM-DD format if possible.
- For amounts/salaries: return numeric string only, without currency symbol.
- For names: preserve exact spelling and capitalisation.
- If a field is not visible, unclear, or absent: use null.

Return ONLY a valid JSON object with exactly these keys:
{json.dumps(example, indent=2)}"""
