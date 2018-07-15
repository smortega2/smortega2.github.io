
var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer; 
var startTime; //previous time
var timeNow; //current time
var timeDiff; //time difference between previous and current frame
var dragConst = 0.999; //drag constant 

var yMin =-50; var yMax = 50; //y boundaries
var xMin =-40; var xMax = 40; //x boundaries
var zMin =-40; var zMax = 40; //z boundaries

var positions = []; //holds the x,y,z positions of all the spheres
var velocities = []; //holds the x,y,z velocities of all the spheres
var colors = []; //holds the color values of the spheres
var accelerations = []; //holds the accelerations of the spheres

// Create a place to store sphere geometry
var sphereVertexPositionBuffer;

//Create a place to store normals for shading
var sphereVertexNormalBuffer;

// View parameters
var eyePt = vec3.fromValues(0.0,0.0,150.0);
var viewDir = vec3.fromValues(0.0,0.0,-1.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);

// Create the normal
var nMatrix = mat3.create();

// Create ModelView matrix
var mvMatrix = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();

var mvMatrixStack = [];

/**
 * Sets up sphere buffers
 * @param {void} none
 * @return {void} none
 */
function setupSphereBuffers() {
    var sphereSoup=[];
    var sphereNormals=[];
    var numT=sphereFromSubdivision(6,sphereSoup,sphereNormals);
    console.log("Generated ", numT, " triangles"); 
    sphereVertexPositionBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereSoup), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = numT*3;
    console.log(sphereSoup.length/9);
    
    // Specify normals to be able to do lighting calculations
    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormals), gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = numT*3;
    
    console.log("Normals ", sphereNormals.length/3);     
}

/**
 * Passes in appropriate data to the shader and draws the sphere
 * @param {void} none
 * @return {void} none
 */
function drawSphere(){
 gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
 gl.drawArrays(gl.TRIANGLES, 0, sphereVertexPositionBuffer.numItems);      
}

/**
 * Uploads the model view matrix to the shader
 * @param {void} none
 * @return {void} none
 */
function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/**
 * Uploads the projection view matrix to the shader
 * @param {void} none
 * @return {void} none
 */
function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

/**
 * Uploads the normal matrix to the shader
 * @param {void} none
 * @return {void} none
 */
