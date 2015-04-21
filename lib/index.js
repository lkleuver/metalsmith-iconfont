/* Rough port of https://github.com/sapegin/grunt-webfont */

var multimatch = require('multimatch');
var Promise = require("bluebird");
var path = require('path');
var _ = require("underscore");
var MemoryStream = require('memorystream');
var generate = require("./generate");

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
    return preBuild(files)
      .then(buildFontFiles)
      .then(buildHelperFiles)
      .nodeify(done);
  };
  

  function preBuild(_files) {
    console.log("-- prebuild");

    options.fontHeight = 512;
    options.decent = 64;
    options.normalize = true;
    options.round = 10e12;

    var Font = {
      options: options,
      fonts: {},
      types: {ttf: true, wof: true, wof2: true, eot: true},
      name: options.name ? options.name : "iconfont",
      files: _files,
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
      var cp = 0xF101;
      Font.glyphs = _.map(svgs, function(v, key, list) {
        return {
          name: path.basename(v).replace(path.extname(v), ''),
          codepoint: cp++,
          svg: Font.files[v]
        };
      });


      //if options delete svg files
      _.each(svgs, function(svg) {
        delete Font.files[svg];
      });

      return Font;
    }).then(generateFonts);
  }

  function buildHelperFiles(Font) {
    console.log("-- helper files");
    return Promise.resolve(Font);
  }
};

function generateFonts(Font) {
  console.log("-- generate fonts");
  return generate(Font);
}

