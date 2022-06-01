import * as THREE from 'three';

export class Camera {
  constructor(thumbPath, imagePath, roll, pitch, yaw, x, y, z) {
    this.thumbPath = thumbPath;
    this.imagePath = imagePath;
    this.roll = roll;
    this.pitch = pitch;
    this.yaw = yaw;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * create a representation of the camera in the scene with image and pyramid
   *
   * @param {*} camPix
   * @param {*} camFocal
   * @param {*} scale
   *
   * @returns {THREE.Object3D}
   */
  makeImageFrustrum (camPix, camFocal, scale) {
    // instantiate a loader
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const imagetexture = loader.load(this.thumbPath);

    const pixx = camPix[0] / camFocal;
    const pixy = camPix[1] / camFocal;

    // create a geometry to hold the image
    const imageplane = new THREE.PlaneGeometry(pixx, pixy, 1, 1);
    const imagematerial = new THREE.MeshBasicMaterial({ 'map': imagetexture, 'side': THREE.DoubleSide });
    const image = new THREE.Mesh(imageplane, imagematerial);

    console.log(imageplane.attributes);

    // create a pyramid shape to indicate the direction
    const pyramidgeometry = new THREE.BufferGeometry();

    // each Vector3 represents a point in space
    const height = 0.6;
    const pts = [
      // base, formed of two triangles
      /*
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(pixx, 0, 0),
      new THREE.Vector3(pixx, pixy, 0),

      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(pixx, pixy, 0),
      new THREE.Vector3(0, pixy, 0),
      */
      // front-right
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(pixx, 0, 0),
      new THREE.Vector3(pixx / 2, pixy / 2, height),
      // front-right
      new THREE.Vector3(pixx, 0, 0),
      new THREE.Vector3(pixx, pixy, 0),
      new THREE.Vector3(pixx / 2, pixy / 2, height),
      // front-right
      new THREE.Vector3(0, pixy, 0),
      new THREE.Vector3(pixx, pixy, 0),
      new THREE.Vector3(pixx / 2, pixy / 2, height),
      // front-right
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, pixy, 0),
      new THREE.Vector3(pixx / 2, pixy / 2, height),
    ];

    pyramidgeometry.setFromPoints(pts);

    // align the pyramid
    pyramidgeometry.translate(-pixx / 2, -pixy / 2, 0);
    // add a user property
    pyramidgeometry.userData = {'frustrum': true};

    const pyramidmaterial = new THREE.MeshBasicMaterial({
      color: 0xf8f9fa,
      wireframe: true
    });
    const pyramid = new THREE.Mesh(pyramidgeometry, pyramidmaterial);

    // create a object group https://threejs.org/docs/?q=object#api/en/objects/Group
    const frustrum = new THREE.Group();

    // add the image and the pyramid to the group
    frustrum.add(image);
    frustrum.add(pyramid);

    // position the group
    frustrum.position.x = this.x;
    frustrum.position.y = this.y;
    frustrum.position.z = this.z;

    // rotate to the correct orientation
    frustrum.rotation.x = this.roll * Math.PI / 180;
    frustrum.rotation.y = this.pitch * Math.PI / 180;
    frustrum.rotation.z = this.yaw * Math.PI / 180;

    // and scale
    frustrum.scale.x = scale;
    frustrum.scale.y = scale;
    frustrum.scale.z = scale;

    return frustrum;
  }

  /**
   *
   * @param {*} imagedir
   * @param {*} imagename
   * @param {*} camPix
   * @param {*} camFocal
   *
   * @returns {THREE.Object3D}
   */
  makeImagePlane(camPix, camFocal) {
    // instantiate a loader
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const imagetexture = loader.load(this.imagePath);

    const pixx = camPix[0] / camFocal;
    const pixy = camPix[1] / camFocal;

    const imageplane = new THREE.PlaneGeometry(pixx, pixy, 1, 1);

    const imagematerial = new THREE.MeshBasicMaterial({ 'map': imagetexture, 'side': THREE.DoubleSide });
    const image = new THREE.Mesh(imageplane, imagematerial);

    const imagepyramid  = new THREE.Object3D();

    imagepyramid.add(image);

    imagepyramid.children[0].material.opacity = 1;
    imagepyramid.children[0].material.transparent  = true;

    return imagepyramid
  }

  showCamera(viewer) {
    viewer.scene.scene.remove(this);
  }

  hideCamera(viewer) {

  }
}
