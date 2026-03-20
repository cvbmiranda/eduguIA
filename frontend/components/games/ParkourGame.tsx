import React, { useEffect, useRef, useState } from 'react';

interface ParkourGameProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  salvarPerfilNoBanco: (dados: any) => void;
  setHudDisplay: React.Dispatch<React.SetStateAction<any>>;
  showToast: (msg: string, type?: "success" | "error" | "warning") => void;
}

export const ParkourGame: React.FC<ParkourGameProps> = ({
  abaAtiva, setAbaAtiva, salvarPerfilNoBanco, setHudDisplay, showToast
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null!);
  
  const pkRefs = {
    fase: useRef<HTMLDivElement>(null), moedas: useRef<HTMLDivElement>(null),
    tentativas: useRef<HTMLDivElement>(null), tempo: useRef<HTMLDivElement>(null),
    mortes: useRef<HTMLDivElement>(null), pulos: useRef<HTMLDivElement>(null),
    resDisplay: useRef<HTMLDivElement>(null), resValue: useRef<HTMLDivElement>(null)
  };

  const [pkModal, setPkModal] = useState<{show: boolean, type: string, data?: any}>({ show: false, type: '' });
  const pkEngine = useRef<any>({}); 

  useEffect(() => {
    if (abaAtiva !== 'parkour') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Mapas originais
    const MAPS = [
      { id: 1, rawData: [{"type":"wall","x":50,"y":250,"w":20,"h":100},{"type":"wall","x":100,"y":180,"w":20,"h":100},{"type":"platform","x":100,"y":320,"w":70,"h":20},{"type":"platform","x":170,"y":320,"w":70,"h":20},{"type":"platform","x":250,"y":430,"w":70,"h":20},{"type":"platform","x":320,"y":430,"w":70,"h":20},{"type":"platform","x":60,"y":500,"w":70,"h":20},{"type":"platform","x":130,"y":500,"w":70,"h":20},{"type":"coin","x":140,"y":290,"w":20,"h":20},{"type":"death","x":0,"y":630,"w":1400,"h":20},{"type":"player","x":70,"y":380,"w":28,"h":36},{"type":"platform","x":480,"y":380,"w":70,"h":20},{"type":"platform","x":550,"y":380,"w":70,"h":20},{"type":"goal","x":900,"y":260,"w":60,"h":20},{"type":"platform","x":680,"y":320,"w":70,"h":20},{"type":"platform","x":750,"y":320,"w":70,"h":20},{"type":"enemy","x":450,"y":280,"w":28,"h":28,"dir":"horizontal","range":240, "speed": 2.25, "id": 1}] },
      { id: 2, rawData: [{"type":"death","x":0,"y":630,"w":1400,"h":20},{"type":"platform","x":50,"y":500,"w":70,"h":20},{"type":"platform","x":120,"y":500,"w":70,"h":20},{"type":"platform","x":250,"y":440,"w":70,"h":20},{"type":"platform","x":320,"y":440,"w":70,"h":20},{"type":"platform","x":100,"y":360,"w":70,"h":20},{"type":"platform","x":40,"y":360,"w":70,"h":20},{"type":"wall","x":20,"y":300,"w":20,"h":80},{"type":"wall","x":100,"y":280,"w":20,"h":80},{"type":"coin","x":70,"y":320,"w":20,"h":20},{"type":"platform","x":460,"y":380,"w":70,"h":20},{"type":"platform","x":530,"y":380,"w":70,"h":20},{"type":"platform","x":430,"y":520,"w":70,"h":20},{"type":"platform","x":500,"y":520,"w":70,"h":20},{"type":"slide","x":570,"y":520,"w":70,"h":20},{"type":"slide","x":640,"y":520,"w":70,"h":20},{"type":"coin","x":670,"y":480,"w":20,"h":20},{"type":"player","x":60,"y":420,"w":28,"h":36},{"type":"platform","x":660,"y":320,"w":70,"h":20},{"type":"platform","x":730,"y":320,"w":70,"h":20},{"type":"goal","x":870,"y":270,"w":60,"h":20},{"type":"enemy","x":360,"y":320,"w":28,"h":28,"dir":"horizontal","range":400, "speed": 10.8, "id": 1}] },
      { id: 3, rawData: [{"type":"death","x":0,"y":630,"w":1400,"h":20},{"type":"platform","x":50,"y":500,"w":70,"h":20},{"type":"platform","x":120,"y":500,"w":70,"h":20},{"type":"platform","x":250,"y":440,"w":70,"h":20},{"type":"platform","x":320,"y":440,"w":70,"h":20},{"type":"platform","x":100,"y":360,"w":70,"h":20},{"type":"platform","x":40,"y":360,"w":70,"h":20},{"type":"wall","x":20,"y":300,"w":20,"h":80},{"type":"wall","x":100,"y":280,"w":20,"h":80},{"type":"coin","x":70,"y":320,"w":20,"h":20},{"type":"platform","x":460,"y":380,"w":70,"h":20},{"type":"platform","x":530,"y":380,"w":70,"h":20},{"type":"platform","x":430,"y":520,"w":70,"h":20},{"type":"platform","x":500,"y":520,"w":70,"h":20},{"type":"slide","x":570,"y":520,"w":70,"h":20},{"type":"slide","x":640,"y":520,"w":70,"h":20},{"type":"coin","x":670,"y":480,"w":20,"h":20},{"type":"player","x":60,"y":420,"w":28,"h":36},{"type":"platform","x":660,"y":320,"w":70,"h":20},{"type":"platform","x":730,"y":320,"w":70,"h":20},{"type":"goal","x":870,"y":270,"w":60,"h":20},{"type":"enemy","x":360,"y":270,"w":28,"h":28,"dir":"horizontal","range":600, "speed": 12.0, "id": 1},{"type":"wall","x":540,"y":460,"w":20,"h":80},{"type":"wall","x":540,"y":380,"w":20,"h":80},{"type":"wall","x":540,"y":300,"w":20,"h":80},{"type":"platform","x":550,"y":380,"w":70,"h":20},{"type":"platform","x":590,"y":440,"w":70,"h":20},{"type":"platform","x":1200,"y":30,"w":70,"h":20},{"type":"enemy","x":420,"y":440,"w":28,"h":28,"dir":"vertical","range":150, "speed": 2.7, "id": 3}] },
      { id: 4, rawData: [{"type":"player","x":80,"y":520,"w":35,"h":35},{"type":"platform","x":40,"y":540,"w":100,"h":12},{"type":"platform","x":250,"y":510,"w":100,"h":12},{"type":"platform","x":30,"y":410,"w":100,"h":12},{"type":"platform","x":130,"y":410,"w":50,"h":12},{"type":"wall","x":30,"y":320,"w":12,"h":100},{"type":"wall","x":100,"y":320,"w":12,"h":100},{"type":"coin","x":50,"y":380,"w":25,"h":25},{"type":"platform","x":450,"y":540,"w":100,"h":12},{"type":"platform","x":490,"y":540,"w":100,"h":12},{"type":"wall","x":540,"y":450,"w":12,"h":100},{"type":"slide","x":540,"y":540,"w":120,"h":12},{"type":"slide","x":570,"y":540,"w":120,"h":12},{"type":"death","x":0,"y":630,"w":1400,"h":30},{"type":"platform","x":500,"y":460,"w":120,"h":12},{"type":"wall","x":540,"y":400,"w":12,"h":100},{"type":"coin","x":500,"y":500,"w":25,"h":25},{"type":"coin","x":570,"y":500,"w":25,"h":25},{"type":"platform","x":710,"y":410,"w":100,"h":12},{"type":"platform","x":940,"y":390,"w":120,"h":12},{"type":"slide","x":780,"y":280,"w":100,"h":12},{"type":"slide","x":730,"y":280,"w":100,"h":12},{"type":"slide","x":680,"y":280,"w":100,"h":12},{"type":"slide","x":630,"y":280,"w":100,"h":12},{"type":"slide","x":580,"y":280,"w":100,"h":12},{"type":"slide","x":650,"y":200,"w":100,"h":12},{"type":"slide","x":710,"y":200,"w":100,"h":12},{"type":"coin","x":700,"y":170,"w":25,"h":25},{"type":"platform","x":420,"y":260,"w":100,"h":12},{"type":"slide","x":190,"y":210,"w":100,"h":12},{"type":"goal","x":40,"y":140,"w":40,"h":40},{"type":"enemy","x":370,"y":420,"w":25,"h":25,"dir":"vertical","range":160, "speed": 3.0, "id": 1},{"type":"enemy","x":200,"y":370,"w":25,"h":25,"dir":"vertical","range":160, "speed": 2.8, "id": 2},{"type":"enemy","x":720,"y":250,"w":25,"h":25,"dir":"horizontal","range":160, "speed": 3.2, "id": 3}] },
      { id: 5, rawData: [{"type":"player","x":80,"y":520,"w":35,"h":35},{"type":"platform","x":40,"y":540,"w":100,"h":12},{"type":"platform","x":250,"y":510,"w":100,"h":12},{"type":"platform","x":30,"y":410,"w":100,"h":12},{"type":"platform","x":130,"y":410,"w":50,"h":12},{"type":"wall","x":30,"y":320,"w":12,"h":100},{"type":"wall","x":100,"y":320,"w":12,"h":100},{"type":"coin","x":50,"y":380,"w":25,"h":25},{"type":"platform","x":450,"y":540,"w":100,"h":12},{"type":"platform","x":490,"y":540,"w":100,"h":12},{"type":"wall","x":540,"y":450,"w":12,"h":100},{"type":"slide","x":540,"y":540,"w":120,"h":12},{"type":"slide","x":570,"y":540,"w":120,"h":12},{"type":"death","x":0,"y":630,"w":1400,"h":30},{"type":"platform","x":500,"y":460,"w":120,"h":12},{"type":"wall","x":540,"y":400,"w":12,"h":100},{"type":"coin","x":500,"y":500,"w":25,"h":25},{"type":"coin","x":570,"y":500,"w":25,"h":25},{"type":"platform","x":710,"y":410,"w":100,"h":12},{"type":"platform","x":940,"y":390,"w":120,"h":12},{"type":"slide","x":780,"y":280,"w":100,"h":12},{"type":"slide","x":730,"y":280,"w":100,"h":12},{"type":"slide","x":680,"y":280,"w":100,"h":12},{"type":"slide","x":630,"y":280,"w":100,"h":12},{"type":"slide","x":580,"y":280,"w":100,"h":12},{"type":"slide","x":650,"y":200,"w":100,"h":12},{"type":"slide","x":710,"y":200,"w":100,"h":12},{"type":"coin","x":700,"y":170,"w":25,"h":25},{"type":"platform","x":420,"y":260,"w":100,"h":12},{"type":"slide","x":190,"y":210,"w":100,"h":12},{"type":"goal","x":1180,"y":80,"w":80,"h":30},{"type":"enemy","x":370,"y":420,"w":25,"h":25,"dir":"vertical","range":160, "speed": 3.0, "id": 1},{"type":"enemy","x":200,"y":370,"w":25,"h":25,"dir":"vertical","range":160, "speed": 2.8, "id": 2},{"type":"enemy","x":720,"y":250,"w":25,"h":25,"dir":"horizontal","range":160, "speed": 3.2, "id": 3},{"type":"slide","x":790,"y":540,"w":300,"h":12},{"type":"wall","x":880,"y":100,"w":12,"h":90},{"type":"coin","x":60,"y":120,"w":25,"h":25},{"type":"coin","x":1070,"y":500,"w":25,"h":25},{"type":"slide","x":880,"y":180,"w":50,"h":12}] }
    ];

    let currentPhase = 0;
    let player = { x: 0, y: 0, width: 30, height: 40, velocityX: 0, velocityY: 0, speed: 5, jumpForce: 10.4, isGrounded: false, color: '#4299e1', isOnSlide: false, isDead: false };
    let coins: any[] = [], enemies: any[] = [], platforms: any[] = [], goal: any = null;
    let coinsCollected = 0, totalCoins = 0, attempts = 0, startTime = 0, gameTime = 0, isGameRunning = true, keys: any = {};
    
    let globalResilienceData = { allAttempts: [] as any[], phaseTimes: {} as any, phaseAttempts: {} as any, phaseDeaths: {} as any, phaseCoins: {} as any };
    let attemptData: any[] = [], currentAttemptStart = 0, currentAttemptSequence: any[] = [], currentAttemptMaxHeight = 0, currentAttemptJumpTime: any = null, currentAttemptStartX = 0, currentAttemptStartY = 0, isImpulsiveAttempt = false, phaseStartTime = 0;
    let stats = { totalDeaths: 0, skippedPhases: 0, totalJumps: 0, totalMovements: 0 };

    function loadPhase(phaseIndex: number) {
        currentPhase = phaseIndex;
        const rawData = MAPS[phaseIndex].rawData;
        platforms = []; coins = []; enemies = []; goal = null;
        let coinId = 1;
        
        rawData.forEach((item: any) => {
            if(item.type === "player") {
                player.x = item.x; player.y = item.y; player.width = item.w || 28; player.height = item.h || 36;
                player.velocityX = 0; player.velocityY = 0; player.isGrounded = false; player.isOnSlide = false; player.isDead = false;
            } else if(item.type === "coin") {
                coins.push({ ...item, w: item.w || 20, h: item.h || 20, collected: false, id: coinId++ });
            } else if(item.type === "enemy") {
                enemies.push({ ...item, w: item.w || 28, h: item.h || 28, startX: item.x, startY: item.y, range: item.range || 80, speed: item.speed || 1.5, direction: 1, movement: item.dir || "horizontal", id: item.id || 1 });
            } else if(item.type === "goal") {
                goal = { ...item, w: item.w || 60, h: item.h || 20, active: false, completed: false };
            } else {
                platforms.push({ ...item, w: item.w || 70, h: item.h || 20 });
            }
        });
        
        totalCoins = coins.length; coinsCollected = 0; attempts = 0; startTime = Date.now();
        attemptData = []; phaseStartTime = Date.now(); currentAttemptStart = Date.now();
        currentAttemptSequence = []; currentAttemptMaxHeight = player.y; currentAttemptJumpTime = null;
        currentAttemptStartX = player.x; currentAttemptStartY = player.y; isImpulsiveAttempt = false;
        updateUI();
    }

    function updateUI() {
        if(pkRefs.fase.current) pkRefs.fase.current.textContent = `${currentPhase + 1} / ${MAPS.length}`;
        if(pkRefs.moedas.current) pkRefs.moedas.current.textContent = `${coinsCollected} / ${totalCoins}`;
        if(pkRefs.tentativas.current) pkRefs.tentativas.current.textContent = String(attempts);
        if(pkRefs.tempo.current) pkRefs.tempo.current.textContent = `${gameTime}s`;
        if(pkRefs.mortes.current) pkRefs.mortes.current.textContent = String(stats.totalDeaths);
        if(pkRefs.pulos.current) pkRefs.pulos.current.textContent = String(stats.skippedPhases);
        
        const resilience = calculateResilienceIndex();
        if (attempts > 0 && pkRefs.resDisplay.current && pkRefs.resValue.current) {
            pkRefs.resDisplay.current.style.display = 'block';
            pkRefs.resValue.current.textContent = `${(resilience.R * 100).toFixed(1)}%`;
        }
    }

    function recordAttemptEnd(success: boolean) {
        const now = Date.now(); const attemptTime = now - currentAttemptStart;
        attemptData.push({ duration: attemptTime, dx: Math.abs(player.x - currentAttemptStartX), dy: Math.abs(currentAttemptMaxHeight - player.y), jumpTime: currentAttemptJumpTime, impulsive: (attemptTime < 1500) });
        currentAttemptStart = now; currentAttemptSequence = []; currentAttemptMaxHeight = player.y; currentAttemptJumpTime = null; currentAttemptStartX = player.x; isImpulsiveAttempt = (attemptTime < 1500);
    }

    function calculateResilienceIndex() {
        if (attemptData.length === 0) return { R: 0, A: 0, C: 0, T: 0, D: 0 };
        const F = attemptData.length; const phaseActiveTime = (Date.now() - phaseStartTime) / 1000;
        let adaptiveAttempts = 0; let impulsiveAttempts = 0;
        
        for (let i = 1; i < F; i++) {
            if (Math.abs(attemptData[i].dx - attemptData[i-1].dx) > 20 || Math.abs(attemptData[i].dy - attemptData[i-1].dy) > 15 || Math.abs((attemptData[i].jumpTime || 0) - (attemptData[i-1].jumpTime || 0)) > 0.2) adaptiveAttempts++;
        }
        attemptData.forEach(a => { if (a.impulsive) impulsiveAttempts++; });
        
        const A = (F > 1) ? adaptiveAttempts / (F - 1) : 0;
        const C = 1 - (impulsiveAttempts / Math.max(1, F));
        const T = Math.min(1, phaseActiveTime / ( [30, 45, 60, 90, 120][currentPhase] || 60 ));
        let D = currentPhase !== 4 ? 1 - Math.tanh(phaseActiveTime / (F + 1)) : 0;
        
        const R = 0.35 * A + 0.25 * C + 0.25 * T - 0.15 * D;
        return { R: Math.max(0, Math.min(1, R)), A, C, T, D };
    }

    function calculateGlobalResilienceIndex() {
        if (globalResilienceData.allAttempts.length === 0) return { R: 0, A: 0, C: 0, T: 0, D: 0 };
        const F = globalResilienceData.allAttempts.length;
        const totalGameTime = Object.values(globalResilienceData.phaseTimes).reduce((a:any, b:any) => a + b, 0) as number;
        
        let adaptiveAttempts = 0; let impulsiveAttempts = 0;
        for (let i = 1; i < F; i++) {
            if (Math.abs(globalResilienceData.allAttempts[i].dx - globalResilienceData.allAttempts[i - 1].dx) > 20) adaptiveAttempts++;
        }
        globalResilienceData.allAttempts.forEach(a => { if (a.impulsive) impulsiveAttempts++; });
        
        const A = (F > 1) ? adaptiveAttempts / (F - 1) : 0;
        const C = 1 - (impulsiveAttempts / Math.max(1, F));
        const T = Math.max(0, Math.min(1, totalGameTime / 345) - (stats.skippedPhases * 0.1));
        
        let D = 0; const avgTime = totalGameTime / (F + 5);
        if (avgTime < 10) D = 1 - (avgTime / 10);
        D = Math.min(1, D + (stats.skippedPhases * 0.15));
        
        const R = 0.35 * A + 0.25 * C + 0.25 * T - 0.15 * D;
        return { R: Math.max(0, Math.min(1, R)), A, C, T, D };
    }

    function update() {
        if (!isGameRunning || player.isDead || (goal && goal.completed)) return;
        
        if (player.y < currentAttemptMaxHeight) currentAttemptMaxHeight = player.y;
        if (keys['jump'] && currentAttemptJumpTime === null) currentAttemptJumpTime = gameTime;
        gameTime = Math.floor((Date.now() - startTime) / 1000);

        if (keys['left']) player.velocityX = -player.speed;
        else if (keys['right']) player.velocityX = player.speed;
        else player.velocityX *= 0.85;

        if (player.isOnSlide && player.isGrounded) player.velocityX += 0.8 * (player.velocityX > 0 ? 1 : -1);
        if (Math.abs(player.velocityX) > 8) player.velocityX = 8 * (player.velocityX > 0 ? 1 : -1);
        
        if (keys['jump'] && player.isGrounded) { player.velocityY = -player.jumpForce; player.isGrounded = false; keys['jump'] = false; }
        
        player.x += player.velocityX; player.velocityY += 0.5; player.y += player.velocityY;
        
        player.x = Math.max(10, Math.min((canvas?.width || 1300) - player.width - 10, player.x));
        
        enemies.forEach(e => {
            if (e.movement === "horizontal") { e.x += e.speed * e.direction; if (e.x > e.startX + e.range || e.x < e.startX - e.range) e.direction *= -1; }
            else { e.y += e.speed * e.direction; if (e.y > e.startY + e.range || e.y < e.startY - e.range) e.direction *= -1; }
        });

        checkCollisions();
        
        if (goal && goal.active && !goal.completed && 
            player.x <= goal.x + goal.w && 
            player.x + player.width >= goal.x && 
            player.y <= goal.y + goal.h && 
            player.y + player.height >= goal.y) {
            
            goal.completed = true; 
            completePhase();
        }
        
        if (gameTime % 2 === 0) updateUI();
    }

    function checkCollisions() {
        player.isGrounded = false; player.isOnSlide = false;
        
        const solids = [...platforms];
        if (goal) solids.push({ x: goal.x, y: goal.y, w: goal.w, h: goal.h, type: 'platform' });

        solids.forEach(p => {
            if (player.x < p.x + p.w && player.x + player.width > p.x && player.y < p.y + p.h && player.y + player.height > p.y) {
                if (p.type === "death" && !player.isDead) return playerDie();
                
                if (player.velocityY > 0 && player.y + player.height > p.y && player.y < p.y && player.x + player.width > p.x + 5 && player.x < p.x + p.w - 5) {
                    player.y = p.y - player.height; player.velocityY = 0; player.isGrounded = true;
                    if (p.type === "slide") player.isOnSlide = true;
                } else if (player.velocityY < 0 && player.y < p.y + p.h && player.y + player.height > p.y + p.h) {
                    player.y = p.y + p.h; player.velocityY = 0;
                }
                
                if (p.type === "wall") {
                    if (player.velocityX > 0 && player.x + player.width > p.x && player.x < p.x && player.y + player.height > p.y + 5 && player.y < p.y + p.h - 5) { 
                        player.x = p.x - player.width; player.velocityX = 0; 
                    }
                    else if (player.velocityX < 0 && player.x < p.x + p.w && player.x + player.width > p.x + p.w && player.y + player.height > p.y + 5 && player.y < p.y + p.h - 5) { 
                        player.x = p.x + p.w; player.velocityX = 0; 
                    }
                }
            }
        });
        
        coins.forEach(c => { 
            if (!c.collected && player.x < c.x + c.w && player.x + player.width > c.x && player.y < c.y + c.h && player.y + player.height > c.y) { 
                c.collected = true; coinsCollected++; 
                if(coinsCollected === totalCoins && goal) goal.active = true; 
                updateUI(); 
            }
        });
        
        if (!player.isDead) enemies.forEach(e => { if (player.x < e.x + e.w && player.x + player.width > e.x && player.y < e.y + e.h && player.y + player.height > e.y) playerDie(); });
        
        if (canvas && player.y > (canvas.height || 650) + 50 && !player.isDead) playerDie();
    }

    function playerDie() {
        player.isDead = true; attempts++; stats.totalDeaths++; recordAttemptEnd(false);
        setPkModal({ show: true, type: 'death', data: { attempts, deaths: stats.totalDeaths } });
    }

    function completePhase() {
        recordAttemptEnd(true);
        globalResilienceData.allAttempts = globalResilienceData.allAttempts.concat(attemptData);
        globalResilienceData.phaseTimes[currentPhase + 1] = gameTime;
        
        // 👇 AQUI! Se for a Fase 5, MOSTRA O MODAL DE REVELAÇÃO em vez de pular direto
        if (currentPhase === 4) { 
            const gRes = calculateGlobalResilienceIndex();
            setPkModal({ show: true, type: 'impossible', data: { time: gameTime, att: attempts, res: (gRes.R*100).toFixed(1) } });
        } else {
            setPkModal({ show: true, type: 'victory', data: { time: gameTime, att: attempts } });
        }
    }

    pkEngine.current = {
        restart: () => { setPkModal({show: false, type: ''}); loadPhase(currentPhase); },
        skip: () => { 
            stats.skippedPhases++; 
            // 👇 AQUI! Se pular na Fase 5, MOSTRA O MODAL em vez de chamar next() direto
            if (currentPhase === 4) {
                const gRes = calculateGlobalResilienceIndex();
                setPkModal({ show: true, type: 'impossible', data: { time: gameTime, att: attempts, res: (gRes.R*100).toFixed(1) } });
            } else {
                loadPhase(currentPhase + 1); 
            }
        },
        next: () => {
            setPkModal({show: false, type: ''});
            if (currentPhase < MAPS.length - 1) {
                loadPhase(currentPhase + 1);
            } else {
                // Ao clicar em "Finalizar e Gerar Perfil" no Modal, ele calcula a nota e vai para a aba Progresso
                const finalR = calculateGlobalResilienceIndex();
                let rawScore = finalR.R * 5;
                if (rawScore < 1.5) rawScore = 1.5 + Math.random(); 
                const convertedScore = rawScore.toFixed(1); 
                
                salvarPerfilNoBanco({ 
                  psico_resiliencia: convertedScore
                });

                setHudDisplay((prev: any) => ({ ...prev, scoreResiliencia: convertedScore }));
                setAbaAtiva("progresso");
                showToast(`✅ Avaliação concluída! Score: ${convertedScore}/5.0`, "success");
            }
        }
    };

    function draw() {
        if (!ctx) return;
        ctx.fillStyle = '#1a202c'; 
        ctx.fillRect(0, 0, canvas?.width || 1300, canvas?.height || 650);
        platforms.forEach(p => {
            ctx.fillStyle = p.type === 'death' ? '#e53e3e' : p.type === 'slide' ? '#d69e2e' : p.type === 'wall' ? '#4a5568' : '#48bb78';
            ctx.fillRect(p.x, p.y, p.w, p.h);
            if(p.type === 'slide') { ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(p.x+5, p.y+5, p.w-10, 3); }
        });
        coins.forEach(c => { if(!c.collected) { ctx.fillStyle = '#f6e05e'; ctx.beginPath(); ctx.arc(c.x+c.w/2, c.y+c.h/2, c.w/2, 0, Math.PI*2); ctx.fill(); }});
        enemies.forEach(e => { ctx.fillStyle = '#e53e3e'; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.fillStyle = '#fff'; ctx.fillRect(e.x+6, e.y+6, 5, 5); ctx.fillRect(e.x+e.w-11, e.y+6, 5, 5); });
        
        if(goal) { ctx.fillStyle = goal.active ? (Math.sin(Date.now()/200)>0?'#38a169':'#48bb78') : '#718096'; ctx.fillRect(goal.x, goal.y, goal.w, goal.h); }
        
        if(!player.isDead) { ctx.fillStyle = player.color; ctx.fillRect(player.x, player.y, player.width, player.height); }
    }

    function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

    const handleKeyDown = (e:any) => { const k=e.key.toLowerCase(); if(['a','arrowleft'].includes(k)) keys['left']=true; if(['d','arrowright'].includes(k)) keys['right']=true; if(['w','arrowup',' '].includes(k)) keys['jump']=true; if(k==='r') pkEngine.current.restart(); e.preventDefault(); };
    const handleKeyUp = (e:any) => { const k=e.key.toLowerCase(); if(['a','arrowleft'].includes(k)) keys['left']=false; if(['d','arrowright'].includes(k)) keys['right']=false; if(['w','arrowup',' '].includes(k)) keys['jump']=false; };
    
    window.addEventListener('keydown', handleKeyDown, {passive: false}); window.addEventListener('keyup', handleKeyUp);
    loadPhase(0); gameLoop();

    return () => {
        isGameRunning = false; window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [abaAtiva]);

  return (
    <section className="card" style={{ padding: "0", background: "#f7fafc", overflow: "hidden" }}>
      <style>{`
        .pk-btn { padding: 10px 15px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; width: 100%; margin-bottom: 8px;}
        .pk-btn-danger { background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; }
        .pk-btn-sec { background: #e2e8f0; color: #4a5568; }
        .pk-btn-primary { background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; }
        .pk-modal { position: absolute; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .pk-modal-content { background: white; padding: 25px; border-radius: 12px; text-align: center; width: 90%; max-width: 400px; }
      `}</style>

      {/* 👇 LAYOUT RESPONSIVO SEM CORTES: Usando flexWrap sem altura fixa e com aspectRatio no canvas */}
      <div style={{ display: "flex", flexWrap: "wrap", width: "100%", background: "#2d3748", borderRadius: "8px" }}>
        
        {/* ÁREA DO CANVAS (ESTICA COM BASE NA LARGURA, MANTENDO A PROPORÇÃO) */}
        <div style={{ flex: "1 1 70%", minWidth: "320px", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          
          <canvas 
            ref={canvasRef} 
            width="1300" 
            height="650" 
            style={{ width: "100%", height: "auto", display: "block", aspectRatio: "2/1", borderRight: "4px solid #1a202c" }} 
          />
          
          {pkModal.show && pkModal.type === 'death' && (
            <div className="pk-modal">
              <div className="pk-modal-content">
                <h2 style={{color: "#e53e3e", marginBottom: "10px", fontSize: "24px"}}>💀 Você Morreu!</h2>
                <p style={{marginBottom: "15px", color: "#718096"}}>Tentativa atual: {pkModal.data.attempts} | Mortes totais: {pkModal.data.deaths}</p>
                <button className="pk-btn pk-btn-primary" onClick={() => pkEngine.current.restart()}>Tentar Novamente</button>
              </div>
            </div>
          )}
          {pkModal.show && pkModal.type === 'victory' && (
            <div className="pk-modal">
              <div className="pk-modal-content">
                <h2 style={{color: "#38a169", marginBottom: "10px", fontSize: "24px"}}>🏆 Fase Concluída!</h2>
                <p style={{marginBottom: "15px", color: "#718096"}}>Tentativas: {pkModal.data.att} | Tempo: {pkModal.data.time}s</p>
                <button className="pk-btn pk-btn-primary" onClick={() => pkEngine.current.next()}>Próxima Fase</button>
              </div>
            </div>
          )}
          {pkModal.show && pkModal.type === 'impossible' && (
            <div className="pk-modal">
              <div className="pk-modal-content">
                <h2 style={{color: "#d69e2e", marginBottom: "10px", fontSize: "24px"}}>🎯 Análise Concluída</h2>
                <p style={{marginBottom: "15px", color: "#718096"}}>Tempo: {pkModal.data.time}s | Tentativas: {pkModal.data.att}</p>
                <div style={{ padding: "10px", background: "rgba(229, 62, 62, 0.1)", border: "2px solid #e53e3e", borderRadius: "8px", marginBottom: "15px", color: "#e53e3e", fontWeight: "bold" }}>
                  REVELAÇÃO: Esta fase era impossível! Sua reação foi analisada.
                </div>
                {/* 👇 SÓ QUANDO CLICA AQUI É QUE SALVA E VAI PRO PROGRESSO */}
                <button className="pk-btn pk-btn-primary" onClick={() => pkEngine.current.next()}>Finalizar e Gerar Perfil</button>
              </div>
            </div>
          )}
        </div>

        {/* ÁREA DA BARRA LATERAL (VAI PARA BAIXO SE A TELA ESTREITAR) */}
        <div style={{ flex: "1 1 300px", padding: "15px", background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)", color: "#2d3748" }}>
          <div style={{ background: "white", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #4299e1", marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>PARKOUR EDUGUIA</div>
            <div style={{ fontSize: "12px", color: "#718096" }}>Avaliação de Resiliência</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "15px" }}>
            <div style={{ background: "white", padding: "8px", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: "10px", color: "#718096" }}>Fase Atual</div>
              <strong ref={pkRefs.fase} style={{ fontSize: "16px" }}>1 / 5</strong>
            </div>
            <div style={{ background: "white", padding: "8px", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: "10px", color: "#718096" }}>Moedas</div>
              <strong ref={pkRefs.moedas} style={{ fontSize: "16px" }}>0 / 0</strong>
            </div>
            <div style={{ background: "white", padding: "8px", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: "10px", color: "#718096" }}>Tentativas</div>
              <strong ref={pkRefs.tentativas} style={{ fontSize: "16px" }}>0</strong>
            </div>
            <div style={{ background: "white", padding: "8px", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: "10px", color: "#718096" }}>Tempo</div>
              <strong ref={pkRefs.tempo} style={{ fontSize: "16px" }}>0s</strong>
            </div>
          </div>

          <div ref={pkRefs.resDisplay} style={{ display: "none", background: "linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #4a5568", marginBottom: "15px" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold" }}>Índice de Resiliência</div>
            <div ref={pkRefs.resValue} style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", margin: "10px 0", color: "#2b6cb0" }}>0%</div>
          </div>

          <button className="pk-btn pk-btn-danger" onClick={() => pkEngine.current.skip()}>⏭ Pular Fase (Frustração)</button>
          <button className="pk-btn pk-btn-sec" onClick={() => pkEngine.current.restart()}>🔄 Reiniciar Fase (R)</button>

          <div style={{ marginTop: "15px", padding: "12px", background: "white", borderRadius: "8px", fontSize: "12px", color: "#718096" }}>
            <strong>Controles:</strong><br/>
            W / Espaço / ↑ : Pular<br/>
            A / D / ← → : Andar
          </div>
        </div>
      </div>
    </section>
  );
};