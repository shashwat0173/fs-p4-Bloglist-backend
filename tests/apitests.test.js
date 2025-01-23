const {test, after, beforeEach, describe} = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const supertest = require('supertest')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        for(let i = 0 ; i < helper.initialBlogs.length; i++){
            let blogObject = new Blog(helper.initialBlogs[i])
            await blogObject.save()
        }
    })
    
    test('getting all blogs', async () => {
        const response = await api.get('/api/blogs')
        
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })
    
    test('id is defined', async () => {
        const response = await api.get('/api/blogs')
        
        for(let i = 0 ; i < response.body.length; i++){
            assert(response.body[i].id)
        }
    })
    
    test('adding a blog', async () => {
        const newBlog = {
            title: "Test Blog",
            author: "Test Authour",
            url: "https://test.com/",
        }
    
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const response = await api.get('/api/blogs')
    
        const titles = response.body.map(x => x.title)
        
        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
        assert(titles.includes('Test Blog'))
        
        const toDeleteId = response.body.filter(x => x.title === 'Test Blog')[0].id
        Blog.findByIdAndDelete(toDeleteId)
    })

    test('deleting a blog', async () => {
        const response = await api.get('/api/blogs')
        const id = response.body[0].id
        
        await api
            .delete(`/api/blogs/${id}`)
            .expect(204)
        
        const response2 = await api.get('/api/blogs')
        
        assert.strictEqual(response2.body.length, helper.initialBlogs.length - 1)    
    })

    test('updating a blog', async () => {
        const response = await api.get('/api/blogs')
        const blog = response.body[0]
        
        const updatedBlog = {
            ...blog,
            likes: blog.likes + 1
        }


        await api
            .put(`/api/blogs/${blog.id}`)
            .send(updatedBlog)
            .expect(200)

        const response2 = await api.get('/api/blogs')
        assert.strictEqual(response2.body[0].likes, blog.likes + 1)
    })
        
})
