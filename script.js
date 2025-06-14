const gridSize = 20;
const grid = document.getElementById('grid');
const wordListEl = document.getElementById('word-list');
const generateBtn = document.getElementById('generate');
const checkBtn = document.getElementById('check-word');
const restartBtn = document.getElementById('restart');
const textInput = document.getElementById('user-text');
const wordCountInput = document.getElementById('word-count');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const originalTextEl = document.getElementById('original-text');
const confettiCanvas = document.getElementById('confetti-canvas');

let solution = [];
let isSelecting = false;
let selectedCells = [];

document.querySelectorAll('.cell').forEach(cell => {
  // Seleção por clique único
  cell.addEventListener('click', () => {
    if (cell.classList.contains('selected')) {
      cell.classList.remove('selected');
      selectedCells = selectedCells.filter(c => c !== cell);
    } else {
      cell.classList.add('selected');
      selectedCells.push(cell);
    }
  });

  // Seleção por arrasto
  cell.addEventListener('mousedown', (e) => {
    isSelecting = true;
    selectCell(cell);
  });

  cell.addEventListener('mouseenter', (e) => {
    if (isSelecting) {
      selectCell(cell);
    }
  });
});

document.addEventListener('mouseup', () => {
  isSelecting = false;
});

function selectCell(cell) {
  if (!cell.classList.contains('selected')) {
    cell.classList.add('selected');
    selectedCells.push(cell);
  }
}

function clearSelection() {
  selectedCells.forEach(cell => cell.classList.remove('selected'));
  selectedCells = [];
}

let words = [];
let foundWords = [];

function checkSelectedWord() {
  const selectedCells = Array.from(document.querySelectorAll('.cell.selected'));
  const selectedWord = selectedCells.map(cell => cell.textContent).join('');

  // Supondo que wordList é um array com as palavras a serem encontradas
  if (wordList.includes(selectedWord) && !foundWords.includes(selectedWord)) {
    foundWords.push(selectedWord);
    selectedCells.forEach(cell => {
      cell.classList.remove('selected');
      cell.classList.add('found');
    });
    updateScore();
  } else {
    // Opcional: feedback de erro
    selectedCells.forEach(cell => cell.classList.remove('selected'));
  }
}

document.getElementById('check-word').addEventListener('click', checkSelectedWord);

function updateScore() {
  document.getElementById('score').textContent = `Palavras encontradas: ${foundWords.length}`;
}

let timer = null;
let secondsElapsed = 0;

generateBtn.addEventListener('click', () => {
  const userText = textInput.value.trim();
  const maxWords = parseInt(wordCountInput.value) || 10;

  if (!userText) return alert('Digite algum texto!');

  const allWords = Array.from(new Set(
    userText
      .toUpperCase()
      .replace(/[^A-ZÀ-Ú\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length >= 4)
  ));

  if (allWords.length === 0) return alert('Nenhuma palavra válida encontrada.');

  shuffleArray(allWords);
  const selectedWords = allWords.slice(0, maxWords);

  startNewGame(selectedWords, userText);
});

restartBtn.addEventListener('click', () => {
  const userText = textInput.value.trim();
  const maxWords = parseInt(wordCountInput.value) || 10;

  if (!userText) {
    alert('Digite um texto primeiro.');
    return;
  }

  const allWords = Array.from(new Set(
    userText
      .toUpperCase()
      .replace(/[^A-ZÀ-Ú\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length >= 4)
  ));

  if (allWords.length < maxWords) {
    alert('Texto com poucas palavras válidas para reiniciar.');
    return;
  }

  shuffleArray(allWords);
  const newWordList = allWords.slice(0, maxWords);

  startNewGame(newWordList, userText);
});

function startNewGame(selectedWords, userText) {
  words = selectedWords;
  foundWords = [];
  secondsElapsed = 0;
  updateScore();
  updateTimerDisplay();

  clearInterval(timer);
  timer = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
  }, 1000);

  grid.innerHTML = '';
  wordListEl.innerHTML = '';
  selectedCells = [];

  words.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    wordListEl.appendChild(li);
  });

  solution = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => '')
  );

  placeWords(words);
  fillRandomLetters();
  createGrid();

  originalTextEl.textContent = "Texto original:\n\n" + userText;
}

