// class LineEditor {
//             constructor(canvasId) {
//                 this.canvas = document.getElementById(canvasId);
//                 this.ctx = this.canvas.getContext('2d');
                
//                 // Основные свойства
//                 this.mode = 'draw'; // draw, move, edit, delete
//                 this.lineColor = 'black';
//                 this.lineWidth = 2;
//                 this.snapToGrid = true;
//                 this.snapToPoints = true;
//                 this.gridSize = 20;
                
//                 // Состояние рисования
//                 this.isDrawing = false;
//                 this.isMoving = false;
//                 this.isEditing = false;
//                 this.currentLine = null;
//                 this.selectedLine = null;
//                 this.dragOffset = { x: 0, y: 0 };
//                 this.editingPoint = null; // 'start' или 'end'
                
//                 // Хранилище линий
//                 this.lines = [];
//                 this.tempLine = null;
                
//                 this.init();
//             }
            
//             init() {
//                 this.setupEventListeners();
//                 this.setupUI();
//                 this.redraw();
//             }
            
//             setupEventListeners() {
//                 // События canvas
//                 this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
//                 this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
//                 this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
//                 this.canvas.addEventListener('mouseout', this.handleMouseUp.bind(this));
//             }
            
//             setupUI() {
//                 // Кнопки режимов
//                 document.querySelectorAll('.mode-btn').forEach(btn => {
//                     btn.addEventListener('click', (e) => {
//                         this.setMode(e.target.dataset.mode);
//                     });
//                 });
                
//                 // Выбор цвета
//                 document.querySelectorAll('.color-btn').forEach(btn => {
//                     btn.addEventListener('click', (e) => {
//                         this.setColor(e.target.dataset.color);
//                     });
//                 });
                
//                 document.getElementById('customColor').addEventListener('input', (e) => {
//                     this.setColor(e.target.value);
//                 });
                
//                 // Толщина линии
//                 const lineWidth = document.getElementById('lineWidth');
//                 lineWidth.addEventListener('input', (e) => {
//                     this.lineWidth = parseInt(e.target.value);
//                     document.getElementById('widthValue').textContent = `${this.lineWidth}px`;
//                     document.getElementById('currentWidth').textContent = `${this.lineWidth}px`;
//                 });
                
//                 // Привязка
//                 document.getElementById('snapToGrid').addEventListener('change', (e) => {
//                     this.snapToGrid = e.target.checked;
//                     this.updateSnapStatus();
//                 });
                
//                 document.getElementById('snapToPoints').addEventListener('change', (e) => {
//                     this.snapToPoints = e.target.checked;
//                     this.updateSnapStatus();
//                 });
                
//                 // Действия
//                 document.getElementById('clearAll').addEventListener('click', () => {
//                     this.lines = [];
//                     this.redraw();
//                 });
                
//                 document.getElementById('showAllLines').addEventListener('click', () => {
//                     console.log('Все линии:', this.lines);
//                     alert(`Всего линий: ${this.lines.length}\nСмотрите консоль для деталей.`);
//                 });
//             }
            
//             setMode(mode) {
//                 this.mode = mode;
                
//                 // Обновление UI
//                 document.querySelectorAll('.mode-btn').forEach(btn => {
//                     btn.classList.remove('active');
//                 });
//                 document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
                
//                 // Изменение курсора
//                 switch(mode) {
//                     case 'draw':
//                         this.canvas.style.cursor = 'crosshair';
//                         document.getElementById('currentMode').textContent = 'Рисование';
//                         break;
//                     case 'move':
//                         this.canvas.style.cursor = 'move';
//                         document.getElementById('currentMode').textContent = 'Перемещение';
//                         break;
//                     case 'edit':
//                         this.canvas.style.cursor = 'pointer';
//                         document.getElementById('currentMode').textContent = 'Редактирование';
//                         break;
//                     case 'delete':
//                         this.canvas.style.cursor = 'not-allowed';
//                         document.getElementById('currentMode').textContent = 'Удаление';
//                         break;
//                 }
//             }
            
//             setColor(color) {
//                 this.lineColor = color;
                
//                 document.querySelectorAll('.color-btn').forEach(btn => {
//                     btn.classList.remove('active');
//                 });
                
