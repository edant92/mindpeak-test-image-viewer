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

    let overlay = viewer.getOverlayById("area-selector-overlay");

    let r = new OpenSeadragon.Rect(viewportPointStart.x, viewportPointStart.y, (viewportPoint.x - viewportPointStart.x),
      (viewportPoint.y - viewportPointStart.y));
    overlay.update(r, OpenSeadragon.Placement.CENTER);
    viewer.forceRedraw();
  }
});

let region = null;

viewer.addHandler('canvas-release', function (event) {
  if (selectEnabled) {

    let webPoint = event.position;

    let viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    let viewportPointStart = viewer.viewport.pointFromPixel(startPosition);

    let imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
    let imagePointStart = viewer.viewport.viewportToImageCoordinates(viewportPointStart);

    region = Math.round(imagePointStart.x) + ","
      + Math.round(imagePointStart.y) + ","
      + Math.round(imagePoint.x - imagePointStart.x) + ","
      + Math.round(imagePoint.y - imagePointStart.y);
  }
});

new OpenSeadragon.MouseTracker({
  element: elt2,
  dblClickHandler: function () {

    let imageDownloadRequestURL = "http://88.99.242.100:50004/01%2F03%2F0001.jpg/" + region + "/1024,/0/default.png";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", imageDownloadRequestURL);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      saveAs(xhr.response, "sample.png");
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
