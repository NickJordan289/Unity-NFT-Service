FROM node:19.0.0-alpine3.16 as build

WORKDIR /app

COPY . .

RUN yarn install && yarn build 

# nginx state for serving content
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /etc/nginx/html/*
# Copy static assets from builder stage
COPY --from=build /app/build /etc/nginx/html

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]