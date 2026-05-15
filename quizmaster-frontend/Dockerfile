FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:3000
ARG VITE_APP_NAME=Quizmaster
ARG VITE_ENABLE_AGENTATION=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_ENABLE_AGENTATION=$VITE_ENABLE_AGENTATION

RUN npm run build


FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]