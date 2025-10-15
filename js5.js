class LineEditor {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Основные свойства
    this.mode = 'draw'; // draw, move, edit, delete
    this.lineColor = 'black';
    this.lineWidth = 2;
    this.snapToGrid = true;
    this.snapToPoints = true;
    this.gridSize = 20;

    // Состояние рисования
    this.isDrawing = false;
    this.isMoving = false;
    this.isEditing = false;
    this.currentLine = null;
    this.selectedLine = null;
    this.dragOffset = {x: 0, y: 0};
    this.editingPoint = null; // 'start' или 'end'

    // Редактирование длины
    this.editingLength = false;
    this.lengthEditOverlay = null;

    // Хранилище линий
    this.lines = [];
    this.tempLine = null;

    // Инициализация объектов для совместимости
    this.objects = [];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupUI();
    this.redraw();
  }

  setupEventListeners() {
    // События canvas
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseout', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
  }

  setupUI() {
    // Кнопки режимов
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setMode(e.target.dataset.mode);
      });
    });

    // Выбор цвета
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setColor(e.target.dataset.color);
      });
    });

    document.getElementById('customColor').addEventListener('input', (e) => {
      this.setColor(e.target.value);
    });

    // Толщина линии
    const lineWidth = document.getElementById('lineWidth');
    lineWidth.addEventListener('input', (e) => {
      this.lineWidth = parseInt(e.target.value);
      document.getElementById('widthValue').textContent = `${this.lineWidth}px`;
      document.getElementById('currentWidth').textContent = `${this.lineWidth}px`;
    });

    // Привязка
    document.getElementById('snapToGrid').addEventListener('change', (e) => {
      this.snapToGrid = e.target.checked;
      this.updateSnapStatus();
    });

    document.getElementById('snapToPoints').addEventListener('change', (e) => {
      this.snapToPoints = e.target.checked;
      this.updateSnapStatus();
    });

    // Действия
    document.getElementById('clearAll').addEventListener('click', () => {
      this.lines = [];
      this.redraw();
    });

    document.getElementById('showAllLines').addEventListener('click', () => {
      console.log('Все линии:', this.lines);
      alert(`Всего линий: ${this.lines.length}\nСмотрите консоль для деталей.`);
    });
  }

  setMode(mode) {
    this.mode = mode;

    // Обновление UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    // Изменение курсора
    switch (mode) {
      case 'draw':
        this.canvas.style.cursor = 'crosshair';
        document.getElementById('currentMode').textContent = 'Рисование';
        break;
      case 'move':
        this.canvas.style.cursor = 'move';
        document.getElementById('currentMode').textContent = 'Перемещение';
        break;
      case 'edit':
        this.canvas.style.cursor = 'pointer';
        document.getElementById('currentMode').textContent = 'Редактирование';
        break;
      case 'delete':
        this.canvas.style.cursor = 'not-allowed';
        document.getElementById('currentMode').textContent = 'Удаление';
        break;
    }
  }

  setColor(color) {
    this.lineColor = color;

    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const colorBtn = document.querySelector(`[data-color="${color}"]`);
    if (colorBtn) {
      colorBtn.classList.add('active');
    }

    document.getElementById('currentColor').textContent = color;
    document.getElementById('currentColor').style.color = color;
  }

  updateSnapStatus() {
    const status = this.snapToGrid || this.snapToPoints ? 'Включена' : 'Выключена';
    document.getElementById('snapStatus').textContent = status;
  }

  // ========== ОСНОВНЫЕ МЕТОДЫ ==========

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  snapPosition(x, y) {
    let snappedX = x;
    let snappedY = y;

    // Привязка к сетке
    if (this.snapToGrid) {
      snappedX = Math.round(x / this.gridSize) * this.gridSize;
      snappedY = Math.round(y / this.gridSize) * this.gridSize;
    }

    // Привязка к точкам линий
    if (this.snapToPoints) {
      let closestDistance = Infinity;
      let closestPoint = {x: snappedX, y: snappedY};

      this.lines.forEach(line => {
        [line.start, line.end].forEach(point => {
          const distance = Math.sqrt(
            Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
          );
          if (distance < 15 && distance < closestDistance) {
            closestDistance = distance;
            closestPoint = point;
          }
        });
      });

      if (closestDistance < 15) {
        snappedX = closestPoint.x;
        snappedY = closestPoint.y;
      }
    }

    return {x: snappedX, y: snappedY};
  }

  handleMouseDown(e) {
    const mousePos = this.getMousePos(e);
    const snappedPos = this.snapPosition(mousePos.x, mousePos.y);

    switch (this.mode) {
      case 'draw':
        this.startDrawing(snappedPos);
        break;
      case 'move':
        this.startMoving(snappedPos);
        break;
      case 'edit':
        this.startEditing(snappedPos);
        break;
      case 'delete':
        this.deleteLine(snappedPos);
        break;
    }
  }

  handleMouseMove(e) {
    const mousePos = this.getMousePos(e);
    const snappedPos = this.snapPosition(mousePos.x, mousePos.y);

    switch (this.mode) {
      case 'draw':
        this.continueDrawing(snappedPos);
        break;
      case 'move':
        this.continueMoving(snappedPos);
        break;
      case 'edit':
        this.continueEditing(snappedPos);
        break;
    }

    // // Показать индикатор привязки
    // if (this.snapToGrid || this.snapToPoints) {
    //     this.showSnapIndicator(snappedPos.x, snappedPos.y);
    // }
  }

  handleMouseUp() {
    switch (this.mode) {
      case 'draw':
        this.finishDrawing();
        break;
      case 'move':
      case 'edit':
        this.finishInteraction();
        break;
    }
  }

  // ========== РЕДАКТИРОВАНИЕ ДЛИНЫ ==========

  handleDoubleClick(e) {
    if (this.mode !== 'edit') return;

    const mousePos = this.getMousePos(e);
    const snappedPos = this.snapPosition(mousePos.x, mousePos.y);
    const line = this.findLineAtPoint(snappedPos);

    if (line) {
      this.startLengthEditing(line, snappedPos);
    }
  }

  startLengthEditing(line, pos) {
    // Создаем оверлей для редактирования длины
    this.editingLength = true;
    this.selectedLine = line;

    // Удаляем старый оверлей, если есть
    if (this.lengthEditOverlay) {
      document.body.removeChild(this.lengthEditOverlay);
    }

    // Создаем новый оверлей
    this.lengthEditOverlay = document.createElement('div');
    this.lengthEditOverlay.className = 'length-edit-overlay';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = line.customLength || '';
    input.placeholder = 'Длина в m';

    const button = document.createElement('button');
    button.textContent = 'OK';

    // Позиционируем оверлей
    const rect = this.canvas.getBoundingClientRect();
    this.lengthEditOverlay.style.left = (rect.left + pos.x) + 'px';
    this.lengthEditOverlay.style.top = (rect.top + pos.y) + 'px';

    // Добавляем элементы в оверлей
    this.lengthEditOverlay.appendChild(input);
    this.lengthEditOverlay.appendChild(button);
    document.body.appendChild(this.lengthEditOverlay);

    // Фокусируемся на поле ввода
    input.focus();
    input.select();

    // Обработчики событий
    const applyLength = () => {
      const newLength = input.value.trim();
      if (newLength) {
        // Сохраняем пользовательскую длину как Number
        line.customLength = Number(newLength);
      } else {
        // Если поле пустое, удаляем пользовательскую длину
        delete line.customLength;
      }
      this.redraw();
      this.finishLengthEditing();
    };

    button.addEventListener('click', applyLength);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyLength();
      }
    });

    // // Закрытие при клике вне оверлея
    // setTimeout(() => {
    //     const closeHandler = (e) => {
    //         if (!this.lengthEditOverlay.contains(e.target)) {
    //             this.finishLengthEditing();
    //             document.removeEventListener('mousedown', closeHandler);
    //         }
    //     };
    //     document.addEventListener('mousedown', closeHandler);
    // }, 100);
  }

  finishLengthEditing() {
    this.editingLength = false;
    if (this.lengthEditOverlay) {
      document.body.removeChild(this.lengthEditOverlay);
      this.lengthEditOverlay = null;
    }
  }

  // ========== РЕЖИМ РИСОВАНИЯ ==========

  startDrawing(pos) {
    this.isDrawing = true;
    this.tempLine = {
      start: {...pos},
      end: {...pos},
      color: this.lineColor,
      width: this.lineWidth
    };
  }

  continueDrawing(pos) {
    if (this.isDrawing && this.tempLine) {
      this.tempLine.end = {...pos};
      this.redraw();
    }
  }

  finishDrawing() {
    if (this.isDrawing && this.tempLine) {
      // Сохраняем линию только если она имеет длину
      const dx = this.tempLine.end.x - this.tempLine.start.x;
      const dy = this.tempLine.end.y - this.tempLine.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > 5) { // Минимальная длина линии
        this.lines.push({
          ...this.tempLine,
          id: Date.now() + Math.random() // Уникальный ID
        });
      }

      this.tempLine = null;
      this.isDrawing = false;
      this.redraw();
    }
  }

  // ========== РЕЖИМ ПЕРЕМЕЩЕНИЯ ==========

  startMoving(pos) {
    this.selectedLine = this.findLineAtPoint(pos);
    if (this.selectedLine) {
      this.isMoving = true;
      // Сохраняем смещение от точки клика до начала линии
      this.dragOffset = {
        x: pos.x - this.selectedLine.start.x,
        y: pos.y - this.selectedLine.start.y
      };
    }
  }

  continueMoving(pos) {
    if (this.isMoving && this.selectedLine) {
      // Перемещаем всю линию
      const newStartX = pos.x - this.dragOffset.x;
      const newStartY = pos.y - this.dragOffset.y;

      const deltaX = newStartX - this.selectedLine.start.x;
      const deltaY = newStartY - this.selectedLine.start.y;

      this.selectedLine.start.x = newStartX;
      this.selectedLine.start.y = newStartY;
      this.selectedLine.end.x += deltaX;
      this.selectedLine.end.y += deltaY;

      this.redraw();
    }
  }

  // ========== РЕЖИМ РЕДАКТИРОВАНИЯ ==========

  startEditing(pos) {
    this.selectedLine = this.findLineAtPoint(pos);
    if (this.selectedLine) {
      this.isEditing = true;

      // Определяем, какую точку редактируем (начало или конец)
      const distToStart = this.distance(pos, this.selectedLine.start);
      const distToEnd = this.distance(pos, this.selectedLine.end);

      this.editingPoint = distToStart < distToEnd ? 'start' : 'end';
    }
  }

  continueEditing(pos) {
    if (this.isEditing && this.selectedLine && this.editingPoint) {
      this.selectedLine[this.editingPoint] = {...pos};
      this.redraw();
    }
  }

  // ========== РЕЖИМ УДАЛЕНИЯ ==========

  deleteLine(pos) {
    const lineToDelete = this.findLineAtPoint(pos);
    if (lineToDelete) {
      this.lines = this.lines.filter(line => line !== lineToDelete);
      this.redraw();
    }
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

  findLineAtPoint(pos, tolerance = 10) {
    // Ищем линию по точкам (начало и конец)
    for (let line of this.lines) {
      if (this.distance(pos, line.start) < tolerance ||
        this.distance(pos, line.end) < tolerance) {
        return line;
      }
    }

    // Ищем линию по близости к самой линии
    for (let line of this.lines) {
      if (this.pointToLineDistance(pos, line.start, line.end) < tolerance) {
        return line;
      }
    }

    return null;
  }

  distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  pointToLineDistance(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateLineLength(line) {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  finishInteraction() {
    this.isMoving = false;
    this.isEditing = false;
    this.selectedLine = null;
    this.editingPoint = null;
  }

  showSnapIndicator(x, y) {
    this.ctx.save();
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 2]);
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.restore();
  }

  // ========== ОТРИСОВКА ==========

  redraw() {
    // Очистка canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Рисование сетки
    if (this.snapToGrid) {
      this.drawGrid();
    }

    // Рисование всех линий
    this.lines.forEach(line => {
      this.drawLine(line);
      this.drawLengthInfo(line);
    });

    // Рисование временной линии (при рисовании)
    if (this.tempLine) {
      this.drawLine(this.tempLine);
    }

    // Подсветка выбранной линии
    if (this.selectedLine) {
      this.highlightLine(this.selectedLine);
    }
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawLine(line) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(line.start.x, line.start.y);
    this.ctx.lineTo(line.end.x, line.end.y);
    this.ctx.strokeStyle = line.color;
    this.ctx.lineWidth = line.width;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawLengthInfo(line) {
    const midPoint = {
      x: (line.start.x + line.end.x) / 2,
      y: (line.start.y + line.end.y) / 2
    };

    this.ctx.save();
    this.ctx.textAlign = 'center';

    // Отображаем пользовательскую длину, если она задана
    if (line.customLength) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(`${line.customLength}m`, midPoint.x - 30, midPoint.y - 30);
    } else {
      // Иначе отображаем реальную длину в метрах
      const realLength = this.calculateLineLength(line);
      this.ctx.fillStyle = 'black';
      this.ctx.font = '12px Arial';
      this.ctx.fillText(`${realLength.toFixed(1)}m`, midPoint.x - 30, midPoint.y - 30);
    }

    this.ctx.restore();
  }

  highlightLine(line) {
    this.ctx.save();
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    // Рисуем прямоугольник вокруг линии
    const bounds = this.getLineBounds(line);
    this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Подсвечиваем точки начала и конца
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(line.start.x, line.start.y, 5, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(line.end.x, line.end.y, 5, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.restore();
  }

  getLineBounds(line) {
    const minX = Math.min(line.start.x, line.end.x);
    const minY = Math.min(line.start.y, line.end.y);
    const maxX = Math.max(line.start.x, line.end.x);
    const maxY = Math.max(line.start.y, line.end.y);

    return {
      x: minX - 10,
      y: minY - 10,
      width: maxX - minX + 20,
      height: maxY - minY + 20
    };
  }
}

// Базовый класс для всех объектов
class CanvasObject {
  constructor(type, x, y, width = 50, height = 50) {
    this.id = Date.now() + Math.random();
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = '#3498db';
    this.label = type;
    this.selected = false;
    this.properties = {};
  }

  draw(ctx) {
    // Базовый метод отрисовки - будет переопределен в дочерних классах
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Текст метки
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2 + 4);
  }

  isPointInside(x, y) {
    return x >= this.x && x <= this.x + this.width &&
      y >= this.y && y <= this.y + this.height;
  }

  getProperties() {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      color: this.color,
      label: this.label,
      ...this.properties
    };
  }
}

