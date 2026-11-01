(function () {
  var ns = $.namespace("pskl.controller.settings.exportimage");

  ns.SvgExportController = function (piskelController) {
    this.piskelController = piskelController;
  };

  pskl.utils.inherit(
    ns.SvgExportController,
    pskl.controller.settings.AbstractSettingController
  );

  ns.SvgExportController.prototype.init = function () {
    var button = document.querySelector(".svg-download-button");
    this.addEventListener(button, "click", this.onDownloadClick_);
  };

  ns.SvgExportController.prototype.createSvgSpritesheet_ = function () {
    var width = this.piskelController.getWidth();
    var height = this.piskelController.getHeight();
    var columns = this.piskelController.getFrameCount();
    var rows = 1;

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      width * columns +
      '" height="' +
      height * rows +
      '"> <g shape-rendering="crispEdges">';

    for (var frameIndex = 0; frameIndex < columns; frameIndex++) {
      var canvas = this.piskelController.renderFrameAt(frameIndex, true);
      var pixels = canvas
        .getContext("2d")
        .getImageData(0, 0, width, height).data;
      var offsetX = frameIndex * width;

      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var index = (y * width + x) * 4;
          var red = pixels[index];
          var green = pixels[index + 1];
          var blue = pixels[index + 2];
          var alpha = pixels[index + 3];

          if (alpha === 0) {
            continue;
          }

          var color =
            "#" +
            [red, green, blue]
              .map(function (c) {
                return ("0" + c.toString(16)).slice(-2);
              })
              .join("");

          svg +=
            '<rect x="' +
            (offsetX + x) +
            '" y="' +
            y +
            '" width="1" height="1" fill="' +
            color +
            '"';

          if (alpha < 255) {
            svg += ' fill-opacity="' + alpha / 255 + '"';
          }
          svg += "/>";
        }
      }
    }

    svg += "</g></svg>";
    return svg;
  };

  ns.SvgExportController.prototype.onDownloadClick_ = function () {
    var svg = this.createSvgSpritesheet_();
    var fileName =
      this.piskelController.getPiskel().getDescriptor().name + ".svg";

    pskl.utils.BlobUtils.stringToBlob(
      svg,
      function (blob) {
        pskl.utils.FileUtils.downloadAsFile(blob, fileName);
      },
      "image/svg+xml"
    );
  };
})();
