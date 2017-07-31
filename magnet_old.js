var camera, container, controls, effect, element, renderer, scene;

var clock = new THREE.Clock();

init();
animate();

function init() {
    renderer = new THREE.WebGLRenderer();
    element = renderer.domElement;
    container = document.getElementById('mycanvas');
    container.appendChild(element);

    effect = new THREE.StereoEffect(renderer);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, 10, 0.001, 700);
    camera.position.set(5, 5, 5);
    scene.add(camera);

    controls = new THREE.OrbitControls(camera, element);
    controls.target.set(
        camera.position.x + 0.1,
        camera.position.y,
        camera.position.z
    );
    controls.noZoom = true;
    controls.noPan = true;

    function setOrientationControls(e) {
        if (!e.alpha) {
            return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        element.addEventListener('click', fullscreen, false);

        window.removeEventListener('deviceorientation', setOrientationControls, true);
    }

    window.addEventListener('deviceorientation', setOrientationControls, true);


    var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
    scene.add(light);

    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading,
        shininess: 20,
        specular: 0xffffff
    });

    var geometry = new THREE.PlaneGeometry(1000, 1000);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    // creating NorthSphere (blue)
    var NorthGeometry = new THREE.SphereBufferGeometry( 0.5, 32, 32 );
    var NorthMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    var NorthSphere = new THREE.Mesh( NorthGeometry, NorthMaterial );
    scene.add( NorthSphere );


    // creating SouthSphere (red)
    var SouthGeometry = new THREE.SphereBufferGeometry( 0.5, 32, 32 );
    var SouthMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    var SouthSphere = new THREE.Mesh( SouthGeometry, SouthMaterial );
    scene.add( SouthSphere );

    // distance between NorthSphere and SouthSphere is 3.0
    SouthSphere.position.x = 0.0;
    SouthSphere.position.z = 3.0;
    SouthSphere.position.y = 0.0;


    var numberOfVectors = 50;

    for ( var i = 0; i < numberOfVectors; i++ ){
        var coordinates = randomSpherePoint(0, 0, 0, 0.5);

        var r = magneticDipole(coordinates);

        // curve
        const curve = new THREE.CatmullRomCurve3( [
            new THREE.Vector3( coordinates[0], coordinates[1], coordinates[2] ),
            new THREE.Vector3( r[0], r[1], r[2] ),
            new THREE.Vector3( coordinates[0], coordinates[1], coordinates[2] + 3.0 )
        ] );

        // create curve mesh
        const geometry = new THREE.Geometry();
        geometry.vertices = curve.getSpacedPoints( 100 );

        const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
        const curveObject = new THREE.Line( geometry, material );
        scene.add( curveObject );

        // visualize spaced points
        const sphereGeomtry = new THREE.SphereBufferGeometry( 0.03 );
        const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

        const spacedPoints = curve.getPoints( 15 );

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
    function randomSpherePoint(x0,y0,z0,radius){
        var u = Math.random();
        var v = Math.random();
        var theta = 2 * Math.PI * u;
        var phi = Math.acos(2 * v - 1);
        var x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
        var y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
        var z = z0 + (radius * Math.cos(phi));
        return [x,y,z];
    }

    window.addEventListener('resize', resize, false);
    setTimeout(resize, 1);
}

function resize() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}

function update(dt) {
    resize();
    camera.updateProjectionMatrix();
    controls.update(dt);
}

function render() {
    effect.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);

    update(clock.getDelta());
    render();
}

function fullscreen() {
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    }
}
