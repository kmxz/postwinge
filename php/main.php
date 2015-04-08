<?php

date_default_timezone_set('Asia/Hong_Kong');

$mysqli = new mysqli('localhost', 'grad', 'grad', 'grad');
$mysqli->set_charset('utf8');
$mysqli->query('SET time_zone = \'Asia/Hong_Kong\'');

header('Access-Control-Allow-Origin: *'); // debug only! please remove.
header('Content-Type: application/json');

function panic($reason) {
  die(json_encode(array('success' => FALSE, 'data' => $reason)));
}

function success($data) {
  die(json_encode(array('success' => TRUE, 'data' => $data)));
}

function legal_post_id($post_id, $user_id) {
  global $mysqli;
  $id = intval($post_id);
  $stmt = $mysqli->prepare('SELECT `id` FROM `post_free` WHERE `id` = ? AND `user_id` = ?');
  $stmt->bind_param('ii', $id, $user_id);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  if (!$stmt->get_result()->fetch_row()) {
    panic('The post you try to update to does not exist, or does not belong to you!');
  }
  return $id;
}

?>
