import fp from "fastify-plugin";
import odbc from "odbc";
import config from 'config'

// Read config file
const SERVER_DSN = config.get('server.dsn');

const connectionConfig = {
  connectionString: SERVER_DSN,
  connectionTimeout: 10,
  loginTimeout: 10,
  initialSize: 5,
  maxSize: 15,
  incrementSize: 1,
}

export default fp(async (fastify) => {
  const pool = await odbc.pool(connectionConfig);

  fastify.decorate("db", {
    query: async (text, params) => {
      const result = await pool.query(text, params);
      return result;
    },
  });
})
