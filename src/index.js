import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const Square = ({ onClick, value }) => {
  return (
    <button className="square" onClick={() => onClick()}>
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
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
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
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const [current] = history.slice(-1);
    const boardSideLength = Math.sqrt(history[0].squares.length);

    let cnt = 0;
    let row, col;

    for (let y = 1; y <= boardSideLength; y++) {
      // y -> row
      for (let x = 1; x <= boardSideLength; x++) {
        // x -> col
        cnt++;
        if (i + 1 === cnt) {
          row = y;
          col = x;
          break;
        }
      }
    }
    // console.log(row + "|" + col);

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

  jumpTo(move) {
    if (move === undefined) return;
    this.setState({
      history: this.state.history.slice(0, this.state.stepNumber + 1),
      stepNumber: move,
      xIsNext: this.state.stepNumber % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      const [row, col] = step.moveCoords;
      const desc = move
        ? `Go to move # ${move}(row${row}:col${col})`
        : `Go to game start`;
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
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
  // console.log(squares);
  lines.some((line) => {
    const lineOfSquares = Array.from(
      line.reduce((acc, el) => acc + squares[el], "")
    );

    if (lineOfSquares.every((symbol) => symbol === "X")) winner = "X";
    if (lineOfSquares.every((symbol) => symbol === "O")) winner = "O";
  });

  return winner;
};
