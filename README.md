当我第一次知道要改改 Postiles / 今年毕业用的时候 / 其实我是 是拒绝的

我跟老大讲 我拒绝 / 因为其实我根本写不来 Ruby

老大跟我讲 重新写一个 / 页面很黑 很亮 很 024d61

写了一个星期 PHP 之后呢 / 页面 DUANG～

Running environment:
- PHP >= 5.3
  - w/ [mysqlnd](https://dev.mysql.com/downloads/connector/php-mysqlnd/)
  - w/ [PhpRedis](https://github.com/phpredis/phpredis)
- Node.js
  - w/ [node_redis](https://github.com/mranney/node_redis)
  - w/ [ws](https://github.com/websockets/ws)
- Redis
- MySQL
  - `grad.sql` for schema
- Apache HTTP Server
  - `apache2.sample.conf` for configuration sample
  - any other HTTP server will also work

Building tools required:
- Grunt
  - run `npm install` under `frontend` directory and everything will be ready
