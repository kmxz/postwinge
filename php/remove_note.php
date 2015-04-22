<?php

require_once('main.php');
require_once('auth.php');

if (!isset($_POST['note_id'])) {
  panic('No post id specified!');
}
$legal_note_id = legal_note_id($_POST['note_id'], $user_id);
$stmt = mysqli()->prepare('UPDATE `sticky_note` SET `deleted` = 1 WHERE `note_id` = ?');
$stmt->bind_param('i', $legal_note_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
success_with_redis_publish('remove', array(
  'note_id' => $legal_note_id
), $user_id, 'note');

?>
