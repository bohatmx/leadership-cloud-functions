const functions = require('firebase-functions');
const _ = require('lodash');
const request = require('request-promise');

exports.indexCarsToElastic = functions.database.ref('/cars/{carId}')
    .onWrite(event => {
        let carData = event.data.val();
        let carId = event.params.carId;

        console.log('Indexing car ', carId, carData);

        let elasticsearchFields = ['model', 'manufacturer', 'description', 'transmission_type', 'fuel_type', 'noise_level',
            'euro_standard', 'year', 'co2', 'noise_level', 'urban_metric', 'extra_urban_metric', 'combined_metric'
        ];
        let elasticSearchConfig = functions.config().elasticsearch;
        let elasticSearchUrl = elasticSearchConfig.url + 'cars/car/' + carId;
        let elasticSearchMethod = carData ? 'POST' : 'DELETE';

        let elasticsearchRequest = {
            method: elasticSearchMethod,
            uri: elasticSearchUrl,
            auth: {
                username: elasticSearchConfig.username,
                password: elasticSearchConfig.password,
            },
            body: _.pick(carData, elasticsearchFields),
            json: true
        };

        return request(elasticsearchRequest).then(response => {
            console.log('Elasticsearch response', response);
        })

    });