<?php

require_once('main.php');
require_once('auth.php');

function legal_post_id($post_id, $user_id) {
  global $mysqli;
  $id = intval($post_id);
  $stmt = mysqli->prepare('SELECT `id` FROM `post_free` WHERE `id` = ? AND `user_id` = ?');
  $stmt->bind_param('ii', $id, $user_id);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  if (!$stmt->get_result()->fetch_row()) {
    panic('The post you try to update to does not exist, or does not belong to you!');
  }
  return $id;
}

if (!isset($_POST['post_id'])) {
  panic('No post id specified!');
}
if (!isset($_POST['text_content'])) {
  panic('No text content provided!');
}
$content = trim($_POST['text_content']);
if (strlen($content) < 1) { panic('Text content is not empty.'); }
$legal_post_id = legal_post_id($_POST['post_id']);
$stmt = mysqli->prepare('INSERT INTO `post_free_revision` (`post_id`, `datetime`, `text_content`) VALUES (?, NOW(), ?)');
$stmt->bind_param('is', $legal_post_id, $content);
if (!$stmt->execute()) { panic('SQL Error!'); }
success($stmt->insert_id);

?>
