import sys
import os
import json
import uuid
import re
from typing import TypedDict, List, Dict, Any, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langgraph.graph import StateGraph, END
from crewai import Crew

from agents.fingerprint_agent import fingerprint_agent, hash_task
from agents.verdict_agent import verdict_agent, verdict_task
from utils.chroma_search import chroma_search
from utils.chroma_store import save_artifact

# ==========================================
# State Definition
# ==========================================
class GraphState(TypedDict):
    image_url: str
    fingerprint: Optional[str]
    matches: Optional[List[Dict[str, Any]]]
    score: Optional[float]
    verdict: Optional[str]

# ==========================================
# Nodes
# ==========================================
def fingerprint_node(state: GraphState):
    print("\n[Node 1: Fingerprint] Generating perceptual hash...")
    crew = Crew(agents=[fingerprint_agent], tasks=[hash_task], verbose=False)
    result = crew.kickoff(inputs={"image_url": state["image_url"]})
    hash_val = str(result).strip()
    save_artifact(
        artifact_id=f"fingerprint_{uuid.uuid4().hex[:8]}",
        content=hash_val,
        metadata={"type": "agent_output", "agent": "fingerprint_agent"}
    )
    return {"fingerprint": hash_val}


def search_node(state: GraphState):
    print("\n[Node 2: Search] Performing Chroma DB search...")
    fingerprint = state["fingerprint"]
    matches = chroma_search(fingerprint)
    save_artifact(
        artifact_id=f"search_{uuid.uuid4().hex[:8]}",
        content=json.dumps(matches),
        metadata={"type": "tool_output", "tool": "chroma_search"}
    )
    return {"matches": matches}


def verdict_node(state: GraphState):
    print("\n[Node 3: Verdict] Analyzing similarity matches...")
    matches_json = json.dumps(state["matches"])
    crew = Crew(agents=[verdict_agent], tasks=[verdict_task], verbose=False)
    result = crew.kickoff(inputs={"matches": matches_json})
    save_artifact(
        artifact_id=f"verdict_{uuid.uuid4().hex[:8]}",
        content=str(result).strip(),
        metadata={"type": "agent_output", "agent": "verdict_agent"}
    )

    result_str = str(result).strip()
    score = 0.0
    verdict = "Could not parse verdict"

    # Try to parse as JSON first (the agent returns JSON like {"score": 1.0, "verdict": "..."})
    try:
        # Strip markdown code fences if present
        cleaned = re.sub(r'^```(?:json)?\s*', '', result_str, flags=re.MULTILINE)
        cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
        cleaned = cleaned.strip()
        parsed = json.loads(cleaned)
        score = float(parsed.get("score", 0.0))
        verdict = str(parsed.get("verdict", "Unknown"))
    except (json.JSONDecodeError, ValueError):
        # Regex fallback: extract score and verdict from malformed JSON
        score_match = re.search(r'"score"\s*:\s*([0-9.]+)', result_str)
        verdict_match = re.search(r'"verdict"\s*:\s*"([^"]+)"', result_str)
        if score_match:
            try:
                score = float(score_match.group(1))
            except ValueError:
                pass
        if verdict_match:
            verdict = verdict_match.group(1)
        else:
            # Final fallback: look for plain-text "Score:" / "Verdict:" lines
            for line in result_str.split("\n"):
                if line.startswith("Score:"):
                    try:
                        score = float(line.replace("Score:", "").strip())
                    except ValueError:
                        pass
                elif line.startswith("Verdict:"):
                    verdict = line.replace("Verdict:", "").strip()

    return {"score": score, "verdict": verdict}


# ==========================================
# Exposed wrapper — graph built on first call
# ==========================================
_compiled_app = None

def run_pipeline(image_url: str) -> dict:
    global _compiled_app

    # Build and compile the graph only once, on first request
    if _compiled_app is None:
        workflow = StateGraph(GraphState)
        workflow.add_node("fingerprint", fingerprint_node)
        workflow.add_node("search", search_node)
        workflow.add_node("verdict", verdict_node)
        workflow.set_entry_point("fingerprint")
        workflow.add_edge("fingerprint", "search")
        workflow.add_edge("search", "verdict")
        workflow.add_edge("verdict", END)
        _compiled_app = workflow.compile()

    initial_state = {
        "image_url": image_url,
        "fingerprint": None,
        "matches": None,
        "score": None,
        "verdict": None
    }

    return _compiled_app.invoke(initial_state)


if __name__ == "__main__":
    test_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png"
    print("=" * 50)
    print("   Starting Digital Sports Media Protection Flow  ")
    print("=" * 50)
    final_result = run_pipeline(test_url)
    print("\n================ FINAL PIPELINE STATE ================")
    print(json.dumps(final_result, indent=2))