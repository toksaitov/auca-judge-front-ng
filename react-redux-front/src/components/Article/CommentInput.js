
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import { ADD_COMMENT } from '../../constants/actionTypes';
import { bindActionCreators } from 'redux';

const changeText = (payload1) => {
  return {
    type: 'CHANGE_COMMENT',
    payload: payload1
}
} 

const mapDispatchToProps = dispatch => ({
  changeText: bindActionCreators(changeText, dispatch),
  onSubmit: payload =>
    dispatch({ type: ADD_COMMENT, payload })
});

const mapStateToProps = state => ({
  ...state.article, commentBody: state.article.commentBody
});

class CommentInput extends React.Component {
  constructor() {
    super();

    //this.setBody = ev => {
     //body: ev.target.value });
    //};

    this.createComment = ev => {
      ev.preventDefault();
      //const payload = agent.Comments.create(this.props.match.params.id,
        //{ body: ev.target.value });
      console.log('awefaw', this.props);
      this.props.onSubmit(this.props.commentBody);
    };
  }
  
  render() {
    return (
      <form className="card comment-form" onSubmit={this.createComment}>
        <div className="card-block">
          <textarea className="form-control"
            placeholder="Write your code..."
            onChange={(event) => {
              this.props.changeText(event.target.value)
            }}
            value={this.props.body}
            rows="20">
          </textarea>
        </div>
        <div className="card-footer">
          <button
            className="btn btn-sm btn-primary"
            type="submit">
            Submit
          </button>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentInput);

//onChange={this.setBody}

