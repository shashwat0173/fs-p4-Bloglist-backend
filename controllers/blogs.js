const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate('user', {username : 1});
    response.json(blogs);
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong' });
  }
});

blogsRouter.post('/', async (request, response) => {
  try {
    const allUsers = await User.find({})
    request.body.user = allUsers[0].id 
    const blog = new Blog(request.body)
    const savedBlog = await blog.save()
    const user = await User.findById(request.body.user);
    user.blogs = user.blogs.concat(savedBlog.id);
    await user.save();
    response.status(201).json(savedBlog)
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong' });
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong' });
  }
});

blogsRouter.put('/:id', async (request, response) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true });
    response.json(updatedBlog);
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = blogsRouter;