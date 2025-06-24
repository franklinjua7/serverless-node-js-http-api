const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TableNameFusionados = 'FusionadosTable';

const fusionados = async (event) => {
    random_planeta = Math.floor(Math.random() * 60) + 1;
    random_persona = Math.floor(Math.random() * 83) + 1;
    console.debug('RandomPlaneta: ',random_planeta);
    console.debug('RandomPersona: ',random_persona);

    try {
        // Obtenemos los DATOS de los PLANETAS
        const temp_response_planeta = await dynamodb.get({
            TableName: 'TempPlanetsTable', Key: { id: random_planeta}
        }).promise();

        // Verificamos la DATA de PLANETA
        console.debug('Temp Response Planeta: ',temp_response_planeta);
        if ( Object.keys(temp_response_planeta).length === 0 ){
            // Obtenemos NUEVA data
            const reponse_planeta = await fetch('https://swapi.info/api/planets/'+random_planeta);
            if (!reponse_planeta.ok){
                throw new Error(`Error en la solicitud: ${reponse_planeta.status}`);
            }
            data_planeta = await reponse_planeta.json();
            console.debug('Datos planeta: ', data_planeta);

            // Almacenamos la NUEVA data
            data_planeta.id = random_planeta;
            data_planeta.ttlAttribute = Math.floor(new Date().getTime() / 1000.0) + (30 *60)
            await dynamodb.put({
                TableName: 'TempPlanetsTable', Item: data_planeta
            }).promise();
        } else {
            data_planeta = temp_response_planeta.Item;
            console.debug('Datos planeta temp: ', data_planeta);
        }
        console.log('Datos Planeta Final: ', data_planeta);

        // Obtenemos los DATOS de los PERSONAJES
        const temp_response_character = await dynamodb.get({
            TableName: 'TempCharactersTable', Key: { id: random_persona }
        }).promise();

        // Verificar la DATA de CHARACTERES
        console.debug('Temp Response Character', temp_response_character);
        if ( Object.keys(temp_response_character).length === 0 ){
            // Obtenemos NUEVA data
            const response_persona = await fetch('https://swapi.info/api/people/'+random_persona);
            if (!response_persona.ok){
                throw new Error(`Error en la solicitud: ${response_persona.status}`);
            }
            data_persona = await response_persona.json();
            console.log('Datos persona: ', data_persona);

            // Almacenamos la NUEVA data
            data_persona.id = random_persona;
            data_persona.ttlAttribute = Math.floor(new Date().getTime() / 1000.0) + (30 *60)
            await dynamodb.put({
                TableName: 'TempCharactersTable', Item: data_persona
            }).promise();
        } else {
            data_persona = temp_response_character.Item;
            console.debug('Datos persona temp: ', data_persona);
        }
        console.log('Datos Persona Final: ', data_persona);

        // Armamos el ARRAY final
        data_fusionada={
            'characterName': data_persona['name'],
            'timestamp': Math.floor(new Date().getTime()/1000.0),
            'planet': data_planeta['name'],
            'climate': data_planeta['climate']
        }
        console.debug('Data Fusionada: ',data_fusionada);

        await dynamodb.put({
            TableName: TableNameFusionados,
            Item: data_fusionada
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(data_fusionada)
        };

    } catch (error) {
        console.error(`Error al obtener: `, error);
        //throw error;
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al procesar los datos.'})
        }
    }
}

module.exports = {
    fusionados
}