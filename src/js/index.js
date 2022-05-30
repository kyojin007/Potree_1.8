import { Camera } from './camera';
import { Scene } from './scene';

// these settings will eventually come from an external project specific source
//var camdir='https://datapoints-io-maptiles.s3.eu-west-2.amazonaws.com/echo-alfa/bvi-tortola/SteelePoint3/sfm/assets/';
const camdir = './assets/';
const camname = ['DJI_0002.jpg','DJI_0003.jpg','DJI_0004.jpg','DJI_0005.jpg','DJI_0006.jpg','DJI_0007.jpg','DJI_0008.jpg','DJI_0009.jpg','DJI_0010.jpg','DJI_0011.jpg','DJI_0012.jpg','DJI_0013.jpg','DJI_0014.jpg','DJI_0015.jpg','DJI_0016.jpg','DJI_0017.jpg','DJI_0018.jpg','DJI_0019.jpg','DJI_0020.jpg','DJI_0021.jpg','DJI_0022.jpg','DJI_0023.jpg','DJI_0024.jpg','DJI_0025.jpg','DJI_0026.jpg','DJI_0027.jpg','DJI_0028.jpg','DJI_0029.jpg','DJI_0030.jpg','DJI_0031.jpg','DJI_0032.jpg','DJI_0033.jpg','DJI_0034.jpg','DJI_0035.jpg','DJI_0036.jpg','DJI_0037.jpg','DJI_0038.jpg','DJI_0039.jpg','DJI_0040.jpg','DJI_0041.jpg','DJI_0042.jpg','DJI_0043.jpg','DJI_0044.jpg','DJI_0045.jpg','DJI_0046.jpg','DJI_0047.jpg','DJI_0048.jpg','DJI_0049.jpg','DJI_0050.jpg','DJI_0051.jpg','DJI_0052.jpg','DJI_0053.jpg','DJI_0054.jpg','DJI_0055.jpg','DJI_0056.jpg','DJI_0058.jpg','DJI_0059.jpg','DJI_0060.jpg','DJI_0061.jpg','DJI_0062.jpg','DJI_0063.jpg','DJI_0064.jpg','DJI_0065.jpg','DJI_0066.jpg','DJI_0067.jpg','DJI_0068.jpg','DJI_0069.jpg','DJI_0070.jpg','DJI_0071.jpg','DJI_0072.jpg','DJI_0073.jpg','DJI_0074.jpg','DJI_0075.jpg','DJI_0076.jpg','DJI_0077.jpg','DJI_0078.jpg','DJI_0079.jpg','DJI_0080.jpg','DJI_0081.jpg','DJI_0082.jpg','DJI_0083.jpg','DJI_0084.jpg','DJI_0085.jpg','DJI_0086.jpg','DJI_0087.jpg','DJI_0088.jpg','DJI_0089.jpg','DJI_0090.jpg','DJI_0091.jpg','DJI_0092.jpg','DJI_0093.jpg','DJI_0094.jpg','DJI_0095.jpg','DJI_0096.jpg','DJI_0097.jpg','DJI_0098.jpg','DJI_0099.jpg','DJI_0102.jpg','DJI_0103.jpg','DJI_0105.jpg','DJI_0106.jpg','DJI_0107.jpg','DJI_0108.jpg','DJI_0110.jpg','DJI_0111.jpg','DJI_0112.jpg','DJI_0114.jpg','DJI_0115.jpg'];
const camX = [318561.301,318580.381,318590.664,318601.684,318612.768,318623.570,318634.837,318645.762,318655.441,318667.532,318679.043,318690.251,318701.129,318706.742,318701.821,318692.380,318681.218,318670.118,318659.274,318648.107,318637.003,318625.836,318614.867,318603.572,318592.535,318581.349,318570.180,318562.933,318565.292,318575.787,318586.759,318597.428,318608.818,318619.542,318630.389,318641.686,318652.590,318663.767,318674.753,318685.833,318696.825,318708.687,318703.329,318694.162,318683.015,318671.875,318660.747,318649.681,318638.752,318627.716,318616.629,318605.550,318594.491,318583.148,318572.394,318571.405,318569.601,318565.624,318563.063,318563.010,318565.351,318569.883,318576.320,318584.401,318593.930,318604.546,318616.455,318629.255,318642.191,318654.608,318666.257,318676.792,318686.592,318694.838,318700.914,318704.580,318705.920,318705.005,318701.783,318696.222,318688.843,318679.655,318669.060,318657.387,318644.795,318632.160,318619.208,318607.146,318595.990,318586.222,318577.737,318571.101,318649.585,318647.698,318647.822,318647.044,318647.292,318607.019,318609.918,318599.088,318603.241,318602.732,318646.644,318645.973,318644.725,318644.615,318661.986,318662.147];
const camY = [2034064.974,2034067.746,2034067.014,2034066.292,2034065.783,2034065.767,2034065.649,2034065.458,2034068.678,2034065.274,2034064.342,2034064.525,2034064.304,2034062.760,2034088.931,2034087.902,2034087.725,2034087.910,2034088.191,2034088.633,2034088.915,2034089.214,2034089.441,2034089.660,2034089.899,2034090.180,2034090.564,2034091.065,2034115.854,2034114.595,2034113.920,2034113.147,2034113.114,2034112.202,2034112.905,2034112.665,2034112.670,2034112.200,2034112.196,2034112.155,2034111.876,2034112.886,2034135.930,2034134.973,2034134.655,2034135.105,2034135.465,2034135.798,2034135.931,2034136.231,2034136.667,2034136.787,2034137.041,2034137.408,2034137.679,2034130.986,2034127.131,2034116.829,2034104.366,2034091.275,2034078.668,2034066.859,2034056.289,2034047.033,2034039.389,2034033.434,2034029.152,2034027.012,2034027.154,2034029.596,2034034.254,2034040.618,2034049.261,2034059.609,2034071.365,2034083.860,2034096.439,2034109.272,2034121.654,2034133.713,2034144.183,2034153.173,2034160.304,2034165.468,2034168.480,2034169.100,2034167.391,2034163.605,2034157.716,2034150.252,2034140.921,2034130.259,2034069.741,2034070.012,2034070.230,2034071.078,2034060.591,2034062.001,2034070.832,2034106.195,2034099.658,2034099.191,2034110.112,2034117.366,2034106.170,2034104.911,2034085.656,2034085.688];
const camZ = [66.217,67.376,67.429,67.222,67.098,67.397,67.531,67.703,71.155,67.678,67.441,67.305,66.849,65.846,67.689,67.409,67.564,67.560,67.664,67.603,67.492,67.574,67.560,67.552,67.505,67.257,67.306,67.827,67.880,67.771,67.672,67.180,67.140,66.855,67.138,66.953,66.888,67.590,66.518,67.345,67.378,67.407,67.252,67.299,67.224,67.198,67.189,67.013,67.029,67.087,67.091,67.008,67.016,67.247,67.290,67.259,67.102,66.934,67.280,66.888,66.471,66.858,67.257,67.049,66.931,66.850,66.552,66.332,66.903,67.006,67.053,67.106,67.014,67.039,66.803,66.395,66.332,66.449,66.216,66.180,66.427,66.563,66.607,66.657,66.652,66.771,66.922,66.881,66.988,67.033,67.202,66.974,18.678,18.094,18.245,18.474,19.565,22.278,35.028,35.115,34.838,34.887,44.734,37.892,37.663,38.211,40.242,40.167];
const camRoll = [1.153,-0.478,-0.023,0.147,0.224,0.348,0.468,0.529,-3.472,0.713,0.671,0.724,0.811,0.341,0.686,0.423,0.466,0.506,0.564,0.611,0.670,0.749,0.802,0.840,0.842,0.851,0.811,1.208,2.000,1.840,1.729,1.509,1.369,1.166,0.967,0.761,0.619,0.501,0.371,0.280,0.186,-0.084,0.204,0.233,0.273,0.306,0.348,0.354,0.438,0.454,0.467,0.390,0.470,0.354,0.072,-38.598,-36.311,-26.112,-8.435,11.836,29.625,41.656,49.790,55.126,58.617,60.824,62.209,62.770,62.537,61.486,59.558,56.538,51.870,44.447,33.733,18.217,-0.808,-19.499,-33.785,-44.479,-51.561,-56.130,-59.040,-60.837,-61.792,-61.944,-61.291,-59.849,-57.328,-53.657,-47.704,-39.157,84.873,86.923,73.613,53.739,81.972,89.259,66.630,-35.097,4.247,0.168,0.798,-42.384,36.600,64.088,45.442,45.760];
const camPitch = [-3.109,0.966,0.438,0.049,-0.274,-0.578,-0.883,-1.175,-2.600,-1.584,-1.780,-1.947,-2.138,-1.086,-2.262,-2.134,-1.805,-1.541,-1.295,-1.068,-0.853,-0.626,-0.436,-0.261,-0.074,0.093,0.247,1.397,1.119,0.492,0.110,-0.261,-0.546,-0.823,-1.073,-1.333,-1.554,-1.765,-1.987,-2.181,-2.357,-0.927,-2.807,-2.397,-2.080,-1.791,-1.551,-1.310,-1.069,-0.849,-0.621,-0.582,-0.348,-0.324,0.039,-53.999,-55.293,-59.336,-62.491,-62.226,-58.364,-52.393,-45.064,-37.086,-28.829,-20.552,-11.700,-2.581,6.746,15.863,24.757,33.268,41.516,49.500,55.994,60.567,62.103,60.219,55.678,48.931,40.975,32.569,23.917,15.094,5.774,-3.038,-12.570,-21.312,-30.153,-38.278,-46.402,-53.376,12.242,3.797,-11.559,-4.530,3.575,-42.241,-44.397,-72.476,-73.716,-73.248,-47.833,-67.179,-69.251,-57.834,-8.473,-8.633];
const camYaw = [-151.839,-82.145,-82.137,-82.429,-83.022,-83.567,-84.182,-84.790,-85.374,-85.894,-86.420,-86.907,-88.023,-51.424,80.300,93.684,93.532,93.023,92.477,91.934,91.431,90.937,90.495,90.049,89.675,89.314,89.014,56.919,-87.849,-95.599,-96.311,-96.455,-96.677,-96.658,-96.678,-96.635,-96.587,-96.506,-96.454,-96.383,-96.311,-61.622,74.192,87.720,88.109,88.079,87.995,87.902,87.811,87.748,87.695,87.712,87.717,87.727,87.553,-134.428,-131.684,-119.569,-99.333,-76.475,-56.026,-41.433,-30.662,-22.552,-16.163,-10.885,-5.900,-1.120,3.734,8.713,14.127,20.236,27.734,37.994,51.299,69.394,90.932,112.126,128.861,142.287,152.251,159.822,165.961,171.309,176.414,-178.972,-173.811,-168.719,-162.777,-156.119,-147.208,-135.944,0.592,-0.271,-4.197,-4.872,-0.272,-0.048,-15.680,-125.714,-84.798,-89.049,-89.424,-135.334,-51.441,-21.845,-8.089,-8.256];
const camFocal = 4552.94;
const camPix = [5280,3956];
const thumbs = '02_THUMBNAILS/';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const ptcloud = urlParams.get('ptcloud');

