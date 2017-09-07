import { GraphQLID, GraphQLList } from 'graphql';

// types
import {EditionsType} from '/imports/graphql/types/models/editions';

// bll
import EditionsService from '../bll/editions';

const editionsQueryFields = {
	editions: {
		type: new GraphQLList(EditionsType),
		description: 'Get list of all editions',
		args: {
			editionId: {
				type: GraphQLID,
			},
		},
		async resolve(parent, { editionId }, {token}) {
			const editionsService = new EditionsService({token});
			return await editionsService.editionsGet(editionId);
		},
	},
};


export default editionsQueryFields;
