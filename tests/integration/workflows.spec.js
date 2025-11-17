const { test, expect } = require('@playwright/test');
const { TestDataFactory } = require('../helpers/testData');

/**
 * Integration Test Suite
 * 
 * Tests end-to-end workflows that span multiple API resources.
 * These tests verify that the system works correctly as a whole,
 * not just individual components.
 * 
 * Priority: HIGH - Critical user journeys
 */

test.describe('Integration - User Content Creation Flow', () => {
  
  test('should complete full user-post-comment workflow', async ({ request }) => {
    // Step 1: Get a user
    const userResponse = await request.get('/users/1');
    expect(userResponse.status()).toBe(200);
    const user = await userResponse.json();
    
    // Step 2: Create a post for that user
    const newPost = TestDataFactory.createPost({
      userId: user.id,
      title: 'Integration Test Post',
      body: 'Testing full workflow'
    });
    
    const postResponse = await request.post('/posts', {
      data: newPost
    });
    expect(postResponse.status()).toBe(201);
    const createdPost = await postResponse.json();
    
    // Step 3: Create a comment on that post
    const newComment = TestDataFactory.createComment({
      postId: createdPost.id,
      name: 'Integration Test Comment',
      body: 'Great post!'
    });
    
    const commentResponse = await request.post('/comments', {
      data: newComment
    });
    expect(commentResponse.status()).toBe(201);
    const createdComment = await commentResponse.json();
    
    // Step 4: Verify relationships
    expect(createdComment.postId).toBe(createdPost.id);
    expect(createdPost.userId).toBe(user.id);
  });

  test('should retrieve all user content in one flow', async ({ request }) => {
    const userId = 1;
    
    // Get user details
    const userResponse = await request.get(`/users/${userId}`);
    const user = await userResponse.json();
    
    // Get user's posts
    const postsResponse = await request.get(`/users/${userId}/posts`);
    const posts = await postsResponse.json();
    
    // Get user's albums
    const albumsResponse = await request.get(`/users/${userId}/albums`);
    const albums = await albumsResponse.json();
    
    // Get user's todos
    const todosResponse = await request.get(`/users/${userId}/todos`);
    const todos = await todosResponse.json();
    
    // Verify all content belongs to the user
    expect(user.id).toBe(userId);
    posts.forEach(post => expect(post.userId).toBe(userId));
    albums.forEach(album => expect(album.userId).toBe(userId));
    todos.forEach(todo => expect(todo.userId).toBe(userId));
  });
});

test.describe('Integration - Content Discovery Flow', () => {
  
  test('should navigate from post to comments to user', async ({ request }) => {
    // Start with a post
    const postResponse = await request.get('/posts/1');
    const post = await postResponse.json();
    
    // Get comments for that post
    const commentsResponse = await request.get(`/posts/${post.id}/comments`);
    const comments = await commentsResponse.json();
    
    expect(comments.length).toBeGreaterThan(0);
    
    // Get the user who created the post
    const userResponse = await request.get(`/users/${post.userId}`);
    const user = await userResponse.json();
    
    // Verify the chain
    expect(user.id).toBe(post.userId);
    comments.forEach(comment => {
      expect(comment.postId).toBe(post.id);
    });
  });

  test('should filter and correlate data across resources', async ({ request }) => {
    // Get all posts by user 1
    const postsResponse = await request.get('/posts?userId=1');
    const posts = await postsResponse.json();
    
    // For each post, verify it has comments
    const postCommentChecks = posts.slice(0, 3).map(async post => {
      const commentsResponse = await request.get(`/posts/${post.id}/comments`);
      const comments = await commentsResponse.json();
      
      return {
        postId: post.id,
        hasComments: comments.length > 0,
        commentCount: comments.length
      };
    });
    
    const results = await Promise.all(postCommentChecks);
    
    // Verify we got meaningful data
    results.forEach(result => {
      expect(result).toHaveProperty('postId');
      expect(result).toHaveProperty('hasComments');
      expect(result).toHaveProperty('commentCount');
    });
  });
});

test.describe('Integration - Data Consistency', () => {
  
  test('should maintain referential integrity across resources', async ({ request }) => {
    // Get a post
    const postResponse = await request.get('/posts/1');
    const post = await postResponse.json();
    
    // Verify the user exists
    const userResponse = await request.get(`/users/${post.userId}`);
    expect(userResponse.status()).toBe(200);
    
    const user = await userResponse.json();
    expect(user.id).toBe(post.userId);
  });

  test('should handle cascading queries efficiently', async ({ request }) => {
    const userId = 1;
    
    const startTime = Date.now();
    
    // Cascading queries: user -> posts -> comments
    const userResponse = await request.get(`/users/${userId}`);
    const user = await userResponse.json();
    
    const postsResponse = await request.get(`/users/${userId}/posts`);
    const posts = await postsResponse.json();
    
    const firstPost = posts[0];
    const commentsResponse = await request.get(`/posts/${firstPost.id}/comments`);
    const comments = await commentsResponse.json();
    
    const duration = Date.now() - startTime;
    
    // Verify data consistency
    expect(user.id).toBe(userId);
    expect(firstPost.userId).toBe(userId);
    comments.forEach(comment => {
      expect(comment.postId).toBe(firstPost.id);
    });
    
    // Should complete in reasonable time
    expect(duration).toBeLessThan(5000);
  });
});