console.log(ptcloud);

const scene = new Scene('potree_render_area');

const viewer = scene.viewer;

// let measuringTool = new Potree.MeasuringTool(viewer);
let url = '';

if (ptcloud) {
    // const url = 'https://datapoints-io-maptiles.s3.eu-west-2.amazonaws.com/echo-alfa/forensic-roofing-solutions/bergham-mews/pointcloud/pointclouds/Bergham_Mews/metadata.json';
    url = 'https://datapoints-io-maptiles.s3.eu-west-2.amazonaws.com/echo-alfa/' + ptcloud + '/metadata.json';
} else {
    //url = "https://datapoints-io-maptiles.s3.eu-west-2.amazonaws.com/echo-alfa/bvi-tortola/SteelePoint3/sfm/assets/05_POTREEDATA/pointclouds/index/cloud.js";
    url = 'https://datapoints-io-maptiles.s3.eu-west-2.amazonaws.com/echo-alfa/bvi-tortola/SteelePoint3/point_cloud_21/metadata.json';
}

Potree.loadPointCloud(url, 'pointcloud', e => {
    let pointcloud = e.pointcloud;
    let material = pointcloud.material;
    viewer.scene.addPointCloud(pointcloud);
    //material.pointColorType = Potree.PointColorType.RGB; // any Potree.PointColorType.XXXX
    material.size = 1;
    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
    material.shape = Potree.PointShape.SQUARE;
    viewer.fitToScreen();
});

    /*
    var XYZPTstart = getCameraXYZPT(viewer);
    var XYZPTend = getCameraXYZPT();
    var deltabetween = [0, 0, 0, 0, 0];
    var flyTimer;
    */

