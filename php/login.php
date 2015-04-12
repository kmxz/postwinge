<?php

require('main.php');

$verify_uri = 'http://ihome.ust.hk/~xkong/cgi-bin/itsc/verify.php?token=';

$response = file_get_contents($verify_uri . urlencode($_GET['token']));
$lines = preg_split("/\r\n|\n|\r/", $response);
$line_zero = base64_decode($lines[0]);
if (md5($line_zero) == $lines[1]) {
  $stmt = mysqli()->prepare('SELECT `user_id` FROM `user` WHERE `token` = ?');
  $stmt->bind_param('s', $line_zero);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  $result = $stmt->get_result()->fetch_row();
  if ($result) {
    $id = $result[0];
    $key = md5(str_shuffle(md5(microtime() . $line_zero) . mt_rand()));
    $stmt = mysqli()->prepare('INSERT INTO `session` (`key`, `user_id`) VALUES (?, ?)');
    $stmt->bind_param('si', $key, $id);
    if (!$stmt->execute()) { panic('SQL Error!'); }
    success($key);
  } else {
    success(NULL); // the user should request for an account
  }
} else {
  panic('Login failed. Please try again.');
}

?>