//                 const colorBtn = document.querySelector(`[data-color="${color}"]`);
//                 if (colorBtn) {
//                     colorBtn.classList.add('active');
//                 }
                
//                 document.getElementById('currentColor').textContent = color;
//                 document.getElementById('currentColor').style.color = color;
//             }
            
//             updateSnapStatus() {
//                 const status = this.snapToGrid || this.snapToPoints ? 'Включена' : 'Выключена';
//                 document.getElementById('snapStatus').textContent = status;
//             }
            
//             // ========== ОСНОВНЫЕ МЕТОДЫ ==========
            
//             getMousePos(e) {
//                 const rect = this.canvas.getBoundingClientRect();
//                 return {
//                     x: e.clientX - rect.left,
//                     y: e.clientY - rect.top
//                 };
//             }
            
//             snapPosition(x, y) {
//                 let snappedX = x;
//                 let snappedY = y;
                
//                 // Привязка к сетке
//                 if (this.snapToGrid) {
//                     snappedX = Math.round(x / this.gridSize) * this.gridSize;
//                     snappedY = Math.round(y / this.gridSize) * this.gridSize;
//                 }
                
//                 // Привязка к точкам линий
//                 if (this.snapToPoints) {
//                     let closestDistance = Infinity;
//                     let closestPoint = { x: snappedX, y: snappedY };
                    
//                     this.lines.forEach(line => {
//                         [line.start, line.end].forEach(point => {
//                             const distance = Math.sqrt(
//                                 Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
//                             );
//                             if (distance < 15 && distance < closestDistance) {
//                                 closestDistance = distance;
//                                 closestPoint = point;
//                             }
//                         });
//                     });
                    
//                     if (closestDistance < 15) {
//                         snappedX = closestPoint.x;
//                         snappedY = closestPoint.y;
//                     }
//                 }
                
//                 return { x: snappedX, y: snappedY };
//             }
            
//             handleMouseDown(e) {
//                 const mousePos = this.getMousePos(e);
//                 const snappedPos = this.snapPosition(mousePos.x, mousePos.y);
                
//                 switch(this.mode) {
//                     case 'draw':
//                         this.startDrawing(snappedPos);
//                         break;
//                     case 'move':
//                         this.startMoving(snappedPos);
//                         break;
//                     case 'edit':
//                         this.startEditing(snappedPos);
//                         break;
//                     case 'delete':
//                         this.deleteLine(snappedPos);
//                         break;
//                 }
//             }
            
//             handleMouseMove(e) {
//                 const mousePos = this.getMousePos(e);
//                 const snappedPos = this.snapPosition(mousePos.x, mousePos.y);
                
//                 switch(this.mode) {
//                     case 'draw':
//                         this.continueDrawing(snappedPos);
//                         break;
//                     case 'move':
//                         this.continueMoving(snappedPos);
//                         break;
//                     case 'edit':
//                         this.continueEditing(snappedPos);
//                         break;
//                 }
                
//                 // Показать индикатор привязки
//                 // if (this.snapToGrid || this.snapToPoints) {
//                 //     this.showSnapIndicator(snappedPos.x, snappedPos.y);
//                 // }
//             }
            
//             handleMouseUp() {
//                 switch(this.mode) {
//                     case 'draw':
//                         this.finishDrawing();
//                         break;
//                     case 'move':
//                     case 'edit':
//                         this.finishInteraction();
//                         break;
//                 }
//             }
            
//             // ========== РЕЖИМ РИСОВАНИЯ ==========
            
//             startDrawing(pos) {
//                 this.isDrawing = true;
//                 this.tempLine = {
//                     start: { ...pos },
//                     end: { ...pos },
//                     color: this.lineColor,
//                     width: this.lineWidth
//                 };
//             }
            
//             continueDrawing(pos) {
//                 if (this.isDrawing && this.tempLine) {
//                     this.tempLine.end = { ...pos };
//                     this.redraw();
//                 }
//             }
            
