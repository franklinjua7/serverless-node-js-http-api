const { almacenar } = require('./almacenar'); // Ajusta la ruta según tu estructura de archivos

describe('almacenar function', () => {
    it('debería almacenar correctamente en DynamoDB', async () => {
        const mockEvent = {
            body: JSON.stringify({
                characterName: 'Luke Skywalker',
                planet: 'Tatooine',
                climate: 'Arid'
            })
        };

        const result = await almacenar(mockEvent);

        // Verificar que la respuesta tenga statusCode 200
        expect(result.statusCode).toEqual(200);

        // Verificar que el cuerpo de la respuesta sea un JSON válido
        const responseBody = JSON.parse(result.body);
        expect(responseBody.characterName).toEqual('Luke Skywalker');
        expect(responseBody.planet).toEqual('Tatooine');
        expect(responseBody.climate).toEqual('Arid');
    });

    it('debería manejar errores correctamente', async () => {
        // Simular un evento con un cuerpo inválido
        const mockEvent = {
            body: '{ characterName: "Luke Skywalker" }' // JSON inválido
        };

        const result = await almacenar(mockEvent);

        // Verificar que la respuesta tenga statusCode 500 en caso de error
        expect(result.statusCode).toEqual(500);
        expect(result.body).toContain('Error al almacenar los datos');
    });
});
