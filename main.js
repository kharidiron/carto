const gridSize = 11;
const coinPool = 14;

const board = document.getElementById('cartoapp');
const victorypoints = document.getElementById('victorypoints');

const maps = {
    "basemap": {
        "mountains": ['(1,3)', '(2,8)', '(5,5)', '(8,2)', '(9,7)'],
        "ruins": ['(1,5)', '(2,1)', '(2,9)', '(8,1)', '(8,9)', '(9,5)'],
        "blocked": []
    },
    "chasm": {
        "mountains": ['(1,8)','(2,3)','(7,5)','(8,9)','(9,2)'],
        "ruins": ['(1,6)','(2,2)','(4,6)','(6,1)','(7,8)','(9,3)'],
        "blocked": ['(3,5)','(4,4)','(4,5)','(5,4)','(5,5)','(5,6)','(6,5)']
    },
    "herosbase": {
        "mountains": ['(1,1)','(3,8)','(5,3)','(8,9)','(9,5)'],
        "ruins": ['(1,4)','(3,7)','(6,6)','(7,2)','(9,8)','(10,0)'],
        "blocked": []
    },
    "heroshard": {
        "mountains": ['(1,9)','(3,3)','(5,6)','(8,2)','(8,9)'],
        "ruins": ['(1,4)','(1,8)','(5,1)','(6,7)','(6,10)','(9,5)'],
        "blocked": ['(1,1)','(2,1)','(5,9)','(5,10)','(6,9)','(9,0)','(9,1)']
    },
}


let brush = 'unpainted';

var usermap = getQueryVariable("map");
if (!usermap) {
    gridmap = maps["basemap"]
} else {
    gridmap = maps[usermap]
}

/* -------------------------------- */

class Cell {
    constructor(i, j) {
        this._i = i
        this._j = j
        this._content = null
    }

    get i() {
        return this._i
    }

    get j() {
        return this._j
    }

    get content() {
        return this._content
    }

    set content(content) {
        this._content = content
    }
}

class Row {
    constructor(i) {
        this._i = i
        this._cells = {}

        var newDiv = document.createElement('div')
        newDiv.className = 'boardrow'
        newDiv.id = 'row-' + this._i
        let ctx = document.getElementById('board');
        ctx.appendChild(newDiv)
    }

    get cells() {
        return this._cells
    }

    get i() {
        return this._i
    }
}

class Grid {
    constructor() {
        this._rows = {}

        var newDiv = document.createElement('div')
        newDiv.className = 'board'
        newDiv.id = 'board'
        board.appendChild(newDiv)
    }

    get rows() {
        return this._rows
    }

    addCell(i, j) {
        const cell = new Cell(i, j)

        if(!this.rows[cell.i]) {
            this.rows[cell.i] = new Row(cell.i)
        }
        cell._row = this.rows[cell.i]
        this.rows[cell.i].cells[cell.j] = cell

        var newDiv = document.createElement('div')
        newDiv.id = 'cell-' + i + '-' + j

        if (gridmap.mountains.includes('(' + i + ',' + j + ')')) {
            newDiv.className = 'boardcell mountain'
        }
        else if (gridmap.blocked.includes('(' + i + ',' + j + ')')) {
            newDiv.className = 'boardcell blocked'
        }
        else if (gridmap.ruins.includes('(' + i + ',' + j + ')')) {
            newDiv.className = 'boardcell ruins unpainted'
            newDiv.onclick = function() {
                paintCell(newDiv.id)
            }
        }
        else {
            newDiv.className = 'boardcell unpainted'
            newDiv.onclick = function() {
                paintCell(newDiv.id)
            }
        }

        let ctx = document.getElementById('row-' + i)
        ctx.appendChild(newDiv)

        return cell
    } 

    build(size) {
        for(let x = 0; x < size; x++) {
            for(let y = 0; y < size; y++) {
                this.addCell(x, y)
            }
        }
    }

    getCell(i, j) {
        return this.rows[i].cells[j]
    }

    getCells() {
        return Object.values(this.rows).map(row => Object.values(row.cells)).flat()
    }
}

class Coin {
    constructor(i) {
        this._i = i
        this._state = 0
    }

    get i() {
        return this._i
    }

    get state() {
        return this._state
    }

    set state(state) {
        this._state = state
    }

    toggleState() {
        if (this._state == 0) {
            this._state = 1
        }
        else {
            this._state = 0
        }
    }
}

class Coins {
    constructor() {
        this._coins = {}

        var newDiv = document.createElement('div')
        newDiv.className = 'coins'
        newDiv.id = 'coins'
        victorypoints.appendChild(newDiv)
    }

    get coins() {
        return this._coins
    }

    addCoin(i) {
        const coin = new Coin(i)

        this.coins[coin.i] = coin

        var newDiv = document.createElement('div')
        newDiv.className = 'coin'
        newDiv.id = 'coin-' + i
        newDiv.onclick = function() {
            toggleCoin(newDiv.id)
        }
        let ctx = document.getElementById('coins')
        ctx.appendChild(newDiv)

        return coin
    }

    build(size) {
        for(let x = 0; x < size; x++) {
            this.addCoin(x)
        }
    }
}

/* -------------------------------- */

function paintCell(id) {
    var div = document.getElementById(id);

    if (div.classList.contains('unpainted')) {
        div.classList.remove('unpainted')
        div.classList.add(brush)
    }
    else {
        div.classList.remove(brush)
        div.classList.add('unpainted')
    }
}

function selectBiome(id) {
    var div = document.getElementById(id);
    var biome = div.id
    console.log(biome)
    
    switch(biome) {
        case 'biome-forest':
            brush = 'forest';
            break;
        case 'biome-village':
            brush = 'village';
            break;
        case 'biome-river':
            brush = 'river';
            break;
        case 'biome-field':
            brush = 'field';
            break;
        case 'biome-ambush':
            brush = 'ambush';
            break;
        default:
            brush = 'unpainted'
    }
}

function toggleCoin(id) {
    var div = document.getElementById(id);

    if (div.classList.contains('coin-filled')) {
        div.classList.remove('coin-filled')
        div.toggleState
    }
    else {
        div.classList.add('coin-filled')
        div.toggleState
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    } 
}

function sumSeason(season) {
    var d1 = document.getElementById(season + '-d1')
    var d2 = document.getElementById(season + '-d2')
    var vp = document.getElementById(season + '-vp')
    var a = document.getElementById(season + '-a')

    var score = parseInt(d1.value) + parseInt(d2.value) + parseInt(vp.value) - parseInt(a.value) || 0

    document.getElementById(season + '-score').innerHTML = score;
    return score
}

function getScores() {
    let spring = sumSeason('spring')
    let summer = sumSeason('summer')
    let fall = sumSeason('fall')
    let winter = sumSeason('winter')

    let total = spring + summer + fall + winter
}

/* -------------------------------- */

const grid = new Grid()
const coins = new Coins()

function display() {
    grid.build(gridSize)
    coins.build(coinPool)
}

display()