//             finishDrawing() {
//                 if (this.isDrawing && this.tempLine) {
//                     // Сохраняем линию только если она имеет длину
//                     const dx = this.tempLine.end.x - this.tempLine.start.x;
//                     const dy = this.tempLine.end.y - this.tempLine.start.y;
//                     const length = Math.sqrt(dx * dx + dy * dy);
                    
//                     if (length > 5) { // Минимальная длина линии
//                         this.lines.push({
//                             ...this.tempLine,
//                             id: Date.now() + Math.random() // Уникальный ID
//                         });
//                     }
                    
//                     this.tempLine = null;
//                     this.isDrawing = false;
//                     this.redraw();
//                 }
//             }
            
//             // ========== РЕЖИМ ПЕРЕМЕЩЕНИЯ ==========
            
//             startMoving(pos) {
//                 this.selectedLine = this.findLineAtPoint(pos);
//                 if (this.selectedLine) {
//                     this.isMoving = true;
//                     // Сохраняем смещение от точки клика до начала линии
//                     this.dragOffset = {
//                         x: pos.x - this.selectedLine.start.x,
//                         y: pos.y - this.selectedLine.start.y
//                     };
//                 }
//             }
            
//             continueMoving(pos) {
//                 if (this.isMoving && this.selectedLine) {
//                     // Перемещаем всю линию
//                     const newStartX = pos.x - this.dragOffset.x;
//                     const newStartY = pos.y - this.dragOffset.y;
                    
//                     const deltaX = newStartX - this.selectedLine.start.x;
//                     const deltaY = newStartY - this.selectedLine.start.y;
                    
//                     this.selectedLine.start.x = newStartX;
//                     this.selectedLine.start.y = newStartY;
//                     this.selectedLine.end.x += deltaX;
//                     this.selectedLine.end.y += deltaY;
                    
//                     this.redraw();
//                 }
//             }
            
//             // ========== РЕЖИМ РЕДАКТИРОВАНИЯ ==========
            
//             startEditing(pos) {
//                 this.selectedLine = this.findLineAtPoint(pos);
//                 if (this.selectedLine) {
//                     this.isEditing = true;
                    
//                     // Определяем, какую точку редактируем (начало или конец)
//                     const distToStart = this.distance(pos, this.selectedLine.start);
//                     const distToEnd = this.distance(pos, this.selectedLine.end);
                    
//                     this.editingPoint = distToStart < distToEnd ? 'start' : 'end';
//                 }
//             }
            
//             continueEditing(pos) {
//                 if (this.isEditing && this.selectedLine && this.editingPoint) {
//                     this.selectedLine[this.editingPoint] = { ...pos };
//                     this.redraw();
//                 }
//             }
            
//             // ========== РЕЖИМ УДАЛЕНИЯ ==========
            
//             deleteLine(pos) {
//                 const lineToDelete = this.findLineAtPoint(pos);
//                 if (lineToDelete) {
//                     this.lines = this.lines.filter(line => line !== lineToDelete);
//                     this.redraw();
//                 }
//             }
            
//             // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
            
//             findLineAtPoint(pos, tolerance = 10) {
//                 // Ищем линию по точкам (начало и конец)
//                 for (let line of this.lines) {
//                     if (this.distance(pos, line.start) < tolerance || 
//                         this.distance(pos, line.end) < tolerance) {
//                         return line;
//                     }
//                 }
                
//                 // Ищем линию по близости к самой линии
//                 for (let line of this.lines) {
//                     if (this.pointToLineDistance(pos, line.start, line.end) < tolerance) {
//                         return line;
//                     }
//                 }
                
//                 return null;
//             }
            
//             distance(p1, p2) {
//                 return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
//             }
            
//             pointToLineDistance(point, lineStart, lineEnd) {
//                 const A = point.x - lineStart.x;
//                 const B = point.y - lineStart.y;
//                 const C = lineEnd.x - lineStart.x;
//                 const D = lineEnd.y - lineStart.y;
                
//                 const dot = A * C + B * D;
//                 const lenSq = C * C + D * D;
//                 let param = -1;
                
//                 if (lenSq !== 0) param = dot / lenSq;
                
//                 let xx, yy;
                
