import { GraphQLString, GraphQLNonNull } from 'graphql';
// types
import { ReferenceWorkType, ReferenceWorkInputType} from '/imports/graphql/types/models/referenceWork';
import { RemoveType } from '/imports/graphql/types/index';

// bll
import ReferenceWorksService from '../bll/referenceWorks';

const referenceWorksMutationFields = {
	referenceWorkRemove: {
		type: RemoveType,
		description: 'Remove a single reference work',
		args: {
			referenceWorkId: {
				type: new GraphQLNonNull(GraphQLString)
			}
		},
		async resolve(parent, {referenceWorkId}, {token}) {
			const referenceWorksService = new ReferenceWorksService({token});
			return await referenceWorksService.referenceWorkRemove(referenceWorkId);
		}
	},
	referenceWorkUpdate: {
		type: ReferenceWorkType,
		description: 'Update a single reference work',
		args: {
			referenceWorkId: {
				type: new GraphQLNonNull(GraphQLString)
			},
			referenceWork: {
				type: new GraphQLNonNull(ReferenceWorkInputType)
			}
		},
		async resolve(parent, {referenceWorkId, referenceWork}, {token}) {
			const referenceWorksService = new ReferenceWorksService({token});
			return await referenceWorksService.referenceWorkUpdate(referenceWorkId, referenceWork);
		}
	}
};

export default referenceWorksMutationFields;