// Конкретные типы объектов
class DoorObject extends CanvasObject {
  constructor(x, y) {
    super('door', x, y, 40, 80);
    this.color = '#8B4513';
    this.label = 'Дверь';
    this.properties.material = 'дерево';
    this.properties.openDirection = 'внутрь';
  }

  draw(ctx) {
    // Рисуем дверь
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Ручка
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.x + this.width - 10, this.y + this.height / 2, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Текст
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height + 15);
  }
}

class WindowObject extends CanvasObject {
  constructor(x, y) {
    super('window', x, y, 60, 40);
    this.color = '#87CEEB';
    this.label = 'Окно';
    this.properties.glassType = 'стандартное';
    this.properties.frame = 'ПВХ';
  }

  draw(ctx) {
    // Рамка окна
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Стекло
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);

    // Переплет
    ctx.strokeStyle = '#A9A9A9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y + 5);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height - 5);
    ctx.moveTo(this.x + 5, this.y + this.height / 2);
    ctx.lineTo(this.x + this.width - 5, this.y + this.height / 2);
    ctx.stroke();

    // Текст
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height + 15);
  }
}

class FurnitureObject extends CanvasObject {
  constructor(type, x, y, width, height, color, label) {
    super(type, x, y, width, height);
    this.color = color;
    this.label = label;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Тень для объема
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 2, this.y + 2, this.width, this.height);

    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2 + 4);
  }
}