function uploadNormalMatrixToShader() {
  mat3.fromMat4(nMatrix,mvMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

/**
 * Pushes this mvMatrix to the mvMatrix stack
 * @param {void} none
 * @return {void} none
 */
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


/**
 * Pops a maxtrix off of the mvMatrix stack
 * @param {void} none
 * @return {void} none
 */
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

/**
 * Sends mvMatrix/ normalMatrix/ pMatrix to the shader
 * @param {void} none
 * @return {void} none
 */
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}

/**
 * Conversts degrees to radians
 * @param {float} degrees The degree amount to convert to radians
 * @return {float} radians The degrees parameter converted to radians
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Creates webgl canvas
 * @param {HTMLObject} canvas The canvas space on the webapge
 * @return {void} none
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads the shaders
 * @param {string} id The name of the shader being loaded
 * @return {void} none
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Hooks stuff up to the shaders and sets up shader attributes/ uniforms, etc. 
 * @param {void} none
 * @return {void} none
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    
  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
    
  shaderProgram.uniformAmbientMatColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientMatColor");  
  shaderProgram.uniformDiffuseMatColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseMatColor");
  shaderProgram.uniformSpecularMatColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularMatColor");    
    
}


/**
 * Send ligts to the shader
 * @param {array} loc The location of the light
 * @param {array} a The ambient light vector
 * @param {array} d The diffuse light vector
 * @param {array} s The specular light vector
 * @return {void} none
 */
function uploadLightsToShader(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

/**
 * Send ligts to the shader
 * @param {array} a The material constant for the ambient light vector
 * @param {array} d The material constant for the diffuse light vector
 * @param {array} s The material constant for the specular light vector
 * @return {void} none
 */
function uploadMaterialToShader(a,d,s) {
  gl.uniform3fv(shaderProgram.uniformAmbientMatColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseMatColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularMatColorLoc, s);
}

/**
 * Simply calls setupSphereBuffers (see for more information)
 * @param {void} none
 * @return {void} none
 */
function setupBuffers() {
    setupSphereBuffers();     
}

/**
 * Renders all the particles with the specified positions
 * @param {void} none
 * @return {void} none
 */
function draw() { 
    gl.useProgram(shaderProgram);
    var transformVec = vec3.create();
  
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective 
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

    // We want to look down -z, so create a lookat point in that direction    
    vec3.add(viewPt, eyePt, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);    
 
    // Set up light parameters
    var Ia = vec3.fromValues(1.0,1.0,1.0);
    var Id = vec3.fromValues(1.0,1.0,1.0);
    var Is = vec3.fromValues(1.0,1.0,1.0);
    
    var lightPosEye4 = vec4.fromValues(0.0,0.0,50.0,1.0);
    lightPosEye4 = vec4.transformMat4(lightPosEye4,lightPosEye4,mvMatrix);
    var lightPosEye = vec3.fromValues(lightPosEye4[0],lightPosEye4[1],lightPosEye4[2]);
    
    for(var i=0; i < positions.length/3; i++){
        var start = 3*i;
        var x = positions[start];
        var y = positions[start +1];
        var z = positions[start +2];
        //console.log("z value is: " + z);
        ka = vec3.fromValues(0.0,0.0,0.0);
        kd = vec3.fromValues(colors[6*i],colors[6*i + 1],colors[6*i + 2]);
        ks = vec3.fromValues(colors[6*i+3],colors[6*i + 4],colors[6*i + 5]);
    
        mvPushMatrix(); 
        vec3.set(transformVec,x,y,z);
        mat4.translate(mvMatrix, mvMatrix,transformVec);
        vec3.set(transformVec,2.0,2.0,2.0);
        mat4.scale(mvMatrix, mvMatrix,transformVec);     
        uploadLightsToShader(lightPosEye,Ia,Id,Is);
        uploadMaterialToShader(ka,kd,ks);
        setMatrixUniforms();
        drawSphere();
        mvPopMatrix(); 
    }
    
    //////////////////////////////////// draw the walls
    ka = vec3.fromValues(0.01,0.01,0.01);
    kd = vec3.fromValues(1.0,0.5,0.2);
    ks = vec3.fromValues(0.1,0.5,1.0);
    mvPushMatrix();   
    uploadLightsToShader(lightPosEye,Ia,Id,Is);
    uploadMaterialToShader(ka,kd,ks);
    setMatrixUniforms();
    drawWalls();
    mvPopMatrix(); 
    ////////////////////////////////////
}

/**
 * Updates the position and velocity of all the particles and checks for wall and sphere collisions
 * @param {void} none
 * @return {void} none
 */
function animate() {
    timeNow = Date.now();
    timeDiff = (timeNow - startTime)/10;
    //console.log("time diff "  + timeDiff);
    startTime = timeNow;
    for(var i=0; i < positions.length/3; i++){
        var start = 3*i;
        var x = positions[start];
        var y = positions[start +1];
        var z = positions[start +2];
        var vx = velocities[start];
        var vy = velocities[start +1];
        var vz = velocities[start +2];
        
        //check wall collisions
        checkForWallCollisionX(x,y,z,vx,vy,vz, start);
        checkForWallCollisionY(x,y,z,vx,vy,vz, start +1);
        checkForWallCollisionZ(x,y,z,vx,vy,vz, start +2);
        
        //checkSphereCollisions(x,y,z,vx,vy,vz, start); //-- was kinda buggy and don't wanna get points off for when it does weird stuff :(
    }
    updateVelocity();
    updatePosition();
}

/**
 * Attempts to resolve sphere to sphere collisions - a bit buggy
 * @param {float} x0 The x position of the sphere being checked
 * @param {float} y0 The y position of the sphere being checked
 * @param {float} z0 The z position of the sphere being checked
 * @param {float} vx0 The x velocity of the sphere being checked
 * @param {float} vy0 The y velocity of the sphere being checked
 * @param {float} vz0 The z velocity of the sphere being checked
 * @param {float} start The index of the x position in the position array of the sphere being checked
 * @return {void} none
 */
function checkSphereCollisions(x0,y0,z0,vx0,vy0,vz0, start){
    for(var i=start+3; i < positions.length; i=i+3){
        //console.log("_____________________________");
        var x1 = positions[i];
        var y1 = positions[i +1];
        var z1 = positions[i +2];
        var vx1 = velocities[i];
        var vy1 = velocities[i +1];
        var vz1 = velocities[i +2];
        //values 
//        console.log("position0: (" + x0 + ", " + y0 + ", " + z0 + ")");
//        console.log("velocity0: (" + vx0 + ", " + vy0 + ", " + vz0 + ")");
//        console.log("position1: (" + x1 + ", " + y1 + ", " + z1 + ")");
//        console.log("velocity1: (" + vx1 + ", " + vy1 + ", " + vz1 + ")");
        
        //dist between centers
        var sx = x0 - x1;
        var sy = y0 - y1;
        var sz = z0 - z1;
        
        //diff in velocities
        var vx = vx0 - vx1;
        var vy = vy0 - vy1;
        var vz = vz0 - vz1;
        
        var a = vx*vx + vy*vy + vz*vz;
        var b = vx*sx + vy*sy + vz*sz;
        var c = (sx*sx + sy*sy + sz*sz) - 16; // (2 + 2)^2 = 16
        
        var leftRoot = solveRootsLeft(a, b,c);
    
        //console.log("RESULT: " + leftRoot);
        if(leftRoot >= 0 && Math.abs(leftRoot) < timeDiff){ //you're gonna collide with the bottom wall - change vy velocity
            //velocities[index] = velocities[index] * -1;
            //console.log("COLLIDE1");
//            var vdiffx = vx1 - vx0;
//            var vdiffy = vy1 - vy0;
//            var vdiffz = vz1 - vz0;
//            
//            var pdiffx = x1 - x0;
//            var pdiffy = y1 - y0;
//            var pdiffz = z1 - z0;
//            
//            var speed = vdiffx*pdiffx + vdiffy*pdiffy + vdiffx*pdiffx;
//            console.log("speed is: " + speed);
            
            var l = vx0;
            var m = vx1;
            
            var a1 = 2;
            var b1 = -2 * (l + m);
            var c1 = Math.pow(l+m, 2) - Math.pow(l,2) - Math.pow(m,2);
            
            var leftRoot = solveRootsLeft(a1, b1,c1);
    
            var o = leftRoot;
            var n = l + m - o;
            velocities[start] = n;
            velocities[i] = o;
//            console.log("first new x velocity: " + o);
//            console.log("second new x velocity: " + n);
            ///////////////////////////////////////////
             l = vy0;
             m = vy1;
            
             a1 = 2;
             b1 = -2 * (l + m);
             c1 = Math.pow(l+m, 2) - Math.pow(l,2) - Math.pow(m,2);
            
             var leftRoot = solveRootsLeft(a1, b1,c1);
    
             o = leftRoot;
             n = l + m - o;
            velocities[start+1] = n;
            velocities[i+1] = o;
//            console.log("first new y velocity: " + o);
//            console.log("second new y velocity: " + n);
            ///////////////////////////////////////////
             l = vz0;
             m = vz1;
            
             a1 = 2;
             b1 = -2 * (l + m);
             c1 = Math.pow(l+m, 2) - Math.pow(l,2) - Math.pow(m,2);
            
            var leftRoot = solveRootsLeft(a1, b1,c1);
    
             o = leftRoot;
             n = l + m - o;
            velocities[start+2] = n;
            velocities[i+2] = o;
//            console.log("first new y velocity: " + o);
//            console.log("second new y velocity: " + n);
            
        }
    
        var rightRoot = solveRootsRight(a,b,c)
        //console.log("RESULT: " + rightRoot);
        if( rightRoot >= 0 && Math.abs(rightRoot) < timeDiff){ //you're gonna collide with the bottom wall - change vy velocity
            //console.log("COLLIDE2");
            
            var l = vx0;
            var m = vx1;
            
            var a1 = 2;
            var b1 = -2 * (l + m);
            var c1 = Math.pow(l+m, 2) - Math.pow(l,2) - Math.pow(m,2);
            
            var leftRoot = solveRootsRight(a1,b1,c1);
            
            var o = leftRoot;
            var n = l + m - o;
            velocities[start] = n;
            velocities[i] = o;
//            console.log("first new velocity: " + o);
//            console.log("second new velocity: " + n);
            ///////////////////////////////////////////
             l = vy0;
             m = vy1;
            
             a1 = 2;
             b1 = -2 * (l + m);
             c1 = Math.pow(l+m, 2) - Math.pow(l,2) - Math.pow(m,2);
            
            var leftRoot = solveRootsRight(a1, b1,c1);
             o = leftRoot;
             n = l + m - o;
            velocities[start+1] = n;
            velocities[i+1] = o;
//            console.log("first new y velocity: " + o);
//            console.log("second new y velocity: " + n);
            ///////////////////////////////////////////
             l = vz0;
             m = vz1;
            
             a1 = 2;
             b1 = -2 * (l + m);
             c1 = Math.pow(l+m, 2) - Math.pow(l,2) - Math.pow(m,2);
            
             var leftRoot = solveRootsRight(a1, b1,c1);
    
             o = leftRoot;
             n = l + m - o;
            velocities[start+2] = n;
            velocities[i+2] = o;
//            console.log("first new y velocity: " + o);
//            console.log("second new y velocity: " + n);
        }
        
    }
}

/**
 * Solves for one root of the alternative 'quadratic' equation - (-b +- sqrt(b^2 - ac))/a
 * @param {float} a The first parameter of the equation
 * @param {float} b The second parameter of the equation
 * @param {float} c The third parameter of the equation
 * @return {float} result The 'left' root of the equation
 */
function solveRootsLeft(a,b,c){
    var quad = b*b - a*c;
    quad = Math.sqrt(quad);
    var result = -1*b + quad;
    result = result / (a);  //vxf1
    return result;
}

/**
 * Solves for one root of the alternative 'quadratic' equation - (-b +- sqrt(b^2 - ac))/a
 * @param {float} a The first parameter of the equation
 * @param {float} b The second parameter of the equation
 * @param {float} c The third parameter of the equation
 * @return {float} result The 'right' root of the equation
 */
function solveRootsRight(a,b,c){
    var quad = b*b - a*c;
    quad = Math.sqrt(quad);
    var result = -1*b - quad;
    result = result / (a);  //vxf1
    return result;
}

/**
 * Updates the position of a particle according to the velocity - and ensures that a particle will not move across the bounds of the box
 * @param {void} none
 * @return {void} none
 */
function updatePosition(){
    for(var i=0; i < positions.length; i++){     
        positions[i] = positions[i] + timeDiff*velocities[i];
        if(i%3==0){ //check x bounds
            if(positions[i] -2 < xMin) positions[i] = xMin + 2;
            if(positions[i] + 2> xMax) positions[i] = xMax - 2;
        } else if(i%3==1){ //check y bounds
            if(positions[i] -2 < yMin) positions[i] = yMin + 2;
            if(positions[i] + 2> yMax) positions[i] = yMax - 2;
        } else if (i%3 ==2){ //check z bounds
            if(positions[i] -2 < zMin) positions[i] = zMin + 2;
            if(positions[i] + 2> zMax) positions[i] = zMax - 2;
        }
    }
}

/**
 * Determines if a sphere will collide with the +-x walls and if so updates the velocity accordingly
 * @param {float} x The x component of the particle's position
 * @param {float} y The y component of the particle's position
 * @param {float} z The z component of the particle's position
 * @param {float} vx The x component of the particle's velocity
 * @param {float} vy The y component of the particle's velocity
 * @param {float} vz The z component of the particle's velocity
 * @param {int} index The index of the sphere's x position in the position array
 * @return {void} none
 */
function checkForWallCollisionX(x,y,z,vx,vy,vz, index){
    var result = (xMin - (x-2)) / vx;
    if(result >= 0 && Math.abs(result) < timeDiff){ //you're gonna collide with the left wall - change vx velocity
        velocities[index] = velocities[index] * -1;
    }
    
    result = (xMax - (x+2)) / vx;
    if(result >= 0 && Math.abs(result) < timeDiff){ //you're gonna collide with the right wall - change vx velocity
        velocities[index] = velocities[index] * -1;
    }
}

/**
 * Determines if a sphere will collide with the +-z walls and if so updates the velocity accordingly
 * @param {float} x The x component of the particle's position
 * @param {float} y The y component of the particle's position
 * @param {float} z The z component of the particle's position
 * @param {float} vx The x component of the particle's velocity
 * @param {float} vy The y component of the particle's velocity
 * @param {float} vz The z component of the particle's velocity
 * @param {int} index The index of the sphere's x position in the position array
 * @return {void} none
 */
function checkForWallCollisionZ(x,y,z,vx,vy,vz, index){
    var result = (zMin - (z-2)) / vz;
    if(result >= 0 && Math.abs(result) < timeDiff){ //you're gonna collide with the back wall - change vz velocity
        velocities[index] = velocities[index] * -1;
    }
    
    result = (zMax - (z+2)) / vz;
    if(result >= 0 && Math.abs(result) < timeDiff){ //you're gonna collide with the front wall - change vz velocity
        velocities[index] = velocities[index] * -1;
    }
}

/**
 * Determines if a sphere will collide with the +-y walls and if so updates the velocity accordingly
 * @param {float} x The x component of the particle's position
 * @param {float} y The y component of the particle's position
 * @param {float} z The z component of the particle's position
 * @param {float} vx The x component of the particle's velocity
 * @param {float} vy The y component of the particle's velocity
 * @param {float} vz The z component of the particle's velocity
 * @param {int} index The index of the sphere's x position in the position array
 * @return {void} none
 */
function checkForWallCollisionY(x,y,z,vx,vy,vz, index){
    var a = -.01;
    var b = vy;
    var c = -1*(yMin - (y-2));
    
    var leftRoot = quadraticFormulaLeft(a,b,c);
    if(leftRoot >= 0 && Math.abs(leftRoot) < timeDiff){ //you're gonna collide with the bottom wall - change vy velocity
        velocities[index] = velocities[index] * -1;
    }
    
    var rightRoot = quadraticFormulaRight(a,b,c);
    if( rightRoot >= 0 && Math.abs(rightRoot) < timeDiff){ //you're gonna collide with the bottom wall - change vy velocity
        velocities[index] = velocities[index] * -1;
    }
    
    var a = -0.01;
    var b = vy;
    var c = -1*(yMax - (y+2));
    
    var leftRoot = quadraticFormulaLeft(a,b,c);
    if(leftRoot >= 0 && Math.abs(leftRoot) < timeDiff){ //you're gonna collide with the top wall - change vy velocity
        velocities[index] = velocities[index] * -1;
    }
    
    var rightRoot = quadraticFormulaRight(a,b,c);
    if(rightRoot >= 0 && Math.abs(rightRoot) < timeDiff){ //you're gonna collide with the top wall - change vy velocity
        velocities[index] = velocities[index] * -1;
    }
}

/**
 * Solves for one root of the quadratic equation (-b+-sqrt(b^2 - 4ac))/2a
 * @param {float} a First parameter of the equation
 * @param {float} b Second parameter of the equation
 * @param {float} c Third parameter of the equation
 * @return {float} The 'left' root of the quadratic equation
 */
function quadraticFormulaLeft(a,b,c){
    var quad = b*b - 4*a*c;
    quad = Math.sqrt(quad);
    var result = -1*b + quad;
    result = result / (2*a); 
    return result;
}

/**
 * Solves for one root of the quadratic equation (-b+-sqrt(b^2 - 4ac))/2a
 * @param {float} a First parameter of the equation
 * @param {float} b Second parameter of the equation
 * @param {float} c Third parameter of the equation
 * @return {float} The 'right' root of the quadratic equation
 */
function quadraticFormulaRight(a,b,c){
    var quad = b*b - 4*a*c;
    quad = Math.sqrt(quad);
    var result = -1*b - quad;
    result = result / (2*a);
    return result;
}

/**
 * Updates velocities according to acceleration (only relevant for y velocities)
 * @param {void} none
 * @return {void} none
 */
function updateVelocity(){
    for(var i=0; i < velocities.length; i++){
       if(i%3 == 1) velocities[i] = velocities[i]*Math.pow(dragConst, timeDiff) + timeDiff*accelerations[Math.floor(i/3)];  // gravity pulling object downward - only in y
        else velocities[i] = velocities[i]*Math.pow(dragConst, timeDiff);
    }
}

/**
 * Starts everthing off
 * @param {void} none
 * @return {void} none
 */
function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
    startTime = Date.now();
    console.log("time " + startTime);
    //Add event listener
    window.addEventListener( 'keydown', onKeyDown, false );
    fillArrays();
    setupShaders();
    setupBuffers();
    
    setupBuffersWalls();
    gl.useProgram(shaderProgram);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

/**
 * Populates the array of positions, velocities, and colors randomly
 * @param {void} none
 * @return {void} none
 */
function fillArrays(){
//    positions.push(0.0);
//    positions.push(0.0);
//    positions.push(40.0);
//    velocities.push(0.0);
//    velocities.push(0.0);
//    velocities.push(0.0);
//    accelerations.push(0.0);
//    for(var i=0; i < 6; i++){
//        // generate 3 random x,y,z coords between -60/60
//        //generate 3 random velocities between -1/1
//        var c = Math.random();
//        colors.push(c);
//    }
    
    for(var i=0; i < 10; i++){
        addParticle(); // generate 3 random x,y,z coords and velocities
    }
}

/**
 * Adds in a new particle when the user presses the spacebar
 * @param {Event} event The keypress event - holds the keycode
 * @return {void} none
 */
function onKeyDown(event){
    if(event.keyCode == 32){ //add particle
        addParticle();     
    }      
}

/**
 * Removes all spheres from the screen
 * @param {void} none
 * @return {void} none
 */
function reset(){
    positions = [];
    velocities = [];
    colors = [];
    accelerations = [];
}

/**
 * Creates a new particle by generating a random position, velocity and color. Also adds in an acceleration
 * @param {void} none
 * @return {void} none
 */
function addParticle(){
    var x = Math.floor((Math.random() * 2*xMax) + xMin); //x between 
    var y = Math.floor((Math.random() * 2*yMax) + yMin); //y between 60 and -60
    var z = Math.floor((Math.random() * 2*zMax) + zMin); //z between 40 and -50
    positions.push(x);
    positions.push(y);
    positions.push(z);
    
    var vx = Math.random() * 2 - 1;
    var vy = Math.random() * 2 - 1;
    var vz = Math.random() * 2 - 1;
    velocities.push(vx);
    velocities.push(vy);
    velocities.push(vz);
    
    for(var i=0; i < 6; i++){
        // generate 3 random x,y,z coords between -60/60
        //generate 3 random velocities between -1/1
        var c = Math.random();
        colors.push(c);
    }
    accelerations.push(-0.01);
}

/**
 * Animates stuff every tick
 * @param {void} none
 * @return {void} none
 */
function tick() {
    requestAnimFrame(tick);
    
    draw();
    animate();
}
