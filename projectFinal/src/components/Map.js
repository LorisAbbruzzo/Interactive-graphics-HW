import * as THREE from "three";
import { generateRows } from "../utilities/generateRows";
import { Grass } from "./Grass";
import { Road } from "./Road";
import { River } from "./River";
import { Tree } from "./Tree";
import { Car } from "./Car";
import { Truck } from "./Truck";
import { Log } from "./Log";

export const metadata = [];
export const grassRows = []; 
export const riverRows = [];

export const map = new THREE.Group();

export function initializeMap() {

    metadata.length = 0;
    map.remove(...map.children);
    grassRows.length = 0; 

   
    for (let rowIndex = 0; rowIndex > -10; rowIndex--) {
        const grass = Grass(rowIndex);
        map.add(grass);
        grassRows.push(grass); 
    }

    addRows();
}


export function addRows() {
    const newMetadata = generateRows(20);

    const startIndex = metadata.length;
    metadata.push(...newMetadata);

    newMetadata.forEach((rowData, index) => {
        const rowIndex = startIndex + index + 1;

       if (rowData.type === "forest") {
            const row = Grass(rowIndex);

            rowData.trees.forEach(({ tileIndex, height }) => {
                const three = Tree(tileIndex, height);
                row.add(three);
            });

            map.add(row);

            grassRows.push(row); 
        }


        if (rowData.type === "car") {
        const row = Road(rowIndex);

        rowData.vehicles.forEach((vehicle) => {
            const car = Car(
                vehicle.initialTileIndex,
                rowData.direction,
                vehicle.color
            );
            vehicle.ref = car;
            row.add(car);
        });

        map.add(row);
        }
        
        if (rowData.type === "truck") {
            const row = Road(rowIndex);

            rowData.vehicles.forEach((vehicle) => {
                const truck = Truck(
                    vehicle.initialTileIndex,
                    rowData.direction,
                    vehicle.color
                );
                vehicle.ref = truck;
                row.add(truck);
            });

            map.add(row);
        }

        if (rowData.type === "river") {
            const row = River(rowIndex);

            rowData.logs.forEach((log) => {
                const logMesh = Log(log.initialTileIndex, log.length);
                log.ref = logMesh;
                row.add(logMesh);
            });

            map.add(row);
            riverRows.push(row); 
        }
    });
}