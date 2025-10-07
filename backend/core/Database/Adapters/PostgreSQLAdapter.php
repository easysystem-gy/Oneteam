<?php

namespace Oneteam\Database\Adapters;

use PDO;
use PDOException;
use Oneteam\Database\BaseAdapter;
use Oneteam\Database\DatabaseException;

class PostgreSQLAdapter extends BaseAdapter
{
    public function connect(): void
    {
        if ($this->connected) {
            return;
        }

        try {
            $dsn = $this->buildDSN();
            $options = $this->getDefaultOptions();
            
            $this->connection = new PDO($dsn, $this->config['username'], $this->config['password'], $options);
            $this->connected = true;
        } catch (PDOException $e) {
            throw new DatabaseException("PostgreSQL connection failed: " . $e->getMessage(), 0, $e);
        }
    }

    protected function buildDSN(): string
    {
        $dsn = "pgsql:host={$this->config['host']};port={$this->config['port']};dbname={$this->config['database']}";
        
        if (!empty($this->config['charset'])) {
            $dsn .= ";options='--client_encoding={$this->config['charset']}'";
        }
        
        if (!empty($this->config['sslmode'])) {
            $dsn .= ";sslmode={$this->config['sslmode']}";
        }
        
        return $dsn;
    }

    public function tableExists(string $table): bool
    {
        $sql = "SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = ? AND table_name = ?
        )";
        
        $schema = $this->config['schema'] ?? 'public';
        $result = $this->queryOne($sql, [$schema, $table]);
        
        return (bool)$result['exists'];
    }

    public function getTableColumns(string $table): array
    {
        $sql = "SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = ? AND table_name = ?
                ORDER BY ordinal_position";
        
        $schema = $this->config['schema'] ?? 'public';
        return $this->query($sql, [$schema, $table]);
    }

    public function getCreateTableSQL(string $table, array $schema): string
    {
        $columns = [];
        $constraints = [];
        
        foreach ($schema['columns'] as $name => $definition) {
            $column = $this->buildColumnDefinition($name, $definition);
            $columns[] = $column;
        }
        
        if (!empty($schema['primary_key'])) {
            $pk = is_array($schema['primary_key']) ? implode(', ', $schema['primary_key']) : $schema['primary_key'];
            $constraints[] = "PRIMARY KEY ({$pk})";
        }
        
        if (!empty($schema['foreign_keys'])) {
            foreach ($schema['foreign_keys'] as $fk) {
                $constraints[] = "FOREIGN KEY ({$fk['column']}) REFERENCES {$fk['table']}({$fk['referenced_column']})";
            }
        }
        
        $sql = "CREATE TABLE {$table} (\n";
        $sql .= "    " . implode(",\n    ", array_merge($columns, $constraints));
        $sql .= "\n)";
        
        return $sql;
    }

    public function getLimitSQL(int $limit, int $offset = 0): string
    {
        return "LIMIT {$limit} OFFSET {$offset}";
    }

    private function buildColumnDefinition(string $name, array $definition): string
    {
        $sql = $name . ' ';
        
        switch (strtolower($definition['type'])) {
            case 'id':
                $sql .= 'SERIAL PRIMARY KEY';
                break;
            case 'uuid':
                $sql .= 'UUID';
                break;
            case 'string':
                $length = $definition['length'] ?? 255;
                $sql .= "VARCHAR({$length})";
                break;
            case 'text':
                $sql .= 'TEXT';
                break;
            case 'integer':
                $sql .= 'INTEGER';
                break;
            case 'bigint':
                $sql .= 'BIGINT';
                break;
            case 'decimal':
                $precision = $definition['precision'] ?? 10;
                $scale = $definition['scale'] ?? 2;
                $sql .= "DECIMAL({$precision},{$scale})";
                break;
            case 'boolean':
                $sql .= 'BOOLEAN';
                break;
            case 'datetime':
                $sql .= 'TIMESTAMP';
                break;
            case 'date':
                $sql .= 'DATE';
                break;
            case 'json':
                $sql .= 'JSONB';
                break;
            default:
                $sql .= strtoupper($definition['type']);
        }
        
        if (!empty($definition['nullable']) && $definition['nullable'] === false) {
            $sql .= ' NOT NULL';
        }
        
        if (isset($definition['default'])) {
            if ($definition['default'] === 'CURRENT_TIMESTAMP') {
                $sql .= ' DEFAULT CURRENT_TIMESTAMP';
            } else {
                $sql .= " DEFAULT '" . $definition['default'] . "'";
            }
        }
        
        return $sql;
    }
}
