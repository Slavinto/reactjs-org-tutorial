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

const SortBtn = ({ onClick }) => {
  return (
    <button className="sort-btn" onClick={() => onClick()}>
      Sort Moves
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
          moveNumber: 0,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      boardWidth: 3,
      historyReversed: false,
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
    });
  }

  handleSort() {
    this.setState({
      historyReversed: !this.state.historyReversed,
    });
    // this.renderLi(this.state.history);
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
    if (calculateWinner(squares) || squares[i]) return;
    squares[i] = this.state.xIsNext ? "X" : "O";

    const historyUpd = history.concat([
      {
        squares: squares,
        moveCoords: [row, col],
        moveNumber: history.length,
      },
    ]);

    // const newHistory = this.state.newHistory ? historyUpd.reverse() : null;

    this.setState({
      history: historyUpd,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      historyReversed: this.state.historyReversed,
      // newHistory: newHistory,
    });
  }

  jumpTo(move) {
    // console.log("move:" + move);

    if (!move) return this.initState();

    const history = this.state.history.slice(0, move + 1);

    this.setState({
      history: history,
      // history: this.getCurHistory().slice(0, move + 1),
      stepNumber: move,
      xIsNext: this.state.stepNumber % 2 === 0,
      historyReversed: this.state.historyReversed,
      // newHistory: this.state.newHistory ? history.reverse() : null,
    });

    this.renderLi(history, move);

    // const coordsEl = document.querySelectorAll(".bold-text-move");
    // coordsEl.forEach((el) => {
    //   el.removeAttribute("style");
    //   el.classList.remove("bold-text-move");
    // });

    // event.target.style.fontWeight = "bold";
    // event.target.classList.add("bold-text-move");
  }

  renderLi(list, boldLi) {
    let listNew = list.slice();
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
    console.log(listNew);
    // console.log(this.state);
    return listNew.map((li, liIdx) => {
      const [row, col] = li.moveCoords;
      const desc =
        row || col
          ? `Move ${li.moveNumber}(row:${row} col:${col})`
          : `Go to game start`;
      return (
        <li key={liIdx}>
          <button onClick={(e) => this.jumpTo(li.moveNumber)}>{desc}</button>
        </li>
      );
    });
  }

  render() {
    // this.syncHistory()
    const history = this.state.history;
    // console.log(history);
    const moves = this.renderLi(history);
    // console.log(this.state);
    // ???
    const current = this.state.history[this.state.stepNumber];
    // console.log(this.state.stepNumber);
    const winner = calculateWinner(current.squares);

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
