export function animateRiver(river, elapsed) {
    if (!river || !river.children) return;

    river.children.forEach(tile => {
        
        if (tile.material && tile.material.color) {
           
            const variation = 0.03 * Math.sin(elapsed * 2 + tile.position.x);
            tile.material.color.setHSL(0.6, 1, 0.5 + variation);

            
            const positions = tile.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                
                positions[i + 2] = Math.sin(elapsed * 2 + positions[i] * 0.5) * 0.1;
            }
            tile.geometry.attributes.position.needsUpdate = true;
        }
    });
}
