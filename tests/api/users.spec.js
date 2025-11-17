const { test, expect } = require('@playwright/test');
const { TestDataFactory, ResponseValidators } = require('../helpers/testData');

/**
 * Users API Test Suite
 * 
 * Tests user management functionality including:
 * - User retrieval and listing
 * - User data structure validation
 * - Complex nested object handling
 * - User-related error scenarios
 * 
 * Priority: HIGH - Users are foundational to all content
 */

test.describe('Users API - Retrieval Operations', () => {
  
  test('GET /users - should retrieve all users', async ({ request }) => {
    const response = await request.get('/users');
    
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    
    // Validate user structure
    expect(() => ResponseValidators.validateUser(users[0])).not.toThrow();
  });

  test('GET /users/{id} - should retrieve specific user', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}`);
    
    expect(response.status()).toBe(200);
    
    const user = await response.json();
    expect(user.id).toBe(userId);
    expect(() => ResponseValidators.validateUser(user)).not.toThrow();
  });

  test('GET /users/{id} - should include complete user profile data', async ({ request }) => {
    const response = await request.get('/users/1');
    const user = await response.json();
    
    // Verify nested address object
    expect(user).toHaveProperty('address');
    expect(user.address).toHaveProperty('street');
    expect(user.address).toHaveProperty('city');
    expect(user.address).toHaveProperty('zipcode');
    expect(user.address).toHaveProperty('geo');
    expect(user.address.geo).toHaveProperty('lat');
    expect(user.address.geo).toHaveProperty('lng');
    
    // Verify company object
    expect(user).toHaveProperty('company');
    expect(user.company).toHaveProperty('name');
    expect(user.company).toHaveProperty('catchPhrase');
    expect(user.company).toHaveProperty('bs');
    
    // Verify contact information
    expect(user).toHaveProperty('phone');
    expect(user).toHaveProperty('website');
  });
});

test.describe('Users API - Data Validation', () => {
  
  test('should validate user email format', async ({ request }) => {
    const response = await request.get('/users');
    const users = await response.json();
    
    users.forEach(user => {
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  test('should validate user data types', async ({ request }) => {
    const response = await request.get('/users/1');
    const user = await response.json();
    
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
    expect(typeof user.username).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.phone).toBe('string');
    expect(typeof user.website).toBe('string');
    expect(typeof user.address).toBe('object');
    expect(typeof user.company).toBe('object');
  });

  test('should validate nested address structure', async ({ request }) => {
    const response = await request.get('/users/1');
    const user = await response.json();
    
    expect(typeof user.address.street).toBe('string');
    expect(typeof user.address.suite).toBe('string');
    expect(typeof user.address.city).toBe('string');
    expect(typeof user.address.zipcode).toBe('string');
    expect(typeof user.address.geo.lat).toBe('string');
    expect(typeof user.address.geo.lng).toBe('string');
  });

  test('should validate geographic coordinates format', async ({ request }) => {
    const response = await request.get('/users/1');
    const user = await response.json();
    
    const { lat, lng } = user.address.geo;
    
    // Latitude should be between -90 and 90
    const latNum = parseFloat(lat);
    expect(latNum).toBeGreaterThanOrEqual(-90);
    expect(latNum).toBeLessThanOrEqual(90);
    
    // Longitude should be between -180 and 180
    const lngNum = parseFloat(lng);
    expect(lngNum).toBeGreaterThanOrEqual(-180);
    expect(lngNum).toBeLessThanOrEqual(180);
  });
});

test.describe('Users API - Create & Update Operations', () => {
  
  test('POST /users - should create new user', async ({ request }) => {
    const newUser = TestDataFactory.createUser({
      name: 'Test Automation User',
      username: 'testautouser'
    });
    
    const response = await request.post('/users', {
      data: newUser
    });
    
    expect(response.status()).toBe(201);
    
    const createdUser = await response.json();
    expect(createdUser).toHaveProperty('id');
    expect(createdUser.name).toBe(newUser.name);
    expect(createdUser.username).toBe(newUser.username);
  });

  test('PUT /users/{id} - should update entire user object', async ({ request }) => {
    const userId = 1;
    const updatedUser = TestDataFactory.createUser({
      id: userId,
      name: 'Updated Name',
      username: 'updatedusername'
    });
    
    const response = await request.put(`/users/${userId}`, {
      data: updatedUser
    });
    
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result.id).toBe(userId);
    expect(result.name).toBe(updatedUser.name);
  });

  test('PATCH /users/{id} - should partially update user', async ({ request }) => {
    const userId = 1;
    const partialUpdate = {
      email: 'newemail@example.com'
    };
    
    const response = await request.patch(`/users/${userId}`, {
      data: partialUpdate
    });
    
    expect(response.status()).toBe(200);
    
    const updatedUser = await response.json();
    expect(updatedUser.email).toBe(partialUpdate.email);
  });

  test('DELETE /users/{id} - should delete user', async ({ request }) => {
    const userId = 1;
    const response = await request.delete(`/users/${userId}`);
    
    expect(response.status()).toBe(200);
  });
});

test.describe('Users API - Error Handling', () => {
  
  test('should return 404 for non-existent user', async ({ request }) => {
    const response = await request.get('/users/99999');
    
    expect(response.status()).toBe(404);
  });

  test('should handle invalid user ID format', async ({ request }) => {
    const response = await request.get('/users/invalid-id');
    
    expect([404, 400]).toContain(response.status());
  });
});

test.describe('Users API - Relationship Queries', () => {
  
  test('should retrieve user\'s posts', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/posts`);
    
    expect(response.status()).toBe(200);
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    
    // All posts should belong to this user
    posts.forEach(post => {
      expect(post.userId).toBe(userId);
    });
  });

  test('should retrieve user\'s albums', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/albums`);
    
    expect(response.status()).toBe(200);
    
    const albums = await response.json();
    expect(Array.isArray(albums)).toBeTruthy();
    
    albums.forEach(album => {
      expect(album.userId).toBe(userId);
    });
  });

  test('should retrieve user\'s todos', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/users/${userId}/todos`);
    
    expect(response.status()).toBe(200);
    
    const todos = await response.json();
    expect(Array.isArray(todos)).toBeTruthy();
    
    todos.forEach(todo => {
      expect(todo.userId).toBe(userId);
    });
  });
});

test.describe('Users API - Performance', () => {
  
  test('should retrieve all users within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/users');
    
    const duration = Date.now() - startTime;
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(2000);
  });

  test('should handle multiple concurrent user requests', async ({ request }) => {
    const userIds = [1, 2, 3, 4, 5];
    const requests = userIds.map(id => request.get(`/users/${id}`));
    
    const responses = await Promise.all(requests);
    
    responses.forEach((response, index) => {
      expect(response.status()).toBe(200);
    });
  });
});
