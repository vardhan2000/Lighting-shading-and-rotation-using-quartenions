import * as THREE from 'three'
import { OBJLoader } from 'https://unpkg.com/three/examples/jsm/loaders/OBJLoader.js';
// import TrackballControls from 'https://cdn.jsdelivr.net/npm/three-trackballcontrols@0.0.8/index.min.js';

const scene = new THREE.Scene();

// TODO comment the below
// scene.background = new THREE.Color(0xe5e5e5);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

let canvas = renderer.domElement;

document.body.appendChild(canvas);

const loader = new OBJLoader();

let primitives = 0;
let bbox;

function loadMeshObj(file, objID, objColor, scale = [1,1,1], pos) {

	loader.load(
		// resource URL
		file,
		// called when resource is loaded
		function (object) {
			object.traverse(function (obj) {
				if (obj.isMesh) {
					obj.material.color.setHex(objColor);
				}
			});

			object.name = objID;
			object.scale['x'] = scale[0]
			object.scale['y'] = scale[0]
			object.scale['z'] = scale[0]
			object.position['x'] = pos[0]
			object.position['y'] = pos[1]
			object.position['z'] = pos[2]

			console.log(object)
			scene.add(object);
			bbox = new THREE.Box3().setFromObject(scene.getObjectByName(objID))


		},
	);
	// if(scale!=null && scale != undefined){
	// 	scene.getObjectByName(objID).scale.set(scale[0],scale[1],scale[2]);
	// }
	primitives += 1;
}

function computeLimits(bbox) {
	let min, max, mid, l;
	let char = 'x';
	let limits = [];
	while(char != '{') {
		let lim = [];
		l = (bbox.max[char] - bbox.min[char]) * 1.25;
		mid = (bbox.max[char] + bbox.min[char]) * 0.5;
		min = mid - (l/2);
		max = mid + (l/2);

		lim.push(min); lim.push(max)
		limits.push(lim)
		char = String.fromCharCode(char.charCodeAt(0) + 1)
	}
	return limits;
}

loadMeshObj('./sphere.obj', (primitives + 3).toString(), 0x00ff00, [1,1,1],[-2.5,2.25,0]);
loadMeshObj('./teapot.obj', (primitives + 3).toString(), 0xff0000, [0.5,0.5,0.5],[1.25,-1.75,0]);

// if(scene.getObjectByName('4') != undefined){
// 	scene.getObjectByName("4").scale = new THREE.Vector3(0.5,0.5,0.5);
// }
// console.log(scene.getObjectByName('4'));
// scene.getObjectByName("4").scale = new THREE.Vector3(0.5,0.5,0.5);

let light = new THREE.AmbientLight(0xffffff)
light.name = "light"
scene.add(light)
scene.getObjectByName("light").visible = false;

const l3 = new THREE.PointLight( 0xffffff, 1, 100);
l3.position.set( 0, 0, 0 );
l3.name = "l3";
l3.decay = 2
scene.add( l3 );

const l4 = new THREE.PointLight( 0xffffff, 1, 100 );
l4.position.set( 0, 0, 0 );
l4.name = "l4";
l4.decay = 2;
scene.add( l4 );

camera.position.z = 5;

let mode = "none";
let selectedShape = null;
let moveBy = 0.05;
let offset = 1.5;

