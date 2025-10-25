/* eslint-disable @typescript-eslint/indent */
import classNames from 'classnames';
import React from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import {useEffect, useState} from 'react';
import {client} from './utils/fetchClient';
import {PostsList} from './components/PostsList';
import {PostDetails} from './components/PostDetails';
import {UserSelector} from './components/UserSelector';
import {Loader} from './components/Loader';

import {User} from './types/User';
import {Post} from './types/Post';

export const App = () => {
  // СТАН ДЛЯ КОРИСТУВАЧІВ
  const [users, setUsers] = useState<User[]>([]); // — список користувачів
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [, setUsersError] = useState<string | null>(null);

  // СТАН ДЛЯ ПОСТІВ
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Решта станів
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // — id вибраного користувача
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // З асинхронним завантаженням користувачів
  useEffect(() => {
    const loadUsers = async () => {
      setIsUsersLoading(true);
      setUsersError(null);

      try {
        const loadedUsers = await client.get<User[]>('/users');

        setUsers(loadedUsers);
      } catch (err) {
        setUsersError('Failed to load users');
      } finally {
        setIsUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Завантаження постів після вибору користувача
  useEffect(() => {
    if (selectedUserId === null) {
      setPosts([]);

      return;
    }

    const loadPosts = async () => {
      setIsPostsLoading(true);
      setPostsError(null);
      setPosts([]);

      try {
        const loadedPosts = await client.get<Post[]>(
          `/posts?userId=${selectedUserId}`
        );

        setPosts(loadedPosts);
      } catch (error) {
        setPostsError('Something went wrong!');
      } finally {
        setIsPostsLoading(false);
      }
    };

    loadPosts();
  }, [selectedUserId]);

  const handleUserSelect = (userId: number | null) => {
    setSelectedUserId(userId);
    setSelectedPost(null);
  };

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          {/* ===== Ліва панель: вибір користувача та пости ===== */}
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              {/* ===== User Selector ===== */}
              <div className="block">
                {isUsersLoading && <Loader/>}

                <UserSelector // — компонент, який дозволяє вибрати користувача
                  users={users}
                  onSelect={handleUserSelect}
                  selectedId={selectedUserId}
                />
              </div>

              {/* ===== Main Content ===== */}
              <div className="block" data-cy="MainContent">
                {selectedUserId === null && (
                  <p data-cy="NoSelectedUser">No user selected</p>
                )}
                {selectedUserId !== null && isPostsLoading && <Loader/>}
                {postsError && (
                  <div
                    className="notification is-danger"
                    data-cy="PostsLoadingError"
                  >
                    {postsError}
                  </div>
                )}
                {!isPostsLoading &&
                  !postsError &&
                  selectedUserId !== null &&
                  posts.length === 0 && (
                    <div
                      className="notification is-warning"
                      data-cy="NoPostsYet"
                    >
                      No posts yet
                    </div>
                  )}

                {posts.length > 0 && (
                  <PostsList posts={posts} onSelectPost={setSelectedPost}/>
                )}
              </div>
            </div>
          </div>

          {/* ===== Sidebar ===== */}
          <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              {'Sidebar--open': selectedPost !== null}
            )}
          >
            <div className="tile is-child box is-success ">
              {selectedPost ? (
                <PostDetails
                  post={selectedPost}
                  selectedUserId={selectedUserId}
                />
              ) : (
                <p>Select a post to see details</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
