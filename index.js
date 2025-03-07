const AWS = require("aws-sdk");

module.exports.handler = async (event) => {
    console.log(JSON.stringify({event}));
    const connectionId = event.requestContext.connectionId;
    const routeKey = event.requestContext.routeKey;
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        console.error(error);
        body = {};
    }
    if (body && body['sendMessageToConnection']) {
        const apiGateway = new AWS.ApiGatewayManagementApi({
            apiVersion: "2018-11-29",
            endpoint: body['domainName'] + "/" + body['stage']
        });
        const userId = body.userId;
        const message = body.message;
        const connectionId = body.connectionId;
        
        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ userId, message })
        }).promise();
        return { statusCode: 200, body: JSON.stringify({message: `Message sent to ${userId} connectionId ${connectionId}`}) };
    }
 
    if (routeKey === "$connect") {
        console.log(`ConnectionId: ${connectionId} connected.`);
        return { statusCode: 200 };
    }

    if (routeKey === "$disconnect") {
        console.log(`ConnectionId: ${connectionId} disconnected.`);
        return { statusCode: 200 };
    }

    if (routeKey === "sendMessage") {
        body = JSON.parse(event.body);
        const userId = body.userId;
        const message = body.message;
        const apiGateway = new AWS.ApiGatewayManagementApi({
            apiVersion: "2018-11-29",
            endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
        });

        try {
            await apiGateway.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify({ userId, message })
            }).promise();
        } catch (error) {
            console.error(error);
            return { statusCode: 500 };
        }
        
        return { statusCode: 200 };
    }
};



// zip -r function.zip . 