import sys
import os
import json
from typing import TypedDict, List, Dict, Any, Optional

# Ensure the root project directory is in the path to allow imports when running directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langgraph.graph import StateGraph, END
from crewai import Crew

# Import local modules
from agents.fingerprint_agent import fingerprint_agent, hash_task
from agents.verdict_agent import verdict_agent, verdict_task
from utils.mock_search import mock_search

# Define the state for the LangGraph
class GraphState(TypedDict):
    image_url: str
    fingerprint: Optional[str]
    matches: Optional[List[Dict[str, Any]]]
    score: Optional[float]
    verdict: Optional[str]

# ==========================================
# Nodes Definition
# ==========================================
def fingerprint_node(state: GraphState):
    print("\n[Node 1: Fingerprint] Generating perceptual hash...")
    crew = Crew(
        agents=[fingerprint_agent],
        tasks=[hash_task],
        verbose=False
    )
    result = crew.kickoff(inputs={"image_url": state["image_url"]})
    return {"fingerprint": str(result).strip()}

def search_node(state: GraphState):
    print("\n[Node 2: Search] Simulating database search...")
    fingerprint = state["fingerprint"]
    # Call the mock_search utility
    matches = mock_search(fingerprint)
    return {"matches": matches}

def verdict_node(state: GraphState):
    print("\n[Node 3: Verdict] Analyzing similarity matches...")
    # Convert matches list to a JSON string for the CrewAI task
    matches_json = json.dumps(state["matches"])
    
    crew = Crew(
        agents=[verdict_agent],
        tasks=[verdict_task],
        verbose=False
    )
    result = crew.kickoff(inputs={"matches": matches_json})
    
    # The verdict agent returns a cleanly formatted multi-line string:
    # "Score: X.X\nVerdict: YYY"
    # We parse this back out for the structured graph state.
    result_str = str(result)
    score = 0.0
    verdict = "Could not parse verdict"
    
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
# Graph Construction
# ==========================================
# Initialize the state graph
workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("fingerprint", fingerprint_node)
workflow.add_node("search", search_node)
workflow.add_node("verdict", verdict_node)

# Define edges (the workflow logic)
workflow.set_entry_point("fingerprint")
workflow.add_edge("fingerprint", "search")
workflow.add_edge("search", "verdict")
workflow.add_edge("verdict", END)

# Compile into a runnable application
app = workflow.compile()

# ==========================================
# Exposed Executable wrapper
# ==========================================
def run_pipeline(image_url: str) -> dict:
    """
    Exposed function to run the full digital media protection pipeline.
    Takes an image_url and returns the final populated LangGraph state.
    """
    initial_state = {
        "image_url": image_url,
        "fingerprint": None,
        "matches": None,
        "score": None,
        "verdict": None
    }
    # Invoke the graph start to finish
    final_state = app.invoke(initial_state)
    return final_state

if __name__ == "__main__":
    # Test with the sample input provided
    test_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png"
    
    print("==================================================")
    print("   Starting Digital Sports Media Protection Flow  ")
    print("==================================================")
    print(f"Target Image: {test_url}")
    
    final_result = run_pipeline(test_url)
    
    print("\n================ FINAL PIPELINE STATE ================")
    # Print the final state in a clean, readable JSON format
    print(json.dumps(final_result, indent=2))
