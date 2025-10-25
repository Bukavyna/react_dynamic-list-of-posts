import React, { useState } from 'react';
import { client } from '../utils/fetchClient';
import { Comment } from '../types/Comment';

interface NewCommentFormProps {
  postId: number | string;
  onCommentAdd: (comment: Comment) => void;
}

export const NewCommentForm: React.FC<NewCommentFormProps> = ({
  postId,
  onCommentAdd,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');

  const [hasNameError, setHasNameError] = useState(false);
  const [hasEmailError, setHasEmailError] = useState(false);
  const [hasTextError, setHasTextError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const clearTextField = () => {
    setText('');
  };

  const handleSubmitClick = async (event: React.FormEvent) => {
    event.preventDefault();

    // Незалежна перевірка кожного поля
    const nameEmpty = name.trim() === '';
    const mailEmpty = email.trim() === '';
    const textEmpty = text.trim() === '';

    // Незалежне встановлення стану помилки для кожного поля
    setHasEmailError(mailEmpty);
    setHasNameError(nameEmpty);
    setHasTextError(textEmpty);

    // Загальна перевірка для блокування подачі форми
    if (mailEmpty || nameEmpty || textEmpty) {
      return;
    }

    // --- ЛОГІКА УСПІШНОЇ ПОДАЧІ ---
    const newComment = {
      postId: Number(postId),
      name: name.trim(),
      email: email.trim(),
      body: text.trim(),
      id: Math.floor(Math.random() * 1000000),
    };

    setIsLoading(true);

    try {
      const addedComment = await client.post('/comments', newComment);

      clearTextField();
      onCommentAdd(addedComment as Comment);
    } catch (error) {
      clearTextField();
      onCommentAdd(newComment as Comment);
    } finally {
      setIsLoading(false);
    }
  };

  // Очищення форми
  const clearAllField = () => {
    setName('');
    setEmail('');
    setText('');

    // Додатково скидаємо всі стани помилок
    setHasNameError(false);
    setHasEmailError(false);
    setHasTextError(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setEmail(newValue);

    if (hasEmailError && newValue.trim() !== '') {
      setHasEmailError(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setName(newValue);

    if (hasNameError && newValue.trim() !== '') {
      setHasNameError(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    setText(newValue);

    if (hasTextError && newValue.trim() !== '') {
      setHasTextError(false);
    }
  };

  return (
    <form data-cy="NewCommentForm" onSubmit={handleSubmitClick}>
      <div className="field" data-cy="NameField">
        <label className="label" htmlFor="comment-author-name">
          Author Name
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="name"
            id="comment-author-name"
            placeholder="Name Surname"
            className={`input ${hasNameError ? 'is-danger' : ''}`}
            value={name}
            onChange={handleNameChange}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-user" />
          </span>

          {hasNameError && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>

        {hasNameError && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Name is required
          </p>
        )}
      </div>

      <div className="field" data-cy="EmailField">
        <label className="label" htmlFor="comment-author-email">
          Author Email
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="email"
            name="email"
            id="comment-author-email"
            placeholder="email@test.com"
            className={`input ${hasEmailError ? 'is-danger' : ''}`}
            value={email}
            onChange={handleEmailChange}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-envelope" />
          </span>

          {hasEmailError && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>

        {hasEmailError && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Email is required
          </p>
        )}
      </div>

      <div className="field" data-cy="BodyField">
        <label className="label" htmlFor="comment-body">
          Comment Text
        </label>

        <div className="control">
          <textarea
            id="comment-body"
            name="body"
            placeholder="Type comment here"
            className={`textarea ${hasTextError ? 'is-danger' : ''}`}
            value={text}
            onChange={handleTextChange}
          />
        </div>

        {hasTextError && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Enter some text
          </p>
        )}
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button
            type="submit"
            className={`button is-link ${isLoading ? 'is-loading' : ''}`}
            disabled={isLoading}
          >
            Add
          </button>
        </div>

        <div className="control">
          {/* eslint-disable-next-line react/button-has-type */}
          <button
            type="reset"
            className="button is-link is-light"
            onClick={clearAllField}
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};
