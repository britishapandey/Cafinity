import json
import os
import shutil

# py filterPhotoLibrary.py

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

# Load the filtered_photos.json using our flexible function
filtered_photos = load_json_file('..\\data\\filtered_photos.json')

# Create a set of photo IDs for efficient lookup
photo_ids = set(photo['photo_id'] for photo in filtered_photos)

# Define source and destination folders
source_folder = '../data/photos'  # Replace with your photos folder path
destination_folder = '../data/filtered-photos'  # Replace with where you want filtered photos

# Create destination folder if it doesn't exist
os.makedirs(destination_folder, exist_ok=True)

# Counter for processed files
copied_count = 0
skipped_count = 0

# Iterate through all files in source folder
for filename in os.listdir(source_folder):
    if filename.lower().endswith('.jpg'):
        photo_id = os.path.splitext(filename)[0]  # Remove .jpg extension
        
        if photo_id in photo_ids:
            source_path = os.path.join(source_folder, filename)
            dest_path = os.path.join(destination_folder, filename)
            
            try:
                shutil.copy2(source_path, dest_path)
                copied_count += 1
                print(f"Copied: {filename}")
            except Exception as e:
                print(f"Error copying {filename}: {str(e)}")
        else:
            skipped_count += 1

# Print summary
print(f"\nSummary:")
print(f"Photos copied: {copied_count}")
print(f"Photos skipped: {skipped_count}")
print(f"Total photos in filtered_photos.json: {len(photo_ids)}")