class ElectricalObject extends CanvasObject {
  constructor(type, x, y, symbol, color, label) {
    super(type, x, y, 30, 30);
    this.symbol = symbol;
    this.color = color;
    this.label = label;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.symbol, this.x + this.width / 2, this.y + this.height / 2 + 5);

    ctx.fillStyle = 'black';
    ctx.font = '9px Arial';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height + 12);
  }
}

// Регистратор объектов - здесь легко добавлять новые объекты
class ObjectRegistry {
  constructor() {
    this.objectTypes = new Map();
    this.registerDefaultObjects();
  }

  registerObject(type, constructor, icon, category = 'other') {
    this.objectTypes.set(type, {
      constructor: constructor,
      icon: icon,
      category: category,
      type: type
    });
  }

  registerDefaultObjects() {
    // Двери и окна
    this.registerObject('door', DoorObject, '🚪', 'doors_windows');
    this.registerObject('window', WindowObject, '🪟', 'doors_windows');
    this.registerObject('double_door', class extends DoorObject {
      constructor(x, y) {
        super(x, y);
        this.width = 80;
        this.label = 'Дв.дверь';
        this.properties.openDirection = 'раздвижная';
      }
    }, '🚪🚪', 'doors_windows');

    // Мебель
    this.registerObject('bed', (x, y) => new FurnitureObject('bed', x, y, 80, 60, '#8B4513', 'Кровать'), '🛏️', 'furniture');
    this.registerObject('chair', (x, y) => new FurnitureObject('chair', x, y, 30, 30, '#654321', 'Стул'), '🪑', 'furniture');
    this.registerObject('table', (x, y) => new FurnitureObject('table', x, y, 60, 40, '#D2691E', 'Стол'), '🪟', 'furniture');
    this.registerObject('sofa', (x, y) => new FurnitureObject('sofa', x, y, 100, 40, '#8B0000', 'Диван'), '🛋️', 'furniture');
    this.registerObject('cabinet', (x, y) => new FurnitureObject('cabinet', x, y, 40, 60, '#2F4F4F', 'Шкаф'), '🗄️', 'furniture');

    // Сантехника
    this.registerObject('toilet', (x, y) => new FurnitureObject('toilet', x, y, 35, 50, 'white', 'Унитаз'), '🚽', 'plumbing');
    this.registerObject('sink', (x, y) => new FurnitureObject('sink', x, y, 40, 30, 'white', 'Раковина'), '🚰', 'plumbing');
    this.registerObject('bathtub', (x, y) => new FurnitureObject('bathtub', x, y, 80, 40, 'white', 'Ванна'), '🛁', 'plumbing');
    this.registerObject('shower', (x, y) => new FurnitureObject('shower', x, y, 50, 50, '#87CEEB', 'Душ'), '🚿', 'plumbing');

    // Электрика
    this.registerObject('socket', (x, y) => new ElectricalObject('socket', x, y, '⚡', '#FFD700', 'Розетка'), '🔌', 'electrical');
    this.registerObject('switch', (x, y) => new ElectricalObject('switch', x, y, '⭕', '#808080', 'Выкл.'), '🔘', 'electrical');
    this.registerObject('light', (x, y) => new ElectricalObject('light', x, y, '💡', '#FFFF00', 'Свет'), '💡', 'electrical');
    this.registerObject('thermostat', (x, y) => new ElectricalObject('thermostat', x, y, '🌡️', '#FF6347', 'Терм.'), '🌡️', 'electrical');

    // Кухня
    this.registerObject('fridge', (x, y) => new FurnitureObject('fridge', x, y, 40, 70, 'white', 'Холод.'), '❄️', 'kitchen');
    this.registerObject('oven', (x, y) => new FurnitureObject('oven', x, y, 45, 45, 'black', 'Плита'), '🔥', 'kitchen');
    this.registerObject('sink_kitchen', (x, y) => new FurnitureObject('sink_kitchen', x, y, 50, 35, 'silver', 'Мойка'), '💧', 'kitchen');
    this.registerObject('dishwasher', (x, y) => new FurnitureObject('dishwasher', x, y, 45, 50, 'white', 'Посудом.'), '🍽️', 'kitchen');

    // Техника
    this.registerObject('tv', (x, y) => new FurnitureObject('tv', x, y, 50, 30, 'black', 'ТВ'), '📺', 'electronics');
    this.registerObject('computer', (x, y) => new FurnitureObject('computer', x, y, 40, 30, 'gray', 'ПК'), '💻', 'electronics');
    this.registerObject('washing_machine', (x, y) => new FurnitureObject('washing_machine', x, y, 45, 55, 'white', 'Стир.'), '🧼', 'electronics');
  }

