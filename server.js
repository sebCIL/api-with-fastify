'use strict'

const fastify = require('fastify')()
const odbc = require('odbc');
const debug = require('debug')('server');
const config = require('config');

const SERVER_ADDRESS = config.get('server.host');
const SERVER_PORT = config.get('server.port');

fastify.register(require('fastify-swagger'), {
    openapi: {
        info: {
            title: 'API Fastify',
            description: 'This REST API expose a CRUD from QCUSTCDT',
            version: '1.0.0',
            termsOfService: 'http://swagger.io/terms/',
            contact: {
                name: 'Me',
                url: 'https://github.com/sebCIL/api-with-fastify',
                email: 'nocontact@me.me'
            },
            license: {
                name: 'Apache 2.0',
                url: 'https://github.com/sebCIL/api-with-fastify'
            },
        },
        servers: [{
            url: `http://${SERVER_ADDRESS}:${SERVER_PORT}`
        }],
        consumes: ['application/json'],
        produces: ['application/json']
    },
    exposeRoute: true
})

// Register routes to handle customers
const customerRoutes = require('./routes/customer')
customerRoutes.forEach((route, index) => {
    fastify.route(route)
})

fastify.listen(`${SERVER_PORT}`, '0.0.0.0', err => {
    if (err) throw err
    console.log('listening')
})