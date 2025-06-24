const { fusionados, getItemFromDynamo, fetchAndCacheItem } = require('./fusionados');
const AWS = require('aws-sdk');
const fetch = require('node-fetch');

jest.mock('aws-sdk', () => {
    const DocumentClient = {
        get: jest.fn().mockReturnThis(),
        put: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => DocumentClient),
        },
    };
});

jest.mock('node-fetch');

describe('fusionados lambda', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getItemFromDynamo returns item if exists', async () => {
        AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce({ Item: { name: 'Tatooine' } });

        const result = await getItemFromDynamo('TempPlanetsTable', 1);
        expect(result).toEqual({ name: 'Tatooine' });
    });

    test('getItemFromDynamo returns null if not found', async () => {
        AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce({});

        const result = await getItemFromDynamo('TempPlanetsTable', 99);
        expect(result).toBeNull();
    });

    test('fetchAndCacheItem works correctly', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ name: 'Luke Skywalker' }),
        });

        AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce();

        const result = await fetchAndCacheItem(
            'https://swapi.info/api/people/1',
            'TempCharactersTable',
            1
        );

        expect(result.name).toBe('Luke Skywalker');
        expect(AWS.DynamoDB.DocumentClient().put).toHaveBeenCalled();
    });

    test('fusionados returns 200 response', async () => {
        // Simular Dynamo devuelve vacío para forzar fetch
        AWS.DynamoDB.DocumentClient().promise
            .mockResolvedValueOnce({}) // planet get
            .mockResolvedValueOnce()   // planet put
            .mockResolvedValueOnce({}) // character get
            .mockResolvedValueOnce()   // character put
            .mockResolvedValueOnce();  // fusionados put

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ name: 'Endor', climate: 'temperate' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ name: 'Leia Organa' }),
            });

        const response = await fusionados({});

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.characterName).toBeDefined();
        expect(body.planet).toBeDefined();
    });

    test('fusionados handles fetch error gracefully', async () => {
        AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce({});

        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const response = await fusionados({});
        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('Internal server error.');
    });
});
