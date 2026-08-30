FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3004
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
COPY maxBot/package.json maxBot/package-lock.json ./
RUN npm ci --omit=dev
COPY maxBot/ ./
RUN mkdir -p temp_uploads
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3004)+'/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "bot.js"]
