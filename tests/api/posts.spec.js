const { test, expect } = require('@playwright/test');
const { TestDataFactory, ResponseValidators } = require('../helpers/testData');

/**
 * Posts API Test Suite
 * 
 * Tests critical functionality of the /posts endpoint including:
 * - CRUD operations
 * - Data validation
 * - Error handling
 * - Performance expectations
 * 
 * Priority: HIGH - Posts are core functionality
 */

test.describe('Posts API - CRUD Operations', () => {
  
  test('GET /posts - should retrieve all posts with valid structure', async ({ request }) => {
    const response = await request.get('/posts');
    
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBeGreaterThan(0);
    
    // Validate first post structure
    expect(() => ResponseValidators.validatePost(posts[0])).not.toThrow();
    
    // Performance check - should respond quickly
    const responseTime = response.headers()['date'] ? 
      new Date() - new Date(response.headers()['date']) : 0;
    expect(responseTime).toBeLessThan(2000); // 2 seconds max
  });

  test('GET /posts/{id} - should retrieve specific post', async ({ request }) => {
    const postId = 1;
    const response = await request.get(`/posts/${postId}`);
    
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.id).toBe(postId);
    expect(() => ResponseValidators.validatePost(post)).not.toThrow();
  });

  test('POST /posts - should create new post', async ({ request }) => {
    const newPost = TestDataFactory.createPost({
      title: 'Automated Test Post',
      body: 'This post was created by automation tests'
    });
    
    const response = await request.post('/posts', {
      data: newPost
    });
    
    expect(response.status()).toBe(201);
    
    const createdPost = await response.json();
    expect(createdPost).toHaveProperty('id');
    expect(createdPost.title).toBe(newPost.title);
    expect(createdPost.body).toBe(newPost.body);
    expect(createdPost.userId).toBe(newPost.userId);
  });

  test('PUT /posts/{id} - should update existing post', async ({ request }) => {
    const postId = 1;
    const updatedData = TestDataFactory.createPost({
      id: postId,
      title: 'Updated Title',
      body: 'Updated body content'
    });
    
    const response = await request.put(`/posts/${postId}`, {
      data: updatedData
    });
    
    expect(response.status()).toBe(200);
    
    const updatedPost = await response.json();
    expect(updatedPost.id).toBe(postId);
    expect(updatedPost.title).toBe(updatedData.title);
    expect(updatedPost.body).toBe(updatedData.body);
  });

  test('PATCH /posts/{id} - should partially update post', async ({ request }) => {
    const postId = 1;
    const partialUpdate = {
      title: 'Partially Updated Title'
    };
    
    const response = await request.patch(`/posts/${postId}`, {
      data: partialUpdate
    });
    
    expect(response.status()).toBe(200);
    
    const updatedPost = await response.json();
    expect(updatedPost.title).toBe(partialUpdate.title);
    expect(updatedPost).toHaveProperty('body'); // Other fields should remain
  });

  test('DELETE /posts/{id} - should delete post', async ({ request }) => {
    const postId = 1;
    const response = await request.delete(`/posts/${postId}`);
    
    expect(response.status()).toBe(200);
  });
});

test.describe('Posts API - Data Validation', () => {
  
  test('should validate post data types', async ({ request }) => {
    const response = await request.get('/posts/1');
    const post = await response.json();
    
    expect(typeof post.id).toBe('number');
    expect(typeof post.userId).toBe('number');
    expect(typeof post.title).toBe('string');
    expect(typeof post.body).toBe('string');
  });

  test('should handle special characters in post data', async ({ request }) => {
    const specialCharsPost = TestDataFactory.createPost({
      title: 'Test with émojis 🚀 and spëcial çhars!',
      body: 'Content with newlines\nand\ttabs\rand "quotes"'
    });
    
    const response = await request.post('/posts', {
      data: specialCharsPost
    });
    
    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created.title).toBe(specialCharsPost.title);
  });

  test('should validate response headers', async ({ request }) => {
    const response = await request.get('/posts/1');
    
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.headers()).toHaveProperty('date');
  });
});

test.describe('Posts API - Error Handling', () => {
  
  test('GET /posts/{invalid-id} - should return 404 for non-existent post', async ({ request }) => {
    const response = await request.get('/posts/99999');
    
    expect(response.status()).toBe(404);
  });

  test('GET /posts/{invalid-format} - should handle invalid ID format', async ({ request }) => {
    const response = await request.get('/posts/invalid-id');
    
    // API should handle gracefully (404 or 400)
    expect([404, 400]).toContain(response.status());
  });

  test('should handle network timeout gracefully', async ({ request }) => {
    // This tests our timeout configuration
    await expect(async () => {
      await request.get('/posts/1', { timeout: 100 });
    }).rejects.toThrow();
  });
});

test.describe('Posts API - Query Parameters', () => {
  
  test('should filter posts by userId', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/posts?userId=${userId}`);
    
    expect(response.status()).toBe(200);
    const posts = await response.json();
    
    expect(Array.isArray(posts)).toBeTruthy();
    posts.forEach(post => {
      expect(post.userId).toBe(userId);
    });
  });

  test('should handle multiple query parameters', async ({ request }) => {
    const response = await request.get('/posts?userId=1&id=1');
    
    expect(response.status()).toBe(200);
    const posts = await response.json();
    
    expect(Array.isArray(posts)).toBeTruthy();
    if (posts.length > 0) {
      expect(posts[0].userId).toBe(1);
      expect(posts[0].id).toBe(1);
    }
  });
});

test.describe('Posts API - Edge Cases', () => {
  
  test('should handle empty post creation', async ({ request }) => {
    const emptyPost = {};
    const response = await request.post('/posts', {
      data: emptyPost
    });
    
    // API accepts empty posts (design decision of JSONPlaceholder)
    expect(response.status()).toBe(201);
  });

  test('should handle very long post content', async ({ request }) => {
    const longPost = TestDataFactory.createPost({
      title: 'x'.repeat(500),
      body: 'y'.repeat(5000)
    });
    
    const response = await request.post('/posts', {
      data: longPost
    });
    
    expect(response.status()).toBe(201);
  });

  test('should handle concurrent requests', async ({ request }) => {
    const requests = Array.from({ length: 5 }, (_, i) => 
      request.get(`/posts/${i + 1}`)
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });
});

test.describe('Posts API - Performance & Reliability', () => {
  
  test('should maintain consistent response structure across multiple calls', async ({ request }) => {
    const responses = await Promise.all([
      request.get('/posts/1'),
      request.get('/posts/2'),
      request.get('/posts/3')
    ]);
    
    const posts = await Promise.all(responses.map(r => r.json()));
    
    posts.forEach(post => {
      expect(() => ResponseValidators.validatePost(post)).not.toThrow();
    });
  });

  test('should handle rapid sequential requests', async ({ request }) => {
    const startTime = Date.now();
    
    for (let i = 1; i <= 10; i++) {
      const response = await request.get(`/posts/${i}`);
      expect(response.status()).toBe(200);
    }
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
  });
});
