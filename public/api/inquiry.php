<?php
/**
 * The enquiry form on the site (InquiryForm.tsx) posts here. The message is
 * emailed to the artist with Reply-To set to the visitor; nothing is stored.
 * Answers {"ok": true} or {"ok": false}, and the form offers email instead.
 */
declare(strict_types=1);

$config = require __DIR__ . '/../lib/config.php';
header('Content-Type: application/json; charset=utf-8');

function reply(bool $ok, int $status = 200): never
{
    http_response_code($status);
    echo json_encode(['ok' => $ok]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(false, 405);

$field = fn(string $name, int $max = 200) => mb_substr(trim((string) ($_POST[$name] ?? '')), 0, $max);
// Header fields must stay on one line.
$line = fn(string $s) => trim(preg_replace('/[\r\n\t]+/', ' ', $s));

// Bots fill in the hidden field; pretend it worked.
if ($field('bot-field') !== '') reply(true);

$name = $line($field('name'));
$email = $line($field('email'));
$subject = $line($field('subject', 300)) ?: 'Message from the website';
$artwork = $line($field('artwork', 300));
$message = $field('message', 10000);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) reply(false, 422);

$host = preg_replace('/^www\./', '', preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? 'localhost'));
$from = $config['mail_from'] ?: "noreply@$host";

$body = "$message\n\n— \n$name <$email>" . ($artwork !== '' ? "\nWork: $artwork" : '') . "\nSent from the form on $host";
$headers = implode("\r\n", [
    'From: ' . mb_encode_mimeheader('Web — ' . $name, 'UTF-8') . " <$from>",
    "Reply-To: $email",
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = @mail($config['contact_email'], mb_encode_mimeheader($subject, 'UTF-8'), $body, $headers);
reply($sent, $sent ? 200 : 500);
