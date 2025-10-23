#!/usr/bin/env python3
"""
Parse workshop HTML files and update workshops.json
"""
import json
import re
import os
from pathlib import Path
from bs4 import BeautifulSoup

def parse_workshop_html(file_path):
    """Parse a workshop HTML file and extract relevant information"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract title
        title = ""
        title_elem = soup.find('h1', class_='page-title')
        if title_elem:
            title = title_elem.get_text(strip=True)
        
        # Extract duration and about from properties table
        duration = ""
        about = ""
        
        properties = soup.find_all('tr', class_='property-row')
        for prop in properties:
            th = prop.find('th')
            td = prop.find('td')
            if th and td:
                header = th.get_text(strip=True)
                value = td.get_text(strip=True)
                if 'Duration' in header:
                    duration = value
                elif 'About' in header:
                    about = value
        
        # Extract description
        description = ""
        description_heading = soup.find('h1', string=re.compile(r'Description'))
        if description_heading:
            # Get the first paragraph after the Description heading
            next_elem = description_heading.find_next_sibling()
            if next_elem and next_elem.name == 'p':
                description = next_elem.get_text(strip=True)
        
        # Extract instructions
        instructions = []
        instructions_heading = soup.find('h1', string=re.compile(r'Instructions'))
        if instructions_heading:
            # Find all ordered lists after the Instructions heading
            current_elem = instructions_heading.find_next_sibling()
            while current_elem:
                if current_elem.name == 'ol':
                    for li in current_elem.find_all('li', recursive=False):
                        # Get text including nested lists
                        instruction_text = li.get_text(separator=' ', strip=True)
                        # Clean up extra whitespace
                        instruction_text = re.sub(r'\s+', ' ', instruction_text)
                        if instruction_text:
                            instructions.append(instruction_text)
                # Stop if we hit another h1 or h2 section
                elif current_elem.name in ['h1', 'h2']:
                    break
                current_elem = current_elem.find_next_sibling()
        
        return {
            'title': title,
            'duration': duration,
            'about': about,
            'description': description,
            'instructions': instructions
        }
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        return None

def main():
    # Paths
    base_dir = Path(__file__).parent
    workshops_dir = base_dir / 'workshops'
    json_file = base_dir / 'data' / 'workshops.json'
    
    # Load existing JSON
    with open(json_file, 'r', encoding='utf-8') as f:
        workshops_data = json.load(f)
    
    # Create a mapping of workshop names to data
    workshop_map = {w['name']: w for w in workshops_data}
    
    # Parse all HTML files
    for html_file in workshops_dir.glob('*.html'):
        print(f"Processing: {html_file.name}")
        
        # Extract workshop name from filename (remove the hash part)
        filename = html_file.stem  # Remove .html
        # Workshop name is everything before the last space and hash
        parts = filename.rsplit(' ', 1)
        if len(parts) == 2:
            workshop_name = parts[0]
        else:
            workshop_name = filename
            
        # Parse the HTML
        parsed_data = parse_workshop_html(html_file)
        
        if not parsed_data:
            continue
            
        # Use the title from HTML if we found one
        if parsed_data['title']:
            workshop_name = parsed_data['title']
        
        # Update the workshop data if it exists in our JSON
        if workshop_name in workshop_map:
            print(f"  Updating: {workshop_name}")
            if parsed_data['duration']:
                workshop_map[workshop_name]['duration'] = parsed_data['duration']
            if parsed_data['about']:
                workshop_map[workshop_name]['about'] = parsed_data['about']
            if parsed_data['description']:
                workshop_map[workshop_name]['description'] = parsed_data['description']
            if parsed_data['instructions']:
                workshop_map[workshop_name]['instructions'] = parsed_data['instructions']
        else:
            print(f"  WARNING: '{workshop_name}' not found in JSON")
    
    # Save updated JSON
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(workshops_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nUpdated {json_file}")
    
if __name__ == '__main__':
    main()
