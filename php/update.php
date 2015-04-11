<?php

require_once('main.php');
require_once('auth.php');

if (!isset($_POST['post_id'])) {
  panic('No post id specified!');
}
if (!isset($_POST['text_content'])) {
  panic('No text content provided!');
}
$content = trim($_POST['text_content']);
if (strlen($content) < 1) { panic('Text content cannot be empty.'); }
$legal_post_id = legal_post_id($_POST['post_id'], $user_id);
$stmt = $mysqli->prepare('INSERT INTO `post_free_revision` (`post_id`, `datetime`, `text_content`) VALUES (?, NOW(), ?)');
$stmt->bind_param('is', $legal_post_id, $content);
if (!$stmt->execute()) { panic('SQL Error!'); }
success($stmt->insert_id);

?>
