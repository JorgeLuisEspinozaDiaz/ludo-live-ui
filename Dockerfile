FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN corepack enable && (pnpm install --frozen-lockfile || npm ci || npm install)
COPY . .
ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=
ARG VITE_LIVEKIT_URL=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SOCKET_URL=$VITE_SOCKET_URL \
    VITE_LIVEKIT_URL=$VITE_LIVEKIT_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
