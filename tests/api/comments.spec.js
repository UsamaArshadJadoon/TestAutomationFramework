const { test, expect } = require('@playwright/test');
const { TestDataFactory, ResponseValidators } = require('../helpers/testData');

/**
 * Comments API Test Suite
 * 
 * Tests comment functionality including:
 * - Comment CRUD operations
 * - Relationship with posts
 * - Email validation
 * - Query filtering
 * 
 * Priority: MEDIUM - Comments are user-generated content
 */

test.describe('Comments API - CRUD Operations', () => {
  
  test('GET /comments - should retrieve all comments', async ({ request }) => {
    const response = await request.get('/comments');
    
    expect(response.status()).toBe(200);
    
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
    expect(comments.length).toBeGreaterThan(0);
    
    // Validate comment structure
    expect(() => ResponseValidators.validateComment(comments[0])).not.toThrow();
  });

  test('GET /comments/{id} - should retrieve specific comment', async ({ request }) => {
    const commentId = 1;
    const response = await request.get(`/comments/${commentId}`);
    
    expect(response.status()).toBe(200);
    
    const comment = await response.json();
    expect(comment.id).toBe(commentId);
    expect(() => ResponseValidators.validateComment(comment)).not.toThrow();
  });

  test('POST /comments - should create new comment', async ({ request }) => {
    const newComment = TestDataFactory.createComment({
      name: 'Automated Test Comment',
      body: 'This is a test comment created by automation'
    });
    
    const response = await request.post('/comments', {
      data: newComment
    });
    
    expect(response.status()).toBe(201);
    
    const created = await response.json();
    expect(created).toHaveProperty('id');
    expect(created.name).toBe(newComment.name);
    expect(created.body).toBe(newComment.body);
    expect(created.email).toBe(newComment.email);
  });

  test('PUT /comments/{id} - should update comment', async ({ request }) => {
    const commentId = 1;
    const updatedComment = TestDataFactory.createComment({
      id: commentId,
      name: 'Updated Comment Name',
      body: 'Updated comment body'
    });
    
    const response = await request.put(`/comments/${commentId}`, {
      data: updatedComment
    });
    
    expect(response.status()).toBe(200);
    
    const updated = await response.json();
    expect(updated.id).toBe(commentId);
    expect(updated.name).toBe(updatedComment.name);
  });

  test('PATCH /comments/{id} - should partially update comment', async ({ request }) => {
    const commentId = 1;
    const partialUpdate = {
      body: 'Partially updated comment body'
    };
    
    const response = await request.patch(`/comments/${commentId}`, {
      data: partialUpdate
    });
    
    expect(response.status()).toBe(200);
    
    const updated = await response.json();
    expect(updated.body).toBe(partialUpdate.body);
  });

  test('DELETE /comments/{id} - should delete comment', async ({ request }) => {
    const commentId = 1;
    const response = await request.delete(`/comments/${commentId}`);
    
    expect(response.status()).toBe(200);
  });
});

