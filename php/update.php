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
$length = strlen($content);
if ($length < 1) { panic('Text content cannot be empty.'); }
if ($length > 8192) { panic('The content cannot be longer than 8192 bytes.'); }
$legal_post_id = legal_post_id($_POST['post_id'], $user_id);
$stmt = mysqli()->prepare('INSERT INTO `post_free_revision` (`post_id`, `datetime`, `text_content`) VALUES (?, NOW(), ?)');
$stmt->bind_param('is', $legal_post_id, $content);
if (!$stmt->execute()) { panic('SQL Error!'); }
$revision_id = $stmt->insert_id;
$stmt = mysqli()->prepare('SELECT `datetime` FROM `post_free_revision` WHERE `revision_id` = ?');
$stmt->bind_param('i', $revision_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
$row = $stmt->get_result()->fetch_row();
if (!$row) { panic('SQL Error!'); }
success_with_redis_publish('update', array(
  'post_id' => $legal_post_id,
  'revision_id' => $revision_id,
  'datetime' => $row[0],
  'text_content' => $content
), $user_id, 'post');

?>
