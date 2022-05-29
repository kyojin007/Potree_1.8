import * as THREE from 'three';
import { isptincamera } from './addcameras';

export class Scene {
  cameras = [];
  SCALEIMG = 3;
  mouse = { x: 0, y: 0, doUse: false };
  INTERSECTED = null;
  camsvisible = true;
  cameraplaneview = false;
  lastXYZ = [0, 0, 0];
  raycaster = new THREE.Raycaster();
  wantcamsvisible = true;
  // ncams = camX.length;
  // sfm.currentid = sfm.ncams - 1;
  mapshow = true;
  lookAtPtNum = null;
  dofilterimages = false;
  lastLookAtPt = [0, 0, 0];

  constructor(target) {
    this.viewer = new Potree.Viewer(document.getElementById(target));
    this.viewer.setEDLEnabled(true);
    this.viewer.setFOV(60);
    this.viewer.setPointBudget(1 * 1000 * 1000);
    this.viewer.setEDLEnabled(false);
    this.viewer.setBackground("gradient"); // ["skybox", "gradient", "black", "white"];
    this.viewer.loadSettingsFromURL();
  }

  addCamera(camera) {
      this.cameras.push(camera);
  }

  get ncams() {
    return this.cameras.length;
  }
  get currentid() {
    return this.cameras.length - 1;
  }
  set currentid(id) {
    this.currentid = id;
  }

  // RETURN CURRENT CAMERA POSITION [X, Y, Z]
  get currentPos() {
    return [
      Math.round(this.viewer.scene.view.position.x * 100) / 100,
      Math.round(this.viewer.scene.view.position.y * 100) / 100,
      Math.round(this.viewer.scene.view.position.z * 100) / 100
    ];
  }

  /**
   * get the scene camera orientation and position
   * @returns {Object}
   */
  get cameraXYZPT() {
    return {
        x: this.viewer.scene.view.position.x,
        y: this.viewer.scene.view.position.y,
        z: this.viewer.scene.view.position.z,
        yaw: this.viewer.scene.view.yaw,
        pitch: this.viewer.scene.view.pitch
    }
  }

