const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ', '')
  }
  return null
}


blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate('user', {username : 1});
    response.json(blogs);
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong' });
  }
});

blogsRouter.post('/', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

    if(!decodedToken.id){
      return response.status(401).json({error : 'token invalid'})
    }
    const user = await User.findById(decodedToken.id)
    request.body.user = user.id 
    const blog = new Blog(request.body)
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog.id);
    await user.save();
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
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