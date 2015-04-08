<?php

require_once('main.php');
require_once('auth.php');

$stmt = $mysqli->prepare('SELECT `user_id`, `display` FROM `user` WHERE `user_id` = ?');
$stmt->bind_param('i', $user_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
$result = $stmt->get_result()->fetch_assoc();
if (!$result) { panic('You account has been deleted. Enjoy your day.'); }
success($result);

?>
