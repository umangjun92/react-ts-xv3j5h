import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

type PieceType = 0 | 1;

type GameStruct = (PieceType | 2)[][];

type Move = [PieceType, number, number];

interface Player {
	id: string;
	pieceType: PieceType;
	// moves: Array<[number, number]>;
}

interface Game {
	id: string;
	players: [Player, Player];
	// moves: Move[];
	gameStruct: GameStruct;
	winner: string;
	isActive: boolean;
}

const allGames: Game[] = [];

function getGamesByPlayerId(id: string) {
	return allGames.filter((game) => !!game.players.find((player) => player.id === id));
}

function createNewGame(players: [Player, Player]) {
  const gameStruct = new Array(3);
  for(let i = 0; i < gameStruct.length; i++){
    gameStruct[i] = new Array(3).fill(2);
  }
  const newGame = { gameStruct, id: String(allGames.length), isActive: true, winner: null, players }
	allGames.push(newGame);
  return newGame
}

function updateGame(gameId: string, updatedGame: Game) {
	allGames.forEach((game) => {
		if (game.id === gameId) {
			game = { ...game, ...updateGame };
		}
	});
}

function endGame(gameId: string, winnerPlayerId: string) {
	allGames.forEach((game) => {
		if (game.id === gameId) {
			game.isActive = false;
			game.winner = winnerPlayerId;
		}
	});
}

function isValidMove(gamestruct: GameStruct, position: [number, number]) {
	const validPositions = [0, 1, 2];
	const [i, j] = position;
	if (validPositions.includes(i) && validPositions.includes(j)) {
		if (gamestruct[i][j] === 0 || gamestruct[i][j] === 1) {
			return false;
		} else {
			return true;
		}
	} else {
		return false;
	}
}

function makeMove(gameStruct: GameStruct, piece: PieceType, position: [number, number]) {
	const [i, j] = position;
	try {
		if (isValidMove(gameStruct, position)) {
			gameStruct[i][j] = piece;
      return gameStruct;
		} else {
      console.log("not a valid move")
			throw "not a valid move";
		}
	} catch (e) {
		console.log(e);
	}
}

function check(arr: GameStruct[0]) {
	const sum = arr.reduce((acc, curr) => acc + curr, 0);
	switch (sum) {
		case 0:
			return 0;
		case 3:
			return 1;
		default:
			return null;
	}
}

function getWinner(gameStruct: GameStruct) {
	let col: GameStruct[0] = [];
	let row: GameStruct[0] = [];
	let diagonals: [GameStruct[0], GameStruct[0]] = [[], []];
	for (let i = 0; i < gameStruct.length; i++) {
		row = gameStruct[i];
		const rowWinner = check(row);
		if (rowWinner !== null) {
			return rowWinner;
		}
		for (let j = 0; j < gameStruct[i].length; j++) {
			col.push(gameStruct[j][i]);
			// if (i === j) {
			// 		diagonals[0].push(gameStruct[i][j]);	
			// }
      // if(Math.abs(i-j) === 0 || Math.abs(i-j) === 2 ){
      //   diagonals[1].push(gameStruct[i][j])
      // }
		}
		const colWinner = check(col);
		if (colWinner !== null) {
			return colWinner;
		}
	}
  diagonals[0] = [gameStruct[0][0],gameStruct[1][1], gameStruct[2][2]]
  diagonals[1] = [gameStruct[0][2],gameStruct[1][1], gameStruct[2][0]]
  console.log("diagonals",diagonals)
	for (let k = 0; k < diagonals.length; k++) {
		const diagWinner = check(diagonals[k]);
		if (diagWinner !== null) {
			return diagWinner;
		}
	}
	return null;
}

/**
 * Frontend
 */
const PLAYER_ID = "dummyId";

interface GameCompProps {
	gameId: string;
}

const PieceMap = {
	0: "0",
	1: "X",
	2: "",
};

const GameComp = ({ gameId }: GameCompProps) => {
  const [pieceType, setPieceType] = useState<PieceType>(null)
	const [game, setGame] = useState<Game>(null);
  const [isActive, setIsActive] = useState(true);

	const onClickCell = (e) => {
			const pos: [number, number] = [e.target.parentElement.rowIndex, e.target.cellIndex];
			if (isActive && isValidMove(game.gameStruct, pos)) {
				const updatedGame = {
					...game,
					gameStruct: makeMove(game.gameStruct, game.players.find((player) => player.id === PLAYER_ID).pieceType, pos),
				};
				setGame(updatedGame);
				updateGame(gameId, game);
			}
    };
    
    useEffect(() => {
        const currGame = allGames.find(_game=> _game.id === gameId);
        console.log(currGame)
        setGame(currGame);
        setPieceType(currGame?.players.find(player => player.id === PLAYER_ID).pieceType);
         setIsActive(currGame?.isActive);
    },[gameId])

	useEffect(() => {
       if(game){
        const winnerPieceType = getWinner(game.gameStruct);
        if(winnerPieceType !== null){
            const winnerId = game.players.find(player => player.pieceType === winnerPieceType).id;
            console.log("winner is", winnerId)
            alert(winnerId === PLAYER_ID ? "You Won" : "You Lost")
            setIsActive(false);
            endGame(gameId, winnerId)
        }
       }
    }, [game]);

	return (
		game ? <table>
			<tbody onClick={onClickCell}>
				{game.gameStruct.map((row, i) => (
					<tr>
						{row.map((col, j) => (
							<td style={{border: "1px solid grey", height: "20px", width: "20px", cursor: "pointer"}}>{PieceMap[col]}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>: null
	);
};

const App = () => {
	const [gameId, setGameId] = useState<string>(null);

	const onClickNewGame = () => {
		const newGame = createNewGame([
			{ id: PLAYER_ID, pieceType: 0 },
			{ id: "player2", pieceType: 1 },
		]);
    setGameId(newGame.id)
	};

	const onClickGame = (gameId: string) => {
		setGameId(gameId);
	};

	return (
		<div>
			
			<div style={{ display: "flex" }}>
      <div style={{paddingRight: "50px"}}>
        <button onClick={onClickNewGame}>New Game</button>
					<GameComp gameId={gameId} />
				</div>
				<div>
					{getGamesByPlayerId(PLAYER_ID).map((game) => (
						<div style={{cursor: "pointer"}} onClick={() => onClickGame(game.id)} >Game {game.id}</div>
					))}
				</div>
				
			</div>
		</div>
	);
};

ReactDOM.render(<App />, document.getElementById("root"));