  createObject(type, x, y) {
    const objDef = this.objectTypes.get(type);
    if (objDef) {
      return objDef.constructor(x, y);
    }
    return null;
  }

  getAllObjects() {
    return Array.from(this.objectTypes.values());
  }

  getObjectsByCategory() {
    const categories = {};
    this.objectTypes.forEach((objDef, type) => {
      if (!categories[objDef.category]) {
        categories[objDef.category] = [];
      }
      categories[objDef.category].push(objDef);
    });
    return categories;
  }
}

// Расширенный редактор с поддержкой объектов
class ObjectLineEditor extends LineEditor {
  constructor(canvasId) {
    super(canvasId);

    this.objectRegistry = new ObjectRegistry();
    this.objects = []; // Инициализируем массив объектов
    this.selectedObject = null;
    this.objectDragOffset = {x: 0, y: 0};
    this.isObjectMode = false;
    this.isObjectMoving = false;
    this.currentObjectType = null;

    this.initObjectMode();
  }

  initObjectMode() {
    this.setupObjectUI();
    this.addObjectModeButton();
  }

  addObjectModeButton() {
    const objectModeBtn = document.createElement('button');
    objectModeBtn.className = 'mode-btn';
    objectModeBtn.dataset.mode = 'object';
    objectModeBtn.textContent = 'Объекты';
    objectModeBtn.addEventListener('click', (e) => {
      this.setObjectMode(!this.isObjectMode);
    });

    const toolbar = document.querySelector('.toolbar');
    toolbar.appendChild(objectModeBtn);
  }

