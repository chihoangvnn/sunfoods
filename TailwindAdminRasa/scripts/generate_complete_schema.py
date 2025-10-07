#!/usr/bin/env python3
import subprocess
import json
import re

def snake_to_camel(snake_str):
    """Convert snake_case to camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def snake_to_pascal(snake_str):
    """Convert snake_case to PascalCase"""
    return ''.join(x.title() for x in snake_str.split('_'))

def sql_type_to_drizzle(col):
    """Map SQL types to Drizzle types"""
    data_type = col['data_type']
    udt_name = col['udt_name']
    precision = col['numeric_precision']
    scale = col['numeric_scale']
    max_length = col['character_maximum_length']
    col_name = col['column_name']
    
    # Handle varchar
    if udt_name == 'varchar' or data_type == 'character varying':
        if max_length:
            return f'varchar({{ length: {max_length} }})'
        return 'varchar()'
    
    # Handle text
    if data_type == 'text' or udt_name == 'text':
        return 'text()'
    
    # Handle integer/serial
    if data_type == 'integer' or udt_name in ['int4', 'serial', 'serial4']:
        if 'serial' in udt_name:
            return 'serial()'
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
    if 'timestamp' in data_type or udt_name == 'timestamp':
        return "timestamp({ mode: 'string' })"
    
    # Handle jsonb
    if data_type == 'jsonb' or udt_name == 'jsonb':
        return 'jsonb()'
    
    # Handle bigint
    if udt_name == 'int8':
        return 'bigint({ mode: "number" })'
    
    return 'text()'

def parse_default(default_str):
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
    
    # Numeric values (including decimals)
    if re.match(r"^'?-?\d+(\.\d+)?'?$", default_str.replace('::', ' ').split()[0]):
        num = default_str.replace("'", '').split('::')[0]
        return f'.default({num})'
    
    # String/text values with :: cast
    if '::' in default_str:
        value = default_str.split('::')[0].strip("'")
        # Handle JSON
        if default_str.endswith('::jsonb'):
            if value in ['[]', '{}']:
                return f".default({value})"
            return f".default(sql`'{value}'::jsonb`)"
        return f".default('{value}')"
    
    return None

def generate_column_definition(col, is_primary):
    """Generate a single column definition"""
    col_name = col['column_name']
    camel_name = snake_to_camel(col_name)
    
    # Get base type
    drizzle_type = sql_type_to_drizzle(col)
    
    # Build column definition  
    if col_name != camel_name:
        # Column name in DB is different from JS variable name
        if '()' in drizzle_type:
            col_def = f'    {camel_name}: {drizzle_type.replace("()", f"(\"{col_name}\")")}'
        else:
            col_def = f'    {camel_name}: {drizzle_type}("{col_name}")'
    else:
        col_def = f'    {camel_name}: {drizzle_type}'
    
    # Add default
    default_clause = parse_default(col['column_default'])
    if default_clause:
        col_def += default_clause
    
    # Add primary key
    if is_primary:
        col_def += '.primaryKey()'
    
    # Add notNull
    if col['is_nullable'] == 'NO' and not is_primary:
        col_def += '.notNull()'
    
    col_def += ','
    return col_def

# Get table metadata from database
def get_metadata():
    result = subprocess.run([
        'psql', process.env.get('DATABASE_URL', ''),
        '-t', '-A', '-F,',
        '-c', '''
        SELECT json_build_object(
          'tables', (
            SELECT json_agg(t) FROM (
              SELECT 
                table_name,
                (
                  SELECT json_agg(c ORDER BY ordinal_position)
                  FROM (
                    SELECT 
                      column_name,
                      data_type,
                      udt_name,
                      column_default,
                      is_nullable,
                      character_maximum_length,
                      numeric_precision,
                      numeric_scale,
                      ordinal_position
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = t.table_name
                  ) c
                ) as columns
              FROM information_schema.tables t
              WHERE table_schema = 'public'
              ORDER BY table_name
            ) t
          ),
          'primary_keys', (
            SELECT json_object_agg(table_name, columns)
            FROM (
              SELECT 
                tc.table_name,
                array_agg(kcu.column_name) as columns
              FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
              WHERE tc.table_schema = 'public'
                AND tc.constraint_type = 'PRIMARY KEY'
              GROUP BY tc.table_name
            ) pk
          ),
          'unique_constraints', (
            SELECT json_agg(u)
            FROM (
              SELECT 
                tc.table_name,
                array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns,
                tc.constraint_name
              FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
              WHERE tc.table_schema = 'public'
                AND tc.constraint_type = 'UNIQUE'
              GROUP BY tc.table_name, tc.constraint_name
            ) u
          )
        );
        '''
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return None
    
    return json.loads(result.stdout.strip())

# Instead of querying, let's use execute_sql directly
print("Use execute_sql_tool to get metadata, then call this script with the JSON data")
