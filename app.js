const CELL_MOUNTAIN = 'm';
const CELL_RUINS = 'r';
const CELL_WASTELAND = 'w';
const CELL_EMPTY = '';

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // случайный индекс от 0 до i
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function initMap() {
    const map = new Array(10);
    for (let index = 0; index < map.length; index++) {
        map[index] = new Array(10).fill(CELL_EMPTY);
    }

    return map;
}

function randCells(fn, count, maxAttempts = 100) {
    let attempts = 0;
    let generated = 0;
    while (generated < count && attempts < maxAttempts) {
        attempts += 1;
        const rowN = getRandomInt(0, 10);
        const colN = getRandomInt(0, 10);

        if (fn(rowN, colN)) {
            generated += 1;
        }
    }
}

function generateObject(map, cellType, count, minDistance = 0) {
    if (count == 0) {
        return;
    }
    let attempts = 0;
    const maxAttempts = 100;

    const objects = [];

    let generated = 0;
    while (generated < count && attempts < maxAttempts) {
        attempts += 1;
        const rowN = getRandomInt(0, 10);
        const colN = getRandomInt(0, 10);

        // check distance
        let distanceOk = true;
        for (const obj of objects) {
            let distance = Math.abs(rowN - obj.rowN) + Math.abs(colN - obj.colN);
            if (distance < minDistance) {
                distanceOk = false;
                break;
            }
        }

        if (distanceOk && checkCellAndNeighbors(map, rowN, colN, cellType)) {
            map[rowN][colN] = cellType;
            objects.push({rowN: rowN, colN: colN});
            generated += 1;
        }
    }
    console.log("generate object", cellType, "attempts/generated", attempts, generated);
}

function inMapBorder(map, rowN, colN) {
    return !(rowN >= map.length || rowN < 0 || colN < 0 || colN >= map[0].length);
}

function generateWasteland(map, count = 7) {
    if (count === 0) {
        return;
    }
    let rowN = getRandomInt(0, 10);
    let colN = getRandomInt(0, 10);

    let attempts = 0;
    const maxAttempts = 100;
    const directs = ['top', 'right', 'down', 'left'];

    map[rowN][colN] = CELL_WASTELAND;
    let generated = 1;
    while (generated < count && attempts < maxAttempts) {
        attempts += 1;
        shuffle(directs);
        console.log("attempts generate Wasteland Cell ", attempts)
        let canWalk = false;

        for (let directIdx = 0; directIdx < 4; directIdx++) {
            switch (directs[directIdx]) {
                case 'top':
                    if (inMapBorder(map, rowN - 1, colN) && map[rowN - 1][colN] !== CELL_WASTELAND) {
                        rowN -= 1;
                        canWalk = true;
                    }
                    break;
                case 'left':
                    if (inMapBorder(map, rowN, colN - 1) && map[rowN][colN - 1] !== CELL_WASTELAND) {
                        colN -= 1;
                        canWalk = true;
                    }
                    break;
                case 'right':
                    if (inMapBorder(map, rowN, colN + 1) && map[rowN][colN + 1] !== CELL_WASTELAND) {
                        colN += 1;
                        canWalk = true;
                    }
                    break;
                case 'down':
                    if (inMapBorder(map, rowN + 1, colN) && map[rowN + 1][colN] !== CELL_WASTELAND) {
                        rowN += 1;
                        canWalk = true;
                    }
                    break;
            }
            if (canWalk) {
                map[rowN][colN] = CELL_WASTELAND;
                generated += 1;
                break;
            }
        }
    }

    if (generated < count) {
        console.log('fail generate wastelands');
    }
}

function checkCellAndNeighbors(map, rowN, colN, testCell) {
    const neighbors = getNeighbors(map, rowN, colN);
    return (map[rowN][colN] === CELL_EMPTY && map[rowN][colN] !== CELL_WASTELAND &&
        neighbors.left !== testCell && neighbors.top !== testCell &&
        neighbors.right !== testCell && neighbors.down !== testCell);
}

function getNeighbors(map, row, col) {
    // left
    const result = {
        top: '', left: '', right: '', down: '',
    }
    // if (row < 0 || row >= map.length || col < 0 || col >= map[row].length) {
    //     return result;
    // }

    // top
    if (row > 0) {
        result.top = map[row - 1][col];
    }

    //down
    if (row < map.length - 1) {
        result.down = map[row + 1][col];
    }

    //left
    if (col > 0) {
        result.left = map[row][col - 1];
    }

    // right
    if (col < map.length - 1) {
        result.right = map[row][col + 1];
    }

    return result;
}

const mapSettings = {
    wastelandSize: 7,
    mountains: 5,
    mountainsDistance: 3,
    ruinsDistance: 3,
    ruins: 6,
}

function generateMap(mapSettings) {
    const map = initMap();
    generateWasteland(map, mapSettings.wastelandSize);
    generateObject(map, CELL_MOUNTAIN, mapSettings.mountains, mapSettings.mountainsDistance);
    generateObject(map, CELL_RUINS, mapSettings.ruins, mapSettings.ruinsDistance);

    return map;
};

const app = Vue.createApp({
    data() {
        return {
            map: generateMap(mapSettings),
            mapSettings: mapSettings,
            mountainImg: 'data:image/png;base64,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',
            ruinImg: 'data:image/png;base64,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',
        }
    },
    mountained() {
    },
    methods: {
        generate(event) {
            this.map = generateMap(this.mapSettings);
            console.log(this.map);
        }
    },
    computed: {
    }
});

app.mount('#app');