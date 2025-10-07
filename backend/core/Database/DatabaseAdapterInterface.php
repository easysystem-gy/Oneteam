<?php

namespace Oneteam\Database;

interface DatabaseAdapterInterface
{
    /**
     * Connect to the database
     */
    public function connect(): void;

    /**
     * Disconnect from the database
     */
    public function disconnect(): void;

    /**
     * Get the PDO connection
     */
    public function getConnection(): \PDO;

    /**
     * Execute a query and return results
     */
    public function query(string $sql, array $params = []): array;

    /**
     * Execute a query and return the first result
     */
    public function queryOne(string $sql, array $params = []): ?array;

    /**
     * Execute an insert/update/delete query
     */
    public function execute(string $sql, array $params = []): int;

    /**
     * Get the last inserted ID
     */
    public function lastInsertId(): string;

    /**
     * Begin a transaction
     */
    public function beginTransaction(): bool;

    /**
     * Commit a transaction
     */
    public function commit(): bool;

    /**
     * Rollback a transaction
     */
    public function rollback(): bool;

    /**
     * Check if a table exists
     */
    public function tableExists(string $table): bool;

    /**
     * Get table columns information
     */
    public function getTableColumns(string $table): array;

    /**
     * Create a table from schema
     */
    public function createTable(string $table, array $schema): bool;

    /**
     * Drop a table
     */
    public function dropTable(string $table): bool;

    /**
     * Get database-specific SQL for common operations
     */
    public function getCreateTableSQL(string $table, array $schema): string;
    public function getDropTableSQL(string $table): string;
    public function getLimitSQL(int $limit, int $offset = 0): string;
}
