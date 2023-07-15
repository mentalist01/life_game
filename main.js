

// Получаем элемент canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Определение размеров каждой клетки и цвета заливки
const n = 50,
      m = 50;
const color = "#8B4513";
let cellWidth = canvas.width / n;
let cellHeight = canvas.height / m;

// Создаем массив клеток, или получаем из локалки, если есть сохраненный
let cellsArr = localStorage.getItem('cellsArr');
if (cellsArr) {
  cellsArr = JSON.parse(cellsArr);
  updateCanv(cellsArr)
} else {
  cellsArr = new Array(n);
}
let copyCellsArr;
// Также нам нужно при обновлении массива, добавлять его в локальное хранилище
function updateCellsArrayInLocalStorage(arr){
  localStorage.setItem('cellsArr', JSON.stringify(arr));
}

// Заполняем массив значениями
for (let i = 0; i < n; i++) {
  cellsArr[i] = new Array(m);
  for (let j = 0; j < m; j++) {
    cellsArr[i][j] = 0;
  }
}
// Разбиение canvas на n строк и m столбцов
for (let i = 0; i < cellsArr.length; i++) {
  for (let j = 0; j < cellsArr[i].length; j++) {
    const x = i * cellWidth;
    const y = j * cellHeight;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cellWidth, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + cellHeight);
    ctx.stroke();
  }
}

// При зажатии и движении мыши по канвасу, будут заполняться квадратики

let isSame;

function movefillCellsManually(event) {
  // Получим номера квадратика по строке и столбцу
  let x = event.offsetX;
  let y = event.offsetY;
  x = Math.floor(x / cellWidth);
  y = Math.floor(y / cellHeight);
  if (
    ((isSame && !(isSame[0] === x && isSame[1] === y)) || !isSame) &&
    x <= 49 &&
    y <= 49
  ) {
    if (cellsArr[y][x] == 0) {
      // Избавляемся от бага, когда клетку невозможно нарисовать, потому что на ней стоит курсор
      isSame = [x, y];

      ctx.fillStyle = color;
      ctx.fillRect(
        x * cellWidth + 1,
        y * cellHeight + 1,
        cellWidth - 2.1,
        cellHeight - 2.1
      );
      cellsArr[y][x] = 1;
    } else {
      isSame = [x, y];

      ctx.clearRect(
        x * cellWidth + 1,
        y * cellHeight + 1,
        cellWidth - 2.1,
        cellHeight - 2.1
      );
      cellsArr[y][x] = 0;
    }
  }
}

function clickFillCellsManually(event) {
  // Получим номера клетки по строке и столбцу
  let x = event.offsetX;
  let y = event.offsetY;
  x = Math.floor(x / cellWidth);
  y = Math.floor(y / cellHeight);
  if (x <= 49 && y <= 49) {
    if (cellsArr[y][x] == 0) {
      ctx.fillStyle = color;
      ctx.fillRect(
        x * cellWidth + 1,
        y * cellHeight + 1,
        cellWidth - 2.1,
        cellHeight - 2.1
      );
      cellsArr[y][x] = 1;
    } else {
      ctx.clearRect(
        x * cellWidth + 1,
        y * cellHeight + 1,
        cellWidth - 2.1,
        cellHeight - 2.1
      );
      cellsArr[y][x] = 0;
    }
  }
}

// Разделяем событие клик на два события
canvas.addEventListener("mousedown", function (event) {
  let lastClickX = event.clientX;
  let lastClickY = event.clientY;
  canvas.addEventListener(
    "mouseup",
    function (event) {
      if (event.clientX === lastClickX && event.clientY === lastClickY) {
        // кнопка мыши была нажата и отпущена в одной и той же точке
        clickFillCellsManually(event);
      }
    },
    {
      once: true,
    }
  );
});

canvas.addEventListener("mousedown", function (event) {
  canvas.addEventListener("mousemove", movefillCellsManually);
});
canvas.addEventListener("mouseup", function (event) {
  canvas.removeEventListener("mousemove", movefillCellsManually);
});

// Отрисовка массива
function updateCanv(cells) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      const x = i * cellWidth;
      const y = j * cellHeight;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellWidth, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cellHeight);
      ctx.stroke();
      if (cells[j][i] === 1) {
        ctx.fillStyle = color;
        ctx.fillRect(
          i * cellWidth + 1,
          j * cellHeight + 1,
          cellWidth - 2.1,
          cellHeight - 2.1
        );
      }
    }
  }
}

function fillRandomCells(cells) {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      cells[i][j] = Math.round(Math.random());
    }
  }
}

// Логика игры
function countLivingNeighbours(arr, i, j) {
  let count = 0;
  if (i > 0 && j > 0 && arr[i - 1][j - 1] === 1) count++;
  if (i > 0 && arr[i - 1][j] === 1) count++;
  if (i > 0 && j < arr[i].length - 1 && arr[i - 1][j + 1] === 1) count++;
  if (j > 0 && arr[i][j - 1] === 1) count++;
  if (j < arr[i].length - 1 && arr[i][j + 1] === 1) count++;
  if (i < arr.length - 1 && j > 0 && arr[i + 1][j - 1] === 1) count++;
  if (i < arr.length - 1 && arr[i + 1][j] === 1) count++;
  if (i < arr.length - 1 && j < arr[i].length - 1 && arr[i + 1][j + 1] === 1)
    count++;
  return count;
}

function updateArray(arr) {
  copyCellsArr = JSON.parse(JSON.stringify(arr));

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      let neighbours = countLivingNeighbours(arr, i, j);
      if (arr[i][j] === 0 && neighbours === 3) {
        copyCellsArr[i][j] = 1;
      } else if (arr[i][j] === 1 && (neighbours > 3 || neighbours < 2)) {
        copyCellsArr[i][j] = 0;
      }
    }
  }
  return JSON.parse(JSON.stringify(copyCellsArr));
}

// Старт и стоп игры
const startButton = document.querySelector("#startButton");
let isRunning = false;

function toggleStart() {
  if (isRunning) {
    startButton.innerHTML = "&#9654;"; // Change back to start arrow
    clearInterval(intervalID);
    stopped = true;
  } else {
    startButton.innerHTML = "&#10074;&#10074;"; // Change to pause icon
    intervalID = setInterval(start, 150);
    stopped = false;
  }
  isRunning = !isRunning;
}

let stopped = true;
startButton.addEventListener("click", toggleStart);
function start() {
  cellsArr = updateArray(cellsArr);
  updateCanv(cellsArr);
}

// Следующий шаг
function nextStep() {
  cellsArr = updateArray(cellsArr);
  updateCanv(cellsArr);
}

const nextButton = document.querySelector('#nextButton');

nextButton.addEventListener('click',nextStep);