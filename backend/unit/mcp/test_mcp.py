import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.mcp.server import (
    mcp,
    get_dashboard,
    get_balance,
    list_criteria,
    get_verification_history,
    ask_assistant,
    verify_document,
)

EXPECTED_TOOLS = {"get_dashboard", "get_balance", "list_criteria", "get_verification_history", "ask_assistant", "verify_document"}
INVALID_KEY = "invalid-key-test"


def test_tools_registered():
    tools = mcp._tool_manager.list_tools()
    names = {t.name for t in tools}
    assert EXPECTED_TOOLS == names, f"Missing tools: {EXPECTED_TOOLS - names}"
    print(f"[PASS] All {len(tools)} tools registered: {sorted(names)}")


def test_invalid_key_errors():
    results = {
        "get_dashboard": get_dashboard(INVALID_KEY),
        "get_balance": get_balance(INVALID_KEY),
        "list_criteria": list_criteria(INVALID_KEY),
        "get_verification_history": get_verification_history(INVALID_KEY),
        "ask_assistant": ask_assistant(INVALID_KEY, "hello"),
        "verify_document": verify_document(INVALID_KEY, "/fake/path.jpg", "fake-criteria-id"),
    }
    for tool, result in results.items():
        assert result.startswith("Error:"), f"{tool} should return Error string, got: {result!r}"
        print(f"[PASS] {tool}: {result}")


if __name__ == "__main__":
    print("=== VIVAD X MCP Server Tests ===\n")
    test_tools_registered()
    print()
    test_invalid_key_errors()
    print("\n=== All tests passed ===")
