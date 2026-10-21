<?php
/**
 * Stands in for public/.htaccess when trying the PHP site locally with PHP's
 * built-in server:  npm run php  → http://localhost:8000 and /admin
 */
$path = urldecode((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = $_SERVER['DOCUMENT_ROOT'] . $path;

if (preg_match('#^/(lib|data)(/|$)#', $path)) {
    http_response_code(403);
    exit('Forbidden');
}
if (is_dir($file) && !str_ends_with($path, '/')) {
    header("Location: $path/", true, 301);
    exit;
}
if ($path !== '/' && !str_ends_with($path, '/index.html') && (is_file($file) || is_dir($file))) {
    return false;
}
require $_SERVER['DOCUMENT_ROOT'] . '/index.php';
