// Source tham khảo "React tutorial": https://reactjs.org/tutorial/tutorial.html
import React from 'react'
import Board from './Board'
import './Caro.css'


function getHoriziontalLine(squares, pos) {
    const line = [];
    const h = Math.floor(pos / 20)
    for (let i = 0; i < 19; i += 1) {
        line.push({ val: squares[h * 20 + i], p: h * 20 + i })
    }
    return line
}

function getVerticalLine(squares, pos) {
    const line = [];
    const v = pos % 20
    for (let i = 0; i < 19; i += 1) {
        line.push({ val: squares[i * 20 + v], p: i * 20 + v })
    }
    return line
}

function getSemiCross(squares, pos) {
    // Get semi-cross
    const line = [];
    let h = Math.floor(pos / 20);
    let v = pos % 20;
    h -= 1;
    v -= 1;
    while (h > -1 && v > -1) {
        // let str = "get point: (" +  h + " - " + v + "): " + (h*20+v)
        // console.log(str)
        line.unshift({ val: squares[h * 20 + v], p: h * 20 + v })
        h -= 1;
        v -= 1;
    }
    // console.log("pushing :" +(squares[pos]));
    line.push({ val: squares[pos], p: pos })
    h = Math.floor(pos / 20);
    v = pos % 20;
    h += 1;
    v += 1;
    while (h < 20 && v < 20) {
        // let str = "get point: (" +  h + " - " + v + "): " + (h*20+v)
        // console.log(str)
        line.push({ val: squares[h * 20 + v], p: h * 20 + v })
        h += 1;
        v += 1;
    }
    // console.log("semi cross: " + line)
    return line;
}

function getMainCross(squares, pos) {
    // Get semi-cross
    const line = [];
    let h = Math.floor(pos / 20);
    let v = pos % 20;
    h -= 1;
    v += 1;
    while (h > -1 && v < 20) {
        // let str = "get point: (" +  h + " - " + v + "): " + (h*20+v)
        // console.log(str)
        line.unshift({ val: squares[h * 20 + v], p: h * 20 + v })
        h -= 1;
        v += 1;
    }
    // console.log("pushing :" +(squares[pos]));
    line.push({ val: squares[pos], p: pos })
    h = Math.floor(pos / 20);
    v = pos % 20;
    h += 1;
    v -= 1;
    while (h < 20 && v > -1) {
        // let str = "get point: (" +  h + " - " + v + "): " + (h*20+v)
        // console.log(str)
        line.push({ val: squares[h * 20 + v], p: h * 20 + v })
        h += 1;
        v -= 1;
    }
    // console.log("main cross: " + line)
    return line;
}

function ruleCheck(line, xIsNext) {
    const player = xIsNext ? 'X' : 'O';
    const op = !xIsNext ? 'X' : 'O';
    const win = 5;
    let count = 0;
    for (let i = 0; i < line.length; i += 1) {
        if (line[i].val === player) {
            count += 1
        } else {
            count = 0
        }
        if (count === win) {
            if (i - count === -1 && line[i + 1].val === op) { return null }
            if (i + 1 === 20 && line[i - count].val === op) { return null }
            if (line[i - count].val === op && line[i + 1].val === op) { return null }
            // this.setState({winLine:line.slice(i-count,i+1)})
            // return player;
            const wl = []
            for (let j = i + 1 - count; j < i + 1; j += 1) {
                wl.push(line[j].p)
            }
            return wl
        }
    }
    return null;
}


function calculateWinner(squares, pos, xIsNext) {
    if (pos === -1) {
        return null;
    }
    const hline = getHoriziontalLine(squares, pos)
    const vline = getVerticalLine(squares, pos)
    const semiCross = getSemiCross(squares, pos)
    const mainCross = getMainCross(squares, pos)
    return ruleCheck(hline, xIsNext) || ruleCheck(vline, xIsNext) || ruleCheck(semiCross, xIsNext) || ruleCheck(mainCross, xIsNext)
}

class Caro extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(400).fill(null),
                historyPos: -1
            }],
            screenWidth: window.innerWidth,
            xIsNext: true,
            isDone: false,
            stepNumber: 0,
            isStepListDesc: false,
            arrowSymbol: '↓',
            winLine: Array(5).fill(null)
        };
        window.addEventListener("resize", this.onUpdateScreen);
    }

    onUpdateScreen = () => {
        this.setState({
            screenWidth: window.innerWidth
        });
    };

    handleClick(i) {
        let { history } = this.state
        const { stepNumber, xIsNext, isDone } = this.state
        history = history.slice(0, stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (squares[i] || isDone) {
            return;
        }
        squares[i] = xIsNext ? 'X' : 'O';
        this.setState({
            xIsNext: !xIsNext,
            history: history.concat([{ squares, historyPos: i }]),
            stepNumber: history.length
        });
        const l = calculateWinner(squares, i, xIsNext)
        if (l) {
            // console.log(l)
            this.setState({ isDone: true, winLine: l })
        }
    }

    resetGame() {
        this.setState({
            history: [{
                squares: Array(400).fill(null),
                historyPos: -1
            }],
            xIsNext: true,
            isDone: false,
            stepNumber: 0,
            winLine: Array(5).fill(null)
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    changeListOrder() {
        const { isStepListDesc } = this.state
        this.setState({
            isStepListDesc: !isStepListDesc
        }, () => { this.setState({ arrowSymbol: isStepListDesc ? '↑' : '↓' }) })
    }

    render() {
        const { history, stepNumber, isDone, xIsNext, isStepListDesc, screenWidth, winLine } = this.state;
        const current = history[stepNumber];
        let status;
        if (isDone) {
            const winner = !xIsNext ? 'X' : 'O';
            status = `${winner} CHIẾN THẮNG!!!`;
        } else {
            status = `Đến lượt ${xIsNext ? 'X' : 'O'}`;
        }

        const moves = (isStepListDesc ? history.slice(1).reverse() : history.slice(1)).map((step, move, arr) => {
            let idx = move + 1
            if (isStepListDesc) {
                idx = arr.length - move
            }
            const desc = `#${idx.toString().padEnd(10)}(${step.historyPos % 20}-${Math.floor(step.historyPos / 20)})`;
            if (idx === stepNumber) {
                return (
                    <li key={idx} className="selected-step">
                        <button type="button" onClick={() => this.jumpTo(idx)}>{desc}</button>
                    </li>
                );
            }
            return (
                <li key={idx}>
                    <button type="button" onClick={() => this.jumpTo(idx)}>{desc}</button>
                </li>
            );
        });

        if (screenWidth < 720) {
            return (
                <div className="status">Màn hình cần có chiều dài lớn 720px để có thể chơi được!</div>
            );
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        winLine={winLine}
                    />
                </div>
                <div className="game-info">
                    <ol>
                        <div className="status">{status}</div>
                        <div>
                            <button type="button" onClick={() => this.resetGame()} id="reset-btn">Chơi lại từ đầu</button>
                            <br /><button type="button" onClick={() => this.changeListOrder()} id="change-order-btn">Nước đi (col-row)    {this.state.arrowSymbol}</button>
                        </div>
                        {moves}
                    </ol>
                </div>
            </div>
        );
    }
}

export default Caro