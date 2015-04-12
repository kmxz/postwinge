<?php

require_once('main.php');
require_once('auth.php');
require_once('image_upload.php');

if (!isset($_POST['post_id'])) {
  panic('No post id specified!');
}
if (!isset($_FILES['image'])) {
  panic('No image uploaded!');
}
$legal_post_id = legal_post_id($_POST['post_id'], $user_id);
$image = image_upload('image');
$stmt = mysqli()->prepare('UPDATE `post_free` SET `image` = ? WHERE `post_id` = ?');
$stmt->bind_param('si', $image, $legal_post_id);
if (!$stmt->execute()) { panic('SQL Error!'); }
success_with_redis_publish('image', array(
  'post_id' => $legal_post_id,
  'image' => $image
), $user_id);

?>
