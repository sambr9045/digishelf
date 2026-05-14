FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_ENDPOINT=
ARG VITE_DEV_BACKEND_ORIGIN=http://backend:8000

ENV VITE_API_ENDPOINT=${VITE_API_ENDPOINT}
ENV VITE_DEV_BACKEND_ORIGIN=${VITE_DEV_BACKEND_ORIGIN}

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 5179

CMD ["serve", "-s", "dist", "-l", "5179"]