//                 if (param < 0) {
//                     xx = lineStart.x;
//                     yy = lineStart.y;
//                 } else if (param > 1) {
//                     xx = lineEnd.x;
//                     yy = lineEnd.y;
//                 } else {
//                     xx = lineStart.x + param * C;
//                     yy = lineStart.y + param * D;
//                 }
                
//                 const dx = point.x - xx;
//                 const dy = point.y - yy;
                
//                 return Math.sqrt(dx * dx + dy * dy);
//             }
            
//             calculateLineLength(line) {
//                 const dx = line.end.x - line.start.x;
//                 const dy = line.end.y - line.start.y;
//                 return Math.sqrt(dx * dx + dy * dy);
//             }
            
//             finishInteraction() {
//                 this.isMoving = false;
//                 this.isEditing = false;
//                 this.selectedLine = null;
//                 this.editingPoint = null;
//             }
            
//             showSnapIndicator(x, y) {
//                 this.ctx.save();
//                 this.ctx.strokeStyle = '#ff0000';
//                 this.ctx.lineWidth = 1;
//                 this.ctx.setLineDash([2, 2]);
//                 this.ctx.beginPath();
//                 this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
//                 this.ctx.stroke();
//                 this.ctx.restore();
//             }
            
//             // ========== ОТРИСОВКА ==========
            
//             redraw() {
//                 // Очистка canvas
//                 this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
//                 // Рисование сетки
//                 if (this.snapToGrid) {
//                     this.drawGrid();
//                 }
                
//                 // Рисование всех линий
//                 this.lines.forEach(line => {
//                     this.drawLine(line);
//                     this.drawLengthInfo(line);
//                 });
                
//                 // Рисование временной линии (при рисовании)
//                 if (this.tempLine) {
//                     this.drawLine(this.tempLine);
//                 }
                
//                 // Подсветка выбранной линии
//                 if (this.selectedLine) {
//                     this.highlightLine(this.selectedLine);
//                 }
//             }
            
//             drawGrid() {
//                 this.ctx.save();
//                 this.ctx.strokeStyle = '#e0e0e0';
//                 this.ctx.lineWidth = 0.5;
                
//                 for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
//                     this.ctx.beginPath();
//                     this.ctx.moveTo(x, 0);
//                     this.ctx.lineTo(x, this.canvas.height);
//                     this.ctx.stroke();
//                 }
                
//                 for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
//                     this.ctx.beginPath();
//                     this.ctx.moveTo(0, y);
//                     this.ctx.lineTo(this.canvas.width, y);
//                     this.ctx.stroke();
//                 }
                
//                 this.ctx.restore();
//             }
            
//             drawLine(line) {
//                 this.ctx.save();
//                 this.ctx.beginPath();
//                 this.ctx.moveTo(line.start.x, line.start.y);
//                 this.ctx.lineTo(line.end.x, line.end.y);
//                 this.ctx.strokeStyle = line.color;
//                 this.ctx.lineWidth = line.width;
//                 this.ctx.lineCap = 'round';
//                 this.ctx.stroke();
//                 this.ctx.restore();
//             }
            
//             drawLengthInfo(line) {
//                 const length = this.calculateLineLength(line);
//                 const midPoint = {
//                     x: (line.start.x + line.end.x) / 2,
//                     y: (line.start.y + line.end.y) / 2
//                 };
                
//                 this.ctx.save();
//                 this.ctx.fillStyle = 'black';
//                 this.ctx.font = '12px Arial';
//                 this.ctx.textAlign = 'center';
//                 this.ctx.fillText(`${length.toFixed(1)}px`, midPoint.x, midPoint.y - 10);
//                 this.ctx.restore();
//             }
            
//             highlightLine(line) {
//                 this.ctx.save();
//                 this.ctx.strokeStyle = '#ff0000';
//                 this.ctx.lineWidth = 2;
//                 this.ctx.setLineDash([5, 5]);
                
//                 // Рисуем прямоугольник вокруг линии
//                 const bounds = this.getLineBounds(line);
//                 this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                
//                 // Подсвечиваем точки начала и конца
//                 this.ctx.fillStyle = '#ff0000';
//                 this.ctx.beginPath();
//                 this.ctx.arc(line.start.x, line.start.y, 5, 0, 2 * Math.PI);
//                 this.ctx.fill();
                
