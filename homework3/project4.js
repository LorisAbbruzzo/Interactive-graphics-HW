// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var Mtrans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var cosX = Math.cos(rotationX);
    var sinX = Math.sin(rotationX);
    var MrotX = [
        1,    0,     0,    0,
        0, cosX, sinX,    0,
        0, -sinX, cosX,   0,
        0,    0,     0,   1
    ];

    var cosY = Math.cos(rotationY);
    var sinY = Math.sin(rotationY);
    var MrotY = [
        cosY,  0, -sinY, 0,
           0,  1,     0, 0,
        sinY,  0,  cosY, 0,
           0,  0,     0, 1
    ];

	var newmatrix = MatrixMult(Mtrans, MatrixMult(MrotY, MrotX));

	var mvp = MatrixMult( projectionMatrix, newmatrix );

	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer {
	constructor() {
		this.swapYZFlag = false;
		this.hasTexture = false;
		this.texture = null; 

		// === SHADER VERTEX ===
		const vertexShaderSource = `
			attribute vec3 aPosition;
			attribute vec2 aTexCoord;
			uniform mat4 uMVP;
			uniform bool uSwapYZ;
			varying vec2 vTexCoord;

			void main() {
				vec3 pos = aPosition;
				if (uSwapYZ) {
					pos = vec3(pos.x, pos.z, pos.y);
				}
				gl_Position = uMVP * vec4(pos, 1.0);
				vTexCoord = aTexCoord;
			}
		`;

		// === SHADER FRAGMENT ===
		const fragmentShaderSource = `
			precision mediump float;
			uniform bool uUseTexture;
			uniform sampler2D uSampler;
			varying vec2 vTexCoord;

			void main() {
				if (uUseTexture) {
					gl_FragColor = texture2D(uSampler, vTexCoord);
				} else {
					gl_FragColor = vec4(1.0, gl_FragCoord.z * gl_FragCoord.z, 0.0, 1.0);
				}
			}
		`;

		// === COMP SHADER ===
		const vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, vertexShaderSource);
		gl.compileShader(vs);

		const fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, fragmentShaderSource);
		gl.compileShader(fs);

		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, vs);
		gl.attachShader(this.shaderProgram, fs);
		gl.linkProgram(this.shaderProgram);

		// === LOCATION ATTRIBUTI E UNIFORMI ===
		this.aPosition = gl.getAttribLocation(this.shaderProgram, "aPosition");
		this.aTexCoord = gl.getAttribLocation(this.shaderProgram, "aTexCoord");
		this.uMVP      = gl.getUniformLocation(this.shaderProgram, "uMVP");
		this.uSwapYZ   = gl.getUniformLocation(this.shaderProgram, "uSwapYZ");
		this.uUseTexture = gl.getUniformLocation(this.shaderProgram, "uUseTexture");
		this.uSampler  = gl.getUniformLocation(this.shaderProgram, "uSampler"); 

		// === BUFFER ===
		this.vertBuffer = gl.createBuffer();
		this.texBuffer = gl.createBuffer();
		this.numTriangles = 0;
	}

	setMesh(vertPos, texCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;
		this.hasTexture = texCoords.length > 0;
	}
	
	swapYZ(swap) {
		this.swapYZFlag = swap;
	}
	
	setTexture(img) {
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

		
		gl.generateMipmap(gl.TEXTURE_2D);
	}

	showTexture(show) {
		this.hasTexture = show; 
	}

	draw(trans) {
		gl.useProgram(this.shaderProgram);

		gl.uniformMatrix4fv(this.uMVP, false, trans);
		gl.uniform1i(this.uSwapYZ, this.swapYZFlag);
		gl.uniform1i(this.uUseTexture, this.hasTexture);

		
		if (this.hasTexture && this.texture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.uniform1i(this.uSampler, 0); 
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.enableVertexAttribArray(this.aPosition);
		gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);

		if (this.hasTexture) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
			gl.enableVertexAttribArray(this.aTexCoord);
			gl.vertexAttribPointer(this.aTexCoord, 2, gl.FLOAT, false, 0, 0);
		} else {
			gl.disableVertexAttribArray(this.aTexCoord);
		}

		
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}
}
