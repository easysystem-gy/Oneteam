<?php

namespace Oneteam\Database;

use PDO;
use PDOException;
use Oneteam\Database\Adapters\PostgreSQLAdapter;
use Oneteam\Database\Adapters\MariaDBAdapter;
use Oneteam\Database\Adapters\SQLServerAdapter;
use Oneteam\Database\Adapters\SQLiteAdapter;

class DatabaseFactory
{
    private static $instances = [];
    private static $config = null;

    public static function setConfig(array $config): void
    {
        self::$config = $config;
    }

    public static function create(string $connection = null): DatabaseAdapterInterface
    {
        $connection = $connection ?? self::$config['default'];
        
        if (isset(self::$instances[$connection])) {
            return self::$instances[$connection];
        }

        $config = self::$config['connections'][$connection] ?? null;
        
        if (!$config) {
            throw new \InvalidArgumentException("Database connection '{$connection}' not configured");
        }

        $adapter = self::createAdapter($config);
        self::$instances[$connection] = $adapter;
        
        return $adapter;
    }

    private static function createAdapter(array $config): DatabaseAdapterInterface
    {
        switch ($config['driver']) {
            case 'pgsql':
                return new PostgreSQLAdapter($config);
            case 'mysql':
                return new MariaDBAdapter($config);
            case 'sqlsrv':
                return new SQLServerAdapter($config);
            case 'sqlite':
                return new SQLiteAdapter($config);
            default:
                throw new \InvalidArgumentException("Unsupported database driver: {$config['driver']}");
        }
    }

    public static function closeAll(): void
    {
        foreach (self::$instances as $adapter) {
            $adapter->disconnect();
        }
        self::$instances = [];
    }
}
