import React, { useState, useEffect } from "react";

/**
 * Simple 2-player Ludo (You vs Computer)
 * - Board positions: 0..51 (main circle)
 * - Each player has a start entry index and a home column of length 6
 * - 4 tokens each. Tokens at -1 are in base (home), tokens at 100+ are finished.
 *
 * This is a simplified, playable Ludo variant to demonstrate full flow:
 * roll dice, move, captures, extra turn on 6, AI moves.
 */

/* ---------- Config ---------- */
const BOARD_SIZE = 52;
const TOKENS_PER_PLAYER = 4;
const HOME_STRETCH = 6; // number of final home steps

const players = {
  HUMAN: {
    id: 0,
    color: "#d9534f", // red
    startIndex: 0, // entry onto board when leaving base
  },
  AI: {
    id: 1,
    color: "#0275d8", // blue
    startIndex: 26,
  },
};

function modulo(n, m) {
  return ((n % m) + m) % m;
}

/* ---------- Utilities ---------- */
// Convert absolute index into board coordinates for visual (circle) — approximate positions.
// We'll render a grid of 13x5 simplified for readability.
function coordsFromIndex(i) {
  // For simplicity map 0..51 to positions in a 13x5 grid manually
  const coords = [];
  // top row left->right (0..12)
  // build a list of 52 coordinates around edges
  const rows = 5;
  const cols = 13;
  // generate rectangle path clockwise
  const path = [];
  for (let c = 0; c < cols; c++) path.push([0, c]); // top row
  for (let r = 1; r < rows; r++) path.push([r, cols - 1]); // right column
  for (let c = cols - 2; c >= 0; c--) path.push([rows - 1, c]); // bottom row
  for (let r = rows - 2; r > 0; r--) path.push([r, 0]); // left column
  // path length is 2*cols + 2*(rows-2) = 26+6 = 32 - but we need 52.
  // fallback: scatter indices around a simple circle layout positions (approx).
  const circle = [];
  const centerX = 6;
  const centerY = 2;
  const radius = 5;
  for (let j = 0; j < BOARD_SIZE; j++) {
    const angle = (2 * Math.PI * j) / BOARD_SIZE - Math.PI / 2;
    const x = centerX + Math.round(Math.cos(angle) * radius);
    const y = centerY + Math.round(Math.sin(angle) * radius * 0.6);
    circle.push([y, x]); // row, col
  }
  return circle[i];
}

