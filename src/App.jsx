import React, { useState } from 'react';

// Exact grid lines from detection
const V = [164, 276, 388, 499, 609, 720, 831, 941, 1050, 1159, 1270, 1380, 1489, 1599, 1710, 1822];
const H = [174, 284, 395, 506, 617, 728, 839, 949, 1060, 1171, 1280];
const BW = 2000, BH = 1426;

export default function WackyWackyWest() {
  const [started, setStarted] = useState(false);
  const [player, setPlayer] = useState(0);
  const [workers, setWorkers] = useState({
    topsy: {c:0, r:0, lastDir:null},
    road: {c:14, r:0, lastDir:null},
    river: {c:0, r:9, lastDir:null},
    turvy: {c:14, r:9, lastDir:null}
  });
  const [board, setBoard] = useState(() => Array(10).fill(0).map((_, r) => 
    Array(15).fill(0).map((_, c) => ({c, r, covered:false, tileSize:null}))
  ));
  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  
  const startGame = () => {
    const t = [];
    // Roads: 6x size-1, 6x size-2, 3x size-3
    for(let i=0; i<6; i++) t.push({id:`r1-${i}`, type:'Road', size:1});
    for(let i=0; i<6; i++) t.push({id:`r2-${i}`, type:'Road', size:2});
    for(let i=0; i<3; i++) t.push({id:`r3-${i}`, type:'Road', size:3});
    // Rivers: 6x size-1, 6x size-2, 3x size-3
    for(let i=0; i<6; i++) t.push({id:`ri1-${i}`, type:'River', size:1});
    for(let i=0; i<6; i++) t.push({id:`ri2-${i}`, type:'River', size:2});
    for(let i=0; i<3; i++) t.push({id:`ri3-${i}`, type:'River', size:3});
    // Railroads: 12x size-1, 12x size-2, 6x size-3
    for(let i=0; i<12; i++) t.push({id:`rr1-${i}`, type:'Railroad', size:1});
    for(let i=0; i<12; i++) t.push({id:`rr2-${i}`, type:'Railroad', size:2});
    for(let i=0; i<6; i++) t.push({id:`rr3-${i}`, type:'Railroad', size:3});
    
    setTiles(t.sort(() => Math.random() - 0.5).slice(0, 30));
    setStarted(true);
  };
  
  const calcValidMoves = (tile) => {
    const tracks = tile.type === 'Railroad' ? ['topsy', 'turvy'] : [tile.type.toLowerCase()];
    const allMoves = [];
    
    tracks.forEach(track => {
      const w = workers[track];
      
      // Try all 4 directions
      const dirs = [
        {name:'right', dx:1, dy:0},
        {name:'down', dx:0, dy:1},
        {name:'left', dx:-1, dy:0},
        {name:'up', dx:0, dy:-1}
      ];
      
      dirs.forEach(dir => {
        const cells = [];
        for(let i=0; i<tile.size; i++) {
          cells.push([w.c + dir.dx*i, w.r + dir.dy*i]);
        }
        
        // Check if valid
        const isValid = cells.every(([c,r], idx) => {
          // Bounds check
          if(c < 0 || c >= 15 || r < 0 || r >= 10) return false;
          // Corner check
          if((c===0&&r===0)||(c===14&&r===0)||(c===0&&r===9)||(c===14&&r===9)) return false;
          // Covered check
          if(board[r][c].covered) return false;
          
          // Adjacent check for first cell
          if(idx === 0) {
            const dc = Math.abs(c - w.c);
            const dr = Math.abs(r - w.r);
            
            // Direct adjacent
            if((dc===1 && dr===0) || (dc===0 && dr===1)) return true;
            
            // Bridge crossing (2 cells away with size-3 tile between)
            if(dc === 2 && dr === 0) {
              const midC = Math.floor((c + w.c) / 2);
              return board[r][midC].tileSize === 3;
            }
            if(dc === 0 && dr === 2) {
              const midR = Math.floor((r + w.r) / 2);
              return board[midR][c].tileSize === 3;
            }
            
            return false;
          }
          
          return true;
        });
        
        if(isValid) {
          allMoves.push({cells, track, dir: dir.name});
        }
      });
    });
    
    return allMoves;
  };
  
  const selectTile = (tile) => {
    if(selected?.id === tile.id) {
      setSelected(null);
      setValidMoves([]);
    } else {
      setSelected(tile);
      setValidMoves(calcValidMoves(tile));
    }
  };
  
  const placeTile = (move) => {
    // Update board
    const newBoard = board.map(row => row.map(cell => ({...cell})));
    move.cells.forEach(([c, r]) => {
      newBoard[r][c].covered = true;
      newBoard[r][c].tileSize = selected.size;
    });
    
    // Update worker
    const [lastC, lastR] = move.cells[move.cells.length - 1];
    const newWorkers = {...workers};
    newWorkers[move.track] = {c: lastC, r: lastR, lastDir: move.dir};
    
    setBoard(newBoard);
    setWorkers(newWorkers);
    setTiles(tiles.filter(t => t.id !== selected.id));
    setSelected(null);
    setValidMoves([]);
    setPlayer(1 - player);
  };
  
  if(!started) {
    return (
      <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#D2691E'}}>
        <button onClick={startGame} style={{padding:'30px 60px', fontSize:'28px', background:'#FFD700', border:'none', borderRadius:'15px', cursor:'pointer', fontWeight:'bold', boxShadow:'0 4px 8px rgba(0,0,0,0.3)'}}>
          🤠 Start Game
        </button>
      </div>
    );
  }
  
  return (
    <div style={{padding:'15px', background:'#F5DEB3', minHeight:'100vh'}}>
      <div style={{marginBottom:'15px', background:'white', padding:'12px 20px', borderRadius:'10px', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
        <h2 style={{margin:'0 0 8px 0', color:'#8B4513'}}>🎮 Wacky Wacky West</h2>
        <div style={{display:'flex', gap:'20px', fontSize:'14px'}}>
          <span><strong>Player:</strong> {player + 1}</span>
          <span><strong>Tiles Left:</strong> {tiles.length}</span>
          {selected && <span style={{color:'#228B22'}}><strong>Selected:</strong> {selected.type} (size {selected.size})</span>}
          {validMoves.length > 0 && <span style={{color:'#4169E1'}}><strong>Valid Moves:</strong> {validMoves.length}</span>}
        </div>
      </div>
      
      <div style={{display:'flex', gap:'15px'}}>
        {/* Board */}
        <div style={{flex:'0 0 68%'}}>
          <div style={{background:'white', padding:'8px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
            <svg viewBox={`0 0 ${BW} ${BH}`} style={{width:'100%', border:'3px solid #8B4513', borderRadius:'5px', background:'#E9D8B8'}}>
              {/* Grid lines */}
              {V.map((x,i) => <line key={`v${i}`} x1={x} y1={H[0]} x2={x} y2={H[10]} stroke="#999" strokeWidth="2" opacity="0.3"/>)}
              {H.map((y,i) => <line key={`h${i}`} x1={V[0]} y1={y} x2={V[15]} y2={y} stroke="#999" strokeWidth="2" opacity="0.3"/>)}
              
              {/* Valid move highlights */}
              {validMoves.map((move, idx) => 
                move.cells.map(([c, r], cellIdx) => (
                  <rect
                    key={`${idx}-${cellIdx}`}
                    x={V[c]}
                    y={H[r]}
                    width={V[c+1] - V[c]}
                    height={H[r+1] - H[r]}
                    fill="lime"
                    opacity="0.5"
                    stroke="yellow"
                    strokeWidth="3"
                    style={{cursor:'pointer'}}
                    onClick={() => placeTile(move)}
                  />
                ))
              )}
              
              {/* Placed tiles */}
              {board.flatMap((row, r) => 
                row.map((cell, c) => {
                  if(!cell.covered) return null;
                  const colors = {1:'#FFA500', 2:'#FF6347', 3:'#8B008B'};
                  return (
                    <rect
                      key={`tile-${c}-${r}`}
                      x={V[c]}
                      y={H[r]}
                      width={V[c+1] - V[c]}
                      height={H[r+1] - H[r]}
                      fill={colors[cell.tileSize] || '#666'}
                      opacity="0.7"
                      stroke="black"
                      strokeWidth="2"
                    />
                  );
                })
              )}
              
              {/* Workers */}
              {Object.entries(workers).map(([name, w]) => {
                const colors = {topsy:'#8B4513', road:'#D2691E', river:'#4169E1', turvy:'#8B0000'};
                const cx = (V[w.c] + V[w.c+1]) / 2;
                const cy = (H[w.r] + H[w.r+1]) / 2;
                return (
                  <g key={name}>
                    <circle cx={cx} cy={cy} r="25" fill={colors[name]} stroke="white" strokeWidth="4"/>
                    <text x={cx} y={cy+8} textAnchor="middle" fontSize="24" fontWeight="bold" fill="white">
                      {name[0].toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        
        {/* Tiles */}
        <div style={{flex:'0 0 30%'}}>
          <div style={{background:'white', padding:'12px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', maxHeight:'700px', overflowY:'auto'}}>
            <h3 style={{margin:'0 0 12px 0', fontSize:'16px'}}>Your Tiles</h3>
            {selected && (
              <div style={{padding:'10px', background:'#FFD700', borderRadius:'8px', marginBottom:'12px', fontSize:'13px'}}>
                <strong>{selected.type}</strong> - Size {selected.size}
                <button 
                  onClick={() => {setSelected(null); setValidMoves([]);}}
                  style={{float:'right', padding:'4px 12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'11px'}}
                >
                  Cancel
                </button>
              </div>
            )}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              {tiles.map(tile => (
                <div
                  key={tile.id}
                  onClick={() => selectTile(tile)}
                  style={{
                    padding:'12px 8px',
                    background: selected?.id === tile.id ? '#FFFACD' : '#f8f8f8',
                    border: selected?.id === tile.id ? '3px solid #FFD700' : '2px solid #ddd',
                    borderRadius:'8px',
                    cursor:'pointer',
                    textAlign:'center',
                    transition:'all 0.2s'
                  }}
                >
                  <div style={{fontSize:'12px', fontWeight:'bold', marginBottom:'4px'}}>{tile.type}</div>
                  <div style={{fontSize:'10px', color:'#666'}}>Size {tile.size}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
