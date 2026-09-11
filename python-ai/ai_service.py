from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Define the exact JSON structure we want Gemini to return
class TripEnrichmentSchema(BaseModel):
    top_place_spots: List[str] = Field(description="A list of exactly 3 must-visit spots in the winning destination.")
    best_time_to_visit: str = Field(description="The objectively best months or seasons to visit.")
    is_good_time: bool = Field(description="True if the group's dates are a good time to visit, false if bad (e.g., peak monsoon or extreme heat).")
    timing_warning: str = Field(description="A short warning if is_good_time is false. Leave empty if true.")
    alternative_destination: str = Field(description="If is_good_time is false, suggest 1 alternative destination with great weather during those exact dates. Leave empty if true.")
    alternative_reason: str = Field(description="Explanation of why this alternative is better for those dates.")

# Matches the exact camelCase variables sent by Java's TripEnrichmentRequest
# 1. Update this model to match the Java record exactly
class TripRequest(BaseModel):
    winning_place: str
    start_date: str
    end_date: str

app = FastAPI()
client = genai.Client()

@app.post("/api/enrich-trip")
async def enrich_trip(request: TripRequest):
    try:
        # 2. Update the prompt to use the new variable names
        prompt = f"""
        A travel group is planning a trip. Their top priority destination is {request.winning_place}.
        Their overlapping travel dates are from {request.start_date} to {request.end_date}.
        
        Evaluate the weather and seasonal conditions for {request.winning_place} during these dates.
        Provide must-visit spots. If the timing is bad, suggest a culturally or geographically similar alternative that has great weather during their dates.
        """

        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TripEnrichmentSchema,
            )
        )

        return response.parsed.model_dump()

    except Exception as e:
        print(f"AI Service Error: {str(e)}")

        # Return fallback data directly. DO NOT use 'raise HTTPException' here.
        return {
            "top_place_spots": ["Top Rated Local Restaurant", "Main City Plaza", "Popular Sightseeing Viewpoint"],
            "best_time_to_visit": "Year-round depending on preference.",
            "is_good_time": True,
            "timing_warning": "AI generation temporarily unavailable. Verify local weather.",
            "alternative_destination": "",
            "alternative_reason": ""
        }