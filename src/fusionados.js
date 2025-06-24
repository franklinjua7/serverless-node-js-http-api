const AWS = require('aws-sdk');

const fusionados = async (event) => {
    random_planeta = Math.floor(Math.random() * 60) + 1;
    random_persona = Math.floor(Math.random() * 83) + 1;
    console.log('RandomPlaneta: ',random_planeta);
    console.log('RandomPersona: ',random_persona);

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    try {
        const reponse_planeta = await fetch('https://swapi.info/api/planets/'+random_planeta);
        if (!reponse_planeta.ok){
            throw new Error(`Error en la solicitud: ${reponse_planeta.status}`);
        }
        const data_planeta = await reponse_planeta.json();
        console.log('Datos planeta: ', data_planeta);
        
        const response_persona = await fetch('https://swapi.info/api/people/'+random_persona);
        if (!response_persona.ok){
            throw new Error(`Error en la solicitud: ${response_persona.status}`);
        }
        const data_persona = await response_persona.json();
        console.log('Datos persona: ', data_persona);

        data_fusionada={
            'characterName': data_persona['name'],
            'timestamp': Math.floor(new Date().getTime()/1000.0),
            'planeta': data_planeta['name'],
            'climate': data_planeta['climate']
        }
        console.log(data_fusionada);

        await dynamodb.put({
            TableName: 'RetoTecnicoTable',
            Item: data_fusionada
        }).promise();

        return {
            status: 200,
            body: JSON.stringify(data_fusionada)
        };

    } catch (error) {
        console.error(`Error al obtener: `, error);
        throw error;
    }
}

module.exports = {
    fusionados
}