document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mousedown', onDocumentMouseClick, false);
document.addEventListener('keydown', onDocumentKeyPress, false);

// ADD PYRAMIDS TO SCENE
for (let imagenum = 0; imagenum < camX.length; imagenum++) {
    const c = new Camera(
        camdir + thumbs + camname[imagenum],
        camRoll[imagenum],
        camPitch[imagenum],
        camYaw[imagenum],
        camX[imagenum],
        camY[imagenum],
        camZ[imagenum]
    );

    scene.addCamera(c);

    scene.addFrustrum(
      c.makeImageFrustrum(
        camPix,
        camFocal,
        scene.SCALEIMG
      ), imagenum
    );

    /*
    imageobj[imagenum].myimagenum = imagenum;
    imageobj[imagenum].isFiltered = false;
    viewer.scene.scene.add(imageobj[imagenum]);
    */
}

$('#btnimagenum').html(camX.length);
scene.currentid = 0;

// ADD IMAGE PLANE TO SCENE AS INVISIBLE - I think this stores the larger image for display when we click
const imageplane = scene.cameras[0].makeImagePlane(
  camPix,
  camFocal
);
viewer.scene.scene.add(imageplane);
imageplane.visible = false;

//checks if user moved the screen, and therefore imageplane should be turned off
setInterval(scene.checkMovement, 10000);
// plot the camera view onto Leaflet mini map
// setInterval(cameraOnMap, 10000);

