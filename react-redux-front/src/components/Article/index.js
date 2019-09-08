import ArticleMeta from './ArticleMeta';
import CommentContainer from './CommentContainer';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import marked from 'marked';
import { ARTICLE_PAGE_LOADED, ARTICLE_PAGE_UNLOADED } from '../../constants/actionTypes';

const mapStateToProps = state => ({
  ...state.article,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onLoad: payload =>
    dispatch({ type: ARTICLE_PAGE_LOADED, payload }),
  onUnload: () =>
    dispatch({ type: ARTICLE_PAGE_UNLOADED })
});

class Article extends React.Component {
  componentWillMount() {
    this.props.onLoad(Promise.all([
      agent.Articles.get(this.props.match.params.id),
      agent.Comments.forArticle(this.props.match.params.id)
    ]));
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    if (!this.props.article) {
      return null;
    }

    const markup = { __html: marked(this.props.article.body, { sanitize: true }) };
    const canModify = this.props.currentUser &&
      this.props.currentUser.username === this.props.article.author.username;
    return (
      <div className="article-page">
        <div className="banner">
          <div className="container">
            <h1>{this.props.article.title}</h1>
            <h2 style={{fontColor: 'white'}}>Язык: {this.props.article['language']}</h2>
            <ArticleMeta
              article={this.props.article}
              canModify={canModify} />
          </div>
        </div>
        
        <div className="container page">

          <div className="row article-content">
            <div className="col-xs-12">
              <div dangerouslySetInnerHTML={markup}></div>
            </div>
          </div>

          <hr />

          <div className="article-actions">
          </div>

          <script src="front.js"></script>
          <form id="problemForm" method="post" action="http://auca.space:8080/submit">
            <input type="hidden" name="id" value="572709f8d12a816dfbde7a87"></input>
            <textarea name="submission" value="int main() { return 1; }"></textarea>
            <input type="submit" name="submit" value="submit"></input>
          </form>
          <aside class="results">
          <h2>Results</h2>
          <p class="error" style={{'display' : 'none'}}></p>
          <table>
            <thead>
              <tr>
                <th>Test #</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </aside>

          <div className="row">
            <CommentContainer
              comments={this.props.comments || []}
              errors={this.props.commentErrors}
              slug={this.props.match.params.id}
              currentUser={this.props.currentUser} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Article);
