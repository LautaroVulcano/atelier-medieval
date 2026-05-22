# Dokploy

Proyecto Angular SSR para Atelier Medieval servido con Node/Express.

## App

- Tipo: Dockerfile
- Dockerfile: `Dockerfile`
- Branch: `main`
- Puerto interno: `4000`
- Variable recomendada: `PORT=4000`
- Health check: `/`
- Dominio: configurar con HTTPS y certificado `Let's Encrypt`

## Build local

```bash
npm ci
npm run build
npm run serve:ssr
```

## DNS

Cuando el dominio final este definido, apuntar el registro `A` o `CNAME` al servidor de Dokploy y agregarlo en la app con:

- Path: `/`
- Internal path: `/`
- Container port: `4000`
- HTTPS: activo
- Certificate provider: `Let's Encrypt`

## Pendientes de contenido

- Reemplazar links placeholder de Instagram/tienda.
- Reemplazar `wa.me/5490000000000` por el WhatsApp real.
- Confirmar dominio final si no sera `atelier-medieval.com`.
- Cambiar imagenes provisorias por fotos reales cuando esten disponibles.
