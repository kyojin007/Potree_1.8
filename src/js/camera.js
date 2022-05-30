import * as THREE from 'three';

export class Camera {
  constructor(imagePath, roll, pitch, yaw, x, y, z) {
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
    const imagetexture = loader.load(this.imagePath);

    const pixx = camPix[0] / camFocal;
    const pixy = camPix[1] / camFocal;

    // create a geometry to hold the image
    const imageplane = new THREE.PlaneGeometry(pixx, pixy, 1, 1);
    const imagematerial = new THREE.MeshBasicMaterial({ 'map': imagetexture, 'side': THREE.DoubleSide });
    const image = new THREE.Mesh(imageplane, imagematerial);

    // create a pyramid shape to indicate the direction
    const pyramidgeometry = new THREE.BufferGeometry();
    const pyramid_pts = [
      new THREE.Vector3(0.5, 0.5, 0.5),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(1, 0, 0)
    ];
    pyramidgeometry.setFromPoints(pyramid_pts);

    const pyramidmaterial = new THREE.MeshBasicMaterial(
        {
            color: 0xf8f9fa,
            wireframe: true
        }
    );

    const pyramid = new THREE.Mesh(pyramidgeometry, pyramidmaterial);

    // create a object group
    const imagepyramid  = new THREE.Object3D();

    // add the image and the pyramid to the group
    imagepyramid.add(image);
    imagepyramid.add(pyramid);

    // position the group
    imagepyramid.position.x = this.x;
    imagepyramid.position.y = this.y;
    imagepyramid.position.z = this.z;

    // rotate to the correct orientation
    imagepyramid.rotation.x = this.roll * Math.PI / 180;
    imagepyramid.rotation.y = this.pitch * Math.PI / 180;
    imagepyramid.rotation.z = this.yaw * Math.PI / 180;

    // and scale
    imagepyramid.scale.x = scale;
    imagepyramid.scale.y = scale;
    imagepyramid.scale.z = scale;

    return imagepyramid
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
