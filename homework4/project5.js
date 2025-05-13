// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
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

	var mvp = MatrixMult(Mtrans, MatrixMult(MrotY, MrotX));

	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.swapYZFlag = false;
		this.hasTexture = false;
		this.texture = null; 

		// === SHADER VERTEX ===
		const vertexShaderSource = `
			attribute vec3 aPosition;
			attribute vec2 aTexCoord;
			attribute vec3 aNormal;

			uniform mat4 uMVP;
			uniform mat4 uMV;
			uniform mat3 uNormalMatrix;
			uniform bool uSwapYZ;

			varying vec2 vTexCoord;
			varying vec3 vNormal;
			varying vec3 vPosition;

			void main() {
				vec3 pos = aPosition;
				if (uSwapYZ) {
					pos = vec3(pos.x, pos.z, pos.y);
				}

				vec4 mvPosition = uMV * vec4(pos, 1.0);
				gl_Position = uMVP * vec4(pos, 1.0);

				vTexCoord = aTexCoord;
				vNormal = uNormalMatrix * aNormal;
				vPosition = mvPosition.xyz;
			}
		`;

		// === SHADER FRAGMENT ===
		const fragmentShaderSource = `
			precision mediump float;

			uniform bool uUseTexture;
			uniform sampler2D uSampler;
			uniform vec3 uLightDir;
			uniform float uShininess;

			varying vec2 vTexCoord;
			varying vec3 vNormal;
			varying vec3 vPosition;

			void main() {
				if (!uUseTexture) {
					gl_FragColor = vec4(1.0, gl_FragCoord.z * gl_FragCoord.z, 0.0, 1.0);
					return;
				}

				vec3 N = normalize(vNormal);
				vec3 L = normalize(uLightDir);
				vec3 V = normalize(-vPosition);
				vec3 H = normalize(L + V);

				float diffuse = max(dot(N, L), 0.0);
				float specular = pow(max(dot(N, H), 0.0), uShininess);

				vec3 baseColor = texture2D(uSampler, vTexCoord).rgb;
				vec3 color = baseColor * (0.2 + 0.6 * diffuse) + vec3(1.0) * 0.2 * specular;

				gl_FragColor = vec4(color, 1.0);
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

		this.aNormal = gl.getAttribLocation(this.shaderProgram, "aNormal");
		this.uMV = gl.getUniformLocation(this.shaderProgram, "uMV");
		this.uNormalMatrix = gl.getUniformLocation(this.shaderProgram, "uNormalMatrix");
		this.uLightDir   = gl.getUniformLocation(this.shaderProgram, "uLightDir");
		this.uShininess  = gl.getUniformLocation(this.shaderProgram, "uShininess");
		// === BUFFER ===
		this.vertBuffer = gl.createBuffer();
		this.texBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		this.numTriangles = 0;
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;
		this.hasTexture = texCoords.length > 0;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) {
		this.swapYZFlag = swap;
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		this.texture = gl.createTexture();
		
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

		
		gl.generateMipmap(gl.TEXTURE_2D);

	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) {
		this.hasTexture = show; 
	}

	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw(matrixMVP, matrixMV, matrixNormal) {
		gl.useProgram(this.shaderProgram);

		gl.uniformMatrix4fv(this.uMVP, false, matrixMVP);
		gl.uniformMatrix4fv(this.uMV, false, matrixMV);
		gl.uniformMatrix3fv(this.uNormalMatrix, false, matrixNormal);
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

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.enableVertexAttribArray(this.aNormal);
		gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}

	setLightDir(x, y, z) {
		gl.useProgram(this.shaderProgram);
		gl.uniform3f(this.uLightDir, x, y, z);
	}

	setShininess(shininess) {
		gl.useProgram(this.shaderProgram);
		gl.uniform1f(this.uShininess, shininess);
	}

}
