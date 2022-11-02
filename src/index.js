import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const Square = ({ onClick, value, id }) => {
  return (
    <button className="square" onClick={() => onClick()} key={id}>
      {value}
    </button>
  );
};

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        onClick={() => this.props.onClick(i)}
        value={this.props.squares[i]}
        id={i}
      />
    );
  }

  renderBoardRow(rowNumber, boardWidth) {
    const row = [];
    for (
      let square = rowNumber * boardWidth;
      square < (rowNumber + 1) * boardWidth;
      square++
    ) {
      row.push(this.renderSquare(square));
    }
    return <div className="board-row">{row}</div>;
  }

  render() {
    const board = [];
    const boardWidth = 3;
    for (let row = 0; row < boardWidth; row++) {
      board.push(this.renderBoardRow(row, boardWidth));
    }
    return <div>{board}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          moveCoords: [],
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      boardWidth: 3,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const [current] = history.slice(-1);
    let cnt = 0;
    let row, col;

    for (let y = 1; y <= this.state.boardWidth; y++) {
      // y -> row
      for (let x = 1; x <= this.state.boardWidth; x++) {
        // x -> col
        cnt++;
        if (i + 1 === cnt) {
          row = y;
          col = x;
          break;
        }
      }
    }

    // Slice is used to create a copy of squares array
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) return;
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          moveCoords: [row, col],
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(move, event) {
    this.setState({
      history: this.state.history.slice(0, move + 1),
      stepNumber: move,
      xIsNext: this.state.stepNumber % 2 === 0,
    });

    const coordsEl = document.querySelectorAll(".bold-text-move");
    coordsEl.forEach((el) => {
      el.removeAttribute("style");
      el.classList.remove("bold-text-move");
    });

    event.target.style.fontWeight = "bold";
    event.target.classList.add("bold-text-move");
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      const [row, col] = step.moveCoords;
      const desc = move
        ? `Move ${move}(row:${row} col:${col})`
        : `Go to game start`;
      return (
        <li key={move}>
          <button onClick={(e) => this.jumpTo(move, e)}>{desc}</button>
        </li>
      );
    });

    let status = winner
      ? `Winner is: ${winner}`
      : `Next player: ${this.state.xIsNext ? "X" : "O"}`;

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

const calculateWinner = (squares) => {
  if (!squares) return;
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let winner = null;
  lines.some((line) => {
    const lineOfSquares = Array.from(
      line.reduce((acc, el) => acc + squares[el], "")
    );

    if (lineOfSquares.every((symbol) => symbol === "X")) winner = "X";
    if (lineOfSquares.every((symbol) => symbol === "O")) winner = "O";
  });

  return winner;
};