  setupObjectUI() {
    // Создаем панель объектов
    const objectPanel = document.createElement('div');
    objectPanel.className = 'object-panel';
    objectPanel.innerHTML = `
            <h3>Библиотека объектов</h3>
            <div class="object-categories"></div>
            <div class="objects-grid"></div>
        `;

    const controls = document.querySelector('.controls');
    controls.appendChild(objectPanel);

    this.populateObjectPanel();
  }

  populateObjectPanel() {
    const categories = this.objectRegistry.getObjectsByCategory();
    const categoriesContainer = document.querySelector('.object-categories');
    const objectsGrid = document.querySelector('.objects-grid');

    // Очищаем контейнеры
    categoriesContainer.innerHTML = '';
    objectsGrid.innerHTML = '';

    // Создаем кнопки категорий
    Object.keys(categories).forEach(category => {
      const btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.textContent = this.getCategoryName(category);
      btn.addEventListener('click', () => this.showCategory(category));
      categoriesContainer.appendChild(btn);
    });

    // Показываем все объекты по умолчанию
    this.showAllObjects();
  }

  getCategoryName(category) {
    const names = {
      'doors_windows': 'Двери/Окна',
      'furniture': 'Мебель',
      'plumbing': 'Сантехника',
      'electrical': 'Электрика',
      'kitchen': 'Кухня',
      'electronics': 'Техника',
      'other': 'Другое'
    };
    return names[category] || category;
  }

