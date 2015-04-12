<?php

$user_id = NULL;

if (isset($_POST['key'])) {
  $stmt = $mysqli->prepare('SELECT `user_id` FROM `session` WHERE `key` = ?');
  $stmt->bind_param('s', $_POST['key']);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  $result = $stmt->get_result()->fetch_row();
  if ($result) {
    $user_id = $result[0];
  } else {
    panic('Please log in first!');
  }
}

$redis = new Redis();
$redis->pconnect('127.0.0.1');

?>