//                 this.ctx.beginPath();
//                 this.ctx.arc(line.end.x, line.end.y, 5, 0, 2 * Math.PI);
//                 this.ctx.fill();
                
//                 this.ctx.restore();
//             }
            
//             getLineBounds(line) {
//                 const minX = Math.min(line.start.x, line.end.x);
//                 const minY = Math.min(line.start.y, line.end.y);
//                 const maxX = Math.max(line.start.x, line.end.x);
//                 const maxY = Math.max(line.start.y, line.end.y);
                
//                 return {
//                     x: minX - 10,
//                     y: minY - 10,
//                     width: maxX - minX + 20,
//                     height: maxY - minY + 20
//                 };
//             }
//         }
        
//         // Инициализация приложения
//         document.addEventListener('DOMContentLoaded', () => {
//             const lineEditor = new LineEditor('drawingCanvas');
//             window.lineEditor = lineEditor; // Для отладки в консоли
//         });

// ====================вариант с ручным редактированием==================================

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
                this.dragOffset = { x: 0, y: 0 };
                this.editingPoint = null; // 'start' или 'end'
                
                // Редактирование длины
                this.editingLength = false;
                this.lengthEditOverlay = null;
                
                // Хранилище линий
                this.lines = [];
                this.tempLine = null;
                
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
                switch(mode) {
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
                    let closestPoint = { x: snappedX, y: snappedY };
                    
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
                
                return { x: snappedX, y: snappedY };
            }
            
            handleMouseDown(e) {
                const mousePos = this.getMousePos(e);
                const snappedPos = this.snapPosition(mousePos.x, mousePos.y);
                
                switch(this.mode) {
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
                
                switch(this.mode) {
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
                
                // Показать индикатор привязки
                if (this.snapToGrid || this.snapToPoints) {
                    this.showSnapIndicator(snappedPos.x, snappedPos.y);
                }
            }
            
            handleMouseUp() {
                switch(this.mode) {
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
                input.value = line.customLength || this.calculateLineLength(line).toFixed(1);
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
                    const newLength = parseFloat(input.value);
                    if (!isNaN(newLength) && newLength > 0) {
                        this.applyCustomLength(line, newLength);												
                    }
                    this.finishLengthEditing();
                };
                
                button.addEventListener('click', applyLength);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        applyLength();
                    }
                });
                
                // Закрытие при клике вне оверлея
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
            
            applyCustomLength(line, newLength) {
                // Сохраняем пользовательскую длину
                line.customLength = newLength;
                line.rr = newLength;
                
                // Вычисляем текущую длину и направление
                const currentLength = this.calculateLineLength(line);
                const dx = line.end.x - line.start.x;
                const dy = line.end.y - line.start.y;
                
                // Вычисляем новые координаты конечной точки
                const ratio = newLength / currentLength;
                line.end.x = line.start.x + dx * ratio;
                line.end.y = line.start.y + dy * ratio;
                
                this.redraw();
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
                    start: { ...pos },
                    end: { ...pos },
                    color: this.lineColor,
                    width: this.lineWidth
                };
            }
            
            continueDrawing(pos) {
                if (this.isDrawing && this.tempLine) {
                    this.tempLine.end = { ...pos };
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
                    this.selectedLine[this.editingPoint] = { ...pos };
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
                // Используем пользовательскую длину, если задана, иначе вычисляем
                const length = line.customLength || this.calculateLineLength(line);
                const midPoint = {
                    x: (line.start.x + line.end.x) / 2,
                    y: (line.start.y + line.end.y) / 2
                };
                
                this.ctx.save();
                this.ctx.fillStyle = 'black';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                
                // Если установлена пользовательская длина, выделяем ее
                if (line.customLength) {
                    this.ctx.fillStyle = 'red';
                    this.ctx.font = 'bold 12px Arial';
                }
                
                this.ctx.fillText(`${length.toFixed(1)}m`, midPoint.x, midPoint.y - 30);
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
        
        // Инициализация приложения
        document.addEventListener('DOMContentLoaded', () => {
            const lineEditor = new LineEditor('drawingCanvas');
            window.lineEditor = lineEditor; // Для отладки в консоли
        });
