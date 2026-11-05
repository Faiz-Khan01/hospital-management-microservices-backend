FROM nginx:1.25-alpine

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/*

# Copy hardened production nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Create certificate directories
RUN mkdir -p /etc/nginx/certs /var/www/certbot

EXPOSE 80 443

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
