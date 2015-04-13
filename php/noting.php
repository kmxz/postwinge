<?php

require_once('main.php');
require_once('auth.php');

if (!isset($_POST['target_id'])) {
  panic('No target id specified!');
}
if (!isset($_POST['text_content'])) {
  panic('No text content provided!');
}
if (!isset($_POST['anonymous'])) {
  panic('Anonymous state not specified!');
}
$target_id = intval($_POST['target_id']); // no validation now
$content = trim($_POST['text_content']);
$length = strlen($content);
if ($length < 1) { panic('Text content cannot be empty.'); }
if ($length > 8192) { panic('The content cannot be longer than 8192 bytes.'); }
$image = NULL;
if (isset($_FILES['image'])) {
  $image = image_upload('image');
}
$anonymous = filter_var($_POST['anonymous'], FILTER_VALIDATE_BOOLEAN);
$stmt = mysqli()->prepare('INSERT INTO `sticky_note` (`target_id`, `user_id`, `text_content`, `image`, `datetime`, `anonymous`) VALUES (?, ?, ?, ?, NOW(), ?)');
$stmt->bind_param('iissi', $target_id, $user_id, $content, $image, $anonymous ? 1 : 0);
if (!$stmt->execute()) { panic('SQL Error!'); }
$note_id = $stmt->insert_id;
$stmt = mysqli()->prepare('SELECT `datetime` FROM `sticky_note` WHERE `note_id` = ?');
$stmt->bind_param('i', $note_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
$row = $stmt->get_result()->fetch_row();
if (!$row) { panic('SQL Error!'); }
success_with_redis_publish('noting', array(
  'note_id' => $note_id,
  'text_content' => $content,
  'image' => $image,
  'datetime' => $row[0],
  'target_id' => $target_id
), $anonymous ? 0 : $user_id);

?>
