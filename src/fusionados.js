const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_FUSIONADOS = 'FusionadosTable';
const TABLE_PLANETS = 'TempPlanetsTable';
const TABLE_CHARACTERS = 'TempCharactersTable';
const TTL_SECONDS = 30 * 60; // 30 minutos

const getRandomId = (max) => Math.floor(Math.random() * max) + 1;

const getItemFromDynamo = async (tableName, id) => {
    const result = await dynamodb.get({ TableName: tableName, Key: { id } }).promise();
    return result.Item || null;
};

const fetchAndCacheItem = async (url, tableName, id) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.json();
    data.id = id;
    data.ttlAttribute = Math.floor(Date.now() / 1000) + TTL_SECONDS;

    await dynamodb.put({ TableName: tableName, Item: data }).promise();
    return data;
};

const fusionados = async (event) => {
    const randomPlanetId = getRandomId(60);
    const randomCharacterId = getRandomId(83);

    console.debug('Random Planet ID:', randomPlanetId);
    console.debug('Random Character ID:', randomCharacterId);

    try {
        // PLANETA
        let planeta = await getItemFromDynamo(TABLE_PLANETS, randomPlanetId);
        if (!planeta) {
            console.debug(`Cache miss for planet ID: ${randomPlanetId}`);
            planeta = await fetchAndCacheItem(
                `https://swapi.info/api/planets/${randomPlanetId}`,
                TABLE_PLANETS,
                randomPlanetId
            );
        } else {
            console.debug('Cached Planet:', planeta);
        }

        // PERSONAJE
        let personaje = await getItemFromDynamo(TABLE_CHARACTERS, randomCharacterId);
        if (!personaje) {
            console.debug(`Cache miss for character ID: ${randomCharacterId}`);
            personaje = await fetchAndCacheItem(
                `https://swapi.info/api/people/${randomCharacterId}`,
                TABLE_CHARACTERS,
                randomCharacterId
            );
        } else {
            console.debug('Cached Character:', personaje);
        }

        // FUSIÓN
        const fusionData = {
            characterName: personaje.name,
            timestamp: Math.floor(new Date().getTime()/1000.0),
            planet: planeta.name,
            climate: planeta.climate,
        };

        console.debug('Fusion Data:', fusionData);

        await dynamodb.put({
            TableName: TABLE_FUSIONADOS,
            Item: fusionData,
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(fusionData),
        };

    } catch (error) {
        console.error('Error in fusionados:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error.' }),
        };
    }
};

module.exports = {
    fusionados,
    getItemFromDynamo, // exportables para pruebas unitarias
    fetchAndCacheItem, // exportables para pruebas unitarias
};
