FROM node:fermium

# for wget
RUN apt-get -qq update && apt-get install -y -qq git && apt-get install -y --no-install-recommends wget

ARG branch=master
RUN git clone --branch ${branch} https://github.com/intrahealth/gofr /src/

# install dependencies
# ADD package-lock.json /src/
# ADD package.json /src/
WORKDIR /src/gofr-backend
RUN npm install

RUN cp -r /src/gofr-backend/lib/gofr-backend-site /src/gofr-backend/docker-site
RUN cp /src/gofr-backend/docker-site/config/default.json.example /src/gofr-backend/docker-site/config/default.json

WORKDIR /src/gofr-backend/docker-site
RUN npm install

# add app
# ADD . /src/

ARG FHIR_BASE_URL=http://fhir:8080/fhir
ENV mCSD__server__protocal=http
ENV mCSD__server__host=fhir
ENV mCSD__server__port=8080
ENV mCSD__server__basePath=fhir
ENV FHIR_BASE_URL=${FHIR_BASE_URL}
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# CMD ["npm", "start"]

ENTRYPOINT dockerize -wait-retry-interval 5s -timeout 120s -wait ${FHIR_BASE_URL}/DEFAULT/metadata npm start