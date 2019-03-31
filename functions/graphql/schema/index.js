const { ApolloServer, gql } = require('apollo-server-express');
const resolvers = require('../resolvers');

const typeDefs = gql`
	# ---------------- Example for Search Demo ----------------------
	type IceCream {
		id: Int!
		name: String!
		description: String!
		rating: Float
		searchField: String
	}

	input CreateIceCreamInput {
		name: String!
		description: String!
		rating: Float
	}

	input TableIceCreamFilterInput {
		id: TableIDFilterInput
		name: TableStringFilterInput
		description: TableStringFilterInput
		rating: TableFloatFilterInput
		searchField: TableStringFilterInput
	}

	input TableIDFilterInput {
		id: Int!
	}

	input TableFloatFilterInput {
		rating: Float!
	}

	input TableStringFilterInput {
		ne: String
		eq: String
		le: String
		lt: String
		ge: String
		gt: String
		contains: String
		notContains: String
		between: [String]
		beginsWith: String
	}

	type IceCreamConnection {
		items: [IceCream]!
		nextToken: String
	}

	# mutation create {
	# 	createIceCream(input: {
	# 		name: "Peanut Butter World"
	# 		description: "Milk chocolate ice cream with peanut buttery swirls & chocolate cookie swirls"
	# 	}) {
	# 		name
	# 	}
	# }

	# ----------------------------------

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
		email: String
		firstName: String
		lastName: String
	}

	type SearchPosts {
		posts: [Post]
		nexToken: String
	}

	# the schema allows the following query:
	type Query {
		posts: [Post]
		author(id: Int!): Author
		users: [User]
		searchPosts(filter: String, limit: Int, nextToken: String): SearchPosts
		getIceCream(id: Int): IceCream
		listIceCreams(filter: TableIceCreamFilterInput, limit: Int, nextToken: String): IceCreamConnection
	}

	# this schema allows the following mutation:
	type Mutation {
		upvotePost(postId: Int!): Post
		#listUsers(filter: TableUserFilterInput, limit: Int, nextToken: String): UserResults
		createIceCream(input: CreateIceCreamInput): IceCream
	}
	#  IceCreamConnection.items must be Input Type but got: [IceCream]
	# input UserResults {
	# 	user: TableUserFilterInput
	# 	nextToken: String
	# }

	# input TableUserFilterInput {
	# 	firstName: TableStringFilterInput
	# 	lastName: TableStringFilterInput
	# 	email: TableStringFilterInput
	# 	searchField: TableStringFilterInput
	# }

	# input TableStringFilterInput {
	# 	ne: String
	# 	eq: String
	# 	le: String
	# 	lt: String
	# 	ge: String
	# 	gt: String
	# 	contains: String
	# 	notContains: String
	# 	between: [String]
	# 	beginsWith: String
	# }
`;
const graphqlServer = new ApolloServer({
	typeDefs,
	resolvers
});
module.exports = graphqlServer;