  showCategory(category) {
    const objectsGrid = document.querySelector('.objects-grid');
    objectsGrid.innerHTML = '';

    const categories = this.objectRegistry.getObjectsByCategory();
    const categoryObjects = categories[category] || [];

    categoryObjects.forEach(objDef => {
      const objElement = this.createObjectElement(objDef);
      objectsGrid.appendChild(objElement);
    });
  }

  showAllObjects() {
    const objectsGrid = document.querySelector('.objects-grid');
    objectsGrid.innerHTML = '';

    const allObjects = this.objectRegistry.getAllObjects();
    allObjects.forEach(objDef => {
      const objElement = this.createObjectElement(objDef);
      objectsGrid.appendChild(objElement);
    });
  }

  createObjectElement(objDef) {
    const objElement = document.createElement('div');
    objElement.className = 'object-item';
    objElement.innerHTML = `
            <div class="object-icon">${objDef.icon}</div>
            <div class="object-name">${objDef.type}</div>
        `;

    objElement.addEventListener('click', () => {
      this.currentObjectType = objDef.type;
      this.setObjectMode(true);
      document.querySelectorAll('.object-item').forEach(item => {
        item.classList.remove('selected');
      });
      objElement.classList.add('selected');
    });

    return objElement;
  }

  setObjectMode(active) {
    this.isObjectMode = active;
    const objectBtn = document.querySelector('[data-mode="object"]');

    if (active) {
      objectBtn.classList.add('active');
      this.canvas.style.cursor = 'crosshair';
      document.getElementById('currentMode').textContent = 'Добавление объектов';
    } else {
      objectBtn.classList.remove('active');
      this.setMode(this.mode);
      this.currentObjectType = null;
      document.querySelectorAll('.object-item').forEach(item => {
        item.classList.remove('selected');
      });
    }
  }

