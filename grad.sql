SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `post_free` (
  `post_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint(5) unsigned NOT NULL,
  `reply_to` mediumint(8) unsigned NOT NULL,
  `image` tinytext CHARACTER SET ascii,
  `x_coord` smallint(6) NOT NULL,
  `y_coord` smallint(6) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`post_id`),
  UNIQUE KEY `coord` (`x_coord`,`y_coord`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

CREATE TABLE `post_free_revision` (
  `revision_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` mediumint(8) unsigned NOT NULL,
  `datetime` datetime NOT NULL,
  `text_content` text NOT NULL,
  `anonymous` tinyint(1) NOT NULL,
  PRIMARY KEY (`revision_id`),
  KEY `post_id` (`post_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

CREATE TABLE `session` (
  `key` char(32) CHARACTER SET ascii NOT NULL,
  `user_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `sticky_note` (
  `note_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `target_id` smallint(5) unsigned NOT NULL,
  `datetime` datetime NOT NULL,
  `text_content` text NOT NULL,
  `image` tinytext,
  `user_id` smallint(5) unsigned NOT NULL,
  `anonymous` tinyint(1) NOT NULL,
  PRIMARY KEY (`note_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

CREATE TABLE `user` (
  `user_id` smallint(6) NOT NULL AUTO_INCREMENT,
  `token` varchar(31) CHARACTER SET ascii NOT NULL,
  `display` tinytext NOT NULL,
  `index_name` tinytext CHARACTER SET ascii NOT NULL,
  `is_sticky_target` tinyint(1) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;
