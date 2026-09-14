const serverless = require('serverless-http');
const app = require('../../server');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
	await app.connectDatabase();
	return handler(event, context);
};