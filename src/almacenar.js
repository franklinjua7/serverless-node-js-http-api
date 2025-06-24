const AWS = require('aws-sdk');

const almacenar = async (event) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const { characterName, planeta, climate } = JSON.parse(event.body);
    const timestamp = Math.floor(new Date().getTime()/1000.0);

    const data_almacenar = {
        characterName,
        timestamp,
        climate,
        planeta
    };

    console.log('Data almacenar: ', data_almacenar);

    await dynamodb.put({
        TableName: 'RetoTecnicoTable',
        Item: data_almacenar
    }).promise();

    return {
        status: 200,
        body : JSON.stringify(data_almacenar)
    }
}

module.exports = {
    almacenar
}