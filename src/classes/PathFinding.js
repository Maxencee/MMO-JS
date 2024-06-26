export default class PathFinding {
  object;

  constructor(object) {
    this.object = object;
  }

  findPath(start, target) {
    const path = this.flowfieldAlgorithm(start, target);
    this.moveAlongPath(path);
  }

  flowfieldAlgorithm(start, target) {
    // Determine the extents of the grid based on start and target positions
    const minX = Math.min(start.x, target.x);
    const maxX = Math.max(start.x, target.x);
    const minZ = Math.min(start.z, target.z);
    const maxZ = Math.max(start.z, target.z);

    // Calculate grid dimensions
    const gridWidth = Math.ceil(maxX) - Math.floor(minX) + 1;
    const gridHeight = Math.ceil(maxZ) - Math.floor(minZ) + 1;

    // Initialize the grid with all zeros (assuming all clear paths initially)
    const grid = Array.from({ length: gridWidth }, () =>
      Array(gridHeight).fill(0)
    );

    // Convert start and target positions to grid indices
    const startX = Math.floor(start.x - minX);
    const startZ = Math.floor(start.z - minZ);
    const targetX = Math.floor(target.x - minX);
    const targetZ = Math.floor(target.z - minZ);

    // Set obstacles (1s) at specific positions
    // Here we set a single obstacle between start and target for demonstration purposes
    const obstacleX = Math.floor((startX + targetX) / 2);
    const obstacleZ = Math.floor((startZ + targetZ) / 2);
    grid[obstacleX][obstacleZ] = 1;

    // Initialize distance field with Infinity
    const distanceField = Array.from({ length: gridWidth }, () =>
      Array(gridHeight).fill(Infinity)
    );

    // Define grid boundaries
    const gridMinX = 0;
    const gridMaxX = gridWidth - 1;
    const gridMinZ = 0;
    const gridMaxZ = gridHeight - 1;

    // Priority queue for open list
    const openList = [];
    // Closed set to keep track of visited nodes
    const closedSet = new Set();

    // Start point has a distance of 0
    distanceField[startX][startZ] = 0;
    openList.push({ x: startX, z: startZ });

    while (openList.length > 0) {
      // Extract node with smallest distance
      openList.sort(
        (a, b) => distanceField[a.x][a.z] - distanceField[b.x][b.z]
      );
      const current = openList.shift();

      // If current node is the target, break out of loop
      if (current.x === targetX && current.z === targetZ) {
        break;
      }

      // Get neighbors of current node
      const neighbors = this.getNeighbors(current);

      neighbors.forEach((neighbor) => {
        const neighborX = neighbor.x;
        const neighborZ = neighbor.z;

        // Check if neighbor is within grid bounds
        if (
          neighborX < gridMinX ||
          neighborX > gridMaxX ||
          neighborZ < gridMinZ ||
          neighborZ > gridMaxZ
        ) {
          return; // Skip out-of-bounds neighbors
        }

        // Check if neighbor is an obstacle
        if (grid[neighborX][neighborZ] === 1) {
          return; // Skip obstacles
        }

        // Calculate tentative distance to neighbor
        const tentativeDistance = distanceField[current.x][current.z] + 1;

        // Update distance if shorter path found
        if (tentativeDistance < distanceField[neighborX][neighborZ]) {
          distanceField[neighborX][neighborZ] = tentativeDistance;
          openList.push({ x: neighborX, z: neighborZ });
        }
      });

      // Add current node to closed set
      closedSet.add(`${current.x},${current.z}`);
    }

    // Reconstruct path from target to start
    const path = [];
    let currentPos = { x: targetX, z: targetZ };

    while (!(currentPos.x === startX && currentPos.z === startZ)) {
      path.push({ x: currentPos.x, z: currentPos.z });

      // Find the neighbor with the lowest distance
      const neighbors = this.getNeighbors(currentPos);
      let minDistance = Infinity;
      let nextPos = null;

      neighbors.forEach((neighbor) => {
        const neighborX = neighbor.x;
        const neighborZ = neighbor.z;

        if (
          neighborX < gridMinX ||
          neighborX > gridMaxX ||
          neighborZ < gridMinZ ||
          neighborZ > gridMaxZ
        ) {
          return; // Skip out-of-bounds neighbors
        }

        if (grid[neighborX][neighborZ] === 1) {
          return; // Skip obstacles
        }

        if (distanceField[neighborX][neighborZ] < minDistance) {
          minDistance = distanceField[neighborX][neighborZ];
          nextPos = neighbor;
        }
      });

      if (!nextPos) {
        console.error(
          "No valid next position found from:",
          currentPos.x,
          currentPos.z
        );
        break;
      }

      currentPos = nextPos;
    }

    // Add start position to path
    path.push({ x: startX, z: startZ });

    // Reverse path to get start to target order
    path.reverse();

    return path.map(({ x, z }) => ({ x: x + minX, z: z + minZ }));
  }

  getNeighbors(pos) {
    const { x, z } = pos;
    const neighbors = [
      { x: x + 1, z }, // Right
      { x: x - 1, z }, // Left
      { x, z: z + 1 }, // Up
      { x, z: z - 1 }, // Down
      { x: x + 1, z: z + 1 }, // Top-right (Diagonal)
      { x: x - 1, z: z - 1 }, // Bottom-left (Diagonal)
      { x: x + 1, z: z - 1 }, // Bottom-right (Diagonal)
      { x: x - 1, z: z + 1 }, // Top-left (Diagonal)
    ];

    return neighbors;
  }

  moveAlongPath(path) {
    let index = 0;

    const interval = setInterval(() => {
      if (index < path.length) {
        const nextPosition = path[index];
        console.log("Moving to:", nextPosition);

        // Assuming playerMovementFunction moves the player to nextPosition
        this.object.moveTo(nextPosition);

        index++;
      } else {
        clearInterval(interval);
        console.log("Reached the target!");
      }
    }, 1000); // Adjust interval as needed for smooth movement
  }
}
