# Use Node 13.1.0 on Linux with Debian Buster
FROM --platform=linux/amd64 node:13.1.0-buster

# Install system dependencies for node-gyp and SGX
RUN apt-get update && apt-get install -y \
    python2.7 \
    build-essential \
    git \
    libssl-dev \
    libcurl4-openssl-dev \
    protobuf-compiler \
    && ln -sf /usr/bin/python2.7 /usr/bin/python

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install app dependencies and rebuild native modules
RUN yarn install && \
    cd node_modules/secureworker && npm rebuild && cd ../.. && \
    cd node_modules/grpc && npm rebuild && cd ../..

# Copy app source
COPY . .

# Build the app
RUN yarn build

# Expose ports
EXPOSE 3000 3001

# Start the app
CMD ["yarn", "run", "dev"] 