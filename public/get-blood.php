<?php
// public/get-blood.php
// Adjust the require path if your structure is different
require __DIR__ . '/../config/supabase.php';

$response = supabase_get('blood', 'select=*&limit=1000');

if (isset($response['error'])) {
    echo "Error: " . $response['error'];
    exit;
}

if ($response['status'] !== 200) {
    echo "Fetch failed. HTTP status: " . $response['status'];
    echo "<pre>"; var_dump($response); echo "</pre>";
    exit;
}

$rows = $response['body'];

echo "<h2>Blood records (" . count($rows) . ")</h2>";
echo "<table border='1' cellpadding='6' cellspacing='0'>";
echo "<tr><th>Name</th><th>Blood Group</th><th>City</th><th>Contact</th></tr>";
foreach ($rows as $r) {
    echo "<tr>";
    echo "<td>" . htmlspecialchars($r['name'] ?? '') . "</td>";
    echo "<td>" . htmlspecialchars($r['blood_group'] ?? '') . "</td>";
    echo "<td>" . htmlspecialchars($r['city'] ?? '') . "</td>";
    echo "<td>" . htmlspecialchars($r['contact'] ?? '') . "</td>";
    echo "</tr>";
}
echo "</table>";
