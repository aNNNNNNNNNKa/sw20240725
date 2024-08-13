document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-container');
    const mapWidth = window.innerWidth;
    const mapHeight = window.innerHeight;
    const roomCount = 5;
    const minRoomSize = 200;
    const maxRoomSize = 600;
    const corridorWidth = 40;
    const moveDistance = 40;

    const rooms = [];
    const paths = [];

    const character = document.createElement('div');
    character.className = 'character';
    container.appendChild(character);
    let charX = 0;
    let charY = 0;

    function createRoom(x, y, width, height) {
        const room = document.createElement('div');
        room.className = 'room';
        room.style.width = `${width}px`;
        room.style.height = `${height}px`;
        room.style.left = `${x}px`;
        room.style.top = `${y}px`;
        container.appendChild(room);
        return { x, y, width, height, element: room };
    }

    function createPath(x1, y1, x2, y2) {
        const path = document.createElement('div');
        path.className = 'path';
        if (x1 === x2) {
            path.style.width = `${corridorWidth}px`;
            path.style.height = `${Math.abs(y2 - y1)}   px`;
            path.style.left = `${x1}px`;
            path.style.top = `${Math.min(y1, y2)}px`;
        } else {
            path.style.width = `${Math.abs(x2 - x1)}px`;
            path.style.height = `${corridorWidth}px`;
            path.style.left = `${Math.min(x1, x2)}px`;
            path.style.top = `${y1}px`;
        }
        container.appendChild(path);
        paths.push(path);
    }

    function generateRooms() {
        for (let i = 0; i < roomCount; i++) {
            let x, y, width, height, overlap;
            do {
                overlap = false;
                width = Math.floor(Math.random() * (maxRoomSize - minRoomSize) + minRoomSize);
                height = Math.floor(Math.random() * (maxRoomSize - minRoomSize) + minRoomSize);
                x = Math.floor(Math.random() * (mapWidth - width));
                y = Math.floor(Math.random() * (mapHeight - height));
                for (const room of rooms) {
                    if (!(x + width < room.x ||
                        x > room.x + room.width ||
                        y + height < room.y ||
                        y > room.y + room.height)) {
                        overlap = true;
                        break;
                    }
                }
            } while (overlap);
            rooms.push(createRoom(x, y, width, height));
        }
    }

    function connectRooms() {
        for (let i = 0; i < rooms.length - 1; i++) {
            const room1 = rooms[i];
            const room2 = rooms[i + 1];

            const x1 = room1.x + room1.width / 2;
            const y1 = room1.y + room1.height / 2;
            const x2 = room2.x + room2.width / 2;
            const y2 = room2.y + room2.height / 2;

            createPath(x1, y1, x1, y2);
            createPath(x1, y2, x2, y2);
        }
    }

    function placeCharacterInRoom() {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const maxX = room.x + room.width - character.clientWidth;
        const maxY = room.y + room.height - character.clientHeight;

        charX = Math.floor(Math.random() * (maxX - room.x)) + room.x;
        charY = Math.floor(Math.random() * (maxY - room.y)) + room.y;
        updateCharacterPosition();
    }

    function updateCharacterPosition() {
        character.style.left = `${charX}px`;
        character.style.top = `${charY}px`;
    }

    function isInAnyRoomOrPath(newX, newY) {
        const isInRoom = rooms.some(room => {
            return newX >= room.x && newX + character.clientWidth <= room.x + room.width &&
                   newY >= room.y && newY + character.clientHeight <= room.y + room.height;
        });

        const isInPath = paths.some(path => {
            const pathRect = path.getBoundingClientRect();
            const charRect = {
                left: newX,
                top: newY,
                right: newX + character.clientWidth,
                bottom: newY + character.clientHeight
            };

            return !(charRect.right < pathRect.left ||
                     charRect.left > pathRect.right ||
                     charRect.bottom < pathRect.top ||
                     charRect.top > pathRect.bottom);
        });

        return isInRoom || isInPath;
    }

    function moveCharacter(dx, dy) {
        const newX = charX + dx;
        const newY = charY + dy;

        if (isInAnyRoomOrPath(newX, newY)) {
            charX = newX;
            charY = newY;
            updateCharacterPosition();
        }
    }

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp':
                moveCharacter(0, -moveDistance);
                break;
            case 'ArrowDown':
                moveCharacter(0, moveDistance);
                break;
            case 'ArrowLeft':
                moveCharacter(-moveDistance, 0);
                break;
            case 'ArrowRight':
                moveCharacter(moveDistance, 0);
                break;
        }
    });

    generateRooms();
    connectRooms();
    placeCharacterInRoom();
});
