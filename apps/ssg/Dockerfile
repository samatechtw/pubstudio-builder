# SSG service: prerenders published sites to static HTML.
# Build the bundle first: npx nx build ssg  (outputs to dist/apps/ssg)
FROM node:22-slim
WORKDIR /usr/src/ssg

ENV NODE_ENV=production
ENV PORT=3200

COPY ./dist/apps/ssg ./

EXPOSE 3200
CMD ["node", "server.mjs"]
