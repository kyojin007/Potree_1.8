
// Useful for debugging
function changeImagePlaneOrientation(Rx,Ry,Rz){
    imageplane.rotation.x = Rx * Math.PI/180;
    imageplane.rotation.y = Ry * Math.PI/180;
    imageplane.rotation.z = Rz * Math.PI/180;
}


function changeCameraOrientation(pitch,yaw){
    viewer.scene.view.pitch = pitch * Math.PI / 180;
    viewer.scene.view.yaw = yaw * Math.PI / 180;
}



/**
 * plots the camera position onto the Leaflet mini-map?
 */
function cameraOnMap(uasmarker) {
    // Add Camera Dot to Map
    var camerapos = viewer.scene.view.position;
    var cameraLatLon = projected2WGS84(camerapos.x,camerapos.y);

    uasmarker.setLatLng(cameraLatLon);
    uasmarker.update();
    // Get Mean Z of PC to compute plane for footprint
    var meanZ = 0; // HARDCODED

    // Add camera Footprint to Map
    var xyzCamera = getCurrentPos();
    var campitch = viewer.scene.view.pitch;
    var camyaw = viewer.scene.view.yaw;
    var camfcxcy = calcCamerafcxcy();
    updateFootprintPanTilt(camerafootprintpolygon,xyzCamera[0],xyzCamera[1],xyzCamera[2]-meanZ,camyaw-Math.PI/2,campitch-Math.PI/2,camfcxcy[0],camfcxcy[1],camfcxcy[2]);

    // Add image footprint to Map
    if (cameraplaneview){
        updateFootprintRxyz(imagefootprintpolygon,camX[currentid],camY[currentid],camZ[currentid]-meanZ,camRoll[currentid],camPitch[currentid],camYaw[currentid],camFocal,camPix[0]/2,camPix[1]/2);
    }
    else {
        updateFootprintRxyz(imagefootprintpolygon,0,0,0,0,0,0,camFocal,camPix[0]/2,camPix[1]/2);
    }

    // add magenta dot if in camera
    if (lookAtPtNum != null){
        var camerapos = viewer.scene.measurements[lookAtPtNum].children[3].getWorldPosition();
        var cameraLatLon = projected2WGS84(camerapos.x,camerapos.y);

        lookatmarker.setLatLng(cameraLatLon);
        lookatmarker.update();
    }
    else {
        lookatmarker.setLatLng([0,0]);
        lookatmarker.update();    }
}

/**
 *
 * @returns
 */
function calcCamerafcxcy(){
    var camfov = viewer.getFOV()*Math.PI/180;
    var cx = window.innerWidth/2;
    var cy = window.innerHeight/2;
    var f = cy/Math.tan(camfov/2);
    return [f,cy,cx]
}

/**
 *
 * @param {*} polygon
 * @param {*} Xc
 * @param {*} Yc
 * @param {*} Zc
 * @param {*} Rx
 * @param {*} Ry
 * @param {*} Rz
 * @param {*} f
 * @param {*} cx
 * @param {*} cy
 */
function updateFootprintRxyz(polygon,Xc,Yc,Zc,Rx,Ry,Rz,f,cx,cy){
    Rx = Rx*Math.PI/180;
    Ry = (Ry-180)*Math.PI/180;
    Rz = -Rz*Math.PI/180;

    P = calcP_RxRyRz(Xc,Yc,Zc,Rx,Ry,Rz,f,cx,cy);
    footprintLL = calcFootprint(P,f,cx,cy);
    polygon.setLatLngs(footprintLL);
    polygon.redraw();
}

/**
 *
 * @param {*} polygon
 * @param {*} Xc
 * @param {*} Yc
 * @param {*} Zc
 * @param {*} pan
 * @param {*} tilt
 * @param {*} f
 * @param {*} cx
 * @param {*} cy
 */