  // Переопределение методов базового класса
  handleMouseDown(e) {
    if (this.isObjectMode) {
      this.handleObjectMouseDown(e);
    } else {
      super.handleMouseDown(e);
    }
  }

  handleMouseMove(e) {
    if (this.isObjectMoving) {
      this.handleObjectMouseMove(e);
    } else if (this.isObjectMode) {
      // Курсор для режима добавления объектов
      this.canvas.style.cursor = 'crosshair';
    } else {
      super.handleMouseMove(e);
    }
  }

  handleMouseUp(e) {
    if (this.isObjectMoving) {
      this.isObjectMoving = false;
      this.selectedObject = null;
    } else {
      super.handleMouseUp(e);
    }
  }

  handleObjectMouseDown(e) {
    const mousePos = this.getMousePos(e);
    const snappedPos = this.snapPosition(mousePos.x, mousePos.y);

    // Проверяем, кликнули ли по существующему объекту
    const clickedObject = this.findObjectAtPoint(snappedPos);

    if (clickedObject) {
      // Выбираем объект для перемещения
      this.selectedObject = clickedObject;
      this.isObjectMoving = true;
      this.objectDragOffset = {
        x: snappedPos.x - clickedObject.x,
        y: snappedPos.y - clickedObject.y
      };
    } else if (this.currentObjectType) {
      // Создаем новый объект
      const newObject = this.objectRegistry.createObject(this.currentObjectType, snappedPos.x, snappedPos.y);
      if (newObject) {
        this.objects.push(newObject);
        this.redraw();
      }
    }
  }

