<?php

namespace Oneteam\Database\Adapters;

use PDO;
use PDOException;
use Oneteam\Database\BaseAdapter;
use Oneteam\Database\DatabaseException;

class MariaDBAdapter extends BaseAdapter
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
            
            // Set charset
            if (!empty($this->config['charset'])) {
                $this->connection->exec("SET NAMES {$this->config['charset']}");
            }
        } catch (PDOException $e) {
            throw new DatabaseException("MariaDB connection failed: " . $e->getMessage(), 0, $e);
        }
    }

    protected function buildDSN(): string
    {
        $dsn = "mysql:host={$this->config['host']};port={$this->config['port']};dbname={$this->config['database']}";
        
        if (!empty($this->config['charset'])) {
            $dsn .= ";charset={$this->config['charset']}";
        }
        
        return $dsn;
    }

    public function tableExists(string $table): bool
    {
        $sql = "SELECT COUNT(*) as count FROM information_schema.tables 
                WHERE table_schema = ? AND table_name = ?";
        
        $result = $this->queryOne($sql, [$this->config['database'], $table]);
        
        return (int)$result['count'] > 0;
    }

    public function getTableColumns(string $table): array
    {
        $sql = "SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = ? AND table_name = ?
                ORDER BY ordinal_position";
        
        return $this->query($sql, [$this->config['database'], $table]);
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
        $sql .= "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        return $sql;
    }

    public function getLimitSQL(int $limit, int $offset = 0): string
    {
        return "LIMIT {$offset}, {$limit}";
    }

    private function buildColumnDefinition(string $name, array $definition): string
    {
        $sql = $name . ' ';
        
        switch (strtolower($definition['type'])) {
            case 'id':
                $sql .= 'INT AUTO_INCREMENT PRIMARY KEY';
                break;
            case 'uuid':
                $sql .= 'CHAR(36)';
                break;
            case 'string':
                $length = $definition['length'] ?? 255;
                $sql .= "VARCHAR({$length})";
                break;
            case 'text':
                $sql .= 'TEXT';
                break;
            case 'integer':
                $sql .= 'INT';
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
                $sql .= 'TINYINT(1)';
                break;
            case 'datetime':
                $sql .= 'DATETIME';
                break;
            case 'date':
                $sql .= 'DATE';
                break;
            case 'json':
                $sql .= 'JSON';
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
