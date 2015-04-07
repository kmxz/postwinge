<?php

require('main.php');

$login_uri = 'https://ihome.ust.hk/~xkong/cgi-bin/itsc/itsc.php?redirect=' . urlencode('http://' . $_SERVER[HTTP_HOST] . $_SERVER[REQUEST_URI]);
$verify_uri = 'http://home.ust.hk/~xkong/cgi-bin/itsc/verify.php?token=';

if (!isset($_GET['key'])) {
  header('Location: ' . $login_uri);
} else {
  $response = file_get_contents($verify_uri . urlencode($_GET['key']));
  $lines = preg_split("/\r\n|\n|\r/", $response);
  $line_zero = base64_decode($lines[0]);
  if (md5($line_zero) == $lines[1]) {
    $stmt = $mysqli->prepare('SELECT `user_id` FROM `user` WHERE `token` = ?');
    $stmt->bind_param('s', $line_zero);
    if (!$stmt->execute()) { panic('SQL Error!'); }
    $result = $stmt->get_result()->fetch_row();
    if ($result) {
      $id = $result[0];
      $key = md5(str_shuffle(md5(microtime() . $line_zero) . mt_rand()));
      $stmt = $mysqli->prepare('INSERT INTO `session` (`key`, `user_id`) VALUES (?, ?)');
      $stmt->bind_param('si', $key, $id);
      if (!$stmt->execute()) { panic('SQL Error!'); }
      success($key);
    } else {
      success(NULL); // the user should request for an account
    }
  } else {
    panic('Login failed. Please try again.');
  }
}

?>
