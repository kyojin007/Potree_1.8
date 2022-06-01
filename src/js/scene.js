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

  constructor(target, camdir, camPix, camFocal) {
    this.viewer = new Potree.Viewer(document.getElementById(target));
    this.viewer.setEDLEnabled(true);
    this.viewer.setFOV(60);
    this.viewer.setPointBudget(1 * 1000 * 1000);
    this.viewer.setEDLEnabled(false);
    this.viewer.setBackground("gradient"); // ["skybox", "gradient", "black", "white"];
    this.viewer.loadSettingsFromURL();

    this.camdir = camdir;
    this.camPix = camPix;
    this.camFocal = camFocal;
  }

  addCamera(camera) {
    this.cameras.push(camera);
  }

  addFrustrum(obj, i) {
    obj.isFiltered = false;
    obj.myImageNum = i;

    this.frustrum[i] = obj;
    this.viewer.scene.scene.add(obj);
  }

  /**
   * create a plane to hold the full sized images
   */
  addImagePlane() {
    if (this.cameras.length > 0) {
      this.imageplane = this.cameras[0].makeImagePlane(
        this.camPix,
        this.camFocal
      );

      this.viewer.scene.scene.add(this.imageplane);
      this.imageplane.visible = false;
    } else {
      console.error('No cameras defined');
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
    console.log('flyToCam(%i)', id, this.camsvisible);

    const cam = this.cameras[id];

    if (id < this.ncams) {
        this.imageplane.visible = false;
        this.viewer.fpControls.stop();

        // this.changeToOrbitMode();
        this.changeToFlyMode();

        // move the global view to the position of image[id]
        this.moveCamera(id);

        // alter the plane to match this camera
        this.changeImagePlane(id);

        // store position so we can test for movement
        this.lastXYZ = [
          Math.round(cam.x * 100) / 100,
          Math.round(cam.y * 100) / 100,
          Math.round(cam.z * 100) / 100
        ];

        // these don't seem to be in use
        $('#toggleimageplane').removeClass('disabled');
        $('#togglecam').addClass('disabled');

        // turn off the camera position thumbnails
        this.turnImagesOff();
        this.currentid = id;
        this.cameraplaneview = true;
        this.camsvisible = true;

        // add the selected image number to the button
        $('#btnimagenum').text(id.toString());

        // TODO: work out what this does
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
   * place the full sized images into the imageplane and orientate
   *
   * @param {*} id
   */
  changeImagePlane(id) {
    const camera = this.cameras[id];
    console.log('changeImagePlane(%i) %o', id, camera)

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    // clear previous content
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
    const nimages = this.cameras.length;
    this.camsvisible = false;
    for (let j = 0; j < nimages; j++) {
      this.frustrum[j].visible = false;
    }

    const detail = { 'view': false, 'count': 0 };
    const event = new CustomEvent('imagesViewChanged', { 'bubbles': true, 'detail': detail });
    document.dispatchEvent(event);
  }

  /**
   * show the thumbnails
   */
  turnImagesOn() {
    console.log('turnImagesOn()', this.camsvisible);
    const nimages = this.cameras.length;
    this.camsvisible = true;
    for (let j = 0; j < nimages; j++) {
      this.frustrum[j].visible = true;
    }
    this.filterImages(this.camPix, this.camFocal);

    const detail = { 'view': true, 'count': nimages };
    const event = new CustomEvent('imagesViewChanged', { 'bubbles': true, 'detail': detail });
    document.dispatchEvent(event);
}

  /**
   * toggle the state of showing thumbnails
   */
 toggleImagesVisible() {
    let nimages = this.cameras.length;
    this.camsvisible = !this.camsvisible;
    for (let j = 0; j < nimages; j++) {
        this.frustrum[j].visible = this.camsvisible;
    }

    const detail = { 'view': false, 'count': nimages };
    const event = new CustomEvent('imagesViewChanged', { 'bubbles': true, 'detail': detail });
    document.dispatchEvent(event);

    // wantcamsvisible = camsvisible; // ??
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
    console.log('moveCamera(%o)', cam);

    // move the global view to the position of the image camera
    this.viewer.scene.view.position.x = cam.x;
    this.viewer.scene.view.position.y = cam.y;
    this.viewer.scene.view.position.z = cam.z;

    // https://threejs.org/docs/index.html?q=euler#api/en/math/Euler
    let a = new THREE.Euler(
      cam.roll * Math.PI / 180,
      cam.pitch * Math.PI / 180,
      cam.yaw * Math.PI / 180,
      'XYZ'
    );

    // https://threejs.org/docs/index.html?q=vector#api/en/math/Vector3
    // this appears to be one unit less in the Z axis
    let b = new THREE.Vector3(0, 0, -1);

    // apply the Euler rotational transform to orientate the global view
    // https://threejs.org/docs/index.html?q=vector#api/en/math/Vector3.applyEuler
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
    //this.viewer.setNavigationMode(Potree.FirstPersonControls);
    this.viewer.setControls(this.viewer.fpControls);
    this.viewer.fpControls.lockElevation = false;

    const event = new CustomEvent('navigationModeChanged', { 'bubbles': true, 'detail': { 'navmode': 'fly' } });
    document.dispatchEvent(event);
  }

  changeToOrbitMode() {
    // this.viewer.setNavigationMode(Potree.OrbitControls);
    this.viewer.setControls(this.viewer.orbitControls);
    this.viewer.fpControls.lockElevation = false;

    const event = new CustomEvent('navigationModeChanged', { 'bubbles': true, 'detail': { 'navmode': 'orbit' } });
    document.dispatchEvent(event);
  }

  changeToHelicopterMode() {
    this.viewer.setControls(this.viewer.fpControls);
    this.viewer.fpControls.lockElevation = true;

    const event = new CustomEvent('navigationModeChanged', { 'bubbles': true, 'detail': { 'navmode': 'helicopter' } });
    document.dispatchEvent(event);
  }

  changeToEarthMode() {
    this.viewer.setControls(this.viewer.earthControls);
    this.viewer.fpControls.lockElevation = false;

    const event = new CustomEvent('navigationModeChanged', { 'bubbles': true, 'detail': { 'navmode': 'earth' } });
    document.dispatchEvent(event);
  }
}