function updateFootprintPanTilt(polygon,Xc,Yc,Zc,pan,tilt,f,cx,cy){
    P = calcP_pantilt(Xc,Yc,Zc,pan,tilt,f,cx,cy);
    footprintLL = calcFootprint(P,f,cx,cy);
    polygon.setLatLngs(footprintLL);
    polygon.redraw();
}

/**
 *
 * @param {*} x
 * @param {*} y
 * @returns
 */
function projected2WGS84(x,y){
    let pointcloudProjection = "+proj=utm +zone=20 +ellps=GRS80 +datum=NAD83 +units=m +no_defs";
    let mapProjection = proj4.defs("WGS84");

    var lonlat = proj4(pointcloudProjection,mapProjection,[x,y]);

    return [lonlat[1], lonlat[0]]
}

/**
 *
 * @param {*} lat
 * @param {*} lng
 * @returns
 */
function projectedFromWGS84(lat,lng){
    let pointcloudProjection = "+proj=utm +zone=20 +ellps=GRS80 +datum=NAD83 +units=m +no_defs";
    let mapProjection = proj4.defs("WGS84");

    var xy = proj4(mapProjection,pointcloudProjection,[lng,lat]);

    return [xy[0], xy[1]]
}

/**
 *
 */
function markerdragged(){
    var LatLng = uasmarker.getLatLng();
    var newxy = projectedFromWGS84(LatLng.lat,LatLng.lng);

    viewer.scene.view.position.x = newxy[0];
    viewer.scene.view.position.y = newxy[1];
}

// PHOTOGRAMMETRY

/**
 *
 * @param {*} P
 * @param {*} f
 * @param {*} cx
 * @param {*} cy
 * @returns
 */
function calcFootprint(P,f,cx,cy){
    var footprintpixels = calcCornerPixHorizonTrim(P,f,cx,cy);
    if (footprintpixels.length==0){
        return([[0,0],[0,0],[0,0],[0,0]])
    }
    var i;
    var LLcorners = Array();
    for(i=0;i<footprintpixels.length;i++){
        var Putm = uv2xyconstz(footprintpixels[i][0],footprintpixels[i][1],P);
        LLcorners.push(projected2WGS84(Putm[0],Putm[1]));
    }
    return LLcorners
}

/**
 *
 * @param {*} Xc
 * @param {*} Yc
 * @param {*} Zc
 * @param {*} pan
 * @param {*} tilt
 * @param {*} f
 * @param {*} cx
 * @param {*} cy
 * @returns
 */
function calcP_pantilt(Xc,Yc,Zc,pan,tilt,f,cx,cy){
    let P1 = [f*Math.cos(pan)*Math.cos(tilt) + cx*Math.cos(pan)*Math.sin(tilt),
        f*Math.cos(tilt)*Math.sin(pan) + cx*Math.sin(pan)*Math.sin(tilt),
        cx*Math.cos(tilt) - f*Math.sin(tilt),
        - Xc*(f*Math.cos(pan)*Math.cos(tilt) + cx*Math.cos(pan)*Math.sin(tilt)) - Yc*(f*Math.cos(tilt)*Math.sin(pan) + cx*Math.sin(pan)*Math.sin(tilt)) - Zc*(cx*Math.cos(tilt) - f*Math.sin(tilt))];
    let P2 = [cy*Math.cos(pan)*Math.sin(tilt) - f*Math.sin(pan),
        f*Math.cos(pan) + cy*Math.sin(pan)*Math.sin(tilt),
        cy*Math.cos(tilt),
        Xc*(f*Math.sin(pan) - cy*Math.cos(pan)*Math.sin(tilt)) - Yc*(f*Math.cos(pan) + cy*Math.sin(pan)*Math.sin(tilt)) - Zc*cy*Math.cos(tilt)];
    let P3 = [Math.cos(pan)*Math.sin(tilt),
        Math.sin(pan)*Math.sin(tilt),
        Math.cos(tilt),
        - Zc*Math.cos(tilt) - Xc*Math.cos(pan)*Math.sin(tilt) - Yc*Math.sin(pan)*Math.sin(tilt)];
    return [P1, P2, P3];
}

