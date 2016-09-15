import {Tabs, Tab} from 'material-ui/Tabs';
// import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// https://github.com/JedWatson/react-select
import Select from 'react-select';
import 'react-select/dist/react-select.css';

AddCommentForm = React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object.isRequired,
    },

    getChildContext() {
        return {muiTheme: getMuiTheme(baseTheme)};
    },

    getInitialState(){
        return {
            titleValue: '',
            textValue: '',
            referenceValue: '',
            referenceLinkValue: '',
            keywordValue: '',
            keyideasValue: '',
        };
    },

    mixins: [ReactMeteorData],

    getMeteorData() {
        var keywords_options = [];
        var keywords = Keywords.find().fetch();
        keywords.map(function(word) {
            keywords_options.push({
                value: word.slug,
                label: word.title,
            });
        });
        
        // TODO: key ideas
        var keyideas_options = [];

        return {
            keywords_options: keywords_options,
            keyideas_options: keyideas_options,
        }
    },

    handleSubmit(event) {
      event.preventDefault();
      console.log('state', this.state);
      // TODO: update collection
    },

    titleValueChange(event) {
      this.setState({
        titleValue: event.target.value
      });
    },

    textValueChange(event) {
      this.setState({
        textValue: event.target.value
      });
    },

    referenceValueChange(event) {
      this.setState({
        referenceValue: event.target.value
      });
    },

    referenceLinkValueChange(event) {
      this.setState({
        referenceLinkValue: event.target.value
      });
    },

    keywordsValueChange(val) {
      this.setState({
        keywordValue: val
      });
    },

    keyideasValueChange(val) {
      this.setState({
        keyideasValue: val
      });
    },

    render() {

        var keyideas_options = [
        // TODO: pull keyideas_options from collection in getMeteorData
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' }
        ];

        return (

            <div className="add-comment-form">

                <form id="addCommentForm" onSubmit={this.handleSubmit}>

                    <TextField
                        name="title"
                        id="title"
                        className="form-element"
                        required={true}
                        floatingLabelText="Title"
                        value={this.state.titleValue}
                        onChange={this.titleValueChange}
                    />

                    <TextField
                        name="text"
                        id="text"
                        className="form-element"
                        required={true}
                        floatingLabelText="Text"
                        multiLine={true}
                        value={this.state.textValue}
                        onChange={this.textValueChange}
                    />

                    <TextField
                        name="reference"
                        id="reference"
                        className="form-element"
                        required={false}
                        floatingLabelText="Reference"
                        value={this.state.referenceValue}
                        onChange={this.referenceValueChange}
                    />

                    <TextField
                        name="referenceLink"
                        id="referenceLink"
                        className="form-element"
                        required={false}
                        floatingLabelText="Reference Link"
                        value={this.state.referenceLinkValue}
                        onChange={this.referenceLinkValueChange}
                    />

                    <h5>Keywords:</h5>

                    <Select
                        name="keywords"
                        id="keywords"
                        className="form-element"
                        required={false}
                        options={this.data.keywords_options}
                        multi={true}
                        allowCreate={true}
                        value={this.state.keywordValue}
                        onChange={this.keywordsValueChange}
                    />

                    <h5>Keyideas:</h5>

                    <Select
                        name="keyideas"
                        id="keyideas"
                        className="form-element"
                        required={false}
                        value="one"
                        options={this.data.keyideas_options}
                        multi={true}
                        allowCreate={true}
                        value={this.state.keyideasValue}
                        onChange={this.keyideasValueChange}
                    />

                    <RaisedButton 
                        type="submit"
                        label="Add comment"
                        labelPosition="after"
                        icon={<FontIcon className="mdi mdi-plus" />}
                    />
                    
                </form>

            </div>

        );
    }
});
