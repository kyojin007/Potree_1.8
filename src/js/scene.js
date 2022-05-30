import * as THREE from 'three';
import { isptincamera } from './addcameras';

export class Scene {
  cameras = [];
  frustrum = [];
  SCALEIMG = 3;
  mouse = { x: 0, y: 0, doUse: false };
  INTERSECTED = null;
  camsvisible = true;
  cameraplaneview = false;
  lastXYZ = [0, 0, 0];
  raycaster = new THREE.Raycaster();
  wantcamsvisible = true;
  mapshow = true;
  lookAtPtNum = null;
  dofilterimages = false;
  lastLookAtPt = [0, 0, 0];
  camdir = '';
  imageplane = null;

  constructor(target, camdir) {
    this.viewer = new Potree.Viewer(document.getElementById(target));
    this.viewer.setEDLEnabled(true);
    this.viewer.setFOV(60);
    this.viewer.setPointBudget(1 * 1000 * 1000);
    this.viewer.setEDLEnabled(false);
    this.viewer.setBackground("gradient"); // ["skybox", "gradient", "black", "white"];
    this.viewer.loadSettingsFromURL();

    this.camdir = camdir;
  }

  addCamera(camera) {
    this.cameras.push(camera);
  }

  addFrustrum(obj, i) {
    this.frustrum[i] = obj;
    this.viewer.scene.scene.add(obj);
  }

  addImagePlane(camPix, camFocal) {
    if (this.cameras.length > 0) {
      this.imageplane = this.cameras[0].makeImagePlane(
        camPix,
        camFocal
      );
      this.viewer.scene.scene.add(this.imageplane);
      this.imageplane.visible = false;
    }
  }

  get ncams() {
    return this.cameras.length;
  }
  get currentid() {
    return this._currentid;
  }
  set currentid(id) {
    // loop around if we reach either end of available cameras
    if (id > (this.ncams - 1)) {
      id = 0;
    }
    if (id < 0) {
      id = this.ncams - 1;
    }

    this._currentid = id;
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
    console.log('flyToCam(%i)', id);

    const cam = this.cameras[id];

    if (id < this.ncams) {
        this.imageplane.visible = false;
        this.viewer.fpControls.stop();
        this.changeToOrbitMode();
        this.moveCamera(id);
        this.changeImagePlane(id);

        this.lastXYZ= [
          Math.round(cam.x * 100) / 100,
          Math.round(cam.y * 100) / 100,
          Math.round(cam.z * 100) / 100
        ];

        $('#toggleimageplane').removeClass('disabled');
        $('#togglecam').addClass('disabled');
        this.turnImagesOff();
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
        this.imageplane.visible=false;
        this.changeToFlyMode();
        if (camsvisible | cameraplaneview) {
          this.turnImagesOn();
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
    const camera = this.cameras[id];

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    // clear thumbnail content
    this.imageplane.children[0].material.dispose();
    // load full sized image
    this.imageplane.children[0].material.map = loader.load(camera.imagePath);

    this.imageplane.position.x = camera.x;
    this.imageplane.position.y = camera.y;
    this.imageplane.position.z = camera.z;

    this.imageplane.rotation.x = camera.roll * Math.PI / 180;
    this.imageplane.rotation.y = camera.pitch * Math.PI / 180;
    this.imageplane.rotation.z = camera.yaw * Math.PI / 180;

    this.imageplane.scale.x = this.SCALEIMG;
    this.imageplane.scale.y = this.SCALEIMG;
    this.imageplane.scale.z = this.SCALEIMG;

    this.imageplane.visible = true;
  }

  /**
   * hide the thumbnails
   */
  turnImagesOff() {
    if (this.camsvisible) {
      const nimages = this.cameras.length;
      this.camsvisible = false;
      for (let j = 0; j < nimages; j++) {
        this.frustrum[j].visible = false;
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
          this.frustrum[j].visible = true;
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
        this.frustrum[j].visible = camsvisible;
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

  /**
   *
   * @param {*} id
   */
  moveCamera(id) {
    const cam = this.cameras[id];
    this.viewer.scene.view.position.x = cam.x;
    this.viewer.scene.view.position.y = cam.y;
    this.viewer.scene.view.position.z = cam.z;

    let a = new THREE.Euler(
      cam.roll * Math.PI / 180,
      cam.pitch * Math.PI / 180,
      cam.yaw * Math.PI / 180,
      'XYZ'
    );

    let b = new THREE.Vector3(0, 0, -1);
    b.applyEuler(a);
    b.x = b.x + cam.x;
    b.y = b.y + cam.y;
    b.z = b.z + cam.z;

    //var lookatpt = [camX[id]+b.x, camY[id]+b.y, camZ[id]+b.z];
    this.viewer.scene.view.lookAt(b);

    // viewer.scene.view.pitch = (camRoll[id] -90)* Math.PI/180;
    // viewer.scene.view.yaw = camYaw[id] * Math.PI/180;
    // viewer.fpControls.stop();
  }

  /**
   * CHANGE CAMERA MODE
   */
  changeToFlyMode() {
    // this.viewer.setNavigationMode(Potree.OrbitControls);
    this.viewer.changeToOrbitMode;
  }

  changeToOrbitMode() {
    //this.viewer.setNavigationMode(Potree.FirstPersonControls);
    this.viewer.changeToFlyMode;
    this.viewer.fpControls.lockElevation = true;
  }

}
