import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

const PaginationPrev = props => (
	<Link
		to={{
			pathname: '/',
			query: {
				...props.location.query,
				page: (props.location.query.page ? parseInt(props.location.query.page, 10) : 2) - 1,
			},
		}}
	>
		<i className="mdi mdi-chevron-left" />
		<span>
			Previous
		</span>
	</Link>
);


export default withRouter(PaginationPrev);