test.describe('Comments API - Data Validation', () => {
  
  test('should validate comment email format', async ({ request }) => {
    const response = await request.get('/comments');
    const comments = await response.json();
    
    // Check first 10 comments for email format
    comments.slice(0, 10).forEach(comment => {
      expect(comment.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  test('should validate comment data types', async ({ request }) => {
    const response = await request.get('/comments/1');
    const comment = await response.json();
    
    expect(typeof comment.id).toBe('number');
    expect(typeof comment.postId).toBe('number');
    expect(typeof comment.name).toBe('string');
    expect(typeof comment.email).toBe('string');
    expect(typeof comment.body).toBe('string');
  });

  test('should validate required fields presence', async ({ request }) => {
    const response = await request.get('/comments/1');
    const comment = await response.json();
    
    const requiredFields = ['id', 'postId', 'name', 'email', 'body'];
    requiredFields.forEach(field => {
      expect(comment).toHaveProperty(field);
    });
  });
});

test.describe('Comments API - Post Relationships', () => {
  
  test('GET /posts/{postId}/comments - should retrieve comments for specific post', async ({ request }) => {
    const postId = 1;
    const response = await request.get(`/posts/${postId}/comments`);
    
    expect(response.status()).toBe(200);
    
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
    
    // All comments should belong to this post
    comments.forEach(comment => {
      expect(comment.postId).toBe(postId);
    });
  });

  test('should filter comments by postId query parameter', async ({ request }) => {
    const postId = 1;
    const response = await request.get(`/comments?postId=${postId}`);
    
    expect(response.status()).toBe(200);
    
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
    
    comments.forEach(comment => {
      expect(comment.postId).toBe(postId);
    });
  });

  test('should return empty array for post with no comments', async ({ request }) => {
    const nonExistentPostId = 99999;
    const response = await request.get(`/posts/${nonExistentPostId}/comments`);
    
    expect(response.status()).toBe(200);
    
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
    expect(comments.length).toBe(0);
  });
});

test.describe('Comments API - Query Filtering', () => {
  
  test('should filter comments by email', async ({ request }) => {
    // First, get a valid email from existing comments
    const allCommentsResponse = await request.get('/comments');
    const allComments = await allCommentsResponse.json();
    const targetEmail = allComments[0].email;
    
    const response = await request.get(`/comments?email=${targetEmail}`);
    
    expect(response.status()).toBe(200);
    
    const filteredComments = await response.json();
    expect(Array.isArray(filteredComments)).toBeTruthy();
    
    filteredComments.forEach(comment => {
      expect(comment.email).toBe(targetEmail);
    });
  });

  test('should handle multiple query parameters', async ({ request }) => {
    const response = await request.get('/comments?postId=1&id=1');
    
    expect(response.status()).toBe(200);
    
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
  });

  test('should return empty array for non-matching filters', async ({ request }) => {
    const response = await request.get('/comments?email=nonexistent@test.com');
    
    expect(response.status()).toBe(200);
    
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
    expect(comments.length).toBe(0);
  });
});

test.describe('Comments API - Error Handling', () => {
  
  test('should return 404 for non-existent comment', async ({ request }) => {
    const response = await request.get('/comments/99999');
    
    expect(response.status()).toBe(404);
  });

  test('should handle invalid comment ID format', async ({ request }) => {
    const response = await request.get('/comments/invalid-id');
    
    expect([404, 400]).toContain(response.status());
  });

  test('should handle special characters in comment data', async ({ request }) => {
    const specialComment = TestDataFactory.createComment({
      name: 'Comment with émojis 😊',
      body: 'Special chars: <>&"\' and newlines\n\ttabs'
    });
    
    const response = await request.post('/comments', {
      data: specialComment
    });
    
    expect(response.status()).toBe(201);
  });
});

test.describe('Comments API - Edge Cases', () => {
  
  test('should handle very long comment text', async ({ request }) => {
    const longComment = TestDataFactory.createComment({
      name: 'Long comment',
      body: 'x'.repeat(5000)
    });
    
    const response = await request.post('/comments', {
      data: longComment
    });
    
    expect(response.status()).toBe(201);
  });

  test('should handle comment with minimal data', async ({ request }) => {
    const minimalComment = {
      postId: 1,
      name: 'Min',
      email: 'min@test.com',
      body: 'X'
    };
    
    const response = await request.post('/comments', {
      data: minimalComment
    });
    
    expect(response.status()).toBe(201);
  });

  test('should validate response consistency across multiple requests', async ({ request }) => {
    const commentId = 1;
    
    const responses = await Promise.all([
      request.get(`/comments/${commentId}`),
      request.get(`/comments/${commentId}`),
      request.get(`/comments/${commentId}`)
    ]);
    
    const comments = await Promise.all(responses.map(r => r.json()));
    
    // All responses should be identical
    expect(comments[0]).toEqual(comments[1]);
    expect(comments[1]).toEqual(comments[2]);
  });
});

test.describe('Comments API - Performance', () => {
  
  test('should retrieve comments within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/comments?postId=1');
    
    const duration = Date.now() - startTime;
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(2000);
  });

  test('should handle bulk comment retrieval efficiently', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/comments');
    const comments = await response.json();
    
    const duration = Date.now() - startTime;
    
    expect(response.status()).toBe(200);
    expect(comments.length).toBeGreaterThan(100); // Should have many comments
    expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
  });
});
