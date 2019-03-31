const admin = require('firebase-admin');
const lodash = require('lodash');
const authors = [
	{ id: 1, firstName: 'Tom', lastName: 'Coleman' },
	{ id: 2, firstName: 'Sashko', lastName: 'Stubailo' }
];

const posts = [
	{ id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
	{ id: 2, authorId: 2, title: 'GraphQL Rocks', votes: 3 },
	{ id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 }
];

const items = [
	{ id: 1, name: 'IceCream 1', description: 'Introduction to GraphQL', rating: 1.2 },
	{ id: 3, name: 'IceCream 3', description: 'Introduction to GraphQL', rating: 1.5 }
];

const resolveFunctions = {
	Query: {
		posts() {
			return posts;
		},
		author(_, { id }) {
			return authors.find((author) => author.id === id);
		},
		users() {
			return admin.database().ref('/users').limitToLast(10).once('value').then(function(data) {
				var tblres = data.val();

				if (tblres) {
					return Object.values(tblres);
				} else {
					return { code: '400', status: 'Failure', message: 'No record(s) found.' };
				}
			});
		},
		listIceCreams(_, { filter, limit, nextToken }) {
			const searchField = filter.searchField.contains;
			return {
				items: lodash.filter(items, function(item) {
					var tempField = item.name + ' ' + item.description;
					return tempField.includes(searchField);
				}),
				nextToken: searchField
			};
		},
		getIceCream(_, { id }) {
			return items.find((item) => item.id === id);
		},

		searchPosts(_, { filter, limit, nextToken }) {
			return {
				posts: lodash.filter(posts, function(post) {
					var tempField = post.title;
					return tempField.includes(filter);
				}),
				nextToken: filter
			};
		}
	},
	Mutation: {
		upvotePost(_, { postId }) {
			const post = posts.find((post) => post.id === postId);
			if (!post) {
				throw new Error(`Couldn't find post with id ${postId}`);
			}
			post.votes += 1;
			// pubsub.publish('postUpvoted', post);
			return post;
		},
		createIceCream(_, { input }) {
			var vars = input;
			var s1 = input.name.toLowerCase();
			var s2 = input.description.toLowerCase();
			vars.searchField = '${s1} ${s2}';
			items.push({
				id: Math.round(Math.random() * 100),
				...vars
			});
			return 'Addded Successfully!';
		}

		// listUsers(parent, { filter: { searchField } }) {
		// 	console.log(parent);
		// 	return searchField;
		// }
	},
	Author: {
		posts(author) {
			return posts.filter((post) => post.authorId === author.id);
		}
	},
	Post: {
		author(post) {
			return authors.find((author) => author.id === post.authorId);
		}
	}
};

module.exports = resolveFunctions;
