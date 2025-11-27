import debug from "debug";
import odbc from "odbc";
import config from "config";
import { errorSchema, loginPostSchema } from "./schemas/index.js";

const SERVER_DSN = config.get('server.dsn');
const JWT_OPTIONS = config.get('jwt_option');

const log = debug('server:login');

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options
 */
async function login (fastify, options) {
  
  fastify.addSchema({
    $id: "error",
    ...errorSchema,
  });

  fastify.addSchema({
    $id: "loginPost",
    ...loginPostSchema,
  });

  fastify.post('/login', {
    schema: {
      description: 'Login to the IBMi',
      tags: ['login'],
      summary: 'Return a token when success',
      body: {
        $ref: "loginPost#",
      },
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            auth: { type: 'string' },
            token: { type: 'string' },
          }
        },
        400: {
          description: 'Bad request',
          $ref: "error#",
        },
        500: {
          description: 'Internal server error',
          $ref: "error#",
        }
      }
    }
  }, async (request, reply) => {
    let JWTToken;

    log("User login : %O", request.body);
    
    /**
     * En utilisant une procédure
     * Attention: 
     *   - le nom de la procédure doit être en majuscule
     *   - la réponse est dans les paramètres de retour, elle est donc renvoyée dans result.parameters
     */
    // Connect to the local database
    const connection = await odbc.connect(`${SERVER_DSN}`);
    const result = await connection.callProcedure(null, 'GPTEST', 'USRAUTH', [request.body.profil.toUpperCase(), request.body.password.toUpperCase(), '']);
    
    log(`Login ${result.parameters[2] === '1' ? 'success': 'failed'}`);
    if(result.parameters[2] === '1') {
      // Create JWT
      const payload = { user: request.body.profil };
      JWTToken = fastify.jwt.sign(payload);
    }

    if (!JWTToken) {
      // throw new AuthError("Username or password is incorrect");
      reply.status('401').send({
        "statusCode": 401,
        "error": "Unauthorized",
        "message": "Invalid username or password"
      });
    }

    return JSON.stringify({ auth: result.parameters[2] === '1', token: JWTToken});
    
  })

  fastify.post('/logout', {
    schema: {
      description: 'Logout to the IBMi',
      tags: ['login'],
      summary: 'To implement',
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            auth: { type: 'string' },
            token: { type: 'string' },
          }
        },
        500: {
          description: 'Internal server error',
          $ref: "error#",
        }
      }
    }
  }, async (request, reply) => {
    // @TODO: à implémenter
    return { auth: false };
  });
}

export default login;
