<?php

require_once('main.php');
require_once('auth.php');
require_once('image_upload.php');

// the number of posts having no text content and no image
function get_empty_post_count_of_user($user_id) {
  global $mysqli;
  $stmt = mysqli->prepare('SELECT COUNT(*) FROM `post_free` WHERE `user_id` = ? AND `image` IS NULL AND NOT EXISTS (SELECT * FROM `post_free_revision` WHERE `post_id` = `post_free`.`id`)');
  $stmt->bind_param('i', $user_id);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  $result = $stmt->get_result()->fetch_row();
  return $result[0];
}

function legal_pos($x, $y) {
  global $mysqli;
  $ix = intval($x); $iy = intval($y);
  if ($ix < 0 || $ix >= 48) {
    panic('Illegal X coordinate.');
  } 
  if ($iy < 0 || $iy >= 128) {
    panic('Illegal Y coordinate.');
  }
  $stmt = mysqli->prepare('SELECT `id` FROM `post_free` WHERE `coord_x` = ? AND `coord_y` = ?');
  $stmt->bind_param('ii', $ix, $iy);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  if ($stmt->get_result()->fetch_row()) {
    panic('The location is already occupied!');
  }
  return array($ix, $iy);
}

function legal_reply_to($reply_to) {
  global $mysqli;
  $to = intval($reply_to);
  $stmt = mysqli->prepare('SELECT `id` FROM `post_free` WHERE `id` = ?');
  $stmt->bind_param('i', $to);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  if (!$stmt->get_result()->fetch_row()) {
    panic('The post you try to reply to does not exist!');
  }
  return $to;
}

if (get_empty_post_count_of_user($user_id) > 0) {
  panic('You already have an empty post now! Please finish that one first!');
}
if (!isset($_POST['x']) || !isset($_POST['y'])) {
  panic('Post location not specified!');
}
$legal_pos = legal_pos($_POST['x'], $_POST['y']);
$legal_reply_to = isset($_POST['reply_to']) ? legal_reply_to($_POST['reply_to']) : 0;
$image = isset($_FILES['image']) ? image_upload('image') : NULL;
$stmt = mysqli->prepare('INSERT INTO `post_free` (`user_id`, `reply_to`, `image`, `x_coord`, `y_coord`, `datetime`) VALUES (?, ?, ?, ?, ?, NOW())');
$stmt->bind_param('iisii', $user_id, $legal_reply_to, $image, $legal_pos[0], $legal_pos[1]);
if (!$stmt->execute()) { panic('SQL Error!'); }
success($stmt->insert_id);

?>
