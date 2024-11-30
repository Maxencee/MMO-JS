/**
 * @author Lee Stemkoski   http://www.adelphi.edu/~stemkoski/
*/

// Thanks this is awesome !

///////////////////////////////////////////////////////////////////////////////*

import * as THREE from 'three';

/////////////
// SHADERS //
/////////////

const particleVertexShader = `
attribute vec3 customColor;
attribute float customOpacity;
attribute float customSize;
attribute float customAngle;
attribute float customVisible;  // float used as boolean (0 = false, 1 = true)
varying vec4 vColor;
varying float vAngle;
void main() {
    if (customVisible > 0.5) {
        vColor = vec4(customColor, customOpacity);
    } else {
        vColor = vec4(0.0, 0.0, 0.0, 0.0);  // make particle invisible.
    }
    vAngle = customAngle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = customSize * (300.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
uniform sampler2D _texture;
varying vec4 vColor;
varying float vAngle;
void main() {
    gl_FragColor = vColor;
    float c = cos(vAngle);
    float s = sin(vAngle);
    vec2 rotatedUV = vec2(
        c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,
        c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5
    );
    vec4 rotatedTexture = texture2D(_texture, rotatedUV);
    gl_FragColor *= rotatedTexture;
}
`;



///////////////////////////////////////////////////////////////////////////////

/////////////////
// TWEEN CLASS //
/////////////////

export function Tween(timeArray, valueArray) {
    this.times  = timeArray || [];
    this.values = valueArray || [];
}

Tween.prototype.lerp = function(t) {
    var i = 0;
    var n = this.times.length;
    while (i < n && t > this.times[i])  
        i++;
    if (i == 0) return this.values[0];
    if (i == n) return this.values[n-1];
    var p = (t - this.times[i-1]) / (this.times[i] - this.times[i-1]);
    if (this.values[0] instanceof THREE.Vector3)
        return this.values[i-1].clone().lerp( this.values[i], p );
    else // its a float
        return this.values[i-1] + p * (this.values[i] - this.values[i-1]);
}

///////////////////////////////////////////////////////////////////////////////

////////////////////
// PARTICLE CLASS //
////////////////////

export function Particle() {
    this.position     = new THREE.Vector3();
    this.velocity     = new THREE.Vector3(); // units per second
    this.acceleration = new THREE.Vector3();

    this.angle             = 0;
    this.angleVelocity     = 0; // degrees per second
    this.angleAcceleration = 0; // degrees per second, per second
    
    this.size = 16.0;

    this.color   = new THREE.Color();
    this.opacity = 1.0;
            
    this.age   = 0;
    this.alive = 0; // use float instead of boolean for shader purposes    
}

Particle.prototype.update = function(dt) {
    this.position.add( this.velocity.clone().multiplyScalar(dt) );
    this.velocity.add( this.acceleration.clone().multiplyScalar(dt) );
    
    // convert from degrees to radians: 0.01745329251 = Math.PI/180
    this.angle += this.angleVelocity * 0.01745329251 * dt;
    this.angleVelocity += this.angleAcceleration * 0.01745329251 * dt;

    this.age += dt;
    
    // if the tween for a given attribute is nonempty,
    // then use it to update the attribute's value

    if ( this.sizeTween.times.length > 0 )
        this.size = this.sizeTween.lerp( this.age );
                
    if ( this.colorTween.times.length > 0 ) {
        var colorHSL = this.colorTween.lerp( this.age );
        this.color = new THREE.Color().setHSL( colorHSL.x, colorHSL.y, colorHSL.z );
    }
    
    if ( this.opacityTween.times.length > 0 )
        this.opacity = this.opacityTween.lerp( this.age );
}
    
///////////////////////////////////////////////////////////////////////////////

///////////////////////////
// PARTICLE ENGINE CLASS //
///////////////////////////

export const Type = Object.freeze({ "CUBE":1, "SPHERE":2 });

