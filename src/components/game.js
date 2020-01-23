import React, { Component } from 'react';

export default class Game extends Component {
    constructor() {
        super();
        this.state = {
            height: 50,
            width: 70,
            board: this.initializeBoard(50, 70),
            sim: true,
            mouseDown: false,
        }
        this.canvas = React.createRef();
        this.tick = this.tick.bind(this);
        this.toggleSim = this.toggleSim.bind(this);
        this.handleClickCell = this.handleClickCell.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.timer = setInterval(this.tick, 100);
    }

    initializeBoard(height, width) {
        let board = [];
        for (let i = 0; i < height; i++) {
            board[i] = [];
            for (let j = 0; j < width; j++) {
                board[i][j] = Math.random() >= 0.5;
            }
        }
        return board;
    }

    handleClickClear() {
        clearInterval(this.timer);
        this.setState({sim: false, board: Array.from({length: this.state.height}, ()=>Array.from({length: this.state.width}, ()=>false))});
    }

    handleClickReset() {
        clearInterval(this.timer);
        this.setState({sim: false, board: this.initializeBoard(this.state.height, this.state.width)});
    }

    handleClickCell(event) {
        let {clientX, clientY, target} = event;
        let [top, left] = [target.offsetTop, target.offsetLeft];
        clientX = Math.floor((clientX-left)/10);
        clientY = Math.floor((clientY-top)/10);
        this.setState(prevState=>{
            prevState.board[clientY][clientX] = !prevState.board[clientY][clientX];
            return {board: prevState.board};
        });
    }

    handleMouseOver(e) {
        let event = e;
        if (this.state.mouseDown === true) {
            this.handleClickCell(event);
        }
    }

    handleMouseDown() {
        this.setState({mouseDown: true});
    }

    handleMouseUp() {
        this.setState({mouseDown: false})
    }

    // printCells() {
    //     return this.state.board.map((row, i)=><tr>{row.map((cell, j)=><td id={i + ',' + j} className={cell === true ? 'alive': 'undefined'} onMouseOver={this.handleMouseOver} onClick={this.handleClickCell} onMouseDown={()=>this.handleMouseDown()} onMouseUp={()=>this.handleMouseUp()}></td>)}</tr>);
    // }

    tick() {
        this.setState(prevState=>({board: prevState.board.map((row, i)=>row.map((col, j)=>{
            let neighbours = this.findNeighbours(i, j);
            if (col === true) {
                return neighbours === 2 || neighbours === 3;
            } else {
                return neighbours === 3;
            }
        }))}));
    }

    findNeighbours(i, j) {
        let neighbours = 0;
        let currBoard = this.state.board;
        for (let k = -1; k < 2; k++) {
            for (let l = -1; l < 2; l++) {
                const row = i + k;
                const col = j + l;
                if (!(row < 0 || row >= currBoard.length || col < 0 || col >= currBoard[i].length)) {
                    if (!(k === 0 && l === 0) && currBoard[row][col] === true) {
                        neighbours++;
                    }
                }  
            }
        }
        return neighbours;
    }

    toggleSim() {
        if (this.state.sim === false) {
            this.timer = setInterval(this.tick, 100);
        } else {
            clearInterval(this.timer);
        }
        this.setState(prevState=>({sim: !prevState.sim}));
    }

    componentDidUpdate() {
        const ctx = this.canvas.current.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
        this.state.board.forEach((row,i)=>{
            row.forEach((col, j)=>{
                col ? ctx.fillRect(j*10,i*10, 10, 10) : ctx.strokeRect(j*10,i*10,10,10);
            });
        });
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvas} onClick={this.handleClickCell} width={this.state.width*10} height={this.state.height*10}/>
                <button onClick={this.toggleSim}>{this.state.sim ? 'Pause':'Play'}</button>
                <button onClick={()=>this.handleClickReset()}>Reset</button>
                <button onClick={()=>this.handleClickClear()}>Clear</button>
            </div>
        );
    }
}