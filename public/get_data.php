<?php
// public/get_data.php  (REPLACE FILE)
// Robust JSON API for card UI + filters (district, type, contact) + pagination
// NOTE: This version DOES NOT reference a `city` column (your table doesn't have it).

ini_set('display_errors','0');
error_reporting(E_ALL);
ob_start();
header('Content-Type: application/json; charset=utf-8');

$response = [
  'success' => false,
  'error' => null,
  'debug' => null,
  'page' => 1,
  'per_page' => 50,
  'total' => 0,
  'total_pages' => 0,
  'data' => []
];

try {
    require_once __DIR__ . '/../supabase.php';
    $db = (new Database())->getConnection();
    if (!($db instanceof PDO)) throw new Exception('DB connection failed.');

    // read params
    $page = isset($_GET['page']) ? max(1,(int)$_GET['page']) : 1;
    $per_page = isset($_GET['per_page']) ? max(1,(int)$_GET['per_page']) : 50;
    $district = isset($_GET['district']) ? trim($_GET['district']) : '';
    $type = isset($_GET['type']) ? trim($_GET['type']) : '';
    $contact = isset($_GET['contact']) ? trim($_GET['contact']) : 'all';
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';

    // Build filters (robust & fuzzy) - note: no 'city' column used
    $where = [];
    $params = [];

    if ($district !== '') {
        $d = trim(preg_replace('/\s+/', ' ', $district));
        // Search only in location column since your table doesn't have `city`
        $where[] = "(location LIKE :district)";
        $params[':district'] = "%{$d}%";
    }

    if ($type !== '' && strtolower($type) !== 'all') {
        // normalize trailing punctuation/space then prefix-match
        $normType = preg_replace('/[^\p{L}\p{N}\s]+$/u', '', trim($type));
        $normType = rtrim($normType, '. ');
        $where[] = "type LIKE :type";
        $params[':type'] = $normType . '%';
    }

    if ($contact === 'has') {
        $where[] = "(contact IS NOT NULL AND TRIM(contact) <> '')";
    } elseif ($contact === 'no') {
        $where[] = "(contact IS NULL OR TRIM(contact) = '')";
    }

    if ($q !== '') {
        $where[] = "(name LIKE :q OR location LIKE :q OR public_id LIKE :q)";
        $params[':q'] = "%{$q}%";
    }

    $where_sql = count($where) ? ('WHERE ' . implode(' AND ', $where)) : '';

    // total
    $count_sql = "SELECT COUNT(*) FROM institutes {$where_sql}";
    $stmt = $db->prepare($count_sql);
    $stmt->execute($params);
    $total = (int)$stmt->fetchColumn();

    $total_pages = (int)ceil($total / $per_page);
    $offset = ($page - 1) * $per_page;

    $data_sql = "SELECT id, public_id, name, type, location, has_blood_bank, contact, status, created_at
                 FROM institutes
                 {$where_sql}
                 ORDER BY id ASC
                 LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($data_sql);
    foreach ($params as $k=>$v) $stmt->bindValue($k, $v, PDO::PARAM_STR);
    $stmt->bindValue(':limit', (int)$per_page, PDO::PARAM_INT);
    $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response['success'] = true;
    $response['data'] = $rows;
    $response['page'] = $page;
    $response['per_page'] = $per_page;
    $response['total'] = $total;
    $response['total_pages'] = $total_pages;

} catch (Throwable $e) {
    $response['error'] = $e->getMessage();
}

// capture stray output
$extra = trim(ob_get_clean() ?: '');
if ($extra !== '') {
    $response['debug'] = mb_substr($extra,0,2000);
}

echo json_encode($response, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
exit;
