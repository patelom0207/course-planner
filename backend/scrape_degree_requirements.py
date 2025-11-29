"""
Scraper for UIUC CS degree requirements from the official catalog.

This scraper extracts requirement groups and course metadata from:
https://catalog.illinois.edu/undergraduate/engineering/computer-science-bs/#degreerequirementstext

Output: JSON seed file with groups[] and course_meta{}
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from typing import List, Dict, Set


def extract_course_codes(text: str, soup_element=None) -> Set[str]:
    """
    Extract course codes from text or soup element.
    Handles both "CS 225" and "CS225" formats.
    Prefers linked course anchors, falls back to regex.
    """
    codes = set()

    # First try to find linked courses (most reliable)
    if soup_element:
        for link in soup_element.find_all('a', href=True):
            href = link.get('href', '')
            # Course links typically look like: /search/?P=CS%20225
            if '/search/?P=' in href or 'courseinfo' in href:
                course_text = link.get_text(strip=True)
                # Extract code like "CS 225" or "CS225"
                match = re.match(r'([A-Z]{2,4})\s*(\d{3})', course_text)
                if match:
                    dept, num = match.groups()
                    codes.add(f"{dept}{num}")

    # Fallback: regex patterns for both formats
    # Pattern 1: "CS 225" (with space)
    pattern1 = r'\b([A-Z]{2,4})\s+(\d{3})\b'
    for match in re.finditer(pattern1, text):
        dept, num = match.groups()
        codes.add(f"{dept}{num}")

    # Pattern 2: "CS225" (no space) - but avoid false matches
    pattern2 = r'\b([A-Z]{2,4})(\d{3})\b'
    for match in re.finditer(pattern2, text):
        dept, num = match.groups()
        # Only add if it looks like a real course (common departments)
        if dept in ['CS', 'MATH', 'PHYS', 'ECE', 'STAT', 'ENG', 'CHEM',
                    'ME', 'CEE', 'IE', 'MSE', 'TAM', 'NPRE', 'BIOE']:
            codes.add(f"{dept}{num}")

    return codes


def scrape_cs_degree_requirements(url: str) -> Dict:
    """
    Scrape the CS degree requirements page and extract structured data.

    Returns:
        Dict with 'groups' (list of requirement groups) and 'course_meta' (dict of course metadata)
    """
    print(f"Fetching {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.content, 'lxml')

    # Find the degree requirements tab content
    # The page uses tabs, and degree requirements is in a tab_content div
    degree_req_section = None

    # Strategy 1: Find by anchor name (not id!)
    anchor = soup.find('a', attrs={'name': 'degreerequirementstext'})
    if anchor:
        # Get the parent tab_content div
        degree_req_section = anchor.find_parent('div', class_='tab_content')

    # Strategy 2: Find tab_content containing "Degree Requirements" or "Graduation Requirements"
    if not degree_req_section:
        for tab in soup.find_all('div', class_='tab_content'):
            text = tab.get_text()
            if ('degree' in text.lower() and 'requirement' in text.lower()) or \
               ('graduation' in text.lower() and 'requirement' in text.lower()):
                degree_req_section = tab
                break

    if not degree_req_section:
        raise ValueError("Could not find 'Degree Requirements' section on page")

    print(f"Found degree requirements tab")

    # In this catalog format, sections are marked by <p><strong>Title</strong></p>
    # Collect all content from the tab
    content_elements = degree_req_section.find_all(['p', 'table', 'ul', 'ol', 'div'], recursive=False)

    print(f"Collected {len(content_elements)} content elements")

    # Extract requirement groups and courses
    # In this catalog, sections are marked by <p><strong>Section Title</strong></p>
    groups = []
    all_courses = set()
    current_group_title = None
    current_group_courses = set()

    # Sections that contain REQUIRED courses (not just options)
    REQUIRED_SECTIONS = [
        'Computer Science Technical Core',
        'Foundational Mathematics and Science',
        'Orientation and Professional Development'
    ]

    # Sections to skip (these list options, not requirements)
    SKIP_SECTIONS = [
        'Technical Electives',
        'Advanced Electives',
        'Free Electives',
        'General Education Requirements',  # Too many options, not fixed requirements
        'Graduation Requirements',
        'Technical GPA',
        'University Requirements'
    ]

    for element in content_elements:
        # Check if this is a section header (p with strong tag)
        if element.name == 'p':
            strong_tag = element.find('strong')
            if strong_tag:
                # This is a new section header
                # Save previous group if it has courses and is a required section
                if current_group_title and current_group_courses:
                    if current_group_title in REQUIRED_SECTIONS:
                        groups.append({
                            "title": current_group_title,
                            "courses": sorted(list(current_group_courses))
                        })
                        all_courses.update(current_group_courses)
                        print(f"  Group '{current_group_title}': {len(current_group_courses)} courses")
                    else:
                        print(f"  Skipping '{current_group_title}' (not a required section)")

                # Start new group
                current_group_title = strong_tag.get_text(strip=True)
                current_group_courses = set()
            else:
                # Regular paragraph - extract courses only if in required section
                if current_group_title and current_group_title in REQUIRED_SECTIONS:
                    text = element.get_text()
                    courses = extract_course_codes(text, element)
                    current_group_courses.update(courses)

        # Tables and lists contain course information
        elif element.name in ['table', 'ul', 'ol']:
            # Only extract if in a required section
            if current_group_title and current_group_title in REQUIRED_SECTIONS:
                text = element.get_text()
                courses = extract_course_codes(text, element)
                current_group_courses.update(courses)

    # Don't forget to add the last group if it's required
    if current_group_title and current_group_courses:
        if current_group_title in REQUIRED_SECTIONS:
            groups.append({
                "title": current_group_title,
                "courses": sorted(list(current_group_courses))
            })
            all_courses.update(current_group_courses)
            print(f"  Group '{current_group_title}': {len(current_group_courses)} courses")
        else:
            print(f"  Skipping '{current_group_title}' (not a required section)")

    # If still no groups found, extract all courses
    if not groups:
        print("No structured groups found, extracting all courses...")
        for element in content_elements:
            text = element.get_text()
            courses = extract_course_codes(text, element)
            all_courses.update(courses)

        if all_courses:
            groups.append({
                "title": "Degree Requirements",
                "courses": sorted(list(all_courses))
            })

    # Build course metadata (credits, empty prereqs for now)
    course_meta = {}
    for course_code in all_courses:
        # Try to extract credits from the page (often shown as "3 hours" or "4 hours")
        # Default to common credit values
        credits = 3  # Default
        if course_code.startswith('MATH') or course_code.startswith('PHYS'):
            credits = 4  # Math and Physics typically 4 credits

        course_meta[course_code] = {
            "credits": credits,
            "prerequisites": []  # Empty for now, would need separate scraping
        }

    print(f"\nExtracted {len(groups)} requirement groups")
    print(f"Total unique courses: {len(all_courses)}")

    return {
        "groups": groups,
        "course_meta": course_meta,
        "source_url": url,
        "major": "Computer Science"
    }


def save_to_json(data: Dict, output_path: str):
    """Save scraped data to JSON file."""
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\nSaved to {output_path}")


def main():
    """Main scraper entry point."""
    url = "https://catalog.illinois.edu/undergraduate/engineering/computer-science-bs/#degreerequirementstext"
    output_path = "data/cs_degree_requirements.json"

    # Create data directory if it doesn't exist
    import os
    os.makedirs("data", exist_ok=True)

    try:
        data = scrape_cs_degree_requirements(url)
        save_to_json(data, output_path)

        # Print summary
        print("\n=== Summary ===")
        print(f"Groups: {len(data['groups'])}")
        for group in data['groups']:
            print(f"  - {group['title']}: {len(group['courses'])} courses")
        print(f"Course metadata entries: {len(data['course_meta'])}")

        return 0
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
