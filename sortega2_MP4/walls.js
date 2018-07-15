var wallPositionBuffer;
var wallNormalBuffer;


/**
 * Renders 5 walls to show the balls bouncing off the boundaries
 * @param {void} none
 * @return {void} none
 */
function drawWalls() {
    console.log("numverts" + wallPositionBuffer.itemSize);
gl.bindBuffer(gl.ARRAY_BUFFER, wallPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
 wallPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, wallNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
 wallNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    console.log("numverts" + wallPositionBuffer.itemSize);
    
 gl.drawArrays(gl.TRIANGLES, 0, wallNormalBuffer.numItems);  
}

/**
 * Sets up wall buffers
 * @param {void} none
 * @return {void} none
 */
function setupBuffersWalls() {
  wallPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, wallPositionBuffer);
  var triangleVertices = [ 
      //back wall
         -40.0,  50.0,  -40.0,
          40.0,  50.0,  -40.0,
          40.0, -50.0,   -40.0,
          40.0, -50.0,   -40.0,
         -40.0, -50.0,  -40.0,
         -40.0,  50.0,   -40.0,
      //bottom wall
         -40.0, -50.0,  -40.0,
          40.0, -50.0,  -40.0,
          40.0, -50.0,   40.0,
          40.0, -50.0,   40.0,
         -40.0, -50.0,   40.0,
         -40.0, -50.0,  -40.0,
      //top wall
         -40.0, 50.0,  -40.0,
          40.0, 50.0,  -40.0,
          40.0, 50.0,   40.0,
          40.0, 50.0,   40.0,
         -40.0, 50.0,   40.0,
         -40.0, 50.0,  -40.0,
      //left wall
         -40.0, 50.0,   40.0,
         -40.0, 50.0,  -40.0,
         -40.0,-50.0,  -40.0,
         -40.0,-50.0,  -40.0,
         -40.0,-50.0,   40.0,
         -40.0, 50.0,   40.0,
      //right wall
         40.0, 50.0,   40.0,
         40.0, 50.0,  -40.0,
         40.0,-50.0,  -40.0,
         40.0,-50.0,  -40.0,
         40.0,-50.0,   40.0,
         40.0, 50.0,   40.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  wallPositionBuffer.itemSize = 3;
  wallPositionBuffer.numberOfItems = 30;

  var triangleNormals = [
      //back wall
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
      //bottom wall
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
       //top wall
     0.0, -1.0, 0.0,
     0.0, -1.0, 0.0,
     0.0, -1.0, 0.0,
     0.0, -1.0, 0.0,
     0.0, -1.0, 0.0,
     0.0, -1.0, 0.0,
      //left wall
     1.0, 0.0, 0.0,
     1.0, 0.0, 0.0,
     1.0, 0.0, 0.0,
     1.0, 0.0, 0.0,
     1.0, 0.0, 0.0,
     1.0, 0.0, 0.0,
      //right wall
     -1.0, 0.0, 0.0,
     -1.0, 0.0, 0.0,
     -1.0, 0.0, 0.0,
     -1.0, 0.0, 0.0,
     -1.0, 0.0, 0.0,
     -1.0, 0.0, 0.0,
  ];
  // Specify normals to be able to do lighting calculations
    wallNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wallNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleNormals), gl.STATIC_DRAW);
    wallNormalBuffer.itemSize = 3;
    wallNormalBuffer.numItems = 30;
}


















