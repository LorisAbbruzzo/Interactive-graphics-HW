// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform(positionX, positionY, rotation, scale) {
	const rad = rotation * Math.PI / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);

	const matrix = [
		scale * cos,           //  a(cos(x))  -a(sin(x))   posX
		scale * sin,           //  a(sin(x))   a(cos(x))   posY
		0,                     //     0           0         1

		-scale * sin,        
		scale * cos,          
		0,                    

		positionX,          
		positionY,            
		1                    
	];
	return matrix;
}


// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform(trans1, trans2) {
	const result = Array(9).fill(0);

	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {

			for (let k = 0; k < 3; k++) {
				result[col * 3 + row] += trans2[k * 3 + row] * trans1[col * 3 + k];
			}
		}
	}
	return result;
}