/**
 * grunt-webfont: Node.js engine
 *
 * @requires ttfautohint 1.00+ (optional)
 * @author Artem Sapegin (http://sapegin.me)
 */

module.exports = function(Font) {
	'use strict';

	var Promise = require("bluebird");
  var svgicons2svgfont = require("svgicons2svgfont");
  var StringDecoder = require('string_decoder').StringDecoder;
  var MemoryStream = require('memorystream');
  var SVGO = require("svgo");

	// @todo Ligatures

	return generateSVG(Font)
  .then(iff(Font.types.ttf, generateTTF))
  .then(iff(Font.types.woff, generateWof))
  .then(iff(Font.types.woff2, generateWof2))
  .then(iff(Font.types.eot, generateEOT));


  function generateSVG(Font) {
    return svgContentToStreams(Font)
      .then(createSVGFont(Font));
  }

  function generateTTF(Font) {
    console.log("-- generate ttf");
    return Promise.resolve(Font);
  }

  function generateWof(Font) {
    console.log("-- generate wof");
    return Promise.resolve(Font);
  }

  function generateWof2(Font) {
    console.log("-- generate wof2");
    return Promise.resolve(Font);
  }

  function generateEOT(Font) {
    console.log("-- generate eot");
    return Promise.resolve(Font);
  }


  function svgContentToStreams(Font) {
    console.log("==== start streams");
    return Promise.map(Font.glyphs, function(glyph) {
      return new Promise( function(resolve, reject) {
        var svgo = new SVGO();
        try {
          svgo.optimize(glyph.svg.contents.toString(), function(res) {
            glyph.stream = new MemoryStream(res.data, {
              writable: false
            });
            resolve(glyph);
          });
        }
        catch(err) {
          console.log("ERROR");
          reject(err);
        }
      });
    }).then(function (glyphs) {
      console.log("====== streams");
      return Promise.resolve(Font);
    });
  }

  function createSVGFont(Font) {
    console.log("======= create svg font");
    return new Promise(function (resolve, reject) {
      var font = '';
      var decoder = new StringDecoder('utf8');

      var stream = svgicons2svgfont(Font.glyphs, {
        fontName: Font.name,
        fontHeight: Font.options.fontHeight,
        descent: Font.options.descent,
        normalize: Font.options.normalize,
        round: Font.options.round,
        error: reject
      });

      stream.on('data', function(chunk) {
        font += decoder.write(chunk);
      });

      stream.on('end', function() {
        Font.fonts.svg = font;
        resolve(Font);
      });

    });
  }


  // found somewhere with google
	function iff(condition, doThen) {
 		return function(value) {
    	if (condition) return doThen(value);
    	return value;
    }
  }

};