/**
 *
 * @param {*} Xc
 * @param {*} Yc
 * @param {*} Zc
 * @param {*} Rx
 * @param {*} Ry
 * @param {*} Rz
 * @param {*} f
 * @param {*} cx
 * @param {*} cy
 * @returns
 */
function calcP_RxRyRz(Xc,Yc,Zc,Rx,Ry,Rz,f,cx,cy){
    let P1 = [cx*Math.sin(Ry) + f*Math.cos(Ry)*Math.cos(Rz),
        f*(Math.cos(Rx)*Math.sin(Rz) + Math.cos(Rz)*Math.sin(Rx)*Math.sin(Ry)) - cx*Math.cos(Ry)*Math.sin(Rx),
        f*(Math.sin(Rx)*Math.sin(Rz) - Math.cos(Rx)*Math.cos(Rz)*Math.sin(Ry)) + cx*Math.cos(Rx)*Math.cos(Ry),
        - Xc*(cx*Math.sin(Ry) + f*Math.cos(Ry)*Math.cos(Rz)) - Zc*(f*(Math.sin(Rx)*Math.sin(Rz) - Math.cos(Rx)*Math.cos(Rz)*Math.sin(Ry)) + cx*Math.cos(Rx)*Math.cos(Ry)) - Yc*(f*(Math.cos(Rx)*Math.sin(Rz) + Math.cos(Rz)*Math.sin(Rx)*Math.sin(Ry)) - cx*Math.cos(Ry)*Math.sin(Rx))];
    let P2 = [cy*Math.sin(Ry) - f*Math.cos(Ry)*Math.sin(Rz),
        f*(Math.cos(Rx)*Math.cos(Rz) - Math.sin(Rx)*Math.sin(Ry)*Math.sin(Rz)) - cy*Math.cos(Ry)*Math.sin(Rx),
        f*(Math.cos(Rz)*Math.sin(Rx) + Math.cos(Rx)*Math.sin(Ry)*Math.sin(Rz)) + cy*Math.cos(Rx)*Math.cos(Ry),
        - Xc*(cy*Math.sin(Ry) - f*Math.cos(Ry)*Math.sin(Rz)) - Zc*(f*(Math.cos(Rz)*Math.sin(Rx) + Math.cos(Rx)*Math.sin(Ry)*Math.sin(Rz)) + cy*Math.cos(Rx)*Math.cos(Ry)) - Yc*(f*(Math.cos(Rx)*Math.cos(Rz) - Math.sin(Rx)*Math.sin(Ry)*Math.sin(Rz)) - cy*Math.cos(Ry)*Math.sin(Rx))];
    let P3 = [Math.sin(Ry),
        -Math.cos(Ry)*Math.sin(Rx),
        Math.cos(Rx)*Math.cos(Ry),
        Yc*Math.cos(Ry)*Math.sin(Rx) - Zc*Math.cos(Rx)*Math.cos(Ry) - Xc*Math.sin(Ry)];
    return [P1, P2, P3];
}

/**
 *
 * @param {*} P
 * @param {*} f
 * @param {*} cx
 * @param {*} cy
 * @returns
 */
function calcCornerPixHorizonTrim(P,f,cx,cy) {
    // determine angle to not go over
    let horizonangle = 85 * Math.PI / 180;
    // [ 4       1 ]
    // |           | Pixel corners in this order
    // |           |
    // [ 3       2 ]

    var pix_of_corners = [[cx*2, 1],
        [cx*2, cy*2],
        [1, cy*2],
        [1, 1]];

    var el_of_corners = Array(4);

    var i;
    for(i=0;i<4;i++){
        el_of_corners[i] = calcEl(P,pix_of_corners[i][0],pix_of_corners[i][1]);
    }

    var pixellist = Array();
    for(i=0;i<4;i++){
        var i1 = i;
        var i2 = i+1;if (i2==4){i2=0;}
        pixellist = calcSegmentInterp(pix_of_corners[i],pix_of_corners[i2],el_of_corners[i1],el_of_corners[i2],horizonangle,pixellist);
    }

    return pixellist;
}

