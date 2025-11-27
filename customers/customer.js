'use strict'

import odbc from "odbc";
import debug from "debug";
import config from "config";
import verifyToken from "../services/verify-token.js"
import { errorSchema, customersSchema, customerSchema, createCustomerSchema, updateCustomerSchema } from "../schemas/index.js";

const SERVER_DSN = config.get('server.dsn');
const BIBLIOTHEQUE = config.get('server.schema');
const log = debug('server:customer');

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options
 */
async function routes(fastify, options) {
  fastify.addHook('preHandler', verifyToken);

  fastify.addSchema({
    $id: "error",
    ...errorSchema,
  });

  fastify.addSchema({
    $id: "getCustomers",
    ...customersSchema,
  });

  fastify.addSchema({
    $id: "getCustomer",
    ...customerSchema,
  });

  fastify.addSchema({
    $id: "updateCustomer",
    ...updateCustomerSchema,
  });

  fastify.addSchema({
    $id: "createCustomer",
    ...createCustomerSchema,
  });

  // Get all customers
  fastify.get('/', {
    schema: {
      description: 'Get customers',
      tags: ['customers'],
      summary: 'Return all customers',
      security: [
        {
          BearerAuth: [],
        },
      ],
      response: {
        200: {
          description: 'Successful response',
          $ref: "getCustomers#"
        },
        400: {
          description: 'Bad request',
          type: 'object'
        },
        403: {
          description: 'Forbidden',
          type: 'object'
        },
        500: {
          description: 'Internal server error',
          $ref: "error#",
        }
      }
    },
    onRequest: [
      fastify.auth
        ? fastify.auth([fastify.verifyJWT])
        : (_request, reply) => {
          reply.code(500).send({
            statusCode: 500,
            error: "Internal Server Error",
            message: "Auth plugin is not registered",
          });
        },
    ],
  }, async (request, reply) => {
    const { db } = fastify;
    log(`Get all customers`);
    let result = [];
    let error;

    try {
      result = await db.query('SELECT CUSNUM as "number"'
        + ' ,trim(LSTNAM) "last_name"'
        + ' ,INIT "initials"'
        + ' ,trim(STREET) "street"'
        + ' ,trim(CITY) "city"'
        + ' ,STATE "state"'
        + ' ,ZIPCOD "zip_code"'
        + ' ,CDTLMT "command_limit"'
        + ' ,CHGCOD'
        + ' ,BALDUE'
        + ' ,CDTDUE FROM ' + BIBLIOTHEQUE + '.QCUSTCDT');
    } catch (e) {
      log(`error execute : ${e}`);

      throw { statusCode: 400, message: e.odbcErrors[0].message }
    }
    log(`result : ${JSON.stringify(result)}`);

    if (result.length > 0) {
      reply.status('200').send(result)
    } else {
      reply.status('204').send()
    }
  })

  // Get a customer
  fastify.get('/:number', {
    schema: {
      description: 'Get customer',
      tags: ['customers'],
      summary: 'Return a customer',
      security: [
        {
          BearerAuth: [],
        },
      ],
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          $ref: "getCustomer#"
        },
        403: {
          description: 'Forbidden',
          type: 'object'
        },
        404: {
          description: 'Not found'
        },
        500: {
          description: 'Internal server error',
          $ref: "error#",
        }
      }
    }
  }
    , async (request, reply) => {
      log(`Get a customer : ${JSON.stringify(request.params)}`);

      let result;
      let error;

      // Connect to the local database
      const connection = await odbc.connect(`${SERVER_DSN}`);

      try {
        result = await connection.query('SELECT CUSNUM as "number"'
        + ' ,trim(LSTNAM) "last_name"'
        + ' ,INIT "initials"'
        + ' ,trim(STREET) "street"'
        + ' ,trim(CITY) "city"'
        + ' ,STATE "state"'
        + ' ,ZIPCOD "zip_code"'
        + ' ,CDTLMT "command_limit"'
        + ' ,CHGCOD'
        + ' ,BALDUE'
        + ' ,CDTDUE FROM ' + BIBLIOTHEQUE + '.QCUSTCDT where cusnum = ?', [Number(request.params.number)]);
      } catch (e) {
        log(`error execute : ${e.odbcErrors[0].code}`);
        error = new Error();
        error.message = e.odbcErrors[0].message;
        reply.code(400).send(error);
      }

      log(`result : ${JSON.stringify(result)}`);

      await connection.close();

      if (result.length > 0) {
        reply.status('200').send(result[0])
      } else {
        reply.status('404').send()
      }
    })

  // Add a customer
  fastify.post('/', {
    schema: {
      description: 'Create customer',
      tags: ['customers'],
      summary: 'Create a customer',
      body: {
        $ref: "createCustomer#"
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
      response: {
        201: {
          description: 'Created',
          type: 'object',
          $ref: "getCustomers#"
        },
        403: {
          description: 'Forbidden',
          type: 'object'
        },
        500: {
          description: 'Internal server error',
          $ref: "error#",
        }
      }
    }
  }
    , async (request, reply) => {
      const { db } = fastify;

      log(`Add a customer ${JSON.stringify(request.body)}`);

      let result;
      let error;

      try {
        await db.query('INSERT INTO '
          + BIBLIOTHEQUE
          + '.QCUSTCDT ('
          + 'CUSNUM, LSTNAM, INIT, STREET, CITY, STATE, ZIPCOD, CDTLMT, CHGCOD, BALDUE, CDTDUE'
          + ') values ('
          + request.body.number
          + ' , ' 
          + "'" + request.body.last_name.trim() + "'"
          + ' , ' 
          + "'" + request.body.initials.trim() + "'"
          + ' , ' 
          + "'" + request.body.street.trim() + "'"
          + ' , ' 
          + "'" + request.body.city.trim() + "'"
          + ' , ' 
          + "'" + request.body.state.trim() + "'"
          + ' , ' 
          + request.body.zip_code
          + ' , ' 
          + request.body.command_limit
          + ' , ' 
          + request.body.CHGCOD
          + ' , ' 
          + request.body.BALDUE
          + ' , ' 
          + request.body.CDTDUE 
          + ' )');
      } catch (e) {
        log(`error insert : ${e.odbcErrors[0].code}`);
        error = new Error();
        error.message = e.odbcErrors[0].message;
        reply.code(400).send(error)
      }

      reply.status('201').send('Created')
    })

  // Update a customer
  fastify.put('/:number', {
    schema: {
      description: 'Update a customer',
      tags: ['customers'],
      summary: 'Update a customer',
      body: {
        $ref: "updateCustomer#"
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
      response: {
        204: {
          description: 'No content',
          type: 'object',
          $ref: "getCustomer#"
        },
        400: {
          description: 'Bad request',
          type: 'object'
        },
        403: {
          description: 'Forbidden',
          type: 'object'
        },
        500: {
          description: 'Internal server error',
          $ref: "error#",
        }
      }
    }
  }
    , async (request, reply) => {
      const { db } = fastify;

      log(`Update a customer : ${JSON.stringify(request.params)}`);
      log(`Body : ${JSON.stringify(request.body)}`);

      let result;
      let error;

      try {
        await db.query('UPDATE '
          + BIBLIOTHEQUE
          + '.QCUSTCDT set'
          + '   LSTNAM = ' + "'" + request.body.last_name.trim() + "'"
          + ' , INIT = ' + "'" + request.body.initials.trim() + "'"
          + ' , STREET = ' + "'" + request.body.street.trim() + "'"
          + ' , CITY = ' + "'" + request.body.city.trim() + "'"
          + ' , STATE = ' + "'" + request.body.state.trim() + "'"
          + ' , ZIPCOD = ' + request.body.zip_code
          + ' , CDTLMT = ' + request.body.command_limit
          + ' , CHGCOD = ' + request.body.CHGCOD
          + ' , BALDUE = ' + request.body.BALDUE
          + ' , CDTDUE = ' + request.body.CDTDUE 
          + ' where cusnum = ' + request.params.number);
      } catch (e) {
        log(`error update : ${e.odbcErrors[0].code}`);
        error = new Error();
        error.message = e.odbcErrors[0].message;
        reply.code(400).send(error);
      }

      reply.status('204').send('Updated')
    })

  // Delete a customer
  fastify.delete('/:number', {
    schema: {
      description: 'Delete a customer',
      tags: ['customers'],
      summary: 'Delete a customer',
      security: [
        {
          BearerAuth: [],
        },
      ],
      response: {
        204: {
          description: 'No Content',
          type: 'object',
        },
        400: {
          description: 'Bad request',
          type: 'object'
        },
        403: {
          description: 'Forbidden',
          type: 'object'
        },
        500: {
          description: 'Internal server error',
          $ref: "error#",
        }
      }
    }
  }
    , async (request, reply) => {
      const { db } = fastify;
      log(`Delete a customer : ${JSON.stringify(request.params)}`);

      let result;
      let error;

      try {
        await db.query('DELETE FROM ' + BIBLIOTHEQUE + '.QCUSTCDT where cusnum = ?', [Number(request.params.number)]);
      } catch (e) {
        log(`error execute : ${e.odbcErrors[0].code}`);
        error = new Error();
        error.message = e.odbcErrors[0].message;
        reply.code(400).send(error);
      }

      reply.code(200).send('Deleted');
    })

}

export default routes;