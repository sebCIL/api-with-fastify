/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options
 */
async function routes (fastify, options) {
  fastify.get('/', {
    schema: {
      description: 'First route',
      tags: ['First route'],
      summary: 'Our first route',
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        },
        500: {
          description: 'Internal server error',
        }
      }
    }
  }, async (request, reply) => {
    return { hello: 'world' }
  })
}

//ESM
export default routes;