function calcSegmentInterp(pix1, pix2, el1, el2, horizonangle, pixellist){
    // Null Case: both points are above the horizon angle
    if (el1>=horizonangle && el2>=horizonangle){return pixellist;}

    // If first below horizon, push that point to pixellist
    if (el1<horizonangle){
        pixellist.push(pix1);
        if (el2<horizonangle) {return pixellist;}
    }

    // Interpolate along segment
    // find whether xpix or ypix are varying
    var xvarying = false;
    if (pix1[1]==pix2[1]){xvarying=true;}
    // interpolate
    var T = (horizonangle-el1)/(el2-el1);
    if (xvarying){
        var ypix = pix1[1];
        var xpix = pix1[0] + (pix2[0] - pix1[0]) * T;
        pixellist.push([xpix, ypix])
    }
    else {
        var xpix = pix1[0];
        var ypix = pix1[1] + (pix2[1] - pix1[1]) * T;
        pixellist.push([xpix, ypix])
    }
    return pixellist;
}

function calcEl(P,pixx,pixy){
    var fullP = P.slice(0);
    var iP = math.inv([[fullP[0][0], fullP[0][1], fullP[0][2]],
        [fullP[1][0], fullP[1][1], fullP[1][2]],
        [fullP[2][0], fullP[2][1], fullP[2][2]]]);
    var uvs1 = [pixx,pixy,1];
    var xyz1 = math.multiply(iP,uvs1);

    var r = Math.sqrt((xyz1[0])**2+(xyz1[1])**2);
    var el = Math.PI/2 + Math.atan2(xyz1[2],r);

    return el;
}

/**
 *
 * @param {*} f
 * @param {*} cx
 * @param {*} cy
 * @param {*} Xc
 * @param {*} Yc
 * @param {*} Zc
 * @param {*} Xw
 * @param {*} Yw
 * @param {*} Zw
 * @param {*} Rx
 * @param {*} Ry
 * @param {*} Rz
 * @returns
 */
