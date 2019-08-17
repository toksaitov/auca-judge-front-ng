import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import { connect } from 'react-redux';

const ArticlePreview = props => {
  const article = props.article;

  return (
    <div className="article-preview">
      <div className="article-meta">
        <div className="info">
          <Link className="author" to={`/@${article.author.username}`}>
            {article.author.username}
          </Link>
          <span className="date">
            {new Date(article.createdAt).toDateString()}
          </span>
        </div>
      </div>

      <Link to={`/article/${article.id}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
      </Link>
    </div>
  );
}

export default connect(() => ({}))(ArticlePreview);
