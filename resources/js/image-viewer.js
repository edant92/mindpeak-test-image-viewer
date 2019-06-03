let viewer = OpenSeadragon({
  id: "openseadragon-viewer",
  prefixUrl: "./resources/images/",
  tileSources: "http://88.99.242.100:50004/01%2F03%2F0001.jpg/info.json",
  crossOriginPolicy: "Anonymous",

});

let selectEnabled = false;

let startPosition = 0;

let elt2 = document.createElement("div");
elt2.id = "area-selector-overlay";
elt2.className = "highlight";
elt2.style.background = "transparent";
elt2.style.opacity = "1.0";
elt2.style.outline = "1px solid white";

viewer.addOverlay({
  element: elt2,
  x: 0,
  y: 0,
  width: 0,
  height: 0
});

viewer.addHandler('canvas-press', function (event) {
  if (selectEnabled) {
    startPosition = event.position;
  }
});

viewer.addHandler('canvas-drag', function (event) {
  if (selectEnabled) {
    event.preventDefaultAction = true;

    let webPoint = event.position;

    let viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    let viewportPointStart = viewer.viewport.pointFromPixel(startPosition);

    let overlayX = viewportPointStart.x;
    let overlayY = viewportPointStart.y;
    let overlayWidth = (viewportPoint.x - viewportPointStart.x);
    let overlayHeight = (viewportPoint.y - viewportPointStart.y);

    if ((overlayWidth < 0) && (overlayHeight < 0)) {
      overlayWidth = Math.abs(viewportPointStart.x - viewportPoint.x);
      overlayHeight = Math.abs(viewportPointStart.y - viewportPoint.y);
      overlayX = viewportPoint.x;
      overlayY = viewportPoint.y;
    } else if ((overlayWidth < 0) && (overlayHeight > 0)) {
      overlayWidth = Math.abs(viewportPoint.x - viewportPointStart.x);
      overlayX = viewportPoint.x;
      overlayY = viewportPoint.y - overlayHeight;
    } else if ((overlayWidth > 0) && (overlayHeight < 0)) {
      overlayHeight = Math.abs(viewportPointStart.y - viewportPoint.y);
      overlayX = viewportPoint.x - overlayWidth;
      overlayY = viewportPoint.y;
    }

    let overlay = viewer.getOverlayById("area-selector-overlay");

    let r = new OpenSeadragon.Rect(overlayX, overlayY, overlayWidth,
      overlayHeight);
    overlay.update(r, OpenSeadragon.Placement.CENTER);
    viewer.forceRedraw();
  }
});

let imageRegion = null;

viewer.addHandler('canvas-release', function (event) {
  if (selectEnabled) {

    let webPoint = event.position;

    let viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    let viewportPointStart = viewer.viewport.pointFromPixel(startPosition);

    let imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
    let imagePointStart = viewer.viewport.viewportToImageCoordinates(viewportPointStart);

    let overlayX = imagePointStart.x;
    let overlayY = imagePointStart.y;
    let overlayWidth = (imagePoint.x - imagePointStart.x);
    let overlayHeight = (imagePoint.y - imagePointStart.y);

    if ((overlayWidth < 0) && (overlayHeight < 0)) {
      overlayWidth = Math.abs(imagePointStart.x - imagePoint.x);
      overlayHeight = Math.abs(imagePointStart.y - imagePoint.y);
      overlayX = imagePoint.x;
      overlayY = imagePoint.y;
    } else if ((overlayWidth < 0) && (overlayHeight > 0)) {
      overlayWidth = Math.abs(imagePoint.x - imagePointStart.x);
      overlayX = imagePoint.x;
      overlayY = imagePoint.y - overlayHeight;
    } else if ((overlayWidth > 0) && (overlayHeight < 0)) {
      overlayHeight = Math.abs(imagePointStart.y - imagePoint.y);
      overlayX = imagePoint.x - overlayWidth;
      overlayY = imagePoint.y;
    }

    imageRegion = Math.round(overlayX) + ","
      + Math.round(overlayY) + ","
      + Math.round(overlayWidth) + ","
      + Math.round(overlayHeight);
  }
});

new OpenSeadragon.MouseTracker({
  element: elt2,
  dblClickHandler: function () {

    let imageDownloadRequestURL = "http://88.99.242.100:50004/01%2F03%2F0001.jpg/" + imageRegion + "/1024,/0/default.png";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", imageDownloadRequestURL);
    xhr.responseType = 'blob';
    xhr.onload = function () {

      loadImage.parseMetaData(xhr.response, function () {

        let orientation = 1;
        let viewOrientation = viewer.viewport.getRotation();

        switch (viewOrientation) {
          case 0:
            orientation = 1;
            break;
          case 90:
            orientation = 6;
            break;
          case 180:
            orientation = 3;
            break;
          case 270:
            orientation = 8;
            break;
        }

        loadImage(
          xhr.response,
          function (canvas) {

            let base64data = canvas.toDataURL('image/png');
            saveAs(base64data, "sample.png");

          }, {
            canvas: true,
            orientation: orientation
          }
        );
      });

    };
    xhr.send()

  }
});

let buttonDown = false;

let toggleButton = new OpenSeadragon.Button({
  tooltip: 'Toggle Select',
  srcRest: './resources/images/select_save_rest.png',
  srcGroup: './resources/images/select_save_grouphover.png',
  srcHover: './resources/images/select_save_hover.png',
  srcDown: './resources/images/select_save_pressed.png',
  onPress: function () {

    if (buttonDown) {
      selectEnabled = false;
      buttonDown = false;
      toggleButton.currentState = OpenSeadragon.ButtonState.DOWN;

      let r = new OpenSeadragon.Rect(0, 0, 0, 0);
      let overlay = viewer.getOverlayById("area-selector-overlay");
      overlay.update(r, OpenSeadragon.Placement.CENTER);
      viewer.forceRedraw();
    } else {
      selectEnabled = true;
      buttonDown = true;
      toggleButton.currentState = OpenSeadragon.ButtonState.REST;
    }

  },
});

viewer.addHandler('open', () => {
  viewer.addControl(toggleButton.element, {anchor: OpenSeadragon.ControlAnchor.TOP_LEFT});
});

viewer.addHandler('canvas-key', function (event) {

  if (event.originalEvent.keyCode === 69) {

    if (buttonDown) {
      selectEnabled = false;
      buttonDown = false;
      toggleButton.currentState = OpenSeadragon.ButtonState.DOWN;

      let r = new OpenSeadragon.Rect(0, 0, 0, 0);
      let overlay = viewer.getOverlayById("area-selector-overlay");
      overlay.update(r, OpenSeadragon.Placement.CENTER);
      viewer.forceRedraw();
    } else {
      selectEnabled = true;
      buttonDown = true;
      toggleButton.currentState = OpenSeadragon.ButtonState.REST;
    }

  }

});