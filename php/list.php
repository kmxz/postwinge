<?php

require_once('main.php');

if (isset($_GET['post_id'])) {
  // all revisions of a specific post
  $id = intval($_GET['post_id']);
  // we don't actually check whether the post exists, as it will not harm anyway
  $stmt = $mysqli->prepare('SELECT * FROM `post_free_revision` WHERE `post_id` = ?');
  $stmt->bind_param('i', $id);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
} else {
  // lastest revision for each post
  $result = $mysqli->query('SELECT * FROM `post_free` LEFT JOIN (SELECT r1.* FROM `post_free_revision` r1 LEFT JOIN `post_free_revision` r2 ON (r1.`post_id` = r2.`post_id` AND r1.`id` < r2.`id`) WHERE r2.`id` IS NULL) mr ON `post_free`.`id` = mr.`post_id`');
  if (!$result) {
    panic('SQL Error!');
  }
  success($result->fetch_all(MYSQLI_ASSOC));
}

?>