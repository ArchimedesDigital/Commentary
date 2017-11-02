import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';
import { Random } from 'meteor/random';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import Cookies from 'js-cookie';
import slugify from 'slugify';

// https://github.com/JedWatson/react-select
import Formsy from 'formsy-react';
import { FormsyText } from 'formsy-material-ui/lib';
import {
	FormGroup,
	ControlLabel,
} from 'react-bootstrap';
import Select from 'react-select';
import update from 'immutability-helper';

// components
import { ListGroupDnD, createListGroupItemDnD } from '/imports/ui/components/shared/ListDnD';



const ListGroupItemDnD = createListGroupItemDnD('referenceWorkBlocks');

/*
 *	BEGIN AddComment
 */
export default class ReferenceWork extends React.Component {
	static propTypes = {
		referenceWorkOptions: PropTypes.array,
	};

	static defaultProps = {
		selectedLineFrom: null,
		referenceWorkOptions: [],
	};

	constructor(props) {
		super(props);

		this.state = {
			referenceWorks: [],
		};

		// methods:
		this.onReferenceWorksValueChange = this.onReferenceWorksValueChange.bind(this);
		this.addReferenceWorkBlock = this.addReferenceWorkBlock.bind(this);
		this.removeReferenceWorkBlock = this.removeReferenceWorkBlock.bind(this);
        this.moveReferenceWorkBlock = this.moveReferenceWorkBlock.bind(this);
	}
	onReferenceWorksValueChange(referenceWork) {
		const referenceWorks = this.state.referenceWorks;
		referenceWorks[referenceWork.i].referenceWorkId = referenceWork.value;

		this.setState({
			referenceWorks,
		});

	}
	addReferenceWorkBlock() {
		this.state.referenceWorks.push({ referenceWorkId: Random.id() });
		this.setState({
			referenceWorks: this.state.referenceWorks,
        });
        this.props.update(this.state.referenceWorks);
	}

	removeReferenceWorkBlock(i) {
		this.setState({
			referenceWorks: update(this.state.referenceWorks, { $splice: [[i, 1]] }),
        });
        this.props.update(this.state.referenceWorks);
	}

	moveReferenceWorkBlock(dragIndex, hoverIndex) {
		const { referenceWorks } = this.state;
		const dragIntroBlock = referenceWorks[dragIndex];

		this.setState(update(this.state, {
			referenceWorks: {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, dragIntroBlock],
				],
			},
        }));
        this.props.update(this.state.referenceWorks);
	}
	render() {
		const { referenceWorks } = this.state;
		const { referenceWorkOptions } = this.props;
		if (!this.props.ready) {
		    return null;
		}
		return (

            <div className="comment-reference">
                <h4>Secondary Source(s):</h4>
                <FormGroup
                    controlId="referenceWorks"
                    className="form-group--referenceWorks"
                >
                    <ListGroupDnD>
                        {/*
                            DnD: add the ListGroupItemDnD component
                            IMPORTANT:
                            "key" prop must not be taken from the map function - has to be unique like _id
                            value passed to the "key" prop must not be then edited in a FormControl component
                                - will cause errors
                            "index" - pass the map functions index variable here
                        */}
                        {referenceWorks.map((referenceWork, i) => {
                            const _referenceWorkOptions = [];
                            referenceWorkOptions.forEach((rW) => {
                                _referenceWorkOptions.push({
                                    value: rW.value,
                                    label: rW.label,
                                    slug: rW.slug,
                                    type: rW.type,
                                    i,
                                });
                            });

                            return (
                                <ListGroupItemDnD
                                    key={referenceWork.referenceWorkId}
                                    index={i}
                                    className="form-subitem form-subitem--referenceWork"
                                    moveListGroupItem={this.moveReferenceWorkBlock}
                                >
                                    <div
                                        className="reference-work-item"
                                    >
                                        <div
                                            className="remove-reference-work-item"
                                            onClick={this.removeReferenceWorkBlock.bind(this, i)}
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
                                        <Select
                                            name="referenceWorks"
                                            id="referenceWorks"
                                            required={false}
                                            options={_referenceWorkOptions}
                                            value={this.state.referenceWorks[i].referenceWorkId}
                                            onChange={this.onReferenceWorksValueChange}
                                            placeholder="Reference Work . . ."
                                        />
                                        <FormGroup>
                                            <ControlLabel>Section Number: </ControlLabel>
                                            <FormsyText
                                                name={`${i}_section`}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <ControlLabel>Chapter Number: </ControlLabel>
                                            <FormsyText
                                                name={`${i}_chapter`}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <ControlLabel>Translation Number: </ControlLabel>
                                            <FormsyText
                                                name={`${i}_translation`}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <ControlLabel>Note Number: </ControlLabel>
                                            <FormsyText
                                                name={`${i}_note`}
                                            />
                                        </FormGroup>
                                    </div>
                                </ListGroupItemDnD>
                            );
                        })}
                    </ListGroupDnD>
                    <RaisedButton
                        label="Add Reference Work"
                        onClick={this.addReferenceWorkBlock}
                    />
                </FormGroup>
            </div>
		);

	}
}