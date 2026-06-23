# Frontend — Unique Gym (Angular web + Ionic/Capacitor app)

El agente `frontend` scaffolda aquí los dos proyectos por fases.

## Web (Angular — paneles admin y entrenador)
```bash
npm i -g @angular/cli
ng new web --routing --style=scss
```

## App (Ionic + Capacitor — cliente, PWA primero)
```bash
npm i -g @ionic/cli
ionic start app blank --type=angular
# PWA primero (sin tiendas hasta el final):
npm i @angular/pwa && ng add @angular/pwa
```

Reglas:
- Aplica `design/tokens.json` y `design/components.md` (no inventes estilos).
- Consume `contracts/openapi.yaml` (no improvises el backend).
- Tema oscuro, marca Unique Gym, español de Colombia. Sin IA en el cliente.
