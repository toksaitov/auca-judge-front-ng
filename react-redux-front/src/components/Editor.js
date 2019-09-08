import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  EDITOR_PAGE_LOADED,
  ARTICLE_SUBMITTED,
  EDITOR_PAGE_UNLOADED,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

const mapStateToProps = state => ({
  ...state.editor
});

const mapDispatchToProps = dispatch => ({
  onLoad: payload =>
    dispatch({ type: EDITOR_PAGE_LOADED, payload }),
  onSubmit: payload =>
    dispatch({ type: ARTICLE_SUBMITTED, payload }),
  onUnload: payload =>
    dispatch({ type: EDITOR_PAGE_UNLOADED }),
  onUpdateField: (key, value) =>
    dispatch({ type: UPDATE_FIELD_EDITOR, key, value })
});

class Editor extends React.Component {
  constructor() {
    super();

    const updateFieldEvent =
      key => ev => this.props.onUpdateField(key, ev.target.value);

    this.changeTitle = updateFieldEvent('title');
    this.changeBody = updateFieldEvent('body');
    this.changeLanguage = updateFieldEvent('language');
    this.changeTests = updateFieldEvent('tests');

    this.submitForm = ev => {
      ev.preventDefault();
      const article = {
        'title': this.props.title,
        'content': this.props.body,
        'language': this.props.language || 'C',
        'tests': this.props.tests,
        'published': true
      };

      const id = { id: this.props.articleID };
      const promise = this.props.articleID ?
        agent.Articles.update(Object.assign(article, id)) :
        agent.Articles.create(article);

      this.props.onSubmit(promise);
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      if (nextProps.match.params.id) {
        this.props.onUnload();
        return this.props.onLoad(agent.Articles.get(this.props.match.params.id));
      }
      this.props.onLoad(null);
    }
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      return this.props.onLoad(agent.Articles.get(this.props.match.params.id));
    }
    this.props.onLoad(null);
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    return (
      <div className="editor-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-10 offset-md-1 col-xs-12">

              <ListErrors errors={this.props.errors}></ListErrors>

              <form>
                <fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Article Title"
                      value={this.props.title}
                      onChange={this.changeTitle} />
                  </fieldset>

                  <fieldset className="form-group">
                    <textarea
                      className="form-control"
                      rows="8"
                      placeholder="Problem Description (in markdown)"
                      value={this.props.body}
                      onChange={this.changeBody}>
                    </textarea>
                  </fieldset>

                  <fieldset className="form-group">
                    <select
                      className="form-control languageInput"
                      onClick={this.changeLanguage} required>
                        <option>C</option>
                        <option>Swift</option>
                    </select>
                  </fieldset>

                  <fieldset className="form-group">
                    <textarea
                      className="form-control"
                      rows="8"
                      placeholder="Write your tests (in markdown)"
                      value={this.props.tests}
                      onChange={this.changeTests}>
                    </textarea>
                  </fieldset>

                  <button
                    className="btn btn-lg pull-xs-right btn-primary"
                    type="button"
                    disabled={this.props.inProgress}
                    onClick={this.submitForm}>
                    Publish Article
                  </button>

                </fieldset>
              </form>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
