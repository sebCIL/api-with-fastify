# api-with-fastify
Squelette d'API avec Fastify et documentation OpenAPI

Cette api est basée sur [Fastify](https://www.fastify.io/), [fastify-swagger](https://www.npmjs.com/package/fastify-swagger), [ODBC](https://ibmi-oss-docs.readthedocs.io/).

If you set exposeRoute to true the plugin will expose the documentation with the following APIs:

URL Description :
- '/documentation/json' : The JSON object representing the API
- '/documentation/yaml' :  The YAML object representing the API
- '/documentation/'  : The swagger UI
- '/documentation/*'  : External files that you may use in $ref
