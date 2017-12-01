import { gql, graphql } from 'react-apollo';

const query = gql`
query keywordsQuery {
	keywords {
	_id
    title
    slug
    description
    descriptionRaw
    type
    count
    work
    subwork
    lineFrom
    lineTo
    lineLetter
    nLines
    tenantId
	}
}
`;

const queryById = gql`
query keywordsQuery($id: String!) {
  keywords(id: $id) {
	_id
    title
    slug
    description
    descriptionRaw
    type
    count
    work
    subwork
    lineFrom
    lineTo
    lineLetter
    nLines
    tenantId
  }
}
`;

const keywordRemove = gql`
	mutation keywordRemove($id: String!) {
	keywordRemove(keywordId: $id) {
		_id
	}
}
 `;
const keywordInsert = gql`
 mutation keywordInsert($keyword: KeywordInputType!) {
	keywordInsert(keyword: $keyword) {
	 _id
 }
}
`;

const keywordUpdate = gql`
	mutation keywordUpdate($id: String! $keyword: KeywordInputType!) {
	keywordUpdate(keywordId: $id keyword: $keyword) {
		_id
	}
}
 `;

const keywordsQuery = graphql(query, {
	name: 'keywordsQuery'
});

const keywordsQueryById = graphql(queryById, {
	options: ({params}) => {
		return ({
			variables: {
				id: params.id
			},
		});
	},
	name: 'keywordsQueryById'
});

const keywordRemoveMutation = graphql(keywordRemove, {
	props: (params) => ({
		keywordRemove: (id) => params.keywordRemoveMutation({variables: {id}}),
	}),
	name: 'keywordRemoveMutation',
	options: {
		refetchQueries: ['keywordsQuery']
	}
});

const keywordUpdateMutation = graphql(keywordUpdate, {
	props: (params) => ({
		keywordUpdate: (id, keyword) => params.keywordUpdateMutation({variables: {id, keyword}}),
	}),
	name: 'keywordUpdateMutation',
	options: {
		refetchQueries: ['keywordsQuery']
	}
});

const keywordInsertMutation = graphql(keywordInsert, {
	props: (params) => ({
		keywordInsert: (keyword) => params.keywordInsertMutation({variables: {keyword}}),
	}),
	name: 'keywordInsertMutation',
	options: {
		refetchQueries: ['keywordsQuery']
	}
});

export {
    keywordsQuery,
    keywordsQueryById,
    keywordRemoveMutation,
	keywordUpdateMutation,
	keywordInsertMutation
};
