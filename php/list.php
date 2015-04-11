<?php

require_once('main.php');

if (isset($_GET['post_id'])) {
  // all revisions of a specific post
  $id = intval($_GET['post_id']);
  // we don't actually check whether the post exists, as it will not harm anyway
  $stmt = $mysqli->prepare('SELECT `revision_id`, `datetime`, `text_content` FROM `post_free_revision` WHERE `post_id` = ?');
  $stmt->bind_param('i', $id);
} else {
  // lastest revision for each post
  $stmt = $mysqli->prepare('
    SELECT
      post.`post_id`,
      post.`reply_to`,
      post.`x_coord`,
      post.`y_coord`,
      post.`image`,
      post.`user_id`,
      post.`display`,
      revision.`datetime`,
      revision.`text_content`
    FROM
      (
        SELECT
          `post_free`.`post_id`,
          `post_free`.`reply_to`,
          `post_free`.`x_coord`,
          `post_free`.`y_coord`,
          `post_free`.`image`,
          `post_free`.`user_id`,
          `user`.`display`
        FROM
          `post_free`
          LEFT JOIN
          `user`
          ON `post_free`.`user_id` = `user`.`user_id`
      ) post
      LEFT JOIN
      (
        SELECT
          r1.*
        FROM
          `post_free_revision` r1
          LEFT JOIN
          `post_free_revision` r2
          ON (r1.`post_id` = r2.`post_id` AND r1.`revision_id` < r2.`revision_id`)
          WHERE r2.`revision_id` IS NULL
      ) revision
      ON post.`post_id` = revision.`post_id`
  ');
}

if (!$stmt->execute()) { panic('SQL Error!'); }
success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));

?>
