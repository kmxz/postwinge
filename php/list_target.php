<?php

require_once('main.php');

$stmt = mysqli()->prepare('SELECT `user_id`, `display` FROM `user` WHERE `is_sticky_target` = 1');

if (!$stmt->execute()) { panic('SQL Error!'); }
success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));

?>