import json
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class AlternativeSuggestion(BaseModel):
    name: str = Field(description="Name of the alternative destination.")
    reason: str = Field(description="Explanation of why this alternative is better for the selected dates.")

class TripEnrichmentSchema(BaseModel):
    mustVisitPlaces: List[str]
    bestMonths: List[str]
    datesAligned: bool
    seasonalAdvice: str
    alternativeSuggestions: List[AlternativeSuggestion]

class TripRequest(BaseModel):
    winning_place: str
    start_date: str
    end_date: str

app = FastAPI()
client = Groq()

@app.post("/api/enrich-trip")
async def enrich_trip(request: TripRequest):
    try:
        prompt = f"""
        A travel group is planning a trip to {request.winning_place}.
        Their travel dates are from {request.start_date} to {request.end_date}.
        
        Determine the absolute best months to visit {request.winning_place}. 
        
        CRITICAL RULE: Check if the travel dates fall within your chosen best months. 
        - If they DO NOT, you MUST set "datesAligned" to false, explain the suboptimal weather in "seasonalAdvice", and provide 1-2 "alternativeSuggestions" with peak weather for those exact dates.
        - If they DO perfectly align, set "datesAligned" to true and leave the alternatives array empty.
        
        You MUST respond in valid JSON matching this exact structure:
        {{
            "mustVisitPlaces": ["Spot 1", "Spot 2", "Spot 3"],
            "bestMonths": ["Month 1", "Month 2"],
            "datesAligned": false,
            "seasonalAdvice": "Short warning if datesAligned is false, else empty",
            "alternativeSuggestions": [
                {{"name": "Alternative City", "reason": "Why it is better for these dates"}}
            ]
        }}
        """

        response = client.chat.completions.create(
            model="llama3-8b-8192", # Using a standard Groq-supported model
            messages=[
                {"role": "system", "content": "You are a travel API that outputs strict JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)

    except Exception as e:
        print(f"AI Service Error: {str(e)}")
        return {
            "mustVisitPlaces": ["Top Rated Restaurant", "City Plaza", "Viewpoint"],
            "bestMonths": ["Year-round"],
            "datesAligned": True,
            "seasonalAdvice": "",
            "alternativeSuggestions": []
        }

# Added the Uvicorn engine to bind to Render's 0.0.0.0 host and dynamic port
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)