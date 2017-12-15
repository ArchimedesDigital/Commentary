import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import autoBind from 'react-autobind';
import { compose } from 'react-apollo';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import Checkbox from 'material-ui/Checkbox';
import {
	FormGroup,
	ControlLabel,
	FormControl,
} from 'react-bootstrap';
import Select from 'react-select';
import update from 'immutability-helper';

// components
import { ListGroupDnD, createListGroupItemDnD } from '/imports/ui/components/shared/ListDnD';

// graphql
import { keywordsQuery } from '/imports/graphql/methods/keywords';

const ListGroupItemDnD = createListGroupItemDnD('tagBlocks');
class TagsInput extends Component {
	constructor(props) {
		super(props);
		this.state = {};	
		this.props.keywordsQuery.refetch({
			tenantId: sessionStorage.getItem('tenantId')
		});
	}
	componentWillReceiveProps(props) {
		this.setState({
			tags: props.keywordsQuery.loading ? [] : props.keywordsQuery.keywords
		});
	}
	render() {
		const {
			tagsValue, addTagBlock, removeTagBlock, moveTagBlock,
			onTagValueChange, onIsMentionedInLemmaChange, selectTagType, addNewTag
		} = this.props;
		const { tags } = this.state;

		if (!tags) {
			return (
				<div className="comment-reference comment-tags" />
			);
		}

		return (
			<div className="comment-reference comment-tags">
				<h4>Tag(s):</h4>
				<FormGroup
					controlId="tags"
					className="form-group--referenceWorks"
				>
					<ListGroupDnD>
						{tagsValue.map((tag, i) => {
							const _tagsOptions = [];
							tags.forEach((t) => {
								_tagsOptions.push({
									value: t._id,
									label: t.title,
									slug: t.slug,
									type: t.type,
									i,
								});
							});

							return (
								<ListGroupItemDnD
									key={tag.tagId}
									index={i}
									className="form-subitem form-subitem--referenceWork"
									moveListGroupItem={moveTagBlock}
								>
									<div
										className="reference-work-item"
									>
										<div
											className="remove-reference-work-item"
											onClick={removeTagBlock.bind(this, i)}
										>
											<IconButton
												iconClassName="mdi mdi-close"
												style={{
													padding: '0',
													width: '32px',
													height: '32px',
													borderRadius: '100%',
													border: '1px solid #eee',
													color: '#666',
													margin: '0 auto',
													background: '#f6f6f6',
												}}
											/>
										</div>
										<Select.Creatable
											name="tags"
											id="tags"
											required={false}
											options={_tagsOptions}
											defaultValue={tagsValue[i].tagId}
											value={tagsValue[i].tagId}
											onChange={(x) => onTagValueChange(x, i)}
											placeholder="Tags . . ."
											onNewOptionClick={addNewTag}
										/>
										{tagsValue[i].keyword && tagsValue[i].keyword.type ?
											<FormGroup>
												<ControlLabel>Tag type</ControlLabel>
												<FormControl onChange={(event) => { selectTagType(tagsValue[i].tagId, event, i); }} value={tagsValue[i].keyword.type} componentClass="select" placeholder="select">
													<option value="word">word</option>
													<option value="idea">idea</option>
												</FormControl>
											</FormGroup> : ''
										}
										<FormGroup>
											<ControlLabel>Is Not Mentioned in Lemma: </ControlLabel>
											<Checkbox
												name={`${i}_isNotMentionedInLemma`}
												checked={tagsValue[i].isNotMentionedInLemma}
												onCheck={onIsMentionedInLemmaChange.bind(null, tag, i)}
												style={{
													display: 'inline-block',
													verticalAlign: 'top',
													width: 'auto',
												}}
											/>
										</FormGroup>
									</div>
								</ListGroupItemDnD>
							);
						})}
					</ListGroupDnD>
					<RaisedButton
						label="Add Tag"
						onClick={addTagBlock}
					/>
				</FormGroup>
			</div>
		);
	}

}

TagsInput.propTypes = {
	tagsValue: PropTypes.array,
	addTagBlock: PropTypes.func,
	removeTagBlock: PropTypes.func,
	moveTagBlock: PropTypes.func,
	onTagValueChange: PropTypes.func,
	onIsMentionedInLemmaChange: PropTypes.func,
	selectTagType: PropTypes.func,
	addNewTag: PropTypes.func,
	keywordsQuery: PropTypes.object
};
export default compose(keywordsQuery)(TagsInput);
