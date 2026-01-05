"""
Input sanitization utilities for Zapiio
Prevents NoSQL injection attacks
"""

from typing import Any, Dict, List


def sanitize_string(value: Any) -> str:
    """Sanitize a value to ensure it's a safe string"""
    if value is None:
        return ""
    
    if isinstance(value, (dict, list)):
        raise ValueError("Invalid input: dictionaries and lists are not allowed")
    
    return str(value).strip()


def sanitize_dict(data: Dict[str, Any], allowed_keys: List[str] = None) -> Dict[str, Any]:
    """Sanitize a dictionary by ensuring no MongoDB operators are present"""
    if not isinstance(data, dict):
        raise ValueError("Input must be a dictionary")
    
    sanitized = {}
    
    for key, value in data.items():
        if key.startswith("$"):
            raise ValueError(f"MongoDB operators are not allowed: {key}")
        
        if allowed_keys and key not in allowed_keys:
            continue
        
        if isinstance(value, dict):
            if any(k.startswith("$") for k in value.keys()):
                raise ValueError(f"MongoDB operators are not allowed in nested objects")
            sanitized[key] = sanitize_dict(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_dict(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            sanitized[key] = value
    
    return sanitized
