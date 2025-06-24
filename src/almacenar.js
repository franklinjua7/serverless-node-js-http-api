const { v4 } = require('uuid')
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TableNameAlmacenar = 'AlmacenarTable';

// Definir región (por ejemplo us-east-1)
AWS.config.update({ region: 'us-east-1' });

const almacenar = async (event) => {
    const id = v4();
    
    // Parseando el cuerpo del evento
    let data = {}
    try {
        data = JSON.parse(event.body);
    } catch (error) {
        console.error('Error parsing JSON body:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON' })
        };
    }

    const { characterName, planet, climate } = JSON.parse(event.body);

    // Añadiendo id,timestamp
    data.id = v4();
    data.timestamp = Math.floor(new Date().getTime() / 1000.0);

    // Preparando los datos para almacenar en DynamoDB
    const params = {
        TableName: TableNameAlmacenar,
        Item: data
    };
    console.log('Data almacenar: ', params);


    try {
        // Guardando los datos en DynamoDB
        await dynamodb.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error al guardar en DynamoDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al guardar en DynamoDB' })
        };
    }
}

module.exports = {
    almacenar
}