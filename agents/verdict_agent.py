import os
import json
from dotenv import load_dotenv

# Load the Gemini API key from .env using python-dotenv
load_dotenv()

# Step 2: Call the Google Gemini API (use the google-generativeai library)
import google.generativeai as genai
from crewai.tools import tool
from crewai import Agent, Task, Crew

# Configure the google-generativeai library with the API key from .env
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Define a tool that incorporates steps 3 and 4
@tool("Analyze Matches Tool")
def analyze_matches(matches_str: str) -> str:
    """
    Takes a JSON string of image match results (filename and similarity)
    and uses the Gemini API to determine if there is a copyright violation.
    """
    try:
        # Initialize Gemini Model
        # NOTE: I am explicitly using 'gemini-2.5-flash' here instead of 'gemini-1.5-flash'
        # because we discovered earlier that your specific API key was throwing a 404 
        # and limit: 0 limitation on the 1.5 models natively!
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Step 3: Send the match results to Gemini with the requested instruction
        prompt = f"""You are a digital rights protection AI. Based on these image 
similarity matches, give a verdict score between 0 and 1 
(1 = definitely stolen, 0 = original) and a short one sentence 
reason. Return only valid JSON in this format: 
{{"score": 0.0, "verdict": "reason here"}}

Matches:
{matches_str}"""

        # Call Gemini's generate_content
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Step 4: Parse the JSON response and return the score and verdict
        # Clean up any markdown json blocks if Gemini returns them
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        parsed_data = json.loads(text)
        score = parsed_data.get('score', 0.0)
        verdict = parsed_data.get('verdict', 'Unknown')
        
        # Return beautifully formatted output for the Agent
        return f"Score: {score}\nVerdict: {verdict}"
    except Exception as e:
        return f"Error analyzing matches: {str(e)}"

# Create the Verdict Agent using CrewAI's Agent structure
verdict_agent = Agent(
    role="Verdict Agent",
    goal="Given a list of image match results, output the final verdict score and reason.",
    backstory="You are the ultimate decision maker for digital rights violations. You rely on your analytical tool to process match data and return verdicts.",
    tools=[analyze_matches],
    llm="gemini/gemini-2.5-flash", # CrewAI internal llm also using 2.5 flash
    allow_delegation=False,
    verbose=True
)

# Define the task for our agent
verdict_task = Task(
    description="Analyze the following match results and provide the final score and verdict. Matches:\n{matches}",
    expected_output="The final parsed score and reason from the analysis.",
    agent=verdict_agent
)

if __name__ == "__main__":
    # Test with the sample input provided
    sample_input = [
      {"match": "official_ipl_photo_2024.jpg", "similarity": 0.91},
      {"match": "getty_sports_image_445.jpg", "similarity": 0.76}
    ]
    
    # 1. Takes a list of match results as input
    #    (We convert it to a JSON string so CrewAI can interpolate it easily into the task)
    matches_json_string = json.dumps(sample_input)
    
    # Create the Crew
    crew = Crew(
        agents=[verdict_agent],
        tasks=[verdict_task],
        verbose=True
    )
    
    print("Starting Verdict Agent...")
    # Pass the matches as input to the task
    result = crew.kickoff(inputs={"matches": matches_json_string})
    
    print("\n================ Expected Verdict Output ================")
    print(result)
