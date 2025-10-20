import { calculateFinalPosition } from "./calculateFinalPosition";
import { minWalkable, maxWalkable } from "../constants"; 
import { metadata as rows } from "../components/Map";

export function endsUpInValidPosition(currentPosition, moves) {

  const finalPosition = calculateFinalPosition(
    currentPosition,
    moves
  );

  //MAP BOUNDARIES
  if (
    finalPosition.rowIndex === -1 ||
    finalPosition.tileIndex < minWalkable||
    finalPosition.tileIndex > maxWalkable   
  ) {
    return false; 
  }

//TREE COLLISION
  const finalRow = rows[finalPosition.rowIndex - 1];
  if (
    finalRow &&
    finalRow.type === "forest" &&
    finalRow.trees.some(
      (tree) => tree.tileIndex === finalPosition.tileIndex
    )
  ) {
    return false;
  }

  return true;
}