// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.ts":[function(require,module,exports) {
// возвращает player на каждый клик
var Queue =
/** @class */
function () {
  function Queue(players) {
    this.players = players;
    this.counter = new Counter(this.players.length);
  }

  ;

  Queue.prototype.getGamer = function () {
    return this.players[this.counter.getplayerNumber()];
  };

  return Queue;
}(); // возвращает числа с 0 до  players[].length


var Counter =
/** @class */
function () {
  function Counter(amountPlayers) {
    this.amountPlayers = amountPlayers;
    this.count = null;
  }

  Counter.prototype.getplayerNumber = function () {
    if (this.count === null) {
      this.count = 0;
    } else {
      this.count++;
      if (this.count >= this.amountPlayers) this.count = 0;
    }

    return this.count;
  };

  return Counter;
}(); //хранилище всех точек по координатам 


var Dots =
/** @class */
function () {
  function Dots() {
    this.dots = {};
  } // добавляет dot с заданными коорд {1 : {1: Dot, 5: Dot}, 2: {1:Dot}...}


  Dots.prototype.add = function (dot, row, col) {
    if (this.dots[row] === undefined) {
      this.dots[row] = {};
    }

    this.dots[row][col] = dot;
  }; // возвращает Dot по заданным коорд.


  Dots.prototype.get = function (row, col) {
    if (this.dots[row] && this.dots[row][col]) {
      return this.dots[row][col];
    } else {
      return undefined;
    }
  };

  return Dots;
}(); // класс точек


var Dot =
/** @class */
function () {
  function Dot(player, elem, row, col, dots) {
    this.player = player;
    this.elem = elem;
    this.row = row;
    this.col = col;
    this.dots = dots;
    this.neighbors = {}; //соседи {-1: {1: Dot, 0: Dot,} 0: {...}}

    this.reflect();
  }

  Dot.prototype.becomeWinner = function () {
    this.elem.classList.add('winner');
  };

  Dot.prototype.getNeighbor = function (deltRow, deltaCol) {
    if (this.neighbors[deltRow] !== undefined) {
      return this.neighbors[deltRow][deltaCol];
    } else {
      return undefined;
    }
  }; // добавляет соседа по смещению delta (1)


  Dot.prototype.addNeighbor = function (neighbor) {
    var deltaRow = neighbor.row - this.row;
    var deltaCol = neighbor.col - this.col;

    if (this.neighbors[deltaRow] === undefined) {
      this.neighbors[deltaRow] = {};
    }

    this.neighbors[deltaRow][deltaCol] = neighbor;
  }; // проверяет одинаковый класс или нет


  Dot.prototype.belongsTo = function (player) {
    return this.player === player;
  }; // проверяет наличие соседа в заданной точке которая берется из хранилища (2)


  Dot.prototype.considerNeighbor = function (deltaRow, deltaCol) {
    var neighbor = this.dots.get(this.row - deltaRow, this.col - deltaCol);

    if (neighbor !== undefined && neighbor.belongsTo(this.player)) {
      this.addNeighbor(neighbor);
      this.notifyNeighbors();
    }
  }; // ищет всех соседей вокруг (3)


  Dot.prototype.findNeighbors = function () {
    this.considerNeighbor(1, 1);
    this.considerNeighbor(1, 0);
    this.considerNeighbor(1, -1);
    this.considerNeighbor(-1, 1);
    this.considerNeighbor(-1, 0);
    this.considerNeighbor(-1, -1);
    this.considerNeighbor(0, 1);
    this.considerNeighbor(0, -1);
  };

  Dot.prototype.notifyNeighbors = function () {
    for (var rowKey in this.neighbors) {
      for (var colKey in this.neighbors[rowKey]) {
        this.neighbors[rowKey][colKey].addNeighbor(this);
      }
    }
  };

  Dot.prototype.reflect = function () {
    this.elem.classList.add('gamer');
    this.elem.classList.add(this.player);
    this.findNeighbors();
  };

  return Dot;
}(); // класс для взаимодействия с DOM элементами


