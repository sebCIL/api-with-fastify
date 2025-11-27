import Fastify from 'fastify'
import config from 'config'
import path from "path"
import fs from 'fs'
import AutoLoad from '@fastify/autoload'
import swaggerUi from '@fastify/swagger-ui'
import swagger from '@fastify/swagger'
import { fileURLToPath } from 'url'

import firstRoute from './our-first-route.js'
import customerRoute from './customers/customer.js'
import login from './login.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read config file
const SERVER_ADDRESS = config.get('server.host');
const SERVER_PORT = config.get('server.port');
const SECRET = config.get('secret');
const VERSION = config.get('version');

const fastifySwagger = {
  openapi: {
    info: {
      title: "IBM PowerWeek",
      description:
        "Demonstrates Fastify with authenticated route using RSA256",
      version: VERSION,
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          description:
            "RSA256 JWT signed by private key, with username in payload",
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      {
        name: "login",
        description: "Login endpoints",
      },
      {
        name: "customers",
        description: "Customers-related endpoints",
      },
    ],
  },
  refResolver: {
    buildLocalReference: (json, _baseUri, _fragment, _i) => {
      return json.$id || `def-{i}`;
    },
  }
}

const fastifySwaggerUiOptions = {
  routePrefix: '/documentation',
  uiConfig: {
    // docExpansion: 'full',
    deepLinking: false
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next() },
    preHandler: function (request, reply, next) { next() }
  },
  staticCSP: false,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
  transformSpecificationClone: true
}

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true,
  http2: true,
  https: {
    key: fs.readFileSync(path.join(__dirname, '.', 'https', 'api-with-express-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '.', 'https', 'api-with-express-cert.pem'))
  }
})

await fastify.register(swagger, fastifySwagger)
await fastify.register(swaggerUi, fastifySwaggerUiOptions)

fastify.register(AutoLoad, {
  dir: path.join(__dirname, "plugins"),
  options: Object.assign({}),
});

//fastify.register(db)
fastify.register(login)
fastify.register(firstRoute)
fastify.register(customerRoute, { prefix: 'api/customer' })

fastify.listen({ port: SERVER_PORT, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
  console.log('%s listening at %s', SERVER_ADDRESS, SERVER_PORT);
})