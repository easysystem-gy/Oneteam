<?php

/**
 * Minimal OpenAPI specification for testing
 */

$openapi = [
    'openapi' => '3.0.3',
    'info' => [
        'title' => 'Oneteam API',
        'version' => '1.0.0',
        'description' => 'Test API'
    ],
    'servers' => [
        [
            'url' => '/api',
            'description' => 'Development server'
        ]
    ],
    'paths' => [
        '/test' => [
            'get' => [
                'summary' => 'Test endpoint',
                'responses' => [
                    '200' => [
                        'description' => 'Success'
                    ]
                ]
            ]
        ]
    ]
];
