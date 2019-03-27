const admin = require('firebase-admin');

const authors = [
	{ id: 1, firstName: 'Tom', lastName: 'Coleman' },
	{ id: 2, firstName: 'Sashko', lastName: 'Stubailo' }
];

const posts = [
	{ id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
	{ id: 2, authorId: 2, title: 'GraphQL Rocks', votes: 3 },
	{ id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 }
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
		}
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
