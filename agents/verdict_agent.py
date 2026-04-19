import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

import google.generativeai as genai
from crewai import Agent, Task

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))


def get_verdict_from_gemini(matches_str: str) -> dict:
    """
    Calls Gemini directly with the match results and returns a parsed
    {"score": float, "verdict": str} dict.

    This is called directly in pipeline.py's verdict_node, bypassing the
    CrewAI agent wrapper so that the raw JSON response is never lost to
    natural-language paraphrasing.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""You are a digital rights protection AI. Based on these image similarity matches, 
give a verdict score between 0 and 1 (1 = definitely stolen/copyright violation, 0 = original content) 
and a short one-sentence reason.

Return ONLY valid JSON in exactly this format, with no markdown, no code fences, no extra text:
{{"score": 0.0, "verdict": "reason here"}}

Matches:
{matches_str}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Strip any markdown code fences Gemini might add despite instructions
        text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
        text = text.strip()

        parsed = json.loads(text)
        return {
            "score": float(parsed.get("score", 0.0)),
            "verdict": str(parsed.get("verdict", "Unknown"))
        }

    except json.JSONDecodeError:
        # Regex fallback: try to pull score and verdict even from malformed text
        score_match = re.search(r'"score"\s*:\s*([0-9.]+)', text)
        verdict_match = re.search(r'"verdict"\s*:\s*"([^"]+)"', text)
        return {
            "score": float(score_match.group(1)) if score_match else 0.0,
            "verdict": verdict_match.group(1) if verdict_match else f"Could not parse response: {text[:100]}"
        }
    except Exception as e:
        return {"score": 0.0, "verdict": f"Gemini API error: {str(e)}"}


# ==========================================
# CrewAI Agent + Task (kept for standalone testing via __main__)
# ==========================================
from crewai.tools import tool
from crewai import Crew


@tool("Analyze Matches Tool")
def analyze_matches(matches_str: str) -> str:
    """
    Takes a JSON string of image match results and uses Gemini to determine
    if a copyright violation occurred. Returns a JSON string with score and verdict.
    """
    result = get_verdict_from_gemini(matches_str)
    return json.dumps(result)


verdict_agent = Agent(
    role="Verdict Agent",
    goal="Given a list of image match results, output the final verdict score and reason as JSON.",
    backstory="You are the ultimate decision maker for digital rights violations. Analyze match data and return verdicts.",
    tools=[analyze_matches],
    llm="gemini/gemini-2.5-flash",
    allow_delegation=False,
    verbose=True
)

verdict_task = Task(
    description="Analyze the following match results and provide the final score and verdict. Matches:\n{matches}",
    expected_output='A JSON object with exactly two keys: "score" (float 0-1) and "verdict" (string). Example: {"score": 0.85, "verdict": "High similarity to known copyrighted image."}',
    agent=verdict_agent
)


if __name__ == "__main__":
    sample_input = [
        {"match": "official_ipl_photo_2024.jpg", "similarity": 0.91},
        {"match": "getty_sports_image_445.jpg", "similarity": 0.76}
    ]

    matches_json_string = json.dumps(sample_input)

    crew = Crew(
        agents=[verdict_agent],
        tasks=[verdict_task],
        verbose=True
    )

    print("Starting Verdict Agent...")
    result = crew.kickoff(inputs={"matches": matches_json_string})

    print("\n================ Expected Verdict Output ================")
    print(result)
