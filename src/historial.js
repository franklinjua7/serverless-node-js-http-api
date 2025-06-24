const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TableNameFusionados = 'FusionadosTable';

const historial = async (event) => {

    try {
        const result = await dynamodb.scan({
            TableName: TableNameFusionados,
        }).promise();

        const characteres = result.Items;
        console.log('Lista Characteres: ', characteres );

        return {
            statusCode: 200,
            body : JSON.stringify(characteres)
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al procesar los datos.'})
        }
    }
}

module.exports = {
    historial
}