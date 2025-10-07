import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

function snakeToCamel(str) {
  if (!str || !str.includes('_')) return str; // Return as-is if no underscore
  const components = str.split('_');
  return components[0] + components.slice(1).map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');
}

function snakeToPascal(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function sqlTypeToDrizzle(col) {
  const { data_type, udt_name, numeric_precision, numeric_scale, character_maximum_length } = col;
  
  if (udt_name === 'varchar' || data_type === 'character varying') {
    return character_maximum_length ? `varchar({ length: ${character_maximum_length} })` : 'varchar()';
  }
  if (udt_name === 'text' || data_type === 'text') return 'text()';
  if (udt_name === 'int4' || data_type === 'integer') return 'integer()';
  if (udt_name === 'serial' || udt_name === 'serial4') return 'serial()';
  if (udt_name === 'numeric' || data_type === 'numeric') {
    if (numeric_precision && numeric_scale) {
      return `numeric({ precision: ${numeric_precision}, scale: ${numeric_scale} })`;
    }
    return 'numeric()';
  }
  if (udt_name === 'bool' || data_type === 'boolean') return 'boolean()';
  if (udt_name === 'timestamp' || data_type.includes('timestamp')) return "timestamp({ mode: 'string' })";
  if (udt_name === 'jsonb') return 'jsonb()';
  if (udt_name === 'int8') return 'bigint({ mode: "number" })';
  return 'text()';
}

function parseDefault(defaultValue) {
  if (!defaultValue) return null;
  
  const d = defaultValue.trim();
  if (d.includes('gen_random_uuid()')) return '.default(sql`gen_random_uuid()`)';
  if (d.includes('now()') || d.includes('CURRENT_TIMESTAMP')) return '.defaultNow()';
  if (d.toLowerCase() === 'true') return '.default(true)';
  if (d.toLowerCase() === 'false') return '.default(false)';
  
  // Numeric
  const numMatch = d.match(/^'?(-?\d+(\.\d+)?)'?/);
  if (numMatch) return `.default(${numMatch[1]})`;
  
  // String with cast
  if (d.includes('::')) {
    const val = d.split('::')[0].replace(/'/g, '');
    if (d.endsWith('::jsonb')) {
      if (val === '[]' || val === '{}') return `.default(${val})`;
      return `.default(sql\`'${val}'::jsonb\`)`;
    }
    return `.default('${val}')`;
  }
  
  return null;
}

function generateColumnDef(col, isPrimary) {
  const colName = col.column_name;
  const camelName = snakeToCamel(colName);
  const drizzleType = sqlTypeToDrizzle(col);
  
  let def;
  if (colName !== camelName) {
    def = `  ${camelName}: ${drizzleType.replace('()', `("${colName}")`)}`;
  } else {
    def = `  ${camelName}: ${drizzleType}`;
  }
  
  const defaultClause = parseDefault(col.column_default);
  if (defaultClause) def += defaultClause;
  if (isPrimary) def += '.primaryKey()';
  if (col.is_nullable === 'NO' && !isPrimary) def += '.notNull()';
  
  return def + ',';
}

async function generateSchema() {
  try {
    console.log('Fetching table metadata...');
    
    // Get all tables with columns
    const tablesResult = await pool.query(`
      SELECT 
        t.table_name,
        json_agg(
          json_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'udt_name', c.udt_name,
            'column_default', c.column_default,
            'is_nullable', c.is_nullable,
            'character_maximum_length', c.character_maximum_length,
            'numeric_precision', c.numeric_precision,
            'numeric_scale', c.numeric_scale
          ) ORDER BY c.ordinal_position
        ) as columns
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND c.table_schema = 'public'
      WHERE t.table_schema = 'public'
      GROUP BY t.table_name
      ORDER BY t.table_name
    `);
    
    // Get primary keys
    const pksResult = await pool.query(`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public' AND tc.constraint_type = 'PRIMARY KEY'
    `);
    
    // Get unique constraints
    const uniquesResult = await pool.query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public' AND tc.constraint_type = 'UNIQUE'
      GROUP BY tc.table_name, tc.constraint_name
    `);
    
    // Organize data
    const pkMap = {};
    pksResult.rows.forEach(row => {
      if (!pkMap[row.table_name]) pkMap[row.table_name] = [];
      pkMap[row.table_name].push(row.column_name);
    });
    
    const uniqueMap = {};
    uniquesResult.rows.forEach(row => {
      if (!uniqueMap[row.table_name]) uniqueMap[row.table_name] = [];
      // PostgreSQL returns arrays as strings like "{col1,col2}", parse them
      let cols = row.columns;
      if (typeof cols === 'string') {
        cols = cols.replace(/[{}]/g, '').split(',');
      }
      uniqueMap[row.table_name].push({ name: row.constraint_name, columns: cols });
    });
    
    // Generate schema file
    let schema = `import { pgTable, varchar, text, integer, jsonb, boolean, timestamp, numeric, serial, unique, index, uniqueIndex, bigint } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

`;
    
    const tableVars = [];
    
    // Generate table definitions
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      const tableVar = snakeToCamel(tableName);
      tableVars.push({ var: tableVar, table: tableName });
      
      const columns = tableRow.columns || [];
      const primaryKeys = pkMap[tableName] || [];
      const uniqueConstraints = uniqueMap[tableName] || [];
      
      schema += `export const ${tableVar} = pgTable("${tableName}", {\n`;
      
      // Add columns
      for (const col of columns) {
        const isPrimary = primaryKeys.includes(col.column_name);
        schema += generateColumnDef(col, isPrimary) + '\n';
      }
      
      schema += '}';
      
      // Add unique constraints
      if (uniqueConstraints.length > 0) {
        schema += ', (table) => [\n';
        for (const uc of uniqueConstraints) {
          const colsArray = Array.isArray(uc.columns) ? uc.columns : [uc.columns];
          const cols = colsArray.map(c => `table.${snakeToCamel(c)}`).join(', ');
          schema += `  unique("${uc.name}").on(${cols}),\n`;
        }
        schema += ']';
      }
      
      schema += ');\n\n';
    }
    
    // Add Zod schemas
    schema += '// Zod Schemas\n';
    for (const { var: tableVar } of tableVars) {
      const pascalName = tableVar.charAt(0).toUpperCase() + tableVar.slice(1);
      schema += `export const insert${pascalName}Schema = createInsertSchema(${tableVar});\n`;
      schema += `export const select${pascalName}Schema = createSelectSchema(${tableVar});\n`;
    }
    
    schema += '\n// TypeScript Types\n';
    for (const { var: tableVar } of tableVars) {
      const pascalName = tableVar.charAt(0).toUpperCase() + tableVar.slice(1);
      schema += `export type Insert${pascalName} = z.infer<typeof insert${pascalName}Schema>;\n`;
      schema += `export type ${pascalName} = typeof ${tableVar}.$inferSelect;\n`;
    }
    
    // Write to file
    fs.writeFileSync('../shared/schema.ts', schema);
    console.log(`✅ Schema generated with ${tablesResult.rows.length} tables`);
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('Error generating schema:', error);
    await pool.end();
    process.exit(1);
  }
}

generateSchema();