/* ---------- Main Component ---------- */
export default function Ludo() {
  // token positions: -1 = in base, 0..51 = board, 52..(52+HOME_STRETCH-1) = home stretch, 100 = finished marker
  const [tokens, setTokens] = useState(() => {
    // tokens[playerId] = array of positions length TOKENS_PER_PLAYER
    return {
      0: new Array(TOKENS_PER_PLAYER).fill(-1),
      1: new Array(TOKENS_PER_PLAYER).fill(-1),
    };
  });

  const [turn, setTurn] = useState(players.HUMAN.id); // who has turn
  const [dice, setDice] = useState(null);
  const [message, setMessage] = useState("Your turn. Roll the dice.");
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // helper: compute target pos if player moves token at pos by steps
  function computeTargetPos(playerId, pos, steps) {
    const player = playerId === players.HUMAN.id ? players.HUMAN : players.AI;
    if (pos === -1) {
      // base -> start only when steps === 6
      if (steps !== 6) return null;
      return player.startIndex;
    }

    // If already finished
    if (pos >= 100) return null;

    // distance from player's start to pos in circular
    // compute steps to finish: number of steps to go from pos to player's startIndex + BOARD_SIZE + HOME_STRETCH
    // Normalization: treat player's start as 0 in their track.
    const relativePos = modulo(pos - player.startIndex, BOARD_SIZE);
    const nextRelative = relativePos + steps;

    if (nextRelative < BOARD_SIZE) {
      // still on board
      return modulo(player.startIndex + nextRelative, BOARD_SIZE);
    } else {
      // into home stretch
      const homeStep = nextRelative - BOARD_SIZE; // 0..HOME_STRETCH
      if (homeStep < HOME_STRETCH) {
        return 100 + homeStep; // 100..100+HOME_STRETCH-1 represent home cells
      } else if (homeStep === HOME_STRETCH) {
        return 200 + 1; // finished (200+1)
      } else {
        return null; // cannot move beyond final
      }
    }
  }

  function isOccupiedByPlayer(playerId, pos) {
    return tokens[playerId].some((p) => p === pos);
  }

  function findCapturable(tokenPos, opponentId) {
    // only main board 0..51 can be captured. home stretch & base/finished aren't capturable.
    if (tokenPos < 0 || tokenPos >= BOARD_SIZE) return false;
    return tokens[opponentId].some((p, idx) => p === tokenPos);
  }

  function rollDice() {
    if (gameOver) return;
    if (turn !== players.HUMAN.id && turn !== players.AI.id) return;
    const r = Math.floor(Math.random() * 6) + 1;
    setDice(r);
    setSelectedTokenIndex(null);
    setMessage((prev) => `${turn === players.HUMAN.id ? "You" : "Computer"} rolled ${r}`);
    // if human turn -> let user pick move (unless no valid move -> auto pass)
    if (turn === players.HUMAN.id) {
      // check if any move possible
      const hasMove = tokens[0].some((pos, idx) => computeTargetPos(0, pos, r) !== null);
      if (!hasMove) {
        setMessage("No valid moves. Passing turn.");
        // if rolled 6 but cannot move, still pass
        setTimeout(() => setTurn(players.AI.id), 800);
      }
    } else {
      // AI auto move after small delay
      setTimeout(() => aiMakeMove(r), 700);
    }
  }

  function applyMove(playerId, tokenIdx, targetPos) {
    setTokens((prev) => {
      const copy = {
        0: [...prev[0]],
        1: [...prev[1]],
      };
      copy[playerId][tokenIdx] = targetPos;
      // check capture if target on main board
      const opponentId = playerId === 0 ? 1 : 0;
      if (targetPos >= 0 && targetPos < BOARD_SIZE) {
        // capture any opponent tokens at that pos
        for (let i = 0; i < copy[opponentId].length; i++) {
          if (copy[opponentId][i] === targetPos) {
            copy[opponentId][i] = -1; // send home
            setMessage(`${playerId === 0 ? "You" : "Computer"} captured opponent's token!`);
          }
        }
      }
      return copy;
    });
  }

  function finishCheck() {
    // finished if all tokens >=200
    const humanDone = tokens[0].every((p) => p >= 200);
    const aiDone = tokens[1].every((p) => p >= 200);
    if (humanDone || aiDone) {
      setGameOver(true);
      setMessage(humanDone ? "You win! 🎉" : "Computer wins. 😢");
    }
  }

  useEffect(() => {
    finishCheck();
    // eslint-disable-next-line
  }, [tokens]);

  async function makeHumanMove(tokenIdx) {
    if (turn !== players.HUMAN.id) return;
    if (dice === null) {
      setMessage("Roll the dice first.");
      return;
    }
    const target = computeTargetPos(players.HUMAN.id, tokens[0][tokenIdx], dice);
    if (target === null) {
      setMessage("Invalid move. Choose another token.");
      return;
    }
    applyMove(players.HUMAN.id, tokenIdx, target);
    // handle extra turn on 6 and also if rolled move into finished sets
    if (dice === 6) {
      setMessage("You rolled a 6 — you get another turn!");
      setTimeout(() => {
        setDice(null);
      }, 300);
    } else {
      setTimeout(() => {
        setDice(null);
        setTurn(players.AI.id);
      }, 400);
    }
  }

  function aiMakeMove(d) {
    // Basic AI algorithm:
    // 1. Find moves that capture human token (highest priority)
    // 2. Else, if can move a token closer to finish, pick token with max advancement
    // 3. Else, if d===6 and have tokens in base, bring out token
    const aiId = players.AI.id;
    const humanId = players.HUMAN.id;
    const possibleMoves = [];
    for (let i = 0; i < TOKENS_PER_PLAYER; i++) {
      const pos = tokens[aiId][i];
      const target = computeTargetPos(aiId, pos, d);
      if (target !== null) {
        const captures = target >= 0 && target < BOARD_SIZE && tokens[humanId].includes(target);
        // advancement metric: relative distance to finish
        let pref = 0;
        if (captures) pref += 1000;
        // reward moving out
        if (pos === -1 && d === 6) pref += 50;
        // reward longer moves
        pref += typeof pos === "number" && pos >= 0 ? (pos >= 100 ? 0 : 10) : 0;
        possibleMoves.push({ index: i, pos, target, captures, pref });
      }
    }
    if (possibleMoves.length === 0) {
      setMessage("Computer has no valid moves.");
      if (d === 6) {
        setDice(null); // still extra turn but AI can't move -> pass back to human
      } else {
        setTimeout(() => {
          setTurn(players.HUMAN.id);
          setDice(null);
        }, 500);
      }
      return;
    }
    // choose best pref
    possibleMoves.sort((a, b) => b.pref - a.pref);
    const chosen = possibleMoves[0];
    applyMove(aiId, chosen.index, chosen.target);
    if (d === 6) {
      setMessage("Computer rolled 6 and moved — it goes again.");
      setTimeout(() => {
        setDice(null);
        // AI rolls again after delay
        const r = Math.floor(Math.random() * 6) + 1;
        setDice(r);
        setTimeout(() => aiMakeMove(r), 700);
      }, 700);
    } else {
      setTimeout(() => {
        setDice(null);
        setTurn(players.HUMAN.id);
      }, 700);
    }
  }

  // render token display at top-left for debugging / simple UI
  function renderTokenMarkers() {
    return (
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {Object.keys(tokens).map((pid) => (
          <div key={pid} style={{ display: "flex", gap: 6 }}>
            <strong style={{ marginRight: 6 }}>{pid === "0" ? "You" : "AI"}</strong>
            {tokens[pid].map((p, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: pid === "0" ? players.HUMAN.color : players.AI.color,
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                title={`Token ${i} pos ${p}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Render board as circle points (approx)
  const boardCells = new Array(BOARD_SIZE).fill(0).map((_, i) => {
    const yx = coordsFromIndex(i);
    return { idx: i, y: yx[0], x: yx[1] };
  });

  return (
    <div style={{ fontFamily: "Inter, Arial", padding: 20 }}>
      <h3 style={{ textAlign: "center" }}>Ludo — You vs Computer</h3>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <strong>Turn:</strong> <span style={{ color: turn === 0 ? players.HUMAN.color : players.AI.color }}>{turn === 0 ? "You" : "Computer"}</span>
          </div>
          <div>
            <button className="btn" onClick={rollDice} disabled={gameOver || (turn !== players.HUMAN.id && turn !== players.AI.id)}>
              Roll Dice
            </button>
            <span style={{ marginLeft: 12, fontWeight: "bold" }}>{dice ? `Dice: ${dice}` : "Dice: -"}</span>
          </div>
          <div>{renderTokenMarkers()}</div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {/* Left: board visual */}
          <div style={{ flex: 1, minHeight: 420, background: "#fff", borderRadius: 8, padding: 14, boxShadow: "0 6px 18px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(13, 1fr)", gap: 6 }}>
              {boardCells.map((cell) => {
                const occupiedBy = [];
                if (tokens[0].includes(cell.idx)) {
                  const ids = tokens[0].map((p, idx) => (p === cell.idx ? idx + 1 : null)).filter(Boolean);
                  ids.forEach((id) => occupiedBy.push({ player: 0, id }));
                }
                if (tokens[1].includes(cell.idx)) {
                  const ids = tokens[1].map((p, idx) => (p === cell.idx ? idx + 1 : null)).filter(Boolean);
                  ids.forEach((id) => occupiedBy.push({ player: 1, id }));
                }
                return (
                  <div key={cell.idx} style={{ minHeight: 48, borderRadius: 6, background: "#f6f6f6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <div style={{ fontSize: 12, color: "#666" }}>{cell.idx}</div>
                    {occupiedBy.length > 0 && (
                      <div style={{ position: "absolute", bottom: 6, display: "flex", gap: 4 }}>
                        {occupiedBy.map((o) => (
                          <div key={`${cell.idx}-${o.player}-${o.id}`} style={{ width: 20, height: 20, borderRadius: 4, background: o.player === 0 ? players.HUMAN.color : players.AI.color, color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {o.id}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: controls & token list */}
          <div style={{ width: 360 }}>
            <div style={{ background: "#fff", padding: 12, borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.04)" }}>
              <h5>Controls</h5>
              <p style={{ color: "#444" }}>{message}</p>

              <div style={{ marginTop: 8 }}>
                <p style={{ marginBottom: 6, fontWeight: 600 }}>Your Tokens</p>
                {tokens[0].map((pos, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 34, height: 34, background: players.HUMAN.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{pos === -1 ? "In Base" : pos >= 200 ? "Finished" : `Pos: ${pos}`}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {pos >= 0 && pos < BOARD_SIZE ? `On board` : pos >= 100 && pos < 200 ? `Home stretch` : pos >= 200 ? `Completed` : `In base`}
                      </div>
                    </div>
                    <button className="btn" onClick={() => makeHumanMove(idx)} disabled={turn !== players.HUMAN.id || dice === null || computeTargetPos(players.HUMAN.id, pos, dice) === null}>
                      Move
                    </button>
                  </div>
                ))}
              </div>

              <hr />

              <div>
                <p style={{ marginBottom: 6, fontWeight: 600 }}>Computer Tokens</p>
                {tokens[1].map((pos, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 34, height: 34, background: players.AI.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{pos === -1 ? "In Base" : pos >= 200 ? "Finished" : `Pos: ${pos}`}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn" onClick={() => { setTokens({ 0: new Array(TOKENS_PER_PLAYER).fill(-1), 1: new Array(TOKENS_PER_PLAYER).fill(-1) }); setTurn(players.HUMAN.id); setDice(null); setMessage("New game. Your turn."); setGameOver(false); }}>
                  Reset Game
                </button>
                <button className="btn" onClick={() => { setMessage("Hint: roll a 6 to bring a token out."); }}>
                  Hint
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, textAlign: "center", color: "#666" }}>
          <small>Rules: roll dice, roll 6 to bring token out, land on opponent to capture, first to finish 4 tokens wins.</small>
        </div>
      </div>
    </div>
  );
}