test.describe('Integration - Bulk Operations', () => {
  
  test('should handle batch content creation', async ({ request }) => {
    const userId = 1;
    
    // Create multiple posts in parallel
    const postCreations = Array.from({ length: 3 }, (_, i) => 
      request.post('/posts', {
        data: TestDataFactory.createPost({
          userId: userId,
          title: `Batch Post ${i + 1}`,
          body: `Content for batch post ${i + 1}`
        })
      })
    );
    
    const responses = await Promise.all(postCreations);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(201);
    });
    
    const createdPosts = await Promise.all(responses.map(r => r.json()));
    
    // All should have IDs and match our data
    createdPosts.forEach(post => {
      expect(post).toHaveProperty('id');
      expect(post.userId).toBe(userId);
    });
  });

  test('should handle mixed CRUD operations', async ({ request }) => {
    // Create (JSONPlaceholder simulates creation but doesn't persist)
    const createResponse = await request.post('/posts', {
      data: TestDataFactory.createPost({
        title: 'New Post',
        body: 'New content'
      })
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    expect(created).toHaveProperty('id');
    
    // Read existing post (since created ones aren't persisted)
    const existingPostId = 1;
    const readResponse = await request.get(`/posts/${existingPostId}`);
    expect(readResponse.status()).toBe(200);
    
    // Update existing post
    const updateResponse = await request.patch(`/posts/${existingPostId}`, {
      data: { title: 'Updated Title' }
    });
    expect(updateResponse.status()).toBe(200);
    
    // Delete existing post
    const deleteResponse = await request.delete(`/posts/${existingPostId}`);
    expect(deleteResponse.status()).toBe(200);
  });
});

test.describe('Integration - Error Recovery', () => {
  
  test('should gracefully handle partial failures in workflow', async ({ request }) => {
    // Try to create content for non-existent user
    const invalidPost = TestDataFactory.createPost({
      userId: 99999,
      title: 'Should still create',
      body: 'Despite invalid userId'
    });
    
    const response = await request.post('/posts', {
      data: invalidPost
    });
    
    // JSONPlaceholder accepts this (design choice)
    // In a real system, you might expect 400 or validation error
    expect(response.status()).toBe(201);
  });

  test('should maintain data integrity when operations fail', async ({ request }) => {
    // Get initial state
    const initialResponse = await request.get('/posts/1');
    const initialPost = await initialResponse.json();
    
    // Attempt invalid update
    const invalidUpdate = await request.put('/posts/invalid-id', {
      data: { title: 'Should fail' }
    });
    
    // JSONPlaceholder returns 500 for invalid ID format in PUT requests
    expect(invalidUpdate.status()).toBe(500);
    
    // Verify original data unchanged
    const verifyResponse = await request.get('/posts/1');
    const verifiedPost = await verifyResponse.json();
    
    expect(verifiedPost).toEqual(initialPost);
  });
});

test.describe('Integration - Performance Under Load', () => {
  
  test('should handle multiple concurrent workflows', async ({ request }) => {
    const workflows = Array.from({ length: 5 }, async (_, i) => {
      // Each workflow: get user -> create post -> create comment
      const user = await request.get(`/users/${i + 1}`).then(r => r.json());
      
      const post = await request.post('/posts', {
        data: TestDataFactory.createPost({ userId: user.id })
      }).then(r => r.json());
      
      const comment = await request.post('/comments', {
        data: TestDataFactory.createComment({ postId: post.id })
      }).then(r => r.json());
      
      return { user, post, comment };
    });
    
    const results = await Promise.all(workflows);
    
    // All workflows should complete successfully
    expect(results.length).toBe(5);
    results.forEach(result => {
      expect(result.user).toHaveProperty('id');
      expect(result.post).toHaveProperty('id');
      expect(result.comment).toHaveProperty('id');
    });
  });

  test('should maintain performance with complex queries', async ({ request }) => {
    const startTime = Date.now();
    
    // Complex workflow with multiple dependencies
    const users = await request.get('/users').then(r => r.json());
    const firstUser = users[0];
    
    const [posts, albums, todos] = await Promise.all([
      request.get(`/users/${firstUser.id}/posts`).then(r => r.json()),
      request.get(`/users/${firstUser.id}/albums`).then(r => r.json()),
      request.get(`/users/${firstUser.id}/todos`).then(r => r.json())
    ]);
    
    const firstPost = posts[0];
    const comments = await request.get(`/posts/${firstPost.id}/comments`).then(r => r.json());
    
    const duration = Date.now() - startTime;
    
    // Verify all data retrieved
    expect(posts.length).toBeGreaterThan(0);
    expect(albums.length).toBeGreaterThan(0);
    expect(todos.length).toBeGreaterThan(0);
    expect(comments.length).toBeGreaterThan(0);
    
    // Should complete in reasonable time
    expect(duration).toBeLessThan(5000);
  });
});
