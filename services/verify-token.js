import debug from "debug";

const log = debug('server:token');

async function verifyToken (req, reply) {
  log('Verify Token');
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.split(" ")[1];
    try {
      await req.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  } else {
    reply.code(403).send({ error: 'Forbidden' });
  }
}

export default verifyToken;