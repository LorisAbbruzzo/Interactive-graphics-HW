import { queueMove } from "./components/Player";

window.addEventListener("keydown", (event) => {
  
  if (event.repeat) {
    return;
  }


  switch (event.key) {
    case "ArrowUp":
    case "w":
      queueMove("forward");
      break;
    case "ArrowDown":
    case "s":
      queueMove("backward");
      break;
    case "ArrowLeft":
    case "a":
      queueMove("left");
      break;
    case "ArrowRight":
    case "d":
      queueMove("right");
      break;
  }
});