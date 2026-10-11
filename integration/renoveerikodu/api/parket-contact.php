<?php
declare(strict_types=1);

// Install alongside the existing contact.php; no admin session is exposed here.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://parketipaigaldaja.ee', 'https://www.parketipaigaldaja.ee',
    'https://404420.github.io', 'https://renoveerikodu.ee', 'https://www.renoveerikodu.ee',
];
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Vary: Origin');
function parket_error(string $message, int $status): void {
    http_response_code($status);
    echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    parket_error('See veebileht ei ole lubatud.', 403);
}
if ($origin !== '') header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Accept, Content-Type');
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') { http_response_code(204); exit; }
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST, OPTIONS');
    parket_error('Lubatud on GET ja POST.', 405);
}
if ($method === 'GET') {
    $config = is_file(__DIR__ . '/../config.php') ? __DIR__ . '/../config.php' : __DIR__ . '/config.php';
    if (!is_file($config)) parket_error('Serveri seadistus puudub.', 503);
    require_once $config;
    $secret = defined('RECAPTCHA_SECRET') ? trim((string) RECAPTCHA_SECRET) : trim((string) ($GLOBALS['recaptchaSecret'] ?? ''));
    $siteKey = defined('RECAPTCHA_SITE_KEY') ? (string) RECAPTCHA_SITE_KEY : (string) ($GLOBALS['recaptchaSiteKey'] ?? '');
    if ($secret !== '' && $siteKey === '') parket_error('Robotikontrolli seadistus puudub.', 503);
    echo json_encode(['success' => true, 'captchaRequired' => $secret !== '', 'siteKey' => $siteKey], JSON_UNESCAPED_UNICODE);
    exit;
}
$_SERVER['HTTP_ACCEPT'] = 'application/json';
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768 || !empty($_FILES)) parket_error('Päring on liiga suur.', 413);
$limits = ['name' => 100, 'email' => 180, 'phone' => 40, 'location' => 150, 'area' => 20, 'timing' => 100, 'message' => 3000, 'design' => 4000, 'website' => 200, 'consent' => 10, 'g-recaptcha-response' => 8192];
$data = [];
foreach ($limits as $field => $limit) {
    $value = $_POST[$field] ?? '';
    if (!is_string($value) || strlen($value) > $limit * 4 || !preg_match('//u', $value)) parket_error('Vormi andmed on vigased.', 422);
    $data[$field] = trim($value);
}
if ($data['website'] !== '') parket_error('Päringut ei saadetud.', 422);
if ($data['name'] === '' || $data['location'] === '' || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) parket_error('Kontrolli nime, e-posti ja asukohta.', 422);
$area = filter_var($data['area'], FILTER_VALIDATE_FLOAT);
if ($area === false || $area < 1 || $area > 10000) parket_error('Pindala peab olema 1–10000 m².', 422);
if ($data['consent'] !== 'on') parket_error('Palun kinnita andmete edastamine.', 422);
$message = "PARKETIPAIGALDAJA.EE — HINNAPÄRING\n\n";
$message .= "Pindala: {$data['area']} m²\nSoovitud aeg: " . ($data['timing'] ?: '—') . "\n\n";
$message .= "Valitud disain / lähteülesanne:\n{$data['design']}\n\nTöö kirjeldus:\n" . ($data['message'] ?: '—');
$message .= "\n\nEsialgne lähteülesanne, mitte siduv pakkumine. Toonid on illustratiivsed.";
$_POST = [
    'name' => $data['name'], 'email' => $data['email'], 'phone' => $data['phone'],
    'address' => $data['location'], 'message' => $message, 'source' => 'parketipaigaldaja.ee',
    'website' => '', 'g-recaptcha-response' => $data['g-recaptcha-response'],
];
require __DIR__ . '/contact.php';
