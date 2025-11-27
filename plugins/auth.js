import fp from "fastify-plugin";
import jwt from '@fastify/jwt'
import auth from "@fastify/auth";
import config from 'config'

const SECRET = config.get('secret');

export default fp(async (fastify) => {
  fastify.register(jwt, {
    secret: SECRET
  })

  await fastify.register(auth);

  fastify.decorate("verifyJWT", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
})
