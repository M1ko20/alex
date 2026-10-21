<?php
/**
 * Every page of the site: the built index.html with the live works (edited in
 * /admin) put in place of the starting copy it was built with.
 */
declare(strict_types=1);

require __DIR__ . '/lib/store.php';

$html = (string) file_get_contents(__DIR__ . '/index.html');
$open = '<script type="application/json" id="site-data">';
$start = strpos($html, $open);
if ($start !== false) {
    $start += strlen($open);
    $end = strpos($html, '</script>', $start);
    $html = substr($html, 0, $start) . site_data_json() . substr($html, $end);
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
echo $html;
