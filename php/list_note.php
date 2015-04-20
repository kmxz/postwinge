<?php

require_once('main.php');

$stmt = mysqli()->prepare('
  SELECT
    `sticky_note`.`note_id`,
    `sticky_note`.`target_id`,
    `sticky_note`.`text_content`,
    `sticky_note`.`datetime`,
    `sticky_note`.`image`,
    `sticky_note`.`user_id`,
    IF (`sticky_note`.`anonymous`, NULL, `user`.`display`) AS display
  FROM
    `sticky_note`
    LEFT JOIN
    `user`
    ON `sticky_note`.`user_id` = `user`.`user_id`
  ORDER BY
    `sticky_note`.`note_id` ASC
');

if (!$stmt->execute()) { panic('SQL Error!'); }
success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));

?>
