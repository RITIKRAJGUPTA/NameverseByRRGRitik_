import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";

// Define animations first to avoid reference errors
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
`;

const diceRollAnimation = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
`;

/* ---------- Config & Constants ---------- */
const BOARD_SIZE = 52;
const TOKENS_PER_PLAYER = 4;
const HOME_STRETCH = 6;
const DICE_SOUND = "https://www.soundjay.com/mechanical/sounds/dice-roll-01.mp3";
const CAPTURE_SOUND = "https://www.soundjay.com/human/sounds/applause-01.mp3";

const players = {
  HUMAN: {
    id: 0,
    color: "#e74c3c",
    startIndex: 0,
    name: "Player",
    homeColor: "#fadbd8"
  },
  AI: {
    id: 1,
    color: "#3498db",
    startIndex: 26,
    name: "Computer",
    homeColor: "#d6eaf8"
  }
};

const playerOrder = [players.HUMAN, players.AI];

// Generate board path with better distribution
const generateBoardPath = () => {
  const path = [];
  const center = { x: 7, y: 7 };
  const radius = 6;
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    const angle = (2 * Math.PI * i) / BOARD_SIZE - Math.PI / 2;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;
    path.push({ x, y, index: i });
  }
  
  return path;
};

const boardPath = generateBoardPath();

/* ---------- Styled Components ---------- */
const BoardContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1/1;
  margin: 0 auto;
  background: #f5d76e;
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const BoardCell = styled.div`
  position: absolute;
  width: 5%;
  height: 5%;
  background: ${props => props.isSpecial ? props.color : '#f5d76e'};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  left: ${props => props.x * (100/14)}%;
  top: ${props => props.y * (100/14)}%;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const PlayerHome = styled.div`
  position: absolute;
  width: 25%;
  height: 25%;
  background: ${props => props.color};
  border-radius: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  padding: 10px;
  box-sizing: border-box;
  
  &:nth-child(1) {
    top: 5%;
    left: 5%;
  }
  &:nth-child(2) {
    top: 5%;
    right: 5%;
  }
`;

const Token = styled.div`
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.isActive && `
    animation: ${pulseAnimation} 1.5s infinite;
  `}
`;

const TokenOnBoard = styled(Token)`
  position: absolute;
  left: ${props => props.x * (100/14)}%;
  top: ${props => props.y * (100/14)}%;
  transform: translate(-50%, -50%);
  width: 6%;
  height: 6%;
  z-index: 2;
`;

const DiceContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  user-select: none;
  
  &.rolling {
    animation: ${diceRollAnimation} 0.5s ease-out;
  }
`;

const GameContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const MessageArea = styled.div`
  padding: 15px;
  background: white;
  border-radius: 10px;
  margin: 20px auto;
  text-align: center;
  font-size: 1.1rem;
  max-width: 600px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  background: ${props => props.color || '#2ecc71'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  margin: 5px;
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

/* ---------- Main Component ---------- */
export default function LudoKing() {
  const [tokens, setTokens] = useState(() => ({
    [players.HUMAN.id]: Array(TOKENS_PER_PLAYER).fill(-1),
    [players.AI.id]: Array(TOKENS_PER_PLAYER).fill(-1)
  }));

  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState(null);
  const [message, setMessage] = useState("Roll the dice to start!");
  const [gameOver, setGameOver] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentPlayer = playerOrder[turn % playerOrder.length];
  const isHumanTurn = currentPlayer.id === players.HUMAN.id;

  // Memoized computeTargetPos function
  const computeTargetPos = useCallback((player, pos, steps) => {
    if (pos === -1) return steps === 6 ? player.startIndex : null;
    if (pos >= 100 + HOME_STRETCH) return null;

    const relativePos = ((pos - player.startIndex) + BOARD_SIZE) % BOARD_SIZE;
    const nextRelative = relativePos + steps;

    if (nextRelative < BOARD_SIZE) {
      return (player.startIndex + nextRelative) % BOARD_SIZE;
    } else {
      const homeStep = nextRelative - BOARD_SIZE;
      if (homeStep < HOME_STRETCH) return 100 + homeStep;
      if (homeStep === HOME_STRETCH) return 100 + HOME_STRETCH;
      return null;
    }
  }, []);

  // Check for winner
  const checkWinner = useCallback(() => {
    const winner = playerOrder.find(player => 
      tokens[player.id].every(pos => pos >= 100 + HOME_STRETCH)
    );
    
    if (winner) {
      setGameOver(true);
      setMessage(`${winner.name} wins the game! 🎉`);
      return true;
    }
    return false;
  }, [tokens]);

  // Roll dice function
  const rollDice = useCallback(() => {
    if (gameOver || rolling || !isHumanTurn) return;
    
    setRolling(true);
    if (soundEnabled) new Audio(DICE_SOUND).play().catch(e => console.error(e));
    
    let rollCount = 0;
    const maxRolls = 5 + Math.floor(Math.random() * 5);
    
    const rollInterval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDice(finalValue);
        setRolling(false);
        
        const hasValidMove = tokens[currentPlayer.id].some((pos, idx) => 
          computeTargetPos(currentPlayer, pos, finalValue) !== null
        );
        
        setMessage(hasValidMove 
          ? `You rolled a ${finalValue}! Select a token to move.`
          : `No valid moves. Passing turn.`
        );
        
        if (!hasValidMove) setTimeout(nextTurn, 1000);
      }
    }, 100);
  }, [gameOver, rolling, isHumanTurn, tokens, currentPlayer, soundEnabled, computeTargetPos]);

  // Apply move and handle captures
  const applyMove = useCallback((playerId, tokenIdx, targetPos) => {
    setTokens(prev => {
      const newTokens = {...prev};
      const originalPos = newTokens[playerId][tokenIdx];
      newTokens[playerId][tokenIdx] = targetPos;
      
      // Check for captures
      if (targetPos >= 0 && targetPos < BOARD_SIZE) {
        const opponentId = playerId === players.HUMAN.id ? players.AI.id : players.HUMAN.id;
        newTokens[opponentId] = newTokens[opponentId].map(pos => 
          pos === targetPos ? -1 : pos
        );
      }
      
      return newTokens;
    });
    
    // Check if captured
    const originalPos = tokens[playerId][tokenIdx];
    if (originalPos >= 0 && originalPos < BOARD_SIZE && 
        tokens[currentPlayer.id === players.HUMAN.id ? players.AI.id : players.HUMAN.id].includes(originalPos)) {
      if (soundEnabled) new Audio(CAPTURE_SOUND).play().catch(e => console.error(e));
      setMessage(`${currentPlayer.name} captured an opponent!`);
    }
  }, [tokens, currentPlayer, soundEnabled]);

  // Human player makes a move
  const makeMove = useCallback((tokenIdx) => {
    if (!isHumanTurn || dice === null) return;
    
    const currentPos = tokens[currentPlayer.id][tokenIdx];
    const targetPos = computeTargetPos(currentPlayer, currentPos, dice);
    
    if (targetPos === null) {
      setMessage("Invalid move. Please select another token.");
      return;
    }
    
    applyMove(currentPlayer.id, tokenIdx, targetPos);
    
    if (dice !== 6) {
      setTimeout(nextTurn, 800);
    } else {
      setMessage("You rolled a 6! Roll again.");
    }
  }, [isHumanTurn, dice, tokens, currentPlayer, computeTargetPos, applyMove]);

  // AI makes a move
  const aiMakeMove = useCallback(() => {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    setDice(diceValue);
    setMessage(`Computer rolled a ${diceValue}`);
    
    setTimeout(() => {
      const possibleMoves = [];
      
      tokens[players.AI.id].forEach((pos, idx) => {
        const target = computeTargetPos(players.AI, pos, diceValue);
        if (target !== null) {
          let priority = 0;
          
          if (target >= 0 && target < BOARD_SIZE && 
              tokens[players.HUMAN.id].includes(target)) priority += 1000;
          if (target >= 100 && target < 100 + HOME_STRETCH) priority += 500;
          if (pos === -1 && diceValue === 6) priority += 200;
          else if (pos !== -1) priority += 100;
          
          possibleMoves.push({ idx, target, priority });
        }
      });
      
      if (possibleMoves.length === 0) {
        setMessage("Computer has no valid moves. Passing turn.");
        setTimeout(nextTurn, 1000);
        return;
      }
      
      possibleMoves.sort((a, b) => b.priority - a.priority);
      const { idx, target } = possibleMoves[0];
      
      applyMove(players.AI.id, idx, target);
      setMessage(`Computer moved token ${idx + 1}`);
      
      setTimeout(() => diceValue === 6 ? aiMakeMove() : nextTurn(), 1000);
    }, 1000);
  }, [tokens, computeTargetPos, applyMove]);

  // Move to next turn
  const nextTurn = useCallback(() => {
    if (checkWinner()) return;
    
    setDice(null);
    setTurn(prev => {
      const next = (prev + 1) % playerOrder.length;
      setMessage(`${playerOrder[next].name}'s turn`);
      
      if (playerOrder[next].id === players.AI.id) {
        setTimeout(aiMakeMove, 800);
      }
      
      return next;
    });
  }, [checkWinner, aiMakeMove]);

  // Reset game
  const resetGame = useCallback(() => {
    setTokens({
      [players.HUMAN.id]: Array(TOKENS_PER_PLAYER).fill(-1),
      [players.AI.id]: Array(TOKENS_PER_PLAYER).fill(-1)
    });
    setTurn(0);
    setDice(null);
    setMessage("New game started. Player's turn.");
    setGameOver(false);
  }, []);

  // Effect to check winner after token updates
  useEffect(() => {
    checkWinner();
  }, [tokens, checkWinner]);

  return (
    <GameContainer>
      <h1 style={{ textAlign: 'center', color: '#e74c3c' }}>Ludo King</h1>
      
      <MessageArea>
        {message}
      </MessageArea>
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <DiceContainer 
          onClick={rollDice} 
          className={rolling ? 'rolling' : ''}
          clickable={isHumanTurn && !rolling && !gameOver}
        >
          {dice || '🎲'}
        </DiceContainer>
      </div>
      
      <BoardContainer>
        {/* Player homes */}
        {playerOrder.map(player => (
          <PlayerHome key={player.id} color={player.homeColor}>
            {tokens[player.id].map((pos, idx) => (
              <Token
                key={idx}
                color={player.color}
                onClick={() => isHumanTurn && dice === 6 && pos === -1 && makeMove(idx)}
                isActive={isHumanTurn && dice === 6 && pos === -1}
                clickable={isHumanTurn && dice === 6 && pos === -1}
              >
                {idx + 1}
              </Token>
            ))}
          </PlayerHome>
        ))}
        
        {/* Board cells */}
        {boardPath.map(cell => (
          <BoardCell 
            key={cell.index}
            x={cell.x}
            y={cell.y}
            isSpecial={cell.index === players.HUMAN.startIndex || cell.index === players.AI.startIndex}
            color={cell.index === players.HUMAN.startIndex ? players.HUMAN.color : players.AI.color}
          />
        ))}
        
        {/* Tokens on board */}
        {playerOrder.flatMap(player => 
          tokens[player.id].map((pos, idx) => {
            if (pos === -1 || pos >= 100 + HOME_STRETCH) return null;
            
            let displayPos;
            if (pos >= 100) {
              // Home stretch position
              const homeStep = pos - 100;
              const isTop = player.startIndex < BOARD_SIZE/2;
              displayPos = {
                x: isTop ? 3.5 : 10.5,
                y: isTop ? 3.5 + homeStep * 0.5 : 10.5 - homeStep * 0.5
              };
            } else {
              // Main board position
              const cell = boardPath.find(c => c.index === pos);
              displayPos = { x: cell.x, y: cell.y };
            }
            
            return (
              <TokenOnBoard
                key={`${player.id}-${idx}`}
                x={displayPos.x}
                y={displayPos.y}
                color={player.color}
                onClick={() => isHumanTurn && player.id === currentPlayer.id && makeMove(idx)}
                clickable={isHumanTurn && player.id === currentPlayer.id && 
                  computeTargetPos(currentPlayer, pos, dice) !== null}
              >
                {idx + 1}
              </TokenOnBoard>
            );
          })
        )}
      </BoardContainer>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button onClick={resetGame} color="#e74c3c">New Game</Button>
        <Button onClick={() => setSoundEnabled(!soundEnabled)} color="#3498db">
          {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
        </Button>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Rules: Roll a 6 to bring a token out. Capture opponents by landing on them.</p>
        <p>First to get all tokens home wins!</p>
      </div>
    </GameContainer>
  );
}