function isptincamera(f,cx,cy,Xc,Yc,Zc,Xw,Yw,Zw,Rx,Ry,Rz) {
    // XYZ Euler Order
    Rx = Rx * Math.PI / 180;
    Ry = Ry * Math.PI / 180;
    Rz = Rz * Math.PI / 180;

    var pixx = (Xc*(cx*Math.sin(Ry) + f*Math.cos(Ry)*Math.cos(Rz)) - Xw*(cx*Math.sin(Ry) + f*Math.cos(Ry)*Math.cos(Rz)) + Zc*(f*(Math.sin(Rx)*Math.sin(Rz) - Math.cos(Rx)*Math.cos(Rz)*Math.sin(Ry)) + cx*Math.cos(Rx)*Math.cos(Ry)) - Zw*(f*(Math.sin(Rx)*Math.sin(Rz) - Math.cos(Rx)*Math.cos(Rz)*Math.sin(Ry)) + cx*Math.cos(Rx)*Math.cos(Ry)) + Yc*(f*(Math.cos(Rx)*Math.sin(Rz) + Math.cos(Rz)*Math.sin(Rx)*Math.sin(Ry)) - cx*Math.cos(Ry)*Math.sin(Rx)) - Yw*(f*(Math.cos(Rx)*Math.sin(Rz) + Math.cos(Rz)*Math.sin(Rx)*Math.sin(Ry)) - cx*Math.cos(Ry)*Math.sin(Rx)))/(Xc*Math.sin(Ry) - Xw*Math.sin(Ry) + Zc*Math.cos(Rx)*Math.cos(Ry) - Zw*Math.cos(Rx)*Math.cos(Ry) - Yc*Math.cos(Ry)*Math.sin(Rx) + Yw*Math.cos(Ry)*Math.sin(Rx));
    var pixy = (Xc*(cy*Math.sin(Ry) - f*Math.cos(Ry)*Math.sin(Rz)) - Xw*(cy*Math.sin(Ry) - f*Math.cos(Ry)*Math.sin(Rz)) + Zc*(f*(Math.cos(Rz)*Math.sin(Rx) + Math.cos(Rx)*Math.sin(Ry)*Math.sin(Rz)) + cy*Math.cos(Rx)*Math.cos(Ry)) - Zw*(f*(Math.cos(Rz)*Math.sin(Rx) + Math.cos(Rx)*Math.sin(Ry)*Math.sin(Rz)) + cy*Math.cos(Rx)*Math.cos(Ry)) + Yc*(f*(Math.cos(Rx)*Math.cos(Rz) - Math.sin(Rx)*Math.sin(Ry)*Math.sin(Rz)) - cy*Math.cos(Ry)*Math.sin(Rx)) - Yw*(f*(Math.cos(Rx)*Math.cos(Rz) - Math.sin(Rx)*Math.sin(Ry)*Math.sin(Rz)) - cy*Math.cos(Ry)*Math.sin(Rx)))/(Xc*Math.sin(Ry) - Xw*Math.sin(Ry) + Zc*Math.cos(Rx)*Math.cos(Ry) - Zw*Math.cos(Rx)*Math.cos(Ry) - Yc*Math.cos(Ry)*Math.sin(Rx) + Yw*Math.cos(Ry)*Math.sin(Rx));
    var s = Xw*Math.sin(Ry) - Xc*Math.sin(Ry) - Zc*Math.cos(Rx)*Math.cos(Ry) + Zw*Math.cos(Rx)*Math.cos(Ry) + Yc*Math.cos(Ry)*Math.sin(Rx) - Yw*Math.cos(Ry)*Math.sin(Rx)

    let isgood = !(pixx<0 | pixx>(cx*2) | pixy<0 | pixy>(cy*2) | s>0);
    return isgood
}

/**
 *
 * @param {*} pixx
 * @param {*} pixy
 * @param {*} P
 * @returns
 */
function uv2xyconstz(pixx,pixy,P){
    //assumes Zw = 0;
    var Xw = (P[0][1]*P[1][3] - P[0][3]*P[1][1] - P[0][1]*P[2][3]*pixy + P[0][3]*P[2][1]*pixy + P[1][1]*P[2][3]*pixx - P[1][3]*P[2][1]*pixx)/(P[0][0]*P[1][1] - P[0][1]*P[1][0] - P[0][0]*P[2][1]*pixy + P[0][1]*P[2][0]*pixy + P[1][0]*P[2][1]*pixx - P[1][1]*P[2][0]*pixx);
    var Yw = -(P[0][0]*P[1][3] - P[0][3]*P[1][0] - P[0][0]*P[2][3]*pixy + P[0][3]*P[2][0]*pixy + P[1][0]*P[2][3]*pixx - P[1][3]*P[2][0]*pixx)/(P[0][0]*P[1][1] - P[0][1]*P[1][0] - P[0][0]*P[2][1]*pixy + P[0][1]*P[2][0]*pixy + P[1][0]*P[2][1]*pixx - P[1][1]*P[2][0]*pixx);
    var s = (P[0][0]*P[1][1]*P[2][3] - P[0][0]*P[1][3]*P[2][1] - P[0][1]*P[1][0]*P[2][3] + P[0][1]*P[1][3]*P[2][0] + P[0][3]*P[1][0]*P[2][1] - P[0][3]*P[1][1]*P[2][0])/(P[0][0]*P[1][1] - P[0][1]*P[1][0] - P[0][0]*P[2][1]*pixy + P[0][1]*P[2][0]*pixy + P[1][0]*P[2][1]*pixx - P[1][1]*P[2][0]*pixx);

    return [Xw, Yw, s];
}

export { cameraOnMap, isptincamera };
