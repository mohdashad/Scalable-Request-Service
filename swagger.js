const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
openapi: '3.0.0',
info: {
title: 'Request/Transaction API',
version: '1.0.0',
description: 'Request/Transaction API Description',
},
};

const options = {
swaggerDefinition,
apis: ['routes/*.js'], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec; 