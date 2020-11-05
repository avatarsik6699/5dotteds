// возвращает player на каждый клик
class Queue { 
    public counter: Counter = new Counter(this.players.length);
    constructor(private players: string[]) {};
    
    getGamer():string {
        return this.players[this.counter.getplayerNumber()];
    }

}
// возвращает числа с 0 до  players[].length
class Counter {
    private count: number = null;
    constructor(private amountPlayers: number) {}
    getplayerNumber():number {
        if (this.count === null) {
            this.count = 0;
        } else {
            this.count++;
            if (this.count >= this.amountPlayers) this.count = 0;
        }
        return this.count;
    }
}

//хранилище всех точек по координатам 
class Dots {
    public dots: object = {};

    // добавляет dot с заданными коорд {1 : {1: Dot, 5: Dot}, 2: {1:Dot}...}
    add(dot, row, col):void {
        if (this.dots[row] === undefined) {
            this.dots[row] = {};
        }
        this.dots[row][col] = dot;
    }
    
    // возвращает Dot по заданным коорд.
    get(row, col) {
        if (this.dots[row] && this.dots[row][col]) {
            return this.dots[row][col]
        } else {
            return undefined;
        }
    }
}

// класс точек
class Dot {
    private neighbors = {}; //соседи {-1: {1: Dot, 0: Dot,} 0: {...}}
    constructor(
        private player: string,
        private elem: HTMLElement, 
        public readonly row: number, 
        public readonly col: number,
        private dots: Dots,
    ) {
        this.reflect();
    }

    becomeWinner():void {
        this.elem.classList.add('winner');
    }

    getNeighbor(deltRow, deltaCol) {
        if (this.neighbors[deltRow] !== undefined) {
            return this.neighbors[deltRow][deltaCol]
        } else {
            return undefined;
        }
    }

    // добавляет соседа по смещению delta (1)
    addNeighbor(neighbor) {
        let deltaRow = neighbor.row - this.row;
        let deltaCol = neighbor.col - this.col;

        if (this.neighbors[deltaRow] === undefined) {
            this.neighbors[deltaRow] = {}
        }
        this.neighbors[deltaRow][deltaCol] = neighbor;
    }

    // проверяет одинаковый класс или нет
    belongsTo(player):boolean {
        return this.player === player;
    }

    // проверяет наличие соседа в заданной точке которая берется из хранилища (2)
    considerNeighbor(deltaRow, deltaCol) {
        let neighbor = this.dots.get(this.row - deltaRow, this.col - deltaCol);

        if (neighbor !== undefined && neighbor.belongsTo(this.player)) {
            this.addNeighbor(neighbor);
            this.notifyNeighbors();
        }
    }

    // ищет всех соседей вокруг (3)
    findNeighbors() {
        this.considerNeighbor(1, 1);
        this.considerNeighbor(1, 0);
        this.considerNeighbor(1, -1);
        this.considerNeighbor(-1, 1);
        this.considerNeighbor(-1, 0);
        this.considerNeighbor(-1, -1);
        this.considerNeighbor(0, 1);
        this.considerNeighbor(0, -1);
    }

    notifyNeighbors() {
        for (let rowKey in this.neighbors) {
            for (let colKey in this.neighbors[rowKey]) {
                this.neighbors[rowKey][colKey].addNeighbor(this);
            }
        }
    }

    reflect():void {
        this.elem.classList.add('gamer');
        this.elem.classList.add(this.player);
        this.findNeighbors();
    }


}
// класс для взаимодействия с DOM элементами
class HTML {
    constructor() {}
    createField(anchor: HTMLElement, colsNum:number, rowsNum:number):HTMLElement {
        const table:HTMLElement = document.createElement('table');
        for (let i = 0; i < rowsNum; i++) {
            let tr = document.createElement('tr');
            for (let j = 0; j < colsNum; j++) {
                let td = document.createElement('td');
                tr.append(td);
            }
            table.append(tr);
        }
        anchor.append(table);
        return table;
    }
    
    getPrevSiblingsNum(elem) {
        let prev = elem.previousElementSibling;
        let i = 0;
        while(prev) {
            prev = prev.previousElementSibling;
            i++;
        }

        return i;
    }
}

class Field {
    private DOManchor: HTMLElement; // якорь для таблицы
    private field: HTMLElement; 
    private endGame: boolean = false;
    
    private html: HTML = new HTML;
    private dots: Dots = new Dots;
    private queue: Queue = new Queue(['gamer1', 'gamer2']);

    constructor(anchor: string | HTMLElement, private colsNum:number, private rowsNum:number ) {
        this.DOManchor = typeof anchor === 'string' ? 
        document.querySelector(`.${anchor}`) 
        : anchor;
        this.render(); // отрисовка таблицы
        this.handle(); // навешываем обработчик на таблицу
    }
    private render():void {
        this.field = this.html.createField(this.DOManchor, this.colsNum, this.rowsNum);
    }
    private handle():void {
        this.field.addEventListener('click', (e) => {
            let cell =  (e.target as any).closest('td:not(.gamer)');
            if (!this.endGame && cell) { //если игра не закончена и клик был на ячейке
                let col = this.html.getPrevSiblingsNum(cell);
                let row = this.html.getPrevSiblingsNum(cell.parentElement);

                let player = this.queue.getGamer();

                let dot = new Dot(player, cell, row, col, this.dots);
                this.dots.add(dot, row , col);
                console.log(this.dots);
                let winLine = this.checkWin(dot);
                if (winLine) {
                    this.win(winLine);
                }
            }     
        })
    }

    win(winLine) {
        this.endGame = true;
        this.notyfyWinnerCells(winLine);
    }

    notyfyWinnerCells(winLine) {
        winLine.forEach(dot => {
            dot.becomeWinner();
        });
    }

    private checkWin(dot) {
        let dirs = [
            {deltaRow: 0, deltaCol: -1},
            {deltaRow: -1, deltaCol: -1},
            {deltaRow: -1, deltaCol: 0},
            {deltaRow: -1, deltaCol: 1},
        ]

        for (let i = 0; i < dirs.length; i++) {
            let line = this.checkLine(dot, dirs[i].deltaRow, dirs[i].deltaCol)

            if (line.length >= 5) {
                return line;
            }
        }
        return false;
    }

    private checkLine(dot, deltaRow, deltaCol) {
        let dir1 = this.checkDir(dot, deltaRow, deltaCol);
        let dir2 = this.checkDir(dot, -deltaRow, -deltaCol);

        return [].concat(dir1, [dot], dir2);
    }
    private checkDir(dot, deltaRow, deltaCol): any[] {
        let result = [];
        let neighbor = dot;

        while (true) {
            neighbor = neighbor.getNeighbor(deltaRow, deltaCol);

            if (neighbor) {
                result.push(neighbor);
            } else {
                return result;
            }
        }
    }
}

let filed = new Field('game', 15, 15);

