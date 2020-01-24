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
            lastPos: {x: null, y: null},
            numTicks: 0
        }
        this.canvas = React.createRef();
        this.tick = this.tick.bind(this);
        this.toggleSim = this.toggleSim.bind(this);
        this.handleClickCell = this.handleClickCell.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
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

    stopSim() {
        clearInterval(this.timer);
        this.setState({numTicks: 0});
    }

    handleClickClear() {
        this.stopSim();
        this.setState({sim: false, board: Array.from({length: this.state.height}, ()=>Array.from({length: this.state.width}, ()=>false))});
    }

    handleClickReset() {
        this.stopSim();
        this.setState({sim: false, board: this.initializeBoard(this.state.height, this.state.width)});
    }

    handleClickCell(event) {
        const {x, y} = this.getMousePos(event);
        this.setState(prevState=>{
            prevState.board[y][x] = !prevState.board[y][x];
            return {board: prevState.board};
        });
    }

    getMousePos(event) {
        let {clientX, clientY} = event;
        const {top, left} = this.canvas.current.getBoundingClientRect();
        clientX = Math.floor((clientX-left)/10);
        clientY = Math.floor((clientY-top)/10);
        return {x: clientX, y: clientY};
    }

    handleMouseOver(e) {
        const event = e;
        const {x, y} = this.getMousePos(event);
        if (!(x === this.state.lastPos.x && y === this.state.lastPos.y)) {            
            this.setState({lastPos: {x: x, y: y}});
            if (this.state.mouseDown === true) {
                this.handleClickCell(event);
            }
        }
        
    }

    handleMouseDown(event) {
        this.handleClickCell(event);
        this.setState({mouseDown: true});
    }

    handleMouseUp(event) {
        this.handleClickCell(event);
        this.setState({mouseDown: false});
    }

    // printCells() {
    //     return this.state.board.map((row, i)=><tr>{row.map((cell, j)=><td id={i + ',' + j} className={cell === true ? 'alive': 'undefined'} onMouseOver={this.handleMouseOver} onClick={this.handleClickCell} onMouseDown={()=>this.handleMouseDown()} onMouseUp={()=>this.handleMouseUp()}></td>)}</tr>);
    // }

    tick() {
        this.setState(prevState=>({numTicks: this.state.numTicks + 1, board: prevState.board.map((row, i)=>row.map((col, j)=>{
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
                <h1>John Conway's Game of Life</h1>
                <canvas 
                    ref={this.canvas} 
                    onMouseMove={this.handleMouseOver} 
                    onClick={this.handleClickCell} 
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    width={this.state.width*10} 
                    height={this.state.height*10}/>
                <div>
                    <button onClick={this.toggleSim}>{this.state.sim ? 'Pause':'Play'}</button>
                    <button onClick={()=>this.handleClickReset()}>Reset</button>
                    <button onClick={()=>this.handleClickClear()}>Clear</button>
                    <p>Simulations: {this.state.numTicks}</p>
                </div>
            </div>
        );
    }
}