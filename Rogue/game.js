const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const MAP_WIDTH = canvas.width / TILE_SIZE;
const MAP_HEIGHT = canvas.height / TILE_SIZE;

const ROOM_COUNT = 10;
const MIN_ROOM_SIZE = 5;
const MAX_ROOM_SIZE = 10;

let map = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(0));
let rooms = [];
let player = {
    x: Math.floor(MAP_WIDTH / 2),
    y: Math.floor(MAP_HEIGHT / 2),
    size: TILE_SIZE,
    speed: 1
};
let currentRoom = null;

function generateRooms() {
    rooms = [];
    map = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(0)); // Reset map

    for (let i = 0; i < ROOM_COUNT; i++) {
        const roomWidth = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
        const roomHeight = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
        const roomX = Math.floor(Math.random() * (MAP_WIDTH - roomWidth));
        const roomY = Math.floor(Math.random() * (MAP_HEIGHT - roomHeight));
        
        rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
        
        // Fill room area with floor tiles
        for (let y = roomY; y < roomY + roomHeight; y++) {
            for (let x = roomX; x < roomX + roomWidth; x++) {
                if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                    map[y][x] = 1; // Floor
                }
            }
        }

        // Draw walls around the room
        for (let y = roomY - 1; y <= roomY + roomHeight; y++) {
            for (let x = roomX - 1; x <= roomX + roomWidth; x++) {
                if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                    if (map[y][x] === 0) { // Only set wall if it's empty
                        map[y][x] = 2; // Wall
                    }
                }
            }
        }
    }

    placeDoors();
    return rooms;
}

// Places doors between rooms
function placeDoors() {
    for (let i = 0; i < rooms.length - 1; i++) {
        const { x: x1, y: y1 } = getRoomCenter(rooms[i]);
        const { x: x2, y: y2 } = getRoomCenter(rooms[i + 1]);

        const doorX = Math.floor((x1 + x2) / 2);
        const doorY = Math.floor((y1 + y2) / 2);

        if (doorY >= 0 && doorY < MAP_HEIGHT && doorX >= 0 && doorX < MAP_WIDTH) {
            map[doorY][doorX] = 1; // Floor (door)
        }
    }
}

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (map[y] && map[y][x] !== undefined) { // Check if map[y] and map[y][x] are defined
                if (map[y][x] === 1) {
                    ctx.fillStyle = 'lightgrey'; // Floor color
                } else if (map[y][x] === 2) {
                    ctx.fillStyle = 'darkgrey'; // Wall color
                } else {
                    continue; // Skip empty tiles
                }
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, player.size, player.size);
}

function connectRooms() {
    for (let i = 0; i < rooms.length - 1; i++) {
        const { x: x1, y: y1 } = getRoomCenter(rooms[i]);
        const { x: x2, y: y2 } = getRoomCenter(rooms[i + 1]);

        if (Math.random() > 0.5) {
            drawHorizontalTunnel(x1, x2, y1);
            drawVerticalTunnel(y1, y2, x2);
        } else {
            drawVerticalTunnel(y1, y2, x1);
            drawHorizontalTunnel(x1, x2, y2);
        }
    }
}

function drawHorizontalTunnel(x1, x2, y) {
    if (y >= 0 && y < MAP_HEIGHT) {
        const start = Math.min(x1, x2);
        const end = Math.max(x1, x2);
        for (let x = start; x <= end; x++) {
            if (x >= 0 && x < MAP_WIDTH) {
                map[y][x] = 1; // Floor
            }
        }
    }
}

function drawVerticalTunnel(y1, y2, x) {
    if (x >= 0 && x < MAP_WIDTH) {
        const start = Math.min(y1, y2);
        const end = Math.max(y1, y2);
        for (let y = start; y <= end; y++) {
            if (y >= 0 && y < MAP_HEIGHT) {
                map[y][x] = 1; // Floor
            }
        }
    }
}

function getRoomCenter(room) {
    return {
        x: Math.floor(room.x + room.width / 2),
        y: Math.floor(room.y + room.height / 2)
    };
}

function handleInput(event) {
    let newX = player.x;
    let newY = player.y;

    switch (event.key) {
        case 'ArrowUp':
            newY -= player.speed;
            break;
        case 'ArrowDown':
            newY += player.speed;
            break;
        case 'ArrowLeft':
            newX -= player.speed;
            break;
        case 'ArrowRight':
            newX += player.speed;
            break;
        default:
            return; // Ignore other keys
    }

    // Ensure the player moves to a valid position on the floor
    if (isValidPosition(newX, newY)) {
        player.x = newX;
        player.y = newY;

        // Check if the player has entered a door
        if (map[player.y][player.x] === 1) {
            updateRoom();
        }
    }

    draw();
}

// Ensure that the new position is within bounds and on a floor tile
function isValidPosition(x, y) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && map[y][x] === 1;
}

// Updates the room and player position
function updateRoom() {
    // Find the new room based on player position
    currentRoom = rooms.find(room => {
        return player.x >= room.x && player.x < room.x + room.width &&
               player.y >= room.y && player.y < room.y + room.height;
    });

    if (currentRoom) {
        // Regenerate map based on the new room
        map = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(0)); // Reset map
        generateRooms();
        connectRooms();

        // Move player to the center of the new room
        player.x = Math.floor(currentRoom.x + currentRoom.width / 2);
        player.y = Math.floor(currentRoom.y + currentRoom.height / 2);
    }
}

function draw() {
    drawMap();
    drawPlayer();
}

document.addEventListener('keydown', handleInput);

// Initialize the game
rooms = generateRooms();
connectRooms();
currentRoom = rooms[0]; // Set initial room
player.x = Math.floor(currentRoom.x + currentRoom.width / 2);
player.y = Math.floor(currentRoom.y + currentRoom.height / 2);
draw();
