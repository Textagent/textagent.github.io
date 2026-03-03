# Use nginx as the base image for serving static files
FROM nginx:alpine

# Copy only the web application files (not desktop-app, docs, etc.)
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
