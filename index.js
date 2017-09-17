// Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setClearColor('white');    // set background color
// Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(scene.position);   // camera looks at origin
const ambientLight = new THREE.AmbientLight("white");
scene.add(ambientLight);

// displaying axis
var axisHelper = new THREE.AxisHelper(5);
scene.add(axisHelper);
var controls = new THREE.TrackballControls(camera, canvas);
// var computerClock = new THREE.Clock();

// creating Sphere (blue)
const sphereGeometry = new THREE.SphereBufferGeometry(1.0, 32, 32);
// const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff, wireframe: true
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const numberOfPoints = 4;
const h = 0.1;

let r = randomSpherePoint(0.0, 0.0, 0.0, 1.0);
console.log("r:")
console.log(r)

// start point
const startPointGeometry = new THREE.SphereBufferGeometry(0.05, 16, 16);
const startPointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const startPoint = new THREE.Mesh(startPointGeometry, startPointMaterial);
startPoint.position.x = r[0];
startPoint.position.y = r[1];
startPoint.position.z = r[2];
scene.add(startPoint);



let B = [3];
let vector = [numberOfPoints];

// setting initial position on sphere
vector[0] = new THREE.Vector3(r[0], r[1], r[2]);

for (let i = 1; i < numberOfPoints - 1; i++){
    B = magneticDipole(r);
    B = B.map(function (x) { return x * h; });
    vector[i] = new THREE.Vector3(B[0], B[1], B[2]);
    console.log(B);
    r = B;
    console.log("------------------")
}
console.log("vector");
console.log(vector);

let curve = new THREE.CatmullRomCurve3(vector);
var curveGeometry = new THREE.Geometry();
curveGeometry.vertices = curve.getPoints(50);
var curveMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

// Create the final object to add to the scene
var curveObject = new THREE.Line(curveGeometry, curveMaterial);
scene.add(curveObject);





//main function for rendering
function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);

    // var dt = computerClock.getDelta();  // must be before call to getElapsedTime, otherwise dt=0 !!!
    // var t = computerClock.getElapsedTime();
}


/**
 * Field of a magnetic dipole,
 * see https://en.wikipedia.org/wiki/Magnetic_dipole
 * The factor mu_0 / 4*pi is ignored because it is not needed for visualization.
 *
 * @param{Array} r 3 element array containing coordintes of point where field is evaluated
 * @param{Array} m 3 element array containing magnetic dipole moment.
 * @return{Array} 3 element array containing the magnetic field vector at point r
 */
function magneticDipole(r, m = [0, 0, 1]) {
    let rlen = Math.sqrt(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]);
    let B = new Array(3);
    for (let k = 0; k < 3; ++k) {
        B[k] = 3 * r[k] * (r[0] * m[0] + r[1] * m[1] + r[2] * m[2]) / Math.pow(rlen, 5) - m[k] / Math.pow(rlen, 3);
    }
    return B;
}


/*
Returns a random point of a sphere, evenly distributed over the sphere.
The sphere is centered at (x0,y0,z0) with the passed in radius.
The returned point is returned as a three element array [x,y,z].
*/
function randomSpherePoint(x0, y0, z0, radius) {
    let u = Math.random();
    let v = Math.random();
    let theta = 2 * Math.PI * u;
    let phi = Math.acos(2 * v - 1);
    let x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
    let y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
    let z = z0 + (radius * Math.cos(phi));
    return [x, y, z];
}



render();