var HTML =
/** @class */
function () {
  function HTML() {}

  HTML.prototype.createField = function (anchor, colsNum, rowsNum) {
    var table = document.createElement('table');

    for (var i = 0; i < rowsNum; i++) {
      var tr = document.createElement('tr');

      for (var j = 0; j < colsNum; j++) {
        var td = document.createElement('td');
        tr.append(td);
      }

      table.append(tr);
    }

    anchor.append(table);
    return table;
  };

  HTML.prototype.getPrevSiblingsNum = function (elem) {
    var prev = elem.previousElementSibling;
    var i = 0;

    while (prev) {
      prev = prev.previousElementSibling;
      i++;
    }

    return i;
  };

  return HTML;
}();

var Field =
/** @class */
function () {
  function Field(anchor, colsNum, rowsNum) {
    this.colsNum = colsNum;
    this.rowsNum = rowsNum;
    this.endGame = false;
    this.html = new HTML();
    this.dots = new Dots();
    this.queue = new Queue(['gamer1', 'gamer2']);
    this.DOManchor = typeof anchor === 'string' ? document.querySelector("." + anchor) : anchor;
    this.render(); // отрисовка таблицы

    this.handle(); // навешываем обработчик на таблицу
  }

  Field.prototype.render = function () {
    this.field = this.html.createField(this.DOManchor, this.colsNum, this.rowsNum);
  };

  Field.prototype.handle = function () {
    var _this = this;

    this.field.addEventListener('click', function (e) {
      var cell = e.target.closest('td:not(.gamer)');

      if (!_this.endGame && cell) {
        //если игра не закончена и клик был на ячейке
        var col = _this.html.getPrevSiblingsNum(cell);

        var row = _this.html.getPrevSiblingsNum(cell.parentElement);

        var player = _this.queue.getGamer();

        var dot = new Dot(player, cell, row, col, _this.dots);

        _this.dots.add(dot, row, col);

        console.log(_this.dots);

        var winLine = _this.checkWin(dot);

        if (winLine) {
          _this.win(winLine);
        }
      }
    });
  };

  Field.prototype.win = function (winLine) {
    this.endGame = true;
    this.notyfyWinnerCells(winLine);
  };

  Field.prototype.notyfyWinnerCells = function (winLine) {
    winLine.forEach(function (dot) {
      dot.becomeWinner();
    });
  };

  Field.prototype.checkWin = function (dot) {
    var dirs = [{
      deltaRow: 0,
      deltaCol: -1
    }, {
      deltaRow: -1,
      deltaCol: -1
    }, {
      deltaRow: -1,
      deltaCol: 0
    }, {
      deltaRow: -1,
      deltaCol: 1
    }];

    for (var i = 0; i < dirs.length; i++) {
      var line = this.checkLine(dot, dirs[i].deltaRow, dirs[i].deltaCol);

      if (line.length >= 5) {
        return line;
      }
    }

    return false;
  };

  Field.prototype.checkLine = function (dot, deltaRow, deltaCol) {
    var dir1 = this.checkDir(dot, deltaRow, deltaCol);
    var dir2 = this.checkDir(dot, -deltaRow, -deltaCol);
    return [].concat(dir1, [dot], dir2);
  };

  Field.prototype.checkDir = function (dot, deltaRow, deltaCol) {
    var result = [];
    var neighbor = dot;

    while (true) {
      neighbor = neighbor.getNeighbor(deltaRow, deltaCol);

      if (neighbor) {
        result.push(neighbor);
      } else {
        return result;
      }
    }
  };

  return Field;
}();

var filed = new Field('game', 15, 15);
},{}],"../../AppData/Roaming/npm-cache/_npx/7332/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "50742" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../AppData/Roaming/npm-cache/_npx/7332/node_modules/parcel/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/index.js.map