export default function ParticleEngine() {
    /////////////////////////
    // PARTICLE PROPERTIES //
    /////////////////////////
    
    this.positionStyle = Type.CUBE;        
    this.positionBase   = new THREE.Vector3();
    // cube shape data
    this.positionSpread = new THREE.Vector3();
    // sphere shape data
    this.positionRadius = 0; // distance from base at which particles start
    
    this.velocityStyle = Type.CUBE;    
    // cube movement data
    this.velocityBase       = new THREE.Vector3();
    this.velocitySpread     = new THREE.Vector3(); 
    // sphere movement data
    // direction vector calculated using initial position
    this.speedBase   = 0;
    this.speedSpread = 0;
    
    this.accelerationBase   = new THREE.Vector3();
    this.accelerationSpread = new THREE.Vector3();    
    
    this.angleBase               = 0;
    this.angleSpread             = 0;
    this.angleVelocityBase       = 0;
    this.angleVelocitySpread     = 0;
    this.angleAccelerationBase   = 0;
    this.angleAccelerationSpread = 0;
    
    this.sizeBase   = 0.0;
    this.sizeSpread = 0.0;
    this.sizeTween  = new Tween();
            
    // store colors in HSL format in a THREE.Vector3 object
    // http://en.wikipedia.org/wiki/HSL_and_HSV
    this.colorBase   = new THREE.Vector3(0.0, 1.0, 0.5); 
    this.colorSpread = new THREE.Vector3(0.0, 0.0, 0.0);
    this.colorTween  = new Tween();
    
    this.opacityBase   = 1.0;
    this.opacitySpread = 0.0;
    this.opacityTween  = new Tween();

    this.blendStyle = THREE.NormalBlending; // false;

    this.particleArray = [];
    this.particlesPerSecond = 100;
    this.particleDeathAge = 1.0;
    
    ////////////////////////
    // EMITTER PROPERTIES //
    ////////////////////////
    
    this.emitterAge      = 0.0;
    this.emitterAlive    = true;
    this.emitterDeathAge = 60; // time (seconds) at which to stop creating particles.
    
    // How many particles could be active at any time?
    this.particleCount = this.particlesPerSecond * Math.min( this.particleDeathAge, this.emitterDeathAge );

    //////////////
    // THREE.JS //
    //////////////
    
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleTexture = null;
    this.particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            _texture: { value: this.particleTexture },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        alphaTest: 0.5,
        transparent: true, // alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5, 
        blending: THREE.NormalBlending, depthTest: true,
    });

    const positions = new Float32Array(this.particleCount * 3);
    const customVisible = new Float32Array(this.particleCount);
    const customColor = new Float32Array(this.particleCount * 3);
    const customOpacity = new Float32Array(this.particleCount);
    const customSize = new Float32Array(this.particleCount);
    const customAngle = new Float32Array(this.particleCount);

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('customVisible', new THREE.BufferAttribute(customVisible, 1));
    this.particleGeometry.setAttribute('customColor', new THREE.BufferAttribute(customColor, 3));
    this.particleGeometry.setAttribute('customOpacity', new THREE.BufferAttribute(customOpacity, 1));
    this.particleGeometry.setAttribute('customSize', new THREE.BufferAttribute(customSize, 1));
    this.particleGeometry.setAttribute('customAngle', new THREE.BufferAttribute(customAngle, 1));

    this.particleMesh = new THREE.Points(this.particleGeometry, this.particleMaterial);
}
    
ParticleEngine.prototype.setValues = function(parameters) {
    if ( parameters === undefined ) return;
    
    // clear any previous tweens that might exist
    this.sizeTween  = new Tween();
    this.colorTween = new Tween();
    this.opacityTween = new Tween();

    for ( var key in parameters ) 
        this[ key ] = parameters[ key ];

    // attach tweens to particles
    Particle.prototype.sizeTween  = this.sizeTween;
    Particle.prototype.colorTween = this.colorTween;
    Particle.prototype.opacityTween = this.opacityTween;    
    this.particleArray = [];
	this.emitterAge      = 0.0;
	this.emitterAlive    = true;
	this.particleCount = this.particlesPerSecond * Math.min( this.particleDeathAge, this.emitterDeathAge );
	
	this.particleGeometry = new THREE.BufferGeometry();
	this.particleMaterial = new THREE.ShaderMaterial( 
	{
		uniforms: 
		{
			_texture: { type: 't', value: this.particleTexture },
		},
		vertexShader:   particleVertexShader,
		fragmentShader: particleFragmentShader,
        alphaTest: 0.5,
		transparent: true, // if having transparency issues, try including: alphaTest: 0.5, 
		blending: THREE.NormalBlending
	});

    this.particleMaterial.depthWrite = false;

    const positions = new Float32Array(this.particleCount * 3);
    const customVisible = new Float32Array(this.particleCount);
    const customColor = new Float32Array(this.particleCount * 3);
    const customOpacity = new Float32Array(this.particleCount);
    const customSize = new Float32Array(this.particleCount);
    const customAngle = new Float32Array(this.particleCount);

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('customVisible', new THREE.BufferAttribute(customVisible, 1));
    this.particleGeometry.setAttribute('customColor', new THREE.BufferAttribute(customColor, 3));
    this.particleGeometry.setAttribute('customOpacity', new THREE.BufferAttribute(customOpacity, 1));
    this.particleGeometry.setAttribute('customSize', new THREE.BufferAttribute(customSize, 1));
    this.particleGeometry.setAttribute('customAngle', new THREE.BufferAttribute(customAngle, 1));

	this.particleMesh = new THREE.Points(this.particleGeometry, this.particleMaterial);
}
	
