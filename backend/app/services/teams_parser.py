"""Parser for MS Teams User Activity CSV files."""
import csv
import io
from typing import List, Tuple, Dict, Any
from fastapi import UploadFile


async def parse_teams_file(uploaded_file: UploadFile) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Parse MS Teams CSV file and return headers and rows.
    
    Returns:
        Tuple of (headers, rows) where rows is a list of dicts with original casing
    """
    content = await uploaded_file.read()
    
    # Try UTF-8 first, then fall back to other encodings
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        try:
            text = content.decode('utf-8-sig')  # UTF-8 with BOM
        except UnicodeDecodeError:
            text = content.decode('latin-1')  # Fallback
    
    # Parse CSV
    reader = csv.DictReader(io.StringIO(text))
    
    # Get headers (preserve original casing and order)
    headers = reader.fieldnames
    if not headers:
        raise ValueError("CSV file has no headers")
    
    # Parse all rows
    rows_data = []
    for row in reader:
        # Convert row to dict, preserving original header names
        row_dict = {}
        for header in headers:
            value = row.get(header, '')
            # Store as string, preserving original value
            row_dict[header] = str(value) if value is not None else ''
        rows_data.append(row_dict)
    
    return list(headers), rows_data

