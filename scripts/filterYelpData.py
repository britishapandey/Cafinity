import json

# Load the business data
with open("..\\data\\yelp_academic_dataset_business.json", "r", encoding="utf-8") as f:
    businesses = [json.loads(line) for line in f]

# Define the categories to filter
target_categories = {
    "Coffee & Tea",
    "Cafes",
    "Bubble Tea"
}

# Filter businesses that include any of the target categories and are located in CA
cafes = [
    b for b in businesses
    if b.get('categories') and any(
        category.strip() in target_categories
        for category in b['categories'].split(',')
    ) and b.get('state') == 'CA'
]

# Save filtered data to a new file in NDJSON format
with open(r'..\data\cafes_ca.json', 'w', encoding='utf-8') as f:
    for cafe in cafes:
        # Ensure each line is a valid JSON object
        f.write(json.dumps(cafe) + '\n')

print(f"Filtered {len(cafes)} cafes in CA and saved to ../data/cafes_ca.json")