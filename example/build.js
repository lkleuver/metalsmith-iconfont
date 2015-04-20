var Metalsmith = require('metalsmith');
var iconfont = require('../lib'); // require('metalsmith-iconfont');

Metalsmith(__dirname)
  .use(iconfont(
  	{ 
  		src: 'svg/*.svg',
  		target: 'fonts'
  	}
  ))
  .build(function(err) { if (err) { throw err; } })
;