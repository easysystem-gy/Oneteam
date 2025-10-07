<?php

namespace Oneteam\Database;

use PDO;
use PDOException;

abstract class BaseAdapter implements DatabaseAdapterInterface
{
    protected $config;
    protected $connection;
    protected $connected = false;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function getConnection(): PDO
    {
        if (!$this->connected) {
            $this->connect();
        }
        return $this->connection;
    }

    public function query(string $sql, array $params = []): array
    {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new DatabaseException("Query failed: " . $e->getMessage(), 0, $e);
        }
    }

    public function queryOne(string $sql, array $params = []): ?array
    {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            throw new DatabaseException("Query failed: " . $e->getMessage(), 0, $e);
        }
    }

    public function execute(string $sql, array $params = []): int
    {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new DatabaseException("Execute failed: " . $e->getMessage(), 0, $e);
        }
    }

    public function lastInsertId(): string
    {
        return $this->getConnection()->lastInsertId();
    }

    public function beginTransaction(): bool
    {
        return $this->getConnection()->beginTransaction();
    }

    public function commit(): bool
    {
        return $this->getConnection()->commit();
    }

    public function rollback(): bool
    {
        return $this->getConnection()->rollBack();
    }

    public function disconnect(): void
    {
        $this->connection = null;
        $this->connected = false;
    }

    public function createTable(string $table, array $schema): bool
    {
        $sql = $this->getCreateTableSQL($table, $schema);
        return $this->execute($sql) !== false;
    }

    public function dropTable(string $table): bool
    {
        $sql = $this->getDropTableSQL($table);
        return $this->execute($sql) !== false;
    }

    public function getDropTableSQL(string $table): string
    {
        return "DROP TABLE IF EXISTS {$table}";
    }

    protected function buildDSN(): string
    {
        // To be implemented by child classes
        throw new \BadMethodCallException("buildDSN must be implemented by child classes");
    }

    protected function getDefaultOptions(): array
    {
        return [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
    }
}