/**
 * add some quick short cut keys
 *
 * @param {*} event
 */
 function onDocumentKeyPress(event){
  const keycode = event.code;
  switch (keycode) {
    case "Space":
      scene.flyTo(scene.getCameraXYZPT, 100, 5000);
      break;
    case "Digit1":
      XYZPTend = scene.getCameraXYZPT;
      break;
  }
  console.log(event);
}

// HANDLE MOUSE OVER PYRAMIDS
function onDocumentMouseMove(event) {
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  // TODO: do we really need this for every mouse move! should just be required on click?
  // update the mouse variable
  scene.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  scene.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  let elementType = '';
  // did the click happen over the CANVAS element?
  try {
    elementType = document.elementFromPoint(event.clientX, event.clientY).tagName;
  } catch(err) {
    elementType = 'ERROR';
  }

  scene.mouse.doUse = elementType === 'CANVAS';
  // did we click over an image?
  scene.checkIntersections();
}

/**
 *
 * @param {*} event
 */
function onDocumentMouseClick(event) {
  console.log(event, scene.mouse);
  // doUse is enabled if we click on the CANVAS
  if (scene.mouse.doUse && event.button === 0) {
    if (scene.INTERSECTED !== null) {
      flytoimagenum = scene.INTERSECTED.parent.myimagenum;
      scene.flyToCam(flytoimagenum);
    }
  }
}

// UI Event Handlers
$('#toggleimage').on('click', function (e) {
  e.preventDefault();
  console.log('toggle images %o %o', scene.camsvisible, scene.cameraplaneview);
  if (scene.camsvisible) {
    if (scene.cameraplaneview) {
      imageplane.visible = false;
    } else {
      scene.turnImagesOff();
    }
    this.camsvisible = false;
    $('#cameraicon').removeClass('buttonfgclicked');
  } else {
    if (scene.cameraplaneview) {
      imageplane.visible = true;
    } else {
      scene.turnImagesOn();
    }
    this.camsvisible = true;
    $('#cameraicon').addClass('buttonfgclicked');
  }
});

$('#imgleft').on('click', function (e) {
  scene.currentid--;
  console.log('previous image: %i', scene.currentid);

  let count = 0;
  let flag = true;
  if (scene.dofilterimages) {
      while (scene.frustrum[scene.currentid].isFiltered) {
          scene.currentid--;
          count++;
          if (currentid < 0) {
            currentid = scene.ncams - 1;
          }

          if (count > scene.ncams) {
            flag = false;
            break;
          }
      }
  }

  if (flag) {
    scene.flyToCam(scene.currentid);
  }
});

$('#imgright').on('click', function (e) {
  scene.currentid++;
  console.log('previous image: %i', scene.currentid);

  let count = 0;
  let flag = true;

  if (scene.dofilterimages) {
    while (scene.frustrum[scene.currentid].isFiltered) {
      scene.currentid++;
      count++;

      if (count > scene.ncams) {
        flag = false;
        break;
      }
    }
  }
  if (flag) {
    scene.flyToCam(scene.currentid);
  }
});


export { scene };