document.addEventListener('keydown', function (event) {
	console.log("Key pressed = ", event.key);
	
	let limits;
	if(mode == "i"){
		if(selectedShape!=null){
			bbox = new THREE.Box3().setFromObject(selectedShape)
			limits = computeLimits(bbox)
		}
	}

	if (event.key == "m") {
		mode = "m";
		selectedShape = null
	}

	else if(event.key == "s"){

		selectedShape.traverse(function (obj) {
			if (obj.isMesh) {
				let col = obj.material.color
				if(obj.material.type == 'MeshPhongMaterial'){
					obj.material.dispose()
					obj.material = new THREE.MeshLambertMaterial()
				} else {
					obj.material.dispose()
					obj.material = new THREE.MeshPhongMaterial()
				}
				obj.material.needsUpdate = true;
				
				obj.material.color = col;
			}
		});
		
	}

	else if (event.key == "i") {
		selectedShape = null;
		mode = "i";
	}

	else if (event.key == "x") {
		let lightName = "l" + selectedShape.name
		if(mode == "m"){
			selectedShape.position['x'] -= moveBy;
			scene.getObjectByName(lightName).position['x'] -= moveBy;
		}
		else if(mode == "i") {
			if(scene.getObjectByName(lightName).position['x'] - moveBy >= limits[0][0] - offset) {
				scene.getObjectByName(lightName).position['x'] -= moveBy; 
			}
		}
	}

	else if (event.key == "X") {
		let lightName = "l" + selectedShape.name
		if(mode == "m"){
			selectedShape.position['x'] += moveBy;
			scene.getObjectByName(lightName).position['x'] += moveBy; 
		}
		else if(mode == "i") {
			if(scene.getObjectByName(lightName).position['x'] + moveBy <= limits[0][1] + offset) {
				scene.getObjectByName(lightName).position['x'] += moveBy; 
			}
		}
	}

	else if (event.key == "y") {
		let lightName = "l" + selectedShape.name
		if(mode == "m") {
			selectedShape.position['y'] -= moveBy;
			scene.getObjectByName(lightName).position['y'] -= moveBy;
		}
		else if(mode == "i") {
			if(scene.getObjectByName(lightName).position['y'] - moveBy >= limits[1][0] - offset) {
				scene.getObjectByName(lightName).position['y'] -= moveBy; 
			}
		}
	}

	else if (event.key == "Y") {
		let lightName = "l" + selectedShape.name
		if(mode == "m") {
			selectedShape.position['y'] += moveBy;
			scene.getObjectByName(lightName).position['y'] += moveBy; 
		}
		else if(mode == "i") {
			if(scene.getObjectByName(lightName).position['y'] + moveBy <= limits[1][1] + offset) {
				scene.getObjectByName(lightName).position['y'] += moveBy; 
			}
		}
	}

	else if (event.key == "z") {
		let lightName = "l" + selectedShape.name
		if(mode == "m") {
			selectedShape.position['z'] -= moveBy;
			scene.getObjectByName(lightName).position['z'] -= moveBy; 
		}
		else if(mode == "i") {
			if(scene.getObjectByName(lightName).position['z'] - moveBy >= limits[2][0] - offset) {
				scene.getObjectByName(lightName).position['z'] -= moveBy; 
			}
		}
	}

	else if (event.key == "Z") {
		let lightName = "l" + selectedShape.name
		if(mode == "m") {
			selectedShape.position['z'] += moveBy;
			scene.getObjectByName(lightName).position['z'] += moveBy; 
		}
		else if(mode == "i") {
			if(scene.getObjectByName(lightName).position['z'] + moveBy <= limits[2][1] + offset) {
				scene.getObjectByName(lightName).position['z'] += moveBy; 
			}
		}
	}

	else if (event.key == "0" && mode == "i") {
		let lightName = "l" + selectedShape.name
		scene.getObjectByName(lightName).visible = false;
	}

	else if (event.key == "1" && mode == "i") {
		let lightName = "l" + selectedShape.name
		scene.getObjectByName(lightName).visible = true;
	}

	else if(Number.isInteger(Number(event.key)) && Number(event.key)>2 && (mode == "m" || mode == "i")) {
		selectedShape = scene.getObjectByName(event.key)
	}

	else if (event.key == "o" && mode == "m")
	{
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI / 180 );
		selectedShape.applyQuaternion( quaternion );
	}

	else if (event.key == "p" && mode == "m")
	{
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 180 );
		selectedShape.applyQuaternion( quaternion );
	}

	else if (event.key == "k" && mode == "m")
	{
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 180 );
		selectedShape.applyQuaternion( quaternion );
	}

	else if (event.key == "l" && mode == "m")
	{
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -Math.PI / 180 );
		selectedShape.applyQuaternion( quaternion );
	}

	else if (event.key == "b" && mode == "m")
	{
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI / 180 );
		selectedShape.applyQuaternion( quaternion );
	}

	else if (event.key == "n" && mode == "m")
	{
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), -Math.PI / 180 );
		selectedShape.applyQuaternion( quaternion );
	}


}, false);

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();