// helper functions for randomization
ParticleEngine.prototype.randomValue = function(base, spread)
{
	return base + spread * (Math.random() - 0.5);
}
ParticleEngine.prototype.randomVector3 = function(base, spread)
{
	var rand3 = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
	return new THREE.Vector3().addVectors( base, new THREE.Vector3().multiplyVectors( spread, rand3 ) );
}

ParticleEngine.prototype.initialize = function() {
    for (let i = 0; i < this.particleCount; i++) {
        this.particleArray[i] = new Particle();
        this.particleArray[i].alive = 0.0;
    }
    
    this.emitterAge = 0.0;
    this.emitterAlive = true;
}

ParticleEngine.prototype.update = function(dt) {
    let recycleIndices = [];

    for (let i = 0; i < this.particleCount; i++) {
        if (this.particleArray[i].alive) {
            this.particleArray[i].update(dt);

            if (this.particleArray[i].age > this.particleDeathAge) {
                this.particleArray[i].alive = 0.0;
                recycleIndices.push(i);
            }
        }
    }

    if (this.emitterAlive) {
        let particleIndex = 0;

        for (let i = 0; i < this.particleCount; i++) {
            if (this.particleArray[i].alive) {
                particleIndex++;
            }
        }

        let particlesToEmit = this.particlesPerSecond * dt;
        particlesToEmit = Math.min(particlesToEmit, this.particleCount - particleIndex);

        for (let j = 0; j < particlesToEmit; j++) {
            let i = recycleIndices.length ? recycleIndices.pop() : particleIndex;
            this.particleArray[i] = this.createParticle();
            particleIndex++;
        }
    }

    let positions = this.particleGeometry.attributes.position.array;
    let customVisible = this.particleGeometry.attributes.customVisible.array;
    let customColor = this.particleGeometry.attributes.customColor.array;
    let customOpacity = this.particleGeometry.attributes.customOpacity.array;
    let customSize = this.particleGeometry.attributes.customSize.array;
    let customAngle = this.particleGeometry.attributes.customAngle.array;

    for (let i = 0; i < this.particleCount; i++) {
        positions[i * 3] = this.particleArray[i].position.x;
        positions[i * 3 + 1] = this.particleArray[i].position.y;
        positions[i * 3 + 2] = this.particleArray[i].position.z;

        customVisible[i] = this.particleArray[i].alive;
        customColor[i * 3] = this.particleArray[i].color.r;
        customColor[i * 3 + 1] = this.particleArray[i].color.g;
        customColor[i * 3 + 2] = this.particleArray[i].color.b;
        customOpacity[i] = this.particleArray[i].opacity;
        customSize[i] = this.particleArray[i].size;
        customAngle[i] = this.particleArray[i].angle;
    }

    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.customVisible.needsUpdate = true;
    this.particleGeometry.attributes.customColor.needsUpdate = true;
    this.particleGeometry.attributes.customOpacity.needsUpdate = true;
    this.particleGeometry.attributes.customSize.needsUpdate = true;
    this.particleGeometry.attributes.customAngle.needsUpdate = true;

    this.emitterAge += dt;
    if (this.emitterAge > this.emitterDeathAge) this.emitterAlive = false;
}

ParticleEngine.prototype.createParticle = function() {
    let particle = new Particle();

    particle.position.copy(this.positionBase);
    particle.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * this.positionSpread.x,
        (Math.random() - 0.5) * this.positionSpread.y,
        (Math.random() - 0.5) * this.positionSpread.z
    ));

    particle.velocity.copy(this.velocityBase);
    particle.velocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * this.velocitySpread.x,
        (Math.random() - 0.5) * this.velocitySpread.y,
        (Math.random() - 0.5) * this.velocitySpread.z
    ));

    particle.acceleration.copy(this.accelerationBase);
    particle.acceleration.add(new THREE.Vector3(
        (Math.random() - 0.5) * this.accelerationSpread.x,
        (Math.random() - 0.5) * this.accelerationSpread.y,
        (Math.random() - 0.5) * this.accelerationSpread.z
    ));

    particle.angle = this.angleBase + (Math.random() - 0.5) * this.angleSpread;
    particle.angleVelocity = this.angleVelocityBase + (Math.random() - 0.5) * this.angleVelocitySpread;
    particle.angleAcceleration = this.angleAccelerationBase + (Math.random() - 0.5) * this.angleAccelerationSpread;

    particle.size = this.sizeBase + (Math.random() - 0.5) * this.sizeSpread;

    particle.color = this.colorBase.clone();
    particle.color.add(new THREE.Vector3(
        (Math.random() - 0.5) * this.colorSpread.x,
        (Math.random() - 0.5) * this.colorSpread.y,
        (Math.random() - 0.5) * this.colorSpread.z
    ));

    particle.opacity = this.opacityBase + (Math.random() - 0.5) * this.opacitySpread;

    particle.age = 0;
    particle.alive = 1.0;

    return particle;
}
