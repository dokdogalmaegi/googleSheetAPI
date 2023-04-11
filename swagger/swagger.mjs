import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Google Sheet API',
            description: 'Google Sheet API',
        },
        servers: [
            {
                url: 'http://dokdogalmaegi.hopto.org:8080',
            },
        ],
    },
    apis: ['./router/*.mjs', './router/*.js', './swagger/*.mjs'],
}
export const specs = swaggerJsdoc(options);