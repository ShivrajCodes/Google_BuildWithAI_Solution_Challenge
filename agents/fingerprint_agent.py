import os
import io
import requests
from PIL import Image
import imagehash
from crewai.tools import tool
from crewai import Agent, Task, Crew
from dotenv import load_dotenv

# Load environment variables (such as GEMINI_API_KEY)
load_dotenv()

# ==========================================
# Tool Definition
# ==========================================
@tool("Generate Perceptual Hash Tool")
def generate_perceptual_hash(image_url: str) -> str:
    """
    Downloads an image from a URL and generates its average perceptual hash.
    Takes the image_url as input.
    """
    try:
        # Step 2: Download the image using the requests library
        headers = {'User-Agent': 'Mozilla/5.0'} # Basic header to prevent some 403 errors
        response = requests.get(image_url, headers=headers)
        response.raise_for_status()

        # Step 2 (continued): Open the image using PIL (Pillow) from the byte content
        image = Image.open(io.BytesIO(response.content))

        # Step 3: Generate a perceptual hash using the imagehash library (average_hash)
        hash_value = imagehash.average_hash(image)

        # Step 4: Return the hash as a plain string
        return str(hash_value)
    
    except Exception as e:
        return f"Error processing image: {str(e)}"

# ==========================================
# Agent Definition
# ==========================================
fingerprint_agent = Agent(
    role="Fingerprint Agent",
    goal="Accurately compute and return the perceptual hash of an image from a URL.",
    backstory=(
        "You are an AI assistant specialized in digital media authentication. "
        "Your primary job is to take an image URL, use your hashing tool to calculate "
        "its perceptual fingerprint, and return the raw hash value."
    ),
    # 1. Takes an image URL as input (via task definition and tool usage)
    tools=[generate_perceptual_hash],
    allow_delegation=False,
    # CrewAI uses Litellm under the hood. Prefixing with 'gemini/' routes to Google GenAI.
    llm="gemini/gemini-2.5-flash", 
    verbose=True
)

# ==========================================
# Task Definition
# ==========================================
hash_task = Task(
    description="Generate a perceptual hash for the image located at URL: {image_url}",
    expected_output="A plain string representing the perceptual hash. Do not include extra text.",
    agent=fingerprint_agent
)

# ==========================================
# Test Execution
# ==========================================
if __name__ == "__main__":
    # Test with the sample image URL provided
    test_url = "https://www.python.org/static/community_logos/python-logo-master-v3-TM.png"
    
    # Initialize the crew with our agent and task
    crew = Crew(
        agents=[fingerprint_agent],
        tasks=[hash_task],
        verbose=True
    )
    
    print(f"Starting Fingerprint Agent task for URL:\n{test_url}\n")
    
    # Run the crew, passing the test URL as an input
    # Note: Ensure you have a valid GEMINI_API_KEY in your .env before running this, 
    # otherwise Litellm will throw an AuthenticationError.
    result = crew.kickoff(inputs={"image_url": test_url})
    
    print("\n================ Expected Hash Output ================")
    print(result)
