/**
 * Test Data Factory
 * 
 * Provides reusable test data generators for consistent test creation
 * and maintenance. Use these factories to create test data with sensible
 * defaults while allowing customization where needed.
 */

class TestDataFactory {
  /**
   * Generate a unique ID based on timestamp and random number
   * @returns {number}
   */
  static generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Create a valid post object
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object}
   */
  static createPost(overrides = {}) {
    return {
      userId: 1,
      title: 'Test Post Title',
      body: 'This is a test post body with meaningful content.',
      ...overrides
    };
  }

  /**
   * Create a valid user object
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object}
   */
  static createUser(overrides = {}) {
    const id = this.generateId();
    return {
      name: 'Test User',
      username: `testuser${id}`,
      email: `test${id}@example.com`,
      address: {
        street: 'Test Street',
        suite: 'Apt. 123',
        city: 'Test City',
        zipcode: '12345',
        geo: {
          lat: '0.0000',
          lng: '0.0000'
        }
      },
      phone: '1-234-567-8901',
      website: 'testuser.com',
      company: {
        name: 'Test Company',
        catchPhrase: 'Testing excellence',
        bs: 'quality assurance'
      },
      ...overrides
    };
  }

  /**
   * Create a valid comment object
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object}
   */
  static createComment(overrides = {}) {
    const id = this.generateId();
    return {
      postId: 1,
      name: 'Test Comment',
      email: `commenter${id}@example.com`,
      body: 'This is a test comment with valuable feedback.',
      ...overrides
    };
  }

  /**
   * Create invalid data for negative testing
   * @param {string} type - Type of invalid data needed
   * @returns {Object}
   */
  static createInvalidData(type) {
    const invalidPatterns = {
      emptyPost: {},
      missingRequiredFields: { title: 'Only Title' },
      invalidTypes: { userId: 'not-a-number', title: 123 },
      oversizedData: { 
        title: 'x'.repeat(1000),
        body: 'y'.repeat(10000)
      },
      sqlInjection: {
        title: '\'; DROP TABLE posts; --',
        body: '1 OR 1=1'
      },
      xssAttempt: {
        title: '<script>alert("xss")</script>',
        body: '<img src=x onerror=alert(1)>'
      }
    };

    return invalidPatterns[type] || {};
  }
}

/**
 * Response Validators
 * 
 * Common validation helpers to ensure API responses meet expectations
 */
class ResponseValidators {
  /**
   * Validate standard post structure
   * @param {Object} post - Post object to validate
   */
  static validatePost(post) {
    if (!post || typeof post !== 'object') {
      throw new Error('Post must be an object');
    }
    
    const requiredFields = ['id', 'userId', 'title', 'body'];
    const missingFields = requiredFields.filter(field => !(field in post));
    
    if (missingFields.length > 0) {
      throw new Error(`Post missing required fields: ${missingFields.join(', ')}`);
    }

    if (typeof post.id !== 'number' || post.id <= 0) {
      throw new Error('Post ID must be a positive number');
    }

    if (typeof post.userId !== 'number' || post.userId <= 0) {
      throw new Error('User ID must be a positive number');
    }

    if (typeof post.title !== 'string' || post.title.trim() === '') {
      throw new Error('Post title must be a non-empty string');
    }

    if (typeof post.body !== 'string' || post.body.trim() === '') {
      throw new Error('Post body must be a non-empty string');
    }
  }

  /**
   * Validate standard user structure
   * @param {Object} user - User object to validate
   */
  static validateUser(user) {
    if (!user || typeof user !== 'object') {
      throw new Error('User must be an object');
    }

    const requiredFields = ['id', 'name', 'username', 'email'];
    const missingFields = requiredFields.filter(field => !(field in user));
    
    if (missingFields.length > 0) {
      throw new Error(`User missing required fields: ${missingFields.join(', ')}`);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error('User email must be valid format');
    }
  }

  /**
   * Validate standard comment structure
   * @param {Object} comment - Comment object to validate
   */
  static validateComment(comment) {
    if (!comment || typeof comment !== 'object') {
      throw new Error('Comment must be an object');
    }

    const requiredFields = ['id', 'postId', 'name', 'email', 'body'];
    const missingFields = requiredFields.filter(field => !(field in comment));
    
    if (missingFields.length > 0) {
      throw new Error(`Comment missing required fields: ${missingFields.join(', ')}`);
    }
  }
}

module.exports = {
  TestDataFactory,
  ResponseValidators
};
