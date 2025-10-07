#!/usr/bin/env python3
"""
Script to generate complete Drizzle schema from database metadata
"""

import json
import re
from collections import defaultdict

# Database metadata from information_schema queries
COLUMNS_DATA = """
[PASTE_COLUMNS_DATA_HERE]
"""

PRIMARY_KEYS_DATA = """
[PASTE_PK_DATA_HERE]
"""

def snake_to_camel(snake_str):
    """Convert snake_case to camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def sql_type_to_drizzle(data_type, udt_name, precision, scale, max_length, default_value):
    """Map SQL types to Drizzle types"""
    
    # Handle varchar
    if udt_name == 'varchar' or data_type == 'character varying':
        if max_length:
            return f'varchar({{ length: {max_length} }})'
        return 'varchar()'
    
    # Handle text
    if data_type == 'text' or udt_name == 'text':
        return 'text()'
    
    # Handle integer
    if data_type == 'integer' or udt_name == 'int4':
        return 'integer()'
    
    # Handle numeric/decimal
    if data_type == 'numeric' or udt_name == 'numeric':
        if precision and scale:
            return f'numeric({{ precision: {precision}, scale: {scale} }})'
        return 'numeric()'
    
    # Handle boolean
    if data_type == 'boolean' or udt_name == 'bool':
        return 'boolean()'
    
    # Handle timestamp
    if data_type == 'timestamp without time zone' or udt_name == 'timestamp':
        return "timestamp({ mode: 'string' })"
    
    # Handle jsonb
    if data_type == 'jsonb' or udt_name == 'jsonb':
        return 'jsonb()'
    
    # Handle serial
    if udt_name == 'serial' or udt_name == 'serial4':
        return 'serial()'
    
    # Default
    return 'text()'

def parse_default(default_str, data_type):
    """Parse SQL default value to Drizzle format"""
    if not default_str:
        return None
    
    default_str = default_str.strip()
    
    # gen_random_uuid()
    if 'gen_random_uuid()' in default_str:
        return '.default(sql`gen_random_uuid()`)'
    
    # now() or CURRENT_TIMESTAMP
    if 'now()' in default_str or 'CURRENT_TIMESTAMP' in default_str:
        return '.defaultNow()'
    
    # Boolean values
    if default_str.lower() == 'true':
        return '.default(true)'
    if default_str.lower() == 'false':
        return '.default(false)'
    
    # Numeric values
    if re.match(r'^-?\d+(\.\d+)?$', default_str):
        return f'.default({default_str})'
    
    # String/text values with :: cast
    if '::' in default_str:
        value = default_str.split('::')[0].strip("'")
        if data_type in ['text', 'character varying']:
            return f".default('{value}')"
        return f".default('{value}')"
    
    # JSON values
    if default_str.startswith("'{") or default_str.startswith("'["):
        json_str = default_str.strip("'").replace("'", '"')
        return f".default(sql`'{json_str}'::jsonb`)"
    
    # Array values
    if default_str == "'[]'::jsonb" or default_str == "'{}'::jsonb":
        value = default_str.split('::')[0].strip("'")
        return f".default({value})"
    
    return None

def generate_column_definition(col_name, data_type, udt_name, precision, scale, max_length, 
                               default_value, is_nullable, is_primary):
    """Generate a single column definition"""
    camel_name = snake_to_camel(col_name)
    
    # Get base type
    drizzle_type = sql_type_to_drizzle(data_type, udt_name, precision, scale, max_length, default_value)
    
    # Build column definition
    if col_name != camel_name:
        col_def = f'{camel_name}: {drizzle_type.replace("()", f"(\"{col_name}\")")}'
    else:
        col_def = f'{camel_name}: {drizzle_type}'
    
    # Add default
    default_clause = parse_default(default_value, data_type)
    if default_clause:
        col_def += default_clause
    
    # Add primary key
    if is_primary:
        col_def += '.primaryKey()'
    
    # Add notNull
    if is_nullable == 'NO' and not is_primary:
        col_def += '.notNull()'
    
    return f'    {col_def},'

# This is a placeholder - actual implementation would parse the query results
print("Schema generator ready")
