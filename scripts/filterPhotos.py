import json

def load_json_file(filepath):
    """Load JSON file, handling both array and line-delimited formats"""
    data = []
    try:
        # First try loading as a single JSON array
        with open(filepath, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        # If that fails, try loading as line-delimited JSON
        with open(filepath, 'r') as f:
            for line in f:
                if line.strip():  # Skip empty lines
                    data.append(json.loads(line))
    return data

# Load both files
photos_data = load_json_file("../data/photos.json")
cafes_data = load_json_file("../data/cafes_ca.json")

# Create a set of business IDs from cafes_ca.json for efficient lookup
cafe_business_ids = set(cafe['business_id'] for cafe in cafes_data)

# Filter photos to only include those with matching business IDs
filtered_photos = [
    photo for photo in photos_data
    if photo['business_id'] in cafe_business_ids
]

# Save the filtered photos to a new JSON file
with open('filtered_photos.json', 'w') as output_file:
    json.dump(filtered_photos, output_file, indent=2)

print(f"Filtered {len(filtered_photos)} photos out of {len(photos_data)} original photos")