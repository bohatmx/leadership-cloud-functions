const { ApolloServer, gql } = require('apollo-server-express');
const resolvers = require('../resolvers');

const typeDefs = gql`
	type UserResults {
		users: [User]!
		nextToken: String
	}

	type VideoResults {
		videos: [Video]!
		nextToken: String
	}

	type PodcastResults {
		podcasts: [Podcast]!
		nextToken: String
	}

	type ArticleResults {
		articles: [Article]!
		nextToken: String
	}

	type ThoughtResults {
		thoughts: [Thought]!
		nextToken: String
	}

	# ----------------------------------

	type User {
		userID: String!
		email: String
		firstName: String
		lastName: String
	}

	type Video {
		videoID: String!
		userName: String!
		photoURL: String
		caption: String
		description: String
		companyName: String
		url: String
		user: [User]
	}

	type Podcast {
		userID: String!
		userName: String!
		title: String!
		companyName: String
		photoURL: String
		podcastID: String!
	}

	type Thought {
		journalUserID: String!
		journalUserName: String!
		logo: String
		photoURL: String
		slogan: String
		title: String
		dailyThoughtID: String!
		dailyThoughtDescription: String
		stringDateRegistered: String
		subtitle: String
		userType: String
		companyName: String
		companyID: String!
	}

	type Article {
		articleLink: String
		articleTypeDescription: String
		body: String
		companyID: String
		companyName: String
		dailyThoughtDescription: String
		journalUserID: String!
		journalUserName: String!
		newsID: String!
		photoURL: String
		stringDateRegistered: String
		subtitle: String
		title: String
		userType: String
	}

	# the schema allows the following query:
	type Query {
		listUsers(filter: FilterInput, limit: Int!, nextToken: String): UserResults
		listThoughts(filter: FilterInput, limit: Int!, nextToken: String): ThoughtResults
		listVideos(filter: FilterInput, limit: Int!, nextToken: String): VideoResults
		listPodcasts(filter: FilterInput, limit: Int!, nextToken: String): PodcastResults
		listArticles(filter: FilterInput, limit: Int!, nextToken: String): ArticleResults
	}

	# this schema allows the following mutation:

	input FilterInput {
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
`;
const graphqlServer = new ApolloServer({
	typeDefs,
	resolvers
});
module.exports = graphqlServer;
