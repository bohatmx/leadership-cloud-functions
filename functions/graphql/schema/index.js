const { ApolloServer, gql } = require('apollo-server-express');
const resolvers = require('../resolvers');

const typeDefs = gql`
	type Author {
		id: Int! # the ! means that every author object _must_ have an id
		firstName: String
		lastName: String
		posts: [Post] # the list of Posts by this author
	}

	type Post {
		id: Int!
		title: String
		author: Author
		votes: Int
	}

	type User {
		userID: String
		email: String
		firstName: String
		lastName: String
		photoURL: String
	}

	# the schema allows the following query:
	type Query {
		posts: [Post]
		author(id: Int!): Author
		users: [User]
	}

	# this schema allows the following mutation:
	type Mutation {
		upvotePost(postId: Int!): Post
	}
`;
const graphqlServer = new ApolloServer({
	typeDefs,
	resolvers
});
module.exports = graphqlServer;
