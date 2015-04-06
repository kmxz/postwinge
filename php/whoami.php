<?php

require_once('auth.php');

$stmt = $mysqli->prepare('SELECT `display` FROM `user` WHERE `user_id` = ?');
$stmt->bind_param('i', $user_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
$result = $stmt->get_result()->fetch_row();
if (!$result) { panic('You account has been deleted. Enjoy your day.'); }
success($result[0]);

?>
