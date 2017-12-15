/**
 * Queries for commenters
 */

import { GraphQLString, GraphQLID, GraphQLList } from 'graphql';

// types
import { CommenterType } from '/imports/graphql/types/models/commenter';

// logic
import CommentersService from '../logic/Commenters/commenters';

const commenterQueryFields = {
	commenters: {
		type: new GraphQLList(CommenterType),
		description: 'Get list of all commenters',
		args: {
			tenantId: {
				type: GraphQLString,
			},
		},
		async resolve(parent, { tenantId }, {token}) {
			const commentersService = new CommentersService({token});
			return await commentersService.commentersQuery(tenantId);
		},
	},
};


export default commenterQueryFields;
