/**
 * MEASUREMENT FUNCTIONS
 */

/**
 * create a point showing the coordinates -- not very useful unless we can convert to lat/lng?
 * @param {Event} event
 */
function measPoint (event) {
  console.log('measPoint');
  const scene = event.data;
  const measuringTool = scene.measuringTool;

  scene.measurement = measuringTool.startInsertion(
    {
      'showDistances': false,
      'showAngles': false,
      'showCoordinates': true,
      'showArea': false,
      'closed': true,
      'maxMarkers': 1,
      'name': 'Point'
    }
  );
}

/**
 *
 * @param {*} event
 */
function measDistance (event) {
  const scene = event.data;
  const measuringTool = scene.measuringTool;
  scene.measurement = measuringTool.startInsertion({
    'showDistances': true,
    'showArea': false,
    'closed': false,
    'name': 'Distance'
  });

  const e = new CustomEvent('onMeasureTool', { 'bubbles': true, 'detail': { 'content': 'Click to set start position, then drag marker to measure distance' } });
  document.dispatchEvent(e);
}

/**
 *
 * @param {*} event
 */
function measHeight (event) {
  const scene = event.data;
  const measuringTool = scene.measuringTool;

  scene.measurement = measuringTool.startInsertion({
    'showDistances': false,
    'showHeight': true,
    'showArea': false,
    'closed': false,
    'maxMarkers': 2,
    'name': 'Height'
  });

  const e = new CustomEvent('onMeasureTool', { 'bubbles': true, 'detail': { 'content': 'Click on point to measure, then right drag to establish base' } });
  document.dispatchEvent(e);
}

/**
 *
 * @param {*} event
 */
function measAngle (event) {
  const scene = event.data;
  const measuringTool = scene.measuringTool;

  scene.measurement = measuringTool.startInsertion({
    'showDistances': false,
    'showAngles': true,
    'showArea': false,
    'closed': true,
    'maxMarkers': 3,
    'name': 'Angle'
  });

  const e = new CustomEvent('onMeasureTool', { 'bubbles': true, 'detail': { 'content': 'Click ...' } });
  document.dispatchEvent(e);
}

/**
 *
 * @param {*} event
 */
 function measArea (event) {
  const scene = event.data;
  const measuringTool = scene.measuringTool;

  scene.measurement = measuringTool.startInsertion({
    'showDistances': false,
    'showAngles': false,
    'showArea': true,
    'closed': true,
    'maxMarkers': 10,
    'name': 'Area'
  });

  const e = new CustomEvent('onMeasureTool', { 'bubbles': true, 'detail': { 'content': 'Click on start position, then drag from this point to add further vertices' } });
  document.dispatchEvent(e);
}

/**
 * measurement
 */
function measLookAt (event) {
  if (lookAtPtNum != null) {
    viewer.scene.measurements[lookAtPtNum].visible = false;
    lookAtPtNum = null;
    const lastLookAtPt = [0, 0, 0];
    $('#lookAtFilter').hide();
    $('#toggleLookAtPtVisible').hide();
    $('#lookatbtn').removeClass('buttonfgclicked');
    $('#filterbtn').addClass('buttonfgclicked');
    if (dofilterimages) {
      dofilterimages = false;
      if (camsvisible) {
        turnImagesOn();
      }
    }
  } else {
    lookAtPtNum = viewer.scene.measurements.length;
    const measurement = measuringTool.startInsertion({
      'showDistances': false,
      'showAngles': false,
      'showCoordinates': false,
      'showArea': false,
      'closed': true,
      'maxMarkers': 1,
      'name': 'Point'
    });

    viewer.scene.measurements[lookAtPtNum].children[3].material.color.setRGB(255, 0, 255);
    $('#lookAtFilter').show();
    $('#toggleLookAtPtVisible').show();
    $('#lookatvisible').addClass('buttonfgclicked');
    $('#lookatbtn').addClass('buttonfgclicked');
    $('#cameraicon').addClass('buttonfgclicked');
    $('#filterbtn').addClass('buttonfgclicked');
    dofilterimages = true;
  }
}

/**
 * clear measurements
 * @param {Event} event
 */
function measClear (event) {
  const s = event.data;

  s.viewer.scene.removeAllMeasurements();

  s.lookAtPtNum = null;
  s.dofilterimages = false;

  // $('#filterbtn').removeClass('buttonfgclicked');
  // $('#lookatbtn').removeClass('buttonfgclicked');

  s.turnImagesOn();
  if (s.cameraplaneview) {
    s.turnImagesOff();
  }

  // $('#lookAtFilter').hide();
  // $('#toggleLookAtPtVisible').hide();

  const e = new CustomEvent('onMeasureTool', { 'bubbles': true, 'detail': { 'content': 'Measurements cleared' } });
  document.dispatchEvent(e);
}

export { measPoint, measDistance, measHeight, measAngle, measArea, measLookAt, measClear };
