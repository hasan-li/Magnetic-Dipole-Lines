// Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setClearColor('white');    // set background color

// Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
camera.position.set(15,15,15);
camera.lookAt(scene.position);   // camera looks at origin
const ambientLight = new THREE.AmbientLight("white");
scene.add(ambientLight);


// creating NorthSphere (blue)
const NorthGeometry = new THREE.SphereBufferGeometry( 1.0, 32, 32 );
const NorthMaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
const NorthSphere = new THREE.Mesh( NorthGeometry, NorthMaterial );
scene.add( NorthSphere );

const numberOfVectors = 1,
    numberOfPoints = 30;
    h = 0.1,
    vectorArr = [numberOfPoints];


for ( let i = 0; i < numberOfVectors; i++ ){

    let coordinates = randomSpherePoint(0.0, 0.0, 0.0, 1.0),
        r = new Array(numberOfPoints - 1).fill(0);

    console.log("coordinates");
    console.log(coordinates);
    // scalar multiplication of vector by factor 0.1
    // coordinates = coordinates.map(function(x) { return x * h; });

    r[0] = magneticDipole(coordinates);
    console.log(r[0])

    vectorArr[0] = new THREE.Vector3( coordinates[0], coordinates[1], coordinates[2] );
    vectorArr[1] = new THREE.Vector3( r[0][0], r[0][1], r[0][2] );

    for ( var j = 1; j < numberOfPoints - 1; j++ ){
        r[j] = new Array(3).fill(0);
        // scalar multiplication of vector by factor 0.1
        var multScalar = r[j-1].map(function(x) { return x * h; });

        for ( var k = 0; k < 3; k++ ) {
            r[j][k] = r[j-1][k] + magneticDipole(multScalar)[k];
            vectorArr[j+1] = new THREE.Vector3( r[j][0], r[j][1], r[j][2] );
        }
    } // end of for loop

    console.log("r:");
    console.log(r);

    const curve = new THREE.CatmullRomCurve3( vectorArr );

	// create curve mesh
	const geometry = new THREE.Geometry();
	geometry.vertices = curve.getSpacedPoints( 100 );

	const material = new THREE.LineBasicMaterial( { color : 0x000000 } );
	const curveObject = new THREE.Line( geometry, material );
	scene.add( curveObject );

	// visualize spaced points
	const sphereGeomtry = new THREE.SphereBufferGeometry( 0.03 );
	const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

	const spacedPoints = curve.getPoints( numberOfPoints );

    // adding dots on curve
	for ( var point of spacedPoints ) {
		const helper = new THREE.Mesh( sphereGeomtry, sphereMaterial );
		helper.position.copy( point );
		scene.add( helper );
	}
}

// displaying axis
var axisHelper = new THREE.AxisHelper( 5 );
scene.add( axisHelper );


var controls = new THREE.TrackballControls( camera, canvas );
// var computerClock = new THREE.Clock();

//main function for rendering
function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);

    // var dt = computerClock.getDelta();  // must be before call to getElapsedTime, otherwise dt=0 !!!
    // var t = computerClock.getElapsedTime();
}


render();
// console.clear();

/**
 * Field of a magnetic dipole,
 * see https://en.wikipedia.org/wiki/Magnetic_dipole
 * The factor mu_0 / 4*pi is ignored because it is not needed for visualization.
 *
 * @param{Array} r 3 element array containing coordintes of point where field is evaluated
 * @param{Array} m 3 element array containing magnetic dipole moment.
 * @return{Array} 3 element array containing the magnetic field vector at point r
 */
function magneticDipole(r, m=[0,0,1]) {
  let rlen = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]);
  let B = new Array(3);
  for(let k = 0; k<3; ++k) {
    B[k] = 3*r[k]*(r[0]*m[0] + r[1]*m[1] + r[2]*m[2])/Math.pow(rlen,5) - m[k]/Math.pow(rlen,3);
  }
  return B;
}

/*
Returns a random point of a sphere, evenly distributed over the sphere.
The sphere is centered at (x0,y0,z0) with the passed in radius.
The returned point is returned as a three element array [x,y,z].
*/
function randomSpherePoint(x0, y0, z0, radius){
   let u = Math.random();
   let v = Math.random();
   let theta = 2 * Math.PI * u;
   let phi = Math.acos(2 * v - 1);
   let x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
   let y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
   let z = z0 + (radius * Math.cos(phi));
   return [x,y,z];
}



console.log( rungeKutta4(1.0, 0.0, 0.2, sRoot) )



function rungeKutta4(y, x, dx, sRoot) {
    let k1 = dx * sRoot(x, y),
        k2 = dx * sRoot(x + dx / 2.0,   y + k1 / 2.0),
        k3 = dx * sRoot(x + dx / 2.0,   y + k2 / 2.0),
        k4 = dx * sRoot(x + dx,         y + k3);

    return y + (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0;
}

function sRoot(x, y) {
    return x * Math.sqrt(y);
}
