import React, { useCallback, useEffect, useRef, useState } from 'react';
import { soundManager, SoundVolumeLevel } from './audio/soundManager';
import { AdminDashboard } from './components/AdminDashboard';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { ContactModal } from './components/ContactModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { HUD } from './components/HUD';
import { MultiplayerLobbyModal } from './components/MultiplayerLobbyModal';
import { NameInputModal } from './components/NameInputModal';
import { PauseModal } from './components/PauseModal';
import { StartScreen } from './components/StartScreen';
import { SpriteAtlasInspector } from './components/SpriteAtlasInspector';
import { Top50Modal } from './components/Top50Modal';
import { VictoryModal } from './components/VictoryModal';
import { CHARACTERS, GRID_COLS, GRID_ROWS, TILE_SIZE } from './game/constants';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { CharacterConfig, GameMode, GameStatus, PlayerState } from './game/types';
import { saveRankingScore, trackAnalytics } from './firebase/services';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [mode, setMode] = useState<GameMode>('single');
  const [playerName, setPlayerName] = useState<string>('Pollito Rambo');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterConfig>(CHARACTERS[0]);
  const [volumeLevel, setVolumeLevel] = useState<SoundVolumeLevel>(100);
  const [currentLevel] = useState<number>(1);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showContact, setShowContact] = useState<boolean>(false);
  const [showTop50, setShowTop50] = useState<boolean>(false);
  const [showMultiplayerLobby, setShowMultiplayerLobby] = useState<boolean>(false);

  // Canvas & Game Engine references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine>(new GameEngine());
  const rendererRef = useRef<GameRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const endHandledRef = useRef<boolean>(false);

  // Active player state mirror for reactive React HUD
  const [playerMirror, setPlayerMirror] = useState<PlayerState | null>(null);
  const [timeRemainingMirror, setTimeRemainingMirror] = useState<number>(300);

  // Check URL path for /admin route
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin') {
        setStatus('admin');
      } else if (new URLSearchParams(window.location.search).get('sprite-debug') === '1') {
        setStatus('sprite_debug');
      }
    }
  }, []);

  // Track initial page visit in Firebase Analytics
  useEffect(() => {
    trackAnalytics('page_visit');
    // Load stored player name
    const storedName = localStorage.getItem('cbr_player_name');
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  // Cycle volume
  const handleCycleVolume = () => {
    const next = soundManager.cycleVolume();
    setVolumeLevel(next);
  };

  // Start Single Player Flow -> Open Name Input Modal first
  const handleStartSinglePlayerPrompt = () => {
    soundManager.resumeContext();
    soundManager.playClick();
    setMode('single');
    setStatus('name_input');
  };

  // Step 2: save the player's name and continue to character selection.
  const handleLaunchGame = useCallback((name: string) => {
    endHandledRef.current = false;
    setPlayerName(name);
    localStorage.setItem('cbr_player_name', name);
    soundManager.playClick();
    setStatus('character_select');
  }, []);

  // Step 3: only after confirming a playable character do we start the game.
  const handleConfirmCharacter = useCallback((character: CharacterConfig) => {
    endHandledRef.current = false;
    setSelectedCharacter(character);
    soundManager.playClick();
    soundManager.playMusic('game');
    trackAnalytics('game_start', 'single');
    const engine = engineRef.current;
    engine.initGame({ mode: 'single', player1Name: playerName, player1Char: character.id });
    setPlayerMirror({ ...engine.players[0] });
    setTimeRemainingMirror(engine.timeRemaining);
    setStatus('playing');
  }, [playerName]);

  // Launch Multiplayer Match
  const handleLaunchMultiplayer = useCallback((config: {
    player1Name: string;
    player1Char: 'rambo_macho' | 'rambo_hembra' | 'exploradora';
    player2Name: string;
    player2Char: 'rambo_macho' | 'rambo_hembra' | 'exploradora';
  }) => {
    endHandledRef.current = false;
    soundManager.playClick();
    soundManager.playMusic('game');
    setMode('multiplayer');
    setShowMultiplayerLobby(false);

    trackAnalytics('game_start', 'multiplayer');

    const engine = engineRef.current;
    engine.initGame({
      mode: 'multiplayer',
      player1Name: config.player1Name,
      player1Char: config.player1Char,
      player2Name: config.player2Name,
      player2Char: config.player2Char,
    });

    setPlayerMirror({ ...engine.players[0] });
    setTimeRemainingMirror(engine.timeRemaining);
    setStatus('playing');
  }, []);

  // Return to Menu
  const handleQuitToMenu = useCallback(() => {
    soundManager.playClick();
    soundManager.playMusic('menu');
    setStatus('menu');
  }, []);

  // Resume after pause
  const handleResume = useCallback(() => {
    soundManager.playClick();
    setStatus('playing');
  }, []);

  // Restart current match
  const handleRestart = useCallback(() => {
    soundManager.playClick();
    soundManager.playMusic('game');
    const engine = engineRef.current;
    const previousPlayers = engine.players;
    const previousPlayer1 = previousPlayers[0];
    const previousPlayer2 = previousPlayers[1];
    endHandledRef.current = false;
    engine.initGame({
      mode,
      player1Name: previousPlayer1?.name || playerName,
      player1Char: previousPlayer1?.characterId || selectedCharacter.id,
      ...(mode === 'multiplayer' && previousPlayer2
        ? { player2Name: previousPlayer2.name, player2Char: previousPlayer2.characterId }
        : {}),
    });
    setPlayerMirror({ ...engine.players[0] });
    setTimeRemainingMirror(engine.timeRemaining);
    setStatus('playing');
  }, [mode, playerName, selectedCharacter]);

  // Victory Handler
  const handleVictory = useCallback(async () => {
    const engine = engineRef.current;
    const winner = engine.players.find((player) => player.id === engine.winnerPlayerId) ?? engine.players[0];
    const timeBonus = Math.floor(engine.timeRemaining * 10);
    const finalScore = winner ? winner.score + timeBonus : 0;

    if (winner) setPlayerMirror({ ...winner });
    setTimeRemainingMirror(engine.timeRemaining);
    trackAnalytics('game_victory', mode);

    if (winner) {
      await saveRankingScore({
        playerName: winner.name,
        score: finalScore,
        level: currentLevel,
        rescued: mode === 'single',
      });
    }

    setStatus('victory');
  }, [currentLevel, mode]);

  // Game Over Handler
  const handleGameOver = useCallback(async () => {
    const engine = engineRef.current;
    const p1 = engine.players[0];

    if (p1) setPlayerMirror({ ...p1 });
    setTimeRemainingMirror(engine.timeRemaining);
    trackAnalytics('game_over', mode);

    if (p1 && p1.score > 0) {
      await saveRankingScore({
        playerName: p1.name,
        score: p1.score,
        level: currentLevel,
        rescued: false,
      });
    }

    setStatus('gameover');
  }, [currentLevel, mode]);

  // Main Game Loop (Canvas updates & rendering)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render at 75% internal resolution while preserving the full logical
    // viewport and the same CSS display size. This reduces pixel work without
    // changing world coordinates, sprite sizes, or collision geometry.
    const renderScale = 0.75;
    if (!rendererRef.current) {
      ctx.scale(renderScale, renderScale);
      rendererRef.current = new GameRenderer(ctx);
    }

    const engine = engineRef.current;
    const renderer = rendererRef.current;

    const viewportW = 11 * TILE_SIZE;
    const viewportH = 17 * TILE_SIZE;

    let isRunning = true;
    let hudUpdateElapsed = 0;

    const gameLoop = (timestamp: number) => {
      if (!isRunning) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      if (status === 'playing') {
        engine.update(deltaTime, viewportW, viewportH);

        // The canvas runs every animation frame; React's HUD only needs
        // refreshing 10 times per second. Avoiding per-frame React renders
        // keeps larger sprites and tiles from making the game feel sluggish.
        hudUpdateElapsed += deltaTime;
        if (hudUpdateElapsed >= 0.1) {
          hudUpdateElapsed %= 0.1;
          // Freeze the displayed snapshot when an ending is triggered.
          // The ending handler selects the actual winner (including player 2).
          if (!engine.isVictory && !engine.isGameOver && engine.players[0]) {
            setPlayerMirror({ ...engine.players[0] });
            setTimeRemainingMirror(engine.timeRemaining);
          }
        }

        // Check victory or game over conditions
        if (engine.isVictory && status === 'playing' && !endHandledRef.current) {
          endHandledRef.current = true;
          void handleVictory();
        } else if (engine.isGameOver && status === 'playing' && !endHandledRef.current) {
          endHandledRef.current = true;
          void handleGameOver();
        }
      }

      // Render world
      renderer.render({
        grid: engine.grid,
        players: engine.players,
        enemies: engine.enemies,
        bombs: engine.bombs,
        explosions: engine.explosions,
        pickups: engine.pickups,
        trappedAnimals: engine.trappedAnimals,
        floatingTexts: engine.floatingTexts,
        cameraX: engine.cameraX,
        viewportWidth: viewportW,
        viewportHeight: viewportH,
        hasKey: engine.players[0]?.hasKey || false,
        isCageUnlocked: engine.isCageUnlocked,
        deltaTime,
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [status, handleVictory, handleGameOver]);

  // Keyboard Controls (WASD / Arrows, Space, E, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      const engine = engineRef.current;

      // P1 Controls
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.movePlayer('p1', 'UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        engine.movePlayer('p1', 'DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.movePlayer('p1', 'LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.movePlayer('p1', 'RIGHT');
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        engine.placeBomb('p1');
      } else if (e.key === 'e' || e.key === 'E') {
        engine.triggerRemoteBomb('p1');
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setStatus('paused');
      }

      // P2 Controls in Multiplayer Mode (IJKL + Enter)
      if (mode === 'multiplayer') {
        if (e.key === 'i' || e.key === 'I') {
          engine.movePlayer('p2', 'UP');
        } else if (e.key === 'k' || e.key === 'K') {
          engine.movePlayer('p2', 'DOWN');
        } else if (e.key === 'j' || e.key === 'J') {
          engine.movePlayer('p2', 'LEFT');
        } else if (e.key === 'l' || e.key === 'L') {
          engine.movePlayer('p2', 'RIGHT');
        } else if (e.key === 'Enter') {
          engine.placeBomb('p2');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, mode]);

  // Swipe gesture detection on Canvas for mobile players
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (status !== 'playing') return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (status !== 'playing' || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 25; // min swipe pixels
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) {
        engineRef.current.movePlayer('p1', 'RIGHT');
      } else if (dx < -threshold) {
        engineRef.current.movePlayer('p1', 'LEFT');
      }
    } else {
      if (dy > threshold) {
        engineRef.current.movePlayer('p1', 'DOWN');
      } else if (dy < -threshold) {
        engineRef.current.movePlayer('p1', 'UP');
      }
    }
  };

  // If Admin route requested
  if (status === 'admin') {
    return (
      <AdminDashboard
        onBackToGame={() => {
          setStatus('menu');
        }}
      />
    );
  }

  if (status === 'sprite_debug') {
    return <SpriteAtlasInspector onClose={() => setStatus('menu')} />;
  }

  const viewportW = 11 * TILE_SIZE;
  const viewportH = 17 * TILE_SIZE;
  const canvasRenderScale = 0.75;

  return (
    <main className="w-full h-screen h-[100dvh] flex items-center justify-center bg-stone-950 overflow-hidden select-none">
      {/* 9:16 Vertical Screen Frame (Mobile-First Viewport in PC with themed borders) */}
      <div className="relative h-full aspect-[9/16] max-h-screen max-w-full flex flex-col items-center justify-center overflow-hidden shadow-2xl border-x-4 border-amber-950/80 bg-black">
        {/* =========================================
            LAYER 1: GAME CANVAS (Continuous rendering)
            ========================================= */}
        <canvas
          ref={canvasRef}
          width={Math.round(viewportW * canvasRenderScale)}
          height={Math.round(viewportH * canvasRenderScale)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full object-fill block bg-transparent"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* =========================================
            LAYER 2: REACT HUD (TOP 10% OVERLAY)
            ========================================= */}
        {playerMirror && status === 'playing' && (
          <HUD
            player={playerMirror}
            timeRemaining={timeRemainingMirror}
            currentLevel={currentLevel}
            volumeLevel={volumeLevel}
            onCycleVolume={handleCycleVolume}
            onPause={() => setStatus('paused')}
            onUseInventorySlot={(slotIndex) => {
              engineRef.current.useInventorySlot('p1', slotIndex);
              const activePlayer = engineRef.current.players[0];
              if (activePlayer) setPlayerMirror({ ...activePlayer, inventory: [...activePlayer.inventory] });
            }}
          />
        )}


        {/* =========================================
            LAYER 4: START SCREEN OVERLAY
            ========================================= */}
        {status === 'menu' && (
          <div className="absolute inset-0 z-30">
            <StartScreen
              volumeLevel={volumeLevel}
              onCycleVolume={handleCycleVolume}
              onOpenContact={() => setShowContact(true)}
              onStartSinglePlayer={handleStartSinglePlayerPrompt}
              onOpenMultiplayer={() => setShowMultiplayerLobby(true)}
              onOpenRanking={() => setShowTop50(true)}
              onOpenAdmin={() => setStatus('admin')}
            />
          </div>
        )}

        {/* =========================================
            LAYER 5: REACT MODALS
            ========================================= */}
        {/* 1. Mandatory Name Input Modal before playing */}
        {status === 'name_input' && (
          <NameInputModal
            initialName={playerName}
            onConfirm={handleLaunchGame}
            onCancel={() => setStatus('menu')}
          />
        )}

        {/* 2. Character selection happens after name entry and before game initialization. */}
        {status === 'character_select' && (
          <CharacterSelectModal
            selectedId={selectedCharacter.id}
            onSelect={handleConfirmCharacter}
            onClose={() => setStatus('name_input')}
          />
        )}

        {/* 3. Multiplayer Lobby Modal */}
        {showMultiplayerLobby && (
          <MultiplayerLobbyModal
            onStartMatch={handleLaunchMultiplayer}
            onClose={() => setShowMultiplayerLobby(false)}
          />
        )}

        {/* 4. How To Play Modal */}
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}

        {/* 5. Contact Modal */}
        {showContact && (
          <ContactModal onClose={() => setShowContact(false)} />
        )}

        {/* 6. Top 50 Rankings Modal */}
        {showTop50 && (
          <Top50Modal onClose={() => setShowTop50(false)} />
        )}

        {/* 7. Pause Modal */}
        {status === 'paused' && (
          <PauseModal
            onResume={handleResume}
            onRestart={handleRestart}
            onQuitToMenu={handleQuitToMenu}
          />
        )}

        {/* 8. Victory Modal */}
        {status === 'victory' && playerMirror && (
          <VictoryModal
            player={playerMirror}
            timeRemaining={timeRemainingMirror}
            mode={mode}
            onRestart={handleRestart}
            onQuitToMenu={handleQuitToMenu}
          />
        )}

        {/* 9. Game Over Modal */}
        {status === 'gameover' && playerMirror && (
          <GameOverModal
            player={playerMirror}
            onRestart={handleRestart}
            onQuitToMenu={handleQuitToMenu}
          />
        )}
      </div>
    </main>
  );
}
