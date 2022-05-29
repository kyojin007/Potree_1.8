
/**
 *
 * @returns
 */
function getCameraXYZPT (viewer) {
    return {
        x: viewer.scene.view.position.x,
        y: viewer.scene.view.position.y,
        z: viewer.scene.view.position.z,
        yaw: viewer.scene.view.yaw,
        pitch: viewer.scene.view.pitch
    }
}

/**
 *
 * @param {*} endpt
 * @param {*} steps
 * @param {*} tottime
 */
function flyTo(endpt,steps,tottime){
    XYZPTstart = getCameraXYZPT();
    XYZPTend = endpt;
    flyTimer = setInterval(stepflyTo,tottime/steps);
    setTimeout(function(){ clearTimeout(flyTimer); }, tottime);

    deltabetween[0] = (XYZPTend.x - XYZPTstart.x)/steps;
    deltabetween[1] = (XYZPTend.y - XYZPTstart.y)/steps;
    deltabetween[2] = (XYZPTend.z - XYZPTstart.z)/steps;
    deltabetween[3] = (XYZPTend.yaw - XYZPTstart.yaw)/steps;
    deltabetween[4] = (XYZPTend.pitch - XYZPTstart.pitch)/steps;
}

/**
 *
 */
function stepflyTo(){
    viewer.scene.view.position.x += deltabetween[0];
    viewer.scene.view.position.y += deltabetween[1];
    viewer.scene.view.position.z += deltabetween[2];
    viewer.scene.view.yaw += deltabetween[3];
    viewer.scene.view.pitch += deltabetween[4];
}

export { getCameraXYZPT, flyTo, stepflyTo };
