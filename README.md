# EMPUJONES 🎮

Juego multijugador en el navegador: cada jugador es una bolita en una arena que se encoge.
Empuja a los demás fuera. El último en pie gana la ronda.

- Moverse: WASD o flechas · Embestir: Espacio
- Móvil: arrastra para moverte, toca con otro dedo para embestir
- Hasta 12 jugadores por sala; cada sala es una partida distinta (`?sala=nombre`)

## Arrancar

```bash
npm install
npm start
```

Abre http://localhost:3000

## Jugar con amigos

**Misma wifi:** la consola muestra una dirección tipo `http://192.168.x.x:3000`; pásala a tus amigos.
(Algunas wifis de universidad aíslan los dispositivos; si no conecta, usa la opción de abajo.)

**Por internet (gratis):** sube la carpeta a GitHub y despliégala en Render.com
(New → Web Service → Build: `npm install`, Start: `npm start`). Te dará un enlace público.

## Ideas para modificar

Todos los números del juego están arriba en `server.js` (velocidad, fuerza del embiste,
tamaño de la arena, rebote…). Prueba `BOUNCE = 1.6` para un caos total.