  handleObjectMouseMove(e) {
    if (this.isObjectMoving && this.selectedObject) {
      const mousePos = this.getMousePos(e);
      const snappedPos = this.snapPosition(mousePos.x, mousePos.y);

      this.selectedObject.x = snappedPos.x - this.objectDragOffset.x;
      this.selectedObject.y = snappedPos.y - this.objectDragOffset.y;

      this.redraw();
    }
  }

  findObjectAtPoint(pos, tolerance = 5) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      if (obj.isPointInside(pos.x, pos.y)) {
        return obj;
      }
    }
    return null;
  }

  // Переопределение отрисовки - ИСПРАВЛЕННАЯ ВЕРСИЯ
  redraw() {
    // Очистка canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Рисование сетки
    if (this.snapToGrid) {
      this.drawGrid();
    }

    // Сначала рисуем все объекты (с проверкой на существование массива)
    if (this.objects && Array.isArray(this.objects)) {
      this.objects.forEach(obj => {
        obj.draw(this.ctx);
      });
    }

    // Затем рисуем все линии (из базового класса)
    this.lines.forEach(line => {
      this.drawLine(line);
      this.drawLengthInfo(line);
    });

    // Рисование временной линии (при рисовании)
    if (this.tempLine) {
      this.drawLine(this.tempLine);
    }

    // Подсветка выбранной линии
    if (this.selectedLine) {
      this.highlightLine(this.selectedLine);
    }

    // Подсветка выбранного объекта
    if (this.selectedObject) {
      this.highlightObject(this.selectedObject);
    }
  }

  highlightObject(obj) {
    this.ctx.save();
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(obj.x - 5, obj.y - 5, obj.width + 10, obj.height + 10);
    this.ctx.restore();
  }

  // Новые методы для работы с объектами
  deleteSelectedObject() {
    if (this.selectedObject) {
      this.objects = this.objects.filter(obj => obj !== this.selectedObject);
      this.selectedObject = null;
      this.redraw();
    }
  }

  clearAllObjects() {
    this.objects = [];
    this.redraw();
  }

  getObjectsData() {
    return this.objects.map(obj => obj.getProperties());
  }

  // Добавление нового типа объекта (пример расширения)
  registerNewObject(type, constructor, icon, category = 'other') {
    this.objectRegistry.registerObject(type, constructor, icon, category);
    this.populateObjectPanel(); // Обновляем панель
  }
}

// Добавление CSS стилей для объектов
const objectStyles = document.createElement('style');
objectStyles.textContent = `
    .object-panel {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
        margin: 10px 0;
        background: #f9f9f9;
    }

    .object-panel h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #333;
    }

    .object-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 10px;
    }

    .category-btn {
        padding: 5px 10px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
    }

    .category-btn:hover {
        background: #e9e9e9;
    }

    .objects-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        max-height: 200px;
        overflow-y: auto;
    }

    .object-item {
        border: 1px solid #ddd;
        border-radius: 3px;
        padding: 5px;
        text-align: center;
        cursor: pointer;
        background: white;
    }

    .object-item:hover {
        background: #f0f0f0;
    }

    .object-item.selected {
        border-color: #3498db;
        background: #e3f2fd;
    }

    .object-icon {
        font-size: 20px;
        margin-bottom: 2px;
    }

    .object-name {
        font-size: 10px;
        color: #666;
        word-break: break-word;
    }
`;
document.head.appendChild(objectStyles);

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  // Используем только ObjectLineEditor, чтобы избежать конфликтов
  const editor = new ObjectLineEditor('drawingCanvas');
  window.editor = editor; // Для отладки

  // Пример добавления нового объекта после инициализации
  editor.registerNewObject(
    'plant',
    (x, y) => {
      const plant = new CanvasObject('plant', x, y, 30, 40);
      plant.color = '#2E8B57';
      plant.label = 'Растение';
      plant.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 3, this.width / 2, this.height / 3, 0, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + this.width / 2 - 3, this.y + this.height / 3, 6, this.height * 2 / 3);

        ctx.fillStyle = 'white';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height + 12);
      };
      return plant;
    },
    '🌿',
    'other'
  );
});