/* Rough port of https://github.com/sapegin/grunt-webfont */

var multimatch = require('multimatch');
var Promise = require("bluebird");
var path = require('path');
var _ = require("underscore");

/**
 * A Metalsmith plugin to create icon fonts and helper files.
 */
module.exports = function plugin(options) {
  options = options || {};
  
  
  /**
   *
   * @param {Object} files
   * @param {Metalsmith} metalsmith
   * @param {Function} done
   */
  return function(files, metalsmith, done) {
    console.log(metalsmith);

    return preBuild(files)
      .then(buildFontFiles)
      .then(buildHelperFiles)
      .nodeify(done);
  };
  

  function preBuild(_files) {
    console.log("-- prebuild");
    options.engine = 'fontforge';

    var Font = {
      options: options,
      name: options.name ? options.name : "iconfont",
      files: _files,
      svgFiles: null,
      glyphs: []
    };
    console.log(options);
    return Promise.resolve(Font);
  }

  function buildFontFiles(Font) {
    return Promise.filter(Object.keys(Font.files), function (_path) {
      return multimatch(_path, Font.options.src).length > 0
    }).then(function(svgs) {
      console.log("-- get meta data");
      Font.svgFiles = svgs;

      var cp = 0xF101;
      Font.glyphs = _.map(svgs, function(v, key, list) {
        return {
          name: path.basename(v).replace(path.extname(v), ''),
          codePoint: cp++
        };
      });
      return Font;
    });
  }

  function buildHelperFiles(Font) {
    console.log("-- helper files");
    console.log(Font);
    return Promise.resolve(Font);
  }
};

function generateFonts(Font) {
  console.log("-- generate fonts");
  var engine = require('./engines/' + Font.options.engine);
  engine({
      files: Font.svgFiles,
      rename: function(n) { return n;}
    }, function(result) {
    if (result === false) {
      return Promise.reject("Font generation failed");
    }

    if (result) {
      return Promise.resolve(Font);
    }
  });
}

