#!/usr/bin/env python3
import sys
import json
import math

# Mock dataset of 20 destinations with attributes:
# Terrain Theme (beach, hills, heritage)
# Region Cluster (north, south, west, east)
# Budget Bracket (low, medium, high)
DESTINATIONS = [
    {"name": "Bali", "terrain": "beach", "region": "south", "budget": "medium"},
    {"name": "Kyoto", "terrain": "heritage", "region": "east", "budget": "high"},
    {"name": "Queenstown", "terrain": "hills", "region": "south", "budget": "high"},
    {"name": "Rome", "terrain": "heritage", "region": "west", "budget": "high"},
    {"name": "Phuket", "terrain": "beach", "region": "south", "budget": "low"},
    {"name": "Leh Ladakh", "terrain": "hills", "region": "north", "budget": "low"},
    {"name": "Shimla", "terrain": "hills", "region": "north", "budget": "medium"},
    {"name": "Paris", "terrain": "heritage", "region": "west", "budget": "high"},
    {"name": "Cairo", "terrain": "heritage", "region": "north", "budget": "medium"},
    {"name": "Goa", "terrain": "beach", "region": "south", "budget": "low"},
    {"name": "Reykjavik", "terrain": "hills", "region": "north", "budget": "high"},
    {"name": "Pokhara", "terrain": "hills", "region": "north", "budget": "low"},
    {"name": "Barcelona", "terrain": "beach", "region": "west", "budget": "medium"},
    {"name": "Petra", "terrain": "heritage", "region": "west", "budget": "high"},
    {"name": "Hampi", "terrain": "heritage", "region": "south", "budget": "low"},
    {"name": "Ooty", "terrain": "hills", "region": "south", "budget": "medium"},
    {"name": "Costa Rica", "terrain": "beach", "region": "east", "budget": "high"},
    {"name": "Cappadocia", "terrain": "hills", "region": "west", "budget": "high"},
    {"name": "Krabi", "terrain": "beach", "region": "south", "budget": "medium"},
    {"name": "Machu Picchu", "terrain": "hills", "region": "south", "budget": "high"}
]

def calculate_similarity(dest1, dest2):
    """
    Computes similarity using weighted attribute matching (conceptually a distance metric equivalent to KNN
    on one-hot encoded variables with specific weights representing feature importance).
    Weights: Terrain (3), Budget (2), Region (1)
    """
    total_score = 0
    max_score = 6 # Sum of weights
    
    if dest1["terrain"] == dest2["terrain"]:
        total_score += 3
    if dest1["budget"] == dest2["budget"]:
        total_score += 2
    if dest1["region"] == dest2["region"]:
        total_score += 1
        
    return total_score / max_score

def recommend(inputs, top_n=3):
    # Normalize input casing
    input_names = [name.strip().lower() for name in inputs]
    
    # Resolve the attributes for the input destinations to understand the seed preference
    input_records = []
    for d in DESTINATIONS:
        if d["name"].lower() in input_names:
            input_records.append(d)
            
    # If none of the inputs matched existing mock dataset, use default profile based on the input text
    # Or fabricate a virtual profile matching the first term
    if not input_records:
        # Default seed profile (e.g. general heritage/medium/west)
        input_records = [{"name": inputs[0], "terrain": "heritage", "region": "west", "budget": "medium"}] if inputs else [{"name": "Default", "terrain": "beach", "region": "south", "budget": "medium"}]

    recommendations = []
    for candidate in DESTINATIONS:
        # Avoid recommending destinations that are already in the input list
        if candidate["name"].lower() in input_names:
            continue
            
        # Calculate maximum similarity against any of the input profiles (equivalent to single-linkage neighborhood similarity)
        max_sim = 0
        for input_rec in input_records:
            sim = calculate_similarity(input_rec, candidate)
            if sim > max_sim:
                max_sim = sim
                
        recommendations.append({
            "name": candidate["name"],
            "terrain": candidate["terrain"],
            "region": candidate["region"],
            "budget": candidate["budget"],
            "similarity_score": round(max_sim, 2)
        })
        
    # Sort recommendations by similarity score (descending) and break ties alphabetically
    recommendations.sort(key=lambda x: (-x["similarity_score"], x["name"]))
    
    # Return top N
    return recommendations[:top_n]

def main():
    # Attempt to read arguments
    args = sys.argv[1:]
    
    if not args:
        # Try to read from standard input in case of JSON input stream
        try:
            line = sys.stdin.read().strip()
            if line:
                data = json.loads(line)
                if isinstance(data, list):
                    args = data
                elif isinstance(data, dict) and "destinations" in data:
                    args = data["destinations"]
        except Exception:
            pass
            
    # Default inputs if empty
    if not args:
        args = ["Bali"]
        
    results = recommend(args, top_n=4)
    
    # Force single-line JSON string representation to stdout
    print(json.dumps(results))

if __name__ == "__main__":
    main()
