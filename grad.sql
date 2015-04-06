SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

DROP TABLE IF EXISTS `post_free`;
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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

DROP TABLE IF EXISTS `post_free_revision`;
CREATE TABLE `post_free_revision` (
  `revision_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` mediumint(8) unsigned NOT NULL,
  `datetime` datetime NOT NULL,
  `text_content` text CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`revision_id`),
  KEY `post_id` (`post_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `key` char(32) CHARACTER SET ascii NOT NULL,
  `user_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` smallint(6) NOT NULL AUTO_INCREMENT,
  `token` varchar(31) CHARACTER SET ascii NOT NULL,
  `display` tinytext CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;
