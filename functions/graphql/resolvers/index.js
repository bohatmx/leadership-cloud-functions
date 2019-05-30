const admin = require('firebase-admin');
const lodash = require('lodash');

const resolveFunctions = {
	Query: {
		listUsers(_, { filter, limit }) {
			return {
				users: getListOf(filter, 'users', 10),
				nextToken: ''
			};
		},

		listThoughts(_, { filter, limit }) {
			return {
				thoughts: getListOf(filter, 'dailyThoughts', 10),
				nextToken: ''
			};
		},
		listVideos(_, { filter, limit }) {
			return {
				videos: getListOf(filter, 'videos', 10),
				nextToken: ''
			};
		},
		listPodcasts(_, { filter, limit }) {
			return {
				podcasts: getListOf(filter, 'podcasts', 10),
				nextToken: ''
			};
		},
		listArticles(_, { filter, limit }) {
			return {
				articles: getListOf(filter, 'news', 10),
				nextToken: ''
			};
		}
	}
};

function getListOf(filter, type = 'users', limit = 10) {
	return admin.database().ref(type).limitToLast(limit).once('value').then(function(data) {
		var tblres = data.val();

		if (tblres) {
			var filteredObjects = filter
				? lodash.filter(Object.values(tblres), function(object) {
						const searchField = filter.contains.toLowerCase();
						var str = '';
						for (key in object) {
							str += ' ' + object[key];
						}
						var tempField = str.toLowerCase();

						return tempField.includes(searchField);
					})
				: Object.values(tblres);

			return filteredObjects;
		} else {
			return { code: '400', status: 'Failure', message: 'No record(s) found.' };
		}
	});
}

module.exports = resolveFunctions;