function placeWords(wordList) {
  for (let word of wordList) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const maxRow = direction === 'horizontal' ? gridSize : gridSize - word.length;
      const maxCol = direction === 'vertical' ? gridSize : gridSize - word.length;

      const row = Math.floor(Math.random() * maxRow);
      const col = Math.floor(Math.random() * maxCol);

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + (direction === 'vertical' ? i : 0);
        const c = col + (direction === 'horizontal' ? i : 0);
        const current = solution[r][c];

        if (current !== '' && current !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = row + (direction === 'vertical' ? i : 0);
          const c = col + (direction === 'horizontal' ? i : 0);
          solution[r][c] = word[i];
        }
        placed = true;
      }

      attempts++;
    }
  }
}

function fillRandomLetters() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!solution[r][c]) {
        solution[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
}

function createGrid() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.textContent = solution[row][col];
      cell.addEventListener('click', handleCellClick);
      grid.appendChild(cell);
    }
  }

  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('mousedown', (e) => {
      isSelecting = true;
      // Se quiser limpar a seleção anterior ao arrastar, descomente:
      // clearSelection();
      selectCell(cell);
    });

    cell.addEventListener('mouseenter', (e) => {
      if (isSelecting) {
        selectCell(cell);
      }
    });
  });

  document.addEventListener('mouseup', () => {
    isSelecting = false;
  });
}

function handleCellClick(e) {
  const cell = e.target;
  if (cell.classList.contains('found')) return;

  cell.classList.toggle('selected');

  if (selectedCells.includes(cell)) {
    selectedCells = selectedCells.filter(c => c !== cell);
  } else {
    selectedCells.push(cell);
  }
}

checkBtn.addEventListener('click', () => {
  const selectedWord = selectedCells.map(c => c.textContent).join('');
  const sortedSelection = selectedWord.split('').sort().join('');

  let matchedWord = null;

  for (let word of words) {
    const sortedWord = word.split('').sort().join('');
    if (sortedSelection === sortedWord) {
      matchedWord = word;
      break;
    }
  }

  if (matchedWord) {
    if (foundWords.includes(matchedWord)) {
      alert('Essa palavra já foi encontrada!');
      clearSelection();
      return;
    }

    const color = getRandomColor();
    selectedCells.forEach(c => {
      c.classList.remove('selected');
      c.classList.add('found');
      c.style.backgroundColor = color;
      c.style.color = 'white';
    });

    foundWords.push(matchedWord);
    updateScore();

    document.querySelectorAll('#word-list li').forEach(li => {
      if (li.textContent === matchedWord) {
        li.style.textDecoration = 'line-through';
        li.style.color = color;
      }
    });

    selectedCells = [];

    if (foundWords.length === words.length) {
      clearInterval(timer);
      showConfetti();
      setTimeout(() => {
        alert(`🎉 Parabéns! Você encontrou todas as palavras em ${secondsElapsed} segundos!`);
      }, 100);
    }
  } else {
    alert('A palavra selecionada não é válida.');
    clearSelection();
  }
});

function getRandomColor() {
  const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function updateTimerDisplay() {
  timerEl.textContent = `⏱ Tempo: ${secondsElapsed}s`;
}

function updateScore() {
  scoreEl.textContent = `🏆 Palavras encontradas: ${foundWords.length}/${words.length}`;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const confetti = window.confetti.create(confettiCanvas, { resize: true });

  (function frame() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return;
    confetti({
      particleCount: 2,
      angle: Math.random() * 60 + 60,
      spread: 55,
      origin: { y: 0.6 },
    });
    requestAnimationFrame(frame);
  })();
}