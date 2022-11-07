import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const Square = ({ winnerSquare, onClick, value, id }) => {
  const borderStyle = winnerSquare
    ? { border: "3px solid rgba(63, 188, 67, 0.2)", borderRadius: "7px" }
    : { border: "1px solid #999" };
  return (
    <button
      style={borderStyle}
      className="square"
      onClick={() => onClick()}
      key={id}
    >
      {value}
    </button>
  );
};

const SortBtn = ({ onClick }) => {
  return (
    <button className="sort-btn" onClick={() => onClick()}>
      Sort Moves
    </button>
  );
};

class Board extends React.Component {
  renderSquare(i) {
    const winner = this.props.winner
      ? this.props.winner.includes(i)
      : false
      ? true
      : false;
    return (
      <Square
        winnerSquare={winner}
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
          moveNumber: 0,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      boardWidth: 3,
      historyReversed: false,
      makeMoveBold: null,
    };
  }

  initState() {
    this.setState({
      history: [
        {
          squares: Array(9).fill(null),
          moveCoords: [],
          moveNumber: 0,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      boardWidth: 3,
      historyReversed: false,
      makeMoveBold: null,
    });
  }

  handleSort() {
    this.setState({
      historyReversed: !this.state.historyReversed,
    });
  }

  getMoveCoords(i) {
    let cnt = 0;

    for (let y = 1; y <= this.state.boardWidth; y++) {
      // y -> row
      for (let x = 1; x <= this.state.boardWidth; x++) {
        // x -> col
        cnt++;
        if (i + 1 === cnt) return [y, x];
      }
    }
    return;
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const [current] = history.slice(-1);
    const [row, col] = this.getMoveCoords(i);

    // Slice is used to create a copy of squares array
    const squares = current.squares.slice();
    if (calculateWinner(squares)[0] || squares[i]) return;
    squares[i] = this.state.xIsNext ? "X" : "O";

    const historyUpd = history.concat([
      {
        squares: squares,
        moveCoords: [row, col],
        moveNumber: history.length,
      },
    ]);

    this.setState({
      history: historyUpd,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      historyReversed: this.state.historyReversed,
    });
  }

  jumpTo(move) {
    if (!move) return this.initState();

    this.setState({
      stepNumber: move,
      xIsNext: this.state.stepNumber % 2 === 0,
      makeMoveBold: move,
      historyReversed: this.state.historyReversed,
    });

    this.renderLi(this.state.history);
  }

  renderLi(list) {
    const listNew = list.slice();
    this.state.historyReversed
      ? listNew.sort((a, b) => {
          if (a.moveNumber > b.moveNumber) return -1;
          if (a.moveNumber < b.moveNumber) return 1;
          return 0;
        })
      : listNew.sort((a, b) => {
          if (a.moveNumber > b.moveNumber) return 1;
          if (a.moveNumber < b.moveNumber) return -1;
          return 0;
        });

    return listNew.map((li, liIdx) => {
      const [row, col] = li.moveCoords;
      const desc =
        row || col
          ? `Move ${li.moveNumber}(row:${row} col:${col})`
          : `Go to game start`;
      return (
        <li key={liIdx}>
          <button onClick={(e) => this.jumpTo(li.moveNumber)}>
            <span
              style={
                this.state.makeMoveBold === li.moveNumber
                  ? { fontWeight: "bold" }
                  : { fontWeight: "normal" }
              }
            >
              {desc}
            </span>
          </button>
        </li>
      );
    });
  }

  render() {
    const history = this.state.history;
    const moves = this.renderLi(history);
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const winnerSquares = winner[1];

    let status = winner[0]
      ? `Winner is: ${winner[0]}`
      : current.moveNumber === current.squares.length && !winner.length
      ? `Draw!`
      : `Next player: ${this.state.xIsNext ? "X" : "O"}`;

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winner={winnerSquares ? winnerSquares : null}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <SortBtn onClick={() => this.handleSort()} />
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

  let winner = [];

  lines.some((line) => {
    const lineOfSquares = Array.from(
      line.reduce((acc, el) => acc + squares[el], "")
    );
    if (lineOfSquares.every((symbol) => symbol === "X")) {
      winner = [..."X", line];
    }
    if (lineOfSquares.every((symbol) => symbol === "O")) {
      winner = [..."O", line];
    }
  });

  return winner;
};
