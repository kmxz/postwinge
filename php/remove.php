<?php

require_once('main.php');
require_once('auth.php');

if (!isset($_POST['post_id'])) {
  panic('No post id specified!');
}
$legal_post_id = legal_post_id($_POST['post_id'], $user_id);
$stmt = mysqli()->prepare('SELECT `revision_id` FROM `post_free_revision` WHERE `post_id` = ?');
$stmt->bind_param('i', $legal_post_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
if ($stmt->get_result()->fetch_row()) {
  panic('You cannot delete a post that already has content!');
}
$stmt = mysqli()->prepare('SELECT `image` FROM `post_free` WHERE `post_id` = ?');
$stmt->bind_param('i', $legal_post_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
if ($stmt->get_result()->fetch_row()[0]) {
  panic('You cannot delete a post that already has an image!');
}
$stmt = mysqli()->prepare('DELETE FROM `post_free` WHERE `post_id` = ?');
$stmt->bind_param('i', $legal_post_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
success_with_redis_publish('remove', array(
  'post_id' => $legal_post_id
), $user_id);

?>
