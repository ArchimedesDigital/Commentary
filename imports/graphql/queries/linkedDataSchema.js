/**
 * Queries for linked data schemas
 */

import { GraphQLString, GraphQLList } from 'graphql';

// types
import { LinkedDataSchemaType } from '/imports/graphql/types/models/linkedDataSchema';

// logic
import LinkedDataSchemaService from '../logic/linkedDataSchema';

const linkedDataSchemaFields = {
	linkedDataSchema: {
		type: new GraphQLList(LinkedDataSchemaType),
		description: 'Get linked data schema',
		args: {
			_id: {
				type: GraphQLString,
			}
		},
		async resolve(parent, { _id }, {token}) {
			const linkedDataSchemaService = new LinkedDataSchemaService({token});
			return await linkedDataSchemaService.linkedDataSchemaGet(_id);
		}
	}
};


export default linkedDataSchemaFields;
