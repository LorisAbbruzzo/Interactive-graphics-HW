import * as THREE from "three";
import { minTileIndex, maxTileIndex } from "../constants";

let lastRowType = null;
let riverRowsRemaining = 0; 
let lastRiverDirection = randomElement([true, false]);
export function generateRows(amount) {
    const rows = [];
    for (let i = 0; i < amount; i++) {
        const rowData = generateRow();
        rows.push(rowData);
        lastRowType = rowData.type;
    }
    return rows;
}

function generateRow() {

    if (riverRowsRemaining > 0) {
        riverRowsRemaining--; 
        
        lastRiverDirection = !lastRiverDirection; 

        return generateRiverMetadata(lastRiverDirection);
    }

    const possibleTypes = [
        "car", "car", "car",
        "truck",
        "forest", "forest", "forest",
        "river", "river"
    ];

    let type;
    
    if (lastRowType !== "forest") {
        const filteredTypes = possibleTypes.filter(t => t !== "river");
        type = randomElement(filteredTypes);
    } else {
        type = randomElement(possibleTypes);
    }

    if (type === "river") {

        riverRowsRemaining = THREE.MathUtils.randInt(1, 3);

        lastRiverDirection = !lastRiverDirection;

        riverRowsRemaining--; 

        return generateRiverMetadata(lastRiverDirection);
    }
    
    if (type === "car") return generateCarLaneMetadata();
    if (type === "truck") return generateTruckLaneMetadata();
    return generateForesMetadata(); 
}
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateForesMetadata() {
    const occupiedTiles = new Set();
    const trees = Array.from({ length: 4 }, () => {
        let tileIndex;
        do {
        tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
        } while (occupiedTiles.has(tileIndex));
        occupiedTiles.add(tileIndex);

        const height = randomElement([20, 45, 60]);

        return { tileIndex, height };
    });

    return { type: "forest", trees };
}

function generateCarLaneMetadata() {
    const direction = randomElement([true, false]);
    const speed = randomElement([125, 156, 188]);

    const occupiedTiles = new Set();

    const vehicles = Array.from({ length: 3 }, () => {
        let initialTileIndex;
        do {
            initialTileIndex = THREE.MathUtils.randInt(
                minTileIndex,
                maxTileIndex
        );
        } while (occupiedTiles.has(initialTileIndex));
        occupiedTiles.add(initialTileIndex - 1);
        occupiedTiles.add(initialTileIndex);
        occupiedTiles.add(initialTileIndex + 1);

        const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);

        return { initialTileIndex, color };
    });

    return { type: "car", direction, speed, vehicles };
}

function generateTruckLaneMetadata() {
    const direction = randomElement([true, false]);
    const speed = randomElement([125, 156, 188]);

    const occupiedTiles = new Set();

    const vehicles = Array.from({ length: 2 }, () => {
        let initialTileIndex;
        do {
            initialTileIndex = THREE.MathUtils.randInt(
            minTileIndex,
            maxTileIndex
        );
        } while (occupiedTiles.has(initialTileIndex));
        occupiedTiles.add(initialTileIndex - 2);
        occupiedTiles.add(initialTileIndex - 1);
        occupiedTiles.add(initialTileIndex);
        occupiedTiles.add(initialTileIndex + 1);
        occupiedTiles.add(initialTileIndex + 2);

        const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);

        return { initialTileIndex, color };
    });

    return { type: "truck", direction, speed, vehicles };
}

function generateRiverMetadata(direction) {
    const speed = randomElement([250, 150, 200]);
    const occupiedTiles = new Set();
    
    const numLogs = THREE.MathUtils.randInt(4, 6);

    const logs = Array.from({ length: numLogs }, () => {
        const length = randomElement([1, 2, 3]);
        let initialTileIndex;
        let isOccupied;
        let attempts = 0; 

        do {
            initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
            isOccupied = false;
            

            for (let i = -1; i < length + 1; i++) {
                if (occupiedTiles.has(initialTileIndex + i)) {
                    isOccupied = true;
                    break; 
                }
            }
            attempts++;
        } while (isOccupied && attempts < 50); 


        if (!isOccupied) {

            for (let i = -1; i < length + 1; i++) { 
                occupiedTiles.add(initialTileIndex + i);
            }
            return { initialTileIndex, length };
        }
        
        return null; 
    });

    return {
        type: "river",
        direction,
        speed,
        logs: logs.filter(log => log !== null)
    };
}