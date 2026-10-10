# CHICKEN BOOM RESCUE — LISTA DE RECURSOS GRÁFICOS Y DE AUDIO (ASSETS)

Conforme a la **Regla Fundamental de Arte #1**, no se generó ningún arte con IA. Toda la representación actual funciona mediante Canvas 2D vectorial de alta fidelidad basado en el arte de referencia proporcionado (`logo.png`, `fondojuego.png`, `fondomenu.png`, `Batalla de gallinas en la granja.png`, `Batalla Bomberman en la Isla Tropical.png`).

A continuación se detalla la lista de archivos de recursos originales que el equipo puede colocar en `public/assets/` para sustituir directamente los componentes procedurales:

---

## 1. Personajes (Spritesheets o PNG con fondo transparente)

1. **Pollito Macho Rambo (Protagonista):**
   - `chick_rambo_idle.png`: Estado quieto (frente, espalda, perfil).
   - `chick_rambo_walk.png`: Ciclo de caminado (4 direcciones: arriba, abajo, izquierda, derecha).
   - `chick_rambo_bomb.png`: Animación colocando huevo bomba.
   - `chick_rambo_hurt.png`: Expresión al recibir daño.
   - `chick_rambo_avatar.png`: Icono cuadrado para el HUD (48x48 px o 64x64 px).

2. **Pollita Comando Rambo:**
   - `chick_female_idle.png` / `walk.png` / `avatar.png`: Spritesheet y avatar con bandana rosa/magenta.

3. **Gallinita Exploradora:**
   - `hen_explorer_idle.png` / `walk.png` / `avatar.png`: Spritesheet y avatar con lentes y sombrero safari.

---

## 2. Enemigos y Animales Rescatados

1. **Zorro Antropomórfico (Enemigo):**
   - `fox_walk.png`: Ciclo de caminado bípedo (4 direcciones).
   - `fox_defeat.png`: Animación de derrota / desaparición poof.

2. **Animales Atrapados / Rescatados (Pantalla 3):**
   - `cage_closed.png`: Jaula de madera y barrotes de hierro con candado.
   - `cage_open.png`: Jaula rota / abierta.
   - `piglet_cheer.png`: Cerdito cartoon celebrando.
   - `sheep_cheer.png`: Ovejita cartoon celebrando.
   - `bunny_cheer.png`: Conejito cartoon celebrando.

3. **Cofre y Copa (Multijugador - Pantalla 2):**
   - `chest_closed.png`: Cofre de madera y bandas doradas cerrado.
   - `chest_open.png`: Cofre abierto con resplandor.
   - `trophy_cup.png`: Copa dorada del campeonato.

---

## 3. Entorno y Grilla (Tiles 48x48 px o múltiplos)

1. **Borde exterior:**
   - `tile_brick_solid.png`: Ladrillo perimetral sólido con relieve y mortero.

2. **Muros internos:**
   - `tile_rock_wall_01.png`: Bloque de roca sólida (variación 1).
   - `tile_rock_wall_02.png`: Bloque de roca sólida con grieta (variación 2).
   - `tile_rock_wall_03.png`: Bloque de roca sólida con musgo (variación 3).

3. **Cajas Destruibles:**
   - `crate_wood.png`: Caja de madera con cruceta en X y remaches en esquinas.
   - `crate_break_anim.png`: Animación de astillas y destrucción.

4. **Suelo del Mapa:**
   - `fondojuego.png`: Textura de césped, flores y caminos de tierra (ya entregada como referencia).

5. **Fondo de Menú:**
   - `fondomenu.png`: Ilustración vertical 9:16 con granja, molino, río y montañas (ya entregada como referencia).

6. **Logo:**
   - `logo.png`: Logotipo 3D oficial "CHICKEN BOOM RESCUE" con el pollito y el zorro (ya entregado como referencia).

---

## 4. Bombas y Efectos

1. **Huevos Bomba:**
   - `bomb_egg_normal.png`: Huevo blanco con manchas rojas y mecha corta.
   - `bomb_egg_double.png`: Icono de dos huevos con mecha.
   - `bomb_egg_triple.png`: Icono de tres huevos con mecha.
   - `bomb_egg_remote.png`: Huevo con mecha y antena detonadora.
   - `fuse_spark_anim.png`: Chispa chispeante de la mecha.

2. **Explosión:**
   - `explosion_center.png`: Núcleo de la explosión central.
   - `explosion_ray_vertical.png`: Columna de fuego vertical.
   - `explosion_ray_horizontal.png`: Columna de fuego horizontal.

---

## 5. Power-Ups y Objetos

1. `item_key.png`: Llave dorada brillante.
2. `item_coin.png`: Moneda de oro brillante.
3. `item_heart.png`: Corazón rojo de vida.
4. `item_powerup_speed.png`: Bota con alas o zapatilla roja de velocidad.
5. `item_powerup_shield.png`: Insignia de escudo azul.
6. `item_powerup_ghost.png`: Fantasma morado translúcido.
7. `item_powerup_remote.png`: Control detonador verde.

---

## 6. Audio (Opcional - actualmente sintetizado vía Web Audio API)

1. `music_menu.mp3` / `.ogg`: Tema musical estilo steel band suave y animado.
2. `music_game.mp3` / `.ogg`: Tema musical estilo steel band dinámico y rítmico.
3. SFX: `click.wav`, `place_egg.wav`, `explosion.wav`, `crate_break.wav`, `coin.wav`, `powerup.wav`, `key_found.wav`, `victory_fanfare.wav`, `game_over.wav`.
