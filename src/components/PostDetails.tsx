import React, {useCallback, useEffect, useState} from 'react';
import {Loader} from './Loader';
import {NewCommentForm} from './NewCommentForm';
import {Post} from '../types/Post';
import {client} from '../utils/fetchClient';
import {Comment} from '../types/Comment';
import {UserWarning} from './UserWarning';

interface PostDetailsProps {
  post: Post;
  selectedUserId: number | null;
}

export const PostDetails: React.FC<PostDetailsProps> = ({
                                                          post,
                                                          selectedUserId
                                                        }) => {
  const [hasError, setHasError] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [areCommentsLoading, setAreCommentsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deleteError, setDeleteError] = useState<number | null>(null);

  const loadComments = useCallback(async () => {
    setAreCommentsLoading(true);
    setHasError(false);
    setComments(null);

    try {
      const comments1 = await client.get<Comment[]>(
        `/comments?postId=${post.id}`
      );

      setComments(comments1);
    } catch (err) {
      setHasError(true);
      setComments(null);
    } finally {
      setAreCommentsLoading(false);
    }
  }, [post.id]);

  useEffect(() => {
    void loadComments();
    // Приховування форми при публікації змін
    // setIsFormVisible(false);
  }, [loadComments]);

  useEffect(() => {
    // Приховуємо форму коментарів, коли вибір користувача змінюється
    if (isFormVisible) {
      setIsFormVisible(false);
    }
  }, [selectedUserId]);

  const handleCommentAdd = (comment: Comment) => {
    setComments((prevComments) => [...(prevComments || []), comment]);
  };

  const handleDelete = async (id: number) => {
    // Оптимістичне видалення
    const originalComments = comments;

    setComments((prev) =>
      prev ? prev.filter((comment) => comment.id !== id) : prev
    );
    setDeleteError(null);

    try {
      await client.delete(`/comments/${id}`);
    } catch {
      // Скасувати стан після помилки
      setComments(originalComments);
      setDeleteError(id);
    }
  };

  const handleRetryDelete = (id: number) => {
    setDeleteError(null); // Очистити повідомлення про помилку
    void handleDelete(id); // Повторити видалення
  };

  return (
    <div className="content" data-cy="PostDetails">
      <div className="block">
        <h2 data-cy="PostTitle">
          #{post.id}: {post.title}
        </h2>

        <p data-cy="PostBody">{post.body}</p>
      </div>

      <div className="block">
        {areCommentsLoading && <Loader/>}

        {hasError && (
          <UserWarning
            message="Something went wrong while loading comments"
            dataCy="CommentsError"
          />
        )}

        {comments && comments.length === 0 && !areCommentsLoading && (
          <p className="title is-4" data-cy="NoCommentsMessage">
            No comments yet
          </p>
        )}

        {comments && comments.length > 0 && (
          <>
            <p className="title is-4">Comments:</p>
            {comments.map((comment) => (
              <article
                className="message is-small"
                data-cy="Comment"
                key={comment.id}
              >
                <div className="message-header">
                  <a href={`mailto:${comment.email}`} data-cy="CommentAuthor">
                    {comment.name}
                  </a>
                  <button
                    data-cy="CommentDelete"
                    type="button"
                    className="delete is-small"
                    aria-label="delete"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleteError === comment.id}
                  />
                </div>
                <div className="message-body" data-cy="CommentBody">
                  {comment.body}
                  {deleteError === comment.id && (
                    <div className="notification is-danger is-light mt-2 p-1">
                      Deletion failed.
                      <button
                        className="button is-small is-danger is-light ml-2"
                        onClick={() => handleRetryDelete(comment.id)}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </>
        )}

        {!areCommentsLoading && !isFormVisible && !hasError && (
          <button
            data-cy="WriteCommentButton"
            type="button"
            className="button is-link"
            onClick={() => setIsFormVisible((prev) => !prev)}
          >
            Write a comment
          </button>
        )}
      </div>

      {isFormVisible && (
        <NewCommentForm postId={post.id} onCommentAdd={handleCommentAdd}/>
      )}
    </div>
  );
};