  /**
   *
   */
  checkIntersections() {
    const raycaster = this.raycaster;
    const viewer = this.viewer;

    if (this.mouse.doUse) {
        raycaster.setFromCamera(this.mouse, viewer.scene.cameraP);

        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(viewer.scene.scene.children, true);
        if (intersects.length > 0) {
          let dist2obj = 99999;
          // loop thru intersected objects
          for (let i = 0; i < intersects.length; i++) {
            // console.log(intersects[i]);
            // see if it has 5 vertices (pyramid)
            // if (intersects[i].object.geometry.vertices.length === 5) {
            if (intersects[i].object.children.length > 0) {
              // if it does, see if it's closer than the last distance
              if (intersects[i].distance < dist2obj) {
                dist2obj = intersects[i].distance;
                if (this.INTERSECTED !== intersects[i].object) { // if it isnt the previous object
                    if (this.INTERSECTED) {
                      this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex); //change the old one back
                    }

                    this.INTERSECTED = intersects[i].object; //make this the new one
                    this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex(); // get its color
                    intersects[i].object.material.color.set(0xff0000); // change it's color
                }
              }
            }
          }
        } else {
          if (this.INTERSECTED) {
            this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
          }
          this.INTERSECTED = null;
        }
        // renderer.render( scene, camera );
    } else {
      if (this.INTERSECTED) {
        this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
      }
      this.INTERSECTED = null;
    }
  }

  /**
   * reposition the global camera position
   *
   * @param {*} id
   */
  flyToCam(id) {
    if (id < this.ncams) {
        imageplane.visible = false;
        this.viewer.fpControls.stop();
        changetoOrbitmode();
        moveCamera(id);
        changeImagePlane(id);
        this.lastXYZ= [
          Math.round(camX[id]*100)/100,
          Math.round(camY[id]*100)/100,
          Math.round(camZ[id]*100)/100
        ];
        $('#toggleimageplane').removeClass('disabled');
        $('#togglecam').addClass('disabled');
        turnImagesOff();
        this.currentid = id;
        this.cameraplaneview = true;
        this.camsvisible = true;

        $('#btnimagenum').text(id.toString());
        $('#cameraicon').addClass('buttonfgclicked');
        if (this.lookAtPtNum !== null) {
            const xyzlookat = this.viewer.scene.measurements[this.lookAtPtNum].children[3].getWorldPosition();
            this.viewer.scene.view.lookAt(xyzlookat);
        }
    } else {
        console.log(id.toString() + 'Out of Range (Max = ' + this.ncams.toString() + ')')
    }
  }

  /**
   * reposition global camera to endpt in a number of steps over given timeframe
   * @param {*} endpt
   * @param {*} steps
   * @param {*} tottime
   */
  flyTo(endpt, steps, tottime) {
    XYZPTstart = getCameraXYZPT();
    XYZPTend = endpt;
    flyTimer = setInterval(stepflyTo, tottime / steps);
    setTimeout(function() {
      clearTimeout(flyTimer);
    }, tottime);

    deltabetween[0] = (XYZPTend.x - XYZPTstart.x) / steps;
    deltabetween[1] = (XYZPTend.y - XYZPTstart.y) / steps;
    deltabetween[2] = (XYZPTend.z - XYZPTstart.z) / steps;
    deltabetween[3] = (XYZPTend.yaw - XYZPTstart.yaw) / steps;
    deltabetween[4] = (XYZPTend.pitch - XYZPTstart.pitch) / steps;
  }

  /**
  *
  */
  stepflyTo(deltabetween) {
    this.viewer.scene.view.position.x += deltabetween[0];
    this.viewer.scene.view.position.y += deltabetween[1];
    this.viewer.scene.view.position.z += deltabetween[2];
    this.viewer.scene.view.yaw += deltabetween[3];
    this.viewer.scene.view.pitch += deltabetween[4];
  }

  /**
   * CHECK TO SEE IF CAMERA HAS MOVED. IF YES, GET OUT OF FIRST PERSON VIEW AND REMOVE CAMERA PLANE
   */
  checkMovement() {
    // only check if imageplane is visible
    const cameraplaneview = this.cameraplaneview;
    if (cameraplaneview) {
      const currentXYZ = getCurrentPos();
      if (currentXYZ[0] != this.lastXYZ[0] || currentXYZ[1] != this.lastXYZ[1] || currentXYZ[2] != this.lastXYZ[2]) {
        imageplane.visible=false;
        changetoflymode();
        if (camsvisible | cameraplaneview) {
          turnImagesOn();
        }
        this.cameraplaneview = false;
        // fix issue where radius was crazy far away
        if (this.viewer.scene.view.radius > 50) {
          this.viewer.scene.view.radius = 50;
        }
      }
    }

    if (this.lookAtPtNum != null && dofilterimages && !cameraplaneview) {
      const currentlookatpt = this.viewer.scene.measurements[this.lookAtPtNum].children[3].getWorldPosition();

      if (currentlookatpt.x != lastLookAtPt.x || currentlookatpt.y != lastLookAtPt.y || currentlookatpt.z != lastLookAtPt.z) {
        filterImages(camPix, camFocal);
        console.log("filtering images");
        lastLookAtPt = currentlookatpt;
      }
    }
  }

  /**
   *
   * @param {*} id
   */
  changeImagePlane(id) {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    // clear thumbnail content
    imageplane.children[0].material.dispose();
    // load full sized image
    imageplane.children[0].material.map = loader.load(camdir + '01_IMAGES/' + camname[id]);

    const camera = this.cameras[id];

    imageplane.position.x = camera.x;
    imageplane.position.y = camera.y;
    imageplane.position.z = camera.z;

    imageplane.rotation.x = camera.roll * Math.PI / 180;
    imageplane.rotation.y = camera.pitch * Math.PI / 180;
    imageplane.rotation.z = camera.yaw * Math.PI / 180;

    imageplane.scale.x = scene.SCALEIMG;
    imageplane.scale.y = scene.SCALEIMG;
    imageplane.scale.z = scene.SCALEIMG;

    imageplane.visible = true;
  }

  /**
   * hide the thumbnails
   */
  turnImagesOff() {
    if (this.camsvisible) {
      const nimages = this.cameras.length;
      this.camsvisible = false;
      for (let j = 0; j < nimages; j++) {
        this.cameras[j].visible = false;
      }
    }
    // TODO: should find another place for this, perhaps fire event?
    $('#cameraicon').removeClass('buttonfgclicked');
  }

  /**
   * show the thumbnails
   */
  turnImagesOn(camPix, camFocal) {
    if (!this.camsvisible) {
        const nimages = this.cameras.length;
        this.camsvisible = true;
        for (let j = 0; j < nimages; j++) {
          this.cameras[j].visible = true;
        }
        this.filterImages(camPix, camFocal);
    }
    // TODO: should find another place for this, perhaps fire event?
    $('#cameraicon').addClass('buttonfgclicked');
}

  /**
   * toggle the state of showing thumbnails
   */
 toggleImagesVisible() {
    let nimages = this.cameras.length;
    this.camsvisible = !this.camsvisible;
    for (let j = 0; j < nimages; j++) {
        this.cameras[j].visible = camsvisible;
    }
    wantcamsvisible = camsvisible; // ??
  }

  /**
   *
   * @param {*} camPix
   * @param {*} camFocal
   */
  filterImages(camPix, camFocal) {
    if (this.lookAtPtNum !== null & this.dofilterimages === true) {
      const xyzlookat = this.viewer.scene.measurements[this.lookAtPtNum].children[3].getWorldPosition();

      const Xw = xyzlookat.x;
      const Yw = xyzlookat.y;
      const Zw = xyzlookat.z;

      // let testid = 1080;
      const f = camFocal;
      const cx = camPix[0] / 2;
      const cy = camPix[1] / 2;

      for (let imagenum = 0; imagenum < ncams; imagenum++) {
        const c = this.cameras[imagenum];
        const Xc = c.x;
        const Yc = c.y;
        const Zc = c.z;
        const Rx = c.roll;
        const Ry = c.pitch;
        const Rz = c.yaw;

        if (!isptincamera(f, cx, cy, Xc, Yc, Zc, Xw, Yw, Zw, Rx, Ry, Rz)) {
          this.cameras[imagenum].visible = false;
          this.cameras[imagenum].isFiltered = true;
        } else {
          this.cameras[imagenum].visible = true;
          this.cameras[imagenum].isFiltered = false;
        }
        this.camsvisible = true;
      }
    }
  }

}
