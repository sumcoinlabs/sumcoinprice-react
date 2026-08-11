<?php

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');

$url = 'https://www.sumcoinindex.com/rates/price2.json';

$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_USERAGENT => 'SumcoinPrice/1.0',
]);

$raw = curl_exec($ch);

if ($raw === false) {

    http_response_code(502);

    echo json_encode([
        'success' => false,
        'error' => curl_error($ch),
    ]);

    curl_close($ch);
    exit;
}

$status = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

if ($status < 200 || $status >= 300) {

    http_response_code(502);

    echo json_encode([
        'success' => false,
        'error' => 'Upstream HTTP ' . $status,
    ]);

    exit;
}

$data = json_decode(
    $raw,
    true
);

if (
    !is_array($data) ||
    !isset($data['price'])
) {

    http_response_code(502);

    echo json_encode([
        'success' => false,
        'error' => 'Invalid Sumcoin market data',
    ]);

    exit;
}


$output = [

    'success' => true,

    'id' => 'sumcoin',

    'name' => 'Sumcoin',

    'symbol' => 'SUM',

    'currency' => 'USD',

    'price' =>
        (float)$data['price'],

    'market_cap' =>
        isset($data['marketcap_USD'])
            ? (float)$data['marketcap_USD']
            : null,

    'volume_24h' =>
        isset($data['24hrvolume_USD'])
            ? (float)$data['24hrvolume_USD']
            : null,

    'circulating_supply' =>
        isset($data['circulating_supply'])
            ? (float)$data['circulating_supply']
            : null,

    'max_supply' =>
        isset($data['max_supply'])
            ? (float)$data['max_supply']
            : null,

    'fully_diluted_market_cap' =>
        isset($data['fully_diluted_market_cap'])
            ? (float)$data['fully_diluted_market_cap']
            : null,

    'source' =>
        'https://www.sumcoinindex.com/rates/price2.json',

    'updated_at' =>
        gmdate('c'),
];

echo json_encode(
    $output,
    JSON_PRETTY_PRINT |
    JSON_UNESCAPED_SLASHES
);
